// EmailJS Helper Service
// This service helps manage EmailJS integration with country-specific configurations

import emailjs from '@emailjs/browser';
import { API_URL } from '../config';

const API_BASE = API_URL;

class EmailJSService {
  constructor() {
    this.configCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Get country-specific EmailJS configuration
  async getCountryConfig(country) {
    try {
      // Check cache first
      const cacheKey = country.toLowerCase();
      const cached = this.configCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.config;
      }

      // Fetch from API
      const response = await fetch(`${API_BASE}/country-contacts/${encodeURIComponent(country)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch config for ${country}: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(`No configuration found for ${country}`);
      }

      const contact = result.data;
      
      // Validate required EmailJS fields
      if (!contact.service_id || !contact.template_id || !contact.public_key) {
        throw new Error(`Incomplete EmailJS configuration for ${country}`);
      }

      const config = {
        serviceId: contact.service_id,
        templateId: contact.template_id,
        publicKey: contact.public_key,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        physicalAddress: contact.physical_address,
        mailingAddress: contact.mailing_address
      };

      // Cache the config
      this.configCache.set(cacheKey, {
        config,
        timestamp: Date.now()
      });

      return config;
    } catch (error) {
      console.error('Error fetching country config:', error);
      throw error;
    }
  }

  // Initialize EmailJS for a specific country
  async initializeForCountry(country) {
    try {
      const config = await this.getCountryConfig(country);
      
      // Initialize EmailJS with country-specific public key
      emailjs.init(config.publicKey);
      
      return config;
    } catch (error) {
      console.error(`Failed to initialize EmailJS for ${country}:`, error);
      throw error;
    }
  }

  // Send email using country-specific configuration
  async sendEmail(country, templateParams, formElement = null) {
    try {
      const config = await this.getCountryConfig(country);
      
      // Ensure EmailJS is initialized with correct public key
      emailjs.init(config.publicKey);

      // Merge template params with country-specific contact info
      const emailParams = {
        ...templateParams,
        to_email: config.contactEmail,
        contact_phone: config.contactPhone,
        physical_address: config.physicalAddress,
        mailing_address: config.mailingAddress,
        country: country
      };

      let result;
      
      if (formElement) {
        // Send using form element
        result = await emailjs.sendForm(
          config.serviceId,
          config.templateId,
          formElement,
          config.publicKey
        );
      } else {
        // Send using template params
        result = await emailjs.send(
          config.serviceId,
          config.templateId,
          emailParams,
          config.publicKey
        );
      }

      console.log(`Email sent successfully for ${country}:`, result);
      return {
        success: true,
        result,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error(`Failed to send email for ${country}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        message: 'Email sending failed'
      };
    }
  }

  // Validate country configuration
  async validateCountryConfig(country) {
    try {
      const config = await this.getCountryConfig(country);
      
      // Check if all required fields are present
      const requiredFields = ['serviceId', 'templateId', 'publicKey'];
      const missingFields = requiredFields.filter(field => !config[field]);
      
      if (missingFields.length > 0) {
        return {
          valid: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          config
        };
      }

      return {
        valid: true,
        message: 'Configuration is valid',
        config
      };

    } catch (error) {
      return {
        valid: false,
        message: error.message,
        config: null
      };
    }
  }

  // Get all configured countries
  async getConfiguredCountries() {
    try {
      const response = await fetch(`${API_BASE}/country-contacts`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status}`);
      }

      const contacts = await response.json();
      
      // Filter countries with complete EmailJS configuration
      const configuredCountries = contacts
        .filter(contact => 
          contact.service_id && 
          contact.template_id && 
          contact.public_key
        )
        .map(contact => ({
          country: contact.country,
          email: contact.email,
          phone: contact.phone,
          hasCompleteConfig: true
        }));

      return configuredCountries;

    } catch (error) {
      console.error('Error fetching configured countries:', error);
      throw error;
    }
  }

  // Clear cache for a specific country or all countries
  clearCache(country = null) {
    if (country) {
      this.configCache.delete(country.toLowerCase());
    } else {
      this.configCache.clear();
    }
  }

  // Test EmailJS configuration for a country
  async testConfiguration(country, testEmail = null) {
    try {
      const config = await this.getCountryConfig(country);
      
      // Test with a simple template
      const testParams = {
        to_email: testEmail || config.contactEmail,
        subject: `EmailJS Configuration Test - ${country}`,
        message: `This is a test email to verify EmailJS configuration for ${country}.`,
        test_mode: true,
        timestamp: new Date().toISOString()
      };

      const result = await this.sendEmail(country, testParams);
      
      return {
        success: result.success,
        message: result.success 
          ? `Test email sent successfully for ${country}` 
          : `Test failed for ${country}: ${result.error}`,
        config
      };

    } catch (error) {
      return {
        success: false,
        message: `Test failed for ${country}: ${error.message}`,
        config: null
      };
    }
  }
}

// Create and export singleton instance
const emailJSService = new EmailJSService();

export default emailJSService;

// Also export the class for advanced usage
export { EmailJSService };

// Helper functions for common use cases
export const sendContactForm = async (country, formData) => {
  return await emailJSService.sendEmail(country, {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject || 'Contact Form Submission',
    message: formData.message,
    phone: formData.phone || '',
    company: formData.company || ''
  });
};

export const sendApplicationForm = async (country, applicationData) => {
  return await emailJSService.sendEmail(country, {
    applicant_name: applicationData.name,
    applicant_email: applicationData.email,
    application_type: applicationData.type,
    message: applicationData.message || applicationData.coverLetter,
    phone: applicationData.phone || '',
    experience: applicationData.experience || '',
    education: applicationData.education || ''
  });
};

export const validateEmailJSForCountry = async (country) => {
  return await emailJSService.validateCountryConfig(country);
};