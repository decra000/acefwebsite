import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme';
import { API_URL, STATIC_URL } from '../config';

const PartnersSlider = () => {
  const { colors, isDarkMode } = useTheme();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePartners, setVisiblePartners] = useState(new Set());
  const [visibleAccreditors, setVisibleAccreditors] = useState(new Set());
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch partners from API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/partners`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const partnersData = await response.json();
        
        // Sort partners by featured first, then by name
        const sortedPartners = partnersData.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setPartners(sortedPartners);
      } catch (err) {
        console.error('Error fetching partners:', err);
        setError('Failed to load partners');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Filter partners by type
  const partnersOnly = partners.filter(p => 
    (p.type || '').toLowerCase() === 'partner' || 
    (p.type || '').toLowerCase() === 'both'
  );
  const accreditors = partners.filter(p => 
    (p.type || '').toLowerCase() === 'accreditator' || 
    (p.type || '').toLowerCase() === 'both'
  );

  // Simple interval display effect
  useEffect(() => {
    if (partnersOnly.length === 0 && accreditors.length === 0) return;

    // Show all partners first, then all accreditors
    setVisiblePartners(new Set(partnersOnly.map((_, index) => index)));
    setVisibleAccreditors(new Set(accreditors.map((_, index) => index)));

  }, [partnersOnly.length, accreditors.length]);

  // Show loading state
  if (loading) {
    return (
      <section
        style={{
          backgroundColor: colors.background,
          padding: 'clamp(40px, 6vw, 70px) 0',
          width: '100%',
          margin: 0,
        }}
      >
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center',
          padding: isMobile ? '0 16px' : '0 20px'
        }}>
          <div
            style={{
              display: 'inline-block',
              width: isMobile ? '32px' : '40px',
              height: isMobile ? '32px' : '40px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ 
            marginTop: '20px', 
            color: colors.textSecondary,
            fontSize: isMobile ? '14px' : '16px',
          }}>
            Loading our partners and accreditors...
          </p>
        </div>
      </section>
    );
  }

  // Show default message if error or no partners data
  if (error || !partners.length) {
    return (
      <section
        style={{
          backgroundColor: colors.background,
          padding: 'clamp(40px, 6vw, 70px) 0',
          width: '100%',
          margin: 0,
        }}
      >
        {/* Homepage-style Title */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: 'clamp(40px, 6vw, 60px)',
          padding: isMobile ? '0 16px' : '0 20px'
        }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: `${colors.primary}15`,
              borderRadius: '20px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Partnerships
          </div>
          
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: "300",
              color: colors.text,
              marginBottom: "24px",
              lineHeight: "1.2",
              letterSpacing: '-0.02em'
            }}
          >
            Our <span style={{ fontWeight: '700', color: colors.primary }}>Affiliations</span>
          </h2>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: colors.textSecondary,
              lineHeight: "1.6",
              fontWeight: '300'
            }}
          >
            Building Stronger Networks • Driven by Impact
          </p>
        </div>

        {/* Default Message */}
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 40px',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              backgroundColor: colors.surface,
              padding: isMobile ? '40px 20px' : '60px 40px',
              borderRadius: '24px',
              boxShadow: `0 20px 60px -10px ${colors.primary}20`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{
              width: isMobile ? '60px' : '80px',
              height: isMobile ? '60px' : '80px',
              backgroundColor: colors.primary,
              borderRadius: '50%',
              margin: `0 auto ${isMobile ? '24px' : '32px'} auto`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg 
                width={isMobile ? "32" : "40"} 
                height={isMobile ? "32" : "40"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={colors.white}
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            
            <p
              style={{
                fontSize: isMobile ? '16px' : '20px',
                lineHeight: '1.6',
                color: colors.text,
                fontWeight: '300',
                marginBottom: '0',
              }}
            >
              ACEF partners with key institutions in over 10 countries. We value all our affiliations and accreditors and continue to thrive in meaningful partnerships.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  const renderItemLogo = (item, index, section) => (
    <motion.div
      key={`${section}-${item.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '8px 4px' : '12px 8px',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        backgroundColor: hoveredPartner === `${section}-${item.id}` ? `${colors.primary}08` : 'transparent',
        // Fixed width to prevent stretching
       minWidth: isMobile ? '80px' : '140px',
maxWidth: isMobile ? '100px' : '180px',
height: isMobile ? '60px' : '95px',

        flexShrink: 0
      }}
      whileHover={{ 
        scale: isMobile ? 1.02 : 1.05,
        transition: { duration: 0.2 }
      }}
      onMouseEnter={() => setHoveredPartner(`${section}-${item.id}`)}
      onMouseLeave={() => setHoveredPartner(null)}
    >
      <img
        src={`${STATIC_URL}/uploads/partners/${item.logo}`}
        alt={item.name}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transition: 'all 0.3s ease',
          filter: hoveredPartner === `${section}-${item.id}` ? 'brightness(1.1)' : 'brightness(1)',
        }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback for broken images */}
      <div
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          fontSize: isMobile ? '10px' : '12px',
          color: colors.textSecondary,
          textAlign: 'center',
          border: `1px dashed ${colors.border}`,
          borderRadius: '6px',
          padding: '4px',
        }}
      >
        {item.name}
      </div>

      {/* Hover tooltip with partner name */}
      <AnimatePresence>
        {hoveredPartner === `${section}-${item.id}` && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: colors.text,
              color: colors.background,
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: `0 4px 20px ${colors.text}25`,
              marginBottom: '8px'
            }}
          >
            {item.name}
            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${colors.text}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Show name on tap/hover */}
      {isMobile && hoveredPartner === `${section}-${item.id}` && (
        <div
          style={{
            position: 'absolute',
            bottom: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: '500',
            color: colors.primary,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            zIndex: 5,
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {item.name}
        </div>
      )}
    </motion.div>
  );

  const renderSection = (title, items, sectionKey) => {
    if (!items.length) return null;

    return (
      <div style={{ 
        marginBottom: isMobile ? '40px' : '50px',
        position: 'relative'
      }}>
        {/* Section Title */}
        <div style={{ 
          textAlign: 'left',
          marginBottom: isMobile ? '20px' : '30px'
        }}>
          <h3
            style={{
              fontSize: isMobile ? '20px' : '28px',
              fontWeight: '600',
              color: colors.text,
              margin: 0,
              letterSpacing: '-0.01em'
            }}
          >
            {title}
          </h3>
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: colors.textSecondary,
              margin: '12px 0 0 0',
              borderRadius: '2px',
              opacity: 0.4
            }}
          />
        </div>

        {/* Logo Container - Using Flexbox for true horizontal flow */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobile ? '6px' : '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '100%',
          position: 'relative',
          // Add extra bottom padding on mobile to accommodate name display
          paddingBottom: isMobile ? '30px' : '0'
        }}>
          {items.map((item, index) => renderItemLogo(item, index, sectionKey))}
        </div>
      </div>
    );
  };

  return (
    <section
      style={{
        backgroundColor: colors.background,
        padding: 'clamp(40px, 6vw, 70px) 0',
        width: '100%',
        margin: 0,
      }}
    >
      {/* Homepage-style Title */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: 'clamp(40px, 6vw, 60px)',
        padding: isMobile ? '0 16px' : '0 20px'
      }}>
      
        
        <h2
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "300",
            color: colors.text,
            marginBottom: "24px",
            lineHeight: "1.2",
            letterSpacing: '-0.02em'
          }}
        >
          Our <span style={{ fontWeight: '700', color: colors.primary }}>Affiliations</span>
        </h2>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: colors.textSecondary,
            lineHeight: "1.6",
            fontWeight: '300'
          }}
        >
          Building Stronger Networks • Driven by Impact
        </p>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 40px'
      }}>
        {/* Partners Section (always visible first) */}
        {partnersOnly.length > 0 && renderSection('Partners', partnersOnly, 'partners')}

        {/* Accreditors Section (animates on scroll) */}
        {accreditors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }} 
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {renderSection('Accreditors', accreditors, 'accreditors')}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
};

export default PartnersSlider;