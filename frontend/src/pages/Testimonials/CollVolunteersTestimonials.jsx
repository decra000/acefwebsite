import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, User, Heart, Handshake, Star, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  const { colors } = useTheme();

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
    switch (type?.toLowerCase()) {
      case 'volunteers':
        return <Heart size={16} />;
      case 'collaborators':
        return <Handshake size={16} />;
      default:
        return <User size={16} />;
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

  const handleImageLoad = (testimonialId) => {
    setLoadedImages(prev => ({
      ...prev,
      [testimonialId]: true
    }));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={`testimonials-container ${className}`} style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.primary}20`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
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
        textAlign: 'center'
      }}>
        <h3 style={{ 
          color: colors.text, 
          marginBottom: '1rem',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          {error ? 'Unable to load testimonials' : 'No testimonials available'}
        </h3>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '1rem',
          maxWidth: '500px'
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
      style={{
        backgroundColor: colors.background,
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main Slider */}
      <div style={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '45% 55%',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr'
        }
      }}>
        {/* Image Section */}
        <div style={{
          position: 'relative',
          backgroundColor: `${colors.primary}08`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {currentTestimonial.image ? (
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
            />
          ) : (
            <div style={{
              textAlign: 'center',
              color: colors.primary,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '2rem'
            }}>
              <User size={60} />
              <h4 style={{
                margin: '1rem 0 0 0',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: colors.text
              }}>
                {currentTestimonial.first_name}
              </h4>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{
          padding: '2rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          position: 'relative'
        }}>
          <blockquote style={{
            fontSize: '1.25rem',
            lineHeight: '1.5',
            color: colors.text,
            fontWeight: '400',
            margin: '0 0 1.5rem 0',
            fontStyle: 'italic'
          }}>
            "{currentTestimonial.testimonial}"
          </blockquote>

          <div>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: colors.text,
              margin: '0 0 0.5rem 0'
            }}>
              {currentTestimonial.first_name} {currentTestimonial.last_name}
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.primary,
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {getTypeIcon(currentTestimonial.type)}
              {getTypeDisplayName(currentTestimonial.type)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            style={{
              position: 'absolute',
              left: '2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              backgroundColor: `${colors.surface}95`,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: colors.text
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: '2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              backgroundColor: `${colors.surface}95`,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: colors.text
            }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {testimonials.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 20
        }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === currentIndex ? colors.primary : `${colors.textMuted}40`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollVolunteersTestimonials;
