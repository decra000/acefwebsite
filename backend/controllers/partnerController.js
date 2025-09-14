const fs = require('fs');
const path = require('path');
const Partner = require('../models/Partner');

// ✅ Get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.getAll();
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch partners', error: err.message });
  }
};

// ✅ Create partner
exports.createPartner = async (req, res) => {
  try {
    const { name, type, featured } = req.body;
    const logo = req.file?.filename || null;

    if (!name || !logo || !type) {
      return res.status(400).json({ message: 'Name, logo, and type are required' });
    }

    if (!['partner', 'accreditator', 'both'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be partner, accreditator, or both.' });
    }

    const partnerData = {
      name: name.trim(),
      logo,
      type: type.toLowerCase(),
      featured: featured === 'true' || featured === true ? 1 : 0
    };

    const id = await Partner.create(partnerData);
    res.status(201).json({ message: 'Partner added', id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create partner', error: err.message });
  }
};

// ✅ Update partner (NEW)
exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, featured } = req.body;
    const newLogo = req.file?.filename || null;

    // Check if partner exists
    const existingPartner = await Partner.getById(id);
    if (!existingPartner) {
      // Delete uploaded file if partner doesn't exist
      if (newLogo) {
        const logoPath = path.join(__dirname, '..', 'uploads', 'partners', newLogo);
        fs.unlink(logoPath, (err) => {
          if (err) console.warn('⚠️ Could not delete uploaded file:', logoPath);
        });
      }
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Prepare update data
    const updateData = {
      name: name?.trim() || existingPartner.name,
      type: type?.toLowerCase() || existingPartner.type,
      featured: featured === 'true' || featured === true ? 1 : 0
    };

    // Handle logo update
    let oldLogoPath = null;
    if (newLogo) {
      updateData.logo = newLogo;
      oldLogoPath = path.join(__dirname, '..', 'uploads', 'partners', existingPartner.logo);
    }

    // Validate type
    if (!['partner', 'accreditator', 'both'].includes(updateData.type)) {
      return res.status(400).json({ message: 'Invalid type. Must be partner, accreditator, or both.' });
    }

    // Update partner
    const result = await Partner.update(id, updateData);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Delete old logo file if a new one was uploaded
    if (oldLogoPath && fs.existsSync(oldLogoPath)) {
      fs.unlink(oldLogoPath, (err) => {
        if (err) {
          console.warn('⚠️ Could not delete old logo:', oldLogoPath, err.message);
        }
      });
    }

    res.json({ message: 'Partner updated successfully' });
  } catch (err) {
    console.error('Update partner error:', err);
    res.status(500).json({ message: 'Failed to update partner', error: err.message });
  }
};

// ✅ Delete partner
exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.getById(id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    await Partner.delete(id);

    // Delete logo file
    const logoPath = path.join(__dirname, '..', 'uploads', 'partners', partner.logo);
    fs.unlink(logoPath, (err) => {
      if (err) {
        console.warn('⚠️ Could not delete image:', logoPath, err.message);
      }
    });

    res.json({ message: 'Partner deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete partner', error: err.message });
  }
};

// ✅ Update partner type
exports.updatePartnerType = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  if (!['partner', 'accreditator', 'both'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type value' });
  }

  try {
    const updated = await Partner.updateType(id, type);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json({ message: 'Partner type updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating partner type', error: err.message });
  }
};

// ✅ Update partner featured status (NEW)
exports.updatePartnerFeatured = async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;

  try {
    const featuredValue = featured === true || featured === 'true' ? 1 : 0;
    const updated = await Partner.updateFeatured(id, featuredValue);
    
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json({ message: 'Partner featured status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating partner featured status', error: err.message });
  }
};

// ✅ Get single partner by ID (NEW)
exports.getPartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.getById(id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch partner', error: err.message });
  }
};

// ✅ Public route (optional)
exports.getPublicPartners = async (req, res) => {
  try {
    const partners = await Partner.getAll(); // You might want to add a public filter here
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public partners', error: err.message });
  }
};