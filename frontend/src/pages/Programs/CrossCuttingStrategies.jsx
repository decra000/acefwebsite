import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme';
import { 
  Globe, 
  Handshake, 
  BarChart3, 
  DollarSign,
  Users,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react';

const CrossCuttingStrategies = () => {
  const { colors, isDarkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

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
      id: 1,
      icon: Globe,
      title: "Policy Advocacy",
      description: "UN engagement and youth representation in global discussions",
      color: colors.primary
    },
    {
      id: 2,
      icon: Handshake,
      title: "Strategic Partnerships",
      description: "Collaboration with agencies, governments, and private sector",
      color: colors.secondary
    },
    {
      id: 3,
      icon: BarChart3,
      title: "Knowledge Sharing",
      description: "Research dissemination through our online hub",
      color: colors.accent
    },
    {
      id: 4,
      icon: DollarSign,
      title: "Resource Mobilization",
      description: "Diversified funding for long-term sustainability",
      color: colors.info
    }
  ];

  return (
    <section style={{
      padding: isMobile ? '40px 0' : '60px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
        : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 20px'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '32px' : '40px',
          gap: isMobile ? '16px' : '30px',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div style={{ flex: 1, maxWidth: isMobile ? '100%' : '600px' }}>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '700',
              color: colors.text,
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Cross-Cutting Strategies
            </h2>
            
            <p style={{
              color: colors.textSecondary,
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: '1.6',
              margin: '0',
              fontWeight: '400',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Integrated approaches that span across all our programs and initiatives, 
              ensuring comprehensive impact and sustainable change in climate action.
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <div style={{
              width: isMobile ? '60px' : '70px',
              height: isMobile ? '60px' : '70px',
              borderRadius: '50%',
              backgroundColor: `${colors.primary}15`,
              border: `2px solid ${colors.primary}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)'
            }}>
              <Target 
                size={isMobile ? 24 : 28} 
                style={{ color: colors.primary }}
              />
            </div>
          </div>
        </div>

        {/* Strategies Display */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '20px' : '28px'
        }}>
          {strategies.map((strategy, index) => (
            <div 
              key={strategy.id}
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : (index % 2 === 0 ? 'row' : 'row-reverse'),
                alignItems: 'center',
                gap: isMobile ? '16px' : '32px',
                padding: isMobile ? '16px 0' : '24px 0'
              }}
            >
              {/* Icon Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                order: isMobile ? 1 : 'unset'
              }}>
                <div style={{
                  width: isMobile ? '80px' : '100px',
                  height: isMobile ? '80px' : '100px',
                  backgroundColor: `${strategy.color}15`,
                  border: `2px solid ${strategy.color}30`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 10px 30px ${strategy.color}15`
                }}>
                  <strategy.icon 
                    size={isMobile ? 32 : 40} 
                    style={{ color: strategy.color }}
                  />
                </div>
              </div>
              
              {/* Content Section */}
              <div style={{
                flex: 1,
                textAlign: isMobile ? 'center' : (index % 2 === 0 ? 'left' : 'right'),
                order: isMobile ? 2 : 'unset'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px',
                  justifyContent: isMobile ? 'center' : (index % 2 === 0 ? 'flex-start' : 'flex-end')
                }}>
                  <div style={{
                    width: '3px',
                    height: '16px',
                    backgroundColor: strategy.color,
                  }} />
                  <span style={{
                    fontSize: '10px',
                    color: colors.textSecondary,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    Strategy {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 style={{
                  fontSize: isMobile ? '18px' : '22px',
                  fontWeight: '700',
                  color: colors.text,
                  margin: '0 0 8px 0',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {strategy.title}
                </h3>
                
                <p style={{
                  color: colors.textSecondary,
                  fontSize: isMobile ? '14px' : '15px',
                  lineHeight: '1.6',
                  margin: '0',
                  fontWeight: '400',
                  maxWidth: '400px',
                  marginLeft: isMobile ? 'auto' : (index % 2 === 0 ? '0' : 'auto'),
                  marginRight: isMobile ? 'auto' : (index % 2 === 0 ? 'auto' : '0'),
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {strategy.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CrossCuttingStrategies;