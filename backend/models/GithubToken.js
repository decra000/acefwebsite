// models/GithubToken.js
const { executeQuery } = require('../config/database');

class GithubToken {
  static async getAll() {
    try {
      const query = 'SELECT * FROM github_tokens ORDER BY created_at DESC';
      const results = await executeQuery(query);
      console.log('✅ GithubToken.getAll() - Retrieved tokens:', results.length);
      return results;
    } catch (error) {
      console.error('❌ GithubToken.getAll() error:', error);
      throw new Error(`Failed to fetch tokens: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const query = 'SELECT * FROM github_tokens WHERE id = ?';
      const results = await executeQuery(query, [id]);
      console.log(`✅ GithubToken.getById(${id}) - Found:`, results.length > 0);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`❌ GithubToken.getById(${id}) error:`, error);
      throw new Error(`Failed to fetch token by ID: ${error.message}`);
    }
  }

  static async getActiveToken() {
    try {
      const query = 'SELECT * FROM github_tokens WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1';
      const results = await executeQuery(query);
      console.log('✅ GithubToken.getActiveToken() - Found:', results.length > 0);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('❌ GithubToken.getActiveToken() error:', error);
      throw new Error(`Failed to fetch active token: ${error.message}`);
    }
  }

  static async findByToken(token) {
    try {
      const query = 'SELECT * FROM github_tokens WHERE token = ?';
      const results = await executeQuery(query, [token]);
      console.log(`✅ GithubToken.findByToken() - Found:`, results.length > 0);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('❌ GithubToken.findByToken() error:', error);
      throw new Error(`Failed to find token: ${error.message}`);
    }
  }

  static async create(tokenData) {
    try {
      const { token, description, is_active } = tokenData;
      
      if (!token) {
        throw new Error('Token is required');
      }

      // Check if token already exists
      const existingToken = await this.findByToken(token);
      if (existingToken) {
        throw new Error('Token already exists');
      }

      // If this token should be active, deactivate all others
      if (is_active) {
        await this.deactivateAll();
      }

      const query = `
        INSERT INTO github_tokens (token, description, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      
      const results = await executeQuery(query, [
        token, 
        description || '', 
        is_active ? 1 : 0
      ]);
      
      console.log('✅ GithubToken.create() - New token created with ID:', results.insertId);
      
      return await this.getById(results.insertId);
    } catch (error) {
      console.error('❌ GithubToken.create() error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Token already exists');
      }
      
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }

  static async update(id, tokenData) {
    try {
      const { token, description, is_active } = tokenData;
      
      if (!token) {
        throw new Error('Token is required');
      }

      const existingToken = await this.getById(id);
      if (!existingToken) {
        throw new Error('Token not found');
      }

      // Check if token already exists for another record
      const duplicateToken = await this.findByToken(token);
      if (duplicateToken && duplicateToken.id !== parseInt(id)) {
        throw new Error('Token already exists for another record');
      }

      // If this token should be active, deactivate all others
      if (is_active) {
        await this.deactivateAll();
      }

      const query = `
        UPDATE github_tokens 
        SET token = ?, description = ?, is_active = ?, updated_at = NOW() 
        WHERE id = ?
      `;
      
      const results = await executeQuery(query, [
        token, 
        description || '', 
        is_active ? 1 : 0, 
        id
      ]);
      
      console.log(`✅ GithubToken.update(${id}) - Rows affected:`, results.affectedRows);
      
      if (results.affectedRows === 0) {
        throw new Error('No token was updated');
      }
      
      return await this.getById(id);
    } catch (error) {
      console.error(`❌ GithubToken.update(${id}) error:`, error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Token already exists');
      }
      
      throw new Error(`Failed to update token: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const existingToken = await this.getById(id);
      if (!existingToken) {
        throw new Error('Token not found');
      }

      const query = 'DELETE FROM github_tokens WHERE id = ?';
      const results = await executeQuery(query, [id]);
      console.log(`✅ GithubToken.delete(${id}) - Rows affected:`, results.affectedRows);
      
      return results.affectedRows > 0;
    } catch (error) {
      console.error(`❌ GithubToken.delete(${id}) error:`, error);
      throw new Error(`Failed to delete token: ${error.message}`);
    }
  }

  static async deactivateAll() {
    try {
      const query = 'UPDATE github_tokens SET is_active = 0';
      const results = await executeQuery(query);
      console.log('✅ GithubToken.deactivateAll() - Deactivated:', results.affectedRows);
      return results.affectedRows;
    } catch (error) {
      console.error('❌ GithubToken.deactivateAll() error:', error);
      throw new Error(`Failed to deactivate tokens: ${error.message}`);
    }
  }

  static async setActive(id) {
    try {
      // Deactivate all first
      await this.deactivateAll();
      
      // Activate the specified one
      const query = 'UPDATE github_tokens SET is_active = 1, updated_at = NOW() WHERE id = ?';
      const results = await executeQuery(query, [id]);
      
      if (results.affectedRows === 0) {
        throw new Error('Token not found');
      }
      
      console.log(`✅ GithubToken.setActive(${id}) - Token activated`);
      return await this.getById(id);
    } catch (error) {
      console.error(`❌ GithubToken.setActive(${id}) error:`, error);
      throw new Error(`Failed to set active token: ${error.message}`);
    }
  }

  static async count() {
    try {
      const query = 'SELECT COUNT(*) as count FROM github_tokens';
      const results = await executeQuery(query);
      return results[0].count;
    } catch (error) {
      console.error('❌ GithubToken.count() error:', error);
      throw new Error(`Failed to count tokens: ${error.message}`);
    }
  }
}

module.exports = GithubToken;