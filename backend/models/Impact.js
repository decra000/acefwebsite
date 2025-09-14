const { pool } = require('../config/database');
const db = pool; // This makes db.execute() work with your existing pool
class Impact {
  // Get all impacts with optional filtering
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          i.*,
          COALESCE(SUM(pi.contribution_value), 0) as project_contribution,
          COUNT(DISTINCT pi.project_id) as project_count
        FROM impacts i
        LEFT JOIN project_impacts pi ON i.id = pi.impact_id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.is_active !== undefined) {
        conditions.push('i.is_active = ?');
        params.push(filters.is_active);
      }
      
      if (filters.is_featured !== undefined) {
        conditions.push('i.is_featured = ?');
        params.push(filters.is_featured);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += `
        GROUP BY i.id
        ORDER BY i.order_index ASC, i.created_at DESC
      `;

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in Impact.getAll:', error);
      throw error;
    }
  }

  // Get impact by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          i.*,
          COALESCE(SUM(pi.contribution_value), 0) as project_contribution,
          COUNT(DISTINCT pi.project_id) as project_count
        FROM impacts i
        LEFT JOIN project_impacts pi ON i.id = pi.impact_id
        WHERE i.id = ?
        GROUP BY i.id
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Impact.getById:', error);
      throw error;
    }
  }

  // Create new impact
  static async create(impactData) {
    try {
      const {
        name,
        description,
        starting_value = 0,
        current_value,
        unit,
        icon,
        color,
        order_index = 0,
        is_active = true,
        is_featured = false
      } = impactData;

      // Set current_value to starting_value if not provided
      const finalCurrentValue = current_value !== undefined ? current_value : starting_value;

      const query = `
        INSERT INTO impacts (
          name, description, starting_value, current_value, unit, 
          icon, color, order_index, is_active, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        name, 
        description, 
        starting_value,
        finalCurrentValue,
        unit, 
        icon, 
        color, 
        order_index, 
        is_active,
        is_featured
      ];

      const [result] = await db.execute(query, params);
      
      // Return the created impact
      return this.getById(result.insertId);
    } catch (error) {
      console.error('Error in Impact.create:', error);
      throw error;
    }
  }

  // Update impact
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'name', 'description', 'starting_value', 'current_value', 'unit',
        'icon', 'color', 'order_index', 'is_active', 'is_featured'
      ];
      
      const updates = [];
      const params = [];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = ?`);
          params.push(updateData[field]);
        }
      });
      
      console.log('SQL updates array:', updates);
      console.log('SQL params array:', params);
      
      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      params.push(id);
      
      const query = `
        UPDATE impacts 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      console.log('Final SQL query:', query);
      console.log('Final params:', params);
      
      const [result] = await db.execute(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Return updated impact
      return this.getById(id);
    } catch (error) {
      console.error('Error in Impact.update:', error);
      throw error;
    }
  }

  // Delete impact
  static async delete(id) {
    try {
      // Check if impact is used in projects
      const [projectImpacts] = await db.execute(
        'SELECT COUNT(*) as count FROM project_impacts WHERE impact_id = ?',
        [id]
      );
      
      if (projectImpacts[0].count > 0) {
        throw new Error('Cannot delete impact that is used in projects. Remove from projects first.');
      }
      
      const [result] = await db.execute('DELETE FROM impacts WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Impact.delete:', error);
      throw error;
    }
  }

  // Get project impacts for a specific project
  static async getProjectImpacts(projectId) {
    try {
      const query = `
        SELECT 
          pi.*,
          i.name,
          i.description,
          i.unit,
          i.icon,
          i.color
        FROM project_impacts pi
        JOIN impacts i ON pi.impact_id = i.id
        WHERE pi.project_id = ?
        ORDER BY i.order_index ASC
      `;
      
      const [rows] = await db.execute(query, [projectId]);
      return rows;
    } catch (error) {
      console.error('Error in Impact.getProjectImpacts:', error);
      throw error;
    }
  }

  // Update project impacts
  static async updateProjectImpacts(projectId, impacts) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete existing impacts for this project
      await connection.execute(
        'DELETE FROM project_impacts WHERE project_id = ?',
        [projectId]
      );
      
      // Insert new impacts
      if (impacts.length > 0) {
        const query = `
          INSERT INTO project_impacts (project_id, impact_id, contribution_value)
          VALUES ${impacts.map(() => '(?, ?, ?)').join(', ')}
        `;
        
        const params = [];
        impacts.forEach(impact => {
          params.push(projectId, impact.impact_id, impact.contribution_value);
        });
        
        await connection.execute(query, params);
      }
      
      await connection.commit();
      
      // Return updated project impacts
      return this.getProjectImpacts(projectId);
    } catch (error) {
      await connection.rollback();
      console.error('Error in Impact.updateProjectImpacts:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get statistics summary
  static async getStatsSummary() {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total_impacts,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_impacts,
          COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_impacts,
          SUM(current_value) as total_impact_value,
          (SELECT COUNT(DISTINCT project_id) FROM project_impacts) as projects_with_impacts
        FROM impacts
      `);
      
      return stats[0];
    } catch (error) {
      console.error('Error in Impact.getStatsSummary:', error);
      throw error;
    }
  }

  // Recalculate all impact totals based on starting values and project contributions
  static async recalculateAllTotals() {
    try {
      const query = `
        UPDATE impacts i
        SET current_value = i.starting_value + COALESCE((
          SELECT SUM(pi.contribution_value)
          FROM project_impacts pi
          WHERE pi.impact_id = i.id
        ), 0)
      `;
      
      await db.execute(query);
      return true;
    } catch (error) {
      console.error('Error in Impact.recalculateAllTotals:', error);
      throw error;
    }
  }

  // Set starting value for an existing impact
  static async setStartingValue(id, startingValue) {
    try {
      const query = `
        UPDATE impacts 
        SET starting_value = ?,
            current_value = ? + COALESCE((
              SELECT SUM(pi.contribution_value)
              FROM project_impacts pi
              WHERE pi.impact_id = ?
            ), 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [startingValue, startingValue, id, id]);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return this.getById(id);
    } catch (error) {
      console.error('Error in Impact.setStartingValue:', error);
      throw error;
    }
  }

  // Get impact breakdown (starting value vs project contributions)
  static async getBreakdown(id) {
    try {
      const query = `
        SELECT 
          i.id,
          i.name,
          i.description,
          i.unit,
          i.starting_value,
          i.current_value,
          COALESCE(SUM(pi.contribution_value), 0) as project_contribution,
          COUNT(DISTINCT pi.project_id) as contributing_projects
        FROM impacts i
        LEFT JOIN project_impacts pi ON i.id = pi.impact_id
        WHERE i.id = ?
        GROUP BY i.id
      `;
      
      const [rows] = await db.execute(query, [id]);
      
      if (!rows[0]) {
        return null;
      }
      
      const impact = rows[0];
      
      // Get detailed project contributions
      const [projectDetails] = await db.execute(`
        SELECT 
          p.id,
          p.title,
          pi.contribution_value
        FROM project_impacts pi
        JOIN projects p ON pi.project_id = p.id
        WHERE pi.impact_id = ?
        ORDER BY pi.contribution_value DESC
      `, [id]);
      
      return {
        ...impact,
        project_details: projectDetails
      };
    } catch (error) {
      console.error('Error in Impact.getBreakdown:', error);
      throw error;
    }
  }

  // Initialize starting values for existing impacts (migration helper)
  static async initializeStartingValues() {
    try {
      // Set starting_value to current_value for impacts that don't have starting_value set
      const query = `
        UPDATE impacts 
        SET starting_value = current_value 
        WHERE starting_value = 0 OR starting_value IS NULL
      `;
      
      await db.execute(query);
      return true;
    } catch (error) {
      console.error('Error in Impact.initializeStartingValues:', error);
      throw error;
    }
  }

  // Get impacts with their growth over time
  static async getImpactGrowth(timeframe = '1 YEAR') {
    try {
      const query = `
        SELECT 
          i.id,
          i.name,
          i.starting_value,
          i.current_value,
          (i.current_value - i.starting_value) as growth,
          CASE 
            WHEN i.starting_value > 0 THEN 
              ROUND(((i.current_value - i.starting_value) / i.starting_value * 100), 2)
            ELSE 0 
          END as growth_percentage,
          COUNT(DISTINCT pi.project_id) as contributing_projects
        FROM impacts i
        LEFT JOIN project_impacts pi ON i.id = pi.impact_id
        LEFT JOIN projects p ON pi.project_id = p.id
        WHERE i.is_active = 1
          AND (p.created_at >= DATE_SUB(NOW(), INTERVAL ${timeframe}) OR p.created_at IS NULL)
        GROUP BY i.id
        ORDER BY growth DESC
      `;
      
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in Impact.getImpactGrowth:', error);
      throw error;
    }
  }
}

module.exports = Impact;