const Contact = require('../models/Contact');

// Create Contact
async function createContact(data) {
  try {
    const newItem = new Contact(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all Contact
async function getAllContact() {
  try {
    return await Contact.find();
  } catch (err) {
    throw err;
  }
}

// Get Contact by ID
async function getContactById(id) {
  try {
    return await Contact.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update Contact
async function updateContact(id, data) {
  try {
    return await Contact.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete Contact
async function deleteContact(id) {
  try {
    return await Contact.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createContact,
  getAllContact,
  getContactById,
  updateContact,
  deleteContact
};
