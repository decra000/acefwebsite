const WhatsappContact = require('../models/WhatsappContact');

// Create WhatsappContact
async function createWhatsappContact(data) {
  try {
    const newItem = new WhatsappContact(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all WhatsappContact
async function getAllWhatsappContact() {
  try {
    return await WhatsappContact.find();
  } catch (err) {
    throw err;
  }
}

// Get WhatsappContact by ID
async function getWhatsappContactById(id) {
  try {
    return await WhatsappContact.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update WhatsappContact
async function updateWhatsappContact(id, data) {
  try {
    return await WhatsappContact.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete WhatsappContact
async function deleteWhatsappContact(id) {
  try {
    return await WhatsappContact.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createWhatsappContact,
  getAllWhatsappContact,
  getWhatsappContactById,
  updateWhatsappContact,
  deleteWhatsappContact
};
