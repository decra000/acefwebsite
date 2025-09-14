import React, { useState, useEffect } from 'react';

const TestimonialsSlider = ({ testimonials = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [apiTestimonials, setApiTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ACEF brand colors
  const theme = {
    colors: {
      primary: '#0a451c',
      secondary: '#facf3c',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#475569',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  };

  // Fetch testimonials from projects API - FIXED VERSION
  useEffect(() => {
    const fetchTestimonials = async () => {
      console.log('=== TESTIMONIALS FETCH - DUPLICATE PREVENTION ===');
      
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE = process.env.REACT_APP_API_URL || '/api';
        const fullUrl = `${API_BASE}/projects`;
        
        console.log('Fetching from:', fullUrl);
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Raw API data:', data);
        
        // Simplified response handling
        let projects = [];
        if (data && data.success && Array.isArray(data.data)) {
          projects = data.data;
        } else if (Array.isArray(data)) {
          projects = data;
        } else {
          throw new Error('Unexpected API response structure');
        }
        
        console.log(`Found ${projects.length} total projects`);
        
        // Extract testimonials with deduplication
        const extractedTestimonials = [];
        const seenTestimonials = new Set(); // Track duplicates by content
        
        projects.forEach((project) => {
          // Process testimonials array first
          if (project.testimonials && Array.isArray(project.testimonials)) {
            project.testimonials.forEach((testimonial, index) => {
              if (testimonial.text && testimonial.text.trim()) {
                const testimonialText = testimonial.text.trim().toLowerCase();
                
                // Check for duplicates by text content
                if (!seenTestimonials.has(testimonialText)) {
                  seenTestimonials.add(testimonialText);
                  extractedTestimonials.push({
                    id: `${project.id}-array-${index}`, // More specific ID
                    text: testimonial.text.trim(),
                    author: testimonial.author || 'Anonymous',
                    position: testimonial.position || 'Community Member',
                    projectTitle: project.title,
                    projectId: project.id,
                    source: 'testimonials_array'
                  });
                  console.log(`Added testimonial from array: "${testimonialText.substring(0, 50)}..."`);
                } else {
                  console.log(`Skipped duplicate testimonial: "${testimonialText.substring(0, 50)}..."`);
                }
              }
            });
          }
          
          // Process legacy testimonial ONLY if no testimonials array exists or is empty
          const hasValidTestimonialArray = project.testimonials && 
                                         Array.isArray(project.testimonials) && 
                                         project.testimonials.some(t => t.text && t.text.trim());
          
          if (!hasValidTestimonialArray && project.testimonial_text && project.testimonial_text.trim()) {
            const legacyText = project.testimonial_text.trim().toLowerCase();
            
            if (!seenTestimonials.has(legacyText)) {
              seenTestimonials.add(legacyText);
              extractedTestimonials.push({
                id: `${project.id}-legacy`,
                text: project.testimonial_text.trim(),
                author: project.testimonial_author || 'Anonymous',
                position: project.testimonial_position || 'Community Member',
                projectTitle: project.title,
                projectId: project.id,
                source: 'legacy_fields'
              });
              console.log(`Added legacy testimonial: "${legacyText.substring(0, 50)}..."`);
            } else {
              console.log(`Skipped duplicate legacy testimonial: "${legacyText.substring(0, 50)}..."`);
            }
          }
        });
        
        console.log(`Final extracted testimonials: ${extractedTestimonials.length}`);
        console.log('Testimonials by source:', {
          array: extractedTestimonials.filter(t => t.source === 'testimonials_array').length,
          legacy: extractedTestimonials.filter(t => t.source === 'legacy_fields').length
        });
        
        if (extractedTestimonials.length > 0) {
          setApiTestimonials(extractedTestimonials);
          setError(null);
          console.log('✅ SUCCESS: Unique testimonials set');
        } else {
          console.log('❌ NO TESTIMONIALS FOUND');
          setApiTestimonials([]);
          setError('No testimonials found in API data');
        }
        
      } catch (error) {
        console.error('❌ FETCH ERROR:', error);
        setError(`Failed to load testimonials: ${error.message}`);
        setApiTestimonials([]);
      } finally {
        setLoading(false);
        console.log('=== FETCH COMPLETED ===');
      }
    };

    console.log('🚀 Testimonials component mounted, starting fetch...');
    fetchTestimonials();
  }, []); // Empty dependency array to prevent re-fetching

  // Default testimonials with ACEF-specific content (reduced as fallback)
  const defaultTestimonials = [
    {
      text: "ACEF's legal aid program transformed how we handle community disputes. Their innovative approach has made justice more accessible.",
      author: "Sarah Mwangi",
      position: "Community Leader, Nairobi"
    },
    {
      text: "The digital literacy training provided by ACEF has empowered over 200 women in our cooperative.",
      author: "Amina Hassan",
      position: "Women's Cooperative Chair"
    },
    {
      text: "Working with ACEF on our legal tech startup has been incredible. Their mentorship helped us scale across East Africa.",
      author: "David Ochieng",
      position: "CEO, LegalTech Solutions"
    }
  ];

  // Prioritize API testimonials, then props, then defaults
  const displayTestimonials = apiTestimonials.length > 0 
    ? apiTestimonials 
    : testimonials.length > 0 
    ? testimonials 
    : defaultTestimonials;

  console.log('Final displayTestimonials count:', displayTestimonials.length);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || displayTestimonials.length <= 1 || loading) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayTestimonials.length, loading]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayTestimonials.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayTestimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (loading) {
    return (
      <section style={styles.testimonialsSection}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayTestimonials.length === 0) {
    return null;
  }

  const currentTestimonial = displayTestimonials[currentIndex];

  return (
    <section style={styles.testimonialsSection}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Voices from the Community</h2>
          <p style={styles.subtitle}>
            Real stories from the communities and partners we serve
          </p>
     
          {error && apiTestimonials.length === 0 && (
            <div style={styles.errorSource}>
              Using sample testimonials - {error}
            </div>
          )}
        </div>

        <div style={styles.sliderContainer}>
          <div 
            style={{
              ...styles.slider,
              transform: `translateX(-${currentIndex * 100}%)`
            }}
          >
            {displayTestimonials.map((testimonial, index) => (
              <div key={testimonial.id || index} style={styles.slide}>
                <div style={styles.testimonialCard}>
                  <div style={styles.quoteIcon}>"</div>
                  <blockquote style={styles.testimonialText}>
                    {testimonial.text}
                  </blockquote>
                  <div style={styles.authorSection}>
                    <div style={styles.authorAvatar}>
                      {testimonial.author ? testimonial.author.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div style={styles.authorInfo}>
                      <div style={styles.authorName}>
                        {testimonial.author || 'Anonymous'}
                      </div>
                      <div style={styles.authorPosition}>
                        {testimonial.position || 'Community Member'}
                      </div>
                      {testimonial.projectTitle && (
                        <div style={styles.projectTitle}>
                          Project: {testimonial.projectTitle}
                        </div>
                      )}
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && testimonial.source && (
                        <div style={{ fontSize: '0.6rem', color: '#999', marginTop: '0.25rem' }}>
                          Source: {testimonial.source} | ID: {testimonial.id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {displayTestimonials.length > 1 && (
            <>
              <button 
                style={{...styles.navButton, ...styles.prevButton}}
                onClick={goToPrevious}
                aria-label="Previous testimonial"
                onMouseEnter={(e) => {
                  e.target.style.background = theme.colors.primary;
                  e.target.style.color = theme.colors.surface;
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.color = theme.colors.primary;
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ←
              </button>
              <button 
                style={{...styles.navButton, ...styles.nextButton}}
                onClick={goToNext}
                aria-label="Next testimonial"
                onMouseEnter={(e) => {
                  e.target.style.background = theme.colors.primary;
                  e.target.style.color = theme.colors.surface;
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.color = theme.colors.primary;
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {displayTestimonials.length > 1 && (
          <div style={styles.dotsContainer}>
            {displayTestimonials.map((_, index) => (
              <button
                key={index}
                style={{
                  ...styles.dot,
                  ...(index === currentIndex ? styles.activeDot : {})
                }}
                onClick={() => goToSlide(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                onMouseEnter={(e) => {
                  if (index !== currentIndex) {
                    e.target.style.background = theme.colors.primary;
                    e.target.style.transform = 'scale(1.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentIndex) {
                    e.target.style.background = `rgba(10, 69, 28, 0.3)`;
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Auto-play indicator */}
        {isAutoPlaying && displayTestimonials.length > 1 && (
          <div style={styles.autoPlayIndicator}>
            <div 
              style={{
                ...styles.progressBar,
                animationDuration: '5000ms'
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        .progress-bar {
          animation: progress linear infinite;
        }

        .testimonials-section {
          animation: fadeIn 0.8s ease-out;
        }

        .live-indicator {
          animation: pulse 2s infinite;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .testimonial-text {
            font-size: 0.95rem !important;
            line-height: 1.6 !important;
          }
          
          .title {
            font-size: 1.75rem !important;
          }
          
          .testimonial-card {
            padding: 1.5rem !important;
            margin: 0 0.5rem !important;
          }
          
          .nav-button {
            width: 2.5rem !important;
            height: 2.5rem !important;
            font-size: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 2rem 1rem !important;
          }
          
          .testimonial-card {
            padding: 1.25rem !important;
            margin: 0 0.25rem !important;
          }
          
          .quote-icon {
            font-size: 2rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          .author-section {
            flex-direction: column !important;
            text-align: center !important;
            gap: 0.75rem !important;
          }
          
          .author-avatar {
            align-self: center !important;
          }

          .nav-button {
            width: 2.25rem !important;
            height: 2.25rem !important;
            font-size: 0.875rem !important;
          }
        }

        /* Accessibility improvements */
        .nav-button:focus,
        .dot:focus {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .slider,
          .testimonial-card,
          .progress-bar {
            transition: none !important;
            animation: none !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .testimonial-card {
            border: 2px solid ${theme.colors.primary} !important;
          }
          
          .nav-button,
          .dot {
            border: 2px solid ${theme.colors.primary} !important;
          }
        }
      `}</style>
    </section>
  );
};

// Updated styles with inherited font and smaller sizes
const styles = {
  testimonialsSection: {
    padding: '4rem 0',
    position: 'relative',
    fontFamily: 'inherit',
  },

  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1.5rem',
    position: 'relative',
  },

  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },

  title: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
    background: 'linear-gradient(135deg, #0a451c, #0d5d25)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.2,
    fontFamily: 'inherit',
  },

  subtitle: {
    fontSize: '1rem',
    color: '#475569',
    marginBottom: '0.5rem',
    fontWeight: 400,
    maxWidth: '600px',
    margin: '0 auto 0.5rem auto',
    lineHeight: 1.5,
    fontFamily: 'inherit',
  },

  dataSource: {
    fontSize: '0.8rem',
    color: '#10B981',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
    fontFamily: 'inherit',
  },

  errorSource: {
    fontSize: '0.75rem',
    color: '#F59E0B',
    fontWeight: 500,
    marginTop: '0.5rem',
    fontFamily: 'inherit',
  },

  liveDataIndicator: {
    color: '#10B981',
    fontSize: '0.7rem',
    animation: 'pulse 2s infinite',
  },

  sliderContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '1.5rem',
    marginBottom: '2rem',
  },

  slider: {
    display: 'flex',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
  },

  slide: {
    minWidth: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 1rem',
  },

  testimonialCard: {
    background: '#ffffff',
    borderRadius: '1.25rem',
    padding: '2rem',
    maxWidth: '700px',
    width: '100%',
    boxShadow: '0 8px 30px rgba(10, 69, 28, 0.06)',
    border: '1px solid rgba(10, 69, 28, 0.08)',
    position: 'relative',
    textAlign: 'center',
    margin: '0 1rem',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  quoteIcon: {
    fontSize: '2.5rem',
    color: '#facf3c',
    fontFamily: 'Georgia, serif',
    lineHeight: 1,
    marginBottom: '1rem',
    opacity: 0.8,
    textShadow: '0 2px 4px rgba(250, 207, 60, 0.3)',
  },

  testimonialText: {
    fontSize: '1.05rem',
    lineHeight: 1.6,
    color: '#1e293b',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
    fontWeight: 400,
    margin: '0 0 1.5rem 0',
    fontFamily: 'inherit',
  },

  authorSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },

  authorAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0a451c, #facf3c)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 600,
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(10, 69, 28, 0.15)',
    fontFamily: 'inherit',
  },

  authorInfo: {
    textAlign: 'left',
  },

  authorName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '0.25rem',
    fontFamily: 'inherit',
  },

  authorPosition: {
    fontSize: '0.8rem',
    color: '#475569',
    fontWeight: 400,
    marginBottom: '0.125rem',
    fontFamily: 'inherit',
  },

  projectTitle: {
    fontSize: '0.7rem',
    color: '#facf3c',
    fontWeight: 500,
    opacity: 0.9,
    fontFamily: 'inherit',
  },

  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2.75rem',
    height: '2.75rem',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(10, 69, 28, 0.2)',
    color: '#0a451c',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)',
    zIndex: 2,
    boxShadow: '0 6px 20px rgba(10, 69, 28, 0.1)',
    fontFamily: 'inherit',
  },

  prevButton: {
    left: '1rem',
  },

  nextButton: {
    right: '1rem',
  },

  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.6rem',
    marginBottom: '1rem',
  },

  dot: {
    width: '0.6rem',
    height: '0.6rem',
    borderRadius: '50%',
    background: 'rgba(10, 69, 28, 0.3)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  activeDot: {
    background: '#0a451c',
    transform: 'scale(1.4)',
    boxShadow: '0 0 0 3px rgba(10, 69, 28, 0.2)',
  },

  autoPlayIndicator: {
    height: '0.125rem',
    background: 'rgba(10, 69, 28, 0.2)',
    borderRadius: '0.0625rem',
    overflow: 'hidden',
    position: 'relative',
  },

  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #0a451c, #facf3c)',
    borderRadius: '0.0625rem',
    transformOrigin: 'left',
    animation: 'progress linear infinite',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 0',
  },

  spinner: {
    width: '2rem',
    height: '2rem',
    border: '0.2rem solid rgba(10, 69, 28, 0.2)',
    borderTop: '0.2rem solid #0a451c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },

  loadingText: {
    color: '#475569',
    fontSize: '0.9rem',
    fontWeight: 500,
    fontFamily: 'inherit',
  },

  errorContainer: {
    textAlign: 'center',
    padding: '3rem 0',
  },

  errorText: {
    color: '#EF4444',
    fontSize: '0.9rem',
    fontWeight: 500,
    fontFamily: 'inherit',
  },
};

export default TestimonialsSlider;