import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const FounderSection = () => {
  const [members, setMembers] = useState([]);
  const [showLetter, setShowLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${API_URL}/team`, { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const teamArray = Array.isArray(data) ? data : data.data || data.members || [];
          setMembers(teamArray);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const founder = members.find(
    (member) => member.department?.trim().toLowerCase() === 'founder'
  );

  const handleLetterClick = () => {
    setLetterContent(`
      Dear Friends and Supporters,

      Welcome to the Africa Climate and Environment Foundation (ACEF)!

      As the founder of ACEF, it is with immense pride and a profound sense of purpose that I share our journey with you. Our organization was born out of a deep conviction that the future of Africa lies in the hands of its vibrant, dedicated youth, women, and grassroots communities.

      Since our registration on March 31st, 2021, ACEF has grown into a network of over 2,000 passionate individuals working tirelessly to address climate change, environmental degradation, and poverty across Africa. We believe in the power of collective action and unwavering commitment to create lasting change.

      Our mission extends beyond just addressing environmental challenges - we aim to bridge the hunger and poverty gap, build community resilience, protect our precious environment, promote peace, and conserve the vital natural resources that sustain life across our beautiful continent.

      I invite you to join us in this vital movement. Together, we can build a resilient, thriving Africa where communities flourish in harmony with nature.

      Thank you for your support and belief in our mission.

      Warm regards,
      ${founder?.name || 'Founder'}
      ${founder?.position || 'Founder & CEO'}
      Africa Climate and Environment Foundation (ACEF)
    `);
    setShowLetter(true);
  };

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  const getImageSource = () => {
    if (founder?.image_url) {
      return `${STATIC_URL}${founder.image_url}`;
    }
    return '/tambe.jpg';
  };

  const styles = {
    section: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`
        : `linear-gradient(135deg, ${colors.gray50} 0%, ${colors.backgroundSecondary} 50%, #fef7ff 100%)`,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: isMobile ? '3rem 0' : '4rem 0',
      overflow: 'hidden',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 1.5rem' : '0 2rem',
      display: 'grid',
      gridTemplateColumns: isTablet ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 1fr)',
      gap: isTablet ? '3rem' : '4rem',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
      width: '100%',
      boxSizing: 'border-box',
    },
    leftContent: {
      maxWidth: '100%',
      zIndex: 2,
    },
    rightContent: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
      order: isMobile ? -1 : 0,
    },
    sectionLabel: {
      display: 'inline-block',
      fontSize: 'clamp(0.7rem, 2vw, 0.75rem)',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors.primary,
      backgroundColor: isDarkMode ? `${colors.primary}15` : `${colors.primary}08`,
      padding: '8px 16px',
      borderRadius: '20px',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      border: `1px solid ${isDarkMode ? colors.primary + '25' : colors.primary + '15'}`,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: 800,
      color: colors.text,
      lineHeight: '1.1',
      marginBottom: isMobile ? '1.25rem' : '1.5rem',
      letterSpacing: '-0.02em',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    titleAccent: {
      color: colors.primary,
      position: 'relative',
    },
    subtitle: {
      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
      color: colors.textSecondary,
      lineHeight: 1.7,
      marginBottom: isMobile ? '2rem' : '2.5rem',
      fontWeight: 400,
      maxWidth: '100%',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    primaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '0.875rem 1.75rem' : '1rem 2rem',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: 600,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      letterSpacing: '0.01em',
      boxShadow: `0 10px 25px ${colors.cardShadow}`,
      width: isMobile ? '100%' : 'auto',
      maxWidth: isMobile ? '100%' : 'none',
    },
    imageContainer: {
      position: 'relative',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: `0 20px 40px ${colors.cardShadow}`,
      height: isMobile ? '380px' : '480px',
      width: '100%',
      maxWidth: isMobile ? '100%' : '380px',
      margin: '0 auto',
    },
    founderImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      filter: isDarkMode ? 'brightness(0.9) contrast(1.1)' : 'none',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: isMobile ? '1rem' : '1.5rem',
      left: isMobile ? '1rem' : '1.5rem',
      right: isMobile ? '1rem' : '1.5rem',
      background: isDarkMode 
        ? 'rgba(0, 0, 0, 0.75)'
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '0.75rem',
      padding: isMobile ? '1rem' : '1.25rem',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
    },
    overlayName: {
      margin: '0 0 0.25rem 0',
      fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
      fontWeight: 700,
      color: isDarkMode ? colors.text : colors.primary,
      lineHeight: '1.2',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    overlayPosition: {
      margin: 0,
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      color: colors.textSecondary,
      fontWeight: 600,
      lineHeight: '1.2',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: isMobile ? 'flex-start' : 'center',
      zIndex: 1000,
      padding: isMobile ? '1rem' : '2rem',
      paddingTop: isMobile ? '2rem' : '2rem',
      overflowY: 'auto',
    },
    modalContent: {
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      padding: isMobile ? '2rem 1.5rem' : '2.5rem',
      borderRadius: '1rem',
      maxWidth: '700px',
      width: '100%',
      maxHeight: isMobile ? '90vh' : '85vh',
      overflowY: 'auto',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.7,
      color: colors.text,
      boxShadow: `0 25px 50px ${colors.cardShadow}`,
      border: `1px solid ${colors.border}`,
      position: 'relative',
    },
    modalHeader: {
      marginTop: 0,
      marginBottom: isMobile ? '1.5rem' : '2rem',
      fontWeight: 800,
      color: colors.primary,
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      letterSpacing: '-0.01em',
      textAlign: 'center',
      lineHeight: '1.2',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    modalText: {
      whiteSpace: 'pre-wrap',
      color: colors.textSecondary,
      fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
      lineHeight: 1.7,
      fontWeight: 400,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    closeButton: {
      marginTop: isMobile ? '1.5rem' : '2rem',
      padding: isMobile ? '0.875rem 1.75rem' : '1rem 2rem',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      boxShadow: `0 10px 25px ${colors.cardShadow}`,
      transition: 'all 0.3s ease',
      display: 'block',
      margin: `${isMobile ? '1.5rem' : '2rem'} auto 0`,
      width: isMobile ? '100%' : 'auto',
      maxWidth: isMobile ? '100%' : 'none',
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: 30
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <section style={styles.section}>
      <motion.div 
        style={styles.container}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div style={styles.leftContent}>
          <motion.div
            variants={itemVariants}
            style={styles.sectionLabel}
          >
            Leadership
          </motion.div>
          
          <motion.h1
            style={styles.title}
            variants={itemVariants}
          >
            A message from our{' '}
            <span style={styles.titleAccent}>
              Founder
            </span>
          </motion.h1>
          
          <motion.p
            style={styles.subtitle}
            variants={itemVariants}
          >
            Discover the vision and commitment driving ACEF's mission to create 
            sustainable solutions for climate challenges across Africa, fostering 
            community resilience and environmental harmony.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <motion.button
              style={styles.primaryButton}
              onClick={handleLetterClick}
              whileHover={{ 
                transform: 'translateY(-1px)',
                boxShadow: `0 12px 30px ${colors.cardShadow}`,
                backgroundColor: colors.primaryLight,
              }}
              whileTap={{ 
                transform: 'translateY(0)',
              }}
            >
              Read Founder's Message
            </motion.button>
          </motion.div>
        </div>
        
        <div style={styles.rightContent}>
          <motion.div
            style={styles.imageContainer}
            variants={imageVariants}
          >
            <img
              src={getImageSource()}
              alt={founder?.name || 'ACEF Founder'}
              style={styles.founderImage}
            />
            
            <motion.div 
              style={styles.imageOverlay}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 style={styles.overlayName}>
                {founder?.name || 'Founder'}
              </h3>
              <p style={styles.overlayPosition}>
                {founder?.position || 'Founder & CEO'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLetter && (
          <motion.div 
            style={styles.modal} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowLetter(false)}
          >
            <motion.div 
              style={styles.modalContent} 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={styles.modalHeader}>
                A Message from Our Founder
              </h2>
              
              <pre style={styles.modalText}>
                {letterContent}
              </pre>

              <motion.button
                style={styles.closeButton}
                onClick={() => setShowLetter(false)}
                whileHover={{ 
                  transform: 'translateY(-1px)',
                  boxShadow: `0 12px 30px ${colors.cardShadow}`,
                  backgroundColor: colors.primaryLight,
                }}
                whileTap={{ 
                  transform: 'translateY(0)',
                }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FounderSection;