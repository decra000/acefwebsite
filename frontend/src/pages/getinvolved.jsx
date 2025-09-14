import React, { useState, useEffect, useRef } from "react";
import { useTheme, createGradient, withOpacity } from '../theme';
import { API_URL } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DonationModal from '../pages/DonationModal';
import TestimonialsSlider from '../components/TestimonialsSlider';
import CollaborationChatbot from '../pages/CollaborationChatbot';
import ThankYouMessage from '../pages/ThankYouMessage';
import ImageFallbackComponent from './GetInvolvedHero';
import BadgeGenerator from '../pages/donorBadge';

import MailList from '../components/MailList';


const GetInvolved = () => {
  const { theme, colors, isDarkMode } = useTheme();
  const API_BASE = API_URL;
  
  // Component state
  const [activeFlow, setActiveFlow] = useState(null);
  const [volunteerCountry, setVolunteerCountry] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [volunteerForm, setVolunteerForm] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  
  // Premium animation states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [visibleElements, setVisibleElements] = useState(new Set());

  // Ref for scrolling to action cards
  const actionCardsRef = useRef(null);

  // Mouse tracking for premium effects and intersection observer for animations
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleElements(prev => new Set([...prev, entry.target.dataset.animateId]));
        }
      });
    }, observerOptions);

    // Observe elements with animation
    const animatedElements = document.querySelectorAll('[data-animate-id]');
    animatedElements.forEach(el => observer.observe(el));

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Original functions preserved for volunteer functionality
  const fetchAvailableCountries = async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setAvailableCountries(sorted);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setFormError('Failed to load countries');
      
      // Fallback countries from questions
      const fallbackCountries = [
        "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
        "Bangladesh", "Belgium", "Brazil", "Canada", "China", "Denmark", "Egypt",
        "France", "Germany", "Ghana", "India", "Indonesia", "Italy", "Japan",
        "Kenya", "Malaysia", "Mexico", "Netherlands", "Nigeria", "Norway",
        "Pakistan", "Philippines", "Poland", "Russia", "Saudi Arabia", "Singapore",
        "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Thailand",
        "Turkey", "Uganda", "Ukraine", "United Kingdom", "United States", "Vietnam"
      ];
      const fallbackData = fallbackCountries.map((name, index) => ({ id: index + 1, name }));
      setAvailableCountries(fallbackData);
    }
  };

  const fetchVolunteerForm = async (countryName) => {
    setLoadingForm(true);
    setFormError('');
    
    try {
      const response = await fetch(
        `${API_BASE}/volunteer-forms/country/${encodeURIComponent(countryName)}`, 
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.is_active) {
          setVolunteerForm(result.data);
        } else {
          setFormError(`No active volunteer form available for ${countryName} at this time.`);
          setVolunteerForm(null);
        }
      } else if (response.status === 404) {
        setFormError(`Thank you for your interest in ACEF ${countryName}.`);
        setVolunteerForm(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch volunteer form');
      }
    } catch (error) {
      console.error('Error fetching volunteer form:', error);
      setFormError(`Error loading volunteer form for ${countryName}. Please try again later.`);
      setVolunteerForm(null);
    } finally {
      setLoadingForm(false);
    }
  };

  const getEmbeddableFormURL = (formUrl) => {
    if (!formUrl) return '';
    
    try {
      if (formUrl.includes('docs.google.com/forms')) {
        if (formUrl.includes('/viewform')) {
          return formUrl.includes('embedded=true') ? formUrl : `${formUrl}&embedded=true`;
        } else if (formUrl.includes('/d/')) {
          const formIdMatch = formUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (formIdMatch) {
            return `https://docs.google.com/forms/d/e/${formIdMatch[1]}/viewform?embedded=true`;
          }
        }
      }
      
      if (formUrl.includes('typeform.com')) return formUrl;
      if (formUrl.includes('jotform.com')) {
        return formUrl.includes('?') ? `${formUrl}&embed=1` : `${formUrl}?embed=1`;
      }
      
      const separator = formUrl.includes('?') ? '&' : '?';
      return `${formUrl}${separator}embedded=true`;
      
    } catch (error) {
      console.error('Error processing form URL:', error);
      return formUrl;
    }
  };

  const handleVolunteerCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setVolunteerCountry(selectedCountry);
    
    if (selectedCountry) {
      fetchVolunteerForm(selectedCountry);
    } else {
      setVolunteerForm(null);
      setFormError('');
    }
  };

  // Handler functions for chatbot
  const handleChatbotSubmit = (formData) => {
    console.log("Collaboration data received:", formData);
    // Here you would send the data to your backend
    sendEmail(formData);
    setThankYouVisible(true);
  };

  const sendEmail = (data) => {
    console.log("Email sent with comprehensive data:", data);
    // Here you would integrate with your email service
  };

  const startFlow = (flowType) => {
    setActiveFlow(flowType);
    setThankYouVisible(false);
    
    if (flowType === 'volunteer') {
      fetchAvailableCountries();
    }
  };

  const exitFlow = () => {
    setActiveFlow(null);
    setThankYouVisible(false);
    // Reset volunteer state
    setVolunteerCountry('');
    setVolunteerForm(null);
    setFormError('');
  };

  const scrollToActionCards = () => {
    if (actionCardsRef.current) {
      actionCardsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const renderVolunteerForm = () => {
    if (!volunteerForm) return null;

    const embeddableURL = getEmbeddableFormURL(volunteerForm.form_url);
    
    return (
      <div style={{
        marginTop: '32px',
        background: isDarkMode 
          ? `linear-gradient(145deg, ${withOpacity(colors.black, 0.4)}, ${withOpacity(colors.primaryDark, 0.1)})`
          : `linear-gradient(145deg, ${withOpacity(colors.white, 0.9)}, ${withOpacity(colors.primary, 0.05)})`,
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
        boxShadow: `0 8px 32px ${withOpacity(colors.black, 0.1)}`,
      }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h3 style={{
            color: colors.primary,
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '12px',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>{volunteerForm.form_title}</h3>
          {volunteerForm.description && (
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: '0.95rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto'
            }}>{volunteerForm.description}</p>
          )}
        </div>
        
        <div style={{ 
          position: 'relative', 
          minHeight: '600px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: `inset 0 2px 8px ${withOpacity(colors.black, 0.05)}`
        }}>
          <iframe
            src={embeddableURL}
            width="100%"
            height="600"
            frameBorder="0"
            title={volunteerForm.form_title}
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation"
            loading="lazy"
            style={{
              border: 'none',
              borderRadius: '16px',
              backgroundColor: theme.colors.surface,
            }}
          />
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: theme.colors.textSecondary, fontSize: '0.875rem' }}>
              Having trouble with the form?{' '}
              <a 
                href={volunteerForm.form_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.primary,
                  textDecoration: 'none',
                  fontWeight: 600,
                  borderBottom: `1px solid ${withOpacity(colors.primary, 0.3)}`,
                  transition: 'all 0.3s ease'
                }}
              >
                Open in new tab →
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const actionButtons = [
    {
      id: 'collaborate',
      title: 'Collaborate',
      subtitle: 'Strategic partnerships & projects',
      icon: '🤝',
      gradient: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      description: 'Work with us on transformative projects that bridge law and technology'
    },
    {
      id: 'volunteer',
      title: 'Volunteer',
      subtitle: 'Direct community impact',
      icon: '🌟',
      gradient: `linear-gradient(135deg, ${colors.secondary}, ${colors.success})`,
      description: 'Contribute your time and skills to meaningful community programs'
    },
    {
      id: 'partner',
      title: 'Partner',
      subtitle: 'Long-term organizational partnerships',
      icon: '🏢',
      gradient: `linear-gradient(135deg, ${colors.success}, ${colors.primary})`,
      description: 'Establish sustainable partnerships for lasting social impact'
    },
    {
      id: 'donate',
      title: 'Support',
      subtitle: 'Financial contributions',
      icon: '💝',
      gradient: `linear-gradient(135deg, ${colors.warning}, ${colors.primary})`,
      description: 'Fuel our mission with financial support for key initiatives'
    }
  ];

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: isDarkMode 
        ? `radial-gradient(ellipse at top, ${withOpacity(colors.primaryDark, 0.3)}, ${colors.black})`
        : `radial-gradient(ellipse at top, ${withOpacity(colors.primary, 0.1)}, ${colors.white})`,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      color: theme.colors.text,
      position: 'relative',
      fontSize: '14px',
      lineHeight: 1.5
    },

    backgroundEffect: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDarkMode
        ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${withOpacity(colors.primary, 0.1)}, transparent 40%)`
        : `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, ${withOpacity(colors.secondary, 0.08)}, transparent 40%)`,
      pointerEvents: 'none',
      zIndex: 0,
      transition: 'all 0.3s ease'
    },

    heroSection: {
      position: 'relative',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondaryDark} 50%, ${colors.secondary} 100%)`
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%)`,
      color: colors.white,
      zIndex: 1
    },

    heroContent: {
      maxWidth: '700px',
      textAlign: 'center',
      padding: '0 20px'
    },

    heroTitle: {
      fontSize: '3rem',
      fontWeight: 800,
      marginBottom: '20px',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },

    heroSubtitle: {
      fontSize: '1.125rem',
      opacity: 0.95,
      lineHeight: 1.6,
      fontWeight: 300,
      marginBottom: '40px'
    },

    mainContainer: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '60px 20px',
      position: 'relative',
      zIndex: 1,
      paddingTop: '80px' // Add space at top for header
    },

    navigationSection: {
      textAlign: 'center',
      marginBottom: '60px'
    },

    sectionTitle: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '12px',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },

    sectionSubtitle: {
      fontSize: '1rem',
      color: theme.colors.textSecondary,
      marginBottom: '48px',
      fontWeight: 400
    },

    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '40px'
    },

    // Animation styles
    animateSlideUp: {
      transform: 'translateY(50px)',
      opacity: 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    animateSlideUpVisible: {
      transform: 'translateY(0)',
      opacity: 1,
    },

    animateSlideLeft: {
      transform: 'translateX(-50px)',
      opacity: 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    animateSlideLeftVisible: {
      transform: 'translateX(0)',
      opacity: 1,
    },

    animateSlideRight: {
      transform: 'translateX(50px)',
      opacity: 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    animateSlideRightVisible: {
      transform: 'translateX(0)',
      opacity: 1,
    },

    animateFadeIn: {
      opacity: 0,
      transition: 'all 0.8s ease-in-out',
    },

    animateFadeInVisible: {
      opacity: 1,
    },

    actionButton: {
      background: isDarkMode 
        ? withOpacity(colors.primaryDark, 0.1)
        : colors.white,
      borderRadius: '20px',
      padding: '24px',
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textAlign: 'left',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 4px 20px ${withOpacity(colors.primary, 0.08)}`,
      backdropFilter: 'blur(10px)'
    },

    buttonIcon: {
      fontSize: '2rem',
      marginBottom: '12px',
      display: 'block'
    },

    buttonTitle: {
      fontSize: '1.125rem',
      fontWeight: 700,
      marginBottom: '6px',
      color: theme.colors.text
    },

    buttonSubtitle: {
      fontSize: '0.875rem',
      color: colors.primary,
      marginBottom: '8px',
      fontWeight: 600
    },

    buttonDescription: {
      fontSize: '0.875rem',
      color: theme.colors.textSecondary,
      lineHeight: 1.4,
      fontWeight: 400
    },

    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      background: 'transparent',
      border: `1px solid ${withOpacity(colors.primary, 0.3)}`,
      borderRadius: '24px',
      color: colors.primary,
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      marginBottom: '24px',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      backdropFilter: 'blur(10px)'
    },

    volunteerSection: {
      padding: '40px',
      textAlign: 'center',
      background: isDarkMode 
        ? `linear-gradient(145deg, ${withOpacity(colors.black, 0.6)}, ${withOpacity(colors.primaryDark, 0.2)})`
        : `linear-gradient(145deg, ${withOpacity(colors.white, 0.95)}, ${withOpacity(colors.primary, 0.05)})`,
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: `0 8px 40px ${withOpacity(colors.primary, 0.15)}`,
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
    },

    volunteerTitle: {
      fontSize: '1.25rem',
      marginBottom: '24px',
      color: colors.primary,
      fontWeight: 700
    },

    volunteerDescription: {
      fontSize: '0.875rem',
      color: theme.colors.textSecondary,
      marginBottom: '24px',
      lineHeight: 1.6
    },

    countrySelector: {
      maxWidth: '400px',
      margin: '0 auto 24px',
      display: 'block'
    },

    select: {
      width: '100%',
      padding: '14px 16px',
      background: isDarkMode 
        ? withOpacity(colors.black, 0.3)
        : withOpacity(colors.gray50, 0.8),
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontFamily: 'inherit',
      color: theme.colors.text,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='${colors.primary.replace('#', '%23')}' viewBox='0 0 16 16'%3e%3cpath d='m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '12px'
    },

    loadingState: {
      textAlign: 'center',
      padding: '40px',
      color: colors.primary,
      fontSize: '0.875rem',
      fontWeight: 500
    },

    loadingSpinner: {
      width: '32px',
      height: '32px',
      border: `3px solid ${withOpacity(colors.primary, 0.2)}`,
      borderTopColor: colors.primary,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    },

    errorState: {
      textAlign: 'center',
      padding: '32px',
      background: `${colors.error}10`,
      borderRadius: '16px',
      border: `1px solid ${colors.error}20`,
      margin: '24px 0'
    },

    primaryButton: {
      padding: '12px 24px',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
      color: colors.white,
      border: 'none',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      minWidth: '120px',
      boxShadow: `0 4px 12px ${withOpacity(colors.primary, 0.3)}`
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.backgroundEffect}></div>
      <Header />
      <ImageFallbackComponent onStartClick={scrollToActionCards} />
      

      {/* Main Content */}
      <div style={styles.mainContainer} ref={actionCardsRef}>
        {thankYouVisible ? (
          <ThankYouMessage onClose={exitFlow} />
        ) : activeFlow ? (
          // Flow Interface
          <>
            {(activeFlow === 'collaborate' || activeFlow === 'partner') && (
              <CollaborationChatbot
                flowType={activeFlow}
                onSubmit={handleChatbotSubmit}
                onExit={exitFlow}
              />
            )}

            {activeFlow === 'volunteer' && (
              <div style={styles.volunteerSection}>
                <button 
                  style={styles.backButton}
                  onClick={exitFlow}
                  onMouseEnter={(e) => {
                    e.target.style.background = withOpacity(colors.primary, 0.1);
                    e.target.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = withOpacity(colors.primary, 0.3);
                  }}
                >
                  ← Back to Options
                </button>
                
                <h3 style={styles.volunteerTitle}>🌍 Volunteer Opportunities</h3>
                <p style={styles.volunteerDescription}>
                  Select a country you'd like to volunteer in.
                </p>
                
                <div style={styles.countrySelector}>
                  <select
                    value={volunteerCountry}
                    onChange={handleVolunteerCountryChange}
                    style={styles.select}
                  >
                    <option value="">Choose country of interest...</option>
                    {availableCountries.map((country) => (
                      <option key={country.id || country.name} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingForm && (
                  <div style={styles.loadingState}>
                    <div style={styles.loadingSpinner}></div>
                    <p>Loading volunteer opportunities for {volunteerCountry}...</p>
                  </div>
                )}

                {formError && !loadingForm && (
                  <div style={styles.errorState}>
                    <h4 style={{ color: colors.primary, marginBottom: '12px', fontSize: '1rem' }}>
                      Sorry, we are not accepting applications here at this time. Please check back later or try another ACEF region.
                    </h4>
                    <p style={{ marginBottom: '16px', fontSize: '0.875rem' }}>{formError}</p>
                  </div>
                )}

                {volunteerForm && !loadingForm && !formError && renderVolunteerForm()}
              </div>
            )}

            {activeFlow === 'donate' && (
              <div style={styles.volunteerSection}>
                <button 
                  style={styles.backButton}
                  onClick={exitFlow}
                  onMouseEnter={(e) => {
                    e.target.style.background = withOpacity(colors.primary, 0.1);
                    e.target.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = withOpacity(colors.primary, 0.3);
                  }}
                >
                  ← Back to Options
                </button>
                
                <h3 style={styles.volunteerTitle}>💝 Support Our Mission</h3>
                <p style={styles.volunteerDescription}>
                  Your financial support enables us to expand our reach, develop innovative solutions, 
                  and create lasting positive change across Africa.
                </p>
                <button 
                  style={styles.primaryButton} 
                  onClick={() => setIsDonationModalOpen(true)}
                >
                  💝 Make a Donation
                </button>
              </div>
            )}
          </>
        ) : (
          // Navigation Interface
          <div style={styles.navigationSection}>
            <div 
              style={{
                ...styles.animateSlideUp,
                ...(visibleElements.has('section-title') ? styles.animateSlideUpVisible : {})
              }}
              data-animate-id="section-title"
            >
              <h2>Choose Your Path</h2>
              <p style={styles.sectionSubtitle}>
                Select how you'd like to contribute to our mission
              </p>
            </div>
            
            <div 
              style={{
                ...styles.buttonGrid,
                ...styles.animateFadeIn,
                ...(visibleElements.has('action-cards') ? styles.animateFadeInVisible : {})
              }}
              data-animate-id="action-cards"
            >
              {actionButtons.map((button, index) => (
                <div
                  key={button.id}
                  style={{
                    ...styles.actionButton,
                    ...styles.animateSlideUp,
                    transitionDelay: `${index * 0.1}s`,
                    ...(visibleElements.has('action-cards') ? styles.animateSlideUpVisible : {})
                  }}
                  onClick={() => startFlow(button.id)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = `0 8px 32px ${withOpacity(colors.primary, 0.2)}`;
                    e.target.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 4px 20px ${withOpacity(colors.primary, 0.08)}`;
                    e.target.style.borderColor = withOpacity(colors.primary, 0.2);
                  }}
                >
                  <span style={styles.buttonIcon}>{button.icon}</span>
                  <h3 style={styles.buttonTitle}>{button.title}</h3>
                  <p style={styles.buttonSubtitle}>{button.subtitle}</p>
                  <p style={styles.buttonDescription}>{button.description}</p>
                </div>
              ))}
            </div>


            <div 
  style={{
    width: '100%',
    padding: '4rem 2rem',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: '2rem',
    margin: '4rem 0',
  }}
>
  {/* Careers Block */}
  <div 
    style={{
      flex: 1,
      background: '#ebf4ff', // light blue theme
      padding: '3rem 2rem',
      borderRadius: '1rem',
      textAlign: 'center',
    }}
  >
    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: '#1e3a8a' }}>
      Explore Careers
    </h2>
    <p style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '2rem', lineHeight: 1.6 }}>
      Join our mission-driven team and shape meaningful change across communities.
    </p>
    <a 
      href="/jobs"
      style={{
        padding: '0.9rem 2rem',
        background: '#2563eb',
        color: '#fff',
        borderRadius: '0.5rem',
        fontWeight: '600',
        textDecoration: 'none',
        fontSize: '1rem',
      }}
    >
      See Openings
    </a>
  </div>

  {/* Events Block */}
  <div 
    style={{
      flex: 1,
      background: '#ecfdf5', // light green theme
      padding: '3rem 2rem',
      borderRadius: '1rem',
      textAlign: 'center',
    }}
  >
    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: '#065f46' }}>
      Explore Events
    </h2>
    <p style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '2rem', lineHeight: 1.6 }}>
      Connect, engage, and grow through our exclusive events and experiences.
    </p>
    <a 
      href="/events"
      style={{
        padding: '0.9rem 2rem',
        background: '#059669',
        color: '#fff',
        borderRadius: '0.5rem',
        fontWeight: '600',
        textDecoration: 'none',
        fontSize: '1rem',
      }}
    >
      View Events
    </a>
  </div>
</div>

            <div 
              style={{
                ...styles.animateSlideUp,
                ...(visibleElements.has('testimonials') ? styles.animateSlideUpVisible : {})
              }}
              data-animate-id="testimonials"
            >
              <TestimonialsSlider/>
            </div>
          </div>
        )}
      </div>

      <DonationModal 
        open={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
<MailList/>
      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;500;600;700;800;900&display=swap');

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .action-button:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 32px ${withOpacity(colors.primary, 0.2)} !important;
          border-color: ${colors.primary} !important;
        }

        .primary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px ${withOpacity(colors.primary, 0.4)} !important;
        }

        select:focus {
          border-color: ${colors.primary} !important;
          box-shadow: 0 0 0 2px ${withOpacity(colors.primary, 0.2)} !important;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.25rem !important;
          }
          
          .hero-subtitle {
            font-size: 1rem !important;
          }
          
          .section-title {
            font-size: 1.75rem !important;
          }
          
          .button-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .action-button {
            padding: 20px !important;
          }
          
          .volunteer-section {
            padding: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .main-container {
            padding: 40px 16px !important;
          }
          
          .hero-title {
            font-size: 1.875rem !important;
          }
          
          .hero-subtitle {
            font-size: 0.9375rem !important;
          }
          
          .volunteer-section {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GetInvolved;