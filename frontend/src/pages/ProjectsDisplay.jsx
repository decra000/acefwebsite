import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, Chip, FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, CircularProgress, Avatar, Paper,
  Container, Tooltip, IconButton, Stack, Divider
} from '@mui/material';
import {
  Search, Visibility, LocationOn, Category, Public,
  Star, ArrowForward, CheckCircle, Assessment, 
  ClearAll, TrendingUp, ViewModule, ViewList, 
  FilterAlt, NatureOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme';
import { API_URL, STATIC_URL} from '../config';

const API_BASE = API_URL;

const ProjectsDisplay = ({ initialCategoryFilter = null }) => {
  const navigate = useNavigate();
  const { colors, isDarkMode } = useTheme();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleProjects, setVisibleProjects] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [scrollY, setScrollY] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: initialCategoryFilter || '',
    countryId: '',
    status: '',
    featured: ''
  });

  const projectRefs = useRef([]);

  // Color palette matching objectives section
  const designColors = {
    primary: '#0a451c',
    secondary: '#facf3c',
    accent: '#9ccf9f',
    info: '#3b82f6',
    primaryLight: '#1a5a2c',
    white: '#ffffff',
    surface: '#fafafa',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };

  // Placeholder data for when API data is not available
  const placeholderProjects = [
    {
      id: 'placeholder-1',
      title: 'Clean Water Initiative - Lake Victoria',
      short_description: 'Providing sustainable clean water solutions to rural communities around Lake Victoria through innovative filtration systems.',
      category_name: 'Water & Sanitation',
      status: 'ongoing',
      location: 'Kisumu County, Kenya',
      is_featured: true,
      featured_image: null
    },
    {
      id: 'placeholder-2',
      title: 'Solar Energy for Schools Project',
      short_description: 'Installing solar panel systems in primary schools across rural Kenya to improve learning conditions and reduce energy costs.',
      category_name: 'Renewable Energy',
      status: 'ongoing',
      location: 'Nakuru County, Kenya',
      is_featured: false,
      featured_image: null
    },
    {
      id: 'placeholder-3',
      title: 'Community Reforestation Program',
      short_description: 'Engaging local communities in large-scale tree planting initiatives to combat deforestation and promote biodiversity.',
      category_name: 'Environment',
      status: 'completed',
      location: 'Mount Kenya Region',
      is_featured: true,
      featured_image: null
    },
    {
      id: 'placeholder-4',
      title: 'Urban Waste Management System',
      short_description: 'Implementing innovative waste sorting and recycling programs in Nairobi informal settlements.',
      category_name: 'Waste Management',
      status: 'planning',
      location: 'Nairobi County, Kenya',
      is_featured: false,
      featured_image: null
    },
    {
      id: 'placeholder-5',
      title: 'Agricultural Technology Training',
      short_description: 'Teaching modern farming techniques and providing agricultural equipment to smallholder farmers.',
      category_name: 'Agriculture',
      status: 'ongoing',
      location: 'Central Kenya',
      is_featured: false,
      featured_image: null
    },
    {
      id: 'placeholder-6',
      title: 'Coastal Conservation Initiative',
      short_description: 'Protecting marine ecosystems through community-based conservation programs along the Kenyan coast.',
      category_name: 'Marine Conservation',
      status: 'ongoing',
      location: 'Mombasa County, Kenya',
      is_featured: true,
      featured_image: null
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
      icon: <Assessment />,
      color: designColors.info,
      bgColor: `${designColors.info}20`
    },
    ongoing: { 
      label: 'Ongoing', 
      icon: <TrendingUp />,
      color: designColors.accent,
      bgColor: `${designColors.accent}20`
    },
    completed: { 
      label: 'Completed', 
      icon: <CheckCircle />,
      color: designColors.primary,
      bgColor: `${designColors.primary}20`
    },
    on_hold: { 
      label: 'On Hold', 
      icon: <Assessment />,
      color: designColors.secondary,
      bgColor: `${designColors.secondary}20`
    }
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
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
        (project.description && project.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (project.location && project.location.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.categoryId) {
      filtered = filtered.filter(project => 
        project.category_id === filters.categoryId || 
        project.category_name === categories.find(cat => cat.id === filters.categoryId)?.name
      );
    }

    if (filters.countryId) {
      filtered = filtered.filter(project => 
        project.country_id === filters.countryId
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

  // Intersection observer for animations
  useEffect(() => {
    const observers = [];
    
    projectRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleProjects(prev => new Set([...prev, index]));
            }
          },
          { threshold: 0.1, rootMargin: '50px' }
        );
        
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [filteredProjects]);

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
        if (allProjects.length > 0) {
          setProjects(allProjects);
        } else {
          setProjects(placeholderProjects);
        }
      } else if (Array.isArray(data)) {
        setProjects(data.length > 0 ? data : placeholderProjects);
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
      } else if (Array.isArray(data)) {
        setCategories(data.length > 0 ? data : placeholderCategories);
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        const ctrs = Array.isArray(data.data) ? data.data : [];
        setCountries(ctrs.length > 0 ? ctrs : [
          { id: 'ke', name: 'Kenya' },
          { id: 'ug', name: 'Uganda' },
          { id: 'tz', name: 'Tanzania' }
        ]);
      } else if (Array.isArray(data)) {
        setCountries(data.length > 0 ? data : [
          { id: 'ke', name: 'Kenya' },
          { id: 'ug', name: 'Uganda' },
          { id: 'tz', name: 'Tanzania' }
        ]);
      } else {
        setCountries([
          { id: 'ke', name: 'Kenya' },
          { id: 'ug', name: 'Uganda' },
          { id: 'tz', name: 'Tanzania' }
        ]);
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
    setVisibleProjects(new Set());
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    setVisibleProjects(new Set());
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      countryId: '',
      status: '',
      featured: ''
    });
    setVisibleProjects(new Set());
  };

  const handleProjectClick = (project, event) => {
    console.log('Project clicked:', project.id, project.title);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      navigate(`/project/${project.id}`, { 
        state: { 
          project,
          from: location.pathname
        },
        replace: false
      });
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.planning;
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
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: designColors.white,
      fontFamily: '"Inter", sans-serif',
      position: 'relative',
      overflow: 'hidden',
      padding: '40px 20px'
    }}>
      {/* Subtle background accent */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '8%',
        width: '1px',
        height: '100px',
        background: `linear-gradient(180deg, transparent, ${designColors.accent}30, transparent)`,
        transform: `translateY(-50%) translateY(${scrollY * -0.02}px)`
      }}></div>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header matching objectives style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mb: '32px'
          }}>
            {/* Header with accent line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '600',
                  color: designColors.text,
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.01em',
                  fontFamily: '"Inter", sans-serif'
                }}>
                  Impact Projects
                </h2>
                <div style={{
                  width: '40px',
                  height: '2px',
                  background: `linear-gradient(90deg, ${designColors.primary}, ${designColors.accent})`,
                  borderRadius: '1px'
                }}></div>
              </div>
              
              <div style={{
                fontSize: '0.75rem',
                color: designColors.textSecondary,
                fontWeight: '500',
                fontFamily: 'monospace'
              }}>
                PROJECT SHOWCASE
              </div>
            </div>

            <Typography 
              sx={{ 
                color: designColors.textSecondary,
                fontWeight: 400,
                fontSize: '0.9rem',
                maxWidth: '600px',
                mx: 'auto',
                mb: 4,
                lineHeight: 1.5
              }}
            >
              Driving sustainable environmental change across communities
            </Typography>
            
            {/* Stats Row - refined */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center" 
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '12px',
                backgroundColor: designColors.surface,
                border: `1px solid ${designColors.border}`,
                minWidth: '140px'
              }}>
                <NatureOutlined sx={{ color: designColors.primary, fontSize: 20 }} />
                <Typography sx={{ 
                  color: designColors.text,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mr: 0.5
                }}>
                  {totalProjects}
                </Typography>
                <Typography sx={{ 
                  color: designColors.textSecondary,
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}>
                  Total
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '12px',
                backgroundColor: designColors.surface,
                border: `1px solid ${designColors.border}`,
                minWidth: '140px'
              }}>
                <Star sx={{ color: designColors.secondary, fontSize: 20 }} />
                <Typography sx={{ 
                  color: designColors.text,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mr: 0.5
                }}>
                  {featuredCount}
                </Typography>
                <Typography sx={{ 
                  color: designColors.textSecondary,
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}>
                  Featured
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '12px',
                backgroundColor: designColors.surface,
                border: `1px solid ${designColors.border}`,
                minWidth: '140px'
              }}>
                <TrendingUp sx={{ color: designColors.accent, fontSize: 20 }} />
                <Typography sx={{ 
                  color: designColors.text,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mr: 0.5
                }}>
                  {ongoingCount}
                </Typography>
                <Typography sx={{ 
                  color: designColors.textSecondary,
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}>
                  Active
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '12px',
                backgroundColor: designColors.surface,
                border: `1px solid ${designColors.border}`,
                minWidth: '140px'
              }}>
                <CheckCircle sx={{ color: designColors.primary, fontSize: 20 }} />
                <Typography sx={{ 
                  color: designColors.text,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mr: 0.5
                }}>
                  {completedCount}
                </Typography>
                <Typography sx={{ 
                  color: designColors.textSecondary,
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}>
                  Done
                </Typography>
              </Box>
            </Stack>

            {/* Results count */}
            <Typography sx={{ 
              color: designColors.textSecondary,
              fontWeight: 500,
              fontSize: '0.75rem',
              mt: 2
            }}>
              {filteredProjects.length === totalProjects 
                ? `Showing all ${totalProjects} projects` 
                : `Showing ${filteredProjects.length} of ${totalProjects} projects`
              }
            </Typography>
          </Box>
        </motion.div>

        {/* Refined Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper sx={{
            p: 2.5,
            mb: 4,
            backgroundColor: designColors.white,
            border: `1px solid ${designColors.border}`,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={2} 
              alignItems="center"
            >
              <TextField
                placeholder="Search projects..."
                value={filters.search}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  minWidth: { xs: '100%', md: '250px' },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: designColors.surface,
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: designColors.border },
                    '&:hover fieldset': { borderColor: designColors.primary },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: designColors.textSecondary, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ fontSize: '0.85rem' }}>Category</InputLabel>
                <Select
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  sx={{ 
                    backgroundColor: designColors.surface,
                    fontSize: '0.85rem'
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.85rem' }}>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{ 
                    backgroundColor: designColors.surface,
                    fontSize: '0.85rem'
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      {config.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel sx={{ fontSize: '0.85rem' }}>Featured</InputLabel>
                <Select
                  value={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.value)}
                  sx={{ 
                    backgroundColor: designColors.surface,
                    fontSize: '0.85rem'
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Featured</MenuItem>
                  <MenuItem value="false">Regular</MenuItem>
                </Select>
              </FormControl>

              <Button 
                onClick={clearFilters} 
                variant="outlined"
                size="small"
                startIcon={<ClearAll />}
                sx={{ 
                  borderColor: designColors.border,
                  color: designColors.textSecondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: designColors.primary,
                    backgroundColor: `${designColors.primary}08`
                  }
                }}
              >
                Clear
              </Button>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                <Tooltip title="Grid View">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('grid')}
                    sx={{ 
                      backgroundColor: viewMode === 'grid' ? designColors.primary : 'transparent',
                      color: viewMode === 'grid' ? designColors.white : designColors.textSecondary,
                      '&:hover': {
                        backgroundColor: viewMode === 'grid' ? designColors.primaryLight : `${designColors.primary}20`,
                      }
                    }}
                  >
                    <ViewModule fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="List View">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('list')}
                    sx={{ 
                      backgroundColor: viewMode === 'list' ? designColors.primary : 'transparent',
                      color: viewMode === 'list' ? designColors.white : designColors.textSecondary,
                      '&:hover': {
                        backgroundColor: viewMode === 'list' ? designColors.primaryLight : `${designColors.primary}20`,
                      }
                    }}
                  >
                    <ViewList fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Paper>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            py: 8
          }}>
            <CircularProgress 
              size={50} 
              thickness={4}
              sx={{ color: designColors.primary, mb: 2 }} 
            />
            <Typography sx={{ 
              color: designColors.textSecondary,
              fontWeight: 500,
              fontSize: '0.85rem'
            }}>
              Loading projects...
            </Typography>
          </Box>
        ) : filteredProjects.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8
          }}>
            <NatureOutlined sx={{ 
              fontSize: 60, 
              color: designColors.textSecondary,
              mb: 2
            }} />
            <Typography variant="h5" sx={{ 
              color: designColors.text,
              fontWeight: 600,
              mb: 1,
              fontSize: '1.25rem'
            }}>
              No Projects Found
            </Typography>
            <Typography sx={{ 
              color: designColors.textSecondary,
              maxWidth: '400px',
              mx: 'auto',
              mb: 3,
              fontSize: '0.9rem'
            }}>
              Try adjusting your search or filters to discover more projects
            </Typography>
            <Button 
              onClick={clearFilters}
              variant="outlined"
              sx={{ 
                borderColor: designColors.primary,
                color: designColors.primary,
                fontSize: '0.85rem',
                fontWeight: 500,
                '&:hover': {
                  borderColor: designColors.primaryLight,
                  backgroundColor: `${designColors.primary}10`
                }
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {filteredProjects.map((project, index) => (
                <Grid item xs={12} sm={6} lg={4} key={project.id}>
                  <div ref={el => projectRefs.current[index] = el}>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      layout
                    >
                      <Card
                        onClick={(event) => handleProjectClick(project, event)}
                        sx={{
                          height: '480px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: designColors.white,
                          border: `1px solid ${designColors.border}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: `0 8px 25px ${designColors.primary}15`,
                            borderColor: `${designColors.primary}40`
                          }
                        }}
                      >
                        {/* Top accent line */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: designColors.primary,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          zIndex: 1,
                          '.MuiCard-root:hover &': {
                            opacity: 1
                          }
                        }} />

                        {/* Hero Section */}
                        <Box sx={{
                          height: 160,
                          position: 'relative',
                          background: project.featured_image ? 'none' :
                                    project.category_name === 'Water & Sanitation' ? 'linear-gradient(135deg, #26BDE2 0%, #1976d2 100%)' :
                                    project.category_name === 'Renewable Energy' ? 'linear-gradient(135deg, #FCC30B 0%, #FF9800 100%)' :
                                    project.category_name === 'Environment' ? 'linear-gradient(135deg, #56C02B 0%, #4CAF50 100%)' :
                                    project.category_name === 'Waste Management' ? 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)' :
                                    project.category_name === 'Agriculture' ? 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)' :
                                    project.category_name === 'Marine Conservation' ? 'linear-gradient(135deg, #0A97D9 0%, #1976d2 100%)' :
                                    `linear-gradient(135deg, ${designColors.primary} 0%, ${designColors.primaryLight} 100%)`,
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
                          color: 'white'
                        }}>
                          {project.featured_image && (
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)'
                            }} />
                          )}

                          {!project.featured_image && (
                            <Box sx={{
                              fontSize: '3rem',
                              opacity: 0.9,
                              zIndex: 1
                            }}>
                              {project.category_name === 'Water & Sanitation' ? '💧' :
                               project.category_name === 'Renewable Energy' ? '⚡' :
                               project.category_name === 'Environment' ? '🌳' :
                               project.category_name === 'Waste Management' ? '♻️' :
                               project.category_name === 'Agriculture' ? '🌾' :
                               project.category_name === 'Marine Conservation' ? '🌊' :
                               '🌍'}
                            </Box>
                          )}

                          {/* Category Badge */}
                          <Box sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            backgroundColor: `${designColors.primary}08`,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                            zIndex: 2
                          }}>
                            <Typography sx={{ 
                              fontWeight: 500,
                              fontSize: '0.65rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: designColors.primary
                            }}>
                              {project.category_name || 'Project'}
                            </Typography>
                          </Box>

                          {/* Featured Badge */}
                          {project.is_featured && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: 12,
                              right: 12,
                              backgroundColor: designColors.secondary,
                              color: designColors.text,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              zIndex: 2
                            }}>
                              <Star sx={{ fontSize: 14 }} />
                              <Typography sx={{ 
                                fontWeight: 600,
                                fontSize: '0.65rem'
                              }}>
                                FEATURED
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ p: 2.5, height: 'calc(100% - 160px)', display: 'flex', flexDirection: 'column' }}>
                          {/* Project Title */}
                          <Typography sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: designColors.text,
                            mb: 1.5,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {project.title}
                          </Typography>

                          {/* Description */}
                          <Typography sx={{
                            color: designColors.textSecondary,
                            lineHeight: 1.4,
                            mb: 2,
                            flex: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '0.8rem'
                          }}>
                            {truncateText(project.short_description || project.description, 120)}
                          </Typography>

                          {/* Location - Fixed Height */}
                          <Box sx={{ height: '24px', mb: 2 }}>
                            {project.location && (
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center'
                              }}>
                                <LocationOn sx={{ fontSize: 14, mr: 0.5, color: designColors.textSecondary }} />
                                <Typography sx={{
                                  color: designColors.textSecondary,
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {project.location}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Status and Progress - Fixed Height */}
                          <Box sx={{ height: '20px', mb: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {React.cloneElement(getStatusInfo(project.status).icon, { 
                                  sx: { fontSize: 14, color: getStatusInfo(project.status).color }
                                })}
                                <Typography sx={{ 
                                  color: getStatusInfo(project.status).color,
                                  fontWeight: 600,
                                  fontSize: '0.7rem'
                                }}>
                                  {getStatusInfo(project.status).label}
                                </Typography>
                              </Box>

                              <Typography sx={{ 
                                color: designColors.textSecondary,
                                fontWeight: 500,
                                fontSize: '0.7rem'
                              }}>
                                {project.status === 'completed' ? '100%' :
                                 project.status === 'ongoing' ? '65%' : '25%'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Progress Bar - Fixed Height */}
                          <Box sx={{ height: '4px', mb: 2 }}>
                            <Box sx={{ 
                              height: '100%',
                              backgroundColor: designColors.gray200,
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}>
                              <Box sx={{
                                height: '100%',
                                width: project.status === 'completed' ? '100%' :
                                       project.status === 'ongoing' ? '65%' : '25%',
                                backgroundColor: getStatusInfo(project.status).color,
                                borderRadius: 2,
                                transition: 'width 0.3s ease'
                              }} />
                            </Box>
                          </Box>

                          {/* Spacer to push button to bottom */}
                          <Box sx={{ flex: 1 }} />

                          {/* Learn More Button - Fixed Height */}
                          <Box sx={{ height: '40px' }}>
                            <Button
                              variant="contained"
                              endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                              fullWidth
                              sx={{
                                backgroundColor: designColors.primary,
                                color: 'white',
                                fontWeight: 500,
                                height: '100%',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                '&:hover': {
                                  backgroundColor: designColors.primaryLight,
                                  transform: 'translateY(-1px)',
                                }
                              }}
                            >
                              Learn More
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Bottom accent matching objectives */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '40px',
          gap: '6px'
        }}>
          <div style={{
            width: '12px',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${designColors.primary}40)`
          }}></div>
          <div style={{
            fontSize: '0.6rem',
            color: designColors.textSecondary,
            fontWeight: '500',
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}>
            PROJECT PORTFOLIO
          </div>
          <div style={{
            width: '12px',
            height: '1px',
            background: `linear-gradient(90deg, ${designColors.primary}40, transparent)`
          }}></div>
        </div>
      </Container>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: repeat(auto-fit, minmax(280px, 1fr))"] {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          h2[style*="fontSize: '1.75rem'"] {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default ProjectsDisplay;