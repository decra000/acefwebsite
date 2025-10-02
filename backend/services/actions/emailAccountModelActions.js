const emailAccountModel = require('../models/emailAccountModel');

// Create emailAccountModel
async function createemailAccountModel(data) {
  try {
    const newItem = new emailAccountModel(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all emailAccountModel
async function getAllemailAccountModel() {
  try {
    return await emailAccountModel.find();
  } catch (err) {
    throw err;
  }
}

// Get emailAccountModel by ID
async function getemailAccountModelById(id) {
  try {
    return await emailAccountModel.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update emailAccountModel
async function updateemailAccountModel(id, data) {
  try {
    return await emailAccountModel.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete emailAccountModel
async function deleteemailAccountModel(id) {
  try {
    return await emailAccountModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createemailAccountModel,
  getAllemailAccountModel,
  getemailAccountModelById,
  updateemailAccountModel,
  deleteemailAccountModel
};
