const eventModel = require('../models/eventModel');

// Create eventModel
async function createeventModel(data) {
  try {
    const newItem = new eventModel(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all eventModel
async function getAlleventModel() {
  try {
    return await eventModel.find();
  } catch (err) {
    throw err;
  }
}

// Get eventModel by ID
async function geteventModelById(id) {
  try {
    return await eventModel.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update eventModel
async function updateeventModel(id, data) {
  try {
    return await eventModel.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete eventModel
async function deleteeventModel(id) {
  try {
    return await eventModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createeventModel,
  getAlleventModel,
  geteventModelById,
  updateeventModel,
  deleteeventModel
};
