import React, { useState, useEffect, useRef } from "react";

export default function ObjectivesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const sectionRef = useRef(null);

  const colors = {
    primary: '#0a451c',
    secondary: '#facf3c',
    accent: '#9ccf9f',
    primaryLight: '#1a5a2c',
    white: '#ffffff',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563'
  };

  const objectives = [
    "Promote economic empowerment and ensure meaningful participation of the community in poverty reduction",
    "Provide education and training in sustainable development and climate change through collaboration",
    "Promote effective solid waste management through proper dumping, sorting, and recycling initiatives",
    "Empower community action on water conservation, quality management, and sanitation infrastructure",
    "Develop innovations to eliminate harmful processes and utilize natural resources sustainably",
    "Campaign against traditions that hinder sustainable development and promote climate action",
    "Safeguard environmental protection rights through advocacy and community mobilization"
  ];

  const icons = ["⚡", "🎯", "🔄", "💧", "🚀", "🌊", "🛡️"];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setTimeout(() => setAnimationPhase(1), 500);
          setTimeout(() => setAnimationPhase(2), 1000);
          setTimeout(() => setAnimationPhase(3), 1500);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef}
      style={{
        fontFamily: '"Inter", sans-serif',
        background: `radial-gradient(ellipse at center, ${colors.primary}03 0%, ${colors.white} 70%)`,
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Futuristic background elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 30%, ${colors.accent}08 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, ${colors.secondary}06 0%, transparent 50%),
          linear-gradient(45deg, transparent 48%, ${colors.primary}02 49%, ${colors.primary}02 51%, transparent 52%)
        `,
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>

      {/* Animated grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(${colors.primary}08 1px, transparent 1px),
          linear-gradient(90deg, ${colors.primary}08 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: animationPhase >= 1 ? 0.3 : 0,
        transition: 'opacity 1s ease'
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* Header with scan line effect */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          position: 'relative'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '300',
            color: colors.primary,
            margin: 0,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            position: 'relative',
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <span style={{
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.secondary}, ${colors.primary})`,
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: isVisible ? 'textShimmer 3s ease-in-out infinite' : 'none'
            }}>
              OBJECTIVES
            </span>
          </h2>
          
          {/* Scanning line */}
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            width: animationPhase >= 2 ? '200px' : '0',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
            transform: 'translateX(-50%)',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 10px ${colors.accent}60`
          }}></div>
        </div>

        {/* Central Hub Visualization */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          minHeight: '600px'
        }}>
          
          {/* Central Core */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.accent}, ${colors.secondary}, ${colors.primary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: animationPhase >= 3 ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: isVisible ? 'rotate 20s linear infinite' : 'none',
            boxShadow: `0 0 30px ${colors.primary}40`
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '700',
              color: colors.primary
            }}>
              🎯
            </div>
          </div>

          {/* Orbital Objectives */}
          {objectives.map((objective, index) => {
            const angle = (index / objectives.length) * 360 - 90;
            const radius = 280;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) ${
                    animationPhase >= 3 ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)'
                  }`,
                  transition: `all 1s cubic-bezier(0.4, 0, 0.2, 1) ${0.2 + index * 0.1}s`,
                  width: '200px'
                }}
              >
                {/* Connection Line */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '140px',
                  height: '2px',
                  background: `linear-gradient(90deg, ${colors.primary}60, transparent)`,
                  transformOrigin: '0 50%',
                  transform: `rotate(${angle + 180}deg) translateY(-50%)`,
                  opacity: animationPhase >= 3 ? 0.6 : 0,
                  transition: `opacity 1s ease ${0.5 + index * 0.1}s`,
                  zIndex: 1
                }}></div>

                {/* Objective Node */}
                <div style={{
                  background: `linear-gradient(135deg, ${colors.white}, ${colors.gray100})`,
                  borderRadius: '16px',
                  padding: '20px',
                  border: `2px solid ${colors.primary}20`,
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 8px 32px ${colors.primary}15`,
                  transition: 'all 0.3s ease',
                  zIndex: 2
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = colors.accent;
                  e.currentTarget.style.boxShadow = `0 12px 40px ${colors.accent}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = `${colors.primary}20`;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}15`;
                }}
                >
                  {/* Node Icon */}
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '20px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    boxShadow: `0 4px 12px ${colors.primary}40`
                  }}>
                    {icons[index]}
                  </div>

                  {/* Number */}
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '15px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: colors.primary,
                    background: colors.secondary,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {index + 1}
                  </div>

                  {/* Content */}
                  <p style={{
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    color: colors.gray600,
                    margin: '10px 0 0 0',
                    fontWeight: '400'
                  }}>
                    {objective}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Energy rings */}
          {[1, 2, 3].map((ring) => (
            <div
              key={ring}
              style={{
                position: 'absolute',
                width: `${120 + ring * 80}px`,
                height: `${120 + ring * 80}px`,
                borderRadius: '50%',
                border: `1px solid ${colors.primary}${ring === 1 ? '30' : ring === 2 ? '20' : '10'}`,
                transform: animationPhase >= 2 ? 'scale(1)' : 'scale(0)',
                transition: `all 1s cubic-bezier(0.4, 0, 0.2, 1) ${ring * 0.2}s`,
                animation: isVisible ? `rotate ${10 + ring * 5}s linear infinite reverse` : 'none'
              }}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes textShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @media (max-width: 768px) {
          div[style*="minHeight: '600px'"] {
            min-height: 400px !important;
          }
          div[style*="width: '200px'"] {
            width: 150px !important;
          }
          div[style*="radius = 280"] {
            /* Reduce orbital radius on mobile */
          }
        }
      `}</style>
    </div>
  );
}

