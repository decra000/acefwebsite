// models/emailAccountModel.js
const { executeQuery } = require('../config/database');

// Get email account by key
const getEmailAccount = async (accountKey) => {
  try {
    const query = 'SELECT * FROM email_accounts WHERE account_key = ? AND is_active = 1';
    const result = await executeQuery(query, [accountKey]);
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching email account:', error);
    throw new Error('Failed to fetch email account');
  }
};

// Get all active email accounts
const getAllEmailAccounts = async () => {
  try {
    const query = 'SELECT * FROM email_accounts WHERE is_active = 1 ORDER BY account_type, account_name';
    return await executeQuery(query);
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    throw new Error('Failed to fetch email accounts');
  }
};

// Get accounts by type
const getAccountsByType = async (accountType) => {
  try {
    const query = 'SELECT * FROM email_accounts WHERE account_type = ? AND is_active = 1 ORDER BY account_name';
    return await executeQuery(query, [accountType]);
  } catch (error) {
    console.error('Error fetching accounts by type:', error);
    throw new Error('Failed to fetch accounts by type');
  }
};

// Create new email account
const createEmailAccount = async (accountData) => {
  try {
    const query = `
      INSERT INTO email_accounts 
      (account_key, account_name, account_type, smtp_host, smtp_port, smtp_secure, 
       smtp_user, smtp_pass, from_name, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      accountData.account_key,
      accountData.account_name,
      accountData.account_type || 'role',
      accountData.smtp_host || 'lim107.truehost.cloud',
      accountData.smtp_port || 465,
      accountData.smtp_secure !== undefined ? accountData.smtp_secure : true,
      accountData.smtp_user,
      accountData.smtp_pass,
      accountData.from_name,
      accountData.description || null,
      accountData.is_active !== undefined ? accountData.is_active : true
    ];
    
    return await executeQuery(query, params);
  } catch (error) {
    console.error('Error creating email account:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Email account key already exists');
    }
    throw new Error('Failed to create email account');
  }
};

// Update email account
const updateEmailAccount = async (accountKey, accountData) => {
  try {
    // Build dynamic update query
    const updateFields = [];
    const params = [];
    
    const allowedFields = [
      'account_name', 'account_type', 'smtp_host', 'smtp_port', 'smtp_secure',
      'smtp_user', 'smtp_pass', 'from_name', 'description', 'is_active'
    ];
    
    allowedFields.forEach(field => {
      if (accountData.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        params.push(accountData[field]);
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    params.push(accountKey);
    
    const query = `
      UPDATE email_accounts 
      SET ${updateFields.join(', ')}
      WHERE account_key = ?
    `;
    
    return await executeQuery(query, params);
  } catch (error) {
    console.error('Error updating email account:', error);
    throw new Error('Failed to update email account');
  }
};

// Delete email account (soft delete by setting is_active = 0)
const deleteEmailAccount = async (accountKey) => {
  try {
    const query = 'UPDATE email_accounts SET is_active = 0 WHERE account_key = ?';
    return await executeQuery(query, [accountKey]);
  } catch (error) {
    console.error('Error deleting email account:', error);
    throw new Error('Failed to delete email account');
  }
};

// Test email account SMTP configuration
const testEmailAccount = async (accountKey) => {
  try {
    const account = await getEmailAccount(accountKey);
    
    if (!account) {
      throw new Error(`Email account '${accountKey}' not found`);
    }
    
    // Return configuration for testing
    return {
      host: account.smtp_host,
      port: account.smtp_port,
      secure: account.smtp_secure,
      auth: {
        user: account.smtp_user,
        pass: account.smtp_pass
      },
      from: `"${account.from_name}" <${account.smtp_user}>`,
      accountInfo: {
        key: account.account_key,
        name: account.account_name,
        type: account.account_type
      }
    };
  } catch (error) {
    console.error('Error testing email account:', error);
    throw error;
  }
};

// Get email accounts with usage statistics
const getAccountsWithStats = async () => {
  try {
    const query = `
      SELECT 
        ea.*,
        COALESCE(cc_primary.country_count, 0) as primary_country_usage,
        COALESCE(cc_secondary.country_count, 0) as secondary_country_usage,
        COALESCE(cc_primary.country_count, 0) + COALESCE(cc_secondary.country_count, 0) as total_usage
      FROM email_accounts ea
      LEFT JOIN (
        SELECT primary_role_account, COUNT(*) as country_count 
        FROM country_contacts 
        WHERE primary_role_account IS NOT NULL 
        GROUP BY primary_role_account
      ) cc_primary ON ea.account_key = cc_primary.primary_role_account
      LEFT JOIN (
        SELECT secondary_role_account, COUNT(*) as country_count 
        FROM country_contacts 
        WHERE secondary_role_account IS NOT NULL 
        GROUP BY secondary_role_account
      ) cc_secondary ON ea.account_key = cc_secondary.secondary_role_account
      WHERE ea.is_active = 1
      ORDER BY ea.account_type, ea.account_name
    `;
    
    return await executeQuery(query);
  } catch (error) {
    console.error('Error fetching accounts with stats:', error);
    throw new Error('Failed to fetch accounts with statistics');
  }
};

// Validate email account configuration
const validateEmailAccountConfig = async (accountKey) => {
  try {
    const account = await getEmailAccount(accountKey);
    
    if (!account) {
      return {
        valid: false,
        message: 'Email account not found',
        account: null
      };
    }
    
    if (!account.is_active) {
      return {
        valid: false,
        message: 'Email account is disabled',
        account
      };
    }
    
    const requiredFields = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'from_name'];
    const missingFields = requiredFields.filter(field => !account[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        account,
        missingFields
      };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account.smtp_user)) {
      return {
        valid: false,
        message: 'Invalid email format for smtp_user',
        account
      };
    }
    
    // Validate port range
    if (account.smtp_port < 1 || account.smtp_port > 65535) {
      return {
        valid: false,
        message: 'Invalid port number',
        account
      };
    }
    
    return {
      valid: true,
      message: 'Email account configuration is valid',
      account
    };
  } catch (error) {
    console.error('Error validating email account config:', error);
    return {
      valid: false,
      message: 'Failed to validate configuration',
      account: null
    };
  }
};

// Get fallback account for a specific type
const getFallbackAccount = async (preferredType = 'role') => {
  try {
    // Try to get 'info' account first, then any active role account
    let query = 'SELECT * FROM email_accounts WHERE account_key = ? AND is_active = 1';
    let result = await executeQuery(query, ['info']);
    
    if (result.length > 0) {
      return result[0];
    }
    
    // Fallback to any active role account
    query = 'SELECT * FROM email_accounts WHERE account_type = ? AND is_active = 1 ORDER BY account_name LIMIT 1';
    result = await executeQuery(query, ['role']);
    
    if (result.length > 0) {
      return result[0];
    }
    
    // Last resort: any active account
    query = 'SELECT * FROM email_accounts WHERE is_active = 1 ORDER BY account_name LIMIT 1';
    result = await executeQuery(query);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error getting fallback account:', error);
    throw new Error('Failed to get fallback account');
  }
};

module.exports = {
  getEmailAccount,
  getAllEmailAccounts,
  getAccountsByType,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  testEmailAccount,
  getAccountsWithStats,
  validateEmailAccountConfig,
  getFallbackAccount
};