import React, { useState, useEffect, useCallback } from 'react';
import { TreePine, Send, ChevronUp, Facebook, Twitter, Linkedin, Instagram, X } from 'lucide-react';
import { API_URL } from '../config';
import { useTheme } from '../theme';
import { useLogo } from '../context/LogoContext';

const API_BASE = API_URL;

// Mock API - Replace with your actual API URL
const subscribeToNewsletter = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: 'Successfully subscribed to newsletter!' };
};

// Mock user context - Replace with actual auth context
const useAuth = () => ({
  user: null,
  isAuthenticated: false
});

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ email: '', issue: '' });
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportMessage, setSupportMessage] = useState(null);
  const [logoError, setLogoError] = useState(false);
  
  const { colors } = useTheme();
  const { currentLogo, loading: logoLoading } = useLogo();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSupportModal && user?.email) {
      setSupportForm(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [showSupportModal, user]);

  // Logo rendering with fallback logic - same pattern as Header
  const renderLogo = useCallback(() => {
    // Show TreePine while loading
    if (logoLoading) {
      return (
        <div className="footer-logo-icon">
          <TreePine 
            size={16} 
            style={{ 
              color: colors?.primary || '#0a451c',
            }}
          />
        </div>
      );
    }

    // Try to show fetched logo from API
    if (currentLogo?.full_url && !logoError) {
      return (
        <div className="footer-logo-icon">
          <img 
            src={currentLogo.full_url} 
            alt={currentLogo.alt_text || 'ACEF Logo'}
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              console.warn('Failed to load logo from API, trying fallback');
              setLogoError(true);
            }}
          />
        </div>
      );
    }

    // Try local fallback logo
    return (
      <div className="footer-logo-icon">
        <img 
          src="/ACEFLOGO.png" 
          alt="ACEF Logo"
          style={{
            width: '32px',
            height: '32px',
            objectFit: 'contain'
          }}
          onError={(e) => {
            console.warn('Fallback logo failed, using TreePine icon');
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'block';
            }
          }}
        />
        <TreePine 
          size={16} 
          style={{ 
            color: colors?.primary || '#0a451c',
            display: 'none'
          }} 
        />
      </div>
    );
  }, [currentLogo, colors, logoLoading, logoError]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await subscribeToNewsletter(email);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    console.log('=== SUPPORT TICKET SUBMISSION STARTED ===');
    console.log('Form Data:', supportForm);

    if (!supportForm.email.trim() || !supportForm.issue.trim()) {
      setSupportMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportForm.email)) {
      setSupportMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSupportSubmitting(true);
    setSupportMessage(null);

    try {
      console.log('📧 Sending support ticket to backend...');

      const response = await fetch(`${API_BASE}/email-accounts/support-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: supportForm.email,
          issue: supportForm.issue,
          submittedBy: user?.email || 'anonymous'
        }),
      });

      const result = await response.json();
      console.log('📬 Response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Failed to submit ticket');
      }

      setSupportMessage({
        type: 'success',
        text: 'Support ticket submitted successfully! We\'ll get back to you soon.',
      });

      setSupportForm({ email: user?.email || '', issue: '' });

      setTimeout(() => {
        setShowSupportModal(false);
        setSupportMessage(null);
      }, 3000);
    } catch (error) {
      console.error('❌ Support ticket error:', error);
      setSupportMessage({
        type: 'error',
        text: `Failed to submit ticket: ${error.message}`,
      });
    } finally {
      setSupportSubmitting(false);
      console.log('=== SUPPORT TICKET SUBMISSION COMPLETED ===');
    }
  };

  const quickLinks = [
    { name: 'About', path: '/about-us' },
    { name: 'Contact', path: '/contact-us' },
    { name: 'Careers', path: '/jobs' },
    { name: 'Events', path: '/events' },
    { name: 'Countries', path: '/findbycountry' },
    { name: 'Projects', path: '/projectscatalogue' }
  ];
  
  const socialLinks = [
    { icon: Facebook, url: 'https://www.facebook.com/share/172ZDMd2dL/', label: 'Facebook' },
    { icon: Twitter, url: 'https://x.com/ACEFngo?t=H00D4LR0XgHHRHS73lQ76A&s=09', label: 'Twitter' },
    { icon: Linkedin, url: 'https://www.linkedin.com/company/acef-africa-climate-and-environment-foundation/', label: 'LinkedIn' },
    { icon: Instagram, url: 'https://www.instagram.com/acefngo?igsh=MXE3YXRmd2hvZ2xodg==', label: 'Instagram' }
  ];

  return (
    <>
      <style>{`
        .footer {
          position: relative;
          background: #000000;
          color: white;
          overflow: hidden;
          font-family: inherit;
          padding: 1.5rem 0 1rem;
        }

        .footer-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 25% 25%, rgba(250, 207, 60, 0.03) 0%, transparent 50%),
                      radial-gradient(circle at 75% 75%, rgba(156, 207, 159, 0.03) 0%, transparent 50%);
          opacity: 0.7;
        }

        .footer-container {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-brand {
          text-align: center;
          margin-bottom: 1rem;
        }

        .footer-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-logo-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-logo-text {
          font-size: 1.25rem;
          font-weight: bold;
          background: linear-gradient(90deg, #facf3c, #9ccf9f);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .footer-description {
          color: #cbd5e1;
          font-size: 0.8rem;
          line-height: 1.4;
          max-width: 200px;
          margin: 0 auto;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem 1.5rem;
          margin: 1.5rem 0;
        }

        .footer-link {
          color: #e2e8f0;
          text-decoration: none;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          position: relative;
          padding: 0.25rem 0;
        }

        .footer-link:hover {
          color: #facf3c;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #facf3c;
          transition: width 0.3s ease;
        }

        .footer-link:hover::after {
          width: 100%;
        }

        .footer-newsletter {
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
        }

        .footer-newsletter-title {
          color: #94a3b8;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .footer-newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-email-input {
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s ease;
          width: 100%;
        }

        .footer-email-input:focus {
          border-color: #facf3c;
        }

        .footer-email-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-submit-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(90deg, #facf3c, #9ccf9f);
          color: black;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
        }

        .footer-submit-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 15px rgba(250, 207, 60, 0.4);
        }

        .footer-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .footer-message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          margin-bottom: 1rem;
          border: 1px solid transparent;
        }

        .footer-message-success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.2);
        }

        .footer-message-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: center;
        }

        .footer-copyright {
          color: #64748b;
          font-size: 0.85rem;
        }

        .footer-legal {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer-legal-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.3s ease;
        }

        .footer-legal-link:hover {
          color: #facf3c;
        }

        .footer-support-link {
          color: #10b981;
          text-decoration: none;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          font-weight: 600;
          cursor: pointer;
        }

        .footer-support-link:hover {
          color: #34d399;
          text-decoration: underline;
        }

        .footer-social-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .footer-social-links {
          display: flex;
          gap: 1rem;
        }

        .footer-social-link {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-social-link:hover {
          background: rgba(250, 207, 60, 0.2);
          border-color: rgba(250, 207, 60, 0.3);
          color: #facf3c;
          transform: translateY(-2px);
        }

        .footer-badges {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid;
        }

        .footer-badge-carbon {
          background: rgba(156, 207, 159, 0.1);
          color: #9ccf9f;
          border-color: rgba(156, 207, 159, 0.2);
        }

        .footer-badge-impact {
          background: rgba(250, 207, 60, 0.1);
          color: #facf3c;
          border-color: rgba(250, 207, 60, 0.2);
        }

        .back-to-top {
          position: fixed !important;
          bottom: 1.5rem !important;
          right: 1.5rem !important;
          width: 50px !important;
          height: 50px !important;
          max-width: 50px !important;
          max-height: 50px !important;
          min-width: 50px !important;
          min-height: 50px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex: none !important;
          border-radius: 50% !important;
          border: none !important;
          background: linear-gradient(135deg, #facf3c, #9ccf9f) !important;
          color: black !important;
          cursor: pointer !important;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s ease !important;
          z-index: 1000 !important;
          opacity: 0 !important;
          transform: translateY(20px) !important;
          pointer-events: none !important;
        }

        .back-to-top.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
          pointer-events: auto !important;
        }

        .back-to-top:hover {
          transform: translateY(-3px) scale(1.05) !important;
          box-shadow: 0 8px 30px rgba(250, 207, 60, 0.6) !important;
        }

        .back-to-top svg {
          width: 22px !important;
          height: 22px !important;
        }

        @media (max-width: 768px) {
          .back-to-top {
            bottom: 1rem !important;
            right: 1rem !important;
            width: 45px !important;
            height: 45px !important;
          }
        }

        .support-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }

        .support-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        .support-modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #28d219, #54c015);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .support-modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .support-modal-close {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
          padding: 0;
        }

        .support-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .support-modal-body {
          padding: 1.5rem;
        }

        .support-form-group {
          margin-bottom: 1.25rem;
        }

        .support-form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .support-form-input,
        .support-form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          font-family: inherit;
          box-sizing: border-box;
        }

        .support-form-input:focus,
        .support-form-textarea:focus {
          outline: none;
          border-color: #28d219;
          box-shadow: 0 0 0 3px rgba(40, 210, 25, 0.1);
        }

        .support-form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .support-form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .support-submit-btn,
        .support-cancel-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .support-submit-btn {
          background: linear-gradient(135deg, #28d219, #54c015);
          color: white;
        }

        .support-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 210, 25, 0.4);
        }

        .support-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .support-cancel-btn {
          background: #f3f4f6;
          color: #1f2937;
        }

        .support-cancel-btn:hover {
          background: #e5e7eb;
        }

        .support-message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .support-message-success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .support-message-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid currentColor;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) {
          .footer {
            padding: 1.5rem 0 1rem;
          }

          .footer-main {
            grid-template-columns: 1fr auto auto;
            gap: 3rem;
            align-items: center;
            margin-bottom: 1rem;
          }

          .footer-brand {
            text-align: left;
            margin-bottom: 0;
          }

          .footer-logo-container {
            justify-content: flex-start;
            gap: 0.5rem;
          }

          .footer-description {
            margin: 0;
            max-width: 200px;
          }

          .footer-links {
            justify-content: flex-start;
            margin: 0;
            flex-direction: row;
            gap: 2rem;
          }

          .footer-newsletter {
            text-align: left;
            margin: 0;
          }

          .footer-newsletter-form {
            flex-direction: row;
            gap: 0.5rem;
          }

          .footer-email-input {
            flex: 1;
            width: 180px;
            padding: 0.4rem 0.75rem;
            font-size: 0.8rem;
          }

          .footer-submit-btn {
            width: auto;
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }

          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            text-align: left;
            padding-top: 0.75rem;
            font-size: 0.75rem;
          }

          .footer-social-section {
            flex-direction: row;
            gap: 1.5rem;
          }

          .footer-social-link {
            width: 32px;
            height: 32px;
          }

          .footer-badge {
            font-size: 0.7rem;
            padding: 0.3rem 0.6rem;
          }
        }

        @media (min-width: 1024px) {
          .footer-container {
            padding: 0 2rem;
          }

          .footer-main {
            gap: 4rem;
          }
        }
      `}</style>
      
      {/* Support Modal */}
      {showSupportModal && (
        <div className="support-modal-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-header">
              <h3 className="support-modal-title">Submit Support Ticket</h3>
              <button 
                className="support-modal-close"
                onClick={() => setShowSupportModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="support-modal-body">
              <p style={{ marginTop: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                Having an issue? Let us know and we'll get back to you as soon as possible.
              </p>

              {supportMessage && (
                <div className={`support-message support-message-${supportMessage.type}`}>
                  {supportMessage.text}
                </div>
              )}

              <form onSubmit={handleSupportSubmit}>
                <div className="support-form-group">
                  <label className="support-form-label" htmlFor="support-email">
                    Your Email *
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    className="support-form-input"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                    placeholder="your.email@example.com"
                    disabled={supportSubmitting}
                    required
                  />
                </div>

                <div className="support-form-group">
                  <label className="support-form-label" htmlFor="support-issue">
                    Describe Your Issue *
                  </label>
                  <textarea
                    id="support-issue"
                    className="support-form-textarea"
                    value={supportForm.issue}
                    onChange={(e) => setSupportForm({ ...supportForm, issue: e.target.value })}
                    placeholder="Please describe the issue you're experiencing..."
                    disabled={supportSubmitting}
                    required
                  />
                </div>

                <div className="support-form-actions">
                  <button
                    type="button"
                    className="support-cancel-btn"
                    onClick={() => setShowSupportModal(false)}
                    disabled={supportSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="support-submit-btn"
                    disabled={supportSubmitting}
                  >
                    {supportSubmitting ? (
                      <>
                        <div className="loading-spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
       <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>
      {/* Back to Top Button */}
     
      
      <footer className="footer">
        <div className="footer-background"></div>

        <div className="footer-container">
          {/* Main Section */}
          <div className="footer-main">
            
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="footer-logo-container">
                <div className="footer-logo-icon">
                  {renderLogo()}
                </div>
                <span className="footer-logo-text">ACEF</span>
              </div>
              <p className="footer-description">
                Empowering grassroots communities for sustainable environmental change across Africa.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-links">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.path}
                  className="footer-link"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Newsletter Section */}
            <div className="footer-newsletter">
              <h3 className="footer-newsletter-title">Stay Updated</h3>
              
              {message && (
                <div className={`footer-message footer-message-${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <div className="footer-newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="footer-email-input"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="footer-submit-btn"
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <Send size={16} />
                      Subscribe
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div>
              <div className="footer-copyright">
                © {new Date().getFullYear()} Africa Climate and Environment Foundation. All rights reserved.
              </div>
              
              {/* Legal Links */}
              <div className="footer-legal">
                <a href="/privacy-policy" className="footer-legal-link">
                  Privacy Policy
                </a>
                <a href="/terms-of-service" className="footer-legal-link">
                  Terms of Service
                </a>
                <span 
                  className="footer-support-link"
                  onClick={() => setShowSupportModal(true)}
                >
                  🎫 Support Ticket
                </span>
              </div>
            </div>

            <div className="footer-social-section">
              <div className="footer-social-links">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="footer-social-link"
                    >
                      <IconComponent size={20} />
                    </a>
                  );
                })}
              </div>
              
              <div className="footer-badges">
                <div className="footer-badge footer-badge-carbon">
                  🌱 Carbon Neutral
                </div>
                <div className="footer-badge footer-badge-impact">
                  ⚡ Impact Driven
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;