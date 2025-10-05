// backend\services\actions\TeamActions.js
const Team = require('../models/Team');

// Create Team
async function createTeam(data) {
  try {
    const newItem = new Team(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Team
async function getAllTeam() {
  try {
    return await Team.find();
  } catch (err) {
    throw err;
  }
}

// Get Team by ID
async function getTeamById(id) {
  try {
    return await Team.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Team
async function updateTeam(id, data) {
  try {
    return await Team.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Team
async function deleteTeam(id) {
  try {
    return await Team.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createTeam,
  getAllTeam,
  getTeamById,
  updateTeam,
  deleteTeam
};
