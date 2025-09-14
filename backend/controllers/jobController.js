const Job = require('../models/jobModel');

// Get all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.getAllJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const job = await Job.getJobById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create job
const createJob = async (req, res) => {
  try {
    const { title, level, location, description, requirements, salary, lastDate, createdBy } = req.body;

    // Validate required fields
    if (!title || !level || !location || !description || !requirements) {
      return res.status(400).json({ 
        error: 'Title, level, location, description, and requirements are required' 
      });
    }

    const newJob = await Job.createJob({
      title: title.trim(),
      level: level.trim(),
      location: location.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      salary: salary?.trim() || null,
      lastDate: lastDate ? new Date(lastDate) : null,
      createdBy: createdBy?.trim() || null,
    });

    res.status(201).json(newJob);
  } catch (err) {
    console.error("CreateJob error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { title, level, location, description, requirements, salary, lastDate, createdBy } = req.body;
    const id = req.params.id;

    const existing = await Job.getJobById(id);
    if (!existing) return res.status(404).json({ message: 'Job not found' });

    // Validate required fields
    if (!title || !level || !location || !description || !requirements) {
      return res.status(400).json({ 
        error: 'Title, level, location, description, and requirements are required' 
      });
    }

    const updated = await Job.updateJob(id, {
      title: title.trim(),
      level: level.trim(),
      location: location.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      salary: salary?.trim() || null,
      lastDate: lastDate ? new Date(lastDate) : null,
      createdBy: createdBy?.trim() || null,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const existing = await Job.getJobById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Job not found' });

    const result = await Job.deleteJob(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
