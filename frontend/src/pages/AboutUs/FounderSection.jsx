import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const FounderSection = () => {
  const [members, setMembers] = useState([]);
  const [showLetter, setShowLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${API_URL}/team`, { withCredentials: true });
        const data = response.data;
        const teamArray = Array.isArray(data) ? data : data.data || data.members || [];
        setMembers(teamArray);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchMembers();
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

  const styles = {
    section: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      background: isDarkMode ? colors.background : colors.white,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '0',
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: isDarkMode ? 0.03 : 0.02,
      background: `
        radial-gradient(circle at 25% 25%, ${colors.primary} 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, ${colors.accent} 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      backgroundPosition: '0 0, 30px 30px',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '120px 24px',
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '80px',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
    },
    leftContent: {
      maxWidth: '600px',
    },
    rightContent: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    sectionLabel: {
      display: 'inline-block',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors.primary,
      backgroundColor: isDarkMode ? `${colors.primary}15` : `${colors.primary}08`,
      padding: '8px 16px',
      borderRadius: '20px',
      marginBottom: '32px',
      border: `1px solid ${isDarkMode ? colors.primary + '25' : colors.primary + '15'}`,
    },
    title: {
      fontSize: 'clamp(36px, 5vw, 56px)',
      fontWeight: 800,
      color: isDarkMode ? colors.text : colors.primary,
      lineHeight: '1.1',
      marginBottom: '24px',
      letterSpacing: '-0.02em',
      fontFamily: '"Nunito Sans", sans-serif',
    },
    titleAccent: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      position: 'relative',
    },
    subtitle: {
      fontSize: '16px',
      color: isDarkMode ? colors.textSecondary : colors.gray600,
      lineHeight: '1.7',
      marginBottom: '48px',
      fontWeight: 400,
      maxWidth: '520px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    primaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '14px 28px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: '"Nunito Sans", sans-serif',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textDecoration: 'none',
      letterSpacing: '0.01em',
      boxShadow: `0 4px 20px ${colors.primary}25`,
      position: 'relative',
      overflow: 'hidden',
    },
    secondaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '14px 28px',
      backgroundColor: 'transparent',
      color: isDarkMode ? colors.text : colors.primary,
      border: `1.5px solid ${isDarkMode ? colors.border : colors.primary + '25'}`,
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: '"Nunito Sans", sans-serif',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textDecoration: 'none',
      letterSpacing: '0.01em',
      position: 'relative',
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      background: isDarkMode 
        ? `linear-gradient(145deg, ${colors.surface}, ${colors.surfaceSecondary})`
        : `linear-gradient(145deg, ${colors.white}, ${colors.gray50})`,
      padding: '4px',
      boxShadow: isDarkMode 
        ? `0 20px 60px ${colors.black}40, 0 8px 25px ${colors.black}20`
        : `0 20px 60px ${colors.primary}15, 0 8px 25px ${colors.primary}08`,
    },
    founderImage: {
      width: '400px',
      height: '480px',
      objectFit: 'cover',
      borderRadius: '20px',
      position: 'relative',
      filter: 'contrast(1.05) brightness(1.02)',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      right: '16px',
      background: isDarkMode 
        ? 'rgba(0, 0, 0, 0.7)'
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '16px 20px',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
    },
    overlayName: {
      margin: '0 0 4px 0',
      fontSize: '16px',
      fontWeight: 700,
      color: isDarkMode ? colors.text : colors.primary,
      lineHeight: '1.2',
    },
    overlayPosition: {
      margin: 0,
      fontSize: '13px',
      color: isDarkMode ? colors.textSecondary : colors.gray600,
      fontWeight: 500,
      lineHeight: '1.2',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      backdropFilter: 'blur(20px)',
      padding: '40px',
      borderRadius: '20px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto',
      fontFamily: '"Nunito Sans", sans-serif',
      lineHeight: '1.7',
      color: isDarkMode ? colors.text : colors.primary,
      boxShadow: isDarkMode 
        ? `0 40px 120px ${colors.black}60, 0 20px 60px ${colors.black}40`
        : `0 40px 120px ${colors.primary}20, 0 20px 60px ${colors.primary}15`,
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
      position: 'relative',
    },
    modalHeader: {
      marginTop: 0,
      marginBottom: '32px',
      fontWeight: 800,
      color: isDarkMode ? colors.text : colors.primary,
      fontSize: '28px',
      letterSpacing: '-0.01em',
      textAlign: 'center',
      lineHeight: '1.2',
    },
    modalText: {
      whiteSpace: 'pre-wrap',
      color: isDarkMode ? colors.textSecondary : colors.gray700,
      fontSize: '15px',
      lineHeight: '1.7',
      fontWeight: 400,
    },
    closeButton: {
      marginTop: '32px',
      padding: '12px 24px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '10px',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: '"Nunito Sans", sans-serif',
      fontSize: '14px',
      boxShadow: `0 4px 20px ${colors.primary}25`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'block',
      margin: '32px auto 0',
    },
    // Responsive breakpoints
    '@media (max-width: 1024px)': {
      container: {
        gridTemplateColumns: '1fr',
        gap: '60px',
        textAlign: 'center',
        padding: '100px 24px',
      },
      founderImage: {
        width: '350px',
        height: '420px',
      },
    },
    '@media (max-width: 768px)': {
      container: {
        padding: '80px 20px',
        gap: '48px',
      },
      founderImage: {
        width: '300px',
        height: '360px',
      },
      buttonContainer: {
        justifyContent: 'center',
      },
      modalContent: {
        padding: '32px 24px',
        borderRadius: '16px',
      },
      modalHeader: {
        fontSize: '24px',
      },
      modalText: {
        fontSize: '14px',
      },
    },
    '@media (max-width: 480px)': {
      buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      },
      primaryButton: {
        width: '100%',
        maxWidth: '280px',
      },
      secondaryButton: {
        width: '100%',
        maxWidth: '280px',
      },
    },
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      filter: 'blur(8px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      filter: 'blur(10px)'
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.0,
        delay: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: 40,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -40,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.backgroundPattern} />
      
      <motion.div 
        style={styles.container}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
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
          
          <motion.div
            style={styles.buttonContainer}
            variants={itemVariants}
          >
            <motion.button
              style={styles.primaryButton}
              onClick={handleLetterClick}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: colors.primaryDark,
                boxShadow: `0 6px 25px ${colors.primary}35`,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
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
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.4 }
            }}
          >
            <motion.img
              src={founder?.image_url ? `${STATIC_URL}${founder.image_url}` : 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
              alt={founder?.name || 'ACEF Founder'}
              style={styles.founderImage}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            />
            
            <div style={styles.imageOverlay}>
              <h3 style={styles.overlayName}>
                {founder?.name || 'Founder'}
              </h3>
              <p style={styles.overlayPosition}>
                {founder?.position || 'Founder & CEO'}
              </p>
            </div>
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
            transition={{ duration: 0.3 }}
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
                  scale: 1.02,
                  backgroundColor: colors.primaryDark,
                  boxShadow: `0 6px 25px ${colors.primary}35`,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
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