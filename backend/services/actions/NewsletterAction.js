// services/actions/NewsletterAction.js
const BaseAction = require('./BaseAction');

class NewsletterAction extends BaseAction {
  static get config() {
    return {
      required: ['email'],
      optional: ['name'],
      endpoint: '/newsletter/subscribe',
      steps: ['Subscribe']
    };
  }

  async submit(data) {
    const errors = this.validateBasic(data);
    if (errors.length > 0) {
      return { success: false, message: errors.join(', '), errors };
    }

    try {
      const payload = {
        email: data.email.toLowerCase().trim(),
        name: data.name || data.fullName || '',
        source: 'chatbot_subscription'
      };

      const response = await this.api.post('/newsletter/subscribe', payload);

      return {
        success: true,
        message: this.getSuccessMessage(data),
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to subscribe: ${error.message}`,
        error
      };
    }
  }

  getSuccessMessage(data) {
    return `✅ **Welcome to ACEF Newsletter!**

Thank you for subscribing${data.name ? `, ${data.name}` : ''}!

📧 You'll receive updates at **${data.email}**`;
  }
}

module.exports = NewsletterAction;