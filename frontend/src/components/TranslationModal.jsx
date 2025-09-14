// components/TranslationModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../theme';
import embeddedTranslationService from '../utils/embeddedTranslationService';

const TranslationModal = ({ isOpen, onClose }) => {
  const { colors } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [serviceReady, setServiceReady] = useState(false);

  // Initialize modal state when opened
  useEffect(() => {
    if (isOpen) {
      try {
        const languages = embeddedTranslationService?.getSupportedLanguages() || {};
        setSupportedLanguages(languages);
        
        const currentLang = embeddedTranslationService?.getCurrentLanguage() || 'en';
        setSelectedLanguage(currentLang);
        
        const ready = embeddedTranslationService?.isReady() || false;
        setServiceReady(ready);
        
        setChangeError(null);
      } catch (error) {
        console.error('Error initializing translation modal:', error);
        setChangeError('Failed to load translation service');
      }
    }
  }, [isOpen]);

  // Handle language change with comprehensive error handling
  const handleLanguageChange = async (languageCode) => {
    if (isChanging || languageCode === selectedLanguage || !serviceReady) {
      return;
    }
    
    console.log(`Changing language to: ${languageCode}`);
    
    setIsChanging(true);
    setChangeError(null);
    setSelectedLanguage(languageCode);
    
    try {
      // Ensure service is ready
      if (!embeddedTranslationService || !embeddedTranslationService.isReady()) {
        throw new Error('Translation service is not ready');
      }

      // Perform language change
      await embeddedTranslationService.changeLanguage(languageCode);
      
      console.log(`Language successfully changed to: ${languageCode}`);
      
      // Close modal after successful change with delay for user feedback
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        setIsChanging(false);
      }, 1500);
      
    } catch (error) {
      console.error('Language change error:', error);
      setChangeError(error.message || 'Failed to change language');
      setIsChanging(false);
      
      // Reset selection on error
      try {
        const currentLang = embeddedTranslationService?.getCurrentLanguage() || 'en';
        setSelectedLanguage(currentLang);
      } catch (resetError) {
        console.error('Error resetting language:', resetError);
        setSelectedLanguage('en');
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isChanging && onClose) {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isChanging) {
      handleClose();
    }
  };

  // Retry service initialization
  const handleRetryService = async () => {
    try {
      setChangeError(null);
      await embeddedTranslationService?.refresh();
      
      const languages = embeddedTranslationService?.getSupportedLanguages() || {};
      setSupportedLanguages(languages);
      
      const currentLang = embeddedTranslationService?.getCurrentLanguage() || 'en';
      setSelectedLanguage(currentLang);
      
      const ready = embeddedTranslationService?.isReady() || false;
      setServiceReady(ready);
    } catch (error) {
      console.error('Error retrying service:', error);
      setChangeError('Failed to initialize translation service');
    }
  };

  // Reset to English
  const handleResetToEnglish = async () => {
    if (selectedLanguage === 'en' || !serviceReady) return;
    await handleLanguageChange('en');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl shadow-2xl"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              maxHeight: '90vh',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-full"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Globe size={20} style={{ color: colors.primary }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
                    Choose Language
                  </h2>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {isChanging 
                      ? 'Applying translation...' 
                      : changeError 
                        ? 'Translation service error' 
                        : !serviceReady 
                          ? 'Service not ready'
                          : 'Select your preferred language'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                disabled={isChanging}
                className="p-2 rounded-full transition-colors hover:bg-gray-100"
                style={{
                  color: colors.textSecondary,
                  backgroundColor: 'transparent',
                  opacity: isChanging ? 0.5 : 1,
                  cursor: isChanging ? 'not-allowed' : 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {changeError && (
              <div 
                className="px-6 py-3 border-b"
                style={{ 
                  backgroundColor: '#fef2f2',
                  borderColor: colors.border,
                  borderBottomColor: '#fecaca'
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} style={{ color: '#dc2626' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
                      Translation Error
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#991b1b' }}>
                      {changeError}
                    </p>
                  </div>
                  <button
                    onClick={handleRetryService}
                    className="p-1 rounded-full hover:bg-red-100 transition-colors"
                    style={{ color: '#dc2626' }}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Language Grid */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {!serviceReady ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div
                    className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-4"
                    style={{ color: colors.primary }}
                  />
                  <h3 className="font-medium mb-2" style={{ color: colors.text }}>
                    Loading Translation Service
                  </h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Please wait while we initialize the translation service...
                  </p>
                  <button
                    onClick={handleRetryService}
                    className="mt-4 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ 
                      borderColor: colors.border,
                      color: colors.text 
                    }}
                  >
                    <RefreshCw size={16} className="inline mr-2" />
                    Retry
                  </button>
                </div>
              ) : Object.keys(supportedLanguages).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle size={48} style={{ color: colors.textSecondary }} className="mb-4" />
                  <h3 className="font-medium mb-2" style={{ color: colors.text }}>
                    No Languages Available
                  </h3>
                  <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                    Unable to load supported languages.
                  </p>
                  <button
                    onClick={handleRetryService}
                    className="px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ 
                      borderColor: colors.border,
                      color: colors.text 
                    }}
                  >
                    <RefreshCw size={16} className="inline mr-2" />
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(supportedLanguages).map(([code, info]) => {
                    const isSelected = selectedLanguage === code;
                    const isDisabled = isChanging && !isSelected;
                    
                    return (
                      <motion.button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        disabled={isChanging || !serviceReady}
                        className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left relative overflow-hidden"
                        style={{
                          backgroundColor: isSelected 
                            ? colors.primary + '15' 
                            : colors.backgroundSecondary,
                          border: `2px solid ${isSelected ? colors.primary : 'transparent'}`,
                          color: colors.text,
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: (isChanging || !serviceReady) ? 'not-allowed' : 'pointer'
                        }}
                        whileHover={!isChanging && serviceReady ? {
                          scale: 1.02,
                          backgroundColor: isSelected 
                            ? colors.primary + '25' 
                            : colors.surface
                        } : {}}
                        whileTap={!isChanging && serviceReady ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0" role="img" aria-label={`${info.name} flag`}>
                            {info.flag}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base truncate">
                              {info.name}
                            </div>
                            <div className="text-sm opacity-70 font-mono">
                              {code.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-2">
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center"
                            >
                              {isChanging ? (
                                <div
                                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
                                  style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}
                                />
                              ) : (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: colors.primary }}
                                >
                                  <Check size={14} style={{ color: 'white' }} />
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                        
                        {/* Loading overlay for changing language */}
                        {isChanging && isSelected && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center rounded-xl"
                            style={{ 
                              backgroundColor: colors.primary + '20',
                              backdropFilter: 'blur(2px)'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <div
                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                                style={{ borderColor: colors.primary }}
                              />
                              <span style={{ color: colors.primary }}>
                                Translating...
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleResetToEnglish}
                  disabled={isChanging || selectedLanguage === 'en' || !serviceReady}
                  className="text-sm transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    color: colors.primary,
                    opacity: (isChanging || selectedLanguage === 'en' || !serviceReady) ? 0.5 : 1
                  }}
                >
                  {isChanging && selectedLanguage === 'en' ? 'Resetting...' : 'Reset to English'}
                </button>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: serviceReady ? '#10B981' : '#ef4444'
                    }}
                  />
                  <span className="text-xs" style={{ color: colors.textSecondary }}>
                    {serviceReady ? 'Ready • Powered by Google Translate' : 'Service Unavailable'}
                  </span>
                </div>
              </div>
              
              {/* Progress indicator when changing language */}
              {isChanging && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span style={{ color: colors.textSecondary }}>
                      Applying translation...
                    </span>
                    <span style={{ color: colors.textSecondary }}>
                      Please wait
                    </span>
                  </div>
                  <div 
                    className="w-full h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors.primary }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TranslationModal;