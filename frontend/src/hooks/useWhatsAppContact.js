// hooks/useWhatsAppContact.js
import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

export const useWhatsAppContact = (contactType = 'primary') => {
  const [whatsappNumber, setWhatsappNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWhatsAppNumber();
  }, [contactType]);

  const fetchWhatsAppNumber = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/whatsapp`);
      const contacts = response.data;
      
      if (contacts && contacts.length > 0) {
        // You can implement different strategies here:
        
        // Strategy 1: Get the first contact
        if (contactType === 'primary') {
          setWhatsappNumber(contacts[0].number);
        }
        
        // Strategy 2: Get by description
        else if (contactType === 'support') {
          const supportContact = contacts.find(c => 
            c.description && c.description.toLowerCase().includes('support')
          );
          setWhatsappNumber(supportContact ? supportContact.number : contacts[0].number);
        }
        
        // Strategy 3: Get by specific description
        else {
          const specificContact = contacts.find(c => 
            c.description && c.description.toLowerCase().includes(contactType.toLowerCase())
          );
          setWhatsappNumber(specificContact ? specificContact.number : contacts[0].number);
        }
      } else {
        setError('No WhatsApp contacts found');
      }
    } catch (err) {
      console.error('Error fetching WhatsApp contact:', err);
      setError('Failed to load WhatsApp contact');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (message = '') => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, ''); // Remove non-digits
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
      window.open(whatsappUrl, '_blank');
    } else {
      console.error('No WhatsApp number available');
    }
  };

  return {
    whatsappNumber,
    loading,
    error,
    openWhatsApp,
    refetch: fetchWhatsAppNumber
  };
};