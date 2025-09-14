const TransactionDetail = require('../models/TransactionDetail');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// Create new transaction method
exports.create = async (req, res) => {
  try {
    const { type, name, fields, is_country_specific, country } = req.body;

    // Parse fields if it's a string (from FormData)
    let parsedFields;
    try {
      parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid fields format' });
    }

    // Parse boolean values from FormData
    const isCountrySpecific = is_country_specific === 'true' || is_country_specific === true;

    // Validation
    if (!type || !name?.trim()) {
      return res.status(400).json({ message: 'Type and name are required' });
    }

    if (!parsedFields || !Array.isArray(parsedFields) || parsedFields.length === 0) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    // Validate country if country-specific
    if (isCountrySpecific && !country?.trim()) {
      return res.status(400).json({ message: 'Country is required for country-specific payment methods' });
    }

    // Validate fields
    const validFields = parsedFields.filter(field => field.label?.trim() && field.value?.trim());
    if (validFields.length === 0) {
      return res.status(400).json({ message: 'At least one complete field is required' });
    }

    // Check for duplicate names within the same type and country (if specified)
    const exists = await TransactionDetail.findByTypeNameAndCountry(type, name.trim(), isCountrySpecific ? country?.trim() : null);
    if (exists) {
      const location = isCountrySpecific ? ` in ${country}` : '';
      return res.status(400).json({ message: `A transaction method with this name already exists for this type${location}` });
    }

    // Handle logo upload for local merchants - Store path with /uploads prefix
    let logo_url = null;
    if (type === 'local_merchant' && req.file) {
      logo_url = `/uploads/transaction-logos/${req.file.filename}`;
      console.log('✅ Logo uploaded for local merchant:', logo_url);
      console.log('✅ File stored at:', req.file.path);
    } else if (type === 'local_merchant' && !req.file) {
      console.log('⚠️ No logo file provided for local merchant');
    }

    const id = await TransactionDetail.create({
      type,
      name: name.trim(),
      logo_url,
      country: isCountrySpecific ? country?.trim() : null,
      fields: validFields
    });

    console.log(`✅ Transaction method '${name}' created with ID ${id}${isCountrySpecific ? ` for ${country}` : ''}`);
    
    // Return the created object
    const createdMethod = {
      id, 
      type, 
      name: name.trim(), 
      logo_url,
      country: isCountrySpecific ? country?.trim() : null,
      fields: validFields
    };
    
    res.status(201).json({ 
      ...createdMethod,
      message: 'Transaction method created successfully' 
    });
  } catch (err) {
    console.error('❌ Error creating transaction method:', err);
    res.status(500).json({ message: 'Server error while creating transaction method' });
  }
};

// Update transaction method
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, fields, is_country_specific, country } = req.body;

    // Parse fields if it's a string (from FormData)
    let parsedFields;
    try {
      parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid fields format' });
    }

    // Parse boolean values from FormData
    const isCountrySpecific = is_country_specific === 'true' || is_country_specific === true;

    // Validation
    if (!type || !name?.trim()) {
      return res.status(400).json({ message: 'Type and name are required' });
    }

    if (!parsedFields || !Array.isArray(parsedFields) || parsedFields.length === 0) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    // Validate country if country-specific
    if (isCountrySpecific && !country?.trim()) {
      return res.status(400).json({ message: 'Country is required for country-specific payment methods' });
    }

    // Validate fields
    const validFields = parsedFields.filter(field => field.label?.trim() && field.value?.trim());
    if (validFields.length === 0) {
      return res.status(400).json({ message: 'At least one complete field is required' });
    }

    // Check for duplicate names within the same type and country (excluding current record)
    const exists = await TransactionDetail.findByTypeNameAndCountry(type, name.trim(), isCountrySpecific ? country?.trim() : null);
    if (exists && exists.id !== parseInt(id)) {
      const location = isCountrySpecific ? ` in ${country}` : '';
      return res.status(400).json({ message: `Another transaction method with this name already exists for this type${location}` });
    }

    // Get existing record to handle logo replacement
    const existing = await TransactionDetail.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Transaction method not found' });
    }

    let logo_url = existing.logo_url;

    // Handle logo upload/update for local merchants - Store path with /uploads prefix
    if (type === 'local_merchant') {
      if (req.file) {
        // New logo uploaded - delete old one if it exists
        if (existing.logo_url) {
          // Extract filename from existing logo_url (handle both formats)
          const oldFileName = existing.logo_url.includes('/uploads/') 
            ? existing.logo_url.replace('/uploads/transaction-logos/', '')
            : existing.logo_url.replace('/transaction-logos/', '');
          await deleteFile(`transaction-logos/${oldFileName}`);
          console.log('🗑️ Old logo deleted');
        }
        
        // Store path with /uploads prefix
        logo_url = `/uploads/transaction-logos/${req.file.filename}`;
        console.log('✅ Logo updated:', logo_url);
        console.log('✅ File stored at:', req.file.path);
      }
      // If no new file but type is local_merchant, keep existing logo
    } else {
      // If changing type FROM local_merchant TO something else, delete logo
      if (existing.type === 'local_merchant' && existing.logo_url) {
        const oldFileName = existing.logo_url.includes('/uploads/') 
          ? existing.logo_url.replace('/uploads/transaction-logos/', '')
          : existing.logo_url.replace('/transaction-logos/', '');
        await deleteFile(`transaction-logos/${oldFileName}`);
        console.log('🗑️ Logo deleted due to type change');
        logo_url = null;
      }
    }

    const updated = await TransactionDetail.update(id, {
      type,
      name: name.trim(),
      logo_url,
      country: isCountrySpecific ? country?.trim() : null,
      fields: validFields
    });

    if (updated) {
      console.log(`✅ Transaction method with ID ${id} updated${isCountrySpecific ? ` for ${country}` : ''}`);
      res.json({ 
        id: parseInt(id), 
        type, 
        name: name.trim(), 
        logo_url,
        country: isCountrySpecific ? country?.trim() : null,
        fields: validFields,
        message: 'Transaction method updated successfully' 
      });
    } else {
      res.status(404).json({ message: 'Transaction method not found' });
    }
  } catch (err) {
    console.error('❌ Error updating transaction method:', err);
    res.status(500).json({ message: 'Server error while updating transaction method' });
  }
};

// Delete transaction method
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get existing record to delete logo file
    const existing = await TransactionDetail.findById(id);
    if (existing && existing.logo_url) {
      // Extract filename from logo_url (handle both formats)
      const logoFileName = existing.logo_url.includes('/uploads/') 
        ? existing.logo_url.replace('/uploads/transaction-logos/', '')
        : existing.logo_url.replace('/transaction-logos/', '');
      await deleteFile(`transaction-logos/${logoFileName}`);
      console.log('Logo file deleted for transaction method:', id);
    }
    
    const deleted = await TransactionDetail.delete(id);
    if (deleted) {
      console.log(`✅ Transaction method with ID ${id} deleted`);
      res.json({ message: 'Transaction method deleted successfully' });
    } else {
      res.status(404).json({ message: 'Transaction method not found' });
    }
  } catch (err) {
    console.error('❌ Error deleting transaction method:', err);
    res.status(500).json({ message: 'Server error while deleting transaction method' });
  }
};

// Get all transaction methods
exports.getAll = async (req, res) => {
  try {
    const methods = await TransactionDetail.getAll();
    console.log(`✅ ${methods.length} transaction methods fetched from DB`);
    
    // Process the methods to ensure proper logo URLs - return as stored
    const processedMethods = methods.map(method => ({
      ...method,
      // Return logo_url as stored in database (should be /uploads/transaction-logos/filename)
      logo_url: method.logo_url
    }));
    
    // Debug: Log the logo URLs being returned
    processedMethods.forEach(method => {
      if (method.logo_url) {
        console.log(`📸 Method ${method.name}${method.country ? ` (${method.country})` : ''}: ${method.logo_url}`);
      }
    });
    
    res.json(processedMethods);
  } catch (err) {
    console.error('❌ Error fetching transaction methods:', err);
    res.status(500).json({ message: 'Server error while fetching transaction methods' });
  }
};

// Get methods by type
exports.getByType = async (req, res) => {
  try {
    const { type } = req.params;
    const methods = await TransactionDetail.getByType(type);
    console.log(`✅ ${methods.length} transaction methods of type '${type}' fetched`);
    
    // Process the methods to ensure proper logo URLs - return as stored
    const processedMethods = methods.map(method => ({
      ...method,
      // Return logo_url as stored in database (should be /uploads/transaction-logos/filename)
      logo_url: method.logo_url
    }));
    
    res.json(processedMethods);
  } catch (err) {
    console.error('❌ Error fetching transaction methods by type:', err);
    res.status(500).json({ message: 'Server error while fetching transaction methods by type' });
  }
};

// Get methods by country (new endpoint)
exports.getByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const methods = await TransactionDetail.getByCountry(country);
    console.log(`✅ ${methods.length} transaction methods for country '${country}' fetched`);
    
    // Process the methods to ensure proper logo URLs - return as stored
    const processedMethods = methods.map(method => ({
      ...method,
      // Return logo_url as stored in database
      logo_url: method.logo_url
    }));
    
    res.json(processedMethods);
  } catch (err) {
    console.error('❌ Error fetching transaction methods by country:', err);
    res.status(500).json({ message: 'Server error while fetching transaction methods by country' });
  }
};

// Get available countries (new endpoint)
exports.getCountries = async (req, res) => {
  try {
    const countries = await TransactionDetail.getAvailableCountries();
    console.log(`✅ ${countries.length} countries with payment methods available`);
    res.json(countries);
  } catch (err) {
    console.error('❌ Error fetching available countries:', err);
    res.status(500).json({ message: 'Server error while fetching available countries' });
  }
};