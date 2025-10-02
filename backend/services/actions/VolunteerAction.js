// services/actions/VolunteerAction.js
const BaseAction = require('./BaseAction');

class VolunteerAction extends BaseAction {
  static get config() {
    return {
      required: ['country'],
      optional: ['fullName', 'email', 'phone', 'skills', 'availability', 'message'],
      endpoint: null, // No direct submission - redirects to Google Forms
      steps: ['Select country', 'Get form link']
    };
  }

  // Get all volunteer forms
  async getAllForms() {
    return this.api.get('/volunteer-forms');
  }

  // Get form by country name
  async getFormByCountry(countryName) {
    return this.api.get(`/volunteer-forms/country/${countryName}`);
  }

  // Get countries that have volunteer forms available
  async getCountries() {
    try {
      const response = await this.api.get('/volunteer-forms');
      if (response.success && response.data) {
        // Extract unique countries from forms
        return {
          success: true,
          data: response.data
            .filter(form => form.is_active)
            .map(form => ({
              name: form.country_name,
              form_title: form.form_title,
              description: form.description
            }))
        };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error fetching volunteer countries:', error);
      return { success: false, data: [] };
    }
  }

  // Get countries without forms (for admin purposes)
  async getAvailableCountries() {
    return this.api.get('/volunteer-forms/countries/available');
  }

  // Get volunteer form statistics
  async getStats() {
    return this.api.get('/volunteer-forms/stats');
  }

  // Submit method redirects to appropriate Google Form
  async submit(data) {
    const errors = this.validateBasic(data);
    if (errors.length > 0) {
      return { 
        success: false, 
        message: errors.join(', '), 
        errors 
      };
    }

    try {
      // Get the volunteer form for the specified country
      const formResponse = await this.getFormByCountry(data.country);
      
      if (!formResponse.success || !formResponse.data) {
        return {
          success: false,
          message: `No volunteer form available for ${data.country}. Please contact us directly at volunteer@acef-ngo.org`
        };
      }

      const form = formResponse.data;

      return {
        success: true,
        message: this.getSuccessMessage(data, form),
        data: {
          form_url: form.form_url,
          form_title: form.form_title,
          country: form.country_name
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve volunteer form: ${error.message}`,
        error
      };
    }
  }

  getSuccessMessage(data, form) {
    return `🌍 **Volunteer with ACEF in ${data.country}!**

Thank you for your interest in volunteering with us!

📋 **Next Step:**
Please complete our volunteer application form:
**${form.form_title}**

🔗 **Form Link:** ${form.form_url}

${form.description ? `\n📝 **About:** ${form.description}\n` : ''}
⏱️ **Time:** Takes approximately 5-10 minutes to complete

💡 **What to Expect:**
- Our team reviews applications within 5-7 business days
- You'll receive an email confirmation after submission
- Qualified candidates will be contacted for next steps

📧 **Questions?** Contact volunteer@acef-ngo.org`;
  }

  // Helper method to check if a country has a volunteer form
  async hasFormForCountry(countryName) {
    try {
      const response = await this.getFormByCountry(countryName);
      return response.success && response.data;
    } catch (error) {
      return false;
    }
  }

  // Get all active volunteer opportunities
  async getActiveOpportunities() {
    try {
      const response = await this.getAllForms();
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
            .filter(form => form.is_active)
            .map(form => ({
              country: form.country_name,
              title: form.form_title,
              description: form.description,
              form_url: form.form_url
            }))
        };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error);
      return { success: false, data: [] };
    }
  }
}

module.exports = VolunteerAction;