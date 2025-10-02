// routes/githubToken.js
const express = require('express');
const router = express.Router();
const githubTokenController = require('../controllers/githubTokenController');

// Get all tokens (with masked values)
router.get('/', githubTokenController.getAll);

// Get active token (full value - for internal use)
router.get('/active', githubTokenController.getActive);

// Get single token by ID
router.get('/:id', githubTokenController.getOne);

// Create new token
router.post('/', githubTokenController.create);

// Update token
router.put('/:id', githubTokenController.update);

// Set token as active
router.patch('/:id/activate', githubTokenController.setActive);

// Delete token
router.delete('/:id', githubTokenController.delete);

module.exports = router;