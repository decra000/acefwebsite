// ===== JOB APPLICATION ROUTES (routes/jobApplicationRoutes.js) =====
const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { uploadSingle, cleanupOnError, getFileUrl } = require('../middleware/upload');

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📧 Job Application Route: ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

// IMPORTANT: Static routes must come BEFORE parameterized routes
// Reply route - MUST be first before any /:id routes
router.post('/reply', (req, res, next) => {
  console.log('📬 Reply route hit with body:', req.body);
  next();
}, jobApplicationController.replyToApplication);

// Public routes
router.post(
  '/',
  uploadSingle('resume'),
  cleanupOnError,
  (req, res, next) => {
    if (req.file) {
      req.body.resumeUrl = getFileUrl(req, req.file.filename, 'resumes');
    }
    next();
  },
  jobApplicationController.createApplication
);

// Admin routes
router.get('/', jobApplicationController.getAllApplications);
router.get('/job/:jobId', jobApplicationController.getJobApplications);

// Parameterized routes MUST come last
router.delete('/:id', jobApplicationController.deleteApplication);

// Add a catch-all for debugging unmatched routes
router.use('*', (req, res) => {
  console.log(`❌ Unmatched job application route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Job application route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'POST /',
      'POST /reply',
      'GET /job/:jobId',
      'DELETE /:id'
    ]
  });
});

module.exports = router;