class EmbeddedTranslationService {
  constructor() {
    this.currentLanguage = 'en';
    this.callbacks = new Set();
    this.googleWidget = null;
    this.initializePromise = null;
    this.maxRetries = 10;
    this.retryDelay = 300;
  }

  async initialize() {
    // Return existing promise if already initializing
    if (this.initializePromise) {
      return this.initializePromise;
    }

    this.initializePromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.translate?.TranslateElement) {
        this.createWidget()
          .then(() => resolve(true))
          .catch((err) => {
            console.error('Widget creation failed:', err);
            resolve(false);
          });
        return;
      }

      // Create unique callback name
      const callbackName = `gtInit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      window[callbackName] = () => {
        // Clean up callback
        delete window[callbackName];
        this.createWidget()
          .then(() => resolve(true))
          .catch((err) => {
            console.error('Widget creation failed:', err);
            resolve(false);
          });
      };

      // Load script
      const script = document.createElement('script');
      script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      script.onerror = () => {
        delete window[callbackName];
        console.error('Failed to load Google Translate script');
        resolve(false); // Resolve with false instead of reject
      };
      
      document.head.appendChild(script);

      // Timeout fallback
      setTimeout(() => {
        if (!this.googleWidget) {
          console.warn('Google Translate initialization timeout');
          resolve(false); // Resolve with false instead of reject
        }
      }, 15000);
    });

    return this.initializePromise;
  }

  async createWidget() {
    // Remove existing container if any
    const existing = document.getElementById('google_translate_element');
    if (existing) {
      existing.remove();
    }

    // Create hidden container
    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.cssText = 'position: absolute; left: -9999px; top: -9999px; visibility: hidden;';
    document.body.appendChild(container);

    // Create widget
    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,fr,de,it,pt,ru,zh,ja,ar,sw,am',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
    } catch (error) {
      throw new Error('Failed to create TranslateElement: ' + error.message);
    }

    // Wait for widget to be ready with retry logic
    await this.waitForWidget();
    
    // Hide Google Translate banner
    this.hideTranslateBanner();
  }

  async waitForWidget() {
    for (let i = 0; i < this.maxRetries; i++) {
      // Try multiple selectors
      const widget = document.querySelector('#google_translate_element select.goog-te-combo') ||
                     document.querySelector('select.goog-te-combo') ||
                     document.querySelector('.goog-te-combo');
      
      if (widget) {
        this.googleWidget = widget;
        console.log('✅ Google Translate widget ready');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
    }
    
    throw new Error('Could not find Google Translate widget after ' + this.maxRetries + ' attempts');
  }

  hideTranslateBanner() {
    // Hide the Google Translate top banner
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame,
      .goog-te-balloon-frame,
      #goog-gt-tt,
      .goog-tooltip {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
      .skiptranslate {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  async changeLanguage(lang) {
    try {
      // Ensure initialized
      if (!this.googleWidget) {
        console.log('Widget not ready, attempting to initialize...');
        const success = await this.initialize();
        if (!success || !this.googleWidget) {
          throw new Error('Widget not available after initialization');
        }
      }

      if (!this.googleWidget) {
        throw new Error('Widget not available');
      }

      // Validate language code
      const supportedLanguages = this.getSupportedLanguages();
      if (!supportedLanguages[lang]) {
        throw new Error(`Unsupported language: ${lang}`);
      }

      // Change language
      this.googleWidget.value = lang;
      this.googleWidget.dispatchEvent(new Event('change', { bubbles: true }));
      
      this.currentLanguage = lang;
      this.notifyCallbacks(lang);
      
      console.log(`🌐 Language changed to: ${lang}`);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Check if service is ready
  isReady() {
    return this.googleWidget !== null && this.initializePromise !== null;
  }

  // Get supported languages with info
  getSupportedLanguages() {
    return {
      en: { name: 'English', flag: '🇺🇸', code: 'en' },
      es: { name: 'Spanish', flag: '🇪🇸', code: 'es' },
      fr: { name: 'French', flag: '🇫🇷', code: 'fr' },
      de: { name: 'German', flag: '🇩🇪', code: 'de' },
      it: { name: 'Italian', flag: '🇮🇹', code: 'it' },
      pt: { name: 'Portuguese', flag: '🇵🇹', code: 'pt' },
      ru: { name: 'Russian', flag: '🇷🇺', code: 'ru' },
      zh: { name: 'Chinese', flag: '🇨🇳', code: 'zh' },
      ja: { name: 'Japanese', flag: '🇯🇵', code: 'ja' },
      ar: { name: 'Arabic', flag: '🇸🇦', code: 'ar' },
      sw: { name: 'Swahili', flag: '🇰🇪', code: 'sw' },
      am: { name: 'Amharic', flag: '🇪🇹', code: 'am' }
    };
  }

  // Get info for a specific language
  getLanguageInfo(code) {
    const languages = this.getSupportedLanguages();
    return languages[code] || { name: code.toUpperCase(), flag: '🌐', code };
  }

  // Refresh/reinitialize the service
  async refresh() {
    console.log('Refreshing translation service...');
    this.reset();
    return await this.initialize();
  }

  onLanguageChange(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  notifyCallbacks(lang) {
    this.callbacks.forEach(fn => {
      try {
        fn(lang);
      } catch (error) {
        console.error('Error in language change callback:', error);
      }
    });
  }

  // Reset the service (useful for debugging)
  reset() {
    this.googleWidget = null;
    this.initializePromise = null;
    this.currentLanguage = 'en';
    this.callbacks.clear();
    
    const container = document.getElementById('google_translate_element');
    if (container) {
      container.remove();
    }
  }
}

// Create singleton instance
const embeddedTranslationService = new EmbeddedTranslationService();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  const initWhenReady = () => {
    embeddedTranslationService.initialize()
      .then(() => console.log('✅ Translation service ready'))
      .catch(err => console.error('❌ Translation service failed:', err));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    // DOM already loaded
    initWhenReady();
  }
}

export default embeddedTranslationService;