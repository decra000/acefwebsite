const { executeQuery } = require('../config/database');

class GeneralTestimonial {
  // Get all testimonials (featured first, then by creation date)
  static async getAll() {
    return await executeQuery('SELECT * FROM general_testimonials ORDER BY featured DESC, created_at DESC');
  }

  // Create testimonial with featured support
  static async create({ first_name, last_name, testimonial, image, type, featured = 0 }) {
    const query = 'INSERT INTO general_testimonials (first_name, last_name, testimonial, image, type, featured) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await executeQuery(query, [first_name, last_name, testimonial, image, type, featured]);
    return result.insertId;
  }

  // Get testimonial by ID
  static async getById(id) {
    const rows = await executeQuery('SELECT * FROM general_testimonials WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Complete update (all fields including optional image)
  static async update(id, data) {
    const { first_name, last_name, testimonial, image, type, featured } = data;
    
    let query = 'UPDATE general_testimonials SET first_name = ?, last_name = ?, testimonial = ?, type = ?, featured = ?';
    let params = [first_name, last_name, testimonial, type, featured];
    
    // Only update image if provided
    if (image) {
      query += ', image = ?';
      params.push(image);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    return await executeQuery(query, params);
  }

  // Update testimonial type only
  static async updateType(id, type) {
    const query = 'UPDATE general_testimonials SET type = ? WHERE id = ?';
    return await executeQuery(query, [type, id]);
  }

  // Update featured status only
  static async updateFeatured(id, featured) {
    const query = 'UPDATE general_testimonials SET featured = ? WHERE id = ?';
    return await executeQuery(query, [featured, id]);
  }

  // Delete testimonial
  static async delete(id) {
    const query = 'DELETE FROM general_testimonials WHERE id = ?';
    return await executeQuery(query, [id]);
  }

  // Get featured testimonials only
  static async getFeatured() {
    return await executeQuery('SELECT * FROM general_testimonials WHERE featured = 1 ORDER BY created_at DESC');
  }

  // Get testimonials by type
  static async getByType(type) {
    return await executeQuery('SELECT * FROM general_testimonials WHERE type = ? ORDER BY featured DESC, created_at DESC', [type]);
  }

  // Get testimonials by type with limit (for public display)
  static async getByTypeWithLimit(type, limit = 6) {
    return await executeQuery('SELECT * FROM general_testimonials WHERE type = ? ORDER BY featured DESC, created_at DESC LIMIT ?', [type, limit]);
  }

  // Get all public testimonials (for homepage/public display)
  static async getPublic(limit = null) {
    let query = 'SELECT * FROM general_testimonials ORDER BY featured DESC, created_at DESC';
    if (limit) {
      query += ' LIMIT ?';
      return await executeQuery(query, [limit]);
    }
    return await executeQuery(query);
  }
}

module.exports = GeneralTestimonial;