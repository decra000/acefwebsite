      import { motion } from 'framer-motion';

import React, { useState, useEffect, useRef } from "react";

// Import API_URL from your config (adjust path as needed)
// const API_URL = 'your-api-url';
import { API_URL } from '../../config';

const API_BASE = API_URL;


// Theme hook (matching dashboard theme system)
const useTheme = () => {
  const [isDarkMode] = useState(true); // Assuming dark mode for this component
  
  const colors = {
    primary: '#0a451c',
    secondary: '#facf3c',
    accent: '#9ccf3f',
    primaryLight: '#1a5a2c',
    primaryDark: '#052310',
    secondaryLight: '#fdd835',
    accentLight: '#b8dfbb',
    accentDark: '#7a9b2d',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    white: '#ffffff',
    black: '#000000',
    background: '#000000',
    backgroundSecondary: '#0f0f0f',
    surface: '#1a1a1a',
    cardBg: '#1e1e1e',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.15)',
    cardShadow: 'rgba(0, 0, 0, 0.3)'
  };

  return { colors, isDarkMode };
};

// Constants and Configuration
const ANIMATION_CONFIG = {
  autoRotateInterval: 15000,
  transitionDuration: 300,
  parallaxMultiplier: 0.08,
  mouseParallax: { x: 25, y: 20 }
};

// Default images for different pillar types (fallback images)
const DEFAULT_IMAGES = {
  energy: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1600&h=1200&fit=crop&q=95&auto=format",
  peace: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&h=1200&fit=crop&q=95&auto=format",
  waste: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&h=1200&fit=crop&q=95&auto=format",
  nature: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&h=1200&fit=crop&q=95&auto=format",
  water: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&h=1200&fit=crop&q=95&auto=format",
  agriculture: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=1200&fit=crop&q=95&auto=format",
  education: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1600&h=1200&fit=crop&q=95&auto=format",
  health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1600&h=1200&fit=crop&q=95&auto=format",
  youth: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=1200&fit=crop&q=95&auto=format"
};

// Color schemes for different pillars
const PILLAR_THEMES = [
  { gradient: "from-emerald-900/60 via-green-800/40 to-emerald-900/60", accentColor: "#00ff88", icon: "🌱" },
  { gradient: "from-blue-900/60 via-indigo-800/40 to-blue-900/60", accentColor: "#00ccff", icon: "🕊️" },
  { gradient: "from-purple-900/60 via-violet-800/40 to-purple-900/60", accentColor: "#ff44ff", icon: "♻️" },
  { gradient: "from-teal-900/60 via-cyan-800/40 to-teal-900/60", accentColor: "#00ffd4", icon: "🌿" },
  { gradient: "from-sky-900/60 via-blue-800/40 to-sky-900/60", accentColor: "#0088ff", icon: "💧" },
  { gradient: "from-amber-900/60 via-yellow-800/40 to-amber-900/60", accentColor: "#ffaa00", icon: "🌾" },
  { gradient: "from-rose-900/60 via-pink-800/40 to-rose-900/60", accentColor: "#ff4488", icon: "📚" },
  { gradient: "from-red-900/60 via-rose-800/40 to-red-900/60", accentColor: "#ff3366", icon: "🏥" },
  { gradient: "from-orange-900/60 via-amber-800/40 to-orange-900/60", accentColor: "#ff6600", icon: "🚀" }
];

// Utility function to get image based on pillar name/keywords
const getImageForPillar = (name, description) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('energy') || lowerName.includes('net zero')) return DEFAULT_IMAGES.energy;
  if (lowerName.includes('peace') || lowerName.includes('security') || lowerName.includes('migration')) return DEFAULT_IMAGES.peace;
  if (lowerName.includes('waste') || lowerName.includes('chemical')) return DEFAULT_IMAGES.waste;
  if (lowerName.includes('nature') || lowerName.includes('conservation') || lowerName.includes('resource')) return DEFAULT_IMAGES.nature;
  if (lowerName.includes('water') || lowerName.includes('wash') || lowerName.includes('sanitation')) return DEFAULT_IMAGES.water;
  if (lowerName.includes('agriculture') || lowerName.includes('food')) return DEFAULT_IMAGES.agriculture;
  if (lowerName.includes('education') || lowerName.includes('learning')) return DEFAULT_IMAGES.education;
  if (lowerName.includes('health')) return DEFAULT_IMAGES.health;
  if (lowerName.includes('youth') || lowerName.includes('job') || lowerName.includes('employment')) return DEFAULT_IMAGES.youth;
  
  // Default to nature image
  return DEFAULT_IMAGES.nature;
};

// Transform API data to component format
const transformPillarData = (apiPillars) => {
  return apiPillars.map((pillar, index) => {
    const theme = PILLAR_THEMES[index % PILLAR_THEMES.length];
    const focusAreas = pillar.focus_areas ? pillar.focus_areas.map(fa => fa.name) : [];
    
    return {
      id: pillar.id,
      title: pillar.name,
      text: pillar.description,
      focusAreas: focusAreas,
      number: String(index + 1).padStart(2, '0'),
      image: getImageForPillar(pillar.name, pillar.description),
      gradient: theme.gradient,
      accentColor: theme.accentColor,
      icon: theme.icon
    };
  });
};

// Custom Hooks
const useScrollParallax = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollY * ANIMATION_CONFIG.parallaxMultiplier;
};

const useMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return {
    mousePosition,
    mouseParallax: {
      x: mousePosition.x * ANIMATION_CONFIG.mouseParallax.x,
      y: mousePosition.y * ANIMATION_CONFIG.mouseParallax.y
    }
  };
};

const useVisibilityObserver = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  return { isVisible, sectionRef };
};

const useAutoRotation = (maxIndex, onRotate, isEnabled = true) => {
  useEffect(() => {
    if (!isEnabled || maxIndex === 0) return;
    
    const interval = setInterval(() => {
      onRotate(prev => (prev + 1) % maxIndex);
    }, ANIMATION_CONFIG.autoRotateInterval);
    
    return () => clearInterval(interval);
  }, [maxIndex, onRotate, isEnabled]);
};

// API Hook
const usePillarsData = () => {
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPillars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching pillars from API...');
      
      const response = await fetch(`${API_BASE}/pillars`, { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pillars: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Pillars data received:', data);
      
      const transformedPillars = transformPillarData(data.data || []);
      setPillars(transformedPillars);
      
    } catch (err) {
      console.error('Error fetching pillars:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPillars();
  }, []);

  return { pillars, loading, error, refetch: fetchPillars };
};

// Style Generators
const createGlassBackground = (colors, opacity = 0.1) => `
  linear-gradient(135deg, 
    ${colors.surface}aa 0%,
    ${colors.cardBg}77 50%,
    ${colors.surface}aa 100%)
`;

const createHolographicGradient = (color1, color2, colors) => `
  linear-gradient(135deg, 
    ${color1} 0%, 
    ${color2} 50%,
    ${color1} 100%)
`;

const createQuantumBackground = (accentColor, colors) => `
  linear-gradient(135deg, 
    ${colors.background} 0%,
    rgba(0, 0, 0, 0.6) 25%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.7) 75%,
    ${colors.background} 100%
  ),
  radial-gradient(circle at 30% 40%, ${accentColor}20 0%, transparent 60%),
  radial-gradient(circle at 80% 20%, ${accentColor}15 0%, transparent 50%)
`;

// Sub-components
const QuantumBackground = ({ activePillar, scrollY, mouseParallax, colors }) => (
  <div className="quantum-background">
    <img
      key={activePillar.number}
      src={activePillar.image}
      alt={activePillar.title}
      className="background-image"
      style={{
        transform: `scale(${1.1 + mouseParallax.x * 0.0008}) translate3d(${mouseParallax.x * 0.5}px, ${mouseParallax.y * 0.3}px, 0)`
      }}
    />
    
    <div 
      className="dynamic-overlay"
      style={{ background: createQuantumBackground(activePillar.accentColor, colors) }}
    />
  </div>
);

const QuantumEffects = ({ activePillar, parallaxOffset, mouseParallax, scrollY, colors }) => (
  <>
    <div 
      className="floating-element floating-element--right"
      style={{
        background: `conic-gradient(from ${scrollY * 0.1}deg at 50% 50%, 
          ${activePillar.accentColor}40 0deg, 
          transparent 60deg, 
          ${activePillar.accentColor}20 120deg,
          transparent 180deg,
          ${activePillar.accentColor}30 240deg,
          transparent 300deg,
          ${activePillar.accentColor}40 360deg)`,
        transform: `translate3d(${mouseParallax.x * 1.2}px, ${mouseParallax.y + parallaxOffset * 0.08}px, 0) rotate(${scrollY * 0.03}deg)`
      }}
    />
    
    <div 
      className="floating-element floating-element--left"
      style={{
        background: `radial-gradient(circle, 
          ${activePillar.accentColor}25 0%, 
          ${activePillar.accentColor}15 30%,
          transparent 70%)`,
        transform: `translate3d(${-mouseParallax.x * 0.8}px, ${-mouseParallax.y * 0.6 - parallaxOffset * 0.05}px, 0) rotate(${-scrollY * 0.02}deg)`
      }}
    />
    
    <div 
      className="grid-line grid-line--left"
      style={{
        background: `linear-gradient(to bottom, 
          transparent, 
          ${activePillar.accentColor}60, 
          ${activePillar.accentColor}80,
          ${activePillar.accentColor}40,
          transparent)`,
        transform: `translate3d(${mouseParallax.x * 0.8}px, ${parallaxOffset * 0.15}px, 0) 
          rotateZ(${15 + mouseParallax.x * 0.2}deg) 
          perspective(1000px) 
          rotateX(${15 + mouseParallax.y * 0.4}deg)`,
        boxShadow: `0 0 30px ${activePillar.accentColor}60`
      }}
    />
    
    <div 
      className="grid-line grid-line--right"
      style={{
        background: `linear-gradient(to bottom, 
          transparent, 
          ${activePillar.accentColor}40, 
          ${activePillar.accentColor}60,
          transparent)`,
        transform: `translate3d(${-mouseParallax.x * 0.6}px, ${-parallaxOffset * 0.1}px, 0) 
          rotateZ(${-20 + mouseParallax.x * 0.12}deg)`,
        boxShadow: `0 0 20px ${activePillar.accentColor}40`
      }}
    />
  </>
);



const PillarNavigationItem = ({ pillar, index, isActive, onSelect, colors }) => {
  const handleMouseEnter = (e) => {
    if (!isActive) {
      const element = e.currentTarget;
      element.style.opacity = '0.8';
      element.style.transform = 'translate3d(15px, 0, 15px) scale(1.01)';
      element.style.background = createGlassBackground(colors, 0.15);
      element.style.borderColor = `${pillar.accentColor}20`;
    }
  };

  const handleMouseLeave = (e) => {
    if (!isActive) {
      const element = e.currentTarget;
      element.style.opacity = '0.5';
      element.style.transform = 'translate3d(0, 0, 0) scale(1)';
      element.style.background = 'transparent';
      element.style.borderColor = 'transparent';
    }
  };

  return (
    <div
      className={`pillar-nav-item ${isActive ? 'pillar-nav-item--active' : ''}`}
      style={{
        background: isActive 
          ? createGlassBackground(colors, 0.2)
          : 'transparent',
        borderColor: isActive ? `${pillar.accentColor}40` : 'transparent',
        boxShadow: isActive 
          ? `inset 0 1px 0 ${colors.border}, 0 15px 40px ${colors.cardShadow}, 0 0 50px ${pillar.accentColor}30`
          : 'none'
      }}
      onClick={() => onSelect(index)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isActive && <div className="quantum-ripple" style={{ background: `radial-gradient(circle, ${pillar.accentColor}15 0%, transparent 70%)` }} />}
      
      <div 
        className="pillar-number"
        style={{
          background: isActive 
            ? createHolographicGradient(pillar.accentColor, colors.text, colors)
            : colors.surface,
          color: isActive ? colors.text : colors.textSecondary,
          textShadow: isActive ? `0 0 30px ${pillar.accentColor}80` : 'none'
        }}
      >
        {pillar.number}
      </div>

      <div className="pillar-icon" style={{ filter: isActive ? `drop-shadow(0 0 10px ${pillar.accentColor}60)` : 'none' }}>
        {pillar.icon}
      </div>
      
      <h3 
        className="pillar-title"
        style={{
          color: isActive ? colors.text : colors.textMuted,
          textShadow: isActive ? `0 0 20px ${pillar.accentColor}40` : 'none'
        }}
      >
        {pillar.title}
      </h3>
      
      <div 
        className="activation-indicator"
        style={{
          background: isActive 
            ? `linear-gradient(to bottom, ${pillar.accentColor}, ${colors.text}, ${pillar.accentColor})` 
            : colors.border,
          boxShadow: isActive ? `0 0 25px ${pillar.accentColor}80, inset 0 0 10px ${pillar.accentColor}40` : 'none'
        }}
      >
        {isActive && (
          <>
            <div className="quantum-orb quantum-orb--top" style={{ background: pillar.accentColor, boxShadow: `0 0 20px ${pillar.accentColor}80` }} />
            <div className="quantum-orb quantum-orb--bottom" style={{ background: colors.text }} />
          </>
        )}
      </div>
    </div>
  );
};

const PillarNavigation = ({ pillars, activeIndex, onPillarChange, activePillar, isVisible, colors }) => (
  <div className={`pillar-navigation ${isVisible ? 'pillar-navigation--visible' : ''}`}>
    <div 
      className="navigation-container"
      style={{
        background: createGlassBackground(colors, 0.12),
        border: `1px solid ${colors.border}`,
        boxShadow: `0 30px 80px ${colors.cardShadow}, inset 0 1px 0 ${colors.border}, 0 0 40px ${activePillar.accentColor}20`
      }}
    >
      <div 
        className="quantum-edge-glow"
        style={{
          background: `conic-gradient(from 0deg, ${activePillar.accentColor}40, transparent, ${activePillar.accentColor}20, transparent, ${activePillar.accentColor}40)`
        }}
      />
      
      {pillars.map((pillar, index) => (
        <PillarNavigationItem
          key={pillar.id}
          pillar={pillar}
          index={index}
          isActive={index === activeIndex}
          onSelect={onPillarChange}
          colors={colors}
        />
      ))}
    </div>
  </div>
);

const FocusAreasGrid = ({ focusAreas, accentColor, isTransitioning, isVisible, colors }) => (
  <div className="focus-areas">
    <h4 
      className="focus-areas-title" 
      style={{ 
        color: accentColor, 
        textShadow: `0 0 25px ${accentColor}80`
      }}
    >
      <div style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} className="title-line" />
      Focus Areas Matrix
      <div style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }} className="title-line" />
    </h4>
    
    <div className="focus-areas-grid">
      {focusAreas.map((area, index) => (
        <div
          key={index}
          className={`focus-area-item ${isVisible ? 'focus-area-item--visible' : ''}`}
          style={{
            background: createGlassBackground(colors, 0.15),
            border: `1px solid ${colors.border}`,
            opacity: isTransitioning ? 0.3 : 1,
            animationDelay: `${index * 0.15}s`,
            color: colors.text
          }}
          onMouseEnter={(e) => {
            e.target.style.background = createGlassBackground(colors, 0.25);
            e.target.style.borderColor = `${accentColor}60`;
            e.target.style.transform = 'translate3d(0, -12px, 30px) scale(1.03)';
            e.target.style.boxShadow = `0 25px 60px ${colors.cardShadow}, inset 0 1px 0 ${colors.border}, 0 0 40px ${accentColor}60`;
            e.target.style.color = colors.text;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = createGlassBackground(colors, 0.15);
            e.target.style.borderColor = colors.border;
            e.target.style.transform = 'translate3d(0, 0, 0)';
            e.target.style.boxShadow = `inset 0 1px 0 ${colors.border}, 0 10px 30px ${colors.cardShadow}`;
            e.target.style.color = colors.text;
          }}
        >
          <div className="quantum-particle" style={{ background: accentColor, boxShadow: `0 0 15px ${accentColor}80` }} />
          {area}
        </div>
      ))}
    </div>
  </div>
);

const ProgressMatrix = ({ pillars, activeIndex, activePillar, onPillarChange, colors }) => {
  const createProgressButton = (direction, targetIndex, symbol) => {
    const handleMouseEnter = (e) => {
      e.target.style.background = createGlassBackground(colors, 0.3);
      e.target.style.transform = 'scale(1.1) translate3d(0, -2px, 10px)';
      e.target.style.boxShadow = `0 10px 25px ${colors.cardShadow}, 0 0 30px ${activePillar.accentColor}60`;
      e.target.style.color = colors.text;
    };

    const handleMouseLeave = (e) => {
      e.target.style.background = createGlassBackground(colors, 0.15);
      e.target.style.transform = 'scale(1) translate3d(0, 0, 0)';
      e.target.style.boxShadow = `inset 0 1px 0 ${colors.border}`;
      e.target.style.color = activePillar.accentColor;
    };

    return (
      <button
        className="progress-button"
        style={{
          background: createGlassBackground(colors, 0.15),
          border: `1px solid ${colors.border}`,
          color: activePillar.accentColor
        }}
        onClick={() => onPillarChange(targetIndex)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {symbol}
      </button>
    );
  };

  return (
    <div 
      className="progress-matrix"
      style={{
        background: createGlassBackground(colors, 0.12),
        border: `1px solid ${colors.border}`,
        boxShadow: `inset 0 1px 0 ${colors.border}`
      }}
    >
      <div className="progress-bars">
        {pillars.map((pillar, index) => (
          <div
            key={pillar.id}
            className="progress-bar"
            style={{
              background: index <= activeIndex 
                ? `linear-gradient(90deg, ${activePillar.accentColor}, ${colors.text}, ${activePillar.accentColor})` 
                : colors.surface,
              boxShadow: index <= activeIndex 
                ? `0 0 20px ${activePillar.accentColor}80, inset 0 1px 2px ${activePillar.accentColor}40` 
                : 'none'
            }}
            onClick={() => onPillarChange(index)}
            onMouseEnter={(e) => {
              if (index > activeIndex) {
                e.target.style.background = colors.cardBg;
              }
            }}
            onMouseLeave={(e) => {
              if (index > activeIndex) {
                e.target.style.background = colors.surface;
              }
            }}
          >
            {index <= activeIndex && (
              <div className="progress-particle" style={{ background: colors.text }} />
            )}
          </div>
        ))}
      </div>
      
      <div 
        className="progress-counter"
        style={{
          background: createGlassBackground(colors, 0.2),
          border: `1px solid ${colors.border}`,
          color: colors.text,
          textShadow: `0 0 20px ${activePillar.accentColor}60`,
          boxShadow: `inset 0 1px 0 ${colors.border}, 0 0 25px ${activePillar.accentColor}40`
        }}
      >
        {String(activeIndex + 1).padStart(2, '0')} <span className="counter-separator" style={{ color: colors.textMuted }}>/</span> {String(pillars.length).padStart(2, '0')}
      </div>

      <div className="navigation-controls">
        {createProgressButton('prev', activeIndex > 0 ? activeIndex - 1 : pillars.length - 1, '←')}
        {createProgressButton('next', activeIndex < pillars.length - 1 ? activeIndex + 1 : 0, '→')}
      </div>
    </div>
  );
};

const PillarContent = ({ activePillar, isVisible, isTransitioning, mousePosition, colors }) => (
  <div className={`pillar-content ${isVisible ? 'pillar-content--visible' : ''}`}>
    <div 
      className="content-container"
      style={{
        background: createGlassBackground(colors, 0.15),
        border: `1px solid ${colors.border}`,
        boxShadow: `0 40px 120px ${colors.cardShadow}, inset 0 1px 0 ${colors.border}, 0 0 60px ${activePillar.accentColor}20`,
        transform: `perspective(1000px) rotateX(${mousePosition.y * 1}deg) rotateY(${mousePosition.x * 1}deg) translate3d(0, 0, ${isTransitioning ? '-50px' : '0'})`
      }}
    >
      <div 
        className="quantum-mesh"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, ${activePillar.accentColor}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${activePillar.accentColor}10 0%, transparent 50%),
            linear-gradient(45deg, transparent 49%, ${activePillar.accentColor}05 50%, transparent 51%)
          `
        }}
      />

      <div className="content-header">
        <div 
          className="content-number"
          style={{
            background: createHolographicGradient(activePillar.accentColor, colors.text, colors),
            color: colors.text,
            textShadow: `0 0 50px ${activePillar.accentColor}80`
          }}
        >
          {activePillar.number}
        </div>

        <div className="content-title-group">
          <h2 
            className="content-title"
            style={{
              background: createHolographicGradient(colors.text, activePillar.accentColor, colors),
              color: colors.text,
              textShadow: `0 0 40px ${activePillar.accentColor}60`,
              opacity: isTransitioning ? 0.3 : 1,
              transform: isTransitioning ? 'translate3d(0, 20px, -10px)' : 'translate3d(0, 0, 0)'
            }}
          >
            {activePillar.title}
          </h2>
          
          <div 
            className="content-icon"
            style={{ filter: `drop-shadow(0 0 20px ${activePillar.accentColor}80)` }}
          >
            {activePillar.icon}
          </div>
        </div>
      </div>
      
      <p 
        className="content-text"
        style={{
          color: colors.textSecondary,
          opacity: isTransitioning ? 0.3 : 1,
          transform: isTransitioning ? 'translate3d(0, 30px, -20px)' : 'translate3d(0, 0, 0)'
        }}
      >
        {activePillar.text}
      </p>

      <FocusAreasGrid 
        focusAreas={activePillar.focusAreas}
        accentColor={activePillar.accentColor}
        isTransitioning={isTransitioning}
        isVisible={isVisible}
        colors={colors}
      />
      
      <div className="status-matrix" style={{ borderColor: colors.border }}>
        <div className="status-item" style={{ color: colors.textMuted }}>
          Impact Level: <span className="status-value" style={{ color: activePillar.accentColor, textShadow: `0 0 10px ${activePillar.accentColor}60` }}>Continental</span>
        </div>
        
        <div className="status-item" style={{ color: colors.textMuted }}>
          Status: <span className="status-value status-value--active" style={{ color: colors.accent }}>Active</span>
        </div>
        
        <div className="quantum-sync">
          <div 
            className="sync-indicator"
            style={{
              background: activePillar.accentColor,
              boxShadow: `0 0 15px ${activePillar.accentColor}80`
            }}
          />
          <span className="sync-label" style={{ color: colors.textMuted }}>Quantum Sync</span>
        </div>
      </div>
    </div>
  </div>
);

// Loading Component
const LoadingScreen = ({ colors }) => (
  <div className="loading-screen" style={{ background: colors.background }}>
    <div className="loading-container" style={{ background: createGlassBackground(colors, 0.1), border: `1px solid ${colors.border}` }}>
      <div className="quantum-loader">
        <div 
          className="loader-ring"
          style={{
            borderColor: `${colors.accent}40`,
            borderTopColor: colors.accent
          }}
        />
        <div 
          className="loader-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.accent}40 0%, transparent 70%)`
          }}
        />
      </div>
      
      <div className="loading-text" style={{ color: colors.accent }}>
        Initializing Quantum Matrix...
      </div>
      
      <div className="loading-subtitle" style={{ color: colors.textSecondary }}>
        Synchronizing programme data streams
      </div>
    </div>
  </div>
);

// Error Component
const ErrorScreen = ({ error, onRetry, colors }) => (
  <div className="error-screen" style={{ background: colors.background }}>
    <div className="error-container" style={{ background: createGlassBackground(colors, 0.1), border: `1px solid ${colors.border}` }}>
      <div className="error-icon" style={{ color: colors.error }}>⚠️</div>
      <h3 className="error-title" style={{ color: colors.text }}>Connection Error</h3>
      <p className="error-message" style={{ color: colors.textSecondary }}>{error}</p>
      
      <button 
        className="retry-button"
        onClick={onRetry}
        style={{
          background: createGlassBackground(colors, 0.2),
          border: `1px solid ${colors.border}`,
          color: colors.text
        }}
        onMouseEnter={(e) => {
          e.target.style.background = createGlassBackground(colors, 0.4);
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = createGlassBackground(colors, 0.2);
          e.target.style.transform = 'scale(1)';
        }}
      >
        Retry Connection
      </button>
    </div>
  </div>
);

// Main Component
export default function ProgrammePillarsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { colors } = useTheme();
  
  // API Data Hook
  const { pillars, loading, error, refetch } = usePillarsData();
  
  // Custom Hooks
  const parallaxOffset = useScrollParallax();
  const { mousePosition, mouseParallax } = useMouseTracking();
  const { isVisible, sectionRef } = useVisibilityObserver();
  
  // Auto-rotation (disabled when loading or no data)
  useAutoRotation(pillars.length, setActiveIndex, !loading && pillars.length > 0);

  // Reset active index when pillars change
  useEffect(() => {
    if (pillars.length > 0 && activeIndex >= pillars.length) {
      setActiveIndex(0);
    }
  }, [pillars.length, activeIndex]);

  const handlePillarChange = (index) => {
    if (index !== activeIndex && pillars.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, ANIMATION_CONFIG.transitionDuration);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div ref={sectionRef} className="programme-pillars-section">
        <LoadingScreen colors={colors} />
        <style>{getStyles(colors)}</style>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div ref={sectionRef} className="programme-pillars-section">
        <ErrorScreen error={error} onRetry={refetch} colors={colors} />
        <style>{getStyles(colors)}</style>
      </div>
    );
  }

  // Handle empty state
  if (!pillars || pillars.length === 0) {
    return (
      <div ref={sectionRef} className="programme-pillars-section">
        <div className="empty-state" style={{ background: colors.background }}>
          <div className="empty-container" style={{ background: createGlassBackground(colors, 0.1), border: `1px solid ${colors.border}` }}>
            <div className="empty-icon">📋</div>
            <h3 className="empty-title" style={{ color: colors.text }}>No Programme Pillars Available</h3>
            <p className="empty-message" style={{ color: colors.textSecondary }}>
              Programme pillars are currently being configured. Please check back later.
            </p>
            <button 
              className="refresh-button"
              onClick={refetch}
              style={{
                background: createGlassBackground(colors, 0.2),
                border: `1px solid ${colors.border}`,
                color: colors.text
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>
        <style>{getStyles(colors)}</style>
      </div>
    );
  }

  const activePillar = pillars[activeIndex];

  return (
    <div ref={sectionRef} className="programme-pillars-section" style={{ backgroundColor: colors.background }}>
      <QuantumBackground 
        activePillar={activePillar}
        scrollY={window.scrollY || 0}
        mouseParallax={mouseParallax}
        colors={colors}
      />
      
      <QuantumEffects 
        activePillar={activePillar}
        parallaxOffset={parallaxOffset}
        mouseParallax={mouseParallax}
        scrollY={window.scrollY || 0}
        colors={colors}
      />

      <div className="section-container">

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
          Programme Pillars
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
          ACEF's key programme pillars that define our impact and plan.
        </motion.p>
      </div>




        <div className="content-grid">
          <PillarNavigation
            pillars={pillars}
            activeIndex={activeIndex}
            onPillarChange={handlePillarChange}
            activePillar={activePillar}
            isVisible={isVisible}
            colors={colors}
          />

          <PillarContent
            activePillar={activePillar}
            isVisible={isVisible}
            isTransitioning={isTransitioning}
            mousePosition={mousePosition}
            colors={colors}
          />
        </div>

        <ProgressMatrix 
          pillars={pillars}
          activeIndex={activeIndex}
          activePillar={activePillar}
          onPillarChange={handlePillarChange}
          colors={colors}
        />
      </div>

      <style>{getStyles(colors)}</style>
    </div>
  );
}

// Styles function with theme integration
function getStyles(colors) {
  return `
    .programme-pillars-section {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      background-color: ${colors.background};
    }

    /* Loading States */
    .loading-screen, .error-screen, .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .loading-container, .error-container, .empty-container {
      text-align: center;
      padding: 60px;
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: 0 20px 60px ${colors.cardShadow};
    }

    .quantum-loader {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
    }

    .loader-ring {
      width: 80px;
      height: 80px;
      border: 3px solid transparent;
      border-radius: 50%;
      animation: quantumSpin 2s linear infinite;
    }

    .loader-pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      animation: quantumPulse 1.5s ease-in-out infinite;
    }

    .loading-text, .error-title, .empty-title {
      font-size: clamp(20px, 3vw, 24px);
      font-weight: 700;
      margin-bottom: 15px;
      text-shadow: 0 0 20px currentColor;
      letter-spacing: -0.02em;
    }

    .loading-subtitle, .error-message, .empty-message {
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .error-icon, .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .retry-button, .refresh-button {
      padding: 15px 30px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 14px;
    }

    @keyframes quantumSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Background Components */
    .quantum-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .background-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease-out, opacity 1s ease-out;
      opacity: 0.9;
    }

    .dynamic-overlay {
      position: absolute;
      inset: 0;
      transition: all 1s ease-out;
    }

    /* Quantum Effects */
    .floating-element {
      position: absolute;
      border-radius: 50%;
      filter: blur(150px);
      transition: background 1s ease-out, transform 0.3s ease-out;
      z-index: 1;
    }

    .floating-element--right {
      top: 15%;
      right: 8%;
      width: 600px;
      height: 600px;
    }

    .floating-element--left {
      bottom: 10%;
      left: -5%;
      width: 800px;
      height: 800px;
      filter: blur(120px);
    }

    .grid-line {
      position: absolute;
      width: 2px;
      transition: all 0.3s ease-out, background 1s ease-out;
      z-index: 1;
    }

    .grid-line--left {
      top: 20%;
      left: 10%;
      height: 300px;
    }

    .grid-line--right {
      bottom: 25%;
      right: 15%;
      height: 200px;
      width: 1px;
    }

    /* Layout */
    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 120px 32px 200px;
      position: relative;
      z-index: 10;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 580px 1fr;
      gap: 120px;
      align-items: start;
      perspective: 3000px;
    }

    /* Header */
    .section-header {
      text-align: center;
      margin-bottom: 80px;
      transform: translate3d(0, 100px, -50px);
      opacity: 0;
      transition: all 2.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .section-header--visible {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .header-subtitle {
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      transform: translate3d(0, 30px, -20px);
      opacity: 0;
      transition: all 2s ease-out 0.5s, color 1s ease-out;
      text-shadow: 0 0 20px currentColor;
      position: relative;
    }

    .section-header--visible .header-subtitle {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .header-title {
      font-size: clamp(32px, 4vw, 48px);
      font-weight: 600;
      background-size: 300% 300%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
      line-height: 1.1;
      transform: translate3d(0, 60px, -30px) scale(0.9);
      opacity: 0;
      transition: all 2.5s ease-out 0.7s, background 1s ease-out;
      animation: holographicShimmer 2s ease-in-out infinite alternate;
    }

    .section-header--visible .header-title {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }

    .header-divider {
      width: 60px;
      height: 2px;
      margin: 0 auto 24px;
      transform: scaleX(0);
      transition: transform 3s ease-out 1s, background 1s ease-out;
      border-radius: 1px;
    }

    .section-header--visible .header-divider {
      transform: scaleX(1);
    }

    .header-description {
      font-size: 16px;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      max-width: 512px;
      margin: 0 auto;
      line-height: 1.6;
      font-weight: 400;
      letter-spacing: 0;
      transform: translate3d(0, 40px, -20px);
      opacity: 0;
      transition: all 2s ease-out 1.2s, background 1s ease-out;
    }

    .section-header--visible .header-description {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    /* Navigation */
    .pillar-navigation {
      position: sticky;
      top: 100px;
      transform: translate3d(-200px, 60px, -120px) rotateY(-20deg);
      opacity: 0;
      transition: all 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
    }

    .pillar-navigation--visible {
      transform: translate3d(0, 0, 0) rotateY(0deg);
      opacity: 1;
    }

    .navigation-container {
      backdrop-filter: blur(25px) saturate(200%) brightness(120%);
      -webkit-backdrop-filter: blur(25px) saturate(200%) brightness(120%);
      border-radius: 16px;
      padding: 32px 0;
      transition: border-color 1s ease-out, box-shadow 1s ease-out;
      position: relative;
    }

    .quantum-edge-glow {
      position: absolute;
      inset: -1px;
      border-radius: 16px;
      z-index: -1;
      filter: blur(2px);
      transition: background 1s ease-out;
    }

    .pillar-nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      cursor: pointer;
      transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
      border-radius: 12px;
      margin: 0 16px;
      border: 1px solid transparent;
      position: relative;
      overflow: hidden;
      opacity: 0.5;
    }

    .pillar-nav-item--active {
      transform: translate3d(15px, 0, 15px) scale(1.02);
      opacity: 1;
    }

    .quantum-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300%;
      height: 300%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      animation: quantumPulse 3s ease-in-out infinite;
      z-index: -1;
    }

    .pillar-number {
      font-size: 32px;
      font-weight: 700;
      background-size: 200% 200%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      min-width: 50px;
      transition: all 0.2s ease;
      font-feature-settings: "tnum" 1;
      line-height: 1;
    }

    .pillar-nav-item--active .pillar-number {
      animation: numberGlow 2s ease-in-out infinite alternate;
    }

    .pillar-icon {
      font-size: 20px;
      margin: 0;
      transition: all 0.6s ease;
    }

    .pillar-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      transition: color 0.2s ease;
      line-height: 1.3;
      letter-spacing: -0.02em;
      flex: 1;
    }

    .activation-indicator {
      width: 4px;
      height: 40px;
      transition: all 0.2s ease;
      border-radius: 3px;
      position: relative;
    }

    .quantum-orb {
      position: absolute;
      left: 50%;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      transform: translateX(-50%);
      animation: quantumOrb 2s ease-in-out infinite;
    }

    .quantum-orb--top {
      top: -6px;
    }

    .quantum-orb--bottom {
      bottom: -6px;
      animation-delay: 1s;
    }

    /* Content */
    .pillar-content {
      transform: translate3d(150px, 100px, -100px) rotateY(15deg);
      opacity: 0;
      transition: all 2.5s cubic-bezier(0.16, 1, 0.3, 1) 1s;
    }

    .pillar-content--visible {
      transform: translate3d(0, 0, 0) rotateY(0deg);
      opacity: 1;
    }

    .content-container {
      backdrop-filter: blur(30px) saturate(200%) brightness(120%);
      -webkit-backdrop-filter: blur(30px) saturate(200%) brightness(120%);
      border-radius: 16px;
      padding: 32px;
      position: relative;
      overflow: hidden;
      transition: all 1s ease-out;
    }

    .quantum-mesh {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      transition: background 1s ease-out;
      z-index: -1;
    }

    .content-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .content-number {
      font-size: 48px;
      font-weight: 700;
      background-size: 300% 300%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
      font-feature-settings: "tnum" 1;
      animation: holographicShimmer 3s ease-in-out infinite alternate;
      transition: all 1s ease-out;
    }

    .content-title-group {
      flex: 1;
    }

    .content-title {
      font-size: clamp(24px, 3vw, 32px);
      font-weight: 600;
      background-size: 200% 200%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      line-height: 1.1;
      letter-spacing: -0.02em;
      animation: holographicShimmer 2s ease-in-out infinite alternate 1s;
      transition: all 1s ease-out;
    }

    .content-icon {
      font-size: 24px;
      margin: 8px 0 0 0;
      animation: float 3s ease-in-out infinite;
    }

    .content-text {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
      font-weight: 400;
      letter-spacing: 0;
      text-shadow: 0 2px 4px ${colors.cardShadow};
      transition: all 0.2s ease-out;
    }

    /* Focus Areas */
    .focus-areas {
      margin-bottom: 32px;
    }

    .focus-areas-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: color 1s ease-out;
    }

    .title-line {
      width: 32px;
      height: 2px;
      transition: background 1s ease-out;
    }

    .focus-areas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .focus-area-item {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-radius: 12px;
      padding: 16px;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0;
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
      cursor: pointer;
      box-shadow: inset 0 1px 0 ${colors.border}, 0 4px 12px ${colors.cardShadow};
      transform: translate3d(0, 0, 0);
      position: relative;
      overflow: hidden;
      opacity: 0;
      transform: translate3d(0, 50px, -30px) scale(0.9);
    }

    .focus-area-item--visible {
      animation: quantumSlideIn 1s ease-out forwards;
    }

    .quantum-particle {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      animation: quantumParticle 2s ease-in-out infinite;
    }

    /* Progress Matrix */
    .progress-matrix {
      backdrop-filter: blur(20px) saturate(150%);
      -webkit-backdrop-filter: blur(20px) saturate(150%);
      border-radius: 16px;
      padding: 16px;
      transition: all 1s ease-out;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 32px;
    }

    .progress-bars {
      display: flex;
      gap: 8px;
      flex: 1;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      transition: all 1.5s ease;
      position: relative;
      cursor: pointer;
    }

    .progress-particle {
      position: absolute;
      top: 50%;
      left: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 15px currentColor;
      animation: quantumFlow 2s ease-in-out infinite;
    }

    .progress-counter {
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.05em;
      transition: all 1s ease-out;
    }

    .navigation-controls {
      display: flex;
      gap: 8px;
    }

    .progress-button {
      width: 40px;
      height: 40px;
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: inset 0 1px 0 ${colors.border};
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Status Matrix */
    .status-matrix {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-top: 1px solid ${colors.border};
      transition: border-color 1s ease-out;
    }

    .status-item {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    .status-value {
      transition: color 1s ease-out;
      font-weight: 600;
    }

    .status-value--active {
      text-shadow: 0 0 10px currentColor;
    }

    .quantum-sync {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .sync-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: quantumPulse 1.5s ease-in-out infinite;
      transition: background 1s ease-out;
    }

    .sync-label {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    /* Animations */
    @keyframes holographicShimmer {
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 100%; }
      100% { background-position: 0% 0%; }
    }

    @keyframes quantumSlideIn {
      from {
        transform: translate3d(0, 50px, -30px) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translate3d(0, 0, 0) scale(1);
        opacity: 1;
      }
    }

    @keyframes quantumPulse {
      0%, 100% { 
        transform: scale(1) rotate(0deg);
        opacity: 1; 
      }
      50% { 
        transform: scale(1.3) rotate(180deg);
        opacity: 0.7; 
      }
    }

    @keyframes quantumOrb {
      0%, 100% { 
        transform: translateX(-50%) scale(1);
        opacity: 1; 
      }
      50% { 
        transform: translateX(-50%) scale(1.5);
        opacity: 0.6; 
      }
    }

    @keyframes quantumParticle {
      0%, 100% { 
        transform: scale(1);
        opacity: 1; 
      }
      33% { 
        transform: scale(1.5);
        opacity: 0.8; 
      }
      66% { 
        transform: scale(0.8);
        opacity: 1; 
      }
    }

    @keyframes quantumFlow {
      0% { left: 0%; }
      100% { left: 100%; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    @keyframes numberGlow {
      0% { 
        filter: drop-shadow(0 0 20px currentColor); 
      }
      100% { 
        filter: drop-shadow(0 0 40px currentColor) drop-shadow(0 0 60px currentColor);
      }
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
        gap: 40px;
      }
      .pillar-navigation {
        position: static;
        margin-bottom: 32px;
      }
      .section-container {
        padding: 80px 24px 120px;
      }
    }

    @media (max-width: 768px) {
      .section-container {
        padding: 80px 16px 120px;
      }
      .content-grid {
        gap: 32px;
      }
      .section-header {
        margin-bottom: 48px;
      }
      .content-container {
        padding: 24px;
      }
      .focus-areas-grid {
        grid-template-columns: 1fr;
      }
      .pillar-nav-item {
        padding: 12px 16px;
        gap: 12px;
      }
      .pillar-number {
        font-size: 24px;
        min-width: 40px;
      }
      .content-number {
        font-size: 36px;
      }
      .navigation-container {
        padding: 16px 0;
      }
      .progress-matrix {
        padding: 12px;
        gap: 12px;
        flex-direction: column;
      }
      .progress-bars {
        order: 2;
        width: 100%;
      }
      .progress-counter {
        order: 1;
        align-self: center;
      }
      .navigation-controls {
        order: 3;
        align-self: center;
      }
    }

    /* Enhanced Effects */
    html {
      scroll-behavior: smooth;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: ${colors.backgroundSecondary};
    }

    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, ${colors.accent}, ${colors.primary});
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, ${colors.accentLight}, ${colors.primaryLight});
    }






        @supports (backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px)) {
          .glass-enhanced {
            backdrop-filter: blur(20px) saturate(180%) brightness(110%);
            -webkit-backdrop-filter: blur(20px) saturate(180%) brightness(110%);
          }
        }
      `}
  
  
