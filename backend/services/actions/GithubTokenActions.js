const GithubToken = require('../models/GithubToken');

// Create GithubToken
async function createGithubToken(data) {
  try {
    const newItem = new GithubToken(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all GithubToken
async function getAllGithubToken() {
  try {
    return await GithubToken.find();
  } catch (err) {
    throw err;
  }
}

// Get GithubToken by ID
async function getGithubTokenById(id) {
  try {
    return await GithubToken.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update GithubToken
async function updateGithubToken(id, data) {
  try {
    return await GithubToken.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete GithubToken
async function deleteGithubToken(id) {
  try {
    return await GithubToken.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createGithubToken,
  getAllGithubToken,
  getGithubTokenById,
  updateGithubToken,
  deleteGithubToken
};
