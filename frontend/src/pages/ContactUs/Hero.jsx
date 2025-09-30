import React from 'react';
import { useTheme, createGradient, withOpacity } from '../../theme';
import '../../styles/contact-styles.css'; // Import shared styles

export default function Hero() {
  const { colors } = useTheme();

  // Dynamic styles that depend on theme
  const dynamicStyles = {
    heroGradient: {
      background: createGradient(colors.accent, colors.accent, '135deg'),
    },
    heroOverlay: {
      background: `radial-gradient(circle at 30% 50%, ${withOpacity(colors.accent, 0.1)} 0%, transparent 70%)`,
    },
    heroTitle: {
      color: colors.black,
    },
    heroDescription: {
      color: withOpacity(colors.black, 0.9),
    },
    socialItem: {
      backgroundColor: withOpacity(colors.white, 0.1),
      border: `1px solid ${withOpacity(colors.white, 0.25)}`,
      color: colors.white,
    },
    socialItemHover: {
      backgroundColor: withOpacity(colors.white, 0.2),
      borderColor: withOpacity(colors.white, 0.4),
    },
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      svg: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      svg: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      svg: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      svg: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const handleSocialHover = (e, isHover) => {
    const style = isHover ? dynamicStyles.socialItemHover : dynamicStyles.socialItem;
    Object.assign(e.currentTarget.style, style);
    if (isHover) {
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
    } else {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
    }
  };

  return (
    <div className="contact-container hero-section" style={{ margin: 0, padding: 0, display: 'block' }}>
      {/* Hero Section */}
      <div className="hero-content-wrapper" style={dynamicStyles.heroGradient}>
        {/* Decorative overlay */}
        <div className="hero-overlay" style={dynamicStyles.heroOverlay}></div>

        {/* Content */}
        <div className="hero-content">
          <h2
            className="hero-title"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: "300",
              color: colors.text,
              marginBottom: "24px",
              marginTop: "0",
              paddingTop: "0",
              lineHeight: "1.2",
              letterSpacing: '-0.02em',
              alignSelf: 'left'
            }}
          >
            Get <span style={{ fontWeight: '700', color: colors.primary }}>in</span> Touch
          </h2>

          <p className="hero-description" style={dynamicStyles.heroDescription}>
            Ready to drive climate action in Africa? We'd love to connect and explore how we can
            work together.
          </p>

          {/* Social Media Icons */}
          <div className="hero-social-container" role="list" aria-label="Social media links">
            {socialPlatforms.map((social, index) => (
              <button
                key={index}
                className="hero-social-item"
                style={dynamicStyles.socialItem}
                onMouseEnter={(e) => handleSocialHover(e, true)}
                onMouseLeave={(e) => handleSocialHover(e, false)}
                onFocus={(e) => handleSocialHover(e, true)}
                onBlur={(e) => handleSocialHover(e, false)}
                aria-label={`Visit our ${social.name} page`}
                role="listitem"
              >
                {social.svg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}