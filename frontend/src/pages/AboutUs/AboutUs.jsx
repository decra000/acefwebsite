import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../theme'; // Adjust path to your theme file
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PartnerSlider from '../../components/PartnerSlider'; 
import TeamSection from './TeamSection';
import '../../styles/AboutUs.css';
import JoinMovement from '../../components/JoinMovement'; 
import MissionVision from './MissionVision';
import CoreValues from './coreValues';
import FounderSection from './FounderSection';
import VisionObjectives2050 from './objectives'
import Timeline from './Timeline';

const AboutUs = () => {
  const { colors, isDarkMode } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionsRef = useRef([]);
  const aboutSectionRef = useRef(null);
  const teamSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Reveal sections on scroll
      sectionsRef.current.forEach((section) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight * 0.8;
          
          if (isVisible) {
            section.classList.add('visible');
          }
        }
      });
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Navigation functions
  const scrollToAbout = () => {
    if (aboutSectionRef.current) {
      aboutSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToTeam = () => {
    if (teamSectionRef.current) {
      teamSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Add just smooth scrolling CSS - nothing else
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Harmonized dynamic styles with proper dark/light mode colors
  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      transition: 'all 0.3s ease'
    },
    heroContent: {
      color: isDarkMode ? colors.text : '#FFFFFF'
    },
    heroTitle: {
      color: isDarkMode ? colors.text : '#FFFFFF',
      fontWeight: '800',
      textShadow: isDarkMode 
        ? '0 4px 20px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.4)' 
        : '0 4px 20px rgba(0,0,0,0.4), 0 2px 10px rgba(0,0,0,0.2)'
    },
    heroSubtitle: {
      color: isDarkMode ? colors.textSecondary : 'rgba(255,255,255,0.9)',
      fontWeight: '400'
    },
    heroBg: {
      background: isDarkMode 
        ? `linear-gradient(135deg, 
            ${colors.background}00 0%, 
            ${colors.backgroundSecondary}40 25%, 
            ${colors.surface}60 50%, 
            ${colors.backgroundSecondary}40 75%, 
            ${colors.background}00 100%)`
        : `linear-gradient(135deg, 
            ${colors.background}00 0%, 
            ${colors.backgroundSecondary}20 25%, 
            ${colors.surface}40 50%, 
            ${colors.backgroundSecondary}20 75%, 
            ${colors.background}00 100%)`,
      opacity: isDarkMode ? 0.9 : 0.7
    },
    sectionTitle: {
      color: colors.text,
      fontFamily: "'Nunito Sans', sans-serif",
      fontWeight: '700'
    },
    cardBg: {
      backgroundColor: isDarkMode ? colors.surface : `${colors.surface}F5`,
      borderColor: isDarkMode ? colors.border : `${colors.border}80`,
      boxShadow: isDarkMode 
        ? `0 8px 32px ${colors.cardShadow}40, 0 4px 16px ${colors.cardShadow}20`
        : `0 8px 32px ${colors.cardShadow}15, 0 4px 16px ${colors.cardShadow}08`
    },
    cardText: {
      color: colors.textSecondary,
      fontFamily: "'Nunito Sans', sans-serif"
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
      color: isDarkMode ? colors.background : colors.white,
      border: 'none',
      fontFamily: "'Nunito Sans', sans-serif",
      fontWeight: '600'
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
      fontFamily: "'Nunito Sans', sans-serif",
      fontWeight: '600'
    },
    dividerText: {
      color: isDarkMode ? colors.textSecondary : 'rgba(255,255,255,0.8)',
      fontFamily: "'Nunito Sans', sans-serif",
      fontWeight: '500'
    },
    dividerLine: {
      backgroundColor: isDarkMode ? colors.border : `${colors.border}60`
    }
  };

  return (
    <div className="about-container" style={dynamicStyles.container}>
      <Header />
      
      {/* Floating Background Elements */}
      <div className="floating-bg">
        <div 
          className="floating-orb orb-1"
          style={{
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
            backgroundColor: isDarkMode ? `${colors.primary}25` : `${colors.primary}15`
          }}
        />
        <div 
          className="floating-orb orb-2"
          style={{
            transform: `translate(${mousePos.x * -0.015}px, ${mousePos.y * -0.015}px)`,
            backgroundColor: isDarkMode ? `${colors.secondary}25` : `${colors.secondary}15`
          }}
        />
        <div 
          className="floating-orb orb-3"
          style={{
            transform: `translate(${mousePos.x * 0.01}px, ${mousePos.y * 0.01}px)`,
            backgroundColor: isDarkMode ? `${colors.accent}25` : `${colors.accent}15`
          }}
        />
      </div>

      {/* About section with ref */}
      <section ref={aboutSectionRef}>
      </section>
      
      <FounderSection/>
      <MissionVision/>
      <VisionObjectives2050/>
      <Timeline/>
      <TeamSection />
      <CoreValues/>
      <PartnerSlider />
      <JoinMovement/>

      <Footer />
    </div>
  );
};

export default AboutUs;