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
    this.useManualTranslation = false;
    this.hideStylesApplied = false;
  }

  // Initialize with fallback approach
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    console.log('Initializing translation service...');
    
    // Always apply hiding styles first
    this.applyAllHidingStyles();
    
    try {
      // Try Google Translate approach
      await this.initializeGoogleTranslate();
      console.log('Google Translate initialized successfully');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Google Translate failed, using manual approach:', error);
      // Fallback to manual translation
      this.useManualTranslation = true;
      this.isInitialized = true;
      return true;
    }
  }

  async initializeGoogleTranslate() {
    return new Promise((resolve, reject) => {
      // Set a shorter timeout for faster fallback
      const timeout = setTimeout(() => {
        reject(new Error('Google Translate initialization timeout'));
      }, 8000);

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
      if (window.google?.translate?.TranslateElement) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      const callbackName = `gtInit${Date.now()}`;
      
      window[callbackName] = () => {
        delete window[callbackName];
        resolve();
      };
      
      script.src = `//translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.onerror = () => {
        delete window[callbackName];
        reject(new Error('Script load failed'));
      };
      
      document.head.appendChild(script);
    });
  }

  async createGoogleWidget() {
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
    `;
    document.body.appendChild(container);

    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: Object.keys(this.supportedLanguages).join(','),
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
  }

  waitForGoogleWidget() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const check = () => {
        const select = document.querySelector('.goog-te-combo');
        if (select && select.options.length > 1) {
          this.googleWidget = select;
          this.setupGoogleListener();
          resolve();
        } else if (attempts++ < 5) {
          setTimeout(check, 1000);
        } else {
          reject(new Error('Widget not found'));
        }
      };
      setTimeout(check, 1500);
    });
  }

  setupGoogleListener() {
    if (this.googleWidget) {
      this.googleWidget.addEventListener('change', (e) => {
        const lang = e.target.value;
        if (lang !== this.currentLanguage) {
          this.currentLanguage = lang;
          setTimeout(() => this.notifyCallbacks(lang), 100);
        }
      });
    }
  }

  // Apply comprehensive hiding styles
  applyAllHidingStyles() {
    if (this.hideStylesApplied) return;

    const style = document.createElement('style');
    style.id = 'comprehensive-translate-hide';
    style.textContent = `
      /* Hide all Google Translate UI elements aggressively */
      .goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      iframe.goog-te-banner-frame,
      iframe.skiptranslate,
      .goog-te-ftab,
      .goog-te-menu-frame,
      .goog-te-balloon-frame,
      #goog-gt-tt,
      .goog-te-spinner-pos,
      .goog-te-menu2,
      div[id^="goog-gt-"],
      [class*="goog-te-"]:not(#google_translate_element):not(#google_translate_element *),
      .skiptranslate:not(#google_translate_element):not(#google_translate_element *) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
        overflow: hidden !important;
        z-index: -9999 !important;
        pointer-events: none !important;
      }
      
      /* Prevent body displacement */
      body {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        transform: none !important;
      }
      
      /* Override any translation-induced body changes */
      body.translated-ltr,
      body.translated-rtl {
        top: 0 !important;
        position: static !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        transform: none !important;
      }
      
      /* Keep our hidden container functional */
      #google_translate_element {
        position: fixed !important;
        top: -9999px !important;
        left: -9999px !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: auto !important;
        z-index: -9999 !important;
      }
    `;
    
    document.head.appendChild(style);
    this.hideStylesApplied = true;

    // Set up continuous monitoring
    this.setupContinuousHiding();
  }

  setupContinuousHiding() {
    // Monitor for new elements
    const observer = new MutationObserver((mutations) => {
      let needsHiding = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && this.isGoogleTranslateElement(node)) {
            needsHiding = true;
          }
        });
      });
      
      if (needsHiding) {
        setTimeout(() => this.hideGoogleElements(), 100);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Periodic cleanup
    setInterval(() => {
      this.hideGoogleElements();
      this.restoreBodyPosition();
    }, 2000);
  }

  isGoogleTranslateElement(element) {
    return element.classList?.contains('goog-te-banner-frame') ||
           element.classList?.contains('skiptranslate') ||
           element.id?.startsWith('goog-gt-') ||
           (element.tagName === 'IFRAME' && element.src?.includes('translate.google'));
  }

  hideGoogleElements() {
    const selectors = [
      '.goog-te-banner-frame',
      'iframe.goog-te-banner-frame',
      '.goog-te-ftab',
      '#goog-gt-tt'
    ];
    
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.closest('#google_translate_element')) {
          el.style.display = 'none !important';
          el.style.visibility = 'hidden !important';
          el.style.position = 'absolute !important';
          el.style.left = '-10000px !important';
          el.style.top = '-10000px !important';
        }
      });
    });
  }

  restoreBodyPosition() {
    const body = document.body;
    if (body.style.top && body.style.top !== '0px') {
      body.style.top = '0px';
      body.style.position = 'static';
    }
  }

  // Manual translation using Google Translate URL
  manualTranslate(languageCode) {
    if (languageCode === 'en') {
      // Remove translation
      const currentUrl = window.location.href;
      if (currentUrl.includes('translate.google.com')) {
        // Extract original URL
        const match = currentUrl.match(/u=([^&]+)/);
        if (match) {
          window.location.href = decodeURIComponent(match[1]);
          return;
        }
      }
      return;
    }
    
    // Translate page
    const currentUrl = encodeURIComponent(window.location.href);
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${languageCode}&u=${currentUrl}`;
    window.location.href = translateUrl;
  }

  // Public API methods
  async changeLanguage(languageCode) {
    if (this.isTranslating || languageCode === this.currentLanguage) {
      return true;
    }

    this.isTranslating = true;
    
    try {
      if (this.useManualTranslation || !this.googleWidget) {
        // Use manual translation
        this.currentLanguage = languageCode;
        this.notifyCallbacks(languageCode);
        this.manualTranslate(languageCode);
        return true;
      } else {
        // Use Google Widget
        this.googleWidget.value = languageCode;
        this.googleWidget.dispatchEvent(new Event('change'));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTimeout(() => {
          this.hideGoogleElements();
          this.restoreBodyPosition();
        }, 500);
        
        return true;
      }
    } catch (error) {
      console.error('Language change failed:', error);
      // Fallback to manual
      this.manualTranslate(languageCode);
      return true;
    } finally {
      this.isTranslating = false;
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  onLanguageChange(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  notifyCallbacks(languageCode) {
    this.callbacks.forEach(callback => {
      try {
        callback(languageCode);
      } catch (error) {
        console.warn('Callback error:', error);
      }
    });
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
    this.googleWidget = null;
    this.useManualTranslation = false;
    this.isTranslating = false;
    
    const existing = document.getElementById('google_translate_element');
    if (existing) existing.remove();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.initialize();
  }

  destroy() {
    this.callbacks.clear();
    this.isInitialized = false;
    this.googleWidget = null;
    
    const existing = document.getElementById('google_translate_element');
    if (existing) existing.remove();
    
    const styles = document.getElementById('comprehensive-translate-hide');
    if (styles) styles.remove();
  }
}

// Create singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Auto-initialize with better error handling
if (typeof window !== 'undefined') {
  const initWhenReady = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          embeddedTranslationService.initialize().catch(err => {
            console.warn('Auto-init failed:', err);
          });
        }, 3000);
      });
    } else {
      setTimeout(() => {
        embeddedTranslationService.initialize().catch(err => {
          console.warn('Auto-init failed:', err);
        });
      }, 3000);
    }
  };
  
  initWhenReady();
}

export default embeddedTranslationService;