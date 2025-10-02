const eventInterestModel = require('../models/eventInterestModel');

// Create eventInterestModel
async function createeventInterestModel(data) {
  try {
    const newItem = new eventInterestModel(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all eventInterestModel
async function getAlleventInterestModel() {
  try {
    return await eventInterestModel.find();
  } catch (err) {
    throw err;
  }
}

// Get eventInterestModel by ID
async function geteventInterestModelById(id) {
  try {
    return await eventInterestModel.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update eventInterestModel
async function updateeventInterestModel(id, data) {
  try {
    return await eventInterestModel.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete eventInterestModel
async function deleteeventInterestModel(id) {
  try {
    return await eventInterestModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createeventInterestModel,
  getAlleventInterestModel,
  geteventInterestModelById,
  updateeventInterestModel,
  deleteeventInterestModel
};
