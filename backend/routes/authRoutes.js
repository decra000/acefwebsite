const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

// Basic auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth, authController.getProfile);
router.post('/test-invite', auth, adminAuth, authController.testInvite);

// Admin user management routes
router.get('/users', authController.getAllUsers);
router.post('/invite-user', auth, adminAuth, authController.inviteUser); // KEY FIX
router.post('/resend-invitation', auth, adminAuth, authController.resendInvitation);

// Password reset routes
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password/:token', authController.resetPassword);

// Account activation routes  
router.get('/validate-token/:token', authController.validateActivationToken);
router.post('/activate/:token', authController.activateAccount);

// Debug route (remove in production)
if (process.env.NODE_ENV === 'development') {
  router.get('/test-email', async (req, res) => {
    try {
      const { testEmailConnection } = require('../utils/mailer');
      const result = await testEmailConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
router.get('/test-db', async (req, res) => {
  try {
    console.log('🔌 Testing database connection...');
    
    const { executeQuery } = require('../config/database');
    
    // Test basic connection
    const result1 = await executeQuery('SELECT 1 as test');
    console.log('✅ Basic query successful:', result1);
    
    // Test users table
    const result2 = await executeQuery('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table accessible:', result2);
    
    // Test table structure
    const result3 = await executeQuery('DESCRIBE users');
    console.log('✅ Users table structure:', result3);
    
    res.json({
      message: 'Database tests passed',
      tests: {
        connection: result1,
        userCount: result2,
        schema: result3.map(col => ({ Field: col.Field, Type: col.Type, Null: col.Null }))
      }
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      message: 'Database test failed',
      error: error.message,
      code: error.code
    });
  }
});


module.exports = router;