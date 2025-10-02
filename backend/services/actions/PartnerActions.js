const Partner = require('../models/Partner');

// Create Partner
async function createPartner(data) {
  try {
    const newItem = new Partner(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Partner
async function getAllPartner() {
  try {
    return await Partner.find();
  } catch (err) {
    throw err;
  }
}

// Get Partner by ID
async function getPartnerById(id) {
  try {
    return await Partner.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Partner
async function updatePartner(id, data) {
  try {
    return await Partner.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Partner
async function deletePartner(id) {
  try {
    return await Partner.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createPartner,
  getAllPartner,
  getPartnerById,
  updatePartner,
  deletePartner
};
