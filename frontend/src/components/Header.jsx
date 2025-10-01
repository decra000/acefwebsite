import React, { useState, useEffect, useCallback } from 'react';
import { TreePine, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme';
import { useLogo } from '../context/LogoContext';
import DonationModal from '../pages/Donations/DonationModal';

// Initialize Google Translate globally once
const initializeGoogleTranslate = () => {
  if (window.googleTranslateInit) return; // Already initialized
  
  window.googleTranslateInit = true;
  
  // Remove any existing scripts
  const existingScript = document.getElementById('google-translate-script');
  if (existingScript) existingScript.remove();
  
  // Create hidden container for the widget
  let container = document.getElementById('google_translate_element');
  if (!container) {
    container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.cssText = 'position: fixed; top: -9999px; left: -9999px; visibility: hidden;';
    document.body.appendChild(container);
  }
  
  // Define callback
  window.googleTranslateElementInit = function() {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,de,it,pt,ru,zh-CN,ja,ar,sw,am,hi,ko,th,vi,id,ms,fil',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      },
      'google_translate_element'
    );
  };
  
  // Load script
  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.head.appendChild(script);
};

// Simple Translation Modal that shows the Google widget
const TranslationModal = ({ isOpen, onClose, colors }) => {
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if widget is ready
      const checkWidget = () => {
        const widget = document.querySelector('#google_translate_element select');
        setWidgetReady(!!widget);
      };
      
      checkWidget();
      const interval = setInterval(checkWidget, 500);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="translation-modal-overlay" onClick={onClose}>
      <div className="translation-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="translation-modal-close"
          aria-label="Close translation modal"
        >
          <X size={20} />
        </button>

        <div className="translation-modal-header">
          <div className="translation-modal-icon">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="translation-modal-title">Translate Website</h3>
            <p className="translation-modal-subtitle">
              {widgetReady ? 'Select your language below' : 'Loading translator...'}
            </p>
          </div>
        </div>

        <div className="translation-modal-body">
          {!widgetReady ? (
            <div className="translation-loading">
              <div className="loading-spinner" />
              <p>Loading translation options...</p>
            </div>
          ) : (
            <div className="translation-widget-wrapper">
              <div id="google_translate_display"></div>
            </div>
          )}
          
          <div className="translation-modal-footer">
            <div className="translation-status-dot" style={{ 
              backgroundColor: widgetReady ? '#10b981' : '#f59e0b' 
            }}></div>
            <span>Powered by Google Translate</span>
          </div>
        </div>

        <div className="translation-modal-instructions">
          <p>
            💡 <strong>Tip:</strong> Your language selection will be remembered as you navigate the site.
            To reset to English, simply select "English" from the dropdown.
          </p>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { currentLogo, loading: logoLoading } = useLogo();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Initialize Google Translate once on mount
  useEffect(() => {
    initializeGoogleTranslate();
  }, []);

  // Track current path
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    updatePath();
    window.addEventListener('popstate', updatePath);
    
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(updatePath, 0);
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(updatePath, 0);
    };
    
    return () => {
      window.removeEventListener('popstate', updatePath);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);
// Move Google Translate widget into modal when modal opens
  useEffect(() => {
    if (isTranslationModalOpen) {
      const moveWidget = () => {
        const widgetContainer = document.querySelector('#google_translate_element .skiptranslate');
        const display = document.getElementById('google_translate_display');
        
        if (widgetContainer && display && !display.hasChildNodes()) {
          // Move the entire widget container (not clone)
          display.appendChild(widgetContainer);
        }
      };
      
      // Try multiple times with delays to catch the widget when it's ready
      const timeouts = [
        setTimeout(moveWidget, 100),
        setTimeout(moveWidget, 300),
        setTimeout(moveWidget, 600),
        setTimeout(moveWidget, 1000),
        setTimeout(moveWidget, 1500)
      ];
      
      return () => {
        // Clean up timeouts
        timeouts.forEach(clearTimeout);
        
        // Move widget back to original location
        const widgetContainer = document.querySelector('#google_translate_display .skiptranslate');
        const originalContainer = document.getElementById('google_translate_element');
        
        if (widgetContainer && originalContainer) {
          originalContainer.appendChild(widgetContainer);
        }
      };
    }
  }, [isTranslationModalOpen]);

  

  // Scroll handler
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollY) < 5) return;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false);
    } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
      setIsVisible(true);
    }
    
    setIsScrolled(currentScrollY > 50);
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    let ticking = false;
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [handleScroll]);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
      document.body.style.overflow = 'auto';
    }
  }, [isMobile]);

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us'},
    { label: 'Programs', href: '/programs' },
    { label: 'Impact', href: '/impact'},
    { label: 'Our Reach', href: '/findbycountry' },
    { label: 'Events', href: '/events' },
    { label: 'Insights', href: '/insights' },
    { label: 'Get Involved', href: '/get-involved' },
    { label: 'Contact', href: '/contact-us' },
  ];

  const toggleMobileMenu = useCallback(() => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    document.body.style.overflow = newState ? 'hidden' : 'auto';
  }, [isMobileMenuOpen]);

  const handleNavClick = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsTranslationModalOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleDonateClick = useCallback(() => {
    setIsDonationModalOpen(true);
    setIsMobileMenuOpen(false);
    setIsTranslationModalOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleTranslateClick = useCallback(() => {
    setIsTranslationModalOpen(true);
    setIsMobileMenuOpen(false);
  }, []);

  const renderLogo = useCallback(() => {
    if (logoLoading) {
      return (
        <div className="logo-container loading">
          <div className="loading-spinner" />
        </div>
      );
    }

    if (currentLogo?.full_url) {
      return (
        <div className="logo-container">
          <img 
            src={currentLogo.full_url} 
            alt={currentLogo.alt_text || 'ACEF Logo'}
            className="logo-image"
            style={{
              filter: !isScrolled ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' : 'none'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <TreePine 
            size={32} 
            className="fallback-logo"
            style={{ 
              color: colors?.primary || '#2563eb',
              display: 'none'
            }}
          />
        </div>
      );
    }

    return <TreePine size={32} style={{ color: colors?.primary || '#2563eb' }} />;
  }, [currentLogo, colors, isScrolled, logoLoading]);

  const getHeaderStyles = () => {
    if (isScrolled) {
      return {
        backgroundColor: colors?.surface || 'rgba(255, 255, 255, 0.95)',
        borderBottomColor: colors?.border || 'rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.08)'
      };
    }
    return {
      backgroundColor: 'transparent',
      borderBottomColor: 'transparent',
      boxShadow: 'none'
    };
  };

  const getTextColor = () => {
    if (isScrolled) return colors?.text || '#1f2937';
    if (currentPath === '/') return '#ffffff';
    return colors?.text || '#1f2937';
  };

  const getTextShadow = () => {
    return (!isScrolled && currentPath === '/') ? '0 1px 3px rgba(0, 0, 0, 0.4)' : 'none';
  };

  const getButtonStyles = () => {
    if (isScrolled) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: colors?.border || '#e5e7eb',
        backdropFilter: 'blur(10px)'
      };
    }
    if (currentPath === '/') {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      };
    }
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: colors?.border || '#e5e7eb',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    };
  };

  return (
    <>
      <motion.header 
        className={`header ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : 'hidden'}`}
        style={getHeaderStyles()}
        animate={{ y: isVisible ? 0 : '-100%' }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="header-container">
          <motion.div 
            className="header-brand"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <a href="/">{renderLogo()}</a>
          </motion.div>
          
          <nav className="desktop-nav">
            {navigationItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="nav-link"
                style={{ 
                  color: getTextColor(),
                  textShadow: getTextShadow()
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>
          
          <div className="header-controls">
            <Tooltip title="Translate Website">
              <motion.button
                onClick={handleTranslateClick}
                className="translate-btn"
                style={{ 
                  color: getTextColor(),
                  ...getButtonStyles(),
                  textShadow: getTextShadow()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={20} />
                {!isMobile && <span className="ml-2">Translate</span>}
              </motion.button>
            </Tooltip>
            
            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
              <motion.button
                onClick={toggleTheme}
                className="theme-toggle"
                style={{ 
                  color: getTextColor(),
                  ...getButtonStyles(),
                  textShadow: getTextShadow()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  key={isDarkMode ? 'moon' : 'sun'}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
              </motion.button>
            </Tooltip>
            
            {!isMobile && (
              <motion.button 
                onClick={handleDonateClick}
                className="donate-btn"
                style={{
                  backgroundColor: colors?.secondary || '#f59e0b',
                  color: colors?.white || '#ffffff',
                  boxShadow: !isScrolled 
                    ? '0 4px 20px rgba(0,0,0,0.15)' 
                    : `0 4px 15px ${colors?.secondary || '#f59e0b'}40`
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: `0 8px 30px ${colors?.secondary || '#f59e0b'}50`
                }}
                whileTap={{ scale: 0.98 }}
              >
                Donate Now
              </motion.button>
            )}
            
            <motion.button
              onClick={toggleMobileMenu}
              className="mobile-menu-toggle"
              style={{ 
                color: getTextColor(),
                ...getButtonStyles(),
                textShadow: getTextShadow()
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                key={isMobileMenuOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overlay-backdrop" onClick={toggleMobileMenu} />
            
            <motion.div
              className="mobile-menu"
              style={{ 
                backgroundColor: colors?.surface || '#ffffff',
                borderColor: colors?.border || '#e5e7eb'
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="mobile-menu-content">
                <div className="mobile-menu-header" style={{ borderColor: colors?.border }}>
                  <div className="mobile-menu-brand">{renderLogo()}</div>
                  <motion.button
                    onClick={toggleMobileMenu}
                    className="mobile-close-btn"
                    style={{ color: colors?.text }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <div className="mobile-nav-content">
                  <nav className="mobile-nav">
                    {navigationItems.map((item, index) => (
                      <motion.a
                        key={index}
                        href={item.href}
                        onClick={handleNavClick}
                        className="mobile-nav-link"
                        style={{ 
                          color: colors?.text || '#000000',
                          borderBottomColor: colors?.border || '#e5e7eb'
                        }}
                        whileHover={{ backgroundColor: colors?.backgroundSecondary || '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item.label}
                      </motion.a>
                    ))}
                  </nav>

                  <div className="mobile-actions" style={{ borderColor: colors?.border }}>
                    <motion.button
                      onClick={handleTranslateClick}
                      className="mobile-translate-btn"
                      style={{
                        backgroundColor: colors?.backgroundSecondary || '#f3f4f6',
                        color: colors?.text || '#000000',
                        borderColor: colors?.border || '#e5e7eb'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Globe size={20} />
                      <span>Translate Website</span>
                    </motion.button>
                  </div>
                </div>

                <div className="mobile-menu-footer" style={{ borderColor: colors?.border }}>
                  <motion.button
                    onClick={handleDonateClick}
                    className="mobile-donate-btn"
                    style={{
                      backgroundColor: colors?.secondary || '#f59e0b',
                      color: colors?.white || '#ffffff',
                      boxShadow: `0 4px 15px ${colors?.secondary || '#f59e0b'}40`
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: `0 6px 20px ${colors?.secondary || '#f59e0b'}50`
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Donate Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TranslationModal 
        isOpen={isTranslationModalOpen}
        onClose={() => {
          setIsTranslationModalOpen(false);
          document.body.style.overflow = 'auto';
        }}
        colors={colors}
      />

      <DonationModal 
        open={isDonationModalOpen} 
        onClose={() => {
          setIsDonationModalOpen(false);
          document.body.style.overflow = 'auto';
        }}
      />

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 1px solid transparent;
        }

        .header.scrolled {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid;
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4rem;
        }

        @media (min-width: 1024px) {
          .header-container {
            height: 5rem;
          }
        }

        .logo-container {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .logo-container.loading {
          width: 48px;
          height: 48px;
          justify-content: center;
          opacity: 0.7;
        }

        .logo-image {
          width: 48px;
          height: 48px;
          object-fit: contain;
          transition: all 0.3s ease;
        }

        .fallback-logo {
          display: none;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid currentColor;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.25rem;
        }

        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-link {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .translate-btn,
        .theme-toggle {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid;
          background: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .theme-toggle {
          padding: 0.5rem;
        }

        .translate-btn:hover,
        .theme-toggle:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 768px) {
          .translate-btn span {
            display: none;
          }
        }

        .donate-btn {
          display: none;
          padding: 0.625rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        @media (min-width: 1024px) {
          .donate-btn {
            display: block;
          }
        }

        .mobile-menu-toggle {
          display: block;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        @media (min-width: 1024px) {
          .mobile-menu-toggle {
            display: none;
          }
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
        }

        .overlay-backdrop {
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .mobile-menu {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 20rem;
          max-width: 100%;
          border-left: 1px solid;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
        }

        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid;
        }

        .mobile-close-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
        }

        .mobile-nav-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .mobile-nav {
          margin-bottom: 1rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          border-bottom: 1px solid;
          margin-bottom: 0.25rem;
        }

        .mobile-actions {
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 1px solid;
        }

        .mobile-translate-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid;
          cursor: pointer;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .mobile-menu-footer {
          padding: 1rem;
          border-top: 1px solid;
        }

        .mobile-donate-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        /* Translation Modal */
        .translation-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 1rem;
          padding-top: 6rem;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .translation-modal-content {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .translation-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.05);
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .translation-modal-close:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }

        .translation-modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          padding-right: 4rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .translation-modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: white;
          color: #2563eb;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
        }

        .translation-modal-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .translation-modal-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          margin-top: 2px;
        }

        .translation-modal-body {
          padding: 1.5rem;
        }

        .translation-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
          color: #6b7280;
        }

        .translation-widget-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60px;
        }

        #google_translate_display {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        #google_translate_display select {
          width: 100%;
          max-width: 300px;
          padding: 12px 16px;
          font-size: 15px;
          font-family: inherit;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: #1f2937;
          cursor: pointer;
          transition: all 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        #google_translate_display select:hover {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        #google_translate_display select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .translation-modal-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0;
          font-size: 0.8125rem;
          color: #9ca3af;
        }

        .translation-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .translation-modal-instructions {
          padding: 1rem 1.5rem 1.5rem;
          background: #f9fafb;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .translation-modal-instructions p {
          margin: 0;
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #6b7280;
        }

        .translation-modal-instructions strong {
          color: #374151;
          font-weight: 600;
        }

        /* Hide Google Translate Banner */
        .goog-te-banner-frame,
        iframe.goog-te-banner-frame,
        .goog-te-ftab,
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
          visibility: hidden !important;
        }

        body {
          top: 0 !important;
        }

        .skiptranslate {
          display: none;
        }

        /* Custom Scrollbar */
        .mobile-nav-content::-webkit-scrollbar {
          width: 4px;
        }

        .mobile-nav-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .mobile-nav-content::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }

        button:focus-visible,
        a:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 768px) {
          .translation-modal-overlay {
            padding-top: 5rem;
          }

          .translation-modal-content {
            max-width: 100%;
          }

          #google_translate_display select {
            font-size: 14px;
          }
        }
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;