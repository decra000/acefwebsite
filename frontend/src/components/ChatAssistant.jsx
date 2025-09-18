import React, { useState, useEffect, useRef } from 'react';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappDescription, setWhatsappDescription] = useState('ACEF Support');

  // Enhanced conversation context with missing information tracking
  const [conversationContext, setConversationContext] = useState({
    userIntent: null,
    collectingInfo: false,
    collectedData: {},
    missingFields: [],
    waitingFor: null,
    actionType: null,
    currentStep: 0,
    totalSteps: 0,
    userEmail: null,
    hasSubscribedToNewsletter: false
  });

  // Enhanced state for comprehensive website data
  const [websiteData, setWebsiteData] = useState({ 
    apiData: [], 
    pageContent: [],
    fullDataMap: new Map(),
    lastUpdated: null 
  });
  const [dataLastFetched, setDataLastFetched] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Enhanced API configuration
  const API_CONFIG = {
    // GitHub Models API configuration
    GITHUB_TOKEN: process.env.REACT_APP_GITHUB_TOKEN || "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",
    GITHUB_ENDPOINT: "https://models.github.ai/inference/chat/completions",
    MODEL: "gpt-4o-mini",
    
    // Backend API configuration
    API_BASE: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    
    // Request configuration
    timeout: 30000,
    retries: 3,
    retryDelay: 2000
  };

  // Complete list of all available endpoints based on your controllers
  const ALL_API_ENDPOINTS = [
    // Core data endpoints
    { url: `${API_CONFIG.API_BASE}/projects`, name: 'projects', critical: true },
    { url: `${API_CONFIG.API_BASE}/blogs`, name: 'blogs', critical: true },
    { url: `${API_CONFIG.API_BASE}/team`, name: 'team', critical: true },
    { url: `${API_CONFIG.API_BASE}/partners`, name: 'partners', critical: true },
    { url: `${API_CONFIG.API_BASE}/countries`, name: 'countries', critical: true },
    { url: `${API_CONFIG.API_BASE}/categories`, name: 'categories', critical: true },
    { url: `${API_CONFIG.API_BASE}/pillars`, name: 'pillars', critical: true },
    
    // Extended data endpoints
    { url: `${API_CONFIG.API_BASE}/events`, name: 'events', critical: true },
    { url: `${API_CONFIG.API_BASE}/jobs`, name: 'jobs', critical: true },
    { url: `${API_CONFIG.API_BASE}/impacts`, name: 'impacts', critical: false },
    { url: `${API_CONFIG.API_BASE}/video-sections`, name: 'videos', critical: false },
    { url: `${API_CONFIG.API_BASE}/highlights`, name: 'highlights', critical: false },
    { url: `${API_CONFIG.API_BASE}/transaction-details`, name: 'transaction_methods', critical: false },
    { url: `${API_CONFIG.API_BASE}/volunteer-forms`, name: 'volunteer_forms', critical: false },
    { url: `${API_CONFIG.API_BASE}/whatsapp`, name: 'whatsapp_contacts', critical: false },
    { url: `${API_CONFIG.API_BASE}/country-contacts`, name: 'country_contacts', critical: false },
    { url: `${API_CONFIG.API_BASE}/newsletter/stats`, name: 'newsletter_stats', critical: false },
    
    // Additional endpoints
    { url: `${API_CONFIG.API_BASE}/donations`, name: 'donations', critical: false },
    { url: `${API_CONFIG.API_BASE}/contacts`, name: 'contact_submissions', critical: false },
    { url: `${API_CONFIG.API_BASE}/job-applications`, name: 'job_applications', critical: false },
    { url: `${API_CONFIG.API_BASE}/event-interests`, name: 'event_applications', critical: false }
  ];

  // Enhanced data requirements for different action types
  const ACTION_REQUIREMENTS = {
    job_inquiry: {
      required: ['fullName', 'email', 'position'],
      optional: ['phone', 'location', 'experience', 'coverLetter'],
      steps: [
        'Collect personal information',
        'Gather position details',
        'Optional documents',
        'Submit application'
      ]
    },
    event_inquiry: {
      required: ['fullName', 'email', 'eventName'],
      optional: ['phone', 'organization', 'message'],
      steps: [
        'Collect personal information',
        'Select event',
        'Additional requirements',
        'Confirm registration'
      ]
    },
    partnership_inquiry: {
      required: ['organizationName', 'contactPerson', 'email', 'partnershipType'],
      optional: ['phone', 'website', 'description'],
      steps: [
        'Organization details',
        'Contact information',
        'Partnership specifics',
        'Submit proposal'
      ]
    },
    donation_inquiry: {
      required: ['donorName', 'email', 'amount'],
      optional: ['phone', 'message', 'anonymous'],
      steps: [
        'Donor information',
        'Donation details',
        'Confirm transaction'
      ]
    },
    contact_inquiry: {
      required: ['name', 'email', 'subject', 'message'],
      optional: ['phone', 'organization'],
      steps: [
        'Contact details',
        'Message content',
        'Send message'
      ]
    },
    volunteer_inquiry: {
      required: ['fullName', 'email', 'country', 'availability'],
      optional: ['phone', 'skills', 'experience'],
      steps: [
        'Personal information',
        'Location & availability',
        'Submit application'
      ]
    },
    newsletter_subscription: {
      required: ['email'],
      optional: ['name'],
      steps: [
        'Email subscription'
      ]
    }
  };

  // Enhanced API request function with retry logic
  const makeAPIRequest = async (url, options = {}) => {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      ...options
    };

    for (let attempt = 1; attempt <= API_CONFIG.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
        
        const response = await fetch(url, {
          ...defaultOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        console.warn(`API request attempt ${attempt} failed:`, error.message);
        
        if (attempt === API_CONFIG.retries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt));
      }
    }
  };

  // Auto-subscribe to newsletter function
  const autoSubscribeToNewsletter = async (email) => {
    if (!email || conversationContext.hasSubscribedToNewsletter) {
      return false;
    }

    try {
      const result = await makeAPIRequest(`${API_CONFIG.API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          source: 'chatbot_auto_subscribe' 
        })
      });

      if (result.success) {
        console.log('✅ Auto-subscribed user to newsletter:', email);
        setConversationContext(prev => ({
          ...prev,
          hasSubscribedToNewsletter: true
        }));
        
        // Add a subtle confirmation message
        setTimeout(() => {
          setMessages(prev => [...prev, {
            from: 'bot',
            text: "📧 I've also subscribed you to our newsletter to keep you updated on ACEF's latest initiatives and opportunities!",
            isAutoSubscribe: true
          }]);
        }, 1000);
        
        return true;
      }
    } catch (error) {
      console.log('Newsletter subscription failed (non-critical):', error);
    }
    
    return false;
  };

  // Enhanced information extraction with improved patterns
  const extractInformation = (message, actionType) => {
    const extracted = {};
    const lowerMessage = message.toLowerCase();

    // Enhanced email extraction
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      extracted.email = emailMatch[0];
    }

    // Enhanced phone extraction
    const phonePatterns = [
      /(?:\+254|0)[0-9]{9,10}/,
      /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /(?:\+\d{1,4}[-.\s]?)?\d{7,15}/
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = message.match(pattern);
      if (phoneMatch) {
        extracted.phone = phoneMatch[0];
        break;
      }
    }

    // Enhanced name extraction
    const namePatterns = [
      /my name is ([A-Za-z\s]+)/i,
      /i'?m ([A-Za-z\s]+)/i,
      /i am ([A-Za-z\s]+)/i,
      /call me ([A-Za-z\s]+)/i,
      /this is ([A-Za-z\s]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1].trim().length > 1) {
        const name = match[1].trim();
        // Filter out common false positives
        const excludeWords = ['interested', 'looking', 'calling', 'writing', 'applying'];
        if (!excludeWords.some(word => name.toLowerCase().includes(word))) {
          extracted.fullName = name;
          extracted.name = name;
          break;
        }
      }
    }

    // Job-specific extraction
    if (actionType === 'job_inquiry') {
      const jobTitles = [
        'coordinator', 'manager', 'officer', 'assistant', 'director', 
        'specialist', 'analyst', 'developer', 'engineer', 'consultant',
        'supervisor', 'administrator', 'technician', 'intern'
      ];
      
      for (const job of jobTitles) {
        if (lowerMessage.includes(job)) {
          extracted.position = job.charAt(0).toUpperCase() + job.slice(1);
          break;
        }
      }
    }

    // Organization extraction for partnerships
    if (actionType === 'partnership_inquiry') {
      const orgPatterns = [
        /from ([A-Za-z\s&]+(?:foundation|organization|ngo|company|corp|ltd|inc))/i,
        /represent ([A-Za-z\s&]+)/i,
        /work at ([A-Za-z\s&]+)/i,
        /organization (?:is )?([A-Za-z\s&]+)/i
      ];
      
      for (const pattern of orgPatterns) {
        const match = message.match(pattern);
        if (match) {
          extracted.organizationName = match[1].trim();
          break;
        }
      }
    }

    // Country extraction for volunteer inquiries
    if (actionType === 'volunteer_inquiry') {
      const countries = [
        'kenya', 'rwanda', 'tanzania', 'uganda', 'ghana', 'cameroon',
        'ethiopia', 'nigeria', 'south africa', 'zambia', 'zimbabwe'
      ];
      
      for (const country of countries) {
        if (lowerMessage.includes(country)) {
          extracted.country = country.charAt(0).toUpperCase() + country.slice(1);
          break;
        }
      }
    }

    // Amount extraction for donations
    if (actionType === 'donation_inquiry') {
      const amountPatterns = [
        /\$(\d+(?:\.\d{2})?)/,
        /(\d+)\s*dollars?/i,
        /(\d+)\s*usd/i,
        /amount.*?(\d+)/i
      ];
      
      for (const pattern of amountPatterns) {
        const match = message.match(pattern);
        if (match) {
          extracted.amount = parseFloat(match[1]);
          break;
        }
      }
    }

    return extracted;
  };

  // Check what information is still missing
  const getMissingFields = (collectedData, actionType) => {
    const requirements = ACTION_REQUIREMENTS[actionType];
    if (!requirements) return [];

    return requirements.required.filter(field => 
      !collectedData[field] || collectedData[field].toString().trim() === ''
    );
  };

  // Enhanced welcome message with dynamic data
  const getWelcomeMessage = () => ({
    from: 'bot',
    text: `Hi there! 👋 I'm your comprehensive ACEF assistant. I can help you with:

🌍 **Information & Resources**
• Learn about our programs and projects across Africa
• Explore our work in ${websiteData.fullDataMap?.get('countries')?.length || '20+'} countries
• Get details about our team, partners, and impact statistics

💼 **Career Opportunities**
• Browse ${websiteData.fullDataMap?.get('jobs')?.length || 'current'} job openings
• Submit job applications with guided assistance
• Get information about working with ACEF

🎯 **Get Involved**
• Register for ${websiteData.fullDataMap?.get('events')?.length || 'upcoming'} events and workshops
• Apply for volunteer opportunities in your country
• Explore partnership and collaboration options

💰 **Support Our Mission**
• Learn about donation methods and impact
• Get information about supporting specific projects or countries
• Subscribe to our newsletter for updates

📧 **Direct Communication**
• Contact our team with questions or inquiries
• Connect with country-specific representatives
• Get WhatsApp contact information${whatsappNumber ? ` (${whatsappNumber})` : ''}

I can perform actions for you - just tell me what you need! For example, say "I want to apply for a job" or "How can I volunteer in Kenya?" and I'll guide you through the process.

How can I assist you today?`
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Comprehensive data fetching function with enhanced error handling
  const fetchWebsiteData = async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      console.log('🔄 Starting comprehensive data fetch from:', API_CONFIG.API_BASE);
      
      const apiDataPromises = ALL_API_ENDPOINTS.map(async (endpoint) => {
        try {
          console.log(`🔍 Fetching: ${endpoint.url}`);
          
          const data = await makeAPIRequest(endpoint.url);
          const resultData = data.data || data;
          
          console.log(`✅ ${endpoint.name} data loaded:`, Array.isArray(resultData) ? resultData.length : 'N/A', 'items');
          
          // Special handling for WhatsApp data
          if (endpoint.name === 'whatsapp_contacts' && Array.isArray(resultData) && resultData.length > 0) {
            const whatsappContact = resultData[0];
            console.log('📱 WhatsApp contact loaded:', whatsappContact);
            setWhatsappNumber(whatsappContact.number || whatsappContact.phone || '');
            setWhatsappDescription(whatsappContact.description || 'ACEF Support');
          }
          
          return { 
            source: endpoint.name, 
            data: Array.isArray(resultData) ? resultData : [resultData],
            status: 'success',
            critical: endpoint.critical,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error(`❌ Error fetching ${endpoint.name}:`, error.message);
          return { 
            source: endpoint.name, 
            data: null, 
            status: 'error', 
            critical: endpoint.critical,
            error: error.message 
          };
        }
      });

      const apiResults = await Promise.all(apiDataPromises);
      const successfulData = apiResults.filter(item => item.status === 'success' && item.data);
      const failedData = apiResults.filter(item => item.status === 'error');
      const criticalFailures = failedData.filter(item => item.critical);
      
      console.log(`📊 Data fetch complete: ${successfulData.length}/${apiResults.length} endpoints successful`);
      
      const fullDataMap = new Map();
      successfulData.forEach(item => {
        fullDataMap.set(item.source, item.data);
      });

      const finalData = {
        apiData: successfulData,
        pageContent: [],
        fullDataMap: fullDataMap,
        lastUpdated: new Date().toISOString(),
        stats: {
          total: apiResults.length,
          successful: successfulData.length,
          failed: failedData.length,
          criticalFailures: criticalFailures.length
        }
      };

      setWebsiteData(finalData);
      setDataLastFetched(new Date());
      
      if (criticalFailures.length > 0) {
        setDataError(`${criticalFailures.length} critical data sources unavailable`);
      } else if (successfulData.length > 0) {
        console.log('🎉 Comprehensive website data successfully loaded');
      } else {
        setDataError('Unable to load any website data');
      }

      return finalData;
      
    } catch (error) {
      console.error('❌ Critical error in fetchWebsiteData:', error);
      setDataError(`Data loading failed: ${error.message}`);
      return { apiData: [], pageContent: [], fullDataMap: new Map(), error: error.message };
    } finally {
      setDataLoading(false);
    }
  };

  // Enhanced system prompt with comprehensive ACEF data
  const getSystemPrompt = (websiteData = { apiData: [], pageContent: [], fullDataMap: new Map() }) => {
    const currentTime = new Date().toLocaleString();
    
    let basePrompt = `You are an advanced AI assistant for ACEF (African Climate and Environmental Foundation). You excel at collecting information through natural conversation and can perform various actions for users.

ACEF CORE INFORMATION:
🌍 Mission: Supporting sustainable development and climate resilience across Africa
🎯 Focus Areas:
- Sustainable agriculture training and support  
- Renewable energy projects (especially solar)
- Water conservation and management initiatives
- Reforestation and biodiversity programs
- Community resilience building
- Climate education and awareness campaigns

🌍 Operating Region: Africa - Headquarters: Limbe, Cameroon
📧 General Contact: info@acef.org
📱 WhatsApp: ${whatsappNumber}${whatsappDescription !== 'ACEF Support' ? ` (${whatsappDescription})` : ''}
🌐 Website: https://acef.org

Data Last Updated: ${currentTime}`;

    // Add comprehensive current data
    if (websiteData.fullDataMap && websiteData.fullDataMap.size > 0) {
      basePrompt += `\n\n=== COMPREHENSIVE ACEF DATA ===\n`;
      
      websiteData.fullDataMap.forEach((data, source) => {
        if (data && data.length > 0) {
          basePrompt += `\n📋 ${source.toUpperCase()} (${data.length} items):\n`;
          
          data.slice(0, 25).forEach((entry, index) => {
            switch(source) {
              case 'team':
                if (entry.name) {
                  basePrompt += `• ${entry.name}${entry.position ? ` - ${entry.position}` : ''}${entry.department ? ` (${entry.department})` : ''}${entry.country ? ` in ${entry.country}` : ''}${entry.email ? ` - ${entry.email}` : ''}\n`;
                }
                break;
                
              case 'countries':
                if (entry.name) {
                  basePrompt += `• ${entry.name}${entry.code ? ` (${entry.code})` : ''}${entry.region ? ` - ${entry.region}` : ''}${entry.continent ? ` in ${entry.continent}` : ''}\n`;
                }
                break;

              case 'projects':
                if (entry.title) {
                  basePrompt += `• ${entry.title}${entry.location ? ` (${entry.location})` : ''}${entry.country_name ? ` in ${entry.country_name}` : ''}${entry.status ? ` [Status: ${entry.status}]` : ''}${entry.short_description ? ` | ${entry.short_description.substring(0, 100)}...` : ''}\n`;
                }
                break;
                
              case 'jobs':
                if (entry.title) {
                  basePrompt += `• ${entry.title}${entry.location ? ` in ${entry.location}` : ''}${entry.level ? ` (${entry.level})` : ''}${entry.deadline || entry.lastDate ? ` | Deadline: ${entry.deadline || entry.lastDate}` : ''}${entry.salary ? ` | Salary: ${entry.salary}` : ''}\n`;
                }
                break;
                
              case 'events':
                if (entry.title) {
                  basePrompt += `• ${entry.title}${entry.start_date ? ` on ${entry.start_date}` : ''}${entry.location ? ` at ${entry.location}` : ''}${entry.country ? ` in ${entry.country}` : ''}${entry.is_paid ? ` (Paid event)` : ' (Free event)'}\n`;
                }
                break;
                
              case 'blogs':
                if (entry.title) {
                  basePrompt += `• ${entry.title}${entry.author ? ` by ${entry.author}` : ''}${entry.created_at ? ` (${entry.created_at.split('T')[0]})` : ''}${entry.is_news ? ' [NEWS]' : ''}\n`;
                }
                break;
                
              case 'volunteer_forms':
                if (entry.form_title) {
                  basePrompt += `• ${entry.country_name || 'Country'}: ${entry.form_title}${entry.form_url ? ` - ${entry.form_url}` : ''}${entry.is_active ? ' [ACTIVE]' : ' [INACTIVE]'}\n`;
                }
                break;
                
              case 'transaction_methods':
                if (entry.name) {
                  basePrompt += `• ${entry.type}: ${entry.name}${entry.country ? ` (${entry.country})` : ''}${entry.fields ? ` | ${entry.fields.length} fields` : ''}\n`;
                }
                break;
                
              case 'impacts':
                if (entry.name) {
                  basePrompt += `• ${entry.name}: ${entry.current_value || 0}${entry.unit ? ` ${entry.unit}` : ''}${entry.is_featured ? ' [FEATURED]' : ''}\n`;
                }
                break;
                
              case 'partners':
                if (entry.name) {
                  basePrompt += `• ${entry.name}${entry.type ? ` (${entry.type})` : ''}${entry.country ? ` - ${entry.country}` : ''}${entry.website ? ` | ${entry.website}` : ''}\n`;
                }
                break;
                
              case 'country_contacts':
                if (entry.country) {
                  basePrompt += `• ${entry.country}: ${entry.email || 'No email'}${entry.phone ? ` | ${entry.phone}` : ''}${entry.physical_address ? ` | ${entry.physical_address}` : ''}\n`;
                }
                break;
                
              default:
                if (entry.name || entry.title) {
                  basePrompt += `• ${entry.name || entry.title}${entry.description ? ` | ${entry.description.substring(0, 100)}...` : ''}\n`;
                }
            }
          });
          basePrompt += '\n';
        }
      });
    }

    basePrompt += `\n=== ACTION CAPABILITIES ===
🎯 I can help users perform these actions:
✅ Job Applications - Collect information and submit job applications
✅ Event Registration - Register interest in events and workshops
✅ Volunteer Applications - Help users apply for volunteer opportunities in their country
✅ Partnership Inquiries - Submit partnership and collaboration proposals
✅ Newsletter Subscription - Subscribe users to ACEF newsletter
✅ Contact Form Submission - Submit general inquiries and messages
✅ Donation Information - Provide donation methods and process guidance

📧 AUTO-NEWSLETTER SUBSCRIPTION:
• When I collect a user's email for any purpose, they are automatically subscribed to our newsletter
• This keeps them informed about ACEF's work and opportunities

🎯 INFORMATION COLLECTION STRATEGY:
✅ Always extract any information provided in user messages (emails, names, phone numbers, etc.)
✅ When users express interest in actions, proactively start collecting required information
✅ Ask ONE specific follow-up question at a time - don't overwhelm users
✅ Acknowledge information received before asking for the next piece
✅ Use natural, conversational language for follow-ups
✅ Show progress when collecting multiple pieces of information`;

    // Add conversation context if active
    if (conversationContext.collectingInfo) {
      basePrompt += `\n\n=== ACTIVE CONVERSATION CONTEXT ===
User Intent: ${conversationContext.userIntent}
Action Type: ${conversationContext.actionType}
Step: ${conversationContext.currentStep + 1}/${conversationContext.totalSteps}
Information Collected: ${JSON.stringify(conversationContext.collectedData, null, 2)}
Missing Required Fields: ${conversationContext.missingFields.join(', ')}

INSTRUCTIONS: 
- Continue collecting the missing information listed above
- Ask for ONE piece of missing information at a time
- Be encouraging and show progress
- When all required info is collected, confirm details and proceed with submission`;
    }

    basePrompt += `\n\n=== RESPONSE GUIDELINES ===
🎯 ALWAYS be proactive and helpful
🎯 Extract any information provided in user messages
🎯 Ask natural follow-up questions when information is missing
🎯 Show empathy and understanding
🎯 Provide clear next steps
🎯 Celebrate progress made in information collection
🎯 For general questions, provide comprehensive answers using the data above

🚫 LIMITATIONS:
- Cannot access external websites beyond ACEF's systems
- Cannot make financial transactions directly
- Always verify important information with users`;

    return basePrompt;
  };

  // Enhanced message handling with information extraction and follow-up logic
  const analyzeUserIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Job-related intents
    if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('position') || 
        lowerMessage.includes('apply') || lowerMessage.includes('work') || lowerMessage.includes('employment') ||
        lowerMessage.includes('hire') || lowerMessage.includes('opportunity')) {
      return { type: 'job_inquiry', confidence: 'high' };
    }
    
    // Event-related intents
    if (lowerMessage.includes('event') || lowerMessage.includes('register') || lowerMessage.includes('attend') ||
        lowerMessage.includes('workshop') || lowerMessage.includes('seminar') || lowerMessage.includes('conference')) {
      return { type: 'event_inquiry', confidence: 'high' };
    }
    
    // Volunteer-related intents
    if (lowerMessage.includes('volunteer') || lowerMessage.includes('help out') || lowerMessage.includes('participate') ||
        lowerMessage.includes('get involved') || lowerMessage.includes('contribute')) {
      return { type: 'volunteer_inquiry', confidence: 'high' };
    }
    
    // Partnership-related intents
    if (lowerMessage.includes('partner') || lowerMessage.includes('collaborate') || lowerMessage.includes('organization') ||
        lowerMessage.includes('ngo') || lowerMessage.includes('company') || lowerMessage.includes('cooperation')) {
      return { type: 'partnership_inquiry', confidence: 'medium' };
    }
    
    // Donation-related intents
    if (lowerMessage.includes('donat') || lowerMessage.includes('contribut') || lowerMessage.includes('support') ||
        lowerMessage.includes('fund') || lowerMessage.includes('sponsor') || lowerMessage.includes('give')) {
      return { type: 'donation_inquiry', confidence: 'medium' };
    }
    
    // Newsletter-related intents
    if (lowerMessage.includes('newsletter') || lowerMessage.includes('subscribe') || lowerMessage.includes('updates') ||
        lowerMessage.includes('email list') || lowerMessage.includes('news')) {
      return { type: 'newsletter_subscription', confidence: 'high' };
    }
    
    // Contact-related intents
    if (lowerMessage.includes('contact') || lowerMessage.includes('speak') || lowerMessage.includes('talk') ||
        lowerMessage.includes('meet') || lowerMessage.includes('email') || lowerMessage.includes('call') ||
        lowerMessage.includes('reach') || lowerMessage.includes('message')) {
      return { type: 'contact_inquiry', confidence: 'medium' };
    }
    
    return { type: 'information_request', confidence: 'low' };
  };

  // Enhanced submission function with better error handling
  const submitCollectedData = async (actionType, data) => {
    try {
      let endpoint = '';
      let payload = {};
      
      switch (actionType) {
        case 'job_inquiry':
          endpoint = `${API_CONFIG.API_BASE}/job-applications`;
          payload = {
            job_id: data.jobId || 1,
            name: data.fullName || data.name,
            email: data.email,
            phone: data.phone || '',
            position: data.position || 'General Application',
            cover_letter: data.coverLetter || `I am interested in the ${data.position || 'available'} position at ACEF.`,
            experience: data.experience || '',
            location: data.location || ''
          };
          break;
          
        case 'event_inquiry':
          endpoint = `${API_CONFIG.API_BASE}/event-interests`;
          payload = {
            event_id: data.eventId || 1,
            name: data.fullName || data.name,
            email: data.email,
            phone: data.phone || '',
            organization: data.organization || '',
            message: data.message || `I am interested in attending ${data.eventName || 'the event'}.`
          };
          break;
          
        case 'contact_inquiry':
          endpoint = `${API_CONFIG.API_BASE}/contacts`;
          payload = {
            name: data.name || data.fullName,
            email: data.email,
            subject: data.subject,
            message: data.message,
            phone: data.phone || '',
            organization: data.organization || ''
          };
          break;
          
        case 'newsletter_subscription':
          endpoint = `${API_CONFIG.API_BASE}/newsletter/subscribe`;
          payload = {
            email: data.email,
            name: data.name || data.fullName || '',
            source: 'chatbot_subscription'
          };
          break;

        case 'donation_inquiry':
          // For donation inquiries, we provide guidance rather than direct submission
          return {
            success: true,
            message: `Thank you for your interest in donating ${data.amount ? `${data.amount}` : ''} to ACEF! Please visit our donation page or contact us directly to complete your donation. Our team will be in touch with you at ${data.email} with detailed donation instructions.`,
            data: data
          };
          
        case 'partnership_inquiry':
          endpoint = `${API_CONFIG.API_BASE}/contacts`;
          payload = {
            name: data.contactPerson || data.name,
            email: data.email,
            subject: `Partnership Inquiry - ${data.organizationName}`,
            message: `Organization: ${data.organizationName}\nPartnership Type: ${data.partnershipType}\nDescription: ${data.description || 'Partnership inquiry submitted via chatbot'}`,
            phone: data.phone || '',
            organization: data.organizationName
          };
          break;
          
        default:
          throw new Error(`Submission not implemented for ${actionType}`);
      }
      
      const result = await makeAPIRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (result.success !== false) {
        return {
          success: true,
          message: result.message || getSuccessMessage(actionType, data),
          data: result.data || result
        };
      } else {
        throw new Error(result.message || 'Submission failed');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit. Please try again.',
        error: error
      };
    }
  };

  // Get success message based on action type
  const getSuccessMessage = (actionType, data) => {
    switch (actionType) {
      case 'job_inquiry':
        return `Thank you ${data.fullName || data.name}! Your job application has been submitted successfully. Our HR team will review your application and contact you at ${data.email} within 5-7 business days.`;
      case 'event_inquiry':
        return `Great! Your interest in ${data.eventName || 'the event'} has been registered. You'll receive event details and updates at ${data.email}.`;
      case 'contact_inquiry':
        return `Your message has been sent successfully! We'll respond to your inquiry at ${data.email} within 2-3 business days.`;
      case 'newsletter_subscription':
        return `Welcome to the ACEF newsletter! You'll now receive updates and news at ${data.email}.`;
      case 'partnership_inquiry':
        return `Thank you for your partnership inquiry! Our partnerships team will review your proposal and contact ${data.organizationName} at ${data.email} soon.`;
      default:
        return 'Your submission has been processed successfully!';
    }
  };

  // Enhanced API call with rate limiting, retry logic, and fallback responses
  const callGitHubModelsAPI = async (userMessage, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [2000, 5000, 8000];

    try {
      console.log('🤖 Making enhanced API call...', retryCount > 0 ? `(Retry ${retryCount})` : '');
      
      const intent = analyzeUserIntent(userMessage);
      console.log('🎯 Detected user intent:', intent);

      // Extract information using existing context
      const extractedInfo = extractInformation(userMessage, intent.type);
      console.log('📝 Extracted information:', extractedInfo);

      // Rate limiting check
      const now = Date.now();
      const lastCallTime = localStorage.getItem('lastAPICall');
      const MIN_INTERVAL = 1500;
      
      if (lastCallTime && (now - parseInt(lastCallTime)) < MIN_INTERVAL) {
        const waitTime = MIN_INTERVAL - (now - parseInt(lastCallTime));
        console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      let contextPrompt = getSystemPrompt(websiteData);
      
      // Handle conversation state
      let updatedContext = { ...conversationContext };

      // If new intent detected and not already collecting info for this type
      if (intent.type !== 'information_request' && 
          (!conversationContext.collectingInfo || conversationContext.actionType !== intent.type)) {
        
        const requirements = ACTION_REQUIREMENTS[intent.type];
        if (requirements) {
          updatedContext = {
            userIntent: intent.type,
            collectingInfo: true,
            collectedData: extractedInfo,
            missingFields: getMissingFields(extractedInfo, intent.type),
            waitingFor: null,
            actionType: intent.type,
            currentStep: 0,
            totalSteps: requirements.steps.length,
            userEmail: extractedInfo.email || null,
            hasSubscribedToNewsletter: false
          };
        }
      } 
      // If already collecting info, merge new extracted information
      else if (conversationContext.collectingInfo) {
        const mergedData = { ...conversationContext.collectedData, ...extractedInfo };
        const missingFields = getMissingFields(mergedData, conversationContext.actionType);
        
        updatedContext = {
          ...conversationContext,
          collectedData: mergedData,
          missingFields: missingFields,
          userEmail: mergedData.email || conversationContext.userEmail
        };

        // Auto-subscribe to newsletter if email was just collected
        if (extractedInfo.email && !conversationContext.userEmail) {
          setTimeout(() => {
            autoSubscribeToNewsletter(extractedInfo.email);
          }, 2000);
        }
        
        // Check if we have all required info and should submit
        if (missingFields.length === 0) {
          console.log('🎉 All required information collected, processing...');
          
          const submitResult = await submitCollectedData(conversationContext.actionType, mergedData);
          
          if (submitResult.success) {
            // Clear context after successful submission
            updatedContext = {
              userIntent: null,
              collectingInfo: false,
              collectedData: {},
              missingFields: [],
              waitingFor: null,
              actionType: null,
              currentStep: 0,
              totalSteps: 0,
              userEmail: null,
              hasSubscribedToNewsletter: false
            };
            
            setConversationContext(updatedContext);
            return submitResult.message;
          } else {
            return `❌ ${submitResult.message}\n\nPlease check your information and try again, or contact us directly via WhatsApp for immediate assistance at ${whatsappNumber}.`;
          }
        }
      }

      // Update context with any changes
      setConversationContext(updatedContext);

      // Build enhanced system prompt with current context
      let enhancedPrompt = contextPrompt;
      if (updatedContext.collectingInfo) {
        enhancedPrompt += `\n\n🤖 CURRENT TASK: Collecting information for ${updatedContext.actionType}
📊 PROGRESS: ${updatedContext.totalSteps - updatedContext.missingFields.length}/${updatedContext.totalSteps} steps complete
📋 COLLECTED DATA: ${JSON.stringify(updatedContext.collectedData, null, 2)}
🎯 MISSING FIELDS: ${updatedContext.missingFields.join(', ')}

IMPORTANT INSTRUCTIONS:
- If the user has already provided information in previous messages, acknowledge it and don't ask again
- Focus on collecting ONLY the missing fields: ${updatedContext.missingFields.join(', ')}
- If no fields are missing, confirm the details and proceed with submission
- Be natural and conversational, not robotic`;
      }

      // Store call time for rate limiting
      localStorage.setItem('lastAPICall', now.toString());

      const response = await fetch(API_CONFIG.GITHUB_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: enhancedPrompt
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          model: API_CONFIG.MODEL,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9
        })
      });

      clearTimeout(timeoutId);

      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAYS[retryCount] || 8000;
        
        if (retryCount < MAX_RETRIES) {
          console.log(`⏱️ Rate limited. Retrying in ${waitTime/1000}s... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return callGitHubModelsAPI(userMessage, retryCount + 1);
        } else {
          return getFallbackResponse(userMessage, updatedContext);
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('❌ API Error:', error);
      
      if (error.name === 'AbortError') {
        if (retryCount < MAX_RETRIES) {
          console.log(`⏱️ Request timeout. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          return callGitHubModelsAPI(userMessage, retryCount + 1);
        }
      }
      
      if (retryCount >= MAX_RETRIES || error.message.includes('429')) {
        return getFallbackResponse(userMessage, conversationContext);
      }
      
      throw error;
    }
  };

  // Enhanced intelligent fallback response system
  const getFallbackResponse = (userMessage, context) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Handle volunteer inquiries without AI
    if (context.actionType === 'volunteer_inquiry' || lowerMessage.includes('volunteer')) {
      if (!context.collectedData.email) {
        return "I'd love to help you with volunteering! To get started, could you please share your email address?";
      }
      if (!context.collectedData.fullName) {
        return "Great! What's your full name?";
      }
      if (!context.collectedData.country) {
        return "Perfect! Which country are you interested in volunteering in? We operate across Africa including Kenya, Uganda, Tanzania, Rwanda, Ethiopia, Cameroon, and others.";
      }
      
      // Try to find volunteer form
      const volunteerForms = websiteData?.fullDataMap?.get('volunteer_forms') || [];
      const countryForm = volunteerForms.find(form => 
        form.country_name?.toLowerCase() === context.collectedData.country?.toLowerCase()
      );
      
      if (countryForm && countryForm.is_active) {
        return `Perfect! Here's how you can volunteer with ACEF in ${context.collectedData.country}:\n\n📋 **${countryForm.form_title}**\n\n🔗 **Complete your application here:**\n${countryForm.form_url}\n\nThank you for your interest in supporting ACEF's mission! 🌍`;
      } else {
        return `Thank you for your interest in volunteering in ${context.collectedData.country || 'your area'}! Please contact us directly to discuss volunteer opportunities:\n\n📧 Email: info@acef.org\n📱 WhatsApp: ${whatsappNumber}${whatsappDescription !== 'ACEF Support' ? ` (${whatsappDescription})` : ''}\n🌐 Website: https://acef.org`;
      }
    }

    // Handle job inquiries
    if (context.actionType === 'job_inquiry' || lowerMessage.includes('job') || lowerMessage.includes('career')) {
      const jobs = websiteData?.fullDataMap?.get('jobs') || [];
      if (jobs.length > 0) {
        const jobsList = jobs.slice(0, 3).map(job => 
          `• ${job.title} ${job.location ? `in ${job.location}` : ''}`
        ).join('\n');
        return `I can help you with job opportunities at ACEF! Here are some current openings:\n\n${jobsList}\n\nWhat type of position interests you? I can guide you through the application process.`;
      }
      return "I can help you with job opportunities at ACEF! You can view our current openings on our website or contact us at info@acef.org. What type of position interests you?";
    }

    // Handle event inquiries
    if (context.actionType === 'event_inquiry' || lowerMessage.includes('event')) {
      const events = websiteData?.fullDataMap?.get('events') || [];
      if (events.length > 0) {
        const eventsList = events.slice(0, 3).map(event => 
          `• ${event.title} ${event.start_date ? `on ${new Date(event.start_date).toLocaleDateString()}` : ''}`
        ).join('\n');
        return `Here are some upcoming ACEF events:\n\n${eventsList}\n\nWhich event interests you? I can help you register!`;
      }
      return "I can help you with ACEF events and workshops! Contact us for information about upcoming events: info@acef.org";
    }

    // Handle contact inquiries
    if (lowerMessage.includes('contact') || lowerMessage.includes('email')) {
      return `You can reach ACEF through:\n\n📧 Email: info@acef.org\n📱 WhatsApp: ${whatsappNumber}${whatsappDescription !== 'ACEF Support' ? ` (${whatsappDescription})` : ''}\n🌐 Website: https://acef.org\n\nHow can we help you today?`;
    }
    
    // Handle donation inquiries
    if (lowerMessage.includes('donate') || lowerMessage.includes('support')) {
      const donationMethods = websiteData?.fullDataMap?.get('transaction_methods') || [];
      if (donationMethods.length > 0) {
        return `Thank you for your interest in supporting ACEF! We have ${donationMethods.length} donation methods available. You can find detailed donation information on our website at https://acef.org or contact us at info@acef.org for specific donation methods in your country.`;
      }
      return "Thank you for your interest in supporting ACEF! You can find donation information on our website at https://acef.org or contact us at info@acef.org for specific donation methods in your country.";
    }

    // Handle partnership inquiries
    if (lowerMessage.includes('partner') || lowerMessage.includes('collaborate')) {
      return "We're always interested in partnerships! Please contact us with details about your organization and proposed collaboration:\n\n📧 Email: info@acef.org\n📱 WhatsApp: ${whatsappNumber}\n\nWhat type of partnership are you interested in?";
    }

    // Generic helpful response
    const dataStats = websiteData?.fullDataMap ? 
      `We operate in ${websiteData.fullDataMap.get('countries')?.length || '20+'} countries with ${websiteData.fullDataMap.get('projects')?.length || 'numerous'} active projects.` : '';

    return `I'm currently experiencing high traffic, but I'm here to help! ${dataStats}

Here's what I can assist you with:

🌍 **Information about ACEF's work** across Africa
💼 **Career opportunities** and job applications  
🤝 **Volunteer opportunities** in your country
💰 **Donation and support** information
📧 **Contact information** and direct communication

For immediate assistance, contact us:
📧 info@acef.org
📱 WhatsApp: ${whatsappNumber}

What would you like to know more about?`;
  };

  // Clear conversation function
  const clearConversation = () => {
    setMessages([getWelcomeMessage()]);
    setConversationContext({
      userIntent: null,
      collectingInfo: false,
      collectedData: {},
      missingFields: [],
      waitingFor: null,
      actionType: null,
      currentStep: 0,
      totalSteps: 0,
      userEmail: null,
      hasSubscribedToNewsletter: false
    });
  };

  // Enhanced sendMessage function with better error handling
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    const originalInput = input;
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await callGitHubModelsAPI(originalInput);
      setMessages([...newMessages, { from: 'bot', text: aiResponse }]);
      
      // Handle different types of completed actions
      const isActionCompleted = aiResponse.includes('submitted') || 
                               aiResponse.includes('completed') || 
                               aiResponse.includes('sent successfully') || 
                               aiResponse.includes('registered successfully');
      
      // Special handling for volunteer form redirection
      const isVolunteerRedirect = aiResponse.includes('Complete your application here:') || 
                                 (aiResponse.includes('🔗') && conversationContext.actionType === 'volunteer_inquiry') ||
                                 aiResponse.includes('volunteer form');
      
      // Handle volunteer form links with clickable functionality
      if (isVolunteerRedirect) {
        const formUrlMatch = aiResponse.match(/https:\/\/[^\s\n]+/);
        if (formUrlMatch) {
          const formUrl = formUrlMatch[0];
          
          setTimeout(() => {
            setMessages(prev => [...prev, {
              from: 'bot',
              text: `Click here to open your volunteer form: ${formUrl}\n\nOr copy and paste the link above into your browser. Need assistance? Contact us directly via WhatsApp for immediate assistance at ${whatsappNumber}.`,
              isVolunteerLink: true,
              formUrl: formUrl
            }]);
          }, 1500);
        }
        
        // Clear context after volunteer redirect
        setTimeout(() => {
          setConversationContext({
            userIntent: null,
            collectingInfo: false,
            collectedData: {},
            missingFields: [],
            waitingFor: null,
            actionType: null,
            currentStep: 0,
            totalSteps: 0,
            userEmail: null,
            hasSubscribedToNewsletter: false
          });
        }, 1000);
      }
      // Handle other completed actions
      else if (isActionCompleted) {
        setTimeout(() => {
          setConversationContext({
            userIntent: null,
            collectingInfo: false,
            collectedData: {},
            missingFields: [],
            waitingFor: null,
            actionType: null,
            currentStep: 0,
            totalSteps: 0,
            userEmail: null,
            hasSubscribedToNewsletter: false
          });
        }, 1000);
      }
      
    } catch (err) {
      console.error('API Error:', err);
      
      let errorResponse;
      if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
        errorResponse = `I'm currently experiencing high traffic. I can still help you with basic information! For immediate assistance, contact us via WhatsApp at ${whatsappNumber} or email info@acef.org.`;
      } else {
        errorResponse = `I'm experiencing technical difficulties. Please try again or contact us directly via WhatsApp for immediate assistance at ${whatsappNumber}.`;
      }
      
      setMessages([...newMessages, { 
        from: 'bot', 
        text: errorResponse,
        isError: true 
      }]);
      
    } finally {
      setLoading(false);
    }
  };

  // Load comprehensive website data when component mounts
  useEffect(() => {
    console.log('🚀 Enhanced ChatAssistant initializing...');
    fetchWebsiteData();
    
    const refreshInterval = setInterval(() => {
      console.log('🔄 Periodic comprehensive data refresh');
      fetchWebsiteData();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Enhanced WhatsApp button component
  const WhatsAppButton = ({ className, buttonText, customMessage = null }) => {
    const handleWhatsAppClick = () => {
      const message = customMessage || "Hello! I need assistance with ACEF services.";
      const encodedMessage = encodeURIComponent(message);
      
      // Remove any non-digit characters except the + at the beginning
      const cleanNumber = whatsappNumber.replace(/(?!^\+)\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber.replace('+', '')}?text=${encodedMessage}`;
      
      console.log('📱 Opening WhatsApp:', {
        number: cleanNumber,
        description: whatsappDescription,
        url: whatsappUrl
      });
      
      window.open(whatsappUrl, '_blank');
    };

    return (
      <button className={className} onClick={handleWhatsAppClick} title={whatsappDescription}>
        {buttonText}
      </button>
    );
  };

  return (
    <div className="chat-float-container">
      {/* Enhanced CSS styles with progress indicator */}
      <style jsx>{`
        .chat-float-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-toggle-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2d7d32 0%, #4caf50 100%);
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-toggle-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }

        .chat-toggle-button img {
          width: 35px;
          height: 35px;
        }

        .data-status-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${websiteData.fullDataMap?.size > 0 ? '#4caf50' : dataLoading ? '#ff9800' : '#f44336'};
          border: 2px solid white;
        }

        .progress-indicator {
          position: absolute;
          top: -2px;
          left: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${conversationContext.collectingInfo ? '#2196f3' : 'transparent'};
          border: 2px solid white;
          display: ${conversationContext.collectingInfo ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        }

        .chat-box {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          background: linear-gradient(135deg, #2d7d32 0%, #4caf50 100%);
          color: white;
          padding: 16px;
          text-align: center;
          font-weight: 600;
          position: relative;
        }

        .data-status {
          font-size: 10px;
          opacity: 0.9;
          margin-top: 2px;
        }

        .conversation-progress {
          background: rgba(255,255,255,0.1);
          padding: 8px 12px;
          margin-top: 8px;
          border-radius: 6px;
          font-size: 11px;
          display: ${conversationContext.collectingInfo ? 'block' : 'none'};
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 2px;
          transition: width 0.3s ease;
          width: ${conversationContext.totalSteps > 0 ? ((conversationContext.currentStep + 1) / conversationContext.totalSteps * 100) : 0}%;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          word-wrap: break-word;
          white-space: pre-wrap;
          position: relative;
          line-height: 1.4;
        }

        .message.user {
          background: #2d7d32;
          color: white;
          align-self: flex-end;
          margin-left: auto;
        }

        .message.bot {
          background: #f1f3f4;
          color: #333;
          align-self: flex-start;
        }

        .message.bot.error {
          background: #ffebee;
          border-left: 4px solid #f44336;
        }

        .message.bot.auto-subscribe {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          font-size: 13px;
          opacity: 0.9;
        }

        .info-extracted {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #4caf50;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .chat-input {
          display: flex;
          padding: 16px;
          border-top: 1px solid #e9ecef;
          gap: 8px;
        }

        .chat-input input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }

        .chat-input input:focus {
          border-color: #4caf50;
        }

        .chat-input button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #2d7d32 0%, #4caf50 100%);
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .chat-input button:hover:not(:disabled) {
          background: linear-gradient(135deg, #1b5e20 0%, #388e3c 100%);
        }

        .chat-input button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chat-options {
          padding: 12px 16px;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chat-link-button {
          flex: 1;
          min-width: 80px;
          padding: 8px 12px;
          background: #fff8e1;
          border: 1px solid #ffb300;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #2d7d32;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .chat-link-button:hover {
          background: #ffecb3;
          border-color: #ffa000;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .typing-dots {
          display: flex;
          gap: 2px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4caf50;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @media (max-width: 480px) {
          .chat-box {
            width: 100vw;
            height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }
        }
      `}</style>

      <button 
        className="chat-toggle-button" 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && !hasShownWelcome) {
            setMessages([getWelcomeMessage()]);
            setHasShownWelcome(true);
          }
        }}
      >
        <img 
          src="/bird.png" 
          alt="ACEF Assistant" 
          style={{ transform: 'scaleX(-1)' }}
        />
        <div className="data-status-indicator"></div>
        <div className="progress-indicator">
          {conversationContext.collectingInfo ? `${conversationContext.currentStep + 1}` : ''}
        </div>
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <div>ACEF AI Assistant</div>
            <div className="data-status">
              {dataLoading ? 'Loading...' : 
               websiteData.fullDataMap?.size > 0 
                 ? `Full Access (${websiteData.fullDataMap.size} sources)` 
                 : 'Limited data'}
            </div>
            {conversationContext.collectingInfo && (
              <div className="conversation-progress">
                <div>
                  {conversationContext.actionType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - Step {conversationContext.currentStep + 1}/{conversationContext.totalSteps}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <div style={{ fontSize: '10px', marginTop: '2px', opacity: '0.8' }}>
                  {conversationContext.missingFields.length > 0 
                    ? `Still need: ${conversationContext.missingFields.slice(0, 2).join(', ')}${conversationContext.missingFields.length > 2 ? '...' : ''}`
                    : 'Information complete!'}
                </div>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.from} ${m.isError ? 'error' : ''} ${m.isAutoSubscribe ? 'auto-subscribe' : ''}`}>
                {m.text}
                {/* Show info extracted indicator if this message contained useful info */}
                {m.from === 'user' && messages[i+1] && messages[i+1].text?.includes('thank') && (
                  <div className="info-extracted" title="Information extracted">!</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span>Processing</span>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder={
                conversationContext.collectingInfo && conversationContext.missingFields.length > 0
                  ? `Please provide your ${conversationContext.missingFields[0]}...`
                  : "Ask me anything or tell me what you'd like to do..."
              }
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </button>
          </div>

          <div className="chat-options">
            <WhatsAppButton 
              className="chat-link-button"
              buttonText="WhatsApp"
            />
            <button
              className="chat-link-button"
              onClick={() => fetchWebsiteData()}
              disabled={dataLoading}
            >
              {dataLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              className="chat-link-button"
              onClick={clearConversation}
              title="Start new conversation"
            >
              Clear
            </button>
            {conversationContext.collectingInfo && (
              <button
                className="chat-link-button"
                onClick={() => {
                  setConversationContext({
                    userIntent: null,
                    collectingInfo: false,
                    collectedData: {},
                    missingFields: [],
                    waitingFor: null,
                    actionType: null,
                    currentStep: 0,
                    totalSteps: 0,
                    userEmail: null,
                    hasSubscribedToNewsletter: false
                  });
                }}
                style={{ backgroundColor: '#ffebee', borderColor: '#f44336', color: '#d32f2f' }}
                title="Cancel current process"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;