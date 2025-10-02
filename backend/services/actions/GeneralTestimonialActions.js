const GeneralTestimonial = require('../models/GeneralTestimonial');

// Create GeneralTestimonial
async function createGeneralTestimonial(data) {
  try {
    const newItem = new GeneralTestimonial(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all GeneralTestimonial
async function getAllGeneralTestimonial() {
  try {
    return await GeneralTestimonial.find();
  } catch (err) {
    throw err;
  }
}

// Get GeneralTestimonial by ID
async function getGeneralTestimonialById(id) {
  try {
    return await GeneralTestimonial.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update GeneralTestimonial
async function updateGeneralTestimonial(id, data) {
  try {
    return await GeneralTestimonial.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete GeneralTestimonial
async function deleteGeneralTestimonial(id) {
  try {
    return await GeneralTestimonial.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createGeneralTestimonial,
  getAllGeneralTestimonial,
  getGeneralTestimonialById,
  updateGeneralTestimonial,
  deleteGeneralTestimonial
};
