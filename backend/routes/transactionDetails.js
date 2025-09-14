const express = require('express');
const router = express.Router();
const transactionDetailController = require('../controllers/transactionDetailController');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadSingle, cleanupOnError } = require('../middleware/upload');

// Public routes (for displaying donation methods to users)
router.get('/', transactionDetailController.getAll);
router.get('/type/:type', transactionDetailController.getByType);

// Admin only routes (for managing transaction methods)
// Use upload middleware for create/update operations
router.post('/', 
  auth, 
  adminAuth, 
  uploadSingle('logo'), // Handle single logo upload
  cleanupOnError, // Clean up files if request fails
  transactionDetailController.create
);

router.put('/:id', 
  auth, 
  adminAuth, 
  uploadSingle('logo'), // Handle single logo upload
  cleanupOnError, // Clean up files if request fails
  transactionDetailController.update
);

router.delete('/:id', auth, adminAuth, transactionDetailController.remove);



module.exports = router;