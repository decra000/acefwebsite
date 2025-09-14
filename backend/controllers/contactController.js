// controllers/contactController.js
const { executeQuery } = require('../config/database');

const ContactController = {
    create: async (data) => {
        const { name, email, subject, message, phone, organization } = data;
        const query = `
            INSERT INTO contact_messages (name, email, subject, message, phone, organization)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = await executeQuery(query, [name, email, subject, message, phone, organization]);
        return { id: result.insertId, ...data };
    },

    getAll: async ({ page = 1, limit = 10, status }) => {
        const offset = (page - 1) * limit;
        const conditions = status ? 'WHERE status = ?' : '';

        const totalQuery = `SELECT COUNT(*) as total FROM contact_messages ${conditions}`;
        const totalResult = await executeQuery(totalQuery, status ? [status] : []);
        const total = totalResult[0].total;

        const dataQuery = `
            SELECT * FROM contact_messages
            ${conditions}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        const contacts = await executeQuery(dataQuery, status ? [status, limit, offset] : [limit, offset]);

        return {
            contacts,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    },

    getById: async (id) => {
        const query = 'SELECT * FROM contact_messages WHERE id = ?';
        const result = await executeQuery(query, [id]);
        return result[0];
    },

    updateStatus: async (id, status) => {
        const query = `
            UPDATE contact_messages SET status = ?, updated_at = NOW() WHERE id = ?
        `;
        const result = await executeQuery(query, [status, id]);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const query = 'DELETE FROM contact_messages WHERE id = ?';
        const result = await executeQuery(query, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = ContactController;
