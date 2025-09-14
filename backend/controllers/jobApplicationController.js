// ===== JOB APPLICATION CONTROLLER (controllers/jobApplicationController.js) =====
const JobApplication = require('../models/jobApplicationModel');
const { getFileUrl, deleteFile } = require('../middleware/upload');
const { sendJobApplicationEmail } = require("../utils/mailer");

const path = require('path');

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

// Create new application - UPDATED TO MATCH YOUR SCHEMA
const createApplication = async (req, res) => {
  try {
    const { job_id, name, email, phone, coverLetter } = req.body;

    // Validate required fields
    if (!job_id || !name || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Job ID, name, and email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Check if user already applied for this job
    const existingApplication = await JobApplication.checkExistingApplication(job_id, email.toLowerCase().trim());
    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        error: 'You have already applied for this job' 
      });
    }

    // Handle resume upload - MATCH YOUR SCHEMA
    const cvPath = req.file ? getFileUrl(req, req.file.filename, 'resumes') : null;
    const cvFilename = req.file ? req.file.originalname : null;

    const newApplication = await JobApplication.createApplication({
      jobId: parseInt(job_id), // Convert to match your schema
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

// Delete application (admin only)
const deleteApplication = async (req, res) => {
  try {
    const result = await JobApplication.deleteApplication(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const replyToApplication = async (req, res) => {
  try {
    console.log('📧 Email reply request received:', req.body);
    
    const { applicantEmail, applicantName, jobTitle, message, subject } = req.body;

    // Validate required fields
    if (!applicantEmail || !applicantName || !jobTitle || !message) {
      return res.status(400).json({ 
        success: false, 
        msg: "Missing required fields: applicantEmail, applicantName, jobTitle, message" 
      });
    }

    // Send the email using the correct parameter names
    await sendJobApplicationEmail({
      to: applicantEmail,  // Maps applicantEmail to 'to'
      subject: subject || `Response to your ${jobTitle} application`,  // Use provided subject or default
      applicantName,
      jobTitle,
      message,
    });

    console.log('✅ Email sent successfully to:', applicantEmail);
    res.status(200).json({ success: true, msg: "Email sent successfully" });
  } catch (error) {
    console.error('❌ Error sending email:', error);
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
  createApplication,
  deleteApplication,
  replyToApplication, // ✅ Add this

};