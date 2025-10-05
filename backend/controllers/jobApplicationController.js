const JobApplication = require('../models/jobApplicationModel');
const { getFileUrl, deleteFile } = require('../middleware/upload');
const mailerService = require("../utils/mailer");

// Get all applications (admin only)
const getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.getAllApplications();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get applications for specific job
const getJobApplications = async (req, res) => {
  try {
    const applications = await JobApplication.getApplicationsByJob(req.params.jobId);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single application
const getApplication = async (req, res) => {
  try {
    const application = await JobApplication.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new application
const createApplication = async (req, res) => {
  try {
    const { job_id, name, email, phone, coverLetter } = req.body;

    if (!job_id || !name || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Job ID, name, and email are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    const existingApplication = await JobApplication.checkExistingApplication(job_id, email.toLowerCase().trim());
    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        error: 'You have already applied for this job' 
      });
    }

    const cvPath = req.file ? getFileUrl(req, req.file.filename, 'resumes') : null;
    const cvFilename = req.file ? req.file.originalname : null;

    const newApplication = await JobApplication.createApplication({
      jobId: parseInt(job_id),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      coverLetter: coverLetter?.trim() || '',
      cvPath,
      cvFilename,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplication
    });
  } catch (err) {
    console.error("Create application error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Helper functions for status emails
function getStatusEmailSubject(status, jobTitle) {
  const subjects = {
    'under_review': `Application Under Review - ${jobTitle} Position`,
    'shortlisted': `You've Been Shortlisted - ${jobTitle} Position`,
    'interview_scheduled': `Interview Scheduled - ${jobTitle} Position`,
    'accepted': `Congratulations! Job Offer - ${jobTitle} Position`,
    'rejected': `Update on Your Application - ${jobTitle} Position`
  };
  return subjects[status] || `Application Status Update - ${jobTitle}`;
}

function getStatusEmailMessage(status, reason, application, jobTitle) {
  const messages = {
    'under_review': `Thank you for applying for the ${jobTitle} position at ACEF!

We're pleased to inform you that your application is now under review by our hiring team. We're carefully evaluating your qualifications and experience.

What happens next:
- Our team will review your application and resume
- We may reach out for additional information if needed
- You'll hear from us within 5-7 business days

Thank you for your interest in joining the ACEF team!`,

    'shortlisted': `Great news! Your application for the ${jobTitle} position has been shortlisted!

This means you've progressed to the next stage of our hiring process. Your qualifications have impressed our team.

Next Steps:
- Expect a call or email to schedule an interview within 3-5 business days
- Please keep your phone and email accessible
- Prepare to discuss your experience and qualifications in detail

We're excited about the possibility of having you join our team!`,

    'interview_scheduled': `Your interview for the ${jobTitle} position has been scheduled!

Details will be sent in a separate email, but we wanted to let you know to prepare for the next step.

Interview Preparation Tips:
- Review the job description and requirements
- Prepare examples of your relevant experience
- Research ACEF and our mission
- Prepare questions you'd like to ask us

We look forward to meeting you!`,

    'accepted': `Congratulations! We're thrilled to offer you the ${jobTitle} position at ACEF!

Welcome to the team! Your skills and experience will be a valuable addition to our organization.

Next Steps:
- You'll receive a formal offer letter within 24-48 hours
- Please review and sign the offer documents
- Our HR team will contact you with onboarding details

We can't wait to have you join us in our mission!`,

    'rejected': `Thank you for applying for the ${jobTitle} position at ACEF.

After careful consideration, we regret to inform you that we won't be moving forward with your application at this time.

${reason ? `Feedback: ${reason}` : 'While your qualifications are impressive, we had to make difficult decisions based on specific role requirements and team needs.'}

We encourage you to:
- Apply for other positions at ACEF that match your skills
- Stay connected with us for future opportunities
- Continue pursuing your career goals

Thank you for your interest in ACEF, and we wish you all the best in your job search.`
  };

  return messages[status] || `Your application status has been updated to: ${status.replace(/_/g, ' ')}`;
}

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, reviewedBy, jobTitle } = req.body;

    const validStatuses = ['pending', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'rejected' && !reason) {
      return res.status(400).json({ 
        error: 'Rejection reason is required' 
      });
    }

    const updatedApplication = await JobApplication.updateApplicationStatus(
      id,
      status,
      reason,
      reviewedBy || 'Admin'
    );

    // Send email notification
    try {
      const emailSubject = getStatusEmailSubject(status, jobTitle || 'ACEF Position');
      const emailMessage = getStatusEmailMessage(status, reason, updatedApplication, jobTitle || 'ACEF Position');
      
      await mailerService.sendAdminCommunicationEmail({
        recipientEmail: updatedApplication.email,
        recipientName: updatedApplication.name,
        subject: emailSubject,
        message: emailMessage
      });

      // Log the communication
      await JobApplication.logCommunication(
        id,
        emailSubject,
        emailMessage,
        reviewedBy || 'Admin'
      );

      console.log(`Email sent to ${updatedApplication.email} for status: ${status}`);
    } catch (emailError) {
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

// Update application notes
const updateApplicationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const updatedApplication = await JobApplication.updateApplicationNotes(id, notes);

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
    const history = await JobApplication.getStatusHistory(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get communications
const getCommunications = async (req, res) => {
  try {
    const communications = await JobApplication.getCommunications(req.params.id);
    res.json(communications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete application
const deleteApplication = async (req, res) => {
  try {
    const result = await JobApplication.deleteApplication(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manual email reply (existing functionality)
const replyToApplication = async (req, res) => {
  try {
    const { applicantEmail, applicantName, jobTitle, message, subject } = req.body;

    if (!applicantEmail || !applicantName || !jobTitle || !message) {
      return res.status(400).json({ 
        success: false, 
        msg: "Missing required fields" 
      });
    }

    await mailerService.sendJobApplicationEmail({
      to: applicantEmail,
      subject: subject || `Response to your ${jobTitle} application`,
      applicantName,
      jobTitle,
      message,
    });

    res.status(200).json({ success: true, msg: "Email sent successfully" });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      msg: "Failed to send email", 
      error: error.message 
    });
  }
};

module.exports = {
  getAllApplications,
  getJobApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  updateApplicationNotes,
  getStatusHistory,
  getCommunications,
  deleteApplication,
  replyToApplication
};