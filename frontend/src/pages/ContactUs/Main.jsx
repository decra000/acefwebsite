import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../theme';
import smtpService from '../../services/SMTPService';
import '../../styles/contact-styles.css';

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
  const [useFallback, setUseFallback] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasAttemptedLoad = useRef(false);

  // Fallback SMTP configuration
  const fallbackConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    user: 'acefngoweb@gmail.com',
    pass: 'ylpvcoeleixiptgu',
    secure: true,
    contactEmail: 'acefngoweb@gmail.com',
    contactPhone: '+237 XXX XXX XXX',
    physicalAddress: 'ACEF Main Office, Cameroon'
  };

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
    loadingContainer: {
      padding: '3rem 2rem',
      textAlign: 'center',
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: `4px solid ${colors.border}`,
      borderTop: `4px solid ${colors.primary}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem',
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: '1rem',
      marginTop: '1rem',
    },
    fallbackNotice: {
      backgroundColor: `${colors.warning || '#f59e0b'}15`,
      border: `1px solid ${colors.warning || '#f59e0b'}30`,
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '0.85rem',
      color: colors.text,
      textAlign: 'center',
      marginTop: '12px',
    },
  };

  // Initialize with fallback immediately to prevent flicker
  useEffect(() => {
    if (hasAttemptedLoad.current) return;
    hasAttemptedLoad.current = true;

    // Set fallback immediately for instant render
    setContactInfo(fallbackConfig);
    setConfigStatus({ valid: true, message: 'Ready' });

    // Then try to load API in background
    const initializeAsync = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 8000)
        );

        const loadPromise = Promise.all([
          loadAvailableCountries(),
          loadContactInfo(currentCountry)
        ]);

        await Promise.race([loadPromise, timeoutPromise]);
        
        // Successfully loaded API
        setIsInitializing(false);
      } catch (error) {
        // Timeout or error - stay with fallback
        console.log('Using fallback configuration');
        setUseFallback(true);
        setIsInitializing(false);
      }
    };

    initializeAsync();
  }, []);

  // Update contact info when country changes
  useEffect(() => {
    if (currentCountry && !useFallback && !isInitializing) {
      loadContactInfo(currentCountry);
    }
  }, [currentCountry]);

  const loadAvailableCountries = async () => {
    try {
      const configuredCountries = await smtpService.getConfiguredCountries();
      setCountries(configuredCountries);
      
      if (configuredCountries.length > 0) {
        const countryNames = configuredCountries.map(c => c.country);
        if (!countryNames.includes(selectedCountry)) {
          setCurrentCountry(configuredCountries[0].country);
        }
        setUseFallback(false);
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
      setUseFallback(true);
    }
  };

  const loadContactInfo = async (country) => {
    if (!country || useFallback) return;
    
    try {
      const validation = await smtpService.validateCountryConfig(country);
      setConfigStatus(validation);
      
      if (validation.valid && validation.config) {
        setContactInfo(validation.config);
      } else {
        setContactInfo(fallbackConfig);
      }
    } catch (error) {
      console.error('Failed to load contact info:', error);
      setContactInfo(fallbackConfig);
      setUseFallback(true);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (submitStatus?.type === 'success') {
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
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.user_email.trim()) errors.push('Email is required');
    if (!formData.user_message.trim()) errors.push('Message is required');
    
    if (formData.user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (formData.phone && formData.phone.trim() && !/^[\+]?[0-9\s\-\(\)]{7,}$/.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (formData.user_message && formData.user_message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
  };

// Pure frontend email sending using EmailJS (NO BACKEND NEEDED!)
  const sendEmailWithEmailJS = async (contactFormData) => {
    try {
      console.log('📧 Attempting to send email via EmailJS');
      
      // Wait for EmailJS to be available with timeout
      const waitForEmailJS = () => {
        return new Promise((resolve, reject) => {
          const maxAttempts = 20;
          let attempts = 0;
          
          const checkEmailJS = () => {
            if (typeof window.emailjs !== 'undefined') {
              resolve();
            } else if (attempts >= maxAttempts) {
              reject(new Error('EmailJS library not loaded. Please ensure the script is added to your HTML.'));
            } else {
              attempts++;
              setTimeout(checkEmailJS, 100);
            }
          };
          
          checkEmailJS();
        });
      };

      // Wait for EmailJS to be ready
      await waitForEmailJS();
      
      // Initialize EmailJS with your public key (safe to call multiple times)
      if (!window.emailjs._initialized) {
        window.emailjs.init('dQfQLIACEI282k5Cl');
        window.emailjs._initialized = true;
      }

      // Prepare template parameters matching your EmailJS template
      const templateParams = {
        from_name: `${contactFormData.firstName} ${contactFormData.lastName}`,
        from_email: contactFormData.user_email,  // User's email
        phone: contactFormData.phone || 'Not provided',
        company_name: contactFormData.company_name || 'Not provided',
        country: contactFormData.country || 'Main Office',
        message: contactFormData.user_message,
        reply_to: contactFormData.user_email,  // Same as from_email for reply-to
        timestamp: new Date(contactFormData.timestamp).toLocaleString()
      };

      console.log('📤 Sending email with EmailJS...');
      console.log('User email being sent:', contactFormData.user_email);
      console.log('Full template params:', templateParams);

      // Send email using your EmailJS service and template
      // Make sure your EmailJS template has "Reply To" set to {{reply_to}}
      const response = await window.emailjs.send(
        'service_qxhssj9',      // Your Gmail service ID
        'template_lzwmk6a',     // Your Contact Us template ID
        templateParams,
        'dQfQLIACEI282k5Cl'     // Public key (can also be passed here)
      );

      console.log('✅ EmailJS Response:', response);
      
      if (response.status === 200 || response.text === 'OK') {
        return {
          success: true,
          message: 'Email sent successfully'
        };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ EmailJS Error:', error);
      
      return {
        success: false,
        error: error.text || error.message || 'Failed to send email via EmailJS'
      };
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitStatus({
        type: 'error',
        message: validationErrors.join(', ')
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const contactFormData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        user_email: formData.user_email.trim(),
        phone: formData.phone?.trim() || '',
        company_name: formData.company_name?.trim() || '',
        user_message: formData.user_message.trim(),
        recipientEmail: contactInfo?.contactEmail || fallbackConfig.contactEmail,
        timestamp: new Date().toISOString(),
        country: useFallback ? 'Main Office' : currentCountry
      };

      let result;
      
      // Try backend API first (if available)
      if (!useFallback) {
        try {
          result = await smtpService.sendContactForm(currentCountry, contactFormData);
          console.log('✅ Email sent via backend API');
        } catch (apiError) {
          console.log('⚠️ Backend API unavailable, using EmailJS fallback');
          setUseFallback(true);
          // Use EmailJS - works without backend!
          result = await sendEmailWithEmailJS(contactFormData);
        }
      } else {
        // Backend is down, use EmailJS directly
        result = await sendEmailWithEmailJS(contactFormData);
      }

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. We will get back to you soon.'
        });
        
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
      
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again or contact us directly at acefngoweb@gmail.com'
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
    if (!isSubmitting) {
      if (isHover) {
        e.target.style.transform = 'translateY(-2px)';
        Object.assign(e.target.style, dynamicStyles.buttonHover);
      } else {
        e.target.style.transform = 'translateY(0)';
        Object.assign(e.target.style, dynamicStyles.button);
      }
    }
  };

  // Show elegant loading state during initialization
  if (isInitializing) {
    return (
      <div 
        className={`contact-container contact-main-wrapper ${isEmbedded ? 'embedded' : ''}`}
        style={dynamicStyles.wrapper}
      >
        <div className="contact-card" style={dynamicStyles.card}>
          <div style={dynamicStyles.loadingContainer}>
            <div style={dynamicStyles.loadingSpinner}></div>
            <p style={dynamicStyles.loadingText}>Preparing contact form...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className={`contact-container contact-main-wrapper ${isEmbedded ? 'embedded' : ''}`}
      style={dynamicStyles.wrapper}
    >
      <div className="contact-card" style={dynamicStyles.card}>
        <div className="contact-info-section" style={dynamicStyles.infoSection}>
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

          {!useFallback && currentCountry === 'Cameroon' && (
            <div style={dynamicStyles.headquartersNotice}>
              <div style={dynamicStyles.headquartersText}>
                📍 Cameroon Headquarters
              </div>
              <div style={dynamicStyles.headquartersSubtext}>
                Select a different region below if needed
              </div>
            </div>
          )}

          {!useFallback && countries.length > 0 && (
            <div className="country-select-container">
              <label className="country-select-label" style={dynamicStyles.label}>
                Select ACEF Region
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
                  </option>
                ))}
              </select>
            </div>
          )}

          {contactInfo && (
            <div className="contact-info-display" style={dynamicStyles.contactInfoDisplay}>
              <h3 className="contact-info-title" style={dynamicStyles.contactInfoTitle}>
                {useFallback ? 'Contact Information' : `${currentCountry} Office`}
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
          )}
        </div>

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
          
          <div className="form-group">
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
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={isSubmitting ? dynamicStyles.buttonDisabled : dynamicStyles.button}
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

            {useFallback && (
              <div style={dynamicStyles.fallbackNotice}>
                ℹ️ Using EmailJS service (backend offline)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;