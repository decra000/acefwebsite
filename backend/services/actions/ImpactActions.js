const Impact = require('../models/Impact');

// Create Impact
async function createImpact(data) {
  try {
    const newItem = new Impact(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Impact
async function getAllImpact() {
  try {
    return await Impact.find();
  } catch (err) {
    throw err;
  }
}

// Get Impact by ID
async function getImpactById(id) {
  try {
    return await Impact.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Impact
async function updateImpact(id, data) {
  try {
    return await Impact.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Impact
async function deleteImpact(id) {
  try {
    return await Impact.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createImpact,
  getAllImpact,
  getImpactById,
  updateImpact,
  deleteImpact
};
