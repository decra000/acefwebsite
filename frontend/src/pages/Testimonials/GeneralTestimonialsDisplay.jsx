import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, User, Users, Heart, Handshake, Star, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';
import { motion } from 'framer-motion';

const GeneralTestimonialsDisplay = ({ 
  showTabs = true, 
  defaultType = 'all', 
  maxItems = null,
  showFeaturedFirst = true,
  title = "Stories of transformation",
  showCTA = true,
  className = ""
}) => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(getTabIndex(defaultType));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const { colors, isDarkMode } = useTheme();

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Nature placeholder image as base64 data URL
  const naturePlaceholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgwIiBoZWlnaHQ9IjM4MCIgdmlld0JveD0iMCAwIDM4MCAzODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InNreUdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4N0NFRUIiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzNEMEY0Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3Jhc3NHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjhEMzkxIi8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzM0RDA1OSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIzODAiIGhlaWdodD0iMzgwIiBmaWxsPSJ1cmwoI3NreUdyYWRpZW50KSIvPgo8Y2lyY2xlIGN4PSIzMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiNGRkM5NDciIG9wYWNpdHk9IjAuOCIvPgo8Y2lyY2xlIGN4PSIzMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNGRkY3RUQiLz4KPHBhdGggZD0iTTAgMjgwIFEwIDI2MCA0MCAyNTAgUTEwMCAyMzAgMTYwIDI0MCBRMjIwIDI1MCAyODAgMjMwIFEzNDAgMjEwIDM4MCAyMzAgVjM4MCBIMC4wNSBaIiBmaWxsPSJ1cmwoI2dyYXNzR3JhZGllbnQpIi8+CjxlbGxpcHNlIGN4PSI5MCIgY3k9IjE4MCIgcng9IjEwIiByeT0iNDAiIGZpbGw9IiMzOTcyNDkiLz4KPGVsbGlwc2UgY3g9IjIwMCIgY3k9IjE2MCIgcng9IjE1IiByeT0iNTAiIGZpbGw9IiMzOTcyNDkiLz4KPGVsbGlwc2UgY3g9IjMxMCIgY3k9IjE3MCIgcng9IjEyIiByeT0iNDUiIGZpbGw9IiMzOTcyNDkiLz4KPGNpcmNsZSBjeD0iOTAiIGN5PSIxNDAiIHI9IjI1IiBmaWxsPSIjNjhEMzkxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2OEQzOTEiLz4KPGNpcmNsZSBjeD0iMzEwIiBjeT0iMTI1IiByPSIzMCIgZmlsbD0iIzY4RDM5MSIvPgo8cGF0aCBkPSJNNjAgMzIwIFE4MCAzMTUgMTAwIDMyMCBRMTIwIDMyNSAxNDAgMzIwIFExNjAgMzE1IDE4MCAzMjAgUTIwMCAzMjUgMjIwIDMyMCBRMjQwIDMxNSAyNjAgMzIwIFEyODAgMzI1IDMwMCAzMjAgUTMyMCAzMTUgMzQwIDMyMCBWMzgwIEg2MFoiIGZpbGw9IiM1Qzk4NkMiLz4KPC9zdmc+";

  function getTabIndex(type) {
    const tabMap = { 'all': 0, 'community': 1, 'volunteers': 2, 'collaborators': 3 };
    return tabMap[type] || 0;
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || filteredTestimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredTestimonials.length]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
    setCurrentIndex(0);
  }, [testimonials, activeTab, maxItems, showFeaturedFirst]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/generaltestimonials/public`);
      setTestimonials(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];

    if (activeTab === 1) {
      filtered = filtered.filter(t => t.type === 'community');
    } else if (activeTab === 2) {
      filtered = filtered.filter(t => t.type === 'volunteers');
    } else if (activeTab === 3) {
      filtered = filtered.filter(t => t.type === 'collaborators');
    }

    if (showFeaturedFirst) {
      const featured = filtered.filter(t => t.featured);
      const nonFeatured = filtered.filter(t => !t.featured);
      filtered = [...featured, ...nonFeatured];

      if (maxItems && maxItems > 0) {
        filtered = [
          ...featured.slice(0, maxItems), 
          ...nonFeatured.slice(0, maxItems - featured.length)
        ];
      }
    } else {
      if (maxItems && maxItems > 0) {
        filtered = filtered.slice(0, maxItems);
      }
    }

    setFilteredTestimonials(filtered);
  };

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    setCurrentIndex(0);
  };

  const nextTestimonial = () => {
    if (filteredTestimonials.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
      setIsAutoPlaying(false);
    }
  };

  const prevTestimonial = () => {
    if (filteredTestimonials.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
      setIsAutoPlaying(false);
    }
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const getTypeIcon = (type) => {
    const iconProps = { size: 14, strokeWidth: 2 };
    switch (type?.toLowerCase()) {
      case 'community':
        return <Users {...iconProps} />;
      case 'volunteers':
        return <Heart {...iconProps} />;
      case 'collaborators':
        return <Handshake {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  const getTypeDisplayName = (type) => {
    switch (type?.toLowerCase()) {
      case 'community':
        return 'Community member';
      case 'volunteers':
        return 'Volunteer';
      case 'collaborators':
        return 'Collaborator';
      default:
        return 'Member';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'community':
        return '#3b82f6';
      case 'volunteers':
        return '#ef4444';
      case 'collaborators':
        return '#10b981';
      default:
        return colors.primary;
    }
  };

  const tabs = [
    { label: 'All stories', icon: <Users size={12} /> },
    { label: 'Community', icon: <Users size={12} /> },
    { label: 'Volunteers', icon: <Heart size={12} /> },
    { label: 'Collaborators', icon: <Handshake size={12} /> }
  ];

  if (loading) {
    return (
      <section style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      fontFamily: 'inherit',
        background: isDarkMode ? '#000000' : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)'
      }}>
        <div style={{ 
          textAlign: 'center',
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite',
            marginBottom: '16px',
            margin: '0 auto 16px'
          }}></div>
          <p style={{
            color: colors.textSecondary,
            fontSize: '13px',
            fontWeight: '500',
            margin: 0
          }}>
            Loading stories...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      fontFamily: 'inherit',
        background: isDarkMode ? '#000000' : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)'
      }}>
        <div style={{
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.9)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          border: `1px solid rgba(239, 68, 68, 0.2)`,
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Quote size={20} color="#44ef86ff" />
          </div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 8px 0'
          }}>
            Unable to load stories
          </h3>
          <p style={{
            fontSize: '13px',
            color: colors.textSecondary,
            margin: '0 0 20px 0'
          }}>
            {error}
          </p>
          <button 
            onClick={fetchTestimonials}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  // Get current testimonial or null if empty
  const currentTestimonial = filteredTestimonials.length > 0 ? filteredTestimonials[currentIndex] : null;

  return (
    <section style={{
      fontFamily: 'inherit',
      background: isDarkMode ? '#000000' : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Header Section - Always visible */}
      <div style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
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
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '300',
              color: isDarkMode ? colors.text : colors.primary,
              lineHeight: '1.2',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
      fontFamily: 'inherit',
            }}
          >
              Stories of <span style={{ fontWeight: '700', color: colors.primary }}>Impact</span>
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
            Real stories from the people whose lives we've touched and who have helped us grow
          </motion.p>
        </div>

        {/* Tab Navigation - Always visible */}
        {showTabs && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              background: isDarkMode 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '4px',
              border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              boxShadow: isDarkMode 
                ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              display: 'inline-flex',
              gap: '2px',
              flexWrap: 'wrap'
            }}>
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabChange(index)}
                  style={{
                    background: activeTab === index 
                      ? (isDarkMode ? colors.surface : 'white')
                      : 'transparent',
                    color: activeTab === index ? colors.text : colors.textSecondary,
                    border: 'none',
                    padding: '7px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: activeTab === index ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: activeTab === index 
                      ? (isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)') 
                      : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== index) {
                      e.target.style.background = isDarkMode 
                        ? 'rgba(71, 85, 105, 0.3)' 
                        : 'rgba(255, 255, 255, 0.5)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== index) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area with Full Width */}
      <div style={{
        width: '100%',
        margin: '0',
        padding: '0 40px 60px 40px', // Added horizontal padding for arrow space
        position: 'relative'
      }}>
        {/* Empty State or Testimonial Display */}
        {!currentTestimonial ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: isDarkMode 
              ? 'rgba(30, 41, 59, 0.6)' 
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isDarkMode 
                ? 'rgba(71, 85, 105, 0.3)' 
                : 'rgba(107, 114, 128, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Quote size={24} color={colors.textMuted} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: colors.text,
              margin: '0 0 8px 0'
            }}>
              No testimonials available
            </h3>
            <p style={{
              fontSize: '13px',
              color: colors.textSecondary,
              margin: '0'
            }}>
              Check back later for inspiring stories from our community
            </p>
          </div>
        ) : (
          <>
            {/* Main Testimonial Display - Single Column Layout */}
            <div style={{ position: 'relative' }}>
              {/* Navigation Arrows - Positioned within container */}
              {!isMobile && filteredTestimonials.length > 1 && (
                <>
                  <button
                    onClick={prevTestimonial}
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: isDarkMode 
                        ? 'rgba(30, 41, 59, 0.9)' 
                        : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      zIndex: 10
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-50%) scale(1.05)';
                      e.target.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(-50%) scale(1)';
                      e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <ChevronLeft size={22} color={colors.text} />
                  </button>

                  <button
                    onClick={nextTestimonial}
                    style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: isDarkMode 
                        ? 'rgba(30, 41, 59, 0.9)' 
                        : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      zIndex: 10
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-50%) scale(1.05)';
                      e.target.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(-50%) scale(1)';
                      e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <ChevronRight size={22} color={colors.text} />
                  </button>
                </>
              )}

              {/* Main Content - Responsive Layout */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '0', // Remove gap to balance layout
                alignItems: 'center',
                minHeight: isMobile ? '600px' : '550px', // Increased height, especially for mobile
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.5)' 
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '0px',
                padding: '0', // Remove padding
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                boxShadow: isDarkMode 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.08)',
                textAlign: isMobile ? 'center' : 'left',
                overflow: 'hidden'
              }}>
                {/* Image Section - No padding, perfect fit */}
                <div style={{
                  flex: isMobile ? 'none' : '1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  order: isMobile ? 1 : 1,
                  width: isMobile ? '100%' : '50%',
                  height: isMobile ? '350px' : '550px' // Increased heights
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                  }}>
                    {currentTestimonial.image ? (
                      <img
                        src={`${STATIC_URL}/uploads/testimonials/${currentTestimonial.image}`}
                        alt={`${currentTestimonial.first_name} ${currentTestimonial.last_name}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          border: 'none',
                          filter: 'brightness(1.02) contrast(1.01)',
                          transition: 'all 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    
                    {/* Nature placeholder */}
                    <img 
                      src={naturePlaceholder}
                      alt="Nature landscape"
                      style={{ 
                        display: currentTestimonial.image ? 'none' : 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        border: 'none'
                      }}
                    />

                    {/* Featured badge */}
                    {currentTestimonial.featured && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        borderRadius: '16px',
                        padding: '5px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
                        animation: 'pulse 2s infinite'
                      }}>
                        <Star size={10} color="white" fill="white" />
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div style={{
                  flex: isMobile ? 'none' : '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: isMobile ? '25px' : '20px',
                  order: isMobile ? 2 : 2,
                  padding: isMobile ? '40px 25px' : '60px 50px', // Increased padding for better mobile spacing
                  width: isMobile ? '100%' : '50%',
                  minHeight: isMobile ? '250px' : 'auto' // Ensure minimum content height on mobile
                }}>
                  {/* Quote icon */}
                  <Quote 
                    size={isMobile ? 32 : 28} // Larger quote icon on mobile
                    color={getTypeColor(currentTestimonial.type)} 
                    style={{ 
                      opacity: 0.7, 
                      alignSelf: isMobile ? 'center' : 'flex-start'
                    }} 
                  />

                  {/* Testimonial text */}
                  <blockquote style={{
                    fontSize: isMobile ? '16px' : '18px', // Increased font sizes
                    lineHeight: isMobile ? '1.7' : '1.6',
                    color: colors.text,
                    margin: 0,
                    fontStyle: 'italic',
                    fontWeight: '400',
                    textAlign: isMobile ? 'center' : 'left',
                    maxWidth: isMobile ? 'none' : '600px' // Better text width control
                  }}>
                    "{currentTestimonial.testimonial}"
                  </blockquote>

                  {/* Person info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingTop: isMobile ? '20px' : '16px',
                    borderTop: `2px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(107, 114, 128, 0.1)'}`,
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: isMobile ? '17px' : '15px', // Larger name on mobile
                        fontWeight: '600',
                        color: colors.text,
                        margin: '0 0 6px 0'
                      }}>
                        {currentTestimonial.first_name} {currentTestimonial.last_name}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: `${getTypeColor(currentTestimonial.type)}15`,
                        padding: isMobile ? '4px 10px' : '3px 8px', // Slightly larger padding on mobile
                        borderRadius: '10px',
                        width: 'fit-content',
                        margin: isMobile ? '0 auto' : '0' // Center on mobile
                      }}>
                        {getTypeIcon(currentTestimonial.type)}
                        <span style={{
                          fontSize: isMobile ? '12px' : '11px', // Slightly larger text on mobile
                          fontWeight: '500',
                          color: getTypeColor(currentTestimonial.type)
                        }}>
                          {getTypeDisplayName(currentTestimonial.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Arrows */}
            {isMobile && filteredTestimonials.length > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px', // Increased gap for better touch targets
                marginTop: '30px', // Increased margin
                padding: '0 20px' // Added padding for edge protection
              }}>
                <button
                  onClick={prevTestimonial}
                  style={{
                    background: isDarkMode 
                      ? 'rgba(30, 41, 59, 0.9)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                    borderRadius: '50%',
                    width: '52px', // Larger touch targets
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    touchAction: 'manipulation' // Better touch handling
                  }}
                >
                  <ChevronLeft size={24} color={colors.text} />
                </button>

                <button
                  onClick={nextTestimonial}
                  style={{
                    background: isDarkMode 
                      ? 'rgba(30, 41, 59, 0.9)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                    borderRadius: '50%',
                    width: '52px', // Larger touch targets
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    touchAction: 'manipulation' // Better touch handling
                  }}
                >
                  <ChevronRight size={24} color={colors.text} />
                </button>
              </div>
            )}

            {/* Bottom Navigation Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '14px',
              marginTop: isMobile ? '35px' : '28px', // More space on mobile
              padding: isMobile ? '0 20px' : '0' // Edge padding on mobile
            }}>
              {/* Dots indicator */}
              <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '5px', // Larger gaps on mobile for better touch
                alignItems: 'center'
              }}>
                {filteredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    style={{
                      width: currentIndex === index ? (isMobile ? '22px' : '18px') : (isMobile ? '10px' : '6px'),
                      height: isMobile ? '10px' : '6px', // Larger dots on mobile
                      borderRadius: isMobile ? '5px' : '3px',
                      background: currentIndex === index 
                        ? getTypeColor(currentTestimonial.type) 
                        : (isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(107, 114, 128, 0.3)'),
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      touchAction: 'manipulation' // Better touch handling
                    }}
                  />
                ))}
              </div>

              {/* Auto-play toggle */}
              {filteredTestimonials.length > 1 && (
                <button
                  onClick={toggleAutoPlay}
                  style={{
                    background: isAutoPlaying 
                      ? getTypeColor(currentTestimonial.type) 
                      : (isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isAutoPlaying 
                      ? getTypeColor(currentTestimonial.type) 
                      : (isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)')}`,
                    borderRadius: '14px',
                    width: isMobile ? '42px' : '36px', // Larger on mobile
                    height: isMobile ? '42px' : '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginLeft: '6px',
                    touchAction: 'manipulation' // Better touch handling
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {isAutoPlaying ? 
                    <Pause size={isMobile ? 16 : 14} color="white" /> : 
                    <Play size={isMobile ? 16 : 14} color={colors.text} />
                  }
                </button>
              )}
            </div>

            {/* Progress indicator */}
            {filteredTestimonials.length > 1 && (
              <div style={{
                marginTop: isMobile ? '20px' : '16px', // More space on mobile
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: isMobile ? '12px' : '11px', // Slightly larger on mobile
                padding: isMobile ? '0 20px' : '0' // Edge padding on mobile
              }}>
                {currentIndex + 1} of {filteredTestimonials.length} stories
              </div>
            )}
          </>
        )}
      </div>

      {/* CSS-in-JS styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          div[style*="padding: '0 40px 60px 40px'"] {
            padding: 0 20px 60px 20px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default GeneralTestimonialsDisplay;