const videoSectionModel = require('../models/videoSectionModel');

// Create videoSectionModel
async function createvideoSectionModel(data) {
  try {
    const newItem = new videoSectionModel(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all videoSectionModel
async function getAllvideoSectionModel() {
  try {
    return await videoSectionModel.find();
  } catch (err) {
    throw err;
  }
}

// Get videoSectionModel by ID
async function getvideoSectionModelById(id) {
  try {
    return await videoSectionModel.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update videoSectionModel
async function updatevideoSectionModel(id, data) {
  try {
    return await videoSectionModel.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete videoSectionModel
async function deletevideoSectionModel(id) {
  try {
    return await videoSectionModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createvideoSectionModel,
  getAllvideoSectionModel,
  getvideoSectionModelById,
  updatevideoSectionModel,
  deletevideoSectionModel
};
