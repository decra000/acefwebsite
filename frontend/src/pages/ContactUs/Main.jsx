import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme';
import smtpService from '../../services/SMTPService'; // Updated import
import '../../styles/contact-styles.css'; // Import shared styles

const Main = ({ isEmbedded = false, selectedCountry = 'Cameroon' }) => {
  const { theme, colors } = useTheme();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    user_email: '',
    phone: '',
    company_name: '',
    user_message: ''
  });

  const [contactInfo, setContactInfo] = useState(null);
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(selectedCountry);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);

  // Dynamic styles that depend on theme
  const dynamicStyles = {
    wrapper: {
      background: isEmbedded ? 'transparent' : colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      boxShadow: `0 10px 40px ${colors.cardShadow}`,
      border: `1px solid ${colors.border}`,
    },
    infoSection: {
      borderRightColor: colors.border,
      borderBottomColor: colors.border,
    },
    headerIcon: {
      backgroundColor: `${colors.primary}15`,
    },
    headerTitle: {
      color: colors.text,
    },
    headerDescription: {
      color: colors.textSecondary,
    },
    label: {
      color: colors.text,
    },
    input: {
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
      color: colors.text,
      boxShadow: `0 2px 4px ${colors.cardShadow}`,
    },
    inputFocus: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
      boxShadow: `0 0 0 3px ${colors.primary}15`,
    },
    contactInfoDisplay: {
      backgroundColor: colors.backgroundSecondary,
      border: `1px solid ${colors.border}`,
    },
    contactInfoTitle: {
      color: colors.text,
    },
    contactInfoIcon: {
      backgroundColor: `${colors.primary}15`,
    },
    contactInfoLink: {
      color: colors.primary,
    },
    warningDisplay: {
      backgroundColor: colors.warning + '15',
      border: `1px solid ${colors.warning}30`,
    },
    warningText: {
      color: colors.warning,
    },
    sectionTitle: {
      color: colors.text,
    },
    sectionDescription: {
      color: colors.textSecondary,
    },
    button: {
      backgroundColor: colors.primary,
      color: colors.white,
      boxShadow: `0 4px 12px ${colors.primary}30`,
    },
    buttonDisabled: {
      backgroundColor: colors.gray400,
      color: colors.white,
    },
    buttonHover: {
      boxShadow: `0 6px 20px ${colors.primary}40`,
    },
    disabledNotice: {
      color: colors.warning,
      backgroundColor: colors.warning + '15',
      border: `1px solid ${colors.warning}30`,
    },
    selectArrow: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.text)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    headquartersNotice: {
      backgroundColor: `${colors.primary}10`,
      border: `1px solid ${colors.primary}30`,
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      color: colors.text,
      fontSize: '0.9rem',
      lineHeight: '1.5',
    },
    headquartersText: {
      color: colors.text,
      fontWeight: '500',
    },
    headquartersSubtext: {
      color: colors.textSecondary,
      fontSize: '0.85rem',
      marginTop: '4px',
    },
  };

  // Load countries and contact info on mount
  useEffect(() => {
    loadAvailableCountries();
    loadContactInfo(currentCountry);
  }, []);

  // Update contact info when country changes
  useEffect(() => {
    if (currentCountry) {
      loadContactInfo(currentCountry);
    }
  }, [currentCountry]);

  const loadAvailableCountries = async () => {
    try {
      const configuredCountries = await smtpService.getConfiguredCountries();
      setCountries(configuredCountries);
      
      // If selected country isn't in configured list, select first available
      if (configuredCountries.length > 0) {
        const countryNames = configuredCountries.map(c => c.country);
        if (!countryNames.includes(selectedCountry)) {
          setCurrentCountry(configuredCountries[0].country);
        }
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to load available regions. Please refresh the page.'
      });
    }
  };

  const loadContactInfo = async (country) => {
    if (!country) return;
    
    try {
      const validation = await smtpService.validateCountryConfig(country);
      setConfigStatus(validation);
      
      if (validation.valid && validation.config) {
        setContactInfo(validation.config);
        // Clear any previous warnings if config is now valid
        if (submitStatus?.type === 'warning') {
          setSubmitStatus(null);
        }
      } else {
        setContactInfo(null);
        setSubmitStatus({
          type: 'warning',
          message: `Contact form may not work for ${country}. SMTP configuration incomplete: ${validation.message}`
        });
      }
    } catch (error) {
      console.error('Failed to load contact info:', error);
      setContactInfo(null);
      setConfigStatus({ valid: false, message: 'Failed to load configuration' });
      setSubmitStatus({
        type: 'error',
        message: `Failed to load contact information for ${country}. Please try another region.`
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear non-warning status messages when user types
    if (submitStatus && submitStatus.type !== 'warning') {
      setSubmitStatus(null);
    }
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setCurrentCountry(newCountry);
    setSubmitStatus(null);
  };

  const validateForm = () => {
    const errors = [];
    
    // Required fields
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.user_email.trim()) errors.push('Email is required');
    if (!formData.user_message.trim()) errors.push('Message is required');
    
    // Email validation
    if (formData.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim() && !/^[\+]?[0-9\s\-\(\)]{7,}$/.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    // Message length validation
    if (formData.user_message && formData.user_message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitStatus({
        type: 'error',
        message: validationErrors.join(', ')
      });
      return;
    }

    // SMTP configuration validation
    if (!configStatus?.valid) {
      setSubmitStatus({
        type: 'error',
        message: `Cannot send email: SMTP not configured for ${currentCountry}`
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare form data for SMTP service
      const contactFormData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        user_email: formData.user_email.trim(),
        phone: formData.phone?.trim() || '',
        company_name: formData.company_name?.trim() || '',
        user_message: formData.user_message.trim(),
        recipientEmail: contactInfo?.contactEmail, // Use the contact email for this country
        timestamp: new Date().toISOString(),
        country: currentCountry
      };

      const result = await smtpService.sendContactForm(currentCountry, contactFormData);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. We will get back to you soon.'
        });
        
        // Clear form on success
        setFormData({
          firstName: '',
          lastName: '',
          user_email: '',
          phone: '',
          company_name: '',
          user_message: ''
        });
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      // Provide more specific error messages based on error type
      if (error.message.includes('SMTP')) {
        errorMessage = `Email service error for ${currentCountry}. Please try contacting us directly via phone or email.`;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('configuration')) {
        errorMessage = `Email configuration issue for ${currentCountry}. Please contact us directly or try another region.`;
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (type) => {
    const baseStyle = 'status-message';
    switch (type) {
      case 'success':
        return {
          className: baseStyle,
          style: {
            backgroundColor: colors.success + '15',
            color: colors.success,
            border: `1px solid ${colors.success}30`
          }
        };
      case 'error':
        return {
          className: baseStyle,
          style: {
            backgroundColor: colors.error + '15',
            color: colors.error,
            border: `1px solid ${colors.error}30`
          }
        };
      case 'warning':
        return {
          className: baseStyle,
          style: {
            backgroundColor: colors.warning + '15',
            color: colors.warning,
            border: `1px solid ${colors.warning}30`
          }
        };
      default:
        return { className: baseStyle, style: {} };
    }
  };

  const handleInputFocus = (e) => {
    Object.assign(e.target.style, dynamicStyles.inputFocus);
  };

  const handleInputBlur = (e) => {
    Object.assign(e.target.style, {
      borderColor: colors.border,
      backgroundColor: colors.surface,
      boxShadow: `0 2px 4px ${colors.cardShadow}`
    });
  };

  const handleButtonHover = (e, isHover) => {
    if (!isSubmitting && configStatus?.valid) {
      if (isHover) {
        e.target.style.transform = 'translateY(-2px)';
        Object.assign(e.target.style, dynamicStyles.buttonHover);
      } else {
        e.target.style.transform = 'translateY(0)';
        Object.assign(e.target.style, dynamicStyles.button);
      }
    }
  };

  // Show loading state while countries are being fetched
  if (countries.length === 0 && !submitStatus) {
    return (
      <div 
        className={`contact-container contact-main-wrapper ${isEmbedded ? 'embedded' : ''}`}
        style={dynamicStyles.wrapper}
      >
        <div className="contact-card" style={dynamicStyles.card}>
          <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
            <p>Loading contact regions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`contact-container contact-main-wrapper ${isEmbedded ? 'embedded' : ''}`}
      style={dynamicStyles.wrapper}
    >
      <div className="contact-card" style={dynamicStyles.card}>
        {/* Contact Information Side */}
        <div className="contact-info-section" style={dynamicStyles.infoSection}>
          {/* Header Section */}
          <div className="contact-header">
            <div className="contact-header-icon" style={dynamicStyles.headerIcon}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            
            <h2 className="contact-header-title" style={dynamicStyles.headerTitle}>
              Get in Touch
            </h2>
            
            <p className="contact-header-description" style={dynamicStyles.headerDescription}>
              We're here to help you make a difference in environmental conservation across Africa
            </p>
          </div>

          {/* Headquarters Notice - Only shown when Cameroon is selected */}
          {currentCountry === 'Cameroon' && (
            <div style={dynamicStyles.headquartersNotice}>
              <div style={dynamicStyles.headquartersText}>
                📍 You are contacting our main office - Cameroon Headquarters
              </div>
              <div style={dynamicStyles.headquartersSubtext}>
                Would you like to contact a specific regional office? Select from the dropdown below.
              </div>
            </div>
          )}

          {/* Country Selection */}
          <div className="country-select-container">
            <label className="country-select-label" style={dynamicStyles.label}>
              Select the ACEF Region you'd like to contact
            </label>
            <select
              className="form-select"
              value={currentCountry}
              onChange={handleCountryChange}
              style={{
                ...dynamicStyles.input,
                backgroundImage: dynamicStyles.selectArrow,
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              {countries.map(country => (
                <option key={country.country} value={country.country}>
                  {country.country}
                  {country.hasCompleteConfig ? ' ✓' : ' ⚠'}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Info Display */}
          {contactInfo ? (
            <div className="contact-info-display" style={dynamicStyles.contactInfoDisplay}>
              <h3 className="contact-info-title" style={dynamicStyles.contactInfoTitle}>
                {currentCountry} Regional Contact
              </h3>
              
              {contactInfo.contactEmail && (
                <div className="contact-info-item">
                  <div className="contact-info-icon" style={dynamicStyles.contactInfoIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.primary} aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6" fill="none" stroke={colors.surface} strokeWidth="2"/>
                    </svg>
                  </div>
                  <a 
                    href={`mailto:${contactInfo.contactEmail}`} 
                    className="contact-info-link"
                    style={dynamicStyles.contactInfoLink}
                  >
                    {contactInfo.contactEmail}
                  </a>
                </div>
              )}
              
              {contactInfo.contactPhone && (
                <div className="contact-info-item">
                  <div className="contact-info-icon" style={dynamicStyles.contactInfoIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <a 
                    href={`tel:${contactInfo.contactPhone}`} 
                    className="contact-info-link"
                    style={dynamicStyles.contactInfoLink}
                  >
                    {contactInfo.contactPhone}
                  </a>
                </div>
              )}

              {contactInfo.physicalAddress && (
                <div className="contact-info-item">
                  <div className="contact-info-icon" style={dynamicStyles.contactInfoIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <span style={{ color: colors.text, fontSize: '0.9rem' }}>
                    {contactInfo.physicalAddress}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="warning-display" style={dynamicStyles.warningDisplay}>
              <div className="warning-icon">⚠️</div>
              <p className="warning-text" style={dynamicStyles.warningText}>
                Contact information not available for {currentCountry}. Please try selecting a different region.
              </p>
            </div>
          )}
        </div>

        {/* Contact Form Side */}
        <div className="contact-form-section">
          <h3 className="form-section-title" style={dynamicStyles.sectionTitle}>
            Send us a Message
          </h3>
          
          <p className="form-section-description" style={dynamicStyles.sectionDescription}>
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          {submitStatus && (
            <div 
              className={getStatusStyle(submitStatus.type).className}
              style={getStatusStyle(submitStatus.type).style}
            >
              {submitStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="form-group">
            <div className="form-grid">
              <div>
                <label className="form-label" style={dynamicStyles.label}>
                  First Name *
                </label>
                <input
                  className="form-input"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  style={dynamicStyles.input}
                  disabled={isSubmitting}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
              
              <div>
                <label className="form-label" style={dynamicStyles.label}>
                  Last Name *
                </label>
                <input
                  className="form-input"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  style={dynamicStyles.input}
                  disabled={isSubmitting}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label" style={dynamicStyles.label}>
                Email Address *
              </label>
              <input
                className="form-input"
                name="user_email"
                type="email"
                required
                value={formData.user_email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                style={dynamicStyles.input}
                disabled={isSubmitting}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div>
              <label className="form-label" style={dynamicStyles.label}>
                Phone Number
              </label>
              <input
                className="form-input"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number (optional)"
                style={dynamicStyles.input}
                disabled={isSubmitting}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div>
              <label className="form-label" style={dynamicStyles.label}>
                Company/Organization
              </label>
              <input
                className="form-input"
                name="company_name"
                type="text"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Enter your company or organization (optional)"
                style={dynamicStyles.input}
                disabled={isSubmitting}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div>
              <label className="form-label" style={dynamicStyles.label}>
                Your Message *
              </label>
              <textarea
                className="form-textarea"
                name="user_message"
                rows="5"
                required
                value={formData.user_message}
                onChange={handleInputChange}
                placeholder="Tell us how we can help you or what you'd like to know more about..."
                style={dynamicStyles.input}
                disabled={isSubmitting}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
            
            <button
              className="form-button"
              type="submit"
              disabled={isSubmitting || !configStatus?.valid}
              style={isSubmitting || !configStatus?.valid ? dynamicStyles.buttonDisabled : dynamicStyles.button}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
              onFocus={(e) => handleButtonHover(e, true)}
              onBlur={(e) => handleButtonHover(e, false)}
            >
              {isSubmitting ? (
                <>
                  <span className="form-button-spinner"></span>
                  Sending Message...
                </>
              ) : (
                <>
                  <svg className="form-button-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                  Send Message
                </>
              )}
            </button>
            
            {!configStatus?.valid && (
              <div className="form-disabled-notice" style={dynamicStyles.disabledNotice}>
                Form disabled: SMTP not configured for {currentCountry}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Main;