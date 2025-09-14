// models/WhatsappContact.js
const { executeQuery } = require('../config/database'); // Adjust path to your database.js

class WhatsappContact {
  static async getAll() {
    try {
      const query = 'SELECT * FROM whatsapp_contacts ORDER BY created_at DESC';
      const results = await executeQuery(query);
      console.log('✅ WhatsappContact.getAll() - Retrieved contacts:', results.length);
      return results;
    } catch (error) {
      console.error('❌ WhatsappContact.getAll() error:', error);
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const query = 'SELECT * FROM whatsapp_contacts WHERE id = ?';
      const results = await executeQuery(query, [id]);
      console.log(`✅ WhatsappContact.getById(${id}) - Found:`, results.length > 0);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`❌ WhatsappContact.getById(${id}) error:`, error);
      throw new Error(`Failed to fetch contact by ID: ${error.message}`);
    }
  }

  static async findByNumber(number) {
    try {
      const query = 'SELECT * FROM whatsapp_contacts WHERE number = ?';
      const results = await executeQuery(query, [number]);
      console.log(`✅ WhatsappContact.findByNumber(${number}) - Found:`, results.length > 0);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`❌ WhatsappContact.findByNumber(${number}) error:`, error);
      throw new Error(`Failed to find contact by number: ${error.message}`);
    }
  }

  static async create(contactData) {
    try {
      const { number, description } = contactData;
      
      // Validate input
      if (!number) {
        throw new Error('WhatsApp number is required');
      }

      // Check if number already exists
      const existingContact = await this.findByNumber(number);
      if (existingContact) {
        throw new Error('WhatsApp number already exists');
      }

      const query = `
        INSERT INTO whatsapp_contacts (number, description, created_at, updated_at) 
        VALUES (?, ?, NOW(), NOW())
      `;
      
      const results = await executeQuery(query, [number, description || '']);
      console.log('✅ WhatsappContact.create() - New contact created with ID:', results.insertId);
      
      // Return the created contact
      return await this.getById(results.insertId);
    } catch (error) {
      console.error('❌ WhatsappContact.create() error:', error);
      
      // Handle duplicate entry error
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('WhatsApp number already exists');
      }
      
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  static async update(id, contactData) {
    try {
      const { number, description } = contactData;
      
      // Validate input
      if (!number) {
        throw new Error('WhatsApp number is required');
      }

      // Check if contact exists
      const existingContact = await this.getById(id);
      if (!existingContact) {
        throw new Error('Contact not found');
      }

      // Check if number already exists for another contact
      const duplicateContact = await this.findByNumber(number);
      if (duplicateContact && duplicateContact.id !== parseInt(id)) {
        throw new Error('WhatsApp number already exists for another contact');
      }

      const query = `
        UPDATE whatsapp_contacts 
        SET number = ?, description = ?, updated_at = NOW() 
        WHERE id = ?
      `;
      
      const results = await executeQuery(query, [number, description || '', id]);
      console.log(`✅ WhatsappContact.update(${id}) - Rows affected:`, results.affectedRows);
      
      if (results.affectedRows === 0) {
        throw new Error('No contact was updated');
      }
      
      // Return the updated contact
      return await this.getById(id);
    } catch (error) {
      console.error(`❌ WhatsappContact.update(${id}) error:`, error);
      
      // Handle duplicate entry error
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('WhatsApp number already exists');
      }
      
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Check if contact exists first
      const existingContact = await this.getById(id);
      if (!existingContact) {
        throw new Error('Contact not found');
      }

      const query = 'DELETE FROM whatsapp_contacts WHERE id = ?';
      const results = await executeQuery(query, [id]);
      console.log(`✅ WhatsappContact.delete(${id}) - Rows affected:`, results.affectedRows);
      
      return results.affectedRows > 0;
    } catch (error) {
      console.error(`❌ WhatsappContact.delete(${id}) error:`, error);
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  // Additional utility methods
  static async count() {
    try {
      const query = 'SELECT COUNT(*) as count FROM whatsapp_contacts';
      const results = await executeQuery(query);
      return results[0].count;
    } catch (error) {
      console.error('❌ WhatsappContact.count() error:', error);
      throw new Error(`Failed to count contacts: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const searchPattern = `%${searchTerm}%`;
      const query = `
        SELECT * FROM whatsapp_contacts 
        WHERE number LIKE ? OR description LIKE ? 
        ORDER BY created_at DESC
      `;
      const results = await executeQuery(query, [searchPattern, searchPattern]);
      console.log(`✅ WhatsappContact.search('${searchTerm}') - Found:`, results.length);
      return results;
    } catch (error) {
      console.error(`❌ WhatsappContact.search('${searchTerm}') error:`, error);
      throw new Error(`Failed to search contacts: ${error.message}`);
    }
  }

  // Test method to verify database connection and table
  static async testConnection() {
    try {
      const query = 'SELECT COUNT(*) as count FROM whatsapp_contacts';
      const results = await executeQuery(query);
      console.log('✅ WhatsappContact.testConnection() - Table accessible, count:', results[0].count);
      return {
        status: 'success',
        message: 'Database and table accessible',
        contactCount: results[0].count
      };
    } catch (error) {
      console.error('❌ WhatsappContact.testConnection() error:', error);
      return {
        status: 'error',
        message: error.message,
        error: error.code
      };
    }
  }
}

module.exports = WhatsappContact;