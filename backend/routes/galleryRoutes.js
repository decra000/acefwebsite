// routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { uploadSingle, deleteFile, getFileUrl, cleanupOnError } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Apply cleanup middleware to all routes
router.use(cleanupOnError);

// Enhanced logging middleware
router.use((req, res, next) => {
  console.log(`🖼️ Gallery Route: ${req.method} ${req.path}`);
  next();
});

// ===== GALLERY CRUD OPERATIONS =====

// GET - Fetch all gallery items with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      is_protected, 
      is_active = 'true',
      sort_by = 'updated_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

 // Only add filters if not "all"
if (category && category !== 'all') {
  whereConditions.push('g.category = ?');
  queryParams.push(category);
}

if (search) {
  whereConditions.push('(g.name LIKE ? OR g.description LIKE ? OR g.alt_text LIKE ?)');
  const searchTerm = `%${search}%`;
  queryParams.push(searchTerm, searchTerm, searchTerm);
}

if (is_protected && is_protected !== 'all') {
  whereConditions.push('g.is_protected = ?');
  queryParams.push(is_protected === 'true' ? 1 : 0);
}

if (is_active && is_active !== 'all') {
  whereConditions.push('g.is_active = ?');
  queryParams.push(is_active === 'true' ? 1 : 0);
}


    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Validate sort parameters
    const validSortColumns = ['name', 'created_at', 'updated_at', 'category', 'file_size'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'updated_at';
    const sortDirection = validSortOrders.includes(sort_order.toUpperCase()) 
      ? sort_order.toUpperCase() 
      : 'DESC';

    // Main query
    const query = `
      SELECT 
        g.*,
        gc.color as category_color,
        gc.description as category_description,
        COUNT(gu.id) as usage_count
      FROM gallery g
      LEFT JOIN gallery_categories gc ON g.category = gc.name
      LEFT JOIN gallery_usage gu ON g.id = gu.gallery_id AND gu.is_active = TRUE
      ${whereClause}
      GROUP BY g.id, gc.color, gc.description
      ORDER BY g.${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT g.id) as total
      FROM gallery g
      LEFT JOIN gallery_categories gc ON g.category = gc.name
      LEFT JOIN gallery_usage gu ON g.id = gu.gallery_id AND gu.is_active = TRUE
      ${whereClause}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));
    const countParams = queryParams.slice(0, -2); // Remove limit and offset for count

    const [gallery, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, countParams)
    ]);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: gallery,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery items',
      error: error.message
    });
  }
});

// GET - Fetch single gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        g.*,
        gc.color as category_color,
        gc.description as category_description,
        GROUP_CONCAT(
          CONCAT(gu.usage_location, ':', gu.page_name, ':', gu.section_name)
        ) as usage_details
      FROM gallery g
      LEFT JOIN gallery_categories gc ON g.category = gc.name
      LEFT JOIN gallery_usage gu ON g.id = gu.gallery_id AND gu.is_active = TRUE
      WHERE g.id = ?
      GROUP BY g.id, gc.color, gc.description
    `;

    const gallery = await executeQuery(query, [id]);

    if (gallery.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const item = gallery[0];
    
    // Parse usage details
    if (item.usage_details) {
      item.usage_locations_detailed = item.usage_details.split(',').map(detail => {
        const [location, page, section] = detail.split(':');
        return { location, page, section };
      });
    }

    delete item.usage_details;

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('❌ Error fetching gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery item',
      error: error.message
    });
  }
});

// POST - Create new gallery item
router.post('/', uploadSingle('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      alt_text,
      category = 'general',
      usage_locations = '[]'
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    let image_url = '';
    let file_size = null;
    let width = null;
    let height = null;
    let file_type = null;

    if (req.file) {
      image_url = getFileUrl(req, req.file.filename);
      file_size = req.file.size;
      file_type = req.file.mimetype;

      // Get image dimensions if it's an image
      if (req.file.mimetype.startsWith('image/')) {
        try {
          const sharp = require('sharp');
          const metadata = await sharp(req.file.path).metadata();
          width = metadata.width;
          height = metadata.height;
        } catch (err) {
          console.warn('⚠️ Could not get image metadata:', err.message);
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Check if name already exists
    const existingCheck = await executeQuery(
      'SELECT id FROM gallery WHERE name = ?',
      [name.trim()]
    );

    if (existingCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Gallery item with this name already exists'
      });
    }

    // Validate category exists
    const categoryCheck = await executeQuery(
      'SELECT name FROM gallery_categories WHERE name = ? AND is_active = TRUE',
      [category]
    );

    if (categoryCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    // Insert gallery item
    const insertQuery = `
      INSERT INTO gallery (
        name, description, image_url, alt_text, category, 
        usage_locations, file_size, width, height, file_type,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(insertQuery, [
      name.trim(),
      description || null,
      image_url,
      alt_text || name,
      category,
      usage_locations,
      file_size,
      width,
      height,
      file_type
    ]);

    const newId = result.insertId;

    // Insert usage tracking if provided
    if (usage_locations && usage_locations !== '[]') {
      try {
        const locations = JSON.parse(usage_locations);
        for (const location of locations) {
          await executeQuery(
            `INSERT INTO gallery_usage (gallery_id, usage_location, created_at) 
             VALUES (?, ?, NOW())`,
            [newId, location]
          );
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse usage locations:', parseError.message);
      }
    }

    // Fetch the created item
    const createdItem = await executeQuery(
      `SELECT g.*, gc.color as category_color 
       FROM gallery g 
       LEFT JOIN gallery_categories gc ON g.category = gc.name 
       WHERE g.id = ?`,
      [newId]
    );

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: createdItem[0]
    });

  } catch (error) {
    console.error('❌ Error creating gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gallery item',
      error: error.message
    });
  }
});

// PUT - Update gallery item
router.put('/:id', uploadSingle('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      alt_text,
      category,
      usage_locations,
      is_active
    } = req.body;

    // Check if item exists and get current data
    const currentItem = await executeQuery(
      'SELECT * FROM gallery WHERE id = ?',
      [id]
    );

    if (currentItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const current = currentItem[0];

    // Check if item is protected from updates (optional restriction)
    if (current.is_protected && req.body.hasOwnProperty('is_protected')) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify protection status of protected items'
      });
    }

    // Validate name uniqueness if changed
    if (name && name.trim() !== current.name) {
      const nameCheck = await executeQuery(
        'SELECT id FROM gallery WHERE name = ? AND id != ?',
        [name.trim(), id]
      );

      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Gallery item with this name already exists'
        });
      }
    }

    // Validate category if changed
    if (category && category !== current.category) {
      const categoryCheck = await executeQuery(
        'SELECT name FROM gallery_categories WHERE name = ? AND is_active = TRUE',
        [category]
      );

      if (categoryCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category selected'
        });
      }
    }

    let updateFields = [];
    let updateValues = [];

    // Build dynamic update query
    if (name && name.trim()) {
      updateFields.push('name = ?');
      updateValues.push(name.trim());
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (alt_text !== undefined) {
      updateFields.push('alt_text = ?');
      updateValues.push(alt_text);
    }

    if (category) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }

    if (usage_locations !== undefined) {
      updateFields.push('usage_locations = ?');
      updateValues.push(usage_locations);
    }

    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active === true || is_active === 'true' ? 1 : 0);
    }

    // Handle image update
    if (req.file) {
      const new_image_url = getFileUrl(req, req.file.filename);
      updateFields.push('image_url = ?', 'file_size = ?', 'file_type = ?');
      updateValues.push(new_image_url, req.file.size, req.file.mimetype);

      // Get image dimensions
      if (req.file.mimetype.startsWith('image/')) {
        try {
          const sharp = require('sharp');
          const metadata = await sharp(req.file.path).metadata();
          updateFields.push('width = ?', 'height = ?');
          updateValues.push(metadata.width, metadata.height);
        } catch (err) {
          console.warn('⚠️ Could not get image metadata:', err.message);
        }
      }

      // Delete old image file if it exists and is not a URL
      if (current.image_url && !current.image_url.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', 'gallery', path.basename(current.image_url));
        deleteFile(oldImagePath);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add updated_at
    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const updateQuery = `
      UPDATE gallery 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateValues);

    // Update usage tracking if provided
    if (usage_locations !== undefined) {
      // Remove old usage tracking
      await executeQuery(
        'DELETE FROM gallery_usage WHERE gallery_id = ?',
        [id]
      );

      // Add new usage tracking
      if (usage_locations && usage_locations !== '[]') {
        try {
          const locations = JSON.parse(usage_locations);
          for (const location of locations) {
            await executeQuery(
              `INSERT INTO gallery_usage (gallery_id, usage_location, created_at) 
               VALUES (?, ?, NOW())`,
              [id, location]
            );
          }
        } catch (parseError) {
          console.warn('⚠️ Could not parse usage locations:', parseError.message);
        }
      }
    }

    // Fetch updated item
    const updatedItem = await executeQuery(
      `SELECT g.*, gc.color as category_color 
       FROM gallery g 
       LEFT JOIN gallery_categories gc ON g.category = gc.name 
       WHERE g.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: updatedItem[0]
    });

  } catch (error) {
    console.error('❌ Error updating gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery item',
      error: error.message
    });
  }
});

// DELETE - Delete gallery item (with protection check)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const item = await executeQuery(
      'SELECT * FROM gallery WHERE id = ?',
      [id]
    );

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const galleryItem = item[0];

    // Check if item is protected
    if (galleryItem.is_protected) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete protected gallery item'
      });
    }

    // Check if item is currently in use
    const usageCheck = await executeQuery(
      'SELECT COUNT(*) as usage_count FROM gallery_usage WHERE gallery_id = ? AND is_active = TRUE',
      [id]
    );

    if (usageCheck[0].usage_count > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete gallery item that is currently in use'
      });
    }

    // Delete image file if it exists and is not a URL
    if (galleryItem.image_url && !galleryItem.image_url.startsWith('http')) {
      const imagePath = path.join(__dirname, '..', 'uploads', 'gallery', path.basename(galleryItem.image_url));
      await deleteFile(imagePath);
    }

    // Delete usage tracking first (foreign key constraint)
    await executeQuery(
      'DELETE FROM gallery_usage WHERE gallery_id = ?',
      [id]
    );

    // Delete gallery item
    await executeQuery(
      'DELETE FROM gallery WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery item',
      error: error.message
    });
  }
});

// ===== PROTECTION AND STATUS MANAGEMENT =====

// PUT - Toggle protection status
router.put('/:id/protection', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_protected } = req.body;

    if (is_protected === undefined) {
      return res.status(400).json({
        success: false,
        message: 'is_protected field is required'
      });
    }

    const result = await executeQuery(
      'UPDATE gallery SET is_protected = ?, updated_at = NOW() WHERE id = ?',
      [is_protected ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      message: `Gallery item ${is_protected ? 'protected' : 'unprotected'} successfully`
    });

  } catch (error) {
    console.error('❌ Error toggling protection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle protection status',
      error: error.message
    });
  }
});

// ===== CATEGORY MANAGEMENT =====

// GET - Fetch all categories
router.get('/categories/list', async (req, res) => {
  try {
    const query = `
      SELECT 
        gc.*,
        COUNT(g.id) as item_count
      FROM gallery_categories gc
      LEFT JOIN gallery g ON gc.name = g.category AND g.is_active = TRUE
      WHERE gc.is_active = TRUE
      GROUP BY gc.id
      ORDER BY gc.sort_order ASC, gc.name ASC
    `;

    const categories = await executeQuery(query);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// POST - Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, color = '#3B82F6', sort_order = 0 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCheck = await executeQuery(
      'SELECT id FROM gallery_categories WHERE name = ?',
      [name.trim()]
    );

    if (existingCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const result = await executeQuery(
      `INSERT INTO gallery_categories (name, description, color, sort_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name.trim(), description || null, color, sort_order]
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
    console.error('❌ Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// ===== BULK OPERATIONS =====

// PUT - Bulk update gallery items
router.put('/bulk/update', async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }

    // Check for protected items if trying to delete
    if (updates.is_active === false) {
      const protectedCheck = await executeQuery(
        `SELECT id FROM gallery WHERE id IN (${ids.map(() => '?').join(',')}) AND is_protected = TRUE`,
        ids
      );

      if (protectedCheck.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Cannot deactivate protected items'
        });
      }
    }

    let updateFields = [];
    let updateValues = [];

    if (updates.category) {
      updateFields.push('category = ?');
      updateValues.push(updates.category);
    }

    if (updates.is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(updates.is_active ? 1 : 0);
    }

    if (updates.is_protected !== undefined) {
      updateFields.push('is_protected = ?');
      updateValues.push(updates.is_protected ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    updateFields.push('updated_at = NOW()');

    const placeholders = ids.map(() => '?').join(',');
    const updateQuery = `
      UPDATE gallery 
      SET ${updateFields.join(', ')}
      WHERE id IN (${placeholders})
    `;

    const result = await executeQuery(updateQuery, [...updateValues, ...ids]);

    res.json({
      success: true,
      message: `${result.affectedRows} items updated successfully`,
      affected_rows: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Error bulk updating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update items',
      error: error.message
    });
  }
});

// DELETE - Bulk delete gallery items
router.delete('/bulk/delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    // Check for protected items
    const protectedCheck = await executeQuery(
      `SELECT id, name FROM gallery WHERE id IN (${ids.map(() => '?').join(',')}) AND is_protected = TRUE`,
      ids
    );

    if (protectedCheck.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete protected items',
        protected_items: protectedCheck
      });
    }

    // Check for items in use
    const usageCheck = await executeQuery(
      `SELECT DISTINCT g.id, g.name 
       FROM gallery g 
       JOIN gallery_usage gu ON g.id = gu.gallery_id 
       WHERE g.id IN (${ids.map(() => '?').join(',')}) AND gu.is_active = TRUE`,
      ids
    );

    if (usageCheck.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete items that are currently in use',
        items_in_use: usageCheck
      });
    }

    // Get file paths for cleanup
    const filePaths = await executeQuery(
      `SELECT image_url FROM gallery WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // Delete usage tracking
    await executeQuery(
      `DELETE FROM gallery_usage WHERE gallery_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // Delete gallery items
    const result = await executeQuery(
      `DELETE FROM gallery WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // Clean up files
    for (const file of filePaths) {
      if (file.image_url && !file.image_url.startsWith('http')) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'gallery', path.basename(file.image_url));
        await deleteFile(imagePath);
      }
    }

    res.json({
      success: true,
      message: `${result.affectedRows} items deleted successfully`,
      deleted_count: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Error bulk deleting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete items',
      error: error.message
    });
  }
});

// ===== USAGE TRACKING =====

// GET - Get usage statistics
router.get('/usage/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        g.category,
        COUNT(g.id) as total_items,
        COUNT(CASE WHEN g.is_protected = TRUE THEN 1 END) as protected_items,
        COUNT(CASE WHEN g.is_active = TRUE THEN 1 END) as active_items,
        COUNT(DISTINCT gu.gallery_id) as items_in_use,
        AVG(g.file_size) as avg_file_size,
        SUM(g.file_size) as total_file_size
      FROM gallery g
      LEFT JOIN gallery_usage gu ON g.id = gu.gallery_id AND gu.is_active = TRUE
      GROUP BY g.category
      ORDER BY total_items DESC
    `;

    const stats = await executeQuery(query);

    // Overall stats
    const overallQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN is_protected = TRUE THEN 1 END) as protected_items,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_items,
        AVG(file_size) as avg_file_size,
        SUM(file_size) as total_file_size
      FROM gallery
    `;

    const overall = await executeQuery(overallQuery);

    res.json({
      success: true,
      data: {
        by_category: stats,
        overall: overall[0]
      }
    });

  } catch (error) {
    console.error('❌ Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage statistics',
      error: error.message
    });
  }
});

// POST - Add usage tracking
router.post('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { usage_location, page_name, section_name, component_name } = req.body;

    if (!usage_location) {
      return res.status(400).json({
        success: false,
        message: 'usage_location is required'
      });
    }

    // Check if gallery item exists
    const galleryCheck = await executeQuery(
      'SELECT id FROM gallery WHERE id = ?',
      [id]
    );

    if (galleryCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Insert or update usage tracking
    const query = `
      INSERT INTO gallery_usage (
        gallery_id, usage_location, page_name, section_name, component_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        page_name = VALUES(page_name),
        section_name = VALUES(section_name),
        component_name = VALUES(component_name),
        is_active = TRUE,
        updated_at = NOW()
    `;

    await executeQuery(query, [
      id,
      usage_location,
      page_name || null,
      section_name || null,
      component_name || null
    ]);

    res.json({
      success: true,
      message: 'Usage tracking added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding usage tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add usage tracking',
      error: error.message
    });
  }
});

// DELETE - Remove usage tracking
router.delete('/:id/usage/:location', async (req, res) => {
  try {
    const { id, location } = req.params;

    const result = await executeQuery(
      'DELETE FROM gallery_usage WHERE gallery_id = ? AND usage_location = ?',
      [id, decodeURIComponent(location)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usage tracking not found'
      });
    }

    res.json({
      success: true,
      message: 'Usage tracking removed successfully'
    });

  } catch (error) {
    console.error('❌ Error removing usage tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove usage tracking',
      error: error.message
    });
  }
});

// ===== PUBLIC API FOR FRONTEND =====

// GET - Get gallery items for public use (frontend)
router.get('/public/by-location/:location', async (req, res) => {
  try {
    const { location } = req.params;

    const query = `
      SELECT 
        g.id,
        g.name,
        g.image_url,
        g.alt_text,
        g.width,
        g.height,
        g.category
      FROM gallery g
      JOIN gallery_usage gu ON g.id = gu.gallery_id
      WHERE gu.usage_location = ? 
        AND g.is_active = TRUE 
        AND gu.is_active = TRUE
      ORDER BY g.updated_at DESC
    `;

    const items = await executeQuery(query, [location]);

    res.json({
      success: true,
      data: items
    });

  } catch (error) {
    console.error('❌ Error fetching public gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery items',
      error: error.message
    });
  }
});

// GET - Get single gallery item for public use
router.get('/public/item/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const query = `
      SELECT 
        g.id,
        g.name,
        g.image_url,
        g.alt_text,
        g.width,
        g.height,
        g.category
      FROM gallery g
      WHERE g.name = ? AND g.is_active = TRUE
    `;

    const items = await executeQuery(query, [name]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      data: items[0]
    });

  } catch (error) {
    console.error('❌ Error fetching public gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery item',
      error: error.message
    });
  }
});

module.exports = router;