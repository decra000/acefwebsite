import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JoinMovement from '../pages/JoinMovement'; 

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

const PublicProjectsDisplay = ({ initialCategoryFilter = null }) => {
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
  const [filters, setFilters] = useState({
    search: '',
    categoryId: initialCategoryFilter || '',
    countryId: '',
    status: '',
    featured: ''
  });

  const projectRefs = useRef([]);

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
      color: colors.warning,
      bgColor: `${colors.warning}20`
    },
    ongoing: { 
      label: 'Ongoing', 
      icon: <TrendingUp />,
      color: colors.info,
      bgColor: `${colors.info}20`
    },
    completed: { 
      label: 'Completed', 
      icon: <CheckCircle />,
      color: colors.success,
      bgColor: `${colors.success}20`
    },
    on_hold: { 
      label: 'On Hold', 
      icon: <Assessment />,
      color: colors.warning,
      bgColor: `${colors.warning}20`
    }
  };

  const sdgGoalsInfo = {
    1: { title: 'No Poverty', color: '#E5243B' },
    2: { title: 'Zero Hunger', color: '#DDA63A' },
    3: { title: 'Good Health and Well-being', color: '#4C9F38' },
    4: { title: 'Quality Education', color: '#C5192D' },
    6: { title: 'Clean Water and Sanitation', color: '#26BDE2' },
    7: { title: 'Affordable and Clean Energy', color: '#FCC30B' },
    13: { title: 'Climate Action', color: '#3F7E44' },
    14: { title: 'Life Below Water', color: '#0A97D9' },
    15: { title: 'Life on Land', color: '#56C02B' },
  };

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
        // Use placeholder data when API fails
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

  // Filter projects whenever filters or projects change
  useEffect(() => {
    applyFilters();
  }, [filters, projects]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (project.short_description && project.short_description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (project.description && project.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (project.location && project.location.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Category filter
    if (filters.categoryId) {
      filtered = filtered.filter(project => 
        project.category_id === filters.categoryId || 
        project.category_name === categories.find(cat => cat.id === filters.categoryId)?.name
      );
    }

    // Country filter
    if (filters.countryId) {
      filtered = filtered.filter(project => 
        project.country_id === filters.countryId
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(project => 
        project.status === filters.status
      );
    }

    // Featured filter
    if (filters.featured === 'true') {
      filtered = filtered.filter(project => project.is_featured);
    } else if (filters.featured === 'false') {
      filtered = filtered.filter(project => !project.is_featured);
    }

    // Sort: featured first, then by title
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
      backgroundColor: colors.background,
      py: 6
    }}>
          <Header/>

      <Container maxWidth="xl">
        {/* Enhanced Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mb: 8,
            py: 4
          }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 800,
                color: colors.text,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                letterSpacing: '-0.02em'
              }}
            >
              Impact Projects
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: colors.textSecondary,
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                mb: 4
              }}
            >
              Driving sustainable environmental change across Africa
            </Typography>
            
            {/* Stats Row */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center" 
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                borderRadius: '50px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}>
                <NatureOutlined sx={{ color: colors.primary, fontSize: 24 }} />
                <Typography variant="h4" sx={{ 
                  color: colors.text,
                  fontWeight: 700,
                  mr: 1
                }}>
                  {totalProjects}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Total Projects
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                borderRadius: '50px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}>
                <Star sx={{ color: colors.secondary, fontSize: 24 }} />
                <Typography variant="h4" sx={{ 
                  color: colors.text,
                  fontWeight: 700,
                  mr: 1
                }}>
                  {featuredCount}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Featured
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                borderRadius: '50px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}>
                <TrendingUp sx={{ color: colors.info, fontSize: 24 }} />
                <Typography variant="h4" sx={{ 
                  color: colors.text,
                  fontWeight: 700,
                  mr: 1
                }}>
                  {ongoingCount}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Active
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                borderRadius: '50px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}>
                <CheckCircle sx={{ color: colors.success, fontSize: 24 }} />
                <Typography variant="h4" sx={{ 
                  color: colors.text,
                  fontWeight: 700,
                  mr: 1
                }}>
                  {completedCount}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Completed
                </Typography>
              </Box>
            </Stack>

            {/* Results count */}
            <Typography variant="body2" sx={{ 
              color: colors.textMuted,
              fontWeight: 500,
              mt: 2
            }}>
              {filteredProjects.length === totalProjects 
                ? `Showing all ${totalProjects} projects` 
                : `Showing ${filteredProjects.length} of ${totalProjects} projects`
              }
            </Typography>
          </Box>
        </motion.div>

        {/* Streamlined Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper sx={{
            p: 3,
            mb: 6,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
            boxShadow: 'none'
          }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={3} 
              alignItems="center"
            >
              <TextField
                placeholder="Search projects..."
                value={filters.search}
                onChange={handleSearchChange}
                size="medium"
                sx={{
                  minWidth: { xs: '100%', md: '300px' },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.background,
                    '& fieldset': { borderColor: colors.borderLight },
                    '&:hover fieldset': { borderColor: colors.primary },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: colors.textMuted }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="medium" sx={{ minWidth: 160 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  sx={{ backgroundColor: colors.background }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="medium" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{ backgroundColor: colors.background }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      {config.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="medium" sx={{ minWidth: 120 }}>
                <InputLabel>Featured</InputLabel>
                <Select
                  value={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.value)}
                  sx={{ backgroundColor: colors.background }}
                >
                  <MenuItem value="">All Projects</MenuItem>
                  <MenuItem value="true">Featured Only</MenuItem>
                  <MenuItem value="false">Regular Only</MenuItem>
                </Select>
              </FormControl>

              <Button 
                onClick={clearFilters} 
                variant="outlined"
                startIcon={<ClearAll />}
                sx={{ 
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  '&:hover': {
                    borderColor: colors.primary,
                    backgroundColor: `${colors.primary}10`
                  }
                }}
              >
                Clear
              </Button>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Tooltip title="Grid View">
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    sx={{ 
                      backgroundColor: viewMode === 'grid' ? colors.primary : 'transparent',
                      color: viewMode === 'grid' ? colors.white : colors.textSecondary,
                      '&:hover': {
                        backgroundColor: viewMode === 'grid' ? colors.primaryDark : `${colors.primary}20`,
                      }
                    }}
                  >
                    <ViewModule />
                  </IconButton>
                </Tooltip>
                <Tooltip title="List View">
                  <IconButton
                    onClick={() => setViewMode('list')}
                    sx={{ 
                      backgroundColor: viewMode === 'list' ? colors.primary : 'transparent',
                      color: viewMode === 'list' ? colors.white : colors.textSecondary,
                      '&:hover': {
                        backgroundColor: viewMode === 'list' ? colors.primaryDark : `${colors.primary}20`,
                      }
                    }}
                  >
                    <ViewList />
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
            py: 12
          }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ color: colors.primary, mb: 3 }} 
            />
            <Typography variant="h6" sx={{ 
              color: colors.textSecondary,
              fontWeight: 500
            }}>
              Loading Projects...
            </Typography>
          </Box>
        ) : filteredProjects.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 12
          }}>
            <NatureOutlined sx={{ 
              fontSize: 80, 
              color: colors.textMuted,
              mb: 3
            }} />
            <Typography variant="h4" sx={{ 
              color: colors.text,
              fontWeight: 600,
              mb: 2
            }}>
              No Projects Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: colors.textSecondary,
              maxWidth: '400px',
              mx: 'auto',
              mb: 3
            }}>
              Try adjusting your search or filters to discover more projects
            </Typography>
            <Button 
              onClick={clearFilters}
              variant="outlined"
              sx={{ 
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primaryDark,
                  backgroundColor: `${colors.primary}10`
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
            <Grid container spacing={4}>
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
                          height: '520px',
                          borderRadius: 3,
                          overflow: 'hidden',
                          backgroundColor: colors.surface,
                          border: `1px solid ${colors.borderLight}`,
                          boxShadow: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 12px 40px ${colors.primary}20`,
                          }
                        }}
                      >
                        {/* Hero Section with Featured Image or Category Color */}
                        <Box sx={{
                          height: 200,
                          position: 'relative',
                          background: project.featured_image ? 'none' :
                                    project.category_name === 'Water & Sanitation' ? 'linear-gradient(135deg, #26BDE2 0%, #1976d2 100%)' :
                                    project.category_name === 'Renewable Energy' ? 'linear-gradient(135deg, #FCC30B 0%, #FF9800 100%)' :
                                    project.category_name === 'Environment' ? 'linear-gradient(135deg, #56C02B 0%, #4CAF50 100%)' :
                                    project.category_name === 'Waste Management' ? 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)' :
                                    project.category_name === 'Agriculture' ? 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)' :
                                    project.category_name === 'Marine Conservation' ? 'linear-gradient(135deg, #0A97D9 0%, #1976d2 100%)' :
                                    `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
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
                          {/* Overlay for better text readability on images */}
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

                          {/* Category Icon - only show if no featured image */}
                          {!project.featured_image && (
                            <Box sx={{
                              fontSize: '4rem',
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

                          {/* Year Badge */}
                          <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            zIndex: 2
                          }}>
                            <Typography variant="body2" sx={{ 
                              color: 'white',
                              fontWeight: 600
                            }}>
                              2024
                            </Typography>
                          </Box>

                          {/* Category Badge */}
                          <Box sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backdropFilter: 'blur(10px)',
                            zIndex: 2
                          }}>
                            <Typography variant="caption" sx={{ 
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              color: project.featured_image ? colors.text : 'inherit'
                            }}>
                              {project.category_name || 'Project'}
                            </Typography>
                          </Box>

                          {/* Featured Badge */}
                          {project.is_featured && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: 16,
                              right: 16,
                              backgroundColor: colors.secondary,
                              color: colors.black,
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              zIndex: 2
                            }}>
                              <Star sx={{ fontSize: 16 }} />
                              <Typography variant="caption" sx={{ 
                                fontWeight: 700,
                                fontSize: '0.7rem'
                              }}>
                                FEATURED
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ p: 3, height: 'calc(100% - 200px)', display: 'flex', flexDirection: 'column' }}>
                          {/* Project Title */}
                          <Typography variant="h6" sx={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: colors.text,
                            mb: 2,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {project.title}
                          </Typography>

                          {/* Description */}
                          <Typography variant="body2" sx={{
                            color: colors.textSecondary,
                            lineHeight: 1.6,
                            mb: 3,
                            flex: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {truncateText(project.short_description || project.description, 140)}
                          </Typography>

                          {/* Location */}
                          {project.location && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              mb: 3
                            }}>
                              <LocationOn sx={{ fontSize: 16, mr: 1, color: colors.textMuted }} />
                              <Typography variant="body2" sx={{
                                color: colors.textSecondary,
                                fontWeight: 500
                              }}>
                                {project.location}
                              </Typography>
                            </Box>
                          )}

                          {/* Stats Row */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            gap: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {project.category_name === 'Water & Sanitation' && (
                                <>
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    backgroundColor: colors.success 
                                  }} />
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    500+ volunteers
                                  </Typography>
                                </>
                              )}
                              {project.category_name === 'Renewable Energy' && (
                                <>
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    backgroundColor: colors.info 
                                  }} />
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    15 Communities
                                  </Typography>
                                </>
                              )}
                              {project.category_name === 'Environment' && (
                                <>
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    backgroundColor: colors.success 
                                  }} />
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    Rural Areas
                                  </Typography>
                                </>
                              )}
                              {(!project.category_name || !['Water & Sanitation', 'Renewable Energy', 'Environment'].includes(project.category_name)) && (
                                <>
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    backgroundColor: colors.primary 
                                  }} />
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    Active Project
                                  </Typography>
                                </>
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusInfo(project.status).icon}
                              <Typography variant="caption" sx={{ 
                                color: getStatusInfo(project.status).color,
                                fontWeight: 600
                              }}>
                                {getStatusInfo(project.status).label}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Additional Info */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            gap: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {project.category_name === 'Water & Sanitation' && (
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  500 trees planted
                                </Typography>
                              )}
                              {project.category_name === 'Renewable Energy' && (
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  25 workshops
                                </Typography>
                              )}
                              {project.category_name === 'Environment' && (
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  15 training sessions
                                </Typography>
                              )}
                              {(!project.category_name || !['Water & Sanitation', 'Renewable Energy', 'Environment'].includes(project.category_name)) && (
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  In Progress
                                </Typography>
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {project.category_name === 'Water & Sanitation' && (
                                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600 }}>
                                  On track
                                </Typography>
                              )}
                              {project.category_name === 'Renewable Energy' && (
                                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 600 }}>
                                  Excellent
                                </Typography>
                              )}
                              {project.category_name === 'Environment' && (
                                <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 600 }}>
                                  In progress
                                </Typography>
                              )}
                              {(!project.category_name || !['Water & Sanitation', 'Renewable Energy', 'Environment'].includes(project.category_name)) && (
                                <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600 }}>
                                  Active
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Progress Section */}
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              mb: 1
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: colors.text,
                                fontWeight: 600
                              }}>
                                Progress
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: colors.text,
                                fontWeight: 700
                              }}>
                                {project.category_name === 'Water & Sanitation' ? '85%' :
                                 project.category_name === 'Renewable Energy' ? '92%' :
                                 project.category_name === 'Environment' ? '70%' :
                                 project.status === 'completed' ? '100%' :
                                 project.status === 'ongoing' ? '65%' : '25%'}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              height: 6,
                              backgroundColor: colors.borderLight,
                              borderRadius: 3,
                              overflow: 'hidden'
                            }}>
                              <Box sx={{
                                height: '100%',
                                width: project.category_name === 'Water & Sanitation' ? '85%' :
                                       project.category_name === 'Renewable Energy' ? '92%' :
                                       project.category_name === 'Environment' ? '70%' :
                                       project.status === 'completed' ? '100%' :
                                       project.status === 'ongoing' ? '65%' : '25%',
                                backgroundColor: project.category_name === 'Water & Sanitation' ? '#4CAF50' :
                                                project.category_name === 'Renewable Energy' ? '#2196F3' :
                                                project.category_name === 'Environment' ? '#FF9800' :
                                                colors.primary,
                                borderRadius: 3,
                                transition: 'width 0.3s ease'
                              }} />
                            </Box>
                          </Box>

                          {/* Learn More Button */}
                          <Button
                            variant="contained"
                            endIcon={<ArrowForward />}
                            fullWidth
                            sx={{
                              backgroundColor: project.category_name === 'Water & Sanitation' ? '#4CAF50' :
                                              project.category_name === 'Renewable Energy' ? '#2196F3' :
                                              project.category_name === 'Environment' ? '#FF9800' :
                                              colors.primary,
                              color: 'white',
                              fontWeight: 600,
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.9rem',
                              '&:hover': {
                                backgroundColor: project.category_name === 'Water & Sanitation' ? '#45a049' :
                                                project.category_name === 'Renewable Energy' ? '#1976d2' :
                                                project.category_name === 'Environment' ? '#f57c00' :
                                                colors.primaryDark,
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            Learn More
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </Grid>
              ))}
            </Grid>

          </motion.div>
        )}
      </Container>
      <JoinMovement/>
      <Footer/>
    </Box>
  );
};

export default PublicProjectsDisplay;