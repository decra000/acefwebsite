import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';

const CoreValues = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { colors, isDarkMode } = useTheme();

  const values = [
    {
      title: "We are youth-centered.",
      subtitle: "Centering young people as agents of change.",
      backgroundColor: colors.accentLight,
      textColor: colors.primaryDark
    },
    {
      title: "We are innovative.",
      subtitle: " Fostering creative and context-specific solutions",
      backgroundColor: colors.secondaryLight,
      textColor: colors.primaryDark
    },
    {
      title: "We are collaborative.",
      subtitle: "Building strong partnerships with diverse stakeholders",
      backgroundColor: colors.accent,
      textColor: colors.primaryDark
    },
    {
      title: "We are impact-driven.",
      subtitle: "Driving measurable and sustainable positive change.",
      backgroundColor: colors.primaryLight,
      textColor: colors.white
    },
    {
      title: "We are transparent.",
      subtitle: "Operating with transparency, accountability, and ethical principles.",
      backgroundColor: colors.accentDark,
      textColor: colors.white
    },
    {
      title: "We are inclusive.",
      subtitle: "Ensuring equitable participation and benefits for all, especially marginalized groups.",
      backgroundColor: colors.secondaryDark,
      textColor: colors.primaryDark
    }
  ];

  const containerStyle = {
    backgroundColor: colors.background,
    padding: '32px 48px', // Increased left/right margins from 16px to 48px
    fontFamily: '"Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
  };

  const wrapperStyle = {
    maxWidth: '1200px', // Slightly reduced to work better with increased margins
    margin: '0 auto',
    padding: '0 24px' // Added internal padding for better spacing
  };

  const headerStyle = {
    marginBottom: '32px' // Reduced from 64px
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)', // Reduced from clamp(3rem, 6vw, 4rem)
    fontWeight: 300,
    marginBottom: '8px', // Reduced from 16px
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
      borderRadius: '0px',
      transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
      display: 'flex',
      flexDirection: 'column'
    };

    // Mobile and tablet styles
    if (window.innerWidth < 1024) {
      return {
        ...baseStyle,
        minHeight: '180px', // Reduced from 200px
        marginBottom: '12px' // Reduced from 16px
      };
    }

    // Desktop grid positioning
    const gridStyles = {
      0: { gridArea: '1 / 1 / 3 / 2' }, // Tall left
      1: { gridArea: '1 / 2 / 2 / 3' }, // Top middle-left
      2: { gridArea: '1 / 3 / 3 / 4' }, // Tall center
      3: { gridArea: '1 / 4 / 3 / 5' }, // Tall middle-right
      4: { gridArea: '1 / 5 / 3 / 6' }, // Tall right
      5: { gridArea: '2 / 2 / 3 / 3' }  // Bottom middle-left
    };

    return {
      ...baseStyle,
      ...gridStyles[index],
      minHeight: index === 1 || index === 5 ? '160px' : '320px' // Reduced heights
    };
  };

  const cardContentStyle = {
    padding: '24px 20px', // Reduced from 32px 24px
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 10
  };

  const cardTitleStyle = (textColor) => ({
    fontSize: 'clamp(1.125rem, 2.2vw, 1.375rem)', // Slightly reduced
    fontWeight: 500,
    marginBottom: '6px', // Reduced from 8px
    color: textColor,
    lineHeight: 1.3
  });

  const cardSubtitleStyle = (textColor) => ({
    fontSize: '0.8rem', // Slightly reduced from 0.875rem
    fontWeight: 500,
    color: textColor,
    opacity: 0.8,
    lineHeight: 1.4
  });

  const svgStyle = {
    position: 'absolute',
    width: '100%',
    pointerEvents: 'none'
  };

  const bottomSectionStyle = {
    marginTop: '32px', // Reduced from 64px
    maxWidth: '768px'
  };

  const descriptionStyle = {
    fontSize: '1rem', // Reduced from 1.125rem
    lineHeight: 1.6,
    color: colors.text
  };

  const getGridStyle = () => {
    if (window.innerWidth >= 1024) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '12px', // Reduced from 16px
        marginBottom: '32px', // Reduced from 64px
        height: '360px' // Reduced from 400px
      };
    } else if (window.innerWidth >= 768) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px', // Reduced from 16px
        marginBottom: '32px', // Reduced from 64px
        gridAutoRows: 'minmax(180px, auto)' // Reduced from 200px
      };
    } else {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px', // Reduced from 16px
        marginBottom: '32px' // Reduced from 64px
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
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
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

        {/* Values Grid */}
        <motion.div 
          style={getGridStyle()}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-100px' }}
        >
          
          {values.map((value, index) => (
            <motion.div 
              key={index}
              style={getCardStyle(index, value.backgroundColor)}
              variants={cardVariants}
              whileHover={{ 
                scale: hoveredIndex === index ? 1.02 : 1.01,
                transition: { duration: 0.2 }
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Flowing curves for specific cards */}
              {index === 0 && (
                <motion.svg 
                  style={{...svgStyle, bottom: 0, left: 0, height: '96px'}} 
                  viewBox="0 0 200 100" 
                  preserveAspectRatio="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  viewport={{ once: false }}
                >
                  <motion.path 
                    d="M0,100 C50,20 150,80 200,40 L200,100 Z" 
                    fill={colors.primary} 
                    fillOpacity="0.3"
                  />
                </motion.svg>
              )}
              
              {index === 2 && (
                <motion.svg 
                  style={{...svgStyle, top: 0, right: 0, height: '128px'}} 
                  viewBox="0 0 200 100" 
                  preserveAspectRatio="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                  viewport={{ once: false }}
                >
                  <motion.path 
                    d="M200,0 C150,40 50,10 0,30 L0,0 Z" 
                    fill={colors.secondary} 
                    fillOpacity="0.3"
                  />
                </motion.svg>
              )}
              
              {index === 3 && (
                <motion.svg 
                  style={{...svgStyle, bottom: 0, right: 0, height: '112px'}} 
                  viewBox="0 0 200 100" 
                  preserveAspectRatio="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                  viewport={{ once: false }}
                >
                  <motion.path 
                    d="M200,100 C100,30 80,70 0,20 L0,100 Z" 
                    fill={colors.accent} 
                    fillOpacity="0.3"
                  />
                </motion.svg>
              )}
              
              {index === 4 && (
                <motion.svg 
                  style={{...svgStyle, top: '33%', left: 0, height: '80px'}} 
                  viewBox="0 0 200 100" 
                  preserveAspectRatio="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: 1.1 }}
                  viewport={{ once: false }}
                >
                  <motion.path 
                    d="M0,50 C80,10 120,90 200,30 L200,100 L0,100 Z" 
                    fill={colors.primaryLight} 
                    fillOpacity="0.3"
                  />
                </motion.svg>
              )}
              
              {index === 5 && (
                <motion.svg 
                  style={{...svgStyle, top: 0, left: 0, height: '96px'}} 
                  viewBox="0 0 200 100" 
                  preserveAspectRatio="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: 1.3 }}
                  viewport={{ once: false }}
                >
                  <motion.path 
                    d="M0,0 C70,60 130,20 200,50 L200,0 Z" 
                    fill={colors.accentDark} 
                    fillOpacity="0.3"
                  />
                </motion.svg>
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
          </motion.p>
        </div>

      </div>
    </div>
  );
};

export default CoreValues;