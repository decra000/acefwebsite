// Updated SMTPService.js - Database-Driven Configuration
// This version properly integrates with your database-stored SMTP configurations

import { API_URL } from '../config';

const API_BASE = API_URL;

class SMTPService {
  constructor() {
    this.configCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Get country-specific SMTP configuration from database
  async getCountrySmtpConfig(country) {
    try {
      // Check cache first
      const cacheKey = country.toLowerCase();
      const cached = this.configCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.config;
      }

      console.log(`🔍 Fetching SMTP config for ${country}`);

      // Fetch from API - Updated to match your route structure
      const response = await fetch(`${API_BASE}/country-contacts/${encodeURIComponent(country)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No contact configuration found for ${country}`);
        }
        throw new Error(`Failed to fetch SMTP config for ${country}: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(`Invalid response for ${country}: ${result.message || 'No data'}`);
      }

      const contact = result.data;
      
      // Validate required SMTP fields
      if (!contact.smtp_host || !contact.smtp_port || !contact.smtp_user || !contact.smtp_pass) {
        const missing = [];
        if (!contact.smtp_host) missing.push('smtp_host');
        if (!contact.smtp_port) missing.push('smtp_port');
        if (!contact.smtp_user) missing.push('smtp_user');
        if (!contact.smtp_pass) missing.push('smtp_pass');
        
        throw new Error(`Incomplete SMTP configuration for ${country}. Missing: ${missing.join(', ')}`);
      }

      // Check if configuration is active
      if (!contact.is_active) {
        throw new Error(`SMTP configuration for ${country} is disabled`);
      }

      const config = {
        // SMTP Configuration
        host: contact.smtp_host,
        port: parseInt(contact.smtp_port),
        secure: contact.smtp_secure || contact.smtp_port == 465,
        user: contact.smtp_user,
        pass: contact.smtp_pass,
        fromName: contact.smtp_from_name || `ACEF ${country}`,
        fromEmail: contact.smtp_user,
        
        // Contact Information
        contactEmail: contact.email || contact.smtp_user,
        contactPhone: contact.phone,
        physicalAddress: contact.physical_address,
        mailingAddress: contact.mailing_address,
        city: contact.city,
        stateProvince: contact.state_province,
        postalCode: contact.postal_code,
        latitude: contact.latitude,
        longitude: contact.longitude,
        
        // Metadata
        country: country,
        isActive: contact.is_active,
        lastUpdated: contact.updated_at || contact.created_at
      };

      console.log(`✅ SMTP config loaded for ${country}:`, {
        host: config.host,
        port: config.port,
        user: config.user,
        fromName: config.fromName
      });

      // Cache the config
      this.configCache.set(cacheKey, {
        config,
        timestamp: Date.now()
      });

      return config;

    } catch (error) {
      console.error(`❌ Error fetching SMTP config for ${country}:`, error.message);
      throw error;
    }
  }

  // Send email using country-specific SMTP configuration
  async sendEmail(country, emailOptions) {
    try {
      console.log(`📧 Attempting to send email for ${country}:`, {
        to: emailOptions.to,
        subject: emailOptions.subject,
        hasHtml: !!emailOptions.html,
        hasText: !!emailOptions.text
      });

      const config = await this.getCountrySmtpConfig(country);
      
      // Prepare email data for backend - Updated to match your route expectations
      const emailData = {
        smtpConfig: {
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: config.user,
            pass: config.pass
          }
        },
        emailOptions: {
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: emailOptions.to,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text,
          attachments: emailOptions.attachments || []
        }
      };

      // Send email via backend API - Updated to match your route
      const response = await fetch(`${API_BASE}/country-contacts/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error(`Invalid server response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMessage = result?.message || result?.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (!result.success) {
        throw new Error(result.message || result.error || 'Email sending failed');
      }

      console.log(`✅ Email sent successfully for ${country}:`, {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected
      });

      return {
        success: true,
        result,
        message: 'Email sent successfully',
        messageId: result.messageId
      };

    } catch (error) {
      console.error(`❌ Failed to send email for ${country}:`, error);
      
      // Provide more user-friendly error messages
      let userMessage = error.message;
      
      if (error.message.includes('authentication') || error.message.includes('EAUTH')) {
        userMessage = `Email authentication failed for ${country}. Please check SMTP credentials.`;
      } else if (error.message.includes('connection') || error.message.includes('ECONNECTION')) {
        userMessage = `Cannot connect to email server for ${country}. Please check SMTP settings.`;
      } else if (error.message.includes('configuration')) {
        userMessage = `Email configuration incomplete for ${country}.`;
      }
      
      return {
        success: false,
        error: error.message,
        message: userMessage,
        country
      };
    }
  }

  // Send contact form email with improved template
  async sendContactForm(country, formData) {
    try {
      // Validate required form data
      const requiredFields = ['firstName', 'lastName', 'user_email', 'user_message'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Get contact email from configuration
      const config = await this.getCountrySmtpConfig(country);
      const recipientEmail = formData.recipientEmail || config.contactEmail || config.fromEmail;

      const emailOptions = {
        to: recipientEmail,
        subject: `[ACEF ${country}] Contact Form: ${formData.firstName} ${formData.lastName}`,
        html: this.generateContactFormHTML(formData, country, config),
        text: this.generateContactFormText(formData, country)
      };

      return await this.sendEmail(country, emailOptions);

    } catch (error) {
      console.error(`❌ Contact form sending failed for ${country}:`, error);
      return {
        success: false,
        error: error.message,
        message: `Failed to send contact form for ${country}: ${error.message}`
      };
    }
  }

  // Generate improved HTML template for contact form
  generateContactFormHTML(formData, country, config) {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission - ACEF ${country}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 1.8rem;">📧 New Contact Form Submission</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 1.1rem;">ACEF ${country} Region</p>
        </div>
        
        <!-- Contact Details -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #1565c0; margin-top: 0; margin-bottom: 20px; font-size: 1.3rem;">👤 Contact Information</h2>
          <div style="display: grid; gap: 15px;">
            <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #1976d2; border-radius: 4px;">
              <strong style="color: #1565c0;">Name:</strong> ${formData.firstName} ${formData.lastName}
            </div>
            <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #1976d2; border-radius: 4px;">
              <strong style="color: #1565c0;">Email:</strong> 
              <a href="mailto:${formData.user_email}" style="color: #1976d2; text-decoration: none;">${formData.user_email}</a>
            </div>
            ${formData.phone ? `
            <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #1976d2; border-radius: 4px;">
              <strong style="color: #1565c0;">Phone:</strong> 
              <a href="tel:${formData.phone}" style="color: #1976d2; text-decoration: none;">${formData.phone}</a>
            </div>
            ` : ''}
            ${formData.company_name ? `
            <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #1976d2; border-radius: 4px;">
              <strong style="color: #1565c0;">Company/Organization:</strong> ${formData.company_name}
            </div>
            ` : ''}
            <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #1976d2; border-radius: 4px;">
              <strong style="color: #1565c0;">Country/Region:</strong> ${country}
            </div>
          </div>
        </div>
        
        <!-- Message -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h3 style="color: #1565c0; margin-top: 0; margin-bottom: 15px; font-size: 1.2rem;">💬 Message</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
            <p style="margin: 0; line-height: 1.8; white-space: pre-wrap;">${formData.user_message}</p>
          </div>
        </div>
        
        <!-- Metadata -->
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border: 1px solid #bbdefb;">
          <h4 style="color: #0d47a1; margin: 0 0 10px 0;">📋 Submission Details</h4>
          <div style="font-size: 0.9rem; color: #1565c0;">
            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${timestamp}</p>
            <p style="margin: 5px 0;"><strong>Source:</strong> ACEF Website Contact Form</p>
            <p style="margin: 5px 0;"><strong>Contact Email:</strong> ${config.contactEmail}</p>
            ${config.contactPhone ? `<p style="margin: 5px 0;"><strong>Contact Phone:</strong> ${config.contactPhone}</p>` : ''}
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; color: #666; font-size: 0.9rem;">
          <p style="margin: 0;">African Climate and Environment Foundation (ACEF)</p>
          <p style="margin: 5px 0 0 0;">Building climate resilience across Africa</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate plain text template for contact form
  generateContactFormText(formData, country) {
    const timestamp = new Date().toLocaleString();
    
    return `
New Contact Form Submission - ACEF ${country}

CONTACT INFORMATION:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.user_email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
${formData.company_name ? `Company: ${formData.company_name}` : ''}
Country/Region: ${country}

MESSAGE:
${formData.user_message}

SUBMISSION DETAILS:
Submitted: ${timestamp}
Source: ACEF Website Contact Form

---
African Climate and Environment Foundation (ACEF)
Building climate resilience across Africa
    `;
  }

  // Validate country SMTP configuration
  async validateCountryConfig(country) {
    try {
      console.log(`🔍 Validating SMTP config for ${country}`);
      
      const config = await this.getCountrySmtpConfig(country);
      
      // Check if all required fields are present and valid
      const validations = {
        host: !!config.host,
        port: !!config.port && config.port > 0 && config.port <= 65535,
        user: !!config.user && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.user),
        pass: !!config.pass,
        active: config.isActive
      };
      
      const missingFields = Object.entries(validations)
        .filter(([key, valid]) => !valid)
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        return {
          valid: false,
          message: `Invalid fields: ${missingFields.join(', ')}`,
          config,
          validations
        };
      }

      console.log(`✅ SMTP config valid for ${country}`);
      
      return {
        valid: true,
        message: 'SMTP configuration is valid and active',
        config,
        validations
      };

    } catch (error) {
      console.error(`❌ SMTP validation failed for ${country}:`, error.message);
      
      return {
        valid: false,
        message: error.message,
        config: null,
        validations: null
      };
    }
  }

  // Get all configured countries
  async getConfiguredCountries() {
    try {
      console.log('🔍 Fetching all configured countries...');
      
      const response = await fetch(`${API_BASE}/country-contacts`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
      }

      const contacts = await response.json();
      
      if (!Array.isArray(contacts)) {
        throw new Error('Invalid response format: expected array');
      }

      // Filter and validate countries with SMTP configuration
      const configuredCountries = contacts
        .filter(contact => {
          const hasBasicSmtp = contact.smtp_host && 
                             contact.smtp_port && 
                             contact.smtp_user && 
                             contact.smtp_pass;
          
          const isActive = contact.is_active !== false;
          
          return hasBasicSmtp && isActive;
        })
        .map(contact => ({
          country: contact.country,
          email: contact.email,
          phone: contact.phone,
          city: contact.city,
          hasCompleteConfig: true,
          smtpUser: contact.smtp_user,
          smtpHost: contact.smtp_host,
          isActive: contact.is_active,
          lastUpdated: contact.updated_at || contact.created_at
        }))
        .sort((a, b) => a.country.localeCompare(b.country));

      console.log(`✅ Found ${configuredCountries.length} configured countries`);
      
      return configuredCountries;

    } catch (error) {
      console.error('❌ Error fetching configured countries:', error);
      throw new Error(`Failed to load configured countries: ${error.message}`);
    }
  }

  // Clear cache for a specific country or all countries
  clearCache(country = null) {
    if (country) {
      const cacheKey = country.toLowerCase();
      this.configCache.delete(cacheKey);
      console.log(`🧹 Cache cleared for ${country}`);
    } else {
      this.configCache.clear();
      console.log('🧹 All cache cleared');
    }
  }

  // Test SMTP configuration for a country
  async testConfiguration(country, testEmail = null) {
    try {
      console.log(`🧪 Testing SMTP configuration for ${country}`);
      
      // First validate the configuration
      const validation = await this.validateCountryConfig(country);
      if (!validation.valid) {
        throw new Error(`Configuration invalid: ${validation.message}`);
      }

      // Use the test endpoint from your route
      const response = await fetch(`${API_BASE}/country-contacts/${encodeURIComponent(country)}/test-smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testEmail: testEmail || validation.config.contactEmail
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      console.log(`✅ SMTP test successful for ${country}`);
      
      return {
        success: true,
        message: `SMTP connection test successful for ${country}`,
        config: validation.config,
        testResult: result
      };

    } catch (error) {
      console.error(`❌ SMTP test failed for ${country}:`, error.message);
      
      return {
        success: false,
        message: `SMTP test failed for ${country}: ${error.message}`,
        config: null,
        error: error.message
      };
    }
  }

  // Get connection status for multiple countries
  async getConnectionStatusBulk(countries) {
    const results = {};
    
    for (const country of countries) {
      try {
        const validation = await this.validateCountryConfig(country);
        results[country] = {
          configured: validation.valid,
          message: validation.message,
          lastChecked: new Date().toISOString()
        };
      } catch (error) {
        results[country] = {
          configured: false,
          message: error.message,
          lastChecked: new Date().toISOString()
        };
      }
    }
    
    return results;
  }
}

// Create and export singleton instance
const smtpService = new SMTPService();

export default smtpService;

// Export the class for advanced usage
export { SMTPService };

// Helper functions for common use cases
export const sendContactForm = async (country, formData) => {
  return await smtpService.sendContactForm(country, formData);
};

export const validateSmtpForCountry = async (country) => {
  return await smtpService.validateCountryConfig(country);
};

export const testSmtpForCountry = async (country, testEmail) => {
  return await smtpService.testConfiguration(country, testEmail);
};

export const getConfiguredCountries = async () => {
  return await smtpService.getConfiguredCountries();
};