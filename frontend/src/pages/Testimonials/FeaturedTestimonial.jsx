import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Fixed import
import axios from 'axios';
import { Star, Quote, User, Users, Heart, Handshake } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';
import '../../styles/Testimonials.css';
import GlassButton from '../../components/GlassButton'; 

const FeaturedTestimonial = ({ 
  title = "Featured Testimonial",
  showCTA = true,
  className = "",
  LatestNewsSection // Pass the news section component as prop
}) => {
  const [featuredTestimonial, setFeaturedTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Fixed placement
  
  const { colors } = useTheme();

  useEffect(() => {
    fetchFeaturedTestimonial();
  }, []);

  const fetchFeaturedTestimonial = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/generaltestimonials/public`);
      const testimonials = response.data;
      
      // Find the first featured testimonial
      const featured = testimonials.find(t => t.featured === true);
      setFeaturedTestimonial(featured || testimonials[0]); // Fallback to first if no featured
      setError('');
    } catch (err) {
      console.error('Error fetching featured testimonial:', err);
      setError('Failed to load featured testimonial');
      setFeaturedTestimonial(null);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'community':
        return <Users className="role-icon" />;
      case 'volunteers':
        return <Heart className="role-icon" />;
      case 'collaborators':
        return <Handshake className="role-icon" />;
      default:
        return <User className="role-icon" />;
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

  if (loading) {
    return (
      <div className="three-column-layout">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1
          }}
        >
          <source src="https://www.videvo.net/video/abstract-dark-motion-background/885/abstract-dark-motion-background.mp4" type="video/mp4" />
        </video>
        
        <div className="column-empty"></div>
        <div className="column-news">
          {LatestNewsSection && <LatestNewsSection />}
        </div>
        <div className="column-testimonial">
          <div className="testimonial-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !featuredTestimonial) {
    return (
      <div className="three-column-layout">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1
          }}
        >
          <source src="https://www.videvo.net/video/abstract-dark-motion-background/885/abstract-dark-motion-background.mp4" type="video/mp4" />
        </video>
        
        <div className="column-empty"></div>
        <div className="column-news">
          {LatestNewsSection && <LatestNewsSection />}
        </div>
        <div className="column-testimonial">
          <div className="testimonial-error">
            <h3>Unable to load testimonial</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`three-column-layout ${className}`}>
      {/* Video Background */}
      <video 
        autoPlay 
        muted 
        loop 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1
        }}
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
      </video>

      {/* First Column - Latest News Full Height/Width */}
      <div className="column-news">
        {LatestNewsSection && <LatestNewsSection />}
      </div>

      {/* Second Column - GlassButton */}
      <div className="column-glass-button">
        <GlassButton />
      </div>

      {/* Third Column - Featured Testimonial */}
      <div className="column-testimonial">
        <div className="testimonial-card-modern">
          {/* Background Image */}
          <div className="testimonial-background">
            {featuredTestimonial.image ? (
              <img
                src={`${STATIC_URL}/uploads/testimonials/${featuredTestimonial.image}`}
                alt={`${featuredTestimonial.first_name} ${featuredTestimonial.last_name}`}
                className="background-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="background-placeholder">
                <User size={80} />
              </div>
            )}
            <div className="background-overlay"></div>
          </div>

          {/* Content Overlay */}
          <div className="testimonial-overlay">
            {/* Header */}
            <div className="testimonial-header">
              <h2 className="testimonial-main-title">TESTIMONIAL</h2>
              <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="star filled" />
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="testimonial-quote-section">
              <blockquote className="testimonial-quote">
                "{featuredTestimonial.testimonial}"
              </blockquote>
            </div>

            {/* Author Info */}
            <div className="testimonial-author">
              <div className="author-avatar">
                {featuredTestimonial.image ? (
                  <img
                    src={`${STATIC_URL}/uploads/testimonials/${featuredTestimonial.image}`}
                    alt={`${featuredTestimonial.first_name} ${featuredTestimonial.last_name}`}
                    className="author-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div className="author-placeholder" style={{ display: featuredTestimonial.image ? 'none' : 'flex' }}>
                  <User size={20} />
                </div>
              </div>
              <div className="author-details">
                <h3 className="author-name">
                  {featuredTestimonial.first_name} {featuredTestimonial.last_name}
                </h3>
                <p className="author-role">
                  {getTypeDisplayName(featuredTestimonial.type)}
                </p>
              </div>
            </div>

            {/* Website/Brand */}
            <div className="testimonial-footer">
              <p className="website-url">www.acef-ngo.com</p>
            </div>
          </div>
        </div>

        {/* Call to Action - Fixed JSX */}
        {showCTA && (
          <div 
            className="testimonials-cta-modern"
            onClick={() => {
              navigate('/impact');
              // Wait for navigation to complete, then scroll to GeneralTestimonialsDisplay specifically
              setTimeout(() => {
                // Target the specific component by ID (recommended approach)
                const testimonialsSection = document.getElementById('general-testimonials-section');
                
                if (testimonialsSection) {
                  testimonialsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                } else {
                  // Fallback: search for component-specific selectors
                  const fallbackSelectors = [
                    '[data-component="GeneralTestimonialsDisplay"]',
                    '.general-testimonials-display',
                    '[class*="GeneralTestimonials"]',
                    '[class*="testimonials-display"]'
                  ];
                  
                  for (const selector of fallbackSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                      element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                      break;
                    }
                  }
                }
              }, 300);
            }}
            style={{ cursor: 'pointer' }}
          >
            <h3 className="cta-title">Read more Stories</h3>
            <p className="cta-description">
              Every story is a testament to ACEF's commitment to sustainability. Learn more.
            </p>
          
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedTestimonial;