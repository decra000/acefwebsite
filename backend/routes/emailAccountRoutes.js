// routes/emailAccountRoutes.js
const express = require('express');
const router = express.Router();
const emailAccountModel = require('../models/emailAccountModel');
const nodemailer = require('nodemailer');

// GET /api/email-accounts - Get all email accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await emailAccountModel.getAllEmailAccounts();
    
    // Remove sensitive password data from response
    const sanitizedAccounts = accounts.map(account => ({
      ...account,
      smtp_pass: account.smtp_pass ? '••••••••' : null
    }));
    
    res.json(sanitizedAccounts);
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch email accounts',
      error: error.message 
    });
  }
});

// GET /api/email-accounts/stats - Get accounts with usage statistics
router.get('/stats', async (req, res) => {
  try {
    const accountsWithStats = await emailAccountModel.getAccountsWithStats();
    
    // Sanitize passwords
    const sanitized = accountsWithStats.map(account => ({
      ...account,
      smtp_pass: account.smtp_pass ? '••••••••' : null
    }));
    
    res.json(sanitized);
  } catch (error) {
    console.error('Error fetching account stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch account statistics',
      error: error.message 
    });
  }
});

// GET /api/email-accounts/validate/:accountKey - Validate account configuration
router.get('/validate/:accountKey', async (req, res) => {
  try {
    const { accountKey } = req.params;
    const validation = await emailAccountModel.validateEmailAccountConfig(accountKey);
    
    res.json({
      success: validation.valid,
      message: validation.message,
      accountKey,
      missingFields: validation.missingFields || []
    });
  } catch (error) {
    console.error('Error validating email account:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to validate email account',
      error: error.message 
    });
  }
});

// GET /api/email-accounts/:accountKey - Get specific account
router.get('/:accountKey', async (req, res) => {
  try {
    const { accountKey } = req.params;
    const account = await emailAccountModel.getEmailAccount(accountKey);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: `Email account '${accountKey}' not found`
      });
    }
    
    // Don't send password in plain response
    const sanitized = {
      ...account,
      smtp_pass: account.smtp_pass ? '••••••••' : null
    };
    
    res.json({
      success: true,
      data: sanitized
    });
  } catch (error) {
    console.error('Error fetching email account:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch email account',
      error: error.message 
    });
  }
});

// POST /api/email-accounts/:accountKey - Create new email account
router.post('/:accountKey', async (req, res) => {
  try {
    const { accountKey } = req.params;
    const accountData = {
      account_key: accountKey,
      ...req.body
    };
    
    // Validate required fields
    const requiredFields = ['account_name', 'smtp_user', 'smtp_pass', 'from_name'];
    const missingFields = requiredFields.filter(field => !accountData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate account_key format
    if (!/^[a-z0-9_-]+$/.test(accountKey)) {
      return res.status(400).json({
        success: false,
        message: 'Account key must be lowercase alphanumeric with - or _ only'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountData.smtp_user)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format for smtp_user'
      });
    }
    
    // Validate port range
    if (accountData.smtp_port && (accountData.smtp_port < 1 || accountData.smtp_port > 65535)) {
      return res.status(400).json({
        success: false,
        message: 'SMTP port must be between 1 and 65535'
      });
    }
    
    await emailAccountModel.createEmailAccount(accountData);
    
    res.status(201).json({
      success: true,
      message: `Email account '${accountKey}' created successfully`,
      accountKey
    });
  } catch (error) {
    console.error('Error creating email account:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create email account',
      error: error.message 
    });
  }
});

// PUT /api/email-accounts/:accountKey - Update email account
router.put('/:accountKey', async (req, res) => {
  try {
    const { accountKey } = req.params;
    
    // Check if account exists
    const existingAccount = await emailAccountModel.getEmailAccount(accountKey);
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: `Email account '${accountKey}' not found`
      });
    }
    
    const updateData = { ...req.body };
    
    // Validate email format if provided
    if (updateData.smtp_user) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.smtp_user)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format for smtp_user'
        });
      }
    }
    
    // Validate port range if provided
    if (updateData.smtp_port && (updateData.smtp_port < 1 || updateData.smtp_port > 65535)) {
      return res.status(400).json({
        success: false,
        message: 'SMTP port must be between 1 and 65535'
      });
    }
    
    await emailAccountModel.updateEmailAccount(accountKey, updateData);
    
    res.json({
      success: true,
      message: `Email account '${accountKey}' updated successfully`,
      accountKey
    });
  } catch (error) {
    console.error('Error updating email account:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update email account',
      error: error.message 
    });
  }
});

// DELETE /api/email-accounts/:accountKey - Soft delete email account
router.delete('/:accountKey', async (req, res) => {
  try {
    const { accountKey } = req.params;
    
    // Check if account exists
    const existingAccount = await emailAccountModel.getEmailAccount(accountKey);
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: `Email account '${accountKey}' not found`
      });
    }
    
    await emailAccountModel.deleteEmailAccount(accountKey);
    
    res.json({
      success: true,
      message: `Email account '${accountKey}' deleted successfully`,
      accountKey
    });
  } catch (error) {
    console.error('Error deleting email account:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete email account',
      error: error.message 
    });
  }
});

// POST /api/email-accounts/:accountKey/test - Test SMTP connection
router.post('/:accountKey/test', async (req, res) => {
  try {
    const { accountKey } = req.params;
    
    // Get account configuration for testing
    const config = await emailAccountModel.testEmailAccount(accountKey);
    
    // Create transporter with the account configuration
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection
    await transporter.verify();
    
    res.json({
      success: true,
      message: `SMTP connection test successful for '${accountKey}'`,
      accountKey,
      accountInfo: config.accountInfo
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({ 
      success: false,
      message: `SMTP connection test failed for '${req.params.accountKey}'`,
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
});

// POST /api/email-accounts/test-all - Test all SMTP connections
router.post('/test-all', async (req, res) => {
  try {
    const accounts = await emailAccountModel.getAllEmailAccounts();
    
    if (accounts.length === 0) {
      return res.json({
        success: true,
        message: 'No email accounts to test',
        summary: { total: 0, successful: 0, failed: 0 },
        results: []
      });
    }
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    // Test each account
    for (const account of accounts) {
      try {
        const config = await emailAccountModel.testEmailAccount(account.account_key);
        
        const transporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: config.auth,
          tls: {
            rejectUnauthorized: false
          }
        });
        
        await transporter.verify();
        
        results.push({
          accountKey: account.account_key,
          accountName: account.account_name,
          success: true,
          message: 'Connection successful'
        });
        successful++;
      } catch (error) {
        results.push({
          accountKey: account.account_key,
          accountName: account.account_name,
          success: false,
          message: error.message,
          errorCode: error.code || 'Unknown'
        });
        failed++;
      }
    }
    
    res.json({
      success: successful > 0,
      message: `Tested ${accounts.length} accounts: ${successful} successful, ${failed} failed`,
      summary: {
        total: accounts.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    console.error('Test all error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to test email accounts',
      error: error.message 
    });
  }
});

module.exports = router;