// utils/embeddedTranslationService.js
// Version with extensive debugging to find the issue

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
    this.debugLogs = [];
    
    this.log('Constructor called');
    this.applyGoogleTranslateHideStyles();
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data || '');
    this.debugLogs.push({ timestamp, message, data });
  }

  getDebugLogs() {
    return this.debugLogs;
  }

  applyGoogleTranslateHideStyles() {
    if (typeof document === 'undefined') {
      this.log('Cannot apply styles - document undefined');
      return;
    }
    
    const existingStyle = document.getElementById('google-translate-hide-styles');
    if (existingStyle) {
      this.log('Styles already applied');
      return;
    }

    this.log('Applying hide styles');
    const style = document.createElement('style');
    style.id = 'google-translate-hide-styles';
    style.textContent = `
      /* Hide all Google UI */
      .goog-te-banner-frame,
      iframe.skiptranslate,
      .goog-te-ftab,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      div[id^="goog-gt-"],
      #google_translate_element {
        display: none !important;
        visibility: hidden !important;
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      /* Prevent body displacement */
      body {
        top: 0px !important;
        position: static !important;
        margin-top: 0px !important;
      }
    `;
    
    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
      head.insertBefore(style, head.firstChild);
      this.log('Styles applied successfully');
    } else {
      this.log('ERROR: Could not find head element');
    }
  }

  async initialize() {
    this.log('Initialize called');
    
    if (this.isInitialized) {
      this.log('Already initialized');
      return true;
    }
    
    if (typeof window === 'undefined') {
      this.log('ERROR: Window undefined');
      return false;
    }

    try {
      // Log environment info
      this.log('Environment', {
        host: window.location.host,
        protocol: window.location.protocol,
        readyState: document.readyState,
        hasGoogle: !!window.google
      });

      // Wait for DOM
      if (document.readyState === 'loading') {
        this.log('Waiting for DOMContentLoaded');
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
        this.log('DOM ready');
      }

      // Try to initialize
      this.log('Starting Google Translate initialization');
      await this.initializeGoogleTranslate();
      
      this.isInitialized = true;
      this.translationReady = true;
      this.log('SUCCESS: Translation service ready');
      return true;
      
    } catch (error) {
      this.log('ERROR during initialization', {
        message: error.message,
        stack: error.stack
      });
      
      // Still mark as initialized for UI
      this.isInitialized = true;
      this.translationReady = false;
      return false;
    }
  }

  async initializeGoogleTranslate() {
    return new Promise((resolve, reject) => {
      this.log('initializeGoogleTranslate started');
      
      const timeout = setTimeout(() => {
        this.log('ERROR: Initialization timeout (15s)');
        reject(new Error('Initialization timeout'));
      }, 15000);

      this.loadGoogleScript()
        .then(() => {
          this.log('Script loaded successfully');
          return this.createGoogleWidget();
        })
        .then(() => {
          this.log('Widget created successfully');
          return this.waitForGoogleWidget();
        })
        .then(() => {
          clearTimeout(timeout);
          this.log('Widget ready successfully');
          resolve();
        })
        .catch(error => {
          clearTimeout(timeout);
          this.log('ERROR in initialization chain', error.message);
          reject(error);
        });
    });
  }

  loadGoogleScript() {
    return new Promise((resolve, reject) => {
      this.log('loadGoogleScript started');
      
      // Check if already loaded
      if (window.google?.translate?.TranslateElement) {
        this.log('Google Translate already available');
        resolve();
        return;
      }

      // Check for existing scripts
      const existingScripts = document.querySelectorAll('script[src*="translate.google"]');
      this.log('Existing Google scripts found', existingScripts.length);
      existingScripts.forEach(s => s.remove());

      const script = document.createElement('script');
      const callbackName = `gtInit_${Date.now()}`;
      
      this.log('Creating script with callback', callbackName);
      
      let resolved = false;
      
      const scriptTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.log('ERROR: Script load timeout (10s)');
          delete window[callbackName];
          script.remove();
          reject(new Error('Script load timeout'));
        }
      }, 10000);
      
      window[callbackName] = () => {
        this.log('Script callback executed');
        
        if (!resolved && window.google?.translate?.TranslateElement) {
          resolved = true;
          clearTimeout(scriptTimeout);
          delete window[callbackName];
          this.log('Script loaded and API available');
          setTimeout(resolve, 500);
        } else {
          this.log('WARNING: Callback fired but API not available', {
            hasGoogle: !!window.google,
            hasTranslate: !!window.google?.translate,
            hasElement: !!window.google?.translate?.TranslateElement
          });
        }
      };
      
      script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      
      script.onload = () => {
        this.log('Script onload fired');
      };
      
      script.onerror = (e) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(scriptTimeout);
          delete window[callbackName];
          this.log('ERROR: Script failed to load (network error)', e);
          reject(new Error('Script network error'));
        }
      };
      
      this.log('Appending script to head');
      document.head.appendChild(script);
    });
  }

  async createGoogleWidget() {
    this.log('createGoogleWidget started');
    
    // Remove existing
    const existing = document.getElementById('google_translate_element');
    if (existing) {
      this.log('Removing existing container');
      existing.remove();
    }

    // Create container - MAKE IT VISIBLE for debugging
    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:10000;background:yellow;padding:10px;border:2px solid red;';
    document.body.appendChild(container);
    this.log('Container created and appended (VISIBLE for debugging)');

    await new Promise(resolve => setTimeout(resolve, 500)); // Longer wait

    try {
      this.log('Creating TranslateElement');
      
      if (!window.google?.translate?.TranslateElement) {
        throw new Error('TranslateElement not available');
      }
      
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: Object.keys(this.supportedLanguages).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, 'google_translate_element');
      
      this.log('TranslateElement created successfully');
    } catch (error) {
      this.log('ERROR creating TranslateElement', error.message);
      throw error;
    }
  }

  waitForGoogleWidget() {
    return new Promise((resolve, reject) => {
      this.log('waitForGoogleWidget started');
      
      let attempts = 0;
      const maxAttempts = 60; // Increased from 30 to 60
      
      const check = () => {
        attempts++;
        
        // Try multiple selectors
        let select = document.querySelector('#google_translate_element select.goog-te-combo');
        
        // If not found, try alternative selectors
        if (!select) {
          select = document.querySelector('select.goog-te-combo');
        }
        if (!select) {
          select = document.querySelector('.goog-te-combo');
        }
        
        this.log(`Widget check attempt ${attempts}/${maxAttempts}`, {
          found: !!select,
          hasOptions: select?.options?.length || 0,
          containerExists: !!document.getElementById('google_translate_element'),
          containerHTML: document.getElementById('google_translate_element')?.innerHTML?.length || 0
        });
        
        // Success condition
        if (select?.options?.length > 1) {
          this.googleWidget = select;
          this.setupListener();
          this.log('Widget ready with options', select.options.length);
          resolve();
          return;
        }
        
        // Keep trying
        if (attempts < maxAttempts) {
          setTimeout(check, 1000); // Increased from 500ms to 1000ms
        } else {
          this.log('ERROR: Widget not ready after max attempts');
          
          // Log final state for debugging
          const container = document.getElementById('google_translate_element');
          this.log('Final container state', {
            exists: !!container,
            innerHTML: container?.innerHTML || 'none',
            childrenCount: container?.children?.length || 0
          });
          
          reject(new Error('Widget not ready'));
        }
      };
      
      // Start checking after a longer initial delay
      setTimeout(check, 1500);
    });
  }

  setupListener() {
    if (!this.googleWidget) {
      this.log('WARNING: Cannot setup listener - no widget');
      return;
    }
    
    this.log('Setting up change listener');
    
    this.googleWidget.addEventListener('change', (e) => {
      const lang = e.target.value;
      this.log('Language changed via widget', lang);
      
      if (lang && lang !== this.currentLanguage) {
        this.currentLanguage = lang;
        this.notifyCallbacks(lang);
      }
    });
  }

  async changeLanguage(languageCode) {
    this.log('changeLanguage called', languageCode);
    
    if (this.isTranslating) {
      this.log('Already translating - skipping');
      return true;
    }
    
    if (languageCode === this.currentLanguage) {
      this.log('Same language - skipping');
      return true;
    }

    this.isTranslating = true;
    
    try {
      if (!this.googleWidget) {
        this.log('WARNING: No widget - updating language for UI only');
        this.currentLanguage = languageCode;
        this.notifyCallbacks(languageCode);
        return true;
      }
      
      this.log('Finding language option', languageCode);
      
      // Find option
      let found = false;
      for (let i = 0; i < this.googleWidget.options.length; i++) {
        if (this.googleWidget.options[i].value === languageCode) {
          found = true;
          this.log('Option found at index', i);
          
          this.googleWidget.value = languageCode;
          this.currentLanguage = languageCode;
          
          const event = new Event('change', { bubbles: true });
          this.googleWidget.dispatchEvent(event);
          
          this.notifyCallbacks(languageCode);
          this.log('Language changed successfully');
          return true;
        }
      }
      
      if (!found) {
        this.log('ERROR: Language option not found', {
          requested: languageCode,
          available: Array.from(this.googleWidget.options).map(o => o.value)
        });
      }
      
      return found;
      
    } catch (error) {
      this.log('ERROR in changeLanguage', error.message);
      return false;
    } finally {
      setTimeout(() => {
        this.isTranslating = false;
        this.log('Translation flag cleared');
      }, 2000);
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.callbacks.add(callback);
      this.log('Callback registered', this.callbacks.size);
      return () => this.callbacks.delete(callback);
    }
    return () => {};
  }

  notifyCallbacks(languageCode) {
    this.log('Notifying callbacks', { language: languageCode, count: this.callbacks.size });
    
    setTimeout(() => {
      this.callbacks.forEach(callback => {
        try {
          callback(languageCode);
        } catch (error) {
          this.log('ERROR in callback', error.message);
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
    this.log('Refresh called');
    
    this.isInitialized = false;
    this.translationReady = false;
    
    const container = document.getElementById('google_translate_element');
    if (container) container.remove();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.initialize();
  }

  destroy() {
    this.log('Destroy called');
    this.callbacks.clear();
    this.isInitialized = false;
    
    const container = document.getElementById('google_translate_element');
    if (container) container.remove();
  }

  // Debug helper - call this from console
  printDebugInfo() {
    console.log('=== TRANSLATION SERVICE DEBUG INFO ===');
    console.log('Initialized:', this.isInitialized);
    console.log('Ready:', this.translationReady);
    console.log('Current Language:', this.currentLanguage);
    console.log('Has Widget:', !!this.googleWidget);
    console.log('Callbacks:', this.callbacks.size);
    console.log('\n=== RECENT LOGS ===');
    this.debugLogs.slice(-20).forEach(log => {
      console.log(`[${log.timestamp}] ${log.message}`, log.data || '');
    });
    console.log('\n=== GOOGLE API STATUS ===');
    console.log('window.google:', !!window.google);
    console.log('window.google.translate:', !!window.google?.translate);
    console.log('TranslateElement:', !!window.google?.translate?.TranslateElement);
    console.log('\n=== DOM STATUS ===');
    console.log('Container exists:', !!document.getElementById('google_translate_element'));
    console.log('Widget select:', !!document.querySelector('#google_translate_element select.goog-te-combo'));
  }
}

// Singleton
const embeddedTranslationService = new EmbeddedTranslationService();

// Make debug function available globally
if (typeof window !== 'undefined') {
  window.debugTranslation = () => embeddedTranslationService.printDebugInfo();
  
  const init = () => {
    embeddedTranslationService.log('Auto-initialization started');
    setTimeout(() => {
      embeddedTranslationService.initialize().catch(err => {
        embeddedTranslationService.log('Auto-init failed', err.message);
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