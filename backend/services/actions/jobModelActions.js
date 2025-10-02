const jobModel = require('../models/jobModel');

// Create jobModel
async function createjobModel(data) {
  try {
    const newItem = new jobModel(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all jobModel
async function getAlljobModel() {
  try {
    return await jobModel.find();
  } catch (err) {
    throw err;
  }
}

// Get jobModel by ID
async function getjobModelById(id) {
  try {
    return await jobModel.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update jobModel
async function updatejobModel(id, data) {
  try {
    return await jobModel.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete jobModel
async function deletejobModel(id) {
  try {
    return await jobModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createjobModel,
  getAlljobModel,
  getjobModelById,
  updatejobModel,
  deletejobModel
};
