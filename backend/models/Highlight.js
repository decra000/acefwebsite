// models/Highlight.js
const { pool } = require('../config/database'); // Import pool from your database config

class Highlight {
  // Get all highlights grouped by year
  static async getAllByYear() {
    const query = `
      SELECT id, year, title, description, image_url, display_order, created_at, updated_at
      FROM highlights 
      ORDER BY year DESC, display_order ASC
    `;
    
    try {
      const [rows] = await pool.execute(query);
      
      // Group by year
      const groupedByYear = {};
      rows.forEach(highlight => {
        if (!groupedByYear[highlight.year]) {
          groupedByYear[highlight.year] = [];
        }
        groupedByYear[highlight.year].push(highlight);
      });
      
      return groupedByYear;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Get highlights for a specific year
  static async getByYear(year) {
    const query = `
      SELECT id, year, title, description, image_url, display_order, created_at, updated_at
      FROM highlights 
      WHERE year = ?
      ORDER BY display_order ASC
    `;
    
    try {
      const [rows] = await pool.execute(query, [year]);
      return rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Get all distinct years
  static async getAvailableYears() {
    const query = `
      SELECT DISTINCT year 
      FROM highlights 
      ORDER BY year DESC
    `;
    
    try {
      const [rows] = await pool.execute(query);
      return rows.map(row => row.year);
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Get valid years (current year and previous years)
  static getValidYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate years from 2020 to current year
    for (let year = 2020; year <= currentYear; year++) {
      years.push(year);
    }
    
    return years.reverse(); // Most recent first
  }

  // Create new highlight
  static async create(highlightData) {
    const { year, title, description, image_url, display_order } = highlightData;
    
    // Validate year
    const validYears = this.getValidYears();
    if (!validYears.includes(parseInt(year))) {
      throw new Error(`Invalid year. Year must be between 2020 and ${new Date().getFullYear()}`);
    }

    const query = `
      INSERT INTO highlights (year, title, description, image_url, display_order)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await pool.execute(query, [
        year, title, description || null, image_url || null, display_order || 0
      ]);
      
      return { 
        id: result.insertId, 
        year, 
        title, 
        description, 
        image_url, 
        display_order: display_order || 0 
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Update highlight
  static async update(id, highlightData) {
    const { year, title, description, image_url, display_order } = highlightData;
    
    // Validate year if being updated
    if (year) {
      const validYears = this.getValidYears();
      if (!validYears.includes(parseInt(year))) {
        throw new Error(`Invalid year. Year must be between 2020 and ${new Date().getFullYear()}`);
      }
    }

    const query = `
      UPDATE highlights 
      SET year = COALESCE(?, year),
          title = COALESCE(?, title),
          description = ?,
          image_url = ?,
          display_order = COALESCE(?, display_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    try {
      const [result] = await pool.execute(query, [
        year || null, title || null, description, image_url, display_order || null, id
      ]);
      
      if (result.affectedRows === 0) {
        throw new Error('Highlight not found');
      }
      
      return await this.getById(id);
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Delete highlight
  static async delete(id) {
    const query = `DELETE FROM highlights WHERE id = ?`;
    
    try {
      const [result] = await pool.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Highlight not found');
      }
      
      return { message: 'Highlight deleted successfully' };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Get highlight by ID
  static async getById(id) {
    const query = `
      SELECT id, year, title, description, image_url, display_order, created_at, updated_at
      FROM highlights 
      WHERE id = ?
    `;
    
    try {
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        throw new Error('Highlight not found');
      }
      
      return rows[0];
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Update display orders for highlights in a specific year
  static async updateDisplayOrders(year, highlightOrders) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const { id, display_order } of highlightOrders) {
        await connection.execute(
          'UPDATE highlights SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND year = ?',
          [display_order, id, year]
        );
      }
      
      await connection.commit();
      return { message: 'Display orders updated successfully' };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Database error: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Get next display order for a year
  static async getNextDisplayOrder(year) {
    const query = `
      SELECT COALESCE(MAX(display_order), 0) + 1 as next_order
      FROM highlights 
      WHERE year = ?
    `;
    
    try {
      const [rows] = await pool.execute(query, [year]);
      return rows[0].next_order;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

module.exports = Highlight;