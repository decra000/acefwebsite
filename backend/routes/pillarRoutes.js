const express = require('express');
const pillarController = require('../controllers/pillarController');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadSingle, cleanupOnError } = require('../middleware/upload');

const router = express.Router();

// Enhanced logging middleware for pillar routes
router.use((req, res, next) => {
  console.log(`🏛️ PILLAR ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('📋 Request details:', {
    method: req.method,
    path: req.path,
    body: req.method !== 'GET' ? req.body : 'N/A',
    params: req.params,
    query: req.query,
    hasFile: req.file ? 'Yes' : 'No'
  });
  next();
});

// CRITICAL: Specific routes MUST come before parameterized routes
// Get available focus areas for selection
router.get('/meta/focus-areas', pillarController.getAvailableFocusAreas);

// Debug/test route for development
router.get('/debug/test', (req, res) => {
  res.json({
    success: true,
    message: 'Pillar routes are working!',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET    /api/pillars               - Get all pillars',
      'GET    /api/pillars/:id          - Get pillar by ID',
      'GET    /api/pillars/meta/focus-areas - Get available focus areas',
      'POST   /api/pillars              - Create pillar with image (Admin)',
      'PUT    /api/pillars/:id          - Update pillar with image (Admin)',
      'DELETE /api/pillars/:id          - Delete pillar (Admin)'
    ]
  });
});

// PUBLIC ROUTES
// Get all pillars (for public display)
router.get('/', pillarController.getAllPillars);

// ADMIN ROUTES (authentication required)
// Create new pillar with image upload
router.post('/', 
  auth,                    // Authentication middleware
  adminAuth,               // Admin authorization middleware
  uploadSingle('image'),   // Handle single image upload with field name 'image'
  cleanupOnError,          // Cleanup files on error
  pillarController.createPillar
);

// PARAMETERIZED ROUTES - Must come last
// Get single pillar by ID (for public display)
router.get('/:id', pillarController.getPillarById);

// Update pillar with optional image upload
router.put('/:id', 
  auth,                    // Authentication middleware
  adminAuth,               // Admin authorization middleware
  uploadSingle('image'),   // Handle single image upload with field name 'image'
  cleanupOnError,          // Cleanup files on error
  pillarController.updatePillar
);

// Delete pillar
router.delete('/:id', 
  auth,                    // Authentication middleware
  adminAuth,               // Admin authorization middleware
  pillarController.deletePillar
);

// Error handling middleware for pillar routes
router.use((error, req, res, next) => {
  console.error('🏛️ PILLAR ROUTE ERROR:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params
  });
  
  // Clean up any uploaded files on error
  if (req.file) {
    const { deleteFile } = require('../middleware/upload');
    deleteFile(req.file.path).catch(err => 
      console.error('Failed to cleanup file on error:', err)
    );
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

module.exports = router;