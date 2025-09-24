// utils/embeddedTranslationService.js
class EmbeddedTranslationService {
  constructor() {
    this.isInitialized = false;
    this.currentLanguage = 'en';
    this.supportedLanguages = {
      'en': { name: 'English', flag: '🇺🇸' },
      'es': { name: 'Español', flag: '🇪🇸' },
      'fr': { name: 'Français', flag: '🇫🇷' },
      'de': { name: 'Deutsch', flag: '🇩🇪' },
      'it': { name: 'Italiano', flag: '🇮🇹' },
      'pt': { name: 'Português', flag: '🇵🇹' },
      'ru': { name: 'Русский', flag: '🇷🇺' },
      'zh': { name: '中文', flag: '🇨🇳' },
      'ja': { name: '日本語', flag: '🇯🇵' },
      'ar': { name: 'العربية', flag: '🇸🇦' },
      'sw': { name: 'Kiswahili', flag: '🇰🇪' },
      'am': { name: 'አማርኛ', flag: '🇪🇹' }
    };
    this.callbacks = new Set();
    this.googleWidget = null;
    this.isTranslating = false;
    this.useManualTranslation = true; // Default to manual to avoid Google issues
    this.hideStylesApplied = false;
    
    // Enhanced error protection
    this.processingCallback = false;
    this.lastLanguageChange = 0;
    this.mutationObserver = null;
    this.googleScriptLoaded = false;
    this.preventGoogleLoad = false;
    
    // Monitor for stack overflow errors
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    // Catch stack overflow and other Google Translate errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      // Check if error is from Google Translate
      if (message && typeof message === 'string') {
        const isGoogleError = message.includes('Maximum call stack size exceeded') ||
                             source?.includes('translate.google') ||
                             source?.includes('m=el_main');
        
        if (isGoogleError) {
          console.warn('Google Translate error detected, preventing further loads:', message);
          this.preventGoogleLoad = true;
          this.useManualTranslation = true;
          
          // Clean up any Google elements
          this.cleanupGoogleElements();
          return true; // Prevent error from bubbling up
        }
      }
      
      // Call original handler if exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Also catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('translate') || 
          event.reason?.stack?.includes('google')) {
        console.warn('Google Translate promise rejection:', event.reason);
        this.preventGoogleLoad = true;
        this.useManualTranslation = true;
        event.preventDefault();
      }
    });
  }

  // Initialize with Google Translate completely disabled due to issues
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    console.log('Initializing translation service...');
    
    // Apply hiding styles to prevent any Google UI
    this.applyAllHidingStyles();
    
    // Skip Google Translate entirely due to stack overflow issues
    if (this.preventGoogleLoad) {
      console.log('Google Translate disabled due to previous errors, using manual mode');
      this.useManualTranslation = true;
      this.isInitialized = true;
      return true;
    }

    // Try Google Translate with strict limits
    try {
      console.log('Attempting Google Translate initialization...');
      await this.initializeGoogleTranslateWithLimits();
      console.log('Google Translate initialized successfully');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Google Translate failed, using manual approach:', error);
      this.cleanupGoogleElements();
      this.useManualTranslation = true;
      this.isInitialized = true;
      return true;
    }
  }

  async initializeGoogleTranslateWithLimits() {
    return new Promise((resolve, reject) => {
      // Much shorter timeout to fail fast
      const timeout = setTimeout(() => {
        this.cleanupGoogleElements();
        reject(new Error('Google Translate initialization timeout'));
      }, 5000); // Reduced from 8000

      // Wrap in try-catch to handle immediate errors
      try {
        Promise.race([
          this.loadGoogleScriptSafely(),
          new Promise((_, rejectRace) => 
            setTimeout(() => rejectRace(new Error('Script load timeout')), 3000)
          )
        ])
        .then(() => this.createGoogleWidgetSafely())
        .then(() => this.waitForGoogleWidgetSafely())
        .then(() => {
          clearTimeout(timeout);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeout);
          this.cleanupGoogleElements();
          reject(error);
        });
      } catch (error) {
        clearTimeout(timeout);
        this.cleanupGoogleElements();
        reject(error);
      }
    });
  }

  loadGoogleScriptSafely() {
    return new Promise((resolve, reject) => {
      // If already loaded or we should prevent loading
      if (this.googleScriptLoaded || this.preventGoogleLoad) {
        if (window.google?.translate?.TranslateElement) {
          resolve();
        } else {
          reject(new Error('Google Translate not available'));
        }
        return;
      }

      if (window.google?.translate?.TranslateElement) {
        this.googleScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      const callbackName = `gtInit${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up callback with timeout protection
      let callbackExecuted = false;
      window[callbackName] = () => {
        if (callbackExecuted) return;
        callbackExecuted = true;
        
        delete window[callbackName];
        this.googleScriptLoaded = true;
        resolve();
      };
      
      script.src = `//translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        if (!callbackExecuted) {
          callbackExecuted = true;
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error('Script load failed'));
        }
      };
      
      // Prevent multiple script loads
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        reject(new Error('Google Translate script already loading'));
        return;
      }
      
      document.head.appendChild(script);
      
      // Additional timeout for callback
      setTimeout(() => {
        if (!callbackExecuted) {
          callbackExecuted = true;
          delete window[callbackName];
          reject(new Error('Callback timeout'));
        }
      }, 4000);
    });
  }

  async createGoogleWidgetSafely() {
    // Clean up any existing containers
    const existing = document.getElementById('google_translate_element');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.cssText = `
      position: fixed !important;
      top: -9999px !important;
      left: -9999px !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      z-index: -9999 !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    `;
    document.body.appendChild(container);

    try {
      // Create widget with error handling
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: Object.keys(this.supportedLanguages).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, 'google_translate_element');
    } catch (error) {
      console.error('Widget creation failed:', error);
      container.remove();
      throw error;
    }
  }

  waitForGoogleWidgetSafely() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 3; // Reduced attempts
      
      const check = () => {
        try {
          const select = document.querySelector('#google_translate_element .goog-te-combo');
          if (select && select.options && select.options.length > 1) {
            this.googleWidget = select;
            this.setupGoogleListenerSafely();
            resolve();
            return;
          }
        } catch (error) {
          console.warn('Widget check error:', error);
        }
        
        if (attempts++ < maxAttempts) {
          setTimeout(check, 800); // Reduced timeout
        } else {
          this.cleanupGoogleElements();
          reject(new Error('Widget not found after multiple attempts'));
        }
      };
      
      setTimeout(check, 1000); // Reduced initial delay
    });
  }

  setupGoogleListenerSafely() {
    if (!this.googleWidget) return;
    
    try {
      this.googleWidget.addEventListener('change', (e) => {
        try {
          const lang = e.target.value;
          const now = Date.now();
          
          // Strict timing controls
          if (now - this.lastLanguageChange < 2000 || this.processingCallback) {
            return;
          }
          
          if (lang !== this.currentLanguage) {
            this.currentLanguage = lang;
            this.lastLanguageChange = now;
            
            // Delay callback to prevent recursion
            setTimeout(() => {
              if (!this.processingCallback) {
                this.notifyCallbacks(lang);
              }
            }, 200);
          }
        } catch (error) {
          console.warn('Google listener error:', error);
        }
      }, { passive: true });
    } catch (error) {
      console.warn('Failed to setup Google listener:', error);
    }
  }

  cleanupGoogleElements() {
    try {
      // Remove Google Translate elements
      const container = document.getElementById('google_translate_element');
      if (container) container.remove();
      
      // Remove any stray Google elements
      const googleElements = document.querySelectorAll('[class*="goog-te-"], [id*="goog-gt-"], .skiptranslate');
      googleElements.forEach(el => {
        try {
          el.remove();
        } catch (e) {
          // Ignore removal errors
        }
      });
      
      // Clean up scripts
      const scripts = document.querySelectorAll('script[src*="translate.google.com"]');
      scripts.forEach(script => {
        try {
          script.remove();
        } catch (e) {
          // Ignore removal errors
        }
      });
      
      this.googleWidget = null;
      this.googleScriptLoaded = false;
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }

  // Apply comprehensive hiding styles
  applyAllHidingStyles() {
    if (this.hideStylesApplied) return;

    const style = document.createElement('style');
    style.id = 'comprehensive-translate-hide';
    style.textContent = `
      /* Completely hide all Google Translate UI */
      .goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      iframe.goog-te-banner-frame,
      iframe.skiptranslate,
      .goog-te-ftab,
      .goog-te-menu-frame,
      .goog-te-balloon-frame,
      .goog-te-menu2,
      .goog-te-menu2-item,
      #goog-gt-tt,
      .goog-te-spinner-pos,
      div[id^="goog-gt-"],
      div[id*=":gt-"],
      [class*="goog-te-"]:not(#google_translate_element *),
      .skiptranslate:not(#google_translate_element *) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
        z-index: -99999 !important;
        pointer-events: none !important;
        overflow: hidden !important;
      }
      
      /* Prevent body displacement completely */
      body {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        transform: none !important;
      }
      
      /* Override any Google-induced body changes */
      body.translated-ltr,
      body.translated-rtl,
      body[style*="margin-top"],
      body[style*="position"] {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        transform: none !important;
      }
      
      /* Keep our container completely hidden */
      #google_translate_element {
        position: fixed !important;
        top: -9999px !important;
        left: -9999px !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: -99999 !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      }
    `;
    
    document.head.appendChild(style);
    this.hideStylesApplied = true;
    
    // Don't set up mutation observer - it can cause issues
    // Instead rely on periodic cleanup
    this.setupPeriodicCleanup();
  }

  setupPeriodicCleanup() {
    // Very conservative cleanup
    setInterval(() => {
      try {
        this.hideGoogleElementsConservative();
        this.restoreBodyPosition();
      } catch (error) {
        // Ignore cleanup errors
      }
    }, 10000); // Much longer interval
  }

  hideGoogleElementsConservative() {
    try {
      const selectors = [
        '.goog-te-banner-frame',
        'iframe.goog-te-banner-frame',
        '.goog-te-ftab'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!el.closest('#google_translate_element')) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.position = 'absolute';
            el.style.left = '-10000px';
          }
        });
      });
    } catch (error) {
      // Ignore errors
    }
  }

  restoreBodyPosition() {
    try {
      const body = document.body;
      if (body.style.top && body.style.top !== '0px') {
        body.style.top = '0px';
        body.style.position = 'static';
        body.style.marginTop = '0px';
        body.style.paddingTop = '0px';
      }
    } catch (error) {
      // Ignore errors
    }
  }

  // Enhanced manual translation
  manualTranslate(languageCode) {
    try {
      if (languageCode === 'en') {
        const currentUrl = window.location.href;
        if (currentUrl.includes('translate.google.com')) {
          const match = currentUrl.match(/[?&]u=([^&]+)/);
          if (match) {
            const originalUrl = decodeURIComponent(match[1]);
            window.location.href = originalUrl;
            return;
          }
        }
        return;
      }
      
      const currentUrl = encodeURIComponent(window.location.href);
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${languageCode}&u=${currentUrl}`;
      window.location.href = translateUrl;
    } catch (error) {
      console.error('Manual translation failed:', error);
    }
  }

  // Public API - always use manual translation to avoid issues
  async changeLanguage(languageCode) {
    const now = Date.now();
    
    if (this.isTranslating || 
        languageCode === this.currentLanguage ||
        now - this.lastLanguageChange < 2000) {
      return true;
    }

    this.isTranslating = true;
    this.lastLanguageChange = now;
    
    try {
      console.log(`Changing language to: ${languageCode}`);
      
      // Always use manual translation for reliability
      this.currentLanguage = languageCode;
      this.notifyCallbacks(languageCode);
      
      // Small delay before redirect
      setTimeout(() => {
        this.manualTranslate(languageCode);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Language change failed:', error);
      return false;
    } finally {
      setTimeout(() => {
        this.isTranslating = false;
      }, 2000);
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.callbacks.add(callback);
      return () => this.callbacks.delete(callback);
    }
    return () => {};
  }

  notifyCallbacks(languageCode) {
    if (this.processingCallback) return;
    
    this.processingCallback = true;
    
    setTimeout(() => {
      try {
        this.callbacks.forEach(callback => {
          try {
            callback(languageCode);
          } catch (error) {
            console.warn('Callback error:', error);
          }
        });
      } catch (error) {
        console.warn('Notify callbacks error:', error);
      }
      
      setTimeout(() => {
        this.processingCallback = false;
      }, 500);
    }, 50);
  }

  getSupportedLanguages() {
    return { ...this.supportedLanguages };
  }

  getLanguageInfo(code) {
    return this.supportedLanguages[code] || { name: 'Unknown', flag: '🌐' };
  }

  isReady() {
    return this.isInitialized && !this.isTranslating;
  }

  async refresh() {
    try {
      // Clean up everything
      this.isInitialized = false;
      this.isTranslating = false;
      this.processingCallback = false;
      this.lastLanguageChange = 0;
      
      this.cleanupGoogleElements();
      
      // Always use manual mode on refresh
      this.useManualTranslation = true;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Refresh failed:', error);
      return false;
    }
  }

  destroy() {
    try {
      this.callbacks.clear();
      this.isInitialized = false;
      this.isTranslating = false;
      this.processingCallback = false;
      
      this.cleanupGoogleElements();
      
      const styles = document.getElementById('comprehensive-translate-hide');
      if (styles) styles.remove();
    } catch (error) {
      console.warn('Destroy error:', error);
    }
  }
}

// Create singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Simplified auto-initialization
if (typeof window !== 'undefined') {
  const safeInit = () => {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            embeddedTranslationService.initialize().catch(() => {
              // Silent fail - service will work in manual mode
            });
          }, 2000);
        });
      } else {
        setTimeout(() => {
          embeddedTranslationService.initialize().catch(() => {
            // Silent fail - service will work in manual mode
          });
        }, 2000);
      }
    } catch (error) {
      // Silent fail
    }
  };
  
  safeInit();
}

export default embeddedTranslationService;