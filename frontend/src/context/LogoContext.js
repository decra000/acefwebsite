// Updated LogoContext.js with proper environment variable usage
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LogoContext = createContext();

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to build API URLs
const getApiUrl = (endpoint) => {
  // Remove leading slash from endpoint if it exists to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Enhanced API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  try {
    console.log(`🌐 Making API request to: ${url}`);
    console.log(`🔧 Environment API_URL: ${process.env.REACT_APP_API_URL}`);
    console.log(`🔧 Using API_BASE_URL: ${API_BASE_URL}`);
    
    const response = await fetch(url, {
      credentials: 'include',
      ...options
    });
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log(`📡 Response content-type: ${response.headers.get('content-type')}`);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('❌ Could not parse error response as JSON');
        try {
          const textResponse = await response.text();
          console.error('📄 Raw error response:', textResponse.substring(0, 200));
          
          if (textResponse.startsWith('<!DOCTYPE')) {
            errorMessage = `Server returned HTML instead of JSON. Check if backend is running on ${API_BASE_URL}`;
          }
        } catch (textError) {
          console.error('❌ Could not get response as text:', textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
    
  } catch (error) {
    console.error(`❌ API Request failed for ${url}:`, error);
    throw error;
  }
};

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

export const LogoProvider = ({ children }) => {
  const [currentLogo, setCurrentLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🖼️ Fetching current logo...');
      const data = await apiRequest('logos');
      
      if (data.success && data.data) {
        setCurrentLogo(data.data);
        console.log('✅ Logo fetched successfully:', data.data.logo_name);
      } else {
        setCurrentLogo(null);
        console.log('ℹ️ No active logo found');
      }
    } catch (err) {
      console.error('❌ Error fetching logo:', err);
      setError(err.message);
      setCurrentLogo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLogo = useCallback(() => {
    console.log('🔄 Refreshing logo...');
    fetchLogo();
  }, [fetchLogo]);

  const updateLogo = useCallback((newLogo) => {
    console.log('📝 Updating logo state:', newLogo);
    setCurrentLogo(newLogo);
  }, []);

  const clearLogo = useCallback(() => {
    console.log('🗑️ Clearing logo state');
    setCurrentLogo(null);
  }, []);

  // Upload new logo
  const uploadLogo = useCallback(async (formData) => {
    try {
      console.log('📤 Uploading new logo...');
      const data = await apiRequest('logos', {
        method: 'POST',
        body: formData
      });
      
      if (data.success) {
        setCurrentLogo(data.data);
        return data;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }, []);

  // Update logo metadata
  const updateLogoMetadata = useCallback(async (id, metadata) => {
    try {
      console.log('✏️ Updating logo metadata...');
      const data = await apiRequest(`logos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });
      
      if (data.success) {
        setCurrentLogo(data.data);
        return data;
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Update failed:', error);
      throw error;
    }
  }, []);

  // Delete logo
  const deleteLogo = useCallback(async (id) => {
    try {
      console.log('🗑️ Deleting logo...');
      const data = await apiRequest(`logos/${id}`, {
        method: 'DELETE'
      });
      
      if (data.success) {
        setCurrentLogo(null);
        return data;
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('❌ Delete failed:', error);
      throw error;
    }
  }, []);

  // Get logo history
  const getLogoHistory = useCallback(async () => {
    try {
      console.log('📋 Fetching logo history...');
      const data = await apiRequest('logos/history');
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch history');
      }
    } catch (error) {
      console.error('❌ Failed to fetch history:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 LogoProvider initialized');
    console.log('🔧 API Base URL:', API_BASE_URL);
    fetchLogo();
  }, [fetchLogo]);

  const value = {
    currentLogo,
    loading,
    error,
    fetchLogo,
    refreshLogo,
    updateLogo,
    clearLogo,
    uploadLogo,
    updateLogoMetadata,
    deleteLogo,
    getLogoHistory
  };

  return (
    <LogoContext.Provider value={value}>
      {children}
    </LogoContext.Provider>
  );
};

export default LogoProvider;