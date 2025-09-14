// routes/logoRoutes.js
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { uploadSingle, deleteFile, getFileUrl, cleanupOnError } = require('../middleware/upload');
const { auth, adminAuth } = require('../middleware/auth');

// Apply cleanup middleware to all routes
router.use(cleanupOnError);

// ✅ GET - Fetch current logo (PUBLIC - no auth required)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching current logo...');
    
    const query = `
      SELECT 
        id, 
        logo_url, 
        logo_name,
        alt_text,
        created_at,
        updated_at
      FROM logos 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await executeQuery(query);
    
    if (result.length === 0) {
      return res.json({
        success: true,
        message: 'No active logo found',
        data: null
      });
    }

    const logo = result[0];
    
    // Generate full URL for the logo
    if (logo.logo_url) {
      logo.full_url = `${req.protocol}://${req.get('host')}${logo.logo_url}`;
    }

    res.json({
      success: true,
      message: 'Logo fetched successfully',
      data: logo
    });

  } catch (error) {
    console.error('❌ Error fetching logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logo',
      error: error.message
    });
  }
});

// ✅ POST - Upload new logo (ADMIN ONLY)
router.post('/', auth, adminAuth, uploadSingle('logo'), async (req, res) => {
  try {
    const { alt_text = 'ACEF Logo' } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided'
      });
    }

    console.log('📤 Uploading new logo:', req.file.filename);

    // Get file URL
    const logoUrl = getFileUrl(req, req.file.filename, 'logos');

    // FIXED: Use separate queries instead of transactions to avoid prepared statement issues
    try {
      // Get current active logo for cleanup
      const currentLogoQuery = 'SELECT logo_url FROM logos WHERE is_active = 1';
      const currentLogo = await executeQuery(currentLogoQuery);

      // Deactivate all existing logos
      const deactivateQuery = 'UPDATE logos SET is_active = 0 WHERE is_active = 1';
      await executeQuery(deactivateQuery);

      // Insert new logo with individual values instead of prepared statement
      const insertQuery = `
        INSERT INTO logos (logo_url, logo_name, alt_text, is_active, created_at, updated_at) 
        VALUES ('${logoUrl}', '${req.file.filename}', '${alt_text}', 1, NOW(), NOW())
      `;
      
      const insertResult = await executeQuery(insertQuery);

      // Clean up old logo file (if exists)
      if (currentLogo.length > 0 && currentLogo[0].logo_url) {
        const oldLogoPath = currentLogo[0].logo_url.replace('/uploads/', '');
        await deleteFile(oldLogoPath);
        console.log('🗑️ Old logo cleaned up');
      }

      // Fetch the newly created logo
      const newLogoQuery = `
        SELECT 
          id, 
          logo_url, 
          logo_name,
          alt_text,
          created_at,
          updated_at
        FROM logos 
        WHERE id = ${insertResult.insertId}
      `;
      
      const newLogo = await executeQuery(newLogoQuery);
      
      if (newLogo[0]) {
        newLogo[0].full_url = `${req.protocol}://${req.get('host')}${newLogo[0].logo_url}`;
      }

      res.status(201).json({
        success: true,
        message: 'Logo uploaded successfully',
        data: newLogo[0]
      });

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
});

// ✅ PUT - Update logo metadata (ADMIN ONLY)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text } = req.body;

    if (!alt_text) {
      return res.status(400).json({
        success: false,
        message: 'Alt text is required'
      });
    }

    console.log('✏️ Updating logo metadata for ID:', id);

    // Check if logo exists and is active
    const checkQuery = `SELECT * FROM logos WHERE id = ${id} AND is_active = 1`;
    const existingLogo = await executeQuery(checkQuery);

    if (existingLogo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active logo not found'
      });
    }

    // Update logo metadata - FIXED: Use direct query instead of prepared statement
    const updateQuery = `
      UPDATE logos 
      SET alt_text = '${alt_text}', updated_at = NOW() 
      WHERE id = ${id} AND is_active = 1
    `;
    
    await executeQuery(updateQuery);

    // Fetch updated logo
    const updatedLogoQuery = `
      SELECT 
        id, 
        logo_url, 
        logo_name,
        alt_text,
        created_at,
        updated_at
      FROM logos 
      WHERE id = ${id}
    `;
    
    const updatedLogo = await executeQuery(updatedLogoQuery);
    
    if (updatedLogo[0]) {
      updatedLogo[0].full_url = `${req.protocol}://${req.get('host')}${updatedLogo[0].logo_url}`;
    }

    res.json({
      success: true,
      message: 'Logo updated successfully',
      data: updatedLogo[0]
    });

  } catch (error) {
    console.error('❌ Error updating logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update logo',
      error: error.message
    });
  }
});

// ✅ DELETE - Remove logo (ADMIN ONLY)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting logo with ID:', id);

    // Get logo details before deletion
    const logoQuery = `SELECT * FROM logos WHERE id = ${id}`;
    const logo = await executeQuery(logoQuery);

    if (logo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    // Delete logo from database - FIXED: Use direct query
    const deleteQuery = `DELETE FROM logos WHERE id = ${id}`;
    await executeQuery(deleteQuery);

    // Delete logo file from filesystem
    if (logo[0].logo_url) {
      const logoPath = logo[0].logo_url.replace('/uploads/', '');
      await deleteFile(logoPath);
      console.log('🗑️ Logo file deleted from filesystem');
    }

    res.json({
      success: true,
      message: 'Logo deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo',
      error: error.message
    });
  }
});

// ✅ GET - Get logo history/all logos (ADMIN ONLY)
router.get('/history', auth, adminAuth, async (req, res) => {
  try {
    console.log('📋 Fetching logo history...');
    
    const query = `
      SELECT 
        id, 
        logo_url, 
        logo_name,
        alt_text,
        is_active,
        created_at,
        updated_at
      FROM logos 
      ORDER BY created_at DESC
    `;
    
    const results = await executeQuery(query);
    
    // Generate full URLs for all logos
    const logos = results.map(logo => ({
      ...logo,
      full_url: logo.logo_url ? `${req.protocol}://${req.get('host')}${logo.logo_url}` : null,
      is_active: Boolean(logo.is_active)
    }));

    res.json({
      success: true,
      message: 'Logo history fetched successfully',
      data: logos,
      count: logos.length
    });

  } catch (error) {
    console.error('❌ Error fetching logo history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logo history',
      error: error.message
    });
  }
});

module.exports = router;