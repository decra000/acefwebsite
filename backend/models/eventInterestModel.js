const { executeQuery } = require('../config/database');

// Get all interests for an event
const getInterestsByEvent = async (eventId) => {
  return await executeQuery(
    `SELECT ei.*, e.title as event_title 
     FROM event_interests ei 
     JOIN events e ON ei.event_id = e.id 
     WHERE ei.event_id = ? 
     ORDER BY ei.created_at DESC`,
    [eventId]
  );
};

// Get all interests (for admin)
const getAllInterests = async () => {
  return await executeQuery(
    `SELECT ei.*, e.title as event_title, e.start_date 
     FROM event_interests ei 
     JOIN events e ON ei.event_id = e.id 
     ORDER BY ei.created_at DESC`
  );
};

// Create interest
const createInterest = async ({ event_id, name, email, phone, message }) => {
  const result = await executeQuery(
    'INSERT INTO event_interests (event_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
    [event_id, name, email, phone, message]
  );
  return { 
    id: result.insertId, 
    event_id, 
    name, 
    email, 
    phone, 
    message,
    created_at: new Date()
  };
};

// Delete interest
const deleteInterest = async (id) => {
  await executeQuery('DELETE FROM event_interests WHERE id = ?', [id]);
  return { message: 'Interest deleted successfully' };
};

module.exports = {
  getInterestsByEvent,
  getAllInterests,
  createInterest,
  deleteInterest,
};