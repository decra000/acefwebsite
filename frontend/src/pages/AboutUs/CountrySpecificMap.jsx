import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, AlertCircle, RotateCcw } from 'lucide-react';

const CountrySpecificMap = ({ countryName, countryData, styles }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [initStatus, setInitStatus] = useState('fetching'); // 'fetching', 'loading-leaflet', 'initializing', 'ready', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const addDebugLog = useCallback((message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data);
    setDebugInfo(prev => [...prev.slice(-9), { message: logEntry, data }]);
  }, []);

  const fetchLocationData = useCallback(async () => {
    if (!countryName) {
      setInitStatus('error');
      setErrorMessage('No country name provided');
      return;
    }

    setInitStatus('fetching');
    addDebugLog('Starting data fetch for', countryName);
    
    try {
      const contactsRes = await fetch(`${API_BASE}/country-contacts`);
      
      if (!contactsRes.ok) {
        throw new Error(`Failed to fetch contacts: ${contactsRes.status}`);
      }

      const contacts = await contactsRes.json();
      const contactsArray = Array.isArray(contacts) ? contacts : contacts.data || [];
      const countryContact = contactsArray.find(contact => contact.country === countryName);

      let lat, lng, source;

      if (countryContact && countryContact.latitude && countryContact.longitude) {
        lat = parseFloat(countryContact.latitude);
        lng = parseFloat(countryContact.longitude);
        source = 'database';
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error(`Invalid coordinates for ${countryName}: ${lat}, ${lng}`);
        }
      } else {
        // Fallback coordinates
        const fallbackCoords = {
          'Angola': [-11.2027, 17.8739],
          'Kenya': [-0.0236, 37.9062],
          'Nigeria': [9.0820, 8.6753],
          'Ghana': [7.9465, -1.0232],
          'South Africa': [-30.5595, 22.9375]
        };

        const fallback = fallbackCoords[countryName];
        if (!fallback) {
          throw new Error(`No coordinates available for ${countryName}`);
        }

        [lat, lng] = fallback;
        source = 'fallback';
      }

      setLocationData({ lat, lng, source, contact: countryContact });
      addDebugLog('Location data set successfully', { lat, lng, source });

    } catch (error) {
      addDebugLog('Error in fetchLocationData:', error.message);
      setErrorMessage(error.message);
      setInitStatus('error');
    }
  }, [countryName, API_BASE, addDebugLog]);

  // Load Leaflet
  useEffect(() => {
    if (!locationData) return;

    const loadLeaflet = async () => {
      setInitStatus('loading-leaflet');
      addDebugLog('Loading Leaflet...');
      
      try {
        if (window.L) {
          setLeafletReady(true);
          return;
        }

        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const leafletCSS = document.createElement('link');
          leafletCSS.rel = 'stylesheet';
          leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          leafletCSS.crossOrigin = '';
          document.head.appendChild(leafletCSS);
        }

        // Load JS
        if (!document.querySelector('script[src*="leaflet.js"]')) {
          const leafletJS = document.createElement('script');
          leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          leafletJS.crossOrigin = '';
          leafletJS.onload = () => {
            setTimeout(() => {
              if (window.L && typeof window.L.map === 'function') {
                addDebugLog('Leaflet loaded successfully');
                setLeafletReady(true);
              } else {
                throw new Error('Leaflet failed to initialize');
              }
            }, 200);
          };
          leafletJS.onerror = () => {
            throw new Error('Failed to load Leaflet JS');
          };
          document.head.appendChild(leafletJS);
        }

      } catch (err) {
        addDebugLog(`Leaflet loading error: ${err.message}`);
        setInitStatus('error');
        setErrorMessage(`Failed to load map: ${err.message}`);
      }
    };

    loadLeaflet();
  }, [locationData, addDebugLog]);

  // Initialize map
  useEffect(() => {
    if (!leafletReady || !locationData || !mapRef.current) {
      return;
    }

    setInitStatus('initializing');
    addDebugLog('Starting map initialization...');

    const initializeMap = () => {
      try {
        const L = window.L;
        const { lat, lng, source, contact } = locationData;
        const container = mapRef.current;

        // Clean up existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        addDebugLog(`Initializing map with container:`, container);
        addDebugLog(`Container dimensions: ${container.offsetWidth}x${container.offsetHeight}`);

        // Ensure container has dimensions
        if (!container.offsetHeight || !container.offsetWidth) {
          container.style.height = '500px';
          container.style.width = '100%';
        }

        // Create map
        const map = L.map(container, {
          center: [lat, lng],
          zoom: source === 'database' ? 10 : 6,
          zoomControl: true,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false
        });

        // Add interaction
        let mapActive = false;
        const activateMap = () => {
          if (!mapActive) {
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.touchZoom.enable();
            mapActive = true;
            
            const indicator = document.createElement('div');
            indicator.innerHTML = 'Map activated - scroll to zoom';
            indicator.style.cssText = `
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(16, 163, 74, 0.9);
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              z-index: 1000;
              pointer-events: none;
            `;
            container.appendChild(indicator);
            
            setTimeout(() => {
              if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
              }
            }, 1500);
          }
        };

        map.on('click', activateMap);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add marker
        const iconHtml = source === 'database' ? 
          '<div style="background: #16a34a; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">🏢</div>' :
          '<div style="background: #dc2626; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">📍</div>';

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        
        // Create popup
        let popupContent = `<div style="font-family: 'Nunito Sans', sans-serif; min-width: 200px;">`;
        popupContent += `<h4 style="margin: 0 0 8px 0; color: #0f172a;">${countryName}</h4>`;
        
        if (source === 'database') {
          popupContent += `<p style="margin: 4px 0; color: #64748b;"><strong>Office Location</strong></p>`;
          if (contact?.email) popupContent += `<p style="margin: 2px 0;"><strong>Email:</strong> ${contact.email}</p>`;
          if (contact?.phone) popupContent += `<p style="margin: 2px 0;"><strong>Phone:</strong> ${contact.phone}</p>`;
        } else {
          popupContent += `<p style="margin: 4px 0; color: #64748b;">Our operations in ${countryName}</p>`;
          popupContent += `<p style="margin: 4px 0; font-size: 12px; color: #f59e0b;"><em>Approximate location</em></p>`;
        }
        
        popupContent += `<p style="margin: 4px 0; font-size: 12px; color: #9ca3af;">Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>`;
        popupContent += `</div>`;
        
        marker.bindPopup(popupContent);

        mapInstanceRef.current = map;
        setInitStatus('ready');
        addDebugLog('Map initialization completed successfully');

        // Force re-render to ensure overlay is removed
        setTimeout(() => {
          if (initStatus !== 'ready') {
            setInitStatus('ready');
          }
        }, 100);

      } catch (error) {
        addDebugLog('Map initialization failed:', error.message);
        setErrorMessage(error.message);
        setInitStatus('error');
      }
    };

    // Small delay to ensure container is fully rendered
    setTimeout(initializeMap, 100);
  }, [leafletReady, locationData, countryName, addDebugLog]);

  // Fetch data on mount
  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log('Map cleanup error (ignored):', e);
        }
      }
    };
  }, []);

  const getStatusMessage = () => {
    switch (initStatus) {
      case 'fetching': return 'Fetching location data...';
      case 'loading-leaflet': return 'Loading map library...';
      case 'initializing': return 'Initializing map...';
      case 'ready': return 'Map ready';
      default: return 'Loading...';
    }
  };

  if (initStatus === 'error') {
    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <MapPin style={styles.sectionIcon} />
          <div>
            <h2 style={styles.sectionTitle}>Location Map</h2>
            <p style={styles.sectionSubtitle}>
              Unable to load map for {countryName}.
            </p>
          </div>
        </div>
        
        <div style={{
          height: '400px',
          borderRadius: '12px',
          backgroundColor: '#fef2f2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #fecaca',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
          <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Map Error</h3>
          <p style={{ color: '#991b1b', marginBottom: '1.5rem' }}>{errorMessage}</p>
          <button
            onClick={fetchLocationData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <MapPin style={styles.sectionIcon} />
        <div>
          <h2 style={styles.sectionTitle}>Location Map</h2>
          <p style={styles.sectionSubtitle}>
            {locationData?.source === 'database' 
              ? `Our office location in ${countryName}. Click the map to enable zooming.`
              : `Our operations in ${countryName}. Click the map to enable zooming.`
            }
          </p>
        </div>
      </div>
      
      <div style={{
        height: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        position: 'relative',
        backgroundColor: initStatus === 'ready' ? 'transparent' : '#f8fafc'
      }}>
        {/* Map container - always present */}
        <div 
          ref={mapRef} 
          id="map-container"
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'relative'
          }}
        />

        {/* Loading overlay */}
        {(initStatus !== 'ready' && initStatus !== 'error') && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(248, 250, 252, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #16a34a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <p style={{ color: '#64748b', fontFamily: '"Nunito Sans", sans-serif' }}>
              {getStatusMessage()}
            </p>
          </div>
        )}

        {/* UI overlays - only show when ready */}
        {initStatus === 'ready' && (
          <>
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 1000,
              backgroundColor: 'rgba(16, 163, 74, 0.9)',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: '12px',
              pointerEvents: 'none'
            }}>
              Click map to enable scroll zoom
            </div>

            {locationData && (
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '11px',
                border: '1px solid #e2e8f0'
              }}>
                {locationData.source === 'database' ? (
                  <span style={{ color: '#16a34a' }}>🏢 Exact office location</span>
                ) : (
                  <span style={{ color: '#f59e0b' }}>📍 Approximate location</span>
                )}
              </div>
            )}
          </>
        )}

        {/* Debug info */}
        <details style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 1001,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '0.5rem',
          borderRadius: '6px',
          fontSize: '10px',
          fontFamily: 'monospace',
          border: '1px solid #e2e8f0',
          maxWidth: '300px'
        }}>
          <summary style={{ cursor: 'pointer' }}>Debug ({initStatus})</summary>
          <div style={{ marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
            <div style={{ color: '#16a34a', margin: '2px 0' }}>
              mapRef exists: {mapRef.current ? 'YES' : 'NO'}
            </div>
            <div style={{ color: '#16a34a', margin: '2px 0' }}>
              Status: {initStatus}
            </div>
            {debugInfo.slice(-3).map((log, index) => (
              <div key={index} style={{ color: '#6b7280', margin: '2px 0' }}>
                {log.message}
              </div>
            ))}
          </div>
        </details>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .leaflet-container {
            height: 100% !important;
            width: 100% !important;
          }
          .custom-div-icon {
            background: transparent !important;
            border: none !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CountrySpecificMap;