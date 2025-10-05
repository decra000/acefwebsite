// services/actions/EventAction.js
const BaseAction = require('./BaseAction');

class EventAction extends BaseAction {
  static get config() {
    return {
      required: ['name', 'email', 'event_id'],
      optional: ['phone', 'message'],
      endpoint: '/event-interests',
      steps: ['Event selection', 'Your information', 'Confirmation']
    };
  }

  // ============================================
  // EVENT RETRIEVAL METHODS
  // ============================================

  /**
   * Get all events with optional filtering
   * @param {Object} filters - { country, is_paid, is_featured, upcoming, past }
   */
  async getEvents(filters = {}) {
    try {
      const response = await this.api.get('/events', filters);
      return {
        success: true,
        data: response,
        count: response?.length || 0
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return {
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      };
    }
  }

  /**
   * Get upcoming events only
   */
  async getUpcomingEvents() {
    try {
      const response = await this.api.get('/events');
      const now = new Date();
      const upcoming = response.filter(event => 
        new Date(event.start_date) >= now && !event.is_hidden
      );
      
      return {
        success: true,
        data: upcoming,
        count: upcoming.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch upcoming events',
        error: error.message
      };
    }
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents() {
    try {
      const response = await this.api.get('/events');
      const featured = response.filter(event => 
        event.is_featured && !event.is_hidden
      );
      
      return {
        success: true,
        data: featured,
        count: featured.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch featured events',
        error: error.message
      };
    }
  }

  /**
   * Get single event by ID
   */
  async getEventById(eventId) {
    try {
      const response = await this.api.get(`/events/${eventId}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: `Event with ID ${eventId} not found`,
        error: error.message
      };
    }
  }

  /**
   * Get events by country
   */
  async getEventsByCountry(country) {
    try {
      const response = await this.api.get('/events');
      const countryEvents = response.filter(event => 
        event.country?.toLowerCase() === country.toLowerCase() && !event.is_hidden
      );
      
      return {
        success: true,
        data: countryEvents,
        count: countryEvents.length,
        country
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch events for ${country}`,
        error: error.message
      };
    }
  }

  /**
   * Search events by keyword
   */
  async searchEvents(keyword) {
    try {
      const response = await this.api.get('/events');
      const searchTerm = keyword.toLowerCase();
      
      const results = response.filter(event => {
        if (event.is_hidden) return false;
        
        return (
          event.title?.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm) ||
          event.one_liner?.toLowerCase().includes(searchTerm)
        );
      });
      
      return {
        success: true,
        data: results,
        count: results.length,
        keyword
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to search events',
        error: error.message
      };
    }
  }

  /**
   * Get free events only
   */
  async getFreeEvents() {
    try {
      const response = await this.api.get('/events');
      const freeEvents = response.filter(event => 
        !event.is_paid && !event.is_hidden
      );
      
      return {
        success: true,
        data: freeEvents,
        count: freeEvents.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch free events',
        error: error.message
      };
    }
  }

  /**
   * Get paid events only
   */
  async getPaidEvents() {
    try {
      const response = await this.api.get('/events');
      const paidEvents = response.filter(event => 
        event.is_paid && !event.is_hidden
      );
      
      return {
        success: true,
        data: paidEvents,
        count: paidEvents.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch paid events',
        error: error.message
      };
    }
  }

  // ============================================
  // EVENT REGISTRATION/INTEREST METHODS
  // ============================================

  /**
   * Submit event interest/registration
   */
  async submit(data) {
    const errors = this.validateBasic(data);
    if (errors.length > 0) {
      return { 
        success: false, 
        message: errors.join(', '), 
        errors 
      };
    }

    // Validate event exists
    if (!data.event_id) {
      return {
        success: false,
        message: 'Event ID is required'
      };
    }

    try {
      // Get event details to confirm it exists
      const eventCheck = await this.getEventById(data.event_id);
      if (!eventCheck.success) {
        return {
          success: false,
          message: 'Selected event does not exist'
        };
      }

      const payload = {
        event_id: data.event_id,
        name: (data.fullName || data.name).trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        message: data.message?.trim() || null
      };

      const response = await this.api.post('/event-interests', payload);

      return {
        success: true,
        message: this.getSuccessMessage(data, eventCheck.data),
        data: response
      };
    } catch (error) {
      console.error('Event registration error:', error);
      return {
        success: false,
        message: `Registration failed: ${error.message}`,
        error
      };
    }
  }

  /**
   * Get registrations for specific event (admin)
   */
  async getEventRegistrations(eventId) {
    try {
      const response = await this.api.get(`/event-interests/event/${eventId}`);
      return {
        success: true,
        data: response,
        count: response?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch event registrations',
        error: error.message
      };
    }
  }

  // ============================================
  // FORMATTING METHODS
  // ============================================

  /**
   * Format single event for display
   */
  formatEvent(event) {
    if (!event) return null;

    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;
    const now = new Date();
    
    const dateFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };

    let response = `**${event.title}**\n\n`;
    
    if (event.one_liner) {
      response += `${event.one_liner}\n\n`;
    }

    response += `**Date:** ${startDate.toLocaleDateString('en-US', dateFormatOptions)}`;
    if (endDate) {
      response += ` - ${endDate.toLocaleDateString('en-US', dateFormatOptions)}`;
    }
    response += '\n';

    if (event.location) {
      response += `**Location:** ${event.location}\n`;
    }

    if (event.country) {
      response += `**Country:** ${event.country}\n`;
    }

    if (event.is_paid) {
      response += `**Cost:** ${event.currency || '$'}${event.price || 'TBD'}\n`;
    } else {
      response += `**Cost:** Free\n`;
    }

    if (event.description) {
      response += `\n${event.description}\n`;
    }

    // Status indicator
    if (startDate < now) {
      response += `\n*This event has already occurred*`;
    } else if (event.is_featured) {
      response += `\n*Featured Event*`;
    }

    return response;
  }

  /**
   * Format multiple events list
   */
  formatEventsList(events, title = 'Events') {
    if (!events || events.length === 0) {
      return `No ${title.toLowerCase()} found at this time.`;
    }

    let response = `**${title}** (${events.length})\n\n`;

    events.forEach((event, index) => {
      const startDate = new Date(event.start_date);
      const dateStr = startDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });

      response += `${index + 1}. **${event.title}**\n`;
      response += `   ${dateStr}`;
      
      if (event.location) {
        response += ` • ${event.location}`;
      }
      
      if (event.is_paid) {
        response += ` • ${event.currency || '$'}${event.price}`;
      } else {
        response += ` • Free`;
      }
      
      if (event.one_liner) {
        response += `\n   ${event.one_liner}`;
      }
      
      response += '\n\n';
    });

    return response;
  }

  /**
   * Get success message after registration
   */
  getSuccessMessage(data, event) {
    const eventTitle = event?.title || 'the event';
    return `Registration confirmed! Thank you ${data.fullName || data.name} for your interest in ${eventTitle}. We'll send event details to ${data.email}.`;
  }

  // ============================================
  // VALIDATION METHODS
  // ============================================

  validateBasic(data) {
    const errors = [];

    if (!data.name && !data.fullName) {
      errors.push('Name is required');
    }

    if (!data.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.event_id) {
      errors.push('Event selection is required');
    }

    return errors;
  }

  getMissingFields(collectedData) {
    const missing = [];
    const config = EventAction.config;

    config.required.forEach(field => {
      if (!collectedData[field]) {
        missing.push(field);
      }
    });

    return missing;
  }

  isReadyToSubmit(collectedData) {
    return this.getMissingFields(collectedData).length === 0;
  }
}

module.exports = EventAction;