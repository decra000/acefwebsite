// models/videoSectionModel.js
const { executeQuery } = require('../config/database');

class VideoSectionModel {
  // Get all active video sections (public API)
  static async getAll() {
    const query = `
      SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
             vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
             c.name as country_name
      FROM video_sections vs 
      LEFT JOIN countries c ON vs.country_id = c.id
      WHERE vs.is_active = true 
      ORDER BY vs.is_featured DESC, vs.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Get all video sections including inactive (for admin)
  static async getAllForAdmin() {
    const query = `
      SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
             vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
             c.name as country_name
      FROM video_sections vs 
      LEFT JOIN countries c ON vs.country_id = c.id
      ORDER BY vs.is_featured DESC, vs.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Get video section by ID (public API - only active)
  static async getById(id) {
    const query = `
      SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
             vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
             c.name as country_name
      FROM video_sections vs 
      LEFT JOIN countries c ON vs.country_id = c.id
      WHERE vs.id = ? AND vs.is_active = true
    `;
    const result = await executeQuery(query, [id]);
    return result[0] || null;
  }

  // Get video section by ID for admin (includes inactive)
  static async getByIdForAdmin(id) {
    const query = `
      SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
             vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
             c.name as country_name
      FROM video_sections vs 
      LEFT JOIN countries c ON vs.country_id = c.id
      WHERE vs.id = ?
    `;
    const result = await executeQuery(query, [id]);
    return result[0] || null;
  }

  // Get video sections by country (public API)
  static async getByCountry(countryId) {
    let query, params;
    
    if (countryId === null || countryId === 'general') {
      // Get general videos (country_id is NULL)
      query = `
        SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
               vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
               c.name as country_name
        FROM video_sections vs 
        LEFT JOIN countries c ON vs.country_id = c.id
        WHERE vs.is_active = true AND vs.country_id IS NULL
        ORDER BY vs.is_featured DESC, vs.created_at DESC
      `;
      params = [];
    } else {
      // Get videos for specific country OR general videos
      query = `
        SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
               vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
               c.name as country_name
        FROM video_sections vs 
        LEFT JOIN countries c ON vs.country_id = c.id
        WHERE vs.is_active = true AND (vs.country_id = ? OR vs.country_id IS NULL)
        ORDER BY vs.is_featured DESC, vs.created_at DESC
      `;
      params = [countryId];
    }
    
    return await executeQuery(query, params);
  }

  // Get the featured video section
  static async getFeatured() {
    const query = `
      SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
             vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
             c.name as country_name
      FROM video_sections vs 
      LEFT JOIN countries c ON vs.country_id = c.id
      WHERE vs.is_active = true AND vs.is_featured = true
      ORDER BY vs.updated_at DESC 
      LIMIT 1
    `;
    const result = await executeQuery(query);
    return result[0] || null;
  }

  // Get the featured video section for a specific country
  static async getFeaturedByCountry(countryId) {
    let query, params;
    
    if (countryId === null || countryId === 'general') {
      // Get featured general videos (country_id is NULL)
      query = `
        SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
               vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
               c.name as country_name
        FROM video_sections vs 
        LEFT JOIN countries c ON vs.country_id = c.id
        WHERE vs.is_active = true AND vs.is_featured = true AND vs.country_id IS NULL
        ORDER BY vs.updated_at DESC 
        LIMIT 1
      `;
      params = [];
    } else {
      // Get featured videos for specific country OR general videos
      query = `
        SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
               vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
               c.name as country_name
        FROM video_sections vs 
        LEFT JOIN countries c ON vs.country_id = c.id
        WHERE vs.is_active = true AND vs.is_featured = true AND (vs.country_id = ? OR vs.country_id IS NULL)
        ORDER BY CASE WHEN vs.country_id = ? THEN 0 ELSE 1 END, vs.updated_at DESC
        LIMIT 1
      `;
      params = [countryId, countryId];
    }
    
    const result = await executeQuery(query, params);
    return result[0] || null;
  }

  // Get the most recent active video section
  static async getLatest() {
    const query = `
      SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
             vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
             c.name as country_name
      FROM video_sections vs 
      LEFT JOIN countries c ON vs.country_id = c.id
      WHERE vs.is_active = true 
      ORDER BY vs.created_at DESC 
      LIMIT 1
    `;
    const result = await executeQuery(query);
    return result[0] || null;
  }

  // Get the most recent active video section by country
  static async getLatestByCountry(countryId) {
    let query, params;
    
    if (countryId === null || countryId === 'general') {
      // Get latest general videos (country_id is NULL)
      query = `
        SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
               vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
               c.name as country_name
        FROM video_sections vs 
        LEFT JOIN countries c ON vs.country_id = c.id
        WHERE vs.is_active = true AND vs.country_id IS NULL
        ORDER BY vs.created_at DESC 
        LIMIT 1
      `;
      params = [];
    } else {
      // Get latest videos for specific country OR general videos
      query = `
        SELECT vs.id, vs.tag, vs.country_id, vs.title, vs.description, vs.youtube_url, 
               vs.is_active, vs.is_featured, vs.created_at, vs.updated_at,
               c.name as country_name
        FROM video_sections vs 
        LEFT JOIN countries c ON vs.country_id = c.id
        WHERE vs.is_active = true AND (vs.country_id = ? OR vs.country_id IS NULL)
        ORDER BY CASE WHEN vs.country_id = ? THEN 0 ELSE 1 END, vs.created_at DESC
        LIMIT 1
      `;
      params = [countryId, countryId];
    }
    
    const result = await executeQuery(query, params);
    return result[0] || null;
  }

  // Create new video section
  static async create(data) {
    const { tag, country_id, title, description, youtube_url, is_active = true, is_featured = false } = data;
    
    // If this video is being set as featured, unfeatured all others first
    if (is_featured) {
      await this.unfeatureAll();
    }
    
    const query = `
      INSERT INTO video_sections (tag, country_id, title, description, youtube_url, is_active, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [tag, country_id || null, title, description, youtube_url, is_active, is_featured]);
    
    // Return the full created record
    return this.getByIdForAdmin(result.insertId);
  }

  // Update video section
  static async update(id, data) {
    const { tag, country_id, title, description, youtube_url, is_active, is_featured } = data;
    
    // If this video is being set as featured, unfeatured all others first
    if (is_featured) {
      await this.unfeatureAll();
    }
    
    const query = `
      UPDATE video_sections 
      SET tag = ?, country_id = ?, title = ?, description = ?, youtube_url = ?, is_active = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await executeQuery(query, [tag, country_id || null, title, description, youtube_url, is_active, is_featured, id]);
    
    // Return the updated record using admin method to get all records
    return this.getByIdForAdmin(id);
  }

  // Set a video as featured (and unfeatured all others)
  static async setFeatured(id) {
    // First, unfeatured all videos
    await this.unfeatureAll();
    
    // Then set the specified video as featured
    const query = `
      UPDATE video_sections 
      SET is_featured = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await executeQuery(query, [id]);
    
    return this.getByIdForAdmin(id);
  }

  // Remove featured status from a video
  static async removeFeatured(id) {
    const query = `
      UPDATE video_sections 
      SET is_featured = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await executeQuery(query, [id]);
    
    return this.getByIdForAdmin(id);
  }

  // Unfeatured all videos (helper method)
  static async unfeatureAll() {
    const query = `
      UPDATE video_sections 
      SET is_featured = false, updated_at = CURRENT_TIMESTAMP
      WHERE is_featured = true
    `;
    return await executeQuery(query);
  }

  // Delete (soft delete by setting is_active to false)
  static async delete(id) {
    const query = `
      UPDATE video_sections 
      SET is_active = false, is_featured = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await executeQuery(query, [id]);
    return { id, deleted: true };
  }

  // Get all tag options
  static async getTagOptions() {
    const query = `
      SELECT id, tag_name, created_at
      FROM video_tag_options 
      WHERE is_active = true 
      ORDER BY tag_name ASC
    `;
    return await executeQuery(query);
  }

  // Add new tag option with duplicate check
  static async addTagOption(tagName) {
    try {
      // First check if it exists (case-insensitive)
      const existsQuery = `
        SELECT COUNT(*) as count 
        FROM video_tag_options 
        WHERE LOWER(tag_name) = LOWER(?) AND is_active = true
      `;
      const existsResult = await executeQuery(existsQuery, [tagName]);
      
      if (existsResult[0].count > 0) {
        throw new Error(`Tag option "${tagName}" already exists`);
      }

      const query = `
        INSERT INTO video_tag_options (tag_name)
        VALUES (?)
      `;
      const result = await executeQuery(query, [tagName]);
      return { 
        id: result.insertId, 
        tag_name: tagName, 
        is_active: true, 
        created_at: new Date() 
      };
    } catch (error) {
      // Handle duplicate entry error
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new Error(`Tag option "${tagName}" already exists`);
      }
      throw error;
    }
  }

  // Check if tag option exists
  static async tagOptionExists(tagName) {
    const query = `
      SELECT COUNT(*) as count 
      FROM video_tag_options 
      WHERE LOWER(tag_name) = LOWER(?) AND is_active = true
    `;
    const result = await executeQuery(query, [tagName]);
    return result[0].count > 0;
  }

  // Delete tag option (soft delete)
  static async deleteTagOption(id) {
    const query = `
      UPDATE video_tag_options 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await executeQuery(query, [id]);
    return { id, deleted: true };
  }

  // Validate country exists (if country_id is provided)
  // In videoSectionModel.js - Replace the validateCountry method with this:

// Validate country exists (if country_id is provided)
static async validateCountry(countryId) {
  if (!countryId) return true; // null/empty is valid (general)
  
  const query = `
    SELECT COUNT(*) as count 
    FROM countries 
    WHERE id = ?
  `;
  const result = await executeQuery(query, [countryId]);
  return result[0].count > 0;
}
}

module.exports = VideoSectionModel;