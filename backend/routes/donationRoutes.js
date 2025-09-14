// routes/donationRoutes.js - UPDATED VERSION with badge upload fix

const express = require('express');
const router = express.Router();
const DonationController = require('../controllers/donationController');
const { upload, uploadBadge } = require('../middleware/upload'); // Import both upload types

// Simple auth middleware placeholders (replace with your actual auth)
const auth = (req, res, next) => {
  // For now, just pass through - replace with actual auth check
  req.user = { email: 'admin@acef.org', id: 1 }; // Mock user for testing
  next();
};

const adminAuth = (req, res, next) => {
  // For now, just pass through - replace with actual admin auth check
  req.user = { email: 'admin@acef.org', id: 1, isAdmin: true }; // Mock admin for testing
  next();
};

// Validation middleware
const validateDonationData = (req, res, next) => {
  const { donor_name, donor_email, amount } = req.body;
  
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
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(donor_email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address format'
    });
  }
  
  next();
};

// Error handling middleware
const handleRouteError = (error, req, res, next) => {
  console.error(`Route error on ${req.method} ${req.path}:`, error);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    path: req.path,
    method: req.method
  });
};

// ==================== PUBLIC ROUTES ====================

// Health check for donation system (public)
router.get('/health', (req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    
    // Simple sync health check
    res.json({
      success: true,
      message: 'Donation system is healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.2'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Donation system health check failed',
      error: error.message
    });
  }
});

// Create new donation (public - from donation modal)
router.post('/', validateDonationData, DonationController.createDonation);

// Get donor wall data (public)
router.get('/donor-wall', DonationController.getDonorWall);

// ==================== ADMIN ROUTES ====================

// Get recent donations for debugging
router.get('/admin/recent', adminAuth, DonationController.getRecentDonations);

// Get all donations with filtering
router.get('/admin/all', adminAuth, DonationController.getAllDonations);

// Get pending donations
router.get('/admin/pending', adminAuth, DonationController.getPendingDonations);

// Get completed donations
router.get('/admin/completed', adminAuth, DonationController.getCompletedDonations);

// Get donation statistics
router.get('/admin/statistics', adminAuth, DonationController.getDonationStatistics);

// Search donations
router.get('/admin/search', adminAuth, DonationController.searchDonations);

// Get single donation by ID
router.get('/admin/:id', adminAuth, DonationController.getDonationById);

// Mark donation as completed
router.put('/admin/:id/complete', adminAuth, DonationController.markDonationCompleted);

// Send reminder to donor
router.post('/admin/:id/reminder', adminAuth, DonationController.sendReminder);

// Get reminder history for a donation
router.get('/admin/:id/reminders', adminAuth, DonationController.getReminderHistory);

// UPDATED: Send donation badge (with file upload) - FIXED with memory storage
router.post('/admin/:id/send-badge', 
  adminAuth,
  uploadBadge('badge'), // CHANGED: Use badge-specific memory storage upload
  (req, res, next) => {
    console.log('Badge route middleware check:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype,
      hasBuffer: !!req.file?.buffer,
      bufferLength: req.file?.buffer?.length,
      bodyFields: Object.keys(req.body)
    });

    // Additional validation for badge upload
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
      return res.status(400).json({
        success: false,
        message: 'Badge file buffer is missing',
        debug: {
          hasFile: true,
          hasBuffer: false,
          storageType: 'memory'
        }
      });
    }

    if (req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Badge file buffer is empty',
        debug: {
          hasFile: true,
          hasBuffer: true,
          bufferLength: 0
        }
      });
    }
    
    console.log('Badge upload middleware validation passed:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer.length
    });
    
    next();
  },
  DonationController.sendDonationBadge
);

// ==================== TESTING/DEBUG ENDPOINTS ====================

// Test reminder system
router.get('/admin/test/reminder-system', adminAuth, DonationController.testReminderSystem);

// Test email connection
router.post('/admin/test/email', adminAuth, async (req, res) => {
  try {
    console.log('Testing email connection...');
    const { testEmailConnection } = require('../utils/mailer');
    const result = await testEmailConnection();
    
    res.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// Test database tables
router.get('/admin/test/database', adminAuth, async (req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    
    const tables = [
      'donations',
      'donation_reminders', 
      'donation_badges',
      'countries',
      'projects'
    ];

    const results = {};
    
    for (const table of tables) {
      try {
        const result = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
        results[table] = { exists: true, count: result[0].count };
      } catch (error) {
        results[table] = { 
          exists: false, 
          error: error.message,
          sqlState: error.sqlState,
          code: error.code
        };
      }
    }

    res.json({
      success: true,
      message: 'Database test completed',
      tables: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Create test donation for debugging
router.post('/admin/test/create-donation', adminAuth, async (req, res) => {
  try {
    const testDonation = {
      donor_name: req.body.donor_name || 'Test User',
      donor_email: req.body.donor_email || 'test@example.com',
      donor_country: req.body.donor_country || 'Kenya',
      amount: parseFloat(req.body.amount) || 25.00,
      donation_type: req.body.donation_type || 'general',
      payment_method: req.body.payment_method || 'card',
      is_anonymous: req.body.is_anonymous || false
    };

    console.log('Creating test donation:', testDonation);
    
    // Create mock request object
    req.body = testDonation;
    await DonationController.createDonation(req, res);

  } catch (error) {
    console.error('Test donation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test donation',
      error: error.message
    });
  }
});

// Get donation system configuration
router.get('/admin/config', adminAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      predefinedAmounts: [10, 25, 50, 100, 250, 500, 1000, 2500],
      currencies: ['USD'],
      paymentMethods: ['card', 'bank', 'crowdfund'],
      donationTypes: ['general', 'country', 'project'],
      reminderTypes: ['payment_pending', 'completion_reminder', 'thank_you_follow'],
      fileUpload: {
        maxSize: '10MB',
        allowedTypes: ['image/png', 'image/jpeg'],
        storageType: 'memory' // UPDATED: Now uses memory storage for badges
      },
      badgeTiers: {
        bronze: { minAmount: 0, benefits: ['digital_badge'] },
        silver: { minAmount: 100, benefits: ['digital_badge', 'newsletter_priority'] },
        gold: { minAmount: 500, benefits: ['digital_badge', 'newsletter_priority', 'exclusive_updates'] },
        platinum: { minAmount: 1000, benefits: ['digital_badge', 'newsletter_priority', 'exclusive_updates', 'direct_updates'] }
      }
    }
  });
});

// ==================== AUTHENTICATED USER ROUTES ====================

// Get user's own donations (authenticated users)
router.get('/my-donations', auth, async (req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    const userEmail = req.user?.email || 'test@example.com';
    
    const query = `
      SELECT 
        id, amount, donation_type, status, payment_status, 
        created_at, completed_at, target_country_id, target_project_id
      FROM donations 
      WHERE donor_email = ? 
      ORDER BY created_at DESC
    `;
    
    const donations = await executeQuery(query, [userEmail]);
    
    res.json({
      success: true,
      data: donations,
      count: donations.length
    });
  } catch (error) {
    console.error('Error getting user donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your donations',
      error: error.message
    });
  }
});

// Get user's badges - UPDATED: Fixed query to match actual table schema
router.get('/my-badges', auth, async (req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    const userEmail = req.user?.email || 'test@example.com';
    
    // UPDATED: Use correct column names from your table schema
    const query = `
      SELECT 
        db.id, db.badge_code, db.donor_email, db.donor_name, 
        db.issued_at, db.badge_tier, db.file_size, db.mime_type,
        db.event_access, db.newsletter_priority, db.exclusive_updates,
        d.amount, d.donation_type, d.created_at as donation_date
      FROM donation_badges db
      JOIN donations d ON db.donation_id = d.id
      WHERE db.donor_email = ? AND db.is_active = 1
      ORDER BY db.issued_at DESC
    `;
    
    const badges = await executeQuery(query, [userEmail]);
    
    res.json({
      success: true,
      data: badges,
      count: badges.length
    });
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your badges',
      error: error.message
    });
  }
});

// Get donation receipt
router.get('/receipt/:donationId', auth, async (req, res) => {
  try {
    const { donationId } = req.params;
    const { executeQuery } = require('../config/database');
    
    const query = `
      SELECT d.*, c.name as country_name, p.title as project_title
      FROM donations d
      LEFT JOIN countries c ON d.target_country_id = c.id
      LEFT JOIN projects p ON d.target_project_id = p.id
      WHERE d.id = ? AND d.donor_email = ?
    `;
    
    const donations = await executeQuery(query, [donationId, req.user.email]);
    
    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation receipt not found'
      });
    }
    
    res.json({
      success: true,
      data: donations[0]
    });
    
  } catch (error) {
    console.error('Error getting donation receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve donation receipt'
    });
  }
});

// Apply error handling middleware to all routes
router.use(handleRouteError);

module.exports = router;