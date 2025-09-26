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
    this.hideStylesApplied = false;
    this.processingCallback = false;
    this.lastLanguageChange = 0;
    
    // Setup error handling and immediate style application
    this.setupErrorHandling();
    this.applyGoogleTranslateHideStyles();
  }

  setupErrorHandling() {
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && typeof message === 'string') {
        const isGoogleError = message.includes('Maximum call stack size exceeded') ||
                             source?.includes('translate.google') ||
                             source?.includes('m=el_main');
        
        if (isGoogleError) {
          console.warn('Google Translate error detected:', message);
          this.cleanupGoogleElements();
          return true;
        }
      }
      
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('translate') || 
          event.reason?.stack?.includes('google')) {
        console.warn('Google Translate promise rejection:', event.reason);
        event.preventDefault();
      }
    });
  }

  // Apply comprehensive styles to hide Google Translate UI and prevent body displacement
  applyGoogleTranslateHideStyles() {
    if (this.hideStylesApplied) return;

    const style = document.createElement('style');
    style.id = 'google-translate-hide-styles';
    style.textContent = `
      /* Hide Google Translate banner and UI completely */
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
      .goog-te-gadget,
      .goog-te-combo {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
        width: 0 !important;
        height: 0 !important;
        z-index: -99999 !important;
        pointer-events: none !important;
      }
      
      /* Prevent body displacement - critical fix */
      body {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
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
      }
      
      /* Keep our container hidden */
      #google_translate_element,
      #google_translate_element * {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
        width: 0 !important;
        height: 0 !important;
        pointer-events: none !important;
      }
      
      /* Hide translation tooltips and popups */
      .goog-te-balloon-frame iframe,
      [class*="goog-te-"]:not(#google_translate_element *) {
        display: none !important;
      }
      
      /* Prevent any layout shifts */
      html {
        scroll-behavior: smooth;
      }
      
      /* Ensure page content stays in place */
      #root, .app, main, [data-reactroot] {
        transform: none !important;
        top: 0 !important;
        position: relative !important;
      }
    `;
    
    // Insert at the very beginning of head to ensure priority
    if (document.head) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.head.insertBefore(style, document.head.firstChild);
      });
    }
    
    this.hideStylesApplied = true;
    this.setupBodyPositionMonitor();
  }

  setupBodyPositionMonitor() {
    // Monitor for Google Translate changing body position
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const body = document.body;
          if (body.style.top && body.style.top !== '0px') {
            body.style.setProperty('top', '0px', 'important');
            body.style.setProperty('position', 'static', 'important');
            body.style.setProperty('margin-top', '0px', 'important');
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Periodic cleanup
    setInterval(() => {
      this.hideGoogleElements();
      this.restoreBodyPosition();
    }, 2000);
  }

  hideGoogleElements() {
    try {
      const selectors = [
        '.goog-te-banner-frame',
        'iframe.goog-te-banner-frame',
        '.goog-te-ftab',
        '.skiptranslate iframe'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!el.closest('#google_translate_element')) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('position', 'absolute', 'important');
            el.style.setProperty('left', '-10000px', 'important');
            el.style.setProperty('top', '-10000px', 'important');
            el.style.setProperty('width', '0px', 'important');
            el.style.setProperty('height', '0px', 'important');
          }
        });
      });
    } catch (error) {
      console.warn('Error hiding Google elements:', error);
    }
  }

  restoreBodyPosition() {
    try {
      const body = document.body;
      if (body.style.top && body.style.top !== '0px') {
        body.style.setProperty('top', '0px', 'important');
        body.style.setProperty('position', 'static', 'important');
        body.style.setProperty('margin-top', '0px', 'important');
        body.style.setProperty('padding-top', '0px', 'important');
      }
    } catch (error) {
      console.warn('Error restoring body position:', error);
    }
  }

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    console.log('Initializing Google Translate service...');
    
    try {
      await this.initializeGoogleTranslate();
      this.isInitialized = true;
      console.log('Google Translate initialized successfully');
      return true;
    } catch (error) {
      console.warn('Google Translate initialization failed:', error);
      this.isInitialized = true; // Still mark as initialized to prevent retries
      return false;
    }
  }

  async initializeGoogleTranslate() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.cleanupGoogleElements();
        reject(new Error('Google Translate initialization timeout'));
      }, 10000);

      try {
        this.loadGoogleScript()
          .then(() => this.createGoogleWidget())
          .then(() => this.waitForGoogleWidget())
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

  loadGoogleScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.translate?.TranslateElement) {
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        // Wait for existing script to load
        let checkCount = 0;
        const checkLoaded = () => {
          if (window.google?.translate?.TranslateElement) {
            resolve();
          } else if (checkCount++ < 20) {
            setTimeout(checkLoaded, 500);
          } else {
            reject(new Error('Existing script failed to load'));
          }
        };
        checkLoaded();
        return;
      }

      const script = document.createElement('script');
      const callbackName = `gtInit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      window[callbackName] = () => {
        delete window[callbackName];
        resolve();
      };
      
      script.src = `//translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        delete window[callbackName];
        document.head.removeChild(script);
        reject(new Error('Failed to load Google Translate script'));
      };
      
      document.head.appendChild(script);
    });
  }

  async createGoogleWidget() {
    // Remove existing container
    const existing = document.getElementById('google_translate_element');
    if (existing) existing.remove();

    // Create hidden container
    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      top: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      overflow: hidden !important;
      z-index: -99999 !important;
    `;
    document.body.appendChild(container);

    try {
      // Initialize Google Translate widget
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: Object.keys(this.supportedLanguages).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, 'google_translate_element');
      
      console.log('Google Translate widget created');
    } catch (error) {
      console.error('Failed to create Google Translate widget:', error);
      container.remove();
      throw error;
    }
  }

  waitForGoogleWidget() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkWidget = () => {
        try {
          const select = document.querySelector('#google_translate_element select.goog-te-combo');
          if (select && select.options && select.options.length > 1) {
            this.googleWidget = select;
            this.setupGoogleListener();
            console.log('Google Translate widget ready with', select.options.length, 'languages');
            resolve();
            return;
          }
        } catch (error) {
          console.warn('Error checking widget:', error);
        }
        
        if (attempts++ < maxAttempts) {
          setTimeout(checkWidget, 500);
        } else {
          this.cleanupGoogleElements();
          reject(new Error('Google Translate widget not found'));
        }
      };
      
      setTimeout(checkWidget, 1000);
    });
  }

  setupGoogleListener() {
    if (!this.googleWidget) return;
    
    try {
      this.googleWidget.addEventListener('change', (e) => {
        try {
          const selectedLang = e.target.value;
          const now = Date.now();
          
          // Prevent rapid changes and recursion
          if (now - this.lastLanguageChange < 1000 || this.processingCallback) {
            return;
          }
          
          if (selectedLang !== this.currentLanguage) {
            this.currentLanguage = selectedLang;
            this.lastLanguageChange = now;
            
            console.log('Language changed to:', selectedLang);
            
            // Notify callbacks after a small delay
            setTimeout(() => {
              if (!this.processingCallback) {
                this.notifyCallbacks(selectedLang);
              }
            }, 100);
          }
        } catch (error) {
          console.warn('Google translate listener error:', error);
        }
      });
      
      console.log('Google Translate listener set up successfully');
    } catch (error) {
      console.warn('Failed to setup Google Translate listener:', error);
    }
  }

  cleanupGoogleElements() {
    try {
      const container = document.getElementById('google_translate_element');
      if (container) container.remove();
      
      // Remove any Google UI elements that might have appeared
      const googleElements = document.querySelectorAll('[class*="goog-te-"], [id*="goog-gt-"], .skiptranslate');
      googleElements.forEach(el => {
        try {
          if (!el.closest('#google_translate_element')) {
            el.remove();
          }
        } catch (e) {
          // Ignore removal errors
        }
      });
      
      this.googleWidget = null;
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }

  // FIXED: Use Google Translate's programmatic API instead of redirecting
  async changeLanguage(languageCode) {
    const now = Date.now();
    
    if (this.isTranslating || 
        languageCode === this.currentLanguage ||
        now - this.lastLanguageChange < 1000) {
      return true;
    }

    this.isTranslating = true;
    this.lastLanguageChange = now;
    
    try {
      console.log(`Changing language to: ${languageCode}`);
      
      // If Google Translate widget is available, use it for in-page translation
      if (this.googleWidget && this.googleWidget.options) {
        // Find the correct option value for the language
        let targetOption = null;
        for (let i = 0; i < this.googleWidget.options.length; i++) {
          const option = this.googleWidget.options[i];
          if (option.value === languageCode) {
            targetOption = option;
            break;
          }
        }
        
        if (targetOption) {
          // Programmatically change the select value
          this.googleWidget.value = languageCode;
          
          // Trigger the change event
          const changeEvent = new Event('change', { bubbles: true });
          this.googleWidget.dispatchEvent(changeEvent);
          
          this.currentLanguage = languageCode;
          this.notifyCallbacks(languageCode);
          
          console.log('Language changed successfully using Google Translate widget');
          return true;
        } else {
          console.warn(`Language ${languageCode} not found in Google Translate options`);
        }
      }
      
      // Fallback: If widget not available, still update current language for UI
      this.currentLanguage = languageCode;
      this.notifyCallbacks(languageCode);
      
      console.log('Language updated (widget not available)');
      return true;
      
    } catch (error) {
      console.error('Language change failed:', error);
      return false;
    } finally {
      setTimeout(() => {
        this.isTranslating = false;
      }, 1000);
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
      }, 200);
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
      this.isInitialized = false;
      this.isTranslating = false;
      this.processingCallback = false;
      this.lastLanguageChange = 0;
      
      this.cleanupGoogleElements();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return await this.initialize();
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
      
      const styles = document.getElementById('google-translate-hide-styles');
      if (styles) styles.remove();
    } catch (error) {
      console.warn('Destroy error:', error);
    }
  }
}

// Create and export singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  const initService = () => {
    try {
      // Add immediate styles to prevent flash
      embeddedTranslationService.applyGoogleTranslateHideStyles();
      
      // Initialize service after a delay
      setTimeout(() => {
        embeddedTranslationService.initialize().catch(error => {
          console.warn('Translation service initialization failed:', error);
        });
      }, 1000);
    } catch (error) {
      console.warn('Translation service setup failed:', error);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initService);
  } else {
    initService();
  }
}

export default embeddedTranslationService;