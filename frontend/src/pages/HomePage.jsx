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
      short_description: 'Providing sustainable clean water solutions to rural communities around Lake Victoria through innovative filtration systems. Our comprehensive approach includes community education, maintenance training, and long-term sustainability planning to ensure lasting impact across the region.',
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
      short_description: 'Engaging local communities in large-scale tree planting initiatives to combat deforestation and promote biodiversity. This program focuses on native species restoration, soil conservation, and creating sustainable livelihoods for local communities through agroforestry practices.',
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
        flexDirection: 'column',
        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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

        {/* Featured Project Section - Enhanced Design with Typography */}
        <section
          style={{
            backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.surface,
            padding: "clamp(60px, 10vw, 100px) 0",
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Refined background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 15% 85%, ${colors.primary}06 0%, transparent 50%), 
                          radial-gradient(circle at 85% 15%, ${colors.secondary}04 0%, transparent 50%)`,
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
            {/* Enhanced Section Header */}
            <div 
              style={{ 
                textAlign: "center", 
                marginBottom: "clamp(60px, 10vw, 100px)",
                maxWidth: '700px',
                margin: '0 auto clamp(60px, 10vw, 100px) auto'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: `${colors.primary}12`,
                  borderRadius: '24px',
                  marginBottom: '32px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: colors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Featured Initiative
              </div>
              
              <h2
                style={{
                  fontSize: "48px",
                  fontWeight: "800",
                  color: colors.text,
                  marginBottom: "24px",
                  lineHeight: "1.1",
                  letterSpacing: '-0.02em',
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Creating Sustainable Change
              </h2>

              <div
                style={{
                  color: colors.textSecondary,
                  marginBottom: '2.5rem',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  lineHeight: 1.7,
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                <p style={{ marginBottom: '1.5rem', margin: 0 }}>
                  Discover our ongoing initiatives creating environmental change across communities
                </p>
              </div>
            </div>

            {/* Enhanced Three-Column Layout */}
            {loadingProjects ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: "100px 20px",
                  color: colors.textSecondary,
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "80px",
                    background: `linear-gradient(180deg, transparent, ${colors.primary}, transparent)`,
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              </div>
            ) : (
              featuredProjects.slice(0, 1).map((project) => (
                <div
                  key={project.id}
                  className="three-column-layout"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "0.25fr 2fr 1.75fr",
                    gap: "clamp(50px, 8vw, 100px)",
                    alignItems: "center",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    minHeight: "550px"
                  }}
                >
                  {/* Left Column - Elegant Accent */}
                  <div 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '20px'
                    }}
                  >
                    {/* Refined accent line */}
                    <div
                      style={{
                        width: '3px',
                        height: '140px',
                        background: `linear-gradient(180deg, transparent, ${colors.primary}80, transparent)`,
                        borderRadius: '2px'
                      }}
                    />
                  </div>

                  {/* Center Column - Premium Image Display */}
                  <div
                    style={{
                      height: "clamp(450px, 45vw, 550px)",
                      background: project.featured_image
                        ? `linear-gradient(135deg, ${colors.primary}08, transparent 70%), url(${
                            project.featured_image.startsWith("http")
                              ? project.featured_image
                              : `${STATIC_URL || ""}${project.featured_image}`
                          })`
                        : getCategoryGradient(project.category_name),
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "20px",
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 25px 70px -20px ${colors.text}12`,
                      cursor: 'pointer',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `1px solid ${colors.border}15`
                    }}
                    onClick={(e) => handleProjectClick(project, e)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.015)";
                      e.currentTarget.style.boxShadow = `0 35px 90px -20px ${colors.text}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = `0 25px 70px -20px ${colors.text}12`;
                    }}
                  >
                    {/* Refined overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${colors.primary}04 0%, transparent 40%, ${colors.secondary}04 100%)`,
                        borderRadius: '20px'
                      }}
                    />

                    {/* Premium interaction indicator */}
                    <div
                      className="interaction-indicator"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '70px',
                        height: '70px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
                      }}
                    >
                      <ArrowUpRight size={24} style={{ color: colors.primary, strokeWidth: 2.5 }} />
                    </div>
                  </div>

                  {/* Right Column - Enhanced Content Typography */}
                  <div 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '36px',
                      paddingLeft: '48px',
                      height: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Title Section */}
                    <div>
                      <h3
                        style={{
                          fontSize: "48px",
                          fontWeight: "800",
                          color: colors.text,
                          lineHeight: "1.1",
                          letterSpacing: '-0.02em',
                          margin: 0,
                          marginBottom: '12px',
                          fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        {project.title}
                      </h3>
                      
                      {/* Category badge */}
                      <div
                        style={{
                          color: colors.primary,
                          fontSize: '13px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        {project.category_name || 'Environmental Initiative'}
                      </div>
                    </div>

                    {/* Description with Scrollable Container */}
                    <div
                      style={{
                        borderLeft: `3px solid ${colors.primary}20`,
                        paddingLeft: '28px',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          color: colors.textSecondary,
                          marginBottom: '2.5rem',
                          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                          lineHeight: 1.7,
                          fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          maxHeight: '160px',
                          overflowY: 'auto',
                          paddingRight: '16px',
                          scrollbarWidth: 'thin',
                          scrollbarColor: `${colors.primary}40 transparent`,
                        }}
                        className="custom-scrollbar"
                      >
                        <p style={{ marginBottom: '1.5rem', margin: 0 }}>
                          {project.short_description || project.description}
                        </p>
                      </div>
                      
                      {/* Refined scroll indicator */}
                      <div
                        style={{
                          position: 'absolute',
                          right: '0',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '4px',
                          height: '70px',
                          background: `${colors.primary}12`,
                          borderRadius: '2px'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '30%',
                            background: colors.primary,
                            borderRadius: '2px',
                            animation: 'scrollHint 3s ease-in-out infinite'
                          }}
                        />
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}
                    >
                      <button
                        onClick={(e) => handleProjectClick(project, e)}
                        style={{
                          background: colors.primary,
                          color: colors.background,
                          border: "none",
                          padding: "18px 36px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "16px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          minWidth: '160px',
                          justifyContent: 'center',
                          fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = `0 12px 35px ${colors.primary}35`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        Explore Project <ArrowRight size={18} strokeWidth={2.5} />
                      </button>

                      <button
                        onClick={() => navigate("/get-involved")}
                        style={{
                          background: "transparent",
                          color: colors.textSecondary,
                          border: "none",
                          padding: "18px 0",
                          fontWeight: "500",
                          fontSize: "16px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textDecoration: 'underline',
                          textUnderlineOffset: '4px',
                          textDecorationColor: `${colors.textSecondary}40`,
                          fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = colors.text;
                          e.target.style.textDecorationColor = colors.text;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = colors.textSecondary;
                          e.target.style.textDecorationColor = `${colors.textSecondary}40`;
                        }}
                      >
                        Get Involved
                      </button>
                    </div>

                    {/* Reading Time */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: colors.textSecondary,
                        fontSize: '14px',
                        fontWeight: '400',
                        marginTop: '8px',
                        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      <Clock size={16} />
                      <span>2 min read</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* View All Button */}
            <div style={{ 
              textAlign: "center", 
              marginTop: "clamp(70px, 10vw, 100px)" 
            }}>
              <button
                onClick={handleViewAllProjects}
                style={{
                  background: "transparent",
                  color: colors.primary,
                  border: "none",
                  padding: "0",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.2s ease",
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textDecorationColor: `${colors.primary}40`,
                  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecorationColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecorationColor = `${colors.primary}40`;
                }}
              >
                View All Projects <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Enhanced Responsive Styles */}
          <style jsx>{`
            /* Custom scrollbar styling */
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${colors.primary}40;
              border-radius: 3px;
              transition: background 0.2s ease;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${colors.primary}60;
            }

            /* Scroll indicator animation */
            @keyframes scrollHint {
              0%, 100% {
                transform: translateY(0);
                opacity: 0.6;
              }
              50% {
                transform: translateY(20px);
                opacity: 1;
              }
            }

            /* Mobile: Single-column experience */
            @media (max-width: 768px) {
              .three-column-layout {
                grid-template-columns: 1fr !important;
                gap: 36px !important;
                padding: 0 20px;
              }
              
              .three-column-layout > div:first-child {
                display: none;
              }
              
              .three-column-layout > div:nth-child(2) {
                order: 1;
                height: clamp(320px, 65vw, 400px) !important;
                margin: 0 auto;
                width: 100%;
                border-radius: 16px !important;
              }
              
              .three-column-layout > div:last-child {
                order: 2;
                padding-left: 0 !important;
                gap: 28px !important;
              }

              .three-column-layout h3 {
                font-size: clamp(1.5rem, 7vw, 2rem) !important;
                text-align: center;
                margin-bottom: 16px !important;
              }

              .three-column-layout h3 + div {
                text-align: center;
                margin-bottom: 24px;
              }

              .custom-scrollbar {
                max-height: 120px !important;
                margin: 0 auto 24px auto;
              }

              .three-column-layout .custom-scrollbar {
                border-left: 2px solid ${colors.primary}20 !important;
                padding-left: 20px !important;
              }

              .three-column-layout > div:last-child > div:nth-of-type(3) {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 14px !important;
                margin: 28px 0 !important;
              }

              .three-column-layout button:first-of-type {
                width: 100% !important;
                min-width: unset !important;
                padding: 16px 24px !important;
                font-size: 16px !important;
              }

              .three-column-layout button:last-of-type {
                text-align: center;
                padding: 16px 0 !important;
                font-size: 16px !important;
              }

              .three-column-layout > div:last-child > div:last-child {
                justify-content: center !important;
                margin-top: 20px !important;
              }
            }

            /* Tablet: Two-column experience */
            @media (min-width: 769px) and (max-width: 1024px) {
              .three-column-layout {
                grid-template-columns: 1.3fr 1.7fr !important;
                gap: 48px !important;
              }
              
              .three-column-layout > div:first-child {
                display: none;
              }

              .three-column-layout > div:nth-child(2) {
                height: clamp(380px, 48vw, 450px) !important;
              }

              .three-column-layout > div:last-child {
                padding-left: 36px !important;
              }

              .custom-scrollbar {
                max-height: 130px !important;
              }
            }

            /* Large screens */
            @media (min-width: 1200px) {
              .three-column-layout {
                gap: 120px !important;
              }

              .custom-scrollbar {
                max-height: 180px !important;
              }
            }

            /* Hover states */
            @media (hover: hover) {
              .three-column-layout > div:nth-child(2):hover .interaction-indicator {
                transform: translate(-50%, -50%) scale(1.12);
                background-color: white;
                box-shadow: 0 12px 50px rgba(0,0,0,0.15);
              }
            }

            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
              .three-column-layout * {
                animation: none !important;
                transition: none !important;
              }
              
              @keyframes scrollHint {
                0%, 100% { transform: none; opacity: 0.6; }
              }
            }
          `}</style>
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