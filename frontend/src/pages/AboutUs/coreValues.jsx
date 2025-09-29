import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL } from '../../config';

const CoreValues = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [coreValuesData, setCoreValuesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { colors, isDarkMode } = useTheme();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Default/fallback core values (your original data)
  const defaultValues = [
    {
      title: "We are youth-centered.",
      description: "Centering young people as agents of change.",
      backgroundColor: colors.accentLight,
      textColor: colors.primaryDark
    },
    {
      title: "We are innovative.",
      description: "Fostering creative and context-specific solutions",
      backgroundColor: colors.secondaryLight,
      textColor: colors.primaryDark
    },
    {
      title: "We are collaborative.",
      description: "Building strong partnerships with diverse stakeholders",
      backgroundColor: colors.accent,
      textColor: colors.primaryDark
    },
    {
      title: "We are impact-driven.",
      description: "Driving measurable and sustainable positive change.",
      backgroundColor: colors.primaryLight,
      textColor: colors.white
    },
    {
      title: "We are transparent.",
      description: "Operating with transparency, accountability, and ethical principles.",
      backgroundColor: colors.accentDark,
      textColor: colors.white
    },
    {
      title: "We are inclusive.",
      description: "Ensuring equitable participation and benefits for all, especially marginalized groups.",
      backgroundColor: colors.secondaryDark,
      textColor: colors.primaryDark
    }
  ];

  // Fetch core values from API
  useEffect(() => {
    fetchCoreValues();
  }, []);

  const fetchCoreValues = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/core-values`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('Core values loaded from API:', result.data);
        setCoreValuesData(result.data);
      } else {
        console.log('No API data found, using default values');
        setCoreValuesData([]);
      }
    } catch (error) {
      console.error('Error fetching core values:', error);
      setError(error.message);
      setCoreValuesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Process values with styling - combines API data with design colors
  const getProcessedValues = () => {
    // If we have API data, use it; otherwise use defaults
    const sourceData = coreValuesData.length > 0 ? coreValuesData : defaultValues;
    
    // Color schemes to cycle through (your original color scheme)
    const colorSchemes = [
      { backgroundColor: colors.accentLight, textColor: colors.primaryDark },
      { backgroundColor: colors.secondaryLight, textColor: colors.primaryDark },
      { backgroundColor: colors.accent, textColor: colors.primaryDark },
      { backgroundColor: colors.primaryLight, textColor: colors.white },
      { backgroundColor: colors.accentDark, textColor: colors.white },
      { backgroundColor: colors.secondaryDark, textColor: colors.primaryDark },
      { backgroundColor: colors.primary, textColor: colors.white },
      { backgroundColor: colors.secondary, textColor: colors.primaryDark },
      { backgroundColor: colors.primaryDark, textColor: colors.white },
      { backgroundColor: colors.secondaryDark, textColor: colors.white }
    ];

    return sourceData.map((value, index) => {
      const colorScheme = colorSchemes[index % colorSchemes.length];
      
      // For API data, structure it properly
      if (coreValuesData.length > 0) {
        return {
          title: value.title,
          subtitle: value.description, // API uses 'description', component uses 'subtitle'
          backgroundColor: colorScheme.backgroundColor,
          textColor: colorScheme.textColor
        };
      }
      
      // For default data, use as-is (already has correct structure)
      return {
        ...value,
        subtitle: value.description, // Ensure consistency
        backgroundColor: colorScheme.backgroundColor,
        textColor: colorScheme.textColor
      };
    });
  };

  const values = getProcessedValues();

  const containerStyle = {
    backgroundColor: colors.background,
    padding: isMobile ? '24px 16px' : '32px 48px',
    fontFamily: '"Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
  };

  const wrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '0 8px' : '0 24px'
  };

  const headerStyle = {
    marginBottom: isMobile ? '24px' : '32px',
    textAlign: isMobile ? 'center' : 'left'
  };

  const titleStyle = {
    fontSize: isMobile ? 'clamp(1.5rem, 6vw, 2rem)' : 'clamp(2rem, 4vw, 2.5rem)',
    fontWeight: 300,
    marginBottom: '8px',
    color: colors.text,
    lineHeight: 1.2,
    padding: isMobile ? '0 8px' : '0'
  };

  const getCardStyle = (index, backgroundColor) => {
    const baseStyle = {
      position: 'relative',
      overflow: 'hidden',
      cursor: isMobile ? 'default' : 'pointer',
      transition: 'transform 0.3s ease',
      backgroundColor,
      borderRadius: '0px',
      transform: (!isMobile && hoveredIndex === index) ? 'scale(1.05)' : 'scale(1)',
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? '140px' : '200px',
      minHeight: isMobile ? '140px' : '200px',
      // Add touch-friendly spacing on mobile
      marginBottom: isMobile ? '8px' : '0'
    };

    return baseStyle;
  };

  const cardContentStyle = {
    padding: isMobile ? '12px 14px' : '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 10,
    textAlign: 'left'
  };

  const cardTitleStyle = (textColor) => ({
    fontSize: isMobile ? '0.85rem' : '1rem',
    fontWeight: 600,
    marginBottom: isMobile ? '6px' : '8px',
    color: textColor,
    lineHeight: 1.2
  });

  const cardSubtitleStyle = (textColor) => ({
    fontSize: isMobile ? '0.7rem' : '0.75rem',
    fontWeight: 400,
    color: textColor,
    opacity: 0.85,
    lineHeight: 1.3
  });

  const bottomSectionStyle = {
    marginTop: isMobile ? '24px' : '32px',
    maxWidth: '768px',
    padding: isMobile ? '0 8px' : '0'
  };

  const descriptionStyle = {
    fontSize: isMobile ? '0.9rem' : '1rem',
    lineHeight: 1.6,
    color: colors.text,
    textAlign: isMobile ? 'center' : 'left'
  };

  const getGridStyle = () => {
    if (isMobile) {
      // Mobile: Always 2 columns for better readability
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '24px',
        gridAutoRows: '140px'
      };
    } else if (window.innerWidth >= 1024) {
      // Desktop: Single row layout
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${values.length}, 1fr)`,
        gap: '16px',
        marginBottom: '32px',
        height: '200px'
      };
    } else {
      // Tablet: 2-3 per row depending on number of values
      const columns = values.length > 4 ? 3 : 2;
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '12px',
        marginBottom: '32px',
        gridAutoRows: '180px'
      };
    }
  };

  // Simplified decorative shapes for mobile (smaller and less prominent)
  const getDecorativeShape = (index) => {
    if (isMobile) {
      // Smaller, more subtle shapes for mobile
      const mobileShapes = [
        // Small Circle
        <div key={`shape-${index}`} style={{
          position: 'absolute',
          top: '20%',
          right: '-15px',
          width: '35px',
          height: '35px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
          zIndex: 5
        }} />,
        // Small Triangle
        <div key={`shape-${index}`} style={{
          position: 'absolute',
          bottom: '15%',
          left: '-12px',
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          zIndex: 5
        }} />,
        // Small Diamond
        <div key={`shape-${index}`} style={{
          position: 'absolute',
          top: '25%',
          right: '-10px',
          width: '25px',
          height: '25px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transform: 'rotate(45deg)',
          zIndex: 5
        }} />
      ];
      
      return mobileShapes[index % 3];
    }

    // Desktop shapes (your original complex shapes)
    const desktopShapes = [
      // Large Circle - Warm Beige
      <div key={`shape-${index}`} style={{
        position: 'absolute',
        top: '40%',
        right: '-30px',
        width: '80px',
        height: '80px',
        backgroundColor: 'rgba(245, 222, 179, 0.35)',
        borderRadius: '50%',
        zIndex: 5
      }} />,
      // Large Triangle - Sandy Nude
      <div key={`shape-${index}`} style={{
        position: 'absolute',
        bottom: '20%',
        left: '-25px',
        width: '70px',
        height: '70px',
        backgroundColor: 'rgba(222, 184, 135, 0.3)',
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        zIndex: 5
      }} />,
      // Large Hexagon - Peachy Nude
      <div key={`shape-${index}`} style={{
        position: 'absolute',
        top: '25%',
        right: '-20px',
        width: '60px',
        height: '60px',
        backgroundColor: 'rgba(238, 203, 173, 0.4)',
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
        zIndex: 5
      }} />,
      // Large Diamond - Rose Nude
      <div key={`shape-${index}`} style={{
        position: 'absolute',
        bottom: '30%',
        left: '-25px',
        width: '75px',
        height: '75px',
        backgroundColor: 'rgba(218, 165, 140, 0.32)',
        transform: 'rotate(45deg)',
        zIndex: 5
      }} />,
      // Large Oval - Champagne Nude
      <div key={`shape-${index}`} style={{
        position: 'absolute',
        top: '35%',
        right: '-35px',
        width: '90px',
        height: '50px',
        backgroundColor: 'rgba(247, 230, 206, 0.38)',
        borderRadius: '50%',
        transform: 'rotate(-15deg)',
        zIndex: 5
      }} />,
      // Large Pentagon - Blush Nude
      <div key={`shape-${index}`} style={{
        position: 'absolute',
        bottom: '25%',
        left: '-30px',
        width: '65px',
        height: '65px',
        backgroundColor: 'rgba(230, 190, 165, 0.33)',
        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
        zIndex: 5
      }} />
    ];

    return desktopShapes[index % 6] || 
      // For additional cards beyond 6 - Large Star
      <div key={`shape-${index}`} style={{
        position: 'absolute',
        top: '30%',
        right: '-25px',
        width: '70px',
        height: '70px',
        backgroundColor: 'rgba(240, 220, 190, 0.35)',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        zIndex: 5
      }} />;
  };

  // Animation variants - reduced motion on mobile
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1,
        delayChildren: isMobile ? 0.1 : 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 15 : 30,
      scale: isMobile ? 0.98 : 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.3 : 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: isMobile ? 15 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.4 : 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: isMobile ? 15 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.3 : 0.6,
        delay: isMobile ? 0.2 : 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 0' : '60px 0' }}>
            <div style={{
              width: isMobile ? '30px' : '40px',
              height: isMobile ? '30px' : '40px',
              border: `3px solid ${colors.primary}`,
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <p style={{ 
              color: colors.textSecondary, 
              fontSize: isMobile ? '14px' : '16px', 
              margin: 0 
            }}>
              Loading Core Values...
            </p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        
        {/* Header Section */}
        <div style={headerStyle}>
          <motion.h1 
            style={titleStyle}
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-100px' }}
          >
            We are transformative because...
          </motion.h1>
        </div>

        {/* Values Grid - Responsive Layout */}
        <motion.div 
          style={getGridStyle()}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-50px' }}
        >
          {values.map((value, index) => (
            <motion.div 
              key={coreValuesData.length > 0 ? `api-${index}` : `default-${index}`}
              style={getCardStyle(index, value.backgroundColor)}
              variants={cardVariants}
              whileHover={!isMobile ? { 
                scale: 1.05,
                transition: { duration: 0.2 }
              } : {}}
              onMouseEnter={() => !isMobile && setHoveredIndex(index)}
              onMouseLeave={() => !isMobile && setHoveredIndex(null)}
            >
              {/* Decorative Element - Responsive */}
              {getDecorativeShape(index)}
              
              <div style={cardContentStyle}>
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: isMobile ? 0.3 : 0.5, 
                    delay: index * (isMobile ? 0.05 : 0.1) + (isMobile ? 0.1 : 0.6) 
                  }}
                  viewport={{ once: false }}
                >
                  <h2 style={cardTitleStyle(value.textColor)}>
                    {value.title}
                  </h2>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: isMobile ? 0.3 : 0.5, 
                    delay: index * (isMobile ? 0.05 : 0.1) + (isMobile ? 0.15 : 0.8) 
                  }}
                  viewport={{ once: false }}
                >
                  <p style={cardSubtitleStyle(value.textColor)}>
                    {value.subtitle}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <div style={bottomSectionStyle}>
          <motion.p 
            style={descriptionStyle}
            variants={descriptionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-100px' }}
          >
            Our core values guide every decision we make, every partnership we build, and every initiative we launch. 
            They represent our commitment to creating meaningful change through youth empowerment, innovation, and collaborative action.
            {coreValuesData.length > 0 && !isMobile && (
              <span style={{ fontSize: '0.9rem', opacity: 0.7, marginLeft: '8px' }}>
                ({coreValuesData.length} values loaded from management system)
              </span>
            )}
          </motion.p>
        </div>

      </div>
    </div>
  );
};

export default CoreValues;