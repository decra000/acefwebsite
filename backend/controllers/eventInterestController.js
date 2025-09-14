const EventInterest = require('../models/eventInterestModel');

// Get all interests (admin only)
const getAllInterests = async (req, res) => {
  try {
    const interests = await EventInterest.getAllInterests();
    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get interests for specific event
const getEventInterests = async (req, res) => {
  try {
    const interests = await EventInterest.getInterestsByEvent(req.params.eventId);
    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new interest
const createInterest = async (req, res) => {
  try {
    const { event_id, name, email, phone, message } = req.body;

    // Validate required fields
    if (!event_id || !name || !email) {
      return res.status(400).json({ 
        error: 'Event ID, name, and email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const newInterest = await EventInterest.createInterest({
      event_id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      message: message?.trim(),
    });

    res.status(201).json(newInterest);
  } catch (err) {
    console.error("Create interest error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete interest (admin only)
const deleteInterest = async (req, res) => {
  try {
    const result = await EventInterest.deleteInterest(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllInterests,
  getEventInterests,
  createInterest,
  deleteInterest,
};