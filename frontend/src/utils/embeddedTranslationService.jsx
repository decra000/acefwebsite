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
    this.useDirectTranslation = false;
    
    // Detect if we should use direct translation (for localhost issues)
    this.shouldUseDirectTranslation = this.detectEnvironment();
    
    // Setup error handling and styles
    this.setupErrorHandling();
    this.applyGoogleTranslateHideStyles();
  }

  detectEnvironment() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('local');
    
    const isHTTPS = window.location.protocol === 'https:';
    
    // Use direct translation for localhost or non-HTTPS environments
    return isLocalhost || !isHTTPS;
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
          console.warn('Google Translate error detected, switching to direct mode:', message);
          this.useDirectTranslation = true;
          this.cleanupGoogleElements();
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

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    console.log('Initializing translation service...');
    console.log('Environment detection:', {
      shouldUseDirectTranslation: this.shouldUseDirectTranslation,
      hostname: window.location.hostname,
      protocol: window.location.protocol
    });
    
    // If we detected issues with the environment, use direct translation
    if (this.shouldUseDirectTranslation) {
      console.log('Using direct translation mode');
      this.useDirectTranslation = true;
      this.isInitialized = true;
      this.translationReady = true;
      return true;
    }
    
    // Try Google Translate with much shorter timeout
    try {
      await this.initializeGoogleTranslateQuick();
      this.isInitialized = true;
      this.translationReady = true;
      console.log('Google Translate initialized successfully');
      return true;
    } catch (error) {
      console.warn('Google Translate failed, switching to direct mode:', error);
      this.useDirectTranslation = true;
      this.isInitialized = true;
      this.translationReady = true;
      return true;
    }
  }

  async initializeGoogleTranslateQuick() {
    return new Promise((resolve, reject) => {
      // Much shorter timeout - fail fast
      const timeout = setTimeout(() => {
        this.cleanupGoogleElements();
        reject(new Error('Google Translate initialization timeout (fast fail)'));
      }, 5000);

      try {
        this.loadGoogleScriptFast()
          .then(() => this.createGoogleWidgetFast())
          .then(() => this.waitForGoogleWidgetFast())
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

  loadGoogleScriptFast() {
    return new Promise((resolve, reject) => {
      // Check if already available
      if (window.google?.translate?.TranslateElement) {
        resolve();
        return;
      }

      // Reject if script already exists but didn't load
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        reject(new Error('Google script exists but not loaded'));
        return;
      }

      const script = document.createElement('script');
      const callbackName = `gtInit_${Date.now()}`;
      
      // Short timeout for callback
      const callbackTimeout = setTimeout(() => {
        delete window[callbackName];
        reject(new Error('Google script callback timeout'));
      }, 3000);
      
      window[callbackName] = () => {
        clearTimeout(callbackTimeout);
        delete window[callbackName];
        resolve();
      };
      
      script.src = `//translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      
      script.onerror = () => {
        clearTimeout(callbackTimeout);
        delete window[callbackName];
        reject(new Error('Google script load failed'));
      };
      
      document.head.appendChild(script);
    });
  }

  async createGoogleWidgetFast() {
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
    `;
    document.body.appendChild(container);

    try {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: Object.keys(this.supportedLanguages).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    } catch (error) {
      container.remove();
      throw new Error('Widget creation failed');
    }
  }

  waitForGoogleWidgetFast() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 10; // Much fewer attempts
      
      const checkWidget = () => {
        try {
          const select = document.querySelector('#google_translate_element select.goog-te-combo');
          if (select && select.options && select.options.length > 1) {
            this.googleWidget = select;
            this.setupGoogleListener();
            resolve();
            return;
          }
        } catch (error) {
          // Continue checking
        }
        
        if (attempts++ < maxAttempts) {
          setTimeout(checkWidget, 300);
        } else {
          reject(new Error('Widget not ready'));
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

  // NEW: Direct translation using Google Translate page
  performDirectTranslation(languageCode) {
    try {
      if (languageCode === 'en') {
        // For English, try to get back to original site
        const currentUrl = window.location.href;
        if (currentUrl.includes('translate.google.com')) {
          // Extract original URL
          const urlMatch = currentUrl.match(/[?&]u=([^&]+)/);
          if (urlMatch) {
            const originalUrl = decodeURIComponent(urlMatch[1]);
            console.log('Returning to original URL:', originalUrl);
            window.location.href = originalUrl;
            return;
          }
        }
        // If already on original site, just reload
        window.location.reload();
        return;
      }

      // For other languages, redirect to Google Translate
      const currentUrl = window.location.href;
      let targetUrl = currentUrl;
      
      // If already on translate.google.com, extract the original URL
      if (currentUrl.includes('translate.google.com')) {
        const urlMatch = currentUrl.match(/[?&]u=([^&]+)/);
        if (urlMatch) {
          targetUrl = decodeURIComponent(urlMatch[1]);
        }
      }
      
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${languageCode}&u=${encodeURIComponent(targetUrl)}`;
      console.log('Redirecting to translation:', translateUrl);
      
      // Use a small delay to show loading state
      setTimeout(() => {
        window.location.href = translateUrl;
      }, 500);
      
    } catch (error) {
      console.error('Direct translation failed:', error);
    }
  }

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
      
      // Update current language immediately for UI feedback
      this.currentLanguage = languageCode;
      this.notifyCallbacks(languageCode);
      
      // Use direct translation if Google widget failed or for localhost
      if (this.useDirectTranslation || !this.googleWidget) {
        console.log('Using direct translation method');
        
        // Small delay for UI feedback
        setTimeout(() => {
          this.performDirectTranslation(languageCode);
        }, 800);
        
        return true;
      }
      
      // Try Google widget if available
      if (this.googleWidget && this.googleWidget.options) {
        let targetOption = null;
        for (let i = 0; i < this.googleWidget.options.length; i++) {
          const option = this.googleWidget.options[i];
          if (option.value === languageCode) {
            targetOption = option;
            break;
          }
        }
        
        if (targetOption) {
          this.googleWidget.value = languageCode;
          const changeEvent = new Event('change', { bubbles: true });
          this.googleWidget.dispatchEvent(changeEvent);
          
          console.log('Language changed using Google widget');
          return true;
        }
      }
      
      // Fallback to direct translation
      console.log('Falling back to direct translation');
      setTimeout(() => {
        this.performDirectTranslation(languageCode);
      }, 500);
      
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

  cleanupGoogleElements() {
    try {
      const container = document.getElementById('google_translate_element');
      if (container) container.remove();
      
      const googleElements = document.querySelectorAll('[class*="goog-te-"], [id*="goog-gt-"], .skiptranslate');
      googleElements.forEach(el => {
        try {
          if (!el.closest('#google_translate_element')) {
            el.remove();
          }
        } catch (e) {
          // Ignore errors
        }
      });
      
      this.googleWidget = null;
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
      this.isInitialized = false;
      this.isTranslating = false;
      this.processingCallback = false;
      this.lastLanguageChange = 0;
      this.translationReady = false;
      
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
      
      this.cleanupGoogleElements();
      
      const styles = document.getElementById('google-translate-hide-styles');
      if (styles) styles.remove();
    } catch (error) {
      // Silent destroy
    }
  }
}

// Create singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Quick initialization
if (typeof window !== 'undefined') {
  const initService = () => {
    try {
      embeddedTranslationService.applyGoogleTranslateHideStyles();
      
      // Much faster initialization
      setTimeout(() => {
        embeddedTranslationService.initialize().catch(error => {
          console.log('Translation service failed, using direct mode:', error.message);
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