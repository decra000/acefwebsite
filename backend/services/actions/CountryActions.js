const Country = require('../models/Country');

// Create Country
async function createCountry(data) {
  try {
    const newItem = new Country(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Country
async function getAllCountry() {
  try {
    return await Country.find();
  } catch (err) {
    throw err;
  }
}

// Get Country by ID
async function getCountryById(id) {
  try {
    return await Country.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Country
async function updateCountry(id, data) {
  try {
    return await Country.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Country
async function deleteCountry(id) {
  try {
    return await Country.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createCountry,
  getAllCountry,
  getCountryById,
  updateCountry,
  deleteCountry
};
