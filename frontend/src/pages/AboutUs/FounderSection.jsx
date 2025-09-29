import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  // Responsive breakpoints
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;
  const isXSmallMobile = windowWidth <= 360;
  const isTablet = windowWidth <= 1024;

  // Dynamic styles based on screen size
  const getResponsiveImageSize = () => {
    if (isXSmallMobile) return { width: '240px', height: '300px' };
    if (isSmallMobile) return { width: '280px', height: '340px' };
    if (isMobile) return { width: '320px', height: '380px' };
    if (isTablet) return { width: '350px', height: '420px' };
    return { width: '400px', height: '480px' };
  };

  const getResponsivePadding = () => {
    if (isXSmallMobile) return '50px 12px';
    if (isSmallMobile) return '60px 16px';
    if (isMobile) return '80px 20px';
    if (isTablet) return '100px 24px';
    return '120px 24px';
  };

  const getResponsiveFontSize = (base, mobile, small) => {
    if (isSmallMobile) return small || mobile;
    if (isMobile) return mobile;
    return base;
  };

  const getResponsiveGap = () => {
    if (isXSmallMobile) return '32px';
    if (isSmallMobile) return '36px';
    if (isMobile) return '48px';
    if (isTablet) return '60px';
    return '80px';
  };

  const imageSize = getResponsiveImageSize();

  const styles = {
    section: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      background: isDarkMode ? colors.background : colors.white,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '0',
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: isDarkMode ? (isMobile ? 0.02 : 0.03) : (isMobile ? 0.015 : 0.02),
      background: `
        radial-gradient(circle at 25% 25%, ${colors.primary} 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, ${colors.accent} 1px, transparent 1px)
      `,
      backgroundSize: isMobile ? '40px 40px' : '60px 60px',
      backgroundPosition: isMobile ? '0 0, 20px 20px' : '0 0, 30px 30px',
    },
    container: {
      maxWidth: isTablet ? '100%' : '1200px',
      margin: '0 auto',
      padding: getResponsivePadding(),
      display: 'grid',
      gridTemplateColumns: isTablet ? '1fr' : '1fr 400px',
      gap: getResponsiveGap(),
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
      textAlign: isTablet ? 'center' : 'left',
      width: '100%',
      boxSizing: 'border-box',
    },
    leftContent: {
      maxWidth: isTablet ? '100%' : '600px',
      margin: isTablet ? '0 auto' : '0',
      width: '100%',
    },
    rightContent: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
    },
    sectionLabel: {
      display: 'inline-block',
      fontSize: getResponsiveFontSize('12px', '11px', '10px'),
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors.primary,
      backgroundColor: isDarkMode ? `${colors.primary}15` : `${colors.primary}08`,
      padding: isSmallMobile ? '5px 12px' : isXSmallMobile ? '5px 10px' : '8px 16px',
      borderRadius: isSmallMobile ? '16px' : '20px',
      marginBottom: isSmallMobile ? '20px' : isMobile ? '24px' : '32px',
      border: `1px solid ${isDarkMode ? colors.primary + '25' : colors.primary + '15'}`,
    },
    title: {
      fontSize: isXSmallMobile ? '20px' : isSmallMobile ? '22px' : isMobile ? '28px' : isTablet ? '36px' : '56px',
      fontWeight: 800,
      color: isDarkMode ? colors.text : colors.primary,
      lineHeight: '1.1',
      marginBottom: isSmallMobile ? '16px' : isMobile ? '18px' : '24px',
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
      fontSize: getResponsiveFontSize('16px', '14px', '13px'),
      color: isDarkMode ? colors.textSecondary : colors.gray600,
      lineHeight: isMobile ? '1.6' : '1.7',
      marginBottom: isSmallMobile ? '28px' : isMobile ? '32px' : isTablet ? '40px' : '48px',
      fontWeight: 400,
      maxWidth: isTablet ? '100%' : '520px',
      margin: isTablet ? `0 auto ${isSmallMobile ? '28px' : isMobile ? '32px' : '40px'} auto` : `0 0 ${isSmallMobile ? '28px' : isMobile ? '32px' : '48px'} 0`,
      paddingX: isSmallMobile ? '8px' : '0',
    },
    buttonContainer: {
      display: 'flex',
      gap: isSmallMobile ? '10px' : isMobile ? '12px' : isTablet ? '14px' : '16px',
      alignItems: isSmallMobile ? 'center' : 'flex-start',
      flexWrap: 'wrap',
      justifyContent: isTablet ? 'center' : 'flex-start',
      flexDirection: isSmallMobile ? 'column' : 'row',
      width: '100%',
    },
    primaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isSmallMobile ? '11px 22px' : isMobile ? '12px 24px' : '14px 28px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: isSmallMobile ? '10px' : '12px',
      fontSize: getResponsiveFontSize('14px', '13px', '12px'),
      fontWeight: 600,
      fontFamily: '"Nunito Sans", sans-serif',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textDecoration: 'none',
      letterSpacing: '0.01em',
      boxShadow: `0 4px 20px ${colors.primary}25`,
      position: 'relative',
      overflow: 'hidden',
      width: isSmallMobile ? '100%' : 'auto',
      maxWidth: isSmallMobile ? '300px' : 'none',
      minHeight: isSmallMobile ? '44px' : isMobile ? '48px' : 'auto',
    },
    imageContainer: {
      position: 'relative',
      borderRadius: isSmallMobile ? '16px' : isMobile ? '18px' : isTablet ? '20px' : '24px',
      overflow: 'hidden',
      background: isDarkMode 
        ? `linear-gradient(145deg, ${colors.surface}, ${colors.surfaceSecondary})`
        : `linear-gradient(145deg, ${colors.white}, ${colors.gray50})`,
      padding: isSmallMobile ? '2px' : isMobile ? '3px' : '4px',
      boxShadow: isDarkMode 
        ? (isMobile 
          ? `0 10px 30px ${colors.black}25, 0 4px 12px ${colors.black}10`
          : `0 20px 60px ${colors.black}40, 0 8px 25px ${colors.black}20`)
        : (isMobile 
          ? `0 10px 30px ${colors.primary}08, 0 4px 12px ${colors.primary}04`
          : `0 20px 60px ${colors.primary}15, 0 8px 25px ${colors.primary}08`),
      maxWidth: '100%',
      margin: '0 auto',
    },
    founderImage: {
      width: imageSize.width,
      height: imageSize.height,
      maxWidth: '100%',
      objectFit: 'cover',
      borderRadius: isXSmallMobile ? '12px' : isSmallMobile ? '14px' : isMobile ? '16px' : isTablet ? '18px' : '20px',
      position: 'relative',
      filter: 'contrast(1.05) brightness(1.02)',
      display: 'block',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: isXSmallMobile ? '8px' : isSmallMobile ? '10px' : isMobile ? '12px' : '16px',
      left: isXSmallMobile ? '8px' : isSmallMobile ? '10px' : isMobile ? '12px' : '16px',
      right: isXSmallMobile ? '8px' : isSmallMobile ? '10px' : isMobile ? '12px' : '16px',
      background: isDarkMode 
        ? 'rgba(0, 0, 0, 0.7)'
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: isMobile ? 'blur(10px)' : 'blur(12px)',
      borderRadius: isXSmallMobile ? '6px' : isSmallMobile ? '8px' : isMobile ? '10px' : '12px',
      padding: isXSmallMobile ? '10px 14px' : isSmallMobile ? '12px 16px' : isMobile ? '14px 18px' : '16px 20px',
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
    },
    overlayName: {
      margin: isXSmallMobile ? '0 0 2px 0' : isSmallMobile ? '0 0 3px 0' : '0 0 4px 0',
      fontSize: getResponsiveFontSize('16px', '14px', '13px'),
      fontWeight: 700,
      color: isDarkMode ? colors.text : colors.primary,
      lineHeight: '1.2',
    },
    overlayPosition: {
      margin: 0,
      fontSize: getResponsiveFontSize('13px', '12px', '11px'),
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
      backdropFilter: isMobile ? 'blur(15px)' : 'blur(20px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: isSmallMobile ? 'flex-start' : 'center',
      zIndex: 1000,
      padding: isXSmallMobile ? '8px' : isSmallMobile ? '12px' : isMobile ? '16px' : '20px',
      paddingTop: isSmallMobile ? '20px' : isMobile ? '20px' : '20px',
      overflowY: isSmallMobile ? 'auto' : 'visible',
    },
    modalContent: {
      backgroundColor: isDarkMode ? colors.surface : colors.white,
      backdropFilter: 'blur(20px)',
      padding: isXSmallMobile ? '24px 16px' : isSmallMobile ? '28px 20px' : isMobile ? '32px 24px' : '40px',
      borderRadius: isXSmallMobile ? '12px' : isSmallMobile ? '14px' : isMobile ? '16px' : '20px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: isSmallMobile ? '92vh' : isMobile ? '90vh' : '80vh',
      overflowY: 'auto',
      fontFamily: '"Nunito Sans", sans-serif',
      lineHeight: '1.7',
      color: isDarkMode ? colors.text : colors.primary,
      boxShadow: isDarkMode 
        ? (isMobile 
          ? `0 20px 60px ${colors.black}40, 0 12px 30px ${colors.black}25`
          : `0 40px 120px ${colors.black}60, 0 20px 60px ${colors.black}40`)
        : (isMobile 
          ? `0 20px 60px ${colors.primary}12, 0 12px 30px ${colors.primary}10`
          : `0 40px 120px ${colors.primary}20, 0 20px 60px ${colors.primary}15`),
      border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
      position: 'relative',
      margin: '0',
    },
    modalHeader: {
      marginTop: 0,
      marginBottom: isXSmallMobile ? '20px' : isSmallMobile ? '24px' : isMobile ? '28px' : '32px',
      fontWeight: 800,
      color: isDarkMode ? colors.text : colors.primary,
      fontSize: isXSmallMobile ? '20px' : isSmallMobile ? '22px' : isMobile ? '24px' : '28px',
      letterSpacing: '-0.01em',
      textAlign: 'center',
      lineHeight: isMobile ? '1.25' : '1.2',
    },
    modalText: {
      whiteSpace: 'pre-wrap',
      color: isDarkMode ? colors.textSecondary : colors.gray700,
      fontSize: getResponsiveFontSize('15px', '13px', '12px'),
      lineHeight: isXSmallMobile ? '1.55' : isSmallMobile ? '1.6' : isMobile ? '1.65' : '1.7',
      fontWeight: 400,
    },
    closeButton: {
      marginTop: isXSmallMobile ? '20px' : isSmallMobile ? '24px' : isMobile ? '28px' : '32px',
      padding: isXSmallMobile ? '10px 20px' : isSmallMobile ? '12px 24px' : isMobile ? '11px 22px' : '12px 24px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: isMobile ? '8px' : '10px',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: '"Nunito Sans", sans-serif',
      fontSize: getResponsiveFontSize('14px', '13px', '12px'),
      boxShadow: `0 4px 20px ${colors.primary}25`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'block',
      margin: `${isXSmallMobile ? '20px' : isSmallMobile ? '24px' : isMobile ? '28px' : '32px'} auto 0`,
      width: isSmallMobile ? '100%' : 'auto',
      maxWidth: isSmallMobile ? '200px' : 'none',
      minHeight: isXSmallMobile ? '40px' : isSmallMobile ? '44px' : 'auto',
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

  // Get image source with fallback to tambe.jpg
  const getImageSource = () => {
    if (founder?.image_url) {
      return `${STATIC_URL}${founder.image_url}`;
    }
    return '/tambe.jpg'; // Default fallback image
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
              src={getImageSource()}
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