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
  const [activeCard, setActiveCard] = useState(null);

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
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(59, 130, 246, 0.05) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite',
            marginBottom: '16px',
            margin: '0 auto 16px'
          }}></div>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            margin: 0
          }}>
            Loading impact data...
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
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Zap size={24} color="#ef4444" />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Unable to load data
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 20px 0'
          }}>
            {error}
          </p>
          <button 
            onClick={fetchAllImpacts}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      padding: '60px 20px',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(59, 130, 246, 0.03) 100%)',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#10b981'
            }}>
              Live metrics
            </span>
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px'
          }}>
            Impact dashboard
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0,
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Real-time metrics from our active projects
          </p>
        </div>

        {/* Impact grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
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
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: isActive 
                    ? `2px solid ${impact.color || '#10b981'}` 
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isActive 
                    ? `0 8px 25px ${impact.color || '#10b981'}20` 
                    : '0 4px 15px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={() => setActiveCard(impact.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                {/* Featured indicator */}
                {impact.is_featured && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#fbbf24',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Star size={10} color="#ffffff" />
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      Featured
                    </span>
                  </div>
                )}

                {/* Icon and title */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${impact.color || '#10b981'}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={20} color={impact.color || '#10b981'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {impact.name}
                    </h3>
                    <p style={{
                      margin: '0',
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {impact.unit || 'Units'}
                    </p>
                  </div>
                </div>

                {/* Value display */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: impact.color || '#10b981',
                    marginBottom: '8px',
                    lineHeight: '1'
                  }}>
                    {formatNumber(impact.current_value, impact.unit)}
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{
                    height: '3px',
                    background: 'rgba(107, 114, 128, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: impact.color || '#10b981',
                      width: '100%',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>

                {/* Last updated */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(107, 114, 128, 0.1)'
                }}>
                  <Activity size={12} color="#6b7280" />
                  <span style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Updated now
                  </span>
                </div>
              </div>
            );
          })}
        </div>
             {/* Ultra-premium transparency and certification section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Main transparency badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px)',
            borderRadius: '60px',
            padding: '20px 48px',
            border: '3px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 12px 48px rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated gradient border */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '60px',
              padding: '3px',
              background: 'linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6, #ef4444, #f59e0b, #10b981)',
              backgroundSize: '300% 300%',
              animation: 'gradientRotate 6s ease-in-out infinite'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '57px',
                width: '100%',
                height: '100%'
              }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'certificationPulse 3s ease-in-out infinite'
              }}>
                <Target size={24} color="white" />
              </div>
              
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #10b981, #1f2937)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  100% Verified Impact
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  All metrics independently audited and blockchain-verified
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Live Feed
                </span>
              </div>
            </div>
          </div>


        {/* Verification badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '12px 24px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} color="#10b981" />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Verified data
            </span>
          </div>
        </div>

        {/* Empty state */}
        {impacts.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(107, 114, 128, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <BarChart3 size={24} color="#6b7280" />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              No impact data available
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0'
            }}>
              Metrics will appear here when data becomes available
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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          section {
            padding: 40px 16px !important;
          }
          
          h2 {
            font-size: 28px !important;
          }
          
          .grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
     </div>
    </section>
  );
};

export default FeaturedImpactsDisplay;