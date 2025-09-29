import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, MapPin, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

const ProjectsDisplay = ({ initialCategoryFilter = null }) => {
  const navigate = useNavigate();
  const { colors, isDarkMode } = useTheme();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [planningCurrentIndex, setPlanningCurrentIndex] = useState(0);
  const [ongoingCurrentIndex, setOngoingCurrentIndex] = useState(0);

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Placeholder data
  const placeholderProjects = [
    {
      id: 'placeholder-1',
      title: 'Clean Water Initiative - Lake Victoria',
      short_description: 'Providing sustainable clean water solutions to rural communities around Lake Victoria through innovative filtration systems and community engagement programs.',
      category_name: 'Water & Sanitation',
      status: 'ongoing',
      location: 'Kisumu County, Kenya',
      is_featured: true,
      featured_image: null,
      progress: 75
    },
    {
      id: 'placeholder-2',
      title: 'Solar Energy for Schools Project',
      short_description: 'Installing solar panel systems in primary schools across rural Kenya to improve learning conditions and enable digital learning opportunities.',
      category_name: 'Renewable Energy',
      status: 'ongoing',
      location: 'Nakuru County, Kenya',
      is_featured: false,
      featured_image: null,
      progress: 60
    },
    {
      id: 'placeholder-3',
      title: 'Community Reforestation Program',
      short_description: 'Engaging local communities in large-scale tree planting initiatives to combat deforestation and promote sustainable forest management.',
      category_name: 'Environment',
      status: 'ongoing',
      location: 'Mount Kenya Region',
      is_featured: true,
      featured_image: null,
      progress: 85
    },
    {
      id: 'placeholder-4',
      title: 'Urban Waste Management System',
      short_description: 'Implementing innovative waste sorting and recycling programs in Nairobi settlements to improve sanitation and environmental health.',
      category_name: 'Waste Management',
      status: 'planning',
      location: 'Nairobi County, Kenya',
      is_featured: false,
      featured_image: null,
      progress: 25
    },
    {
      id: 'placeholder-5',
      title: 'Agricultural Technology Training',
      short_description: 'Teaching modern farming techniques and providing equipment to smallholder farmers to increase productivity and food security.',
      category_name: 'Agriculture',
      status: 'planning',
      location: 'Central Kenya',
      is_featured: false,
      featured_image: null,
      progress: 35
    },
    {
      id: 'placeholder-6',
      title: 'Coastal Conservation Initiative',
      short_description: 'Protecting marine ecosystems through community-based conservation programs and sustainable fishing practices education.',
      category_name: 'Marine Conservation',
      status: 'planning',
      location: 'Mombasa County, Kenya',
      is_featured: true,
      featured_image: null,
      progress: 20
    }
  ];

  const placeholderCategories = [
    { id: 'cat-1', name: 'Water & Sanitation' },
    { id: 'cat-2', name: 'Renewable Energy' },
    { id: 'cat-3', name: 'Environment' },
    { id: 'cat-4', name: 'Waste Management' },
    { id: 'cat-5', name: 'Agriculture' },
    { id: 'cat-6', name: 'Marine Conservation' }
  ];

  // Data fetching
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCategories()]);
        await fetchProjects();
      } catch (error) {
        console.error('Error initializing data:', error);
        setProjects(placeholderProjects);
        setCategories(placeholderCategories);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const allProjects = Array.isArray(data.data) ? data.data : [];
        setProjects(allProjects.length > 0 ? allProjects : placeholderProjects);
      } else {
        setProjects(placeholderProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects(placeholderProjects);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`, { credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const cats = Array.isArray(data.data) ? data.data : [];
        setCategories(cats.length > 0 ? cats : placeholderCategories);
      } else {
        setCategories(placeholderCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(placeholderCategories);
    }
  };

  const handleProjectClick = (project, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      navigate(`/project/${project.id}`, { 
        state: { 
          project,
          from: location.pathname
        }
      });
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleViewAllProjects = () => {
    try {
      navigate('/projectscatalogue');
    } catch (error) {
      console.error('Navigation to projects catalogue failed:', error);
    }
  };

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case 'Water & Sanitation': return '#26BDE2';
      case 'Renewable Energy': return '#FCC30B';
      case 'Environment': return '#56C02B';
      case 'Waste Management': return '#9C27B0';
      case 'Agriculture': return '#FF9800';
      case 'Marine Conservation': return '#0A97D9';
      default: return colors.primary;
    }
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filter projects by status
  const planningProjects = projects.filter(project => project.status === 'planning');
  const ongoingProjects = projects.filter(project => project.status === 'ongoing');

  // Slider component
  const ProjectSlider = ({ projects, title, subtitle, currentIndex, setCurrentIndex, status }) => {
    const itemsToShow = isMobile ? 1 : 3;
    const maxIndex = Math.max(0, projects.length - itemsToShow);
    
    const canGoNext = currentIndex < maxIndex;
    const canGoPrev = currentIndex > 0;

    const goNext = useCallback(() => {
      if (canGoNext) {
        setCurrentIndex(prev => prev + 1);
      }
    }, [canGoNext, setCurrentIndex]);

    const goPrev = useCallback(() => {
      if (canGoPrev) {
        setCurrentIndex(prev => prev - 1);
      }
    }, [canGoPrev, setCurrentIndex]);

    if (projects.length === 0) {
      return null;
    }

    return (
      <section style={{
        padding: isMobile ? '60px 0' : '80px 0',
        background: isDarkMode 
          ? '#000000'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 20px'
        }}>
          {/* Section Header */}
          <div
            style={{
              marginBottom: isMobile ? '40px' : '60px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'flex-end',
              gap: isMobile ? '20px' : '0'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '3px',
                  height: '20px',
                  backgroundColor: status === 'planning' ? colors.warning : colors.primary,
                }} />
                <span style={{
                  fontSize: '11px',
                  color: colors.textSecondary,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {status === 'planning' ? 'Upcoming Projects' : 'Current Projects'}
                </span>
              </div>
              
              <h2 style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: '700',
                color: colors.text,
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px'
              }}>
                {title}
              </h2>
              
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: '0',
                maxWidth: '500px',
                lineHeight: '1.6'
              }}>
                {subtitle}
              </p>
            </div>

            {/* Right side - View All Projects Button and Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '12px' : '20px',
              flexDirection: isMobile ? 'row' : 'row'
            }}>
              {/* View All Projects Button */}
              <button
                onClick={handleViewAllProjects}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${colors.primary}dd`;
                  e.target.style.transform = 'translateY(-1px)';
                  const arrow = e.target.querySelector('.view-all-arrow');
                  if (arrow) arrow.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.primary;
                  e.target.style.transform = 'translateY(0)';
                  const arrow = e.target.querySelector('.view-all-arrow');
                  if (arrow) arrow.style.transform = 'translateX(0)';
                }}
              >
                <span>View All Projects</span>
                <ChevronRight 
                  size={16} 
                  className="view-all-arrow"
                  style={{ 
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </button>

              {/* Navigation Controls */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    style={{
                      padding: '12px',
                      border: `1px solid ${colors.border}`,
                      background: canGoPrev ? colors.background : colors.surface,
                      color: canGoPrev ? colors.text : colors.textMuted,
                      borderRadius: '6px',
                      cursor: canGoPrev ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      opacity: canGoPrev ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (canGoPrev) {
                        e.target.style.backgroundColor = colors.text;
                        e.target.style.color = colors.background;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canGoPrev) {
                        e.target.style.backgroundColor = colors.background;
                        e.target.style.color = colors.text;
                      }
                    }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!canGoNext}
                    style={{
                      padding: '12px',
                      border: `1px solid ${colors.border}`,
                      background: canGoNext ? colors.background : colors.surface,
                      color: canGoNext ? colors.text : colors.textMuted,
                      borderRadius: '6px',
                      cursor: canGoNext ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      opacity: canGoNext ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (canGoNext) {
                        e.target.style.backgroundColor = colors.text;
                        e.target.style.color = colors.background;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canGoNext) {
                        e.target.style.backgroundColor = colors.background;
                        e.target.style.color = colors.text;
                      }
                    }}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Projects Slider */}
          <div style={{
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div
              style={{
                display: 'flex',
                gap: isMobile ? '20px' : '30px',
                transform: `translateX(-${currentIndex * (isMobile ? 100 : 33.333)}%)`,
                transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
              }}
            >
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  onClick={(event) => handleProjectClick(project, event)}
                  style={{
                    minWidth: isMobile ? '100%' : 'calc(33.333% - 20px)',
                    height: isMobile ? '520px' : '560px',
                    background: isDarkMode 
                      ? 'rgba(30, 41, 59, 0.5)' 
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                    borderRadius: '12px',
                    boxShadow: isDarkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = `0 25px 80px ${colors.primary}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDarkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Hero Image Section */}
                  <div style={{
                    height: isMobile ? '180px' : '200px',
                    position: 'relative',
                    borderRadius: '12px 12px 0 0',
                    background: project.featured_image ? 'none' : 
                      `linear-gradient(135deg, ${getCategoryColor(project.category_name)} 0%, ${getCategoryColor(project.category_name)}CC 100%)`,
                    backgroundImage: project.featured_image ? 
                      `url(${project.featured_image.startsWith('http') 
                        ? project.featured_image 
                        : `${STATIC_URL || ''}${project.featured_image}`})` : 
                      'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {project.featured_image && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
                        borderRadius: '12px 12px 0 0'
                      }} />
                    )}

                    {!project.featured_image && (
                      <div style={{
                        fontSize: isMobile ? '48px' : '64px',
                        opacity: '0.9',
                        zIndex: 1
                      }}>
                        {project.category_name === 'Water & Sanitation' ? '💧' :
                         project.category_name === 'Renewable Energy' ? '⚡' :
                         project.category_name === 'Environment' ? '🌳' :
                         project.category_name === 'Waste Management' ? '♻️' :
                         project.category_name === 'Agriculture' ? '🌾' :
                         project.category_name === 'Marine Conservation' ? '🌊' :
                         '🌍'}
                      </div>
                    )}

                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: status === 'planning' ? `${colors.warning}20` : `${colors.primary}20`,
                      color: status === 'planning' ? colors.warning : colors.primary,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${status === 'planning' ? colors.warning : colors.primary}30`,
                      zIndex: 2
                    }}>
                      {status === 'planning' ? <Clock size={12} /> : <TrendingUp size={12} />}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {status === 'planning' ? 'Planning' : 'Active'}
                      </span>
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: colors.text,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backdropFilter: 'blur(10px)',
                      zIndex: 2
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {project.category_name || 'Project'}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div style={{ 
                    padding: isMobile ? '24px 20px' : '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    flex: 1,
                    minHeight: 0
                  }}>
                    <h3 style={{
                      fontSize: isMobile ? '18px' : '20px',
                      fontWeight: '700',
                      color: colors.text,
                      margin: '0',
                      lineHeight: '1.3',
                      letterSpacing: '-0.02em',
                      minHeight: '52px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {project.title}
                    </h3>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{
                        color: colors.textSecondary,
                        fontSize: isMobile ? '14px' : '15px',
                        lineHeight: '1.6',
                        margin: '0',
                        fontWeight: '400',
                        minHeight: '72px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {truncateText(project.short_description || project.description, 120)}
                      </p>
                    </div>

                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      marginTop: 'auto'
                    }}>
                      {project.location && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <MapPin size={16} style={{ color: colors.textMuted }} />
                          <span style={{
                            color: colors.textSecondary,
                            fontSize: '13px',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {project.location}
                          </span>
                        </div>
                      )}

                      <div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            color: colors.text,
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            Progress
                          </span>
                          <span style={{
                            color: colors.text,
                            fontSize: '13px',
                            fontWeight: '700'
                          }}>
                            {project.progress || (status === 'planning' ? 25 : 65)}%
                          </span>
                        </div>
                        <div style={{ 
                          height: '6px',
                          backgroundColor: colors.borderLight,
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${project.progress || (status === 'planning' ? 25 : 65)}%`,
                            backgroundColor: getCategoryColor(project.category_name),
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>

                      <button
                        style={{
                          background: 'transparent',
                          color: colors.text,
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = colors.primary;
                          const arrow = e.target.querySelector('.arrow');
                          if (arrow) arrow.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = colors.text;
                          const arrow = e.target.querySelector('.arrow');
                          if (arrow) arrow.style.transform = 'translateX(0)';
                        }}
                      >
                        <span style={{
                          borderBottom: `1px solid ${colors.textSecondary}`,
                          paddingBottom: '1px'
                        }}>
                          Learn More
                        </span>
                        <ArrowRight 
                          size={12} 
                          className="arrow"
                          style={{ 
                            transition: 'transform 0.3s ease'
                          }} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobile && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginTop: '32px'
            }}>
              <button
                onClick={goPrev}
                disabled={!canGoPrev}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  background: canGoPrev ? colors.background : colors.surface,
                  color: canGoPrev ? colors.text : colors.textMuted,
                  borderRadius: '6px',
                  cursor: canGoPrev ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: canGoPrev ? 1 : 0.5
                }}
              >
                <ArrowLeft size={16} />
              </button>
              
              <span style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontWeight: '500'
              }}>
                {currentIndex + 1} of {projects.length}
              </span>
              
              <button
                onClick={goNext}
                disabled={!canGoNext}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  background: canGoNext ? colors.background : colors.surface,
                  color: canGoNext ? colors.text : colors.textMuted,
                  borderRadius: '6px',
                  cursor: canGoNext ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: canGoNext ? 1 : 0.5
                }}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        padding: '80px 0',
        textAlign: 'center',
        background: isDarkMode 
          ? '#000000'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.primary}30`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <h3 style={{ 
          color: colors.textSecondary,
          fontSize: '18px',
          fontWeight: '500',
          margin: '0'
        }}>
          Loading Projects...
        </h3>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Planning Projects Slider */}
      <ProjectSlider
        projects={planningProjects}
        title="Upcoming Initiatives"
        subtitle="New projects in development to expand our environmental impact across communities"
        currentIndex={planningCurrentIndex}
        setCurrentIndex={setPlanningCurrentIndex}
        status="planning"
      />

      {/* Ongoing Projects Slider */}
      <ProjectSlider
        projects={ongoingProjects}
        title="Active Projects"
        subtitle="Currently running projects creating real change in communities across Africa"
        currentIndex={ongoingCurrentIndex}
        setCurrentIndex={setOngoingCurrentIndex}
        status="ongoing"
      />
    </div>
  );
};

export default ProjectsDisplay;