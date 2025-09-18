const fs = require('fs');
const path = require('path');
const GeneralTestimonial = require('../models/GeneralTestimonial');

// Get all testimonials
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await GeneralTestimonial.getAll();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch testimonials', error: err.message });
  }
};

// Create testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { first_name, last_name, testimonial, type, featured } = req.body;
    const image = req.file?.filename || null;

    if (!first_name || !last_name || !testimonial || !type) {
      return res.status(400).json({ message: 'First name, last name, testimonial, and type are required' });
    }

    if (!['community', 'volunteers', 'collaborators'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be community, volunteers, or collaborators.' });
    }

    const testimonialData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      testimonial: testimonial.trim(),
      image,
      type: type.toLowerCase(),
      featured: featured === 'true' || featured === true ? 1 : 0
    };

    const id = await GeneralTestimonial.create(testimonialData);
    res.status(201).json({ message: 'Testimonial added', id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create testimonial', error: err.message });
  }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, testimonial, type, featured } = req.body;
    const newImage = req.file?.filename || null;

    // Check if testimonial exists
    const existingTestimonial = await GeneralTestimonial.getById(id);
    if (!existingTestimonial) {
      // Delete uploaded file if testimonial doesn't exist
      if (newImage) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'testimonials', newImage);
        fs.unlink(imagePath, (err) => {
          if (err) console.warn('⚠️ Could not delete uploaded file:', imagePath);
        });
      }
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Prepare update data
    const updateData = {
      first_name: first_name?.trim() || existingTestimonial.first_name,
      last_name: last_name?.trim() || existingTestimonial.last_name,
      testimonial: testimonial?.trim() || existingTestimonial.testimonial,
      type: type?.toLowerCase() || existingTestimonial.type,
      featured: featured === 'true' || featured === true ? 1 : 0
    };

    // Handle image update
    let oldImagePath = null;
    if (newImage) {
      updateData.image = newImage;
      if (existingTestimonial.image) {
        oldImagePath = path.join(__dirname, '..', 'uploads', 'testimonials', existingTestimonial.image);
      }
    }

    // Validate type
    if (!['community', 'volunteers', 'collaborators'].includes(updateData.type)) {
      return res.status(400).json({ message: 'Invalid type. Must be community, volunteers, or collaborators.' });
    }

    // Update testimonial
    const result = await GeneralTestimonial.update(id, updateData);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete old image file if a new one was uploaded
    if (oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn('⚠️ Could not delete old image:', oldImagePath, err.message);
        }
      });
    }

    res.json({ message: 'Testimonial updated successfully' });
  } catch (err) {
    console.error('Update testimonial error:', err);
    res.status(500).json({ message: 'Failed to update testimonial', error: err.message });
  }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await GeneralTestimonial.getById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await GeneralTestimonial.delete(id);

    // Delete image file if exists
    if (testimonial.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', 'testimonials', testimonial.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn('⚠️ Could not delete image:', imagePath, err.message);
        }
      });
    }

    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete testimonial', error: err.message });
  }
};

// Update testimonial type
exports.updateTestimonialType = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  if (!['community', 'volunteers', 'collaborators'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type value' });
  }

  try {
    const updated = await GeneralTestimonial.updateType(id, type);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial type updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating testimonial type', error: err.message });
  }
};

// Update testimonial featured status
exports.updateTestimonialFeatured = async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;

  try {
    const featuredValue = featured === true || featured === 'true' ? 1 : 0;
    const updated = await GeneralTestimonial.updateFeatured(id, featuredValue);
    
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial featured status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating testimonial featured status', error: err.message });
  }
};

// Get single testimonial by ID
exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await GeneralTestimonial.getById(id);
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch testimonial', error: err.message });
  }
};

// Public routes (for frontend display)
exports.getPublicTestimonials = async (req, res) => {
  try {
    const { type, limit } = req.query;
    let testimonials;
    
    if (type) {
      testimonials = await GeneralTestimonial.getByTypeWithLimit(type, limit ? parseInt(limit) : 6);
    } else {
      testimonials = await GeneralTestimonial.getPublic(limit ? parseInt(limit) : null);
    }
    
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public testimonials', error: err.message });
  }
};

// Get featured testimonials only
exports.getFeaturedTestimonials = async (req, res) => {
  try {
    const testimonials = await GeneralTestimonial.getFeatured();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch featured testimonials', error: err.message });
  }
};