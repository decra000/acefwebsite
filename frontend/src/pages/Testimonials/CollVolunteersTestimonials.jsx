import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, User, Heart, Handshake, Star, Camera, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
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
  
  const { colors, isDarkMode } = useTheme();

  // Nature placeholder image as base64 data URL
  const naturePlaceholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InNreUdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5N0M5RjUiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjODNEMEY3Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3Jhc3NHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNzJEMzk1Ii8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzM0RDA1OSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9Im1vdW50YWluR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzZENzI4MCIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0QjU1NjMiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNza3lHcmFkaWVudCkiLz4KPGVsbGlwc2UgY3g9IjMyMCIgY3k9Ijc1IiByeD0iNDIiIHJ5PSI0MiIgZmlsbD0iI0ZGREIzNyIgb3BhY2l0eT0iMC45Ii8+CjxlbGxpcHNlIGN4PSIzMjAiIGN5PSI3NSIgcng9IjMyIiByeT0iMzIiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMCAxODBRNTAgMTUwIDEwMCAxNzBRMTUwIDE2MCAyMDAgMTgwUTI1MCAyMDAgMzAwIDE3MFEzNTAgMTUwIDQwMCAxNzVWMjUwUTM1MCAyMzAgMzAwIDI0MFEyNTAgMjUwIDIwMCAyMzBRMTUwIDIyMCAxMDAgMjMwUTUwIDI0MCAzMCAyNDBWMTgwWiIgZmlsbD0idXJsKCNtb3VudGFpbkdyYWRpZW50KSIgb3BhY2l0eT0iMC44Ii8+CjxwYXRoIGQ9Ik0wIDI5MFEzMCAyNzAgNzAgMjgwUTEyMCAyNjAgMTcwIDI4MFEyMjAgMzAwIDI3MCAyODBRMzIwIDI2MCAzNzAgMjc1UTQwMCAyODAgNDAwIDI4NVY0MDBIMFY0MDBaIiBmaWxsPSJ1cmwoI2dyYXNzR3JhZGllbnQpIi8+CjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIyMDAiIHJ4PSIxMiIgcnk9IjUwIiBmaWxsPSIjMzk3MjQ5Ii8+CjxlbGxpcHNlIGN4PSIxODAiIGN5PSIxODAiIHJ4PSIxNSIgcnk9IjU1IiBmaWxsPSIjMzk3MjQ5Ii8+CjxlbGxpcHNlIGN4PSIzMDAiIGN5PSIxOTAiIHJ4PSIxMCIgcnk9IjQ1IiBmaWxsPSIjMzk3MjQ5Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE1MCIgcj0iMjgiIGZpbGw9IiM2QkQzOEQiLz4KPGNpcmNsZSBjeD0iMTgwIiBjeT0iMTI1IiByPSIzNSIgZmlsbD0iIzZCRDM4RCIvPgo8Y2lyY2xlIGN4PSIzMDAiIGN5PSIxNDUiIHI9IjI1IiBmaWxsPSIjNkJEMzhEIi8+CjxwYXRoIGQ9Ik01MCAzNDBRODAgMzM1IDExMCAzNDBRMTQwIDM0NSAxNzAgMzQwUTE5MCAzMzUgMjIwIDM0MFEyNTAgMzQ1IDI4MCAzNDBRMzEwIDMzNSAzNDAgMzQwUTM3MCAzNDUgNDAwIDM0MFY0MDBINTBaIiBmaWxsPSIjNUNCQzc1Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iMzIwIiByPSI0IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjgiLz4KPGNpcmNsZSBjeD0iMzUwIiBjeT0iMzEwIiByPSIzIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjciLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMzI1IiByPSI1IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjciLz4KPC9zdmc+";

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

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

  const getTypeIcon = (type) => {
    const iconProps = { size: 14, strokeWidth: 2 };
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
        <style jsx>{`
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
        padding: '2rem',
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
          fontSize: '1.25rem',
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
        {error && (
          <button 
            onClick={fetchTestimonials}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];
  const isImageLoaded = loadedImages[currentTestimonial?.id];

  return (
    <div 
      className={`testimonials-container ${className}`} 
      style={{
        backgroundColor: colors.background,
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header Section */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        textAlign: 'center',
        background: isDarkMode 
          ? 'rgba(30, 41, 59, 0.9)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1rem 2rem',
        border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: colors.text,
          margin: '0',
          letterSpacing: '-0.25px'
        }}>
          {title}
        </h2>
      </div>

      {/* Main Slider */}
      <div style={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '45% 55%'
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
              top: '1rem',
              right: '1rem',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              borderRadius: '12px',
              padding: '4px 8px',
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

          {/* Quote icon overlay */}
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Quote size={20} color="white" />
          </div>
        </div>

        {/* Content Section */}
        <div style={{
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          position: 'relative'
        }}>
          <blockquote style={{
            fontSize: '1.125rem',
            lineHeight: '1.6',
            color: colors.text,
            fontWeight: '400',
            margin: '0 0 1.5rem 0',
            fontStyle: 'italic'
          }}>
            "{currentTestimonial.testimonial}"
          </blockquote>

          <div style={{
            borderTop: `2px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(107, 114, 128, 0.1)'}`,
            paddingTop: '1rem'
          }}>
            <h4 style={{
              fontSize: '1rem',
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
              padding: '4px 8px',
              borderRadius: '8px',
              width: 'fit-content'
            }}>
              {getTypeIcon(currentTestimonial.type)}
              <span style={{
                color: getTypeColor(currentTestimonial.type),
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {getTypeDisplayName(currentTestimonial.type)}
              </span>
            </div>
          </div>

          {/* Progress indicator */}
          {testimonials.length > 1 && (
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

      {/* Navigation Arrows - Positioned within viewport */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrev}
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
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
              e.target.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(-50%) scale(1)';
              e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={goToNext}
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
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
              e.target.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(-50%) scale(1)';
              e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
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
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 25,
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.9)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px 12px',
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Dots Navigation */}
          <div style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center'
          }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: index === currentIndex ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: index === currentIndex 
                    ? getTypeColor(currentTestimonial.type) 
                    : (isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(107, 114, 128, 0.3)'),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={toggleAutoPlay}
            style={{
              background: isAutoPlaying 
                ? getTypeColor(currentTestimonial.type) 
                : 'transparent',
              border: `1px solid ${isAutoPlaying 
                ? getTypeColor(currentTestimonial.type) 
                : (isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(107, 114, 128, 0.3)')}`,
              borderRadius: '12px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginLeft: '4px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {isAutoPlaying ? 
              <Pause size={12} color="white" /> : 
              <Play size={12} color={colors.text} />
            }
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @media (max-width: 1024px) {
          .testimonials-container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
          
          .testimonials-container > div:nth-child(2) > div:first-child {
            height: 50vh !important;
          }
          
          .testimonials-container > div:nth-child(2) > div:last-child {
            height: 50vh !important;
            padding: 2rem 1.5rem !important;
          }
          
          .nav-arrows {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .header-section {
            top: 1rem !important;
            padding: 0.75rem 1.5rem !important;
          }
          
          .header-section h2 {
            font-size: 1rem !important;
          }
          
          .content-section {
            padding: 1.5rem 1rem !important;
          }
          
          .content-section blockquote {
            font-size: 1rem !important;
          }
          
          .content-section h4 {
            font-size: 0.9rem !important;
          }
          
          .bottom-controls {
            bottom: 1rem !important;
            padding: 6px 10px !important;
          }
        }
        
        @media (max-width: 480px) {
          .testimonials-container > div:nth-child(2) > div:first-child {
            height: 40vh !important;
          }
          
          .testimonials-container > div:nth-child(2) > div:last-child {
            height: 60vh !important;
            padding: 1rem !important;
          }
          
          .content-section blockquote {
            font-size: 0.9rem !important;
          }
          
          .header-section {
            padding: 0.5rem 1rem !important;
          }
          
          .header-section h2 {
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CollVolunteersTestimonials;