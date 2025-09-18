import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TreePine, Menu, X, Sun, Moon, ChevronDown, Globe, AlertCircle, Check } from 'lucide-react';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme';
import { useLogo } from '../context/LogoContext';
import styles from '../styles/Header.module.css';
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
  
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { currentLogo, loading: logoLoading } = useLogo();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const translationDropdownRef = useRef(null);

  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    try {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    } catch (error) {
      console.warn('Error in scroll handler:', error);
    }
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

  // Enhanced translation service initialization
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

        console.log('Initializing translation service...');
        
        // Wait for the service to initialize
        const success = await embeddedTranslationService.initialize();
        
        if (!mounted) return;
        
        if (success) {
          const languages = embeddedTranslationService.getSupportedLanguages() || {};
          setSupportedLanguages(languages);
          setCurrentLanguage(embeddedTranslationService.getCurrentLanguage() || 'en');
          setIsTranslationServiceReady(true);
          setTranslationError(null);
          console.log('Translation service initialized successfully');
        } else {
          throw new Error('Translation service initialization failed');
        }
      } catch (error) {
        console.error('Translation service initialization error:', error);
        if (mounted) {
          setTranslationError(error.message || 'Translation service unavailable');
          setIsTranslationServiceReady(false);
          
          // Retry after delay
          initTimeout = setTimeout(() => {
            if (mounted) {
              console.log('Retrying translation service initialization...');
              initTranslation();
            }
          }, 10000);
        }
      } finally {
        if (mounted) {
          setTranslationServiceLoading(false);
        }
      }
    };

    // Start initialization after a delay to ensure DOM is ready
    const delayedInit = setTimeout(() => {
      if (mounted) {
        initTranslation();
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(delayedInit);
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  // Enhanced language change listener
  useEffect(() => {
    if (!isTranslationServiceReady || !embeddedTranslationService) {
      return;
    }

    try {
      console.log('Setting up language change listener...');
      const unsubscribe = embeddedTranslationService.onLanguageChange?.((languageCode) => {
        if (languageCode && languageCode !== currentLanguage) {
          console.log('Language changed to:', languageCode);
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
    };

    if (isTranslationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isTranslationDropdownOpen]);

  // Close mobile menu when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
      try {
        document.body.style.overflow = 'auto';
      } catch (error) {
        console.warn('Error restoring body scroll:', error);
      }
    }
  }, [isMobile]);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        try {
          document.body.style.overflow = 'auto';
        } catch (error) {
          console.warn('Error restoring body scroll:', error);
        }
      }
    };

    if (isMobileMenuOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobileMenuOpen]);

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us'},
    { label: 'Programs', href: '/programs' },
    { label: 'Impact', href: '/impact'},
    { label: 'Our Reach', href: '/findbycountry' },
    { label: 'Insights', href: '/insights' },
    { label: 'Get Involved', href: '/get-involved' },
    { label: 'Contact', href: '/contact-us' },
  ];

  const handleDropdownToggle = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleTranslationDropdownToggle = useCallback(() => {
    if (!isTranslationServiceReady) {
      console.warn('Translation service not ready');
      return;
    }
    setIsTranslationDropdownOpen(prev => !prev);
  }, [isTranslationServiceReady]);

  const closeTranslationDropdown = useCallback(() => {
    setIsTranslationDropdownOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    try {
      document.body.style.overflow = newState ? 'hidden' : 'auto';
    } catch (error) {
      console.warn('Error toggling body scroll:', error);
    }
  }, [isMobileMenuOpen]);

  const handleNavClick = useCallback(() => {
    setIsMobileMenuOpen(false);
    closeDropdown();
    closeTranslationDropdown();
    try {
      document.body.style.overflow = 'auto';
    } catch (error) {
      console.warn('Error restoring body scroll:', error);
    }
  }, [closeDropdown, closeTranslationDropdown]);

  const handleDonateClick = useCallback(() => {
    setIsDonationModalOpen(true);
    setIsMobileMenuOpen(false);
    closeDropdown();
    closeTranslationDropdown();
    try {
      document.body.style.overflow = 'auto';
    } catch (error) {
      console.warn('Error handling donate click:', error);
    }
  }, [closeDropdown, closeTranslationDropdown]);

  const handleLanguageChange = useCallback(async (languageCode) => {
    if (isChangingLanguage || languageCode === currentLanguage || !isTranslationServiceReady) {
      return;
    }
    
    console.log(`Changing language to: ${languageCode}`);
    setIsChangingLanguage(true);
    setTranslationError(null);
    
    try {
      await embeddedTranslationService.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setIsTranslationDropdownOpen(false);
      console.log(`Language successfully changed to: ${languageCode}`);
    } catch (error) {
      console.error('Language change error:', error);
      setTranslationError(error.message || 'Failed to change language');
    } finally {
      setIsChangingLanguage(false);
    }
  }, [currentLanguage, isTranslationServiceReady, isChangingLanguage]);

  const handleThemeToggle = useCallback(() => {
    try {
      toggleTheme();
    } catch (error) {
      console.warn('Error toggling theme:', error);
    }
  }, [toggleTheme]);

  // Render logo with error handling
  const renderLogo = useCallback(() => {
    if (logoLoading) {
      return (
        <div 
          className={styles.logo} 
          style={{ 
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            border: `2px solid ${colors?.primary || '#2563eb'}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      );
    }

    if (currentLogo?.full_url) {
      return (
        <div className={styles.logo}>
          <img 
            src={currentLogo.full_url} 
            alt={currentLogo.alt_text || 'ACEF Logo'}
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'contain',
              filter: !isScrolled ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
            }}
            onError={(e) => {
              try {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'block';
                }
              } catch (error) {
                console.warn('Error handling logo error:', error);
              }
            }}
          />
          <TreePine 
            size={32} 
            style={{ 
              color: colors?.primary || '#2563eb',
              display: 'none'
            }} 
          />
        </div>
      );
    }

    return <TreePine size={32} style={{ color: colors?.primary || '#2563eb' }} />;
  }, [currentLogo, colors, isScrolled]);

  // Get current language info for display with error handling
  const getCurrentLanguageInfo = useCallback(() => {
    try {
      if (isTranslationServiceReady && embeddedTranslationService?.getLanguageInfo) {
        return embeddedTranslationService.getLanguageInfo(currentLanguage);
      }
    } catch (error) {
      console.warn('Error getting language info:', error);
    }
    
    // Fallback language info
    return {
      name: currentLanguage === 'en' ? 'English' : currentLanguage.toUpperCase(),
      flag: currentLanguage === 'en' ? '🇺🇸' : '🌐',
      code: currentLanguage
    };
  }, [isTranslationServiceReady, currentLanguage]);

  // Safe modal close handlers
  const handleDonationModalClose = useCallback(() => {
    setIsDonationModalOpen(false);
    try {
      document.body.style.overflow = 'auto';
    } catch (error) {
      console.warn('Error restoring body scroll:', error);
    }
  }, []);

  // Retry translation service initialization
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

  // Dynamic text color based on scroll state
  const textColor = isScrolled ? (colors?.text || '#000000') : (isDarkMode ? '#ffffff' : '#ffffff');

  // Render translation dropdown button
  const renderTranslationDropdown = useCallback((isMobileVersion = false) => {
    if (translationError) {
      return (
        <Tooltip title={`Translation Error: ${translationError}. Click to retry.`}>
          <motion.button
            onClick={retryTranslationInit}
            className={`flex items-center gap-2 ${isMobileVersion ? 'p-2 rounded-full' : 'px-3 py-2 rounded-lg'} transition-all duration-200`}
            style={{
              color: textColor,
              backgroundColor: !isScrolled ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: `1px solid ${!isScrolled ? 'rgba(255,255,255,0.2)' : (colors?.border || '#e5e7eb')}`,
              backdropFilter: !isScrolled ? 'blur(10px)' : 'none',
              textShadow: !isScrolled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              opacity: 0.8
            }}
            whileHover={{
              backgroundColor: colors?.surface || '#ffffff',
              borderColor: '#ef4444',
              scale: 1.02
            }}
            whileTap={{ scale: 0.98 }}
          >
            {isMobileVersion ? (
              <AlertCircle size={20} />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg">🌐</span>
                <span className="hidden sm:inline text-sm font-medium">Error</span>
                <AlertCircle size={16} className="opacity-70" />
              </div>
            )}
          </motion.button>
        </Tooltip>
      );
    }

    const currentLangInfo = getCurrentLanguageInfo();

    return (
      <div className="relative" ref={translationDropdownRef}>
        <Tooltip title={translationServiceLoading ? "Loading translation service..." : "Change Language"}>
          <motion.button
            onClick={handleTranslationDropdownToggle}
            disabled={!isTranslationServiceReady || translationServiceLoading}
            className={`flex items-center gap-2 ${isMobileVersion ? 'p-2 rounded-full' : 'px-3 py-2 rounded-lg'} transition-all duration-200`}
            style={{
              color: textColor,
              backgroundColor: !isScrolled ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: `1px solid ${!isScrolled ? 'rgba(255,255,255,0.2)' : (colors?.border || '#e5e7eb')}`,
              backdropFilter: !isScrolled ? 'blur(10px)' : 'none',
              textShadow: !isScrolled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              opacity: (isTranslationServiceReady && !translationServiceLoading) ? 1 : 0.6,
              cursor: (isTranslationServiceReady && !translationServiceLoading) ? 'pointer' : 'not-allowed'
            }}
            whileHover={(isTranslationServiceReady && !translationServiceLoading) ? {
              backgroundColor: colors?.surface || '#ffffff',
              borderColor: colors?.primary || '#2563eb',
              scale: 1.02
            } : {}}
            whileTap={(isTranslationServiceReady && !translationServiceLoading) ? { scale: 0.98 } : {}}
          >
            {isMobileVersion ? (
              <Globe size={20} />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentLangInfo.flag}</span>
                <span className="hidden sm:inline text-sm font-medium">
                  {currentLanguage === 'en' ? 'EN' : currentLanguage.toUpperCase()}
                </span>
                {translationServiceLoading ? (
                  <div
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
                  />
                ) : (
                  <ChevronDown 
                    size={16} 
                    className="opacity-70"
                    style={{
                      transform: isTranslationDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                )}
              </div>
            )}
          </motion.button>
        </Tooltip>

        {/* Translation Dropdown Menu */}
        {!isMobileVersion && (
          <AnimatePresence>
            {isTranslationDropdownOpen && isTranslationServiceReady && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-xl border z-50"
                style={{
                  backgroundColor: colors?.surface || '#ffffff',
                  borderColor: colors?.border || '#e5e7eb',
                  boxShadow: `0 8px 32px ${colors?.cardShadow || 'rgba(0,0,0,0.15)'}`
                }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 border-b" style={{ borderColor: colors?.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={16} style={{ color: colors?.primary }} />
                    <span className="text-sm font-semibold" style={{ color: colors?.text }}>
                      Choose Language
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: colors?.textSecondary }}>
                    {isChangingLanguage ? 'Applying translation...' : 'Select your preferred language'}
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto p-2">
                  {Object.entries(supportedLanguages).map(([code, info]) => {
                    const isSelected = currentLanguage === code;
                    const isDisabled = isChangingLanguage && !isSelected;
                    
                    return (
                      <motion.button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        disabled={isChangingLanguage}
                        className="w-full flex items-center gap-3 p-2 rounded-md transition-all duration-200 text-left"
                        style={{
                          backgroundColor: isSelected ? (colors?.primary + '15') : 'transparent',
                          color: colors?.text,
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isChangingLanguage ? 'not-allowed' : 'pointer'
                        }}
                        whileHover={!isChangingLanguage ? {
                          backgroundColor: isSelected ? (colors?.primary + '25') : (colors?.backgroundSecondary || '#f3f4f6')
                        } : {}}
                      >
                        <span className="text-lg flex-shrink-0">{info.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{info.name}</div>
                          <div className="text-xs opacity-70 font-mono">{code.toUpperCase()}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected && (
                            <div className="flex items-center">
                              {isChangingLanguage ? (
                                <div
                                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                                  style={{ borderColor: colors?.primary, borderTopColor: 'transparent' }}
                                />
                              ) : (
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: colors?.primary }}
                                >
                                  <Check size={10} style={{ color: 'white' }} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                
                <div className="p-3 border-t" style={{ borderColor: colors?.border }}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      disabled={isChangingLanguage || currentLanguage === 'en'}
                      className="text-xs transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        color: colors?.primary,
                        opacity: (isChangingLanguage || currentLanguage === 'en') ? 0.5 : 1
                      }}
                    >
                      Reset to English
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#10B981' }}
                      />
                      <span className="text-xs" style={{ color: colors?.textSecondary }}>
                        Google Translate
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }, [
    translationError,
    retryTranslationInit,
    textColor,
    isScrolled,
    colors,
    getCurrentLanguageInfo,
    currentLanguage,
    translationServiceLoading,
    isTranslationServiceReady,
    handleTranslationDropdownToggle,
    isTranslationDropdownOpen,
    supportedLanguages,
    isChangingLanguage,
    handleLanguageChange
  ]);

  return (
    <>
      <motion.header 
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
        style={{
          backgroundColor: isScrolled ? (colors?.headerBgScrolled || 'rgba(255,255,255,0.95)') : 'transparent',
          borderBottom: isScrolled ? `1px solid ${colors?.headerBorder || '#e5e7eb'}` : 'none',
          boxShadow: isScrolled ? `0 4px 20px ${colors?.headerShadow || 'rgba(0,0,0,0.1)'}` : 'none',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none'
        }}
        animate={{
          y: isVisible ? 0 : '-100%',
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <div className={styles.container}>
          {/* Brand - Logo Only */}
          <motion.div 
            className={styles.navBrand}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {renderLogo()}
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className={`${styles.navMenu} ${isMobile ? styles.hidden : ''}`}>
            {navigationItems.map((item, index) => (
              <div key={index} className={styles.navItem}>
                {item.hasDropdown ? (
                  <div className={styles.dropdown}>
                    <button
                      className={styles.dropdownToggle}
                      onClick={handleDropdownToggle}
                      style={{ 
                        color: textColor,
                        textShadow: !isScrolled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {item.label}
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          className={styles.dropdownMenu}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            backgroundColor: colors?.surface || '#ffffff',
                            border: `1px solid ${colors?.border || '#e5e7eb'}`,
                            boxShadow: `0 8px 32px ${colors?.cardShadow || 'rgba(0,0,0,0.1)'}`
                          }}
                        >
                          {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                            <motion.a
                              key={dropdownIndex}
                              href={dropdownItem.href}
                              className={styles.dropdownItem}
                              onClick={closeDropdown}
                              style={{ color: colors?.text || '#000000' }}
                              whileHover={{ backgroundColor: colors?.backgroundSecondary || '#f3f4f6' }}
                            >
                              {dropdownItem.label}
                            </motion.a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a 
                    href={item.href}
                    className={styles.navLink}
                    style={{ 
                      color: textColor,
                      textShadow: !isScrolled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            
            {/* Desktop Language Dropdown */}
            {renderTranslationDropdown(false)}
            
            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
              <IconButton
                onClick={handleThemeToggle}
                className={styles.themeToggle}
                size="small"
                style={{ 
                  color: textColor,
                  marginLeft: '0.5rem',
                  backgroundColor: !isScrolled ? 'rgba(255,255,255,0.1)' : 'transparent',
                  backdropFilter: !isScrolled ? 'blur(10px)' : 'none'
                }}
              >
                <motion.div
                  key={isDarkMode ? 'moon' : 'sun'}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
              </IconButton>
            </Tooltip>
            
            {/* Donate Button */}
            <motion.button 
              className={styles.donateBtn}
              onClick={handleDonateClick}
              whileHover={{ 
                scale: 1.05,
                boxShadow: `0 8px 25px rgba(${(colors?.secondary || '#f59e0b').slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '245, 158, 11'}, 0.4)`
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: colors?.secondary || '#f59e0b',
                color: colors?.black || '#000000',
                border: 'none',
                cursor: 'pointer',
                boxShadow: !isScrolled ? '0 4px 15px rgba(0,0,0,0.2)' : `0 2px 10px ${colors?.secondary || '#f59e0b'}30`
              }}
            >
              Donate Now
            </motion.button>
          </nav>

          {/* Mobile Controls */}
          {isMobile && (
            <div className={styles.mobileControls}>
              {/* Mobile Language Toggle */}
              {renderTranslationDropdown(true)}
              
              {/* Theme Toggle for Mobile */}
              <IconButton
                onClick={handleThemeToggle}
                size="small"
                style={{ 
                  color: textColor,
                  backgroundColor: !isScrolled ? 'rgba(255,255,255,0.1)' : 'transparent',
                  backdropFilter: !isScrolled ? 'blur(10px)' : 'none'
                }}
              >
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </IconButton>
              
              {/* Mobile Menu Toggle */}
              <IconButton
                onClick={toggleMobileMenu}
                className={styles.mobileMenuToggle}
                style={{ 
                  color: textColor,
                  backgroundColor: !isScrolled ? 'rgba(255,255,255,0.1)' : 'transparent',
                  backdropFilter: !isScrolled ? 'blur(10px)' : 'none'
                }}
              >
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </IconButton>
            </div>
          )}
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileMenuOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ 
              backgroundColor: colors?.overlayBg || 'rgba(0,0,0,0.5)',
              zIndex: 9999
            }}
            onClick={toggleMobileMenu}
          >
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={{ 
                backgroundColor: colors?.surface || '#ffffff',
                borderLeft: `1px solid ${colors?.border || '#e5e7eb'}`,
                boxShadow: `-10px 0 30px ${colors?.cardShadow || 'rgba(0,0,0,0.1)'}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.mobileMenuHeader}>
                <div className={styles.mobileMenuBrand}>
                  {renderLogo()}
                </div>
                <IconButton
                  onClick={toggleMobileMenu}
                  style={{ color: colors?.text || '#000000' }}
                >
                  <X size={24} />
                </IconButton>
              </div>

              <div className={styles.mobileMenuContent}>
                {navigationItems.map((item, index) => (
                  <div key={index} className={styles.mobileNavItem}>
                    {item.hasDropdown ? (
                      <>
                        <button
                          className={styles.mobileDropdownToggle}
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          style={{ color: colors?.text || '#000000' }}
                        >
                          {item.label}
                          <motion.div
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={16} />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              className={styles.mobileDropdownMenu}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                                <a
                                  key={dropdownIndex}
                                  href={dropdownItem.href}
                                  className={styles.mobileDropdownItem}
                                  onClick={handleNavClick}
                                  style={{ color: colors?.textSecondary || '#6b7280' }}
                                >
                                  {dropdownItem.label}
                                </a>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={item.href}
                        className={styles.mobileNavLink}
                        onClick={handleNavClick}
                        style={{ 
                          color: colors?.text || '#000000',
                          textDecoration: 'none',
                          padding: '12px 0',
                          display: 'block',
                          borderBottom: `1px solid ${colors?.border || '#e5e7eb'}20`,
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}

                {/* Language Selector in Mobile Menu */}
                <div className={styles.mobileLanguageSelector} style={{ 
                  padding: '20px 0', 
                  borderTop: `1px solid ${colors?.border || '#e5e7eb'}`,
                  marginTop: '16px'
                }}>
                  {translationError ? (
                    <motion.button
                      onClick={retryTranslationInit}
                      className="flex items-center justify-between w-full p-3 rounded-lg transition-colors"
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626'
                      }}
                      whileHover={{ backgroundColor: '#fef9c3' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle size={20} />
                        <div className="text-left">
                          <div className="font-medium">Translation Error</div>
                          <div className="text-sm opacity-70">Tap to retry</div>
                        </div>
                      </div>
                    </motion.button>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Globe size={16} style={{ color: colors?.primary }} />
                        <span className="text-sm font-semibold" style={{ color: colors?.text }}>
                          Language
                        </span>
                      </div>
                      
                      {/* Mobile Language Grid */}
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {Object.entries(supportedLanguages).map(([code, info]) => {
                          const isSelected = currentLanguage === code;
                          const isDisabled = isChangingLanguage && !isSelected;
                          
                          return (
                            <motion.button
                              key={code}
                              onClick={() => handleLanguageChange(code)}
                              disabled={isChangingLanguage}
                              className="flex items-center gap-2 p-2 rounded-lg transition-colors text-left"
                              style={{
                                backgroundColor: isSelected ? (colors?.primary + '15') : (colors?.backgroundSecondary || '#f3f4f6'),
                                border: `1px solid ${isSelected ? colors?.primary : (colors?.border || '#e5e7eb')}`,
                                color: colors?.text || '#000000',
                                opacity: isDisabled ? 0.5 : 1,
                                cursor: isChangingLanguage ? 'not-allowed' : 'pointer'
                              }}
                              whileHover={!isChangingLanguage ? { 
                                backgroundColor: isSelected ? (colors?.primary + '25') : (colors?.surface || '#ffffff')
                              } : {}}
                              whileTap={!isChangingLanguage ? { scale: 0.98 } : {}}
                            >
                              <span className="text-base">{info.flag}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{info.name}</div>
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0">
                                  {isChangingLanguage ? (
                                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-70" />
                                  ) : (
                                    <div
                                      className="w-3 h-3 rounded-full flex items-center justify-center"
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

                {/* Mobile Donate Button */}
                <motion.button
                  className={styles.mobileDonateBtn}
                  onClick={handleDonateClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: colors?.secondary || '#f59e0b',
                    color: colors?.black || '#000000',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    marginTop: '20px',
                    boxShadow: `0 4px 15px ${colors?.secondary || '#f59e0b'}40`
                  }}
                >
                  Donate Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <DonationModal 
        open={isDonationModalOpen} 
        onClose={handleDonationModalClose}
      />

      {/* Add CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Header;