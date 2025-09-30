// controllers/donationController.js - FIXED VERSION
const { executeQuery } = require('../config/database');
const mailerService = require('../utils/mailer'); // FIXED: Import the mailerService singleton

class DonationController {
  // Create new donation
  static async createDonation(req, res) {
    try {
      console.log('Creating donation with data:', req.body);

      const {
        donor_name,
        donor_email,
        donor_phone,
        donor_country,
        amount,
        donation_type = 'general',
        target_country_id,
        target_project_id,  
        payment_method = 'card',
        is_anonymous = false
      } = req.body;

      // Validation
      if (!donor_name || !donor_email || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: donor_name, donor_email, amount'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      // Generate unique donation ID
      const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const insertQuery = `
        INSERT INTO donations (
          id, donor_name, donor_email, donor_phone, donor_country,
          amount, donation_type, target_country_id, target_project_id, 
          payment_method, is_anonymous, status, payment_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', NOW(), NOW())
      `;

      await executeQuery(insertQuery, [
        donationId,
        donor_name,
        donor_email,
        donor_phone || null,
        donor_country,
        parseFloat(amount),
        donation_type,
        target_country_id ? parseInt(target_country_id) : null,
        target_project_id ? parseInt(target_project_id) : null,
        payment_method,
        is_anonymous ? 1 : 0
      ]);

      const donation = await executeQuery(
        'SELECT * FROM donations WHERE id = ?', 
        [donationId]
      );

      console.log('Donation created successfully:', donation[0]);

      res.status(201).json({
        success: true,
        message: 'Donation created successfully',
        data: donation[0]
      });

    } catch (error) {
      console.error('Error creating donation:', error);
      
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({
          success: false,
          message: 'Database column mismatch. Please check the database schema.',
          error: 'Field mapping error'
        });
      }
      
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          success: false,
          message: 'Donations table not found. Please run database setup.',
          error: 'Missing table'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create donation',
        error: error.message
      });
    }
  }

  // Send reminder - FIXED
  static async sendReminder(req, res) {
    try {
      const { id } = req.params;
      console.log('📧 Reminder request received for donation:', id);

      const {
        donationId,
        recipientEmail,
        recipientName,
        donationAmount,
        reminderType = 'payment_pending',
        customMessage = '',
        donationType = 'general',
        sendEmail = true
      } = req.body;

      let donation = null;
      if (!recipientEmail || !recipientName || !donationAmount) {
        console.log('🔍 Missing donor details in request, fetching from database...');
        
        const donations = await executeQuery(
          'SELECT * FROM donations WHERE id = ?', 
          [id]
        );

        if (donations.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Donation not found with ID: ${id}`
          });
        }

        donation = donations[0];
      }

      const emailParams = {
        donationId: donationId || id,
        recipientEmail: recipientEmail || donation?.donor_email,
        recipientName: recipientName || (donation?.is_anonymous ? 'ACEF Friend' : donation?.donor_name),
        donationAmount: donationAmount || donation?.amount,
        reminderType,
        customMessage,
        donationType: donationType || donation?.donation_type || 'general'
      };

      console.log('📤 Final email parameters:', emailParams);

      if (!emailParams.recipientEmail || !emailParams.recipientName || !emailParams.donationAmount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
          missing: {
            recipientEmail: !emailParams.recipientEmail,
            recipientName: !emailParams.recipientName,
            donationAmount: !emailParams.donationAmount
          }
        });
      }

      // Record reminder in database
      let reminderId = null;
      try {
        const reminderQuery = `
          INSERT INTO donation_reminders (
            donation_id, reminder_type, custom_message, email_sent, sent_at, created_at
          ) VALUES (?, ?, ?, ?, NOW(), NOW())
        `;

        const reminderResult = await executeQuery(reminderQuery, [
          id, 
          reminderType, 
          customMessage || null, 
          sendEmail ? 1 : 0
        ]);

        reminderId = reminderResult.insertId;
        console.log('✅ Reminder logged to database with ID:', reminderId);
      } catch (dbError) {
        console.error('❌ Failed to log reminder to database:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Failed to log reminder',
          error: dbError.message
        });
      }

      // Send email if requested
      let emailSent = false;
      let emailError = null;
      let messageId = null;

      if (sendEmail) {
        try {
          console.log('📤 Attempting to send reminder email...');
          
          // FIXED: Test email connection using mailerService
          const connectionTest = await mailerService.testEmailConnection('fundraising');
          if (!connectionTest.success) {
            throw new Error(`Email connection failed: ${connectionTest.message}`);
          }
          console.log('✅ Email connection verified');

          // FIXED: Use mailerService.sendDonationReminderEmail
          const emailResult = await mailerService.sendDonationReminderEmail(emailParams);

          console.log('📧 Email result:', emailResult);

          if (emailResult && (emailResult.messageId || emailResult.accepted)) {
            emailSent = true;
            messageId = emailResult.messageId;
            console.log('✅ Reminder email sent successfully:', messageId);

            await executeQuery(
              'UPDATE donation_reminders SET email_sent = TRUE WHERE id = ?',
              [reminderId]
            );
          } else {
            throw new Error('Email service did not return success confirmation');
          }

        } catch (emailSendError) {
          emailError = emailSendError.message;
          console.error('❌ Failed to send reminder email:', emailSendError);

          try {
            await executeQuery(
              'UPDATE donation_reminders SET email_sent = FALSE WHERE id = ?',
              [reminderId]
            );
          } catch (updateError) {
            console.error('Failed to update reminder record:', updateError);
          }
        }
      }

      try {
        await executeQuery(
          'UPDATE donations SET last_reminder_sent = NOW() WHERE id = ?',
          [id]
        );
      } catch (updateError) {
        console.error('Failed to update donation reminder timestamp:', updateError);
      }

      const response = {
        success: true,
        message: emailSent 
          ? `Reminder email sent successfully to ${emailParams.recipientEmail}` 
          : sendEmail 
            ? `Reminder logged but email failed: ${emailError}`
            : 'Reminder logged successfully (email not requested)',
        data: {
          reminderId,
          donationId: id,
          reminderType,
          recipientEmail: emailParams.recipientEmail,
          emailSent,
          messageId,
          emailError: emailSent ? null : emailError,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📋 Sending response:', response);
      res.json(response);

    } catch (error) {
      console.error('❌ Unexpected error in sendReminder:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error occurred while processing reminder',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Send donation badge - FIXED
  static async sendDonationBadge(req, res) {
    try {
      const { id } = req.params;
      
      console.log(`🎨 Processing badge for donation: ${id}`);
      console.log('📋 Request details:', {
        hasFile: !!req.file,
        fileSize: req.file?.size || 0,
        mimeType: req.file?.mimetype || 'unknown',
        filename: req.file?.originalname || 'unknown'
      });
      
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Badge image file is required',
          debug: {
            multerProcessed: true,
            fileFound: false,
            expectedField: 'badge'
          }
        });
      }

      if (!req.file.buffer) {
        console.error('❌ File buffer is missing from multer memory storage');
        return res.status(400).json({
          success: false,
          message: 'Badge file buffer is missing - check multer configuration',
          debug: {
            hasFile: true,
            hasBuffer: false
          }
        });
      }

      if (!Buffer.isBuffer(req.file.buffer)) {
        console.error('❌ File buffer is not a valid Buffer instance:', typeof req.file.buffer);
        return res.status(400).json({
          success: false,
          message: 'Invalid buffer type received from file upload',
          debug: {
            bufferType: typeof req.file.buffer,
            isBuffer: Buffer.isBuffer(req.file.buffer)
          }
        });
      }

      if (req.file.buffer.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Badge file buffer is empty'
        });
      }

      console.log(`✅ Buffer validation passed: ${req.file.buffer.length} bytes`);

      // Get donation details
      const donations = await executeQuery(
        'SELECT * FROM donations WHERE id = ?', 
        [id]
      );

      if (donations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      const donation = donations[0];

      const {
        recipientEmail,
        recipientName, 
        donationAmount,
        isAnonymous
      } = req.body;

      const emailParams = {
        donationId: donation.id,
        recipientEmail: recipientEmail || donation.donor_email,
        recipientName: recipientName || (donation.is_anonymous ? 'ACEF Friend' : donation.donor_name),
        donationAmount: parseFloat(donationAmount || donation.amount),
        badgeBuffer: req.file.buffer,
        badgeFilename: req.file.originalname || `badge_${donation.id}.png`,
        isAnonymous: (isAnonymous === 'true') || donation.is_anonymous
      };

      console.log('📧 Email parameters prepared:', {
        ...emailParams,
        badgeBuffer: `Buffer(${emailParams.badgeBuffer.length} bytes)`
      });

      // Enhanced file validation
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validImageTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Expected PNG/JPEG, got: ${req.file.mimetype}`
        });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      const minSize = 500; // 500 bytes
      
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `Badge file too large (${(req.file.size / 1024 / 1024).toFixed(2)}MB). Max: 10MB`
        });
      }

      if (req.file.size < minSize) {
        return res.status(400).json({
          success: false,
          message: `Badge file too small (${req.file.size} bytes). Minimum: ${minSize} bytes`
        });
      }

      console.log(`✅ File validation passed: ${req.file.size} bytes, type: ${req.file.mimetype}`);

      // FIXED: Test connection and send email using mailerService
      try {
        const connectionTest = await mailerService.testEmailConnection('fundraising');
        if (!connectionTest.success) {
          throw new Error(`Email service unavailable: ${connectionTest.message}`);
        }
        console.log('✅ Email connection verified');
      } catch (testError) {
        console.error('❌ Email connection test failed:', testError);
        return res.status(500).json({
          success: false,
          message: 'Email service not available',
          error: testError.message
        });
      }

      console.log(`📧 Sending badge email to: ${emailParams.recipientEmail}`);

      let emailResult;
      try {
        if (!Buffer.isBuffer(emailParams.badgeBuffer)) {
          throw new Error(`Buffer validation failed before email send. Type: ${typeof emailParams.badgeBuffer}`);
        }

        // FIXED: Use mailerService.sendDonationBadgeEmail
        emailResult = await mailerService.sendDonationBadgeEmail(emailParams);

        console.log('📧 Email sending result:', {
          success: !!emailResult,
          messageId: emailResult?.messageId,
          accepted: emailResult?.accepted
        });

      } catch (emailError) {
        console.error('❌ Email sending failed:', {
          error: emailError.message,
          recipient: emailParams.recipientEmail
        });
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send badge email',
          error: emailError.message,
          debug: {
            donationId: donation.id,
            recipientEmail: emailParams.recipientEmail,
            fileSize: req.file.size
          }
        });
      }

      if (!emailResult || (!emailResult.messageId && !emailResult.accepted)) {
        return res.status(500).json({
          success: false,
          message: 'Email service did not confirm successful sending',
          debug: { emailResult }
        });
      }

      // Record badge in database
      const badgeCode = `BADGE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      let badgeTier = 'bronze';
      if (emailParams.donationAmount >= 1000) badgeTier = 'platinum';
      else if (emailParams.donationAmount >= 500) badgeTier = 'gold';
      else if (emailParams.donationAmount >= 100) badgeTier = 'silver';
      
      try {
        await executeQuery(`
          INSERT INTO donation_badges (
            donation_id, badge_code, donor_email, donor_name, 
            issued_at, is_active, badge_tier, file_size, mime_type,
            event_access, newsletter_priority, exclusive_updates
          ) VALUES (?, ?, ?, ?, NOW(), 1, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            issued_at = NOW(),
            is_active = 1,
            file_size = VALUES(file_size),
            mime_type = VALUES(mime_type)
        `, [
          donation.id,  
          badgeCode,    
          emailParams.recipientEmail,  
          emailParams.isAnonymous ? 'Anonymous Donor' : emailParams.recipientName, 
          badgeTier,    
          req.file.size,  
          req.file.mimetype,  
          badgeTier === 'gold' || badgeTier === 'platinum' ? 1 : 0, 
          badgeTier === 'silver' || badgeTier === 'gold' || badgeTier === 'platinum' ? 1 : 0, 
          badgeTier === 'gold' || badgeTier === 'platinum' ? 1 : 0  
        ]);

        console.log(`✅ Badge record saved with code: ${badgeCode}, tier: ${badgeTier}`);

      } catch (dbError) {
        console.error('⚠️ Database recording failed (email sent successfully):', dbError);
      }

      return res.json({
        success: true,
        message: `Badge email sent successfully to ${emailParams.recipientEmail}`,
        data: {
          badgeCode,
          badgeTier,
          emailSent: true,
          messageId: emailResult.messageId,
          filename: emailParams.badgeFilename,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          recipientEmail: emailParams.recipientEmail,
          recipientName: emailParams.recipientName,
          donationAmount: emailParams.donationAmount,
          benefits: {
            eventAccess: badgeTier === 'gold' || badgeTier === 'platinum',
            newsletterPriority: badgeTier !== 'bronze',
            exclusiveUpdates: badgeTier === 'gold' || badgeTier === 'platinum'
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Badge processing failed:', {
        error: error.message,
        donationId: req.params.id
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to process donation badge',
        error: error.message
      });
    }
  }

  // Get reminder history
  static async getReminderHistory(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          r.*,
          d.donor_name,
          d.donor_email,
          d.amount
        FROM donation_reminders r
        JOIN donations d ON r.donation_id = d.id
        WHERE r.donation_id = ?
        ORDER BY r.sent_at DESC
      `;

      const reminders = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: reminders,
        count: reminders.length
      });

    } catch (error) {
      console.error('Error fetching reminder history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reminder history',
        error: error.message
      });
    }
  }

  // Test reminder system
  static async testReminderSystem(req, res) {
    try {
      console.log('🧪 Testing reminder system...');

      const testQuery = 'SELECT COUNT(*) as donation_count FROM donations';
      const dbResult = await executeQuery(testQuery);
      
      let mailerAvailable = false;
      let mailerError = null;
      
      try {
        // FIXED: Test mailerService directly
        const emailTest = await mailerService.testEmailConnection('fundraising');
        mailerAvailable = emailTest.success;
        console.log('Email connection test result:', emailTest);
      } catch (importError) {
        mailerError = importError.message;
        console.error('Mailer test failed:', importError);
      }

      let reminderTableExists = false;
      try {
        await executeQuery('SELECT COUNT(*) FROM donation_reminders LIMIT 1');
        reminderTableExists = true;
      } catch (tableError) {
        console.error('Reminder table test failed:', tableError);
      }

      const testResults = {
        success: true,
        message: 'Reminder system test completed',
        results: {
          database: {
            connected: true,
            donationCount: dbResult[0]?.donation_count || 0
          },
          mailer: {
            available: mailerAvailable,
            error: mailerError
          },
          tables: {
            reminderTableExists
          },
          environment: {
            mailHost: !!process.env.MAIL_HOST,
            mailUser: !!process.env.MAIL_USER,
            mailPass: !!process.env.MAIL_PASS
          }
        }
      };

      res.json(testResults);

    } catch (error) {
      console.error('❌ Test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Test failed',
        error: error.message
      });
    }
  }

  // Get recent donations
  static async getRecentDonations(req, res) {
    try {
      const query = `
        SELECT d.*, 
               c.name as country_name,
               p.title as project_title
        FROM donations d
        LEFT JOIN countries c ON d.target_country_id = c.id
        LEFT JOIN projects p ON d.target_project_id = p.id
        ORDER BY d.created_at DESC
        LIMIT 10
      `;

      const donations = await executeQuery(query);

      res.json({
        success: true,
        data: donations,
        count: donations.length
      });

    } catch (error) {
      console.error('Error fetching recent donations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent donations',
        error: error.message
      });
    }
  }

  // Get all donations
  static async getAllDonations(req, res) {
    try {
      const { page = 1, limit = 50, status, donation_type } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let params = [];

      if (status) {
        whereConditions.push('d.status = ?');
        params.push(status);
      }

      if (donation_type) {
        whereConditions.push('d.donation_type = ?');
        params.push(donation_type);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const query = `
        SELECT d.*, 
               c.name as country_name,
               p.title as project_title
        FROM donations d
        LEFT JOIN countries c ON d.target_country_id = c.id
        LEFT JOIN projects p ON d.target_project_id = p.id
        ${whereClause}
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), parseInt(offset));
      
      const donations = await executeQuery(query, params);

      const countQuery = `SELECT COUNT(*) as total FROM donations d ${whereClause}`;
      const countParams = whereConditions.length > 0 ? params.slice(0, -2) : [];
      const totalResult = await executeQuery(countQuery, countParams);
      const total = totalResult[0].total;

      res.json({
        success: true,
        data: donations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching all donations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch donations',
        error: error.message
      });
    }
  }

  // Get pending donations
  static async getPendingDonations(req, res) {
    try {
      const query = `
        SELECT d.*, 
               c.name as country_name,
               p.title as project_title
        FROM donations d
        LEFT JOIN countries c ON d.target_country_id = c.id
        LEFT JOIN projects p ON d.target_project_id = p.id
        WHERE d.status = 'pending' OR d.payment_status = 'pending'
        ORDER BY d.created_at DESC
      `;

      const donations = await executeQuery(query);

      res.json({
        success: true,
        data: donations
      });

    } catch (error) {
      console.error('Error fetching pending donations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending donations',
        error: error.message
      });
    }
  }

  // Get completed donations
  static async getCompletedDonations(req, res) {
    try {
      const query = `
        SELECT d.*, 
               c.name as country_name,
               p.title as project_title
        FROM donations d
        LEFT JOIN countries c ON d.target_country_id = c.id
        LEFT JOIN projects p ON d.target_project_id = p.id
        WHERE d.status = 'completed' AND d.payment_status = 'completed'
        ORDER BY d.completed_at DESC, d.created_at DESC
      `;

      const donations = await executeQuery(query);

      res.json({
        success: true,
        data: donations
      });

    } catch (error) {
      console.error('Error fetching completed donations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch completed donations',
        error: error.message
      });
    }
  }

  // Get donation statistics
  static async getDonationStatistics(req, res) {
    try {
      const totalStatsQuery = `
        SELECT 
          COUNT(*) as total_donations,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_amount
        FROM donations 
        WHERE status != 'cancelled'
      `;
      const totalStats = await executeQuery(totalStatsQuery);

      const anonymousQuery = `
        SELECT 
          COUNT(*) as total_count,
          COALESCE(SUM(amount), 0) as total_amount
        FROM donations 
        WHERE is_anonymous = 1 AND status != 'cancelled'
      `;
      const anonymousStats = await executeQuery(anonymousQuery);

      const statusQuery = `
        SELECT 
          status,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as amount
        FROM donations 
        GROUP BY status
      `;
      const statusStats = await executeQuery(statusQuery);

      const monthlyQuery = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as donations_count,
          COALESCE(SUM(amount), 0) as total_amount
        FROM donations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          AND status != 'cancelled'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `;
      const monthlyStats = await executeQuery(monthlyQuery);

      const statistics = {
        ...totalStats[0],
        anonymous_donations: anonymousStats[0],
        status_breakdown: statusStats,
        monthly_stats: monthlyStats
      };

      res.json({
        success: true,
        data: statistics
      });

    } catch (error) {
      console.error('Error fetching donation statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  // Get donation by ID
  static async getDonationById(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT d.*, 
               c.name as country_name,
               p.title as project_title
        FROM donations d
        LEFT JOIN countries c ON d.target_country_id = c.id
        LEFT JOIN projects p ON d.target_project_id = p.id
        WHERE d.id = ?
      `;

      const donations = await executeQuery(query, [id]);

      if (donations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      res.json({
        success: true,
        data: donations[0]
      });

    } catch (error) {
      console.error('Error fetching donation by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch donation',
        error: error.message
      });
    }
  }

  // Search donations
  static async searchDonations(req, res) {
    try {
      const { q, type, status } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query required'
        });
      }

      let whereConditions = [
        '(d.donor_name LIKE ? OR d.donor_email LIKE ? OR d.id LIKE ?)'
      ];
      let params = [`%${q}%`, `%${q}%`, `%${q}%`];

      if (type) {
        whereConditions.push('d.donation_type = ?');
        params.push(type);
      }

      if (status) {
        whereConditions.push('d.status = ?');
        params.push(status);
      }

      const query = `
        SELECT d.*, 
               c.name as country_name,
               p.title as project_title
        FROM donations d
        LEFT JOIN countries c ON d.target_country_id = c.id
        LEFT JOIN projects p ON d.target_project_id = p.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY d.created_at DESC
        LIMIT 100
      `;

      const donations = await executeQuery(query, params);

      res.json({
        success: true,
        data: donations
      });

    } catch (error) {
      console.error('Error searching donations:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error.message
      });
    }
  }

  // Get donor wall data (public)
  static async getDonorWall(req, res) {
    try {
      console.log('🔄 Fetching donor wall data...');
      
      const debugQuery = `
        SELECT 
          COUNT(*) as total_donations,
          COUNT(CASE WHEN status = 'completed' AND payment_status = 'completed' THEN 1 END) as completed_donations,
          COUNT(CASE WHEN is_anonymous = 1 THEN 1 END) as anonymous_donations
        FROM donations
      `;
      const debugResult = await executeQuery(debugQuery);
      console.log('📊 Database stats:', debugResult[0]);

      const donorsQuery = `
        SELECT 
          d.id as donation_id,
          d.donor_name,
          d.donor_email,
          d.amount as donation_amount,
          d.donation_type,
          d.is_anonymous,
          d.created_at,
          d.completed_at,
          d.status,
          d.payment_status as donation_status,
          COALESCE(d.completed_at, d.created_at) as donation_date,
          0 as is_featured
        FROM donations d
        WHERE d.status = 'completed' 
          AND d.payment_status = 'completed'
          AND d.is_anonymous = 0
        ORDER BY COALESCE(d.completed_at, d.created_at) DESC
        LIMIT 100
      `;

      const anonymousQuery = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as totalAmount
        FROM donations 
        WHERE status = 'completed' 
          AND payment_status = 'completed'
          AND is_anonymous = 1
      `;

      const [donors, anonymousStats] = await Promise.all([
        executeQuery(donorsQuery),
        executeQuery(anonymousQuery)
      ]);

      console.log(`✅ Found ${donors.length} public donors and ${anonymousStats[0]?.count || 0} anonymous donors`);

      const response = {
        success: true,
        data: {
          donors: donors,
          anonymous: anonymousStats[0] || { count: 0, totalAmount: 0 }
        }
      };

      console.log('📤 Sending response with', donors.length, 'donors');
      res.json(response);

    } catch (error) {
      console.error('❌ Error fetching donor wall:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch donor wall',
        error: error.message
      });
    }
  }

  // Mark donation as completed
  static async markDonationCompleted(req, res) {
    try {
      const { id } = req.params;
      const { adminNotes = '' } = req.body;

      console.log(`🔄 Marking donation ${id} as completed`);

      const donations = await executeQuery(
        'SELECT * FROM donations WHERE id = ?', 
        [id]
      );

      if (donations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Donation not found'
        });
      }

      const donation = donations[0];

      if (donation.status === 'completed' && donation.payment_status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Donation is already completed'
        });
      }

      const updateQuery = `
        UPDATE donations 
        SET status = 'completed', 
            payment_status = 'completed', 
            completed_at = NOW(),
            admin_notes = ?,
            updated_at = NOW()
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [adminNotes, id]);

      console.log(`✅ Donation ${id} marked as completed`);

      const updatedDonations = await executeQuery(
        'SELECT * FROM donations WHERE id = ?', 
        [id]
      );

      res.json({
        success: true,
        message: 'Donation marked as completed successfully',
        data: updatedDonations[0]
      });

    } catch (error) {
      console.error('❌ Error marking donation as completed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark donation as completed',
        error: error.message
      });
    }
  }
}

module.exports = DonationController;