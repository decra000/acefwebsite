const Project = require('../models/Project');

// Create Project
async function createProject(data) {
  try {
    const newItem = new Project(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Project
async function getAllProject() {
  try {
    return await Project.find();
  } catch (err) {
    throw err;
  }
}

// Get Project by ID
async function getProjectById(id) {
  try {
    return await Project.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Project
async function updateProject(id, data) {
  try {
    return await Project.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Project
async function deleteProject(id) {
  try {
    return await Project.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createProject,
  getAllProject,
  getProjectById,
  updateProject,
  deleteProject
};
