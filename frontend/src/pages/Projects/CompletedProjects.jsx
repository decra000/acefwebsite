import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, MapPin, Clock, TrendingUp, ChevronRight, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

const CompletedProjectsDisplay = ({ initialCategoryFilter = null }) => {
  const navigate = useNavigate();
  const { colors, isDarkMode } = useTheme();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Placeholder data - ONLY COMPLETED PROJECTS
  const placeholderProjects = [
    {
      id: 'placeholder-1',
      title: 'Clean Water Initiative - Lake Victoria',
      short_description: 'Successfully provided sustainable clean water solutions to 15 rural communities around Lake Victoria through innovative filtration systems and community education programs.',
      category_name: 'Water & Sanitation',
      status: 'completed',
      location: 'Kisumu County, Kenya',
      is_featured: true,
      featured_image: null,
      person_name: 'Sarah Wanjiku',
      progress: 100
    },
    {
      id: 'placeholder-2',
      title: 'Community Reforestation Program',
      short_description: 'Successfully engaged local communities in large-scale tree planting initiatives, planting over 50,000 trees to combat deforestation and promote biodiversity conservation.',
      category_name: 'Environment',
      status: 'completed',
      location: 'Mount Kenya Region',
      is_featured: true,
      featured_image: null,
      person_name: 'Grace Muthoni',
      progress: 100
    },
    {
      id: 'placeholder-3',
      title: 'Solar Energy for Rural Schools',
      short_description: 'Completed installation of solar panel systems in 25 primary schools across rural Kenya, improving learning conditions for over 5,000 students.',
      category_name: 'Renewable Energy',
      status: 'completed',
      location: 'Nakuru County, Kenya',
      is_featured: false,
      featured_image: null,
      person_name: 'James Kiprotich',
      progress: 100
    },
    {
      id: 'placeholder-4',
      title: 'Agricultural Technology Training Program',
      short_description: 'Successfully trained 500 smallholder farmers in modern farming techniques and provided essential equipment, increasing crop yields by 40%.',
      category_name: 'Agriculture',
      status: 'completed',
      location: 'Central Kenya',
      is_featured: false,
      featured_image: null,
      person_name: 'Mary Nyambura',
      progress: 100
    },
    {
      id: 'placeholder-5',
      title: 'Coastal Conservation Initiative',
      short_description: 'Successfully implemented community-based marine conservation programs, protecting 100km of coastline and establishing 3 marine sanctuaries.',
      category_name: 'Marine Conservation',
      status: 'completed',
      location: 'Mombasa County, Kenya',
      is_featured: true,
      featured_image: null,
      person_name: 'Hassan Omar',
      progress: 100
    },
    {
      id: 'placeholder-6',
      title: 'Urban Waste Management System',
      short_description: 'Successfully implemented innovative waste sorting and recycling programs in 10 Nairobi settlements, reducing waste by 60%.',
      category_name: 'Waste Management',
      status: 'completed',
      location: 'Nairobi County, Kenya',
      is_featured: false,
      featured_image: null,
      person_name: 'Peter Ochieng',
      progress: 100
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
        // Filter to show only completed projects
        const completedProjects = allProjects.filter(project => project.status === 'completed');
        setProjects(completedProjects.length > 0 ? completedProjects : placeholderProjects);
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

  const goToProjectsCatalogue = () => {
    navigate('/projectscatalogue');
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

  // Carousel navigation
  const itemsToShow = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, projects.length - itemsToShow);
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [canGoNext, isTransitioning]);

  const goPrev = useCallback(() => {
    if (canGoPrev && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [canGoPrev, isTransitioning]);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (canGoNext) {
        goNext();
      } else {
        setCurrentIndex(0);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [canGoNext, goNext]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        padding: '80px 0',
        textAlign: 'center',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
          : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.primary}30`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '0%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <h3 style={{ 
          color: colors.textSecondary,
          fontSize: '18px',
          fontWeight: '500',
          margin: '0'
        }}>
          Loading completed projects...
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

  if (projects.length === 0) {
    return null;
  }

  const totalProjects = projects.length;
  const featuredCount = projects.filter(p => p.is_featured).length;
  const categoriesCount = categories.length;

  return (
    <section style={{
      padding: isMobile ? '60px 0' : '80px 0',
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
        : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 20px'
      }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginBottom: isMobile ? '40px' : '60px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            gap: isMobile ? '24px' : '0'
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
                backgroundColor: colors.success || '#10b981',
              }} />
              <span style={{
                fontSize: '11px',
                color: colors.textSecondary,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                SUCCESS STORIES
              </span>
            </div>
            
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '700',
              color: colors.text,
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              Recently Completed Projects
            </h2>
            
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: colors.textSecondary,
              margin: '0',
              maxWidth: '500px',
              lineHeight: '1.6'
            }}>
              Our successfully completed projects showcase the tremendous impact we've created across Africa. Each project represents meaningful change and sustainable solutions.
            </p>
          </div>

          {/* Right side controls */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: isMobile ? 'center' : 'flex-end',
            gap: isMobile ? '16px' : '20px',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            width: isMobile ? '100%' : 'auto'
          }}>
            <button
              onClick={goToProjectsCatalogue}
              style={{
                padding: isMobile ? '12px 20px' : '16px 24px',
                background: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '0px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: `0 4px 15px ${colors.primary}40`,
                transition: 'all 0.3s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 8px 25px ${colors.primary}60`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 15px ${colors.primary}40`;
              }}
            >
              <span>View All Projects</span>
              <ChevronRight size={16} />
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
                    borderRadius: '0px',
                    background: canGoPrev ? colors.background : colors.surface,
                    color: canGoPrev ? colors.text : colors.textMuted,
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
                    borderRadius: '0px',
                    background: canGoNext ? colors.background : colors.surface,
                    color: canGoNext ? colors.text : colors.textMuted,
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
        </motion.div>

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
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={(event) => handleProjectClick(project, event)}
                style={{
                  minWidth: isMobile ? '100%' : 'calc(33.333% - 20px)',
                  background: isDarkMode 
                    ? 'rgba(30, 41, 59, 0.5)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '0px',
                  boxShadow: isDarkMode 
                    ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                    : '0 20px 60px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
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
                  height: isMobile ? '200px' : '240px',
                  position: 'relative',
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
                  justifyContent: 'center'
                }}>
                  {/* Overlay for better text readability */}
                  {project.featured_image && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)'
                    }} />
                  )}

                  {/* Category Icon - only show if no featured image */}
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

                  {/* Person name badge at bottom */}
                  {project.person_name && (
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      backgroundColor: colors.secondary,
                      color: colors.black,
                      padding: '8px 12px',
                      borderRadius: '0px',
                      fontSize: '12px',
                      fontWeight: '600',
                      zIndex: 2
                    }}>
                      {project.person_name}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: `${colors.success}20`,
                    color: colors.success,
                    padding: '6px 12px',
                    borderRadius: '0px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${colors.success}30`,
                    zIndex: 2
                  }}>
                    <CheckCircle size={12} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Completed
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {project.is_featured && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: colors.primary,
                      color: colors.white,
                      padding: '6px 12px',
                      borderRadius: '0px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 2
                    }}>
                      <Star size={12} />
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div style={{
                    position: 'absolute',
                    top: project.is_featured ? '56px' : '16px',
                    left: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: colors.text,
                    padding: '6px 12px',
                    borderRadius: '0px',
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
                  minHeight: '280px'
                }}>
                  {/* Project Title */}
                  <h3 style={{
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: '700',
                    color: colors.text,
                    margin: '0',
                    lineHeight: '1.3',
                    letterSpacing: '-0.02em'
                  }}>
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    color: colors.textSecondary,
                    fontSize: isMobile ? '14px' : '15px',
                    lineHeight: '1.6',
                    margin: '0',
                    fontWeight: '400',
                    flex: 1
                  }}>
                    {truncateText(project.short_description || project.description, 120)}
                  </p>

                  {/* Location */}
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
                        fontWeight: '500'
                      }}>
                        {project.location}
                      </span>
                    </div>
                  )}

                  {/* Success Metrics */}
                  <div style={{
                    background: `${colors.success}10`,
                    padding: '12px 16px',
                    borderRadius: '0px',
                    border: `1px solid ${colors.success}20`
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        color: colors.success,
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        Project Completed
                      </span>
                      <span style={{
                        color: colors.success,
                        fontSize: '13px',
                        fontWeight: '700'
                      }}>
                        100%
                      </span>
                    </div>
                    <div style={{ 
                      height: '6px',
                      backgroundColor: `${colors.success}20`,
                      borderRadius: '0px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: colors.success,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Impact Stats */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: `1px solid ${colors.borderLight}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: colors.success,
                        borderRadius: '0%'
                      }} />
                      <span style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        fontWeight: '500'
                      }}>
                        {project.category_name === 'Water & Sanitation' ? 'Communities served: 15+' :
                         project.category_name === 'Renewable Energy' ? 'Schools powered: 25+' :
                         project.category_name === 'Environment' ? 'Trees planted: 50K+' :
                         project.category_name === 'Agriculture' ? 'Farmers trained: 500+' :
                         project.category_name === 'Marine Conservation' ? 'Coastline protected: 100km' :
                         project.category_name === 'Waste Management' ? 'Waste reduced: 60%' :
                         'Impact achieved'}
                      </span>
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
                        Read Success Story
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
              </motion.div>
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
                borderRadius: '0px',
                background: canGoPrev ? colors.background : colors.surface,
                color: canGoPrev ? colors.text : colors.textMuted,
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
                borderRadius: '0px',
                background: canGoNext ? colors.background : colors.surface,
                color: canGoNext ? colors.text : colors.textMuted,
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: canGoNext ? 1 : 0.5
              }}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Pagination dots */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: '40px',
          gap: '8px'
        }}>
          {Array.from({ length: Math.max(1, projects.length - itemsToShow + 1) }).map((_, index) => (
            <div
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setCurrentIndex(index);
                }
              }}
              style={{
                width: currentIndex === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '0px',
                backgroundColor: currentIndex === index ? colors.primary : colors.border,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompletedProjectsDisplay;