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

// In your parent component


const Homepage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { colors, isDarkMode, theme } = useTheme();
  
  // News state
  const [latestNews, setLatestNews] = useState(null);
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [newsPopupClosed, setNewsPopupClosed] = useState(false);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Blog/News state for general articles
  const [featuredNews, setFeaturedNews] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articleError, setArticleError] = useState(null);

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

  // Placeholder news for fallback
  const placeholderNews = {
    id: 'placeholder-news-1',
    title: 'ACEF Launches Major Climate Initiative Across East Africa',
    excerpt: 'Our foundation announces a groundbreaking multi-year program to combat climate change through grassroots community engagement and sustainable technology deployment.',
    content: 'This comprehensive initiative will span across Kenya, Uganda, and Tanzania, focusing on reforestation, clean energy access, and water conservation projects.',
    is_featured: true,
    featured_image: null,
    published_at: new Date().toISOString(),
    author: 'ACEF Communications Team'
  };
  
  // Hero slides with theme integration
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&auto=format&q=80',
      title: 'ACEF',
      description: 'Africa Climate and Environment Foundation',
      accent: 'Empowering Grassroots for a Sustainable Future',
      gradient: `linear-gradient(135deg, ${colors.primary}ee 0%, ${colors.secondary}cc 50%, ${colors.accent}ee 100%)`
    },
  ];

  // Store last visited path for navigation
  useEffect(() => {
    sessionStorage.setItem('lastVisitedPath', '/');
  }, []);

  // Fetch latest news specifically for popup
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoadingNews(true);
        const response = await fetch(`${API_URL}/blogs`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const rawArticles = data.data || data || [];
        
        // Filter for published, approved news articles
        const newsArticles = rawArticles.filter(item => {
          const isPublished = item.status === 'published';
          const isApproved = item.approved === true || 
                           item.approved === 1 || 
                           item.approved === '1' || 
                           item.approved === 'true';
          const isNews = item.is_news === true || 
                        item.is_news === 1 || 
                        item.is_news === '1' || 
                        item.is_news === 'true';
          return isPublished && isApproved && isNews;
        });
        
        // Sort by published date
        const sortedNews = newsArticles.sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at);
          const dateB = new Date(b.published_at || b.created_at);
          return dateB - dateA;
        });

        if (sortedNews.length > 0) {
          const latest = sortedNews[0];
          setLatestNews(latest);
          
          // Show popup if latest news is featured and popup hasn't been closed
          const popupClosedKey = `news-popup-closed-${latest.id}`;
          const wasPopupClosed = localStorage.getItem(popupClosedKey) === 'true';
          
          if (latest.is_featured && !wasPopupClosed) {
            setTimeout(() => setShowNewsPopup(true), 2000); // Show after 2 seconds
          }
        } else {
          // Use placeholder if no news available
          setLatestNews(placeholderNews);
          if (!localStorage.getItem(`news-popup-closed-${placeholderNews.id}`)) {
            setTimeout(() => setShowNewsPopup(true), 2000);
          }
        }
        
        setNewsError(null);
      } catch (error) {
        console.error('Error fetching latest news:', error);
        setNewsError(error.message);
        // Use placeholder on error
        setLatestNews(placeholderNews);
        if (!localStorage.getItem(`news-popup-closed-${placeholderNews.id}`)) {
          setTimeout(() => setShowNewsPopup(true), 2000);
        }
      } finally {
        setLoadingNews(false);
      }
    };

    fetchLatestNews();
  }, []);

  // Fetch articles and separate news from blogs for the news section
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        const response = await fetch(`${API_URL}/blogs`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const rawArticles = data.data || data || [];
        
        // Filter for published and approved articles
        const publishedApproved = rawArticles.filter(item => {
          const isPublished = item.status === 'published';
          const isApproved = item.approved === true || 
                           item.approved === 1 || 
                           item.approved === '1' || 
                           item.approved === 'true';
          return isPublished && isApproved;
        });
        
        // Sort by date
        const sorted = publishedApproved.sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at);
          const dateB = new Date(b.published_at || b.created_at);
          return dateB - dateA;
        });

        // Separate news and blogs
        const newsArticles = sorted.filter(item => item.is_news === true || item.is_news === 1 || item.is_news === '1' || item.is_news === 'true');
        const blogArticles = sorted.filter(item => !(item.is_news === true || item.is_news === 1 || item.is_news === '1' || item.is_news === 'true'));
        
        // Set featured news for section (most recent news article)
        setFeaturedNews(newsArticles.length > 0 ? newsArticles[0] : null);
        
        // Set recent blogs
        setRecentBlogs(blogArticles.slice(0, 3));
        
        setArticleError(null);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticleError(error.message);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchArticles();
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

  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

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

  // News popup handlers
  const handleCloseNewsPopup = () => {
    setShowNewsPopup(false);
    setNewsPopupClosed(true);
    if (latestNews) {
      localStorage.setItem(`news-popup-closed-${latestNews.id}`, 'true');
    }
  };

  const handleNewsClick = (newsItem, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    sessionStorage.setItem('lastVisitedPath', '/');
    
    // Navigate to blog/news detail page
    navigate(`/blog/${newsItem.id}`, { 
      state: { 
        article: newsItem,
        from: '/',
        fromPath: '/'
      }
    });
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

      {/* News Popup */}
      {showNewsPopup && latestNews && !newsPopupClosed && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${colors.borderLight}`,
            boxShadow: `0 20px 60px ${colors.primary}30`
          }}>
            {/* Close Button */}
            <button
              onClick={handleCloseNewsPopup}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              <X size={20} color="white" />
            </button>

            {/* Featured Image or Gradient Background */}
            <div style={{
              height: '200px',
              background: latestNews.featured_image 
                ? `url(${latestNews.featured_image.startsWith('http') 
                    ? latestNews.featured_image 
                    : `${STATIC_URL || ''}${latestNews.featured_image}`})`
                : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: latestNews.featured_image 
                  ? 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)'
                  : 'none'
              }} />
              
              {/* Breaking News Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: colors.error,
                color: colors.white,
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                zIndex: 1,
                animation: 'pulse 2s infinite'
              }}>
                🔥 Latest News
              </div>

              {/* News Icon for non-image backgrounds */}
              {!latestNews.featured_image && (
                <Newspaper size={60} style={{ color: colors.white, opacity: 0.9 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: colors.text,
                marginBottom: '12px',
                lineHeight: '1.3'
              }}>
                {latestNews.title}
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                color: colors.textSecondary,
                fontSize: '0.9rem'
              }}>
                <Calendar size={16} />
                <span>{formatDate(latestNews.published_at)}</span>
                {latestNews.author && (
                  <>
                    <span>•</span>
                    <span>{latestNews.author}</span>
                  </>
                )}
              </div>

              <p style={{
                color: colors.textSecondary,
                lineHeight: '1.6',
                marginBottom: '24px',
                fontSize: '1rem'
              }}>
                {latestNews.excerpt || truncateText(latestNews.content, 200)}
              </p>

              <div style={{ 
                display: 'flex', 
                gap: '12px',
                alignItems: 'center' 
              }}>
                <button
                  onClick={(e) => handleNewsClick(latestNews, e)}
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.primary;
                  }}
                >
                  Read Full Story
                  <ArrowRight size={16} />
                </button>
                
                <button
                  onClick={handleCloseNewsPopup}
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.textSecondary,
                    border: `1px solid ${colors.borderLight}`,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = `${colors.primary}10`;
                    e.target.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = colors.borderLight;
                  }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className={styles.hero} style={{ 
        position: 'relative', 
        overflow: 'hidden',
        height: '100vh',
        minHeight: '700px',
        background: heroSlides[currentSlide].gradient
      }}>
        {/* Static Grid Background with Theme Colors */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${colors.primary}30 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}30 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 1
        }} />

        <div className={styles.heroSlider}>
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`${styles.heroSlide} ${index === currentSlide ? styles.active : ''}`}
              style={{
                backgroundImage: `url(${slide.image})`,
                filter: `brightness(0.3) contrast(1.2) saturate(1.3)`,
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 1.5s ease'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: slide.gradient,
                opacity: 0.6,
                mixBlendMode: 'overlay'
              }} />
            </div>
          ))}
        </div>
        
        {/* Centered Hero Content */}
        <div className={styles.heroContent} style={{ 
          position: 'relative', 
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center'
        }}>
          <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div className={styles.heroText} style={{ 
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <h1
                style={{
                  fontSize: 'clamp(3rem, 8vw, 6rem)',
                  fontWeight: '700',
                  background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '1.1',
                  marginBottom: '25px',
                  letterSpacing: '-0.02em',
                  textShadow: `0 0 50px ${colors.primary}60`
                }}
              >
                {heroSlides[currentSlide].title}
              </h1>

              <p
                style={{
                  fontSize: '1.3rem',
                  color: colors.white,
                  marginBottom: '20px',
                  fontWeight: '400',
                  lineHeight: '1.6',
                  maxWidth: '700px',
                  margin: '0 auto 20px auto',
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)'
                }}
              >
                {heroSlides[currentSlide].description}
              </p>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: colors.white,
                  marginBottom: '40px',
                  fontWeight: '300',
                  lineHeight: '1.6',
                  maxWidth: '600px',
                  margin: '0 auto 40px auto',
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)'
                }}
              >
                {heroSlides[currentSlide].accent}
              </p>
              
              {/* <div 
                className={styles.heroActions}
                style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}
              >
                <button 
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                    padding: '16px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 16px rgba(10, 69, 28, 0.3)`,
                    fontFamily: '"Nunito Sans", sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    e.target.style.boxShadow = `0 15px 40px ${colors.
              </p>
              

 */}













              
              <div 
                className={styles.heroActions}
                style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}
              >
                <button 
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                    padding: '16px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 16px rgba(10, 69, 28, 0.3)`,
                    fontFamily: '"Nunito Sans", sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    e.target.style.boxShadow = `0 15px 40px ${colors.secondary}70`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) translateY(0)';
                    e.target.style.boxShadow = `0 4px 16px rgba(10, 69, 28, 0.3)`;
                  }}
                >
                  Get Involved 
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </section>

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
                <LatestNewsSection/>



{/* Featured Project Section */}
<div
  style={{
    backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.surface,
    padding: "80px 0",
    borderTop: `1px solid ${colors.border}20`,
  }}
>
  <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 20px" }}>
    {/* Section Header */}
    <div style={{ textAlign: "center", marginBottom: "60px" }}>
      <h2
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
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
          fontSize: "1.1rem",
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

    {/* One Featured Project */}
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
        .slice(0, 1) // 🔑 only one project
        .map((project) => (
          <div
            key={project.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr 1fr",
              gap: "30px",
              alignItems: "center",
              backgroundColor: colors.background,
              borderRadius: "16px",
              overflow: "hidden",
              border: `1px solid ${colors.borderLight}`,
              maxWidth: "1100px",
              margin: "0 auto 50px auto",
              transition: "all 0.3s ease",
              padding: "30px",
            }}
          >
            {/* Left - Text */}
            <div>
              <h3
                style={{
                  fontSize: "1.6rem",
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
                  fontSize: "1rem",
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

            {/* Center - Image */}
            <div
              style={{
                height: "100%",
                minHeight: "300px",
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
              }}
            />

            {/* Right - Actions */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "16px",
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
                  fontSize: "15px",
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
                onClick={(e) => handleProjectClick(project, e)}
                style={{
                  background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                  color: colors.white,
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "15px",
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
          padding: "14px 28px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "16px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
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
          padding: '80px 0'
        }}
      >
        <VideoSection/>
      </div>

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
      background: 'rgba(10, 10, 10, 0.6)', // semi-transparent dark overlay
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

      {/* Basic CSS without animations */}
      <style jsx>{`
        /* Responsive design */
        @media (max-width: 968px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
          
          .hero-text h1 {
            font-size: clamp(2rem, 6vw, 4rem) !important;
          }
          
          .hero-actions {
            flex-direction: column !important;
            gap: 15px !important;
          }
        }
        
        @media (max-width: 640px) {
          .hero-content {
            padding: 0 15px !important;
          }
          
          .hero-nav {
            bottom: 20px !important;
          }
        }

        @media (max-width: 500px) {
          div[style*="grid-template-columns: repeat(auto-fit, minmax(450px, 1fr))"] {
            grid-template-columns: 1fr !important;
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
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .theme-border {
            border-width: 2px !important;
          }
          
          .theme-text {
            font-weight: 600 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;