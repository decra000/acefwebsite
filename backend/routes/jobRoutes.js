const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Get all jobs
router.get('/', jobController.getJobs);

// Get filter options
router.get('/filter-options', jobController.getFilterOptions);

// Get job statistics
router.get('/stats', jobController.getJobStats);

// Get jobs by country
router.get('/country/:countryName', jobController.getJobsByCountry);

// Get single job
router.get('/:id', jobController.getJob);

// Create new job
router.post('/', jobController.createJob);

// Update job
router.put('/:id', jobController.updateJob);

// Delete job
router.delete('/:id', jobController.deleteJob);

module.exports = router;