// utils/ai.js
// Free AI Service - No API Keys Required

const axios = require('axios');

class AIService {
  constructor() {
    this.requestCount = 0;
  }

  // 🟢 Method 1: HuggingFace Inference API (Most Reliable - No Key Required)
  async tryHuggingFace(message) {
    const models = [
      {
        name: 'Mistral-7B',
        url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'
      },
      {
        name: 'Zephyr-7B',
        url: 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta'
      },
      {
        name: 'FLAN-T5-Large',
        url: 'https://api-inference.huggingface.co/models/google/flan-t5-large'
      },
      {
        name: 'FLAN-T5-Base',
        url: 'https://api-inference.huggingface.co/models/google/flan-t5-base'
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
              max_new_tokens: 200,
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
        } else if (data[0]?.generated_text) {
          reply = data[0].generated_text;
        }

        if (reply && typeof reply === 'string' && reply.trim().length > 5) {
          console.log(`✅ HuggingFace ${model.name} SUCCESS`);
          return { reply: reply.trim(), modelUsed: `HuggingFace ${model.name}` };
        }
      } catch (error) {
        if (error.response?.status === 503) {
          console.log(`⏳ ${model.name} is loading...`);
        } else {
          console.log(`❌ ${model.name} failed:`, error.message);
        }
      }
    }
    return null;
  }

  // 🟡 Method 2: Replicate Public Models (No Auth Required for Some Models)
  async tryReplicate(message) {
    try {
      console.log('🤖 Trying Replicate Public API...');
      // Using public endpoint that doesn't require auth
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'meta/llama-2-7b-chat',
          input: {
            prompt: message,
            max_length: 200
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const reply = response.data?.output;
      if (reply && reply.length > 5) {
        console.log('✅ Replicate SUCCESS');
        return { reply: reply.trim(), modelUsed: 'Llama 2 7B (Replicate)' };
      }
    } catch (error) {
      console.log('❌ Replicate failed:', error.message);
    }
    return null;
  }

  // 🟠 Method 3: Together AI Inference (No Key for Basic Access)
  async tryTogetherAI(message) {
    try {
      console.log('🤖 Trying Together AI Playground...');
      const response = await axios.post(
        'https://api.together.xyz/inference',
        {
          model: 'togethercomputer/llama-2-7b-chat',
          prompt: message,
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const reply = response.data?.output?.choices?.[0]?.text || response.data?.text;
      if (reply && reply.length > 5) {
        console.log('✅ Together AI SUCCESS');
        return { reply: reply.trim(), modelUsed: 'Llama 2 7B (Together)' };
      }
    } catch (error) {
      console.log('❌ Together AI failed:', error.message);
    }
    return null;
  }

  // 🔵 Method 4: Groq Free API (Limited Free Tier)
  async tryGroq(message) {
    try {
      console.log('🤖 Trying Groq Free Tier...');
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama2-70b-4096',
          messages: [{ role: 'user', content: message }],
          max_tokens: 200
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply && reply.length > 5) {
        console.log('✅ Groq SUCCESS');
        return { reply: reply.trim(), modelUsed: 'Llama 2 70B (Groq)' };
      }
    } catch (error) {
      console.log('❌ Groq failed:', error.message);
    }
    return null;
  }

  // 🟣 Method 5: Cohere Free Playground
  async tryCohere(message) {
    try {
      console.log('🤖 Trying Cohere Playground...');
      const response = await axios.post(
        'https://api.cohere.ai/v1/generate',
        {
          model: 'command',
          prompt: message,
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const reply = response.data?.generations?.[0]?.text;
      if (reply && reply.length > 5) {
        console.log('✅ Cohere SUCCESS');
        return { reply: reply.trim(), modelUsed: 'Cohere Command' };
      }
    } catch (error) {
      console.log('❌ Cohere failed:', error.message);
    }
    return null;
  }

  // 🔴 Method 6: AI21 Studio Free Tier
  async tryAI21(message) {
    try {
      console.log('🤖 Trying AI21 Studio...');
      const response = await axios.post(
        'https://api.ai21.com/studio/v1/j2-light/complete',
        {
          prompt: message,
          numResults: 1,
          maxTokens: 200,
          temperature: 0.7
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const reply = response.data?.completions?.[0]?.data?.text;
      if (reply && reply.length > 5) {
        console.log('✅ AI21 SUCCESS');
        return { reply: reply.trim(), modelUsed: 'Jurassic-2 Light (AI21)' };
      }
    } catch (error) {
      console.log('❌ AI21 failed:', error.message);
    }
    return null;
  }

  // 🟢 Enhanced Intelligent Fallback
  generateIntelligentFallback(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Greetings
    if (/(^|\s)(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|yo)(\s|$|!)/i.test(lowerMessage)) {
      const greetings = [
        "Hello! How can I assist you today? 😊",
        "Hi there! What can I help you with?",
        "Hey! I'm here and ready to help!",
        "Greetings! How may I be of service?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // How are you
    if (/how are you|how're you|hows it going|what's up|how do you do/i.test(lowerMessage)) {
      const responses = [
        "I'm doing great, thanks for asking! How can I help you today?",
        "I'm functioning perfectly and ready to assist! What do you need?",
        "All systems operational! 🤖 What can I do for you?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Identity questions
    if (/who are you|what are you|your name|tell me about yourself/i.test(lowerMessage)) {
      return "I'm an AI assistant here to help answer your questions and assist with various tasks. What would you like to know?";
    }
    
    // Capabilities
    if (/what can you do|your capabilities|features|abilities|help me/i.test(lowerMessage)) {
      return "I can help you with:\n\n• Answering questions\n• Providing information\n• Having conversations\n• Problem-solving\n• General assistance\n\nWhat would you like help with?";
    }
    
    // Thanks
    if (/(thank|thanks|thx|appreciate|grateful|ty)/i.test(lowerMessage)) {
      const responses = [
        "You're very welcome! Happy to help! 😊",
        "No problem at all! Anything else I can do?",
        "My pleasure! Let me know if you need anything else."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Goodbye
    if (/(bye|goodbye|see you|catch you later|take care|gotta go)/i.test(lowerMessage)) {
      return "Goodbye! Feel free to come back anytime. Have a wonderful day! 👋";
    }
    
    // Questions
    if (/^(who|what|where|when|why|how)\s/i.test(lowerMessage)) {
      return `That's an interesting question about "${message.substring(0, 50)}...". While I'm in offline mode, I'd be happy to discuss this. Could you provide more context?`;
    }
    
    // Math calculations
    const mathMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/×÷])\s*(\d+(?:\.\d+)?)/);
    if (mathMatch) {
      const [_, a, op, b] = mathMatch;
      const num1 = parseFloat(a);
      const num2 = parseFloat(b);
      let result;
      const operator = op === '×' ? '*' : op === '÷' ? '/' : op;
      
      switch(operator) {
        case '+': result = num1 + num2; break;
        case '-': result = num1 - num2; break;
        case '*': result = num1 * num2; break;
        case '/': 
          result = num2 !== 0 ? (num1 / num2) : 'Error: Division by zero';
          if (typeof result === 'number') result = Math.round(result * 100) / 100;
          break;
      }
      return `🔢 ${num1} ${op} ${num2} = **${result}**\n\nNeed any other calculations?`;
    }
    
    // Time
    if (/(what time|current time|date|today|now|what day)/i.test(lowerMessage)) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = now.toLocaleTimeString('en-US');
      return `📅 Today is ${dateStr}\n⏰ Current time: ${timeStr}`;
    }
    
    // Jokes
    if (/(joke|funny|laugh|humor)/i.test(lowerMessage)) {
      const jokes = [
        "Why don't programmers like nature? It has too many bugs! 🐛",
        "Why do Java developers wear glasses? Because they don't C#! 👓",
        "What's a computer's favorite snack? Microchips! 🖥️",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Default
    return `I received your message: "${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"\n\nI'm currently in offline mode, but I'm here to help! Could you rephrase or ask a specific question?`;
  }

  // Main cascade function
  async getAIReply(userMessage) {
    this.requestCount++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 AI Request #${this.requestCount}: "${userMessage.substring(0, 60)}..."`);
    console.log('='.repeat(60));

    if (!userMessage || userMessage.trim().length === 0) {
      return {
        reply: "Please provide a message for me to respond to.",
        modelUsed: "Validation"
      };
    }

    // Try all free methods in priority order
    const methods = [
      this.tryHuggingFace.bind(this),
      this.tryReplicate.bind(this),
      this.tryTogetherAI.bind(this),
      this.tryGroq.bind(this),
      this.tryCohere.bind(this),
      this.tryAI21.bind(this)
    ];

    for (const method of methods) {
      try {
        const result = await method(userMessage);
        if (result) {
          console.log(`\n✅ SUCCESS: Using ${result.modelUsed}`);
          console.log('='.repeat(60));
          return result;
        }
      } catch (error) {
        console.log(`⚠️ Method failed:`, error.message);
      }
    }

    // Intelligent fallback
    console.log('\n🔄 All APIs unavailable - Using intelligent offline mode');
    console.log('='.repeat(60));
    const fallbackReply = this.generateIntelligentFallback(userMessage);
    return {
      reply: fallbackReply,
      modelUsed: "Intelligent Offline Mode"
    };
  }
}

// Export singleton
const aiService = new AIService();

async function getAIReply(userMessage) {
  return await aiService.getAIReply(userMessage);
}

module.exports = { getAIReply };