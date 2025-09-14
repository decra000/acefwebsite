const { executeQuery, pool } = require('../config/database');

const Pillar = {
  // Get all pillars with their focus areas
  getAll: async () => {
    try {
      console.log('MODEL - Fetching all pillars...');
      
      // Get all pillars first
      const pillarsQuery = 'SELECT id, name, description, created_at, updated_at FROM pillars ORDER BY name';
      const pillars = await executeQuery(pillarsQuery);
      
      console.log(`MODEL - Found ${pillars.length} pillars`);
      
      // Get focus areas for each pillar separately
      for (let pillar of pillars) {
        const focusAreasQuery = `
          SELECT c.id, c.name
          FROM categories c
          INNER JOIN pillar_focus_areas pfa ON c.id = pfa.category_id
          WHERE pfa.pillar_id = ?
          ORDER BY c.name
        `;
        
        const focusAreas = await executeQuery(focusAreasQuery, [pillar.id]);
        pillar.focus_areas = focusAreas || [];
        
        console.log(`MODEL - Pillar ${pillar.id} has ${focusAreas.length} focus areas`);
      }
      
      return pillars;
    } catch (error) {
      console.error('MODEL ERROR - getAll:', error);
      throw error;
    }
  },

  // Get single pillar by ID with focus areas
  getById: async (id) => {
    try {
      console.log(`MODEL - Fetching pillar ${id}...`);
      
      // Get the pillar first
      const pillarQuery = 'SELECT id, name, description, created_at, updated_at FROM pillars WHERE id = ?';
      const rows = await executeQuery(pillarQuery, [parseInt(id)]);
      
      if (rows.length === 0) {
        console.log(`MODEL - Pillar ${id} not found`);
        return null;
      }
      
      const pillar = rows[0];
      console.log(`MODEL - Found pillar: ${pillar.name}`);
      
      // Get its focus areas separately
      const focusAreasQuery = `
        SELECT c.id, c.name
        FROM categories c
        INNER JOIN pillar_focus_areas pfa ON c.id = pfa.category_id
        WHERE pfa.pillar_id = ?
        ORDER BY c.name
      `;
      
      const focusAreas = await executeQuery(focusAreasQuery, [parseInt(id)]);
      pillar.focus_areas = focusAreas || [];
      
      console.log(`MODEL - Pillar ${id} has ${focusAreas.length} focus areas`);
      return pillar;
    } catch (error) {
      console.error(`MODEL ERROR - getById(${id}):`, error);
      throw error;
    }
  },

  // Create new pillar with focus areas - FIXED TRANSACTION HANDLING
  create: async (name, description, focusAreaIds = []) => {
    // Get connection from pool for transaction handling
    const connection = await pool.getConnection();
    
    try {
      console.log('MODEL CREATE - Starting with params:', { name, description, focusAreaIds });
      
      // Start transaction
      await connection.beginTransaction();
      
      // Check if description column exists first
      let insertQuery, insertParams;
      try {
        // Try a test query to see if description column exists
        await connection.execute('SELECT description FROM pillars LIMIT 1');
        // If we get here, description column exists
        insertQuery = 'INSERT INTO pillars (name, description) VALUES (?, ?)';
        insertParams = [name, description || ''];
        console.log('MODEL CREATE - Using query with description column');
      } catch (columnError) {
        // Description column might not exist, insert only name
        console.log('MODEL CREATE - Description column not found, inserting name only');
        insertQuery = 'INSERT INTO pillars (name) VALUES (?)';
        insertParams = [name];
      }
      
      console.log('MODEL CREATE - Insert query:', insertQuery, insertParams);
      const [result] = await connection.execute(insertQuery, insertParams);
      
      const pillarId = result.insertId;
      console.log(`MODEL CREATE - Pillar created with ID: ${pillarId}`);
      
      // Insert focus area relationships individually
      if (focusAreaIds && focusAreaIds.length > 0) {
        const validIds = focusAreaIds
          .filter(id => id !== null && id !== undefined && id !== '')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));
        
        console.log('MODEL CREATE - Valid focus area IDs:', validIds);
        
        for (const categoryId of validIds) {
          await connection.execute(
            'INSERT INTO pillar_focus_areas (pillar_id, category_id) VALUES (?, ?)',
            [pillarId, categoryId]
          );
        }
        
        console.log(`MODEL CREATE - Inserted ${validIds.length} focus area relationships`);
      }
      
      // Commit transaction
      await connection.commit();
      
      console.log('MODEL CREATE - Transaction committed');
      return pillarId;
    } catch (error) {
      console.error('MODEL CREATE ERROR:', error);
      
      // Rollback transaction
      await connection.rollback();
      console.log('MODEL CREATE - Transaction rolled back');
      
      throw error;
    } finally {
      // Always release the connection
      connection.release();
    }
  },

  // Update pillar and its focus areas - FIXED TRANSACTION HANDLING
  update: async (id, name, description, focusAreaIds = []) => {
    // Get connection from pool for transaction handling
    const connection = await pool.getConnection();
    
    try {
      const pillarId = parseInt(id);
      if (isNaN(pillarId)) {
        throw new Error(`Invalid pillar ID: ${id}`);
      }
      
      console.log('MODEL UPDATE - Starting update:', { pillarId, name, description, focusAreaIds });
      
      // Start transaction
      await connection.beginTransaction();
      
      // Check what columns exist in the pillars table
      let hasDescriptionColumn = false;
      try {
        const [columns] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'pillars' 
          AND TABLE_SCHEMA = DATABASE()
        `);
        
        hasDescriptionColumn = columns.some(col => col.COLUMN_NAME === 'description');
        console.log('MODEL UPDATE - Has description column:', hasDescriptionColumn);
        console.log('MODEL UPDATE - Available columns:', columns.map(c => c.COLUMN_NAME));
      } catch (schemaError) {
        console.log('MODEL UPDATE - Could not check schema, trying fallback method');
        // Fallback: try to select description column
        try {
          await connection.execute('SELECT description FROM pillars WHERE id = ? LIMIT 1', [pillarId]);
          hasDescriptionColumn = true;
        } catch (fallbackError) {
          hasDescriptionColumn = false;
        }
      }
      
      // Build update query based on available columns
      let updateQuery, updateParams;
      if (hasDescriptionColumn) {
        updateQuery = 'UPDATE pillars SET name = ?, description = ? WHERE id = ?';
        updateParams = [name, description || '', pillarId];
        console.log('MODEL UPDATE - Updating with description');
      } else {
        updateQuery = 'UPDATE pillars SET name = ? WHERE id = ?';
        updateParams = [name, pillarId];
        console.log('MODEL UPDATE - Updating without description (column does not exist)');
      }
      
      console.log('MODEL UPDATE - Query:', updateQuery, updateParams);
      const [result] = await connection.execute(updateQuery, updateParams);
      
      if (result.affectedRows === 0) {
        throw new Error('Pillar not found or no changes made');
      }
      
      console.log('MODEL UPDATE - Basic info updated, affected rows:', result.affectedRows);
      
      // Delete existing focus area relationships
      const [deleteResult] = await connection.execute(
        'DELETE FROM pillar_focus_areas WHERE pillar_id = ?',
        [pillarId]
      );
      console.log('MODEL UPDATE - Deleted existing relationships:', deleteResult.affectedRows);
      
      // Insert new focus area relationships individually
      if (focusAreaIds && focusAreaIds.length > 0) {
        const validIds = focusAreaIds
          .filter(id => id !== null && id !== undefined && id !== '')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));
        
        console.log('MODEL UPDATE - Valid focus area IDs to insert:', validIds);
        
        for (const categoryId of validIds) {
          try {
            await connection.execute(
              'INSERT INTO pillar_focus_areas (pillar_id, category_id) VALUES (?, ?)',
              [pillarId, categoryId]
            );
            console.log(`MODEL UPDATE - Inserted relationship: ${pillarId} -> ${categoryId}`);
          } catch (insertError) {
            console.error(`MODEL UPDATE - Failed to insert relationship ${pillarId} -> ${categoryId}:`, insertError);
            throw insertError;
          }
        }
        
        console.log(`MODEL UPDATE - Inserted ${validIds.length} new relationships`);
      }
      
      // Commit transaction
      await connection.commit();
      
      console.log('MODEL UPDATE - Transaction committed successfully');
      return result.affectedRows;
    } catch (error) {
      console.error('MODEL UPDATE ERROR - Full details:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      
      // Rollback transaction
      await connection.rollback();
      console.log('MODEL UPDATE - Transaction rolled back');
      
      throw error;
    } finally {
      // Always release the connection
      connection.release();
    }
  },

  // Alternative simpler update method without transactions (if needed as fallback)
  updateSimple: async (id, name, description, focusAreaIds = []) => {
    try {
      const pillarId = parseInt(id);
      if (isNaN(pillarId)) {
        throw new Error(`Invalid pillar ID: ${id}`);
      }
      
      console.log('MODEL UPDATE SIMPLE - Starting update:', { pillarId, name, description, focusAreaIds });
      
      // Check if description column exists
      let hasDescriptionColumn = false;
      try {
        await executeQuery('SELECT description FROM pillars WHERE id = ? LIMIT 1', [pillarId]);
        hasDescriptionColumn = true;
      } catch (error) {
        hasDescriptionColumn = false;
      }
      
      // Update pillar basic info
      let updateQuery, updateParams;
      if (hasDescriptionColumn) {
        updateQuery = 'UPDATE pillars SET name = ?, description = ? WHERE id = ?';
        updateParams = [name, description || '', pillarId];
      } else {
        updateQuery = 'UPDATE pillars SET name = ? WHERE id = ?';
        updateParams = [name, pillarId];
      }
      
      console.log('MODEL UPDATE SIMPLE - Query:', updateQuery, updateParams);
      const result = await executeQuery(updateQuery, updateParams);
      
      if (result.affectedRows === 0) {
        throw new Error('Pillar not found or no changes made');
      }
      
      // Delete existing focus area relationships
      await executeQuery('DELETE FROM pillar_focus_areas WHERE pillar_id = ?', [pillarId]);
      
      // Insert new focus area relationships
      if (focusAreaIds && focusAreaIds.length > 0) {
        const validIds = focusAreaIds
          .filter(id => id !== null && id !== undefined && id !== '')
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));
        
        for (const categoryId of validIds) {
          await executeQuery(
            'INSERT INTO pillar_focus_areas (pillar_id, category_id) VALUES (?, ?)',
            [pillarId, categoryId]
          );
        }
      }
      
      console.log('MODEL UPDATE SIMPLE - Completed successfully');
      return result.affectedRows;
    } catch (error) {
      console.error('MODEL UPDATE SIMPLE ERROR:', error);
      throw error;
    }
  },

  // Delete pillar
  delete: async (id) => {
    try {
      const pillarId = parseInt(id);
      if (isNaN(pillarId)) {
        throw new Error(`Invalid pillar ID: ${id}`);
      }
      
      const result = await executeQuery('DELETE FROM pillars WHERE id = ?', [pillarId]);
      return result.affectedRows;
    } catch (error) {
      console.error('MODEL DELETE ERROR:', error);
      throw error;
    }
  },

  // Check if pillar name exists
  findByName: async (name) => {
    try {
      const rows = await executeQuery(
        'SELECT id, name FROM pillars WHERE LOWER(name) = LOWER(?) LIMIT 1', 
        [name]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('MODEL FIND_BY_NAME ERROR:', error);
      throw error;
    }
  },

  // Get focus areas for a specific pillar
  getFocusAreas: async (pillarId) => {
    try {
      const query = `
        SELECT c.id, c.name
        FROM categories c
        INNER JOIN pillar_focus_areas pfa ON c.id = pfa.category_id
        WHERE pfa.pillar_id = ?
        ORDER BY c.name
      `;
      return await executeQuery(query, [parseInt(pillarId)]);
    } catch (error) {
      console.error(`MODEL GET_FOCUS_AREAS ERROR for pillar ${pillarId}:`, error);
      throw error;
    }
  }
};

module.exports = Pillar;