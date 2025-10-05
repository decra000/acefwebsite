// services/IntentClassifier.js
class IntentClassifier {
  constructor() {
    // Informational intents (no form needed - read-only queries)
    this.informationalPatterns = {
      team_info: [
        'team', 'members', 'staff', 'who works', 'employees', 
        'department', 'management', 'leadership', 'personnel'
      ],
      country_info: [
        'countries', 'where', 'location', 'operate', 'presence',
        'which countries', 'where are you', 'where is acef', 'offices'
      ],
      mission_vision: [
        'mission', 'vision', 'purpose', 'goal', 'objective', 'aim'
      ],
      core_values: [
        'values', 'principles', 'beliefs', 'core values', 'ethics'
      ],
      about: [
        'about acef', 'what is acef', 'who is acef', 'tell me about',
        'learn about acef', 'know about acef'
      ],
      blog_info: [
        'blog', 'articles', 'posts', 'read', 'news', 'stories'
      ],
      project_info: [
        'project', 'projects', 'programs', 'initiatives', 'what do you do'
      ],
      partner_info: [
        'partners', 'who partners', 'organizations', 'collaborators'
      ],
      impact_info: [
        'impact', 'achievements', 'results', 'outcomes', 'success'
      ],
      testimonial_info: [
        'testimonial', 'testimonials', 'reviews', 'feedback', 'stories'
      ],
      events: [
        'what events', 'upcoming events', 'show events', 'list events',
        'see events', 'all events', 'events lined up', 'available events',
        'explore events', 'view events', 'which events', 'any events',
        'tell me about events', 'event schedule', 'event calendar',
        'featured events', 'free events', 'paid events'
      ],
      jobs: [
        'what jobs', 'show jobs', 'list jobs', 'see jobs', 'available jobs',
        'job openings', 'open positions', 'view jobs', 'explore jobs',
        'job listings', 'career opportunities', 'which jobs', 'any jobs',
        'jobs available', 'current openings', 'vacancies', 'positions available',
        'do you have jobs', 'jobs lined up', 'see positions', 'show positions',
        'current opportunities', 'open roles'
      ]
    };

    // Action intents (form needed - submission required)
    this.actionPatterns = {
      job_inquiry: [
        'apply for job', 'apply to job', 'submit application', 'i want to apply',
        'interested in applying', 'application for', 'apply now',
        'submit my application', 'send application', 'applying for job',
        'apply for position', 'apply for this'
      ],
      volunteer_inquiry: [
        'volunteer', 'volunteering', 'help out', 'contribute time',
        'give my time', 'work for free', 'unpaid'
      ],
      partnership_inquiry: [
        'partner', 'partnership', 'collaborate on project', 'collaboration',
        'work together', 'joint', 'alliance', 'cooperation'
      ],
      collaboration_inquiry: [
        'collaborate', 'collaboration', 'work with us', 'joint effort',
        'cooperate', 'team up'
      ],
      event_inquiry: [
        'register for event', 'sign up for event', 'attend event',
        'join event', 'rsvp', 'event registration', 'book event',
        'reserve spot', 'register for', 'sign up for', 'i want to attend'
      ],
      donation_inquiry: [
        'donate', 'donation', 'contribute money', 'support financially', 'fund',
        'give money', 'financial support', 'sponsor', 'funding'
      ],
      newsletter_subscription: [
        'newsletter', 'subscribe', 'email updates', 'mailing list',
        'keep me posted', 'updates', 'news subscription'
      ],
      contact_inquiry: [
        'contact', 'reach out', 'get in touch', 'speak with',
        'talk to', 'message', 'inquiry', 'question', 'ask',
        'communicate'
      ]
    };

    // Greeting patterns
    this.greetingPatterns = [
      'hello', 'hi', 'hey', 'greetings', 'good morning',
      'good afternoon', 'good evening', 'hola', 'bonjour',
      'howdy', 'hi there', 'hello there'
    ];

    // Browsing indicators (information, not action)
    this.browsingIndicators = [
      'show', 'list', 'see', 'view', 'what', 'which', 'any',
      'all', 'available', 'explore', 'tell me', 'do you have',
      'lined up', 'current', 'display'
    ];

    // Job browsing indicators
    this.jobBrowsingIndicators = [
      'show jobs', 'list jobs', 'see jobs', 'view jobs', 
      'what jobs', 'which jobs', 'any jobs', 'available jobs',
      'job openings', 'open positions', 'current openings',
      'do you have jobs', 'vacancies', 'current opportunities'
    ];

    // Event browsing indicators
    this.eventBrowsingIndicators = [
      'show', 'list', 'see', 'view', 'what', 'which', 'any',
      'upcoming', 'all', 'available', 'explore', 'tell me',
      'lined up', 'schedule', 'calendar', 'featured', 'free', 'paid'
    ];
  }

  classify(message) {
    const lower = message.toLowerCase().trim();
    
    console.log('🔍 Classifying message:', lower);
    
    // Check for greetings first
    if (this.isGreeting(lower)) {
      console.log('✅ Classified as: GREETING');
      return {
        type: 'greeting',
        needsForm: false,
        confidence: 1.0
      };
    }

    // CRITICAL: Check for job browsing BEFORE checking actions
    if (this.isJobBrowsing(lower)) {
      console.log('✅ Classified as: JOB BROWSING (information)');
      return {
        type: 'information',
        subType: 'jobs',
        needsForm: false,
        confidence: 0.95
      };
    }

    // CRITICAL: Check for event browsing BEFORE checking actions
    if (this.isEventBrowsing(lower)) {
      console.log('✅ Classified as: EVENT BROWSING (information)');
      return {
        type: 'information',
        subType: 'events',
        needsForm: false,
        confidence: 0.95
      };
    }

    // Check if it's an informational query (no form needed)
    const infoType = this.detectInformationalIntent(lower);
    if (infoType) {
      console.log('✅ Classified as: INFORMATION -', infoType);
      return {
        type: 'information',
        subType: infoType,
        needsForm: false,
        confidence: 0.9
      };
    }

    // Check for action intents (form needed)
    const actionType = this.detectActionIntent(lower);
    if (actionType) {
      console.log('✅ Classified as: ACTION -', actionType);
      return {
        type: 'action',
        subType: actionType,
        needsForm: true,
        confidence: 0.85
      };
    }

    // Default to general inquiry
    console.log('⚠️ Classified as: GENERAL');
    return {
      type: 'general',
      needsForm: false,
      confidence: 0.5
    };
  }

  // Detect if user is browsing jobs (not applying)
  isJobBrowsing(message) {
    // Must contain job-related keywords
    const jobKeywords = ['job', 'jobs', 'position', 'positions', 'opening', 'openings', 'career', 'vacancy', 'vacancies', 'role', 'roles', 'opportunity', 'opportunities'];
    const hasJobKeyword = jobKeywords.some(keyword => message.includes(keyword));
    
    if (!hasJobKeyword) {
      return false;
    }

    // Check for application/action indicators
    const applicationIndicators = [
      'apply for', 'apply to', 'submit application', 'i want to apply',
      'interested in applying', 'send application', 'applying for',
      'can i apply', 'how do i apply', 'application for', 'submit my'
    ];
    
    const hasApplicationIndicator = applicationIndicators.some(indicator =>
      message.includes(indicator)
    );

    // If they want to apply, it's an action, not browsing
    if (hasApplicationIndicator) {
      return false;
    }

    // Check for browsing indicators
    const hasBrowsingIndicator = this.browsingIndicators.some(indicator => 
      message.includes(indicator)
    );

    // If they have browsing indicators, it's information
    if (hasBrowsingIndicator) {
      return true;
    }

    // Edge cases: Just saying "jobs" or questions about jobs is browsing
    const browsingPhrases = [
      message.trim() === 'jobs',
      message.trim() === 'job',
      message.includes('do you have'),
      message.includes('any jobs'),
      message.includes('job openings'),
      message.includes('open positions'),
      message.includes('what jobs'),
      message.includes('which jobs'),
      message.includes('available jobs'),
      message.includes('current openings'),
      message.includes('see openings'),
      message.includes('show openings')
    ];

    return browsingPhrases.some(phrase => phrase);
  }

  // Detect if user is browsing events (not registering)
  isEventBrowsing(message) {
    if (!message.includes('event')) {
      return false;
    }

    const hasBrowsingIndicator = this.eventBrowsingIndicators.some(indicator => 
      message.includes(indicator)
    );

    const registrationIndicators = [
      'register', 'sign up', 'rsvp', 'book', 'reserve',
      'i want to attend', 'join this', 'participate in'
    ];
    
    const hasRegistrationIndicator = registrationIndicators.some(indicator =>
      message.includes(indicator)
    );

    if (hasRegistrationIndicator) {
      return false;
    }

    if (hasBrowsingIndicator) {
      return true;
    }

    if (message.trim() === 'events' || message.trim() === 'event') {
      return true;
    }

    return false;
  }

  detectInformationalIntent(message) {
    const infoIndicators = [
      'what', 'who', 'where', 'when', 'how many', 'how much',
      'tell me', 'show me', 'list', 'describe', 'explain',
      'know about', 'learn about', 'find out', 'information',
      'details about', 'can you tell', 'explore', 'see', 'view'
    ];

    const hasInfoIndicator = infoIndicators.some(ind => message.includes(ind));
    
    if (hasInfoIndicator) {
      for (const [type, keywords] of Object.entries(this.informationalPatterns)) {
        if (keywords.some(keyword => message.includes(keyword))) {
          return type;
        }
      }
      return 'general';
    }

    // Direct info patterns even without question words
    for (const [type, keywords] of Object.entries(this.informationalPatterns)) {
      const matchCount = keywords.filter(keyword => message.includes(keyword)).length;
      if (matchCount >= 1) {
        if (!this.hasActionIndicator(message)) {
          return type;
        }
      }
    }

    return null;
  }

  detectActionIntent(message) {
    const actionIndicators = [
      'want to', 'would like to', 'interested in', 'apply for',
      'sign up', 'register', 'submit', 'send', 'i want', 'i need',
      'can i', 'how do i', 'help me', 'assist me', 'looking to'
    ];

    const scores = {};
    
    for (const [type, keywords] of Object.entries(this.actionPatterns)) {
      const matchCount = keywords.filter(keyword => message.includes(keyword)).length;
      if (matchCount > 0) {
        const hasIndicator = actionIndicators.some(ind => message.includes(ind));
        scores[type] = hasIndicator ? matchCount * 2 : matchCount;
      }
    }

    if (Object.keys(scores).length === 0) {
      return null;
    }

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  hasActionIndicator(message) {
    const actionIndicators = [
      'want to', 'would like to', 'interested in', 'apply for',
      'sign up', 'register', 'submit', 'send', 'i want', 'i need'
    ];
    return actionIndicators.some(ind => message.includes(ind));
  }

  isGreeting(message) {
    if (message.length > 100) return false;
    
    return this.greetingPatterns.some(g => {
      const regex = new RegExp(`\\b${g}\\b`, 'i');
      return regex.test(message);
    });
  }

  shouldCollectContactInfo(intent) {
    return intent.type === 'action';
  }

  getInitialResponse(intent) {
    if (intent.type === 'information') {
      return null; // Will be handled by InformationHandler
    }

    if (intent.type === 'greeting') {
      return `Hello! I'm your ACEF assistant. I can help you with:

Information:
- About ACEF (mission, vision, values)
- Our team and departments
- Countries we operate in
- Programs and projects
- Upcoming events
- Available job openings

Actions:
- Apply for jobs
- Register for events
- Volunteer opportunities
- Partnership inquiries
- Donations
- Newsletter subscription
- General contact

What can I help you with today?`;
    }

    if (intent.type === 'action') {
      return this.getActionIntroduction(intent.subType);
    }

    return `I'm here to help! You can ask me about ACEF, or I can assist you with applications, volunteer opportunities, events, partnerships, and more. What would you like to know?`;
  }

  getActionIntroduction(actionType) {
    const intros = {
      job_inquiry: "I'll help you apply for this position. To get started, I'll need some information from you.",
      
      volunteer_inquiry: "We love working with volunteers! Which country are you interested in volunteering in? Or would you like to see all available opportunities?",
      
      partnership_inquiry: "We're always interested in partnerships. Could you tell me a bit about your organization and what kind of partnership you're considering?",

      collaboration_inquiry: "We value collaborations. Could you share more about how you'd like to collaborate with ACEF?",
      
      event_inquiry: "I can help you register for an event! First, let me show you our upcoming events so you can choose one.",
      
      donation_inquiry: "Thank you for your interest in supporting ACEF! I can provide you with information about our donation methods. Would you like to proceed?",
      
      newsletter_subscription: "I'd be happy to subscribe you to our newsletter! I'll need your email address to get you signed up.",
      
      contact_inquiry: "I'm here to help! Before I connect you with the right person, could you tell me what your inquiry is about?"
    };

    return intros[actionType] || "How can I assist you today?";
  }

  getAllActionTypes() {
    return Object.keys(this.actionPatterns);
  }

  getAllInformationTypes() {
    return Object.keys(this.informationalPatterns);
  }

  findIntentByKeyword(keyword) {
    const lower = keyword.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.informationalPatterns)) {
      if (keywords.includes(lower)) {
        return { type: 'information', subType: type };
      }
    }
    
    for (const [type, keywords] of Object.entries(this.actionPatterns)) {
      if (keywords.includes(lower)) {
        return { type: 'action', subType: type };
      }
    }
    
    return null;
  }
}

module.exports = IntentClassifier;