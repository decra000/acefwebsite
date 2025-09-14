const express = require('express');
const router = express.Router();
const controller = require('../controllers/countryContactController');
const rateLimit = require('express-rate-limit');

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
  
  // Sanitize string fields
  const stringFields = ['email', 'phone', 'service_id', 'template_id', 'public_key', 'physical_address', 'mailing_address'];
  stringFields.forEach(field => {
    if (body[field] && typeof body[field] === 'string') {
      body[field] = body[field].trim();
      // Remove potential XSS
      body[field] = body[field].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  });
  
  // Validate field lengths
  const fieldLimits = {
    email: 255,
    phone: 50,
    service_id: 100,
    template_id: 100,
    public_key: 500,
    physical_address: 1000,
    mailing_address: 1000
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

// Routes
router.get('/', controller.getAllContacts);

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

// Validate EmailJS configuration
router.get('/:country/validate-emailjs', 
  sanitizeCountryParam,
  async (req, res) => {
    try {
      const countryModel = require('../models/countryContactModel');
      const validation = await countryModel.validateEmailJSConfig(req.params.country);
      res.json({
        success: validation.valid,
        ...validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to validate EmailJS configuration',
        error: error.message
      });
    }
  }
);

// Get all countries with EmailJS configuration status
router.get('/status/emailjs', async (req, res) => {
  try {
    const countryModel = require('../models/countryContactModel');
    const contacts = await countryModel.getAllContacts();
    
    const statusList = contacts.map(contact => ({
      country: contact.country,
      email: contact.email,
      phone: contact.phone,
      emailjs_configured: !!(contact.service_id && contact.template_id && contact.public_key),
      service_id: !!contact.service_id,
      template_id: !!contact.template_id,
      public_key: !!contact.public_key,
      last_updated: contact.updated_at || contact.created_at
    }));
    
    res.json({
      success: true,
      data: statusList,
      summary: {
        total_countries: statusList.length,
        fully_configured: statusList.filter(s => s.emailjs_configured).length,
        partially_configured: statusList.filter(s => !s.emailjs_configured && (s.service_id || s.template_id || s.public_key)).length,
        not_configured: statusList.filter(s => !s.service_id && !s.template_id && !s.public_key).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get EmailJS status',
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