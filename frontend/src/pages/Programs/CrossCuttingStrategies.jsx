import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Handshake, 
  BarChart3, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../theme';

const CrossCuttingStrategies = () => {
  const { colors, isDarkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('policy');

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const strategies = [
    {
      id: 'policy',
      icon: Globe,
      title: "Policy Advocacy",
      description: "UN engagement and youth representation in global discussions",
      fullDescription: "Our people are actively and intellectually engaged in the complexities, context and policy implications of their work. It makes them stand out as exceptional climate advocates and policy professionals.",
      color: colors.primary
    },
    {
      id: 'partnerships',
      icon: Handshake,
      title: "Strategic Partnerships", 
      description: "Collaboration with agencies, governments, and private sector",
      fullDescription: "We work alongside our partners to champion initiatives that make an impact on the community around us. Our people dedicate time through collaboration and partnership building, and work with organizations across the world to truly amplify our impact.",
      color: colors.secondary
    },
    {
      id: 'knowledge',
      icon: BarChart3,
      title: "Knowledge Sharing",
      description: "Research dissemination through our online hub",
      fullDescription: "We believe in the power of shared knowledge and open research. Our comprehensive approach to knowledge dissemination ensures that climate science and policy insights reach the communities and decision-makers who need them most.",
      color: colors.accent
    },
    {
      id: 'resources',
      icon: DollarSign,
      title: "Resource Mobilization",
      description: "Diversified funding for long-term sustainability", 
      fullDescription: "Our strategic approach to resource mobilization ensures sustainable funding streams that support long-term climate action initiatives while maintaining our commitment to transparency and community impact.",
      color: colors.info
    }
  ];

  const activeStrategy = strategies.find(s => s.id === activeSection) || strategies[0];

  return (
    <section style={{
      minHeight: '80vh',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: isDarkMode ? colors.gray900 : '#f1c40f',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '32px 0' : '40px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: isMobile ? '0 16px' : '0 20px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '24px' : '40px'
      }}>
        {/* Left Side - Strategy List */}
        <div style={{
          width: isMobile ? '100%' : '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: isMobile ? '32px' : '60px' }}>
            <h1 style={{
              fontSize: isMobile ? '2rem' : '2.5rem', // 32px mobile, 40px desktop
              fontWeight: '700',
              color: isDarkMode ? colors.text : 'rgba(15, 23, 42, 0.9)',
              margin: '0 0 12px 0',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              fontFamily: 'inherit',
              textAlign: 'left'
            }}>
              Cross-Cutting Strategies
            </h1>
            <p style={{
              fontSize: isMobile ? '0.875rem' : '1rem', // 14px mobile, 16px desktop
              fontWeight: '400',
              color: isDarkMode ? colors.textSecondary : 'rgba(15, 23, 42, 0.7)',
              margin: '0',
              lineHeight: '1.6',
              fontFamily: 'inherit'
            }}>
              Integrated approaches spanning all our programs
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '24px' : '40px'
          }}>
            {strategies.map((strategy, index) => (
              <div key={strategy.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveSection(strategy.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '0',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <h2 style={{
                    fontSize: isMobile ? '1.75rem' : '2rem', // 28px mobile, 32px desktop
                    fontWeight: '600',
                    color: activeSection === strategy.id 
                      ? (isDarkMode ? colors.text : 'rgba(15, 23, 42, 0.9)')
                      : (isDarkMode ? colors.textSecondary : 'rgba(15, 23, 42, 0.6)'),
                    margin: '0',
                    lineHeight: '1.3',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    zIndex: 2,
                    transition: 'color 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    fontFamily: 'inherit',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = isDarkMode ? colors.text : 'rgba(15, 23, 42, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== strategy.id) {
                      e.target.style.color = isDarkMode ? colors.textSecondary : 'rgba(15, 23, 42, 0.6)';
                    }
                  }}
                  >
                    {strategy.title}
                  </h2>
                  
                  {/* Animated underline */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '0',
                    height: '3px',
                    backgroundColor: isDarkMode ? colors.secondary : 'rgba(15, 23, 42, 0.8)',
                    width: activeSection === strategy.id ? '100%' : '30%',
                    transition: 'width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    transformOrigin: 'left',
                    boxShadow: isDarkMode 
                      ? `0 0 8px ${colors.secondary}50` 
                      : '0 2px 4px rgba(15, 23, 42, 0.3)'
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Active Strategy Details */}
        <div style={{
          width: isMobile ? '100%' : '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Animated content container */}
          <div key={activeStrategy.id} style={{
            animation: 'fadeInSlide 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
            opacity: 1
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: isMobile ? '24px' : '40px',
              opacity: 0,
              animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) 0.2s forwards'
            }}>
              <div style={{
                width: isMobile ? '48px' : '60px',
                height: isMobile ? '48px' : '60px',
                backgroundColor: isDarkMode 
                  ? `${activeStrategy.color}20` 
                  : 'rgba(15, 23, 42, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              >
                <activeStrategy.icon 
                  size={isMobile ? 24 : 28} 
                  style={{ 
                    color: isDarkMode ? activeStrategy.color : 'rgba(15, 23, 42, 0.7)',
                    transition: 'color 0.3s ease'
                  }}
                />
              </div>
            </div>

            <p style={{
              fontSize: isMobile ? '0.875rem' : '1rem', // 14px mobile, 16px desktop
              fontWeight: '400',
              color: isDarkMode ? colors.textSecondary : 'rgba(15, 23, 42, 0.7)',
              lineHeight: '1.6',
              margin: '0 0 16px 0',
              letterSpacing: '-0.01em',
              fontStyle: 'italic',
              opacity: 0,
              animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) 0.3s forwards',
              fontFamily: 'inherit'
            }}>
              {activeStrategy.description}
            </p>

            <p style={{
              fontSize: isMobile ? '1.125rem' : '1.25rem', // 18px mobile, 20px desktop
              fontWeight: '400',
              color: isDarkMode ? colors.text : 'rgba(15, 23, 42, 0.8)',
              lineHeight: '1.6',
              margin: '0',
              letterSpacing: '-0.01em',
              opacity: 0,
              animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) 0.4s forwards',
              fontFamily: 'inherit'
            }}>
              {activeStrategy.fullDescription}
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        /* Responsive text adjustments */
        @media (max-width: 768px) {
          section {
            padding: 40px 0 !important;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.75rem !important; /* 28px for very small screens */
          }
          
          h2 {
            font-size: 1.5rem !important; /* 24px for very small screens */
          }
        }

        /* Focus states for accessibility */
        button:focus-visible {
          outline: 2px solid ${colors.primary};
          outline-offset: 4px;
          border-radius: 4px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          h1, h2, p {
            text-shadow: none !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Print styles */
        @media print {
          section {
            background: white !important;
            color: black !important;
          }
          
          h1, h2, p {
            color: black !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CrossCuttingStrategies;