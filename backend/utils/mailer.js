const nodemailer = require('nodemailer');

// ACEF Email Account Configuration
const ACEF_ACCOUNTS = {
  info: { user: process.env.SMTP_USER_INFO, pass: process.env.SMTP_PASS_INFO, name: 'ACEF Team' },
  community: { user: process.env.SMTP_USER_COMMUNITY, pass: process.env.SMTP_PASS_COMMUNITY, name: 'ACEF Community' },
  events: { user: process.env.SMTP_USER_EVENTS, pass: process.env.SMTP_PASS_EVENTS, name: 'ACEF Events' },
  fundraising: { user: process.env.SMTP_USER_FUNDRAISING, pass: process.env.SMTP_PASS_FUNDRAISING, name: 'ACEF Fundraising' },
  partnerships: { user: process.env.SMTP_USER_PARTNERSHIPS, pass: process.env.SMTP_PASS_PARTNERSHIPS, name: 'ACEF Partnerships' },
  // Regional accounts
  benin: { user: process.env.SMTP_USER_BENIN, pass: process.env.SMTP_PASS_BENIN, name: 'ACEF Benin' },
  cameroon: { user: process.env.SMTP_USER_CAMEROON, pass: process.env.SMTP_PASS_CAMEROON, name: 'ACEF Cameroon' },
  drcongo: { user: process.env.SMTP_USER_DRCONGO, pass: process.env.SMTP_PASS_DRCONGO, name: 'ACEF DR Congo' },
  ghana: { user: process.env.SMTP_USER_GHANA, pass: process.env.SMTP_PASS_GHANA, name: 'ACEF Ghana' },
  kenya: { user: process.env.SMTP_USER_KENYA, pass: process.env.SMTP_PASS_KENYA, name: 'ACEF Kenya' },
  liberia: { user: process.env.SMTP_USER_LIBERIA, pass: process.env.SMTP_PASS_LIBERIA, name: 'ACEF Liberia' },
  nigeria: { user: process.env.SMTP_USER_NIGERIA, pass: process.env.SMTP_PASS_NIGERIA, name: 'ACEF Nigeria' },
  rwanda: { user: process.env.SMTP_USER_RWANDA, pass: process.env.SMTP_PASS_RWANDA, name: 'ACEF Rwanda' },
  sierraleone: { user: process.env.SMTP_USER_SIERRALEONE, pass: process.env.SMTP_PASS_SIERRALEONE, name: 'ACEF Sierra Leone' },
  tanzania: { user: process.env.SMTP_USER_TANZANIA, pass: process.env.SMTP_PASS_TANZANIA, name: 'ACEF Tanzania' },
  uganda: { user: process.env.SMTP_USER_UGANDA, pass: process.env.SMTP_PASS_UGANDA, name: 'ACEF Uganda' },
  zambia: { user: process.env.SMTP_USER_ZAMBIA, pass: process.env.SMTP_PASS_ZAMBIA, name: 'ACEF Zambia' },
  zimbabwe: { user: process.env.SMTP_USER_ZIMBABWE, pass: process.env.SMTP_PASS_ZIMBABWE, name: 'ACEF Zimbabwe' }
};

// Create transporter with error handling and account selection
// Create transporter with error handling and account selection
const createTransporter = (accountType = 'info') => {
  let account = ACEF_ACCOUNTS[accountType];
  
  if (!account) {
    console.warn(`⚠️ Unknown account type: ${accountType}, falling back to info account`);
    account = ACEF_ACCOUNTS.info;
  }

  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const isSecure = port === 465;

  console.log('📧 Creating ACEF email transporter with config:', {
    host: process.env.SMTP_HOST,
    port,
    secure: isSecure,
    user: account.user,
    accountType
  });

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: isSecure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};




// Get sender info for email headers
const getSenderInfo = (accountType = 'info') => {
  const account = ACEF_ACCOUNTS[accountType] || ACEF_ACCOUNTS.info;
  return `"${account.name}" <${account.user}>`;
};

exports.sendPasswordResetEmail = async (to, name, link) => {
  try {
    console.log('📧 Attempting to send password reset email to:', to);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER_INFO || !process.env.SMTP_PASS_INFO) {
      throw new Error('ACEF email configuration missing. Check SMTP_HOST, SMTP_USER_INFO, and SMTP_PASS_INFO environment variables.');
    }

    const transporter = createTransport('info');

    if (process.env.NODE_ENV !== 'production') {
      try {
        await transporter.verify();
        console.log('✅ ACEF SMTP server connection verified');
      } catch (verifyError) {
        console.warn('⚠️ ACEF SMTP verification failed:', verifyError.message);
      }
    }

    const mailOptions = {
      from: getSenderInfo('info'),
      to,
      subject: '🔐 Password Reset Request - ACEF',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #dee2e6;">
            <h2 style="color: #007bff; margin-bottom: 20px;">🔐 Password Reset Request</h2>
            
            <p>Hi <strong>${name || 'there'}</strong>,</p>
            
            <p>You requested to reset your password for your ACEF account. Click the button below to proceed:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f1f3f4; padding: 10px; border-radius: 4px; word-break: break-all;">
              <a href="${link}" style="color: #007bff;">${link}</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d;">
              <p><strong>⏱️ This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              <p>For security reasons, this link can only be used once.</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
              <p>Best regards,<br/><strong>ACEF Support Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${name || 'there'},
        
        You requested to reset your password for your ACEF account.
        
        Click this link to reset your password: ${link}
        
        This link will expire in 1 hour.
        
        If you didn't request this, you can safely ignore this email.
        
        Best regards,
        ACEF Support Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', {
      messageId: info.messageId,
      response: info.response
    });

    return info;

  } catch (error) {
    console.error('❌ Failed to send password reset email:', {
      error: error.message,
      code: error.code,
      command: error.command
    });
    
    if (error.code === 'EAUTH') {
      throw new Error('ACEF email authentication failed. Check your email credentials and password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Could not connect to ACEF email server. Check your internet connection.');
    } else if (error.message.includes('Invalid login')) {
      throw new Error('Invalid ACEF email credentials. Please verify the email configuration.');
    } else {
      throw new Error(`ACEF email service error: ${error.message}`);
    }
  }
};

/**
 * Send user invitation email
 */
exports.sendUserInvitationEmail = async ({
  recipientEmail,
  recipientName,
  role,
  invitedBy,
  activationToken,
  permissions = []
}) => {
  try {
    console.log(`📧 Sending user invitation to: ${recipientEmail}`);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER_INFO || !process.env.SMTP_PASS_INFO) {
      throw new Error('ACEF email configuration missing');
    }

    const transporter = createTransporter('info');
    const activationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/activate-account/${activationToken}`;

    // Define role descriptions
    const roleDescriptions = {
      'admin': 'Full system access and user management',
      'Content Manager': 'Manage content, blogs, and projects',
      'Assistant Admin': 'Limited administrative privileges with custom permissions'
    };

    const permissionsHtml = permissions.length > 0 
      ? `
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #2e7d32; margin: 0 0 10px 0;">Your Permissions:</h4>
          <ul style="color: #1b5e20; margin: 0; padding-left: 20px;">
            ${permissions.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const mailOptions = {
      from: getSenderInfo('info'),
      to: recipientEmail,
      subject: `🎉 You've been invited to join ACEF as ${role}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ACEF Team Invitation</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8fafb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 40px 30px; border-radius: 20px; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(25, 118, 210, 0.3);">
            <h1 style="color: white; margin: 0; font-size: 2.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎉 Welcome to ACEF!</h1>
            <p style="color: rgba(255, 255, 255, 0.95); margin: 15px 0 0 0; font-size: 1.3rem; font-weight: 500;">You've been invited to join our team</p>
          </div>
          
          <!-- Personal Message -->
          <div style="background: white; padding: 35px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); border-left: 5px solid #1976d2;">
            <h2 style="color: #1565c0; margin: 0 0 20px 0; font-size: 1.8rem;">Dear ${recipientName},</h2>
            
            <p style="font-size: 1.1rem; margin-bottom: 20px; color: #374151;">
              <strong>${invitedBy}</strong> has invited you to join the African Climate and Environment Foundation (ACEF) team as a <strong style="color: #1565c0;">${role}</strong>.
            </p>
            
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #90caf9;">
              <h3 style="color: #0d47a1; margin: 0 0 15px 0; font-size: 1.3rem; display: flex; align-items: center;">
                <span style="margin-right: 10px;">👤</span> Your Role: ${role}
              </h3>
              <p style="color: #1565c0; margin: 0; font-size: 1rem;">
                ${roleDescriptions[role] || 'Custom role with specified permissions'}
              </p>
              ${permissionsHtml}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" 
                 style="background: #1976d2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);">
                Accept Invitation & Set Password
              </a>
            </div>
            
            <p style="font-size: 1rem; color: #666; text-align: center; margin-top: 20px;">
              Or copy and paste this link into your browser:<br/>
              <code style="background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 0.9rem; word-break: break-all;">${activationLink}</code>
            </p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 1rem;">
                <strong>⏰ Important:</strong> This invitation link will expire in 7 days. Please activate your account soon to get started.
              </p>
            </div>
          </div>

          <!-- About ACEF -->
          <div style="background: white; padding: 30px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.08);">
            <h3 style="color: #1565c0; margin: 0 0 20px 0; font-size: 1.5rem;">🌍 About ACEF</h3>
            <p style="color: #6b7280; margin-bottom: 15px; font-size: 1rem;">
              ACEF is dedicated to building climate resilience across Africa through innovative solutions, community empowerment, and environmental education. As part of our team, you'll contribute to meaningful climate action that creates lasting positive impact.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
              <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 2rem; margin-bottom: 8px;">🌱</div>
                <div style="font-weight: 600; color: #1565c0;">50+</div>
                <div style="font-size: 0.9rem; color: #666;">Climate Projects</div>
              </div>
              <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 2rem; margin-bottom: 8px;">🌍</div>
                <div style="font-weight: 600; color: #1565c0;">12</div>
                <div style="font-size: 0.9rem; color: #666;">African Countries</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 0.95rem;">
            <p style="margin: 0 0 10px 0;">
              <strong style="color: #1565c0;">African Climate and Environment Foundation (ACEF)</strong>
            </p>
            <p style="margin: 0 0 15px 0;">
              Building climate resilience across Africa, together.
            </p>
            <p style="margin: 0; font-size: 0.85rem;">
              This invitation was sent by ${invitedBy}. 
              <a href="mailto:info@acef-ngo.org" style="color: #1976d2;">Contact us</a> if you have questions.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${recipientName},

        ${invitedBy} has invited you to join the African Climate and Environment Foundation (ACEF) team as a ${role}.

        Role: ${role}
        Description: ${roleDescriptions[role] || 'Custom role with specified permissions'}

        ${permissions.length > 0 ? `Your Permissions:\n${permissions.map(p => `• ${p}`).join('\n')}` : ''}

        About ACEF:
        ACEF is dedicated to building climate resilience across Africa through innovative solutions, community empowerment, and environmental education.

        To accept this invitation and set your password, click this link:
        ${activationLink}

        This invitation will expire in 7 days.

        Welcome to the team!

        Best regards,
        ACEF Team
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ User invitation email sent successfully:', {
      messageId: info.messageId,
      recipient: recipientEmail,
      role
    });

    return info;

  } catch (error) {
    console.error('❌ Failed to send user invitation email:', {
      error: error.message,
      recipient: recipientEmail
    });
    
    throw error;
  }
};

// Admin communication email
exports.sendAdminCommunicationEmail = async ({
  recipientEmail,
  recipientName,
  subject,
  message,
}) => {
  if (!recipientEmail || !subject || !message) {
    throw new Error("Missing required parameters for admin email");
  }

  try {
    const transporter = createTransporter('info');

    const mailOptions = {
      from: getSenderInfo('info'),
      to: recipientEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <p>Hi ${recipientName || "applicant"},</p>
          <p>${message}</p>
          <p style="margin-top: 2rem;">Best regards,<br/>ACEF Admin Team</p>
        </div>
      `,
      text: `Hi ${recipientName || "applicant"},\n\n${message}\n\nBest regards,\nACEF Admin Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Admin communication email sent:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending admin communication email:", error);
    return { success: false, error: error.message };
  }
};

// Send donation badge email
exports.sendDonationBadgeEmail = async ({
  donationId,
  recipientEmail,
  recipientName,
  donationAmount,
  badgeBuffer,
  badgeFilename = null,
  isAnonymous = false
}) => {
  try {
    console.log(`📧 Preparing badge email for: ${recipientEmail}`);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER_FUNDRAISING || !process.env.SMTP_PASS_FUNDRAISING) {
      throw new Error('ACEF fundraising email configuration missing');
    }

    // CRITICAL FIX: Validate badge buffer with comprehensive checks
    if (!badgeBuffer) {
      throw new Error('Badge buffer is required but not provided');
    }

    if (!Buffer.isBuffer(badgeBuffer)) {
      console.error('❌ Invalid buffer type:', {
        providedType: typeof badgeBuffer,
        isBuffer: Buffer.isBuffer(badgeBuffer),
        isNull: badgeBuffer === null,
        isUndefined: badgeBuffer === undefined,
        constructor: badgeBuffer?.constructor?.name
      });
      throw new Error(`Invalid badge buffer type. Expected Buffer, got ${typeof badgeBuffer}`);
    }

    if (badgeBuffer.length === 0) {
      throw new Error('Badge buffer is empty (0 bytes)');
    }

    // ENHANCED: Validate PNG signature for additional safety
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const jpegSignature = Buffer.from([255, 216, 255]);
    
    const isPNG = badgeBuffer.subarray(0, 8).equals(pngSignature);
    const isJPEG = badgeBuffer.subarray(0, 3).equals(jpegSignature);
    
    if (!isPNG && !isJPEG) {
      console.warn('⚠️ Badge buffer does not have valid PNG/JPEG signature');
      console.log('Buffer start bytes:', badgeBuffer.subarray(0, 10));
    }

    console.log(`✅ Buffer validation passed:`, {
      size: badgeBuffer.length,
      type: 'Buffer',
      isPNG,
      isJPEG,
      firstBytes: badgeBuffer.subarray(0, 8).toString('hex')
    });

    const transporter = createTransporter('fundraising');
    const displayName = isAnonymous ? 'ACEF Friend' : recipientName;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(donationAmount);

    const filename = badgeFilename || `ACEF_Badge_${donationId}_${Date.now()}.png`;

    // CRITICAL FIX: Ensure buffer is properly handled in attachment
    const mailOptions = {
      from: getSenderInfo('fundraising'),
      to: recipientEmail,
      subject: `🏆 Your ACEF Donation Badge - Thank You ${displayName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your ACEF Donation Badge</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8fafb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0a451c 0%, #16a34a 100%); padding: 40px 30px; border-radius: 20px; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(10, 69, 28, 0.3);">
            <h1 style="color: white; margin: 0; font-size: 2.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏆 Thank You!</h1>
            <p style="color: rgba(255, 255, 255, 0.95); margin: 15px 0 0 0; font-size: 1.3rem; font-weight: 500;">Your generosity makes a difference</p>
          </div>
          
          <!-- Personal Message -->
          <div style="background: white; padding: 35px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); border-left: 5px solid #16a34a;">
            <h2 style="color: #0a451c; margin-bottom: 20px;">Dear ${displayName},</h2>
            
            <p style="font-size: 1.1rem; margin-bottom: 20px; color: #374151;">
              Your generous donation of <strong style="color: #0a451c;">${formattedAmount}</strong> has been successfully processed and is already making an impact in our climate action initiatives.
            </p>
            
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #bbf7d0;">
              <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 1.3rem; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🌱</span> Your Impact
              </h3>
              <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 1rem;">
                <li style="margin-bottom: 8px;">Supporting sustainable climate solutions across Africa</li>
                <li style="margin-bottom: 8px;">Empowering communities to build resilience against climate change</li>
                <li style="margin-bottom: 8px;">Funding research and education for environmental protection</li>
                <li>Contributing to a network of positive environmental change</li>
              </ul>
            </div>
            
            <p style="font-size: 1.1rem; color: #374151; margin-bottom: 25px;">
              As a token of our appreciation, we've created a personalized donation badge for you. Please find it attached to this email. Feel free to share it on social media to inspire others!
            </p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border: 2px dashed #22c55e; text-align: center; margin: 20px 0;">
              <h4 style="color: #065f46; margin: 0 0 10px 0;">📎 Badge Attachment</h4>
              <p style="color: #047857; margin: 0; font-size: 0.95rem;">
                Your personalized badge is attached as: <strong>${filename}</strong>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 0.95rem;">
            <p style="margin: 0 0 10px 0;">
              <strong style="color: #0a451c;">African Climate and Environment Foundation (ACEF)</strong>
            </p>
            <p style="margin: 0 0 15px 0;">
              Building climate resilience across Africa, one donation at a time.
            </p>
            <p style="margin: 0; font-size: 0.85rem;">
              Donation ID: ${donationId} | Badge File: ${filename}
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${displayName},

        Thank you for your generous donation of ${formattedAmount} to ACEF!

        Your donation has been processed and is making an impact in our climate initiatives.

        We've attached a personalized donation badge (${filename}) as our appreciation.

        Feel free to share your badge on social media to inspire others!

        Best regards,
        ACEF Fundraising Team

        Donation ID: ${donationId}
      `,
      attachments: [
        {
          filename: filename,
          content: badgeBuffer, // FIXED: Direct buffer usage without conversion
          contentType: isPNG ? 'image/png' : 'image/jpeg',
          // REMOVED: encoding: 'base64' - let nodemailer handle Buffer directly
          cid: 'donation-badge'
        }
      ]
    };

    console.log(`📤 Sending email with attachment:`, {
      filename,
      bufferSize: badgeBuffer.length,
      contentType: isPNG ? 'image/png' : 'image/jpeg',
      recipient: recipientEmail
    });

    // CRITICAL FIX: Verify transporter and send
    try {
      // Test connection briefly
      await transporter.verify();
      console.log('✅ ACEF SMTP connection verified for badge email');
    } catch (verifyError) {
      console.warn('⚠️ ACEF SMTP verification failed, attempting send anyway:', verifyError.message);
    }

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Badge email sent successfully:', {
      messageId: info.messageId,
      recipient: recipientEmail,
      donationId,
      attachmentSize: badgeBuffer.length,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return info;

  } catch (error) {
    console.error('❌ Failed to send badge email:', {
      error: error.message,
      stack: error.stack,
      recipient: recipientEmail,
      donationId,
      bufferProvided: !!badgeBuffer,
      bufferValid: badgeBuffer ? Buffer.isBuffer(badgeBuffer) : false,
      bufferLength: badgeBuffer?.length || 0
    });
    
    throw error;
  }
};

/**
 * Send donation reminder email
 */
exports.sendDonationReminderEmail = async ({
  donationId,
  recipientEmail,
  recipientName,
  donationAmount,
  reminderType = 'payment_pending',
  customMessage = '',
  donationType = 'general'
}) => {
  try {
    console.log(`📧 Sending ${reminderType} reminder to: ${recipientEmail}`);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER_FUNDRAISING || !process.env.SMTP_PASS_FUNDRAISING) {
      throw new Error('ACEF fundraising email configuration missing');
    }

    const transporter = createTransporter('fundraising');
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(donationAmount);

    // Define reminder content based on type
    const reminderContent = {
      payment_pending: {
        subject: '💳 Payment Pending - Complete Your ACEF Donation',
        title: 'Complete Your Donation',
        icon: '💳',
        mainMessage: `We noticed your ${formattedAmount} donation to ACEF is still pending payment. We'd love to help you complete this contribution to our climate action initiatives.`,
        actionText: 'Complete Payment',
        urgency: 'Your donation helps fund critical climate resilience projects across Africa.'
      },
      completion_reminder: {
        subject: '🌱 Your ACEF Donation - Processing Update',
        title: 'Donation Processing Update',
        icon: '🌱',
        mainMessage: `Thank you for your ${formattedAmount} donation! We're processing your contribution and will send your recognition badge soon.`,
        actionText: 'Track Progress',
        urgency: 'Your support is already making a difference in our climate initiatives.'
      },
      thank_you_follow: {
        subject: '🙏 Follow-up: Your Impact with ACEF',
        title: 'Your Ongoing Impact',
        icon: '🙏',
        mainMessage: `Your ${formattedAmount} donation continues to create positive change. Here's an update on how your contribution is helping build climate resilience.`,
        actionText: 'See Your Impact',
        urgency: 'Together, were building a more sustainable future for Africa'
      }
    };

    const content = reminderContent[reminderType] || reminderContent.payment_pending;

    const mailOptions = {
      from: getSenderInfo('fundraising'),
      to: recipientEmail,
      subject: content.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${content.title}</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8fafb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); padding: 35px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 2.2rem;">${content.icon} ${content.title}</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 1.1rem;">ACEF Donation Reminder</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 35px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.08);">
            <h2 style="color: #0f766e; margin-bottom: 20px;">Dear ${recipientName},</h2>
            
            <p style="font-size: 1.1rem; margin-bottom: 25px; color: #374151;">
              ${content.mainMessage}
            </p>
            
            ${customMessage ? `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
              <h4 style="color: #0369a1; margin: 0 0 10px 0;">Personal Message:</h4>
              <p style="color: #0c4a6e; margin: 0; font-style: italic;">"${customMessage}"</p>
            </div>
            ` : ''}
            
            <div style="background: linear-gradient(135deg, #ecfeff 0%, #f0f9ff 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #a5f3fc;">
              <p style="color: #155e75; margin: 0; font-size: 1rem; text-align: center; font-weight: 500;">
                ${content.urgency}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'https://acef.org'}/donations/${donationId}" 
                 style="background: #0f766e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 1.1rem;">
                ${content.actionText}
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 0.9rem; text-align: center;">
                <strong>Donation Details:</strong> ID: ${donationId} | Amount: ${formattedAmount} | Type: ${donationType}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 0.95rem;">
            <p style="margin: 0 0 10px 0;">
              <strong style="color: #0f766e;">African Climate and Environment Foundation (ACEF)</strong>
            </p>
            <p style="margin: 0 0 15px 0;">
              Building climate resilience across Africa, together.
            </p>
            <p style="margin: 0; font-size: 0.85rem;">
              This reminder was sent regarding donation ${donationId}. 
              <a href="mailto:fundraising@acef-ngo.org" style="color: #0f766e;">Contact us</a> if you have questions.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${recipientName},

        ${content.title}

        ${content.mainMessage}

        ${customMessage ? `Personal Message: "${customMessage}"` : ''}

        ${content.urgency}

        To ${content.actionText.toLowerCase()}, visit:
        ${process.env.CLIENT_URL || 'https://acef.org'}/donations/${donationId}

        Donation Details:
        - ID: ${donationId}
        - Amount: ${formattedAmount}
        - Type: ${donationType}

        Best regards,
        ACEF Fundraising Team

        Contact us: fundraising@acef-ngo.org
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Reminder email sent successfully:', {
      messageId: info.messageId,
      recipient: recipientEmail,
      reminderType,
      donationId
    });

    return info;

  } catch (error) {
    console.error('❌ Failed to send reminder email:', {
      error: error.message,
      recipient: recipientEmail,
      reminderType,
      donationId
    });
    
    throw error;
  }
};

// Send job application email
exports.sendJobApplicationEmail = async ({ to, subject, applicantName, jobTitle, message }) => {
  try {
    console.log('📧 Preparing job application email to:', to);

    // Validate required fields
    if (!to || !subject || !applicantName || !jobTitle || !message) {
      throw new Error('Missing required email parameters');
    }

    // Create transporter
    const transporter = createTransporter('info');

    const mailOptions = {
      from: getSenderInfo('info'),
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8fafb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 35px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 2rem;">💼 ACEF Recruitment</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 1.1rem;">${subject}</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 35px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.08);">
            <h2 style="color: #1565c0; margin-bottom: 20px;">Hello ${applicantName},</h2>
            
            <div style="background: #f0f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #2563eb;">
              <p style="color: #1e40af; margin: 0; font-size: 1.1rem; line-height: 1.7;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="color: #065f46; margin: 0 0 10px 0;">📋 Application Details</h4>
              <p style="color: #047857; margin: 0; font-size: 0.95rem;">
                <strong>Position:</strong> ${jobTitle}<br/>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </p>
            </div>
            
            <p style="margin-top: 30px; color: #374151; font-size: 1rem;">
              Best regards,<br/>
              <strong style="color: #1565c0;">ACEF Recruitment Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 0.9rem;">
            <p style="margin: 0 0 10px 0;">
              <strong style="color: #1565c0;">African Climate and Environment Foundation (ACEF)</strong>
            </p>
            <p style="margin: 0 0 15px 0;">
              Building climate resilience across Africa through exceptional talent.
            </p>
            <p style="margin: 0; font-size: 0.8rem;">
              This email is regarding your application for <strong>${jobTitle}</strong>.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${applicantName},

        ${message}

        Position: ${jobTitle}
        Date: ${new Date().toLocaleDateString()}

        Best regards,
        ACEF Recruitment Team

        ---
        African Climate and Environment Foundation (ACEF)
        Building climate resilience across Africa through exceptional talent.
        
        This email is regarding your application for ${jobTitle}.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Job application email sent successfully:", {
      messageId: info.messageId,
      to,
      subject
    });
    
    return info;

  } catch (error) {
    console.error("❌ Error sending job application email:", error);
    throw error;
  }
};

/**
 * Enhanced email connection test with detailed diagnostics
 */
exports.testEmailConnection = async () => {
  try {
    console.log('🔍 Testing ACEF email connection...');
    
    const transporter = createTransporter('info');
    
    // Test connection
    await transporter.verify();
    
    // Send a test email to verify full functionality
    const testMailOptions = {
      from: getSenderInfo('info'),
      to: process.env.SMTP_USER_INFO, // Send to self
      subject: '✅ ACEF Email System Test',
      html: `
        <h2>ACEF Email System Test Successful</h2>
        <p>This test email confirms that the ACEF official email system is working properly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>User: ${process.env.SMTP_USER_INFO}</li>
        </ul>
      `,
      text: `
        ACEF Email System Test Successful
        
        This test email confirms that the ACEF official email system is working properly.
        
        Timestamp: ${new Date().toISOString()}
        Host: ${process.env.SMTP_HOST}
        Port: ${process.env.SMTP_PORT}
        User: ${process.env.SMTP_USER_INFO}
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    
    console.log('✅ ACEF email connection test successful:', {
      messageId: info.messageId,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER_INFO
    });
    
    return { 
      success: true, 
      message: 'ACEF email connection working perfectly',
      details: {
        messageId: info.messageId,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        testEmailSent: true
      }
    };
    
  } catch (error) {
    console.error('❌ ACEF email connection test failed:', error.message);
    
    return { 
      success: false, 
      message: error.message,
      details: {
        host: process.env.SMTP_HOST || 'not set',
        port: process.env.SMTP_PORT || 'not set',
        user: process.env.SMTP_USER_INFO || 'not set',
        errorCode: error.code
      }
    };
  }
};

// Send welcome email for newsletter subscription
exports.sendWelcomeEmail = async (to, unsubscribeLink) => {
  try {
    console.log('📧 Sending welcome email to:', to);

    const transporter = createTransporter('community');

    const mailOptions = {
      from: getSenderInfo('community'),
      to,
      subject: '🌱 Welcome to ACEF Newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ACEF Newsletter</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 2.2rem;">🌱 Welcome to ACEF!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 1.1rem;">Thank you for joining our climate action community</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #047857; margin-bottom: 20px;">What to expect:</h2>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; top: 0; color: #10b981; font-size: 1.2rem;">🌍</span>
                <strong>Impact Stories:</strong> Real stories of environmental change and progress
              </li>
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; top: 0; color: #10b981; font-size: 1.2rem;">💡</span>
                <strong>Climate Insights:</strong> Latest research and actionable climate solutions
              </li>
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; top: 0; color: #10b981; font-size: 1.2rem;">🤝</span>
                <strong>Action Opportunities:</strong> Ways to get involved and make a difference
              </li>
              <li style="margin-bottom: 0; padding-left: 30px; position: relative;">
                <span style="position: absolute; left: 0; top: 0; color: #10b981; font-size: 1.2rem;">📈</span>
                <strong>Project Updates:</strong> Progress reports from our climate initiatives
              </li>
            </ul>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; font-size: 0.9rem; color: #6b7280; text-align: center;">
            <p>You're receiving this because you subscribed to the ACEF newsletter.</p>
            <p>
              <a href="${unsubscribeLink}" style="color: #047857; text-decoration: none;">
                Unsubscribe from future emails
              </a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to ACEF Newsletter!
        
        Thank you for joining our climate action community.
        
        What to expect:
        • Impact Stories: Real stories of environmental change and progress
        • Climate Insights: Latest research and actionable climate solutions  
        • Action Opportunities: Ways to get involved and make a difference
        • Project Updates: Progress reports from our climate initiatives
        
        Unsubscribe: ${unsubscribeLink}
        
        Best regards,
        ACEF Community Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    throw error;
  }
};