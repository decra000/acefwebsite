const WhatsappContact = require('../models/WhatsappContact');

// Validation helper functions
const validateWhatsAppNumber = (number) => {
  if (!number || typeof number !== 'string') {
    return 'WhatsApp number is required';
  }

  // Remove all non-digit characters
  const cleaned = number.replace(/\D/g, '');
  
  // Check length
  if (cleaned.length < 7) {
    return 'WhatsApp number is too short';
  }
  
  if (cleaned.length > 15) {
    return 'WhatsApp number is too long';
  }
  
  // Must start with + followed by digits
  if (!number.match(/^\+\d{7,15}$/)) {
    return 'WhatsApp number must be in international format (e.g., +1234567890)';
  }
  
  return null;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, 255); // Match VARCHAR(255) limit
};

exports.getAll = async (req, res) => {
  try {
    console.log('🔵 WhatsApp Controller - getAll() called');
    const numbers = await WhatsappContact.getAll();
    console.log('✅ WhatsApp Controller - getAll() successful, count:', numbers?.length || 0);
    res.json(numbers || []);
  } catch (err) {
    console.error('❌ WhatsApp Controller - getAll() error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: 'Failed to fetch contacts', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }

    const number = await WhatsappContact.getById(parseInt(id));
    
    if (!number) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(number);
  } catch (err) {
    console.error('Error fetching WhatsApp contact:', err);
    res.status(500).json({ 
      message: 'Failed to fetch contact', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('🔵 WhatsApp Controller - create() called with:', req.body);
    const { number, description } = req.body;
    
    // Validate required fields
    if (!number) {
      console.log('❌ WhatsApp Controller - create() validation failed: missing number');
      return res.status(400).json({ message: 'WhatsApp number is required' });
    }
    
    // Validate WhatsApp number format
    const numberValidationError = validateWhatsAppNumber(number);
    if (numberValidationError) {
      console.log('❌ WhatsApp Controller - create() validation failed:', numberValidationError);
      return res.status(400).json({ message: numberValidationError });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      number: sanitizeInput(number),
      description: description ? sanitizeInput(description) : ''
    };
    
    console.log('🔵 WhatsApp Controller - create() sanitized data:', sanitizedData);
    
    const newContact = await WhatsappContact.create(sanitizedData);
    console.log('✅ WhatsApp Controller - create() successful:', newContact);
    res.status(201).json(newContact);
    
  } catch (err) {
    console.error('❌ WhatsApp Controller - create() error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    
    // Handle specific database errors
    if (err.message.includes('already exists')) {
      return res.status(409).json({ message: err.message });
    }
    
    res.status(500).json({ 
      message: 'Failed to create contact', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, description } = req.body;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }
    
    // Validate required fields
    if (!number) {
      return res.status(400).json({ message: 'WhatsApp number is required' });
    }
    
    // Validate WhatsApp number format
    const numberValidationError = validateWhatsAppNumber(number);
    if (numberValidationError) {
      return res.status(400).json({ message: numberValidationError });
    }
    
    // Check if contact exists
    const existingContact = await WhatsappContact.getById(parseInt(id));
    if (!existingContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      number: sanitizeInput(number),
      description: description ? sanitizeInput(description) : ''
    };
    
    // Check if number already exists for another contact
    const duplicateContact = await WhatsappContact.findByNumber(sanitizedData.number);
    if (duplicateContact && duplicateContact.id !== parseInt(id)) {
      return res.status(409).json({ message: 'WhatsApp number already exists for another contact' });
    }
    
    const updated = await WhatsappContact.update(parseInt(id), sanitizedData);
    res.json(updated);
    
  } catch (err) {
    console.error('Error updating WhatsApp contact:', err);
    
    // Handle specific database errors
    if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
      return res.status(409).json({ message: 'WhatsApp number already exists' });
    }
    
    res.status(500).json({ 
      message: 'Failed to update contact', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }
    
    // Check if contact exists
    const existingContact = await WhatsappContact.getById(parseInt(id));
    if (!existingContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    await WhatsappContact.delete(parseInt(id));
    res.json({ message: 'Contact deleted successfully' });
    
  } catch (err) {
    console.error('Error deleting WhatsApp contact:', err);
    res.status(500).json({ 
      message: 'Failed to delete contact', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};