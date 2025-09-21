const express = require('express');
const { executeQuery } = require('../config/database');
const { uploadFields, uploadSingle, deleteFile, getFileUrl, cleanupOnError } = require('../middleware/upload');

const router = express.Router();

// Enhanced logging middleware for mission-vision routes
router.use((req, res, next) => {
  console.log(`📋 MISSION-VISION ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('📋 Request details:', {
    method: req.method,
    path: req.path,
    body: req.method !== 'GET' ? req.body : 'N/A',
    params: req.params,
    query: req.query,
    hasFiles: req.files ? Object.keys(req.files) : 'No',
    hasFile: req.file ? 'Yes' : 'No'
  });
  next();
});

// Debug/test route for development (MUST come before other routes)
router.get('/debug/test', (req, res) => {
  res.json({
    success: true,
    message: 'Mission-vision routes are working!',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET    /api/mission-vision               - Get mission & vision data',
      'GET    /api/mission-vision/debug/test    - Test route',
      'POST   /api/mission-vision              - Update mission & vision',
      'PATCH  /api/mission-vision/:field       - Update specific field',
      'DELETE /api/mission-vision/image/:type  - Delete specific image'
    ]
  });
});

// SPECIFIC ROUTES (must come before parameterized routes)
// DELETE - Remove specific image
router.delete('/image/:type', async (req, res) => {
  try {
    console.log(`🗑️ Deleting ${req.params.type} image...`);
    const { type } = req.params;

    if (!['mission', 'vision'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be "mission" or "vision"'
      });
    }

    const existing = await executeQuery(
      'SELECT * FROM mission_vision ORDER BY id DESC LIMIT 1'
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No Mission & Vision data found'
      });
    }

    const existingData = existing[0];
    const imageField = `${type}_image`;
    const currentImage = existingData[imageField];

    if (!currentImage) {
      return res.status(404).json({
        success: false,
        message: `No ${type} image found to delete`
      });
    }

    // Update database to remove image reference
    const updateQuery = `
      UPDATE mission_vision SET 
        ${imageField} = NULL,
        updated_at = NOW()
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [existingData.id]);

    // Delete the physical file
    await deleteFile(`mission-vision/${currentImage}`);

    console.log(`✅ ${type} image deleted successfully`);
    res.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} image deleted successfully`
    });

  } catch (error) {
    console.error(`❌ Error deleting ${req.params.type} image:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to delete ${req.params.type} image`,
      error: error.message
    });
  }
});

// GET - Fetch Mission & Vision
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching Mission & Vision data...');

    const query = `
      SELECT 
        id,
        mission_text,
        mission_image,
        vision_text,
        vision_image,
        updated_at,
        created_at
      FROM mission_vision 
      ORDER BY id DESC 
      LIMIT 1
    `;

    const result = await executeQuery(query);
    
    if (result.length === 0) {
      console.log('No mission & vision data found, returning empty structure');
      return res.json({
        success: true,
        data: {
          mission_text: '',
          mission_image: null,
          vision_text: '',
          vision_image: null,
          mission_image_url: null,
          vision_image_url: null
        },
        message: 'No mission & vision data found'
      });
    }

    const data = result[0];
    
    // Generate file URLs
    data.mission_image_url = data.mission_image ? 
      getFileUrl(req, data.mission_image, 'mission-vision') : null;
    data.vision_image_url = data.vision_image ? 
      getFileUrl(req, data.vision_image, 'mission-vision') : null;

    console.log('✅ Mission & Vision data fetched successfully');
    res.json({
      success: true,
      data: data,
      message: 'Mission & Vision fetched successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching Mission & Vision:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Mission & Vision',
      error: error.message
    });
  }
});

// POST - Update Mission & Vision (Upsert with file uploads)
router.post('/', 
  uploadFields([
    { name: 'mission_image', maxCount: 1 },
    { name: 'vision_image', maxCount: 1 }
  ]),
  cleanupOnError,
  async (req, res) => {
    try {
      console.log('📝 Updating Mission & Vision...');
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Files received:', req.files ? Object.keys(req.files) : 'none');

      const { mission_text, vision_text } = req.body;

      // Validate required fields
      if (!mission_text?.trim() || !vision_text?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Mission text and Vision text are required'
        });
      }

      // Check if record exists
      const existingQuery = 'SELECT * FROM mission_vision ORDER BY id DESC LIMIT 1';
      const existing = await executeQuery(existingQuery);

      let mission_image_filename = null;
      let vision_image_filename = null;
      let old_mission_image = null;
      let old_vision_image = null;

      if (existing.length > 0) {
        old_mission_image = existing[0].mission_image;
        old_vision_image = existing[0].vision_image;
        console.log('Found existing record with images:', {
          mission: old_mission_image,
          vision: old_vision_image
        });
      }

      // Handle file uploads
      if (req.files) {
        if (req.files.mission_image && req.files.mission_image[0]) {
          mission_image_filename = req.files.mission_image[0].filename;
          console.log('Mission image uploaded:', mission_image_filename);
        }
        if (req.files.vision_image && req.files.vision_image[0]) {
          vision_image_filename = req.files.vision_image[0].filename;
          console.log('Vision image uploaded:', vision_image_filename);
        }
      }

      let query;
      let params;

      if (existing.length === 0) {
        // INSERT new record
        console.log('Creating new mission & vision record');
        query = `
          INSERT INTO mission_vision (
            mission_text, 
            mission_image, 
            vision_text, 
            vision_image,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        params = [
          mission_text.trim(),
          mission_image_filename,
          vision_text.trim(),
          vision_image_filename
        ];
      } else {
        // UPDATE existing record
        console.log('Updating existing mission & vision record');
        query = `
          UPDATE mission_vision SET 
            mission_text = ?,
            mission_image = COALESCE(?, mission_image),
            vision_text = ?,
            vision_image = COALESCE(?, vision_image),
            updated_at = NOW()
          WHERE id = ?
        `;
        params = [
          mission_text.trim(),
          mission_image_filename,
          vision_text.trim(),
          vision_image_filename,
          existing[0].id
        ];
      }

      await executeQuery(query, params);
      console.log('Database updated successfully');

      // Delete old images if new ones were uploaded
      if (mission_image_filename && old_mission_image) {
        console.log('Deleting old mission image:', old_mission_image);
        await deleteFile(`mission-vision/${old_mission_image}`);
      }
      if (vision_image_filename && old_vision_image) {
        console.log('Deleting old vision image:', old_vision_image);
        await deleteFile(`mission-vision/${old_vision_image}`);
      }

      // Fetch updated data
      const updatedData = await executeQuery(
        'SELECT * FROM mission_vision ORDER BY id DESC LIMIT 1'
      );

      if (updatedData.length === 0) {
        throw new Error('Failed to retrieve updated data');
      }

      const responseData = updatedData[0];
      responseData.mission_image_url = responseData.mission_image ? 
        getFileUrl(req, responseData.mission_image, 'mission-vision') : null;
      responseData.vision_image_url = responseData.vision_image ? 
        getFileUrl(req, responseData.vision_image, 'mission-vision') : null;

      console.log('✅ Mission & Vision updated successfully');

      res.json({
        success: true,
        data: responseData,
        message: 'Mission & Vision updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating Mission & Vision:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update Mission & Vision',
        error: error.message
      });
    }
  }
);

// PATCH - Update specific field (mission or vision)
router.patch('/:field', 
  uploadSingle('image'),
  cleanupOnError,
  async (req, res) => {
    try {
      console.log(`🔄 Updating ${req.params.field} field...`);
      const { field } = req.params;
      const { text } = req.body;

      if (!['mission', 'vision'].includes(field)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid field. Must be "mission" or "vision"'
        });
      }

      // Get existing record
      const existing = await executeQuery(
        'SELECT * FROM mission_vision ORDER BY id DESC LIMIT 1'
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No Mission & Vision data found to update'
        });
      }

      const existingData = existing[0];
      let updateQuery = '';
      let params = [];
      let oldImageFile = null;

      if (field === 'mission') {
        updateQuery = `
          UPDATE mission_vision SET 
            mission_text = COALESCE(?, mission_text),
            mission_image = COALESCE(?, mission_image),
            updated_at = NOW()
          WHERE id = ?
        `;
        oldImageFile = existingData.mission_image;
        params = [
          text?.trim(),
          req.file?.filename,
          existingData.id
        ];
      } else {
        updateQuery = `
          UPDATE mission_vision SET 
            vision_text = COALESCE(?, vision_text),
            vision_image = COALESCE(?, vision_image),
            updated_at = NOW()
          WHERE id = ?
        `;
        oldImageFile = existingData.vision_image;
        params = [
          text?.trim(),
          req.file?.filename,
          existingData.id
        ];
      }

      await executeQuery(updateQuery, params);

      // Delete old image if new one was uploaded
      if (req.file?.filename && oldImageFile) {
        console.log(`Deleting old ${field} image:`, oldImageFile);
        await deleteFile(`mission-vision/${oldImageFile}`);
      }

      // Fetch updated data
      const updatedData = await executeQuery(
        'SELECT * FROM mission_vision ORDER BY id DESC LIMIT 1'
      );

      const responseData = updatedData[0];
      responseData.mission_image_url = responseData.mission_image ? 
        getFileUrl(req, responseData.mission_image, 'mission-vision') : null;
      responseData.vision_image_url = responseData.vision_image ? 
        getFileUrl(req, responseData.vision_image, 'mission-vision') : null;

      console.log(`✅ ${field} updated successfully`);
      res.json({
        success: true,
        data: responseData,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`
      });

    } catch (error) {
      console.error(`❌ Error updating ${req.params.field}:`, error);
      res.status(500).json({
        success: false,
        message: `Failed to update ${req.params.field}`,
        error: error.message
      });
    }
  }
);

// Error handling middleware for mission-vision routes
router.use((error, req, res, next) => {
  console.error('📋 MISSION-VISION ROUTE ERROR:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params
  });
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

module.exports = router;