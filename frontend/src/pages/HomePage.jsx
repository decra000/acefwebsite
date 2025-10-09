import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JoinMovement from '../components/JoinMovement'; 
import FounderSection from '../pages/AboutUs/FounderSection';
import { useTheme } from '../theme';
import AcefAboutInfo from '../pages/AboutUs/acefAboutInfo';
import VideoSection from '../pages/Insights/VideoSection'; 
import ACEFHero from '../pages/ACEFHero';
import EnvironmentalCharity from '../pages/Impact/Impactstats';
import LatestNewsSection from '../pages/Insights/LatestNewsSection';
import FeaturedTestimonial from '../pages/Testimonials/FeaturedTestimonial'; 
import FeaturedProjects from '../pages/Projects/FeaturedProjects';
import VirtualVolunteerismBanner from '../pages/GetInvolved/VirtualVolunteerismBanner'; 

const Homepage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      style={{ 
        position: 'relative',
        backgroundColor: colors.background,
        color: colors.text,
        minHeight: '100vh',
        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <Header/>
      
      {/* Hero Section */}
      <ACEFHero/>

      {/* Main Content Container */}
      <main>
        
        {/* About Section */}
        <section
          style={{
            backgroundColor: colors.background,
            padding: 'clamp(40px, 6vw, 70px) 0',
          }}
        >
          <AcefAboutInfo/>
          <div style={{ marginTop: 'clamp(20px, 4vw, 50px)' }} />
          <FeaturedProjects/>
        </section>

        {/* Impact Stats */}
        <section style={{ padding: 'clamp(50px, 8vw, 80px) 0' }}>
          <EnvironmentalCharity/>
        </section>

        {/* Video Section */}
        <section
          style={{
            backgroundColor: colors.surface,
            padding: 'clamp(50px, 8vw, 80px) 0'
          }}
        >
          <VideoSection/>
        </section>

        {/* News Section */}
        <section style={{ padding: 'clamp(50px, 8vw, 80px) 0' }}>
          <LatestNewsSection/>
        </section>

        {/* Virtual Volunteerism Banner */}
        <VirtualVolunteerismBanner/>

        {/* Testimonial Section with Video Background */}
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

      {/* Progress Indicator */}
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

      {/* Responsive Styles */}
      <style jsx>{`
        /* Base mobile styles */
        @media (max-width: 767px) {
          button:not([data-utility-button]) {
            min-height: 44px !important;
            font-size: 16px !important;
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