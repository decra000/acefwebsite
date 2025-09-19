import React from 'react';
import { useTheme, createGradient, withOpacity } from '../../theme'; // Import theme utilities

export default function Hero() {
  const { colors } = useTheme(); // Use the theme hook

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
      {/* Hero Section */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(65vh, 75vh, 85vh)',
          background: createGradient(colors.primary, colors.primaryLight, '135deg'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 clamp(1rem, 5vw, 4rem)',
          overflow: 'hidden',
        }}
      >
        {/* Decorative overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 30% 50%, ${withOpacity(colors.accent, 0.1)} 0%, transparent 70%)`,
            zIndex: 1,
          }}
        ></div>

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 'min(55%, 600px)',
            width: '100%',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 4.5rem)',
              fontWeight: '200',
              lineHeight: '1.1',
              marginBottom: 'clamp(1rem, 3vw, 2rem)',
              color: colors.white,
              fontFamily:
                'inherit',
              letterSpacing: '-0.02em',
            }}
          >
            Get in touch
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              lineHeight: '1.6',
              color: withOpacity(colors.white, 0.9),
              fontWeight: '400',
              margin: 0,
              maxWidth: '480px',
            }}
          >
            Ready to drive climate action in Africa? We'd love to connect and explore how we can
            work together.
          </p>

          {/* Social Media Icons */}
          <div
            style={{
              display: 'flex',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
              marginTop: 'clamp(2rem, 4vw, 3rem)',
              flexWrap: 'wrap',
            }}
          >
            {[
              {
                name: 'Facebook',
                svg: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                ),
              },
              {
                name: 'Twitter',
                svg: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                name: 'Instagram',
                svg: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                  </svg>
                ),
              },
              {
                name: 'LinkedIn',
                svg: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ),
              },
            ].map((social, index) => (
              <div
                key={index}
                title={social.name}
                style={{
                  width: 'clamp(44px, 6vw, 52px)',
                  height: 'clamp(44px, 6vw, 52px)',
                  backgroundColor: withOpacity(colors.white, 0.1),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${withOpacity(colors.white, 0.25)}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                  e.currentTarget.style.backgroundColor = withOpacity(colors.white, 0.2);
                  e.currentTarget.style.borderColor = withOpacity(colors.white, 0.4);
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.backgroundColor = withOpacity(colors.white, 0.1);
                  e.currentTarget.style.borderColor = withOpacity(colors.white, 0.25);
                }}
              >
                {social.svg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
