import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Loader } from 'lucide-react';
import { motion, AnimatePresence,useReducedMotion } from 'framer-motion';

const FeaturedProjectsSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
    const prefersReducedMotion = useReducedMotion();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track screen size changes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Detect theme from document body class
  useEffect(() => {
    const detectTheme = () => {
      const bodyClass = document.body.className;
      setIsDarkMode(bodyClass.includes('theme-dark'));
    };

    detectTheme();

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Fallback projects in case API fails
  const fallbackProjects = [
    {
      id: 'fallback-1',
      title: 'Community Tree Planting Initiative',
      short_description: 'Restoring green spaces and combating climate change through community-led tree planting programs across urban areas.',
      category_name: 'ENVIRONMENTAL',
      featured_image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
      is_featured: true,
      is_hidden: false
    },
    {
      id: 'fallback-2',
      title: 'Clean Water Access Project',
      short_description: 'Providing sustainable clean water solutions to underserved communities through innovative filtration systems.',
      category_name: 'SUSTAINABILITY',
      featured_image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80',
      is_featured: true,
      is_hidden: false
    },
    {
      id: 'fallback-3',
      title: 'Youth Environmental Education',
      short_description: 'Empowering the next generation with environmental knowledge and practical conservation skills.',
      category_name: 'EDUCATION',
      featured_image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
      is_featured: true,
      is_hidden: false
    }
  ];

  // Fetch featured projects from API
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${API_BASE}/projects?is_featured=true&is_hidden=false`, {
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
        
        let projectsArray = [];
        if (data.success && Array.isArray(data.data)) {
          projectsArray = data.data;
        } else if (Array.isArray(data)) {
          projectsArray = data;
        }

        const featuredProjects = projectsArray
          .filter(p => p.is_featured && !p.is_hidden)
          .slice(0, 3);

        // Use fetched projects if available, otherwise use fallback
        if (featuredProjects.length > 0) {
          setProjects(featuredProjects);
          setError(null);
        } else {
          console.warn('No projects returned from API, using fallback projects');
          setProjects(fallbackProjects);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching featured projects:', err);
        console.log('Using fallback projects due to API error');
        setProjects(fallbackProjects);
        setError(null); // Don't show error, just use fallback
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  const theme = {
    dark: {
      bg: '#000000',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      accent: '#facf3c',
      primary: '#0a451c',
      cardBg: '#0a0a0a',
      overlayStart: 'rgba(0,0,0,0.7)',
      overlayEnd: 'rgba(0,0,0,0.9)',
      mainOverlay: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
      sideOverlay: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, transparent 100%)',
      divider: 'rgba(255,255,255,0.1)',
      border: 'rgba(255,255,255,0.1)'
    },
    light: {
      bg: '#f9fafb',
      text: '#0a451c',
      textSecondary: '#4b5563',
      accent: '#facf3c',
      primary: '#0a451c',
      cardBg: '#ffffff',
      overlayStart: 'rgba(10,69,28,0.85)',
      overlayEnd: 'rgba(10,69,28,0.95)',
      mainOverlay: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
      sideOverlay: 'linear-gradient(to top, rgba(10,69,28,0.88) 0%, rgba(10,69,28,0.65) 50%, transparent 100%)',
      divider: 'rgba(10,69,28,0.1)',
      border: 'rgba(10,69,28,0.1)'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % projects.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80';
    if (imagePath.startsWith('http')) return imagePath;
    const STATIC_URL = process.env.REACT_APP_STATIC_URL || '';
    return `${STATIC_URL}${imagePath}`;
  };

  const sideProjects = projects.filter((_, index) => index !== currentSlide).slice(0, 2);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} color={colors.accent} style={{
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ 
            color: colors.textSecondary, 
            marginTop: '16px',
            fontSize: '14px' 
          }}>
            Loading featured projects...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div style={{ 
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <p style={{ 
            color: colors.text, 
            fontSize: '18px',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Unable to load featured projects
          </p>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: '14px' 
          }}>
            {error}
          </p>
        </div>
      </motion.div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            color: colors.text, 
            fontSize: '18px',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            No featured projects available
          </p>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: '14px' 
          }}>
            Check back soon for updates
          </p>
        </div>
      </motion.div>
    );
  }

  const mainProject = projects[currentSlide];

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 12px' : '0 20px' }}>
        {/* Section Header */}
           <motion.div 
                 initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                 whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: '-50px' }}
                 transition={{ duration: 0.5 }}
                 style={{ 
                   textAlign: 'center', 
                   marginBottom: isMobile ? '32px' : '60px',
                   padding: isMobile ? '0 8px' : '0'
                 }}
               >
                 <h2
                   style={{
                     fontSize: isMobile ? '24px' : isTablet ? '32px' : 'clamp(2rem, 4vw, 2.8rem)',
                     fontWeight: '600',
                     color: colors.black,
                     marginBottom: '12px',
                     lineHeight: '1.2',
                     wordWrap: 'break-word',
                     hyphens: 'auto'
                   }}
                 >
                   Transforming <span style={{ color: colors.primary }}>Communities</span>
                 </h2>
                 <p
                   style={{
                     fontSize: isMobile ? '15px' : '18px',
                     color: colors.textSecondary,
                     maxWidth: isMobile ? '100%' : '500px',
                     margin: '0 auto',
                     lineHeight: '1.5',
                     wordWrap: 'break-word',
                     padding: isMobile ? '0 4px' : '0'
                   }}
                 >
                   Stay informed about our environmental initiatives
                 </p>
               </motion.div>



        {/* Main Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px', once: false }}
          transition={{ duration: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: (window.innerWidth >= 1024 && !isMobile) ? '2fr 1fr' : '1fr',
            gap: isMobile ? '16px' : '24px',
            minHeight: isMobile ? 'auto' : '600px'
          }}
        >
          {/* Main Featured Project */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                height: isMobile ? '500px' : (window.innerWidth >= 1024 ? '600px' : '500px'),
                backgroundColor: colors.cardBg,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
            >
              {/* Image */}
              <motion.div 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${getImageUrl(mainProject.featured_image)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.6s ease'
                }}
              />

              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '70%',
                background: colors.mainOverlay
              }} />

              {/* Content */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: isMobile ? '24px' : (window.innerWidth >= 768 ? '48px' : '24px'),
                  zIndex: 2
                }}
              >
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{
                    color: colors.accent,
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    marginBottom: isMobile ? '12px' : '16px',
                    textShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.2)',
                    textTransform: 'uppercase'
                  }}
                >
                  {mainProject.category_name || mainProject.categoryName || 'FEATURED PROJECT'}
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  style={{
                    fontSize: isMobile ? '1.5rem' : (window.innerWidth >= 768 ? '2.5rem' : '1.75rem'),
                    fontWeight: 600,
                    margin: '0 0 16px 0',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: isDarkMode ? '#ffffff' : '#ffffff',
                    textShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {mainProject.title}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  style={{
                    color: isDarkMode ? colors.textSecondary : 'rgba(255,255,255,0.9)',
                    fontSize: isMobile ? '14px' : '16px',
                    marginBottom: isMobile ? '24px' : '32px',
                    maxWidth: '600px',
                    lineHeight: 1.6,
                    textShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {mainProject.short_description || mainProject.description?.substring(0, 150) + '...' || ''}
                </motion.p>
                <motion.button 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(event) => handleProjectClick(mainProject, event)}
                  style={{
                    color: isDarkMode ? colors.text : '#ffffff',
                    border: isDarkMode ? `1px solid ${colors.text}` : '1px solid rgba(255,255,255,0.8)',
                    backgroundColor: isDarkMode ? 'transparent' : 'rgba(255,255,255,0.1)',
                    padding: isMobile ? '10px 24px' : '12px 32px',
                    borderRadius: '8px',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.accent;
                    e.target.style.borderColor = colors.accent;
                    e.target.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = isDarkMode ? 'transparent' : 'rgba(255,255,255,0.1)';
                    e.target.style.borderColor = isDarkMode ? colors.text : 'rgba(255,255,255,0.8)';
                    e.target.style.color = isDarkMode ? colors.text : '#ffffff';
                  }}
                >
                  EXPLORE PROJECT <ArrowRight size={16} />
                </motion.button>
              </motion.div>

              {/* Navigation Arrows */}
              {projects.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    bottom: isMobile ? '20px' : (window.innerWidth >= 768 ? '40px' : '20px'),
                    right: isMobile ? '20px' : (window.innerWidth >= 768 ? '40px' : '20px'),
                    display: 'flex',
                    gap: isMobile ? '12px' : '16px',
                    zIndex: 3
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevSlide}
                    style={{
                      width: isMobile ? '40px' : '48px',
                      height: isMobile ? '40px' : '48px',
                      border: `1px solid ${colors.text}`,
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: colors.text,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.accent;
                      e.target.style.borderColor = colors.accent;
                      e.target.style.color = '#000000';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = colors.text;
                      e.target.style.color = colors.text;
                    }}
                  >
                    <ChevronLeft size={isMobile ? 20 : 24} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextSlide}
                    style={{
                      width: isMobile ? '40px' : '48px',
                      height: isMobile ? '40px' : '48px',
                      border: `1px solid ${colors.text}`,
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: colors.text,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.accent;
                      e.target.style.borderColor = colors.accent;
                      e.target.style.color = '#000000';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = colors.text;
                      e.target.style.color = colors.text;
                    }}
                  >
                    <ChevronRight size={isMobile ? 20 : 24} />
                  </motion.button>
                </motion.div>
              )}

              {/* Slide Indicators */}
              {projects.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: isMobile ? '20px' : '40px',
                    left: isMobile ? '20px' : '40px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 3
                  }}
                >
                  {projects.map((_, index) => (
                    <motion.div
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        width: currentSlide === index ? (isMobile ? '32px' : '40px') : '8px',
                        backgroundColor: currentSlide === index ? colors.accent : colors.textSecondary
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        height: '2px',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Side Projects Grid */}
          {sideProjects.length > 0 && !isMobile && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {sideProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ margin: '-50px', once: false }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  onClick={(event) => handleProjectClick(project, event)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: window.innerWidth >= 1024 ? '288px' : '250px',
                    backgroundColor: colors.cardBg,
                borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: isDarkMode ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('.project-image');
                    const overlay = e.currentTarget.querySelector('.project-overlay');
                    if (img) img.style.transform = 'scale(1.1)';
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('.project-image');
                    const overlay = e.currentTarget.querySelector('.project-overlay');
                    if (img) img.style.transform = 'scale(1)';
                    if (overlay) overlay.style.opacity = '1';
                  }}
                >
                  <div
                    className="project-image"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${getImageUrl(project.featured_image)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.6s ease'
                    }}
                  />

                  {/* Bottom gradient overlay like main card */}
                  <div
                    className="project-overlay"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '70%',
                      background: colors.sideOverlay,
                      opacity: 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  />

                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    zIndex: 2
                  }}>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      style={{
                        color: colors.accent,
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        marginBottom: '8px',
                        textShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.2)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {project.category_name || project.categoryName || 'PROJECT'}
                    </motion.div>
                    <motion.h5 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.35 + index * 0.1, duration: 0.5 }}
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        margin: 0,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                        color: isDarkMode ? '#ffffff' : '#ffffff',
                        textShadow: isDarkMode ? 'none' : '0 2px 3px rgba(0,0,0,0.3)'
                      }}
                    >
                      {project.title}
                    </motion.h5>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px', once: false }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginTop: isMobile ? '40px' : '64px',
            paddingTop: isMobile ? '32px' : '48px',
            borderTop: `1px solid ${colors.divider}`
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try {
                navigate('/programs');
              } catch (error) {
                console.error('Navigation to programs failed:', error);
              }
            }}
            style={{
              color: colors.text,
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 400,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = colors.accent;
              const icon = e.target.querySelector('svg');
              if (icon) icon.style.transform = 'translateX(8px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = colors.text;
              const icon = e.target.querySelector('svg');
              if (icon) icon.style.transform = 'translateX(0)';
            }}
          >
            VIEW ALL PROJECTS
            <ArrowRight size={isMobile ? 16 : 20} style={{ transition: 'transform 0.3s ease' }} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedProjectsSection;