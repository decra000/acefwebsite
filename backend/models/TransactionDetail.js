const { executeQuery } = require('../config/database');

const TransactionDetail = {
  // Helper function to safely parse JSON
  parseFields: (fieldsString) => {
    if (!fieldsString) return [];
    
    try {
      // If it's already an object, return it
      if (typeof fieldsString === 'object') {
        return Array.isArray(fieldsString) ? fieldsString : [];
      }
      
      // If it's a string, try to parse it
      if (typeof fieldsString === 'string') {
        const parsed = JSON.parse(fieldsString);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error parsing fields JSON:', error, 'Raw value:', fieldsString);
      return [];
    }
  },

  // Replace your existing getAll method in TransactionDetail.js

getAll: async () => {
  try {
    const rows = await executeQuery(`
      SELECT id, type, name, logo_url, country, fields, created_at, updated_at 
      FROM transaction_details 
      ORDER BY type, name
    `);
    
    console.log(`📊 Raw database rows: ${rows.length}`);
    
    // Parse JSON fields safely
    return rows.map(row => {
      const parsed = {
        ...row,
        fields: TransactionDetail.parseFields(row.fields)
      };
      console.log(`✅ Parsed row ${row.id}: ${parsed.fields.length} fields`);
      return parsed;
    });
  } catch (error) {
    console.error('❌ Error in getAll:', error);
    throw error;
  }
},

  // Replace your existing create and update methods in TransactionDetail.js

create: async (data) => {
  try {
    const { type, name, logo_url, country, fields } = data;
    
    // Ensure fields is properly formatted
    const fieldsJson = JSON.stringify(Array.isArray(fields) ? fields : []);
    console.log('💾 Creating with fields JSON:', fieldsJson);
    
    const result = await executeQuery(`
      INSERT INTO transaction_details (type, name, logo_url, country, fields) 
      VALUES (?, ?, ?, ?, ?)
    `, [type, name, logo_url, country, fieldsJson]);
    
    return result.insertId;
  } catch (error) {
    console.error('❌ Error in create:', error);
    throw error;
  }
},

update: async (id, data) => {
  try {
    const { type, name, logo_url, country, fields } = data;
    
    // Ensure fields is properly formatted
    const fieldsJson = JSON.stringify(Array.isArray(fields) ? fields : []);
    console.log('📝 Updating with fields JSON:', fieldsJson);
    
    const result = await executeQuery(`
      UPDATE transaction_details 
      SET type = ?, name = ?, logo_url = ?, country = ?, fields = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [type, name, logo_url, country, fieldsJson, id]);
    
    return result.affectedRows;
  } catch (error) {
    console.error('❌ Error in update:', error);
    throw error;
  }
},







  delete: async (id) => {
    try {
      const result = await executeQuery('DELETE FROM transaction_details WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Error in delete:', error);
      throw error;
    }
  },

  findByTypeAndName: async (type, name) => {
    try {
      const rows = await executeQuery(`
        SELECT * FROM transaction_details 
        WHERE LOWER(type) = LOWER(?) AND LOWER(name) = LOWER(?) 
        LIMIT 1
      `, [type, name]);
      
      if (rows[0]) {
        return {
          ...rows[0],
          fields: TransactionDetail.parseFields(rows[0].fields)
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error in findByTypeAndName:', error);
      throw error;
    }
  },

  getByType: async (type) => {
    try {
      const rows = await executeQuery(`
        SELECT id, type, name, logo_url, fields, created_at, updated_at 
        FROM transaction_details 
        WHERE type = ? 
        ORDER BY name
      `, [type]);
      
      // Parse JSON fields safely
      return rows.map(row => ({
        ...row,
        fields: TransactionDetail.parseFields(row.fields)
      }));
    } catch (error) {
      console.error('❌ Error in getByType:', error);
      throw error;
    }
  },
  

  findById: async (id) => {
    try {
      const rows = await executeQuery(`
        SELECT * FROM transaction_details WHERE id = ? LIMIT 1
      `, [id]);
      
      if (rows[0]) {
        return {
          ...rows[0],
          fields: TransactionDetail.parseFields(rows[0].fields)
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error in findById:', error);
      throw error;
    }
  },



  // Add these methods to your TransactionDetail.js model file

findByTypeNameAndCountry: async (type, name, country) => {
  try {
    let query;
    let params;
    
    if (country) {
      // Search for specific country
      query = `
        SELECT * FROM transaction_details 
        WHERE LOWER(type) = LOWER(?) AND LOWER(name) = LOWER(?) AND LOWER(country) = LOWER(?)
        LIMIT 1
      `;
      params = [type, name, country];
    } else {
      // Search for global methods (country is NULL)
      query = `
        SELECT * FROM transaction_details 
        WHERE LOWER(type) = LOWER(?) AND LOWER(name) = LOWER(?) AND country IS NULL
        LIMIT 1
      `;
      params = [type, name];
    }
    
    const rows = await executeQuery(query, params);
    
    if (rows[0]) {
      return {
        ...rows[0],
        fields: TransactionDetail.parseFields(rows[0].fields)
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error in findByTypeNameAndCountry:', error);
    throw error;
  }
},

getByCountry: async (country) => {
  try {
    const rows = await executeQuery(`
      SELECT id, type, name, logo_url, country, fields, created_at, updated_at 
      FROM transaction_details 
      WHERE LOWER(country) = LOWER(?) OR country IS NULL
      ORDER BY country IS NULL DESC, type, name
    `, [country]);
    
    // Parse JSON fields safely
    return rows.map(row => ({
      ...row,
      fields: TransactionDetail.parseFields(row.fields)
    }));
  } catch (error) {
    console.error('❌ Error in getByCountry:', error);
    throw error;
  }
},

getAvailableCountries: async () => {
  try {
    const rows = await executeQuery(`
      SELECT DISTINCT country 
      FROM transaction_details 
      WHERE country IS NOT NULL 
      ORDER BY country
    `);
    
    return rows.map(row => row.country);
  } catch (error) {
    console.error('❌ Error in getAvailableCountries:', error);
    throw error;
  }
}







};

module.exports = TransactionDetail;