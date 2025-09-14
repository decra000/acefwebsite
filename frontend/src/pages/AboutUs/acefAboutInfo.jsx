import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';
import { subscribeToNewsletter } from "../../services/newsletterService";

// Updated Accreditors Grid Component with animations
// Updated Accreditors Grid Component with logo display and hover names
const AccreditorsGrid = ({ partners }) => {
  const { colors, isDarkMode } = useTheme();

  if (partners.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: '-50px' }}
      transition={{ duration: 0.6 }}
      style={{
        marginTop: '2rem',
        marginBottom: '2rem'
      }}
    >
      {/* Divider line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ margin: '-50px' }}
        transition={{ duration: 0.8 }}
        style={{
          height: '1px',
          background: `linear-gradient(to right, transparent 0%, ${colors.border} 20%, ${colors.border} 80%, transparent 100%)`,
          marginBottom: '1.5rem',
          width: '100%',
          maxWidth: '100%',
          transformOrigin: 'center'
        }} 
      />
      
      <motion.h3 
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ margin: '-50px' }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'left',
          fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
          fontWeight: 700,
          color: colors.text,
          marginBottom: '1rem',
          fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        Trusted and Accredited by
      </motion.h3>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'flex-start'
      }}>
        {partners.map((partner, index) => (
          <motion.div 
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              minWidth: '80px',
              minHeight: '80px',
              maxWidth: '100px',
              maxHeight: '100px',
              overflow: 'visible'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
              e.currentTarget.style.filter = 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))';
              
              // Show tooltip with partner name from API
              const tooltip = e.currentTarget.querySelector('.partner-tooltip');
              if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) translateY(-10px)';
                tooltip.style.visibility = 'visible';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.filter = 'none';
              
              // Hide tooltip
              const tooltip = e.currentTarget.querySelector('.partner-tooltip');
              if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) translateY(0)';
                tooltip.style.visibility = 'hidden';
              }
            }}
          >
            {/* Logo Image */}
            <img
              src={partner.logo ? `${STATIC_URL}/uploads/partners/${partner.logo}` : '/placeholder-logo.png'}
              alt={`${partner.name} logo`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                maxWidth: '64px',
                maxHeight: '64px',
                filter: isDarkMode ? 'brightness(0.9)' : 'none'
              }}
              onError={(e) => {
                // Fallback to a generic logo or initials
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                const fallback = document.createElement('div');
                fallback.style.cssText = `
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 64px;
                  height: 64px;
                  background: ${colors.primary}20;
                  color: ${colors.primary};
                  font-weight: 700;
                  font-size: 16px;
                  border-radius: 8px;
                  font-family: inherit;
                `;
                fallback.textContent = partner.name.split(' ').map(word => word[0]).join('').substring(0, 3);
                parent.appendChild(fallback);
              }}
            />
            
            {/* Tooltip showing actual partner name from API */}
            <div 
              className="partner-tooltip"
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%) translateY(0)',
                backgroundColor: colors.surface,
                color: colors.text,
                padding: '0.6rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: `0 8px 25px ${colors.cardShadow}80`,
                border: `1px solid ${colors.border}`,
                opacity: '0',
                visibility: 'hidden',
                pointerEvents: 'none',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                maxWidth: '250px',
                textAlign: 'center'
              }}
            >
              {partner.name}
              {/* Tooltip arrow */}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${colors.surface}`
              }} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};


const AcefAboutInfo = () => {
  const [email, setEmail] = useState('');
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors, isDarkMode } = useTheme();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/partners`, { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch partners');
        }

        const data = await response.json();

        // Only show accreditors or both
        const filtered = data.filter(p =>
          p.type?.toLowerCase() === 'accreditator' || p.type?.toLowerCase() === 'both'
        );

        setPartners(filtered);
      } catch (error) {
        console.error('Error fetching partners:', error);
        // Mock data for demo purposes
        setPartners([
          { id: 1, name: 'UN Environment Programme', logo: 'unep-logo.png' },
          { id: 2, name: 'African Union', logo: 'au-logo.png' },
          { id: 3, name: 'Climate Investment Funds', logo: 'cif-logo.png' },
          { id: 4, name: 'Green Climate Fund', logo: 'gcf-logo.png' },
          { id: 5, name: 'WWF Africa', logo: 'wwf-logo.png' },
          { id: 6, name: 'UNEP FI', logo: 'unepfi-logo.png' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      
      // Replace with your actual newsletter API endpoint
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setEmail('');
        alert('Thank you for subscribing to our newsletter!');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      // For demo - still clear email and show success
      console.log('Email submitted:', email);
      setEmail('');
      alert('Thank you for subscribing to our newsletter!');
    } finally {
      setIsSubmitting(false);
    }
  };

const handleSubscribe = async (e) => {
  if (e) e.preventDefault(); // make sure it's a form submit
  if (!email) return;

  setIsSubmitting(true);
  const result = await subscribeToNewsletter(email);
  setStatus(result.message);
  setEmail(""); // optional reset
  setIsSubmitting(false);
};


  const containerStyle = {
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.6,
    color: colors.text,
    
    background: colors.background
  };

  const mainSectionStyle = {
    background: isDarkMode 
      ? `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`
      : `linear-gradient(135deg, ${colors.gray50} 0%, ${colors.backgroundSecondary} 50%, #fef7ff 100%)`,
    minHeight: '100vh',
    padding: '4rem 0',
    position: 'relative'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth > 768 ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : '1fr',
    gap: window.innerWidth > 768 ? '4rem' : '2rem',
    alignItems: 'start'
  };

  const emailInputStyle = {
    flex: 1,
    padding: '1rem 1.25rem',
    border: 'none',
    fontSize: '1rem',
    outline: 'none',
    background: colors.surface,
    color: colors.text,
    borderRadius: window.innerWidth <= 768 ? '0.5rem 0.5rem 0 0' : '0'
  };

  const buttonStyle = {
    background: isSubmitting ? colors.gray400 : colors.primary,
    color: colors.white,
    border: 'none',
    padding: '1rem 2rem',
    fontWeight: 600,
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    whiteSpace: 'nowrap',
    borderRadius: window.innerWidth <= 768 ? '0 0 0.5rem 0.5rem' : '0',
    opacity: isSubmitting ? 0.7 : 1
  };

  return (
    <div style={containerStyle}>
      {/* Main Section */}
      <div style={mainSectionStyle}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          width: '100%'
        }}>
          <div style={gridStyle}>
            {/* Text Content */}
            <div style={{
              maxWidth: '100%',
              zIndex: 2,
              padding: window.innerWidth <= 768 ? '0 0.5rem' : '0'
            }}>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-50px' }}
                transition={{ duration: 0.6 }}
                style={{




      fontSize: '48px',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '24px',
      fontFamily: 'inherit',
  
                  // fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  color: colors.primary,
                  // letterSpacing: '-0.02em',
                }}
              >
                Empowering Youth for Climate Action
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  color: colors.textSecondary,
                  marginBottom: '2.5rem',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  lineHeight: 1.7,
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                <p style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ color: colors.text, fontWeight: 700, fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    Africa Climate and Environment Foundation (ACEF)
                  </strong> is a youth focused non-governmental organization (NGO) founded in 2021, dedicated to empowering grassroots youth and women while supporting locally driven initiatives to address the triple planetary crisis of climate change, biodiversity loss, and pollution.
                </p>
                
                <p style={{ marginBottom: '1.5rem' }}>
                  ACEF works toward addressing global issues related to climate change, environmental degradation, and poverty alleviation by focusing on Sustainable Development Goals (SDGs) such as clean water and sanitation (SDG 6), climate action (SDG 13), Life below water (SDG 14), and quality education (SDG 4).
                </p>
              </motion.div>

              {/* Newsletter Signup */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  display: 'flex',
                  gap: 0,
                  marginBottom: '1rem',
                  boxShadow: `0 10px 25px ${colors.cardShadow}`,
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  width: '100%',
                  maxWidth: window.innerWidth <= 768 ? '100%' : '450px',
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                }}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    ...emailInputStyle,
                    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                />
                <button 
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isSubmitting || !email}
                  style={{
                    ...buttonStyle,
                    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = `0 4px 12px ${colors.cardShadow}`;
                      e.target.style.backgroundColor = colors.primaryLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = isSubmitting ? colors.gray400 : colors.primary;
                  }}
                >
                  
                  {isSubmitting ? 'Connecting...' : 'Stay Connected'}
                </button>
                
              </motion.div>

              {/* Accreditors Grid - Now positioned right after Stay Connected */}
              {!isLoading && partners.length > 0 && (
                <AccreditorsGrid partners={partners} />
              )}
            </div>

            {/* Extended Image */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: '-50px' }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'relative',
                borderRadius: '0.75rem',
                overflow: 'visible',
                boxShadow: `0 20px 40px ${colors.cardShadow}`,
                height: window.innerWidth > 768 ? '600px' : '400px',
                order: window.innerWidth <= 768 ? -1 : 0,
                marginTop: window.innerWidth > 768 ? '6rem' : '0'
              }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img
                  src="/youth.jpg"
                  alt="African youth engaged in climate action and environmental protection activities"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: isDarkMode ? 'brightness(0.9) contrast(1.1)' : 'none'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                {/* Overlay for better visual depth */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                  pointerEvents: 'none'
                }} />
              </div>
              
              {/* Corner Icon */}
              <div style={{
                position: 'absolute',
                bottom: '-15px',
                left: '-15px',
                width: '60px',
                height: '60px',
                backgroundColor: colors.white,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${colors.cardShadow}`,
                zIndex: 10
              }}>
                <svg 
                  width="30" 
                  height="30" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#0a451c" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M8 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z"/>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Loading indicator for partners */}
      {isLoading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          background: colors.backgroundSecondary
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${colors.border}`,
            borderTop: `3px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: ${colors.textMuted} !important;
        }
        
        input:focus {
          outline: 2px solid ${colors.primary} !important;
          outline-offset: 2px;
        }
        
        @media (max-width: 768px) {
          .grid-mobile {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AcefAboutInfo;