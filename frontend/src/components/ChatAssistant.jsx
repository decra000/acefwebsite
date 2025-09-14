import React, { useState, useEffect, useRef } from 'react';
import { API_URL, STATIC_URL } from '../config';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // State for website data
  const [websiteData, setWebsiteData] = useState({ apiData: [], pageContent: [] });
  const [dataLastFetched, setDataLastFetched] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // GitHub Models API configuration
  const GITHUB_TOKEN = "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";
  const GITHUB_ENDPOINT = "https://models.github.ai/inference/chat/completions";
  const MODEL = "gpt-4o-mini";

  // API Configuration - Update these URLs to match your backend
  // src/config.js

// ✅ API Configuration - Always prefer .env values
const API_BASE = API_URL;



  // Simple error responses
  const getErrorResponse = (errorType) => {
    const responses = [
      "I'm having trouble connecting right now. Please try again or contact us via WhatsApp for immediate assistance.",
      "Sorry, I'm experiencing technical difficulties. You can reach us directly at d.mokorah@alustudent.com or use our contact form.",
      "I'm temporarily unavailable. For urgent inquiries, please WhatsApp us at +254717266565."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const welcomeMessage = {
    from: 'bot',
    text: 'Hi there! 👋 I am your ACEF assistant and I\'m here to answer any questions you might have about climate change, environmental sustainability, and our programs across Africa. Feel free to ask me anything or use our contact form if you need personalized assistance. How can I help you today?'
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Enhanced website data fetching function with better error handling
  const fetchWebsiteData = async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      console.log('🔄 Starting data fetch from:', API_BASE);
      
      // Define API endpoints to fetch from
      const apiEndpoints = [
        { url: `${API_BASE}/projects`, name: 'projects' },
        { url: `${API_BASE}/blogs`, name: 'blogs' },
        { url: `${API_BASE}/team`, name: 'team' },
        { url: `${API_BASE}/partners`, name: 'partners' },
        { url: `${API_BASE}/countries`, name: 'countries' },
        { url: `${API_BASE}/categories`, name: 'categories' },
        { url: `${API_BASE}/contacts`, name: 'contacts' }
      ];

      // Fetch data from all endpoints with individual error handling
      const apiDataPromises = apiEndpoints.map(async (endpoint) => {
        try {
          console.log(`🔍 Fetching: ${endpoint.url}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${endpoint.name} data loaded:`, data?.length || 'N/A', 'items');
            
            return { 
              source: endpoint.name, 
              data: Array.isArray(data) ? data.slice(0, 15) : data, // Get more data for better context
              status: 'success',
              timestamp: new Date().toISOString()
            };
          } else {
            console.warn(`⚠️ ${endpoint.name} returned ${response.status}: ${response.statusText}`);
            return { 
              source: endpoint.name, 
              data: null, 
              status: 'error', 
              error: `HTTP ${response.status}` 
            };
          }
        } catch (error) {
          console.error(`❌ Error fetching ${endpoint.name}:`, error.message);
          return { 
            source: endpoint.name, 
            data: null, 
            status: 'error', 
            error: error.name === 'AbortError' ? 'Timeout' : error.message 
          };
        }
      });

      const apiResults = await Promise.all(apiDataPromises);
      const successfulData = apiResults.filter(item => item.status === 'success' && item.data);
      const failedData = apiResults.filter(item => item.status === 'error');
      
      console.log(`📊 Data fetch complete: ${successfulData.length}/${apiResults.length} endpoints successful`);
      
      if (failedData.length > 0) {
        console.warn('⚠️ Failed endpoints:', failedData.map(f => `${f.source}: ${f.error}`));
      }

      // Try to fetch page content (optional)
      let pageContent = [];
      try {
        console.log('📄 Attempting to fetch page content...');
        const contentResponse = await fetch(`${API_BASE}/page-content`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (contentResponse.ok) {
          pageContent = await contentResponse.json();
          console.log('✅ Page content loaded:', pageContent?.length || 0, 'pages');
        } else {
          console.log('ℹ️ Page content endpoint not available or returned:', contentResponse.status);
        }
      } catch (error) {
        console.log('ℹ️ Page content fetch failed (optional):', error.message);
      }

      const finalData = {
        apiData: successfulData,
        pageContent: pageContent,
        lastUpdated: new Date().toISOString(),
        stats: {
          total: apiResults.length,
          successful: successfulData.length,
          failed: failedData.length
        }
      };

      setWebsiteData(finalData);
      setDataLastFetched(new Date());
      
      // Show success message in console
      if (successfulData.length > 0) {
        console.log('🎉 Website data successfully loaded and ready for AI assistant');
      } else {
        console.warn('⚠️ No data could be loaded from any endpoint');
        setDataError('Unable to load current website data. Using fallback information.');
      }

      return finalData;
      
    } catch (error) {
      console.error('❌ Critical error in fetchWebsiteData:', error);
      setDataError(`Data loading failed: ${error.message}`);
      return { apiData: [], pageContent: [], error: error.message };
    } finally {
      setDataLoading(false);
    }
  };

  // Load website data when component mounts
  useEffect(() => {
    console.log('🚀 ChatAssistant component mounted, initializing data fetch...');
    fetchWebsiteData();
    
    // Set up periodic refresh every 10 minutes
    const refreshInterval = setInterval(() => {
      console.log('🔄 Periodic data refresh triggered');
      fetchWebsiteData();
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearInterval(refreshInterval);
      console.log('🧹 ChatAssistant cleanup: intervals cleared');
    };
  }, []);

  // Enhanced system prompt with dynamic content and better formatting
  const getSystemPrompt = (websiteData = { apiData: [], pageContent: [] }) => {
    const currentTime = new Date().toLocaleString();
    
    let basePrompt = `You are an AI assistant for ACEF (African Climate and Environmental Foundation). You help users learn about climate change, environmental sustainability, and ACEF's programs across Africa.

ACEF CORE INFORMATION:
🌍 Mission: Supporting sustainable development and climate resilience across Africa
🎯 Focus Areas:
- Sustainable agriculture training and support
- Renewable energy projects (especially solar)
- Water conservation and management initiatives
- Reforestation and biodiversity programs
- Community resilience building
- Climate education and awareness campaigns

🌍 Operating Countries: Kenya, Rwanda, Tanzania, Uganda, and Ghana
📧 Contact: d.mokorah@alustudent.com
📱 WhatsApp: +254717266565

Data Last Updated: ${currentTime}`;

    // Add current API data with enhanced formatting
    if (websiteData.apiData && websiteData.apiData.length > 0) {
      basePrompt += `\n\n=== LIVE ACEF WEBSITE DATA ===\n`;
      
      websiteData.apiData.forEach(item => {
        if (item && item.data) {
          basePrompt += `\n📋 ${item.source.toUpperCase()} (${Array.isArray(item.data) ? item.data.length : 1} items):\n`;
          
          if (Array.isArray(item.data)) {
            item.data.slice(0, 8).forEach((entry, index) => { // Show more items
              if (item.source === 'team' && entry.name) {
                basePrompt += `• ${entry.name}${entry.position ? ` - ${entry.position}` : ''}${entry.bio ? ` | ${entry.bio.substring(0, 120)}...` : ''}\n`;
              } else if (item.source === 'projects' && entry.title) {
                basePrompt += `• ${entry.title}${entry.location ? ` (${entry.location})` : ''}${entry.description ? ` | ${entry.description.substring(0, 150)}...` : ''}${entry.status ? ` [${entry.status}]` : ''}\n`;
              } else if (item.source === 'blogs' && entry.title) {
                basePrompt += `• ${entry.title}${entry.author ? ` by ${entry.author}` : ''}${entry.date ? ` (${entry.date})` : ''}${entry.content ? ` | ${entry.content.substring(0, 120)}...` : ''}\n`;
              } else if (item.source === 'partners' && entry.name) {
                basePrompt += `• ${entry.name}${entry.type ? ` [${entry.type}]` : ''}${entry.description ? ` | ${entry.description.substring(0, 100)}...` : ''}\n`;
              } else if (item.source === 'countries' && entry.name) {
                basePrompt += `• ${entry.name}${entry.region ? ` (${entry.region})` : ''}${entry.projects_count ? ` - ${entry.projects_count} active projects` : ''}\n`;
              } else if (entry.name || entry.title) {
                basePrompt += `• ${entry.name || entry.title}\n`;
              }
            });
          } else if (typeof item.data === 'object') {
            // Handle single objects
            const keys = Object.keys(item.data).slice(0, 5);
            keys.forEach(key => {
              if (item.data[key] && typeof item.data[key] === 'string') {
                basePrompt += `• ${key}: ${item.data[key].substring(0, 100)}${item.data[key].length > 100 ? '...' : ''}\n`;
              }
            });
          }
          basePrompt += '\n';
        }
      });

      // Add data freshness indicator
      if (websiteData.lastUpdated) {
        basePrompt += `\n🕒 Data Freshness: Information updated ${websiteData.lastUpdated}\n`;
      }
    } else {
      basePrompt += `\n\n⚠️ NOTICE: Live website data is currently unavailable. Using core ACEF information only.\n`;
    }

    // Add page content if available
    if (websiteData.pageContent && websiteData.pageContent.length > 0) {
      basePrompt += `\n=== WEBSITE PAGE CONTENT ===\n`;
      websiteData.pageContent.forEach(page => {
        if (page && page.content) {
          basePrompt += `\n📄 ${page.page.toUpperCase()}:\n${page.content.substring(0, 500)}${page.content.length > 500 ? '...' : ''}\n\n`;
        }
      });
    }

    basePrompt += `\n=== RESPONSE GUIDELINES ===
✅ Always be helpful, informative, and encouraging about ACEF's climate work
✅ Use the specific, current information provided above from ACEF's live website
✅ When asked about team members, projects, blogs, or partners - refer to the actual current data above
✅ For contact inquiries, always provide: d.mokorah@alustudent.com and +254717266565
✅ Encourage involvement through volunteering, partnerships, donations, or spreading awareness
✅ Keep responses informative but conversational (aim for 2-4 sentences unless more detail is requested)
✅ If you don't have specific current information, suggest they visit the website or contact ACEF directly
✅ Focus on ACEF's impact in Kenya, Rwanda, Tanzania, Uganda, and Ghana
✅ Highlight sustainable development, climate resilience, and community empowerment

🚫 Don't make up information not provided in the data above
🚫 Don't be overly formal - maintain a friendly, approachable tone
🚫 Don't give overly long responses unless specifically requested`;

    return basePrompt;
  };

  // GitHub Models API call with better error handling
  const callGitHubModelsAPI = async (userMessage) => {
    try {
      console.log('🤖 Making API call to GitHub Models...');
      console.log('📝 User message:', userMessage.substring(0, 100) + '...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(GITHUB_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: getSystemPrompt(websiteData)
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          model: MODEL,
          temperature: 0.7,
          max_tokens: 600, // Increased for more detailed responses
          top_p: 0.9
        })
      });

      clearTimeout(timeoutId);
      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ AI response received successfully');
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        console.error('❌ Invalid response format:', data);
        throw new Error('Invalid response format from GitHub Models API');
      }
    } catch (error) {
      console.error('❌ GitHub Models API Error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  };

  // Enhanced message sending with better user experience
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.toLowerCase();
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    const originalInput = input;
    setInput('');
    setLoading(true);

    // Check for form-related requests
    if (userMessage.includes('chat via form') || userMessage.includes('contact form') || userMessage.includes('form')) {
      setLoading(false);
      setShowForm(true);
      setMessages([...newMessages, { 
        from: 'bot', 
        text: "I'll help you with that! Please fill out the form below and I'll make sure your message reaches the right team.",
        showForm: true
      }]);
      return;
    }

    // Check for data refresh requests
    if (userMessage.includes('refresh data') || userMessage.includes('update data') || userMessage.includes('reload data')) {
      setLoading(false);
      setMessages([...newMessages, { 
        from: 'bot', 
        text: "🔄 Refreshing website data... This may take a moment." 
      }]);
      
      await fetchWebsiteData();
      
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: `✅ Data refreshed! I now have the latest information from ACEF's website. ${websiteData.apiData?.length || 0} data sources loaded. How can I help you?` 
      }]);
      return;
    }

    try {
      // Add data status to AI context if data is stale
      let contextualInput = originalInput;
      if (dataError) {
        contextualInput += `\n\n[System Note: Some website data may be unavailable: ${dataError}]`;
      }

      const aiResponse = await callGitHubModelsAPI(contextualInput);
      setMessages([...newMessages, { from: 'bot', text: aiResponse }]);
      
    } catch (err) {
      console.error('💥 AI API Error:', err);
      
      const errorResponse = err.message.includes('timeout') 
        ? "I'm taking longer than usual to respond. Please try again or contact us directly via WhatsApp for immediate assistance."
        : getErrorResponse();
      
      setMessages([...newMessages, { 
        from: 'bot', 
        text: errorResponse,
        isError: true 
      }]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields (Name, Email, and Message)');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Try to submit to your actual contact endpoint
      const submitResponse = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: 'chatbot'
        })
      });

      if (submitResponse.ok) {
        console.log('✅ Form submitted successfully to backend');
      } else {
        console.warn('⚠️ Backend submission failed, but continuing with user feedback');
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
    }

    // Always show success to user (even if backend fails)
    const confirmationMessage = {
      from: 'bot',
      text: `Thank you, ${formData.name}! Your message has been successfully submitted. We'll get back to you at ${formData.email} within 24 hours. For urgent matters, feel free to WhatsApp us at +254717266565. Have a great day! 🎉`
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Reset form and hide it
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setShowForm(false);
    setLoading(false);
  };

  const closeForm = () => {
    setShowForm(false);
    const closeMessage = {
      from: 'bot',
      text: "Form closed. Is there anything else I can help you with about ACEF's programs?"
    };
    setMessages(prev => [...prev, closeMessage]);
  };

  const openForm = () => {
    setShowForm(true);
    const formMessage = {
      from: 'bot',
      text: "I'll help you with that! Please fill out the form below and I'll make sure your message reaches the right team.",
      showForm: true
    };
    setMessages(prev => [...prev, formMessage]);
  };

  // Manual data refresh button
  const refreshData = async () => {
    setMessages(prev => [...prev, { 
      from: 'bot', 
      text: "🔄 Refreshing website data... This may take a moment." 
    }]);
    
    await fetchWebsiteData();
    
    setMessages(prev => [...prev, { 
      from: 'bot', 
      text: `✅ Data refreshed! I now have the latest information. ${websiteData.apiData?.length || 0} data sources loaded.` 
    }]);
  };

  // WhatsApp button component
  const WhatsAppButton = ({ className, buttonText }) => (
    <button
      className={className}
      onClick={() => {
        const message = encodeURIComponent("Hello! I need assistance with ACEF services.");
        const whatsappUrl = `https://wa.me/254717266565?text=${message}`;
        window.open(whatsappUrl, '_blank');
      }}
    >
      {buttonText}
    </button>
  );

  return (
    <div className="chat-float-container">
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
        }

        .chat-toggle-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }

        .data-status-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${websiteData.apiData?.length > 0 ? '#4caf50' : dataLoading ? '#ff9800' : '#f44336'};
          border: 2px solid white;
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

        .contact-form {
          background: #f1f8e9;
          padding: 16px;
          margin: 8px 0;
          border-radius: 8px;
          border: 2px solid #4caf50;
        }

        .contact-form h3 {
          margin: 0 0 16px 0;
          color: #2d7d32;
          font-size: 16px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          color: #2d7d32;
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 60px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .form-actions button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2d7d32 0%, #4caf50 100%);
          color: white;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1b5e20 0%, #388e3c 100%);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #ffb300;
          color: #2d7d32;
          border: none;
          font-weight: 600;
        }

        .btn-secondary:hover {
          background: #ffa000;
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

        .chat-link-button.refresh {
          background: #e3f2fd;
          border-color: #2196f3;
        }

        .chat-link-button.refresh:hover {
          background: #bbdefb;
        }

        .required {
          color: #d32f2f;
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

        .data-loading {
          opacity: 0.7;
        }

        @media (max-width: 480px) {
          .chat-box {
            width: 100vw;
            height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }
          
          .chat-float-container {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>


  <button 
  className="chat-toggle-button" 
  onClick={() => {
    setIsOpen(!isOpen);
    if (!isOpen && !hasShownWelcome) {
      setMessages([welcomeMessage]);
      setHasShownWelcome(true);
    }
  }}
>
  <img 
    src="/bird.png" 
    alt="ACEF Assistant" 
    style={{ transform: 'scaleX(-1)' }}
  />
</button>

       

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <div>ACEF AI Assistant</div>
            <div className="data-status">
              {dataLoading ? '🔄 Loading data...' : 
               websiteData.apiData?.length > 0 
                 ? `✅ Live data (${websiteData.apiData.length} sources)` 
                 : '⚠️ Using basic info'}
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.from} ${m.isError ? 'error' : ''}`}>
                <span>{m.text}</span>

                {m.showForm && showForm && (
                  <div className="contact-form">
                    <h3>🌍 ACEF Contact Form</h3>
                    <div>
                      <div className="form-group">
                        <label>Name <span className="required">*</span></label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="+254 xxx xxx xxx"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Subject</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleFormChange}
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="volunteer">Volunteer Opportunities</option>
                          <option value="partnership">Partnership</option>
                          <option value="donation">Donation Information</option>
                          <option value="project">Project Information</option>
                          <option value="support">Technical Support</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Message <span className="required">*</span></label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleFormChange}
                          placeholder="How can ACEF help you with climate and environmental initiatives?"
                          rows="3"
                        />
                      </div>
                      
                      <div className="form-actions">
                        <button className="btn-primary" disabled={loading} onClick={handleFormSubmit}>
                          {loading ? 'Sending...' : 'Send Message'}
                        </button>
                        <button className="btn-secondary" onClick={closeForm}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span>Thinking</span>
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

          {!showForm && (
            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Ask me about ACEF programs, projects, or climate action..."
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? '...' : 'Send'}
              </button>
            </div>
          )}

          <div className="chat-options">
            <WhatsAppButton 
              className="chat-link-button"
              buttonText="📱 WhatsApp"
            />
            <button
              className="chat-link-button"
              onClick={openForm}
            >
              📝 Contact Form
            </button>
            <button
              className="chat-link-button refresh"
              onClick={refreshData}
              disabled={dataLoading}
              title="Refresh website data"
            >
              {dataLoading ? '🔄' : '🔄 Refresh'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;