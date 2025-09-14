const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllUsers,
  updateUser,
  updateUserRole,
  updateUserPermissions,
  deleteUser
} = require('../controllers/authController');

// Add debug logging
console.log('userRoutes loaded. Available methods:');
console.log('- getAllUsers:', typeof getAllUsers);
console.log('- updateUser:', typeof updateUser);
console.log('- updateUserRole:', typeof updateUserRole);
console.log('- updateUserPermissions:', typeof updateUserPermissions);
console.log('- deleteUser:', typeof deleteUser);

// All routes require authentication and admin privileges
router.get('/', getAllUsers);
router.put('/:id', auth, adminAuth, updateUser);
router.put('/:id/role', auth, adminAuth, updateUserRole);
router.put('/:id/permissions', auth, adminAuth, updateUserPermissions);
router.delete('/:id', auth, adminAuth, deleteUser);

// REMOVED: Duplicate delete route and the incorrect getWithPassword route

module.exports = router;