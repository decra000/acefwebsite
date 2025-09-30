class EmbeddedTranslationService {
  constructor() {
    this.currentLanguage = 'en';
    this.callbacks = new Set();
    this.googleWidget = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      if (window.google?.translate?.TranslateElement) {
        this.createWidget();
        return resolve();
      }

      const callbackName = `gtInit_${Date.now()}`;
      window[callbackName] = () => {
        this.createWidget();
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  createWidget() {
    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,de,it,pt,ru,zh,ja,ar,sw,am',
        autoDisplay: false,
      },
      'google_translate_element'
    );

    // store widget select
    setTimeout(() => {
      this.googleWidget = document.querySelector('#google_translate_element select.goog-te-combo');
    }, 2000);
  }

  changeLanguage(lang) {
    if (!this.googleWidget) return;
    this.googleWidget.value = lang;
    this.googleWidget.dispatchEvent(new Event('change'));
    this.currentLanguage = lang;
    this.notifyCallbacks(lang);
  }

  onLanguageChange(cb) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  notifyCallbacks(lang) {
    this.callbacks.forEach(fn => fn(lang));
  }
}

const embeddedTranslationService = new EmbeddedTranslationService();

// Initialize after DOM load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    embeddedTranslationService.initialize();
  });
}

export default embeddedTranslationService;
