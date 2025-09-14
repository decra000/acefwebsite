import React, { useState, useEffect } from 'react';
import { X, TreePine, Send, ChevronUp, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme';
import { useLogo } from '../context/LogoContext';
import { subscribeToNewsletter } from "../services/newsletterService";

const styles = {
  footer: {
    position: 'relative',
    background: 'black',
    color: 'white',
    overflow: 'hidden',
    fontFamily: 'inherit',
    padding: '1.5rem 0 1rem'
  },
  
  backgroundEffects: {
    position: 'absolute',
    inset: '0',
    background: `
      radial-gradient(circle at 25% 25%, #facf3c08 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, #9ccf9f08 0%, transparent 50%)
    `,
    opacity: '0.7'
  },
  
  container: {
    position: 'relative',
    zIndex: '10',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem'
  },
  
  mainSection: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: '3rem',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #facf3c, #9ccf9f)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(250, 207, 60, 0.3)',
    transition: 'transform 0.3s ease'
  },
  
  logoIconHover: {
    transform: 'scale(1.1) rotate(5deg)'
  },
  
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #facf3c, #9ccf9f)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent'
  },
  
  brandDescription: {
    color: '#cbd5e1',
    fontSize: '0.8rem',
    lineHeight: '1.4',
    maxWidth: '200px'
  },
  
  linksSection: {
    display: 'flex',
    gap: '2rem'
  },
  
  linkItem: {
    color: '#e2e8f0',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  
  linkItemHover: {
    color: '#facf3c'
  },
  
  linkUnderline: {
    position: 'absolute',
    bottom: '-2px',
    left: '0',
    width: '0',
    height: '1px',
    backgroundColor: '#facf3c',
    transition: 'width 0.3s ease'
  },
  
  linkUnderlineHover: {
    width: '100%'
  },
  
  newsletterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  
  newsletterText: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap'
  },
  
  newsletterForm: {
    display: 'flex',
    gap: '0.5rem'
  },
  
  emailInput: {
    padding: '0.4rem 0.75rem',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.8rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    width: '180px'
  },
  
  emailInputFocus: {
    borderColor: '#facf3c'
  },
  
  submitButton: {
    padding: '0.4rem 0.8rem',
    background: 'linear-gradient(90deg, #facf3c, #9ccf9f)',
    color: 'black',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  
  submitButtonHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 15px rgba(250, 207, 60, 0.4)'
  },
  
  bottomSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '0.75rem'
  },
  
  leftBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  
  copyright: {
    color: '#64748b'
  },
  
  legalLinks: {
    display: 'flex',
    gap: '1.5rem'
  },
  
  legalLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.75rem',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  
  legalLinkHover: {
    color: '#facf3c'
  },
  
  bottomRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  
  socialLinks: {
    display: 'flex',
    gap: '0.5rem'
  },
  
  socialLink: {
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  },
  
  socialLinkHover: {
    background: 'rgba(250, 207, 60, 0.2)',
    borderColor: 'rgba(250, 207, 60, 0.3)',
    color: '#facf3c',
    transform: 'translateY(-1px)'
  },
  
  badges: {
    display: 'flex',
    gap: '0.5rem'
  },
  
  badge: {
    padding: '0.3rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '500'
  },
  
  carbonBadge: {
    background: 'rgba(156, 207, 159, 0.2)',
    color: '#9ccf9f',
    border: '1px solid rgba(156, 207, 159, 0.3)'
  },
  
  impactBadge: {
    background: 'rgba(250, 207, 60, 0.2)',
    color: '#facf3c',
    border: '1px solid rgba(250, 207, 60, 0.3)'
  },
  
  backToTop: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '45px',
    height: '45px',
    background: 'linear-gradient(135deg, #facf3c, #9ccf9f)',
    color: 'black',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 25px rgba(250, 207, 60, 0.4)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    opacity: 0,
    transform: 'translateY(20px)',
    pointerEvents: 'none'
  },

  backToTopVisible: {
    opacity: 1,
    transform: 'translateY(0)',
    pointerEvents: 'auto'
  },

  backToTopHover: {
    transform: 'translateY(-3px) scale(1.1)',
    boxShadow: '0 8px 30px rgba(250, 207, 60, 0.6)'
  },
  
  // Responsive styles
  '@media (max-width: 768px)': {
    mainSection: {
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
      textAlign: 'center'
    },
    
    linksSection: {
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    
    newsletterSection: {
      flexDirection: 'column',
      gap: '1rem'
    },
    
    bottomSection: {
      flexDirection: 'column',
      gap: '1rem',
      textAlign: 'center'
    },
    
    leftBottom: {
      flexDirection: 'column',
      gap: '0.75rem'
    },
    
    legalLinks: {
      gap: '1rem'
    },
    
    bottomRight: {
      flexDirection: 'column',
      gap: '1rem'
    }
  }
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [hoveredElements, setHoveredElements] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { currentLogo, loading: logoLoading } = useLogo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState(null);

  // Back to top visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMouseEnter = (element) => {
    setHoveredElements(prev => ({ ...prev, [element]: true }));
  };

  const handleMouseLeave = (element) => {
    setHoveredElements(prev => ({ ...prev, [element]: false }));
  };
   const handleSubscribe = async (e) => {
  e.preventDefault(); // ✅ stop form reload
  const result = await subscribeToNewsletter(email);
  setStatus(result.message);
  setEmail(""); // optional: clear input
};


  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about-us' },
    { name: 'Programs', path: '/projects' },
    { name: 'Impact', path: '/impact' },
    { name: 'Contact', path: '/contact-us' },
        { name: 'Careers', path: '/jobs' }

  ];
  
  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com/ACEFoundation', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com/ACEFoundation', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com/company/ace-foundation', label: 'LinkedIn' },
    { icon: Instagram, url: 'https://instagram.com/ACEFoundation', label: 'Instagram' }
  ];

  // Render mobile logo
  const renderMobileLogo = () => {
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
            size={32} 
            style={{ 
              color: colors.primary,
              display: 'none'
            }} 
          />
        </>
      );
    }

    // Fallback to TreePine icon
    return <TreePine size={32} style={{ color: colors.primary }} />;
  };

  return (
    <>
      {/* Back to Top Button */}
      <button
        style={{
          ...styles.backToTop,
          ...(showBackToTop ? styles.backToTopVisible : {}),
          ...(hoveredElements.backToTop ? styles.backToTopHover : {})
        }}
        onClick={scrollToTop}
        onMouseEnter={() => handleMouseEnter('backToTop')}
        onMouseLeave={() => handleMouseLeave('backToTop')}
        aria-label="Back to top"
      >
        <ChevronUp style={{ width: '20px', height: '20px' }} />
      </button>
      
      <footer style={styles.footer}>
        {/* Background Effects */}
        <div style={styles.backgroundEffects}></div>

        <div style={styles.container}>
          {/* Main horizontal section */}
          <div style={styles.mainSection}>
            
            {/* Brand Section */}
            <div style={styles.brandSection}>
              <div style={styles.logoContainer}>
                <div className={styles.mobileMenuHeader}>
                  <div className={styles.mobileMenuBrand}>
                    {renderMobileLogo()}
                  </div>
                  <logoIcon
                    onClick={toggleMobileMenu}
                    style={{ color: colors.text }}
                  >
                    <X size={2} />
                  </logoIcon>
                </div>
              </div>
              <p style={styles.brandDescription}>
                Empowering grassroots communities for sustainable environmental change across Africa.
              </p>
            </div>

            {/* Quick Links */}
            <div style={styles.linksSection}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  style={{
                    ...styles.linkItem,
                    ...(hoveredElements[`link-${index}`] ? styles.linkItemHover : {})
                  }}
                  onMouseEnter={() => handleMouseEnter(`link-${index}`)}
                  onMouseLeave={() => handleMouseLeave(`link-${index}`)}
                >
                  {link.name}
                  <div style={{
                    ...styles.linkUnderline,
                    ...(hoveredElements[`link-${index}`] ? styles.linkUnderlineHover : {})
                  }}></div>
                </Link>
              ))}
            </div>

            {/* Newsletter */}
            <div style={styles.newsletterSection}>
              <span style={styles.newsletterText}>Stay Updated:</span>
              <div style={styles.newsletterForm}>
                <form 
    onSubmit={handleSubscribe} 
    style={{ display: "flex", gap: "0.5rem" }}
  >

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={styles.emailInput}
                />
                <button 
                  style={{
                    ...styles.submitButton,
                    ...(hoveredElements.submit ? styles.submitButtonHover : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('submit')}
                  onMouseLeave={() => handleMouseLeave('submit')}
                >
                  <Send style={{ width: '14px', height: '14px' }} />
                </button>
                  </form>

              </div>
              
            </div>
          </div>

          {/* Bottom Section */}
          <div style={styles.bottomSection}>
            <div style={styles.leftBottom}>
              <div style={styles.copyright}>
                © {new Date().getFullYear()} Africa Climate and Environment Foundation. All rights reserved.
              </div>
              
              {/* Legal Links */}
              <div style={styles.legalLinks}>
                <Link
                  to="/privacy-policy"
                  style={{
                    ...styles.legalLink,
                    ...(hoveredElements.privacy ? styles.legalLinkHover : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('privacy')}
                  onMouseLeave={() => handleMouseLeave('privacy')}
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms-of-service"
                  style={{
                    ...styles.legalLink,
                    ...(hoveredElements.terms ? styles.legalLinkHover : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('terms')}
                  onMouseLeave={() => handleMouseLeave('terms')}
                >
                  Terms of Service
                </Link>
              </div>
            </div>

            <div style={styles.bottomRight}>
              <div style={styles.socialLinks}>
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      style={{
                        ...styles.socialLink,
                        ...(hoveredElements[`social-${index}`] ? styles.socialLinkHover : {})
                      }}
                      onMouseEnter={() => handleMouseEnter(`social-${index}`)}
                      onMouseLeave={() => handleMouseLeave(`social-${index}`)}
                    >
                      <IconComponent size={16} />
                    </a>
                  );
                })}
              </div>
              
              <div style={styles.badges}>
                <div style={{ ...styles.badge, ...styles.carbonBadge }}>
                  🌱 Carbon Neutral
                </div>
                <div style={{ ...styles.badge, ...styles.impactBadge }}>
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