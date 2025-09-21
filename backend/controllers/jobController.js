const Job = require('../models/jobModel');

// Get all jobs
const getJobs = async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            level: req.query.level,
            location: req.query.location,
            country: req.query.country,
            search: req.query.search,
            sortBy: req.query.sortBy || 'createdAt',
            sortOrder: req.query.sortOrder || 'DESC'
        };

        const result = await Job.getAll(options);
        res.json(result.jobs); // For backward compatibility, return just jobs array
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get single job
const getJob = async (req, res) => {
    try {
        const job = await Job.getById(req.params.id);
        res.json(job);
    } catch (error) {
        if (error.message === 'Job not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get jobs by country (new endpoint for country-specific pages)
const getJobsByCountry = async (req, res) => {
    try {
        const { countryName } = req.params;
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            level: req.query.level,
            location: req.query.location,
            search: req.query.search,
            activeOnly: req.query.activeOnly !== 'false'
        };

        const result = await Job.getByCountry(countryName, options);
        res.json(result);
    } catch (error) {
        console.error('Get jobs by country error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create job
const createJob = async (req, res) => {
    try {
        const { title, level, location, country, description, requirements, salary, lastDate, createdBy } = req.body;

        // Validate required fields (country is now optional)
        if (!title || !level || !location || !description || !requirements) {
            return res.status(400).json({ 
                error: 'Title, level, location, description, and requirements are required' 
            });
        }

        // Validate location enum
        const validLocations = ['Remote', 'In-Person', 'Hybrid'];
        if (!validLocations.includes(location)) {
            return res.status(400).json({
                error: `Location must be one of: ${validLocations.join(', ')}`
            });
        }

        const newJob = await Job.create({
            title: title.trim(),
            level: level.trim(),
            location,
            country: country?.trim() || 'Not Specified',
            description: description.trim(),
            requirements: requirements.trim(),
            salary: salary?.trim() || null,
            lastDate: lastDate ? new Date(lastDate) : null,
            createdBy: createdBy?.trim() || 'Unknown',
        });

        res.status(201).json(newJob);
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update job
const updateJob = async (req, res) => {
    try {
        const { title, level, location, country, description, requirements, salary, lastDate, createdBy } = req.body;
        const id = req.params.id;

        // Validate required fields (country is now optional)
        if (!title || !level || !location || !description || !requirements) {
            return res.status(400).json({ 
                error: 'Title, level, location, description, and requirements are required' 
            });
        }

        // Validate location enum
        const validLocations = ['Remote', 'In-Person', 'Hybrid'];
        if (!validLocations.includes(location)) {
            return res.status(400).json({
                error: `Location must be one of: ${validLocations.join(', ')}`
            });
        }

        const updated = await Job.update(id, {
            title: title.trim(),
            level: level.trim(),
            location,
            country: country?.trim() || 'Not Specified',
            description: description.trim(),
            requirements: requirements.trim(),
            salary: salary?.trim() || null,
            lastDate: lastDate ? new Date(lastDate) : null,
            createdBy: createdBy?.trim() || 'Unknown',
        });

        res.json(updated);
    } catch (error) {
        if (error.message === 'Job not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// Delete job
const deleteJob = async (req, res) => {
    try {
        const result = await Job.delete(req.params.id);
        res.json(result);
    } catch (error) {
        if (error.message === 'Job not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get filter options
const getFilterOptions = async (req, res) => {
    try {
        const options = await Job.getFilterOptions();
        res.json(options);
    } catch (error) {
        console.error('Get filter options error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get job statistics
const getJobStats = async (req, res) => {
    try {
        const stats = await Job.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Get job stats error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getJobs,
    getJob,
    getJobsByCountry,
    createJob,
    updateJob,
    deleteJob,
    getFilterOptions,
    getJobStats
};