// ===== JOB ROUTES (routes/jobRoutes.js) =====

const express = require('express');
const router = express.Router();

const jobController = require('../controllers/jobController');

// Get all jobs
router.get('/', jobController.getJobs);

// Get one job
router.get('/:id', jobController.getJob);

// Create new job
router.post('/', jobController.createJob);

// Update job
router.put('/:id', jobController.updateJob);

// Delete job
router.delete('/:id', jobController.deleteJob);

module.exports = router;
