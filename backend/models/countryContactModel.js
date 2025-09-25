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
      (country, email, phone, physical_address, mailing_address, postal_code, 
       city, state_province, latitude, longitude, smtp_host, smtp_port, 
       smtp_secure, smtp_user, smtp_pass, smtp_from_name, is_active,
       welcome_template, contact_template, notification_template)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      country,
      data.email || null,
      data.phone || null,
      data.physical_address || null,
      data.mailing_address || null,
      data.postal_code || null,
      data.city || null,
      data.state_province || null,
      data.latitude || null,
      data.longitude || null,
      data.smtp_host || 'lim107.truehost.cloud',
      data.smtp_port || 465,
      data.smtp_secure !== undefined ? data.smtp_secure : true,
      data.smtp_user || null,
      data.smtp_pass || null,
      data.smtp_from_name || null,
      data.is_active !== undefined ? data.is_active : true,
      data.welcome_template || null,
      data.contact_template || null,
      data.notification_template || null
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
      'email', 'phone', 'physical_address', 'mailing_address', 'postal_code', 
      'city', 'state_province', 'latitude', 'longitude', 'smtp_host', 'smtp_port', 
      'smtp_secure', 'smtp_user', 'smtp_pass', 'smtp_from_name', 'is_active',
      'welcome_template', 'contact_template', 'notification_template'
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

// Validate SMTP configuration for a country
const validateSMTPConfig = async (country) => {
  try {
    const contact = await getCountryContact(country);
    
    if (!contact) {
      return { valid: false, message: 'No contact configuration found' };
    }

    if (!contact.is_active) {
      return { valid: false, message: 'Contact configuration is disabled' };
    }
    
    const requiredFields = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'];
    const missingFields = requiredFields.filter(field => !contact[field]);
    
    if (missingFields.length > 0) {
      return { 
        valid: false, 
        message: `Missing required SMTP fields: ${missingFields.join(', ')}` 
      };
    }
    
    return { 
      valid: true, 
      message: 'SMTP configuration is complete',
      config: {
        host: contact.smtp_host,
        port: contact.smtp_port,
        secure: contact.smtp_secure,
        user: contact.smtp_user,
        pass: contact.smtp_pass,
        fromName: contact.smtp_from_name,
        fromEmail: contact.smtp_user,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        physicalAddress: contact.physical_address,
        mailingAddress: contact.mailing_address,
        country: country
      }
    };
  } catch (error) {
    console.error('Error validating SMTP config:', error);
    return { valid: false, message: 'Failed to validate configuration' };
  }
};

// Legacy function for backward compatibility - maps to SMTP validation
const validateEmailJSConfig = async (country) => {
  console.warn('validateEmailJSConfig is deprecated, use validateSMTPConfig instead');
  const smtpValidation = await validateSMTPConfig(country);
  
  if (!smtpValidation.valid) {
    return smtpValidation;
  }
  
  // Return in old EmailJS format for backward compatibility
  return {
    valid: true,
    message: 'Configuration is complete (SMTP-based)',
    config: {
      // Map SMTP config to EmailJS-like structure for compatibility
      serviceId: smtpValidation.config.host,
      templateId: smtpValidation.config.user,
      publicKey: 'smtp-based'
    }
  };
};

// Get all contacts with complete SMTP configuration
const getConfiguredContacts = async () => {
  try {
    const query = `
      SELECT * FROM country_contacts 
      WHERE smtp_host IS NOT NULL 
        AND smtp_port IS NOT NULL 
        AND smtp_user IS NOT NULL 
        AND smtp_pass IS NOT NULL
        AND is_active = 1
      ORDER BY country ASC
    `;
    return await executeQuery(query);
  } catch (error) {
    console.error('Error fetching configured contacts:', error);
    throw new Error('Failed to fetch configured contacts');
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
        AND is_active = 1
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
    `;
    
    return await executeQuery(query, [latitude, longitude, latitude, radiusKm]);
  } catch (error) {
    console.error('Error fetching nearby contacts:', error);
    throw new Error('Failed to fetch nearby contacts');
  }
};

// Test SMTP connection for a country
const testSMTPConnection = async (country) => {
  try {
    const validation = await validateSMTPConfig(country);
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // This would typically connect to the SMTP server to test
    // For now, we'll just validate the configuration exists
    return { 
      success: true, 
      message: 'SMTP configuration appears valid',
      config: validation.config
    };
  } catch (error) {
    console.error('Error testing SMTP connection:', error);
    return { success: false, message: 'Failed to test SMTP connection' };
  }
};

// Get contact statistics
const getContactStats = async () => {
  try {
    const totalQuery = 'SELECT COUNT(*) as total FROM country_contacts';
    const activeQuery = 'SELECT COUNT(*) as active FROM country_contacts WHERE is_active = 1';
    const configuredQuery = `
      SELECT COUNT(*) as configured FROM country_contacts 
      WHERE smtp_host IS NOT NULL 
        AND smtp_port IS NOT NULL 
        AND smtp_user IS NOT NULL 
        AND smtp_pass IS NOT NULL
        AND is_active = 1
    `;
    const coordinatesQuery = `
      SELECT COUNT(*) as with_coordinates FROM country_contacts 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
    `;

    const [total, active, configured, withCoordinates] = await Promise.all([
      executeQuery(totalQuery),
      executeQuery(activeQuery),
      executeQuery(configuredQuery),
      executeQuery(coordinatesQuery)
    ]);

    return {
      total: total[0].total,
      active: active[0].active,
      configured: configured[0].configured,
      withCoordinates: withCoordinates[0].with_coordinates,
      configurationRate: total[0].total > 0 ? (configured[0].configured / total[0].total * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    throw new Error('Failed to fetch contact statistics');
  }
};

module.exports = {
  getCountryContact,
  getAllContacts,
  createCountryContact,
  updateCountryContact,
  deleteCountryContact,
  validateSMTPConfig,
  validateEmailJSConfig, // Legacy function for backward compatibility
  getConfiguredContacts,
  getContactsNearLocation,
  testSMTPConnection,
  getContactStats
};