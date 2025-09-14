const { executeQuery } = require('../config/database');

const Country = {
  getAll: async () => {
    const query = 'SELECT * FROM countries ORDER BY name';
    return await executeQuery(query);
  },

  findByName: async (name) => {
    const query = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)';
    const result = await executeQuery(query, [name]);
    return result.length > 0 ? result[0] : null;
  },

  // Automatically generates a 2-letter code from name
  add: async (name) => {
    const code = name.slice(0, 2).toUpperCase(); // e.g. Kenya => KE
    const query = 'INSERT INTO countries (name, code) VALUES (?, ?)';
    return await executeQuery(query, [name, code]);
  },

  delete: async (id) => {
    const query = 'DELETE FROM countries WHERE id = ?';
    return await executeQuery(query, [id]);
  },
};

module.exports = Country;
