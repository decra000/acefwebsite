// services/actions/ContactAction.js
const BaseAction = require('./BaseAction');

class ContactAction extends BaseAction {
  static get config() {
    return {
      required: ['name', 'email', 'subject', 'message'],
      optional: ['phone', 'organization', 'country'],
      endpoint: '/country-contacts/send-email',
      steps: ['Your details', 'Message', 'Send']
    };
  }

  async submit(data) {
    const errors = this.validateBasic(data);
    if (errors.length > 0) {
      return { success: false, message: errors.join(', '), errors };
    }

    try {
      const country = data.country || 'Kenya';
      
      const emailOptions = {
        to: 'info@acef-ngo.org',
        subject: `Contact Form: ${data.subject}`,
        replyTo: data.email,
        formData: {
          name: data.name,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || '',
          organization: data.organization || '',
          subject: data.subject,
          message: data.message,
          timestamp: new Date().toISOString()
        }
      };

      const response = await this.api.post('/country-contacts/send-email', {
        country: country,
        emailOptions: emailOptions
      });

      if (response.success) {
        return {
          success: true,
          message: this.getSuccessMessage(data),
          data: response
        };
      }

      throw new Error(response.message || 'Failed to send message');
    } catch (error) {
      return {
        success: false,
        message: `Failed to submit: ${error.message}`,
        error
      };
    }
  }

  getSuccessMessage(data) {
    return `✅ **Message Sent Successfully!**

Thank you ${data.name}! Your message about **"${data.subject}"** has been received.

📧 We'll respond to **${data.email}** within 24-48 hours.`;
  }
}

module.exports = ContactAction;
