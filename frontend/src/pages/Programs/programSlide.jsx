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
        padding: '160px 0',
        backgroundColor: colors.background
      }}>
        <div style={{ 
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '0 24px',
        }}>
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            textAlign: 'center',
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.error}30`,
            borderRadius: '16px',
            padding: '60px 40px',
            boxShadow: `0 4px 12px ${colors.cardShadow}`,
          }}>
            <AlertCircle size={48} style={{ color: colors.error, marginBottom: '24px' }} />
            <h3 style={{ 
              color: colors.text, 
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              Unable to Load Programme Pillars
            </h3>
            <p style={{ 
              color: colors.textSecondary,
              marginBottom: '32px',
              lineHeight: '1.7',
              fontSize: '16px',
              fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '400',
            }}>
              {error}
            </p>
            <motion.button
              onClick={fetchPillars}
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: '"Nunito Sans", sans-serif',
                boxShadow: `0 4px 16px rgba(10, 69, 28, 0.3)`,
              }}
              whileHover={{ 
                backgroundColor: colors.primaryDark,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(10, 69, 28, 0.4)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={16} />
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
        padding: '160px 0',
        backgroundColor: colors.background
      }}>
        <div style={{ 
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '0 24px',
        }}>
          <div style={{ 
            textAlign: 'center',
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '60px 40px',
            boxShadow: `0 4px 12px ${colors.cardShadow}`,
          }}>
            <h3 style={{ 
              color: colors.text, 
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              No Programme Pillars Found
            </h3>
            <p style={{ 
              color: colors.textSecondary,
              lineHeight: '1.7',
              fontSize: '16px',
              fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '400',
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
      padding: '160px 0',
      backgroundColor: colors.background
    }}>
      <div style={{ 
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ 
            marginBottom: '120px',
            maxWidth: '800px',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '32px',
            marginBottom: '40px',
          }}>
            <h2
              style={{
                fontSize: "clamp(42px, 6vw, 72px)",
                fontWeight: "300",
                color: colors.text,
                margin: "0",
                lineHeight: "0.9",
                fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.04em',
              }}
            >
              Programme
            </h2>
            <div style={{
              flexGrow: 1,
              height: '1px',
              backgroundColor: colors.border,
              marginBottom: '20px',
            }} />
            <span style={{
              fontSize: '14px',
              color: colors.textSecondary,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: '"Nunito Sans", sans-serif',
            }}>
              {String(displayPillars.length).padStart(2, '0')}
            </span>
          </div>

          <p
            style={{
              fontSize: "24px",
              color: colors.textSecondary,
              lineHeight: "1.4",
              fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '400',
              margin: '0',
            }}
          >
            {subtitle}
          </p>
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
              display: 'grid',
              gridTemplateColumns: index % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
              gap: '120px',
              alignItems: 'start',
              marginBottom: '160px',
            }}
          >
            {/* Content */}
            <div style={{ 
              paddingTop: '40px',
              order: index % 2 === 0 ? 1 : 2 
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px',
              }}>
                <div style={{
                  width: '4px',
                  height: '40px',
                  backgroundColor: colors.primary,
                }} />
                <span style={{
                  fontSize: '12px',
                  color: colors.textSecondary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontFamily: '"Nunito Sans", sans-serif',
                }}>
                  {String(index + 1).padStart(2, '0')} / Programme Pillar
                </span>
              </div>

              <h3
                style={{
                  fontSize: "clamp(32px, 4vw, 48px)",
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: "40px",
                  lineHeight: "1.1",
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {pillar.name}
              </h3>

              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: "18px",
                  lineHeight: "1.6",
                  marginBottom: "60px",
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '400',
                }}
              >
                {pillar.description}
              </p>
              
              {/* Focus Areas */}
              {pillar.focus_areas && pillar.focus_areas.length > 0 && (
                <div style={{ marginBottom: '60px' }}>
                  <h4 style={{
                    color: colors.text,
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    fontFamily: '"Nunito Sans", sans-serif',
                  }}>
                    Focus Areas
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px'
                  }}>
                    {pillar.focus_areas.map((fa) => (
                      <span
                        key={fa.id}
                        style={{
                          backgroundColor: 'transparent',
                          color: colors.textSecondary,
                          padding: '0',
                          fontSize: '16px',
                          fontWeight: '400',
                          fontFamily: '"Nunito Sans", sans-serif',
                          borderBottom: `1px solid ${colors.border}`,
                          paddingBottom: '2px',
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
                flexDirection: 'column',
                gap: '24px',
                alignItems: 'flex-start',
              }}>
                <button
                  onClick={() => setSelectedPillar(pillar)}
                  style={{
                    background: 'transparent',
                    color: colors.text,
                    border: 'none',
                    padding: "0",
                    fontWeight: "400",
                    fontSize: "18px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    fontFamily: '"Nunito Sans", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = colors.primary;
                    const arrow = e.target.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = colors.text;
                    const arrow = e.target.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: '2px',
                  }}>
                    Learn More
                  </span>
                  <ArrowRight 
                    size={18} 
                    className="arrow"
                    style={{ 
                      transition: 'transform 0.3s ease',
                    }} 
                  />
                </button>

                <button
                  onClick={() => window.location.href = '/get-involved'}
                  style={{
                    background: colors.text,
                    color: colors.background,
                    border: "none",
                    padding: "20px 40px",
                    borderRadius: "0",
                    fontWeight: "600",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "all 0.4s ease",
                    fontFamily: '"Nunito Sans", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primary;
                    e.target.style.color = colors.white;
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.text;
                    e.target.style.color = colors.background;
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Get Involved
                </button>
              </div>
            </div>

            {/* Image */}
            <div style={{
              position: 'relative',
              height: '600px',
              order: index % 2 === 0 ? 2 : 1 
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                left: index % 2 === 0 ? '20px' : '0',
                right: index % 2 === 0 ? '0' : '20px',
                bottom: '0',
                background: `url(${getPillarImageUrl(pillar)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }} />
              
              <div style={{
                position: 'absolute',
                top: '0',
                left: index % 2 === 0 ? '0' : '20px',
                right: index % 2 === 0 ? '20px' : '0',
                bottom: '20px',
                border: `2px solid ${colors.border}`,
              }} />
            </div>
          </motion.div>
        ))}



        {/* View All Pillars */}
        {maxPillars && pillars.length > maxPillars && (
          <div style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h4 style={{
                fontSize: '32px',
                fontWeight: '300',
                color: colors.text,
                margin: '0 0 8px 0',
                fontFamily: '"Nunito Sans", sans-serif',
                letterSpacing: '-0.02em',
              }}>
                More Pillars
              </h4>
              <p style={{
                fontSize: '16px',
                color: colors.textSecondary,
                margin: 0,
                fontFamily: '"Nunito Sans", sans-serif',
              }}>
                Explore our complete programme framework
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/programs'}
              style={{
                background: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                padding: "16px 32px",
                borderRadius: "0",
                fontWeight: "500",
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: '"Nunito Sans", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
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
                size={16} 
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
              padding: '20px'
            }}
            onClick={() => setSelectedPillar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: '16px',
                border: `1px solid ${colors.border}`,
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: `0 20px 60px ${colors.cardShadow}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ 
                height: '240px',
                backgroundColor: colors.border,
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
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '40px', maxHeight: '300px', overflow: 'auto' }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  lineHeight: '1.2',
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}>
                  {selectedPillar.name}
                </h3>
                
                <p style={{
                  color: colors.textSecondary,
                  fontSize: '16px',
                  lineHeight: '1.7',
                  marginBottom: '32px',
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '400',
                }}>
                  {selectedPillar.description}
                </p>

                {selectedPillar.focus_areas && selectedPillar.focus_areas.length > 0 && (
                  <div>
                    <h4 style={{
                      color: colors.text,
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '16px',
                      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}>
                      Focus Areas
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      {selectedPillar.focus_areas.map((fa) => (
                        <span
                          key={fa.id}
                          style={{
                            backgroundColor: colors.primary + '10',
                            color: colors.primary,
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: `1px solid ${colors.primary}20`,
                            fontFamily: '"Nunito Sans", sans-serif',
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