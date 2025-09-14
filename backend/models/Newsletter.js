const { executeQuery } = require('../config/database');
const crypto = require('crypto');

class Newsletter {
  static async subscribe(email) {
    try {
      // Generate unsubscribe token
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');
      
      const query = `
        INSERT INTO newsletter_subscribers (email, unsubscribe_token) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE 
          is_active = TRUE,
          subscribed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const result = await executeQuery(query, [email, unsubscribeToken]);
      
      // Get the subscriber data
      const subscriber = await this.getByEmail(email);
      return subscriber;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        // Email already exists and is active
        const existing = await this.getByEmail(email);
        if (existing && existing.is_active) {
          throw new Error('Email is already subscribed');
        }
      }
      throw error;
    }
  }

  static async unsubscribe(token) {
    const query = `
      UPDATE newsletter_subscribers 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE unsubscribe_token = ? AND is_active = TRUE
    `;
    
    const result = await executeQuery(query, [token]);
    return result.affectedRows > 0;
  }

  static async getByEmail(email) {
    const query = `
      SELECT * FROM newsletter_subscribers 
      WHERE email = ? LIMIT 1
    `;
    
    const results = await executeQuery(query, [email]);
    return results[0] || null;
  }

  static async getByToken(token) {
    const query = `
      SELECT * FROM newsletter_subscribers 
      WHERE unsubscribe_token = ? LIMIT 1
    `;
    
    const results = await executeQuery(query, [token]);
    return results[0] || null;
  }

  static async getAllActive() {
    const query = `
      SELECT email, subscribed_at, unsubscribe_token 
      FROM newsletter_subscribers 
      WHERE is_active = TRUE 
      ORDER BY subscribed_at DESC
    `;
    
    return await executeQuery(query);
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_subscribers,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_subscribers,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as unsubscribed,
        COUNT(CASE WHEN DATE(subscribed_at) = CURDATE() THEN 1 END) as today_subscriptions
      FROM newsletter_subscribers
    `;
    
    const results = await executeQuery(query);
    return results[0];
  }

  static async deleteByEmail(email) {
    const query = `DELETE FROM newsletter_subscribers WHERE email = ?`;
    const result = await executeQuery(query, [email]);
    return result.affectedRows > 0;
  }

  // NEW: Save newsletter message
  static async saveMessage({ subject, message, messageType, totalRecipients }) {
    const query = `
      INSERT INTO newsletter_messages (subject, message, message_type, total_recipients, sent_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const result = await executeQuery(query, [subject, message, messageType, totalRecipients]);
    return result.insertId;
  }

  // NEW: Update message sending statistics
  static async updateMessageStats(messageId, successfulSends, failedSends) {
    const query = `
      UPDATE newsletter_messages 
      SET successful_sends = ?, failed_sends = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(query, [successfulSends, failedSends, messageId]);
  }

  // NEW: Get message history
  static async getMessages(limit = 10, offset = 0) {
    const query = `
      SELECT id, subject, message_type, total_recipients, successful_sends, 
             failed_sends, sent_at, created_at
      FROM newsletter_messages 
      ORDER BY sent_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    return await executeQuery(query, [limit, offset]);
  }

  // NEW: Get total message count
  static async getMessageCount() {
    const query = `SELECT COUNT(*) as count FROM newsletter_messages`;
    const result = await executeQuery(query);
    return result[0].count;
  }

  // NEW: Get message details by ID
  static async getMessageById(messageId) {
    const query = `
      SELECT * FROM newsletter_messages 
      WHERE id = ? LIMIT 1
    `;
    
    const results = await executeQuery(query, [messageId]);
    return results[0] || null;
  }
}

module.exports = Newsletter;