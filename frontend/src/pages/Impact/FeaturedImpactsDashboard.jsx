import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  CheckCircle, 
  Handshake, 
  DollarSign, 
  Heart, 
  BarChart3, 
  Target,
  Loader2,
  Star,
  Zap,
  Globe,
  Activity
} from 'lucide-react';

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

const FeaturedImpactsDisplay = () => {
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({});

  // Number animation hook
  const useCountUp = (end, duration = 2000, start = 0) => {
    const [value, setValue] = useState(end); // Start with the final value
    const [shouldAnimate, setShouldAnimate] = useState(false);
    
    useEffect(() => {
      if (end === 0) {
        setValue(0);
        return;
      }
      
      // Short delay to allow component to mount, then start animation
      const initialTimeout = setTimeout(() => {
        setValue(start); // Reset to start value
        setShouldAnimate(true);
      }, 100);
      
      return () => clearTimeout(initialTimeout);
    }, [end, start]);
    
    useEffect(() => {
      if (!shouldAnimate) return;
      
      const startTime = Date.now();
      const startValue = start;
      const endValue = end;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutExpo);
        
        setValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setValue(endValue);
        }
      };
      
      requestAnimationFrame(animate);
    }, [shouldAnimate, end, duration, start]);
    
    return value;
  };

  // Fetch all impacts from API
  const fetchAllImpacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE = process.env.REACT_APP_API_URL;
      
      const response = await fetch(`${API_BASE}/impacts?is_active=true`, {
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
        // Sort impacts by name for consistency
        const sortedImpacts = data.data
          .filter(impact => impact.is_active)
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setImpacts(sortedImpacts);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load impact data');
      console.error('Error fetching impacts:', err);
      setImpacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllImpacts();
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

  // Component for animated number display
  const AnimatedNumber = ({ value, unit, color }) => {
    const animatedValue = useCountUp(value);
    return (
      <span style={{ color: color || '#10b981' }}>
        {formatNumber(animatedValue, unit)}
      </span>
    );
  };

  if (loading) {
    return (
      <section style={{
        minHeight: '60vh',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(59, 130, 246, 0.05) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '40px 20px'
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '48px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h3 style={{
            color: '#1f2937',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            Loading Impact Data
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '400',
            margin: 0
          }}>
            Please wait while we fetch the latest metrics...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(59, 130, 246, 0.05) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background animation elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.08)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.06)',
          animation: 'float 7s ease-in-out infinite'
        }} />

        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          borderRadius: '32px',
          padding: '80px 60px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          maxWidth: '800px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Animated ecosystem icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 40px',
            animation: 'ecosystemPulse 4s ease-in-out infinite',
            position: 'relative'
          }}>
            <Globe size={40} color="white" />
            {/* Orbiting elements */}
            <div style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              border: '2px dashed rgba(16, 185, 129, 0.3)',
              borderRadius: '50%',
              animation: 'orbit 10s linear infinite'
            }}>
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981'
              }} />
            </div>
          </div>

          {/* Main animated text */}
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            lineHeight: '1.3',
            marginBottom: '32px',
            letterSpacing: '-0.5px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #1f2937, #10b981, #3b82f6)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'textShimmer 3s ease-in-out infinite'
            }}>
              We value ecosystems
            </span>
          </div>

          {/* Secondary animated text */}
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '40px',
            lineHeight: '1.4'
          }}>
            <span style={{
              display: 'inline-block',
              animation: 'fadeInUp 2s ease-out 0.5s both'
            }}>
              and continue to create impact
            </span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700',
              display: 'inline-block',
              animation: 'fadeInUp 2s ease-out 1s both'
            }}>
              every second of every day
            </span>
          </div>

          {/* Animated impact indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
            marginTop: '48px'
          }}>
            {[
              { icon: Heart, label: 'Communities', delay: '0s' },
              { icon: Users, label: 'Lives Changed', delay: '0.5s' },
              { icon: Globe, label: 'Global Reach', delay: '1s' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: 0,
                  animation: `fadeInUp 1.5s ease-out ${item.delay} both`
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 3s ease-in-out infinite'
                }}>
                  <item.icon size={24} color="#10b981" />
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Subtle call to action */}
          <p style={{
            fontSize: '16px',
            color: '#9ca3af',
            marginTop: '40px',
            fontStyle: 'italic',
            opacity: 0,
            animation: 'fadeIn 2s ease-out 2s both'
          }}>
            Impact data will be available shortly
          </p>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes ecosystemPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes orbit {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes textShimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          @media (max-width: 768px) {
            div[style*="font-size: 36px"] {
              font-size: 28px !important;
            }
            
            div[style*="font-size: 24px"] {
              font-size: 20px !important;
            }
            
            div[style*="padding: 80px 60px"] {
              padding: 60px 40px !important;
            }
            
            div[style*="gap: 32px"] {
              gap: 20px !important;
            }
          }
          
          @media (max-width: 480px) {
            div[style*="font-size: 28px"] {
              font-size: 24px !important;
            }
            
            div[style*="padding: 60px 40px"] {
              padding: 40px 24px !important;
            }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(59, 130, 246, 0.03) 100%)',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #1f2937, #10b981)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 20px 0',
            letterSpacing: '-1px',
            lineHeight: '1.1'
          }}>
            Living Impact 
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Real-time metrics showcasing the measurable impact of our initiatives across communities and regions
          </p>
        </div>

        {/* Impact Metrics Grid */}
        {impacts.length > 0 && (
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '80px'
            }}>
              {impacts.map((impact, index) => {
                
                return (
                  <div
                    key={impact.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    {/* Background decoration */}
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      right: '-30px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: `${impact.color || '#10b981'}10`,
                      zIndex: 0
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {/* Icon */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `${impact.color || '#10b981'}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: `2px solid ${impact.color || '#10b981'}20`
                      }}>
                        <BarChart3 size={24} color={impact.color || '#10b981'} />
                      </div>

                      {/* Title */}
                      <h3 style={{
                        margin: '0 0 6px 0',
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#1f2937',
                        letterSpacing: '-0.2px'
                      }}>
                        {impact.name}
                      </h3>
                      
                    

                      {/* Animated Value */}
                      <div style={{
                        fontSize: '28px',
                        fontWeight: '900',
                        marginBottom: '16px',
                        lineHeight: '1',
                        letterSpacing: '-0.5px'
                      }}>
                        <AnimatedNumber 
                          value={impact.current_value} 
                          unit={impact.unit}
                          color={impact.color || '#10b981'}
                        />
                      </div>

                      {/* Progress indicator */}
                      <div style={{
                        height: '3px',
                        background: 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${impact.color || '#10b981'}, ${impact.color || '#10b981'}80)`,
                          width: '100%',
                          borderRadius: '2px',
                          animation: 'progressFill 3s ease-out'
                        }} />
                      </div>

             
                        <p style={{
                        margin: '0 0 20px 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        {impact.unit || 'Units'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verification Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px'
        }}>
          {/* Main verification badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px)',
            borderRadius: '24px',
            padding: '32px 48px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 16px 64px rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            maxWidth: '600px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 3s ease-in-out infinite',
              flexShrink: 0
            }}>
              <Target size={28} color="white" />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                letterSpacing: '-0.3px'
              }}>
                100% Transparency and Accountability
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                All metrics are independently audited and verified in real-time
              </p>
            </div>
          </div>

          {/* Additional verification badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '16px 24px',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CheckCircle size={20} color="#10b981" />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Data Integrity Guaranteed
            </span>
          </div>
        </div>

        {/* Empty state */}
        {impacts.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(107, 114, 128, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <BarChart3 size={32} color="#6b7280" />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 12px 0'
            }}>
              No Impact Data Available
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Impact metrics will be displayed here once data becomes available
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes progressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @media (max-width: 768px) {
          section {
            padding: 60px 16px !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
          
          p {
            font-size: 16px !important;
          }
          
          div[style*="grid"] {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          
          div[style*="padding: 40px"] {
            padding: 32px !important;
          }
          
          div[style*="font-size: 40px"] {
            font-size: 32px !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 28px !important;
          }
          
          div[style*="padding: 32px"] {
            padding: 24px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedImpactsDisplay;