const countryModel = require('../models/countryContactModel');

// Input validation helper
const validateContactData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate && !data.country) {
    errors.push('Country is required');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (data.phone && !/^[\+]?[0-9\s\-\(\)]{7,}$/.test(data.phone)) {
    errors.push('Invalid phone format');
  }
  
  return errors;
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await countryModel.getAllContacts();
    res.json(contacts);
  } catch (err) {
    console.error('Get all contacts error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      success: false
    });
  }
};

const getContactByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    
    if (!country) {
      return res.status(400).json({ 
        message: 'Country parameter is required',
        success: false
      });
    }

    const contact = await countryModel.getCountryContact(country);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Country contact not found',
        success: false
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
  } catch (err) {
    console.error('Get contact by country error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      success: false
    });
  }
};

const createContact = async (req, res) => {
  try {
    const { country } = req.params;
    const contactData = req.body;

    // Validate input
    const validationErrors = validateContactData({ ...contactData, country });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
        success: false
      });
    }

    // Check if contact already exists
    const existingContact = await countryModel.getCountryContact(country);
    if (existingContact) {
      return res.status(409).json({
        message: 'Contact for this country already exists',
        success: false
      });
    }

    const result = await countryModel.createCountryContact(country, contactData);
    
    res.status(201).json({ 
      message: 'Contact created successfully',
      success: true,
      data: { id: result.insertId, country, ...contactData }
    });
  } catch (err) {
    console.error('Create contact error:', err);
    res.status(500).json({ 
      message: 'Failed to create contact', 
      error: err.message,
      success: false
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const { country } = req.params;
    const contactData = req.body;

    if (!country) {
      return res.status(400).json({
        message: 'Country parameter is required',
        success: false
      });
    }

    // Validate input
    const validationErrors = validateContactData(contactData, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
        success: false
      });
    }

    // Check if contact exists
    const existingContact = await countryModel.getCountryContact(country);
    if (!existingContact) {
      return res.status(404).json({
        message: 'Contact not found for this country',
        success: false
      });
    }

    const updated = await countryModel.updateCountryContact(country, contactData);

    if (updated.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'No changes made or country not found',
        success: false
      });
    }

    res.json({ 
      message: 'Contact updated successfully',
      success: true,
      data: { country, ...contactData }
    });
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      success: false
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { country } = req.params;

    if (!country) {
      return res.status(400).json({
        message: 'Country parameter is required',
        success: false
      });
    }

    // Check if contact exists before deletion
    const existingContact = await countryModel.getCountryContact(country);
    if (!existingContact) {
      return res.status(404).json({
        message: 'Contact not found for this country',
        success: false
      });
    }

    const deleted = await countryModel.deleteCountryContact(country);
    
    if (deleted.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Contact not found',
        success: false
      });
    }

    res.json({ 
      message: 'Contact deleted successfully',
      success: true
    });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      success: false
    });
  }
};

module.exports = {
  getAllContacts,
  getContactByCountry,
  createContact,
  updateContact,
  deleteContact
};