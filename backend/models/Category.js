const { executeQuery } = require('../config/database');

const Category = {
  getAll: async () => {
    return await executeQuery('SELECT * FROM categories ORDER BY name');
  },

  create: async (name) => {
    const result = await executeQuery('INSERT INTO categories (name) VALUES (?)', [name]);
    return result.insertId;
  },

  update: async (id, name) => {
    const result = await executeQuery('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const result = await executeQuery('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows;
  },

  findByName: async (name) => {
    const rows = await executeQuery('SELECT * FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1', [name]);
    return rows[0] || null;
  },
};

module.exports = Category;
