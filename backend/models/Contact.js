const { executeQuery } = require('../config/database');

class Contact {
    // Get paginated messages with optional status
    static async getAllPaginated({ page = 1, limit = 10, status }) {
        const offset = (page - 1) * limit;
        const whereClause = status ? `WHERE status = ?` : '';
        const values = status ? [status, limit, offset] : [limit, offset];

        const dataQuery = `
            SELECT * FROM contact_messages
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(*) AS total FROM contact_messages
            ${whereClause}
        `;

        const data = await executeQuery(dataQuery, values);
        const countResult = await executeQuery(countQuery, status ? [status] : []);
        const total = countResult[0]?.total || 0;

        return {
            contacts: data,
            total
        };
    }

    // Get message by ID
    static async getById(id) {
        const query = `SELECT * FROM contact_messages WHERE id = ?`;
        const results = await executeQuery(query, [id]);
        return results[0] || null;
    }

    // Create new contact message
    static async create(data) {
        const query = `
            INSERT INTO contact_messages 
            (name, email, subject, message, phone, organization, status)
            VALUES (?, ?, ?, ?, ?, ?, 'new')
        `;
        const values = [
            data.name,
            data.email,
            data.subject || null,
            data.message,
            data.phone || null,
            data.organization || null
        ];

        const result = await executeQuery(query, values);
        return await this.getById(result.insertId);
    }

    // Update message status
    static async updateStatus(id, status) {
        const query = `UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await executeQuery(query, [status, id]);
        return true;
    }

    // Delete message
    static async delete(id) {
        const query = `DELETE FROM contact_messages WHERE id = ?`;
        await executeQuery(query, [id]);
        return true;
    }
}

module.exports = Contact;
