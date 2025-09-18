const { executeQuery } = require('../config/database');

// Get one contact by country
const getCountryContact = async (country) => {
  try {
    const query = 'SELECT * FROM country_contacts WHERE country = ?';
    const result = await executeQuery(query, [country]);
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching country contact:', error);
    throw new Error('Failed to fetch country contact');
  }
};

// Get all contacts
const getAllContacts = async () => {
  try {
    const query = 'SELECT * FROM country_contacts ORDER BY country ASC';
    return await executeQuery(query);
  } catch (error) {
    console.error('Error fetching all contacts:', error);
    throw new Error('Failed to fetch contacts');
  }
};

// Create new contact
const createCountryContact = async (country, data) => {
  try {
    const query = `
      INSERT INTO country_contacts 
      (country, email, phone, service_id, template_id, public_key, physical_address, mailing_address, postal_code, city, state_province, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      country,
      data.email || null,
      data.phone || null,
      data.service_id || null,
      data.template_id || null,
      data.public_key || null,
      data.physical_address || null,
      data.mailing_address || null,
      data.postal_code || null,
      data.city || null,
      data.state_province || null,
      data.latitude || null,
      data.longitude || null
    ];
    
    return await executeQuery(query, params);
  } catch (error) {
    console.error('Error creating country contact:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Contact for this country already exists');
    }
    throw new Error('Failed to create country contact');
  }
};

// Update existing contact
const updateCountryContact = async (country, data) => {
  try {
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const params = [];
    
    const allowedFields = [
      'email', 'phone', 'service_id', 'template_id', 'public_key', 
      'physical_address', 'mailing_address', 'postal_code', 'city', 
      'state_province', 'latitude', 'longitude'
    ];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        params.push(data[field]);
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    // Add country parameter at the end
    params.push(country);
    
    const query = `
      UPDATE country_contacts 
      SET ${updateFields.join(', ')}
      WHERE country = ?
    `;
    
    return await executeQuery(query, params);
  } catch (error) {
    console.error('Error updating country contact:', error);
    throw new Error('Failed to update country contact');
  }
};

// Delete contact
const deleteCountryContact = async (country) => {
  try {
    const query = 'DELETE FROM country_contacts WHERE country = ?';
    return await executeQuery(query, [country]);
  } catch (error) {
    console.error('Error deleting country contact:', error);
    throw new Error('Failed to delete country contact');
  }
};

// Validate EmailJS configuration for a country
const validateEmailJSConfig = async (country) => {
  try {
    const contact = await getCountryContact(country);
    
    if (!contact) {
      return { valid: false, message: 'No contact configuration found' };
    }
    
    const requiredFields = ['service_id', 'template_id', 'public_key'];
    const missingFields = requiredFields.filter(field => !contact[field]);
    
    if (missingFields.length > 0) {
      return { 
        valid: false, 
        message: `Missing required EmailJS fields: ${missingFields.join(', ')}` 
      };
    }
    
    return { 
      valid: true, 
      message: 'EmailJS configuration is complete',
      config: {
        serviceId: contact.service_id,
        templateId: contact.template_id,
        publicKey: contact.public_key
      }
    };
  } catch (error) {
    console.error('Error validating EmailJS config:', error);
    return { valid: false, message: 'Failed to validate configuration' };
  }
};

// Get contacts within a certain radius (bonus utility function)
const getContactsNearLocation = async (latitude, longitude, radiusKm = 100) => {
  try {
    const query = `
      SELECT *,
        (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(latitude)) 
        * COS(RADIANS(longitude) - RADIANS(?)) + SIN(RADIANS(?)) 
        * SIN(RADIANS(latitude)))) AS distance_km
      FROM country_contacts 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
    `;
    
    return await executeQuery(query, [latitude, longitude, latitude, radiusKm]);
  } catch (error) {
    console.error('Error fetching nearby contacts:', error);
    throw new Error('Failed to fetch nearby contacts');
  }
};

module.exports = {
  getCountryContact,
  getAllContacts,
  createCountryContact,
  updateCountryContact,
  deleteCountryContact,
  validateEmailJSConfig,
  getContactsNearLocation
};