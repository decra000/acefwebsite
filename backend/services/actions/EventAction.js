// services/actions/EventAction.js
const BaseAction = require('./BaseAction');

class EventAction extends BaseAction {
  static get config() {
    return {
      required: ['fullName', 'email', 'eventName'],
      optional: ['phone', 'organization', 'message'],
      endpoint: '/event-interests',
      steps: ['Your info', 'Event selection', 'Confirm']
    };
  }

  async getEvents(filters = {}) {
    return this.api.get('/events', filters);
  }

  async getEventById(eventId) {
    return this.api.get(`/events/${eventId}`);
  }

  async submit(data) {
    const errors = this.validateBasic(data);
    if (errors.length > 0) {
      return { success: false, message: errors.join(', '), errors };
    }

    try {
      const payload = {
        event_id: data.eventId || 1,
        name: data.fullName || data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || '',
        organization: data.organization || '',
        message: data.message || `I am interested in attending ${data.eventName}.`
      };

      const response = await this.api.post('/event-interests', payload);

      return {
        success: true,
        message: this.getSuccessMessage(data),
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to submit: ${error.message}`,
        error
      };
    }
  }

  getSuccessMessage(data) {
    return `✅ **Registration Confirmed!**

Great news ${data.fullName || data.name}! You're registered for **${data.eventName}**.

📧 Event details will be sent to **${data.email}**`;
  }
}

module.exports = EventAction;