// services/volunteerFormsService.js
const { executeQuery } = require('../config/database');

class VolunteerFormsService {
  // ✅ Get all volunteer forms
  async getAllForms() {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      ORDER BY c.name ASC
    `;
    return await executeQuery(query);
  }

  // ✅ Get form by country ID
  async getFormByCountryId(countryId) {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      WHERE vf.country_id = ?
    `;
    const results = await executeQuery(query, [countryId]);
    return results[0] || null;
  }

  // ✅ Get form by country name
  async getFormByCountryName(countryName) {
    const query = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      WHERE LOWER(c.name) = LOWER(?)
    `;
    const results = await executeQuery(query, [countryName]);
    return results[0] || null;
  }

  // ✅ Create new volunteer form
  async createForm(formData) {
    const { country_id, form_url, form_title, description, is_active = true } = formData;
    
    // Check if form already exists for this country
    const existing = await this.getFormByCountryId(country_id);
    if (existing) {
      throw new Error('Volunteer form already exists for this country');
    }

    const query = `
      INSERT INTO volunteer_forms (country_id, form_url, form_title, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [country_id, form_url, form_title, description, is_active]);
    return await this.getFormByCountryId(country_id);
  }

  // ✅ Update volunteer form
  async updateForm(id, formData) {
    const { country_id, form_url, form_title, description, is_active } = formData;
    
    const query = `
      UPDATE volunteer_forms 
      SET country_id = ?, form_url = ?, form_title = ?, description = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(query, [country_id, form_url, form_title, description, is_active, id]);
    return await this.getFormByCountryId(country_id);
  }

  // ✅ Delete volunteer form
  async deleteForm(id) {
    const query = `DELETE FROM volunteer_forms WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // ✅ Toggle form status (active/inactive)
  async toggleFormStatus(id) {
    const query = `
      UPDATE volunteer_forms 
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = ?
    `;
    await executeQuery(query, [id]);
    
    // Return updated form
    const getQuery = `
      SELECT vf.*, c.name as country_name 
      FROM volunteer_forms vf
      LEFT JOIN countries c ON vf.country_id = c.id
      WHERE vf.id = ?
    `;
    const results = await executeQuery(getQuery, [id]);
    return results[0] || null;
  }

  // ✅ Get all countries without volunteer forms
  async getCountriesWithoutForms() {
    const query = `
      SELECT c.* 
      FROM countries c
      LEFT JOIN volunteer_forms vf ON c.id = vf.country_id
      WHERE vf.id IS NULL
      ORDER BY c.name ASC
    `;
    return await executeQuery(query);
  }

  // ✅ Validate form URL
  validateFormUrl(url) {
    if (!url) return false;
    
    // Check for Google Forms URLs
    const googleFormsPattern = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]+\/viewform/;
    
    // Check for general HTTPS URLs
    const httpsPattern = /^https:\/\/.+/;
    
    return googleFormsPattern.test(url) || httpsPattern.test(url);
  }

  // ✅ Get form statistics
  async getFormStats() {
    const totalQuery = `SELECT COUNT(*) as total FROM volunteer_forms`;
    const activeQuery = `SELECT COUNT(*) as active FROM volunteer_forms WHERE is_active = true`;
    const countriesWithFormsQuery = `
      SELECT COUNT(DISTINCT country_id) as countries_with_forms 
      FROM volunteer_forms
    `;
    
    const [totalResult] = await executeQuery(totalQuery);
    const [activeResult] = await executeQuery(activeQuery);
    const [countriesResult] = await executeQuery(countriesWithFormsQuery);
    
    return {
      total_forms: totalResult.total,
      active_forms: activeResult.active,
      inactive_forms: totalResult.total - activeResult.active,
      countries_with_forms: countriesResult.countries_with_forms
    };
  }
}

module.exports = new VolunteerFormsService();