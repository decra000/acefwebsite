const express = require('express');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Enhanced logging middleware for core-values routes
router.use((req, res, next) => {
  console.log(`🎯 CORE-VALUES ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('🎯 Request details:', {
    method: req.method,
    path: req.path,
    body: req.method !== 'GET' ? req.body : 'N/A',
    params: req.params,
    query: req.query
  });
  next();
});

// Debug/test route for development (MUST come before other routes)
router.get('/debug/test', (req, res) => {
  res.json({
    success: true,
    message: 'Core-values routes are working!',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET    /api/core-values               - Get all core values',
      'GET    /api/core-values/debug/test   - Test route',
      'POST   /api/core-values              - Create new core value',
      'PUT    /api/core-values/:id          - Update specific core value',
      'DELETE /api/core-values/:id          - Delete specific core value'
    ]
  });
});

// GET - Fetch all Core Values
router.get('/', async (req, res) => {
  try {
    console.log('🎯 Fetching all core values...');

    const query = `
      SELECT 
        id,
        title,
        description,
        display_order,
        is_active,
        created_at,
        updated_at
      FROM core_values 
      WHERE is_active = 1
      ORDER BY display_order ASC, created_at ASC
    `;

    const result = await executeQuery(query);
    
    console.log(`✅ Found ${result.length} active core values`);
    res.json({
      success: true,
      data: result,
      count: result.length,
      message: `${result.length} core values retrieved successfully`
    });

  } catch (error) {
    console.error('❌ Error fetching core values:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch core values',
      error: error.message
    });
  }
});

// POST - Create new Core Value
router.post('/', async (req, res) => {
  try {
    console.log('🎯 Creating new core value...');
    const { title, description } = req.body;

    // Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Core value title is required'
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Core value description is required'
      });
    }

    // Check if we've reached the maximum limit of 10 core values
    const countQuery = 'SELECT COUNT(*) as count FROM core_values WHERE is_active = 1';
    const countResult = await executeQuery(countQuery);
    const currentCount = countResult[0].count;

    if (currentCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit of 10 core values reached. Please remove existing values to add new ones.'
      });
    }

    // Check for duplicate titles
    const duplicateQuery = 'SELECT id FROM core_values WHERE title = ? AND is_active = 1';
    const duplicateResult = await executeQuery(duplicateQuery, [title.trim()]);
    
    if (duplicateResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A core value with this title already exists'
      });
    }

    // Get the next display order
    const orderQuery = 'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM core_values WHERE is_active = 1';
    const orderResult = await executeQuery(orderQuery);
    const displayOrder = orderResult[0].next_order;

    // Insert new core value
    const insertQuery = `
      INSERT INTO core_values (
        title, 
        description, 
        display_order,
        is_active,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, 1, NOW(), NOW())
    `;

    const insertResult = await executeQuery(insertQuery, [
      title.trim(),
      description.trim(),
      displayOrder
    ]);

    // Fetch the created core value
    const newCoreValue = await executeQuery(
      'SELECT * FROM core_values WHERE id = ?',
      [insertResult.insertId]
    );

    console.log(`✅ Core value created successfully with ID: ${insertResult.insertId}`);

    res.status(201).json({
      success: true,
      data: newCoreValue[0],
      message: 'Core value created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating core value:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create core value',
      error: error.message
    });
  }
});

// PUT - Update Core Value
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    console.log(`🎯 Updating core value ${id}...`);

    // Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Core value title is required'
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Core value description is required'
      });
    }

    // Check if core value exists
    const existingQuery = 'SELECT * FROM core_values WHERE id = ? AND is_active = 1';
    const existing = await executeQuery(existingQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Core value not found'
      });
    }

    // Check for duplicate titles (excluding current record)
    const duplicateQuery = 'SELECT id FROM core_values WHERE title = ? AND id != ? AND is_active = 1';
    const duplicateResult = await executeQuery(duplicateQuery, [title.trim(), id]);
    
    if (duplicateResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A core value with this title already exists'
      });
    }

    // Update core value
    const updateQuery = `
      UPDATE core_values SET 
        title = ?,
        description = ?,
        updated_at = NOW()
      WHERE id = ? AND is_active = 1
    `;

    await executeQuery(updateQuery, [title.trim(), description.trim(), id]);

    // Fetch updated core value
    const updatedCoreValue = await executeQuery(
      'SELECT * FROM core_values WHERE id = ?',
      [id]
    );

    console.log(`✅ Core value ${id} updated successfully`);

    res.json({
      success: true,
      data: updatedCoreValue[0],
      message: 'Core value updated successfully'
    });

  } catch (error) {
    console.error(`❌ Error updating core value ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update core value',
      error: error.message
    });
  }
});

// DELETE - Delete Core Value (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🎯 Deleting core value ${id}...`);

    // Check if core value exists
    const existingQuery = 'SELECT * FROM core_values WHERE id = ? AND is_active = 1';
    const existing = await executeQuery(existingQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Core value not found'
      });
    }

    // Soft delete by setting is_active to 0
    const deleteQuery = `
      UPDATE core_values SET 
        is_active = 0,
        updated_at = NOW()
      WHERE id = ?
    `;

    await executeQuery(deleteQuery, [id]);

    // Reorder remaining core values to fill the gap
    const reorderQuery = `
      SET @row_number = 0;
      UPDATE core_values 
      SET display_order = (@row_number := @row_number + 1)
      WHERE is_active = 1 
      ORDER BY display_order ASC, created_at ASC;
    `;

    // Execute reordering (split into two queries for MySQL compatibility)
    await executeQuery('SET @row_number = 0');
    await executeQuery(`
      UPDATE core_values 
      SET display_order = (@row_number := @row_number + 1)
      WHERE is_active = 1 
      ORDER BY display_order ASC, created_at ASC
    `);

    console.log(`✅ Core value ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Core value deleted successfully'
    });

  } catch (error) {
    console.error(`❌ Error deleting core value ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete core value',
      error: error.message
    });
  }
});

// PUT - Reorder Core Values
router.put('/reorder/update-order', async (req, res) => {
  try {
    console.log('🎯 Reordering core values...');
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'orderedIds array is required'
      });
    }

    // Validate that all IDs exist and are active
    const placeholders = orderedIds.map(() => '?').join(',');
    const validateQuery = `
      SELECT id FROM core_values 
      WHERE id IN (${placeholders}) AND is_active = 1
    `;
    
    const validIds = await executeQuery(validateQuery, orderedIds);
    
    if (validIds.length !== orderedIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some core value IDs are invalid or inactive'
      });
    }

    // Update display order for each core value
    for (let i = 0; i < orderedIds.length; i++) {
      const updateQuery = `
        UPDATE core_values 
        SET display_order = ?, updated_at = NOW() 
        WHERE id = ? AND is_active = 1
      `;
      await executeQuery(updateQuery, [i + 1, orderedIds[i]]);
    }

    console.log('✅ Core values reordered successfully');

    res.json({
      success: true,
      message: 'Core values reordered successfully'
    });

  } catch (error) {
    console.error('❌ Error reordering core values:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder core values',
      error: error.message
    });
  }
});

// Error handling middleware for core-values routes
router.use((error, req, res, next) => {
  console.error('🎯 CORE-VALUES ROUTE ERROR:', {
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