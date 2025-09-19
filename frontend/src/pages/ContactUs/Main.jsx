import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme';
import emailJSService from '../../services/EmailJSService';

const Main = ({ isEmbedded = false, selectedCountry = 'Angola' }) => {
  const { theme, colors } = useTheme();
  
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      lineHeight: '1.5',
      fontWeight: '500'
    };
    switch (type) {
      case 'success':
        return { 
          ...baseStyle, 
          backgroundColor: colors.success + '15', 
          color: colors.success, 
          border: `1px solid ${colors.success}30` 
        };
      case 'error':
        return { 
          ...baseStyle, 
          backgroundColor: colors.error + '15', 
          color: colors.error, 
          border: `1px solid ${colors.error}30` 
        };
      case 'warning':
        return { 
          ...baseStyle, 
          backgroundColor: colors.warning + '15', 
          color: colors.warning, 
          border: `1px solid ${colors.warning}30` 
        };
      default:
        return baseStyle;
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: '"Nunito Sans", sans-serif',
    outline: 'none',
    backgroundColor: colors.surface,
    color: colors.text,
    transition: 'all 0.3s ease',
    boxShadow: `0 2px 4px ${colors.cardShadow}`
  };

  const inputFocusStyle = {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    boxShadow: `0 0 0 3px ${colors.primary}15`
  };

  return (
    <div
      style={{
        minHeight: isEmbedded ? 'unset' : '100vh',
        background: isEmbedded ? 'transparent' : colors.background,
        display: 'flex',
        alignItems: isEmbedded ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isEmbedded ? '20px' : '40px 20px',
        fontFamily: '"Nunito Sans", sans-serif'
      }}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '20px',
          boxShadow: `0 10px 40px ${colors.cardShadow}`,
          padding: isMobile ? '24px' : '40px',
          width: '100%',
          maxWidth: isEmbedded ? '100%' : '1000px',
          display: 'flex',
          gap: isMobile ? '30px' : '40px',
          flexDirection: isMobile ? 'column' : 'row',
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Contact Information Side */}
        <div style={{ 
          flex: '1',
          minWidth: isMobile ? '100%' : '320px',
          paddingRight: isMobile ? '0' : '20px',
          borderRight: isMobile ? 'none' : `1px solid ${colors.border}`,
          borderBottom: isMobile ? `1px solid ${colors.border}` : 'none',
          paddingBottom: isMobile ? '30px' : '0'
        }}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              backgroundColor: `${colors.primary}15`,
              borderRadius: '20px',
              marginBottom: '20px'
            }}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            
            <h2 style={{ 
              color: colors.text, 
              margin: '0 0 12px 0', 
              fontSize: '28px',
              fontWeight: '600',
              lineHeight: '1.3'
            }}>
              Get in Touch
            </h2>
            
            <p style={{ 
              color: colors.textSecondary, 
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0'
            }}>
              We're here to help you make a difference in environmental conservation across Africa
            </p>
          </div>

          {/* Country Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: colors.text,
              fontSize: '16px'
            }}>
              Select the ACEF Region you'd like to contact
            </label>
            <select
              value={currentCountry}
              onChange={handleCountryChange}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.text)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '20px',
                paddingRight: '44px'
              }}
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
            <div style={{
              backgroundColor: colors.backgroundSecondary,
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${colors.border}`
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: colors.text,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Regional Contact
              </h3>
              
              {contactInfo.contactEmail && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: `${colors.primary}15`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.primary}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6" fill="none" stroke={colors.surface} strokeWidth="2"/>
                    </svg>
                  </div>
                  <a 
                    href={`mailto:${contactInfo.contactEmail}`} 
                    style={{ 
                      color: colors.primary,
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {contactInfo.contactEmail}
                  </a>
                </div>
              )}
              
              {contactInfo.contactPhone && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: `${colors.primary}15`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <a 
                    href={`tel:${contactInfo.contactPhone}`} 
                    style={{ 
                      color: colors.primary,
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {contactInfo.contactPhone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              backgroundColor: colors.warning + '15',
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${colors.warning}30`,
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '24px' }}>⚠️</div>
              <p style={{
                fontSize: '14px',
                color: colors.warning,
                margin: '0',
                fontWeight: '500'
              }}>
                Contact information not available for {currentCountry}. Please try selecting a different region.
              </p>
            </div>
          )}
        </div>

        {/* Contact Form Side */}
        <div style={{ flex: '1', minWidth: isMobile ? '100%' : '320px' }}>
          <h3 style={{
            color: colors.text,
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '8px',
            marginTop: '0'
          }}>
            Send us a Message
          </h3>
          
          <p style={{
            color: colors.textSecondary,
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          {submitStatus && (
            <div style={getStatusStyle(submitStatus.type)}>
              {submitStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '16px' 
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text
                }}>
                  First Name *
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  style={inputStyle}
                  disabled={isSubmitting}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = `0 2px 4px ${colors.cardShadow}`;
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text
                }}>
                  Last Name *
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  style={inputStyle}
                  disabled={isSubmitting}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = `0 2px 4px ${colors.cardShadow}`;
                  }}
                />
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: colors.text
              }}>
                Email Address *
              </label>
              <input
                name="user_email"
                type="email"
                required
                value={formData.user_email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                style={inputStyle}
                disabled={isSubmitting}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = `0 2px 4px ${colors.cardShadow}`;
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: colors.text
              }}>
                Your Message *
              </label>
              <textarea
                name="user_message"
                rows="5"
                required
                value={formData.user_message}
                onChange={handleInputChange}
                placeholder="Tell us how we can help you or what you'd like to know more about..."
                style={{ 
                  ...inputStyle, 
                  resize: 'vertical', 
                  minHeight: '120px',
                  lineHeight: '1.5'
                }}
                disabled={isSubmitting}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = `0 2px 4px ${colors.cardShadow}`;
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !configStatus?.valid}
              style={{
                backgroundColor: isSubmitting || !configStatus?.valid ? colors.gray400 : colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting || !configStatus?.valid ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isSubmitting || !configStatus?.valid ? 'none' : `0 4px 12px ${colors.primary}30`,
                transform: isSubmitting || !configStatus?.valid ? 'none' : 'translateY(0)',
                ...((!isSubmitting && configStatus?.valid) && {
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${colors.primary}40`
                  }
                })
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && configStatus?.valid) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 20px ${colors.primary}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && configStatus?.valid) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 12px ${colors.primary}30`;
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ 
                    width: '18px', 
                    height: '18px', 
                    border: `2px solid ${colors.white}`,
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Sending Message...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={colors.white}>
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                  Send Message
                </>
              )}
            </button>
            
            {!configStatus?.valid && (
              <div style={{
                fontSize: '13px',
                color: colors.warning,
                textAlign: 'center',
                backgroundColor: colors.warning + '15',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.warning}30`,
                fontWeight: '500'
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