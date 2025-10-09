import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, withOpacity } from '../../theme';
import { API_URL } from '../../config';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DonationModal from '../../pages/Donations/DonationModal';
import CollaborationChatbot from '../Chatbot/CollaborationChatbot';
import ThankYouMessage from '../../components/ThankYouMessage';
import ImageFallbackComponent from './GetInvolvedHero';
import CollVolunteersTestimonials from '../../pages/Testimonials/CollVolunteersTestimonials';
import MailList from '../../components/MailList';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, ArrowRight, Users, Heart, Handshake, Briefcase, Calendar } from 'lucide-react';

const GetInvolved = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, colors, isDarkMode } = useTheme();
  
  const [activeFlow, setActiveFlow] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const actionCardsRef = useRef(null);
  const initialScrollPosition = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (location.state?.autoStartFlow) {
      const flowType = location.state.autoStartFlow;
      setActiveFlow(flowType);
      setNavigationHistory(['main', flowType]);
      setTimeout(() => actionCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChatbotSubmit = (formData) => {
    console.log("Form data received:", formData);
    setThankYouVisible(true);
    setNavigationHistory(prev => [...prev, 'thankyou']);
  };

  const startFlow = (flowType) => {
    initialScrollPosition.current = window.scrollY;
    setActiveFlow(flowType);
    setThankYouVisible(false);
    setNavigationHistory(['main', flowType]);
    setTimeout(() => actionCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const intelligentBack = () => {
    const history = [...navigationHistory];
    if (history.length <= 1) {
      window.scrollTo({ top: initialScrollPosition.current, behavior: 'smooth' });
      return;
    }
    
    history.pop();
    const previousState = history[history.length - 1];
    
    if (previousState === 'main') {
      setActiveFlow(null);
      setThankYouVisible(false);
      setNavigationHistory(['main']);
      setTimeout(() => actionCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else if (previousState === 'thankyou') {
      setThankYouVisible(true);
      setActiveFlow(null);
      setNavigationHistory(history);
    } else {
      setActiveFlow(previousState);
      setThankYouVisible(false);
      setNavigationHistory(history);
    }
  };

  const exitFlow = () => {
    setActiveFlow(null);
    setThankYouVisible(false);
    setNavigationHistory(['main']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToActionCards = () => actionCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const actionButtons = useMemo(() => [
    { 
      id: 'collaborate', 
      title: 'Collaborate', 
      subtitle: 'Strategic partnerships', 
      icon: Handshake, 
      description: 'Work with us on transformative projects that create lasting impact',
      color: colors.primary
    },
    { 
      id: 'volunteer', 
      title: 'Volunteer', 
      subtitle: 'Direct impact', 
      icon: Users, 
      description: 'Contribute your time and skills to meaningful community programs',
      color: colors.primary
    },
    { 
      id: 'partner', 
      title: 'Partner', 
      subtitle: 'Long-term commitment', 
      icon: Heart, 
      description: 'Establish sustainable partnerships for lasting social change',
      color: colors.primary
    },
    { 
      id: 'donate', 
      title: 'Support', 
      subtitle: 'Financial contribution', 
      icon: Sparkles, 
      description: 'Fuel our mission with financial support for key initiatives',
      color: colors.primary
    }
  ], [colors.primary]);

  const gradientBg = isDarkMode 
    ? colors.black
    : `linear-gradient(to bottom, ${colors.white} 0%, #fafafa 100%)`;

  const styles = {
    page: {
      minHeight: '100vh',
      background: gradientBg,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      color: theme.colors.text,
      position: 'relative',
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '60px 20px' : '100px 32px',
      position: 'relative',
    },
    hero: {
      textAlign: 'center',
      marginBottom: isMobile ? '60px' : '80px',
      maxWidth: '700px',
      margin: '0 auto'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
      gap: isMobile ? '16px' : '20px',
      marginBottom: isMobile ? '60px' : '80px'
    },
    actionCard: {
      background: isDarkMode ? withOpacity(colors.primary, 0.05) : colors.white,
      border: `1px solid ${isDarkMode ? withOpacity(colors.primary, 0.1) : '#e5e7eb'}`,
      borderRadius: '16px',
      padding: isMobile ? '28px 20px' : '32px 24px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: isDarkMode 
        ? 'none'
        : '0 1px 3px rgba(0, 0, 0, 0.04)',
    },
    iconWrapper: {
      width: isMobile ? '56px' : '64px',
      height: isMobile ? '56px' : '64px',
      margin: '0 auto 20px',
      borderRadius: '16px',
      background: isDarkMode 
        ? withOpacity(colors.primary, 0.1)
        : withOpacity(colors.primary, 0.08),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    title: {
      fontSize: isMobile ? '1.125rem' : '1.25rem',
      fontWeight: 700,
      marginBottom: '6px',
      color: theme.colors.text,
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '0.8125rem',
      color: theme.colors.textSecondary,
      marginBottom: '14px',
      fontWeight: 500,
      opacity: 0.8
    },
    desc: {
      fontSize: '0.875rem',
      color: theme.colors.textSecondary,
      lineHeight: 1.6,
      fontWeight: 400
    },
    primaryBtn: {
      background: colors.primary,
      color: colors.white,
      padding: isMobile ? '14px 28px' : '16px 32px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: isDarkMode 
        ? `0 4px 16px ${withOpacity(colors.primary, 0.3)}`
        : `0 2px 12px ${withOpacity(colors.primary, 0.2)}`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    donateSection: {
      background: isDarkMode ? withOpacity(colors.primary, 0.05) : colors.white,
      border: `1px solid ${isDarkMode ? withOpacity(colors.primary, 0.1) : '#e5e7eb'}`,
      borderRadius: '20px',
      padding: isMobile ? '48px 24px' : '64px 48px',
      textAlign: 'center',
      boxShadow: isDarkMode 
        ? 'none'
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    sectionTitle: {
      fontSize: isMobile ? '1.75rem' : '2.25rem',
      marginBottom: '16px',
      color: colors.primary,
      fontWeight: 800,
      letterSpacing: '-0.03em'
    },
    sectionDesc: {
      fontSize: isMobile ? '0.9375rem' : '1.0625rem',
      color: theme.colors.textSecondary,
      marginBottom: '32px',
      lineHeight: 1.7,
      maxWidth: '600px',
      margin: '0 auto 32px',
      fontWeight: 400
    },
    backBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: isDarkMode ? withOpacity(colors.primary, 0.08) : '#f3f4f6',
      border: `1px solid ${isDarkMode ? withOpacity(colors.primary, 0.15) : '#e5e7eb'}`,
      borderRadius: '10px',
      color: colors.primary,
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      marginBottom: '32px',
      transition: 'all 0.3s ease',
    },
    careerSection: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '16px' : '20px',
      marginTop: isMobile ? '60px' : '80px'
    },
    careerCard: {
      background: isDarkMode ? withOpacity(colors.primary, 0.05) : colors.white,
      border: `1px solid ${isDarkMode ? withOpacity(colors.primary, 0.1) : '#e5e7eb'}`,
      borderRadius: '20px',
      padding: isMobile ? '40px 24px' : '56px 40px',
      textAlign: 'center',
      minHeight: '340px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      boxShadow: isDarkMode 
        ? 'none'
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
    }
  };

  return (
    <div style={styles.page}>
      <Header />
      <ImageFallbackComponent onStartClick={scrollToActionCards} />
      
      <div style={styles.main} ref={actionCardsRef}>
        <AnimatePresence mode="wait">
          {thankYouVisible ? (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button 
                style={styles.backBtn} 
                onClick={intelligentBack}
                whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? withOpacity(colors.primary, 0.12) : '#e5e7eb' }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={16} />
                Back
              </motion.button>
              <ThankYouMessage onClose={exitFlow} />
            </motion.div>
          ) : activeFlow ? (
            <motion.div
              key="activeflow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {(activeFlow === 'collaborate' || activeFlow === 'partner' || activeFlow === 'volunteer') && (
                <>
                  <motion.button 
                    style={styles.backBtn} 
                    onClick={intelligentBack}
                    whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? withOpacity(colors.primary, 0.12) : '#e5e7eb' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft size={16} />
                    Back to Options
                  </motion.button>
                  <CollaborationChatbot flowType={activeFlow} onSubmit={handleChatbotSubmit} onExit={exitFlow} apiUrl={API_URL} />
                </>
              )}

              {activeFlow === 'donate' && (
                <div style={styles.donateSection}>
                  <motion.button 
                    style={styles.backBtn} 
                    onClick={intelligentBack}
                    whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? withOpacity(colors.primary, 0.12) : '#e5e7eb' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft size={16} />
                    Back to Options
                  </motion.button>
                  
                  <h3 style={styles.sectionTitle}>Support Our Mission</h3>
                  <p style={styles.sectionDesc}>
                    Your financial support enables us to expand our reach, develop innovative solutions, 
                    and create lasting positive change across Africa.
                  </p>
                  <motion.button 
                    style={styles.primaryBtn} 
                    onClick={() => setIsDonationModalOpen(true)}
                    whileHover={{ scale: 1.02, boxShadow: isDarkMode ? `0 6px 24px ${withOpacity(colors.primary, 0.4)}` : `0 4px 20px ${withOpacity(colors.primary, 0.3)}` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles size={18} />
                    Make a Donation
                  </motion.button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ ...styles.hero, marginBottom: isMobile ? '60px' : '80px' }}>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5 }}
                  style={{
                    fontSize: isMobile ? '2rem' : '3rem',
                    fontWeight: '800',
                    color: theme.colors.text,
                    lineHeight: 1.1,
                    marginBottom: '20px',
                    letterSpacing: '-0.03em'
                  }}
                >
                  Choose Your <span style={{ color: colors.primary }}>Impact</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    fontSize: isMobile ? '1rem' : '1.125rem',
                    color: theme.colors.textSecondary,
                    fontWeight: 400,
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.7
                  }}
                >
                  Select how you'd like to contribute to our mission of driving sustainable change across Africa
                </motion.p>
              </div>
              
              <div style={styles.grid}>
                {actionButtons.map((btn, i) => {
                  const IconComponent = btn.icon;
                  return (
                    <motion.div
                      key={btn.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      style={styles.actionCard}
                      onClick={() => startFlow(btn.id)}
                      whileHover={{ 
                        y: -4, 
                        boxShadow: isDarkMode 
                          ? `0 8px 24px ${withOpacity(colors.primary, 0.2)}` 
                          : '0 8px 24px rgba(0, 0, 0, 0.08)',
                        borderColor: isDarkMode ? withOpacity(colors.primary, 0.3) : colors.primary
                      }}
                    >
                      <motion.div 
                        style={styles.iconWrapper}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                      >
                        <IconComponent size={isMobile ? 28 : 32} color={colors.primary} strokeWidth={1.5} />
                      </motion.div>
                      <h3 style={styles.title}>{btn.title}</h3>
                      <p style={styles.subtitle}>{btn.subtitle}</p>
                      <p style={styles.desc}>{btn.description}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div style={styles.careerSection}>
                <motion.div 
                  style={styles.careerCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ 
                    y: -4,
                    boxShadow: isDarkMode 
                      ? `0 8px 24px ${withOpacity(colors.primary, 0.2)}` 
                      : '0 8px 24px rgba(0, 0, 0, 0.08)',
                    borderColor: isDarkMode ? withOpacity(colors.primary, 0.3) : colors.primary
                  }}
                >
                  <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '16px',
                    background: withOpacity(colors.primary, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    <Briefcase size={36} color={colors.primary} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800, marginBottom: '12px', color: colors.primary, letterSpacing: '-0.02em' }}>
                    Explore Careers
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px', color: theme.colors.textSecondary, maxWidth: '400px' }}>
                    Join our dynamic team driving innovation across Africa. Combine purpose with professional growth.
                  </p>
                  <motion.button 
                    style={styles.primaryBtn} 
                    onClick={() => navigate("/jobs")}
                    whileHover={{ scale: 1.02, boxShadow: isDarkMode ? `0 6px 24px ${withOpacity(colors.primary, 0.4)}` : `0 4px 20px ${withOpacity(colors.primary, 0.3)}` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Open Positions
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </motion.button>
                </motion.div>

                <motion.div 
                  style={styles.careerCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ 
                    y: -4,
                    boxShadow: isDarkMode 
                      ? `0 8px 24px ${withOpacity(colors.primary, 0.2)}` 
                      : '0 8px 24px rgba(0, 0, 0, 0.08)',
                    borderColor: isDarkMode ? withOpacity(colors.primary, 0.3) : colors.primary
                  }}
                >
                  <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '16px',
                    background: withOpacity(colors.primary, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    <Calendar size={36} color={colors.primary} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800, marginBottom: '12px', color: colors.primary, letterSpacing: '-0.02em' }}>
                    Upcoming Events
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px', color: theme.colors.textSecondary, maxWidth: '400px' }}>
                    Join our workshops and conferences. Connect with professionals and innovators across the continent.
                  </p>
                  <motion.button 
                    style={styles.primaryBtn}
                    onClick={() => navigate("/events")}
                    whileHover={{ scale: 1.02, boxShadow: isDarkMode ? `0 6px 24px ${withOpacity(colors.primary, 0.4)}` : `0 4px 20px ${withOpacity(colors.primary, 0.3)}` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Events
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DonationModal open={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
      <CollVolunteersTestimonials />
      <MailList />
      <Footer />
    </div>
  );
};

export default GetInvolved;