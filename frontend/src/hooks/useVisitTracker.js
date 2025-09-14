// hooks/useVisitTracker.js
import { useEffect } from 'react';

const useVisitTracker = () => {
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${API_URL}/visits/record`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log('Visit recorded successfully:', result.data);
        } else {
          console.error('Failed to record visit:', result.message);
        }
      } catch (error) {
        console.error('Visit tracking error:', error.message);
      }
    };

    // Record visit on component mount
    recordVisit();
  }, []); // Empty dependency array - runs once per mount
};

export default useVisitTracker;