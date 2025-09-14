// routes/volunteerFormsRoutes.js
const express = require('express');
const router = express.Router();
const volunteerFormsController = require('../controllers/volunteerFormsController');
const { auth, adminAuth } = require('../middleware/auth');

// ✅ SPECIFIC ROUTES FIRST (to avoid conflicts)
// Get countries without forms (MUST come before /:id route)
router.get('/countries/available', volunteerFormsController.getAvailableCountries);

// Get form statistics (MUST come before /:id route)
router.get('/stats', volunteerFormsController.getFormStats);

// Get form by country name (MUST come before /:id route)
router.get('/country/:countryName', volunteerFormsController.getFormByCountry);

// ✅ ADMIN ROUTES (Protected)
// Get all volunteer forms
router.get('/', volunteerFormsController.getAllForms);

// Get form by ID (MUST come after specific routes)
router.get('/:id', volunteerFormsController.getFormById);

// Create new volunteer form
router.post('/', volunteerFormsController.createForm);

// Update volunteer form
router.put('/:id', volunteerFormsController.updateForm);

// Delete volunteer form
router.delete('/:id', volunteerFormsController.deleteForm);

// Toggle form status (active/inactive)
router.patch('/:id/toggle', volunteerFormsController.toggleFormStatus);

module.exports = router;