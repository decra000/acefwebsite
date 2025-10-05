// ===== JOB APPLICATION MODEL (models/jobApplicationModel.js) =====
const { executeQuery } = require('../config/database');

// Get all applications (admin only)
const getAllApplications = async () => {
  return await executeQuery(`
    SELECT ja.*, j.title as job_title 
    FROM job_applications ja 
    LEFT JOIN jobs j ON ja.jobId = j.id 
    ORDER BY ja.createdAt DESC
  `);
};

// Get applications for specific job
const getApplicationsByJob = async (jobId) => {
  return await executeQuery(
    'SELECT * FROM job_applications WHERE jobId = ? ORDER BY createdAt DESC',
    [jobId]
  );
};

// Create new application - FIXED TO MATCH YOUR SCHEMA
const createApplication = async ({ jobId, name, email, phone, coverLetter, cvPath, cvFilename }) => {
  const result = await executeQuery(
    'INSERT INTO job_applications (jobId, name, email, phone, coverLetter, cvPath, cvFilename, appliedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
    [jobId, name, email, phone, coverLetter, cvPath, cvFilename]
  );
  return { 
    id: result.insertId, 
    jobId, 
    name, 
    email, 
    phone, 
    coverLetter, 
    cvPath,
    cvFilename,
    appliedAt: new Date(),
    createdAt: new Date()
  };
};

// Delete application (admin only)
const deleteApplication = async (id) => {
  await executeQuery('DELETE FROM job_applications WHERE id = ?', [id]);
  return { message: 'Application deleted successfully' };
};

// Check if user already applied for this job - FIXED
const checkExistingApplication = async (jobId, email) => {
  const result = await executeQuery(
    'SELECT id FROM job_applications WHERE jobId = ? AND email = ?',
    [jobId, email]
  );
  return result.length > 0;
};

// Add to existing jobApplicationModel.js

// Update application status
const updateApplicationStatus = async (id, status, reason, reviewedBy) => {
  const { executeQuery } = require('../config/database');
  
  // Get current status for history
  const [current] = await executeQuery(
    'SELECT status FROM job_applications WHERE id = ?',
    [id]
  );
  
  if (!current) {
    throw new Error('Application not found');
  }
  
  // Update application
  await executeQuery(
    `UPDATE job_applications 
     SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
     WHERE id = ?`,
    [status, reason, reviewedBy, id]
  );

  // Add to status history
  await executeQuery(
    `INSERT INTO job_application_status_history (application_id, old_status, new_status, changed_by, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [id, current.status, status, reviewedBy, reason]
  );

  return getApplicationById(id);
};

// Get single application by ID
const getApplicationById = async (id) => {
  const { executeQuery } = require('../config/database');
  const result = await executeQuery(
    'SELECT * FROM job_applications WHERE id = ?',
    [id]
  );
  return result[0];
};

// Update application notes
const updateApplicationNotes = async (id, notes) => {
  const { executeQuery } = require('../config/database');
  await executeQuery(
    'UPDATE job_applications SET admin_notes = ? WHERE id = ?',
    [notes, id]
  );
  return getApplicationById(id);
};

// Get status history
const getStatusHistory = async (applicationId) => {
  const { executeQuery } = require('../config/database');
  return await executeQuery(
    'SELECT * FROM job_application_status_history WHERE application_id = ? ORDER BY created_at DESC',
    [applicationId]
  );
};

// Log communication
const logCommunication = async (applicationId, subject, message, sentBy) => {
  const { executeQuery } = require('../config/database');
  const result = await executeQuery(
    'INSERT INTO job_application_communications (application_id, subject, message, sent_by) VALUES (?, ?, ?, ?)',
    [applicationId, subject, message, sentBy]
  );
  return { id: result.insertId };
};

// Get communications
const getCommunications = async (applicationId) => {
  const { executeQuery } = require('../config/database');
  return await executeQuery(
    'SELECT * FROM job_application_communications WHERE application_id = ? ORDER BY sent_at DESC',
    [applicationId]
  );
};



module.exports = {
  getAllApplications,
  getApplicationsByJob,
  createApplication,
  deleteApplication,
  checkExistingApplication,
  updateApplicationStatus,
  getApplicationById,
  updateApplicationNotes,
  getStatusHistory,
  logCommunication,
  getCommunications
};