import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, RefreshCw, X } from 'lucide-react';
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

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
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

  // Error state
  if (error) {
    return (
      <section className={className} style={{ 
        padding: isMobile ? '80px 0' : '160px 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
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
              ? 'rgba(30, 41, 59, 0.9)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: isMobile ? '40px 20px' : '60px 40px',
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
                padding: isMobile ? '8px 16px' : '12px 24px',
                borderRadius: '8px',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                transition: 'all 0.2s ease'
              }}
              whileHover={{ 
                backgroundColor: '#dc2626',
                transform: 'translateY(-1px)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={isMobile ? 12 : 14} />
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
        padding: isMobile ? '80px 0' : '160px 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
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
              ? 'rgba(30, 41, 59, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: isMobile ? '40px 20px' : '60px 40px',
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
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      padding: isMobile ? '60px 0' : '100px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
        : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
    }}>
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 20px'
      }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ 
            marginBottom: isMobile ? '40px' : '60px',
            textAlign: 'center'
          }}
        >
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: colors.text,
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {title}
          </h2>
          
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: '0',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {subtitle}
          </p>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            padding: '4px 12px',
            background: isDarkMode 
              ? 'rgba(71, 85, 105, 0.3)' 
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
          }}>
            <span style={{
              fontSize: '11px',
              color: colors.textSecondary,
              fontWeight: '500',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              {displayPillars.length} Pillars
            </span>
          </div>
        </motion.div>

        {/* All Pillars Display */}
        {displayPillars.map((pillar, index) => (
          <motion.div
            key={pillar.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : (index % 2 === 0 ? 'row' : 'row-reverse'),
              gap: isMobile ? '30px' : '60px',
              alignItems: isMobile ? 'center' : 'flex-start',
              marginBottom: isMobile ? '60px' : '100px',
              background: isDarkMode 
                ? 'rgba(30, 41, 59, 0.5)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '0px',
              padding: isMobile ? '30px 20px' : '50px',
              border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              boxShadow: isDarkMode 
                ? '0 20px 60px rgba(0, 0, 0, 0.4)' 
                : '0 20px 60px rgba(0, 0, 0, 0.08)',
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            {/* Image */}
            <div style={{
              flex: '0 0 auto',
              width: isMobile ? '240px' : '380px',
              height: isMobile ? '240px' : '380px',
              position: 'relative',
              order: isMobile ? 1 : 'unset'
            }}>
              <img
                src={getPillarImageUrl(pillar)}
                alt={pillar.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '0px',
                  border: 'none',
                  boxShadow: `0 20px 60px ${colors.primary}20`,
                  filter: 'brightness(1.02) contrast(1.01)'
                }}
                onError={(e) => {
                  e.target.src = DEFAULT_PILLAR_IMAGE;
                }}
              />
            </div>

            {/* Content */}
            <div style={{ 
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '20px',
              order: isMobile ? 2 : 'unset'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                <div style={{
                  width: '3px',
                  height: '20px',
                  backgroundColor: colors.primary,
                }} />
                <span style={{
                  fontSize: '11px',
                  color: colors.textSecondary,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}>
                  Pillar {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 style={{
                fontSize: isMobile ? '18px' : '24px',
                fontWeight: '700',
                color: colors.text,
                marginBottom: '16px',
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
                lineHeight: '1.6',
                marginBottom: '20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: '400',
                margin: '0'
              }}>
                {pillar.description}
              </p>
              
              {/* Focus Areas */}
              {pillar.focus_areas && pillar.focus_areas.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    color: colors.text,
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    Activities
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}>
                    {pillar.focus_areas.slice(0, isMobile ? 3 : 5).map((fa) => (
                      <span
                        key={fa.id}
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          border: `1px solid ${colors.primary}20`,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                      >
                        {fa.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '16px',
                alignItems: isMobile ? 'center' : 'flex-start',
              }}>
                <button
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
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = colors.primary;
                    const arrow = e.target.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = colors.text;
                    const arrow = e.target.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{
                    borderBottom: `1px solid ${colors.textSecondary}`,
                    paddingBottom: '1px',
                  }}>
                    Learn More
                  </span>
                  <ArrowRight 
                    size={14} 
                    className="arrow"
                    style={{ 
                      transition: 'transform 0.3s ease',
                    }} 
                  />
                </button>

                <button
                  onClick={() => window.location.href = '/get-involved'}
                  style={{
                    background: colors.primary,
                    color: colors.white,
                    border: "none",
                    padding: isMobile ? "12px 24px" : "16px 32px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: isMobile ? '13px' : '14px',
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    boxShadow: `0 4px 16px ${colors.primary}30`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primaryDark;
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = `0 6px 20px ${colors.primary}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.primary;
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = `0 4px 16px ${colors.primary}30`;
                  }}
                >
                  Get Involved
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* View All Pillars */}
        {maxPillars && pillars.length > maxPillars && (
          <div style={{
            borderTop: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
            paddingTop: isMobile ? '40px' : '60px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'center' : 'center',
            gap: isMobile ? '20px' : '0',
            textAlign: isMobile ? 'center' : 'left'
          }}>
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
                fontSize: '13px',
                color: colors.textSecondary,
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}>
                Explore our complete programme framework
              </p>
            </div>
            
            <button
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
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.text;
                e.target.style.color = colors.background;
                const arrow = e.target.querySelector('.view-arrow');
                if (arrow) arrow.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.text;
                const arrow = e.target.querySelector('.view-arrow');
                if (arrow) arrow.style.transform = 'translateX(0)';
              }}
            >
              View All Pillars
              <ArrowRight 
                size={14} 
                className="view-arrow"
                style={{ 
                  transition: 'transform 0.3s ease',
                }} 
              />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
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
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '16px' : '20px'
            }}
            onClick={() => setSelectedPillar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                maxWidth: isMobile ? '90vw' : '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: isDarkMode 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ 
                height: isMobile ? '180px' : '240px',
                overflow: 'hidden',
                position: 'relative'
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
                
                <button
                  onClick={() => setSelectedPillar(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ 
                padding: isMobile ? '24px 20px' : '32px', 
                maxHeight: isMobile ? '200px' : '300px', 
                overflow: 'auto' 
              }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  lineHeight: '1.2',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}>
                  {selectedPillar.name}
                </h3>
                
                <p style={{
                  color: colors.textSecondary,
                  fontSize: isMobile ? '13px' : '14px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '400',
                }}>
                  {selectedPillar.description}
                </p>

                {selectedPillar.focus_areas && selectedPillar.focus_areas.length > 0 && (
                  <div>
                    <h4 style={{
                      color: colors.text,
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}>
                      Focus Areas
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {selectedPillar.focus_areas.map((fa) => (
                        <span
                          key={fa.id}
                          style={{
                            backgroundColor: `${colors.primary}15`,
                            color: colors.primary,
                            padding: isMobile ? '4px 8px' : '6px 12px',
                            borderRadius: '12px',
                            fontSize: isMobile ? '11px' : '12px',
                            fontWeight: '500',
                            border: `1px solid ${colors.primary}20`,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          }}
                        >
                          {fa.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProgrammePillarsSection;