import React, { useState, useEffect, useRef } from "react";
import { useTheme, withOpacity } from '../theme';
import { questions } from './chatbotQuestions';
import { API_URL } from '../config';

const CollaborationChatbot = ({ 
  flowType = 'collaborate', 
  onSubmit, 
  onExit,
  initialData = {},
  className = '',
  style = {}
}) => {
  const { theme, colors, isDarkMode } = useTheme();
  
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
    if (isInitialized) return;

    const welcomeMessages = {
      collaborate: "Welcome! I'm excited to help you start a collaboration with ACEF. I'll ask you some questions to understand your background and ideas better.",
      partner: "Wonderful! Let's explore how we can build a meaningful partnership together."
    };
    
    const initializeChat = () => {
      setIsInitialized(true);
      
      // Add welcome message
      setChatMessages([{ 
        sender: 'bot', 
        message: welcomeMessages[flowType], 
        id: Date.now(),
        stepIndex: null
      }]);
      
      // Add first question after a delay
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
  }, [flowType, isInitialized]);

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
        return `Please select one of the available options: ${options.join(', ')}`;
      }
    }

    return null;
  };

  const handleSubmit = () => {
    const questionToValidate = editingStep !== null ? questions[editingStep] : questions[currentStep];
    
    // Validation
    const validationError = validateInput(userMessage, questionToValidate, formData);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    
    // Handle editing mode
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
        
        setTimeout(() => {
          if (!awaitingConfirmation && questions[currentStep]) {
            const currentQuestion = questions[currentStep];
            const questionText = typeof currentQuestion.question === 'function' 
              ? currentQuestion.question(newFormData) 
              : currentQuestion.question;
            
            const questionAlreadyAsked = chatMessages.some(msg => 
              msg.sender === 'bot' && 
              msg.stepIndex === currentStep && 
              msg.message.includes(questionText.split('?')[0])
            );
            
            if (!questionAlreadyAsked) {
              addMessage(`Now, let's continue: ${questionText}`, 'bot', currentStep);
            }
          }
        }, 800);
      }, 300);
      
      return;
    }

    // Normal flow
    const current = questions[currentStep];
    addMessage(userMessage, 'user', currentStep);
    const newFormData = { ...formData, [current.key]: userMessage };
    setFormData(newFormData);
    
    // Track question history
    setQuestionHistory(prev => [...prev, {
      stepIndex: currentStep,
      questionKey: current.key,
      question: typeof current.question === 'function' ? current.question(formData) : current.question,
      answer: userMessage
    }]);
    
    setUserMessage('');

    const nextStepIndex = getNextStep(currentStep, newFormData);
    
    if (nextStepIndex === -1) {
      // End of questions
      setTimeout(() => {
        addMessage("Excellent! I've collected all the information. Let me summarize what you've shared:", 'bot');
        setTimeout(() => {
          const summary = Object.entries(newFormData)
            .map(([key, value]) => {
              const question = questions.find(q => q.key === key);
              if (!question || !value) return null;
              const questionText = typeof question.question === 'function' 
                ? question.question(newFormData) 
                : question.question;
              return `• ${questionText.replace(/[?:]/g, '')}: ${value}`;
            })
            .filter(Boolean)
            .join('\n');
          
          addMessage(summary, 'bot');
          setTimeout(() => {
            addMessage("Please review the information above. You can click on any of your responses to edit them, or submit your collaboration request if everything looks correct.", 'bot');
            setAwaitingConfirmation(true);
          }, 1000);
        }, 1000);
      }, 1000);
    } else {
      // Move to next question
      setCurrentStep(nextStepIndex);
    }
  };

  const handleBack = () => {
    const prevStepIndex = getPreviousStep(currentStep, formData);
    if (prevStepIndex === -1) return;
    
    setChatMessages(prev => prev.slice(0, -2));
    setCurrentStep(prevStepIndex);
    setUserMessage(formData[questions[prevStepIndex].key] || '');
  };

  const handleEditMessage = (stepIndex) => {
    if (stepIndex !== undefined && stepIndex !== null && stepIndex < questions.length) {
      const question = questions[stepIndex];
      setEditingStep(stepIndex);
      setUserMessage(formData[question.key] || '');
      setErrorMessage('');
      
      const questionText = typeof question.question === 'function' 
        ? question.question(formData) 
        : question.question;
      
      addMessage(`✏️ Editing: ${questionText}`, 'bot');
    }
  };

  // FIXED: Better field mapping for backend requirements
  const prepareSubmissionData = (formData) => {
    // Create a copy of form data
    const processedData = { ...formData };
    
    // Ensure required fields are present with fallback logic
    // Map common question keys to required backend fields
    if (!processedData.name) {
      processedData.name = processedData.fullName || 
                           processedData.full_name || 
                           processedData.firstName || 
                           processedData.user_name || '';
    }
    
    if (!processedData.email) {
      processedData.email = processedData.emailAddress || 
                           processedData.email_address || 
                           processedData.primaryEmail || 
                           processedData.contact_email || '';
    }

    // Handle organization field
    if (!processedData.organization) {
      processedData.organization = processedData.organizationName || 
                                  processedData.company || 
                                  processedData.institution || 
                                  null;
    }

    return processedData;
  };

  const handleFinalSubmit = async () => {
    setIsTyping(true);
    
    try {
      // Prepare and validate submission data
      const processedFormData = prepareSubmissionData(formData);
      
      // Final validation check
      if (!processedFormData.name || !processedFormData.name.trim()) {
        setIsTyping(false);
        addMessage("I notice the name field is missing. Please go back and edit your response to include your full name.", 'bot');
        setAwaitingConfirmation(false);
        return;
      }

      if (!processedFormData.email || !processedFormData.email.trim()) {
        setIsTyping(false);
        addMessage("I notice the email field is missing. Please go back and edit your response to include your email address.", 'bot');
        setAwaitingConfirmation(false);
        return;
      }

      // Prepare submission data
      const submissionData = {
        flowType,
        formData: processedFormData,
        additionalData: {
          submissionMethod: 'chatbot',
          questionHistory: questionHistory.map(q => ({
            question: q.question,
            answer: q.answer,
            questionKey: q.questionKey
          })),
          completionTime: Date.now() - (chatMessages[0]?.id || Date.now()),
          originalFormData: formData // Keep original for reference
        }
      };

      console.log('Submitting data:', submissionData); // Debug log

      // Submit to backend
      const response = await fetch(`${API_URL || '/api'}/collaboration/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();

      if (result.success) {
        setIsTyping(false);
        addMessage(`Perfect! Your ${flowType} request has been submitted successfully. Reference ID: ${result.data.collaborationId}`, 'bot');
        setTimeout(() => {
          addMessage("Our team will review your request and contact you within 2-3 business days. Thank you for your interest in working with ACEF!", 'bot');
        }, 1000);
        
        // Call parent onSubmit if provided
        if (onSubmit) {
          onSubmit({
            ...processedFormData,
            collaborationId: result.data.collaborationId,
            submittedAt: result.data.submittedAt
          });
        }
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      setIsTyping(false);
      console.error('Submission error:', error);
      addMessage(`I'm sorry, there was an error submitting your request: ${error.message}. Please try again or contact us directly.`, 'bot');
      
      // Allow retry
      setTimeout(() => {
        addMessage("You can try submitting again by clicking the submit button below.", 'bot');
        setAwaitingConfirmation(true);
      }, 2000);
    }
    
    setAwaitingConfirmation(false);
  };

  // Load next question
  useEffect(() => {
    if (!isInitialized || 
        !questions[currentStep] || 
        awaitingConfirmation || 
        editingStep !== null ||
        chatMessages.length <= 1) {
      return;
    }
    
    const q = questions[currentStep];
    const message = typeof q.question === 'function' ? q.question(formData) : q.question;
    
    const alreadyAsked = chatMessages.some((msg) => 
      msg.sender === 'bot' && 
      msg.stepIndex === currentStep &&
      (msg.message.includes(message.split('?')[0]) || msg.message.includes("Now, let's continue:"))
    );
    
    if (!alreadyAsked && !isTyping) {
      const timer = setTimeout(() => addMessage(message, 'bot', currentStep), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, awaitingConfirmation, editingStep, formData, isInitialized, chatMessages.length, isTyping]);

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

    chatContainer: {
      minHeight: '400px'
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
      flexShrink: 0
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

    editHint: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      background: colors.warning,
      color: colors.white,
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.625rem',
      opacity: 0,
      transition: 'opacity 0.3s ease'
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

    inputGroup: {
      position: 'relative'
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
      outline: 'none'
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
      resize: 'vertical'
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
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='${colors.primary.replace('#', '%23')}' viewBox='0 0 16 16'%3e%3cpath d='m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '12px'
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
    }
  };

  const renderInput = () => {
    const currentQuestion = questions[editingStep !== null ? editingStep : currentStep];
    if (!currentQuestion) return null;

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
                currentQuestion.type === 'url' ? 'url' : 'text'}
          placeholder="Type your response..." 
          value={userMessage} 
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          style={{
            ...styles.input,
            borderColor: userMessage.length > 0 ? colors.primary : withOpacity(colors.primary, 0.2)
          }}
        />
      );
    }
  };

  return (
    <div className={className} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <span>{flowType === 'collaborate' ? '🤝' : '🏢'}</span>
          <span>{flowType === 'collaborate' ? 'Collaborate' : 'Partner'}</span>
        </div>
        {onExit && (
          <button style={styles.exitButton} onClick={onExit}>
            ← Back to Options
          </button>
        )}
      </div>

      {/* Chat Interface */}
      <div style={styles.chatContainer}>
        <div style={styles.chatMessages} ref={chatContainerRef}>
          {chatMessages.map((msg) => (
            <div key={msg.id} style={styles.message}>
              {msg.sender === 'bot' ? (
                <div style={styles.botMessage}>
<div style={styles.botAvatar}>
  <img 
    src="/bird.png" 
    alt="Bird Avatar" 
    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
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
                    opacity: (!userMessage.trim() && questions[editingStep !== null ? editingStep : currentStep]?.required) ? 0.6 : 1,
                    cursor: (!userMessage.trim() && questions[editingStep !== null ? editingStep : currentStep]?.required) ? 'not-allowed' : 'pointer'
                  }}
                  onClick={handleSubmit}
                  disabled={!userMessage.trim() && questions[editingStep !== null ? editingStep : currentStep]?.required}
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