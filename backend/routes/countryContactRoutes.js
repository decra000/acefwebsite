const express = require('express');
const router = express.Router();
const controller = require('../controllers/countryContactController');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

// Rate limiting middleware
const createContactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 create requests per windowMs
  message: {
    error: 'Too many contact creation attempts, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const updateContactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 update requests per windowMs
  message: {
    error: 'Too many update attempts, please try again later.',
    success: false
  }
});

const emailSendingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit email sending
  message: {
    error: 'Too many email attempts, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
const sanitizeCountryParam = (req, res, next) => {
  if (req.params.country) {
    // Decode and sanitize country parameter
    req.params.country = decodeURIComponent(req.params.country).trim();
    
    // Basic validation
    if (req.params.country.length > 100) {
      return res.status(400).json({
        message: 'Country name too long',
        success: false
      });
    }
    
    if (!/^[a-zA-Z\s\-'.,()]+$/.test(req.params.country)) {
      return res.status(400).json({
        message: 'Invalid country name format',
        success: false
      });
    }
  }
  next();
};

// Body validation middleware for create/update operations
const validateContactBody = (req, res, next) => {
  const { body } = req;
  
  // Sanitize string fields - Updated to match database schema
  const stringFields = [
    'email', 'phone', 'physical_address', 'mailing_address', 'postal_code', 
    'city', 'state_province', 'smtp_host', 'smtp_user', 'smtp_pass', 'smtp_from_name',
    'welcome_template', 'contact_template', 'notification_template'
  ];
  
  stringFields.forEach(field => {
    if (body[field] && typeof body[field] === 'string') {
      body[field] = body[field].trim();
      // Remove potential XSS
      body[field] = body[field].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  });
  
  // Handle coordinate fields
  if (body.latitude !== undefined) {
    if (body.latitude === '' || body.latitude === null) {
      body.latitude = null;
    } else {
      const lat = parseFloat(body.latitude);
      if (!isNaN(lat)) {
        body.latitude = lat;
      }
    }
  }
  
  if (body.longitude !== undefined) {
    if (body.longitude === '' || body.longitude === null) {
      body.longitude = null;
    } else {
      const lng = parseFloat(body.longitude);
      if (!isNaN(lng)) {
        body.longitude = lng;
      }
    }
  }

  // Handle SMTP port
  if (body.smtp_port !== undefined) {
    if (body.smtp_port === '' || body.smtp_port === null) {
      body.smtp_port = 465; // Default port
    } else {
      const port = parseInt(body.smtp_port);
      if (!isNaN(port)) {
        body.smtp_port = port;
      }
    }
  }

  // Handle boolean fields
  if (body.smtp_secure !== undefined) {
    body.smtp_secure = Boolean(body.smtp_secure);
  }
  
  if (body.is_active !== undefined) {
    body.is_active = Boolean(body.is_active);
  }
  
  // Validate field lengths - Updated to match database schema
  const fieldLimits = {
    email: 255,
    phone: 50,
    postal_code: 20,
    city: 100,
    state_province: 100,
    smtp_host: 255,
    smtp_user: 255,
    smtp_pass: 255,
    smtp_from_name: 255
  };
  
  for (const [field, limit] of Object.entries(fieldLimits)) {
    if (body[field] && body[field].length > limit) {
      return res.status(400).json({
        message: `${field} exceeds maximum length of ${limit} characters`,
        success: false
      });
    }
  }
  
  next();
};

// Basic CRUD Routes
router.get('/', controller.getAllContacts);

// Route for nearby contacts search
router.get('/nearby', controller.getNearbyContacts);

router.get('/:country', 
  sanitizeCountryParam,
  controller.getContactByCountry
);

router.post('/:country', 
  createContactLimiter,
  sanitizeCountryParam,
  validateContactBody,
  controller.createContact
);

router.put('/:country', 
  updateContactLimiter,
  sanitizeCountryParam,
  validateContactBody,
  controller.updateContact
);

router.delete('/:country', 
  sanitizeCountryParam,
  controller.deleteContact
);

// SEND EMAIL ROUTE - Main route for SMTPService
router.post('/send-email', 
  emailSendingLimiter,
  async (req, res) => {
    try {
      console.log('📧 Received email send request:', {
        hasSmtpConfig: !!req.body.smtpConfig,
        hasEmailOptions: !!req.body.emailOptions,
        to: req.body.emailOptions?.to,
        timestamp: new Date().toISOString()
      });

      const { smtpConfig, emailOptions } = req.body;
      
      // Validate required fields
      if (!smtpConfig || !emailOptions) {
        console.error('❌ Missing required fields:', {
          hasSmtpConfig: !!smtpConfig,
          hasEmailOptions: !!emailOptions
        });
        return res.status(400).json({
          success: false,
          message: 'SMTP configuration and email options are required'
        });
      }

      // Validate SMTP config structure
      const requiredSmtpFields = ['host', 'port'];
      const requiredAuthFields = ['user', 'pass'];
      
      for (const field of requiredSmtpFields) {
        if (!smtpConfig[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing SMTP configuration field: ${field}`
          });
        }
      }

      if (!smtpConfig.auth || typeof smtpConfig.auth !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'SMTP auth configuration is required'
        });
      }

      for (const field of requiredAuthFields) {
        if (!smtpConfig.auth[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing SMTP auth field: ${field}`
          });
        }
      }

      // Validate email options
      if (!emailOptions.to || !emailOptions.subject || (!emailOptions.html && !emailOptions.text)) {
        return res.status(400).json({
          success: false,
          message: 'Email must have: to, subject, and content (html or text)'
        });
      }

      console.log('📧 Creating transporter with config:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.auth.user
      });

      // Create nodemailer transporter with provided SMTP config
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        secure: smtpConfig.secure || smtpConfig.port == 465,
        auth: {
          user: smtpConfig.auth.user,
          pass: smtpConfig.auth.pass
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        },
        // Add connection timeout
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000 // 60 seconds
      });

      // Verify connection before sending
      try {
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
      } catch (verifyError) {
        console.warn('⚠️ SMTP verification failed, attempting to send anyway:', verifyError.message);
        // Continue anyway as some servers don't support VERIFY command
      }

      // Send email
      console.log('📤 Sending email:', {
        from: emailOptions.from,
        to: emailOptions.to,
        subject: emailOptions.subject,
        hasAttachments: !!(emailOptions.attachments && emailOptions.attachments.length > 0)
      });

      const info = await transporter.sendMail(emailOptions);
      
      console.log('✅ Email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      });

      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });

    } catch (error) {
      console.error('❌ Send email error:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      // Provide more specific error messages
      let userMessage = 'Failed to send email';
      let statusCode = 500;
      
      if (error.code === 'EAUTH') {
        userMessage = 'Email authentication failed. Please check SMTP credentials.';
        statusCode = 401;
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        userMessage = 'Could not connect to email server. Please check SMTP configuration.';
        statusCode = 503;
      } else if (error.code === 'EMESSAGE') {
        userMessage = 'Invalid email content or format.';
        statusCode = 400;
      } else if (error.message.includes('Invalid login')) {
        userMessage = 'Invalid email credentials provided.';
        statusCode = 401;
      } else if (error.code === 'EENVELOPE') {
        userMessage = 'Invalid email addresses provided.';
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: userMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code
      });
    }
  }
);

// Additional utility routes

// Validate SMTP configuration
router.get('/:country/validate-smtp', 
  sanitizeCountryParam,
  async (req, res) => {
    try {
      const countryModel = require('../models/countryContactModel');
      const validation = await countryModel.validateSMTPConfig(req.params.country);
      res.json({
        success: validation.valid,
        ...validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to validate SMTP configuration',
        error: error.message
      });
    }
  }
);

// Test SMTP connection
router.post('/:country/test-smtp',
  emailSendingLimiter,
  sanitizeCountryParam,
  async (req, res) => {
    try {
      console.log(`🔧 Testing SMTP connection for ${req.params.country}`);
      
      const countryModel = require('../models/countryContactModel');
      const contact = await countryModel.getCountryContact(req.params.country);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: `No contact configuration found for ${req.params.country}`
        });
      }

      if (!contact.is_active) {
        return res.status(400).json({
          success: false,
          message: `Contact configuration for ${req.params.country} is disabled`
        });
      }

      // Check required SMTP fields
      if (!contact.smtp_host || !contact.smtp_port || !contact.smtp_user || !contact.smtp_pass) {
        return res.status(400).json({
          success: false,
          message: `Incomplete SMTP configuration for ${req.params.country}`
        });
      }

      // Create test transporter
      const transporter = nodemailer.createTransport({
        host: contact.smtp_host,
        port: parseInt(contact.smtp_port),
        secure: contact.smtp_secure || contact.smtp_port == 465,
        auth: {
          user: contact.smtp_user,
          pass: contact.smtp_pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Test connection
      await transporter.verify();
      
      console.log(`✅ SMTP test successful for ${req.params.country}`);
      
      res.json({
        success: true,
        message: `SMTP configuration test successful for ${req.params.country}`,
        config: {
          host: contact.smtp_host,
          port: contact.smtp_port,
          user: contact.smtp_user,
          secure: contact.smtp_secure
        }
      });

    } catch (error) {
      console.error(`❌ SMTP test failed for ${req.params.country}:`, error.message);
      
      let errorMessage = `SMTP test failed for ${req.params.country}`;
      
      if (error.code === 'EAUTH') {
        errorMessage += ': Authentication failed';
      } else if (error.code === 'ECONNECTION') {
        errorMessage += ': Connection failed';
      } else {
        errorMessage += `: ${error.message}`;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Get all countries with SMTP configuration status
router.get('/status/smtp', async (req, res) => {
  try {
    const countryModel = require('../models/countryContactModel');
    const contacts = await countryModel.getAllContacts();
    
    const statusList = contacts.map(contact => ({
      country: contact.country,
      email: contact.email,
      phone: contact.phone,
      latitude: contact.latitude,
      longitude: contact.longitude,
      smtp_configured: !!(contact.smtp_host && contact.smtp_port && contact.smtp_user && contact.smtp_pass),
      smtp_host: !!contact.smtp_host,
      smtp_port: !!contact.smtp_port,
      smtp_user: !!contact.smtp_user,
      smtp_pass: !!contact.smtp_pass,
      has_coordinates: !!(contact.latitude && contact.longitude),
      is_active: contact.is_active,
      last_updated: contact.updated_at || contact.created_at
    }));
    
    res.json({
      success: true,
      data: statusList,
      summary: {
        total_countries: statusList.length,
        fully_configured: statusList.filter(s => s.smtp_configured && s.is_active).length,
        partially_configured: statusList.filter(s => !s.smtp_configured && (s.smtp_host || s.smtp_user)).length,
        not_configured: statusList.filter(s => !s.smtp_host && !s.smtp_user).length,
        inactive: statusList.filter(s => !s.is_active).length,
        with_coordinates: statusList.filter(s => s.has_coordinates).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get SMTP status',
      error: error.message
    });
  }
});

// Get configuration statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const countryModel = require('../models/countryContactModel');
    const stats = await countryModel.getContactStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// Bulk operations route (for admin use)
router.post('/bulk/update', 
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit bulk operations
    message: {
      error: 'Too many bulk operations, please try again later.',
      success: false
    }
  }),
  async (req, res) => {
    try {
      const { operations } = req.body;
      
      if (!Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Operations array is required'
        });
      }
      
      if (operations.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 50 operations allowed per bulk request'
        });
      }
      
      const countryModel = require('../models/countryContactModel');
      const results = [];
      
      for (const operation of operations) {
        try {
          const { action, country, data } = operation;
          
          let result;
          switch (action) {
            case 'create':
              result = await countryModel.createCountryContact(country, data);
              break;
            case 'update':
              result = await countryModel.updateCountryContact(country, data);
              break;
            case 'delete':
              result = await countryModel.deleteCountryContact(country);
              break;
            default:
              throw new Error(`Invalid action: ${action}`);
          }
          
          results.push({
            country,
            action,
            success: true,
            result
          });
        } catch (error) {
          results.push({
            country: operation.country,
            action: operation.action,
            success: false,
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      res.json({
        success: true,
        message: `Bulk operation completed: ${successCount} successful, ${failureCount} failed`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Bulk operation failed',
        error: error.message
      });
    }
  }
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;