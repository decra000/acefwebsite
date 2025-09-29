// services/ActionHandler.js
const axios = require('axios');

class ActionHandler {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.timeout = 15000;
  }

  static ACTION_CONFIG = {
    job_inquiry: {
      required: ['fullName', 'email', 'position'],
      optional: ['phone', 'coverLetter', 'experience'],
      endpoint: '/job-applications',
      steps: ['Personal info', 'Position details', 'Submit']
    },
    event_inquiry: {
      required: ['fullName', 'email', 'eventName'],
      optional: ['phone', 'organization', 'message'],
      endpoint: '/event-interests',
      steps: ['Your info', 'Event selection', 'Confirm']
    },
    volunteer_inquiry: {
      required: ['fullName', 'email', 'country'],
      optional: ['phone', 'skills', 'availability'],
      endpoint: '/volunteer-applications',
      steps: ['Personal info', 'Location & skills', 'Submit']
    },
    partnership_inquiry: {
      required: ['organizationName', 'contactPerson', 'email', 'partnershipType'],
      optional: ['phone', 'website', 'description'],
      endpoint: '/contacts',
      steps: ['Organization details', 'Contact info', 'Partnership type', 'Submit']
    },
    donation_inquiry: {
      required: ['donorName', 'email'],
      optional: ['phone', 'message', 'amount'],
      endpoint: null,
      steps: ['Donor info', 'Donation details']
    },
    contact_inquiry: {
      required: ['name', 'email', 'subject', 'message'],
      optional: ['phone', 'organization'],
      endpoint: '/contacts',
      steps: ['Your details', 'Message', 'Send']
    },
    newsletter_subscription: {
      required: ['email'],
      optional: ['name'],
      endpoint: '/newsletter/subscribe',
      steps: ['Subscribe']
    }
  };

  getMissingFields(collectedData, actionType) {
    const config = ActionHandler.ACTION_CONFIG[actionType];
    if (!config) return [];

    return config.required.filter(field => 
      !collectedData[field] || 
      (typeof collectedData[field] === 'string' && collectedData[field].trim() === '')
    );
  }

  isReadyToSubmit(collectedData, actionType) {
    return this.getMissingFields(collectedData, actionType).length === 0;
  }

  async submitAction(actionType, data) {
    const config = ActionHandler.ACTION_CONFIG[actionType];
    
    if (!config) {
      throw new Error(`Unknown action type: ${actionType}`);
    }

    if (!config.endpoint) {
      return this.handleSpecialAction(actionType, data);
    }

    try {
      const payload = this.preparePayload(actionType, data);
      const response = await this.makeRequest(config.endpoint, 'POST', payload);
      
      return {
        success: true,
        message: this.getSuccessMessage(actionType, data),
        data: response
      };
    } catch (error) {
      console.error(`Action submission failed for ${actionType}:`, error);
      return {
        success: false,
        message: `Failed to submit: ${error.message}. Please try again or contact us directly.`,
        error: error
      };
    }
  }

  preparePayload(actionType, data) {
    switch (actionType) {
      case 'job_inquiry':
        return {
          job_id: data.jobId || 1,
          name: data.fullName || data.name,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || '',
          position: data.position || 'General Application',
          cover_letter: data.coverLetter || `I am interested in the ${data.position || 'available'} position at ACEF.`,
          experience: data.experience || '',
          location: data.location || ''
        };

      case 'event_inquiry':
        return {
          event_id: data.eventId || 1,
          name: data.fullName || data.name,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || '',
          organization: data.organization || '',
          message: data.message || `I am interested in attending ${data.eventName || 'the event'}.`
        };

      case 'volunteer_inquiry':
        return {
          name: data.fullName || data.name,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || '',
          country: data.country,
          skills: data.skills || '',
          availability: data.availability || '',
          message: data.message || ''
        };

      case 'partnership_inquiry':
        return {
          name: data.contactPerson || data.name,
          email: data.email.toLowerCase().trim(),
          subject: `Partnership Inquiry - ${data.organizationName}`,
          message: `Organization: ${data.organizationName}\nPartnership Type: ${data.partnershipType}\n\n${data.description || 'Partnership inquiry submitted via chatbot.'}`,
          phone: data.phone || '',
          organization: data.organizationName
        };

      case 'contact_inquiry':
        return {
          name: data.name || data.fullName,
          email: data.email.toLowerCase().trim(),
          subject: data.subject,
          message: data.message,
          phone: data.phone || '',
          organization: data.organization || ''
        };

      case 'newsletter_subscription':
        return {
          email: data.email.toLowerCase().trim(),
          name: data.name || data.fullName || '',
          source: 'chatbot_subscription'
        };

      default:
        return data;
    }
  }

  handleSpecialAction(actionType, data) {
    switch (actionType) {
      case 'donation_inquiry':
        return {
          success: true,
          message: `Thank you for your interest in supporting ACEF${data.amount ? ` with $${data.amount}` : ''}!

💰 **Donation Methods:**
• Bank transfers (multiple currencies)
• Mobile money (MTN, Orange, M-Pesa)
• International wire transfer

📧 **Next Steps:**
Contact us for detailed donation information:
• Email: info@acef.org
• WhatsApp: [Your contact number]

We'll provide account details and guide you through the process.`,
          data: data
        };

      default:
        throw new Error(`No handler for action type: ${actionType}`);
    }
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        url: `${this.apiBase}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout
      };

      if (body) {
        options.data = body;
      }

      const response = await axios(options);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || `HTTP ${error.response.status}`);
      }
      throw error;
    }
  }

  getSuccessMessage(actionType, data) {
    switch (actionType) {
      case 'job_inquiry':
        return `✅ **Application Submitted!**

Thank you ${data.fullName || data.name}! Your application for **${data.position}** has been received.

📧 We'll review your application and contact you at **${data.email}** within 5-7 business days.`;

      case 'event_inquiry':
        return `✅ **Registration Confirmed!**

Great news ${data.fullName || data.name}! You're registered for **${data.eventName || 'the event'}**.

📧 Event details will be sent to **${data.email}**`;

      case 'volunteer_inquiry':
        return `✅ **Volunteer Application Received!**

Thank you ${data.fullName || data.name} for wanting to volunteer in **${data.country}**!

📧 Our volunteer coordinator will contact you at **${data.email}** within 3-5 business days.`;

      case 'partnership_inquiry':
        return `✅ **Partnership Inquiry Submitted!**

Thank you for **${data.organizationName}**'s interest in partnering with ACEF!

📧 Our partnerships team will respond to **${data.email}** soon.`;

      case 'contact_inquiry':
        return `✅ **Message Sent Successfully!**

Thank you ${data.name}! Your message about **"${data.subject}"** has been received.

📧 We'll respond to **${data.email}** within 24-48 hours.`;

      case 'newsletter_subscription':
        return `✅ **Welcome to ACEF Newsletter!**

Thank you for subscribing${data.name ? `, ${data.name}` : ''}!

📧 You'll receive updates at **${data.email}**`;

      default:
        return 'Submission successful! We\'ll be in touch soon.';
    }
  }

  async autoSubscribeNewsletter(email, name = null) {
    try {
      const response = await this.makeRequest('/newsletter/subscribe', 'POST', {
        email: email.toLowerCase().trim(),
        name: name || '',
        source: 'chatbot_auto_subscribe'
      });

      if (response.success || response.data) {
        console.log('✅ Auto-subscribed to newsletter:', email);
        return true;
      }
    } catch (error) {
      console.log('Newsletter auto-subscribe failed (non-critical):', error.message);
    }
    return false;
  }

  validateData(actionType, data) {
    const errors = [];
    const config = ActionHandler.ACTION_CONFIG[actionType];

    if (!config) {
      errors.push('Invalid action type');
      return errors;
    }

    for (const field of config.required) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${field} is required`);
      }
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    if (data.phone && data.phone.length < 7) {
      errors.push('Phone number too short');
    }

    return errors;
  }
}

module.exports = ActionHandler;