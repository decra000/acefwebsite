// models/VolunteerForm.js
const { executeQuery } = require('../config/database');

class VolunteerForm {
  constructor(data = {}) {
    this.id = data.id || null;
    this.country_id = data.country_id || null;
    this.form_url = data.form_url || '';
    this.form_title = data.form_title || '';
    this.description = data.description || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
    this.country_name = data.country_name || null; // From JOIN with countries table
  }

  // Static method to create table if not exists
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS volunteer_forms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country_id INT NOT NULL,
        form_url TEXT NOT NULL,
        form_title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Foreign key constraint
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
        
        -- Unique constraint - one form per country
        UNIQUE KEY unique_country_form (country_id),
        
        -- Indexes for better performance
        INDEX idx_country_id (country_id),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at)
      );
    `;
    
    try {
      await executeQuery(query);
      console.log('✅ VolunteerForm table ready');
      return true;
    } catch (error) {
      console.error('❌ Error creating volunteer_forms table:', error);
      throw error;
    }
  }

  // Static method to find all forms
  static async findAll() {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      ORDER BY c.name ASC
    `;
    const results = await executeQuery(query);
    return results.map(row => new VolunteerForm(row));
  }

  // Static method to find by ID
  static async findById(id) {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      WHERE vf.id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results.length > 0 ? new VolunteerForm(results[0]) : null;
  }

  // Static method to find by country ID
  static async findByCountryId(countryId) {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      WHERE vf.country_id = ?
    `;
    const results = await executeQuery(query, [countryId]);
    return results.length > 0 ? new VolunteerForm(results[0]) : null;
  }

  // Static method to find by country name
  static async findByCountryName(countryName) {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      WHERE LOWER(c.name) = LOWER(?) AND vf.is_active = TRUE
    `;
    const results = await executeQuery(query, [countryName]);
    return results.length > 0 ? new VolunteerForm(results[0]) : null;
  }

  // Static method to find active forms
  static async findActive() {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      WHERE vf.is_active = TRUE
      ORDER BY c.name ASC
    `;
    const results = await executeQuery(query);
    return results.map(row => new VolunteerForm(row));
  }

  // Static method to get countries without forms
  static async getCountriesWithoutForms() {
    const query = `
      SELECT c.id, c.name 
      FROM countries c
      LEFT JOIN volunteer_forms vf ON c.id = vf.country_id
      WHERE vf.id IS NULL
      ORDER BY c.name ASC
    `;
    return await executeQuery(query);
  }

  // Static method to get statistics
  static async getStats() {
    const queries = {
      total: `SELECT COUNT(*) as count FROM volunteer_forms`,
      active: `SELECT COUNT(*) as count FROM volunteer_forms WHERE is_active = TRUE`,
      inactive: `SELECT COUNT(*) as count FROM volunteer_forms WHERE is_active = FALSE`,
      countriesWithForms: `SELECT COUNT(DISTINCT country_id) as count FROM volunteer_forms`,
      recentForms: `SELECT COUNT(*) as count FROM volunteer_forms WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)`
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await executeQuery(query);
      results[key] = result[0].count;
    }

    return {
      total_forms: results.total,
      active_forms: results.active,
      inactive_forms: results.inactive,
      countries_with_forms: results.countriesWithForms,
      recent_forms: results.recentForms
    };
  }

  // Instance method to save (create or update)
  async save() {
    if (this.id) {
      return await this.update();
    } else {
      return await this.create();
    }
  }

  // Instance method to create new record
  async create() {
    // Check if country already has a form
    const existing = await VolunteerForm.findByCountryId(this.country_id);
    if (existing) {
      throw new Error('Volunteer form already exists for this country');
    }

    const query = `
      INSERT INTO volunteer_forms (country_id, form_url, form_title, description, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      this.country_id,
      this.form_url,
      this.form_title,
      this.description,
      this.is_active
    ]);

    this.id = result.insertId;
    
    // Get the complete record with country name
    const savedForm = await VolunteerForm.findById(this.id);
    Object.assign(this, savedForm);
    
    return this;
  }

  // Instance method to update existing record
  async update() {
    if (!this.id) {
      throw new Error('Cannot update form without ID');
    }

    // Check if trying to change to a country that already has a form
    const existing = await VolunteerForm.findByCountryId(this.country_id);
    if (existing && existing.id !== this.id) {
      throw new Error('A volunteer form already exists for this country');
    }

    const query = `
      UPDATE volunteer_forms 
      SET country_id = ?, form_url = ?, form_title = ?, description = ?, is_active = ?
      WHERE id = ?
    `;
    
    await executeQuery(query, [
      this.country_id,
      this.form_url,
      this.form_title,
      this.description,
      this.is_active,
      this.id
    ]);

    // Get the updated record with country name
    const updatedForm = await VolunteerForm.findById(this.id);
    Object.assign(this, updatedForm);
    
    return this;
  }

  // Instance method to delete
  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete form without ID');
    }

    const query = `DELETE FROM volunteer_forms WHERE id = ?`;
    const result = await executeQuery(query, [this.id]);
    return result.affectedRows > 0;
  }

  // Instance method to toggle status
  async toggleStatus() {
    if (!this.id) {
      throw new Error('Cannot toggle status without ID');
    }

    this.is_active = !this.is_active;
    return await this.update();
  }

  // Static method to validate form URL
  static validateFormUrl(url) {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      
      // Check for Google Forms URLs
      const googleFormsPattern = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]+\/viewform/;
      
      // Allow any HTTPS URL
      const httpsPattern = /^https:\/\/.+/;
      
      return googleFormsPattern.test(url) || httpsPattern.test(url);
    } catch (error) {
      return false;
    }
  }

  // Instance method to validate this form
  validate() {
    const errors = [];

    if (!this.country_id) {
      errors.push('Country ID is required');
    }

    if (!this.form_url) {
      errors.push('Form URL is required');
    } else if (!VolunteerForm.validateFormUrl(this.form_url)) {
      errors.push('Invalid form URL. Please provide a valid HTTPS URL');
    }

    if (!this.form_title || this.form_title.trim().length === 0) {
      errors.push('Form title is required');
    }

    if (this.form_title && this.form_title.length > 255) {
      errors.push('Form title must be 255 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Instance method to convert to JSON
  toJSON() {
    return {
      id: this.id,
      country_id: this.country_id,
      country_name: this.country_name,
      form_url: this.form_url,
      form_title: this.form_title,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = VolunteerForm;