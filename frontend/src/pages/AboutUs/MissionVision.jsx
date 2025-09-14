import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';

const MissionVision = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setVisibleCards(prev => [...prev, 'vision']);
    }, 400);

    const timer2 = setTimeout(() => {
      setVisibleCards(prev => [...prev, 'mission']);
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleCardHover = (cardType, isHovering) => {
    setHoveredCard(isHovering ? cardType : null);
  };

  const handleMouseMove = (e, cardType) => {
    if (hoveredCard === cardType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const cardStyles = {
    borderRadius: '16px',
    position: 'relative',
    transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
    cursor: 'pointer',
    height: '520px',
    backgroundColor: colors.surface,
    boxShadow: `0 8px 32px ${colors.cardShadow}`,
  };

  const mobileCardStyles = {
    ...cardStyles,
    height: '480px',
  };

  return (
    <div
      style={{
        padding: '80px 20px',
        minHeight: '100vh',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: isDarkMode 
          ? `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundSecondary} 100%)`
          : `linear-gradient(180deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`,
        position: 'relative'
      }}
    >


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
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 600,
            color: colors.text,
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}
        >
          Mission & Vision
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
          Guided by Purpose · Driven by Impact
        </motion.p>
      </div>





      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
          gap: 'clamp(24px, 5vw, 48px)',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 0px)'
        }}
      >
        {/* Vision Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            ...window.innerWidth <= 768 ? mobileCardStyles : cardStyles,
            boxShadow: visibleCards.includes('vision') 
              ? (hoveredCard === 'vision' 
                ? `0 20px 40px ${colors.cardShadow}, 0 8px 16px ${colors.cardShadow}` 
                : `0 12px 24px ${colors.cardShadow}`)
              : `0 6px 16px ${colors.cardShadow}`,
            transform: visibleCards.includes('vision') 
              ? (hoveredCard === 'vision' ? 'translateY(-8px)' : 'translateY(0)')
              : 'translateY(32px)',
          }}
          onMouseEnter={() => handleCardHover('vision', true)}
          onMouseLeave={() => handleCardHover('vision', false)}
          onMouseMove={(e) => handleMouseMove(e, 'vision')}
        >
          {/* Image section */}
          <div
            style={{
              position: 'relative',
              height: window.innerWidth <= 768 ? '240px' : '280px',
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("/yellowlady.avif")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.8s ease',
                transform: hoveredCard === 'vision' ? 'scale(1.08)' : 'scale(1.04)',
                filter: isDarkMode 
                  ? 'brightness(0.8) contrast(1.2) saturate(1.1)' 
                  : 'brightness(0.85) contrast(1.15) saturate(1.1)'
              }}
            />
            
            {/* Color overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  linear-gradient(180deg, 
                    rgba(255, 215, 0, 0.05) 0%,
                    rgba(255, 193, 7, 0.1) 20%,
                    rgba(218, 165, 32, 0.25) 50%,
                    rgba(184, 134, 11, 0.5) 75%,
                    rgba(148, 111, 9, 0.75) 90%,
                    ${colors.secondary} 100%
                  )
                `,
                transition: 'opacity 0.6s ease',
                opacity: hoveredCard === 'vision' ? 0.9 : 1
              }}
            />

            {/* Title overlay */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 'clamp(16px, 4vw, 32px)',
                color: colors.white,
                fontSize: 'clamp(28px, 5vw, 36px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
                transition: 'all 0.6s ease',
                opacity: hoveredCard === 'vision' ? 1 : 0.95,
                transform: hoveredCard === 'vision' 
                  ? 'translateY(-50%) translateX(8px)' 
                  : 'translateY(-50%)'
              }}
            >
              Vision
            </div>
          </div>

          {/* Content area */}
          <div
            style={{
              padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 28px)',
              background: colors.secondary,
              borderRadius: '0 0 16px 16px',
              position: 'relative',
              height: `calc(100% - ${window.innerWidth <= 768 ? '240px' : '280px'})`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <p
              style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                lineHeight: '1.7',
                color: 'rgba(44, 36, 22, 0.95)',
                margin: '0',
                fontWeight: 400,
                transition: 'all 0.4s ease',
                opacity: hoveredCard === 'vision' ? 1 : 0.92
              }}
            >
              A resilient Africa where empowered youth lead innovative solutions for climate action,
              environmental protection, and sustainable development — ensuring a future free from hunger and poverty.
            </p>

            {/* Smooth bottom fade */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '24px',
                background: `linear-gradient(to bottom, 
                  transparent 0%, 
                  rgba(212, 175, 55, 0.3) 40%, 
                  rgba(212, 175, 55, 0.6) 70%,
                  rgba(212, 175, 55, 0.8) 85%,
                  rgba(212, 175, 55, 0.95) 100%
                )`,
                borderRadius: '0 0 16px 16px',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Interactive highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: hoveredCard === 'vision' 
                ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,215,0,0.08) 0%, transparent 60%)`
                : 'transparent',
              transition: 'opacity 0.4s ease',
              opacity: hoveredCard === 'vision' ? 1 : 0,
              pointerEvents: 'none',
              borderRadius: '16px'
            }}
          />
        </motion.div>

        {/* Mission Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            ...window.innerWidth <= 768 ? mobileCardStyles : cardStyles,
            boxShadow: visibleCards.includes('mission') 
              ? (hoveredCard === 'mission' 
                ? `0 20px 40px ${colors.cardShadow}, 0 8px 16px ${colors.cardShadow}` 
                : `0 12px 24px ${colors.cardShadow}`)
              : `0 6px 16px ${colors.cardShadow}`,
            transform: visibleCards.includes('mission') 
              ? (hoveredCard === 'mission' ? 'translateY(-8px)' : 'translateY(0)')
              : 'translateY(32px)',
          }}
          onMouseEnter={() => handleCardHover('mission', true)}
          onMouseLeave={() => handleCardHover('mission', false)}
          onMouseMove={(e) => handleMouseMove(e, 'mission')}
        >
          {/* Image section */}
          <div
            style={{
              position: 'relative',
              height: window.innerWidth <= 768 ? '240px' : '280px',
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("/africafruits.avif")',
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                transition: 'all 0.8s ease',
                transform: hoveredCard === 'mission' ? 'scale(1.18)' : 'scale(1.15)',
                filter: isDarkMode 
                  ? 'brightness(0.8) contrast(1.2) saturate(1.1)' 
                  : 'brightness(0.85) contrast(1.15) saturate(1.1)'
              }}
            />
            
            {/* Color overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  linear-gradient(180deg, 
                    rgba(34, 139, 34, 0.05) 0%,
                    rgba(56, 142, 60, 0.1) 20%,
                    rgba(46, 125, 50, 0.25) 50%,
                    rgba(39, 108, 42, 0.5) 75%,
                    rgba(33, 91, 36, 0.75) 90%,
                    ${colors.primary} 100%
                  )
                `,
                transition: 'opacity 0.6s ease',
                opacity: hoveredCard === 'mission' ? 0.9 : 1
              }}
            />

            {/* Title overlay */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 'clamp(16px, 4vw, 32px)',
                color: colors.white,
                fontSize: 'clamp(28px, 5vw, 36px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
                transition: 'all 0.6s ease',
                opacity: hoveredCard === 'mission' ? 1 : 0.95,
                transform: hoveredCard === 'mission' 
                  ? 'translateY(-50%) translateX(8px)' 
                  : 'translateY(-50%)'
              }}
            >
              Mission
            </div>
          </div>

          {/* Content area */}
          <div
            style={{
              padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 28px)',
              background: colors.primary,
              borderRadius: '0 0 16px 16px',
              position: 'relative',
              height: `calc(100% - ${window.innerWidth <= 768 ? '240px' : '280px'})`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <p
              style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                lineHeight: '1.7',
                color: 'rgba(232, 245, 232, 0.95)',
                margin: '0',
                fontWeight: 400,
                transition: 'all 0.4s ease',
                opacity: hoveredCard === 'mission' ? 1 : 0.92
              }}
            >
              To mobilize and empower African youth to actively participate in the Climate, Environment,
              and Sustainable Development agenda, bridging the hunger and poverty gap, mitigating climate
              change, protecting the environment, and conserving natural resources in Africa.
            </p>

            {/* Smooth bottom fade */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '24px',
                background: `linear-gradient(to bottom, 
                  transparent 0%, 
                  rgba(10, 69, 28, 0.3) 40%, 
                  rgba(10, 69, 28, 0.6) 70%,
                  rgba(10, 69, 28, 0.8) 85%,
                  rgba(10, 69, 28, 0.95) 100%
                )`,
                borderRadius: '0 0 16px 16px',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Interactive highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: hoveredCard === 'mission' 
                ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(76,175,80,0.08) 0%, transparent 60%)`
                : 'transparent',
              transition: 'opacity 0.4s ease',
              opacity: hoveredCard === 'mission' ? 1 : 0,
              pointerEvents: 'none',
              borderRadius: '16px'
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default MissionVision;