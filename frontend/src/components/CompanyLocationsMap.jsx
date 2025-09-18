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

  // Debug logging function
  const addDebugLog = useCallback((message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data);
    setDebugInfo(prev => [...prev.slice(-9), { message: logEntry, data }]);
  }, []);

  // Simplified data fetching with extensive logging
  const fetchLocationData = useCallback(async () => {
    addDebugLog('Starting data fetch...');
    setLoading(true);
    setError('');
    
    try {
      // Fetch contacts first
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

      // Process contacts and extract those with coordinates
      const locationsWithCoords = contacts.filter(contact => {
        const hasLat = contact.latitude !== null && contact.latitude !== undefined && contact.latitude !== '';
        const hasLng = contact.longitude !== null && contact.longitude !== undefined && contact.longitude !== '';
        return hasLat && hasLng;
      });

      addDebugLog(`Contacts with coordinates: ${locationsWithCoords.length}`);

      // Convert to location objects
      const processedLocations = locationsWithCoords.map(contact => {
        const lat = parseFloat(contact.latitude);
        const lng = parseFloat(contact.longitude);
        
        // Validate coordinates
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

  // Load data on mount
  useEffect(() => {
    addDebugLog('Component mounted, fetching data...');
    fetchLocationData();
  }, [fetchLocationData]);

  // Load Leaflet with better error handling
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

        // Load CSS
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

        // Load JS
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

        // Wait and verify Leaflet
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

  // Initialize map
  useEffect(() => {
    if (!leafletReady || !window.L || !mapRef.current || locations.length === 0) {
      addDebugLog(`Skipping map init - leafletReady: ${leafletReady}, hasL: ${!!window.L}, hasMapRef: ${!!mapRef.current}, locations: ${locations.length}`);
      return;
    }

    addDebugLog('Initializing map...');

    try {
      const L = window.L;
      
      // Clean up existing map
      if (mapInstanceRef.current) {
        addDebugLog('Cleaning up existing map');
        mapInstanceRef.current.remove();
      }
      
      // Create map with scroll-through behavior
      addDebugLog('Creating map instance');
      const map = L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false, // Disable by default
        doubleClickZoom: false, // Disable by default
        touchZoom: false // Disable by default for mobile
      });

      // Add scroll-through functionality
      let mapActive = false;
      
      const activateMap = () => {
        if (!mapActive) {
          map.scrollWheelZoom.enable();
          map.doubleClickZoom.enable();
          map.touchZoom.enable();
          mapActive = true;
          
          // Show activation indicator
          const indicator = document.createElement('div');
          indicator.innerHTML = 'Map activated - scroll to zoom';
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
        map.touchZoom.disable();
        mapActive = false;
      };

      // Activate on click/focus
      map.on('focus', activateMap);
      map.on('click', activateMap);
      
      // Deactivate when clicking outside
      document.addEventListener('click', (e) => {
        if (!mapRef.current?.contains(e.target)) {
          deactivateMap();
        }
      });

      // Keyboard activation
      mapRef.current.tabIndex = 0; // Make focusable
      mapRef.current.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateMap();
        }
      });

      // Add tile layer
      addDebugLog('Adding tile layer');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          map.removeLayer(marker);
        } catch (e) {
          // Ignore errors
        }
      });
      markersRef.current = [];

      addDebugLog(`Adding ${locations.length} markers...`);

      // Add markers
      locations.forEach((location, index) => {
        addDebugLog(`Adding marker ${index + 1}: ${location.name} at ${location.lat}, ${location.lng}`);
        
        try {
          const marker = L.marker([location.lat, location.lng]).addTo(map);
          
          const popupContent = `
            <div>
              <h3>${location.name}</h3>
              <p>Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
              <p>Source: ${location.source}</p>
              ${location.contact?.email ? `<p>Email: ${location.contact.email}</p>` : ''}
              ${location.contact?.phone ? `<p>Phone: ${location.contact.phone}</p>` : ''}
            </div>
          `;
          
          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
          
          addDebugLog(`Marker ${index + 1} added successfully`);
        } catch (err) {
          addDebugLog(`Error adding marker ${index + 1}: ${err.message}`);
        }
      });

      // Fit bounds if we have markers
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
        addDebugLog('No markers to fit, using default view');
        map.setView([20, 0], 2);
      }

      mapInstanceRef.current = map;
      setError('');
      addDebugLog('Map initialization completed successfully');

    } catch (err) {
      addDebugLog(`Map initialization error: ${err.message}`);
      setError(`Map initialization failed: ${err.message}`);
    }
  }, [leafletReady, locations, addDebugLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        margin: '2rem',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        padding: '2rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${colors.border}`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem' }}>Loading location data...</p>
        
        {/* Debug information */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '8px',
          width: '100%',
          maxWidth: '600px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <h4>Debug Log:</h4>
          {debugInfo.slice(-5).map((log, index) => (
            <div key={index} style={{ margin: '4px 0', color: colors.textSecondary }}>
              {log.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        margin: '2rem',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: '12px',
        border: `1px solid ${colors.error}`,
        padding: '2rem'
      }}>
        <h3 style={{ color: colors.error, marginBottom: '1rem' }}>Map Error</h3>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>
        
        <button 
          onClick={fetchLocationData}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '2rem'
          }}
        >
          Retry
        </button>

        {/* Full debug log */}
        <div style={{
          padding: '1rem',
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '8px',
          width: '100%',
          maxWidth: '800px',
          fontSize: '12px',
          fontFamily: 'monospace',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h4>Full Debug Log:</h4>
          {debugInfo.map((log, index) => (
            <div key={index} style={{ margin: '4px 0', color: colors.textSecondary }}>
              {log.message}
              {log.data && (
                <pre style={{ margin: '4px 0 8px 16px', fontSize: '11px' }}>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: 'calc(100% - 4rem)',
      height: '80vh',
      margin: '2rem',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: `0 8px 32px ${withOpacity(colors.black, 0.1)}`,
      border: `1px solid ${colors.border}`
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 12px;
        }
      `}</style>

      {/* Status overlay */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 1000,
        backgroundColor: withOpacity(colors.background, 0.9),
        padding: '0.75rem',
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        fontSize: '12px'
      }}>
        <div>Locations: {locations.length}</div>
        <div>Leaflet Ready: {leafletReady ? 'Yes' : 'No'}</div>
      </div>

      {/* Map interaction hint */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        backgroundColor: withOpacity(colors.primary, 0.9),
        color: colors.white,
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        fontSize: '11px',
        pointerEvents: 'none'
      }}>
        Click map to enable scroll zoom
      </div>

      {/* Debug panel (toggle-able) */}
      <details style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        zIndex: 1000,
        backgroundColor: withOpacity(colors.background, 0.95),
        padding: '0.5rem',
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        fontSize: '11px',
        fontFamily: 'monospace',
        maxWidth: '400px'
      }}>
        <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Debug Info</summary>
        {debugInfo.slice(-10).map((log, index) => (
          <div key={index} style={{ margin: '2px 0', color: colors.textSecondary }}>
            {log.message}
          </div>
        ))}
      </details>

      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default CompanyLocationsMap;