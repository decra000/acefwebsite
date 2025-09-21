import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../theme';
import { API_URL, STATIC_URL } from '../config';

const PartnersSlider = () => {
  const { colors, isDarkMode } = useTheme();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePartners, setVisiblePartners] = useState(new Set());
  const [visibleAccreditors, setVisibleAccreditors] = useState(new Set());
  const intervalRef = useRef(null);

  // Fetch partners from API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/partners`, { 
          withCredentials: true 
        });
        
        // Sort partners by featured first, then by name
        const sortedPartners = response.data.sort((a, b) => {
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
          padding: '60px 0',
          width: '100%',
          margin: 0,
        }}
      >
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center',
          padding: '0 20px'
        }}>
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ 
            marginTop: '20px', 
            color: colors.textSecondary,
            fontSize: '16px',
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
          padding: '60px 0',
          width: '100%',
          margin: 0,
        }}
      >
        {/* Main Title - Centered like Mission & Vision */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '60px',
          padding: '0 20px'
        }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: '48px',
              fontWeight: '800',
              lineHeight: '1.1',
              color: colors.primary,
              marginBottom: '24px',
              fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Our Affiliations
            {/* Underline decoration */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '120px' }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{
                height: '4px',
                backgroundColor: colors.secondary,
                margin: '16px auto 0',
                borderRadius: '2px',
              }}
            />
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '18px',
              color: colors.textSecondary,
              marginTop: '20px',
              fontWeight: '300',
              fontFamily: 'inherit'
            }}
          >
            Building Stronger Networks • Driven by Impact
          </motion.p>
        </div>

        {/* Default Message */}
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          padding: '0 40px',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              backgroundColor: colors.surface,
              padding: '60px 40px',
              borderRadius: '16px',
              boxShadow: `0 8px 32px ${colors.cardShadow}`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: colors.primary,
              borderRadius: '50%',
              margin: '0 auto 32px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg 
                width="40" 
                height="40" 
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
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{
                fontSize: '20px',
                lineHeight: '1.6',
                color: colors.text,
                fontWeight: '400',
                marginBottom: '0',
                fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              ACEF partners with key institutions in over 10 countries. We value all our affiliations and accreditors and continue to thrive in meaningful partnerships.
            </motion.p>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            section {
              padding: 40px 0 !important;
            }
            
            h1 {
              font-size: 36px !important;
            }
            
            .default-message {
              padding: 40px 24px !important;
            }
            
            .default-message p {
              font-size: 18px !important;
            }
          }
          
          @media (max-width: 480px) {
            h1 {
              font-size: 28px !important;
            }
            
            .default-message {
              padding: 32px 20px !important;
            }
            
            .default-message p {
              font-size: 16px !important;
            }
          }
        `}</style>
      </section>
    );
  }

  const renderItemLogo = (item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
        cursor: 'pointer',
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      <img
        src={`${STATIC_URL}/uploads/partners/${item.logo}`}
        alt={item.name}
        style={{
          maxWidth: '160px',
          maxHeight: '80px',
          objectFit: 'contain',
          transition: 'filter 0.3s ease',
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
          width: '120px',
          height: '60px',
          fontSize: '12px',
          color: colors.textSecondary,
          textAlign: 'center',
          border: `1px dashed ${colors.border}`,
          borderRadius: '4px',
        }}
      >
        {item.name}
      </div>
    </motion.div>
  );

  const renderSection = (title, items) => {
    if (!items.length) return null;

    return (
      <div style={{ marginBottom: '80px' }}>
        {/* Section Title - Keep original design with border bottom */}
        <div style={{ 
          borderBottom: `2px solid ${colors.border}`,
          marginBottom: '40px',
          paddingBottom: '10px'
        }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: colors.text,
              margin: 0,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {title}
          </h2>
        </div>

        {/* Logo Grid - Centered */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '0 auto',
          justifyItems: 'center',
        }}>
          {items.map((item, index) => renderItemLogo(item, index))}
        </div>
      </div>
    );
  };

  return (
    <section
      style={{
        backgroundColor: colors.background,
        padding: '60px 0',
        width: '100%',
        margin: 0,
      }}
    >
      {/* Main Title - Centered like Mission & Vision */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '80px',
        padding: '0 20px'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: '48px',
            fontWeight: '800',
            lineHeight: '1.1',
            color: colors.primary,
            marginBottom: '24px',
            fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Our Affiliations
          {/* Underline decoration */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '120px' }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              height: '4px',
              backgroundColor: colors.secondary,
              margin: '16px auto 0',
              borderRadius: '2px',
            }}
          />
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: '18px',
            color: colors.textSecondary,
            marginTop: '20px',
            fontWeight: '300',
            fontFamily: 'inherit'
          }}
        >
          Building Stronger Networks • Driven by Impact
        </motion.p>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '0 40px'
      }}>
        {/* Partners Section (always visible first) */}
        {partnersOnly.length > 0 && renderSection('Partners', partnersOnly)}

        {/* Accreditors Section (animates on scroll) */}
        {accreditors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }} 
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {renderSection('Accreditors', accreditors)}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          section {
            padding: 40px 0 !important;
          }
          
          section > div:last-child {
            padding: 0 20px !important;
          }
          
          h2 {
            font-size: 20px !important;
          }
          
          img {
            max-width: 100px !important;
            max-height: 50px !important;
          }
        }
        
        @media (max-width: 480px) {
          section > div:last-child {
            padding: 0 16px !important;
          }
          
          .logo-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default PartnersSlider;