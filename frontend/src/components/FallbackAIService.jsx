import { useState } from 'react';

// Create a service class instead of a React component
class FallbackAIService {
  constructor() {
    this.currentModelIndex = 0;
    
    // Chain of completely free AI models that don't require API keys
    this.FREE_AI_MODELS = [
      {
        name: 'HuggingFace Inference',
        endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        formatRequest: (message) => ({ inputs: message }),
        parseResponse: (data) => {
          if (data.generated_text) return data.generated_text;
          if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
          return null;
        },
        available: true
      },
      {
        name: 'Ollama Public Instance',
        endpoint: 'https://ollama.ai/api/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        formatRequest: (message) => ({
          model: 'llama2',
          prompt: message,
          stream: false
        }),
        parseResponse: (data) => data.response,
        available: true
      },
      {
        name: 'Replicate Free Tier',
        endpoint: 'https://api.replicate.com/v1/predictions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        formatRequest: (message) => ({
          version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
          input: { prompt: message, max_tokens: 500 }
        }),
        parseResponse: (data) => data.output?.[0] || data.output,
        available: false // Requires API key, keeping for reference
      }
    ];

    // Rule-based responses for common ACEF inquiries
    this.RULE_BASED_RESPONSES = {
      // Job inquiries
      job: {
        keywords: ['job', 'career', 'work', 'employment', 'position', 'hire', 'apply'],
        response: (websiteData, context) => {
          const jobs = websiteData?.fullDataMap?.get('jobs') || [];
          if (jobs.length > 0) {
            const jobsList = jobs.slice(0, 3).map(job => 
              `• ${job.title}${job.location ? ` in ${job.location}` : ''}${job.deadline ? ` (Deadline: ${job.deadline})` : ''}`
            ).join('\n');
            return `Here are current job opportunities at ACEF:\n\n${jobsList}\n\nTo apply, I'll need:\n• Your full name\n• Email address\n• Phone number (optional)\n• Which position interests you\n\nWhat's your full name?`;
          }
          return "I can help you with ACEF job opportunities! Please share your full name and email address, and I'll guide you through the application process.";
        }
      },

      // Volunteer inquiries
      volunteer: {
        keywords: ['volunteer', 'help out', 'participate', 'get involved', 'contribute'],
        response: (websiteData, context) => {
          const volunteerForms = websiteData?.fullDataMap?.get('volunteer_forms') || [];
          if (volunteerForms.length > 0) {
            return `Great! ACEF has volunteer opportunities in multiple countries. To get started, I need:\n• Your full name\n• Email address\n• Which country you're interested in\n\nWhat's your full name?`;
          }
          return "Thank you for your interest in volunteering with ACEF! Please share your name, email, and preferred country so I can connect you with the right opportunities.";
        }
      },

      // Event inquiries
      event: {
        keywords: ['event', 'workshop', 'seminar', 'conference', 'register', 'attend'],
        response: (websiteData, context) => {
          const events = websiteData?.fullDataMap?.get('events') || [];
          if (events.length > 0) {
            const eventsList = events.slice(0, 3).map(event => 
              `• ${event.title}${event.start_date ? ` - ${new Date(event.start_date).toLocaleDateString()}` : ''}${event.location ? ` at ${event.location}` : ''}`
            ).join('\n');
            return `Here are upcoming ACEF events:\n\n${eventsList}\n\nTo register, please provide:\n• Your full name\n• Email address\n• Which event interests you\n\nWhat's your name?`;
          }
          return "I can help you register for ACEF events! Please share your name and email address to get started.";
        }
      },

      // Contact inquiries
      contact: {
        keywords: ['contact', 'reach', 'talk', 'speak', 'email', 'phone', 'call'],
        response: (websiteData, context) => {
          const whatsappNumber = context.whatsappNumber || '+237123456789';
          return `You can reach ACEF through:\n\n📧 Email: info@acef.org\n📱 WhatsApp: ${whatsappNumber}\n🌐 Website: https://acef.org\n\nFor specific inquiries, I can help you submit a message. What would you like to contact us about?`;
        }
      },

      // Donation inquiries
      donate: {
        keywords: ['donate', 'donation', 'support', 'fund', 'sponsor', 'give', 'contribute'],
        response: (websiteData, context) => {
          const methods = websiteData?.fullDataMap?.get('transaction_methods') || [];
          if (methods.length > 0) {
            return `Thank you for wanting to support ACEF! We accept donations through multiple methods including mobile money and bank transfers.\n\nTo help you with the donation process:\n• What amount would you like to donate?\n• What's your preferred payment method?\n• Your email for receipt\n\nWhat amount are you considering?`;
          }
          return "Thank you for your generous intention to support ACEF's mission! For donation information and methods, please contact us at info@acef.org or visit our website at https://acef.org";
        }
      },

      // Partnership inquiries
      partner: {
        keywords: ['partner', 'partnership', 'collaborate', 'collaboration', 'organization', 'ngo'],
        response: (websiteData, context) => {
          return `We're always open to meaningful partnerships! To discuss collaboration opportunities, I'll need:\n• Your organization's name\n• Your name and role\n• Email address\n• Type of partnership you're interested in\n\nWhat's your organization's name?`;
        }
      },

      // General information
      about: {
        keywords: ['about', 'what is', 'mission', 'work', 'do', 'acef', 'organization'],
        response: (websiteData, context) => {
          const countries = websiteData?.fullDataMap?.get('countries') || [];
          const projects = websiteData?.fullDataMap?.get('projects') || [];
          return `ACEF (African Climate and Environmental Foundation) is dedicated to:\n\n🌍 Sustainable development across Africa\n🌱 Climate resilience building\n💚 Environmental conservation\n👥 Community empowerment\n\n${countries.length > 0 ? `We operate in ${countries.length} countries` : 'We work across multiple African countries'}${projects.length > 0 ? ` with ${projects.length} active projects` : ''}.\n\nHow can I help you get involved with our mission?`;
        }
      }
    };
  }

  // Enhanced pattern matching for user intent
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [intent, config] of Object.entries(this.RULE_BASED_RESPONSES)) {
      if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return { intent, confidence: 'high', config };
      }
    }
    
    return { intent: 'general', confidence: 'low', config: null };
  }

  // Information extraction patterns
  extractInfo(message) {
    const extracted = {};
    
    // Email extraction
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) extracted.email = emailMatch[0];
    
    // Phone extraction  
    const phoneMatch = message.match(/(?:\+254|0)[0-9]{9,10}|(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) extracted.phone = phoneMatch[0];
    
    // Name extraction
    const namePatterns = [
      /my name is ([A-Za-z\s]+)/i,
      /i'?m ([A-Za-z\s]+)/i,
      /i am ([A-Za-z\s]+)/i,
      /call me ([A-Za-z\s]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1].trim().length > 1) {
        extracted.name = match[1].trim();
        break;
      }
    }
    
    // Amount extraction for donations
    const amountMatch = message.match(/\$(\d+(?:\.\d{2})?)|(\d+)\s*dollars?/i);
    if (amountMatch) {
      extracted.amount = parseFloat(amountMatch[1] || amountMatch[2]);
    }
    
    return extracted;
  }

  // Try free AI models in sequence
  async tryFreeAIModels(message, systemPrompt) {
    for (let i = 0; i < this.FREE_AI_MODELS.length; i++) {
      const modelIndex = (this.currentModelIndex + i) % this.FREE_AI_MODELS.length;
      const model = this.FREE_AI_MODELS[modelIndex];
      
      if (!model.available) continue;
      
      try {
        console.log(`🤖 Trying ${model.name}...`);
        
        const response = await fetch(model.endpoint, {
          method: model.method,
          headers: model.headers,
          body: JSON.stringify(model.formatRequest(message)),
          timeout: 10000
        });
        
        if (response.ok) {
          const data = await response.json();
          const result = model.parseResponse(data);
          
          if (result && result.length > 10) {
            console.log(`✅ ${model.name} responded successfully`);
            this.currentModelIndex = modelIndex;
            return result;
          }
        }
      } catch (error) {
        console.log(`❌ ${model.name} failed:`, error.message);
        continue;
      }
    }
    
    return null;
  }

  // Generate intelligent fallback when all AI models fail
  generateIntelligentFallback(message, extractedInfo, websiteData, context) {
    const lowerMessage = message.toLowerCase();
    const whatsappNumber = context.whatsappNumber || '+237123456789';
    
    // Acknowledge any extracted information
    let response = '';
    if (Object.keys(extractedInfo).length > 0) {
      response += `Thank you for providing that information!\n\n`;
    }
    
    // Provide contextual help based on message content
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      response += `I'm here to help you with ACEF services! I can assist with:

🌍 **Learning about ACEF's work** across Africa
💼 **Job applications** and career opportunities
🤝 **Volunteer opportunities** in your country  
🎯 **Event registration** for workshops and seminars
💰 **Donation information** and support options
📧 **Contact information** and direct communication

What specifically interests you?`;
    } else if (lowerMessage.includes('thank')) {
      response += `You're welcome! Is there anything else I can help you with regarding ACEF's programs or services?`;
    } else {
      // Generic helpful response with current data
      const stats = websiteData?.fullDataMap ? {
        countries: websiteData.fullDataMap.get('countries')?.length || 0,
        projects: websiteData.fullDataMap.get('projects')?.length || 0,
        jobs: websiteData.fullDataMap.get('jobs')?.length || 0,
        events: websiteData.fullDataMap.get('events')?.length || 0
      } : {};
      
      response += `I'm your ACEF assistant! ${stats.countries ? `We work in ${stats.countries} countries` : 'We work across Africa'}${stats.projects ? ` with ${stats.projects} active projects` : ''}.

🔍 **Current opportunities:**
${stats.jobs ? `• ${stats.jobs} job openings` : '• Career opportunities available'}
${stats.events ? `• ${stats.events} upcoming events` : '• Workshops and training sessions'}
• Volunteer programs in multiple countries
• Partnership opportunities for organizations

📞 **Get immediate help:**
📧 Email: info@acef.org
📱 WhatsApp: ${whatsappNumber}
🌐 Website: https://acef.org

How can I assist you today?`;
    }
    
    return response;
  }

  // Main fallback function
  async getFallbackResponse(userMessage, websiteData = {}, conversationContext = {}) {
    try {
      // Extract any information from the message
      const extractedInfo = this.extractInfo(userMessage);
      console.log('📝 Extracted info:', extractedInfo);
      
      // Detect user intent
      const { intent, config } = this.detectIntent(userMessage);
      console.log('🎯 Detected intent:', intent);
      
      // If we have a rule-based response, use it
      if (config) {
        const ruleResponse = config.response(websiteData, conversationContext);
        
        // Add extracted info acknowledgment if any
        if (Object.keys(extractedInfo).length > 0) {
          const infoAck = Object.entries(extractedInfo)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          return `Thanks for providing: ${infoAck}\n\n${ruleResponse}`;
        }
        
        return ruleResponse;
      }
      
      // Try free AI models as backup
      const systemPrompt = `You are an AI assistant for ACEF (African Climate and Environmental Foundation). 
      ACEF works on sustainable development, climate resilience, and environmental conservation across Africa.
      Be helpful, concise, and ask follow-up questions to understand user needs.
      Current user message: "${userMessage}"`;
      
      const aiResponse = await this.tryFreeAIModels(userMessage, systemPrompt);
      if (aiResponse) {
        return aiResponse;
      }
      
      // Final fallback - intelligent static response
      const fallbackResponse = this.generateIntelligentFallback(userMessage, extractedInfo, websiteData, conversationContext);
      return fallbackResponse;
      
    } catch (error) {
      console.error('Fallback error:', error);
      return this.generateIntelligentFallback(userMessage, {}, websiteData, conversationContext);
    }
  }
}

// Export a singleton instance
const fallbackAIService = new FallbackAIService();
export default fallbackAIService;