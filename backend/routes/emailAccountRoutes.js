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










// POST /api/email-accounts/support-tickets - Submit a support ticket
router.post('/support-tickets', async (req, res) => {
  try {
    const { email, issue, submittedBy } = req.body;
    
    console.log('📧 Received support ticket:', { email, issueLength: issue?.length });
    
    // Validation
    if (!email || !issue) {
      return res.status(400).json({
        success: false,
        error: 'Email and issue description are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Get the 'support' email account configuration
    const supportAccount = await emailAccountModel.getEmailAccount('support');
    
    if (!supportAccount) {
      console.error('Support email account not found in database');
      return res.status(500).json({
        success: false,
        error: 'Support email system is not configured'
      });
    }

    console.log('✅ Support account found:', supportAccount.account_name);

    // Create transporter using the support account
    const transporter = nodemailer.createTransport({
      host: supportAccount.smtp_host,
      port: supportAccount.smtp_port,
      secure: supportAccount.smtp_port === 465,
      auth: {
        user: supportAccount.smtp_user,
        pass: supportAccount.smtp_pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Email content
    const mailOptions = {
      from: `"${supportAccount.from_name}" <${supportAccount.smtp_user}>`,
      to: supportAccount.smtp_user, // Send to support@acef-ngo.org
      replyTo: email, // User can reply directly to the ticket submitter
      subject: `🎫 Support Ticket from ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              line-height: 1.6; 
              color: #1f2937;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #28d219, #54c015);
              color: white; 
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 8px 0 0 0;
              opacity: 0.9;
              font-size: 14px;
            }
            .content { 
              padding: 30px;
            }
            .field { 
              margin-bottom: 20px;
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #28d219;
            }
            .label { 
              font-weight: 600;
              color: #065f46;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .value { 
              color: #1f2937;
              font-size: 15px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .value a {
              color: #28d219;
              text-decoration: none;
              font-weight: 500;
            }
            .value a:hover {
              text-decoration: underline;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              font-size: 13px;
              color: #6b7280;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              background: #dcfce7;
              color: #065f46;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 New Support Ticket</h1>
              <p>ACEF Support System</p>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">📧 User Email</div>
                <div class="value">
                  <a href="mailto:${email}">${email}</a>
                  ${submittedBy && submittedBy !== email ? `<br><span class="badge">Submitted by: ${submittedBy}</span>` : ''}
                </div>
              </div>
              
              <div class="field">
                <div class="label">📝 Issue Description</div>
                <div class="value">${issue}</div>
              </div>
              
              <div class="field">
                <div class="label">🕒 Submission Time</div>
                <div class="value">${new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</div>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">
                Reply to this email to respond directly to the user.<br>
                This ticket was submitted via the ACEF website.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎫 NEW SUPPORT TICKET

User Email: ${email}
${submittedBy && submittedBy !== email ? `Submitted by: ${submittedBy}\n` : ''}

Issue Description:
${issue}

Submission Time: ${new Date().toLocaleString()}

---
Reply to this email to respond directly to the user.
This ticket was submitted via the ACEF website.
      `
    };

    // Send email
    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);

    // Log the email send (optional - integrate with your email_logs table)
    try {
      await emailAccountModel.logEmailSend({
        account_key: 'support',
        recipient: supportAccount.smtp_user,
        subject: mailOptions.subject,
        status: 'sent'
      });
    } catch (logError) {
      console.error('Warning: Failed to log email send:', logError.message);
      // Don't fail the request if logging fails
    }

    res.json({
      success: true,
      message: 'Support ticket submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error submitting support ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit support ticket. Please try again.',
      details: error.message
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

console.log('📧 Email account routes loaded');

module.exports = router;