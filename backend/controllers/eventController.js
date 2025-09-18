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

    // Debug: Log the received data
    console.log('Received form data:', req.body);
    console.log('one_liner value:', one_liner);

    // Validate one_liner length
    if (one_liner && one_liner.length > 150) {
      return res.status(400).json({ error: 'One liner must be 150 characters or less' });
    }

    const start_date = req.body.start_date ? new Date(req.body.start_date) : null;
    const end_date   = req.body.end_date ? new Date(req.body.end_date) : null;

    const image_url = req.file ? getFileUrl(req, req.file.filename, 'events') : null;

    const newEvent = await Event.createEvent({
      title,
      one_liner: one_liner || '', // Ensure it's always a string, even if empty
      country,
      description,
      location,
      start_date,
      end_date,
      image_url,
      is_paid: is_paid === 'true' || is_paid === true,
      price: is_paid ? parseFloat(price) : null,
      currency: is_paid ? currency : null,
      is_featured: is_featured === 'true' || is_featured === true,
      is_hidden: is_hidden === 'true' || is_hidden === true,
    });

    console.log('Created event with one_liner:', newEvent.one_liner);
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("CreateEvent error:", err);
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

    // Debug: Log the received data
    console.log('Update received form data:', req.body);
    console.log('Update one_liner value:', one_liner);

    // Validate one_liner length
    if (one_liner && one_liner.length > 150) {
      return res.status(400).json({ error: 'One liner must be 150 characters or less' });
    }

    const existing = await Event.getEventById(id);
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    let image_url = existing.image_url;

    // If new file uploaded, replace
    if (req.file) {
      // delete old file if exists
      if (existing.image_url) {
        const oldPath = existing.image_url.replace('/uploads/events/', 'uploads/events/');
        await deleteFile(oldPath);
      }
      image_url = getFileUrl(req, req.file.filename, 'events');
    }

    const updated = await Event.updateEvent(id, {
      title,
      one_liner: one_liner || '', // Ensure it's always a string, even if empty
      country,
      description,
      location,
      start_date,
      end_date,
      image_url,
      is_paid: is_paid === 'true' || is_paid === true,
      price: is_paid ? parseFloat(price) : null,
      currency: is_paid ? currency : null,
      is_featured: is_featured === 'true' || is_featured === true,
      is_hidden: is_hidden === 'true' || is_hidden === true,
    });

    console.log('Updated event with one_liner:', updated.one_liner);
    res.json(updated);
  } catch (err) {
    console.error("UpdateEvent error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const existing = await Event.getEventById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    // delete image if exists
    if (existing.image_url) {
      const oldPath = existing.image_url.replace('/uploads/events/', 'uploads/events/');
      await deleteFile(oldPath);
    }

    const result = await Event.deleteEvent(req.params.id);
    res.json(result);
  } catch (err) {
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