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
  Loader2,
  Star,
  Zap,
  Globe
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
  const [activeCard, setActiveCard] = useState(null);

  // Fetch all impacts from API
  const fetchAllImpacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API base URL
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
        // Sort impacts - featured first, then by order_index
        const sortedImpacts = data.data
          .filter(impact => impact.is_active)
          .sort((a, b) => {
            // Featured items first
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            // Then by order_index
            return (a.order_index || 0) - (b.order_index || 0);
          });
        
        setImpacts(sortedImpacts);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load impact data');
      console.error('Error fetching impacts:', err);
      
      // Fallback to empty array
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

  if (loading) {
    return (
      <section style={{
        minHeight: '50vh',
        background: 'radial-gradient(ellipse at center, rgba(10, 69, 28, 0.05) 0%, rgba(255, 255, 255, 0.95) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'conic-gradient(from 0deg, #0a451c, #9ccf9f, #0a451c)',
            borderRadius: '50%',
            animation: 'neuralSpin 2s linear infinite',
            marginBottom: '16px',
            margin: '0 auto 16px'
          }}></div>
          <p style={{
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            opacity: '0.8'
          }}>
            Syncing impact data...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          maxWidth: '400px'
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '12px'
          }}>⚡</div>
          <p style={{ color: '#374151', margin: '0 0 16px', fontSize: '14px' }}>
            Impact data temporarily unavailable
          </p>
          <button 
            onClick={fetchAllImpacts}
            style={{
              background: 'linear-gradient(135deg, #0a451c, #1a5a2c)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '12px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Reconnect
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      padding: '40px 20px',
      background: 'linear-gradient(135deg, rgba(250, 207, 60, 0.03) 0%, rgba(156, 207, 159, 0.05) 50%, rgba(10, 69, 28, 0.02) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Neural network background pattern */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.03'%3E%3Ccircle cx='25' cy='25' r='1' fill='%230a451c'/%3E%3Ccircle cx='75' cy='25' r='1' fill='%230a451c'/%3E%3Ccircle cx='50' cy='50' r='1' fill='%230a451c'/%3E%3Ccircle cx='25' cy='75' r='1' fill='%230a451c'/%3E%3Ccircle cx='75' cy='75' r='1' fill='%230a451c'/%3E%3Cline x1='25' y1='25' x2='75' y2='25' stroke='%230a451c' stroke-width='0.5'/%3E%3Cline x1='25' y1='25' x2='50' y2='50' stroke='%230a451c' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Floating header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            marginTop: '100px',
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '12px 24px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(10, 69, 28, 0.1)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Globe size={18} style={{ color: '#0a451c' }} />
            <span style={{
              background: 'linear-gradient(135deg, #0a451c, #1a5a2c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              LIVE IMPACT METRICS
            </span>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }} />
          </div>
        </div>

        {/* Impact grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {impacts.map((impact, index) => {
            const IconComponent = iconMap[impact.icon] || BarChart3;
            const isActive = activeCard === impact.id;
            
            return (
              <div
                key={impact.id}
                style={{
                  background: isActive 
                    ? 'rgba(255, 255, 255, 0.95)' 
                    : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '20px',
                  border: isActive 
                    ? `2px solid ${impact.color}40` 
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isActive 
                    ? `0 20px 40px ${impact.color}20` 
                    : '0 4px 20px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setActiveCard(impact.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                {/* Holographic effect */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${impact.color}15, transparent)`,
                  animation: isActive ? 'shimmer 2s infinite' : 'none',
                  pointerEvents: 'none'
                }} />

                {/* Featured indicator */}
                {impact.is_featured && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    borderRadius: '8px',
                    padding: '4px',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}>
                    <Star size={10} color="#ffffff" />
                  </div>
                )}

                {/* Icon and title */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${impact.color}20, ${impact.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <IconComponent size={20} color={impact.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 2px 0',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {impact.name}
                    </h3>
                    <p style={{
                      margin: '0',
                      fontSize: '10px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {impact.unit || 'UNITS'}
                    </p>
                  </div>
                </div>

                {/* Value display */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    background: `linear-gradient(135deg, ${impact.color}, ${impact.color}cc)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '4px',
                    lineHeight: '1.2'
                  }}>
                    {formatNumber(impact.current_value, impact.unit)}
                  </div>
                  
                  {/* Minimal progress indicator */}
                  <div style={{
                    height: '2px',
                    background: 'rgba(107, 114, 128, 0.1)',
                    borderRadius: '1px',
                    overflow: 'hidden',
                    margin: '8px 0'
                  }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${impact.color}, ${impact.color}80)`,
                      width: '100%',
                      borderRadius: '1px',
                      animation: isActive ? 'growBar 1s ease-out' : 'none'
                    }} />
                  </div>
                  

                </div>
              </div>
            );
          })}
        </div>

        {/* Transparency badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(30px)',
            borderRadius: '50px',
            padding: '12px 32px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(10, 69, 28, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={12} color="#ffffff" />
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #0a451c, #1a5a2c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}>
              100% TRANSPARENCY
            </span>
          </div>
        </div>

        {/* Empty state */}
        {impacts.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(156, 207, 159, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <BarChart3 size={24} color="#6b7280" />
            </div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              No Impact Data
            </h3>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '0'
            }}>
              Metrics will sync automatically when available
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes neuralSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes growBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @media (max-width: 768px) {
          section > div {
            padding: 32px 16px !important;
          }
          
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedImpactsDisplay;