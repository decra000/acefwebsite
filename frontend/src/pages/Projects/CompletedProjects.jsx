import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardMedia,
  Button, Chip, CircularProgress, Container, 
  IconButton, Stack
} from '@mui/material';
import {
  ArrowForward, ArrowBack, Visibility, LocationOn, 
  Star, CheckCircle, Assessment, TrendingUp, 
  NatureOutlined, ChevronRight
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL} from '../../config';

const API_BASE = API_URL;

const CompletedProjectsDisplay = ({ initialCategoryFilter = null }) => {
  const navigate = useNavigate();
  const { colors, isDarkMode } = useTheme();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
    const filterRef = useRef();
  
  const carouselRef = useRef(null);
  const itemWidth = 320; // Width of each project card plus margin
  const visibleItems = 4.5; // Show 4.5 items as requested

  // Color palette matching design system
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
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };

  // Placeholder data for when API data is not available - ONLY COMPLETED PROJECTS
  const placeholderProjects = [
    {
      id: 'placeholder-1',
      title: 'Clean Water Initiative - Lake Victoria',
      short_description: 'Successfully provided sustainable clean water solutions to 15 rural communities around Lake Victoria through innovative filtration systems.',
      category_name: 'Water & Sanitation',
      status: 'completed',
      location: 'Kisumu County, Kenya',
      is_featured: true,
      featured_image: null,
      person_name: 'Sarah Wanjiku'
    },
    {
      id: 'placeholder-2',
      title: 'Community Reforestation Program',
      short_description: 'Successfully engaged local communities in large-scale tree planting initiatives, planting over 50,000 trees to combat deforestation.',
      category_name: 'Environment',
      status: 'completed',
      location: 'Mount Kenya Region',
      is_featured: true,
      featured_image: null,
      person_name: 'Grace Muthoni'
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
      person_name: 'James Kiprotich'
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
      person_name: 'Mary Nyambura'
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
      person_name: 'Hassan Omar'
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
      person_name: 'Peter Ochieng'
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

  // Data fetching effects
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
        ]);
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
        if (completedProjects.length > 0) {
          setProjects(completedProjects);
        } else {
          setProjects(placeholderProjects);
        }
      } else if (Array.isArray(data)) {
        // Filter to show only completed projects
        const completedProjects = data.filter(project => project.status === 'completed');
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

  const goToProjectsCatalogue = () => {
    navigate('/projectscatalogue');
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.planning;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Carousel navigation
  const canGoNext = currentIndex < projects.length - Math.floor(visibleItems);
  const canGoPrev = currentIndex > 0;

  const goNext = () => {
    if (canGoNext && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goPrev = () => {
    if (canGoPrev && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Auto-scroll functionality (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (canGoNext) {
        goNext();
      } else {
        setCurrentIndex(0);
      }
    }, 8000); // Auto-scroll every 8 seconds

    return () => clearInterval(interval);
  }, [canGoNext, currentIndex]);

  if (loading) {
    return (
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
          Loading completed projects...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: designColors.white,
      fontFamily: '"Inter", sans-serif',
      position: 'relative',
      py: 6
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
            ml: '96px' // 1 inch margin (96px = 1 inch at 96 DPI)
          }}>
            {/* Left side - Title and description */}
            <Box>
              <Typography 
                variant="h3"
                sx={{ 
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: designColors.primary,
                  mb: 2,
                  letterSpacing: '-0.02em'
                }}
              >
                Recently Completed Projects
              </Typography>
              
              <Typography 
                sx={{ 
                  color: designColors.textSecondary,
                  fontWeight: 400,
                  fontSize: '1.1rem',
                  maxWidth: '500px',
                  lineHeight: 1.6,
                  mb: 3
                }}
              >
Our successfully completed projects showcase the tremendous impact we've created across Africa. Each project represents meaningful change and sustainable solutions for the communities we serve.              </Typography>

              {/* Stats */}
              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 700, 
                    color: designColors.primary 
                  }}>
                    {projects.length}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    color: designColors.textSecondary,
                    fontWeight: 500
                  }}>
                    Completed Projects
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 700, 
                    color: designColors.accent 
                  }}>
                    {projects.filter(p => p.is_featured).length}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    color: designColors.textSecondary,
                    fontWeight: 500
                  }}>
                    Featured
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 700, 
                    color: designColors.secondary 
                  }}>
                    {categories.length}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    color: designColors.textSecondary,
                    fontWeight: 500
                  }}>
                    Categories
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Right side - Go to Projects Catalogue Button */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2
            }}>
              <Button
                variant="contained"
                onClick={goToProjectsCatalogue}
                endIcon={<ChevronRight />}
                sx={{
                  backgroundColor: designColors.primary,
                  color: designColors.white,
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: `0 4px 15px ${designColors.primary}40`,
                  '&:hover': {
                    backgroundColor: designColors.primaryLight,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${designColors.primary}60`
                  }
                }}
              >
                Go to Projects Catalogue
              </Button>
              
              {/* Navigation arrows */}
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={goPrev}
                  disabled={!canGoPrev || isTransitioning}
                  sx={{
                    backgroundColor: canGoPrev ? designColors.surface : designColors.gray200,
                    color: canGoPrev ? designColors.text : designColors.gray400,
                    border: `1px solid ${designColors.border}`,
                    '&:hover': {
                      backgroundColor: canGoPrev ? designColors.gray100 : designColors.gray200,
                    },
                    '&:disabled': {
                      opacity: 0.5
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                
                <IconButton
                  onClick={goNext}
                  disabled={!canGoNext || isTransitioning}
                  sx={{
                    backgroundColor: canGoNext ? designColors.surface : designColors.gray200,
                    color: canGoNext ? designColors.text : designColors.gray400,
                    border: `1px solid ${designColors.border}`,
                    '&:hover': {
                      backgroundColor: canGoNext ? designColors.gray100 : designColors.gray200,
                    },
                    '&:disabled': {
                      opacity: 0.5
                    }
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </motion.div>

        {/* Carousel Container */}
        <Box sx={{ 
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          ml: '96px' // 1 inch margin (96px = 1 inch at 96 DPI)
        }}>
          <motion.div
            ref={carouselRef}
            style={{
              display: 'flex',
              transform: `translateX(-${currentIndex * itemWidth}px)`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              gap: '24px'
            }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                style={{
                  minWidth: '296px',
                  flexShrink: 0
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  onClick={(event) => handleProjectClick(project, event)}
                  sx={{
                    height: '580px', // Fixed height for all cards
                    width: '296px', // Fixed width for all cards
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: designColors.white,
                    border: `1px solid ${designColors.border}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0, // Prevent shrinking
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 30px ${designColors.primary}20`,
                      borderColor: `${designColors.primary}60`
                    }
                  }}
                >
                  {/* Hero Image Section */}
                  <Box sx={{
                    height: 240, // Fixed height for image section
                    position: 'relative',
                    flexShrink: 0,
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
                    alignItems: 'flex-end',
                    color: 'white'
                  }}>
                    {project.featured_image && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)'
                      }} />
                    )}

                    {/* Person name badge at bottom */}
                    {project.person_name && (
                      <Box sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        backgroundColor: designColors.secondary,
                        color: designColors.text,
                        px: 2,
                        py: 1,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        zIndex: 2
                      }}>
                        {project.person_name}
                      </Box>
                    )}

                    {/* Status Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: getStatusInfo(project.status).bgColor,
                      color: getStatusInfo(project.status).color,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backdropFilter: 'blur(10px)',
                      zIndex: 2
                    }}>
                      {React.cloneElement(getStatusInfo(project.status).icon, { 
                        sx: { fontSize: 14 }
                      })}
                      <Typography sx={{ 
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}>
                        {getStatusInfo(project.status).label.toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Featured Badge */}
                    {project.is_featured && (
                      <Box sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        backgroundColor: designColors.primary,
                        color: designColors.white,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        zIndex: 2
                      }}>
                        <Star sx={{ fontSize: 14 }} />
                        <Typography sx={{ 
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}>
                          FEATURED
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ 
                    p: 3, 
                    height: '340px', // Fixed height for content section (580 - 240 = 340)
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between', // Distributes content evenly
                    overflow: 'hidden' // Prevent content overflow
                  }}>
                    <Box sx={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
                      {/* Category */}
                      <Chip
                        label={project.category_name || 'Project'}
                        size="small"
                        sx={{
                          backgroundColor: `${designColors.primary}15`,
                          color: designColors.primary,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          mb: 2,
                          alignSelf: 'flex-start'
                        }}
                      />

                      {/* Project Title */}
                      <Typography sx={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: designColors.text,
                        mb: 2,
                        lineHeight: 1.3,
                        height: '2.6em', // Fixed height for exactly 2 lines
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
                        lineHeight: 1.5,
                        mb: 2,
                        height: '4.5em', // Fixed height for exactly 3 lines
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontSize: '0.85rem'
                      }}>
                        {truncateText(project.short_description || project.description, 120)}
                      </Typography>
                    </Box>

                    <Box sx={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Location */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 2,
                        height: '24px', // Fixed height for location section
                        overflow: 'hidden'
                      }}>
                        {project.location ? (
                          <>
                            <LocationOn sx={{ fontSize: 16, mr: 0.5, color: designColors.textSecondary }} />
                            <Typography sx={{
                              color: designColors.textSecondary,
                              fontWeight: 500,
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {project.location}
                            </Typography>
                          </>
                        ) : (
                          <Box sx={{ height: '16px' }} /> // Empty space if no location
                        )}
                      </Box>

                      {/* Learn More Button */}
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                        fullWidth
                        sx={{
                          borderColor: designColors.primary,
                          color: designColors.primary,
                          fontWeight: 600,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          py: 1.2,
                          '&:hover': {
                            backgroundColor: designColors.primary,
                            color: designColors.white,
                            transform: 'translateY(-1px)',
                            borderColor: designColors.primary
                          }
                        }}
                      >
                        Read Story
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Box>

        {/* Pagination dots */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mt: 4,
          gap: 1
        }}>
          {Array.from({ length: Math.max(1, projects.length - Math.floor(visibleItems) + 1) }).map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setCurrentIndex(index);
                }
              }}
              sx={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === index ? designColors.primary : designColors.gray300,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: currentIndex === index ? designColors.primaryLight : designColors.gray400
                }
              }}
            />
          ))}
        </Box>
      </Container>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .carousel-container {
            padding: 0 16px;
          }
        }
      `}</style>
    </Box>
  );
};

export default CompletedProjectsDisplay;