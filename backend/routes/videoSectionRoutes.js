// routes/videoSectionRoutes.js
const express = require('express');
const VideoSectionController = require('../controllers/videoSectionController');

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`[VIDEO ROUTES] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`[VIDEO ROUTES] Base URL: ${req.baseUrl}`);
  console.log(`[VIDEO ROUTES] Path: ${req.path}`);
  console.log(`[VIDEO ROUTES] Params:`, req.params);
  console.log(`[VIDEO ROUTES] Query:`, req.query);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[VIDEO ROUTES] Body:`, req.body);
  }
  next();
});

// ROUTE ORDER IS CRITICAL IN EXPRESS!
// Most specific routes MUST come first, parameterized routes (:id) MUST come last

// 1. Tag management routes - MUST be first
router.get('/tags/options', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /tags/options');
  VideoSectionController.getTagOptions(req, res, next);
});

router.post('/tags/options', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling POST /tags/options');
  VideoSectionController.addTagOption(req, res, next);
});

router.delete('/tags/options/:id', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling DELETE /tags/options/:id');
  VideoSectionController.deleteTagOption(req, res, next);
});

// 2. Admin routes
router.get('/admin', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /admin');
  VideoSectionController.getAllForAdmin(req, res, next);
});

router.get('/admin/:id', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /admin/:id');
  VideoSectionController.getByIdForAdmin(req, res, next);
});

// 3. Special endpoints
router.get('/featured', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /featured');
  VideoSectionController.getFeatured(req, res, next);
});

router.get('/latest', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /latest');
  VideoSectionController.getLatest(req, res, next);
});

// 4. Country-specific endpoints (new)
router.get('/country/:country_id', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /country/:country_id');
  // Set country_id in query for the controller
  req.query.country_id = req.params.country_id;
  VideoSectionController.getAll(req, res, next);
});

router.get('/country/:country_id/featured', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /country/:country_id/featured');
  // Set country_id in query for the controller
  req.query.country_id = req.params.country_id;
  VideoSectionController.getFeatured(req, res, next);
});

router.get('/country/:country_id/latest', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /country/:country_id/latest');
  // Set country_id in query for the controller
  req.query.country_id = req.params.country_id;
  VideoSectionController.getLatest(req, res, next);
});

// 5. General routes (support country_id via query parameter)
router.get('/', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET / with query:', req.query);
  VideoSectionController.getAll(req, res, next);
});

router.post('/', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling POST /');
  VideoSectionController.create(req, res, next);
});

// 6. Feature/unfeature routes (specific parameterized routes)
router.put('/:id/feature', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling PUT /:id/feature');
  VideoSectionController.setFeatured(req, res, next);
});

router.put('/:id/unfeature', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling PUT /:id/unfeature');
  VideoSectionController.removeFeatured(req, res, next);
});

// 7. General parameterized routes - MUST come last
router.get('/:id', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling GET /:id');
  VideoSectionController.getById(req, res, next);
});

router.put('/:id', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling PUT /:id');
  VideoSectionController.update(req, res, next);
});

router.delete('/:id', (req, res, next) => {
  console.log('[VIDEO ROUTES] Handling DELETE /:id');
  VideoSectionController.delete(req, res, next);
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('[VIDEO ROUTES] Error:', err.message);
  console.error('[VIDEO ROUTES] Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error in video routes',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Catch-all for debugging unmatched routes
router.use('*', (req, res) => {
  console.error(`[VIDEO ROUTES] ❌ No route matched for ${req.method} ${req.originalUrl}`);
  console.error(`[VIDEO ROUTES] Base URL: ${req.baseUrl}`);
  console.error(`[VIDEO ROUTES] Path: ${req.path}`);
  
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    availableRoutes: [
      'GET /api/video-sections/',
      'GET /api/video-sections/?country_id=123',
      'POST /api/video-sections/',
      'GET /api/video-sections/admin',
      'GET /api/video-sections/admin/:id', 
      'GET /api/video-sections/featured',
      'GET /api/video-sections/featured?country_id=123',
      'GET /api/video-sections/latest',
      'GET /api/video-sections/latest?country_id=123',
      'GET /api/video-sections/country/:country_id',
      'GET /api/video-sections/country/:country_id/featured',
      'GET /api/video-sections/country/:country_id/latest',
      'GET /api/video-sections/tags/options',
      'POST /api/video-sections/tags/options',
      'DELETE /api/video-sections/tags/options/:id',
      'GET /api/video-sections/:id',
      'PUT /api/video-sections/:id',
      'DELETE /api/video-sections/:id',
      'PUT /api/video-sections/:id/feature',
      'PUT /api/video-sections/:id/unfeature'
    ]
  });
});

module.exports = router;