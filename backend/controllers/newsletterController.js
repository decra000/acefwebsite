const Newsletter = require('../models/Newsletter');
const { sendWelcomeEmail, sendNewsletterMessage } = require('../utils/mailer');

// Enhanced subscribe function with better error handling
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    const existingSubscriber = await Newsletter.getByEmail(email);
    if (existingSubscriber && existingSubscriber.is_active) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already subscribed to our newsletter' 
      });
    }

    const subscriber = await Newsletter.subscribe(email);

    // Enhanced welcome email with better error handling
    try {
      const unsubscribeLink = `${process.env.CLIENT_URL}/unsubscribe/${subscriber.unsubscribe_token}`;
      await sendWelcomeEmail(email, unsubscribeLink);
      console.log(`✅ Welcome email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send welcome email to ${email}:`, emailError.message);
      // Log the specific error but don't fail the subscription
    }

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: {
        email: subscriber.email,
        subscribed_at: subscriber.subscribed_at
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.message === 'Email is already subscribed') {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already subscribed to our newsletter' 
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
};

// Enhanced sendMessage function with detailed error tracking
exports.sendMessage = async (req, res) => {
  try {
    const { subject, message, messageType = 'newsletter' } = req.body;

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    if (subject.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Subject must be less than 200 characters'
      });
    }

    if (message.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be less than 10,000 characters'
      });
    }

    // Get all active subscribers
    const subscribers = await Newsletter.getAllActive();
    
    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    console.log(`📧 Starting to send newsletter to ${subscribers.length} subscribers`);

    // Save message to database
    const messageId = await Newsletter.saveMessage({
      subject,
      message,
      messageType,
      totalRecipients: subscribers.length
    });

    // Enhanced batch processing with detailed error logging
    const batchSize = 5; // Reduced batch size for better reliability
    let successCount = 0;
    let failedEmails = [];
    let detailedErrors = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      console.log(`📤 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(subscribers.length/batchSize)} (${batch.length} emails)`);
      
      // Process batch sequentially to avoid overwhelming email server
      for (const subscriber of batch) {
        try {
          const unsubscribeLink = `${process.env.CLIENT_URL}/unsubscribe/${subscriber.unsubscribe_token}`;
          
          console.log(`📧 Sending to: ${subscriber.email}`);
          
          const result = await sendNewsletterMessage({
            email: subscriber.email,
            subject,
            message,
            messageType,
            unsubscribeLink,
            messageId
          });
          
          console.log(`✅ Email sent successfully to ${subscriber.email} - MessageID: ${result.messageId}`);
          successCount++;
          
        } catch (error) {
          console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
          failedEmails.push(subscriber.email);
          detailedErrors.push({
            email: subscriber.email,
            error: error.message,
            code: error.code || 'UNKNOWN',
            response: error.response || null
          });
        }

        // Small delay between individual emails
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Longer delay between batches
      if (i + batchSize < subscribers.length) {
        console.log('⏱️ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Update message stats
    await Newsletter.updateMessageStats(messageId, successCount, failedEmails.length);

    // Log detailed results
    console.log(`📊 Newsletter sending completed:`, {
      total: subscribers.length,
      successful: successCount,
      failed: failedEmails.length,
      failedEmails: failedEmails,
      messageId
    });

    // Log detailed error information for debugging
    if (detailedErrors.length > 0) {
      console.error('📋 Detailed error breakdown:');
      detailedErrors.forEach((error, index) => {
        console.error(`${index + 1}. ${error.email}: ${error.error} (Code: ${error.code})`);
      });
    }

    // Return response with success/failure details
    const response = {
      success: successCount > 0, // Consider it successful if at least one email was sent
      message: successCount === subscribers.length 
        ? 'Newsletter message sent successfully to all subscribers'
        : `Newsletter message sent to ${successCount} of ${subscribers.length} subscribers`,
      data: {
        messageId,
        totalSubscribers: subscribers.length,
        successfulSends: successCount,
        failedSends: failedEmails.length,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
        detailedErrors: process.env.NODE_ENV === 'development' ? detailedErrors : undefined
      }
    };

    // Return appropriate status code
    if (successCount === 0) {
      return res.status(500).json({
        ...response,
        success: false,
        message: 'Failed to send newsletter to any subscribers. Please check email configuration.'
      });
    } else if (failedEmails.length > 0) {
      return res.status(207).json(response); // 207 Multi-Status for partial success
    } else {
      return res.status(200).json(response);
    }

  } catch (error) {
    console.error('❌ Send newsletter message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enhanced unsubscribe function
exports.unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unsubscribe token is required' 
      });
    }

    const subscriber = await Newsletter.getByToken(token);
    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid unsubscribe link' 
      });
    }

    if (!subscriber.is_active) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already unsubscribed' 
      });
    }

    const success = await Newsletter.unsubscribe(token);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: {
          email: subscriber.email
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to unsubscribe. Please try again.'
      });
    }

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.'
    });
  }
};

// Get newsletter statistics (admin only)
exports.getStats = async (req, res) => {
  try {
    const stats = await Newsletter.getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics'
    });
  }
};

// Get all active subscribers (admin only)
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.getAllActive();
    
    res.status(200).json({
      success: true,
      data: subscribers,
      count: subscribers.length
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};

// Delete subscriber (admin only)
exports.deleteSubscriber = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const success = await Newsletter.deleteByEmail(email);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Subscriber deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber'
    });
  }
};

// Get message history (admin only)
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const messages = await Newsletter.getMessages(parseInt(limit), parseInt(offset));
    const totalCount = await Newsletter.getMessageCount();

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message history'
    });
  }
};