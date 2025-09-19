import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Filter, Grid, List, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

// Enhanced luxury pillar image fallback
const DEFAULT_PILLAR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NkYxO3N0b3Atb3BhY2l0eTowLjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI1Q0Y2O3N0b3Atb3BhY2l0eTowLjIiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZCkiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSIjNjM2NkYxIiBmaWxsLW9wYWNpdHk9IjAuMTUiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjI0IiBmaWxsPSIjOEI1Q0Y2IiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==';

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
  
  // Enhanced luxury colors
  const luxuryColors = {
    ...colors,
    gradientPrimary: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}25 100%)`,
    glassmorphism: isDarkMode 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.25)',
    backdrop: isDarkMode 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(255, 255, 255, 0.4)',
    shimmer: isDarkMode 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
    accent: isDarkMode ? '#F8FAFC' : '#1E293B',
    luxuryGold: '#D4AF37',
    luxurySilver: '#C0C0C0'
  };
  
  // Enhanced image URL generation
  const getPillarImageUrl = useCallback((pillar) => {
    if (!pillar?.image) {
      return DEFAULT_PILLAR_IMAGE;
    }
    
    if (pillar.image.startsWith('http://') || pillar.image.startsWith('https://')) {
      return pillar.image;
    }
    
    if (pillar.image.startsWith('data:')) {
      return pillar.image;
    }
    
    if (pillar.image.startsWith('/uploads/')) {
      return `${STATIC_URL}${pillar.image}`;
    }
    
    if (!pillar.image.includes('/')) {
      return `${STATIC_URL}/uploads/pillars/${pillar.image}`;
    }
    
    return `${STATIC_URL}${pillar.image.startsWith('/') ? '' : '/'}${pillar.image}`;
  }, []);

  const handleImageError = useCallback((pillarId, event) => {
    console.warn(`Image failed to load for pillar ${pillarId}`);
    setImageLoadStates(prev => ({
      ...prev,
      [pillarId]: 'error'
    }));
    
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
      
      if (!pillarsRes.ok) {
        throw new Error('Failed to load programme pillars');
      }
      
      if (!focusAreasRes.ok) {
        throw new Error('Failed to load focus areas');
      }
      
      const pillarsData = await pillarsRes.json();
      const focusAreasData = await focusAreasRes.json();
      
      const pillarsArray = pillarsData.data || [];
      const focusAreasArray = focusAreasData.data || [];
      
      setPillars(pillarsArray);
      setFocusAreas(focusAreasArray);
      setImageLoadStates({});
      
    } catch (err) {
      console.error('Error fetching pillars:', err);
      setError(err.message);
    } finally {
    }
  }, []);

  useEffect(() => {
    fetchPillars();
  }, [fetchPillars]);

  // Filter pillars based on selected focus area
  const filteredPillars = pillars.filter(pillar => {
    if (selectedFocusArea === 'all') return true;
    return pillar.focus_areas?.some(fa => fa.id.toString() === selectedFocusArea);
  });

  // Apply max pillars limit if specified
  const displayPillars = maxPillars ? filteredPillars.slice(0, maxPillars) : filteredPillars;

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.95,
      rotateX: 15
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
        duration: 0.6
      }
    }
  };

  // Luxury pillar card component
  const renderPillarCard = useCallback((pillar, index) => {
    const imageUrl = getPillarImageUrl(pillar);
    const hasImageError = imageLoadStates[pillar.id] === 'error';

    return (
      <motion.div
        key={pillar.id}
        variants={itemVariants}
        className="luxury-pillar-card"
        style={{
          background: currentView === 'list' 
            ? `linear-gradient(135deg, ${luxuryColors.glassmorphism} 0%, ${luxuryColors.backdrop} 100%)`
            : luxuryColors.gradientPrimary,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${luxuryColors.shimmer}`,
          borderRadius: currentView === 'list' ? '24px' : '28px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          height: currentView === 'list' ? 'auto' : '450px',
          display: 'flex',
          flexDirection: currentView === 'list' ? 'row' : 'column',
          position: 'relative',
          boxShadow: currentView === 'list' 
            ? `0 8px 32px ${colors.cardShadow}20`
            : `0 12px 40px ${colors.cardShadow}25`,
        }}
        whileHover={{
          y: -12,
          scale: 1.02,
          rotateX: -2,
          boxShadow: currentView === 'list' 
            ? `0 16px 50px ${colors.cardShadow}30`
            : `0 20px 60px ${colors.cardShadow}35`,
          borderColor: colors.primary + '60'
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        onClick={() => setSelectedPillar(pillar)}
      >
        {/* Shimmer overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent 0%, ${luxuryColors.shimmer} 50%, transparent 100%)`,
          animation: 'shimmer 3s infinite',
          pointerEvents: 'none'
        }} />

        {/* Image Section */}
        <div 
          style={{
            position: 'relative',
            height: currentView === 'list' ? '140px' : '220px',
            width: currentView === 'list' ? '220px' : '100%',
            minWidth: currentView === 'list' ? '220px' : 'auto',
            backgroundColor: luxuryColors.backdrop,
            overflow: 'hidden',
            borderRadius: currentView === 'list' 
              ? '20px 0 0 20px' 
              : '24px 24px 0 0'
          }}
        >
          <img
            src={imageUrl}
            alt={pillar.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'brightness(1.05) contrast(1.1) saturate(1.2)'
            }}
            onError={(e) => handleImageError(pillar.id, e)}
          />
          
          {hasImageError && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: luxuryColors.luxuryGold,
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Premium
            </div>
          )}
          
          {/* Luxury gradient overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: `linear-gradient(transparent 0%, ${colors.black}40 70%, ${colors.black}70 100%)`
          }} />

          {/* Floating accent */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: luxuryColors.luxuryGold,
            boxShadow: `0 0 20px ${luxuryColors.luxuryGold}60`
          }} />
        </div>

        {/* Content Section */}
        <div style={{
          padding: currentView === 'list' ? '24px' : '28px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: currentView === 'list' 
            ? 'transparent'
            : `linear-gradient(135deg, ${colors.cardBg} 0%, ${luxuryColors.glassmorphism} 100%)`,
          backdropFilter: currentView === 'list' ? 'none' : 'blur(10px)'
        }}>
          {/* Premium indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Sparkles 
              size={16} 
              style={{ 
                color: luxuryColors.luxuryGold,
                filter: `drop-shadow(0 0 8px ${luxuryColors.luxuryGold}40)`
              }} 
            />
            <span style={{
              color: luxuryColors.luxuryGold,
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Programme Pillar
            </span>
          </div>

          <h3 style={{
            color: colors.text,
            fontSize: currentView === 'list' ? '1.35rem' : '1.45rem',
            fontWeight: '700',
            marginBottom: '12px',
            lineHeight: '1.3',
            letterSpacing: '-0.02em'
          }}>
            {pillar.name}
          </h3>
          
          <p style={{
            color: colors.textSecondary,
            fontSize: '0.95rem',
            lineHeight: '1.7',
            marginBottom: '20px',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: currentView === 'list' ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: '400'
          }}>
            {pillar.description}
          </p>
          
          {/* Focus Areas */}
          {pillar.focus_areas && pillar.focus_areas.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {pillar.focus_areas.slice(0, 3).map((fa) => (
                  <span
                    key={fa.id}
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.primary}30 100%)`,
                      color: colors.primary,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: `1px solid ${colors.primary}40`,
                      backdropFilter: 'blur(10px)',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {fa.name}
                  </span>
                ))}
                {pillar.focus_areas.length > 3 && (
                  <span style={{
                    color: colors.textSecondary,
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '6px 14px',
                    backgroundColor: luxuryColors.shimmer,
                    borderRadius: '20px',
                    border: `1px solid ${colors.border}60`
                  }}>
                    +{pillar.focus_areas.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Explore indicator */}
          <motion.div
            className="explore-indicator"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              color: colors.primary,
              fontSize: '0.85rem',
              fontWeight: '600',
              marginTop: 'auto',
              opacity: 0.8
            }}
            whileHover={{ 
              x: 6,
              opacity: 1,
              transition: { duration: 0.2 }
            }}
          >
            <ChevronRight 
              size={18} 
              style={{
                filter: `drop-shadow(0 0 8px ${colors.primary}40)`
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }, [colors, luxuryColors, currentView, imageLoadStates, getPillarImageUrl, handleImageError]);

  // Enhanced error state
  if (error) {
    return (
      <section className={className} style={{ 
        padding: '100px 20px',
        background: `linear-gradient(135deg, ${colors.background} 0%, ${luxuryColors.backdrop} 100%)`
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center',
          background: luxuryColors.gradientPrimary,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.error}30`,
          borderRadius: '24px',
          padding: '50px',
          boxShadow: `0 20px 60px ${colors.cardShadow}30`
        }}>
          <AlertCircle 
            size={56} 
            style={{ 
              color: colors.error, 
              marginBottom: '24px',
              filter: `drop-shadow(0 0 20px ${colors.error}40)`
            }} 
          />
          <h3 style={{ 
            color: colors.text, 
            marginBottom: '16px',
            fontSize: '1.75rem',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            Unable to Load Programme Pillars
          </h3>
          <p style={{ 
            color: colors.textSecondary,
            marginBottom: '32px',
            lineHeight: '1.7',
            fontSize: '1rem'
          }}>
            {error}
          </p>
          <motion.button
            onClick={fetchPillars}
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              color: colors.white,
              border: 'none',
              padding: '16px 32px',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto',
              boxShadow: `0 8px 30px ${colors.primary}40`
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: `0 12px 40px ${colors.primary}50`
            }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={18} />
            Try Again
          </motion.button>
        </div>
      </section>
    );
  }

  // Enhanced empty state
  if (displayPillars.length === 0) {
    return (
      <section className={className} style={{ 
        padding: '100px 20px',
        background: `linear-gradient(135deg, ${colors.background} 0%, ${luxuryColors.backdrop} 100%)`
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center',
          background: luxuryColors.gradientPrimary,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${luxuryColors.shimmer}`,
          borderRadius: '24px',
          padding: '50px',
          boxShadow: `0 20px 60px ${colors.cardShadow}30`
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${luxuryColors.shimmer} 100%)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            border: `2px solid ${luxuryColors.shimmer}`
          }}>
            <Grid size={40} style={{ color: colors.textMuted }} />
          </div>
          <h3 style={{ 
            color: colors.text, 
            marginBottom: '16px',
            fontSize: '1.75rem',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            No Programme Pillars Found
          </h3>
          <p style={{ 
            color: colors.textSecondary,
            lineHeight: '1.7',
            fontSize: '1rem',
            marginBottom: selectedFocusArea !== 'all' ? '32px' : '0'
          }}>
            {selectedFocusArea !== 'all' 
              ? 'No pillars match your selected filter. Try selecting a different focus area.'
              : 'Programme pillars are currently being organized. Please check back soon.'
            }
          </p>
          {selectedFocusArea !== 'all' && (
            <motion.button
              onClick={() => setSelectedFocusArea('all')}
              style={{
                background: 'transparent',
                color: colors.primary,
                border: `2px solid ${colors.primary}`,
                padding: '12px 24px',
                borderRadius: '16px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              whileHover={{ 
                backgroundColor: colors.primary + '15',
                scale: 1.05
              }}
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
      padding: '100px 20px',
      background: `linear-gradient(135deg, ${colors.background} 0%, ${luxuryColors.backdrop} 100%)`,
      position: 'relative'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.primary}10 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '80px' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              padding: '8px 20px',
              backgroundColor: luxuryColors.glassmorphism,
              backdropFilter: 'blur(20px)',
              borderRadius: '50px',
              border: `1px solid ${luxuryColors.shimmer}`
            }}
          >
            <Sparkles size={18} style={{ color: luxuryColors.luxuryGold }} />
            <span style={{
              color: colors.primary,
              fontSize: '0.9rem',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              EXCELLENCE PILLARS
            </span>
          </motion.div>

          <h2 style={{
            color: colors.text,
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '20px',
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {title}
          </h2>
          <p style={{
            color: colors.textSecondary,
            fontSize: '1.25rem',
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto',
            fontWeight: '400'
          }}>
            {subtitle}
          </p>
        </motion.div>

        {/* Enhanced Filters and Controls */}
        {(showFilters || showViewToggle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '60px',
              flexWrap: 'wrap',
              gap: '20px',
              padding: '20px',
              background: luxuryColors.glassmorphism,
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: `1px solid ${luxuryColors.shimmer}`
            }}
          >
            {/* Enhanced Focus Area Filter */}
            {showFilters && focusAreas.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Filter size={20} style={{ color: colors.primary }} />
                <select
                  value={selectedFocusArea}
                  onChange={(e) => setSelectedFocusArea(e.target.value)}
                  style={{
                    background: `linear-gradient(135deg, ${colors.surface} 0%, ${luxuryColors.backdrop} 100%)`,
                    color: colors.text,
                    border: `1px solid ${luxuryColors.shimmer}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <option value="all">All Focus Areas ({pillars.length})</option>
                  {focusAreas.map((fa) => {
                    const count = pillars.filter(p => 
                      p.focus_areas?.some(pfa => pfa.id === fa.id)
                    ).length;
                    return (
                      <option key={fa.id} value={fa.id.toString()}>
                        {fa.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Enhanced View Toggle */}
            {showViewToggle && (
              <div style={{
                display: 'flex',
                background: luxuryColors.backdrop,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${luxuryColors.shimmer}`,
                borderRadius: '12px',
                padding: '4px'
              }}>
                {['grid', 'list'].map((view) => (
                  <motion.button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    style={{
                      background: currentView === view 
                        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
                        : 'transparent',
                      color: currentView === view ? colors.white : colors.text,
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{
                      backgroundColor: currentView === view 
                        ? undefined 
                        : luxuryColors.shimmer
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {view === 'grid' ? <Grid size={16} /> : <List size={16} />}
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Enhanced Pillars Grid/List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: currentView === 'list' 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '32px'
          }}
        >
          {displayPillars.map(renderPillarCard)}
        </motion.div>

        {/* Enhanced Show More Button */}
        {maxPillars && filteredPillars.length > maxPillars && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              textAlign: 'center',
              marginTop: '80px'
            }}
          >
            <motion.button
              style={{
                background: `linear-gradient(135deg, transparent 0%, ${luxuryColors.glassmorphism} 100%)`,
                color: colors.primary,
                border: `2px solid ${colors.primary}`,
                padding: '18px 36px',
                borderRadius: '20px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backdropFilter: 'blur(20px)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
              whileHover={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                color: colors.white,
                scale: 1.05,
                boxShadow: `0 15px 50px ${colors.primary}40`
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/programs'}
            >
              <Sparkles size={20} />
              Explore All {filteredPillars.length} Pillars
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Enhanced Pillar Detail Modal */}
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
              backgroundColor: luxuryColors.overlayBg || colors.overlayBg,
              backdropFilter: 'blur(20px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setSelectedPillar(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${luxuryColors.glassmorphism} 100%)`,
                backdropFilter: 'blur(30px)',
                borderRadius: '24px',
                border: `1px solid ${luxuryColors.shimmer}`,
                maxWidth: '700px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: `0 25px 80px ${colors.cardShadow}40`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Modal Image */}
              <div style={{ 
                height: '280px',
                background: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${luxuryColors.backdrop} 100%)`,
                borderRadius: '24px 24px 0 0',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img
                  src={getPillarImageUrl(selectedPillar)}
                  alt={selectedPillar.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(1.1) contrast(1.1) saturate(1.3)'
                  }}
                />
                
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: `linear-gradient(transparent 0%, ${colors.black}50 100%)`
                }} />

                {/* Enhanced close button */}
                <motion.button
                  onClick={() => setSelectedPillar(null)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: luxuryColors.glassmorphism,
                    backdropFilter: 'blur(20px)',
                    color: colors.white,
                    border: `1px solid ${luxuryColors.shimmer}`,
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: colors.error + '20'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>

                {/* Luxury indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: luxuryColors.glassmorphism,
                  backdropFilter: 'blur(20px)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${luxuryColors.shimmer}`
                }}>
                  <Sparkles size={16} style={{ color: luxuryColors.luxuryGold }} />
                  <span style={{
                    color: colors.white,
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Premium Pillar
                  </span>
                </div>
              </div>

              {/* Enhanced Modal Content */}
              <div style={{ padding: '40px' }}>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: colors.text,
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '20px',
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {selectedPillar.name}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    color: colors.textSecondary,
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    marginBottom: '32px',
                    fontWeight: '400'
                  }}
                >
                  {selectedPillar.description}
                </motion.p>

                {/* Enhanced Focus Areas */}
                {selectedPillar.focus_areas && selectedPillar.focus_areas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 style={{
                      color: colors.text,
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Sparkles size={18} style={{ color: luxuryColors.luxuryGold }} />
                      Focus Areas:
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {selectedPillar.focus_areas.map((fa, index) => (
                        <motion.span
                          key={fa.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.primary}35 100%)`,
                            color: colors.primary,
                            padding: '8px 18px',
                            borderRadius: '25px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            border: `1px solid ${colors.primary}50`,
                            backdropFilter: 'blur(10px)',
                            letterSpacing: '0.3px'
                          }}
                        >
                          {fa.name}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .luxury-pillar-card:hover img {
          transform: scale(1.05);
        }
        
        .luxury-pillar-card:hover .explore-indicator {
          transform: translateX(8px);
        }
        
        /* Custom scrollbar for modal */
        .luxury-pillar-card::-webkit-scrollbar {
          width: 6px;
        }
        
        .luxury-pillar-card::-webkit-scrollbar-track {
          background: ${luxuryColors.backdrop};
          border-radius: 3px;
        }
        
        .luxury-pillar-card::-webkit-scrollbar-thumb {
          background: ${colors.primary}60;
          border-radius: 3px;
        }
        
        .luxury-pillar-card::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary}80;
        }
      `}</style>
    </section>
  );
};

export default ProgrammePillarsSection;