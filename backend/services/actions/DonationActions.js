const Donation = require('../models/Donation');

// Create Donation
async function createDonation(data) {
  try {
    const newItem = new Donation(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Donation
async function getAllDonation() {
  try {
    return await Donation.find();
  } catch (err) {
    throw err;
  }
}

// Get Donation by ID
async function getDonationById(id) {
  try {
    return await Donation.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Donation
async function updateDonation(id, data) {
  try {
    return await Donation.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Donation
async function deleteDonation(id) {
  try {
    return await Donation.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createDonation,
  getAllDonation,
  getDonationById,
  updateDonation,
  deleteDonation
};
