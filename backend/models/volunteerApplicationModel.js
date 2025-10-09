const { executeQuery } = require('../config/database');

// Get all applications
const getAllApplications = async () => {
  return await executeQuery(
    'SELECT * FROM volunteer_applications ORDER BY created_at DESC'
  );
};

// Get applications by country
const getApplicationsByCountry = async (country) => {
  return await executeQuery(
    'SELECT * FROM volunteer_applications WHERE application_country = ? ORDER BY created_at DESC',
    [country]
  );
};

// Get applications by status
const getApplicationsByStatus = async (status, country = null) => {
  if (country) {
    return await executeQuery(
      'SELECT * FROM volunteer_applications WHERE status = ? AND application_country = ? ORDER BY created_at DESC',
      [status, country]
    );
  }
  return await executeQuery(
    'SELECT * FROM volunteer_applications WHERE status = ? ORDER BY created_at DESC',
    [status]
  );
};

// Get single application
const getApplicationById = async (id) => {
  const result = await executeQuery(
    'SELECT * FROM volunteer_applications WHERE id = ?',
    [id]
  );
  return result[0];
};

// Check if email already applied
const checkExistingApplication = async (email, country) => {
  const result = await executeQuery(
    'SELECT id FROM volunteer_applications WHERE email = ? AND application_country = ?',
    [email.toLowerCase().trim(), country]
  );
  return result.length > 0;
};

// Create application
const createApplication = async (applicationData) => {
  const {
    email, nationality, country_of_residence, city_of_residence,
    application_country, core_professional_area, skills, interests,
    time_commitment_weeks, preferred_duration, anticipated_start_date,
    engagement_preference, confirmed_in_person, why_volunteer,
    is_study_program, has_sponsor, sponsor_name, sponsor_type,
    sponsor_documents_url, sponsor_notes, open_to_sponsorship_connections,
    additional_remarks
  } = applicationData;

  const result = await executeQuery(
    `INSERT INTO volunteer_applications (
      email, nationality, country_of_residence, city_of_residence,
      application_country, core_professional_area, skills, interests,
      time_commitment_weeks, preferred_duration, anticipated_start_date,
      engagement_preference, confirmed_in_person, why_volunteer,
      is_study_program, has_sponsor, sponsor_name, sponsor_type,
      sponsor_documents_url, sponsor_notes, open_to_sponsorship_connections,
      additional_remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      email.toLowerCase().trim(), 
      nationality, 
      country_of_residence, 
      city_of_residence, 
      application_country, 
      core_professional_area || null, 
      skills || null, 
      interests || null, 
      time_commitment_weeks || null, 
      preferred_duration || null, 
      anticipated_start_date || null, 
      engagement_preference || null, 
      confirmed_in_person || 0, 
      why_volunteer || null, 
      is_study_program || 0, 
      has_sponsor || 0, 
      sponsor_name || null, 
      sponsor_type || null, 
      sponsor_documents_url || null, 
      sponsor_notes || null, 
      open_to_sponsorship_connections || 0, 
      additional_remarks || null
    ]
  );

  return getApplicationById(result.insertId);
};

// Update application status
const updateApplicationStatus = async (id, status, reason, reviewedBy) => {
  // Get current status for history
  const current = await getApplicationById(id);
  
  // Update application
  await executeQuery(
    `UPDATE volunteer_applications 
     SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = ?`,
    [status, reason, reviewedBy, id]
  );

  // Add to status history
  await executeQuery(
    `INSERT INTO volunteer_status_history (application_id, old_status, new_status, changed_by, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [id, current.status, status, reviewedBy, reason]
  );

  return getApplicationById(id);
};

// Update application notes
const updateApplicationNotes = async (id, notes) => {
  await executeQuery(
    'UPDATE volunteer_applications SET admin_notes = ?, updated_at = NOW() WHERE id = ?',
    [notes, id]
  );
  return getApplicationById(id);
};

// Get status history for application
const getStatusHistory = async (applicationId) => {
  return await executeQuery(
    'SELECT * FROM volunteer_status_history WHERE application_id = ? ORDER BY created_at DESC',
    [applicationId]
  );
};

// Log communication
const logCommunication = async (applicationId, subject, message, sentBy) => {
  const result = await executeQuery(
    'INSERT INTO volunteer_communications (application_id, subject, message, sent_by) VALUES (?, ?, ?, ?)',
    [applicationId, subject, message, sentBy]
  );
  return { id: result.insertId };
};

// Get communications for application
const getCommunications = async (applicationId) => {
  return await executeQuery(
    'SELECT * FROM volunteer_communications WHERE application_id = ? ORDER BY sent_at DESC',
    [applicationId]
  );
};

// Delete application
const deleteApplication = async (id) => {
  await executeQuery('DELETE FROM volunteer_applications WHERE id = ?', [id]);
  return { message: 'Application deleted successfully' };
};

// Get statistics by country
const getCountryStatistics = async (country) => {
  const stats = await executeQuery(
    `SELECT 
      status,
      COUNT(*) as count
     FROM volunteer_applications 
     WHERE application_country = ?
     GROUP BY status`,
    [country]
  );
  
  return {
    country,
    total: stats.reduce((sum, s) => sum + s.count, 0),
    by_status: stats
  };
};

module.exports = {
  getAllApplications,
  getApplicationsByCountry,
  getApplicationsByStatus,
  getApplicationById,
  checkExistingApplication,
  createApplication,
  updateApplicationStatus,
  updateApplicationNotes,
  getStatusHistory,
  logCommunication,
  getCommunications,
  deleteApplication,
  getCountryStatistics
};