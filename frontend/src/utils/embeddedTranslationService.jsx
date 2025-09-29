// utils/embeddedTranslationService.js
// Based on StackOverflow solutions for Google Translate widget issues

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
    this.isTranslating = false;
    this.translationReady = false;
  }

  applyHideStyles() {
    if (typeof document === 'undefined') return;
    
    if (document.getElementById('gt-hide-styles')) return;

    const style = document.createElement('style');
    style.id = 'gt-hide-styles';
    style.innerHTML = `
      .goog-te-banner-frame,
      .goog-te-ftab,
      .goog-te-menu-frame,
      .goog-te-balloon-frame,
      #goog-gt-tt,
      .goog-te-spinner-pos,
      iframe.skiptranslate {
        display: none !important;
      }
      body { top: 0 !important; }
      #google_translate_element {
        display: none !important;
      }
    `;
    document.head.insertBefore(style, document.head.firstChild);
  }

  async initialize() {
    if (this.isInitialized) return true;
    if (typeof window === 'undefined') return false;

    this.applyHideStyles();

    try {
      // Wait for DOM
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
      }

      // Add container first
      this.createContainer();

      // Load script
      await this.loadScript();

      // Initialize widget
      await this.initWidget();

      this.isInitialized = true;
      this.translationReady = true;
      console.log('[GT] Initialized successfully');
      return true;

    } catch (error) {
      console.warn('[GT] Init failed:', error.message);
      this.isInitialized = true;
      this.translationReady = false;
      return false;
    }
  }

  createContainer() {
    let container = document.getElementById('google_translate_element');
    if (container) return;

    container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;';
    
    if (document.body) {
      document.body.appendChild(container);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(container);
      });
    }
  }

  loadScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.translate?.TranslateElement) {
        resolve();
        return;
      }

      // Remove old scripts
      document.querySelectorAll('script[src*="translate.google"]').forEach(s => s.remove());

      // Clean up old callbacks
      Object.keys(window).forEach(key => {
        if (key.startsWith('googleTranslateElementInit')) {
          delete window[key];
        }
      });

      const callbackName = 'googleTranslateElementInit' + Date.now();
      const timeout = setTimeout(() => {
        delete window[callbackName];
        reject(new Error('Script timeout'));
      }, 15000);

      window[callbackName] = () => {
        clearTimeout(timeout);
        delete window[callbackName];
        if (window.google?.translate?.TranslateElement) {
          console.log('[GT] Script loaded');
          resolve();
        } else {
          reject(new Error('API not available'));
        }
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      script.onerror = () => {
        clearTimeout(timeout);
        delete window[callbackName];
        reject(new Error('Script load failed'));
      };

      (document.head || document.documentElement).appendChild(script);
    });
  }

  initWidget() {
    return new Promise((resolve, reject) => {
      try {
        const container = document.getElementById('google_translate_element');
        if (!container) {
          reject(new Error('Container not found'));
          return;
        }

        // Clear container
        container.innerHTML = '';

        // Create widget
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: Object.keys(this.supportedLanguages).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          },
          'google_translate_element'
        );

        console.log('[GT] Widget created');

        // Wait for select to appear
        this.waitForSelect()
          .then(resolve)
          .catch(reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  waitForSelect() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;

      const check = () => {
        attempts++;

        // Try different selectors
        const selectors = [
          'select.goog-te-combo',
          '#google_translate_element select',
          '.goog-te-combo'
        ];

        let select = null;
        for (const selector of selectors) {
          select = document.querySelector(selector);
          if (select && select.options && select.options.length > 1) {
            break;
          }
        }

        if (select && select.options && select.options.length > 1) {
          this.setupSelectListener(select);
          console.log('[GT] Select ready with', select.options.length, 'options');
          resolve();
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(check, 300);
        } else {
          console.warn('[GT] Select not ready after', maxAttempts, 'attempts');
          // Don't reject - still mark as initialized
          resolve();
        }
      };

      setTimeout(check, 500);
    });
  }

  setupSelectListener(select) {
    if (!select) return;

    select.addEventListener('change', (e) => {
      const lang = e.target.value;
      if (lang && lang !== this.currentLanguage) {
        console.log('[GT] Language changed to:', lang);
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
    console.log('[GT] Changing to:', languageCode);

    try {
      // Find select element
      const selectors = [
        'select.goog-te-combo',
        '#google_translate_element select',
        '.goog-te-combo'
      ];

      let select = null;
      for (const selector of selectors) {
        select = document.querySelector(selector);
        if (select && select.options) break;
      }

      if (!select) {
        console.warn('[GT] Select not found, updating UI only');
        this.currentLanguage = languageCode;
        this.notifyCallbacks(languageCode);
        return true;
      }

      // Find and set option
      let found = false;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === languageCode) {
          select.selectedIndex = i;
          select.value = languageCode;
          
          // Trigger change
          const event = new Event('change', { bubbles: true, cancelable: true });
          select.dispatchEvent(event);
          
          // Also try these events for compatibility
          select.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Manually trigger Google's handler if available
          if (select.onchange) {
            select.onchange({ target: select });
          }

          this.currentLanguage = languageCode;
          this.notifyCallbacks(languageCode);
          
          found = true;
          console.log('[GT] Language set successfully');
          break;
        }
      }

      if (!found) {
        console.warn('[GT] Language not found:', languageCode);
      }

      return found;

    } catch (error) {
      console.error('[GT] Change failed:', error);
      return false;
    } finally {
      setTimeout(() => {
        this.isTranslating = false;
      }, 1500);
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
          console.warn('[GT] Callback error:', error);
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
    console.log('[GT] Refreshing...');
    
    this.isInitialized = false;
    this.translationReady = false;
    
    const container = document.getElementById('google_translate_element');
    if (container) container.remove();
    
    // Remove scripts
    document.querySelectorAll('script[src*="translate.google"]').forEach(s => s.remove());
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.initialize();
  }

  destroy() {
    this.callbacks.clear();
    this.isInitialized = false;
    
    const container = document.getElementById('google_translate_element');
    if (container) container.remove();
    
    const styles = document.getElementById('gt-hide-styles');
    if (styles) styles.remove();
  }
}

// Singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Auto-initialize
if (typeof window !== 'undefined') {
  const init = () => {
    // Delay to ensure page is fully loaded
    setTimeout(() => {
      embeddedTranslationService.initialize().catch(err => {
        console.log('[GT] Auto-init failed:', err.message);
      });
    }, 3000); // Longer delay for better compatibility
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export default embeddedTranslationService;