const express = require('express');
const pillarController = require('../controllers/pillarController');
// FIX: Import the correct middleware function names
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Enhanced logging middleware for pillar routes
router.use((req, res, next) => {
  console.log(`🏛️ PILLAR ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('📋 Request details:', {
    method: req.method,
    path: req.path,
    body: req.method !== 'GET' ? req.body : 'N/A',
    params: req.params,
    query: req.query
  });
  next();
});

// CRITICAL FIX: Put specific routes BEFORE parameterized routes
// Get available focus areas for selection (MUST be before /:id route)
router.get('/meta/focus-areas', pillarController.getAvailableFocusAreas);

// Test route for development (MUST be before /:id route)
router.get('/debug/test', (req, res) => {
  res.json({
    success: true,
    message: 'Pillar routes are working!',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET    /api/pillars               - Get all pillars',
      'GET    /api/pillars/:id          - Get pillar by ID',
      'GET    /api/pillars/meta/focus-areas - Get available focus areas',
      'POST   /api/pillars              - Create pillar (Admin)',
      'PUT    /api/pillars/:id          - Update pillar (Admin)',
      'DELETE /api/pillars/:id          - Delete pillar (Admin)'
    ]
  });
});

// PUBLIC ROUTES (no authentication required)
// Get all pillars (for public display)
router.get('/', pillarController.getAllPillars);

// Get single pillar by ID (for public display) - MUST be after specific routes
router.get('/:id', pillarController.getPillarById);

// ADMIN ROUTES (authentication required)
// Create new pillar
router.post('/', 
  auth,        // FIX: Use 'auth' instead of 'authenticateToken'
  adminAuth,   // FIX: Use 'adminAuth' instead of 'requireAdmin'
  pillarController.createPillar
);

// Update pillar
router.put('/:id', 
  auth,        // FIX: Use 'auth' instead of 'authenticateToken'
  adminAuth,   // FIX: Use 'adminAuth' instead of 'requireAdmin'
  pillarController.updatePillar
);

// Delete pillar
router.delete('/:id', 
  auth,        // FIX: Use 'auth' instead of 'authenticateToken'
  adminAuth,   // FIX: Use 'adminAuth' instead of 'requireAdmin'
  pillarController.deletePillar
);

module.exports = router;