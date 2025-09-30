import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Quote, User, ArrowRight } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const FeaturedTestimonial = ({ 
  title = "Featured Testimonial",
  showCTA = true,
  className = "",
  LatestNewsSection
}) => {
  const [featuredTestimonial, setFeaturedTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    fetchFeaturedTestimonial();
  }, []);

  const fetchFeaturedTestimonial = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/generaltestimonials/public`);
      const testimonials = response.data;
      
      const featured = testimonials.find(t => t.featured === true);
      setFeaturedTestimonial(featured || testimonials[0]);
      setError('');
    } catch (err) {
      console.error('Error fetching featured testimonial:', err);
      setError('Failed to load featured testimonial');
      setFeaturedTestimonial(null);
    } finally {
      setLoading(false);
    }
  };

  const getTypeDisplayName = (type) => {
    switch (type?.toLowerCase()) {
      case 'community':
        return 'Community Member';
      case 'volunteers':
      case 'volunteer':
        return 'Volunteer';
      case 'collaborators':
        return 'Collaborator';
      default:
        return 'Member';
    }
  };

  const handleReadMoreClick = () => {
    navigate('/impact');
    setTimeout(() => {
      const testimonialsSection = document.getElementById('general-testimonials-section') ||
                                document.querySelector('[data-component="GeneralTestimonialsDisplay"]') ||
                                document.querySelector('.general-testimonials-display');
      
      if (testimonialsSection) {
        testimonialsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 300);
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          padding: '60px 20px',
          backgroundColor: colors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <div
          style={{
            width: '2px',
            height: '60px',
            background: `linear-gradient(180deg, transparent, ${colors.primary}, transparent)`,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      </div>
    );
  }

  // Error state
  if (error || !featuredTestimonial) {
    return null;
  }

  return (
    <div className={className}>
      {/* Main Container */}
      <div
        style={{
          padding: '60px 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${colors.primary}05 0%, ${colors.secondary}03 100%)`,
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* News Section */}
          {LatestNewsSection && (
            <div style={{ marginBottom: '48px' }}>
              <LatestNewsSection />
            </div>
          )}

          {/* Testimonial Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '680px',
              margin: '0 auto',
              width: '100%'
            }}
          >
            {/* Section Badge */}
            <div
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                backgroundColor: `${colors.primary}15`,
                borderRadius: '16px',
                marginBottom: '24px',
                fontSize: '11px',
                fontWeight: '600',
                color: colors.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              Community Voices
            </div>

            {/* Quote Icon */}
            <div
              style={{
                marginBottom: '24px',
                opacity: 0.5
              }}
            >
              <Quote 
                size={36} 
                style={{ 
                  color: colors.primary,
                  transform: 'rotate(180deg)'
                }} 
              />
            </div>

            {/* Main Quote */}
            <blockquote
              style={{
                fontSize: 'clamp(0.2rem, 2.5vw, 1rem)',
                lineHeight: '1.7',
                color: colors.text,
                marginBottom: '32px',
                fontWeight: '400',
                fontStyle: 'italic',
                letterSpacing: '-0.01em',
                padding: '0 8px',
                fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              "{featuredTestimonial.testimonial}"
            </blockquote>

            {/* Author Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '36px'
              }}
            >
              {/* Author Avatar */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `3px solid ${colors.primary}20`,
                  background: featuredTestimonial.image ? 'none' : colors.backgroundSecondary,
                  flexShrink: 0
                }}
              >
                {featuredTestimonial.image ? (
                  <img
                    src={`${STATIC_URL}/uploads/testimonials/${featuredTestimonial.image}`}
                    alt={`${featuredTestimonial.first_name} ${featuredTestimonial.last_name}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: ${colors.textSecondary}"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      color: colors.textSecondary
                    }}
                  >
                    <User size={32} />
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div>
                <h3
                  style={{
                    fontSize: '1.0rem',
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: '4px',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {featuredTestimonial.first_name} {featuredTestimonial.last_name}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: colors.textSecondary,
                    margin: 0,
                    fontWeight: '400',
                    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {getTypeDisplayName(featuredTestimonial.type)}
                </p>
              </div>

              {/* Star Rating */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '4px'
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    style={{
                      color: colors.warning,
                      fill: colors.warning
                    }}
                  />
                ))}
              </div>
            </div>

            {/* CTA Button */}
            {showCTA && (
              <button
                onClick={handleReadMoreClick}
                style={{
                  background: 'transparent',
                  color: colors.primary,
                  border: `2px solid ${colors.primary}30`,
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  minHeight: '52px',
                  width: '100%',
                  maxWidth: '320px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary;
                  e.target.style.color = colors.white;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 8px 20px ${colors.primary}30`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.primary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Read More Stories
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        /* Animation keyframes */
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scaleY(0.8);
          }
          50% { 
            opacity: 1; 
            transform: scaleY(1);
          }
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          blockquote {
            font-size: clamp(0.9rem, 2.5vw, 1rem) !important;
            line-height: 1.7 !important;
            padding: 0 4px !important;
          }
          
          button {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 1rem !important;
          }
        }

        /* Tablet */
        @media (min-width: 641px) and (max-width: 1024px) {
          blockquote {
            font-size: clamp(0.9rem, 2.5vw, 1rem) !important;
            padding: 0 16px !important;
          }
          
          button {
            max-width: 360px !important;
          }
        }

        /* Desktop */
        @media (min-width: 1025px) {
          blockquote {
            font-size: clamp(0.9rem, 2.5vw, 1rem) !important;
            padding: 0 24px !important;
          }
          
          button {
            width: auto !important;
            padding: 14px 36px !important;
            min-height: 48px !important;
            font-size: 1rem !important;
          }
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          blockquote {
            font-weight: 500 !important;
          }
          
          button {
            border-width: 3px !important;
          }
        }

        /* Focus styles for keyboard navigation */
        button:focus-visible {
          outline: 3px solid ${colors.primary} !important;
          outline-offset: 2px !important;
        }

        /* Active state for touch devices */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.98) !important;
          }
        }

        /* Print styles */
        @media print {
          button {
            display: none !important;
          }
          
          blockquote {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedTestimonial;