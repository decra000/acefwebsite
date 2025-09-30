import React, { useState, useEffect } from 'react';
import { TreePine, Send, ChevronUp, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { subscribeToNewsletter } from '../services/newsletterService';
import { useTheme } from '../theme';
import { useLogo } from '../context/LogoContext';

// CSS styles
const footerStyles = `
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
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #facf3c, #9ccf9f);
    color: black;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 25px rgba(250, 207, 60, 0.4);
    transition: all 0.3s ease;
    z-index: 1000;
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
  }

  .back-to-top.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .back-to-top:hover {
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 8px 30px rgba(250, 207, 60, 0.6);
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

  /* Desktop styles */
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
`;

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { colors } = useTheme();
  const { currentLogo, loading: logoLoading } = useLogo();

  // Back to top visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Render logo function from your original code
  const renderLogo = () => {
    if (currentLogo?.full_url) {
      return (
        <>
          <img 
            src={currentLogo.full_url} 
            alt={currentLogo.alt_text || 'ACEF Logo'}
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              // Fallback to TreePine icon if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <TreePine 
            size={16} 
            style={{ 
              color: colors.primary,
              display: 'none'
            }} 
          />
        </>
      );
    }

    // Fallback to TreePine icon
    return <TreePine size={16} style={{ color: colors.primary }} />;
  };

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
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
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
    { icon: Facebook, url: 'https://facebook.com/ACEFoundation', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com/ACEFoundation', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com/company/ace-foundation', label: 'LinkedIn' },
    { icon: Instagram, url: 'https://instagram.com/ACEFoundation', label: 'Instagram' }
  ];

  return (
    <>
      <style>{footerStyles}</style>
      
      {/* Back to Top Button */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>
      
      <footer className="footer">
        {/* Background Effects */}
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
              
              {/* Status Message */}
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