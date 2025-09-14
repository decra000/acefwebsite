import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme'; // Import your theme hook
import emailJSService from '../../services/EmailJSService'; // Import the EmailJS service we created

const Main = ({ isEmbedded = false, selectedCountry = 'Kenya' }) => {
  const { theme, colors } = useTheme(); // Use the theme hook
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    user_email: '',
    user_message: ''
  });

  const [contactInfo, setContactInfo] = useState(null);
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(selectedCountry);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);

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
      const configuredCountries = await emailJSService.getConfiguredCountries();
      setCountries(configuredCountries);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const loadContactInfo = async (country) => {
    try {
      const validation = await emailJSService.validateCountryConfig(country);
      setConfigStatus(validation);
      
      if (validation.valid && validation.config) {
        setContactInfo(validation.config);
      } else {
        setContactInfo(null);
        if (!validation.valid) {
          setSubmitStatus({
            type: 'warning',
            message: `Contact form may not work for ${country}. EmailJS not fully configured.`
          });
        }
      }
    } catch (error) {
      console.error('Failed to load contact info:', error);
      setContactInfo(null);
      setConfigStatus({ valid: false, message: 'Failed to load configuration' });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.user_email.trim()) errors.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      errors.push('Please enter a valid email address');
    }
    if (!formData.user_message.trim()) errors.push('Message is required');
    else if (formData.user_message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    return errors;
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
    if (!configStatus?.valid) {
      setSubmitStatus({
        type: 'error',
        message: `Cannot send email: EmailJS not configured for ${currentCountry}`
      });
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const emailData = {
        user_name: `${formData.firstName} ${formData.lastName}`,
        from_name: `${formData.firstName} ${formData.lastName}`,
        user_email: formData.user_email,
        from_email: formData.user_email,
        user_company: formData.company_name || 'Not provided',
        company: formData.company_name || 'Not provided',
        user_message: formData.user_message,
        message: formData.user_message,
        country: currentCountry,
        timestamp: new Date().toISOString(),
        subject: `Contact Form Submission from ${formData.firstName} ${formData.lastName}`
      };

      const result = await emailJSService.sendEmail(currentCountry, emailData);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. We will get back to you soon.'
        });
        setFormData({
          firstName: '',
          lastName: '',
          user_email: '',
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
        message: `Failed to send message: ${error.message}. Please try again or contact us directly.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (type) => {
    const baseStyle = {
      padding: '0.75rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '14px'
    };
    switch (type) {
      case 'success':
        return { ...baseStyle, backgroundColor: colors.success + '20', color: colors.success, border: `1px solid ${colors.success}40` };
      case 'error':
        return { ...baseStyle, backgroundColor: colors.error + '20', color: colors.error, border: `1px solid ${colors.error}40` };
      case 'warning':
        return { ...baseStyle, backgroundColor: colors.warning + '20', color: colors.warning, border: `1px solid ${colors.warning}40` };
      default:
        return baseStyle;
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: colors.surface,
    color: colors.text,
    transition: 'all 0.2s ease'
  };

  const inputFocusStyle = {
    borderColor: colors.primary,
    backgroundColor: colors.background
  };

  return (
    <div
      style={{
        minHeight: isEmbedded ? 'unset' : '100vh',
        background: isEmbedded ? 'transparent' : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        display: 'flex',
        alignItems: isEmbedded ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isEmbedded ? '0.5rem' : '2rem',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transform: isEmbedded ? 'scale(0.88)' : 'none',
        transformOrigin: 'top left'
      }}
    >
      <div
        style={{
          backgroundColor: isEmbedded ? colors.backgroundSecondary : colors.background,
          borderRadius: '16px',
          boxShadow: isEmbedded ? `0 2px 6px ${colors.cardShadow}` : `0 20px 40px ${colors.cardShadow}`,
          padding: isEmbedded ? '1rem' : '3rem',
          width: '100%',
          maxWidth: isEmbedded ? '100%' : '1000px',
          display: 'flex',
          gap: '2rem',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Contact Information Side */}
        <div style={{ 
          flex: '1', 
          minWidth: '300px',
          paddingRight: window.innerWidth >= 768 ? '1rem' : '0',
          borderRight: window.innerWidth >= 768 ? `1px solid ${colors.border}` : 'none',
          borderBottom: window.innerWidth < 768 ? `1px solid ${colors.border}` : 'none',
          paddingBottom: window.innerWidth < 768 ? '1rem' : '0',
          textAlign: 'center'
        }}>
          {/* Friendly Support SVG */}
          <div style={{ marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill={colors.primary} 
              width="80" height="80"
              style={{ margin: '0 auto' }}
            >
              <path d="M12 1a9 9 0 00-9 9v3a4 4 0 004 4h1v-2H7a2 2 0 01-2-2v-3a7 7 0 0114 0v3a2 2 0 01-2 2h-1v2h1a4 4 0 004-4v-3a9 9 0 00-9-9z"/>
              <path d="M9 21h6v-2H9v2z"/>
            </svg>
            <h2 style={{ color: colors.text, marginTop: '0.5rem', fontWeight: '500' }}>
              Get Localized Support
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
              Our country teams are here to help you
            </p>
          </div>

          {/* Country Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: colors.textSecondary,
              fontSize: '14px'
            }}>
              Choose Your Country:
            </label>
            <select
              value={currentCountry}
              onChange={handleCountryChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: colors.background,
                color: colors.text,
                cursor: 'pointer'
              }}
            >
              {countries.map(country => (
                <option key={country.country} value={country.country}>
                  {country.country}
                  {country.hasCompleteConfig ? ' ✅' : ' ⚠️'}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Info */}
          {contactInfo && (
            <div style={{
              backgroundColor: colors.surfaceSecondary,
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              textAlign: 'left'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: colors.text }}>
                Contact Information
              </h3>
              {contactInfo.contactEmail && (
                <p style={{ fontSize: '14px', margin: '0.5rem 0' }}>
                  📧 <a href={`mailto:${contactInfo.contactEmail}`} style={{ color: colors.primary }}>
                    {contactInfo.contactEmail}
                  </a>
                </p>
              )}
              {contactInfo.contactPhone && (
                <p style={{ fontSize: '14px', margin: '0.5rem 0' }}>
                  📞 <a href={`tel:${contactInfo.contactPhone}`} style={{ color: colors.primary }}>
                    {contactInfo.contactPhone}
                  </a>
                </p>
              )}
            </div>
          )}

          {!contactInfo && (
            <div style={{
              backgroundColor: colors.warning + '20',
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.warning}40`,
              fontSize: '14px',
              color: colors.warning
            }}>
              ⚠️ Contact information not available for {currentCountry}. 
              Please try selecting a different region or contact us directly.
            </div>
          )}
        </div>

        {/* Contact Form Side */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          {submitStatus && (
            <div style={getStatusStyle(submitStatus.type)}>
              {submitStatus.message}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                style={inputStyle}
                disabled={isSubmitting}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                style={inputStyle}
                disabled={isSubmitting}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>
            <input
              name="user_email"
              type="email"
              required
              value={formData.user_email}
              onChange={handleInputChange}
              placeholder="Email Address"
              style={inputStyle}
              disabled={isSubmitting}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />

            <textarea
              name="user_message"
              rows="4"
              required
              value={formData.user_message}
              onChange={handleInputChange}
              placeholder="Your message"
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' }}
              disabled={isSubmitting}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
            <button
              type="submit"
              disabled={isSubmitting || !configStatus?.valid}
              style={{
                backgroundColor: isSubmitting || !configStatus?.valid ? colors.gray400 : colors.text,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting || !configStatus?.valid ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: `2px solid ${colors.white}`,
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Sending...
                </>
              ) : (
                <>📧 Send Message</>
              )}
            </button>
            {!configStatus?.valid && (
              <div style={{
                fontSize: '12px',
                color: colors.warning,
                textAlign: 'center',
                backgroundColor: colors.warning + '20',
                padding: '0.5rem',
                borderRadius: '6px',
                border: `1px solid ${colors.warning}40`
              }}>
                Form disabled: EmailJS not configured for {currentCountry}
              </div>
            )}
          </form>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Main;
