import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Quote, User, Users, Heart, Handshake, ArrowRight } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';
import GlassButton from '../../components/GlassButton'; 

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
          padding: 'clamp(80px, 12vw, 140px) 0',
          backgroundColor: colors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
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
    return null; // Gracefully hide on error
  }

  return (
    <div className={className}>
      {/* Main Container */}
      <div
        style={{
          padding: 'clamp(80px, 12vw, 140px) 0',
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
            maxWidth: '1400px',
                        maxHeight: '700px',

            margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 40px)',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Grid Layout - Mobile First */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'clamp(40px, 6vw, 80px)',
              alignItems: 'center'
            }}
            className="testimonial-grid"
          >
            
            {/* News Section */}
            {LatestNewsSection && (
              <div
                style={{
                  order: 1,
                  gridColumn: '1 / -1'
                }}
                className="news-section"
              >
                <LatestNewsSection />
              </div>
            )}

            {/* Testimonial Section */}
            <div
              style={{
                order: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%'
              }}
            >
              {/* Section Badge */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: `${colors.primary}15`,
                  borderRadius: '20px',
                  marginBottom: '32px',
                  fontSize: '10px',
                  fontWeight: '500',
                  color: colors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Community Voices
              </div>

              {/* Quote Icon */}
              <div
                style={{
                  marginBottom: '32px',
                  opacity: 0.6
                }}
              >
                <Quote 
                  size={48} 
                  style={{ 
                    color: colors.primary,
                    transform: 'rotate(180deg)'
                  }} 
                />
              </div>

              {/* Main Quote */}
              <blockquote
                style={{
                  fontSize: 'clamp(1.3rem, 1.0vw, 1.3rem)',
                  lineHeight: '1.6',
                  color: colors.text,
                  marginBottom: '40px',
                  fontWeight: '300',
                  fontStyle: 'italic',
                  letterSpacing: '-0.01em',
                  maxWidth: '700px'
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
                  gap: '16px',
                  marginBottom: '48px'
                }}
              >
                {/* Author Avatar */}
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `3px solid ${colors.primary}20`,
                    background: featuredTestimonial.image ? 'none' : colors.backgroundSecondary
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
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: '4px',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {featuredTestimonial.first_name} {featuredTestimonial.last_name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: colors.textSecondary,
                      margin: 0,
                      fontWeight: '400'
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
                    marginTop: '8px'
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
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
                    border: `1px solid ${colors.primary}30`,
                    padding: '14px 32px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primary;
                    e.target.style.color = colors.white;
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = `0 8px 25px ${colors.primary}25`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = colors.primary;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Read More Stories
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

            {/* Glass Button - if needed */}
            {/* Uncomment if you want to include GlassButton */}
            {/* 
            <div
              style={{
                order: 3,
                display: 'flex',
                justifyContent: 'center',
                padding: '40px 0'
              }}
              className="glass-button-section"
            >
              <GlassButton />
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Mobile first approach */
        .testimonial-grid {
          grid-template-columns: 1fr !important;
        }

        /* Tablet and up */
        @media (min-width: 768px) {
          .testimonial-grid {
            grid-template-columns: 1fr !important;
            gap: clamp(60px, 8vw, 100px) !important;
          }
        }

        /* Large screens */
        @media (min-width: 1200px) {
          .testimonial-grid {
            gap: clamp(80px, 10vw, 120px) !important;
          }
        }

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

        /* Smooth transitions */
        * {
          transition: all 0.2s ease !important;
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
            font-weight: 400 !important;
          }
          
          button {
            border-width: 2px !important;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 48px !important;
            padding: 16px 36px !important;
          }
        }

        /* Print styles */
        @media print {
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedTestimonial;