import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, RefreshCw, X, ChevronUp, ChevronDown, Menu, Eye } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

// Clean fallback image
const DEFAULT_PILLAR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmOWZhZmIiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+';

const ProgrammePillarsSection = ({ 
  title = "Our Programme Pillars",
  subtitle = "Discover the core areas that drive our mission forward",
  maxPillars = null,
  className = ""
}) => {
  const { colors, isDarkMode } = useTheme();
  
  // State management
  const [pillars, setPillars] = useState([]);
  const [error, setError] = useState('');
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-close navigation on desktop
      if (!mobile) {
        setIsNavigationOpen(false);
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Image URL generation
  const getPillarImageUrl = useCallback((pillar) => {
    if (!pillar?.image) return DEFAULT_PILLAR_IMAGE;
    if (pillar.image.startsWith('http://') || pillar.image.startsWith('https://')) return pillar.image;
    if (pillar.image.startsWith('data:')) return pillar.image;
    if (pillar.image.startsWith('/uploads/')) return `${STATIC_URL}${pillar.image}`;
    if (!pillar.image.includes('/')) return `${STATIC_URL}/uploads/pillars/${pillar.image}`;
    return `${STATIC_URL}${pillar.image.startsWith('/') ? '' : '/'}${pillar.image}`;
  }, []);

  // Fetch pillars data
  const fetchPillars = useCallback(async () => {
    try {
      setError('');
      const pillarsRes = await fetch(`${API_BASE}/pillars`, { 
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!pillarsRes.ok) throw new Error('Failed to load programme pillars');
      
      const pillarsData = await pillarsRes.json();
      setPillars(pillarsData.data || []);
    } catch (err) {
      console.error('Error fetching pillars:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchPillars();
  }, [fetchPillars]);

  // Display logic
  const displayPillars = maxPillars ? pillars.slice(0, maxPillars) : pillars;

  // Navigation functions
  const scrollToIndex = (index) => {
    setCurrentIndex(index);
    const container = document.getElementById('pillars-slider');
    if (container) {
      const itemHeight = isMobile ? 450 : 500;
      container.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      });
    }
    // Close navigation after selection on mobile
    if (isMobile) {
      setIsNavigationOpen(false);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const itemHeight = isMobile ? 450 : 500;
    const newIndex = Math.round(container.scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < displayPillars.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentIndex < displayPillars.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
    if (isDownSwipe && currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Navigation Component
  const NavigationPanel = ({ style = {} }) => (
    <div style={{
      ...style,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile && isNavigationOpen ? 'row' : 'column',
        gap: '4px',
        marginBottom: '16px',
        justifyContent: isMobile && isNavigationOpen ? 'center' : 'flex-start'
      }}>
        <button
          onClick={() => currentIndex > 0 && scrollToIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{
            background: currentIndex === 0 ? 'transparent' : colors.primary,
            color: currentIndex === 0 ? colors.textSecondary : colors.white,
            border: `1px solid ${currentIndex === 0 ? colors.textSecondary : colors.primary}`,
            padding: isMobile ? '12px' : '8px',
            borderRadius: '6px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === 0 ? 0.5 : 1,
            transition: 'all 0.3s ease',
            minWidth: isMobile ? '44px' : '32px',
            minHeight: isMobile ? '44px' : '32px'
          }}
        >
          <ChevronUp size={isMobile ? 20 : 16} />
        </button>
        
        <button
          onClick={() => currentIndex < displayPillars.length - 1 && scrollToIndex(currentIndex + 1)}
          disabled={currentIndex === displayPillars.length - 1}
          style={{
            background: currentIndex === displayPillars.length - 1 ? 'transparent' : colors.primary,
            color: currentIndex === displayPillars.length - 1 ? colors.textSecondary : colors.white,
            border: `1px solid ${currentIndex === displayPillars.length - 1 ? colors.textSecondary : colors.primary}`,
            padding: isMobile ? '12px' : '8px',
            borderRadius: '6px',
            cursor: currentIndex === displayPillars.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === displayPillars.length - 1 ? 0.5 : 1,
            transition: 'all 0.3s ease',
            minWidth: isMobile ? '44px' : '32px',
            minHeight: isMobile ? '44px' : '32px'
          }}
        >
          <ChevronDown size={isMobile ? 20 : 16} />
        </button>
      </div>

      {/* Progress indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        justifyContent: isMobile && isNavigationOpen ? 'center' : 'flex-start'
      }}>
        <span style={{
          fontSize: '12px',
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          {currentIndex + 1} / {displayPillars.length}
        </span>
        <div style={{
          flex: isMobile && isNavigationOpen ? '0 0 100px' : '1',
          height: '2px',
          backgroundColor: colors.textSecondary + '30',
          borderRadius: '1px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentIndex + 1) / displayPillars.length) * 100}%`,
            height: '100%',
            backgroundColor: colors.primary,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Pillar Navigation Dots */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile && isNavigationOpen ? 'row' : 'column',
        gap: isMobile && isNavigationOpen ? '8px' : '12px',
        flexWrap: isMobile && isNavigationOpen ? 'wrap' : 'nowrap',
        justifyContent: isMobile && isNavigationOpen ? 'center' : 'flex-start',
        maxHeight: isMobile && isNavigationOpen ? '200px' : 'none',
        overflowY: isMobile && isNavigationOpen ? 'auto' : 'visible'
      }}>
        {displayPillars.map((pillar, index) => (
          <motion.button
            key={pillar.id}
            onClick={() => scrollToIndex(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: isMobile && isNavigationOpen ? '8px' : '0',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile && isNavigationOpen ? '6px' : '8px',
              borderRadius: isMobile && isNavigationOpen ? '6px' : '0',
              backgroundColor: isMobile && isNavigationOpen && index === currentIndex 
                ? colors.primary + '15' : 'transparent',
              minHeight: isMobile ? '44px' : 'auto',
              justifyContent: isMobile && isNavigationOpen ? 'center' : 'flex-start',
              flexDirection: isMobile && isNavigationOpen ? 'column' : 'row'
            }}
          >
            <div style={{
              width: isMobile && isNavigationOpen ? '12px' : '8px',
              height: isMobile && isNavigationOpen ? '12px' : '8px',
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? colors.primary : colors.textSecondary,
              transition: 'all 0.3s ease',
              opacity: index === currentIndex ? 1 : 0.5,
              flexShrink: 0
            }} />
            <div style={{
              fontSize: isMobile && isNavigationOpen ? '10px' : (isMobile ? '9px' : '12px'),
              color: index === currentIndex ? colors.primary : colors.textSecondary,
              fontWeight: index === currentIndex ? '600' : '400',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.2',
              transition: 'all 0.3s ease',
              textAlign: isMobile && isNavigationOpen ? 'center' : 'left',
              display: isMobile && !isNavigationOpen ? 'none' : 'block'
            }}>
              {isMobile && isNavigationOpen 
                ? pillar.name.length > 15 ? pillar.name.substring(0, 15) + '...' : pillar.name
                : pillar.name
              }
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <section className={className} style={{ 
        padding: isMobile ? '60px 0' : '160px 0',
        fontFamily: 'inherit',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)' 
          : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 20px',
        }}>
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            textAlign: 'center',
            background: isDarkMode 
              ? 'rgba(0, 0, 0, 0)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: isMobile ? '32px 20px' : '60px 40px',
            border: `1px solid ${colors.error}30`,
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
          }}>
            <AlertCircle size={isMobile ? 32 : 48} style={{ color: colors.error, marginBottom: '16px' }} />
            <h3 style={{ 
              color: colors.text, 
              marginBottom: '8px',
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              Unable to Load Programme Pillars
            </h3>
            <p style={{ 
              color: colors.textSecondary,
              marginBottom: '20px',
              lineHeight: '1.6',
              fontSize: isMobile ? '13px' : '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '400',
            }}>
              {error}
            </p>
            <motion.button
              onClick={fetchPillars}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: isMobile ? '12px 20px' : '12px 24px',
                borderRadius: '8px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                transition: 'all 0.2s ease',
                minHeight: '44px'
              }}
              whileHover={{ 
                backgroundColor: '#dc2626',
                transform: 'translateY(-1px)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={isMobile ? 14 : 14} />
              Try Again
            </motion.button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (displayPillars.length === 0) {
    return (
      <section className={className} style={{ 
        padding: isMobile ? '60px 0' : '160px 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)' 
          : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 20px',
        }}>
          <div style={{ 
            textAlign: 'center',
            background: isDarkMode 
              ? 'rgba(0, 0, 0, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: isMobile ? '32px 20px' : '60px 40px',
            border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              color: colors.text, 
              marginBottom: '8px',
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              Displaying Programme Pillars
            </h3>
            <p style={{ 
              color: colors.textSecondary,
              lineHeight: '1.6',
              fontSize: isMobile ? '13px' : '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segue UI", Roboto, sans-serif',
              fontWeight: '400',
              margin: '0'
            }}>
              Programme pillars are currently being organized.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className} style={{ 
      padding: isMobile ? '40px 0' : '100px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)' 
        : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
    }}>
      <div style={{ 
        maxWidth: '1200px',
        marginTop: '90px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 20px'
      }}>
        {/* Title section */}
        <div
          style={{
            maxWidth: '1100px',
            margin: isMobile ? '0 auto 40px auto' : '0 auto 60px auto',
            textAlign: 'center'
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px' }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: isMobile ? '1.8rem' : 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '300',
              color: isDarkMode ? colors.text : colors.primary,
              lineHeight: '1.2',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
              fontFamily: '"Nunito Sans", sans-serif',
            }}
          >
            Our <span style={{ fontWeight: '700', color: colors.primary }}>Programme</span>
            <span style={{
              fontSize: isMobile ? '1.8rem' : 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '300',
              color: isDarkMode ? colors.text : colors.primary,
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              fontFamily: '"Nunito Sans", sans-serif',
            }}> Pillars</span>
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
              margin: '0 auto 20px auto',
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
              fontSize: isMobile ? '14px' : '16px',
              color: colors.textSecondary,
              margin: '0',
              letterSpacing: '0.5px',
              fontWeight: 400,
              opacity: 0.9,
              lineHeight: '1.5'
            }}
          >
            Discover the core areas that drive our mission forward
          </motion.p>
        </div>


        {/* Navigation Panel for Mobile (Expandable) */}
        <AnimatePresence>
          {isMobile && isNavigationOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: 'hidden',
                marginBottom: '20px'
              }}
            >
              <div style={{
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.8)' 
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                boxShadow: isDarkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <NavigationPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider Container */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '0' : '40px',
          alignItems: 'stretch',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Left Navigation Panel - Desktop Only */}
          {!isMobile && (
            <div style={{
              flex: '0 0 auto',
              width: '240px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <NavigationPanel />
            </div>
          )}

          {/* Pillars Slider */}
          <div
            id="pillars-slider"
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              flex: '1',
              height: isMobile ? '500px' : '600px',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              background: isDarkMode 
                ? 'rgba(30, 41, 59, 0.3)' 
                : 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              backdropFilter: 'blur(20px)',
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
                : '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}
          >
            <style>
              {`
                #pillars-slider::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            
            {displayPillars.map((pillar, index) => (
              <div
                key={pillar.id}
                style={{
                  height: isMobile ? '500px' : '600px',
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '20px' : '30px',
                  padding: isMobile ? '24px 20px' : '40px',
                  alignItems: 'flex-start'
                }}
              >
                {/* Image */}
                <div style={{
                  width: '100%',
                  height: isMobile ? '200px' : '280px',
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img
                    src={getPillarImageUrl(pillar)}
                    alt={pillar.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      e.target.src = DEFAULT_PILLAR_IMAGE;
                    }}
                  />
                  
                  {/* Image overlay with pillar number */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div style={{ 
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  textAlign: 'left',
                  width: '100%'
                }}>
                  <h3 style={{
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: '700',
                    color: colors.text,
                    lineHeight: '1.2',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.02em',
                    margin: '0'
                  }}>
                    {pillar.name}
                  </h3>

                  <p style={{
                    color: colors.textSecondary,
                    fontSize: isMobile ? '14px' : '16px',
                    lineHeight: '1.5',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: '400',
                    margin: '0',
                    display: '-webkit-box',
                    WebkitLineClamp: isMobile ? 3 : 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {pillar.description}
                  </p>
                  
                  {/* Focus Areas */}
                  {pillar.focus_areas && pillar.focus_areas.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      justifyContent: 'flex-start'
                    }}>
                      {pillar.focus_areas.slice(0, isMobile ? 3 : 4).map((fa) => (
                        <span
                          key={fa.id}
                          style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            padding: isMobile ? '4px 8px' : '6px 10px',
                            borderRadius: '16px',
                            fontSize: isMobile ? '10px' : '11px',
                            fontWeight: '500',
                            border: `1px solid ${colors.primary}20`,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          }}
                        >
                          {fa.name}
                        </span>
                      ))}
                      {pillar.focus_areas.length > (isMobile ? 3 : 4) && (
                        <span style={{
                          color: colors.textSecondary,
                          fontSize: isMobile ? '10px' : '11px',
                          fontWeight: '500',
                          padding: isMobile ? '4px 8px' : '6px 10px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          +{pillar.focus_areas.length - (isMobile ? 3 : 4)} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '16px',
                    alignItems: 'flex-start',
                    marginTop: 'auto'
                  }}>
                    <motion.button
                      onClick={() => setSelectedPillar(pillar)}
                      style={{
                        background: 'transparent',
                        color: colors.text,
                        border: 'none',
                        padding: "0",
                        fontWeight: "500",
                        fontSize: isMobile ? '13px' : '14px',
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        minHeight: isMobile ? '44px' : 'auto',
                      }}
                      whileHover={{ 
                        color: colors.primary,
                        x: 2
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye size={isMobile ? 16 : 14} />
                      <span style={{
                        borderBottom: `1px solid ${colors.textSecondary}`,
                        paddingBottom: '1px',
                      }}>
                        Learn More
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={() => window.location.href = '/get-involved'}
                      style={{
                        background: colors.primary,
                        color: colors.white,
                        border: "none",
                        padding: isMobile ? "12px 24px" : "14px 28px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: isMobile ? '13px' : '14px',
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        boxShadow: `0 2px 8px ${colors.primary}30`,
                        minHeight: isMobile ? '44px' : 'auto',
                        width: isMobile ? '100%' : 'auto'
                      }}
                      whileHover={{
                        backgroundColor: colors.primaryDark,
                        y: -1,
                        boxShadow: `0 4px 12px ${colors.primary}40`
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Involved
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Pillars */}
        {maxPillars && pillars.length > maxPillars && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px' }}
            transition={{ duration: 0.6 }}
            style={{
              borderTop: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              paddingTop: isMobile ? '32px' : '60px',
              marginTop: isMobile ? '40px' : '60px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'center' : 'center',
              gap: isMobile ? '20px' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            <div>
              <h4 style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '600',
                color: colors.text,
                margin: '0 0 8px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}>
                More Pillars
              </h4>
              <p style={{
                fontSize: isMobile ? '12px' : '13px',
                color: colors.textSecondary,
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}>
                Explore our complete programme framework
              </p>
            </div>
            
            <motion.button
              onClick={() => window.location.href = '/programs'}
              style={{
                background: 'transparent',
                color: colors.text,
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                padding: isMobile ? "12px 24px" : "16px 32px",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: isMobile ? '13px' : '14px',
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: isMobile ? '44px' : 'auto',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center'
              }}
              whileHover={{
                backgroundColor: colors.text,
                color: colors.background,
                x: 2
              }}
              whileTap={{ scale: 0.98 }}
            >
              View All Pillars
              <ArrowRight 
                size={14} 
                style={{ 
                  transition: 'transform 0.3s ease',
                }} 
              />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {selectedPillar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '16px' : '20px'
            }}
            onClick={() => setSelectedPillar(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              style={{
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.98)' 
                  : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(30px)',
                borderRadius: '16px',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                maxWidth: isMobile ? '95vw' : '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: isDarkMode 
                  ? '0 25px 80px rgba(0, 0, 0, 0.5)' 
                  : '0 25px 80px rgba(0, 0, 0, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Image */}
              <div style={{ 
                height: isMobile ? '200px' : '280px',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '16px 16px 0 0'
              }}>
                <img
                  src={getPillarImageUrl(selectedPillar)}
                  alt={selectedPillar.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '60px',
                  background: isDarkMode 
                    ? 'linear-gradient(transparent, rgba(30, 41, 59, 0.8))'
                    : 'linear-gradient(transparent, rgba(255, 255, 255, 0.8))'
                }} />
                
                <button
                  onClick={() => setSelectedPillar(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    width: isMobile ? '36px' : '32px',
                    height: isMobile ? '36px' : '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <X size={isMobile ? 18 : 16} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ 
                padding: isMobile ? '20px 20px 24px' : '32px 32px 32px', 
                maxHeight: isMobile ? '300px' : '400px', 
                overflow: 'auto' 
              }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  lineHeight: '1.2',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}>
                  {selectedPillar.name}
                </h3>
                
                <p style={{
                  color: colors.textSecondary,
                  fontSize: isMobile ? '14px' : '15px',
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '400',
                }}>
                  {selectedPillar.description}
                </p>

                {selectedPillar.focus_areas && selectedPillar.focus_areas.length > 0 && (
                  <div>
                    <h4 style={{
                      color: colors.text,
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}>
                      Focus Areas
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '24px'
                    }}>
                      {selectedPillar.focus_areas.map((fa) => (
                        <motion.span
                          key={fa.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            padding: isMobile ? '6px 12px' : '8px 14px',
                            borderRadius: '20px',
                            fontSize: isMobile ? '12px' : '13px',
                            fontWeight: '500',
                            border: `1px solid ${colors.primary}20`,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          }}
                        >
                          {fa.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexDirection: isMobile ? 'column' : 'row',
                  borderTop: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
                  paddingTop: '20px'
                }}>
                  <motion.button
                    onClick={() => window.location.href = '/get-involved'}
                    style={{
                      background: colors.primary,
                      color: colors.white,
                      border: 'none',
                      padding: isMobile ? '14px 24px' : '12px 24px',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      flex: '1',
                      minHeight: isMobile ? '48px' : '40px',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{
                      backgroundColor: colors.primaryDark,
                      y: -1
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Involved
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setSelectedPillar(null)}
                    style={{
                      background: 'transparent',
                      color: colors.textSecondary,
                      border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                      padding: isMobile ? '14px 24px' : '12px 24px',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      minHeight: isMobile ? '48px' : '40px',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{
                      backgroundColor: colors.textSecondary,
                      color: colors.background
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProgrammePillarsSection;