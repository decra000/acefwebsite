import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL } from '../../config';

const CoreValues = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [coreValuesData, setCoreValuesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { colors, isDarkMode } = useTheme();

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
        backgroundColor: colorScheme.backgroundColor,
        textColor: colorScheme.textColor
      };
    });
  };

  const values = getProcessedValues();

  const containerStyle = {
    backgroundColor: colors.background,
    padding: '32px 48px',
    fontFamily: '"Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
  };

  const wrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const headerStyle = {
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    fontWeight: 300,
    marginBottom: '8px',
    color: colors.text,
    lineHeight: 1.2
  };

  const getCardStyle = (index, backgroundColor) => {
    const baseStyle = {
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      backgroundColor,
      borderRadius: '0px', // Removed border radius
      transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
      display: 'flex',
      flexDirection: 'column',
      height: '200px', // Fixed smaller height for all cards
      minHeight: '200px'
    };

    return baseStyle;
  };

  const cardContentStyle = {
    padding: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Changed to space-between for top/bottom positioning
    position: 'relative',
    zIndex: 10,
    textAlign: 'left' // Changed to left alignment
  };

  const cardTitleStyle = (textColor) => ({
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: textColor,
    lineHeight: 1.2
  });

  const cardSubtitleStyle = (textColor) => ({
    fontSize: '0.75rem',
    fontWeight: 400,
    color: textColor,
    opacity: 0.85,
    lineHeight: 1.3
  });

  const bottomSectionStyle = {
    marginTop: '32px',
    maxWidth: '768px'
  };

  const descriptionStyle = {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: colors.text
  };

  const getGridStyle = () => {
    if (window.innerWidth >= 1024) {
      // Desktop: Single row layout
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${values.length}, 1fr)`,
        gap: '16px',
        marginBottom: '32px',
        height: '200px' // Fixed height for single row
      };
    } else if (window.innerWidth >= 768) {
      // Tablet: 2-3 per row depending on number of values
      const columns = values.length > 4 ? 3 : 2;
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '12px',
        marginBottom: '32px',
        gridAutoRows: '180px'
      };
    } else {
      // Mobile: 1-2 per row
      const columns = values.length > 6 ? 1 : 2;
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '10px',
        marginBottom: '32px',
        gridAutoRows: '160px'
      };
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.primary}`,
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto'
            }} />
            <p style={{ color: colors.textSecondary, fontSize: '16px', margin: 0 }}>
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

        {/* Values Grid - Single Row Layout */}
        <motion.div 
          style={getGridStyle()}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-100px' }}
        >
          
          {values.map((value, index) => (
            <motion.div 
              key={coreValuesData.length > 0 ? `api-${index}` : `default-${index}`}
              style={getCardStyle(index, value.backgroundColor)}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Unique Breaking Element per Card */}
              {index % 6 === 0 && (
                // Large Circle - Warm Beige
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  right: '-30px',
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(245, 222, 179, 0.35)',
                  borderRadius: '50%',
                  zIndex: 5
                }} />
              )}
              
              {index % 6 === 1 && (
                // Large Triangle - Sandy Nude
                <div style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '-25px',
                  width: '70px',
                  height: '70px',
                  backgroundColor: 'rgba(222, 184, 135, 0.3)',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  zIndex: 5
                }} />
              )}
              
              {index % 6 === 2 && (
                // Large Hexagon - Peachy Nude
                <div style={{
                  position: 'absolute',
                  top: '25%',
                  right: '-20px',
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(238, 203, 173, 0.4)',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                  zIndex: 5
                }} />
              )}
              
              {index % 6 === 3 && (
                // Large Diamond - Rose Nude
                <div style={{
                  position: 'absolute',
                  bottom: '30%',
                  left: '-25px',
                  width: '75px',
                  height: '75px',
                  backgroundColor: 'rgba(218, 165, 140, 0.32)',
                  transform: 'rotate(45deg)',
                  zIndex: 5
                }} />
              )}
              
              {index % 6 === 4 && (
                // Large Oval - Champagne Nude
                <div style={{
                  position: 'absolute',
                  top: '35%',
                  right: '-35px',
                  width: '90px',
                  height: '50px',
                  backgroundColor: 'rgba(247, 230, 206, 0.38)',
                  borderRadius: '50%',
                  transform: 'rotate(-15deg)',
                  zIndex: 5
                }} />
              )}
              
              {index % 6 === 5 && (
                // Large Pentagon - Blush Nude
                <div style={{
                  position: 'absolute',
                  bottom: '25%',
                  left: '-30px',
                  width: '65px',
                  height: '65px',
                  backgroundColor: 'rgba(230, 190, 165, 0.33)',
                  clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                  zIndex: 5
                }} />
              )}
              
              {index % 6 > 5 && (
                // For additional cards beyond 6 - Large Star
                <div style={{
                  position: 'absolute',
                  top: '30%',
                  right: '-25px',
                  width: '70px',
                  height: '70px',
                  backgroundColor: 'rgba(240, 220, 190, 0.35)',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  zIndex: 5
                }} />
              )}
              
              <div style={cardContentStyle}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                  viewport={{ once: false }}
                >
                  <h2 style={cardTitleStyle(value.textColor)}>
                    {value.title}
                  </h2>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
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
            {coreValuesData.length > 0 && (
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