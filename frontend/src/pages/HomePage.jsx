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
import FeaturedProjects from '../pages/Projects/FeaturedProjects';


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


  const handleCardInteraction = (cardType, index, isEntering) => {
    setHoveredCard(isEntering ? `${cardType}-${index}` : null);
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
          <FeaturedProjects/>
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
        <PartnerSlider/>
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