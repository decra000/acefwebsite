const { executeQuery } = require('../config/database');

class User {
  static async create({ email, name, password, role = 'Content Manager' }) {
    const query = `INSERT INTO users (email, name, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, true, NOW(), NOW())`;
    const result = await executeQuery(query, [email, name, password, role]);
    return this.getById(result.insertId);
  }

  static async getByEmail(email) {
    const query = `SELECT id, email, name, role, is_active, permissions, created_at, updated_at FROM users WHERE email = ? LIMIT 1`;
    const results = await executeQuery(query, [email]);
    
    if (results[0]) {
      const user = {
        ...results[0],
        isActive: Boolean(results[0].is_active)
      };
      
      if (user.permissions) {
        try {
          user.permissions = typeof user.permissions === 'string' 
            ? JSON.parse(user.permissions) 
            : user.permissions;
        } catch (e) {
          console.warn('Failed to parse permissions for user:', user.id);
          user.permissions = [];
        }
      } else {
        user.permissions = [];
      }
      
      return user;
    }
    return null;
  }

  static async getWithPassword(emailOrName) {
    const query = `SELECT * FROM users WHERE email = ? OR name = ? LIMIT 1`;
    const results = await executeQuery(query, [emailOrName, emailOrName]);
    
    if (results[0]) {
      const user = {
        ...results[0],
        isActive: Boolean(results[0].is_active)
      };
      
      if (user.permissions) {
        try {
          user.permissions = typeof user.permissions === 'string' 
            ? JSON.parse(user.permissions) 
            : user.permissions;
        } catch (e) {
          user.permissions = [];
        }
      } else {
        user.permissions = [];
      }
      
      return user;
    }
    return null;
  }

  static async getById(id) {
    const query = `SELECT id, email, name, role, is_active, permissions, created_at, updated_at FROM users WHERE id = ?`;
    const results = await executeQuery(query, [id]);
    
    if (results[0]) {
      const user = {
        ...results[0],
        isActive: Boolean(results[0].is_active)
      };
      
      if (user.permissions) {
        try {
          user.permissions = typeof user.permissions === 'string' 
            ? JSON.parse(user.permissions) 
            : user.permissions;
        } catch (e) {
          user.permissions = [];
        }
      } else {
        user.permissions = [];
      }
      
      return user;
    }
    return null;
  }

  static async getByResetToken(token) {
    const query = `SELECT * FROM users WHERE passwordResetToken = ? LIMIT 1`;
    const results = await executeQuery(query, [token]);
    return results[0] || null;
  }

  static async updateResetToken(id, token, expires) {
    const query = `UPDATE users SET passwordResetToken = ?, passwordResetExpires = ?, updated_at = NOW() WHERE id = ?`;
    return await executeQuery(query, [token, expires, id]);
  }

  static async updatePassword(id, hashedPassword) {
    const query = `UPDATE users SET password = ?, passwordResetToken = NULL, passwordResetExpires = NULL, updated_at = NOW() WHERE id = ?`;
    return await executeQuery(query, [hashedPassword, id]);
  }

  static async getAll() {
    const query = `SELECT id, email, name, role, is_active, permissions, created_at, updated_at FROM users ORDER BY created_at DESC`;
    const results = await executeQuery(query);
    
    return results.map(user => {
      const normalizedUser = {
        ...user,
        isActive: Boolean(user.is_active)
      };
      
      if (normalizedUser.permissions) {
        try {
          normalizedUser.permissions = typeof normalizedUser.permissions === 'string' 
            ? JSON.parse(normalizedUser.permissions) 
            : normalizedUser.permissions;
        } catch (e) {
          console.warn('Failed to parse permissions for user:', normalizedUser.id);
          normalizedUser.permissions = [];
        }
      } else {
        normalizedUser.permissions = [];
      }
      
      return normalizedUser;
    });
  }

  static async updateRole(id, role) {
    const query = `UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?`;
    return await executeQuery(query, [role, id]);
  }

  static async updateUser(id, { name, email }) {
    console.log('User.updateUser called with:', { id, name, email });
    const query = `UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?`;
    const result = await executeQuery(query, [name, email, id]);
    console.log('User.updateUser result:', result);
    return result;
  }

  static async deleteById(id) {
    const query = `DELETE FROM users WHERE id = ?`;
    return await executeQuery(query, [id]);
  }

  // FIXED: Clean SQL query without JavaScript comments
  static async createPendingUser(userData) {
    try {
      const { name, email, role, activationToken, activationTokenExpires, permissions } = userData;
      
      console.log('Creating pending user with data:', { 
        name, 
        email, 
        role, 
        activationTokenExpires: activationTokenExpires instanceof Date ? activationTokenExpires.toISOString() : activationTokenExpires,
        permissionsCount: Array.isArray(permissions) ? permissions.length : 0
      });
      
      // Convert Date to MySQL datetime format
      let formattedExpires = activationTokenExpires;
      if (activationTokenExpires instanceof Date) {
        formattedExpires = activationTokenExpires.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      // CLEAN SQL QUERY - NO COMMENTS INSIDE
      const query = `
        INSERT INTO users (
          name, 
          email, 
          password,
          role, 
          activation_token, 
          activation_token_expires, 
          is_active, 
          permissions, 
          created_at, 
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW())
      `;
      
      const params = [
        name,
        email,
        'PENDING_ACTIVATION',
        role,
        activationToken,
        formattedExpires,
        JSON.stringify(permissions || [])
      ];
      
      console.log('Executing query with params:', {
        name,
        email,
        password: 'PENDING_ACTIVATION',
        role,
        activationToken: activationToken ? activationToken.substring(0, 10) + '...' : 'null',
        activationTokenExpires: formattedExpires,
        permissions: JSON.stringify(permissions || [])
      });
      
      const result = await executeQuery(query, params);
      
      console.log('Database insert result:', result);
      
      if (!result.insertId) {
        throw new Error('Failed to insert user - no insertId returned');
      }
      
      return {
        id: result.insertId,
        name,
        email,
        role,
        isActive: false,
        permissions: permissions || []
      };
      
    } catch (error) {
      console.error('Detailed error in createPendingUser:', {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        message: error.message
      });
      
      // Handle specific database errors
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('A user with this email already exists');
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        throw new Error('Database table "users" not found. Please check database setup.');
      } else if (error.code === 'ER_BAD_FIELD_ERROR') {
        throw new Error(`Database field error: ${error.sqlMessage || error.message}`);
      } else if (error.code === 'ER_DATA_TOO_LONG') {
        throw new Error('Data too long for one of the fields');
      } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
        throw new Error('Invalid datetime format provided');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Database connection refused. Check database server.');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error('Database access denied. Check credentials.');
      }
      
      throw new Error(`Database error in createPendingUser: ${error.message}`);
    }
  }

  static async getByActivationToken(token) {
    try {
      const query = `
        SELECT id, name, email, role, activation_token_expires, permissions
        FROM users 
        WHERE activation_token = ? AND is_active = 0
      `;
      
      const results = await executeQuery(query, [token]);
      if (results.length === 0) return null;
      
      const user = results[0];
      
      if (user.permissions) {
        try {
          user.permissions = typeof user.permissions === 'string' 
            ? JSON.parse(user.permissions) 
            : user.permissions;
        } catch (e) {
          console.warn('Failed to parse permissions for activation token user:', user.id);
          user.permissions = [];
        }
      } else {
        user.permissions = [];
      }
      
      return {
        ...user,
        activationTokenExpires: user.activation_token_expires
      };
    } catch (error) {
      console.error('Error fetching user by activation token:', error);
      throw error;
    }
  }

  static async activateUser(userId, hashedPassword) {
    try {
      const query = `
        UPDATE users 
        SET password = ?, is_active = 1, activation_token = NULL, activation_token_expires = NULL, updated_at = NOW()
        WHERE id = ?
      `;
      
      const result = await executeQuery(query, [hashedPassword, userId]);
      console.log('User activated successfully:', userId);
      return result;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  static async updateActivationToken(userId, token, expires) {
    try {
      let formattedExpires = expires;
      if (expires instanceof Date) {
        formattedExpires = expires.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      const query = `
        UPDATE users 
        SET activation_token = ?, activation_token_expires = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const result = await executeQuery(query, [token, formattedExpires, userId]);
      console.log('Activation token updated for user:', userId);
      return result;
    } catch (error) {
      console.error('Error updating activation token:', error);
      throw error;
    }
  }

  static async updatePermissions(userId, permissions) {
    const query = `
      UPDATE users 
      SET permissions = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    try {
      const result = await executeQuery(query, [JSON.stringify(permissions), userId]);
      console.log('Permissions updated for user:', userId, permissions);
      return result;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }
// Add these methods to your User model

// Activate user without setting password (for password reset scenario)
static async activateUserOnly(id) {
  const query = `
    UPDATE users 
    SET isActive = 1, 
        activationToken = NULL, 
        activationTokenExpires = NULL 
    WHERE id = ?
  `;
  return db.execute(query, [id]);
}

// Clear reset token after successful password reset
static async clearResetToken(id) {
  const query = `
    UPDATE users 
    SET passwordResetToken = NULL, 
        passwordResetExpires = NULL 
    WHERE id = ?
  `;
  return db.execute(query, [id]);
}
  static async emailExists(email, excludeId = null) {
    let query = `SELECT id FROM users WHERE email = ?`;
    let params = [email];
    
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    
    const results = await executeQuery(query, params);
    return results.length > 0;
  }

  static async getUserStats() {
    try {
      const queries = {
        total: `SELECT COUNT(*) as count FROM users`,
        active: `SELECT COUNT(*) as count FROM users WHERE is_active = 1`,
        pending: `SELECT COUNT(*) as count FROM users WHERE is_active = 0`,
        admins: `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`,
        contentManagers: `SELECT COUNT(*) as count FROM users WHERE role = 'Content Manager'`,
        assistantAdmins: `SELECT COUNT(*) as count FROM users WHERE role = 'Assistant Admin'`
      };

      const results = {};
      for (const [key, query] of Object.entries(queries)) {
        const result = await executeQuery(query);
        results[key] = result[0].count;
      }

      return results;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }
}

module.exports = User;