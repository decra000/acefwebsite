import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, User, Users, Heart, Handshake, Star, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const GeneralTestimonialsDisplay = ({ 
  showTabs = true, 
  defaultType = 'all', 
  maxItems = null,
  showFeaturedFirst = true,
  title = "Stories of transformation",
  showCTA = true,
  className = ""
}) => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(getTabIndex(defaultType));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const { colors, isDarkMode } = useTheme();

  function getTabIndex(type) {
    const tabMap = { 'all': 0, 'community': 1, 'volunteers': 2, 'collaborators': 3 };
    return tabMap[type] || 0;
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || filteredTestimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredTestimonials.length]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
    setCurrentIndex(0);
  }, [testimonials, activeTab, maxItems, showFeaturedFirst]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/generaltestimonials/public`);
      setTestimonials(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];

    if (activeTab === 1) {
      filtered = filtered.filter(t => t.type === 'community');
    } else if (activeTab === 2) {
      filtered = filtered.filter(t => t.type === 'volunteers');
    } else if (activeTab === 3) {
      filtered = filtered.filter(t => t.type === 'collaborators');
    }

    if (showFeaturedFirst) {
      const featured = filtered.filter(t => t.featured);
      const nonFeatured = filtered.filter(t => !t.featured);
      filtered = [...featured, ...nonFeatured];

      if (maxItems && maxItems > 0) {
        filtered = [
          ...featured.slice(0, maxItems), 
          ...nonFeatured.slice(0, maxItems - featured.length)
        ];
      }
    } else {
      if (maxItems && maxItems > 0) {
        filtered = filtered.slice(0, maxItems);
      }
    }

    setFilteredTestimonials(filtered);
  };

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    setCurrentIndex(0);
  };

  const nextTestimonial = () => {
    if (filteredTestimonials.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
      setIsAutoPlaying(false);
    }
  };

  const prevTestimonial = () => {
    if (filteredTestimonials.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
      setIsAutoPlaying(false);
    }
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const getTypeIcon = (type) => {
    const iconProps = { size: 16, strokeWidth: 2 };
    switch (type?.toLowerCase()) {
      case 'community':
        return <Users {...iconProps} />;
      case 'volunteers':
        return <Heart {...iconProps} />;
      case 'collaborators':
        return <Handshake {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  const getTypeDisplayName = (type) => {
    switch (type?.toLowerCase()) {
      case 'community':
        return 'Community member';
      case 'volunteers':
        return 'Volunteer';
      case 'collaborators':
        return 'Collaborator';
      default:
        return 'Member';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'community':
        return '#3b82f6';
      case 'volunteers':
        return '#ef4444';
      case 'collaborators':
        return '#10b981';
      default:
        return colors.primary;
    }
  };

  const tabs = [
    { label: 'All stories', icon: <Users size={14} /> },
    { label: 'Community', icon: <Users size={14} /> },
    { label: 'Volunteers', icon: <Heart size={14} /> },
    { label: 'Collaborators', icon: <Handshake size={14} /> }
  ];

  if (loading) {
    return (
      <section style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)' 
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)'
      }}>
        <div style={{ 
          textAlign: 'center',
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite',
            marginBottom: '16px',
            margin: '0 auto 16px'
          }}></div>
          <p style={{
            color: colors.textSecondary,
            fontSize: '14px',
            fontWeight: '500',
            margin: 0
          }}>
            Loading stories...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)' 
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)'
      }}>
        <div style={{
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.9)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          border: `1px solid rgba(239, 68, 68, 0.2)`,
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Quote size={20} color="#ef4444" />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 8px 0'
          }}>
            Unable to load stories
          </h3>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: '0 0 20px 0'
          }}>
            {error}
          </p>
          <button 
            onClick={fetchTestimonials}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
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

  // Get current testimonial or null if empty
  const currentTestimonial = filteredTestimonials.length > 0 ? filteredTestimonials[currentIndex] : null;

  return (
    <section style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
        : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header Section - Always visible */}
      <div style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: colors.text,
          margin: '0 0 12px 0',
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          margin: '0 0 32px 0',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          Real stories from the people whose lives we've touched and who have helped us grow
        </p>

        {/* Tab Navigation - Always visible */}
        {showTabs && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              background: isDarkMode 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '4px',
              border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              boxShadow: isDarkMode 
                ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              display: 'inline-flex',
              gap: '2px'
            }}>
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabChange(index)}
                  style={{
                    background: activeTab === index 
                      ? (isDarkMode ? colors.surface : 'white')
                      : 'transparent',
                    color: activeTab === index ? colors.text : colors.textSecondary,
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: activeTab === index ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: activeTab === index 
                      ? (isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)') 
                      : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== index) {
                      e.target.style.background = isDarkMode 
                        ? 'rgba(71, 85, 105, 0.3)' 
                        : 'rgba(255, 255, 255, 0.5)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== index) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px 60px'
      }}>
        {/* Empty State or Testimonial Display */}
        {!currentTestimonial ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            background: isDarkMode 
              ? 'rgba(30, 41, 59, 0.6)' 
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isDarkMode 
                ? 'rgba(71, 85, 105, 0.3)' 
                : 'rgba(107, 114, 128, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Quote size={24} color={colors.textMuted} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: colors.text,
              margin: '0 0 8px 0'
            }}>
              No testimonials available
            </h3>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: '0'
            }}>
              Check back later for inspiring stories from our community
            </p>
          </div>
        ) : (
          <>
            {/* Main Testimonial Display with Side Navigation */}
            <div style={{ position: 'relative' }}>
              {/* Left Arrow */}
              <button
                onClick={prevTestimonial}
                disabled={filteredTestimonials.length <= 1}
                style={{
                  position: 'absolute',
                  left: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: isDarkMode 
                    ? 'rgba(30, 41, 59, 0.9)' 
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: filteredTestimonials.length > 1 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  opacity: filteredTestimonials.length <= 1 ? 0.3 : 1,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
                onMouseOver={(e) => {
                  if (filteredTestimonials.length > 1) {
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    e.target.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                }}
              >
                <ChevronLeft size={24} color={colors.text} />
              </button>

              {/* Right Arrow */}
              <button
                onClick={nextTestimonial}
                disabled={filteredTestimonials.length <= 1}
                style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: isDarkMode 
                    ? 'rgba(30, 41, 59, 0.9)' 
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: filteredTestimonials.length > 1 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  opacity: filteredTestimonials.length <= 1 ? 0.3 : 1,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
                onMouseOver={(e) => {
                  if (filteredTestimonials.length > 1) {
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    e.target.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                }}
              >
                <ChevronRight size={24} color={colors.text} />
              </button>

              {/* Main Content */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                alignItems: 'center',
                minHeight: '450px',
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.5)' 
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '0px',
                padding: '50px',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                boxShadow: isDarkMode 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.08)'
              }}>
                {/* Left Column - Image */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '380px',
                    height: '380px'
                  }}>
                    {currentTestimonial.image ? (
                      <img
                        src={`${STATIC_URL}/uploads/testimonials/${currentTestimonial.image}`}
                        alt={`${currentTestimonial.first_name} ${currentTestimonial.last_name}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '0px', // No border radius as requested
                          objectFit: 'cover',
                          border: 'none', // No border as requested
                          boxShadow: `0 20px 60px ${getTypeColor(currentTestimonial.type)}20`, // Reduced shadow opacity
                          filter: 'brightness(1.02) contrast(1.01)',
                          transition: 'all 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      style={{ 
                        display: currentTestimonial.image ? 'none' : 'flex',
                        width: '380px',
                        height: '380px',
                        borderRadius: '0px', // No border radius as requested
                        background: `linear-gradient(135deg, ${getTypeColor(currentTestimonial.type)}15, ${getTypeColor(currentTestimonial.type)}08)`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none', // No border as requested
                        boxShadow: `0 20px 60px ${getTypeColor(currentTestimonial.type)}20`
                      }}
                    >
                      <User size={80} color={getTypeColor(currentTestimonial.type)} strokeWidth={1} />
                    </div>

                    {/* Featured badge */}
                    {currentTestimonial.featured && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        borderRadius: '16px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
                        animation: 'pulse 2s infinite'
                      }}>
                        <Star size={12} color="white" fill="white" />
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Content */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '24px'
                }}>
                  {/* Quote icon */}
                  <Quote 
                    size={32}
                    color={getTypeColor(currentTestimonial.type)} 
                    style={{ opacity: 0.7 }} 
                  />

                  {/* Testimonial text */}
                  <blockquote style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    color: colors.text,
                    margin: 0,
                    fontStyle: 'italic',
                    fontWeight: '400'
                  }}>
                    "{currentTestimonial.testimonial}"
                  </blockquote>

                  {/* Person info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingTop: '20px',
                    borderTop: `2px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(107, 114, 128, 0.1)'}`
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: colors.text,
                        margin: '0 0 6px 0'
                      }}>
                        {currentTestimonial.first_name} {currentTestimonial.last_name}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: `${getTypeColor(currentTestimonial.type)}15`,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        width: 'fit-content'
                      }}>
                        {getTypeIcon(currentTestimonial.type)}
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: getTypeColor(currentTestimonial.type)
                        }}>
                          {getTypeDisplayName(currentTestimonial.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginTop: '32px'
            }}>
              {/* Dots indicator */}
              <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}>
                {filteredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    style={{
                      width: currentIndex === index ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: currentIndex === index 
                        ? getTypeColor(currentTestimonial.type) 
                        : (isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(107, 114, 128, 0.3)'),
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>

              {/* Auto-play toggle */}
              {filteredTestimonials.length > 1 && (
                <button
                  onClick={toggleAutoPlay}
                  style={{
                    background: isAutoPlaying 
                      ? getTypeColor(currentTestimonial.type) 
                      : (isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isAutoPlaying 
                      ? getTypeColor(currentTestimonial.type) 
                      : (isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)')}`,
                    borderRadius: '16px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginLeft: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {isAutoPlaying ? 
                    <Pause size={16} color="white" /> : 
                    <Play size={16} color={colors.text} />
                  }
                </button>
              )}
            </div>

            {/* Progress indicator */}
            {filteredTestimonials.length > 1 && (
              <div style={{
                marginTop: '20px',
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: '12px'
              }}>
                {currentIndex + 1} of {filteredTestimonials.length} stories
              </div>
            )}
          </>
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
        
        @media (max-width: 1024px) {
          .testimonial-main {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center !important;
            padding: 40px !important;
          }
          
          .image-section {
            width: 280px !important;
            height: 280px !important;
            margin: 0 auto !important;
          }
          
          .content-section blockquote {
            font-size: 16px !important;
            text-align: center !important;
          }
        }
        
        @media (max-width: 768px) {
          .header-section {
            padding: 40px 16px 30px !important;
          }
          
          .header-section h2 {
            font-size: 24px !important;
          }
          
          .testimonial-main {
            padding: 30px 20px !important;
            gap: 30px !important;
          }
          
          .image-section {
            width: 220px !important;
            height: 220px !important;
          }
          
          .content-section blockquote {
            font-size: 15px !important;
          }
          
          .tab-navigation {
            flex-wrap: wrap !important;
            gap: 4px !important;
          }
          
          .navigation-controls {
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .tab-navigation button {
            font-size: 11px !important;
            padding: 6px 10px !important;
          }
          
          .testimonial-main {
            padding: 20px 16px !important;
          }
          
          .image-section {
            width: 180px !important;
            height: 180px !important;
          }
          
          .content-section blockquote {
            font-size: 14px !important;
          }
          
          .person-name {
            font-size: 14px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default GeneralTestimonialsDisplay;