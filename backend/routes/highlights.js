// routes/highlights.js
const express = require('express');
const router = express.Router();
const { HighlightsController, upload } = require('../controllers/highlightsController');

// Middleware for authentication (adjust based on your auth system)
const requireAuth = (req, res, next) => {
  // Add your authentication logic here
  // For example, check JWT token or session
  next(); // Remove this and add your auth logic
};

// GET /api/highlights - Get all highlights grouped by year
router.get('/', HighlightsController.getAllHighlights);

// GET /api/highlights/years - Get available and valid years
router.get('/years', HighlightsController.getAvailableYears);

// GET /api/highlights/year/:year - Get highlights for specific year
router.get('/year/:year', HighlightsController.getHighlightsByYear);

// GET /api/highlights/:id - Get single highlight by ID
router.get('/:id', HighlightsController.getHighlightById);

// POST /api/highlights - Create new highlight (with image upload)
router.post('/', 
  requireAuth, 
  upload.single('image'), 
  HighlightsController.createHighlight
);

// PUT /api/highlights/:id - Update highlight (with optional image upload)
router.put('/:id', 
  requireAuth, 
  upload.single('image'), 
  HighlightsController.updateHighlight
);

// DELETE /api/highlights/:id - Delete highlight
router.delete('/:id', 
  requireAuth, 
  HighlightsController.deleteHighlight
);

// PUT /api/highlights/year/:year/reorder - Update display orders for highlights in a year
router.put('/year/:year/reorder', 
  requireAuth, 
  HighlightsController.updateDisplayOrders
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed (jpeg, jpg, png, gif, webp)') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;