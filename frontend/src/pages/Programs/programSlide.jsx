import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Filter, Grid, List, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

// Clean fallback image
const DEFAULT_PILLAR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmOWZhZmIiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+';

const ProgrammePillarsSection = ({ 
  title = "Our Programme Pillars",
  subtitle = "Discover the core areas that drive our mission forward",
  showFilters = true,
  maxPillars = null,
  variant = "grid",
  showViewToggle = true,
  className = ""
}) => {
  const { colors, isDarkMode } = useTheme();
  
  // State management
  const [pillars, setPillars] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [error, setError] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('all');
  const [currentView, setCurrentView] = useState(variant);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [selectedPillar, setSelectedPillar] = useState(null);
  
  // Clean minimal colors
  const cleanColors = {
    ...colors,
    surface: isDarkMode ? '#1a1a1a' : '#ffffff',
    surfaceHover: isDarkMode ? '#262626' : '#fafafa',
    border: isDarkMode ? '#333333' : '#e5e7eb',
    borderHover: isDarkMode ? '#404040' : '#d1d5db',
    textPrimary: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#a1a1aa' : '#6b7280',
    textMuted: isDarkMode ? '#71717a' : '#9ca3af',
    accent: colors.primary,
    accentLight: colors.primary + '10',
    shadow: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
    shadowHover: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.15)'
  };
  
  // Image URL generation
  const getPillarImageUrl = useCallback((pillar) => {
    if (!pillar?.image) return DEFAULT_PILLAR_IMAGE;
    if (pillar.image.startsWith('http://') || pillar.image.startsWith('https://')) return pillar.image;
    if (pillar.image.startsWith('data:')) return pillar.image;
    if (pillar.image.startsWith('/uploads/')) return `${STATIC_URL}${pillar.image}`;
    if (!pillar.image.includes('/')) return `${STATIC_URL}/uploads/pillars/${pillar.image}`;
    return `${STATIC_URL}${pillar.image.startsWith('/') ? '' : '/'}${pillar.image}`;
  }, []);

  const handleImageError = useCallback((pillarId, event) => {
    setImageLoadStates(prev => ({ ...prev, [pillarId]: 'error' }));
    if (event.target.src !== DEFAULT_PILLAR_IMAGE) {
      event.target.src = DEFAULT_PILLAR_IMAGE;
    }
  }, []);

  // Fetch pillars data
  const fetchPillars = useCallback(async () => {
    try {
      setError('');
      const [pillarsRes, focusAreasRes] = await Promise.all([
        fetch(`${API_BASE}/pillars`, { 
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }),
        fetch(`${API_BASE}/pillars/meta/focus-areas`, { 
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        })
      ]);
      
      if (!pillarsRes.ok) throw new Error('Failed to load programme pillars');
      if (!focusAreasRes.ok) throw new Error('Failed to load focus areas');
      
      const pillarsData = await pillarsRes.json();
      const focusAreasData = await focusAreasRes.json();
      
      setPillars(pillarsData.data || []);
      setFocusAreas(focusAreasData.data || []);
      setImageLoadStates({});
    } catch (err) {
      console.error('Error fetching pillars:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchPillars();
  }, [fetchPillars]);

  // Filter and display logic
  const filteredPillars = pillars.filter(pillar => {
    if (selectedFocusArea === 'all') return true;
    return pillar.focus_areas?.some(fa => fa.id.toString() === selectedFocusArea);
  });

  const displayPillars = maxPillars ? filteredPillars.slice(0, maxPillars) : filteredPillars;

  // Clean animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "ease", duration: 0.5 }
    }
  };

  // Clean pillar card
  const renderPillarCard = useCallback((pillar, index) => {
    const imageUrl = getPillarImageUrl(pillar);

    return (
      <motion.div
        key={pillar.id}
        variants={itemVariants}
        className="pillar-card"
        style={{
          backgroundColor: cleanColors.surface,
          border: `1px solid ${cleanColors.border}`,
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          height: currentView === 'list' ? 'auto' : '400px',
          display: 'flex',
          flexDirection: currentView === 'list' ? 'row' : 'column'
        }}
        whileHover={{
          borderColor: cleanColors.borderHover,
          backgroundColor: cleanColors.surfaceHover,
          y: -4,
          boxShadow: `0 12px 40px ${cleanColors.shadowHover}`
        }}
        onClick={() => setSelectedPillar(pillar)}
      >
        {/* Image */}
        <div style={{
          height: currentView === 'list' ? '120px' : '200px',
          width: currentView === 'list' ? '200px' : '100%',
          minWidth: currentView === 'list' ? '200px' : 'auto',
          backgroundColor: cleanColors.border,
          overflow: 'hidden'
        }}>
          <img
            src={imageUrl}
            alt={pillar.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={(e) => handleImageError(pillar.id, e)}
          />
        </div>

        {/* Content */}
        <div style={{
          padding: currentView === 'list' ? '20px' : '24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            color: cleanColors.textPrimary,
            fontSize: currentView === 'list' ? '1.25rem' : '1.35rem',
            fontWeight: '600',
            margin: '0 0 12px 0',
            lineHeight: '1.3'
          }}>
            {pillar.name}
          </h3>
          
          <p style={{
            color: cleanColors.textSecondary,
            fontSize: '0.9rem',
            lineHeight: '1.6',
            margin: '0 0 16px 0',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: currentView === 'list' ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {pillar.description}
          </p>
          
          {/* Focus Areas */}
          {pillar.focus_areas && pillar.focus_areas.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pillar.focus_areas.slice(0, 3).map((fa) => (
                  <span
                    key={fa.id}
                    style={{
                      backgroundColor: cleanColors.accentLight,
                      color: cleanColors.accent,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: `1px solid ${cleanColors.accent}20`
                    }}
                  >
                    {fa.name}
                  </span>
                ))}
                {pillar.focus_areas.length > 3 && (
                  <span style={{
                    color: cleanColors.textMuted,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    padding: '4px 10px',
                    backgroundColor: cleanColors.border,
                    borderRadius: '12px'
                  }}>
                    +{pillar.focus_areas.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Explore indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: cleanColors.accent,
            fontSize: '0.85rem',
            fontWeight: '500',
            marginTop: 'auto'
          }}>
            <ChevronRight size={16} />
          </div>
        </div>
      </motion.div>
    );
  }, [cleanColors, currentView, imageLoadStates, getPillarImageUrl, handleImageError]);

  // Error state
  if (error) {
    return (
      <section className={className} style={{ 
        padding: '80px 20px',
        backgroundColor: cleanColors.background
      }}>
        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto', 
          textAlign: 'center',
          backgroundColor: cleanColors.surface,
          border: `1px solid ${colors.error}30`,
          borderRadius: '16px',
          padding: '40px'
        }}>
          <AlertCircle size={48} style={{ color: colors.error, marginBottom: '20px' }} />
          <h3 style={{ 
            color: cleanColors.textPrimary, 
            marginBottom: '12px',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Unable to Load Programme Pillars
          </h3>
          <p style={{ 
            color: cleanColors.textSecondary,
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            {error}
          </p>
          <motion.button
            onClick={fetchPillars}
            style={{
              backgroundColor: cleanColors.accent,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            whileHover={{ backgroundColor: colors.primaryDark }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={16} />
            Try Again
          </motion.button>
        </div>
      </section>
    );
  }

  // Empty state
  if (displayPillars.length === 0) {
    return (
      <section className={className} style={{ 
        padding: '80px 20px',
        backgroundColor: cleanColors.background
      }}>
        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto', 
          textAlign: 'center',
          backgroundColor: cleanColors.surface,
          border: `1px solid ${cleanColors.border}`,
          borderRadius: '16px',
          padding: '40px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: cleanColors.border,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Grid size={32} style={{ color: cleanColors.textMuted }} />
          </div>
          <h3 style={{ 
            color: cleanColors.textPrimary, 
            marginBottom: '12px',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            No Programme Pillars Found
          </h3>
          <p style={{ 
            color: cleanColors.textSecondary,
            lineHeight: '1.6',
            marginBottom: selectedFocusArea !== 'all' ? '24px' : '0'
          }}>
            {selectedFocusArea !== 'all' 
              ? 'No pillars match your selected filter.'
              : 'Programme pillars are currently being organized.'
            }
          </p>
          {selectedFocusArea !== 'all' && (
            <motion.button
              onClick={() => setSelectedFocusArea('all')}
              style={{
                backgroundColor: 'transparent',
                color: cleanColors.accent,
                border: `1px solid ${cleanColors.accent}`,
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              whileHover={{ backgroundColor: cleanColors.accentLight }}
              whileTap={{ scale: 0.98 }}
            >
              Show All Pillars
            </motion.button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={className} style={{ 
      padding: '80px 20px',
      backgroundColor: cleanColors.background
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h2 style={{
            color: cleanColors.textPrimary,
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: '600',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            {title}
          </h2>
          <p style={{
            color: cleanColors.textSecondary,
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {subtitle}
          </p>
        </motion.div>

    

        {/* Pillars Grid/List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: currentView === 'list' 
              ? '1fr' 
              : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {displayPillars.map(renderPillarCard)}
        </motion.div>

        {/* Show More Button */}
        {maxPillars && filteredPillars.length > maxPillars && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: '60px' }}
          >
            <motion.button
              style={{
                backgroundColor: 'transparent',
                color: cleanColors.accent,
                border: `1px solid ${cleanColors.accent}`,
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              whileHover={{
                backgroundColor: cleanColors.accent,
                color: 'white'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/programs'}
            >
              View All {filteredPillars.length} Pillars
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
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
                backgroundColor: cleanColors.surface,
                borderRadius: '16px',
                border: `1px solid ${cleanColors.border}`,
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Image */}
              <div style={{ 
                height: '240px',
                backgroundColor: cleanColors.border,
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

              {/* Modal Content */}
              <div style={{ padding: '32px', maxHeight: '300px', overflow: 'auto' }}>
                <h3 style={{
                  color: cleanColors.textPrimary,
                  fontSize: '1.75rem',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  {selectedPillar.name}
                </h3>
                
                <p style={{
                  color: cleanColors.textSecondary,
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  marginBottom: '24px'
                }}>
                  {selectedPillar.description}
                </p>

                {/* Focus Areas */}
                {selectedPillar.focus_areas && selectedPillar.focus_areas.length > 0 && (
                  <div>
                    <h4 style={{
                      color: cleanColors.textPrimary,
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '12px'
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
                            backgroundColor: cleanColors.accentLight,
                            color: cleanColors.accent,
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            border: `1px solid ${cleanColors.accent}20`
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