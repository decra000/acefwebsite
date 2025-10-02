const jobApplicationModel = require('../models/jobApplicationModel');

// Create jobApplicationModel
async function createjobApplicationModel(data) {
  try {
    const newItem = new jobApplicationModel(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all jobApplicationModel
async function getAlljobApplicationModel() {
  try {
    return await jobApplicationModel.find();
  } catch (err) {
    throw err;
  }
}

// Get jobApplicationModel by ID
async function getjobApplicationModelById(id) {
  try {
    return await jobApplicationModel.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update jobApplicationModel
async function updatejobApplicationModel(id, data) {
  try {
    return await jobApplicationModel.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete jobApplicationModel
async function deletejobApplicationModel(id) {
  try {
    return await jobApplicationModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createjobApplicationModel,
  getAlljobApplicationModel,
  getjobApplicationModelById,
  updatejobApplicationModel,
  deletejobApplicationModel
};
