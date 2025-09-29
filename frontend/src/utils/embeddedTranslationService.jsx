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
    this.translationReady = false;
    this.initializationAttempts = 0;
    this.maxInitAttempts = 3;
    
    // Setup error handling and styles
    this.setupErrorHandling();
    this.applyGoogleTranslateHideStyles();
  }

  setupErrorHandling() {
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && typeof message === 'string') {
        const isGoogleError = message.includes('Maximum call stack size exceeded') ||
                             source?.includes('translate.google') ||
                             source?.includes('m=el_main') ||
                             message.includes('translate');
        
        if (isGoogleError) {
          console.warn('Google Translate error detected:', message);
          // Don't switch to redirect mode, just retry initialization
          if (this.initializationAttempts < this.maxInitAttempts) {
            setTimeout(() => this.retryInitialization(), 2000);
          }
          return true;
        }
      }
      
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
  }

  applyGoogleTranslateHideStyles() {
    if (this.hideStylesApplied) return;

    const style = document.createElement('style');
    style.id = 'google-translate-hide-styles';
    style.textContent = `
      /* Hide all Google Translate UI */
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
      .goog-te-gadget {
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
      
      /* Prevent body displacement */
      body {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      body.translated-ltr,
      body.translated-rtl,
      body[style*="margin-top"],
      body[style*="position"] {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
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
    `;
    
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
    if (!document.body) {
      setTimeout(() => this.setupBodyPositionMonitor(), 100);
      return;
    }

    const observer = new MutationObserver(() => {
      this.restoreBodyPosition();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Periodic cleanup
    setInterval(() => {
      this.hideGoogleElements();
      this.restoreBodyPosition();
    }, 5000);
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
          }
        });
      });
    } catch (error) {
      // Silent cleanup
    }
  }

  restoreBodyPosition() {
    try {
      const body = document.body;
      if (body && body.style.top && body.style.top !== '0px') {
        body.style.setProperty('top', '0px', 'important');
        body.style.setProperty('position', 'static', 'important');
        body.style.setProperty('margin-top', '0px', 'important');
      }
    } catch (error) {
      // Silent fix
    }
  }

  async retryInitialization() {
    if (this.initializationAttempts >= this.maxInitAttempts) {
      console.warn('Max initialization attempts reached');
      return false;
    }

    this.initializationAttempts++;
    console.log(`Retrying initialization (attempt ${this.initializationAttempts})`);
    
    this.cleanupGoogleElements();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return await this.initialize();
  }

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    console.log('Initializing translation service...');
    
    try {
      await this.initializeGoogleTranslate();
      this.isInitialized = true;
      this.translationReady = true;
      console.log('Google Translate initialized successfully');
      return true;
    } catch (error) {
      console.warn('Google Translate initialization failed:', error);
      
      if (this.initializationAttempts < this.maxInitAttempts) {
        return await this.retryInitialization();
      } else {
        // Even if Google Translate fails, mark as initialized so the service is usable
        console.warn('Translation service initialized in fallback mode');
        this.isInitialized = true;
        this.translationReady = true;
        return true;
      }
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
        reject(error);
      }
    });
  }

  loadGoogleScript() {
    return new Promise((resolve, reject) => {
      // Check if already available and functional
      if (window.google?.translate?.TranslateElement) {
        resolve();
        return;
      }

      // Clean up any existing broken scripts first
      const existingScripts = document.querySelectorAll('script[src*="translate.google.com"], script[src*="element.js"]');
      existingScripts.forEach(script => script.remove());

      // Clean up any existing callbacks
      Object.keys(window).forEach(key => {
        if (key.startsWith('gtInit_')) {
          delete window[key];
        }
      });

      const script = document.createElement('script');
      const callbackName = `gtInit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let resolved = false;
      
      const callbackTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          delete window[callbackName];
          script.remove();
          reject(new Error('Google script callback timeout'));
        }
      }, 10000);
      
      window[callbackName] = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(callbackTimeout);
          delete window[callbackName];
          
          // Verify the API is actually available
          if (window.google?.translate?.TranslateElement) {
            setTimeout(() => resolve(), 1000);
          } else {
            reject(new Error('Google Translate API not available after callback'));
          }
        }
      };
      
      script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      
      script.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(callbackTimeout);
          delete window[callbackName];
          script.remove();
          reject(new Error('Google script network load failed'));
        }
      };
      
      // Add to head
      document.head.appendChild(script);
    });
  }

  async createGoogleWidget() {
    const existing = document.getElementById('google_translate_element');
    if (existing) existing.remove();

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
      overflow: hidden !important;
    `;
    document.body.appendChild(container);

    try {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: Object.keys(this.supportedLanguages).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, 'google_translate_element');
    } catch (error) {
      container.remove();
      throw new Error('Widget creation failed: ' + error.message);
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
            console.log('Google widget ready with', select.options.length, 'language options');
            resolve();
            return;
          }
        } catch (error) {
          // Continue checking
        }
        
        if (attempts++ < maxAttempts) {
          setTimeout(checkWidget, 500);
        } else {
          reject(new Error('Widget not ready after ' + maxAttempts + ' attempts'));
        }
      };
      
      checkWidget();
    });
  }

  setupGoogleListener() {
    if (!this.googleWidget) return;
    
    try {
      this.googleWidget.addEventListener('change', (e) => {
        try {
          const selectedLang = e.target.value;
          console.log('Google widget language changed to:', selectedLang);
          if (selectedLang !== this.currentLanguage) {
            this.currentLanguage = selectedLang;
            this.notifyCallbacks(selectedLang);
          }
        } catch (error) {
          console.warn('Google listener error:', error);
        }
      });
    } catch (error) {
      console.warn('Failed to setup Google listener:', error);
    }
  }

  async changeLanguage(languageCode) {
    const now = Date.now();
    
    if (this.isTranslating || 
        languageCode === this.currentLanguage ||
        now - this.lastLanguageChange < 1000) {
      console.log('Language change skipped:', { isTranslating: this.isTranslating, current: this.currentLanguage, requested: languageCode });
      return true;
    }

    this.isTranslating = true;
    this.lastLanguageChange = now;
    
    try {
      console.log(`Changing language from ${this.currentLanguage} to: ${languageCode}`);
      
      // If Google widget is not available, just update the current language for UI
      if (!this.googleWidget) {
        console.warn('Google widget not available, updating language for UI only');
        this.currentLanguage = languageCode;
        this.notifyCallbacks(languageCode);
        return true;
      }
      
      // Use Google widget to trigger translation
      if (this.googleWidget && this.googleWidget.options) {
        let targetOption = null;
        
        // Find the correct option
        for (let i = 0; i < this.googleWidget.options.length; i++) {
          const option = this.googleWidget.options[i];
          if (option.value === languageCode) {
            targetOption = option;
            break;
          }
        }
        
        if (targetOption) {
          console.log('Found target option:', targetOption.text, targetOption.value);
          
          // Update the select value and trigger change
          this.googleWidget.value = languageCode;
          
          // Create and dispatch change event
          const changeEvent = new Event('change', { 
            bubbles: true, 
            cancelable: true 
          });
          
          // Update current language first
          this.currentLanguage = languageCode;
          
          // Dispatch the event to trigger translation
          this.googleWidget.dispatchEvent(changeEvent);
          
          // Notify callbacks
          this.notifyCallbacks(languageCode);
          
          console.log('Language changed successfully using Google widget');
          return true;
        } else {
          console.warn(`Language option not found: ${languageCode}`);
          console.log('Available options:', Array.from(this.googleWidget.options).map(opt => ({ value: opt.value, text: opt.text })));
        }
      }
      
      // If we get here, just update for UI purposes
      this.currentLanguage = languageCode;
      this.notifyCallbacks(languageCode);
      return true;
      
    } catch (error) {
      console.error('Language change failed:', error);
      return false;
    } finally {
      setTimeout(() => {
        this.isTranslating = false;
      }, 2000); // Longer delay to allow translation to complete
    }
  }

  cleanupGoogleElements() {
    try {
      // Don't remove the main container, just clean up broken elements
      const googleElements = document.querySelectorAll('[class*="goog-te-"]:not(select), [id*="goog-gt-"], iframe.skiptranslate');
      googleElements.forEach(el => {
        try {
          if (!el.closest('#google_translate_element') || el.tagName === 'IFRAME') {
            el.remove();
          }
        } catch (e) {
          // Ignore errors
        }
      });
    } catch (error) {
      // Silent cleanup
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
        console.log('Notifying callbacks of language change to:', languageCode);
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
    return this.isInitialized && !this.isTranslating && this.translationReady;
  }

  async refresh() {
    try {
      console.log('Refreshing translation service...');
      
      this.isInitialized = false;
      this.isTranslating = false;
      this.processingCallback = false;
      this.lastLanguageChange = 0;
      this.translationReady = false;
      this.initializationAttempts = 0;
      
      this.cleanupGoogleElements();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      this.translationReady = false;
      
      const container = document.getElementById('google_translate_element');
      if (container) container.remove();
      
      const styles = document.getElementById('google-translate-hide-styles');
      if (styles) styles.remove();
    } catch (error) {
      // Silent destroy
    }
  }
}

// Create singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Initialize service
if (typeof window !== 'undefined') {
  const initService = () => {
    try {
      embeddedTranslationService.applyGoogleTranslateHideStyles();
      
      // Initialize with longer delay to ensure page is ready
      setTimeout(() => {
        embeddedTranslationService.initialize().catch(error => {
          console.log('Translation service initialization failed:', error.message);
        });
      }, 2000);
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