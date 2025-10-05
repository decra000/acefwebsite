import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  CheckCircle, 
  Handshake, 
  DollarSign, 
  Heart, 
  BarChart3, 
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

// Icon mapping for impact types
const iconMap = {
  people: Users,
  location_city: MapPin,
  check_circle: CheckCircle,
  handshake: Handshake,
  attach_money: DollarSign,
  volunteer_activism: Heart,
  assessment: BarChart3,
  trending_up: TrendingUp
};

// Environmental images for moodboard
const environmentalImages = [
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
    alt: "Dense forest canopy"
  },
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    alt: "Tropical paradise"
  },
  {
    url: "https://images.unsplash.com/photo-1574263867128-a3d5c1b1decc?w=400&h=400&fit=crop",
    alt: "Conservation worker"
  },
  {
    url: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400&h=400&fit=crop",
    alt: "Endangered wildlife"
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=400&fit=crop",
    alt: "Local community"
  },
  {
    url: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=400&fit=crop",
    alt: "Protected mountains"
  },
  {
    url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=400&fit=crop",
    alt: "Ocean conservation"
  },
  {
    url: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=400&fit=crop",
    alt: "Tree planting"
  }
];

const EnvironmentalCharity = () => {
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [colors, setColors] = useState({
    background: '#f9fafb',
    text: '#0a451c',
    textSecondary: '#4b5563',
    primary: '#0a451c',
    white: '#ffffff',
    cardBg: '#ffffff',
    border: 'rgba(10,69,28,0.1)',
    cardShadow: 'rgba(0,0,0,0.1)',
    success: '#10b981',
    info: '#3b82f6',
    secondary: '#8b5cf6',
    warning: '#f59e0b',
    error: '#ef4444',
    accent: '#facf3c'
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect theme from document body class
  useEffect(() => {
    const detectTheme = () => {
      const bodyClass = document.body.className;
      const isDark = bodyClass.includes('theme-dark');
      setIsDarkMode(isDark);
      
      if (isDark) {
        setColors({
          background: '#000000',
          text: '#ffffff',
          textSecondary: '#a0a0a0',
          primary: '#0a451c',
          white: '#ffffff',
          cardBg: '#0a0a0a',
          border: 'rgba(255,255,255,0.1)',
          cardShadow: 'rgba(0,0,0,0.3)',
          success: '#10b981',
          info: '#3b82f6',
          secondary: '#8b5cf6',
          warning: '#f59e0b',
          error: '#ef4444',
          accent: '#facf3c'
        });
      } else {
        setColors({
          background: '#f9fafb',
          text: '#0a451c',
          textSecondary: '#4b5563',
          primary: '#0a451c',
          white: '#ffffff',
          cardBg: '#ffffff',
          border: 'rgba(10,69,28,0.1)',
          cardShadow: 'rgba(0,0,0,0.1)',
          success: '#10b981',
          info: '#3b82f6',
          secondary: '#8b5cf6',
          warning: '#f59e0b',
          error: '#ef4444',
          accent: '#facf3c'
        });
      }
    };

    detectTheme();

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Fetch real featured impacts from API
  const fetchFeaturedImpacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE = process.env.REACT_APP_API_URL || 'https://your-api-base-url.com/api';
      
      const response = await fetch(`${API_BASE}/impacts?is_featured=true&is_active=true`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const featuredImpacts = data.data
          .filter(impact => impact.is_featured && impact.is_active)
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .slice(0, 6);
        
        setImpacts(featuredImpacts);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load impact data');
      console.error('Error fetching impacts:', err);
      
      // Fallback to sample data
      setImpacts([
        { 
          id: 1, 
          name: "Trees Protected", 
          current_value: 2500000, 
          starting_value: 1000000,
          unit: "trees", 
          color: colors.success,
          icon: "volunteer_activism",
          description: "Ancient rainforest trees saved from deforestation",
          project_count: 45
        },
        { 
          id: 2, 
          name: "Hectares Preserved", 
          current_value: 150000, 
          starting_value: 50000,
          unit: "hectares", 
          color: colors.info,
          icon: "location_city",
          description: "Protected forest land across multiple countries",
          project_count: 32
        },
        { 
          id: 3, 
          name: "Communities Supported", 
          current_value: 75, 
          starting_value: 25,
          unit: "communities", 
          color: colors.secondary,
          icon: "people",
          description: "Indigenous and local communities empowered",
          project_count: 18
        },
        { 
          id: 4, 
          name: "CO₂ Reduced", 
          current_value: 1200000, 
          starting_value: 400000,
          unit: "tons", 
          color: colors.warning,
          icon: "trending_up",
          description: "Carbon emissions prevented through conservation",
          project_count: 28
        },
        { 
          id: 5, 
          name: "Species Protected", 
          current_value: 500, 
          starting_value: 200,
          unit: "species", 
          color: colors.error,
          icon: "heart",
          description: "Endangered species given a second chance",
          project_count: 15
        },
        { 
          id: 6, 
          name: "Countries Reached", 
          current_value: 25, 
          starting_value: 10,
          unit: "countries", 
          color: colors.accent,
          icon: "check_circle",
          description: "Global reach of our conservation efforts",
          project_count: 8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedImpacts();
  }, []);

  const formatNumber = (num, unit) => {
    if (unit === 'USD') {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
      }
      return `$${num.toLocaleString()}`;
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const calculateGrowth = (current, starting) => {
    if (starting === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - starting) / starting) * 100);
  };

  const getGridLayout = () => {
    if (window.innerWidth <= 480) {
      return {
        columns: '1fr',
        rows: 'auto',
        gap: '12px'
      };
    } else if (window.innerWidth <= 768) {
      return {
        columns: 'repeat(2, 1fr)',
        rows: 'auto',
        gap: '14px'
      };
    } else {
      return {
        columns: 'repeat(3, 1fr)',
        rows: 'repeat(4, 150px)',
        gap: '16px'
      };
    }
  };

  const gridLayout = getGridLayout();

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'all 0.3s ease',
      paddingBottom: isMobile ? '40px' : '0',
      overflow: 'hidden',
      width: '100%'
    },

    mainContent: {
      display: 'flex',
      alignItems: 'stretch',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '40px 16px' : '80px 24px',
      gap: isMobile ? '40px' : '60px',
      minHeight: isMobile ? 'auto' : 'calc(100vh - 160px)',
      flexDirection: isMobile ? 'column' : 'row',
      width: '100%',
      boxSizing: 'border-box'
    },
    
    leftContent: {
      flex: '1',
      maxWidth: isMobile ? 'none' : '500px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingRight: isMobile ? '0' : '24px',
      textAlign: isMobile ? 'center' : 'left',
      marginBottom: isMobile ? '20px' : '0',
      width: '100%',
      boxSizing: 'border-box'
    },
    
    mainHeading: {
      fontSize: isMobile ? '32px' : '48px',
      fontWeight: '800',
      lineHeight: '1.1',
      color: colors.primary,
      marginBottom: '24px',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    
    subHeading: {
      color: colors.textSecondary,
      marginBottom: '2.5rem',
      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
      lineHeight: 1.7,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: isMobile ? 'none' : '500px',
      fontWeight: '400',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    
    ctaButton: {
      backgroundColor: colors.primary,
      color: colors.white,
      padding: isMobile ? '14px 28px' : '16px 32px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: isMobile ? '14px' : '16px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      alignSelf: isMobile ? 'center' : 'flex-start',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      whiteSpace: 'nowrap'
    },
    
    rightContent: {
      flex: '1',
      display: 'grid',
      gridTemplateColumns: gridLayout.columns,
      gridTemplateRows: gridLayout.rows,
      gap: gridLayout.gap,
      maxWidth: isMobile ? '100%' : '500px',
      paddingLeft: isMobile ? '0' : '24px',
      width: '100%',
      margin: isMobile ? '0 auto' : '0',
      justifySelf: isMobile ? 'center' : 'auto',
      boxSizing: 'border-box'
    },
    
    statCell: {
      backgroundColor: colors.cardBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '20px 16px' : '20px',
      border: `1px solid ${colors.border}`,
      position: 'relative',
      boxShadow: `0 4px 12px ${colors.cardShadow}`,
      minHeight: isMobile ? '100px' : 'auto',
      borderRadius: isMobile ? '12px' : '16px',
      overflow: 'hidden'
    },
    
    imageCell: {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      cursor: 'pointer',
      borderRadius: isMobile ? '12px' : '16px',
      overflow: 'hidden'
    },
    
    imageOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'all 0.3s ease',
    },
    
    statNumber: {
      fontSize: isMobile ? (window.innerWidth <= 480 ? '20px' : '22px') : '24px',
      fontWeight: '800',
      marginBottom: '4px',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      whiteSpace: 'nowrap'
    },
    
    statLabel: {
      fontSize: isMobile ? '11px' : '11px',
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      lineHeight: 1.3,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      hyphens: 'auto',
      maxWidth: '100%',
      padding: '0 4px'
    },
    
    growthIndicator: {
      position: 'absolute',
      top: isMobile ? '8px' : '8px',
      right: isMobile ? '8px' : '8px',
      backgroundColor: colors.success,
      color: colors.white,
      borderRadius: '12px',
      padding: '3px 7px',
      fontSize: isMobile ? '10px' : '10px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: isMobile ? '200px' : '400px',
      flexDirection: 'column',
      gap: '16px'
    },
    
    loadingText: {
      color: colors.textSecondary,
      fontSize: isMobile ? '14px' : '16px',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
  };

  // Desktop grid positioning
  const getDesktopGridPosition = (index) => {
    const positions = [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '3', gridRow: '1 / 3' },
      { gridColumn: '1', gridRow: '2' },
      { gridColumn: '2', gridRow: '2' },
      { gridColumn: '1 / 3', gridRow: '3' },
      { gridColumn: '3', gridRow: '3' },
      { gridColumn: '1', gridRow: '4' },
      { gridColumn: '2', gridRow: '4' },
      { gridColumn: '3', gridRow: '4' }
    ];
    return positions[index] || { gridColumn: '1', gridRow: '1' };
  };

  const renderGridContent = () => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <Loader2 size={isMobile ? 36 : 48} color={colors.primary} style={{ 
            animation: 'spin 2s linear infinite'
          }} />
          <p style={styles.loadingText}>
            Loading our impact...
          </p>
        </div>
      );
    }

    // Mobile view: only show stat cards
    if (isMobile) {
      return impacts.map((impact, index) => {
        const IconComponent = iconMap[impact.icon] || BarChart3;
        const growthPercent = calculateGrowth(impact.current_value, impact.starting_value);
        
        return (
          <motion.div
            key={`stat-${impact.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px', once: false }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={styles.statCell}
          >
            <div style={{
              ...styles.statNumber,
              color: impact.color
            }}>
              {formatNumber(impact.current_value, impact.unit)}
            </div>
            <div style={styles.statLabel}>
              {impact.name}
            </div>
            {growthPercent > 0 && (
              <div style={styles.growthIndicator}>
                <TrendingUp size={10} />
                +{growthPercent}%
              </div>
            )}
          </motion.div>
        );
      });
    }

    // Desktop view: moodboard with images and stats
    const gridItems = [];
    let imageIndex = 0;
    let impactIndex = 0;

    for (let i = 0; i < 10; i++) {
      const isStatCell = [1, 3, 6, 8].includes(i);
      const gridPosition = getDesktopGridPosition(i);

      if (isStatCell && impactIndex < impacts.length) {
        const impact = impacts[impactIndex];
        const IconComponent = iconMap[impact.icon] || BarChart3;
        const growthPercent = calculateGrowth(impact.current_value, impact.starting_value);
        
        gridItems.push(
          <motion.div
            key={`stat-${impact.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: '-50px', once: false }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.3 } }}
            style={{
              ...styles.statCell,
              ...gridPosition
            }}
          >
            <div style={{
              ...styles.statNumber,
              color: impact.color
            }}>
              {formatNumber(impact.current_value, impact.unit)}
            </div>
            <div style={styles.statLabel}>
              {impact.name}
            </div>
            {growthPercent > 0 && (
              <div style={styles.growthIndicator}>
                <TrendingUp size={10} />
                +{growthPercent}%
              </div>
            )}
          </motion.div>
        );
        impactIndex++;
      } else {
        const image = environmentalImages[imageIndex % environmentalImages.length];
        
        gridItems.push(
          <motion.div
            key={`image-${imageIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: '-50px', once: false }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            style={{
              ...styles.imageCell,
              ...gridPosition,
              backgroundImage: `url(${image.url})`
            }}
          >
            <motion.div 
              className="image-overlay" 
              style={styles.imageOverlay}
              whileHover={{ opacity: 1 }}
            >
              <Heart size={24} color="white" style={{ opacity: 0.9 }} />
            </motion.div>
          </motion.div>
        );
        imageIndex++;
      }
    }
    
    return gridItems;
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        
        .cta-button:active {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .cta-button:hover {
            transform: none;
          }
        }
      `}</style>

      <main style={styles.mainContent}>
        <motion.div 
          style={styles.leftContent}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px', once: false }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            style={styles.mainHeading}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px', once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We protect the world's<br />
            most precious ecosystems
          </motion.h1>
          
          <motion.div 
            style={styles.subHeading}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px', once: false }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p style={{ marginBottom: '1.5rem' }}>
              Our innovative conservation approach directly supports 
              high-impact environmental protection and community empowerment
            </p>
          </motion.div>
          
          <motion.button 
            style={styles.ctaButton}
            className="cta-button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px', once: false }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('/impact', '_blank')}
          >
            View Our Impact →
          </motion.button>
        </motion.div>

        <motion.div 
          style={styles.rightContent}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ margin: '-50px', once: false }}
          transition={{ duration: 0.8 }}
        >
          {renderGridContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default EnvironmentalCharity;