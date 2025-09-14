// utils/locationUtils.js
// Helper utilities for location-related operations

/**
 * Generate various map service URLs for given coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} locationName 
 * @returns {object} Object containing URLs for different map services
 */
const generateMapUrls = (latitude, longitude, locationName = 'Location') => {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const encodedName = encodeURIComponent(locationName);
  const encodedCoords = encodeURIComponent(`${lat},${lng}`);

  return {
    // Google Maps - most universal
    google_maps: `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=15`,
    google_maps_search: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    google_maps_directions: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    
    // Apple Maps - iOS devices
    apple_maps: `https://maps.apple.com/?q=${encodedName}&ll=${lat},${lng}&z=15`,
    apple_maps_directions: `https://maps.apple.com/?daddr=${lat},${lng}`,
    
    // Waze - navigation focused
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    waze_search: `https://www.waze.com/en/live-map/directions?to=ll.${lat}%2C${lng}`,
    
    // OpenStreetMap - open source
    openstreet_map: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15#map=15/${lat}/${lng}`,
    
    // Generic geo protocol - works on most mobile devices
    geo_protocol: `geo:${lat},${lng}?q=${lat},${lng}(${encodedName})`,
    
    // Embedding
    google_embed: `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`,
    
    // Social sharing
    whatsapp_share: `https://api.whatsapp.com/send?text=Check%20out%20this%20location:%20${encodedName}%20https://www.google.com/maps?q=${lat},${lng}`,
    telegram_share: `https://t.me/share/url?url=https://www.google.com/maps?q=${lat},${lng}&text=Location:%20${encodedName}`,
    
    // For QR codes or direct coordinate sharing
    coordinates_text: `${lat}, ${lng}`,
    plus_code: generatePlusCode(lat, lng) // If you want to implement Plus Codes
  };
};

/**
 * Convert decimal degrees to degrees, minutes, seconds format
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {object} DMS formatted coordinates
 */
const convertToDMS = (latitude, longitude) => {
  const convertCoordinate = (coordinate, isLatitude) => {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
    
    const direction = isLatitude 
      ? (coordinate >= 0 ? 'N' : 'S')
      : (coordinate >= 0 ? 'E' : 'W');
    
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return {
    latitude: convertCoordinate(latitude, true),
    longitude: convertCoordinate(longitude, false),
    combined: `${convertCoordinate(latitude, true)} ${convertCoordinate(longitude, false)}`
  };
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Generate a simple Plus Code (simplified version)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string} Simplified plus code representation
 */
const generatePlusCode = (latitude, longitude) => {
  // This is a simplified version - for production use Google's Open Location Code library
  const lat = Math.round((latitude + 90) * 8000);
  const lng = Math.round((longitude + 180) * 8000);
  return `${lat.toString(36).toUpperCase()}+${lng.toString(36).toUpperCase()}`;
};

/**
 * Validate coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {object} Validation result
 */
const validateCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  
  const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90;
  const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180;
  
  return {
    isValid: isValidLat && isValidLng,
    errors: {
      latitude: !isValidLat ? 'Latitude must be between -90 and 90' : null,
      longitude: !isValidLng ? 'Longitude must be between -180 and 180' : null
    },
    coordinates: isValidLat && isValidLng ? { latitude: lat, longitude: lng } : null
  };
};

/**
 * Get timezone for coordinates (requires external API or database)
 * This is a placeholder - you'd need to integrate with a timezone API
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string} Timezone identifier
 */
const getTimezoneForCoordinates = async (latitude, longitude) => {
  // Placeholder - integrate with timezone API like TimeZoneDB, Google Maps Timezone API, etc.
  // Example: https://api.timezonedb.com/v2.1/get-time-zone?key=YOUR_KEY&format=json&by=position&lat=${latitude}&lng=${longitude}
  return 'UTC'; // Default fallback
};

/**
 * Format location data for different contexts
 * @param {object} event 
 * @returns {object} Formatted location data
 */
const formatLocationData = (event) => {
  if (!event.latitude || !event.longitude) {
    return null;
  }

  const validation = validateCoordinates(event.latitude, event.longitude);
  if (!validation.isValid) {
    return null;
  }

  const { latitude, longitude } = validation.coordinates;
  const locationName = `${event.title}${event.location ? ' - ' + event.location : ''}`;

  return {
    coordinates: {
      decimal: { latitude, longitude },
      dms: convertToDMS(latitude, longitude),
      formatted: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    },
    map_urls: generateMapUrls(latitude, longitude, locationName),
    location_info: {
      name: locationName,
      address: event.location,
      country: event.country,
      event_id: event.id
    }
  };
};

module.exports = {
  generateMapUrls,
  convertToDMS,
  calculateDistance,
  generatePlusCode,
  validateCoordinates,
  getTimezoneForCoordinates,
  formatLocationData
};