// ===== JOB MODEL (models/jobModel.js) =====
const { executeQuery } = require('../config/database');

// Get all jobs
const getAllJobs = async () => {
  return await executeQuery('SELECT * FROM jobs ORDER BY createdAt DESC');
};

// Get single job
const getJobById = async (id) => {
  const result = await executeQuery('SELECT * FROM jobs WHERE id = ?', [id]);
  return result[0];
};

// Create job
const createJob = async ({ title, level, location, description, requirements, salary, lastDate, createdBy }) => {
  const result = await executeQuery(
    'INSERT INTO jobs (title, level, location, description, requirements, salary, lastDate, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [title, level, location, description, requirements, salary, lastDate, createdBy]
  );
  return { 
    id: result.insertId, 
    title, 
    level, 
    location, 
    description, 
    requirements, 
    salary, 
    lastDate, 
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Update job
const updateJob = async (id, { title, level, location, description, requirements, salary, lastDate, createdBy }) => {
  await executeQuery(
    'UPDATE jobs SET title = ?, level = ?, location = ?, description = ?, requirements = ?, salary = ?, lastDate = ?, createdBy = ?, updatedAt = NOW() WHERE id = ?',
    [title, level, location, description, requirements, salary, lastDate, createdBy, id]
  );
  return getJobById(id);
};

// Delete job
const deleteJob = async (id) => {
  await executeQuery('DELETE FROM jobs WHERE id = ?', [id]);
  return { message: 'Job deleted successfully' };
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};