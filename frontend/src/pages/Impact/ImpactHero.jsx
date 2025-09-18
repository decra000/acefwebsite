import React, { useState, useEffect, useRef } from "react";
import { useTheme, colors } from '../../theme';

const ImpactHero = ({onStartClick}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeParticle, setActiveParticle] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { colors, isDarkMode } = useTheme();
  
  
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
    
    const interval = setInterval(() => {
      setActiveParticle(prev => (prev + 1) % 6);
    }, 2000);
    
    // Intersection Observer for visibility detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Scroll progress tracking
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate how much of the element is visible
        const visibleTop = Math.max(0, -elementTop);
        const visibleBottom = Math.min(elementHeight, windowHeight - elementTop);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const progress = visibleHeight / windowHeight;
        
        setScrollProgress(Math.min(1, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const handleStartClick = () => {
    if (onStartClick) {
      onStartClick();
    }
  };

    const handleProjectsClick = () => {
    }
  
  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: activeParticle === i ? '#10b981' : 'rgba(10, 69, 28, 0.3)',
        top: `${20 + (i * 12)}%`,
        left: `${10 + (i * 15)}%`,
        animation: `floatParticle ${3 + (i * 0.5)}s ease-in-out infinite`,
        transition: 'all 0.5s ease',
        zIndex: 3,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0) translateY(20px)',
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${i * 0.1}s`,
      }}
    />
  ));

  return (
    <section ref={sectionRef} style={styles.section}>
      {/* Background Pattern */}
      <div style={{
        ...styles.backgroundPattern,
        transform: `translateY(${scrollProgress * 20}px)`,
        opacity: 0.5 + (scrollProgress * 0.5),
      }} />
      
      {/* Floating particles */}
      {floatingElements}
      
      {/* Hero Image with Glass Overlay */}
      <div ref={imageRef} style={{
        ...styles.imageContainer,
        transform: `translateX(${isVisible ? 0 : 100}px) scale(${isVisible ? 1 : 0.9}) rotateY(${scrollProgress * -5}deg)`,
        opacity: isVisible ? 1 : 0,
        transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
        transformOrigin: 'left center',
      }}>
        <div 
          style={{
            ...styles.heroImage,
            backgroundImage: "url('/vol.jpg')",
            opacity: isLoaded && isVisible ? 1 : 0,
            transform: `scale(${1 + scrollProgress * 0.1}) translateZ(0)`,
            transition: 'all 0.8s ease-out',
          }}
        />
        <div style={{
          ...styles.imageOverlay,
          background: `linear-gradient(135deg, rgba(10, 69, 28, ${0.1 - scrollProgress * 0.05}) 0%, rgba(156, 207, 159, ${0.05 + scrollProgress * 0.03}) 100%)`,
        }} />
      </div>

      {/* Content Overlay */}
      <div style={styles.contentOverlay}>
        {/* Floating Status Badge */}
    

        {/* Main Content */}
        <div style={styles.mainContent}>
          <h2 style={{
            ...styles.title,
            // transform: `translateY(${isVisible ? 0 : 50}px) translateX(${scrollProgress * -15}px)`,
            // opacity: isVisible ? 1 : 0,
            // transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
          }} className="holographic-text">
            Transforming 
            Communities
          </h2>
          
          <p style={{
            ...styles.subtitle,
            transform: `translateY(${isVisible ? 0 : 40}px) translateX(${scrollProgress * -10}px)`,
            opacity: isVisible ? 1 : 0,
            // transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
          }}>
            Empowering grassroots initiatives for a sustainable future across Africa.
            <br />
            Every action creates ripples of positive change.
          </p>
          
          <div style={{
            ...styles.ctaContainer,
            transform: `translateY(${isVisible ? 0 : 30}px)`,
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s',
          }}>
                <button
        style={{
          ...styles.primaryButton,
          transform: `translateX(${scrollProgress * -5}px)`,
        }}
        className="glass-card primary-action"
        onClick={handleStartClick} // ✅ scrolls to impact
      >
        <span>View Our Impact</span>
        <div style={styles.buttonGlow}></div>
      </button>

      <button
        style={{
          ...styles.secondaryButton,
          transform: `translateX(${scrollProgress * -3}px)`,
        }}
        className="glass-card"
        onClick={handleProjectsClick} // ✅ scrolls to projects
      >
        Explore Projects
      </button>
          </div>
        </div>

        {/* Impact Stats */}
        <div style={{
          ...styles.statsContainer,
          transform: `translateY(${isVisible ? 0 : 30}px)`,
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s',
        }}>
          {[
            { number: '500K+', label: 'Lives Impacted' },
            { number: '50+', label: 'Communities' },
            { number: '100K', label: 'Youths' }
          ].map((stat, index) => (
            <div 
              key={index}
              style={{
                ...styles.statCard,
                transform: `translateY(${isVisible ? 0 : 20}px) scale(${isVisible ? 1 : 0.9})`,
                opacity: isVisible ? 1 : 0,
                transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.9 + index * 0.1}s`,
              }} 
              className="glass-card"
            >
              <div style={{
                ...styles.statNumber,
                transform: `scale(${1 + scrollProgress * 0.05})`,
              }} className="holographic-text">
                {stat.number}
              </div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shimmerEffect {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes softPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes buttonGlow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        @keyframes imageSlideIn {
          0% {
            transform: translateX(100px) scale(0.9) rotateY(-10deg);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1) rotateY(0deg);
            opacity: 1;
          }
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: rgba(10, 69, 28, 0.2);
        }
        
        .primary-action:hover {
          border-color: rgba(10, 69, 28, 0.4) !important;
          box-shadow: 0 20px 40px rgba(10, 69, 28, 0.2) !important;
        }
        
        .holographic-text {
     
        }
        
        /* Enhanced scroll animations */
        @media (prefers-reduced-motion: no-preference) {
          .scroll-reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .scroll-reveal.visible {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .mobile-stack {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .mobile-full {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};

const styles = {
  
  section: {
    position: 'relative',
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(156, 207, 159, 0.05) 0%, rgba(250, 207, 60, 0.03) 50%, rgba(10, 69, 28, 0.02) 100%)',
    overflow: 'hidden',
    fontFamily: 'inherit',
    perspective: '1000px',
  },

  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.03'%3E%3Ccircle cx='15' cy='15' r='1' fill='%230a451c'/%3E%3Ccircle cx='45' cy='15' r='1' fill='%230a451c'/%3E%3Ccircle cx='30' cy='30' r='1' fill='%230a451c'/%3E%3Cline x1='15' y1='15' x2='45' y2='15' stroke='%230a451c' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'all 0.3s ease-out',
  },

  imageContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '60%',
    height: '70%',
    zIndex: 2,
    transformStyle: 'preserve-3d',
  },

  heroImage: {
    width: '100%',
    height: '130%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '20px 0 0 20px',
    transition: 'all 0.8s ease-out',
    willChange: 'transform, opacity',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '20px 0 0 20px',
    transition: 'background 0.3s ease-out',
  },

  contentOverlay: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    width: '100%',
  },

  // statusBadge: {
  //   display: 'inline-flex',
  //   alignItems: 'center',
  //   gap: '8px',
  //   padding: '12px 24px',
  //   borderRadius: '50px',
  //   marginBottom: '2rem',
  //   boxShadow: '0 8px 32px rgba(10, 69, 28, 0.1)',
  // },

  // statusDot: {
  //   width: '8px',
  //   height: '8px',
  //   borderRadius: '50%',
  //   backgroundColor: '#10b981',
  //   animation: 'softPulse 2s ease-in-out infinite',
  // },

  // badgeText: {
  //   fontSize: '14px',
  //   fontWeight: '600',
  //   color: '#0a451c',
  //   letterSpacing: '0.5px',
  // },

  mainContent: {
        marginTop: '6rem',

    maxWidth: '600px',
    marginBottom: '3rem',
  },

  title: {
    fontSize: '48px',
      fontWeight: '800',
      lineHeight: '1.1',
      color: colors.primary,
      marginBottom: '24px',
      fontFamily: 'inherit',
  },

  subtitle: {
    color: colors.textSecondary,
      marginBottom: '2.5rem',
      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
      lineHeight: 1.7,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      maxWidth: '450px',
      fontWeight: '400'
  },

  ctaContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '3rem',
  },

  primaryButton: {
    position: 'relative',
    padding: '1rem 2rem',
    borderRadius: '15px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid rgba(10, 69, 28, 0.2)',
    color: '#0a451c',
    overflow: 'hidden',
    transition: 'transform 0.3s ease-out',
  },

  secondaryButton: {
       backgroundColor: colors.primary,
      color: colors.white,
      padding: '16px 32px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: `0 4px 16px rgba(10, 69, 28, 0.3)`,
      alignSelf: 'flex-start',
      fontFamily: '"Nunito Sans", sans-serif'
  },

  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(10, 69, 28, 0.1), transparent)',
    animation: 'buttonGlow 2s ease-in-out infinite',
    pointerEvents: 'none',
  },

  statsContainer: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    maxWidth: '500px',
  },

  statCard: {
    padding: '1.5rem 1.25rem',
    borderRadius: '16px',
    textAlign: 'center',
    minWidth: '120px',
    flex: '1',
  },

  statNumber: {
    fontSize: '1.75rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    lineHeight: 1,
    transition: 'transform 0.3s ease-out',
  },

  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
};

export default ImpactHero;