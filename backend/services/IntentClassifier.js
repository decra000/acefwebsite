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
      ]
    };

    // Action intents (form needed - submission required)
    this.actionPatterns = {
      job_inquiry: [
        'apply', 'job', 'career', 'position', 'vacancy', 'hiring',
        'employment', 'work with', 'join your team', 'opportunity',
        'application', 'recruit'
      ],
      volunteer_inquiry: [
        'volunteer', 'volunteering', 'help out', 'contribute time',
        'give my time', 'work for free', 'unpaid'
      ],
      partnership_inquiry: [
        'partner', 'partnership', 'collaborate', 'collaboration',
        'work together', 'joint', 'alliance', 'cooperation'
      ],
      collaboration_inquiry: [
        'collaborate', 'collaboration', 'work with us', 'joint effort',
        'cooperate', 'team up'
      ],
      event_inquiry: [
        'event', 'attend', 'register', 'rsvp', 'workshop', 
        'seminar', 'conference', 'training', 'meeting'
      ],
      donation_inquiry: [
        'donate', 'donation', 'contribute', 'support', 'fund',
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
  }

  classify(message) {
    const lower = message.toLowerCase().trim();
    
    // Check for greetings first
    if (this.isGreeting(lower)) {
      return {
        type: 'greeting',
        needsForm: false,
        confidence: 1.0
      };
    }

    // Check if it's an informational query (no form needed)
    const infoType = this.detectInformationalIntent(lower);
    if (infoType) {
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
      return {
        type: 'action',
        subType: actionType,
        needsForm: true,
        confidence: 0.85
      };
    }

    // Default to general inquiry
    return {
      type: 'general',
      needsForm: false,
      confidence: 0.5
    };
  }

  detectInformationalIntent(message) {
    // Questions about information don't need forms
    const infoIndicators = [
      'what', 'who', 'where', 'when', 'how many', 'how much',
      'tell me', 'show me', 'list', 'describe', 'explain',
      'know about', 'learn about', 'find out', 'information',
      'details about', 'can you tell'
    ];

    const hasInfoIndicator = infoIndicators.some(ind => message.includes(ind));
    
    if (hasInfoIndicator) {
      // Match to specific info type
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
        // Additional check: make sure it's not an action request
        if (!this.hasActionIndicator(message)) {
          return type;
        }
      }
    }

    return null;
  }

  detectActionIntent(message) {
    // Actions need forms
    const actionIndicators = [
      'want to', 'would like to', 'interested in', 'apply for',
      'sign up', 'register', 'submit', 'send', 'i want', 'i need',
      'can i', 'how do i', 'help me', 'assist me', 'looking to'
    ];

    const scores = {};
    
    for (const [type, keywords] of Object.entries(this.actionPatterns)) {
      const matchCount = keywords.filter(keyword => message.includes(keyword)).length;
      if (matchCount > 0) {
        // Boost score if there's also an action indicator
        const hasIndicator = actionIndicators.some(ind => message.includes(ind));
        scores[type] = hasIndicator ? matchCount * 2 : matchCount;
      }
    }

    if (Object.keys(scores).length === 0) {
      return null;
    }

    // Return intent with highest score
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
    // Check if message is short and contains greeting
    if (message.length > 100) return false;
    
    return this.greetingPatterns.some(g => {
      // Match whole word greeting
      const regex = new RegExp(`\\b${g}\\b`, 'i');
      return regex.test(message);
    });
  }

  shouldCollectContactInfo(intent) {
    // Only collect contact info for action intents
    return intent.type === 'action';
  }

  getInitialResponse(intent) {
    if (intent.type === 'information') {
      return null; // Will be handled by InformationHandler
    }

    if (intent.type === 'greeting') {
      return `Hello! 👋 I'm your ACEF assistant. I can help you with:

**Information:**
• About ACEF (mission, vision, values)
• Our team and departments
• Countries we operate in
• Programs and projects
• Blog and news

**Actions:**
• Job applications
• Volunteer opportunities  
• Event registration
• Partnership inquiries
• Donations
• Newsletter subscription
• General contact

What can I help you with today?`;
    }

    if (intent.type === 'action') {
      return this.getActionIntroduction(intent.subType);
    }

    return `I'm here to help! You can ask me about ACEF, or I can assist you with applications, volunteer opportunities, events, partnerships, and more. What would you like to know?`;
  }

  getActionIntroduction(actionType) {
    const intros = {
      job_inquiry: "Great! I'd be happy to help you with job opportunities at ACEF. Would you like to see our current openings first, or do you have a specific position in mind?",
      
      volunteer_inquiry: "Wonderful! We love working with volunteers. Which country are you interested in volunteering in? Or would you like to see all available opportunities?",
      
      partnership_inquiry: "Excellent! We're always interested in partnerships. Could you tell me a bit about your organization and what kind of partnership you're considering?",

      collaboration_inquiry: "Great! We value collaborations. Could you share more about how you'd like to collaborate with ACEF?",
      
      event_inquiry: "Great! Would you like to see our upcoming events, or do you have a specific event in mind?",
      
      donation_inquiry: "Thank you for your interest in supporting ACEF! I can provide you with information about our donation methods. Would you like to proceed?",
      
      newsletter_subscription: "I'd be happy to subscribe you to our newsletter! I'll need your email address to get you signed up.",
      
      contact_inquiry: "I'm here to help! Before I connect you with the right person, could you tell me what your inquiry is about?"
    };

    return intros[actionType] || "How can I assist you today?";
  }

  // Helper method to get all action types
  getAllActionTypes() {
    return Object.keys(this.actionPatterns);
  }

  // Helper method to get all information types
  getAllInformationTypes() {
    return Object.keys(this.informationalPatterns);
  }

  // Check if a specific keyword belongs to any pattern
  findIntentByKeyword(keyword) {
    const lower = keyword.toLowerCase();
    
    // Check informational patterns
    for (const [type, keywords] of Object.entries(this.informationalPatterns)) {
      if (keywords.includes(lower)) {
        return { type: 'information', subType: type };
      }
    }
    
    // Check action patterns
    for (const [type, keywords] of Object.entries(this.actionPatterns)) {
      if (keywords.includes(lower)) {
        return { type: 'action', subType: type };
      }
    }
    
    return null;
  }
}

module.exports = IntentClassifier;