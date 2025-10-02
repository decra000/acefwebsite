const Newsletter = require('../models/Newsletter');

// Create Newsletter
async function createNewsletter(data) {
  try {
    const newItem = new Newsletter(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Newsletter
async function getAllNewsletter() {
  try {
    return await Newsletter.find();
  } catch (err) {
    throw err;
  }
}

// Get Newsletter by ID
async function getNewsletterById(id) {
  try {
    return await Newsletter.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Newsletter
async function updateNewsletter(id, data) {
  try {
    return await Newsletter.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Newsletter
async function deleteNewsletter(id) {
  try {
    return await Newsletter.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createNewsletter,
  getAllNewsletter,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter
};
