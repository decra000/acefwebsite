import React, { useState, useEffect, useRef } from 'react';
import { Target, Users, Leaf, Zap, Shield, Recycle, TreePine, Droplets, Wheat, GraduationCap, Heart, Briefcase, Sparkles, Globe, TrendingUp, ArrowRight } from 'lucide-react';
import { useTheme } from '../../theme';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

// Counter component for animated numbers
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(numericValue * easeOutQuart);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, value, duration]);

  const displayValue = value.includes('+') ? `${count}+` : count.toString();

  return (
    <span ref={counterRef}>
      {displayValue}
    </span>
  );
};

const ACEFDashboard = () => {
  const [activeView, setActiveView] = useState('1year');
  const [hoveredCard, setHoveredCard] = useState(null);
  const { colors, isDarkMode } = useTheme();
  
  const navigate = useNavigate();

  const oneYearGoals = [
    {
      id: 'capacity',
      title: 'Youth Capacity',
      icon: <Users size={20} />,
      color: colors.primary,
      metric: '3+ Workshops',
      desc: '25% growth in policy participation'
    },
    {
      id: 'advocacy',
      title: 'Policy Advocacy',
      icon: <Target size={20} />,
      color: colors.secondary,
      metric: '2+ UN Papers',
      desc: '5+ youth reps at conferences'
    },
    {
      id: 'pilots',
      title: 'Community Impact',
      icon: <Leaf size={20} />,
      color: colors.accent,
      metric: '1+ Pilot Project',
      desc: 'Framework for youth initiatives'
    },
    {
      id: 'sustainability',
      title: 'Org Growth',
      icon: <Briefcase size={20} />,
      color: colors.accentDark,
      metric: '5+ Grants',
      desc: '30% social media growth'
    }
  ];

  const programmePillars = [
    { id: 'resilience', title: 'Climate Resilience', icon: <Shield size={16} />, color: colors.primary, impact: '13 Communities' },
    { id: 'energy', title: 'Clean Energy', icon: <Zap size={16} />, color: colors.secondary, impact: '20 Enterprises' },
    { id: 'migration', title: 'Climate Security', icon: <Globe size={16} />, color: colors.accent, impact: '3 Regional Reports' },
    { id: 'waste', title: 'Waste Innovation', icon: <Recycle size={16} />, color: colors.success, impact: '5 Urban Areas' },
    { id: 'conservation', title: 'Nature Protection', icon: <TreePine size={16} />, color: colors.primaryLight, impact: '5 Hotspots' },
    { id: 'wash', title: 'Water & Sanitation', icon: <Droplets size={16} />, color: colors.info, impact: '5 Communities' },
    { id: 'agriculture', title: 'Food Security', icon: <Wheat size={16} />, color: colors.warning, impact: '15 Cooperatives' },
    { id: 'education', title: 'Climate Education', icon: <GraduationCap size={16} />, color: '#8b5cf6', impact: '5,000+ Students' },
    { id: 'health', title: 'Environmental Health', icon: <Heart size={16} />, color: '#ec4899', impact: '5 Health Projects' },
    { id: 'employment', title: 'Green Jobs', icon: <TrendingUp size={16} />, color: colors.accentDark, impact: 'Incubator Program' }
  ];

  const CompactCard = ({ item, type }) => {
    const isHovered = hoveredCard === item.id;
    
    return (
      <div
        style={{
          ...styles.compactCard,
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 20px ${colors.cardShadow}`
        }}
        onMouseEnter={() => setHoveredCard(item.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={styles.cardHeader}>
          <div 
            style={{
              ...styles.iconContainer,
              backgroundColor: isDarkMode ? `${item.color}20` : `${item.color}15`
            }}
          >
            <div style={{ color: item.color }}>
              {item.icon}
            </div>
          </div>
          {type === '5year' && (
            <span style={{
              ...styles.timelineTag,
              backgroundColor: colors.backgroundSecondary,
              color: colors.textSecondary
            }}>
              2025-30
            </span>
          )}
        </div>

        <h3 style={{
          ...styles.cardTitle,
          color: colors.text
        }}>
          {item.title}
        </h3>
        
        <div style={{ ...styles.cardMetric, color: item.color }}>
          {item.metric || item.impact}
        </div>
        
        {item.desc && (
          <p style={{
            ...styles.cardDesc,
            color: colors.textSecondary
          }}>
            {item.desc}
          </p>
        )}

        {/* Hover overlay */}
        <div 
          style={{
            ...styles.hoverOverlay,
            opacity: isHovered ? 1 : 0,
            backgroundColor: isDarkMode ? `${item.color}10` : `${item.color}05`
          }}
        />
      </div>
    );
  };

  const ViewToggle = () => (
    <div style={styles.toggleContainer}>
      <div style={{
        ...styles.toggleWrapper,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 1px 3px ${colors.cardShadow}`
      }}>
        {[
          { 
            id: '1year', 
            label: '1-Year Strategic Plan', 
            sublabel: '2025-2026',
            icon: <Target size={20} />,
            color: colors.primary
          },
          { 
            id: '5year', 
            label: '5-Year Programme Vision', 
            sublabel: '2025-2030',
            icon: <Sparkles size={20} />,
            color: colors.secondary
          }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            style={{
              ...styles.toggleButton,
              ...(activeView === view.id ? {
                ...styles.toggleButtonActive,
                background: `linear-gradient(135deg, ${view.color} 0%, ${view.color}dd 100%)`,
                boxShadow: `0 4px 12px rgba(0,0,0,0.15)`
              } : {
                ...styles.toggleButtonInactive,
                color: colors.textSecondary
              })
            }}
          >
            <div style={{
              ...styles.toggleIcon,
              ...(activeView === view.id ? 
                styles.toggleIconActive : 
                { backgroundColor: colors.backgroundSecondary }
              )
            }}>
              <div style={{ color: activeView === view.id ? 'white' : view.color }}>
                {view.icon}
              </div>
            </div>
            <div style={styles.toggleContent}>
              <div style={styles.toggleLabel}>{view.label}</div>
              <div style={{
                ...styles.toggleSublabel,
                color: activeView === view.id ? 'rgba(255,255,255,0.8)' : colors.textMuted
              }}>
                {view.sublabel}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      ...styles.container,
      backgroundColor: colors.background
    }}>
      <div style={styles.content}>

        
        {/* Header */}
        <div style={styles.header}>
          <motion.div style={{
            ...styles.badge,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 1px 3px ${colors.cardShadow}`
          }}>
            <Sparkles size={16} style={{ color: colors.warning }} />
            <span style={{
              ...styles.badgeText,
              color: colors.text
            }}>ACEF Strategic Vision</span>
          </motion.div>

        {/* Title section */}
              <div
                style={{
                  maxWidth: '1100px',
                  margin: '0 auto 80px auto',
                  textAlign: 'center'
                }}
              >
                
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: '-50px' }}
                  transition={{ duration: 0.6 }}
                  style={{
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 600,
                    color: colors.text,
                    margin: '0 0 16px 0',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}
                >
                  Africa 2030
                </motion.h1>
                
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ margin: '-50px' }}
                  transition={{ duration: 0.8 }}
                  style={{
                    width: '60px',
                    height: '2px',
                    background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
                    margin: '0 auto 24px auto',
                    borderRadius: '1px',
                    transformOrigin: 'center'
                  }}
                />
        
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: '-50px' }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    fontSize: '16px',
                    color: colors.textSecondary,
                    margin: '0',
                    letterSpacing: '0.5px',
                    fontWeight: 400,
                    opacity: 0.9
                  }}
                >
                Empowering youth-led climate solutions across the continent ·  
                </motion.p>
              </div>
        

        
          {/* Stats */}
          <motion.div 
            transition={{ duration: 0.6, delay: 0.2 }}
            style={styles.statsGrid}
          >
            {[
              { value: '10', label: 'Pillars' },
              { value: '5', label: 'Years' },
              { value: '100+', label: 'Youth' },
              { value: '54', label: 'Nations' },
            ].map((stat, idx) => (
              <div key={idx} style={styles.statItem}>
                <div style={{
                  ...styles.statValue,
                  color: colors.text
                }}>
                  <AnimatedCounter value={stat.value} duration={2000 + idx * 200} />
                </div>
                <div style={{
                  ...styles.statLabel,
                  color: colors.textSecondary
                }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <ViewToggle />

        {/* Content with transitions */}
        <div style={styles.contentWrapper}>
          <div style={{
            ...styles.viewSection,
            ...(activeView === '1year' ? styles.viewSectionActive : styles.viewSectionHidden)
          }}>
            <div style={styles.sectionHeader}>
              <h2 style={{
                ...styles.sectionTitle,
                color: colors.text
              }}>Strategic Goals 2025-2026</h2>
              <p style={{
                ...styles.sectionDesc,
                color: colors.textSecondary
              }}>Foundation goals establishing ACEF as a leading climate action force</p>
            </div>
            <div style={styles.goalsGrid}>
              {oneYearGoals.map((goal, index) => (
                <div 
                  key={goal.id}
                  style={{
                    ...styles.gridItem,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <CompactCard item={goal} type="1year" />
                </div>
              ))}
            </div>
          </div>

          <div style={{
            ...styles.viewSection,
            ...(activeView === '5year' ? styles.viewSectionActive : styles.viewSectionHidden)
          }}>
            <div style={styles.sectionHeader}>
              <h2 style={{
                ...styles.sectionTitle,
                color: colors.text
              }}>Programme Pillars 2025-2030</h2>
              <p style={{
                ...styles.sectionDesc,
                color: colors.textSecondary
              }}>Comprehensive action framework across key impact areas</p>
            </div>
            <div style={styles.pillarsGrid}>
              {programmePillars.map((pillar, index) => (
                <div 
                  key={pillar.id}
                  style={{
                    ...styles.gridItem,
                    animationDelay: `${index * 80}ms`
                  }}
                >
                  <CompactCard item={pillar} type="5year" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
      style={styles.ctaSection}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div style={styles.ctaButtons}>
        <button
          style={{
            ...styles.primaryButton,
            backgroundColor: colors.primary,
            boxShadow: `0 4px 12px rgba(0,0,0,0.15)`
          }}
          onClick={() => navigate("/impact#projects")}
        >
          <span>Explore Programmes</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>



      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 16px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '24px',
    marginBottom: '16px'
  },
  badgeText: {
    fontSize: '14px',
    fontWeight: '500'
  },
  title: {
    fontSize: '64px',
    fontWeight: '900',
    marginBottom: '12px',
    lineHeight: '1'
  },
  gradientText: {
    background: 'linear-gradient(45deg, #0a451c 0%, #facf3c 50%, #9ccf9f 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '18px',
    maxWidth: '512px',
    margin: '0 auto 24px',
    lineHeight: '1.6'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    maxWidth: '384px',
    margin: '0 auto 32px'
  },
  statItem: {
    textAlign: 'center'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700'
  },
  statLabel: {
    fontSize: '12px'
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px'
  },
  toggleWrapper: {
    display: 'inline-flex',
    borderRadius: '16px',
    padding: '4px'
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    fontWeight: '500'
  },
  toggleButtonActive: {
    color: '#ffffff',
    transform: 'scale(1.02)'
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent'
  },
  toggleIcon: {
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  toggleIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  toggleContent: {
    textAlign: 'left'
  },
  toggleLabel: {
    fontSize: '14px',
    fontWeight: '600'
  },
  toggleSublabel: {
    fontSize: '12px'
  },
  contentWrapper: {
    position: 'relative',
    overflow: 'hidden'
  },
  viewSection: {
    transition: 'all 0.5s ease'
  },
  viewSectionActive: {
    transform: 'translateX(0)',
    opacity: 1
  },
  viewSectionHidden: {
    transform: 'translateX(100%)',
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  sectionDesc: {
    fontSize: '16px' // Increased from default
  },
  goalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  pillarsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  gridItem: {
    animation: 'fadeInUp 0.3s ease forwards',
    opacity: 0,
    transform: 'translateY(16px)'
  },
  compactCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  iconContainer: {
    padding: '8px',
    borderRadius: '8px',
    transition: 'transform 0.2s ease'
  },
  timelineTag: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '12px'
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: '16px', // Increased from 14px
    marginBottom: '4px',
    transition: 'color 0.3s ease'
  },
  cardMetric: {
    fontSize: '16px', // Increased from 14px
    fontWeight: '500',
    marginBottom: '8px'
  },
  cardDesc: {
    fontSize: '15px', // Increased from 14px
    lineHeight: '1.4',
    margin: 0
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  },
  ctaSection: {
    marginTop: '48px',
    textAlign: 'center'
  },
  ctaButtons: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '12px'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '16px',
    fontWeight: '600',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  secondaryButton: {
    padding: '12px 24px',
    borderRadius: '16px',
    fontWeight: '600',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: 768px) {
    .goals-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .goals-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    .pillars-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1280px) {
    .pillars-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  .compact-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .icon-container:hover {
    transform: scale(1.1);
  }

  .primary-button:hover {
    transform: scale(1.05);
  }

  .secondary-button:hover {
    border-color: #9ca3af;
  }

  .toggle-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  @media (min-width: 640px) {
    .toggle-buttons {
      flex-direction: row;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ACEFDashboard;