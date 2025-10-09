import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';

const CollaborationChatbot = ({ 
  flowType = 'collaborate', 
  onSubmit, 
  onExit,
  initialData = {},
  className = '',
  style = {},
  apiUrl
}) => {
  // Use provided apiUrl or fallback to config
  const API_URL = apiUrl || (typeof window !== 'undefined' && window.location.origin.includes('localhost') 
    ? 'http://localhost:5000/api' 
    : '/api');

  // Mock theme for demonstration - replace with actual theme hook
  const isDarkMode = false;
  const colors = {
    primary: '#0a451c',
    primaryDark: '#083517',
    secondary: '#16a34a',
    secondaryLight: '#22c55e',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    white: '#ffffff',
    black: '#000000',
    gray50: '#f9fafb',
    textSecondary: '#6b7280'
  };
  
  const theme = {
    colors: {
      text: '#1f2937',
      textSecondary: '#6b7280',
      surface: '#ffffff'
    }
  };

  const withOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // State for dynamic data from backend
  const [pillars, setPillars] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch pillars and countries on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pillarsRes, countriesRes] = await Promise.all([
          axios.get(`${API_URL}/pillars`),
          axios.get(`${API_URL}/countries`)
        ]);
        
        const pillarsData = pillarsRes.data.data || pillarsRes.data || [];
        const countriesData = countriesRes.data.data || countriesRes.data || [];
        
        setPillars(pillarsData);
        setCountries(countriesData.sort((a, b) => a.name.localeCompare(b.name)));
        setLoadingData(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [API_URL]);

  // Get questions based on flow type
  const getQuestions = (type) => {
    // Volunteer questions
    if (type === 'volunteer') {
      return [
        {
          key: 'email',
          question: 'Let\'s start with your email address so we can stay in touch.',
          type: 'email',
          required: true,
          validation: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'Please enter a valid email address';
            return null;
          }
        },
        {
          key: 'nationality',
          question: 'What is your nationality?',
          type: 'text',
          required: true
        },
        {
          key: 'country_of_residence',
          question: 'Which country do you currently reside in?',
          type: 'select',
          options: () => countries.map(c => c.name),
          required: true
        },
        {
          key: 'city_of_residence',
          question: 'What city do you live in?',
          type: 'text',
          required: true
        },
        {
          key: 'application_country',
          question: 'Which country would you like to volunteer in with ACEF?',
          type: 'select',
          options: () => countries.map(c => c.name),
          required: true
        },
        {
          key: 'core_professional_area',
          question: 'What is your core professional area or field of expertise?',
          type: 'text',
          required: false
        },
        {
          key: 'skills',
          question: 'What relevant skills can you bring to your volunteer work?',
          type: 'textarea',
          required: false
        },
        {
          key: 'interests',
          question: 'What areas or causes are you most passionate about?',
          type: 'textarea',
          required: false
        },
        {
          key: 'time_commitment_weeks',
          question: 'How many weeks can you commit to volunteering?',
          type: 'number',
          required: false
        },
        {
          key: 'preferred_duration',
          question: 'What is your preferred duration of engagement?',
          type: 'select',
          options: ['1-3 months', '3-6 months', '6-12 months', '1+ year'],
          required: false
        },
        {
          key: 'engagement_preference',
          question: 'How would you prefer to engage with us?',
          type: 'select',
          options: ['In-Person', 'Remote', 'Hybrid'],
          required: true
        },
        {
          key: 'confirmed_in_person',
          question: (formData) => `To confirm: You are available to volunteer in person in ${formData.application_country || 'your selected country'}. Is this correct?`,
          type: 'select',
          options: ['Yes, I confirm', 'No, I need to reconsider'],
          required: true,
          condition: (formData) => formData.engagement_preference === 'In-Person'
        },
        {
          key: 'why_volunteer',
          question: 'Why would you like to volunteer with ACEF? What motivates you?',
          type: 'textarea',
          required: true,
          validation: (value) => {
            if (value && value.trim().length < 50) {
              return 'Please provide a more detailed response (at least 50 characters)';
            }
            return null;
          }
        },
        {
          key: 'is_study_program',
          question: 'Are you doing this volunteer work as part of a study program?',
          type: 'select',
          options: ['Yes', 'No'],
          required: false
        },
        {
          key: 'has_sponsor',
          question: 'Do you currently have a sponsor or instructing institution?',
          type: 'select',
          options: ['Yes', 'No'],
          required: false
        },
        {
          key: 'sponsor_name',
          question: 'What is the name of your sponsor or institution?',
          type: 'text',
          required: true,
          condition: (formData) => formData.has_sponsor === 'Yes'
        },
        {
          key: 'additional_remarks',
          question: 'Is there anything else you\'d like us to know about your application?',
          type: 'textarea',
          required: false
        }
      ];
    }
    
    // Collaborate questions
    if (type === 'collaborate') {
      return [
        {
          key: 'applicantType',
          question: 'Are you applying as an individual or representing an organization?',
          type: 'select',
          options: ['Individual', 'Organization'],
          required: true
        },
        {
          key: 'fullName',
          question: (formData) => formData.applicantType === 'Individual' 
            ? "What's your full name?" 
            : "What's your organization's full name?",
          type: 'text',
          required: true,
          validation: (value) => value.trim().length >= 2 ? null : 'Name must be at least 2 characters'
        },
        {
          key: 'email',
          question: "What's your primary email address?",
          type: 'email',
          required: true,
          validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Please enter a valid email address'
        },
        {
          key: 'country',
          question: 'Which country are you based in?',
          type: 'select',
          options: () => countries.map(c => c.name),
          required: true
        },
        {
          key: 'collaborationType',
          question: 'Would you like to collaborate on your own project or on an ACEF project?',
          type: 'select',
          options: ['My Own Project', 'ACEF Project', 'Both'],
          required: true
        },
        {
          key: 'organizationType',
          question: 'What type of organization do you represent?',
          type: 'select',
          options: [
            'Youth-led NGO/Non-Profit', 
            'Environmental NGO', 
            'Climate Action Organization',
            'Community-Based Organization',
            'Educational Institution', 
            'Research Institute',
            'Government Institution', 
            'UN Agency/International Organization',
            'Private Company/Social Enterprise', 
            'Tech Company',
            'Legal/Advocacy Organization',
            'Healthcare Organization',
            'Faith-Based Organization',
            'Other'
          ],
          condition: (formData) => formData.applicantType === 'Organization',
          required: true
        },
        {
          key: 'individualProfession',
          question: "What's your current profession/occupation?",
          type: 'text',
          condition: (formData) => formData.applicantType === 'Individual',
          required: true,
          validation: (value) => value.trim().length >= 3 ? null : 'Please provide your profession'
        },
        {
          key: 'acefPillar',
          question: 'Which ACEF programme pillar aligns most with your collaboration interest?',
          type: 'select',
          options: () => pillars.map(p => p.name),
          required: true
        },
        {
          key: 'focusAreas',
          question: (formData) => {
            const selectedPillar = pillars.find(p => p.name === formData.acefPillar);
            return selectedPillar?.focus_areas?.length > 0
              ? 'Which focus areas are you interested in? (You can select multiple)'
              : 'What specific areas would you like to focus on?';
          },
          type: 'multiselect',
          options: (formData) => {
            const selectedPillar = pillars.find(p => p.name === formData.acefPillar);
            return selectedPillar?.focus_areas?.map(fa => fa.name) || [];
          },
          required: true,
          condition: (formData) => !!formData.acefPillar
        },
        {
          key: 'expertise',
          question: (formData) => formData.applicantType === 'Individual'
            ? 'What are your key skills or areas of expertise?'
            : "What are your organization's core competencies and focus areas?",
          type: 'textarea',
          required: true,
          validation: (value) => value.trim().length >= 30 ? null : 'Please provide at least 30 characters'
        },
        {
          key: 'collaborationIdea',
          question: 'Describe your specific collaboration idea with ACEF. How do you envision working together?',
          type: 'textarea',
          required: true,
          validation: (value) => value.trim().length >= 100 ? null : 'Please provide at least 100 characters'
        },
        {
          key: 'resources',
          question: 'What resources can you contribute to this partnership? (e.g., technical skills, funding, expertise, networks, time commitment)',
          type: 'textarea',
          required: true,
          validation: (value) => value.trim().length >= 30 ? null : 'Please describe the resources you can contribute'
        },
        {
          key: 'expectations',
          question: 'What specific outcomes do you hope to achieve through this collaboration with ACEF?',
          type: 'textarea',
          required: true,
          validation: (value) => value.trim().length >= 40 ? null : 'Please describe your expected outcomes'
        },
        {
          key: 'additionalInfo',
          question: "Is there anything else you'd like ACEF to know about your collaboration proposal?",
          type: 'textarea',
          required: false
        }
      ];
    }
    
    // Partner questions (similar to collaborate but with partnership focus)
    return [
      {
        key: 'applicantType',
        question: 'Are you applying as an individual or representing an organization?',
        type: 'select',
        options: ['Individual', 'Organization'],
        required: true
      },
      {
        key: 'fullName',
        question: (formData) => formData.applicantType === 'Individual' 
          ? "What's your full name?" 
          : "What's your organization's full name?",
        type: 'text',
        required: true,
        validation: (value) => value.trim().length >= 2 ? null : 'Name must be at least 2 characters'
      },
      {
        key: 'email',
        question: "What's your primary email address?",
        type: 'email',
        required: true,
        validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Please enter a valid email address'
      },
      {
        key: 'country',
        question: 'Which country is your organization based in?',
        type: 'select',
        options: () => countries.map(c => c.name),
        required: true
      },
      {
        key: 'organizationType',
        question: 'What type of organization do you represent?',
        type: 'select',
        options: [
          'Youth-led NGO/Non-Profit', 
          'Environmental NGO', 
          'Climate Action Organization',
          'Community-Based Organization',
          'Educational Institution', 
          'Research Institute',
          'Government Institution', 
          'UN Agency/International Organization',
          'Private Company/Social Enterprise', 
          'Tech Company',
          'Legal/Advocacy Organization',
          'Healthcare Organization',
          'Faith-Based Organization',
          'Other'
        ],
        required: true
      },
      {
        key: 'acefPillar',
        question: 'Which ACEF programme pillar aligns most with your partnership interest?',
        type: 'select',
        options: () => pillars.map(p => p.name),
        required: true
      },
      {
        key: 'focusAreas',
        question: (formData) => {
          const selectedPillar = pillars.find(p => p.name === formData.acefPillar);
          return selectedPillar?.focus_areas?.length > 0
            ? 'Which focus areas are you interested in? (You can select multiple)'
            : 'What specific areas would you like to focus on?';
        },
        type: 'multiselect',
        options: (formData) => {
          const selectedPillar = pillars.find(p => p.name === formData.acefPillar);
          return selectedPillar?.focus_areas?.map(fa => fa.name) || [];
        },
        required: true,
        condition: (formData) => !!formData.acefPillar
      },
      {
        key: 'partnershipType',
        question: 'What type of partnership are you proposing?',
        type: 'select',
        options: ['Strategic Partnership', 'Project-Based Partnership', 'Resource Partnership', 'Technical Partnership', 'Funding Partnership', 'Other'],
        required: true
      },
      {
        key: 'partnershipDescription',
        question: 'Please describe your partnership proposal in detail. What would this partnership entail?',
        type: 'textarea',
        required: true,
        validation: (value) => value.trim().length >= 100 ? null : 'Please provide at least 100 characters'
      },
      {
        key: 'organizationCapacity',
        question: "Describe your organization's capacity and what you can contribute to this partnership.",
        type: 'textarea',
        required: true,
        validation: (value) => value.trim().length >= 50 ? null : 'Please provide at least 50 characters'
      },
      {
        key: 'expectations',
        question: 'What are your expectations from this partnership with ACEF?',
        type: 'textarea',
        required: true,
        validation: (value) => value.trim().length >= 40 ? null : 'Please describe your expectations'
      },
      {
        key: 'timeline',
        question: 'What is your proposed timeline for this partnership?',
        type: 'select',
        options: ['Short-term (3-6 months)', 'Medium-term (6-12 months)', 'Long-term (1+ years)', 'Ongoing', 'To be discussed'],
        required: true
      },
      {
        key: 'additionalInfo',
        question: "Is there anything else you'd like ACEF to know about your partnership proposal?",
        type: 'textarea',
        required: false
      }
    ];
  };

  const questions = getQuestions(flowType);
  
  // Component state
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errorMessage, setErrorMessage] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState([]);
  
  const chatContainerRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isInitialized || loadingData) return;

    const welcomeMessages = {
      collaborate: "Welcome! I'm excited to help you start a collaboration with ACEF. I'll ask you some questions to understand your background and ideas better.",
      partner: "Wonderful! Let's explore how we can build a meaningful partnership together.",
      volunteer: "Thank you for your interest in volunteering with ACEF! I'll guide you through a few questions to match you with the right opportunities."
    };
    
    const initializeChat = () => {
      setIsInitialized(true);
      
      setChatMessages([{ 
        sender: 'bot', 
        message: welcomeMessages[flowType], 
        id: Date.now(),
        stepIndex: null
      }]);
      
      setTimeout(() => {
        const firstQuestion = questions[0];
        const questionText = typeof firstQuestion.question === 'function' 
          ? firstQuestion.question({}) 
          : firstQuestion.question;
          
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          message: questionText, 
          id: Date.now() + 1,
          stepIndex: 0
        }]);
      }, 1000);
    };

    const timer = setTimeout(initializeChat, 500);
    
    return () => clearTimeout(timer);
  }, [flowType, isInitialized, loadingData]);

  const addMessage = (message, sender = 'bot', stepIndex = null) => {
    if (sender === 'bot') {
      setIsTyping(true);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          sender, 
          message, 
          id: Date.now() + Math.random(),
          stepIndex: stepIndex !== null ? stepIndex : currentStep 
        }]);
        setIsTyping(false);
      }, 800);
    } else {
      setChatMessages(prev => [...prev, { 
        sender, 
        message, 
        id: Date.now() + Math.random(),
        stepIndex: stepIndex !== null ? stepIndex : currentStep 
      }]);
    }
  };

  const getNextStep = (currentStepIndex, currentFormData) => {
    for (let i = currentStepIndex + 1; i < questions.length; i++) {
      const question = questions[i];
      if (!question.condition || question.condition(currentFormData)) {
        return i;
      }
    }
    return -1;
  };

  const getPreviousStep = (currentStepIndex, currentFormData) => {
    for (let i = currentStepIndex - 1; i >= 0; i--) {
      const question = questions[i];
      if (!question.condition || question.condition(currentFormData)) {
        return i;
      }
    }
    return -1;
  };

  const validateInput = (value, question, currentFormData) => {
    if (question.required && !value.trim()) {
      return 'This field is required';
    }

    if (question.validation) {
      const error = question.validation(value);
      if (error) return error;
    }

    if (question.type === 'select' && question.options && value) {
      const options = typeof question.options === 'function' 
        ? question.options(currentFormData) 
        : question.options;
      if (!options.includes(value)) {
        return `Please select one of the available options`;
      }
    }

    return null;
  };

  const handleSubmit = () => {
    const questionToValidate = editingStep !== null ? questions[editingStep] : questions[currentStep];
    
    // Handle multiselect separately
    if (questionToValidate.type === 'multiselect') {
      if (multiSelectValues.length === 0 && questionToValidate.required) {
        setErrorMessage('Please select at least one option');
        return;
      }
      
      const value = multiSelectValues.join(', ');
      
      if (editingStep !== null) {
        setChatMessages(prev => prev.map(msg => 
          msg.stepIndex === editingStep && msg.sender === 'user' 
            ? { ...msg, message: value }
            : msg
        ));
        
        const editQuestion = questions[editingStep];
        const newFormData = { ...formData, [editQuestion.key]: multiSelectValues };
        setFormData(newFormData);
        setUserMessage('');
        setMultiSelectValues([]);
        setEditingStep(null);
        
        setTimeout(() => {
          addMessage("✅ Your response has been updated!", 'bot');
        }, 300);
        
        return;
      }
      
      addMessage(value, 'user', currentStep);
      const newFormData = { ...formData, [questionToValidate.key]: multiSelectValues };
      setFormData(newFormData);
      
      setQuestionHistory(prev => [...prev, {
        stepIndex: currentStep,
        questionKey: questionToValidate.key,
        question: typeof questionToValidate.question === 'function' ? questionToValidate.question(formData) : questionToValidate.question,
        answer: value
      }]);
      
      setUserMessage('');
      setMultiSelectValues([]);

      const nextStepIndex = getNextStep(currentStep, newFormData);
      
      if (nextStepIndex === -1) {
        showSummary(newFormData);
      } else {
        setCurrentStep(nextStepIndex);
      }
      
      return;
    }
    
    const validationError = validateInput(userMessage, questionToValidate, formData);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    
    if (editingStep !== null) {
      setChatMessages(prev => prev.map(msg => 
        msg.stepIndex === editingStep && msg.sender === 'user' 
          ? { ...msg, message: userMessage }
          : msg
      ));
      
      const editQuestion = questions[editingStep];
      const newFormData = { ...formData, [editQuestion.key]: userMessage };
      setFormData(newFormData);
      setUserMessage('');
      setEditingStep(null);
      
      setTimeout(() => {
        addMessage("✅ Your response has been updated!", 'bot');
      }, 300);
      
      return;
    }

    const current = questions[currentStep];
    addMessage(userMessage, 'user', currentStep);
    const newFormData = { ...formData, [current.key]: userMessage };
    setFormData(newFormData);
    
    setQuestionHistory(prev => [...prev, {
      stepIndex: currentStep,
      questionKey: current.key,
      question: typeof current.question === 'function' ? current.question(formData) : current.question,
      answer: userMessage
    }]);
    
    setUserMessage('');

    const nextStepIndex = getNextStep(currentStep, newFormData);
    
    if (nextStepIndex === -1) {
      showSummary(newFormData);
    } else {
      setCurrentStep(nextStepIndex);
    }
  };

  const showSummary = (finalFormData) => {
    setTimeout(() => {
      addMessage("Excellent! I've collected all the information. Let me summarize what you've shared:", 'bot');
      setTimeout(() => {
        const summary = Object.entries(finalFormData)
          .map(([key, value]) => {
            const question = questions.find(q => q.key === key);
            if (!question || !value) return null;
            const questionText = typeof question.question === 'function' 
              ? question.question(finalFormData) 
              : question.question;
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            return `• ${questionText.replace(/[?:]/g, '')}: ${displayValue}`;
          })
          .filter(Boolean)
          .join('\n');
        
        addMessage(summary, 'bot');
        setTimeout(() => {
          addMessage("Please review the information above. You can click on any of your responses to edit them, or submit if everything looks correct.", 'bot');
          setAwaitingConfirmation(true);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleBack = () => {
    const prevStepIndex = getPreviousStep(currentStep, formData);
    if (prevStepIndex === -1) return;
    
    setChatMessages(prev => prev.slice(0, -2));
    setCurrentStep(prevStepIndex);
    const prevQuestion = questions[prevStepIndex];
    const prevValue = formData[prevQuestion.key];
    
    if (Array.isArray(prevValue)) {
      setMultiSelectValues(prevValue);
      setUserMessage('');
    } else {
      setUserMessage(prevValue || '');
      setMultiSelectValues([]);
    }
  };

  const handleEditMessage = (stepIndex) => {
    if (stepIndex !== undefined && stepIndex !== null && stepIndex < questions.length) {
      const question = questions[stepIndex];
      setEditingStep(stepIndex);
      
      const currentValue = formData[question.key];
      if (Array.isArray(currentValue)) {
        setMultiSelectValues(currentValue);
        setUserMessage('');
      } else {
        setUserMessage(currentValue || '');
        setMultiSelectValues([]);
      }
      
      setErrorMessage('');
      
      const questionText = typeof question.question === 'function' 
        ? question.question(formData) 
        : question.question;
      
      addMessage(`✏️ Editing: ${questionText}`, 'bot');
    }
  };

  const handleFinalSubmit = async () => {
    setIsTyping(true);
    
    try {
      // For volunteer flow, post to the volunteer applications endpoint
      if (flowType === 'volunteer') {
        const response = await axios.post(`${API_URL}/volunteer-applications`, formData);
        
        setIsTyping(false);
        addMessage(`Perfect! Your volunteer application has been submitted successfully.`, 'bot');
        setTimeout(() => {
          addMessage("Our team will review your application and contact you within 2-3 business days. Thank you for your interest in volunteering with ACEF!", 'bot');
        }, 1000);
        
        if (onSubmit) {
          onSubmit({
            ...formData,
            flowType,
            submittedAt: new Date().toISOString(),
            applicationId: response.data.application?.id
          });
        }
      } else if (flowType === 'collaborate' || flowType === 'partner') {
        // For collaborate/partner flows, post to collaboration endpoint
        const response = await axios.post(`${API_URL}/collaboration/submit`, {
          flowType,
          formData,
          additionalData: {
            submissionMethod: 'chatbot',
            questionHistory,
            completionTime: new Date().toISOString()
          }
        });
        
        setIsTyping(false);
        const flowNames = {
          collaborate: 'collaboration',
          partner: 'partnership'
        };
        addMessage(`Perfect! Your ${flowNames[flowType]} request has been submitted successfully.`, 'bot');
        setTimeout(() => {
          addMessage("Our team will review your request and contact you within 2-3 business days. Thank you for your interest in working with ACEF!", 'bot');
        }, 1000);
        
        if (onSubmit) {
          onSubmit({
            ...formData,
            flowType,
            submittedAt: new Date().toISOString(),
            collaborationId: response.data.data?.collaborationId
          });
        }
      }
      
      setAwaitingConfirmation(false);
    } catch (error) {
      setIsTyping(false);
      console.error('Submission error:', error);
      
      // Handle volunteer-specific API errors
      if (flowType === 'volunteer') {
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
        addMessage(`I'm sorry, there was an error submitting your application: ${errorMessage}. Please try again.`, 'bot');
      } else {
        // Generic error for collaborate/partner
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        addMessage(`I'm sorry, there was an error submitting your request: ${errorMessage}. Please try again.`, 'bot');
      }
      
      setTimeout(() => {
        setAwaitingConfirmation(true);
      }, 2000);
    }
  };

  useEffect(() => {
    if (!isInitialized || 
        !questions[currentStep] || 
        awaitingConfirmation || 
        editingStep !== null ||
        chatMessages.length <= 1 ||
        loadingData) {
      return;
    }
    
    const q = questions[currentStep];
    const message = typeof q.question === 'function' ? q.question(formData) : q.question;
    
    const alreadyAsked = chatMessages.some((msg) => 
      msg.sender === 'bot' && 
      msg.stepIndex === currentStep &&
      msg.message.includes(message.split('?')[0])
    );
    
    if (!alreadyAsked && !isTyping) {
      const timer = setTimeout(() => addMessage(message, 'bot', currentStep), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, awaitingConfirmation, editingStep, formData, isInitialized, chatMessages.length, isTyping, loadingData]);

  const handleMultiSelectToggle = (option) => {
    setMultiSelectValues(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const styles = {
    container: {
      background: isDarkMode 
        ? `linear-gradient(145deg, ${withOpacity(colors.black, 0.6)}, ${withOpacity(colors.primaryDark, 0.2)})`
        : `linear-gradient(145deg, ${withOpacity(colors.white, 0.95)}, ${withOpacity(colors.primary, 0.05)})`,
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: `0 8px 40px ${withOpacity(colors.primary, 0.15)}`,
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      position: 'relative',
      maxWidth: '900px',
      margin: '0 auto',
      ...style
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      paddingBottom: '20px',
      borderBottom: `1px solid ${withOpacity(colors.primary, 0.1)}`
    },

    title: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: colors.primary,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },

    exitButton: {
      background: 'transparent',
      border: `1px solid ${withOpacity(colors.primary, 0.3)}`,
      borderRadius: '20px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.colors.textSecondary,
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },

    chatMessages: {
      maxHeight: '500px',
      overflowY: 'auto',
      marginBottom: '24px',
      paddingRight: '6px'
    },

    message: {
      marginBottom: '20px',
      animation: 'messageSlide 0.4s ease-out'
    },

    botMessage: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },

    botAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      flexShrink: 0,
      overflow: 'hidden'
    },

    botMessageContent: {
      background: isDarkMode 
        ? withOpacity(colors.primary, 0.15)
        : withOpacity(colors.primary, 0.08),
      padding: '12px 16px',
      borderRadius: '16px 16px 16px 6px',
      color: theme.colors.text,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      maxWidth: '75%',
      whiteSpace: 'pre-line',
      border: `1px solid ${withOpacity(colors.primary, 0.1)}`
    },

    userMessage: {
      display: 'flex',
      justifyContent: 'flex-end'
    },

    userMessageContent: {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
      padding: '12px 16px',
      borderRadius: '16px 16px 6px 16px',
      color: colors.white,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      maxWidth: '75%',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      boxShadow: `0 2px 8px ${withOpacity(colors.primary, 0.3)}`
    },

    typingIndicator: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '20px'
    },

    typingDots: {
      background: isDarkMode 
        ? withOpacity(colors.primary, 0.15)
        : withOpacity(colors.primary, 0.08),
      padding: '12px 16px',
      borderRadius: '16px 16px 16px 6px',
      border: `1px solid ${withOpacity(colors.primary, 0.1)}`,
      display: 'flex',
      gap: '3px'
    },

    dot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: colors.primary,
      animation: 'typingDots 1.4s infinite ease-in-out'
    },

    inputSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },

    input: {
      width: '100%',
      padding: '14px 16px',
      background: isDarkMode 
        ? withOpacity(colors.black, 0.3)
        : withOpacity(colors.gray50, 0.8),
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontFamily: 'inherit',
      color: theme.colors.text,
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },

    textarea: {
      width: '100%',
      padding: '14px 16px',
      background: isDarkMode 
        ? withOpacity(colors.black, 0.3)
        : withOpacity(colors.gray50, 0.8),
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontFamily: 'inherit',
      color: theme.colors.text,
      transition: 'all 0.3s ease',
      outline: 'none',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },

    select: {
      width: '100%',
      padding: '14px 16px',
      background: isDarkMode 
        ? withOpacity(colors.black, 0.3)
        : withOpacity(colors.gray50, 0.8),
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontFamily: 'inherit',
      color: theme.colors.text,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },

    multiSelectContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxHeight: '200px',
      overflowY: 'auto',
      padding: '8px',
      background: isDarkMode 
        ? withOpacity(colors.black, 0.3)
        : withOpacity(colors.gray50, 0.8),
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      borderRadius: '12px'
    },

    multiSelectOption: {
      padding: '10px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    checkbox: {
      width: '16px',
      height: '16px',
      borderRadius: '4px',
      border: `2px solid ${colors.primary}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },

    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },

    primaryButton: {
      padding: '12px 24px',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
      color: colors.white,
      border: 'none',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      minWidth: '120px',
      boxShadow: `0 4px 12px ${withOpacity(colors.primary, 0.3)}`
    },

    secondaryButton: {
      padding: '12px 24px',
      background: 'transparent',
      color: theme.colors.text,
      border: `1px solid ${withOpacity(colors.primary, 0.3)}`,
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      minWidth: '120px'
    },

    successButton: {
      background: `linear-gradient(135deg, ${colors.success}, #059669)`
    },

    errorMessage: {
      color: colors.error,
      fontSize: '0.8125rem',
      textAlign: 'center',
      padding: '10px 16px',
      background: `${colors.error}15`,
      borderRadius: '10px',
      border: `1px solid ${colors.error}30`
    },

    editingIndicator: {
      color: colors.warning,
      fontSize: '0.8125rem',
      textAlign: 'center',
      padding: '8px 16px',
      background: `${colors.warning}15`,
      borderRadius: '10px',
      marginBottom: '12px',
      fontWeight: 600
    },

    editHint: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      fontSize: '0.75rem'
    },

    loadingContainer: {
      textAlign: 'center',
      padding: '40px',
      color: colors.primary
    }
  };

  if (loadingData) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={{...styles.dot, width: '12px', height: '12px', display: 'inline-block', marginRight: '8px'}}></div>
          <div style={{...styles.dot, width: '12px', height: '12px', display: 'inline-block', marginRight: '8px', animationDelay: '0.2s'}}></div>
          <div style={{...styles.dot, width: '12px', height: '12px', display: 'inline-block', animationDelay: '0.4s'}}></div>
          <p style={{marginTop: '16px', fontSize: '0.875rem'}}>Loading form data...</p>
        </div>
      </div>
    );
  }

  const renderInput = () => {
    const currentQuestion = questions[editingStep !== null ? editingStep : currentStep];
    if (!currentQuestion) return null;

    // Handle multiselect
    if (currentQuestion.type === 'multiselect') {
      const options = typeof currentQuestion.options === 'function' 
        ? currentQuestion.options(formData) 
        : currentQuestion.options;

      if (!options || options.length === 0) {
        return (
          <div style={{...styles.input, padding: '16px', color: colors.textSecondary}}>
            No options available. Please complete previous questions first.
          </div>
        );
      }

      return (
        <div style={styles.multiSelectContainer}>
          {options.map(opt => (
            <div
              key={opt}
              style={{
                ...styles.multiSelectOption,
                background: multiSelectValues.includes(opt) 
                  ? withOpacity(colors.primary, 0.1) 
                  : 'transparent',
                border: multiSelectValues.includes(opt)
                  ? `1px solid ${colors.primary}`
                  : '1px solid transparent'
              }}
              onClick={() => handleMultiSelectToggle(opt)}
            >
              <div style={{
                ...styles.checkbox,
                background: multiSelectValues.includes(opt) ? colors.primary : 'transparent'
              }}>
                {multiSelectValues.includes(opt) && (
                  <span style={{color: colors.white, fontSize: '0.75rem'}}>✓</span>
                )}
              </div>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      );
    }

    const options = currentQuestion.type === 'select' && currentQuestion.options
      ? (typeof currentQuestion.options === 'function' 
          ? currentQuestion.options(formData) 
          : currentQuestion.options)
      : null;

    if (currentQuestion.type === 'select' && options) {
      return (
        <select 
          value={userMessage} 
          onChange={(e) => setUserMessage(e.target.value)}
          style={{
            ...styles.select,
            borderColor: userMessage ? colors.primary : withOpacity(colors.primary, 0.2)
          }}
        >
          <option value="">Choose an option...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    } else if (currentQuestion.type === 'textarea') {
      return (
        <textarea 
          placeholder="Type your response..." 
          value={userMessage} 
          onChange={(e) => setUserMessage(e.target.value)}
          style={{
            ...styles.textarea,
            borderColor: userMessage.length > 0 ? colors.primary : withOpacity(colors.primary, 0.2)
          }}
        />
      );
    } else {
      return (
        <input 
          type={currentQuestion.type === 'email' ? 'email' : 
                currentQuestion.type === 'number' ? 'number' :
                currentQuestion.type === 'date' ? 'date' : 'text'}
          placeholder="Type your response..." 
          value={userMessage} 
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && currentQuestion.type !== 'textarea' && handleSubmit()}
          style={{
            ...styles.input,
            borderColor: userMessage.length > 0 ? colors.primary : withOpacity(colors.primary, 0.2)
          }}
        />
      );
    }
  };

  const flowIcons = {
    collaborate: '🤝',
    partner: '🏢',
    volunteer: '🌟'
  };

  const flowTitles = {
    collaborate: 'Collaborate',
    partner: 'Partner',
    volunteer: 'Volunteer'
  };

  return (
    <div className={className} style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span>{flowIcons[flowType]}</span>
          <span>{flowTitles[flowType]}</span>
        </div>
        {onExit && (
          <button style={styles.exitButton} onClick={onExit}>
            ← Back
          </button>
        )}
      </div>

      <div>
        <div style={styles.chatMessages} ref={chatContainerRef}>
          {chatMessages.map((msg) => (
            <div key={msg.id} style={styles.message}>
              {msg.sender === 'bot' ? (
                <div style={styles.botMessage}>
                  <div style={styles.botAvatar}>
                    <img 
                      src="/bird.png" 
                      alt="Bot" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '🤖';
                      }}
                    />
                  </div>
                  <div style={styles.botMessageContent}>
                    {msg.message}
                  </div>
                </div>
              ) : (
                <div style={styles.userMessage}>
                  <div 
                    style={styles.userMessageContent}
                    onClick={() => handleEditMessage(msg.stepIndex)}
                    onMouseEnter={(e) => {
                      const hint = e.target.querySelector('.edit-hint');
                      if (hint) hint.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const hint = e.target.querySelector('.edit-hint');
                      if (hint) hint.style.opacity = '0';
                    }}
                    title="Click to edit this response"
                  >
                    {msg.message}
                    <div className="edit-hint" style={styles.editHint}>✏️</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div style={styles.typingIndicator}>
              <div style={styles.botAvatar}>🤖</div>
              <div style={styles.typingDots}>
                <div style={{...styles.dot, animationDelay: '0s'}}></div>
                <div style={{...styles.dot, animationDelay: '0.2s'}}></div>
                <div style={{...styles.dot, animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Section */}
        <div style={styles.inputSection}>
          {awaitingConfirmation ? (
            <div style={styles.buttonGroup}>
              <button 
                style={{...styles.primaryButton, ...styles.successButton}}
                onClick={handleFinalSubmit}
              >
                ✓ Submit Request
              </button>
              <button 
                style={styles.secondaryButton}
                onClick={() => {
                  addMessage("No worries! You can edit any response by clicking on it above.", 'bot');
                  setAwaitingConfirmation(false);
                }}
              >
                ← Review & Edit
              </button>
            </div>
          ) : questions[currentStep] ? (
            <>
              <div style={styles.inputGroup}>
                {editingStep !== null && (
                  <div style={styles.editingIndicator}>
                    ✏️ Editing your response - press Continue when done
                  </div>
                )}
                
                {renderInput()}
              </div>
              
              <div style={styles.buttonGroup}>
                <button 
                  style={{
                    ...styles.secondaryButton,
                    opacity: (currentStep === 0 && editingStep === null) ? 0.5 : 1,
                    cursor: (currentStep === 0 && editingStep === null) ? 'not-allowed' : 'pointer'
                  }}
                  onClick={editingStep !== null ? 
                    () => {
                      setEditingStep(null);
                      setUserMessage('');
                      setMultiSelectValues([]);
                      setErrorMessage('');
                      addMessage("Edit cancelled. Let's continue where we left off.", 'bot');
                    } : 
                    handleBack
                  }
                  disabled={currentStep === 0 && editingStep === null}
                >
                  {editingStep !== null ? '✕ Cancel Edit' : '← Previous'}
                </button>
                <button 
                  style={{
                    ...styles.primaryButton,
                    opacity: (() => {
                      const currentQ = questions[editingStep !== null ? editingStep : currentStep];
                      if (currentQ.type === 'multiselect') {
                        return (multiSelectValues.length === 0 && currentQ.required) ? 0.6 : 1;
                      }
                      return (!userMessage.trim() && currentQ.required) ? 0.6 : 1;
                    })(),
                    cursor: (() => {
                      const currentQ = questions[editingStep !== null ? editingStep : currentStep];
                      if (currentQ.type === 'multiselect') {
                        return (multiSelectValues.length === 0 && currentQ.required) ? 'not-allowed' : 'pointer';
                      }
                      return (!userMessage.trim() && currentQ.required) ? 'not-allowed' : 'pointer';
                    })()
                  }}
                  onClick={handleSubmit}
                  disabled={(() => {
                    const currentQ = questions[editingStep !== null ? editingStep : currentStep];
                    if (currentQ.type === 'multiselect') {
                      return multiSelectValues.length === 0 && currentQ.required;
                    }
                    return !userMessage.trim() && currentQ.required;
                  })()}
                >
                  Continue →
                </button>
              </div>
              
              {errorMessage && (
                <div style={styles.errorMessage}>
                  ⚠️ {errorMessage}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typingDots {
          0%, 60%, 100% { 
            transform: translateY(0); 
            opacity: 0.4; 
          }
          30% { 
            transform: translateY(-6px); 
            opacity: 1; 
          }
        }

        .user-message-content:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${withOpacity(colors.primary, 0.4)} !important;
        }

        .user-message-content:hover .edit-hint {
          opacity: 1 !important;
        }

        .chat-messages::-webkit-scrollbar {
          width: 4px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: ${withOpacity(colors.primary, 0.1)};
          border-radius: 1px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 1px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: ${colors.primaryDark};
        }

        button:focus,
        input:focus,
        textarea:focus,
        select:focus {
          outline: 2px solid ${colors.primary};
          outline-offset: 2px;
        }

        .primary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px ${withOpacity(colors.primary, 0.4)} !important;
        }

        .secondary-button:hover {
          background: ${withOpacity(colors.primary, 0.05)} !important;
          border-color: ${colors.primary} !important;
          color: ${colors.primary} !important;
          transform: translateY(-1px);
        }

        .exit-button:hover {
          background: ${withOpacity(colors.primary, 0.05)} !important;
          border-color: ${colors.primary} !important;
          color: ${colors.primary} !important;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: ${colors.primary} !important;
          box-shadow: 0 0 0 2px ${withOpacity(colors.primary, 0.2)} !important;
        }

        @media (max-width: 768px) {
          .button-group {
            flex-direction: column !important;
          }
          
          .primary-button,
          .secondary-button {
            width: 100% !important;
          }
          
          .chat-messages {
            max-height: 350px !important;
          }
          
          .bot-message-content,
          .user-message-content {
            font-size: 0.8125rem !important;
            max-width: 85% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CollaborationChatbot;