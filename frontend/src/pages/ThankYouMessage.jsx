import React, { useEffect } from "react";
import { useTheme, withOpacity } from '../theme';

const ThankYouMessage = ({ 
  onClose, 
  autoCloseDelay = 5000,
  className = '',
  style = {}
}) => {
  const { theme, colors, isDarkMode } = useTheme();

  useEffect(() => {
    if (autoCloseDelay && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onClose]);

  const styles = {
    container: {
      textAlign: 'center',
      padding: '60px 32px',
      background: isDarkMode 
        ? `linear-gradient(145deg, ${withOpacity(colors.black, 0.6)}, ${withOpacity(colors.success, 0.1)})`
        : `linear-gradient(145deg, ${withOpacity(colors.white, 0.95)}, ${withOpacity(colors.success, 0.05)})`,
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: `1px solid ${withOpacity(colors.success, 0.2)}`,
      boxShadow: `0 8px 32px ${withOpacity(colors.success, 0.15)}`,
      animation: 'thankYouSlideIn 0.8s ease-out',
      ...style
    },

    icon: {
      fontSize: '3rem',
      marginBottom: '20px',
      animation: 'bounce 1s ease-in-out infinite alternate'
    },

    title: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '12px',
      background: `linear-gradient(135deg, ${colors.success}, ${colors.primary})`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },

    message: {
      fontSize: '1rem',
      color: theme.colors.textSecondary,
      lineHeight: 1.6,
      marginBottom: '24px',
      maxWidth: '500px',
      margin: '0 auto 24px'
    },

    button: {
      padding: '12px 24px',
      background: `linear-gradient(135deg, ${colors.success}, #059669)`,
      color: colors.white,
      border: 'none',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      minWidth: '180px',
      boxShadow: `0 4px 12px ${withOpacity(colors.success, 0.3)}`,
      animation: 'successPulse 2s ease-in-out infinite'
    }
  };

  return (
    <div className={className} style={styles.container}>
      <div style={styles.icon}>🎉</div>
      <h2 style={styles.title}>Thank You!</h2>
      <p style={styles.message}>
        We've received your collaboration request and our team will review it shortly. 
        Expect to hear from us within 24-48 hours.
      </p>
      {onClose && (
        <button style={styles.button} onClick={onClose}>
          Continue Exploring ✨
        </button>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes thankYouSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes successPulse {
          0%, 100% { 
            box-shadow: 0 4px 12px ${withOpacity(colors.success, 0.3)};
          }
          50% { 
            box-shadow: 0 6px 16px ${withOpacity(colors.success, 0.4)};
          }
        }

        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px ${withOpacity(colors.success, 0.4)} !important;
        }

        button:focus {
          outline: 2px solid ${colors.success};
          outline-offset: 2px;
        }

        button:active {
          transform: translateY(0) scale(0.98);
        }

        @media (max-width: 768px) {
          .container {
            padding: 40px 24px !important;
          }
          
          .title {
            font-size: 1.75rem !important;
          }
          
          .message {
            font-size: 0.9375rem !important;
          }
          
          .button {
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 32px 20px !important;
            border-radius: 20px !important;
          }
          
          .title {
            font-size: 1.5rem !important;
          }
          
          .message {
            font-size: 0.875rem !important;
          }
          
          .icon {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ThankYouMessage;