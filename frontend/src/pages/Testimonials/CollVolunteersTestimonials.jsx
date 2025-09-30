import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Quote, User, Heart, Handshake, Star, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const CollVolunteersTestimonials = ({ 
  title = "Our Volunteers & Collaborators",
  maxItems = null,
  showFeaturedFirst = true,
  showCTA = true,
  className = "" 
}) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadedImages, setLoadedImages] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sliderRef = useRef(null);

  const { colors, isDarkMode } = useTheme();

  const naturePlaceholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJza3lHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5N0M5RjUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4M0QwRjciLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZ3Jhc3NHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM3MkQzOTUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzNEQwNTkiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0ibW91bnRhaW5HcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2RDcyODAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0QjU1NjMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNza3lHcmFkaWVudCkiLz48ZWxsaXBzZSBjeD0iMzIwIiBjeT0iNzUiIHJ4PSI0MiIgcnk9IjQyIiBmaWxsPSIjRkZEQjM3IiBvcGFjaXR5PSIwLjkiLz48ZWxsaXBzZSBjeD0iMzIwIiBjeT0iNzUiIHJ4PSIzMiIgcnk9IjMyIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjgiLz48cGF0aCBkPSJNMCAxODBRNTAgMTUwIDEwMCAxNzBRMTUwIDE2MCAyMDAgMTgwUTI1MCAyMDAgMzAwIDE3MFEzNTAgMTUwIDQwMCAxNzVWMjUwUTM1MCAyMzAgMzAwIDI0MFEyNTAgMjUwIDIwMCAyMzBRMTUwIDIyMCAxMDAgMjMwUTUwIDI0MCAzMCAyNDBWMTgwWiIgZmlsbD0idXJsKCNtb3VudGFpbkdyYWRpZW50KSIgb3BhY2l0eT0iMC44Ii8+PHBhdGggZD0iTTAgMjkwUTMwIDI3MCA3MCAyODBRMTIwIDI2MCAxNzAgMjgwUTIyMCAzMDAgMjcwIDI4MFEzMjAgMjYwIDM3MCAyNzVRNDAwIDI4MCA0MDAgMjg1VjQwMEgwVjQwMFoiIGZpbGw9InVybCgjZ3Jhc3NHcmFkaWVudCkiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMjAwIiByeD0iMTIiIHJ5PSI1MCIgZmlsbD0iIzM5NzI0OSIvPjxlbGxpcHNlIGN4PSIxODAiIGN5PSIxODAiIHJ4PSIxNSIgcnk9IjU1IiBmaWxsPSIjMzk3MjQ5Ii8+PGVsbGlwc2UgY3g9IjMwMCIgY3k9IjE5MCIgcng9IjEwIiByeT0iNDUiIGZpbGw9IiMzOTcyNDkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNTAiIHI9IjI4IiBmaWxsPSIjNkJEMzhEIi8+PGNpcmNsZSBjeD0iMTgwIiBjeT0iMTI1IiByPSIzNSIgZmlsbD0iIzZCRDM4RCIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE0NSIgcj0iMjUiIGZpbGw9IiM2QkQzOEQiLz48cGF0aCBkPSJNNTAgMzQwUTgwIDMzNSAxMTAgMzQwUTE0MCAzNDUgMTcwIDM0MFExOTAgMzM1IDIyMCAzNDBRMjUwIDM0NSAyODAgMzQwUTMxMCAzMzUgMzQwIDM0MFEzNzAgMzQ1IDQwMCAzNDBWNDAwSDUwWiIgZmlsbD0iIzVDQkM3NSIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iMzIwIiByPSI0IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjgiLz48Y2lyY2xlIGN4PSIzNTAiIGN5PSIzMTAiIHI9IjMiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuNyIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjMyNSIgcj0iNSIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC43Ii8+PC9zdmc+";

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch testimonials from API
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/generaltestimonials/public`);
      let filteredData = response.data.filter(t => 
        t.type === 'volunteers' || t.type === 'collaborators'
      );

      if (showFeaturedFirst) {
        filteredData = filteredData.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
      }

      if (maxItems && maxItems > 0) {
        filteredData = filteredData.slice(0, maxItems);
      }

      setTestimonials(filteredData);
      setError('');
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  const getTypeIcon = (type) => {
    const iconProps = { size: isMobile ? 12 : 14, strokeWidth: 2 };
    switch (type?.toLowerCase()) {
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
      case 'volunteers':
        return '#ef4444';
      case 'collaborators':
        return '#10b981';
      default:
        return colors.primary;
    }
  };

  const handleImageLoad = (testimonialId) => {
    setLoadedImages(prev => ({
      ...prev,
      [testimonialId]: true
    }));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (loading) {
    return (
      <div className={`testimonials-container ${className}`} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: `3px solid ${colors.primary}20`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '12px'
        }}></div>
        <p style={{
          color: colors.textSecondary,
          fontSize: '13px',
          fontWeight: '500',
          margin: 0
        }}>
          Loading testimonials...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <div className={`testimonials-container ${className}`} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: '2rem 1rem',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
          <Quote size={20} color="#ef4444" />
        </div>
        <h3 style={{ 
          color: colors.text, 
          marginBottom: '0.5rem',
          fontSize: isMobile ? '1.125rem' : '1.25rem',
          fontWeight: '600'
        }}>
          {error ? 'Unable to load testimonials' : 'No testimonials available'}
        </h3>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '0.875rem',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          {error || 'Check back soon for inspiring stories from our volunteers and collaborators.'}
        </p>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];
  const isImageLoaded = loadedImages[currentTestimonial?.id];

  return (
    <div 
      className={`testimonials-container ${className}`}
      ref={sliderRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        backgroundColor: colors.background,
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        touchAction: 'pan-y'
      }}
    >
      {/* Header Section */}
      <div style={{
        position: 'absolute',
        top: isMobile ? '0.75rem' : '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        textAlign: 'center',
        background: isDarkMode 
          ? 'rgba(30, 41, 59, 0.95)' 
          : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: isMobile ? '10px' : '16px',
        padding: isMobile ? '0.625rem 1.25rem' : '1rem 2rem',
        border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        maxWidth: isMobile ? 'calc(100% - 1.5rem)' : 'auto',
        width: isMobile ? 'auto' : 'auto'
      }}>
        <h2 style={{
          fontSize: isMobile ? '0.8125rem' : '1.125rem',
          fontWeight: '700',
          color: colors.text,
          margin: '0',
          letterSpacing: '-0.25px',
          whiteSpace: isMobile ? 'nowrap' : 'normal'
        }}>
          {title}
        </h2>
      </div>

      {/* Main Slider */}
      <div style={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '45% 55%',
        gridTemplateRows: isMobile ? '42vh 58vh' : '100vh'
      }}>
        {/* Image Section */}
        <div style={{
          position: 'relative',
          backgroundColor: `${getTypeColor(currentTestimonial.type)}08`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {currentTestimonial.image ? (
            <>
              <img
                src={`${STATIC_URL}/uploads/testimonials/${currentTestimonial.image}`}
                alt={`${currentTestimonial.first_name} ${currentTestimonial.last_name}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'opacity 0.5s ease',
                  opacity: isImageLoaded ? 1 : 0
                }}
                onLoad={() => handleImageLoad(currentTestimonial.id)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Nature placeholder for when image fails */}
              <img
                src={naturePlaceholder}
                alt="Nature landscape"
                style={{
                  display: 'none',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </>
          ) : (
            /* Nature placeholder when no image */
            <img
              src={naturePlaceholder}
              alt="Nature landscape"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}

          {/* Featured badge */}
          {currentTestimonial.featured && (
            <div style={{
              position: 'absolute',
              top: isMobile ? '0.625rem' : '1rem',
              left: isMobile ? '0.625rem' : '1rem',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              borderRadius: isMobile ? '6px' : '12px',
              padding: isMobile ? '2px 5px' : '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '2px' : '3px',
              boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
              animation: 'pulse 2s infinite'
            }}>
              <Star size={isMobile ? 7 : 10} color="white" fill="white" />
              <span style={{
                fontSize: isMobile ? '7px' : '9px',
                fontWeight: '600',
                color: 'white',
                letterSpacing: '0.3px'
              }}>
                Featured
              </span>
            </div>
          )}

          {/* Quote icon overlay */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '1rem' : '2rem',
            left: isMobile ? '1rem' : '2rem',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: isMobile ? '8px' : '12px',
            padding: isMobile ? '6px' : '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Quote size={isMobile ? 16 : 20} color="white" />
          </div>
        </div>

        {/* Content Section */}
        <div style={{
          padding: isMobile ? '1.5rem 1.25rem' : '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          position: 'relative',
          overflowY: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch'
        }}>
          <blockquote style={{
            fontSize: isMobile ? '0.8125rem' : '1rem',
            lineHeight: isMobile ? '1.5' : '1.6',
            color: colors.text,
            fontWeight: '400',
            margin: isMobile ? '0 0 1.25rem 0' : '0 0 1.5rem 0',
            fontStyle: 'italic'
          }}>
            "{currentTestimonial.testimonial}"
          </blockquote>

          <div style={{
            borderTop: `2px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(107, 114, 128, 0.1)'}`,
            paddingTop: isMobile ? '0.75rem' : '1rem'
          }}>
            <h4 style={{
              fontSize: isMobile ? '0.75rem' : '0.9375rem',
              fontWeight: '600',
              color: colors.text,
              margin: '0 0 0.5rem 0'
            }}>
              {currentTestimonial.first_name} {currentTestimonial.last_name}
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: `${getTypeColor(currentTestimonial.type)}15`,
              padding: isMobile ? '3px 6px' : '4px 8px',
              borderRadius: '8px',
              width: 'fit-content'
            }}>
              {getTypeIcon(currentTestimonial.type)}
              <span style={{
                color: getTypeColor(currentTestimonial.type),
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                fontWeight: '500'
              }}>
                {getTypeDisplayName(currentTestimonial.type)}
              </span>
            </div>
          </div>

          {/* Progress indicator - Hide on mobile, show in bottom controls */}
          {!isMobile && testimonials.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              right: '2.5rem',
              fontSize: '0.75rem',
              color: colors.textSecondary,
              background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '4px 8px',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`
            }}>
              {currentIndex + 1} of {testimonials.length}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows - Desktop only */}
      {!isMobile && testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            aria-label="Previous testimonial"
            style={{
              position: 'absolute',
              left: '2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              backgroundColor: isDarkMode 
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
              color: colors.text,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={goToNext}
            aria-label="Next testimonial"
            style={{
              position: 'absolute',
              right: '2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 25,
              backgroundColor: isDarkMode 
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
              color: colors.text,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Bottom Navigation Controls */}
      {testimonials.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '0.75rem' : '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '6px' : '12px',
          zIndex: 25,
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.95)' 
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: isMobile ? '10px' : '16px',
          padding: isMobile ? '5px 8px' : '8px 12px',
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Mobile progress counter */}
          {isMobile && (
            <span style={{
              fontSize: '0.625rem',
              color: colors.textSecondary,
              fontWeight: '600',
              minWidth: '35px',
              textAlign: 'center'
            }}>
              {currentIndex + 1}/{testimonials.length}
            </span>
          )}

          {/* Dots Navigation */}
          <div style={{
            display: 'flex',
            gap: isMobile ? '3px' : '6px',
            alignItems: 'center'
          }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                style={{
                  width: index === currentIndex ? (isMobile ? '10px' : '16px') : (isMobile ? '4px' : '6px'),
                  height: isMobile ? '4px' : '6px',
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: index === currentIndex 
                    ? getTypeColor(currentTestimonial.type) 
                    : (isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(107, 114, 128, 0.3)'),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                  minWidth: index === currentIndex ? (isMobile ? '10px' : '16px') : (isMobile ? '4px' : '6px'),
                  minHeight: isMobile ? '4px' : '6px'
                }}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={toggleAutoPlay}
            aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
            style={{
              background: isAutoPlaying 
                ? getTypeColor(currentTestimonial.type) 
                : 'transparent',
              border: `1px solid ${isAutoPlaying 
                ? getTypeColor(currentTestimonial.type) 
                : (isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(107, 114, 128, 0.3)')}`,
              borderRadius: isMobile ? '8px' : '12px',
              width: isMobile ? '26px' : '32px',
              height: isMobile ? '26px' : '32px',
              minWidth: isMobile ? '26px' : '32px',
              minHeight: isMobile ? '26px' : '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginLeft: isMobile ? '2px' : '4px',
              padding: 0
            }}
            onMouseOver={(e) => {
              if (!isMobile) e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              if (!isMobile) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isAutoPlaying ? 
              <Pause size={isMobile ? 9 : 12} color="white" /> : 
              <Play size={isMobile ? 9 : 12} color={colors.text} />
            }
          </button>
        </div>
      )}

      {/* Swipe indicator for mobile */}
      {isMobile && testimonials.length > 1 && currentIndex === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '0.6875rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'fadeInOut 3s ease-in-out',
          pointerEvents: 'none'
        }}>
          <ChevronLeft size={10} />
          Swipe
          <ChevronRight size={10} />
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          20%, 80% { opacity: 1; }
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 1024px) {
          button {
            min-width: 44px;
            min-height: 44px;
          }
        }

        /* Smooth scrolling for content section on mobile */
        @media (max-width: 1024px) {
          .testimonials-container > div:nth-child(2) > div:last-child {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Prevent text selection during swipe */
        .testimonials-container {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Better touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.95) !important;
            transition: transform 0.1s ease !important;
          }
        }

        /* Safe area for notched devices */
        @supports (padding-top: env(safe-area-inset-top)) {
          .testimonials-container > div:first-child {
            top: max(1rem, env(safe-area-inset-top)) !important;
          }
          
          .testimonials-container > div:last-child {
            bottom: max(1rem, env(safe-area-inset-bottom)) !important;
          }
        }

        /* Optimize for smaller devices */
        @media (max-width: 480px) {
          .testimonials-container > div:nth-child(2) {
            grid-template-rows: 38vh 62vh !important;
          }
        }

        /* Landscape mode optimization for mobile */
        @media (max-width: 1024px) and (orientation: landscape) {
          .testimonials-container > div:nth-child(2) {
            grid-template-columns: 50% 50% !important;
            grid-template-rows: 100vh !important;
          }

          .testimonials-container > div:nth-child(2) > div:first-child {
            height: 100vh !important;
          }

          .testimonials-container > div:nth-child(2) > div:last-child {
            height: 100vh !important;
            padding: 1.5rem 1.25rem !important;
          }
        }

        /* Reduce animations on low-end devices */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          button {
            border-width: 2px !important;
          }
        }

        /* Dark mode optimization */
        @media (prefers-color-scheme: dark) {
          .testimonials-container {
            background-color: #0f172a;
          }
        }

        /* Better focus styles for accessibility */
        button:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }

        /* Smooth transitions */
        .testimonials-container * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default CollVolunteersTestimonials;