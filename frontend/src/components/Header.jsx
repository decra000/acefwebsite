import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TreePine, Menu, X, Sun, Moon, ChevronDown, Globe, AlertCircle, Check } from 'lucide-react';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme';
import { useLogo } from '../context/LogoContext';
import DonationModal from '../pages/Donations/DonationModal';
import embeddedTranslationService from '../utils/embeddedTranslationService';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [isTranslationServiceReady, setIsTranslationServiceReady] = useState(false);
  const [translationServiceLoading, setTranslationServiceLoading] = useState(true);
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { currentLogo, loading: logoLoading } = useLogo();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const translationDropdownRef = useRef(null);

  // Track current path for conditional styling
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Set initial path
    updatePath();
    
    // Listen for route changes (works with most routing libraries)
    const handlePopState = () => {
      updatePath();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Also listen for pushstate/replacestate (for SPA navigation)
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
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Check if current page should have dark text when not scrolled
  const shouldUseDarkTextOnTransparent = () => {
    const darkTextPages = ['/about-us', '/impact'];
    return darkTextPages.includes(currentPath);
  };

  // Enhanced scroll handler with better performance
  const handleScroll = useCallback(() => {
    try {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50;
      
      // Only update state if there's a meaningful change
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      }
      
      const newIsScrolled = currentScrollY > scrollThreshold;
      if (newIsScrolled !== isScrolled) {
        setIsScrolled(newIsScrolled);
      }
      
      setLastScrollY(currentScrollY);
    } catch (error) {
      console.warn('Error in scroll handler:', error);
    }
  }, [lastScrollY, isScrolled]);

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

  // Translation service initialization
  useEffect(() => {
    let mounted = true;
    let initTimeout;
    
    const initTranslation = async () => {
      try {
        setTranslationError(null);
        setTranslationServiceLoading(true);
        
        if (!embeddedTranslationService) {
          throw new Error('Translation service not available');
        }

        const success = await embeddedTranslationService.initialize();
        
        if (!mounted) return;
        
        if (success) {
          const languages = embeddedTranslationService.getSupportedLanguages() || {};
          setSupportedLanguages(languages);
          setCurrentLanguage(embeddedTranslationService.getCurrentLanguage() || 'en');
          setIsTranslationServiceReady(true);
          setTranslationError(null);
        } else {
          throw new Error('Translation service initialization failed');
        }
      } catch (error) {
        console.error('Translation service initialization error:', error);
        if (mounted) {
          setTranslationError(error.message || 'Translation service unavailable');
          setIsTranslationServiceReady(false);
          
          initTimeout = setTimeout(() => {
            if (mounted) initTranslation();
          }, 10000);
        }
      } finally {
        if (mounted) {
          setTranslationServiceLoading(false);
        }
      }
    };

    const delayedInit = setTimeout(() => {
      if (mounted) initTranslation();
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(delayedInit);
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, []);

  // Language change listener
  useEffect(() => {
    if (!isTranslationServiceReady || !embeddedTranslationService) return;

    try {
      const unsubscribe = embeddedTranslationService.onLanguageChange?.((languageCode) => {
        if (languageCode && languageCode !== currentLanguage) {
          setCurrentLanguage(languageCode);
        }
      });

      return unsubscribe || (() => {});
    } catch (error) {
      console.warn('Error setting up language change listener:', error);
      return () => {};
    }
  }, [isTranslationServiceReady, currentLanguage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translationDropdownRef.current && !translationDropdownRef.current.contains(event.target)) {
        setIsTranslationDropdownOpen(false);
      }
      
      // Also handle mobile dropdown
      if (isMobile) {
        const mobileWrapper = document.querySelector('.mobile-translation-wrapper');
        if (mobileWrapper && !mobileWrapper.contains(event.target)) {
          setIsTranslationDropdownOpen(false);
        }
      }
    };

    if (isTranslationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); // Add touch support for mobile
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isTranslationDropdownOpen, isMobile]);

  // Close mobile menu when screen size changes
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
    setIsDropdownOpen(false);
    setIsTranslationDropdownOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleDonateClick = useCallback(() => {
    setIsDonationModalOpen(true);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsTranslationDropdownOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleLanguageChange = useCallback(async (languageCode) => {
    if (isChangingLanguage || languageCode === currentLanguage || !isTranslationServiceReady) {
      return;
    }
    
    setIsChangingLanguage(true);
    setTranslationError(null);
    
    try {
      await embeddedTranslationService.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setIsTranslationDropdownOpen(false);
    } catch (error) {
      console.error('Language change error:', error);
      setTranslationError(error.message || 'Failed to change language');
    } finally {
      setIsChangingLanguage(false);
    }
  }, [currentLanguage, isTranslationServiceReady, isChangingLanguage]);

  // Enhanced logo rendering with better error handling
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

  // Get current language info
  const getCurrentLanguageInfo = useCallback(() => {
    try {
      if (isTranslationServiceReady && embeddedTranslationService?.getLanguageInfo) {
        return embeddedTranslationService.getLanguageInfo(currentLanguage);
      }
    } catch (error) {
      console.warn('Error getting language info:', error);
    }
    
    return {
      name: currentLanguage === 'en' ? 'English' : currentLanguage.toUpperCase(),
      flag: currentLanguage === 'en' ? '🇺🇸' : '🌐',
      code: currentLanguage
    };
  }, [isTranslationServiceReady, currentLanguage]);

  // Retry translation service
  const retryTranslationInit = useCallback(async () => {
    setTranslationServiceLoading(true);
    setTranslationError(null);
    
    try {
      await embeddedTranslationService.refresh();
      const languages = embeddedTranslationService.getSupportedLanguages() || {};
      setSupportedLanguages(languages);
      setIsTranslationServiceReady(true);
      setCurrentLanguage(embeddedTranslationService.getCurrentLanguage() || 'en');
    } catch (error) {
      setTranslationError('Failed to initialize translation service');
      setIsTranslationServiceReady(false);
    } finally {
      setTranslationServiceLoading(false);
    }
  }, []);

  // Enhanced dynamic styling
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
  if (isScrolled) {
    return colors?.text || '#1f2937';
  }
  
  // Only use white text on homepage when not scrolled
  if (currentPath === '/') {
    return '#ffffff';
  }
  
  // Use dark text for all other pages when not scrolled
  return colors?.text || '#1f2937';
};

const getTextShadow = () => {
  // Only apply text shadow on homepage when not scrolled
  return (!isScrolled && currentPath === '/') ? '0 1px 3px rgba(0, 0, 0, 0.4)' : 'none';
};

// Enhanced button styles for better contrast on different backgrounds
const getButtonStyles = (isScrolledState, isLightBgPage) => {
  if (isScrolledState) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: colors?.border || '#e5e7eb',
      backdropFilter: 'blur(10px)'
    };
  }

  // Homepage (dark background with hero image)
  if (currentPath === '/') {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    };
  }

  // Other pages (light backgrounds) - use solid background for better contrast
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: colors?.border || '#e5e7eb',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
};


  // Translation dropdown component
  const TranslationDropdown = ({ isMobile: isMobileVersion = false }) => {
    const isLightBgPage = shouldUseDarkTextOnTransparent();
    const buttonStyles = getButtonStyles(isScrolled, isLightBgPage);

    if (translationError) {
      return (
        <Tooltip title={`Translation Error: ${translationError}. Click to retry.`}>
          <motion.button
            onClick={retryTranslationInit}
            className="translation-btn error"
            style={{
              color: getTextColor(),
              ...buttonStyles,
              textShadow: getTextShadow()
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AlertCircle size={isMobileVersion ? 20 : 16} />
            {!isMobileVersion && <span>Error</span>}
          </motion.button>
        </Tooltip>
      );
    }

    const currentLangInfo = getCurrentLanguageInfo();

    return (
      <div className="translation-dropdown" ref={!isMobileVersion ? translationDropdownRef : null}>
        <Tooltip title={translationServiceLoading ? "Loading..." : "Change Language"}>
          <motion.button
            onClick={() => setIsTranslationDropdownOpen(!isTranslationDropdownOpen)}
            disabled={!isTranslationServiceReady || translationServiceLoading}
            className={`translation-btn ${isMobileVersion ? 'mobile' : ''}`}
            style={{
              color: getTextColor(),
              ...buttonStyles,
              textShadow: getTextShadow(),
              opacity: (isTranslationServiceReady && !translationServiceLoading) ? 1 : 0.6,
              cursor: (isTranslationServiceReady && !translationServiceLoading) ? 'pointer' : 'not-allowed'
            }}
            whileHover={(isTranslationServiceReady && !translationServiceLoading) ? { scale: 1.02 } : {}}
            whileTap={(isTranslationServiceReady && !translationServiceLoading) ? { scale: 0.98 } : {}}
          >
            {isMobileVersion ? (
              <Globe size={20} />
            ) : (
              <>
                <span className="flag">{currentLangInfo.flag}</span>
                <span className="lang-code">
                  {currentLanguage === 'en' ? 'EN' : currentLanguage.toUpperCase()}
                </span>
                {translationServiceLoading ? (
                  <div className="loading-spinner small" />
                ) : (
                  <ChevronDown 
                    size={16} 
                    className={`chevron ${isTranslationDropdownOpen ? 'rotated' : ''}`}
                  />
                )}
              </>
            )}
          </motion.button>
        </Tooltip>

        {/* Desktop Dropdown Menu */}
        {!isMobileVersion && (
          <AnimatePresence>
            {isTranslationDropdownOpen && isTranslationServiceReady && (
              <motion.div
                className="translation-menu"
                style={{
                  backgroundColor: colors?.surface || '#ffffff',
                  borderColor: colors?.border || '#e5e7eb'
                }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="menu-header" style={{ borderColor: colors?.border }}>
                  <div className="menu-title">
                    <Globe size={16} style={{ color: colors?.primary }} />
                    <span style={{ color: colors?.text }}>Choose Language</span>
                  </div>
                  <div className="menu-subtitle" style={{ color: colors?.textSecondary }}>
                    {isChangingLanguage ? 'Applying translation...' : 'Select your preferred language'}
                  </div>
                </div>
                
                <div className="languages-list">
                  {Object.entries(supportedLanguages).map(([code, info]) => {
                    const isSelected = currentLanguage === code;
                    const isDisabled = isChangingLanguage && !isSelected;
                    
                    return (
                      <motion.button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        disabled={isChangingLanguage}
                        className={`language-item ${isSelected ? 'selected' : ''}`}
                        style={{
                          backgroundColor: isSelected ? (colors?.primary + '10') : 'transparent',
                          color: colors?.text,
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isChangingLanguage ? 'not-allowed' : 'pointer'
                        }}
                        whileHover={!isChangingLanguage ? {
                          backgroundColor: isSelected ? (colors?.primary + '20') : (colors?.backgroundSecondary || '#f8f9fa')
                        } : {}}
                        whileTap={!isChangingLanguage ? { scale: 0.98 } : {}}
                      >
                        <span className="language-flag">{info.flag}</span>
                        <div className="language-info">
                          <div className="language-name">{info.name}</div>
                          <div className="language-code">{code.toUpperCase()}</div>
                        </div>
                        {isSelected && (
                          <div className="selection-indicator">
                            {isChangingLanguage ? (
                              <div className="loading-spinner small" />
                            ) : (
                              <div
                                className="check-icon"
                                style={{ backgroundColor: colors?.primary }}
                              >
                                <Check size={10} style={{ color: 'white' }} />
                              </div>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                
                <div className="menu-footer" style={{ borderColor: colors?.border }}>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    disabled={isChangingLanguage || currentLanguage === 'en'}
                    className="reset-btn"
                    style={{ 
                      color: colors?.primary,
                      opacity: (isChangingLanguage || currentLanguage === 'en') ? 0.5 : 1
                    }}
                  >
                    Reset to English
                  </button>
                  
                  <div className="powered-by">
                    <div className="status-dot" />
                    <span style={{ color: colors?.textSecondary }}>Google Translate</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <>
      <motion.header 
        className={`header ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : 'hidden'}`}
        style={getHeaderStyles()}
        animate={{
          y: isVisible ? 0 : '-100%',
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <div className="header-container">
          
          {/* Logo */}
          <motion.div 
            className="header-brand"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {renderLogo()}
          </motion.div>
          
          {/* Desktop Navigation */}
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
          
          {/* Right Controls */}
          <div className="header-controls">
            
            {/* Desktop Language Dropdown */}
            {!isMobile && <TranslationDropdown />}
            
            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
              <motion.button
                onClick={toggleTheme}
                className="theme-toggle"
                style={{ 
                  color: getTextColor(),
                  ...getButtonStyles(isScrolled, shouldUseDarkTextOnTransparent()),
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
            
            {/* Mobile Language Toggle with Dropdown */}
            {isMobile && (
              <div className="mobile-translation-wrapper">
                <TranslationDropdown isMobile />
                
                {/* Mobile Translation Dropdown */}
                <AnimatePresence>
                  {isTranslationDropdownOpen && isTranslationServiceReady && (
                    <motion.div
                      className="mobile-translation-dropdown"
                      style={{
                        backgroundColor: colors?.surface || '#ffffff',
                        borderColor: colors?.border || '#e5e7eb'
                      }}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mobile-dropdown-header" style={{ borderColor: colors?.border }}>
                        <div className="mobile-dropdown-title">
                          <Globe size={14} style={{ color: colors?.primary }} />
                          <span style={{ color: colors?.text }}>Language</span>
                        </div>
                      </div>
                      
                      <div className="mobile-dropdown-languages">
                        {Object.entries(supportedLanguages).slice(0, 4).map(([code, info]) => {
                          const isSelected = currentLanguage === code;
                          const isDisabled = isChangingLanguage && !isSelected;
                          
                          return (
                            <motion.button
                              key={code}
                              onClick={() => {
                                handleLanguageChange(code);
                                setIsTranslationDropdownOpen(false);
                              }}
                              disabled={isChangingLanguage}
                              className={`mobile-dropdown-lang-item ${isSelected ? 'selected' : ''}`}
                              style={{
                                backgroundColor: isSelected ? (colors?.primary + '15') : 'transparent',
                                color: colors?.text || '#000000',
                                opacity: isDisabled ? 0.5 : 1,
                                cursor: isChangingLanguage ? 'not-allowed' : 'pointer'
                              }}
                              whileHover={!isChangingLanguage ? { 
                                backgroundColor: isSelected ? (colors?.primary + '25') : (colors?.backgroundSecondary || '#f8f9fa')
                              } : {}}
                              whileTap={!isChangingLanguage ? { scale: 0.98 } : {}}
                            >
                              <span className="mobile-dropdown-flag">{info.flag}</span>
                              <span className="mobile-dropdown-name">{info.name}</span>
                              {isSelected && (
                                <div className="mobile-dropdown-indicator">
                                  {isChangingLanguage ? (
                                    <div className="loading-spinner tiny" />
                                  ) : (
                                    <Check size={10} style={{ color: colors?.primary }} />
                                  )}
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                        
                        {Object.keys(supportedLanguages).length > 4 && (
                          <button
                            className="mobile-dropdown-more"
                            style={{ color: colors?.primary }}
                            onClick={() => {
                              setIsTranslationDropdownOpen(false);
                              // This will be handled by opening the mobile menu
                              setTimeout(() => setIsMobileMenuOpen(true), 100);
                            }}
                          >
                            View all languages
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Donate Button */}
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
            
            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={toggleMobileMenu}
              className="mobile-menu-toggle"
              style={{ 
                color: getTextColor(),
                ...getButtonStyles(isScrolled, shouldUseDarkTextOnTransparent()),
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="overlay-backdrop"
              onClick={toggleMobileMenu}
            />
            
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
                
                {/* Mobile Menu Header */}
                <div className="mobile-menu-header" style={{ borderColor: colors?.border }}>
                  <div className="mobile-menu-brand">
                    {renderLogo()}
                  </div>
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

                {/* Mobile Menu Content */}
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

                  {/* Mobile Language Selector */}
                  <div className="mobile-language-section" style={{ borderColor: colors?.border }}>
                    {translationError ? (
                      <motion.button
                        onClick={retryTranslationInit}
                        className="translation-error-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="error-content">
                          <AlertCircle size={20} />
                          <div>
                            <div className="error-title">Translation Error</div>
                            <div className="error-subtitle">Tap to retry</div>
                          </div>
                        </div>
                      </motion.button>
                    ) : (
                      <div>
                        <div className="section-header">
                          <Globe size={16} style={{ color: colors?.primary }} />
                          <span style={{ color: colors?.text }}>Language</span>
                        </div>
                        
                        <div className="mobile-languages-grid">
                          {Object.entries(supportedLanguages).map(([code, info]) => {
                            const isSelected = currentLanguage === code;
                            const isDisabled = isChangingLanguage && !isSelected;
                            
                            return (
                              <motion.button
                                key={code}
                                onClick={() => handleLanguageChange(code)}
                                disabled={isChangingLanguage}
                                className={`mobile-language-item ${isSelected ? 'selected' : ''}`}
                                style={{
                                  backgroundColor: isSelected ? (colors?.primary + '15') : (colors?.backgroundSecondary || '#f8f9fa'),
                                  borderColor: isSelected ? colors?.primary : (colors?.border || '#e5e7eb'),
                                  color: colors?.text || '#000000',
                                  opacity: isDisabled ? 0.5 : 1,
                                  cursor: isChangingLanguage ? 'not-allowed' : 'pointer'
                                }}
                                whileHover={!isChangingLanguage ? { 
                                  backgroundColor: isSelected ? (colors?.primary + '25') : (colors?.surface || '#ffffff'),
                                  scale: 1.02
                                } : {}}
                                whileTap={!isChangingLanguage ? { scale: 0.98 } : {}}
                              >
                                <span className="mobile-lang-flag">{info.flag}</span>
                                <div className="mobile-lang-info">
                                  <div className="mobile-lang-name">{info.name}</div>
                                </div>
                                {isSelected && (
                                  <div className="mobile-selection-indicator">
                                    {isChangingLanguage ? (
                                      <div className="loading-spinner tiny" />
                                    ) : (
                                      <div
                                        className="mobile-check-icon"
                                        style={{ backgroundColor: colors?.primary }}
                                      >
                                        <Check size={8} style={{ color: 'white' }} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Menu Footer */}
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

      {/* Donation Modal */}
      <DonationModal 
        open={isDonationModalOpen} 
        onClose={() => {
          setIsDonationModalOpen(false);
          document.body.style.overflow = 'auto';
        }}
      />

      {/* Header Styles */}
      <style jsx>{`
        /* Header Base Styles */
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

        /* Logo Styles */
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

        .loading-spinner.small {
          width: 16px;
          height: 16px;
        }

        .loading-spinner.tiny {
          width: 12px;
          height: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.25rem;
        }

        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex;
          }
          .header-container {
            height: 5rem;
          }
        }

        .nav-link {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        /* Header Controls */
        .header-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Theme Toggle */
        .theme-toggle {
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .theme-toggle:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        /* Translation Button */
        .translation-dropdown {
          position: relative;
        }

        .translation-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .translation-btn.mobile {
          padding: 0.5rem;
        }

        .translation-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.15);
        }

        .translation-btn.error:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }

        .translation-btn .flag {
          font-size: 1.125rem;
        }

        .translation-btn .lang-code {
          display: none;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .translation-btn .lang-code {
            display: inline;
          }
        }

        .translation-btn .chevron {
          opacity: 0.7;
          transition: transform 0.2s ease;
        }

        .translation-btn .chevron.rotated {
          transform: rotate(180deg);
        }

        /* Translation Menu */
        .translation-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          width: 16rem;
          border-radius: 0.75rem;
          border: 1px solid;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          z-index: 50;
          overflow: hidden;
        }

        .menu-header {
          padding: 1rem;
          border-bottom: 1px solid;
        }

        .menu-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .menu-subtitle {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .languages-list {
          max-height: 15rem;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .language-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .language-item:disabled {
          cursor: not-allowed;
        }

        .language-flag {
          font-size: 1.125rem;
        }

        .language-info {
          flex: 1;
          min-width: 0;
        }

        .language-name {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .language-code {
          font-size: 0.75rem;
          opacity: 0.6;
          font-family: monospace;
        }

        .selection-indicator {
          flex-shrink: 0;
        }

        .check-icon {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-footer {
          padding: 0.75rem;
          border-top: 1px solid;
          background-color: rgba(0, 0, 0, 0.02);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .reset-btn {
          font-size: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          transition: opacity 0.2s ease;
        }

        .reset-btn:disabled {
          cursor: not-allowed;
        }

        .powered-by {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .status-dot {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 50%;
          background-color: #10b981;
        }

        .powered-by span {
          font-size: 0.75rem;
        }

        /* Donate Button */
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

        /* Mobile Menu Toggle */
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

        /* Mobile Menu Overlay */
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

        .mobile-menu-brand {
          display: flex;
          align-items: center;
        }

        .mobile-close-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .mobile-nav-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .mobile-nav {
          margin-bottom: 2rem;
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
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .mobile-nav-link:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        /* Mobile Language Section */
        .mobile-language-section {
          padding-top: 1.5rem;
          margin-top: 1.5rem;
          border-top: 1px solid;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .translation-error-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #fecaca;
          background-color: #fef2f2;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .translation-error-btn:hover {
          background-color: #fef9c3;
        }

        .error-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .error-title {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .error-subtitle {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .mobile-languages-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          max-height: 12rem;
          overflow-y: auto;
        }

        .mobile-language-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-language-item:disabled {
          cursor: not-allowed;
        }

        .mobile-lang-flag {
          font-size: 1rem;
        }

        .mobile-lang-info {
          flex: 1;
          min-width: 0;
        }

        .mobile-lang-name {
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-selection-indicator {
          flex-shrink: 0;
        }

        .mobile-check-icon {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mobile Menu Footer */
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

        /* Custom Scrollbar */
        .languages-list::-webkit-scrollbar,
        .mobile-languages-grid::-webkit-scrollbar,
        .mobile-nav-content::-webkit-scrollbar {
          width: 4px;
        }

        .languages-list::-webkit-scrollbar-track,
        .mobile-languages-grid::-webkit-scrollbar-track,
        .mobile-nav-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .languages-list::-webkit-scrollbar-thumb,
        .mobile-languages-grid::-webkit-scrollbar-thumb,
        .mobile-nav-content::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }

        .languages-list::-webkit-scrollbar-thumb:hover,
        .mobile-languages-grid::-webkit-scrollbar-thumb:hover,
        .mobile-nav-content::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        /* Focus Styles for Accessibility */
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Smooth transitions for theme changes */
        * {
          transition-property: color, background-color, border-color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Prevent body scroll when mobile menu is open */
        body.menu-open {
          overflow: hidden;
          position: fixed;
          width: 100%;
        }

        /* Responsive Typography */
        @media (max-width: 768px) {
          .header-container {
            padding: 0 0.75rem;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .header.scrolled {
            border-bottom-width: 2px;
          }
          
          .nav-link:hover,
          .translation-btn:hover,
          .theme-toggle:hover {
            background-color: rgba(0, 0, 0, 0.1);
          }
        }

        /* Reduced motion support */
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