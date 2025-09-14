const { executeQuery } = require('../config/database');

class Partner {
  // ✅ Get all partners (featured first, then by creation date)
  static async getAll() {
    return await executeQuery('SELECT * FROM partners ORDER BY featured DESC, created_at DESC');
  }

  // ✅ Create partner with featured support
  static async create({ name, logo, type, featured = 0 }) {
    const query = 'INSERT INTO partners (name, logo, type, featured) VALUES (?, ?, ?, ?)';
    const result = await executeQuery(query, [name, logo, type, featured]);
    return result.insertId;
  }

  // ✅ Get partner by ID
  static async getById(id) {
    const rows = await executeQuery('SELECT * FROM partners WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Add these methods to your Partner model

// ✅ Update partner details only (no logo)
static async updateDetails(id, data) {
  const { name, type, featured } = data;
  const query = 'UPDATE partners SET name = ?, type = ?, featured = ? WHERE id = ?';
  return await executeQuery(query, [name, type, featured, id]);
}

// ✅ Update logo only
static async updateLogo(id, logo) {
  const query = 'UPDATE partners SET logo = ? WHERE id = ?';
  return await executeQuery(query, [logo, id]);
}

  // ✅ Complete update (name, type, featured, and optionally logo)
  static async update(id, data) {
    const { name, logo, type, featured } = data;
    
    let query = 'UPDATE partners SET name = ?, type = ?, featured = ?';
    let params = [name, type, featured];
    
    // Only update logo if provided
    if (logo) {
      query += ', logo = ?';
      params.push(logo);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    return await executeQuery(query, params);
  }

  // ✅ Update partner type only
  static async updateType(id, type) {
    const query = 'UPDATE partners SET type = ? WHERE id = ?';
    return await executeQuery(query, [type, id]);
  }

  // ✅ Update featured status only
  static async updateFeatured(id, featured) {
    const query = 'UPDATE partners SET featured = ? WHERE id = ?';
    return await executeQuery(query, [featured, id]);
  }

  // ✅ Delete partner
  static async delete(id) {
    const query = 'DELETE FROM partners WHERE id = ?';
    return await executeQuery(query, [id]);
  }

  // ✅ Get featured partners only
  static async getFeatured() {
    return await executeQuery('SELECT * FROM partners WHERE featured = 1 ORDER BY created_at DESC');
  }

  // ✅ Get partners by type
  static async getByType(type) {
    return await executeQuery('SELECT * FROM partners WHERE type = ? ORDER BY featured DESC, created_at DESC', [type]);
  }
}

module.exports = Partner;