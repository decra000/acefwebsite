// components/WhatsAppButton.js
import React from 'react';
import { useWhatsAppContact } from '../hooks/useWhatsAppContact';

const WhatsAppButton = ({ 
  contactType = 'primary', 
  message = '', 
  buttonText = '📱 WhatsApp Us',
  className = 'chat-link-button',
  style = {},
  disabled = false,
  showNumber = false,
  fallbackNumber = null // Fallback number if API fails
}) => {
  const { whatsappNumber, loading, error, openWhatsApp } = useWhatsAppContact(contactType);

  const handleClick = () => {
    if (whatsappNumber) {
      openWhatsApp(message);
    } else if (fallbackNumber) {
      // Use fallback number if provided
      const cleanFallback = fallbackNumber.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanFallback}${message ? `?text=${encodedMessage}` : ''}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('WhatsApp contact not available at the moment. Please try again later.');
    }
  };

  if (loading) {
    return (
      <button 
        className={className} 
        style={style} 
        disabled={true}
      >
        Loading...
      </button>
    );
  }

  if (error && !fallbackNumber) {
    return (
      <button 
        className={className} 
        style={style} 
        disabled={true}
      >
        Contact Unavailable
      </button>
    );
  }

  return (
    <button
      className={className}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      title={showNumber && whatsappNumber ? `Contact us at ${whatsappNumber}` : 'Contact us on WhatsApp'}
    >
      {buttonText}
      {showNumber && whatsappNumber && (
        <span style={{ fontSize: '0.8em', marginLeft: '8px', opacity: 0.8 }}>
          ({whatsappNumber})
        </span>
      )}
    </button>
  );
};

export default WhatsAppButton;