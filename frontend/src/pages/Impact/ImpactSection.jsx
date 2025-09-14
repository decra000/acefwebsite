import React from 'react';
import { useTheme, withOpacity } from '../../theme';
import './ImpactSection.css';

const ImpactSection = () => {
  const { colors } = useTheme();

  return (
    <section
      className="impact-section"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '4rem 2rem',
        backgroundColor: colors.background,
        gap: '4rem', // space between image and text
      }}
    >
      {/* Left Side: Image */}
      <div
        style={{
          flex: 1,
          minHeight: '500px',
          backgroundImage: `url('/SeaCleaning.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px',
          boxShadow: `0 8px 20px ${withOpacity(colors.black, 0.2)}`,
        }}
      ></div>

      {/* Right Side: Text */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.5rem',
          color: colors.text,
        }}
      >
        <h2
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.primary,
          }}
        >
Truly Transformative        </h2>

        <p
          style={{
            
               color: colors.textSecondary,
                 marginBottom: '2.5rem',
                 fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                 lineHeight: 1.7,
                 fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
                 maxWidth: '450px',
                 fontWeight: '400'
             
          }}
        >
          Every number represents real lives touched, communities strengthened,
          and positive change created. These stories and metrics reflect our ongoing
          commitment to sustainable development and social impact.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
              padding: '0.8rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
Support our Cause          </button>

    
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
