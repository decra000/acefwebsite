// services/actions/CountryContactAction.js
const BaseAction = require('./BaseAction');

class CountryContactAction extends BaseAction {
  static get config() {
    return {
      required: [],
      optional: [],
      endpoint: null,
      steps: []
    };
  }

  // Get all country contacts
  async getAllCountryContacts() {
    return this.api.get('/country-contacts');
  }

  // Get contact information for a specific country
  async getCountryContact(country) {
    return this.api.get(`/country-contacts/${encodeURIComponent(country)}`);
  }

  // Get all countries list
  async getCountries() {
    return this.api.get('/countries');
  }

  // Get nearby contacts based on coordinates
  async getNearbyContacts(latitude, longitude, radiusKm = 100) {
    return this.api.get(`/country-contacts/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radiusKm}`);
  }

  // Get SMTP configuration status for all countries
  async getSMTPStatus() {
    return this.api.get('/country-contacts/status/smtp');
  }

  // Get country contact statistics
  async getStats() {
    return this.api.get('/country-contacts/stats/overview');
  }

  // Validate SMTP configuration for a specific country
  async validateSMTP(country) {
    return this.api.get(`/country-contacts/${encodeURIComponent(country)}/validate-smtp`);
  }

  // Test SMTP connection for a specific country
  async testSMTP(country) {
    return this.api.post(`/country-contacts/${encodeURIComponent(country)}/test-smtp`);
  }

  // Send email using country-specific SMTP configuration
  async sendEmail(country, emailOptions) {
    try {
      const response = await this.api.post('/country-contacts/send-email', {
        country,
        emailOptions
      });
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Get contact info formatted for display
  async getFormattedContact(country) {
    try {
      const response = await this.getCountryContact(country);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          message: `No contact information found for ${country}`
        };
      }

      const contact = response.data;
      return {
        success: true,
        data: {
          country: contact.country,
          email: contact.email,
          phone: contact.phone,
          physical_address: contact.physical_address,
          mailing_address: contact.mailing_address,
          city: contact.city,
          state_province: contact.state_province,
          postal_code: contact.postal_code,
          has_coordinates: !!(contact.latitude && contact.longitude),
          is_active: contact.is_active
        }
      };
    } catch (error) {
      console.error('Error fetching formatted contact:', error);
      return {
        success: false,
        message: 'Failed to retrieve contact information.'
      };
    }
  }

  // Format contact information for chatbot response
  getFormattedResponse(contact) {
    if (!contact) {
      return 'Contact information is currently unavailable.';
    }

    let response = `📍 **Contact Information for ${contact.country}**\n\n`;
    
    if (contact.email) {
      response += `📧 **Email:** ${contact.email}\n`;
    }
    
    if (contact.phone) {
      response += `📞 **Phone:** ${contact.phone}\n`;
    }
    
    if (contact.physical_address) {
      response += `🏢 **Physical Address:**\n${contact.physical_address}\n`;
      if (contact.city) response += `${contact.city}`;
      if (contact.state_province) response += `, ${contact.state_province}`;
      if (contact.postal_code) response += ` ${contact.postal_code}`;
      response += '\n';
    }
    
    if (contact.mailing_address && contact.mailing_address !== contact.physical_address) {
      response += `📮 **Mailing Address:**\n${contact.mailing_address}\n`;
    }
    
    response += '\n---\n';
    response += '💡 Feel free to reach out to us through any of these channels.';
    
    return response;
  }

  // Get list of countries with active contact information
  async getActiveCountries() {
    try {
      const response = await this.getAllCountryContacts();
      if (!response || !Array.isArray(response)) {
        return { success: false, data: [] };
      }

      const activeCountries = response
        .filter(contact => contact.is_active)
        .map(contact => ({
          country: contact.country,
          email: contact.email,
          phone: contact.phone,
          has_full_config: !!(contact.smtp_host && contact.smtp_user)
        }));

      return {
        success: true,
        data: activeCountries
      };
    } catch (error) {
      console.error('Error fetching active countries:', error);
      return { success: false, data: [] };
    }
  }

  // Search for a country contact by partial name
  async searchCountry(searchTerm) {
    try {
      const response = await this.getAllCountryContacts();
      if (!response || !Array.isArray(response)) {
        return { success: false, data: [] };
      }

      const searchLower = searchTerm.toLowerCase().trim();
      const matches = response.filter(contact => 
        contact.country.toLowerCase().includes(searchLower)
      );

      if (matches.length === 0) {
        return {
          success: false,
          message: `No countries found matching "${searchTerm}"`
        };
      }

      return {
        success: true,
        data: matches.map(contact => ({
          country: contact.country,
          email: contact.email,
          phone: contact.phone
        }))
      };
    } catch (error) {
      console.error('Error searching countries:', error);
      return { success: false, data: [] };
    }
  }

  // Get email account information
  async getEmailAccounts() {
    return this.api.get('/email-accounts');
  }
  // Add this method to services/actions/CountryContactAction.js

// Get simple list of all countries (from countries table)
async getCountries() {
  return this.api.get('/countries');
}

  // Get specific email account
  async getEmailAccount(accountKey) {
    return this.api.get(`/email-accounts/${accountKey}`);
  }

  // Validate email account configuration
  async validateEmailAccount(accountKey) {
    return this.api.get(`/email-accounts/validate/${accountKey}`);
  }

  // Test email account SMTP connection
  async testEmailAccount(accountKey) {
    return this.api.post(`/email-accounts/${accountKey}/test`);
  }

  // Get email accounts with usage statistics
  async getEmailAccountStats() {
    return this.api.get('/email-accounts/stats');
  }

  // Submit method (not used for country contacts - read-only)
  async submit(data) {
    return {
      success: false,
      message: 'Country contact data is read-only through this interface. Use the admin panel for modifications.'
    };
  }

  getSuccessMessage(data) {
    return 'Country contact information retrieved successfully.';
  }
}

module.exports = CountryContactAction;