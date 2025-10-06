import React, { useState, useEffect, useRef } from "react";
import { useTheme, withOpacity } from '../../theme';
import { API_URL } from '../../config';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DonationModal from '../../pages/Donations/DonationModal';
import CollaborationChatbot from '../Chatbot/CollaborationChatbot';
import ThankYouMessage from '../../components/ThankYouMessage';
import ImageFallbackComponent from './GetInvolvedHero';
import CollVolunteersTestimonials from '../../pages/Testimonials/CollVolunteersTestimonials';
import MailList from '../../components/MailList';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GetInvolved = () => {
  const { theme, colors, isDarkMode } = useTheme();
  
  // Component state
  const [activeFlow, setActiveFlow] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const navigate = useNavigate();
  
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

  // Handler functions for chatbot
  const handleChatbotSubmit = (formData) => {
    console.log("Form data received:", formData);
    setThankYouVisible(true);
  };

  const startFlow = (flowType) => {
    setActiveFlow(flowType);
    setThankYouVisible(false);
  };

  const exitFlow = () => {
    setActiveFlow(null);
    setThankYouVisible(false);
  };

  const scrollToActionCards = () => {
    if (actionCardsRef.current) {
      actionCardsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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

    mainContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 20px',
      position: 'relative',
      zIndex: 1,
      paddingTop: '80px'
    },

    navigationSection: {
      textAlign: 'center',
      marginBottom: '60px'
    },

    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '40px'
    },

    animateFadeIn: {
      opacity: 0,
      transition: 'all 0.8s ease-in-out',
    },

    animateFadeInVisible: {
      opacity: 1,
    },

    animateSlideUp: {
      transform: 'translateY(50px)',
      opacity: 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    animateSlideUpVisible: {
      transform: 'translateY(0)',
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

    primaryButton: {
      backgroundColor: colors.primary,
      color: colors.white,
      padding: '16px 32px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: `0 4px 16px rgba(10, 69, 28, 0.3)`,
      fontFamily: '"Nunito Sans", sans-serif'
    },

    donateSection: {
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

    sectionTitle: {
      fontSize: '1.25rem',
      marginBottom: '24px',
      color: colors.primary,
      fontWeight: 700
    },

    sectionDescription: {
      fontSize: '0.875rem',
      color: theme.colors.textSecondary,
      marginBottom: '24px',
      lineHeight: 1.6
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

    careerEventSection: {
      width: '100%',
      display: 'flex',
      margin: '4rem 0',
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    },

    careerBlock: {
      flex: 1,
      background: isDarkMode 
        ? `linear-gradient(135deg, ${withOpacity(colors.secondary, 0.15)}, ${withOpacity(colors.primaryDark, 0.25)})`
        : `linear-gradient(135deg, #ebf4ff, #dbeafe)`,
      padding: '4rem 2rem',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      border: isDarkMode ? `1px solid ${withOpacity(colors.primary, 0.2)}` : 'none',
    },

    eventsBlock: {
      flex: 1,
      background: isDarkMode 
        ? `linear-gradient(135deg, ${withOpacity(colors.secondary, 0.15)}, ${withOpacity(colors.success, 0.20)})`
        : `linear-gradient(135deg, #ecfdf5, #d1fae5)`,
      padding: '4rem 2rem',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      border: isDarkMode ? `1px solid ${withOpacity(colors.secondary, 0.2)}` : 'none',
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
          <>
            {/* Chatbot flows for collaborate, volunteer, and partner */}
            {(activeFlow === 'collaborate' || activeFlow === 'partner' || activeFlow === 'volunteer') && (
              <CollaborationChatbot
                flowType={activeFlow}
                onSubmit={handleChatbotSubmit}
                onExit={exitFlow}
              />
            )}

            {/* Donate flow */}
            {activeFlow === 'donate' && (
              <div style={styles.donateSection}>
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
                
                <h3 style={styles.sectionTitle}>💝 Support Our Mission</h3>
                <p style={styles.sectionDescription}>
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
            {/* Title section */}
            <div
              style={{
                maxWidth: '1100px',
                margin: '0 auto 80px auto',
                textAlign: 'center'
              }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-50px' }}
                transition={{ duration: 0.6 }}
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  fontWeight: '300',
                  color: isDarkMode ? colors.text : colors.primary,
                  lineHeight: '1.2',
                  marginBottom: '24px',
                  letterSpacing: '-0.02em',
                  fontFamily: '"Nunito Sans", sans-serif',
                }}
              >
                Choose Your <span style={{ fontWeight: '700', color: colors.primary }}>Path</span>
              </motion.h1>
              
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ margin: '-50px' }}
                transition={{ duration: 0.8 }}
                style={{
                  width: '60px',
                  height: '2px',
                  background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
                  margin: '0 auto 24px auto',
                  borderRadius: '1px',
                  transformOrigin: 'center'
                }}
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: '0',
                  letterSpacing: '0.5px',
                  fontWeight: 400,
                  opacity: 0.9
                }}
              >
                Select how you'd like to contribute to our mission
              </motion.p>
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
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 32px ${withOpacity(colors.primary, 0.2)}`;
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 20px ${withOpacity(colors.primary, 0.08)}`;
                    e.currentTarget.style.borderColor = withOpacity(colors.primary, 0.2);
                  }}
                >
                  <span style={styles.buttonIcon}>{button.icon}</span>
                  <h3 style={styles.buttonTitle}>{button.title}</h3>
                  <p style={styles.buttonSubtitle}>{button.subtitle}</p>
                  <p style={styles.buttonDescription}>{button.description}</p>
                </div>
              ))}
            </div>

            {/* Career and Events Section */}
            <div style={styles.careerEventSection}>
              <div style={styles.careerBlock}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💼</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: colors.primary
                }}>Explore Careers</h3>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  color: theme.colors.textSecondary
                }}>
                  Be part of a dynamic team driving legal innovation across Africa. 
                  Explore career opportunities that combine purpose with professional growth.
                </p>
                <button 
                  style={{
                    ...styles.primaryButton,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  }}
                  onClick={() => navigate("/jobs")}
                >
                  View Open Positions
                </button>
              </div>

              <div style={styles.eventsBlock}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📅</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: colors.secondary
                }}>Upcoming Events</h3>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  color: theme.colors.textSecondary
                }}>
                  Join our workshops, conferences, and community events. 
                  Connect with legal professionals and innovators across the continent.
                </p>
                <button
                  style={{
                    ...styles.primaryButton,
                    background: `linear-gradient(135deg, ${colors.secondary}, ${colors.success})`,
                  }}
                  onClick={() => navigate("/events")}
                >
                  Explore Events
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DonationModal 
        open={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
      <CollVolunteersTestimonials />
      <MailList/>
      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
};

export default GetInvolved;