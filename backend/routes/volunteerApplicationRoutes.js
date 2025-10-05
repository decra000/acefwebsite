const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerApplicationController');
const { sendAdminCommunicationEmail } = require('../utils/mailer');
const VolunteerApplication = require('../models/volunteerApplicationModel');

// ============================================
// PUBLIC ROUTES
// ============================================

// Submit volunteer application
router.post('/', volunteerController.createApplication);

// Check if email already applied for a country
router.get('/check-existing', async (req, res) => {
  try {
    const { email, country } = req.query;
    if (!email || !country) {
      return res.status(400).json({ error: 'Email and country required' });
    }
    const exists = await VolunteerApplication.checkExistingApplication(email, country);
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN ROUTES (add authentication middleware as needed)
// ============================================

// Get all applications
router.get('/admin/all', volunteerController.getAllApplications);

// Get applications by country
router.get('/admin/country/:country', volunteerController.getApplicationsByCountry);

// Get applications by status
router.get('/admin/status/:status', volunteerController.getApplicationsByStatus);

// Get country statistics
router.get('/admin/stats/:country', volunteerController.getCountryStatistics);

// Get single application with full details
router.get('/admin/:id', volunteerController.getApplication);

// Update application status
router.put('/admin/:id/status', volunteerController.updateApplicationStatus);

// Update application notes
router.put('/admin/:id/notes', volunteerController.updateApplicationNotes);

// Get status history for application
router.get('/admin/:id/history', volunteerController.getStatusHistory);

// Get communications for application
router.get('/admin/:id/communications', volunteerController.getCommunications);

// Delete application
router.delete('/admin/:id', volunteerController.deleteApplication);

// ============================================
// EMAIL ROUTES (admin communication)
// ============================================

// Email single applicant
router.post('/admin/email-single', async (req, res) => {
  try {
    const { applicationId, subject, message, sentBy } = req.body;

    // Get application details
    const application = await VolunteerApplication.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Send email
    const result = await sendAdminCommunicationEmail({
      recipientEmail: application.email,
      recipientName: application.email.split('@')[0],
      subject,
      message,
    });

    // Log communication
    await VolunteerApplication.logCommunication(
      applicationId,
      subject,
      message,
      sentBy || 'Admin'
    );

    res.json({ success: true, result });
  } catch (err) {
    console.error('Email single error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Email multiple applicants (by IDs)
router.post('/admin/email-bulk', async (req, res) => {
  try {
    const { applicationIds, subject, message, sentBy } = req.body;

    if (!applicationIds || applicationIds.length === 0) {
      return res.status(400).json({ error: 'No applications selected' });
    }

    const results = [];
    const errors = [];

    for (const id of applicationIds) {
      try {
        const application = await VolunteerApplication.getApplicationById(id);
        if (!application) {
          errors.push({ id, error: 'Application not found' });
          continue;
        }

        await sendAdminCommunicationEmail({
          recipientEmail: application.email,
          recipientName: application.email.split('@')[0],
          subject,
          message,
        });

        // Log communication
        await VolunteerApplication.logCommunication(
          id,
          subject,
          message,
          sentBy || 'Admin'
        );

        results.push({ id, success: true });
      } catch (err) {
        errors.push({ id, error: err.message });
      }
    }

    res.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (err) {
    console.error('Email bulk error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Email all applicants by country
router.post('/admin/email-country', async (req, res) => {
  try {
    const { country, status, subject, message, sentBy } = req.body;

    let applications;
    if (status) {
      applications = await VolunteerApplication.getApplicationsByStatus(status, country);
    } else {
      applications = await VolunteerApplication.getApplicationsByCountry(country);
    }

    if (applications.length === 0) {
      return res.status(404).json({ error: 'No applications found' });
    }

    const results = [];
    const errors = [];

    for (const app of applications) {
      try {
        await sendAdminCommunicationEmail({
          recipientEmail: app.email,
          recipientName: app.email.split('@')[0],
          subject,
          message,
        });

        await VolunteerApplication.logCommunication(
          app.id,
          subject,
          message,
          sentBy || 'Admin'
        );

        results.push({ id: app.id, success: true });
      } catch (err) {
        errors.push({ id: app.id, error: err.message });
      }
    }

    res.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      total: applications.length,
      results,
      errors
    });
  } catch (err) {
    console.error('Email country error:', err);
    res.status(500).json({ error: err.message });
  }
});

console.log('🤝 Volunteer application routes loaded');

module.exports = router;