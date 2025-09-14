const express = require('express');
const router = express.Router();
const eventInterestController = require('../controllers/eventInterestController');
const { sendAdminCommunicationEmail } = require('../utils/mailer');

// Public routes
router.post('/', eventInterestController.createInterest);

// Admin routes (add authentication middleware as needed)
router.get('/', eventInterestController.getAllInterests);
router.get('/event/:eventId', eventInterestController.getEventInterests);
router.delete('/:id', eventInterestController.deleteInterest);

// ✅ Admin: email single applicant
router.post('/email-applicant', async (req, res) => {
  const { email, name, subject, message } = req.body;
  try {
    const result = await sendAdminCommunicationEmail({
      recipientEmail: email,
      recipientName: name,
      subject,
      message,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Admin: email multiple applicants
router.post('/email-applicants', async (req, res) => {
  const { applicants, subject, message } = req.body;
  try {
    const results = await Promise.all(
      applicants.map((a) =>
        sendAdminCommunicationEmail({
          recipientEmail: a.email,
          recipientName: a.name,
          subject,
          message,
        })
      )
    );
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
console.log('📧 Event interest routes loaded');

// Add this at the top of your eventInterestRoutes.js file
router.post('/email-applicant', async (req, res) => {
  console.log('📧 Email applicant route hit');
  // ... rest of implementation
});
module.exports = router;
