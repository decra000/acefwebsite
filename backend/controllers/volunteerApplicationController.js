const VolunteerApplication = require('../models/volunteerApplicationModel');
const mailerService = require('../utils/mailer');

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await VolunteerApplication.getAllApplications();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get applications by country
const getApplicationsByCountry = async (req, res) => {
  try {
    const applications = await VolunteerApplication.getApplicationsByCountry(
      req.params.country
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get applications by status
const getApplicationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { country } = req.query;
    const applications = await VolunteerApplication.getApplicationsByStatus(
      status,
      country
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single application
const getApplication = async (req, res) => {
  try {
    const application = await VolunteerApplication.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create application (public)
const createApplication = async (req, res) => {
  try {
    const applicationData = req.body;

    // Validate required fields
    const requiredFields = [
      'email', 'nationality', 'country_of_residence', 
      'city_of_residence', 'application_country'
    ];

    for (const field of requiredFields) {
      if (!applicationData[field]) {
        return res.status(400).json({ 
          error: `${field.replace(/_/g, ' ')} is required` 
        });
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicationData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check for duplicate application
    const exists = await VolunteerApplication.checkExistingApplication(
      applicationData.email,
      applicationData.application_country
    );

    if (exists) {
      return res.status(400).json({ 
        error: 'You have already submitted an application for this country' 
      });
    }

    // Validate conditional fields
    if (applicationData.engagement_preference === 'in-person' && 
        !applicationData.confirmed_in_person) {
      return res.status(400).json({ 
        error: 'Please confirm your availability for in-person volunteering' 
      });
    }

    if (applicationData.has_sponsor && !applicationData.sponsor_name) {
      return res.status(400).json({ 
        error: 'Sponsor name is required when you have a sponsor' 
      });
    }

    // Create application
    const newApplication = await VolunteerApplication.createApplication(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to generate email subject based on status
function getStatusEmailSubject(status, country) {
  const subjects = {
    'under_review': `Application Under Review - ACEF ${country} Volunteer Program`,
    'shortlisted': `You've Been Shortlisted - ACEF ${country} Volunteer Program`,
    'accepted': `Congratulations! Application Accepted - ACEF ${country}`,
    'rejected': `Update on Your Application - ACEF ${country} Volunteer Program`
  };
  return subjects[status] || `Application Status Update - ACEF ${country}`;
}

// Helper function to generate email message based on status
function getStatusEmailMessage(status, reason, application) {
  const { application_country, anticipated_start_date } = application;
  
  const messages = {
    'under_review': `Thank you for your interest in volunteering with ACEF in ${application_country}!

We're pleased to inform you that your application is now under review by our team. We're carefully evaluating your qualifications, experience, and motivation to ensure the best match for our programs.

What happens next:
- Our team will review your application in detail
- We may reach out for additional information if needed
- You'll hear from us within 7-10 business days

Thank you for your patience and interest in contributing to climate action in Africa!`,

    'shortlisted': `Great news! Your application for the ACEF ${application_country} volunteer program has been shortlisted!

This means you've progressed to the next stage of our selection process. Your qualifications and motivation have impressed our review team.

Next Steps:
- Expect a call or video interview within the next 5 business days
- Please keep an eye on your email for scheduling details
- Prepare to discuss your experience and availability in more detail

We're excited about the possibility of having you join our team!`,

    'accepted': `Congratulations! We're thrilled to inform you that your application has been ACCEPTED for the ACEF ${application_country} volunteer program!

Welcome to the ACEF family! Your skills, passion, and commitment to climate action will make a real difference.

Next Steps:
- You'll receive a separate email within 48 hours with onboarding instructions
- Please confirm your availability starting ${anticipated_start_date ? new Date(anticipated_start_date).toLocaleDateString() : 'as discussed'}
- Complete any required documentation we send you

We can't wait to work with you in building climate resilience across Africa!`,

    'rejected': `Thank you for your interest in volunteering with ACEF in ${application_country}.

After careful consideration, we regret to inform you that we won't be able to move forward with your application at this time.

${reason ? `Feedback: ${reason}` : 'While your application showed merit, we had to make difficult choices based on specific program needs and available positions.'}

This decision doesn't diminish the value of your skills and commitment to climate action. We encourage you to:
- Apply for future opportunities with ACEF
- Stay connected with our work and mission
- Continue making a difference in environmental conservation

Thank you for considering ACEF, and we wish you all the best in your future endeavors.`
  };

  return messages[status] || `Your volunteer application status has been updated to: ${status.replace(/_/g, ' ')}`;
}

// Update application status (admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, reviewedBy } = req.body;

    const validStatuses = ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'rejected' && !reason) {
      return res.status(400).json({ 
        error: 'Rejection reason is required' 
      });
    }

    const updatedApplication = await VolunteerApplication.updateApplicationStatus(
      id,
      status,
      reason,
      reviewedBy || 'Admin'
    );

    // Send email notification based on status
    try {
      const emailSubject = getStatusEmailSubject(status, updatedApplication.application_country);
      const emailMessage = getStatusEmailMessage(status, reason, updatedApplication);
      
      await mailerService.sendAdminCommunicationEmail({
        recipientEmail: updatedApplication.email,
        recipientName: updatedApplication.email.split('@')[0],
        subject: emailSubject,
        message: emailMessage
      });

      // Log the communication
      await VolunteerApplication.logCommunication(
        id,
        emailSubject,
        emailMessage,
        reviewedBy || 'Admin'
      );

      console.log(`Email sent to ${updatedApplication.email} for status: ${status}`);
    } catch (emailError) {
      // Don't fail the status update if email fails
      console.error('Failed to send status change email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Application status updated and notification sent',
      application: updatedApplication
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update application notes (admin)
const updateApplicationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const updatedApplication = await VolunteerApplication.updateApplicationNotes(
      id,
      notes
    );

    res.json({
      success: true,
      message: 'Notes updated',
      application: updatedApplication
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get status history
const getStatusHistory = async (req, res) => {
  try {
    const history = await VolunteerApplication.getStatusHistory(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get communications
const getCommunications = async (req, res) => {
  try {
    const communications = await VolunteerApplication.getCommunications(req.params.id);
    res.json(communications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete application (admin)
const deleteApplication = async (req, res) => {
  try {
    const result = await VolunteerApplication.deleteApplication(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get country statistics
const getCountryStatistics = async (req, res) => {
  try {
    const stats = await VolunteerApplication.getCountryStatistics(req.params.country);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllApplications,
  getApplicationsByCountry,
  getApplicationsByStatus,
  getApplication,
  createApplication,
  updateApplicationStatus,
  updateApplicationNotes,
  getStatusHistory,
  getCommunications,
  deleteApplication,
  getCountryStatistics
};