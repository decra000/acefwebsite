const Event = require('../models/eventModel');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.getEventById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    // Destructure all fields from request body
    const { 
      title, 
      one_liner, 
      country, 
      description, 
      location, 
      is_paid, 
      price, 
      currency,
      is_featured,
      is_hidden
    } = req.body;

    // Enhanced debugging - Log everything being received
    console.log('=== CREATE EVENT DEBUG START ===');
    console.log('Raw req.body:', req.body);
    console.log('Destructured fields:');
    console.log('- title:', title);
    console.log('- one_liner:', one_liner);
    console.log('- one_liner type:', typeof one_liner);
    console.log('- one_liner length:', one_liner ? one_liner.length : 'N/A');
    console.log('- one_liner JSON:', JSON.stringify(one_liner));
    console.log('- country:', country);
    console.log('- description:', description ? description.substring(0, 50) + '...' : 'empty');
    console.log('- location:', location);
    console.log('- is_paid:', is_paid);
    console.log('- price:', price);
    console.log('- currency:', currency);
    console.log('- File uploaded:', !!req.file);

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate one_liner length if provided
    if (one_liner && one_liner.length > 150) {
      console.log('One liner validation failed - too long:', one_liner.length);
      return res.status(400).json({ error: 'One liner must be 150 characters or less' });
    }

    // Process dates
    const start_date = req.body.start_date ? new Date(req.body.start_date) : null;
    const end_date = req.body.end_date ? new Date(req.body.end_date) : null;

    // Validate start_date
    if (!start_date) {
      return res.status(400).json({ error: 'Start date is required' });
    }

    // Handle image upload
    const image_url = req.file ? getFileUrl(req, req.file.filename, 'events') : null;

    // Prepare event data with explicit handling of one_liner
    const eventData = {
      title: title.trim(),
      one_liner: one_liner !== undefined && one_liner !== null ? String(one_liner).trim() : '',
      country: country || null,
      description: description || null,
      location: location || null,
      start_date,
      end_date,
      image_url,
      is_paid: is_paid === 'true' || is_paid === true,
      price: (is_paid === 'true' || is_paid === true) && price ? parseFloat(price) : null,
      currency: (is_paid === 'true' || is_paid === true) && currency ? currency : null,
      is_featured: is_featured === 'true' || is_featured === true,
      is_hidden: is_hidden === 'true' || is_hidden === true,
    };

    console.log('Prepared eventData for database:');
    console.log('- title:', eventData.title);
    console.log('- one_liner:', eventData.one_liner);
    console.log('- one_liner length:', eventData.one_liner.length);
    console.log('- country:', eventData.country);
    console.log('- is_paid:', eventData.is_paid);
    console.log('- price:', eventData.price);
    console.log('- currency:', eventData.currency);

    // Create event in database
    const newEvent = await Event.createEvent(eventData);

    console.log('Event created successfully:');
    console.log('- ID:', newEvent.id);
    console.log('- Title:', newEvent.title);
    console.log('- One liner:', newEvent.one_liner);
    console.log('=== CREATE EVENT DEBUG END ===');

    res.status(201).json(newEvent);
  } catch (err) {
    console.error("CreateEvent error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { 
      title, 
      one_liner, 
      country, 
      description, 
      location, 
      start_date, 
      end_date, 
      is_paid, 
      price, 
      currency,
      is_featured,
      is_hidden
    } = req.body;
    const id = req.params.id;

    console.log('=== UPDATE EVENT DEBUG START ===');
    console.log('Event ID:', id);
    console.log('Raw req.body:', req.body);
    console.log('Update fields:');
    console.log('- title:', title);
    console.log('- one_liner:', one_liner);
    console.log('- one_liner type:', typeof one_liner);
    console.log('- one_liner length:', one_liner ? one_liner.length : 'N/A');
    console.log('- File uploaded for update:', !!req.file);

    // Validate event exists
    const existing = await Event.getEventById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log('Existing event one_liner:', existing.one_liner);

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate one_liner length if provided
    if (one_liner && one_liner.length > 150) {
      console.log('One liner validation failed - too long:', one_liner.length);
      return res.status(400).json({ error: 'One liner must be 150 characters or less' });
    }

    // Handle image update
    let image_url = existing.image_url;
    if (req.file) {
      // Delete old file if exists
      if (existing.image_url) {
        const oldPath = existing.image_url.replace('/uploads/events/', 'uploads/events/');
        try {
          await deleteFile(oldPath);
          console.log('Old image deleted:', oldPath);
        } catch (deleteError) {
          console.log('Could not delete old image:', deleteError.message);
        }
      }
      image_url = getFileUrl(req, req.file.filename, 'events');
      console.log('New image URL:', image_url);
    }

    // Prepare update data with explicit handling of one_liner
    const updateData = {
      title: title.trim(),
      one_liner: one_liner !== undefined && one_liner !== null ? String(one_liner).trim() : '',
      country: country || null,
      description: description || null,
      location: location || null,
      start_date: start_date || existing.start_date,
      end_date: end_date || existing.end_date,
      image_url,
      is_paid: is_paid === 'true' || is_paid === true,
      price: (is_paid === 'true' || is_paid === true) && price ? parseFloat(price) : null,
      currency: (is_paid === 'true' || is_paid === true) && currency ? currency : null,
      is_featured: is_featured === 'true' || is_featured === true,
      is_hidden: is_hidden === 'true' || is_hidden === true,
    };

    console.log('Prepared update data:');
    console.log('- title:', updateData.title);
    console.log('- one_liner:', updateData.one_liner);
    console.log('- one_liner length:', updateData.one_liner.length);
    console.log('- country:', updateData.country);

    // Update event in database
    const updated = await Event.updateEvent(id, updateData);

    console.log('Event updated successfully:');
    console.log('- ID:', updated.id);
    console.log('- Title:', updated.title);
    console.log('- One liner:', updated.one_liner);
    console.log('=== UPDATE EVENT DEBUG END ===');

    res.json(updated);
  } catch (err) {
    console.error("UpdateEvent error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const existing = await Event.getEventById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete image if exists
    if (existing.image_url) {
      const oldPath = existing.image_url.replace('/uploads/events/', 'uploads/events/');
      try {
        await deleteFile(oldPath);
        console.log('Image deleted for event:', req.params.id);
      } catch (deleteError) {
        console.log('Could not delete image:', deleteError.message);
      }
    }

    const result = await Event.deleteEvent(req.params.id);
    console.log('Event deleted:', req.params.id);
    res.json(result);
  } catch (err) {
    console.error("DeleteEvent error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};