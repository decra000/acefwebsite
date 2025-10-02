const Job = require('../models/Job');

// Create Job
async function createJob(data) {
  try {
    const newItem = new Job(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Job
async function getAllJob() {
  try {
    return await Job.find();
  } catch (err) {
    throw err;
  }
}

// Get Job by ID
async function getJobById(id) {
  try {
    return await Job.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Job
async function updateJob(id, data) {
  try {
    return await Job.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Job
async function deleteJob(id) {
  try {
    return await Job.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createJob,
  getAllJob,
  getJobById,
  updateJob,
  deleteJob
};
