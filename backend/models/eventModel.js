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
const createEvent = async ({ 
  title, 
  one_liner, 
  country, 
  description, 
  location, 
  start_date, 
  end_date, 
  image_url, 
  is_paid, 
  price, 
  currency, 
  is_featured, 
  is_hidden 
}) => {
  const result = await executeQuery(
    'INSERT INTO events (title, one_liner, country, description, location, start_date, end_date, image_url, is_paid, price, currency, is_featured, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, one_liner, country, description, location, start_date, end_date, image_url, is_paid, price, currency, is_featured, is_hidden]
  );
  return { 
    id: result.insertId, 
    title, 
    one_liner, 
    country, 
    description, 
    location, 
    start_date, 
    end_date, 
    image_url, 
    is_paid, 
    price, 
    currency,
    is_featured,
    is_hidden
  };
};

// Update event
const updateEvent = async (id, { 
  title, 
  one_liner, 
  country, 
  description, 
  location, 
  start_date, 
  end_date, 
  image_url, 
  is_paid, 
  price, 
  currency,
  is_featured,
  is_hidden
}) => {
  await executeQuery(
    'UPDATE events SET title = ?, one_liner = ?, country = ?, description = ?, location = ?, start_date = ?, end_date = ?, image_url = ?, is_paid = ?, price = ?, currency = ?, is_featured = ?, is_hidden = ? WHERE id = ?',
    [title, one_liner, country, description, location, start_date, end_date, image_url, is_paid, price, currency, is_featured, is_hidden, id]
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