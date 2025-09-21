const { executeQuery } = require('../config/database');

class Job {
    // Create a new job
    static async create(jobData) {
        const {
            title,
            level,
            location,
            country,
            description,
            lastDate,
            salary,
            createdBy,
            requirements
        } = jobData;

        const query = `
            INSERT INTO jobs (title, level, location, country, description, lastDate, salary, createdBy, requirements, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        try {
            const result = await executeQuery(query, [
                title,
                level,
                location,
                country,
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

    // Get all jobs with pagination and filtering - FIXED VERSION
    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            level,
            location,
            country,
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
            conditions.push('location = ?');
            queryParams.push(location);
        }

        if (country) {
            conditions.push('country = ?');
            queryParams.push(country);
        }
        
        if (search) {
            conditions.push('(title LIKE ? OR description LIKE ? OR requirements LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        try {
            // Count query for pagination
            const countQuery = `SELECT COUNT(*) as total FROM jobs ${whereClause}`;
            const countResult = await executeQuery(countQuery, [...queryParams]);
            const total = countResult[0].total;

            // Main query - Using direct values instead of parameters for LIMIT/OFFSET
            const query = `
                SELECT * FROM jobs 
                ${whereClause}
                ORDER BY ${sortBy} ${sortOrder}
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            // Use the same queryParams for the main query (don't add limit/offset)
            const jobs = await executeQuery(query, queryParams);

            return {
                jobs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            };
        } catch (error) {
            console.error('Job.getAll error:', error);
            throw new Error(`Failed to fetch jobs: ${error.message}`);
        }
    }

    // Get job by ID
    static async getById(id) {
        const query = 'SELECT * FROM jobs WHERE id = ?';
        
        try {
            const result = await executeQuery(query, [id]);
            
            if (result.length === 0) {
                throw new Error('Job not found');
            }
            
            return result[0];
        } catch (error) {
            throw new Error(`Failed to get job: ${error.message}`);
        }
    }

    // Update job
    static async update(id, jobData) {
        const {
            title,
            level,
            location,
            country,
            description,
            lastDate,
            salary,
            requirements,
            createdBy
        } = jobData;

        const query = `
            UPDATE jobs 
            SET title = ?, level = ?, location = ?, country = ?, description = ?, lastDate = ?, 
                salary = ?, requirements = ?, createdBy = ?, updatedAt = NOW()
            WHERE id = ?
        `;

        try {
            const result = await executeQuery(query, [
                title,
                level,
                location,
                country,
                description,
                lastDate,
                salary,
                requirements,
                createdBy,
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

    // Get active jobs by country (for country-specific pages) - FIXED VERSION
    static async getByCountry(countryName, options = {}) {
        const {
            page = 1,
            limit = 10,
            level,
            location,
            search,
            activeOnly = true
        } = options;

        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE country = ?';
        let queryParams = [countryName];

        // Add active jobs filter if requested
        if (activeOnly) {
            whereClause += ' AND (lastDate IS NULL OR lastDate >= NOW())';
        }

        // Add other filters
        if (level) {
            whereClause += ' AND level = ?';
            queryParams.push(level);
        }
        
        if (location) {
            whereClause += ' AND location = ?';
            queryParams.push(location);
        }
        
        if (search) {
            whereClause += ' AND (title LIKE ? OR description LIKE ? OR requirements LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        try {
            // Count query
            const countQuery = `SELECT COUNT(*) as total FROM jobs ${whereClause}`;
            const countResult = await executeQuery(countQuery, [...queryParams]);
            const total = countResult[0].total;

            // Main query - Using direct values for LIMIT/OFFSET
            const query = `
                SELECT * FROM jobs 
                ${whereClause}
                ORDER BY createdAt DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const jobs = await executeQuery(query, queryParams);

            return {
                jobs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            };
        } catch (error) {
            console.error('Job.getByCountry error:', error);
            throw new Error(`Failed to fetch jobs by country: ${error.message}`);
        }
    }

    // Get filter options including countries
    static async getFilterOptions() {
        try {
            const levelsQuery = 'SELECT DISTINCT level FROM jobs WHERE level IS NOT NULL AND level != "" ORDER BY level';
            const locationsQuery = 'SELECT DISTINCT location FROM jobs WHERE location IS NOT NULL ORDER BY location';
            const countriesQuery = 'SELECT DISTINCT country FROM jobs WHERE country IS NOT NULL AND country != "" ORDER BY country';

            const [levels, locations, countries] = await Promise.all([
                executeQuery(levelsQuery),
                executeQuery(locationsQuery),
                executeQuery(countriesQuery)
            ]);

            return {
                levels: levels.map(row => row.level),
                locations: locations.map(row => row.location),
                countries: countries.map(row => row.country)
            };
        } catch (error) {
            console.error('Job.getFilterOptions error:', error);
            throw new Error(`Failed to get filter options: ${error.message}`);
        }
    }

    // Get jobs statistics with country breakdown
    static async getStats() {
        try {
            const queries = {
                total: 'SELECT COUNT(*) as count FROM jobs',
                active: 'SELECT COUNT(*) as count FROM jobs WHERE (lastDate IS NULL OR lastDate >= NOW())',
                expired: 'SELECT COUNT(*) as count FROM jobs WHERE lastDate < NOW()',
                byLevel: 'SELECT level, COUNT(*) as count FROM jobs GROUP BY level ORDER BY count DESC',
                byLocation: 'SELECT location, COUNT(*) as count FROM jobs GROUP BY location ORDER BY count DESC',
                byCountry: 'SELECT country, COUNT(*) as count FROM jobs WHERE country IS NOT NULL AND country != "" GROUP BY country ORDER BY count DESC LIMIT 5'
            };

            const [total, active, expired, byLevel, byLocation, byCountry] = await Promise.all([
                executeQuery(queries.total),
                executeQuery(queries.active),
                executeQuery(queries.expired),
                executeQuery(queries.byLevel),
                executeQuery(queries.byLocation),
                executeQuery(queries.byCountry)
            ]);

            return {
                total: total[0].count,
                active: active[0].count,
                expired: expired[0].count,
                byLevel,
                byLocation,
                byCountry
            };
        } catch (error) {
            console.error('Job.getStats error:', error);
            throw new Error(`Failed to get job statistics: ${error.message}`);
        }
    }
}

module.exports = Job;