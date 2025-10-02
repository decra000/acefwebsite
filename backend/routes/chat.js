// routes/chat.js - Complete Updated Version
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const { getAIReply } = require('../utils/enhancedAI');
const InformationExtractor = require('../services/InformationExtractor');
const ActionHandler = require('../services/ActionHandler');
const ContextManager = require('../services/ContextManager');
const IntentClassifier = require('../services/IntentClassifier');
const InformationHandler = require('../services/InformationHandler');

const router = express.Router();
const contextManager = new ContextManager();
const extractor = new InformationExtractor();
const intentClassifier = new IntentClassifier();

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const actionHandler = new ActionHandler(API_BASE);
const informationHandler = new InformationHandler(actionHandler.api);

// Cleanup old contexts every 30 minutes
setInterval(() => contextManager.cleanupOldContexts(), 30 * 60 * 1000);

/**
 * Create new chat session
 */
router.post('/start', async (req, res) => {
  try {
    const sessionId = uuidv4();
    await executeQuery(
      `INSERT INTO chat_sessions (session_id, messages, context) VALUES (?, JSON_ARRAY(), ?)`,
      [sessionId, JSON.stringify(contextManager.createNewContext())]
    );
    
    console.log(`✅ New chat session created: ${sessionId}`);
    res.json({ session_id: sessionId });
  } catch (err) {
    console.error('DB Error on /start:', err.message);
    res.status(500).json({ 
      error: 'Failed to start chat session',
      details: err.message 
    });
  }
});

/**
 * Send message + intelligent processing
 */
router.post('/:session_id/message', async (req, res) => {
  const { session_id } = req.params;
  let { from, text } = req.body;

  // Validation
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  from = from || 'user';
  text = text.trim();

  try {
    const context = contextManager.getContext(session_id);
    contextManager.addMessage(session_id, 'user', text);

    // Save user message to DB
    await executeQuery(
      `UPDATE chat_sessions
       SET messages = JSON_ARRAY_APPEND(messages, '$', JSON_OBJECT('from', ?, 'text', ?)),
           last_updated = NOW()
       WHERE session_id = ?`,
      [from, text, session_id]
    );

    // STEP 1: Classify intent
    const intent = intentClassifier.classify(text);
    console.log('🎯 Intent detected:', intent);

    let botReply;
    let actionCompleted = false;

    // STEP 2: Handle based on intent type
    if (intent.type === 'information' && !context.collectingInfo) {
      // INFORMATION REQUEST - No form needed
      console.log('📚 Handling information query...');
      const queryType = intent.subType || InformationHandler.classifyInformationQuery(text);
      botReply = await informationHandler.handleInformationQuery(text, queryType);
      
    } else if (intent.type === 'greeting') {
      // GREETING
      botReply = intentClassifier.getInitialResponse(intent);
      
    } else if (intent.type === 'action' || context.collectingInfo) {
      // ACTION REQUEST - Needs form
      
      // Extract data using both regex and AI
      const regexExtracted = extractor.extract(text, context.actionType);
      const aiResult = await getAIReply(text, context, { extractStructuredData: true });
      
      const mergedExtracted = {
        ...regexExtracted,
        ...aiResult.extractedData
      };

      // If not collecting yet, start collection
      if (!context.collectingInfo) {
        const actionType = intent.subType || aiResult.actionSuggestion;
        const actionConfig = ActionHandler.ACTION_CONFIG[actionType];
        
        if (actionConfig) {
          contextManager.updateContext(session_id, {
            userIntent: actionType,
            collectingInfo: true,
            actionType: actionType,
            collectedData: mergedExtracted,
            missingFields: actionHandler.getMissingFields(mergedExtracted, actionType),
            currentStep: 0,
            totalSteps: actionConfig.steps.length,
            userEmail: mergedExtracted.email || null
          });

          console.log(`🎯 Started collecting for: ${actionType}`);
          botReply = intentClassifier.getActionIntroduction(actionType);
        } else {
          botReply = aiResult.reply;
        }
        
      } else {
        // Continue collection
        const updatedData = extractor.mergeWithExisting(mergedExtracted, context.collectedData);
        const missing = actionHandler.getMissingFields(updatedData, context.actionType);

        contextManager.updateContext(session_id, {
          collectedData: updatedData,
          missingFields: missing,
          userEmail: updatedData.email || context.userEmail,
          currentStep: context.currentStep + 1
        });

        console.log(`📊 Progress: ${context.currentStep + 1}/${context.totalSteps}`);
        console.log(`✅ Collected:`, Object.keys(updatedData));
        console.log(`❌ Missing:`, missing);

        // Check if ready to submit
        if (missing.length === 0) {
          console.log('🎉 Submitting action...');
          
          const submitResult = await actionHandler.submitAction(context.actionType, updatedData);

          if (submitResult.success) {
            botReply = submitResult.message;
            actionCompleted = true;

            await executeQuery(
              `UPDATE chat_sessions
               SET messages = JSON_ARRAY_APPEND(messages, '$', JSON_OBJECT('from', 'bot', 'text', ?)),
                   context = ?,
                   last_updated = NOW()
               WHERE session_id = ?`,
              [submitResult.message, JSON.stringify(contextManager.createNewContext()), session_id]
            );

            contextManager.clearContext(session_id);

            return res.json({
              reply: submitResult.message,
              modelUsed: 'ActionHandler',
              actionCompleted: true
            });
          } else {
            botReply = submitResult.message;
          }
        } else {
          // Ask for next missing field
          const aiResult = await getAIReply(text, context, { extractStructuredData: true });
          botReply = aiResult.reply;
        }
      }
      
    } else {
      // GENERAL/FALLBACK
      const aiResult = await getAIReply(text, context);
      botReply = aiResult.reply;
    }

    // Save bot reply
    contextManager.addMessage(session_id, 'bot', botReply);
    
    await executeQuery(
      `UPDATE chat_sessions
       SET messages = JSON_ARRAY_APPEND(messages, '$', JSON_OBJECT('from', 'bot', 'text', ?)),
           context = ?,
           last_updated = NOW()
       WHERE session_id = ?`,
      [botReply, JSON.stringify(contextManager.getContext(session_id)), session_id]
    );

    res.json({
      reply: botReply,
      modelUsed: intent.type === 'information' ? 'InformationHandler' : 'AI',
      actionCompleted,
      confidence: intent.confidence
    });

  } catch (err) {
    console.error('Chat Route Error:', err.message);
    console.error(err.stack);
    
    res.status(500).json({
      error: 'Failed to process message',
      details: err.message
    });
  }
});

/**
 * Get session messages
 */
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

module.exports = router;