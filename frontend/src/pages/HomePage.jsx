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
import CountriesReached from '../pages/Impact/countriesReached';


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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Header/>
      
      {/* Hero Section with cleaner styling */}
      <div style={{ flex: '0 0 auto' }}>
        <ACEFHero/>
      </div>

      {/* Main Content Container */}
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        
        {/* About Section - Reduced spacing */}
        <section
          style={{
            backgroundColor: colors.background,
            padding: 'clamp(40px, 6vw, 70px) 0',
          }}
        >
          <AcefAboutInfo/>
        </section>

        {/* Featured Project Section - Reduced spacing */}
        <section
          style={{
            backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.surface,
            padding: "clamp(50px, 8vw, 80px) 0",
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, ${colors.primary}08 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, ${colors.secondary}06 0%, transparent 50%)`,
              pointerEvents: 'none'
            }}
          />
          
          <div style={{ 
            maxWidth: "1200px", 
            margin: "0 auto", 
            padding: "0 clamp(20px, 5vw, 40px)",
            position: 'relative',
            zIndex: 1
          }}>
            {/* Clean Section Header */}
            <div style={{ 
              textAlign: "center", 
              marginBottom: "clamp(40px, 6vw, 60px)",
              maxWidth: '800px',
              margin: '0 auto clamp(40px, 6vw, 60px) auto'
            }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: `${colors.primary}15`,
                  borderRadius: '20px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: colors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Featured Initiative
              </div>
              
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
                Creating <span style={{ fontWeight: '700', color: colors.primary }}>Sustainable</span> Change
              </h2>

              <p
                style={{
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  color: colors.textSecondary,
                  lineHeight: "1.6",
                  fontWeight: '300'
                }}
              >
                Discover our ongoing initiatives creating environmental change across communities
              </p>
            </div>

            {/* Minimalist Project Display */}
            {loadingProjects ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: "80px 20px",
                  color: colors.textSecondary,
                }}
              >
                <div
                  style={{
                    width: "2px",
                    height: "60px",
                    background: `linear-gradient(180deg, transparent, ${colors.primary}, transparent)`,
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              </div>
            ) : (
              featuredProjects.slice(0, 1).map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "clamp(30px, 5vw, 50px)",
                    alignItems: "center",
                    maxWidth: "1000px",
                    margin: "0 auto",
                  }}
                >
                  {/* Project Image - Clean and modern */}
                  <div
                    style={{
                      height: "clamp(250px, 35vw, 400px)",
                      background: project.featured_image
                        ? `linear-gradient(135deg, ${colors.primary}20, transparent 70%), url(${
                            project.featured_image.startsWith("http")
                              ? project.featured_image
                              : `${STATIC_URL || ""}${project.featured_image}`
                          })`
                        : getCategoryGradient(project.category_name),
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "24px",
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 20px 60px -10px ${colors.primary}20`
                    }}
                  >
                    {/* Overlay for better text readability */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                        padding: '40px',
                        borderRadius: '0 0 24px 24px'
                      }}
                    >
                      <div
                        style={{
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '8px'
                        }}
                      >
                        {project.category_name}
                      </div>
                    </div>
                  </div>

                  {/* Project Content - Clean typography */}
                  <div style={{ 
                    textAlign: "center",
                    maxWidth: '700px',
                    margin: '0 auto'
                  }}>
                    <h3
                      style={{
                        fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                        fontWeight: "600",
                        color: colors.text,
                        marginBottom: "24px",
                        lineHeight: "1.3",
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {project.title}
                    </h3>

                    <p
                      style={{
                        color: colors.textSecondary,
                        fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                        lineHeight: "1.7",
                        marginBottom: "40px",
                        fontWeight: '300'
                      }}
                    >
                      {project.short_description || project.description}
                    </p>

                    {/* Clean Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "16px",
                        flexWrap: 'wrap'
                      }}
                    >
                      <button
                        onClick={(e) => handleProjectClick(project, e)}
                        style={{
                          background: colors.primary,
                          color: colors.background,
                          border: "none",
                          padding: "14px 32px",
                          borderRadius: "6px",
                          fontWeight: "500",
                          fontSize: "15px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          minWidth: '140px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = `0 8px 25px ${colors.text}25`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        Learn More
                      </button>

                      <button
                        onClick={() => navigate("/get-involved")}
                        style={{
                          background: "transparent",
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          padding: "14px 32px",
                          borderRadius: "6px",
                          fontWeight: "500",
                          fontSize: "15px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          minWidth: '140px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colors.text;
                          e.target.style.color = colors.background;
                          e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = colors.text;
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        Get Involved
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Minimal View All Button */}
            <div style={{ 
              textAlign: "center", 
              marginTop: "clamp(40px, 6vw, 60px)" 
            }}>
              <button
                onClick={handleViewAllProjects}
                style={{
                  background: "transparent",
                  color: colors.primary,
                  border: "none",
                  padding: "0",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textDecorationColor: `${colors.primary}40`
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecorationColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecorationColor = `${colors.primary}40`;
                }}
              >
                View All Projects <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Impact Stats - Reduced spacing */}
        <section style={{ padding: 'clamp(50px, 8vw, 80px) 0' }}>
          <EnvironmentalCharity/>
        </section>

        {/* Video Section - Reduced spacing */}
        <section
          style={{
            backgroundColor: colors.surface,
            padding: 'clamp(50px, 8vw, 80px) 0'
          }}
        >
          <VideoSection/>
        </section>

        {/* News Section - Reduced spacing */}
        <section style={{ padding: 'clamp(50px, 8vw, 80px) 0' }}>
          <LatestNewsSection/>
        </section>
        {/* Testimonial Section - Clean overlay */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
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
            <source src="/greenwater.mp4" type="video/mp4" />
          </video>

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(1px)',
              zIndex: 1,
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <FeaturedTestimonial
              title="Featured Testimonial"
              showCTA={true}
            />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer/>

      {/* Clean Progress Indicator */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: colors.primary,
          transformOrigin: '0%',
          zIndex: 1000,
          transform: `scaleX(${scrollY / (document.body.scrollHeight - window.innerHeight)})`
        }}
      />

      {/* Clean Responsive Styles */}
      <style jsx>{`
        /* Base mobile styles */
        @media (max-width: 767px) {
          .featured-project-card {
            gap: 30px !important;
          }
          
          button {
            min-height: 44px !important;
            font-size: 16px !important;
          }
        }

        /* Tablet styles */
        @media (min-width: 768px) {
          .featured-project-card {
            grid-template-columns: 1fr 1fr !important;
            gap: 50px !important;
          }
        }

        /* Desktop styles */
        @media (min-width: 1024px) {
          .featured-project-card {
            gap: 60px !important;
          }
        }

        /* Smooth animations */
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* Clean transitions */
        * {
          transition: background-color 0.2s ease, 
                      color 0.2s ease, 
                      transform 0.2s ease,
                      box-shadow 0.2s ease !important;
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Print optimization */
        @media print {
          video, .progress-indicator {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;