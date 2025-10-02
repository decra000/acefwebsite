// utils/enhancedAI.js
const axios = require('axios');
const ActionHandler = require('../services/ActionHandler');
const GithubToken = require('../models/GithubToken');

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

class EnhancedAIService {
  constructor() {
    this.githubToken = null; // Will be loaded from database
    this.githubEndpoint = 'https://models.inference.ai.azure.com/chat/completions';
    this.requestCount = 0;
    this.actionHandler = new ActionHandler(API_BASE);
    this.tokenLoadedAt = null;
    this.tokenCacheDuration = 5 * 60 * 1000; // 5 minutes cache
    
    // Available GitHub Models (free tier)
    this.models = {
      primary: 'gpt-4o',
      secondary: 'gpt-4o-mini',
      fallback: 'Phi-3-medium-128k-instruct'
    };
  }

  /**
   * Load GitHub token from database
   */
  async loadGithubToken(forceReload = false) {
    try {
      // Use cached token if available and not expired
      const now = Date.now();
      if (!forceReload && this.githubToken && this.tokenLoadedAt) {
        const cacheAge = now - this.tokenLoadedAt;
        if (cacheAge < this.tokenCacheDuration) {
          console.log('✅ Using cached GitHub token');
          return this.githubToken;
        }
      }

      console.log('🔄 Loading GitHub token from database...');
      const tokenRecord = await GithubToken.getActiveToken();
      
      if (!tokenRecord || !tokenRecord.token) {
        console.warn('⚠️  No active GitHub token found in database');
        this.githubToken = null;
        this.tokenLoadedAt = null;
        return null;
      }

      this.githubToken = tokenRecord.token;
      this.tokenLoadedAt = now;
      console.log('✅ GitHub token loaded successfully');
      return this.githubToken;
      
    } catch (error) {
      console.error('❌ Error loading GitHub token from database:', error.message);
      this.githubToken = null;
      this.tokenLoadedAt = null;
      return null;
    }
  }

  /**
   * Main method to get AI reply with context-aware data retrieval
   */
  async getAIReply(userMessage, context = {}, options = {}) {
    this.requestCount++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 AI Request #${this.requestCount}: "${userMessage.substring(0, 60)}..."`);
    console.log('='.repeat(60));

    if (!userMessage || userMessage.trim().length === 0) {
      return {
        reply: "Please provide a message for me to respond to.",
        modelUsed: "Validation",
        extractedData: {},
        contextData: null
      };
    }

    // Load token from database
    await this.loadGithubToken();

    // Detect if user is asking for information (not submitting data)
    const isInformationRequest = this.detectInformationRequest(userMessage);
    let contextData = null;

    // Fetch relevant data if user is asking questions
    if (isInformationRequest) {
      contextData = await this.fetchRelevantData(userMessage, context);
    }

    // Build enhanced prompt with context and fetched data
    const systemPrompt = this.buildSystemPrompt(context, contextData);
    const userPrompt = this.buildUserPrompt(userMessage, context, contextData);

    // Try GitHub Models first
    const githubResult = await this.tryGitHubModels(systemPrompt, userPrompt);
    if (githubResult) {
      githubResult.contextData = contextData;
      return githubResult;
    }

    // Try HuggingFace as fallback
    const hfResult = await this.tryHuggingFace(userMessage);
    if (hfResult) {
      hfResult.contextData = contextData;
      return hfResult;
    }

    // Intelligent fallback
    console.log('\n🔄 All APIs unavailable - Using intelligent offline mode');
    return {
      reply: this.generateIntelligentFallback(userMessage, context, contextData),
      modelUsed: "Intelligent Offline Mode",
      extractedData: {},
      contextData
    };
  }

  /**
   * Detect if user is asking for information vs providing data
   */
  detectInformationRequest(message) {
    const lower = message.toLowerCase();
    
    // Question indicators
    const questionPatterns = [
      /^(what|where|when|how|why|who|which|can you|could you|do you|are there|is there)/i,
      /(tell me|show me|list|available|find|search|looking for)\s/i,
      /\?$/,
      /(jobs?|events?|volunteer|opportunities|projects?|news|blog)/i
    ];

    return questionPatterns.some(pattern => pattern.test(lower));
  }

  /**
   * Fetch relevant data from API based on user query
   */
  async fetchRelevantData(message, context) {
    const lower = message.toLowerCase();
    const data = {};

    try {
      // Jobs
      if (/\b(job|career|position|work|employment|hiring)\b/i.test(lower)) {
        console.log('📊 Fetching jobs data...');
        data.jobs = await this.actionHandler.getJobs();
        
        if (/\b(filter|department|location|type)\b/i.test(lower)) {
          data.jobFilters = await this.actionHandler.getJobFilterOptions();
        }
      }

      // Events
      if (/\b(event|workshop|seminar|conference|training)\b/i.test(lower)) {
        console.log('📊 Fetching events data...');
        data.events = await this.actionHandler.getEvents();
      }

      // Volunteering
      if (/\b(volunteer|volunteering)\b/i.test(lower)) {
        console.log('📊 Fetching volunteer data...');
        data.volunteerCountries = await this.actionHandler.getVolunteerCountries();
        data.volunteerStats = await this.actionHandler.getVolunteerStats();
      }

      // Projects
      if (/\b(project|initiative|program)\b/i.test(lower)) {
        console.log('📊 Fetching projects data...');
        data.projects = await this.actionHandler.getProjects();
      }

      // News/Blogs
      if (/\b(news|blog|article|update|story)\b/i.test(lower)) {
        console.log('📊 Fetching blogs/news...');
        data.blogs = await this.actionHandler.getPublishedBlogs();
      }

      // Team
      if (/\b(team|staff|member|who|people)\b/i.test(lower)) {
        console.log('📊 Fetching team data...');
        data.team = await this.actionHandler.getTeamMembers();
      }

      // Partners
      if (/\b(partner|collaboration|organization)\b/i.test(lower)) {
        console.log('📊 Fetching partners...');
        data.partners = await this.actionHandler.getPartners();
      }

      // Search functionality
      const searchMatch = lower.match(/search\s+(?:for\s+)?["']?([^"']+)["']?/i);
      if (searchMatch) {
        const term = searchMatch[1];
        console.log(`📊 Searching for: ${term}`);
        data.searchResults = await this.actionHandler.searchBlogs(term);
      }

    } catch (error) {
      console.error('Error fetching context data:', error.message);
    }

    return Object.keys(data).length > 0 ? data : null;
  }

  /**
   * Try GitHub Models API (Primary)
   */
  async tryGitHubModels(systemPrompt, userPrompt) {
    if (!this.githubToken) {
      console.log('⚠️  No GitHub token available from database');
      return null;
    }

    const modelsToTry = [
      this.models.primary,
      this.models.secondary,
      this.models.fallback
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`🤖 Trying GitHub Model: ${model}...`);
        
        const response = await axios.post(
          this.githubEndpoint,
          {
            model: model,
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: userPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 800,
            response_format: { type: "json_object" }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.githubToken}`
            },
            timeout: 25000
          }
        );

        const result = response.data.choices[0].message.content;
        
        // Parse JSON response
        let parsedResult;
        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          parsedResult = {
            reply: result,
            extractedData: {},
            confidence: 0.5
          };
        }

        console.log(`✅ GitHub Model ${model} SUCCESS`);
        
        return {
          reply: parsedResult.reply || result,
          modelUsed: `GitHub ${model}`,
          extractedData: parsedResult.extractedData || {},
          actionSuggestion: parsedResult.actionSuggestion || null,
          confidence: parsedResult.confidence || 0.8
        };

      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`⏳ ${model} rate limited...`);
        } else if (error.response?.status === 401) {
          console.log(`❌ ${model} authentication failed - token may be invalid`);
          // Invalidate cached token
          this.githubToken = null;
          this.tokenLoadedAt = null;
          break;
        } else {
          console.log(`❌ ${model} failed:`, error.message);
        }
      }
    }

    return null;
  }

  /**
   * Build system prompt with ACEF context and fetched data
   */
  buildSystemPrompt(context, fetchedData) {
    let prompt = `You are an AI assistant for ACEF (African Climate and Environmental Foundation).

CORE RESPONSIBILITIES:
1. Extract structured information from user messages
2. Guide users through multi-step processes naturally
3. Provide accurate information about ACEF services
4. Answer questions using fetched data when available

ACEF SERVICES:
- Job applications (careers)
- Event registration
- Volunteer opportunities (Kenya, Rwanda, Tanzania, Uganda, Ghana, Cameroon, etc.)
- Partnership inquiries
- Donations
- Newsletter subscriptions
- General inquiries

RESPONSE FORMAT (ALWAYS return valid JSON):
{
  "reply": "Your natural, conversational response to the user",
  "extractedData": {
    "email": "user@example.com or null",
    "name": "Full Name or null",
    "phone": "+1234567890 or null",
    "country": "Country Name or null",
    "position": "Job title or null",
    "eventName": "Event name or null",
    "organizationName": "Org name or null",
    "subject": "Subject or null",
    "message": "Message content or null",
    "skills": "Skills or null",
    "partnershipType": "Type or null"
  },
  "actionSuggestion": "job_inquiry|event_inquiry|volunteer_inquiry|partnership_inquiry|donation_inquiry|contact_inquiry|newsletter_subscription|null",
  "confidence": 0.0-1.0
}

CONVERSATION CONTEXT:
${JSON.stringify(context, null, 2)}`;

    if (fetchedData) {
      prompt += `\n\nAVAILABLE DATA (use this to answer user questions):
${JSON.stringify(fetchedData, null, 2)}

INSTRUCTIONS FOR USING FETCHED DATA:
- Reference specific details from the data in your response
- Provide concrete examples (job titles, event names, locations, etc.)
- If data shows multiple options, present 2-3 relevant ones
- Be specific rather than generic
- If no relevant data found, acknowledge it honestly`;
    }

    prompt += `\n\nEXTRACTION RULES:
1. Extract ALL identifiable information (email, phone, names, locations, etc.)
2. Maintain conversational tone while gathering data
3. Ask for ONE missing field at a time if collecting info
4. Acknowledge what user has already provided
5. Be warm, friendly, and professional

IMPORTANT:
- Return ONLY valid JSON, no markdown or extra text
- Set confidence based on clarity of user intent
- Extract data even from partial information
- Suggest action type based on user intent
- When answering questions, be specific using fetched data`;

    return prompt;
  }

  /**
   * Build user prompt with message and context
   */
  buildUserPrompt(userMessage, context, fetchedData) {
    let prompt = `User message: "${userMessage}"`;

    if (context.collectingInfo) {
      prompt += `\n\nCONTEXT: Currently collecting information for ${context.actionType}`;
      prompt += `\nAlready collected: ${JSON.stringify(context.collectedData)}`;
      prompt += `\nStill needed: ${context.missingFields.join(', ')}`;
      prompt += `\n\nINSTRUCTION: Ask for the FIRST missing field (${context.missingFields[0]}) in a natural, friendly way.`;
    } else if (fetchedData) {
      prompt += `\n\nINSTRUCTION: Answer the user's question using the AVAILABLE DATA provided in the system prompt. Be specific and reference actual items from the data.`;
    }

    return prompt;
  }

  /**
   * HuggingFace fallback
   */
  async tryHuggingFace(message) {
    const models = [
      {
        name: 'Mistral-7B',
        url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'
      }
    ];

    for (const model of models) {
      try {
        console.log(`🤖 Trying HuggingFace ${model.name}...`);
        
        const response = await axios.post(
          model.url,
          {
            inputs: message,
            parameters: {
              max_new_tokens: 250,
              temperature: 0.7,
              return_full_text: false,
              do_sample: true
            },
            options: {
              wait_for_model: true,
              use_cache: false
            }
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000
          }
        );

        let reply = null;
        const data = response.data;
        
        if (typeof data === 'string') {
          reply = data;
        } else if (Array.isArray(data)) {
          reply = data[0]?.generated_text || data[0];
        } else if (data.generated_text) {
          reply = data.generated_text;
        }

        if (reply && typeof reply === 'string' && reply.trim().length > 5) {
          console.log(`✅ HuggingFace ${model.name} SUCCESS`);
          return {
            reply: reply.trim(),
            modelUsed: `HuggingFace ${model.name}`,
            extractedData: {}
          };
        }
      } catch (error) {
        console.log(`❌ ${model.name} failed:`, error.message);
      }
    }

    return null;
  }

  /**
   * Intelligent fallback with pattern matching and fetched data
   */
  generateIntelligentFallback(message, context, fetchedData) {
    const lowerMessage = message.toLowerCase().trim();

    if (fetchedData) {
      if (fetchedData.jobs) {
        const jobs = Array.isArray(fetchedData.jobs) ? fetchedData.jobs : fetchedData.jobs.data || [];
        if (jobs.length > 0) {
          const jobList = jobs.slice(0, 3).map(j => `• ${j.title || j.position} - ${j.location || 'Multiple locations'}`).join('\n');
          return `Here are some available positions at ACEF:\n\n${jobList}\n\nWould you like to apply for any of these positions?`;
        }
        return "We currently have several job openings. Would you like me to help you apply?";
      }

      if (fetchedData.events) {
        const events = Array.isArray(fetchedData.events) ? fetchedData.events : fetchedData.events.data || [];
        if (events.length > 0) {
          const eventList = events.slice(0, 3).map(e => `• ${e.title || e.name} - ${e.date || 'TBD'}`).join('\n');
          return `Here are upcoming ACEF events:\n\n${eventList}\n\nWould you like to register for any of these?`;
        }
        return "We have several events coming up. Would you like to register?";
      }

      if (fetchedData.volunteerCountries) {
        const countries = Array.isArray(fetchedData.volunteerCountries) ? fetchedData.volunteerCountries : [];
        if (countries.length > 0) {
          return `ACEF has volunteer opportunities in: ${countries.join(', ')}. Which country interests you?`;
        }
      }

      if (fetchedData.projects) {
        const projects = Array.isArray(fetchedData.projects) ? fetchedData.projects : fetchedData.projects.data || [];
        if (projects.length > 0) {
          const projectList = projects.slice(0, 3).map(p => `• ${p.title}`).join('\n');
          return `Here are some of our active projects:\n\n${projectList}\n\nWould you like to learn more about any of these?`;
        }
      }

      if (fetchedData.blogs) {
        const blogs = Array.isArray(fetchedData.blogs) ? fetchedData.blogs : fetchedData.blogs.data || [];
        if (blogs.length > 0) {
          const blogList = blogs.slice(0, 3).map(b => `• ${b.title}`).join('\n');
          return `Here are recent updates:\n\n${blogList}`;
        }
      }
    }

    if (/(^|\s)(hi|hello|hey|greetings|good morning|good afternoon|good evening)(\s|$|!)/i.test(lowerMessage)) {
      return "Hello! I'm your ACEF assistant. I can help you with:\n\n• Job applications\n• Event registration\n• Volunteer opportunities\n• Partnerships\n• Donations\n• General information\n\nWhat can I help you with today?";
    }

    if (/how are you|how're you|hows it going|what's up/i.test(lowerMessage)) {
      return "I'm doing great and ready to help! What would you like to know about ACEF?";
    }

    if (/(thank|thanks|thx|appreciate)/i.test(lowerMessage)) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    if (/(bye|goodbye|see you|take care|gotta go)/i.test(lowerMessage)) {
      return "Goodbye! Feel free to come back anytime. Have a wonderful day!";
    }

    if (context.collectingInfo && context.missingFields && context.missingFields.length > 0) {
      const field = context.missingFields[0];
      const fieldPrompts = {
        'fullName': "What's your full name?",
        'name': "What's your full name?",
        'email': "What's your email address?",
        'phone': "What's your phone number? (Optional)",
        'country': "Which country are you interested in?",
        'position': "What position are you interested in?",
        'eventName': "Which event would you like to register for?",
        'organizationName': "What's your organization's name?",
        'contactPerson': "Who should we contact from your organization?",
        'partnershipType': "What type of partnership? (Financial, Technical, Project-based)",
        'subject': "What's the subject of your message?",
        'message': "Please share your message or details.",
        'skills': "What skills can you contribute?",
        'availability': "When are you available? (Full-time, Part-time, Weekends)"
      };

      return fieldPrompts[field] || `Could you provide your ${field}?`;
    }

    return "I'm here to help with ACEF services. Could you tell me more about what you're interested in? (jobs, events, volunteering, partnerships, donations, etc.)";
  }

  /**
   * Extract structured data using regex patterns (backup method)
   */
  extractDataFromText(text) {
    const extracted = {};

    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) extracted.email = emailMatch[0].toLowerCase();

    const phoneMatch = text.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) extracted.phone = phoneMatch[0];

    const nameMatch = text.match(/(?:my name is|i'?m|i am|call me|this is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
    if (nameMatch) extracted.name = nameMatch[1].trim();

    return extracted;
  }
}

const enhancedAIService = new EnhancedAIService();

async function getAIReply(userMessage, context = {}, options = {}) {
  return await enhancedAIService.getAIReply(userMessage, context, options);
}

module.exports = { getAIReply, EnhancedAIService };