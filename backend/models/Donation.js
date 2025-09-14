// models/Donation.js
const { executeQuery } = require('../config/database');
const crypto = require('crypto');

class Donation {
  constructor(data = {}) {
    this.id = data.id || null;
    this.donationType = data.donationType || data.donation_type || 'general';
    this.targetCountryId = data.targetCountryId || data.country_id || null;
    this.targetProjectId = data.targetProjectId || data.project_id || null;
    this.amount = parseFloat(data.amount) || 0;
    this.currency = data.currency || 'USD';
    this.donorName = data.donorName || data.donor_name || '';
    this.donorEmail = data.donorEmail || data.donor_email || '';
    this.donorPhone = data.donorPhone || data.donor_phone || null;
    this.donorCountry = data.donorCountry || data.donor_country || '';
    this.isAnonymous = Boolean(data.isAnonymous || data.is_anonymous);
    this.paymentMethod = data.paymentMethod || data.payment_method || 'card';
    this.status = data.status || 'pending';
    this.paymentStatus = data.paymentStatus || data.payment_status || 'pending';
    this.receiptSent = Boolean(data.receiptSent || data.receipt_sent);
    this.thankYouSent = Boolean(data.thankYouSent || data.thank_you_sent);
    this.adminNotes = data.adminNotes || data.admin_notes || null;
    this.processedBy = data.processedBy || data.processed_by || null;
    this.createdAt = data.createdAt || data.created_at || null;
    this.completedAt = data.completedAt || data.completed_at || null;
  }

  // Save donation to database
  async save() {
    try {
      if (this.id) {
        // Update existing donation
        return await this.update();
      } else {
        // Create new donation
        const query = `
          INSERT INTO donations (
            donation_type, country_id, project_id, amount, currency,
            donor_name, donor_email, donor_phone, donor_country,
            is_anonymous, payment_method, status, payment_status,
            receipt_sent, thank_you_sent, admin_notes, processed_by,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const params = [
          this.donationType,
          this.targetCountryId,
          this.targetProjectId,
          this.amount,
          this.currency,
          this.donorName,
          this.donorEmail,
          this.donorPhone,
          this.donorCountry,
          this.isAnonymous,
          this.paymentMethod,
          this.status,
          this.paymentStatus,
          this.receiptSent,
          this.thankYouSent,
          this.adminNotes,
          this.processedBy
        ];

        const result = await executeQuery(query, params);
        this.id = result.insertId;

        // Add to donor wall if not anonymous
        if (!this.isAnonymous && this.status === 'completed') {
          await this.addToDonorWall();
        }

        // Update anonymous counter if anonymous
        if (this.isAnonymous) {
          await this.updateAnonymousCounter();
        }

        return { id: this.id, ...result };
      }
    } catch (error) {
      console.error('Error saving donation:', error);
      throw error;
    }
  }

  // Update existing donation
  async update() {
    try {
      const query = `
        UPDATE donations SET
          donation_type = ?, country_id = ?, project_id = ?, amount = ?,
          donor_name = ?, donor_email = ?, donor_phone = ?, donor_country = ?,
          is_anonymous = ?, payment_method = ?, status = ?, payment_status = ?,
          receipt_sent = ?, thank_you_sent = ?, admin_notes = ?, processed_by = ?
        WHERE id = ?
      `;

      const params = [
        this.donationType, this.targetCountryId, this.targetProjectId, this.amount,
        this.donorName, this.donorEmail, this.donorPhone, this.donorCountry,
        this.isAnonymous, this.paymentMethod, this.status, this.paymentStatus,
        this.receiptSent, this.thankYouSent, this.adminNotes, this.processedBy,
        this.id
      ];

      const result = await executeQuery(query, params);
      return result;
    } catch (error) {
      console.error('Error updating donation:', error);
      throw error;
    }
  }

  // Update donation status
  async updateStatus(newStatus, processedBy = null, adminNotes = null) {
    try {
      this.status = newStatus;
      this.processedBy = processedBy;
      if (adminNotes) this.adminNotes = adminNotes;

      if (newStatus === 'completed') {
        this.paymentStatus = 'completed';
        this.completedAt = new Date();

        const query = `
          UPDATE donations SET
            status = ?, payment_status = ?, completed_at = NOW(),
            processed_by = ?, admin_notes = ?
          WHERE id = ?
        `;
        
        await executeQuery(query, [
          this.status, this.paymentStatus, this.processedBy, this.adminNotes, this.id
        ]);

        // Add to donor wall if not anonymous
        if (!this.isAnonymous) {
          await this.addToDonorWall();
        } else {
          await this.updateAnonymousCounter();
        }
      } else {
        await this.update();
      }

      return true;
    } catch (error) {
      console.error('Error updating donation status:', error);
      throw error;
    }
  }

  // Add donation to donor wall
  async addToDonorWall() {
    try {
      if (this.isAnonymous) return;

      const query = `
        INSERT INTO donor_wall (
          donation_id, donor_name, donation_amount, donation_date, is_featured
        ) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          donation_amount = VALUES(donation_amount),
          donation_date = VALUES(donation_date)
      `;

      const isFeatured = this.amount >= 500; // Feature donations $500+
      
      await executeQuery(query, [
        this.id,
        this.donorName,
        this.amount,
        this.completedAt || new Date(),
        isFeatured
      ]);

    } catch (error) {
      console.error('Error adding to donor wall:', error);
      throw error;
    }
  }

  // Update anonymous donations counter
  async updateAnonymousCounter() {
    try {
      const query = `
        INSERT INTO anonymous_donations_counter (total_count, total_amount)
        VALUES (1, ?)
        ON DUPLICATE KEY UPDATE
          total_count = total_count + 1,
          total_amount = total_amount + VALUES(total_amount)
      `;

      await executeQuery(query, [this.amount]);
    } catch (error) {
      console.error('Error updating anonymous counter:', error);
      throw error;
    }
  }

  // Mark receipt as sent
  async markReceiptSent() {
    try {
      this.receiptSent = true;
      const query = 'UPDATE donations SET receipt_sent = TRUE WHERE id = ?';
      await executeQuery(query, [this.id]);
    } catch (error) {
      console.error('Error marking receipt as sent:', error);
      throw error;
    }
  }

  // Mark thank you as sent
  async markThankYouSent() {
    try {
      this.thankYouSent = true;
      const query = 'UPDATE donations SET thank_you_sent = TRUE WHERE id = ?';
      await executeQuery(query, [this.id]);
    } catch (error) {
      console.error('Error marking thank you as sent:', error);
      throw error;
    }
  }

  // STATIC METHODS

  // Find donation by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM donations WHERE id = ?';
      const results = await executeQuery(query, [id]);
      
      if (results.length === 0) {
        return null;
      }

      return new Donation(results[0]);
    } catch (error) {
      console.error('Error finding donation by ID:', error);
      throw error;
    }
  }

  // Find all donations with filters
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM donations WHERE 1=1';
      const params = [];

      // Apply filters
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.paymentStatus) {
        query += ' AND payment_status = ?';
        params.push(filters.paymentStatus);
      }

      if (filters.donationType) {
        query += ' AND donation_type = ?';
        params.push(filters.donationType);
      }

      if (filters.isAnonymous !== undefined) {
        query += ' AND is_anonymous = ?';
        params.push(filters.isAnonymous);
      }

      if (filters.minAmount) {
        query += ' AND amount >= ?';
        params.push(filters.minAmount);
      }

      if (filters.maxAmount) {
        query += ' AND amount <= ?';
        params.push(filters.maxAmount);
      }

      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }

      const results = await executeQuery(query, params);
      return results.map(row => new Donation(row));
    } catch (error) {
      console.error('Error finding donations:', error);
      throw error;
    }
  }

  // Get pending donations
  static async getPendingDonations() {
    try {
      const query = `
        SELECT * FROM donations 
        WHERE status = 'pending' OR payment_status = 'pending'
        ORDER BY created_at DESC
      `;
      
      const results = await executeQuery(query);
      return results.map(row => new Donation(row));
    } catch (error) {
      console.error('Error getting pending donations:', error);
      throw error;
    }
  }

  // Get completed donations
  static async getCompletedDonations(limit = 50) {
    try {
      const query = `
        SELECT * FROM donations 
        WHERE status = 'completed' AND payment_status = 'completed'
        ORDER BY completed_at DESC
        LIMIT ?
      `;
      
      const results = await executeQuery(query, [limit]);
      return results.map(row => new Donation(row));
    } catch (error) {
      console.error('Error getting completed donations:', error);
      throw error;
    }
  }

  // Search donations by donor information
  static async searchDonors(searchTerm) {
    try {
      const query = `
        SELECT * FROM donations 
        WHERE (donor_name LIKE ? OR donor_email LIKE ? OR id LIKE ?)
        AND is_anonymous = FALSE
        ORDER BY created_at DESC
        LIMIT 100
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const results = await executeQuery(query, [searchPattern, searchPattern, searchPattern]);
      return results.map(row => new Donation(row));
    } catch (error) {
      console.error('Error searching donations:', error);
      throw error;
    }
  }

  // Get donation statistics
  static async getStatistics(dateFrom = null, dateTo = null) {
    try {
      let baseQuery = 'SELECT * FROM donations WHERE 1=1';
      const params = [];

      if (dateFrom) {
        baseQuery += ' AND created_at >= ?';
        params.push(dateFrom);
      }

      if (dateTo) {
        baseQuery += ' AND created_at <= ?';
        params.push(dateTo);
      }

      // Get overall statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total_donations,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_amount,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_donations,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_donations,
          COUNT(CASE WHEN is_anonymous = TRUE THEN 1 END) as anonymous_count,
          COUNT(CASE WHEN is_anonymous = FALSE THEN 1 END) as public_count
        FROM (${baseQuery}) as filtered_donations
      `;

      const [stats] = await executeQuery(statsQuery, params);

      // Get monthly breakdown
      const monthlyQuery = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as donations_count,
          SUM(amount) as monthly_total
        FROM (${baseQuery}) as filtered_donations
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `;

      const monthlyStats = await executeQuery(monthlyQuery, params);

      // Get donation type breakdown
      const typeQuery = `
        SELECT 
          donation_type,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM (${baseQuery}) as filtered_donations
        GROUP BY donation_type
      `;

      const typeStats = await executeQuery(typeQuery, params);

      return {
        overall: stats,
        monthly: monthlyStats,
        byType: typeStats
      };
    } catch (error) {
      console.error('Error getting donation statistics:', error);
      throw error;
    }
  }

  // Generate donation receipt
  generateReceipt() {
    return {
      donationId: this.id,
      donorName: this.isAnonymous ? 'Anonymous' : this.donorName,
      amount: this.amount,
      currency: this.currency,
      donationType: this.donationType,
      status: this.status,
      paymentStatus: this.paymentStatus,
      createdAt: this.createdAt,
      isAnonymous: this.isAnonymous
    };
  }

  // Validate donation data
  validate() {
    const errors = [];

    if (!this.donorName || this.donorName.trim().length === 0) {
      errors.push('Donor name is required');
    }

    if (!this.donorEmail || !/\S+@\S+\.\S+/.test(this.donorEmail)) {
      errors.push('Valid email address is required');
    }

    if (!this.amount || this.amount <= 0) {
      errors.push('Donation amount must be greater than 0');
    }

    if (!this.donorCountry || this.donorCountry.trim().length === 0) {
      errors.push('Donor country is required');
    }

    if (!['general', 'country', 'project'].includes(this.donationType)) {
      errors.push('Invalid donation type');
    }

    if (!['card', 'bank', 'crowdfund'].includes(this.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to JSON representation
  toJSON() {
    return {
      id: this.id,
      donation_type: this.donationType,
      country_id: this.targetCountryId,
      project_id: this.targetProjectId,
      amount: this.amount,
      currency: this.currency,
      donor_name: this.donorName,
      donor_email: this.donorEmail,
      donor_phone: this.donorPhone,
      donor_country: this.donorCountry,
      is_anonymous: this.isAnonymous,
      payment_method: this.paymentMethod,
      status: this.status,
      payment_status: this.paymentStatus,
      receipt_sent: this.receiptSent,
      thank_you_sent: this.thankYouSent,
      admin_notes: this.adminNotes,
      processed_by: this.processedBy,
      created_at: this.createdAt,
      completed_at: this.completedAt
    };
  }
}

module.exports = Donation;