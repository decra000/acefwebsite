const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const { getAIReply } = require('../utils/ai');
const InformationExtractor = require('../services/InformationExtractor');
const ActionHandler = require('../services/ActionHandler');
const ContextManager = require('../services/ContextManager');

const router = express.Router();
const contextManager = new ContextManager();
const extractor = new InformationExtractor();

// API base URL from environment
const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const actionHandler = new ActionHandler(API_BASE);

// Cleanup old contexts every 30 minutes
setInterval(() => contextManager.cleanupOldContexts(), 30 * 60 * 1000);

// Create new chat session
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuidv4();
    await executeQuery(
      `INSERT INTO chat_sessions (session_id, messages, context) VALUES (?, JSON_ARRAY(), ?)`,
      [sessionId, JSON.stringify(contextManager.createNewContext())]
    );
    res.json({ session_id: sessionId });
  } catch (err) {
    console.error('DB Error on /start:', err.message);
    res.status(500).json({ error: 'Failed to start chat session', details: err.message });
  }
});

// Send message + intelligent processing
router.post('/:session_id/message', async (req, res) => {
  const { session_id } = req.params;
  let { from, text } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  from = from || 'user';
  text = text.trim();

  try {
    // Get or create context for this session
    const context = contextManager.getContext(session_id);
    
    // Add user message to history
    contextManager.addMessage(session_id, 'user', text);

    // Save user message to DB
    await executeQuery(
      `UPDATE chat_sessions
       SET messages = JSON_ARRAY_APPEND(messages, '$', JSON_OBJECT('from', ?, 'text', ?)),
           last_updated = NOW()
       WHERE session_id = ?`,
      [from, text, session_id]
    );

    // Extract information from user message
    const extracted = extractor.extract(text, context.actionType);
    console.log('📝 Extracted info:', extracted);

    // Detect user intent if not already collecting info
    if (!context.collectingInfo) {
      const intent = detectUserIntent(text);
      if (intent.type !== 'information_request') {
        const actionConfig = ActionHandler.ACTION_CONFIG[intent.type];
        if (actionConfig) {
          contextManager.updateContext(session_id, {
            userIntent: intent.type,
            collectingInfo: true,
            actionType: intent.type,
            collectedData: extracted,
            missingFields: actionHandler.getMissingFields(extracted, intent.type),
            currentStep: 0,
            totalSteps: actionConfig.steps.length,
            userEmail: extracted.email || null
          });
        }
      }
    } else {
      // Merge new extracted info with existing
      const merged = extractor.mergeWithExisting(extracted, context.collectedData);
      const missing = actionHandler.getMissingFields(merged, context.actionType);
      
      contextManager.updateContext(session_id, {
        collectedData: merged,
        missingFields: missing,
        userEmail: merged.email || context.userEmail,
        currentStep: context.currentStep + 1
      });

      // Auto-subscribe to newsletter if email collected
      if (merged.email && !context.hasSubscribedToNewsletter) {
        try {
          await actionHandler.autoSubscribeNewsletter(merged.email, merged.name || merged.fullName);
          contextManager.updateContext(session_id, { hasSubscribedToNewsletter: true });
        } catch (e) {
          console.log('Newsletter subscription skipped:', e.message);
        }
      }

      // Check if ready to submit
      if (missing.length === 0 && context.collectingInfo) {
        const submitResult = await actionHandler.submitAction(context.actionType, merged);
        
        // Save success message
        await executeQuery(
          `UPDATE chat_sessions
           SET messages = JSON_ARRAY_APPEND(messages, '$', JSON_OBJECT('from', 'bot', 'text', ?)),
               context = ?,
               last_updated = NOW()
           WHERE session_id = ?`,
          [submitResult.message, JSON.stringify(contextManager.createNewContext()), session_id]
        );

        // Clear context after successful submission
        contextManager.clearContext(session_id);

        return res.json({ 
          reply: submitResult.message, 
          modelUsed: 'ActionHandler',
          actionCompleted: true
        });
      }
    }

    // Get updated context after processing
    const updatedContext = contextManager.getContext(session_id);

    // Build enhanced prompt with context
    const enhancedPrompt = buildEnhancedPrompt(updatedContext, text);

    // Get AI reply with context-aware fallback
    let aiResult;
    try {
      aiResult = await getAIReply(text, enhancedPrompt);
      if (!aiResult || !aiResult.reply) {
        aiResult = { 
          reply: getFallbackResponse(text, updatedContext), 
          modelUsed: 'Context-Aware Fallback' 
        };
      }
    } catch (apiErr) {
      console.error('AI Error:', apiErr.message);
      aiResult = { 
        reply: getFallbackResponse(text, updatedContext), 
        modelUsed: 'Context-Aware Fallback' 
      };
    }

    // Add bot message to history
    contextManager.addMessage(session_id, 'bot', aiResult.reply);

    // Save AI reply and updated context
    await executeQuery(
      `UPDATE chat_sessions
       SET messages = JSON_ARRAY_APPEND(messages, '$', JSON_OBJECT('from', 'bot', 'text', ?)),
           context = ?,
           last_updated = NOW()
       WHERE session_id = ?`,
      [aiResult.reply, JSON.stringify(contextManager.getContext(session_id)), session_id]
    );

    res.json(aiResult);
  } catch (err) {
    console.error('Chat Route Error:', err.message);
    res.status(500).json({ error: 'Failed to process message', details: err.message });
  }
});

// Get session messages
router.get('/:session_id', async (req, res) => {
  const { session_id } = req.params;
  
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const [rows] = await executeQuery(
      `SELECT messages, context FROM chat_sessions WHERE session_id = ?`,
      [session_id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        error: 'Session not found',
        messages: [],
        context: null 
      });
    }

    const session = rows[0];
    
    let messages = [];
    if (typeof session.messages === 'string') {
      try {
        messages = JSON.parse(session.messages);
      } catch (e) {
        console.error('Failed to parse messages JSON:', e);
        messages = [];
      }
    } else if (Array.isArray(session.messages)) {
      messages = session.messages;
    }

    let context = null;
    if (typeof session.context === 'string') {
      try {
        context = JSON.parse(session.context);
      } catch (e) {
        console.error('Failed to parse context JSON:', e);
        context = null;
      }
    } else if (session.context) {
      context = session.context;
    }

    res.json({ messages, context });
  } catch (err) {
    console.error('Fetch Messages Error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch messages', 
      details: err.message,
      messages: [],
      context: null
    });
  }
});

// Helper: Detect user intent
function detectUserIntent(message) {
  const lower = message.toLowerCase();
  
  const intents = {
    job_inquiry: ['job', 'career', 'position', 'work', 'employment', 'hire', 'apply'],
    event_inquiry: ['event', 'workshop', 'seminar', 'register', 'attend', 'conference'],
    volunteer_inquiry: ['volunteer', 'help out', 'participate', 'get involved', 'community service'],
    partnership_inquiry: ['partner', 'collaborate', 'organization', 'ngo', 'cooperation'],
    donation_inquiry: ['donate', 'support', 'fund', 'sponsor', 'contribute'],
    newsletter_subscription: ['newsletter', 'subscribe', 'updates', 'news'],
    contact_inquiry: ['contact', 'reach', 'talk', 'email', 'message', 'inquiry']
  };

  for (const [type, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return { type, confidence: 'high' };
    }
  }

  return { type: 'information_request', confidence: 'low' };
}

// Helper: Build enhanced prompt with context
function buildEnhancedPrompt(context, userMessage) {
  let prompt = `You are an AI assistant for ACEF (African Climate and Environmental Foundation).

ACEF works on sustainable development, climate resilience, and environmental conservation across Africa.

Current conversation context:`;

  if (context.collectingInfo) {
    const actionName = context.actionType.replace('_', ' ');
    prompt += `
- Currently collecting information for: ${actionName}
- Progress: Step ${context.currentStep + 1} of ${context.totalSteps}
- Collected data: ${JSON.stringify(context.collectedData)}
- Missing fields: ${context.missingFields.join(', ')}

INSTRUCTIONS: 
1. Ask for ONE missing field at a time
2. Be natural, warm, and conversational
3. Acknowledge what the user has already provided
4. For the field "${context.missingFields[0]}", ask in a friendly way`;
  } else {
    prompt += `
- No active information collection
- Be helpful and detect if user wants to:
  * Apply for a job
  * Register for an event
  * Volunteer
  * Partner with ACEF
  * Donate
  * Subscribe to newsletter
  * Contact ACEF`;
  }

  prompt += `

User message: "${userMessage}"

Respond naturally and helpfully.`;

  return prompt;
}

// Helper: Context-aware fallback response
function getFallbackResponse(message, context) {
  // If collecting info, provide contextual prompt
  if (context.collectingInfo && context.missingFields && context.missingFields.length > 0) {
    return generateContextualPrompt(context, message);
  }

  // Welcome message for new conversations
  if (!context.collectingInfo && context.currentStep === 0) {
    return `👋 Hi! I'm your ACEF assistant. I can help you with:

• Job applications and career opportunities
• Event registration
• Volunteer opportunities
• Partnership inquiries
• Donations and support
• General information about ACEF

What can I help you with today?`;
  }

  // Generic helpful response
  return `I'm here to help with ACEF services. Could you tell me more about what you're interested in?`;
}

// Helper: Generate contextual prompts during info collection
function generateContextualPrompt(context, userMessage) {
  const { actionType, missingFields, collectedData, currentStep, totalSteps } = context;
  const field = missingFields[0];
  
  let prompt = '';
  if (currentStep > 0) {
    prompt += "Great! ";
  }
  
  switch (field) {
    case 'fullName':
    case 'name':
      prompt += "What's your full name?";
      break;
    case 'email':
      prompt += "What's your email address?";
      break;
    case 'phone':
      prompt += "Could you provide your phone number? (Optional, but helpful)";
      break;
    case 'country':
      prompt += "Which country are you interested in volunteering in?";
      break;
    case 'position':
      prompt += "What position are you interested in?";
      break;
    case 'eventName':
      prompt += "Which event would you like to register for?";
      break;
    case 'organizationName':
      prompt += "What's the name of your organization?";
      break;
    case 'contactPerson':
      prompt += "Who should we contact from your organization?";
      break;
    case 'partnershipType':
      prompt += "What type of partnership are you interested in? (e.g., Financial, Technical, Project-based)";
      break;
    case 'subject':
      prompt += "What's the subject of your message?";
      break;
    case 'message':
      prompt += "Please share your message or additional details.";
      break;
    case 'skills':
      prompt += "What skills would you like to contribute? (e.g., teaching, agriculture, technology)";
      break;
    case 'availability':
      prompt += "When are you available to volunteer? (e.g., Full-time, Part-time, Weekends)";
      break;
    default:
      prompt += `Could you provide your ${field}?`;
  }
  
  if (totalSteps > 0) {
    prompt += `\n\n📋 Progress: Step ${currentStep + 1} of ${totalSteps}`;
  }
  
  return prompt;
}

module.exports = router;