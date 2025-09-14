// utils/locationSharingUtils.js
// Frontend utilities for location sharing functionality

import axios from 'axios';
import { API_URL } from '../config';
import React, { useEffect, useState } from 'react';

/**
 * Location sharing utility class
 */
export class LocationShareService {
  
  /**
   * Get shareable links for an event
   * @param {number} eventId 
   * @returns {Promise<object>} Shareable links and event data
   */
  static async getEventShareLinks(eventId) {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}/share`);
      return response.data;
    } catch (error) {
      console.error('Error getting shareable links:', error);
      throw new Error('Failed to generate shareable links');
    }
  }

  /**
   * Copy text to clipboard with fallback
   * @param {string} text 
   * @param {string} linkType 
   * @returns {Promise<boolean>} Success status
   */
  static async copyToClipboard(text, linkType = 'Link') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        this.showNotification(`${linkType} copied to clipboard!`, 'success');
        return true;
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          this.showNotification(`${linkType} copied to clipboard!`, 'success');
          return true;
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.showNotification(`Failed to copy ${linkType}`, 'error');
      return false;
    }
  }

  /**
   * Share via Web Share API (mobile-friendly) with fallback
   * @param {object} shareData 
   * @returns {Promise<boolean>} Success status
   */
  static async nativeShare(shareData) {
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      } else if (navigator.share) {
        // Try sharing without checking canShare (older browsers)
        await navigator.share(shareData);
        return true;
      } else {
        // Fallback to copying URL
        if (shareData.url) {
          return await this.copyToClipboard(shareData.url, 'Share link');
        } else {
          throw new Error('No URL to share');
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled sharing - this is normal
        return false;
      }
      console.error('Error sharing:', error);
      // Fallback to copying
      if (shareData.url) {
        return await this.copyToClipboard(shareData.url, 'Share link');
      }
      return false;
    }
  }

  /**
   * Share event location with multiple options
   * @param {object} event 
   * @param {string} method - 'native', 'whatsapp', 'telegram', 'email', 'sms'
   */
  static async shareEventLocation(event, method = 'native') {
    try {
      const shareData = await this.getEventShareLinks(event.id);
      const { links, sharing } = shareData;

      switch (method) {
        case 'native':
          return await this.nativeShare({
            title: `${event.title} - Location`,
            text: `Check out the location for ${event.title}`,
            url: links.google_maps
          });

        case 'whatsapp':
          window.open(links.whatsapp_share, '_blank');
          return true;

        case 'telegram':
          window.open(links.telegram_share, '_blank');
          return true;

        case 'email':
          const emailUrl = `mailto:?subject=${encodeURIComponent(sharing.email_subject)}&body=${encodeURIComponent(sharing.email_body)}`;
          window.open(emailUrl, '_blank');
          return true;

        case 'sms':
          const smsUrl = `sms:?body=${encodeURIComponent(sharing.sms_text)}`;
          window.open(smsUrl, '_blank');
          return true;

        case 'copy':
          return await this.copyToClipboard(links.google_maps, 'Location link');

        default:
          throw new Error(`Unknown sharing method: ${method}`);
      }
    } catch (error) {
      console.error(`Error sharing via ${method}:`, error);
      this.showNotification(`Failed to share via ${method}`, 'error');
      return false;
    }
  }

  /**
   * Open location in preferred map app
   * @param {object} event 
   * @param {string} mapService - 'google', 'apple', 'waze', 'osm'
   */
  static async openInMapApp(event, mapService = 'google') {
    try {
      const shareData = await this.getEventShareLinks(event.id);
      const { links } = shareData;

      let url;
      switch (mapService) {
        case 'google':
          url = links.google_maps;
          break;
        case 'apple':
          url = links.apple_maps;
          break;
        case 'waze':
          url = links.waze;
          break;
        case 'osm':
        case 'openstreetmap':
          url = links.openstreet_map;
          break;
        default:
          url = links.google_maps;
      }

      window.open(url, '_blank');
      return true;
    } catch (error) {
      console.error('Error opening map app:', error);
      this.showNotification('Failed to open map application', 'error');
      return false;
    }
  }

  /**
   * Get user's current location and find nearby events
   * @param {number} radius - Search radius in kilometers
   * @returns {Promise<array>} Nearby events
   */
  static async findNearbyEvents(radius = 10) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(`${API_URL}/events/nearby`, {
              params: { latitude, longitude, radius }
            });
            resolve(response.data.events);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error('Failed to get user location: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Generate QR code data for location sharing
   * @param {object} event 
   * @returns {Promise<string>} QR code data URL
   */
  static async generateLocationQR(event) {
    try {
      const shareData = await this.getEventShareLinks(event.id);
      const qrData = shareData.links.geo_protocol;
      
      // You can integrate with a QR code library here
      // For example, using qrcode.js:
      // import QRCode from 'qrcode';
      // const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      
      return qrData; // Return raw data for now
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Show notification to user
   * @param {string} message 
   * @param {string} type - 'success', 'error', 'info'
   */
  static showNotification(message, type = 'info') {
    // Simple implementation - you can replace with your preferred notification system
    if (typeof alert === 'function') {
      alert(message);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  /**
   * Validate if coordinates look reasonable
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {boolean} True if coordinates seem valid
   */
  static validateCoordinates(latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  }

  /**
   * Format coordinates for display
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} precision 
   * @returns {string} Formatted coordinates
   */
  static formatCoordinates(latitude, longitude, precision = 5) {
    try {
      if (!this.validateCoordinates(latitude, longitude)) {
        return 'Invalid coordinates';
      }
      
      const lat = Number(latitude).toFixed(precision);
      const lng = Number(longitude).toFixed(precision);
      return `${lat}, ${lng}`;
    } catch (error) {
      return 'Error formatting coordinates';
    }
  }

  /**
   * Get all available sharing options for an event
   * @param {object} event 
   * @returns {Promise<array>} Array of sharing options
   */
  static async getAvailableSharingOptions(event) {
    try {
      if (!this.validateCoordinates(event.latitude, event.longitude)) {
        return [];
      }

      const shareData = await this.getEventShareLinks(event.id);
      
      return [
        {
          id: 'google_maps',
          name: 'Google Maps',
          icon: '📱',
          url: shareData.links.google_maps,
          action: () => this.openInMapApp(event, 'google')
        },
        {
          id: 'apple_maps',
          name: 'Apple Maps',
          icon: '🍎',
          url: shareData.links.apple_maps,
          action: () => this.openInMapApp(event, 'apple')
        },
        {
          id: 'waze',
          name: 'Waze',
          icon: '🚗',
          url: shareData.links.waze,
          action: () => this.openInMapApp(event, 'waze')
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp',
          icon: '💬',
          url: shareData.links.whatsapp_share,
          action: () => this.shareEventLocation(event, 'whatsapp')
        },
        {
          id: 'copy',
          name: 'Copy Link',
          icon: '📋',
          url: shareData.links.google_maps,
          action: () => this.copyToClipboard(shareData.links.google_maps, 'Location link')
        },
        {
          id: 'native_share',
          name: 'Share',
          icon: '📤',
          url: shareData.links.google_maps,
          action: () => this.shareEventLocation(event, 'native')
        }
      ];
    } catch (error) {
      console.error('Error getting sharing options:', error);
      return [];
    }
  }
}

/**
 * React Hook for location sharing
 * Usage: const { shareLocation, isSharing, error } = useLocationShare();
 */
export const useLocationShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);

  const shareLocation = async (event, method = 'native') => {
    setIsSharing(true);
    setError(null);
    
    try {
      const success = await LocationShareService.shareEventLocation(event, method);
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const clearError = () => setError(null);

  return {
    shareLocation,
    isSharing,
    error,
    clearError
  };
};

/**
 * React component for location sharing dropdown
 */
export const LocationShareDropdown = ({ 
  event, 
  isOpen, 
  onToggle, 
  disabled = false,
  className = '',
  buttonStyle = {},
  dropdownStyle = {} 
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event && LocationShareService.validateCoordinates(event.latitude, event.longitude)) {
      loadSharingOptions();
    }
  }, [isOpen, event]);

  const loadSharingOptions = async () => {
    setLoading(true);
    try {
      const sharingOptions = await LocationShareService.getAvailableSharingOptions(event);
      setOptions(sharingOptions);
    } catch (error) {
      console.error('Error loading sharing options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  if (!LocationShareService.validateCoordinates(event?.latitude, event?.longitude)) {
    return null;
  }

  const defaultButtonStyle = {
    backgroundColor: disabled ? "#9ca3af" : "#10b981",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    ...buttonStyle
  };

  const defaultDropdownStyle = {
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1000,
    minWidth: "150px",
    marginTop: "2px",
    ...dropdownStyle
  };

  return (
    <div className={className} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        disabled={disabled}
        style={defaultButtonStyle}
      >
        📍 Share
        <span style={{ fontSize: "10px" }}>▼</span>
      </button>

      {isOpen && (
        <div style={defaultDropdownStyle}>
          {loading ? (
            <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "#666" }}>
              Loading...
            </div>
          ) : options.length === 0 ? (
            <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "#666" }}>
              No sharing options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  option.action();
                  onToggle();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "white",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "12px",
                  borderBottom: "1px solid #eee"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                onMouseOut={(e) => e.target.style.backgroundColor = "white"}
              >
                {option.icon} {option.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Simple location share button (single action)
 */
export const QuickShareButton = ({ 
  event, 
  method = 'copy', 
  children,
  style = {},
  disabled = false 
}) => {
  const { shareLocation, isSharing } = useLocationShare();

  if (!LocationShareService.validateCoordinates(event?.latitude, event?.longitude)) {
    return null;
  }

  const defaultStyle = {
    backgroundColor: disabled || isSharing ? "#9ca3af" : "#10b981",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: disabled || isSharing ? "not-allowed" : "pointer",
    fontSize: "12px",
    ...style
  };

  return (
    <button
      onClick={() => shareLocation(event, method)}
      disabled={disabled || isSharing}
      style={defaultStyle}
    >
      {isSharing ? '⏳ Sharing...' : (children || '📍 Share Location')}
    </button>
  );
};

/**
 * Location display component with sharing capabilities
 */
export const LocationDisplay = ({ 
  event, 
  showCoordinates = true, 
  showAddress = true,
  showShareButton = true,
  compact = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!LocationShareService.validateCoordinates(event?.latitude, event?.longitude)) {
    return (
      <div style={{ color: "#666", fontSize: "14px", fontStyle: "italic" }}>
        No location coordinates available
      </div>
    );
  }

  const coordinates = LocationShareService.formatCoordinates(event.latitude, event.longitude);

  return (
    <div style={{ display: "flex", flexDirection: compact ? "row" : "column", gap: "8px", alignItems: compact ? "center" : "flex-start" }}>
      <div>
        {showAddress && event.location && (
          <div style={{ fontSize: "14px", fontWeight: "500" }}>
            📍 {event.location}
          </div>
        )}
        {showCoordinates && (
          <div style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}>
            {coordinates}
          </div>
        )}
      </div>
      
      {showShareButton && (
        <LocationShareDropdown
          event={event}
          isOpen={isDropdownOpen}
          onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
        />
      )}
    </div>
  );
};

// Export individual functions for direct use
export {
  LocationShareService as default,
  
};