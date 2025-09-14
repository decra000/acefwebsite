const { executeQuery } = require('../config/database');

// Get all events
const getAllEvents = async () => {
  return await executeQuery('SELECT * FROM events ORDER BY start_date DESC');
};

// Get single event
const getEventById = async (id) => {
  const result = await executeQuery('SELECT * FROM events WHERE id = ?', [id]);
  return result[0];
};

// Create event
// Create event
const createEvent = async ({ title, country, description, location, start_date, end_date, image_url, is_paid, price, currency }) => {
  const result = await executeQuery(
    'INSERT INTO events (title, country, description, location, start_date, end_date, image_url, is_paid, price, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, country, description, location, start_date, end_date, image_url, is_paid, price, currency]
  );
  return { id: result.insertId, title, country, description, location, start_date, end_date, image_url, is_paid, price, currency };
};

// Update event
const updateEvent = async (id, { title, country, description, location, start_date, end_date, image_url, is_paid, price, currency }) => {
  await executeQuery(
    'UPDATE events SET title = ?, country = ?, description = ?, location = ?, start_date = ?, end_date = ?, image_url = ?, is_paid = ?, price = ?, currency = ? WHERE id = ?',
    [title, country, description, location, start_date, end_date, image_url, is_paid, price, currency, id]
  );
  return getEventById(id);
};

// Delete event
const deleteEvent = async (id) => {
  await executeQuery('DELETE FROM events WHERE id = ?', [id]);
  return { message: 'Event deleted successfully' };
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
