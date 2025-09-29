// utils/embeddedTranslationService.js
// Fixed version for Vercel deployment

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
      'zh': { name: '中文', flag: '🇨🇳' },
      'ja': { name: '日本語', flag: '🇯🇵' },
      'ar': { name: 'العربية', flag: '🇸🇦' },
      'sw': { name: 'Kiswahili', flag: '🇰🇪' }
    };
    this.callbacks = new Set();
    this.googleWidget = null;
    this.isTranslating = false;
    this.translationReady = false;
    this.initAttempts = 0;
    
    // Apply styles immediately
    if (typeof document !== 'undefined') {
      this.applyGoogleTranslateHideStyles();
    }
  }

  applyGoogleTranslateHideStyles() {
    if (typeof document === 'undefined') return;
    
    const existingStyle = document.getElementById('google-translate-hide-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'google-translate-hide-styles';
    style.textContent = `
      .goog-te-banner-frame,
      iframe.skiptranslate,
      .goog-te-ftab,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      div[id^="goog-gt-"],
      #google_translate_element,
      #google_translate_element * {
        display: none !important;
        visibility: hidden !important;
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
      }
      
      body {
        top: 0 !important;
        position: static !important;
      }
    `;
    
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
      head.insertBefore(style, head.firstChild);
    }
  }

  async initialize() {
    if (this.isInitialized) return true;
    if (typeof window === 'undefined') return false;

    try {
      // Wait for DOM to be fully ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
      }

      // Add meta tag to allow Google Translate
      this.addMetaTag();
      
      // Initialize Google Translate
      await this.initializeGoogleTranslate();
      
      this.isInitialized = true;
      this.translationReady = true;
      console.log('Translation service initialized');
      return true;
    } catch (error) {
      console.warn('Translation init failed:', error);
      // Mark as initialized anyway to show UI
      this.isInitialized = true;
      this.translationReady = false;
      return false;
    }
  }

  addMetaTag() {
    // Add CSP meta tag if not present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com;";
      document.head.appendChild(meta);
    }
  }

  async initializeGoogleTranslate() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Initialization timeout'));
      }, 15000);

      try {
        this.loadGoogleScript()
          .then(() => this.createGoogleWidget())
          .then(() => this.waitForGoogleWidget())
          .then(() => {
            clearTimeout(timeout);
            resolve();
          })
          .catch(error => {
            clearTimeout(timeout);
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
      // Check if already loaded
      if (window.google?.translate?.TranslateElement) {
        resolve();
        return;
      }

      // Remove any existing broken scripts
      document.querySelectorAll('script[src*="translate.google"]').forEach(s => s.remove());

      const script = document.createElement('script');
      const callbackName = `gtInit_${Date.now()}`;
      
      let resolved = false;
      
      const cleanup = () => {
        clearTimeout(scriptTimeout);
        delete window[callbackName];
      };

      const scriptTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          script.remove();
          reject(new Error('Script load timeout'));
        }
      }, 10000);
      
      window[callbackName] = () => {
        if (!resolved && window.google?.translate?.TranslateElement) {
          resolved = true;
          cleanup();
          setTimeout(resolve, 500);
        }
      };
      
      script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(new Error('Script load failed'));
        }
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
    container.style.cssText = 'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;opacity:0;';
    document.body.appendChild(container);

    // Wait a bit for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: Object.keys(this.supportedLanguages).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    } catch (error) {
      throw new Error('Widget creation failed');
    }
  }

  waitForGoogleWidget() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30;
      
      const check = () => {
        const select = document.querySelector('#google_translate_element select.goog-te-combo');
        
        if (select?.options?.length > 1) {
          this.googleWidget = select;
          this.setupListener();
          resolve();
          return;
        }
        
        if (attempts++ < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error('Widget not ready'));
        }
      };
      
      setTimeout(check, 500);
    });
  }

  setupListener() {
    if (!this.googleWidget) return;
    
    this.googleWidget.addEventListener('change', (e) => {
      const lang = e.target.value;
      if (lang && lang !== this.currentLanguage) {
        this.currentLanguage = lang;
        this.notifyCallbacks(lang);
      }
    });
  }

  async changeLanguage(languageCode) {
    if (this.isTranslating || languageCode === this.currentLanguage) {
      return true;
    }

    this.isTranslating = true;
    
    try {
      if (!this.googleWidget) {
        console.warn('Widget not available');
        this.currentLanguage = languageCode;
        this.notifyCallbacks(languageCode);
        return true;
      }
      
      // Find and select the language option
      for (let i = 0; i < this.googleWidget.options.length; i++) {
        if (this.googleWidget.options[i].value === languageCode) {
          this.googleWidget.value = languageCode;
          this.currentLanguage = languageCode;
          
          const event = new Event('change', { bubbles: true });
          this.googleWidget.dispatchEvent(event);
          
          this.notifyCallbacks(languageCode);
          return true;
        }
      }
      
      return false;
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
    setTimeout(() => {
      this.callbacks.forEach(callback => {
        try {
          callback(languageCode);
        } catch (error) {
          console.warn('Callback error:', error);
        }
      });
    }, 100);
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
    this.isInitialized = false;
    this.translationReady = false;
    this.initAttempts = 0;
    
    const container = document.getElementById('google_translate_element');
    if (container) container.remove();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.initialize();
  }

  destroy() {
    this.callbacks.clear();
    this.isInitialized = false;
    
    const container = document.getElementById('google_translate_element');
    if (container) container.remove();
  }
}

// Singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  const init = () => {
    setTimeout(() => {
      embeddedTranslationService.initialize().catch(err => {
        console.log('Translation service not available:', err.message);
      });
    }, 2000);
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export default embeddedTranslationService;