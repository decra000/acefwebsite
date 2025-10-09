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
// Add this route to your countryContactRoutes.js
// Replace your existing /send-email route with this:
// In your countryContactRoutes.js, replace the /send-email route with this:
// ✅ FALLBACK ROUTE FIRST (more specific path)
router.post('/send-email/fallback',
  emailSendingLimiter,
  async (req, res) => {
    try {
      console.log('📧 Fallback email request received:', {
        timestamp: new Date().toISOString()
      });

      const { emailOptions } = req.body;
      
      if (!emailOptions) {
        return res.status(400).json({
          success: false,
          message: 'Email options are required'
        });
      }

      if (!emailOptions.to || !emailOptions.subject || (!emailOptions.html && !emailOptions.text)) {
        return res.status(400).json({
          success: false,
          message: 'Email must have: to, subject, and content (html or text)'
        });
      }

      const fallbackConfig = {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 465,
        smtp_secure: true,
        smtp_user: 'acefngoweb@gmail.com',
        smtp_pass: 'ylpvcoeleixiptgu',
        smtp_from_name: 'ACEF Main Office'
      };

      const transporter = nodemailer.createTransport({
        host: fallbackConfig.smtp_host,
        port: parseInt(fallbackConfig.smtp_port),
        secure: fallbackConfig.smtp_secure,
        auth: {
          user: fallbackConfig.smtp_user,
          pass: fallbackConfig.smtp_pass
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000
      });

      try {
        console.log('🔍 Verifying fallback SMTP connection');
        await transporter.verify();
        console.log('✅ Fallback SMTP connection verified');
      } catch (verifyError) {
        console.warn('⚠️ Fallback SMTP verification failed, attempting to send anyway:', verifyError.message);
      }

      const emailToSend = {
        ...emailOptions,
        from: `"${fallbackConfig.smtp_from_name}" <${fallbackConfig.smtp_user}>`
      };

      console.log('📤 Sending fallback email:', {
        from: emailToSend.from,
        to: emailToSend.to,
        subject: emailToSend.subject
      });

      const info = await transporter.sendMail(emailToSend);
      
      console.log('✅ Fallback email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });

      res.json({
        success: true,
        message: 'Email sent successfully via fallback',
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });

    } catch (error) {
      console.error('❌ Fallback email error:', {
        error: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      let userMessage = 'Failed to send email via fallback';
      let statusCode = 500;
      
      if (error.code === 'EAUTH') {
        userMessage = 'Email authentication failed. Please contact support.';
        statusCode = 401;
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        userMessage = 'Could not connect to email server. Please try again later.';
        statusCode = 503;
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


router.post('/send-email', 
  emailSendingLimiter,
  async (req, res) => {
    try {
      console.log('📧 Contact form email request:', {
        hasCountry: !!req.body.country,
        hasEmailOptions: !!req.body.emailOptions,
        to: req.body.emailOptions?.to,
        timestamp: new Date().toISOString()
      });

      const { country, emailOptions } = req.body;
      
      // Validate required fields
      if (!country || !emailOptions) {
        console.error('❌ Missing required fields:', {
          hasCountry: !!country,
          hasEmailOptions: !!emailOptions
        });
        return res.status(400).json({
          success: false,
          message: 'Country and email options are required'
        });
      }

      // Get country contact configuration
      const countryModel = require('../models/countryContactModel');
      const contact = await countryModel.getCountryContact(country);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: `No contact configuration found for ${country}`
        });
      }

      if (!contact.is_active) {
        return res.status(400).json({
          success: false,
          message: `Contact configuration for ${country} is disabled`
        });
      }

      // Validate email options
      if (!emailOptions.to || !emailOptions.subject || (!emailOptions.html && !emailOptions.text)) {
        return res.status(400).json({
          success: false,
          message: 'Email must have: to, subject, and content (html or text)'
        });
      }

      // REMOVE THIS LINE - it's causing the error:
      // const mailerService = require('../utils/mailer');
      
      // Use nodemailer directly instead of the mailer service for this route
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
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000
      });

      // Verify connection
      try {
        console.log('🔍 Verifying SMTP connection for', country);
        await transporter.verify();
        console.log('✅ SMTP connection verified for', country);
      } catch (verifyError) {
        console.warn('⚠️ SMTP verification failed, attempting to send anyway:', verifyError.message);
      }

      // Prepare email with proper from header
      const fromName = contact.smtp_from_name || `ACEF ${country}`;
      const emailToSend = {
        ...emailOptions,
        from: `"${fromName}" <${contact.smtp_user}>`
      };

      console.log('📤 Sending contact form email:', {
        from: emailToSend.from,
        to: emailToSend.to,
        subject: emailToSend.subject,
        country: country
      });

      // Send email using the country-specific transporter
      const info = await transporter.sendMail(emailToSend);
      
      console.log('✅ Contact form email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        country: country
      });

      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });

    } catch (error) {
      console.error('❌ Contact form email error:', {
        error: error.message,
        code: error.code,
        country: req.body.country,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      // Provide specific error messages
      let userMessage = 'Failed to send email';
      let statusCode = 500;
      
      if (error.code === 'EAUTH') {
        userMessage = `Email authentication failed for ${req.body.country}. Please check SMTP credentials.`;
        statusCode = 401;
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        userMessage = `Could not connect to email server for ${req.body.country}. Please check SMTP configuration.`;
        statusCode = 503;
      } else if (error.message.includes('Contact for this country already exists')) {
        userMessage = `Configuration conflict for ${req.body.country}. Please contact support.`;
        statusCode = 409;
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