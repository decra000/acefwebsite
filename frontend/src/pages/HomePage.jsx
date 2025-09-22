import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Calendar, Building2, MapPin as LocationIcon, Calendar as CalendarIcon, Users, Award, ExternalLink, TreePine, Leaf, Globe, Target, Eye, Clock, User, Star, Play, CheckCircle, Circle, Sparkles, ArrowUpRight, X, Newspaper, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PartnerSlider from '../components/PartnerSlider'; 
import styles from '../styles/HomePage.module.css';
import JoinMovement from '../components/JoinMovement'; 
import FounderSection from '../pages/AboutUs/FounderSection';
import MailList from '../components/MailList';
import { useTheme } from '../theme';
import UltraRealisticNatureHero from '../pages/GetInvolved/GetInvolvedHero'
import { API_URL, STATIC_URL } from '../config';
import AcefAboutInfo from '../pages/AboutUs/acefAboutInfo';
import VideoSection from '../pages/Insights/VideoSection'; 
import ACEFHeroSection from '../components/HERO'; 
import EnvironmentalCharity from '../pages/Impact/Impactstats';
import AccreditationsSlider from '../components/AccreditationsSlider'; 
import PublicProjectsDisplay from '../pages/Projects/displayProjects';
import ProjectsDisplay from '../pages/Projects/ProjectsDisplay';
import LatestNewsSection from '../pages/Insights/LatestNewsSection';
import GlassButton from '../components/GlassButton'; 
import LatestEvent from '../pages/Events/LatestEvent';
import FeaturedTestimonial from '../pages/Testimonials/FeaturedTestimonial'; 
import ACEFHero from '../pages/ACEFHero';

const Homepage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { colors, isDarkMode, theme } = useTheme();
  
  // Projects state
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState(null);

  // SDG Goals information
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

  // Placeholder projects for fallback
  const placeholderProjects = [
    {
      id: 'placeholder-1',
      title: 'Clean Water Initiative - Lake Victoria',
      short_description: 'Providing sustainable clean water solutions to rural communities around Lake Victoria through innovative filtration systems.',
      category_name: 'Water & Sanitation',
      status: 'ongoing',
      location: 'Kisumu County, Kenya',
      is_featured: true,
      featured_image: null,
      progress: 85
    },
    {
      id: 'placeholder-2',
      title: 'Community Reforestation Program',
      short_description: 'Engaging local communities in large-scale tree planting initiatives to combat deforestation and promote biodiversity.',
      category_name: 'Environment',
      status: 'ongoing',
      location: 'Mount Kenya Region',
      is_featured: true,
      featured_image: null,
      progress: 70
    }
  ];

  // Store last visited path for navigation
  useEffect(() => {
    sessionStorage.setItem('lastVisitedPath', '/');
  }, []);

  // Fetch featured projects
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setLoadingProjects(true);
        
        const response = await fetch(`${API_URL}/projects`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const rawProjects = data.data || data || [];
        
        if (Array.isArray(rawProjects) && rawProjects.length > 0) {
          // Filter out hidden projects
          const visibleProjects = rawProjects.filter(project => !project.is_hidden);
          
          // Sort: featured projects first, then by date
          const sortedProjects = visibleProjects.sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });
          
          // Take up to 2 projects for minimalistic display
          setFeaturedProjects(sortedProjects.slice(0, 2));
        } else {
          // Use placeholder data when no projects available
          setFeaturedProjects(placeholderProjects);
        }
        
        setProjectError(null);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjectError(error.message);
        // Use placeholder data on error
        setFeaturedProjects(placeholderProjects);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);
      setIsScrolled(newScrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCardInteraction = (cardType, index, isEntering) => {
    setHoveredCard(isEntering ? `${cardType}-${index}` : null);
  };

  // Project navigation handlers
  const handleProjectClick = (project, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    sessionStorage.setItem('lastVisitedPath', '/');
    
    navigate(`/project/${project.id}`, { 
      state: { 
        project,
        from: '/',
        fromPath: '/'
      }
    });
  };

  const handleViewAllProjects = () => {
    sessionStorage.setItem('lastVisitedPath', '/');
    navigate('/projectscatalogue');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getProjectProgress = (project) => {
    if (project.progress !== undefined) return project.progress;
    
    // Calculate progress based on category and status
    if (project.status === 'completed') return 100;
    if (project.status === 'ongoing') {
      if (project.category_name === 'Water & Sanitation') return 85;
      if (project.category_name === 'Environment') return 70;
      if (project.category_name === 'Renewable Energy') return 92;
      return 65;
    }
    if (project.status === 'planning') return 25;
    return 50;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return colors.info;
      case 'completed': return colors.success;
      case 'planning': return colors.warning;
      default: return colors.primary;
    }
  };

  const getCategoryGradient = (categoryName) => {
    switch (categoryName) {
      case 'Water & Sanitation':
        return 'linear-gradient(135deg, #26BDE2 0%, #1976d2 100%)';
      case 'Renewable Energy':
        return 'linear-gradient(135deg, #FCC30B 0%, #FF9800 100%)';
      case 'Environment':
        return 'linear-gradient(135deg, #56C02B 0%, #4CAF50 100%)';
      case 'Waste Management':
        return 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)';
      case 'Agriculture':
        return 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)';
      case 'Marine Conservation':
        return 'linear-gradient(135deg, #0A97D9 0%, #1976d2 100%)';
      default:
        return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`;
    }
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case 'Water & Sanitation': return '💧';
      case 'Renewable Energy': return '⚡';
      case 'Environment': return '🌳';
      case 'Waste Management': return '♻️';
      case 'Agriculture': return '🌾';
      case 'Marine Conservation': return '🌊';
      default: return '🌍';
    }
  };

  return (
    <div 
      className={styles.homepage} 
      style={{ 
        position: 'relative',
        backgroundColor: colors.background,
        color: colors.text,
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <Header/>
      
      {/* Using imported Hero component */}
      <ACEFHero/>

      {/* Sections without animations */}
      <div
        style={{
          backgroundColor: colors.background,
          borderTop: `1px solid ${colors.border}20`
        }}
      >
        <AcefAboutInfo/>
      </div>

      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}05 100%)`,
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${colors.border}30`,
          borderBottom: `1px solid ${colors.border}30`
        }}
      >
        {/* Featured Project Section - Mobile Responsive */}
        <div
          style={{
            backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.surface,
            padding: "clamp(40px, 8vw, 80px) 0",
            borderTop: `1px solid ${colors.border}20`,
          }}
        >
          <div style={{ 
            maxWidth: "1300px", 
            margin: "0 auto", 
            padding: "0 clamp(15px, 4vw, 20px)" 
          }}>
            {/* Section Header */}
            <div style={{ textAlign: "center", marginBottom: "clamp(30px, 6vw, 60px)" }}>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 3rem)",
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: "16px",
                  lineHeight: "1.2",
                }}
              >
                Latest Initiative
              </h2>

              <p
                style={{
                  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                  color: colors.textSecondary,
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: "1.6",
                }}
              >
                Discover our ongoing initiatives creating sustainable environmental change
                across communities
              </p>
            </div>

            {/* One Featured Project - Mobile Responsive */}
            {loadingProjects ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: colors.textSecondary,
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: `3px solid ${colors.primary}30`,
                    borderTop: `3px solid ${colors.primary}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "16px",
                  }}
                />
                <p>Loading featured project...</p>
              </div>
            ) : (
              featuredProjects
                .slice(0, 1)
                .map((project) => (
                  <div
                    key={project.id}
                    className="featured-project-card"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "clamp(20px, 4vw, 30px)",
                      alignItems: "center",
                      backgroundColor: colors.background,
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: `1px solid ${colors.borderLight}`,
                      maxWidth: "1200px",
                      margin: "0 auto 50px auto",
                      transition: "all 0.3s ease",
                      padding: "clamp(20px, 4vw, 30px)",
                    }}
                  >
                    {/* Text Section */}
                    <div style={{ order: 1 }}>
                      <h3
                        style={{
                          fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
                          fontWeight: "700",
                          color: colors.text,
                          marginBottom: "16px",
                          lineHeight: "1.3",
                        }}
                      >
                        {project.title}
                      </h3>

                      <p
                        style={{
                          color: colors.textSecondary,
                          fontSize: "clamp(0.9rem, 2vw, 1rem)",
                          lineHeight: "1.6",
                          marginBottom: "0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 6,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {project.short_description || project.description}
                      </p>
                    </div>

                    {/* Image Section */}
                    <div
                      style={{
                        height: "clamp(200px, 30vw, 300px)",
                        background: project.featured_image
                          ? `url(${
                              project.featured_image.startsWith("http")
                                ? project.featured_image
                                : `${STATIC_URL || ""}${project.featured_image}`
                            })`
                          : getCategoryGradient(project.category_name),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "12px",
                        order: 2,
                      }}
                    />

                    {/* Actions Section */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "16px",
                        order: 3,
                      }}
                    >
                      <button
                        onClick={(e) => handleProjectClick(project, e)}
                        style={{
                          background: "transparent",
                          color: colors.primary,
                          border: `2px solid ${colors.primary}`,
                          padding: "12px 20px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "clamp(14px, 2.5vw, 15px)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colors.primary;
                          e.target.style.color = colors.white;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = colors.primary;
                        }}
                      >
                        More About
                      </button>

                      <button
                        onClick={() => navigate("/get-involved")}
                        style={{
                          background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                          color: colors.white,
                          border: "none",
                          padding: "12px 20px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "clamp(14px, 2.5vw, 15px)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = "0.9";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = "1";
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        Get Involved
                      </button>
                    </div>
                  </div>
                ))
            )}

            {/* View All Projects Button */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleViewAllProjects}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                  border: `2px solid ${colors.primary}`,
                  padding: "clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 28px)",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.primary;
                }}
              >
                View All Projects <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <EnvironmentalCharity/>
      </div>

      <div
        style={{
          backgroundColor: colors.surface,
          padding: 'clamp(40px, 8vw, 80px) 0'
        }}
      >
        <VideoSection/>
      </div>

      {/* Using imported News component */}
      <LatestNewsSection/>

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source
            src="/greenwater.mp4"
            type="video/mp4"
          />
        </video>

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(10, 10, 10, 0.6)',
            zIndex: 1,
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <FeaturedTestimonial
            title="Featured Testimonial"
            LatestNewsSection={LatestEvent}
            showCTA={true}
          />
        </div>
      </div>

      <div
        style={{
          background: `linear-gradient(135deg, ${colors.secondary}08 0%, ${colors.primary}06 100%)`,
          backdropFilter: 'blur(5px)',
          borderTop: `1px solid ${colors.border}20`
        }}
      >
        {/* <PartnerSlider/> */}
        {/* <JoinMovement/> */}
      </div>
      
      <Footer/>

      {/* Static Scroll Progress Indicator */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.primary} 50%, ${colors.accent} 100%)`,
          transformOrigin: '0%',
          zIndex: 1000,
          boxShadow: `0 0 10px ${colors.primary}40`,
          transform: `scaleX(${scrollY / (document.body.scrollHeight - window.innerHeight)})`
        }}
      />

      {/* Mobile-First Responsive CSS */}
      <style jsx>{`
        /* Mobile First Responsive Design */
        .featured-project-card {
          grid-template-columns: 1fr !important;
        }
        
        .featured-project-card > div:nth-child(1) {
          order: 1;
        }
        
        .featured-project-card > div:nth-child(2) {
          order: 2;
        }
        
        .featured-project-card > div:nth-child(3) {
          order: 3;
        }

        /* Tablet and up (768px+) */
        @media (min-width: 768px) {
          .featured-project-card {
            grid-template-columns: 1fr 1.2fr 1fr !important;
          }
          
          .featured-project-card > div:nth-child(1) {
            order: 1;
          }
          
          .featured-project-card > div:nth-child(2) {
            order: 2;
          }
          
          .featured-project-card > div:nth-child(3) {
            order: 3;
          }
        }

        /* Large screens (1024px+) */
        @media (min-width: 1024px) {
          .featured-project-card {
            grid-template-columns: 1fr 1.4fr 1fr !important;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 44px !important;
            min-width: 44px !important;
            font-size: 16px !important;
          }
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .theme-border {
            border-width: 2px !important;
          }
          
          .theme-text {
            font-weight: 600 !important;
          }
        }

        /* Keyframes for loading spinner */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Basic theme transitions only */
        * {
          transition: background-color 0.3s ease, 
                      color 0.3s ease, 
                      border-color 0.3s ease,
                      box-shadow 0.3s ease !important;
        }

        /* Print styles */
        @media print {
          video, .scroll-progress {
            display: none !important;
          }
        }

        /* Dark mode specific adjustments */
        @media (prefers-color-scheme: dark) {
          video {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;