const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe/:token', newsletterController.unsubscribe);

// Admin routes
router.get('/stats', newsletterController.getStats);
router.get('/subscribers', newsletterController.getSubscribers);
router.delete('/subscribers/:email', newsletterController.deleteSubscriber);

// NEW: Newsletter messaging routes (admin only)
router.post('/send-message', newsletterController.sendMessage);
router.get('/messages', newsletterController.getMessages);

module.exports = router;