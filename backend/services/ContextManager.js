// services/ContextManager.js
class ContextManager {
  constructor() {
    this.contexts = new Map();
    this.maxContextAge = 30 * 60 * 1000; // 30 minutes
  }

  getContext(sessionId) {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, this.createNewContext());
    }
    
    const context = this.contexts.get(sessionId);
    
    // Clean up old context
    if (Date.now() - context.lastActivity > this.maxContextAge) {
      this.contexts.set(sessionId, this.createNewContext());
      return this.contexts.get(sessionId);
    }
    
    context.lastActivity = Date.now();
    return context;
  }

  createNewContext() {
    return {
      userIntent: null,
      collectingInfo: false,
      collectedData: {},
      missingFields: [],
      actionType: null,
      currentStep: 0,
      totalSteps: 0,
      userEmail: null,
      hasSubscribedToNewsletter: false,
      conversationHistory: [],
      lastActivity: Date.now(),
      extractedEntities: {
        name: null,
        email: null,
        phone: null,
        country: null,
        organization: null
      }
    };
  }

  updateContext(sessionId, updates) {
    const context = this.getContext(sessionId);
    Object.assign(context, updates);
    context.lastActivity = Date.now();
    
    if (updates.collectedData) {
      this.updateExtractedEntities(context, updates.collectedData);
    }
    
    return context;
  }

  updateExtractedEntities(context, data) {
    const entities = context.extractedEntities;
    
    if (data.email && !entities.email) entities.email = data.email;
    if (data.name && !entities.name) entities.name = data.name;
    if (data.fullName && !entities.name) entities.name = data.fullName;
    if (data.phone && !entities.phone) entities.phone = data.phone;
    if (data.country && !entities.country) entities.country = data.country;
    if (data.organization && !entities.organization) entities.organization = data.organization;
    if (data.organizationName && !entities.organization) entities.organization = data.organizationName;
  }

  addMessage(sessionId, role, content) {
    const context = this.getContext(sessionId);
    context.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    // Keep only last 10 messages
    if (context.conversationHistory.length > 10) {
      context.conversationHistory = context.conversationHistory.slice(-10);
    }
  }

  isCollectingInfo(sessionId) {
    const context = this.getContext(sessionId);
    return context.collectingInfo && context.missingFields.length > 0;
  }

  getMissingFields(sessionId) {
    const context = this.getContext(sessionId);
    return context.missingFields || [];
  }

  clearContext(sessionId) {
    this.contexts.set(sessionId, this.createNewContext());
  }

  cleanupOldContexts() {
    const now = Date.now();
    for (const [sessionId, context] of this.contexts.entries()) {
      if (now - context.lastActivity > this.maxContextAge) {
        this.contexts.delete(sessionId);
      }
    }
  }
}

module.exports = ContextManager;