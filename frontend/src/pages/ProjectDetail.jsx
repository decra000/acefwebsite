import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Chip, Avatar, Paper,
  Button, CircularProgress, Alert, IconButton, Stack,
  LinearProgress, Divider
} from '@mui/material';
import {
  LocationOn, DateRange, Category, Public,
  ArrowBack, Share, Favorite, Timeline, 
  TrendingUp, Analytics, Psychology, 
  NatureOutlined, GroupsOutlined, ViewModule
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../theme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_URL } from '../config';

const API_BASE = API_URL;

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  const [project, setProject] = useState(location.state?.project || null);
  const [loading, setLoading] = useState(!project);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);

  // Improved navigation tracking
  const [backPath, setBackPath] = useState('/projects');
  const [backLabel, setBackLabel] = useState('Projects');
  
 

  const sdgGoalsInfo = {
    1: { title: 'No Poverty', color: '#E5243B', icon: '🏠' },
    2: { title: 'Zero Hunger', color: '#DDA63A', icon: '🌾' },
    3: { title: 'Good Health and Well-being', color: '#4C9F38', icon: '❤️' },
    4: { title: 'Quality Education', color: '#C5192D', icon: '📚' },
    5: { title: 'Gender Equality', color: '#FF3A21', icon: '⚖️' },
    6: { title: 'Clean Water and Sanitation', color: '#26BDE2', icon: '💧' },
    7: { title: 'Affordable and Clean Energy', color: '#FCC30B', icon: '⚡' },
    13: { title: 'Climate Action', color: '#3F7E44', icon: '🌍' },
    14: { title: 'Life Below Water', color: '#0A97D9', icon: '🌊' },
    15: { title: 'Life on Land', color: '#56C02B', icon: '🌳' },
  };

  useEffect(() => {
    if (!project && id) {
      fetchProject();
    }
    setTimeout(() => setProgressVisible(true), 1000);
  }, [id, project]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/projects/${id}`, {
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
      
      if (data.success) {
        setProject(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Go back to where the user came from
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSeeMoreProjects = () => {
    navigate('/projectscatalogue');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const calculateImpactScore = (metrics) => {
    if (!metrics || Object.keys(metrics).length === 0) return 75;
    const values = Object.values(metrics);
    const total = values.reduce((sum, val) => sum + (parseInt(val) || 1), 0);
    return Math.min(Math.max((total / values.length) * 10, 20), 100);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ color: colors.primary, mb: 3 }} 
          />
          <Typography variant="h6" sx={{ 
            color: colors.textSecondary,
            fontWeight: 500
          }}>
            Loading Project Details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: colors.background,
        p: 4
      }}>

        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: `${colors.error}15`,
              color: colors.error,
              border: `1px solid ${colors.error}30`,
            }}
          >
            {error || 'Project not found'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{ 
              backgroundColor: colors.primary,
              color: colors.white,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              '&:hover': { 
                backgroundColor: colors.primaryDark,
              }
            }}
          >
            Back to {backLabel}
          </Button>
        </Container>
      </Box>
    );
  }

  const impactScore = calculateImpactScore(project.impact_metrics);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: colors.background,
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Navigation Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ 
            p: 2,
            mb: 4,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderLight}`,
            boxShadow: 'none'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleGoBack}
                  sx={{
                    color: colors.text,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: `${colors.primary}10`,
                    }
                  }}
                >
                  {backLabel}
                </Button>
                
                {/* Show divider and "See More Projects" only if not already going back to projects */}
                {backPath !== '/projects' && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Button
                      startIcon={<ViewModule />}
                      onClick={handleSeeMoreProjects}
                      sx={{
                        color: colors.textSecondary,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: `${colors.secondary}10`,
                          color: colors.secondary
                        }
                      }}
                    >
                      See More Projects
                    </Button>
                  </>
                )}
              </Box>

              <Stack direction="row" spacing={1}>
                <IconButton 
                  onClick={handleShare}
                  sx={{ 
                    color: colors.textSecondary,
                    '&:hover': { 
                      backgroundColor: `${colors.primary}10`,
                      color: colors.primary
                    }
                  }}
                >
                  <Share />
                </IconButton>
                <IconButton 
                  onClick={() => setLiked(!liked)}
                  sx={{ 
                    color: liked ? colors.error : colors.textSecondary,
                    '&:hover': { 
                      backgroundColor: `${colors.error}10`,
                      color: colors.error
                    }
                  }}
                >
                  <Favorite />
                </IconButton>
              </Stack>
            </Box>
          </Paper>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Paper sx={{ 
            p: 6,
            mb: 6,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 4,
            boxShadow: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Gradient accent */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
            }} />
            
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 800,
                color: colors.text,
                mb: 3,
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.2
              }}
            >
              {project.title}
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 4 }}>
              {project.category_name && (
                <Chip
                  icon={<Category />}
                  label={project.category_name}
                  sx={{ 
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary,
                    border: `1px solid ${colors.primary}30`,
                    fontWeight: 600
                  }}
                />
              )}
              {project.country_name && (
                <Chip
                  icon={<Public />}
                  label={project.country_name}
                  sx={{ 
                    backgroundColor: `${colors.secondary}15`,
                    color: colors.secondary,
                    border: `1px solid ${colors.secondary}30`,
                    fontWeight: 600
                  }}
                />
              )}
              {project.is_featured && (
                <Chip
                  label="Featured Project"
                  sx={{ 
                    backgroundColor: colors.secondary,
                    color: colors.black,
                    fontWeight: 700
                  }}
                />
              )}
            </Stack>

            {/* Impact Score */}
            <Box sx={{ 
              p: 4,
              backgroundColor: `${colors.primary}08`,
              borderRadius: 3,
              border: `1px solid ${colors.primary}20`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 2, color: colors.primary }} />
                <Typography variant="h6" sx={{ 
                  color: colors.text,
                  fontWeight: 700
                }}>
                  Project Impact Score
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressVisible ? impactScore : 0}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: `${colors.borderLight}`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: colors.primary,
                        borderRadius: 6,
                        transition: 'width 2s ease-in-out',
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ 
                    color: colors.textSecondary,
                    mt: 1,
                    fontWeight: 500
                  }}>
                    Environmental Impact Rating
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800,
                  color: colors.primary
                }}>
                  {Math.round(impactScore)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Featured Image */}
        {project.featured_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Paper sx={{ 
              mb: 6,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: colors.surface,
              boxShadow: 'none',
              border: `1px solid ${colors.borderLight}`
            }}>
              <Box
                component="img"
                src={project.featured_image.startsWith('http') 
                  ? project.featured_image 
                  : `${process.env.REACT_APP_STATIC_URL || ''}${project.featured_image}`}
                alt={project.title}
                sx={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </Paper>
          </motion.div>
        )}

        <Grid container spacing={6}>
                        <Header/>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Paper sx={{
                p: 4,
                mb: 4,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: 3,
                boxShadow: 'none'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Psychology sx={{ mr: 2, color: colors.primary, fontSize: 28 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: colors.text
                  }}>
                    Project Overview
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.8, 
                  fontSize: '1.1rem',
                  color: colors.textSecondary
                }}>
                  {project.description}
                </Typography>
              </Paper>
            </motion.div>

            {/* Impact Metrics */}
            {project.impact_metrics && Object.keys(project.impact_metrics).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Paper sx={{
                  p: 4,
                  mb: 4,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 3,
                  boxShadow: 'none'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Analytics sx={{ mr: 2, color: colors.secondary, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: colors.text
                    }}>
                      Impact Metrics
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {Object.entries(project.impact_metrics).map(([key, value], index) => (
                      <Grid item xs={6} sm={4} key={key}>
                        <Paper sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          backgroundColor: `${colors.primary}05`,
                          border: `1px solid ${colors.primary}15`,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: colors.primary,
                          }
                        }}>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 800,
                            color: colors.primary,
                            mb: 1
                          }}>
                            {value}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: colors.textSecondary,
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {key.replace(/_/g, ' ')}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </motion.div>
            )}

            {/* Testimonial */}
            {project.testimonial_text && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Paper sx={{
                  p: 4,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 3,
                  boxShadow: 'none'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <GroupsOutlined sx={{ mr: 2, color: colors.secondary, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: colors.text
                    }}>
                      Community Voice
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 4,
                    backgroundColor: `${colors.secondary}10`,
                    borderLeft: `4px solid ${colors.secondary}`,
                    borderRadius: 2
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontStyle: 'italic', 
                      mb: 3, 
                      color: colors.text,
                      lineHeight: 1.6
                    }}>
                      "{project.testimonial_text}"
                    </Typography>
                    {(project.testimonial_author || project.testimonial_position) && (
                      <Box sx={{ pt: 2 }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 700,
                          color: colors.text
                        }}>
                          {project.testimonial_author}
                        </Typography>
                        {project.testimonial_position && (
                          <Typography variant="body2" sx={{ 
                            color: colors.textSecondary,
                            fontWeight: 500
                          }}>
                            {project.testimonial_position}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Project Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Paper sx={{
                p: 3,
                mb: 3,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: 3,
                boxShadow: 'none'
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: colors.text,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <NatureOutlined sx={{ mr: 2, color: colors.primary }} />
                  Project Details
                </Typography>
                
                {project.location && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: colors.textMuted, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ 
                        color: colors.textMuted,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1
                      }}>
                        Location
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                      color: colors.text, 
                      fontWeight: 600,
                      ml: 3
                    }}>
                      {project.location}
                    </Typography>
                  </Box>
                )}

                {(project.start_date || project.end_date) && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Timeline sx={{ mr: 1, color: colors.textMuted, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ 
                        color: colors.textMuted,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1
                      }}>
                        Timeline
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                      color: colors.text, 
                      fontWeight: 600,
                      ml: 3
                    }}>
                      {formatDate(project.start_date)}
                      {project.end_date && ` - ${formatDate(project.end_date)}`}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3, borderColor: colors.borderLight }} />
                
                {/* Action Buttons Stack */}
                <Stack spacing={2}>
                 

                  {/* Show "See More Projects" button only if not coming from projects page */}
                  {(!location.state?.from || location.state.from !== '/projects') && (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ViewModule />}
                      onClick={handleSeeMoreProjects}
                      sx={{
                        borderColor: colors.secondary,
                        color: colors.secondary,
                        fontWeight: 600,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': { 
                          backgroundColor: `${colors.secondary}10`,
                          borderColor: colors.secondary
                        }
                      }}
                    >
                      See More Projects
                    </Button>
                  )}
                </Stack>
              </Paper>
            </motion.div>

            {/* SDG Goals */}
            {project.sdg_goals && project.sdg_goals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Paper sx={{
                  p: 3,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 3,
                  boxShadow: 'none'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: colors.text,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Public sx={{ mr: 2, color: colors.primary }} />
                    UN SDG Goals
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ 
                      color: colors.textSecondary,
                      fontWeight: 600,
                      mb: 2
                    }}>
                      Supporting {project.sdg_goals.length} Global Goals
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressVisible ? (project.sdg_goals.length / 17) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.borderLight,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: colors.secondary,
                          borderRadius: 4,
                          transition: 'width 2s ease-in-out',
                        }
                      }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    {project.sdg_goals.map((goal, index) => (
                      <Box key={goal} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2,
                        backgroundColor: `${sdgGoalsInfo[goal]?.color || colors.primary}10`,
                        borderRadius: 2,
                        border: `1px solid ${sdgGoalsInfo[goal]?.color || colors.primary}20`
                      }}>
                        <Avatar
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2,
                            backgroundColor: sdgGoalsInfo[goal]?.color || colors.primary,
                            color: colors.white,
                            fontSize: '0.9rem',
                            fontWeight: 700
                          }}
                        >
                          {goal}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: colors.text,
                            mb: 0.5
                          }}>
                            SDG {goal}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: colors.textSecondary,
                            fontSize: '0.85rem'
                          }}>
                            {sdgGoalsInfo[goal]?.title || 'Sustainable Development Goal'}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '1.2rem' }}>
                          {sdgGoalsInfo[goal]?.icon}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </motion.div>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProjectDetail;