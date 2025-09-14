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

module.exports = {
  getAllApplications,
  getApplicationsByJob,
  createApplication,
  deleteApplication,
  checkExistingApplication,
};