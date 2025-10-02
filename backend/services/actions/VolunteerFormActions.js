const VolunteerForm = require('../models/VolunteerForm');

// Create VolunteerForm
async function createVolunteerForm(data) {
  try {
    const newItem = new VolunteerForm(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all VolunteerForm
async function getAllVolunteerForm() {
  try {
    return await VolunteerForm.find();
  } catch (err) {
    throw err;
  }
}

// Get VolunteerForm by ID
async function getVolunteerFormById(id) {
  try {
    return await VolunteerForm.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update VolunteerForm
async function updateVolunteerForm(id, data) {
  try {
    return await VolunteerForm.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete VolunteerForm
async function deleteVolunteerForm(id) {
  try {
    return await VolunteerForm.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createVolunteerForm,
  getAllVolunteerForm,
  getVolunteerFormById,
  updateVolunteerForm,
  deleteVolunteerForm
};
