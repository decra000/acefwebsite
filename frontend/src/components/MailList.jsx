import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme';
import { subscribeToNewsletter, validateEmail } from '../services/newsletterService';

const MailList = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [message, setMessage] = useState('');
  const { colors, isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    
    // Clear previous messages
    setMessage('');
    setSubmitStatus(null);
    
    // Basic validation
    if (!trimmedEmail) {
      setSubmitStatus('error');
      setMessage('Please enter an email address.');
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    // Use service validation
    const validation = validateEmail(trimmedEmail);
    if (!validation.isValid) {
      setSubmitStatus('error');
      setMessage(validation.message);
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await subscribeToNewsletter(trimmedEmail);
      
      if (result.success) {
        setSubmitStatus('success');
        setMessage(result.message || 'Thank you for subscribing! Welcome to our community.');
        setEmail('');
      } else {
        setSubmitStatus('error');
        setMessage(result.message || 'Something went wrong. Please try again.');
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      setSubmitStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }

    // Clear status after 5 seconds
    setTimeout(() => {
      setSubmitStatus(null);
      setMessage('');
    }, 5000);
  };

  return (
    <section 
      className={`maillist-section ${isDarkMode ? 'dark' : 'light'}`}
      style={{
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden',
        background: isDarkMode 
          ? `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`
          : `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
        color: colors.black,
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div 
        className="maillist-container"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div 
          className="maillist-content"
          style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 968 ? '1fr' : '1fr 1fr',
            gap: window.innerWidth <= 968 ? '40px' : '60px',
            alignItems: 'center',
            textAlign: window.innerWidth <= 968 ? 'center' : 'left'
          }}
        >
          <div 
            className="maillist-text"
            style={{ maxWidth: '500px' }}
          >
            <motion.h2 
              className="maillist-title"
              style={{
                fontSize: window.innerWidth <= 480 ? '1.6rem' : window.innerWidth <= 768 ? '1.8rem' : window.innerWidth <= 968 ? '2rem' : '2.5rem',
                fontWeight: 700,
                marginBottom: '20px',
                lineHeight: 1.2,
                color: colors.black
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
            >
              Stay Updated on Climate Action
            </motion.h2>
            <motion.p 
              className="maillist-description"
              style={{
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem',
                lineHeight: 1.6,
                color: 'rgba(0, 0, 0, 0.8)',
                marginBottom: 0
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: false }}
            >
              Join our community of environmental champions. Get the latest insights, 
              impact stories, and opportunities to make a difference delivered to your inbox.
            </motion.p>
          </div>

          <motion.div 
            className="maillist-form-container"
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '16px',
              padding: window.innerWidth <= 480 ? '25px 15px' : window.innerWidth <= 768 ? '30px 20px' : '40px',
              maxWidth: '450px',
              marginLeft: window.innerWidth <= 968 ? '0' : 'auto',
              marginRight: '0',
              width: '100%'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: false }}
          >
            <form 
              className="maillist-form"
              onSubmit={handleSubmit}
              style={{ marginBottom: '16px' }}
            >
              <div 
                className="input-wrapper"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: window.innerWidth <= 768 ? '12px' : '16px'
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  style={{
                    padding: window.innerWidth <= 768 ? '14px 18px' : '16px 20px',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: colors.gray900,
                    fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryDark;
                    e.target.style.background = colors.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  }}
                  disabled={isSubmitting}
                  required
                />
                <motion.button
                  type="submit"
                  style={{
                    padding: window.innerWidth <= 768 ? '14px 18px' : '16px 32px',
                    background: isDarkMode 
                      ? `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.black} 100%)`
                      : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        border: `2px solid rgba(255, 255, 255, 0.3)`,
                        borderTop: `2px solid ${colors.white}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                  ) : (
                    'Subscribe'
                  )}
                </motion.button>
              </div>
            </form>
              
            {submitStatus && (
              <motion.div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  background: submitStatus === 'success' 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                  color: submitStatus === 'success' ? '#10b981' : '#ef4444',
                  border: submitStatus === 'success' 
                    ? '1px solid rgba(16, 185, 129, 0.3)' 
                    : '1px solid rgba(239, 68, 68, 0.3)'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {message}
              </motion.div>
            )}
            
            <p 
              style={{
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.85rem',
                textAlign: 'center',
                margin: '12px 0 0 0'
              }}
            >
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default MailList;