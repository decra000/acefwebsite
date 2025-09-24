const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { uploadSingle, deleteFile, cleanupOnError } = require('../middleware/upload');
const path = require('path');

// Define protected section keys
const PROTECTED_SECTIONS = {
  home_hero_slides: 'home_hero_slides',
  impact_hero: 'impact_hero',
  country_images: 'country_images',
  get_involved_dark: 'get_involved_dark',
  get_involved_light: 'get_involved_light'
};

// Helper function to safely parse JSON metadata
const safeJsonParse = (jsonString) => {
  if (!jsonString) return {};
  if (typeof jsonString === 'object') return jsonString;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Invalid JSON metadata:', jsonString, error);
    return {};
  }
};

// === PROTECTED GALLERY ROUTES ===

// Get all protected gallery images
router.get('/protected', async (req, res) => {
  try {
    const { section, country } = req.query;
    
    let query = `
      SELECT g.*, gc.description as category_description 
      FROM gallery g 
      LEFT JOIN gallery_categories gc ON g.category = gc.name
      WHERE g.section_type = 'protected' AND g.is_active = true
    `;
    const params = [];

    if (section && PROTECTED_SECTIONS[section]) {
      query += ' AND g.protected_key LIKE ?';
      params.push(`${section}%`);
    }

    if (country) {
      query += ' AND (g.country_name = ? OR g.country_name IS NULL)';
      params.push(country);
    }

    query += ' ORDER BY g.protected_key, g.display_order ASC';

    const images = await executeQuery(query, params);
    
    // Parse JSON metadata safely
    const processedImages = images.map(img => ({
      ...img,
      metadata: safeJsonParse(img.metadata)
    }));

    res.json({
      success: true,
      data: processedImages
    });
  } catch (error) {
    console.error('Error fetching protected gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch protected gallery images',
      error: error.message
    });
  }
});

// Updated backend route with debug logging and potential fixes
router.get('/protected', async (req, res) => {
  try {
    const { section, country } = req.query;
    
    // Debug logging
    console.log('=== PROTECTED GALLERY REQUEST ===');
    console.log('Query params:', req.query);
    console.log('Section:', section);
    console.log('Country:', country);
    console.log('PROTECTED_SECTIONS:', PROTECTED_SECTIONS);
    console.log('Section exists in PROTECTED_SECTIONS:', !!PROTECTED_SECTIONS[section]);
    
    let query = `
      SELECT g.*, gc.description as category_description 
      FROM gallery g 
      LEFT JOIN gallery_categories gc ON g.category = gc.name
      WHERE g.section_type = 'protected' AND g.is_active = true
    `;
    const params = [];

    // POTENTIAL BUG FIX: The LIKE pattern might be the issue
    if (section && PROTECTED_SECTIONS[section]) {
      console.log('Adding section filter for:', section);
      
      // Try exact category match first, then fallback to protected_key LIKE
      query += ' AND (g.category = ? OR g.protected_key LIKE ?)';
      params.push(section); // Exact category match
      params.push(`${section}%`); // protected_key LIKE pattern
      
      console.log('Filter params added:', [section, `${section}%`]);
    }

    if (country) {
      query += ' AND (g.country_name = ? OR g.country_name IS NULL)';
      params.push(country);
    }

    query += ' ORDER BY g.protected_key, g.display_order ASC';

    console.log('Final query:', query);
    console.log('Final params:', params);

    const images = await executeQuery(query, params);
    
    console.log('Query results count:', images.length);
    console.log('First few results:', images.slice(0, 2));
    
    // Parse JSON metadata safely
    const processedImages = images.map(img => ({
      ...img,
      metadata: safeJsonParse(img.metadata)
    }));

    console.log('=== END PROTECTED GALLERY REQUEST ===');

    res.json({
      success: true,
      data: processedImages
    });
  } catch (error) {
    console.error('Error fetching protected gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch protected gallery images',
      error: error.message
    });
  }
});
// Update protected image (only image and metadata can be changed)
router.put('/protected/:id', uploadSingle('image'), cleanupOnError, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, alt_text, metadata } = req.body;
    
    // First, verify this is a protected image
    const existingImage = await executeQuery(
      'SELECT * FROM gallery WHERE id = ? AND section_type = "protected"',
      [id]
    );

    if (existingImage.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Protected image not found'
      });
    }

    const updateData = {
      updated_by: 1, // You may need to add auth back later
      updated_at: new Date()
    };

    // Only allow updating certain fields for protected images
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (alt_text) updateData.alt_text = alt_text;
    if (metadata) updateData.metadata = JSON.stringify(metadata);

    // Handle new image upload
    if (req.file) {
      // Delete old image file
      if (existingImage[0].image_url && !existingImage[0].image_url.startsWith('http')) {
        const oldFilePath = path.join(__dirname, '..', existingImage[0].image_url);
        await deleteFile(oldFilePath);
      }
      
      updateData.image_url = `/uploads/gallery/${req.file.filename}`;
    }

    // Build update query
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    await executeQuery(
      `UPDATE gallery SET ${setClause} WHERE id = ?`,
      values
    );

    // Return updated image
    const updatedImage = await executeQuery(
      'SELECT * FROM gallery WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Protected image updated successfully',
      data: {
        ...updatedImage[0],
        metadata: safeJsonParse(updatedImage[0].metadata)
      }
    });

  } catch (error) {
    console.error('Error updating protected image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update protected image',
      error: error.message
    });
  }
});

// === UNPROTECTED GALLERY ROUTES ===

// Get all unprotected gallery images
router.get('/unprotected', async (req, res) => {
  try {
    const { category, limit, offset } = req.query;
    
    let query = `
      SELECT g.*, gc.description as category_description,
             u1.name as created_by_name, u2.name as updated_by_name
      FROM gallery g 
      LEFT JOIN gallery_categories gc ON g.category = gc.name
      LEFT JOIN users u1 ON g.created_by = u1.id
      LEFT JOIN users u2 ON g.updated_by = u2.id
      WHERE g.section_type = 'unprotected'
    `;
    const params = [];

    if (category) {
      query += ' AND g.category = ?';
      params.push(category);
    }

    query += ' ORDER BY g.category, g.display_order ASC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
      
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }

    const images = await executeQuery(query, params);
    
    const processedImages = images.map(img => ({
      ...img,
      metadata: safeJsonParse(img.metadata)
    }));

    res.json({
      success: true,
      data: processedImages
    });
  } catch (error) {
    console.error('Error fetching unprotected gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: error.message
    });
  }
});

// Get single unprotected image
router.get('/unprotected/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const images = await executeQuery(
      `SELECT g.*, gc.description as category_description,
              u1.name as created_by_name, u2.name as updated_by_name
       FROM gallery g 
       LEFT JOIN gallery_categories gc ON g.category = gc.name
       LEFT JOIN users u1 ON g.created_by = u1.id
       LEFT JOIN users u2 ON g.updated_by = u2.id
       WHERE g.id = ? AND g.section_type = 'unprotected'`,
      [id]
    );

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const processedImage = {
      ...images[0],
      metadata: safeJsonParse(images[0].metadata)
    };

    res.json({
      success: true,
      data: processedImage
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image',
      error: error.message
    });
  }
});

// Create new unprotected gallery image
router.post('/unprotected', uploadSingle('image'), cleanupOnError, async (req, res) => {
  try {
    const { title, description, alt_text, category, metadata } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    // Get next display order
    const orderResult = await executeQuery(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM gallery WHERE category = ?',
      [category]
    );
    const displayOrder = orderResult[0].next_order;

    const imageData = {
      title,
      description: description || '',
      image_url: `/uploads/gallery/${req.file.filename}`,
      alt_text: alt_text || title,
      category,
      section_type: 'unprotected',
      display_order: displayOrder,
      metadata: metadata ? JSON.stringify(metadata) : null,
      created_by: 1 // You may need to add auth back later
    };

    const columns = Object.keys(imageData).join(', ');
    const placeholders = Object.keys(imageData).map(() => '?').join(', ');
    const values = Object.values(imageData);

    const result = await executeQuery(
      `INSERT INTO gallery (${columns}) VALUES (${placeholders})`,
      values
    );

    // Return created image
    const newImage = await executeQuery(
      'SELECT * FROM gallery WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Gallery image created successfully',
      data: {
        ...newImage[0],
        metadata: safeJsonParse(newImage[0].metadata)
      }
    });

  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gallery image',
      error: error.message
    });
  }
});

// Update unprotected gallery image
router.put('/unprotected/:id', uploadSingle('image'), cleanupOnError, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, alt_text, category, display_order, is_active, metadata } = req.body;

    // Verify image exists and is unprotected
    const existingImage = await executeQuery(
      'SELECT * FROM gallery WHERE id = ? AND section_type = "unprotected"',
      [id]
    );

    if (existingImage.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const updateData = {
      updated_by: 1, // You may need to add auth back later
      updated_at: new Date()
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (alt_text) updateData.alt_text = alt_text;
    if (category) updateData.category = category;
    if (display_order !== undefined) updateData.display_order = parseInt(display_order);
    if (is_active !== undefined) updateData.is_active = is_active === 'true' || is_active === true;
    if (metadata) updateData.metadata = JSON.stringify(metadata);

    // Handle new image upload
    if (req.file) {
      // Delete old image file
      if (existingImage[0].image_url && !existingImage[0].image_url.startsWith('http')) {
        const oldFilePath = path.join(__dirname, '..', existingImage[0].image_url);
        await deleteFile(oldFilePath);
      }
      
      updateData.image_url = `/uploads/gallery/${req.file.filename}`;
    }

    // Build update query
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    await executeQuery(
      `UPDATE gallery SET ${setClause} WHERE id = ?`,
      values
    );

    // Return updated image
    const updatedImage = await executeQuery(
      'SELECT * FROM gallery WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      data: {
        ...updatedImage[0],
        metadata: safeJsonParse(updatedImage[0].metadata)
      }
    });

  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery image',
      error: error.message
    });
  }
});

// Delete unprotected gallery image
router.delete('/unprotected/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify image exists and is unprotected
    const existingImage = await executeQuery(
      'SELECT * FROM gallery WHERE id = ? AND section_type = "unprotected"',
      [id]
    );

    if (existingImage.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete image file
    if (existingImage[0].image_url && !existingImage[0].image_url.startsWith('http')) {
      const filePath = path.join(__dirname, '..', existingImage[0].image_url);
      await deleteFile(filePath);
    }

    // Delete from database
    await executeQuery(
      'DELETE FROM gallery WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Gallery image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery image',
      error: error.message
    });
  }
});

// === UTILITY ROUTES ===

// Get gallery categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await executeQuery(
      'SELECT * FROM gallery_categories ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, is_protected } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const result = await executeQuery(
      'INSERT INTO gallery_categories (name, description, is_protected) VALUES (?, ?, ?)',
      [name, description || '', is_protected || false]
    );

    const newCategory = await executeQuery(
      'SELECT * FROM gallery_categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory[0]
    });

  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Update display order for images
router.put('/reorder', async (req, res) => {
  try {
    const { images } = req.body; // Array of { id, display_order }

    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }

    // Update each image's display order
    for (const img of images) {
      await executeQuery(
        'UPDATE gallery SET display_order = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
        [img.display_order, 1, img.id] // You may need to add auth back later for user ID
      );
    }

    res.json({
      success: true,
      message: 'Display order updated successfully'
    });

  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update display order',
      error: error.message
    });
  }
});

// Get images for specific country (public route)
router.get('/country/:countryName', async (req, res) => {
  try {
    const { countryName } = req.params;
    
    const images = await executeQuery(
      `SELECT * FROM gallery 
       WHERE section_type = 'protected' 
         AND category = 'country_images' 
         AND country_name = ? 
         AND is_active = true
       ORDER BY display_order ASC`,
      [countryName]
    );

    const processedImages = images.map(img => ({
      ...img,
      metadata: safeJsonParse(img.metadata)
    }));

    res.json({
      success: true,
      data: processedImages
    });
  } catch (error) {
    console.error('Error fetching country images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch country images',
      error: error.message
    });
  }
});

module.exports = router;