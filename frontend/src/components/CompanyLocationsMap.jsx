import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme, withOpacity } from '../theme';
import { API_URL } from '../config';

const API_BASE = API_URL;

const CompanyLocationsMap = () => {
  const { theme, colors } = useTheme();
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);
  const [leafletReady, setLeafletReady] = useState(false);

  const addDebugLog = useCallback((message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data);
    setDebugInfo(prev => [...prev.slice(-9), { message: logEntry, data }]);
  }, []);

  const fetchLocationData = useCallback(async () => {
    addDebugLog('Starting data fetch...');
    setLoading(true);
    setError('');
    
    try {
      addDebugLog('Fetching contacts...');
      const contactsRes = await fetch(`${API_BASE}/country-contacts`);
      addDebugLog(`Contacts response status: ${contactsRes.status}`);
      
      if (!contactsRes.ok) {
        throw new Error(`Contacts fetch failed: ${contactsRes.status}`);
      }

      const contacts = await contactsRes.json();
      addDebugLog('Raw contacts data received:', contacts);

      if (!Array.isArray(contacts)) {
        throw new Error('Contacts data is not an array');
      }

      addDebugLog(`Found ${contacts.length} contacts`);

      const locationsWithCoords = contacts.filter(contact => {
        const hasLat = contact.latitude !== null && contact.latitude !== undefined && contact.latitude !== '';
        const hasLng = contact.longitude !== null && contact.longitude !== undefined && contact.longitude !== '';
        return hasLat && hasLng;
      });

      addDebugLog(`Contacts with coordinates: ${locationsWithCoords.length}`);

      const processedLocations = locationsWithCoords.map(contact => {
        const lat = parseFloat(contact.latitude);
        const lng = parseFloat(contact.longitude);
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          addDebugLog(`Invalid coordinates for ${contact.country}: ${lat}, ${lng}`);
          return null;
        }

        addDebugLog(`Valid coordinates for ${contact.country}: ${lat}, ${lng}`);
        
        return {
          id: contact.id || contact.country,
          name: contact.country,
          lat,
          lng,
          contact,
          source: 'database'
        };
      }).filter(Boolean);

      addDebugLog(`Final processed locations: ${processedLocations.length}`, processedLocations);
      
      setLocations(processedLocations);

    } catch (err) {
      addDebugLog(`Error in fetchLocationData: ${err.message}`);
      console.error('Fetch error:', err);
      setError(`Failed to load location data: ${err.message}`);
    } finally {
      setLoading(false);
      addDebugLog('Data fetch completed');
    }
  }, [addDebugLog]);

  useEffect(() => {
    addDebugLog('Component mounted, fetching data...');
    fetchLocationData();
  }, [fetchLocationData]);

  useEffect(() => {
    if (loading || locations.length === 0) {
      addDebugLog(`Skipping Leaflet load - loading: ${loading}, locations: ${locations.length}`);
      return;
    }

    const loadLeaflet = async () => {
      addDebugLog('Loading Leaflet...');
      
      try {
        if (window.L) {
          addDebugLog('Leaflet already loaded');
          setLeafletReady(true);
          return;
        }

        addDebugLog('Loading Leaflet CSS...');
        const cssPromise = new Promise((resolve, reject) => {
          const leafletCSS = document.createElement('link');
          leafletCSS.rel = 'stylesheet';
          leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          leafletCSS.crossOrigin = '';
          leafletCSS.onload = () => {
            addDebugLog('Leaflet CSS loaded');
            resolve();
          };
          leafletCSS.onerror = () => {
            addDebugLog('Leaflet CSS failed to load');
            reject(new Error('Failed to load Leaflet CSS'));
          };
          document.head.appendChild(leafletCSS);
        });

        await cssPromise;

        addDebugLog('Loading Leaflet JS...');
        const jsPromise = new Promise((resolve, reject) => {
          const leafletJS = document.createElement('script');
          leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          leafletJS.crossOrigin = '';
          leafletJS.onload = () => {
            addDebugLog('Leaflet JS loaded');
            resolve();
          };
          leafletJS.onerror = () => {
            addDebugLog('Leaflet JS failed to load');
            reject(new Error('Failed to load Leaflet JS'));
          };
          document.head.appendChild(leafletJS);
        });

        await jsPromise;

        setTimeout(() => {
          if (window.L && typeof window.L.map === 'function') {
            addDebugLog('Leaflet ready and verified');
            setLeafletReady(true);
          } else {
            addDebugLog('Leaflet failed to initialize properly');
            setError('Map library failed to initialize');
          }
        }, 500);

      } catch (err) {
        addDebugLog(`Leaflet loading error: ${err.message}`);
        setError(`Failed to load map: ${err.message}`);
      }
    };

    loadLeaflet();
  }, [loading, locations.length, addDebugLog]);

  useEffect(() => {
    if (!leafletReady || !window.L || !mapRef.current || locations.length === 0) {
      addDebugLog(`Skipping map init - leafletReady: ${leafletReady}, hasL: ${!!window.L}, hasMapRef: ${!!mapRef.current}, locations: ${locations.length}`);
      return;
    }

    addDebugLog('Initializing map...');

    try {
      const L = window.L;
      
      if (mapInstanceRef.current) {
        addDebugLog('Cleaning up existing map');
        mapInstanceRef.current.remove();
      }
      
      addDebugLog('Creating map instance');
      const map = L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true, // Enable for mobile
        tap: true // Enable tap for mobile
      });

      let mapActive = false;
      
      const activateMap = () => {
        if (!mapActive) {
          map.scrollWheelZoom.enable();
          map.doubleClickZoom.enable();
          mapActive = true;
          
          const indicator = document.createElement('div');
          indicator.innerHTML = 'Map activated';
          indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
          `;
          mapRef.current.appendChild(indicator);
          
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }, 1500);
        }
      };

      const deactivateMap = () => {
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        mapActive = false;
      };

      map.on('focus', activateMap);
      map.on('click', activateMap);
      
      document.addEventListener('click', (e) => {
        if (!mapRef.current?.contains(e.target)) {
          deactivateMap();
        }
      });

      mapRef.current.tabIndex = 0;
      mapRef.current.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateMap();
        }
      });

      addDebugLog('Adding tile layer');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
      }).addTo(map);

      markersRef.current.forEach(marker => {
        try {
          map.removeLayer(marker);
        } catch (e) {
          // Ignore
        }
      });
      markersRef.current = [];

      addDebugLog(`Adding ${locations.length} markers...`);

      locations.forEach((location, index) => {
        addDebugLog(`Adding marker ${index + 1}: ${location.name}`);
        
        try {
          const marker = L.marker([location.lat, location.lng]).addTo(map);
          
          const popupContent = `
            <div style="font-size: 14px; line-height: 1.4;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px;">${location.name}</h3>
              <p style="margin: 4px 0;">Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
              ${location.contact?.email ? `<p style="margin: 4px 0;">Email: ${location.contact.email}</p>` : ''}
              ${location.contact?.phone ? `<p style="margin: 4px 0;">Phone: ${location.contact.phone}</p>` : ''}
            </div>
          `;
          
          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
          
          addDebugLog(`Marker ${index + 1} added successfully`);
        } catch (err) {
          addDebugLog(`Error adding marker ${index + 1}: ${err.message}`);
        }
      });

      if (markersRef.current.length > 0) {
        addDebugLog('Fitting map bounds');
        try {
          const group = new L.featureGroup(markersRef.current);
          map.fitBounds(group.getBounds().pad(0.1));
        } catch (err) {
          addDebugLog(`Error fitting bounds: ${err.message}`);
          map.setView([20, 0], 2);
        }
      } else {
        addDebugLog('No markers, using default view');
        map.setView([20, 0], 2);
      }

      mapInstanceRef.current = map;
      setError('');
      addDebugLog('Map initialization completed');

    } catch (err) {
      addDebugLog(`Map initialization error: ${err.message}`);
      setError(`Map initialization failed: ${err.message}`);
    }
  }, [leafletReady, locations, addDebugLog]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    height: '80vh',
    minHeight: '400px',
    margin: '0',
    padding: '0',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0',
    overflow: 'hidden',
    boxShadow: `0 8px 32px ${withOpacity(colors.black, 0.1)}`,
    border: 'none',
    boxSizing: 'border-box'
  };

  const mobileContainerStyle = {
    ...containerStyle,
    height: '60vh',
    minHeight: '300px',
    borderRadius: '0',
    margin: '0',
    padding: '0'
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const finalContainerStyle = isMobile ? mobileContainerStyle : containerStyle;

  if (loading) {
    return (
      <div style={{
        ...finalContainerStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.border}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', fontSize: '14px' }}>Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...finalContainerStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <h3 style={{ color: colors.error, marginBottom: '1rem', fontSize: '18px' }}>Map Error</h3>
        <p style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '14px', padding: '0 1rem' }}>{error}</p>
        
        <button 
          onClick={fetchLocationData}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={finalContainerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 0;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .leaflet-control-zoom {
            margin: 8px !important;
          }
          .leaflet-control-zoom a {
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 20px !important;
          }
          .leaflet-popup-content-wrapper {
            font-size: 12px !important;
          }
          .leaflet-popup-content {
            margin: 8px !important;
          }
        }
      `}</style>

      {/* Mobile hint */}
      <div style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        zIndex: 1000,
        backgroundColor: withOpacity(colors.primary, 0.9),
        color: colors.white,
        padding: '0.4rem 0.6rem',
        borderRadius: '4px',
        fontSize: isMobile ? '10px' : '11px',
        pointerEvents: 'none'
      }}>
        {isMobile ? 'Tap to explore' : 'Click to enable zoom'}
      </div>

      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default CompanyLocationsMap;