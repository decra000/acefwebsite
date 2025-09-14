const { executeQuery } = require('../config/database');

class Job {
    // Create a new job
    static async create(jobData) {
        const {
            title,
            level,
            location,
            description,
            lastDate,
            salary,
            createdBy,
            requirements
        } = jobData;

        const query = `
            INSERT INTO jobs (title, level, location, description, lastDate, salary, createdBy, requirements, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        try {
            const result = await executeQuery(query, [
                title,
                level,
                location,
                description,
                lastDate,
                salary,
                createdBy,
                requirements
            ]);
            return { id: result.insertId, ...jobData };
        } catch (error) {
            throw new Error(`Failed to create job: ${error.message}`);
        }
    }

    // Get all jobs with pagination and filtering
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            level,
            location,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = options;

        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let queryParams = [];

        // Build WHERE clause for filtering
        const conditions = [];
        
        if (level) {
            conditions.push('level = ?');
            queryParams.push(level);
        }
        
        if (location) {
            conditions.push('location LIKE ?');
            queryParams.push(`%${location}%`);
        }
        
        if (search) {
            conditions.push('(title LIKE ? OR description LIKE ? OR requirements LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        // Count query for pagination
        const countQuery = `SELECT COUNT(*) as total FROM jobs ${whereClause}`;
        const countResult = await executeQuery(countQuery, queryParams);
        const total = countResult[0].total;

        // Main query
        const query = `
            SELECT * FROM jobs 
            ${whereClause}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(limit, offset);
        const jobs = await executeQuery(query, queryParams);

        return {
            jobs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    }

    // Get job by ID
    static async getById(id) {
        const query = 'SELECT * FROM jobs WHERE id = ?';
        const result = await executeQuery(query, [id]);
        
        if (result.length === 0) {
            throw new Error('Job not found');
        }
        
        return result[0];
    }

    // Update job
    static async update(id, jobData) {
        const {
            title,
            level,
            location,
            description,
            lastDate,
            salary,
            requirements
        } = jobData;

        const query = `
            UPDATE jobs 
            SET title = ?, level = ?, location = ?, description = ?, lastDate = ?, 
                salary = ?, requirements = ?, updatedAt = NOW()
            WHERE id = ?
        `;

        try {
            const result = await executeQuery(query, [
                title,
                level,
                location,
                description,
                lastDate,
                salary,
                requirements,
                id
            ]);

            if (result.affectedRows === 0) {
                throw new Error('Job not found');
            }

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Failed to update job: ${error.message}`);
        }
    }

    // Delete job
    static async delete(id) {
        const query = 'DELETE FROM jobs WHERE id = ?';
        
        try {
            const result = await executeQuery(query, [id]);
            
            if (result.affectedRows === 0) {
                throw new Error('Job not found');
            }
            
            return { message: 'Job deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete job: ${error.message}`);
        }
    }

    // Get active jobs (not expired)
    static async getActiveJobs(options = {}) {
        const {
            page = 1,
            limit = 10,
            level,
            location,
            search
        } = options;

        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE (lastDate IS NULL OR lastDate >= NOW())';
        let queryParams = [];

        // Add filters
        if (level) {
            whereClause += ' AND level = ?';
            queryParams.push(level);
        }
        
        if (location) {
            whereClause += ' AND location LIKE ?';
            queryParams.push(`%${location}%`);
        }
        
        if (search) {
            whereClause += ' AND (title LIKE ? OR description LIKE ? OR requirements LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Count query
        const countQuery = `SELECT COUNT(*) as total FROM jobs ${whereClause}`;
        const countResult = await executeQuery(countQuery, queryParams);
        const total = countResult[0].total;

        // Main query
        const query = `
            SELECT * FROM jobs 
            ${whereClause}
            ORDER BY createdAt DESC
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(limit, offset);
        const jobs = await executeQuery(query, queryParams);

        return {
            jobs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    }

    // Get unique levels and locations for filters
    static async getFilterOptions() {
        const levelsQuery = 'SELECT DISTINCT level FROM jobs WHERE level IS NOT NULL AND level != "" ORDER BY level';
        const locationsQuery = 'SELECT DISTINCT location FROM jobs WHERE location IS NOT NULL AND location != "" ORDER BY location';

        const [levels, locations] = await Promise.all([
            executeQuery(levelsQuery),
            executeQuery(locationsQuery)
        ]);

        return {
            levels: levels.map(row => row.level),
            locations: locations.map(row => row.location)
        };
    }

    // Get jobs statistics
    static async getStats() {
        const queries = {
            total: 'SELECT COUNT(*) as count FROM jobs',
            active: 'SELECT COUNT(*) as count FROM jobs WHERE (lastDate IS NULL OR lastDate >= NOW())',
            expired: 'SELECT COUNT(*) as count FROM jobs WHERE lastDate < NOW()',
            byLevel: 'SELECT level, COUNT(*) as count FROM jobs GROUP BY level ORDER BY count DESC',
            byLocation: 'SELECT location, COUNT(*) as count FROM jobs GROUP BY location ORDER BY count DESC LIMIT 5'
        };

        const [total, active, expired, byLevel, byLocation] = await Promise.all([
            executeQuery(queries.total),
            executeQuery(queries.active),
            executeQuery(queries.expired),
            executeQuery(queries.byLevel),
            executeQuery(queries.byLocation)
        ]);

        return {
            total: total[0].count,
            active: active[0].count,
            expired: expired[0].count,
            byLevel,
            byLocation
        };
    }
}

module.exports = Job;