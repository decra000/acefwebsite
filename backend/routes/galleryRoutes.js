// routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const mediaLibraryController = require('../controllers/mediaLibraryController');
const { uploadMultiple, cleanupOnError } = require('../middleware/upload');

// Apply cleanup middleware to all routes
router.use(cleanupOnError);

// Get all images from media library
router.get('/images', mediaLibraryController.getAllImages);

// Upload new images to media library
router.post('/upload', 
  uploadMultiple('images', 10), // Allow up to 10 images
  mediaLibraryController.uploadToLibrary
);

// Search external sources (Unsplash)
router.get('/search/unsplash', mediaLibraryController.searchUnsplash);

// Import image from external URL
router.post('/import', mediaLibraryController.importFromUrl);

module.exports = router;