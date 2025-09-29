import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import JoinMovement from '../../components/JoinMovement'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Search, X, Filter, Grid, List, Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';

const API_BASE = API_URL;

const PublicProjectsDisplay = ({ initialCategoryFilter = null }) => {
  const navigate = useNavigate();
  const { colors, isDarkMode } = useTheme();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: initialCategoryFilter || '',
    countryId: '',
    status: '',
    featured: ''
  });

  const projectRefs = useRef([]);

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Placeholder data for when API data is not available
  const placeholderProjects = [
    {
      id: 'placeholder-1',
      title: 'Clean Water Initiative - Lake Victoria',
      short_description: 'Providing sustainable clean water solutions to rural communities around Lake Victoria through innovative filtration systems and community education programs.',
      category_name: 'Water & Sanitation',
      status: 'ongoing',
      location: 'Kisumu County, Kenya',
      is_featured: true,
      featured_image: null,
      progress: 85
    },
    {
      id: 'placeholder-2',
      title: 'Solar Energy for Schools Project',
      short_description: 'Installing solar panel systems in primary schools across rural Kenya to improve learning conditions and reduce energy costs for educational institutions.',
      category_name: 'Renewable Energy',
      status: 'ongoing',
      location: 'Nakuru County, Kenya',
      is_featured: false,
      featured_image: null,
      progress: 72
    },
    {
      id: 'placeholder-3',
      title: 'Community Reforestation Program',
      short_description: 'Engaging local communities in large-scale tree planting initiatives to combat deforestation and promote biodiversity conservation.',
      category_name: 'Environment',
      status: 'completed',
      location: 'Mount Kenya Region',
      is_featured: true,
      featured_image: null,
      progress: 100
    },
    {
      id: 'placeholder-4',
      title: 'Urban Waste Management System',
      short_description: 'Implementing innovative waste sorting and recycling programs in Nairobi informal settlements to improve sanitation and create economic opportunities.',
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
      short_description: 'Teaching modern farming techniques and providing agricultural equipment to smallholder farmers to increase productivity and food security.',
      category_name: 'Agriculture',
      status: 'ongoing',
      location: 'Central Kenya',
      is_featured: false,
      featured_image: null,
      progress: 68
    },
    {
      id: 'placeholder-6',
      title: 'Coastal Conservation Initiative',
      short_description: 'Protecting marine ecosystems through community-based conservation programs along the Kenyan coast and mangrove restoration.',
      category_name: 'Marine Conservation',
      status: 'ongoing',
      location: 'Mombasa County, Kenya',
      is_featured: true,
      featured_image: null,
      progress: 78
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

  const statusConfig = {
    planning: { 
      label: 'Planning', 
      icon: <Clock size={16} />,
      color: colors.warning || '#f59e0b',
      bgColor: `${colors.warning || '#f59e0b'}20`
    },
    ongoing: { 
      label: 'Ongoing', 
      icon: <Clock size={16} />,
      color: colors.info || '#3b82f6',
      bgColor: `${colors.info || '#3b82f6'}20`
    },
    completed: { 
      label: 'Completed', 
      icon: <CheckCircle size={16} />,
      color: colors.success || '#10b981',
      bgColor: `${colors.success || '#10b981'}20`
    },
    on_hold: { 
      label: 'On Hold', 
      icon: <Clock size={16} />,
      color: colors.warning || '#f59e0b',
      bgColor: `${colors.warning || '#f59e0b'}20`
    }
  };

  // Data fetching effects
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchCountries()
        ]);
        await fetchProjects();
      } catch (error) {
        console.error('Error initializing data:', error);
        setProjects(placeholderProjects);
        setCategories(placeholderCategories);
        setCountries([
          { id: 'ke', name: 'Kenya' },
          { id: 'ug', name: 'Uganda' },
          { id: 'tz', name: 'Tanzania' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (initialCategoryFilter && categories.length > 0) {
      setFilters(prev => ({ ...prev, categoryId: initialCategoryFilter }));
    }
  }, [initialCategoryFilter, categories]);

  useEffect(() => {
    applyFilters();
  }, [filters, projects]);

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.search) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (project.short_description && project.short_description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (project.location && project.location.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.categoryId) {
      filtered = filtered.filter(project => 
        project.category_id === filters.categoryId || 
        project.category_name === categories.find(cat => cat.id === filters.categoryId)?.name
      );
    }

    if (filters.status) {
      filtered = filtered.filter(project => 
        project.status === filters.status
      );
    }

    if (filters.featured === 'true') {
      filtered = filtered.filter(project => project.is_featured);
    } else if (filters.featured === 'false') {
      filtered = filtered.filter(project => !project.is_featured);
    }

    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.title.localeCompare(b.title);
    });

    setFilteredProjects(filtered);
  };

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

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`, { credentials: 'include' });
      const defaultCountries = [
        { id: 'ke', name: 'Kenya' },
        { id: 'ug', name: 'Uganda' },
        { id: 'tz', name: 'Tanzania' }
      ];
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const ctrs = Array.isArray(data.data) ? data.data : [];
        setCountries(ctrs.length > 0 ? ctrs : defaultCountries);
      } else {
        setCountries(defaultCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([
        { id: 'ke', name: 'Kenya' },
        { id: 'ug', name: 'Uganda' },
        { id: 'tz', name: 'Tanzania' }
      ]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      countryId: '',
      status: '',
      featured: ''
    });
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

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.planning;
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

  const totalProjects = projects.length;
  const featuredCount = projects.filter(p => p.is_featured).length;
  const ongoingCount = projects.filter(p => p.status === 'ongoing').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: isDarkMode 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
        : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header />

      {/* Hero Section */}
      <section style={{ 
        padding: isMobile ? '80px 0 60px' : '120px 0 80px',
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' 
          : colors.accent
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 20px',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: "300",
                  color: colors.text,
                  marginBottom: "24px",
                  lineHeight: "1.2",
                  letterSpacing: '-0.02em'
                }}
              >
                Our <span style={{ fontWeight: '700', color: colors.primary }}>Impact</span> Projects
              </h2>
            
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: colors.textSecondary,
              margin: '0 0 40px 0',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              Driving sustainable environmental change across Africa through community-led initiatives
            </p>
            
            {/* Stats */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '16px' : '32px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isMobile ? '12px 20px' : '16px 24px',
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.5)' 
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              }}>
                <span style={{
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: '700',
                  color: colors.text
                }}>
                  {totalProjects}
                </span>
                <span style={{
                  fontSize: isMobile ? '13px' : '14px',
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  Total Projects
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isMobile ? '12px 20px' : '16px 24px',
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.5)' 
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              }}>
                <Star size={isMobile ? 18 : 20} style={{ color: colors.secondary }} />
                <span style={{
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: '700',
                  color: colors.text
                }}>
                  {featuredCount}
                </span>
                <span style={{
                  fontSize: isMobile ? '13px' : '14px',
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  Featured
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isMobile ? '12px 20px' : '16px 24px',
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.5)' 
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              }}>
                <CheckCircle size={isMobile ? 18 : 20} style={{ color: colors.success }} />
                <span style={{
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: '700',
                  color: colors.text
                }}>
                  {completedCount}
                </span>
                <span style={{
                  fontSize: isMobile ? '13px' : '14px',
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  Completed
                </span>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              background: isDarkMode 
                ? 'rgba(71, 85, 105, 0.3)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
            }}>
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                fontWeight: '500'
              }}>
                {filteredProjects.length === totalProjects 
                  ? `Showing all ${totalProjects} projects` 
                  : `Showing ${filteredProjects.length} of ${totalProjects} projects`
                }
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* UPDATED Filters Section - Mobile Optimized */}
      <section style={{ 
        padding: isMobile ? '0 16px 40px' : '0 20px 60px'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{
              background: isDarkMode 
                ? 'rgba(30, 41, 59, 0.5)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              padding: isMobile ? '20px' : '32px',
              border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: isMobile ? '12px' : '16px',
              marginBottom: '40px',
              boxSizing: 'border-box',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                width: '100%'
              }}>
                
                {/* Search - Full width on mobile */}
                <div style={{ 
                  position: 'relative', 
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <Search 
                    size={18} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: colors.textMuted,
                      zIndex: 2
                    }} 
                  />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 12px 14px 42px',
                      border: `1px solid ${colors.borderLight}`,
                      borderRadius: '8px',
                      background: colors.background,
                      color: colors.text,
                      fontSize: '14px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.borderLight;
                    }}
                  />
                </div>

                {/* Filter Controls Row */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '12px',
                  width: '100%',
                  alignItems: isMobile ? 'stretch' : 'center'
                }}>
                  
                  {/* Category Filter */}
                  <div style={{ flex: isMobile ? 'none' : '1', minWidth: '0' }}>
                    <select
                      value={filters.categoryId}
                      onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 12px',
                        border: `1px solid ${colors.borderLight}`,
                        borderRadius: '8px',
                        background: colors.background,
                        color: colors.text,
                        fontSize: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.textMuted)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px',
                        paddingRight: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.borderLight;
                      }}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div style={{ flex: isMobile ? 'none' : '1', minWidth: '0' }}>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 12px',
                        border: `1px solid ${colors.borderLight}`,
                        borderRadius: '8px',
                        background: colors.background,
                        color: colors.text,
                        fontSize: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.textMuted)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px',
                        paddingRight: '40px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.borderLight;
                      }}
                    >
                      <option value="">All Status</option>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons Row */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'space-between' : 'flex-end',
                    flex: isMobile ? 'none' : 'auto'
                  }}>
                    
                    {/* Clear Filters */}
                    <button
                      onClick={clearFilters}
                      style={{
                        padding: '12px 16px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        background: 'transparent',
                        color: colors.textSecondary,
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        minWidth: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.backgroundColor = `${colors.primary}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = colors.border;
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <X size={14} />
                      <span style={{ display: isMobile ? 'none' : 'inline' }}>Clear</span>
                    </button>

                    {/* View Mode Toggle - Hide on mobile */}
                    {!isMobile && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '2px',
                        border: `1px solid ${colors.borderLight}`,
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => setViewMode('grid')}
                          style={{
                            padding: '10px',
                            border: 'none',
                            background: viewMode === 'grid' ? colors.primary : 'transparent',
                            color: viewMode === 'grid' ? colors.white : colors.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Grid size={16} />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          style={{
                            padding: '10px',
                            border: 'none',
                            background: viewMode === 'list' ? colors.primary : 'transparent',
                            color: viewMode === 'list' ? colors.white : colors.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <List size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Filters Display - Mobile friendly */}
                {(filters.search || filters.categoryId || filters.status || filters.featured) && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: `1px solid ${colors.borderLight}`
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: colors.textMuted,
                      fontWeight: '500',
                      alignSelf: 'center'
                    }}>
                      Active filters:
                    </span>
                    
                    {filters.search && (
                      <span style={{
                        background: `${colors.primary}15`,
                        color: colors.primary,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        "{filters.search}"
                      </span>
                    )}
                    
                    {filters.categoryId && (
                      <span style={{
                        background: `${colors.primary}15`,
                        color: colors.primary,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {categories.find(cat => cat.id === filters.categoryId)?.name}
                      </span>
                    )}
                    
                    {filters.status && (
                      <span style={{
                        background: `${colors.primary}15`,
                        color: colors.primary,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {statusConfig[filters.status]?.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section style={{ 
        padding: isMobile ? '0 16px 80px' : '0 20px 100px'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              padding: '80px 0',
              textAlign: 'center'
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
            </div>
          ) : filteredProjects.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 0'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                opacity: '0.5'
              }}>
                🌍
              </div>
              <h3 style={{ 
                color: colors.text,
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                No Projects Found
              </h3>
              <p style={{ 
                color: colors.textSecondary,
                fontSize: '14px',
                maxWidth: '400px',
                margin: '0 auto 24px',
                lineHeight: '1.6'
              }}>
                Try adjusting your search or filters to discover more projects
              </p>
              <button 
                onClick={clearFilters}
                style={{
                  padding: '12px 24px',
                  border: `1px solid ${colors.primary}`,
                  background: 'transparent',
                  color: colors.primary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${colors.primary}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: isMobile ? '24px' : '32px'
            }}>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={(event) => handleProjectClick(project, event)}
                  style={{
                    background: isDarkMode 
                      ? 'rgba(30, 41, 59, 0.5)' 
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
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

                    {/* Featured Badge */}
                    {project.is_featured && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        backgroundColor: colors.secondary,
                        color: colors.black,
                        padding: '6px 12px',
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
                      top: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: colors.text,
                      padding: '6px 12px',
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

                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      backgroundColor: getStatusInfo(project.status).bgColor,
                      color: getStatusInfo(project.status).color,
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 2
                    }}>
                      {getStatusInfo(project.status).icon}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {getStatusInfo(project.status).label}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div style={{ 
                    padding: isMobile ? '24px 20px' : '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
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
                      fontWeight: '400'
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

                    {/* Progress Bar */}
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
                          {project.progress || 
                           (project.status === 'completed' ? 100 :
                            project.status === 'ongoing' ? 65 : 25)}%
                        </span>
                      </div>
                      <div style={{ 
                        height: '6px',
                        backgroundColor: colors.borderLight,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${project.progress || 
                                   (project.status === 'completed' ? 100 :
                                    project.status === 'ongoing' ? 65 : 25)}%`,
                          backgroundColor: getCategoryColor(project.category_name),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Stats Row */}
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
                          backgroundColor: colors.success 
                        }} />
                        <span style={{
                          fontSize: '12px',
                          color: colors.textSecondary,
                          fontWeight: '500'
                        }}>
                          {project.category_name === 'Water & Sanitation' ? '500+ volunteers' :
                           project.category_name === 'Renewable Energy' ? '15 communities' :
                           project.category_name === 'Environment' ? '10K+ trees' :
                           'Active project'}
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <JoinMovement />
      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PublicProjectsDisplay;