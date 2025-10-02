const countryContactModel = require('../models/countryContactModel');

// Create countryContactModel
async function createcountryContactModel(data) {
  try {
    const newItem = new countryContactModel(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all countryContactModel
async function getAllcountryContactModel() {
  try {
    return await countryContactModel.find();
  } catch (err) {
    throw err;
  }
}

// Get countryContactModel by ID
async function getcountryContactModelById(id) {
  try {
    return await countryContactModel.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update countryContactModel
async function updatecountryContactModel(id, data) {
  try {
    return await countryContactModel.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete countryContactModel
async function deletecountryContactModel(id) {
  try {
    return await countryContactModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createcountryContactModel,
  getAllcountryContactModel,
  getcountryContactModelById,
  updatecountryContactModel,
  deletecountryContactModel
};
