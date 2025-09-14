import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme, withOpacity } from '../theme';
import { API_URL } from '../config';
import { ImportantDevices } from '@mui/icons-material';

const API_BASE = API_URL;

const CompanyLocationsMap = () => {
  const { theme, colors } = useTheme();
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [countries, setCountries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);

  // 🆓 FREE Nominatim Geocoding (OpenStreetMap)
  const geocodeAddress = async (address, countryCode = '') => {
    try {
      const query = countryCode ? `${address}, ${countryCode}` : address;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'YourCompanyName/1.0' // Required by Nominatim
        }
      });
      
      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
          address: data[0].address
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Geocoding failed for ${address}:`, error);
      return null;
    }
  };

  // Build address string from contact details
  const buildAddressFromContact = (contact) => {
    const addressParts = [];
    
    // Use physical address if available, otherwise construct from parts
    if (contact.physical_address && contact.physical_address.trim()) {
      addressParts.push(contact.physical_address.trim());
    } else {
      // Build address from individual components
      if (contact.city) addressParts.push(contact.city.trim());
      if (contact.state_province) addressParts.push(contact.state_province.trim());
      if (contact.postal_code) addressParts.push(contact.postal_code.trim());
    }
    
    // Always add country name
    if (contact.country) addressParts.push(contact.country);
    
    return addressParts.join(', ');
  };

  // Fallback addresses for countries without detailed contact info
  const fallbackAddresses = {
    'Kenya': 'Nairobi, Kenya',
    'United States': 'New York, NY, USA',
    'United Kingdom': 'London, UK',
    'Germany': 'Berlin, Germany',
    'France': 'Paris, France',
    'Japan': 'Tokyo, Japan',
    'China': 'Beijing, China',
    'India': 'New Delhi, India',
    'Australia': 'Sydney, Australia',
    'Brazil': 'Rio de Janeiro, Brazil',
    'South Africa': 'Cape Town, South Africa',
    'Nigeria': 'Lagos, Nigeria',
    'Egypt': 'Cairo, Egypt',
    'Morocco': 'Marrakech, Morocco',
    'Ghana': 'Accra, Ghana',
    'Tanzania': 'Dar es Salaam, Tanzania',
    'Uganda': 'Kampala, Uganda',
    'Rwanda': 'Kigali, Rwanda',
    'Ethiopia': 'Addis Ababa, Ethiopia'
  };

  // Fetch data functions
  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/countries`);
      if (!res.ok) throw new Error(`Failed to fetch countries: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      setCountries(data);
    } catch (err) {
      console.error('❌ Fetch countries error:', err);
      setError(`Failed to load countries: ${err.message}`);
      setCountries([]);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/country-contacts`);
      if (!res.ok) throw new Error(`Failed to fetch contacts: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      setContacts(data);
    } catch (err) {
      console.error('❌ Fetch contacts error:', err);
      setContacts([]);
    }
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCountries(), fetchContacts()]);
      } catch (err) {
        setError('Failed to load location data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchCountries, fetchContacts]);

  // 🚀 Get exact locations using contact details + FREE geocoding
  const getLocationsWithCoordinates = useCallback(async () => {
    const locations = [];
    
    for (const country of countries) {
      const contact = contacts.find(c => c.country === country.name);
      let addressToGeocode = '';
      
      if (contact) {
        // Build address from contact details
        addressToGeocode = buildAddressFromContact(contact);
        console.log(`📍 Using contact address for ${country.name}: ${addressToGeocode}`);
      } else {
        // Use fallback address
        addressToGeocode = fallbackAddresses[country.name] || `${country.name}`;
        console.log(`🔄 Using fallback address for ${country.name}: ${addressToGeocode}`);
      }
      
      // Try to geocode the address
      const geocoded = await geocodeAddress(addressToGeocode);
      
      if (geocoded) {
        locations.push({
          id: country.id,
          name: country.name,
          lat: geocoded.lat,
          lng: geocoded.lng,
          address: contact ? buildAddressFromContact(contact) : geocoded.displayName,
          contact: contact || null,
          isGeocoded: true,
          hasDetailedAddress: !!contact
        });
        console.log(`✅ Successfully geocoded ${country.name}`);
      } else {
        console.warn(`❌ Failed to geocode ${country.name} with address: ${addressToGeocode}`);
      }
      
      // Small delay to be respectful to free service
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`📊 Successfully geocoded ${locations.length} out of ${countries.length} countries`);
    return locations;
  }, [countries, contacts]);

  // Load Leaflet (FREE)
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if (window.L && leafletReady) return;

        const existingCSS = document.querySelectorAll('link[href*="leaflet"]');
        const existingJS = document.querySelectorAll('script[src*="leaflet"]');
        
        existingCSS.forEach(link => link.remove());
        existingJS.forEach(script => script.remove());

        // Load CSS
        const cssPromise = new Promise((resolve, reject) => {
          const leafletCSS = document.createElement('link');
          leafletCSS.rel = 'stylesheet';
          leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          leafletCSS.onload = resolve;
          leafletCSS.onerror = reject;
          document.head.appendChild(leafletCSS);
        });

        await cssPromise;

        // Load JS
        const jsPromise = new Promise((resolve, reject) => {
          const leafletJS = document.createElement('script');
          leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          leafletJS.onload = resolve;
          leafletJS.onerror = reject;
          document.head.appendChild(leafletJS);
        });

        await jsPromise;

        setTimeout(() => {
          if (window.L) {
            setLeafletReady(true);
          } else {
            throw new Error('Leaflet failed to initialize');
          }
        }, 200);

      } catch (err) {
        console.error('Error loading Leaflet:', err);
        setError('Failed to load map library');
      }
    };

    if (!loading && countries.length > 0) {
      loadLeaflet();
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (err) {
          console.error('Error cleaning up map:', err);
        }
      }
      setMapReady(false);
    };
  }, [loading, countries.length]);

  // Initialize map with geocoded locations
  useEffect(() => {
    if (!leafletReady || !window.L || !mapRef.current || mapReady) return;

    const initializeMap = async () => {
      try {
        const L = window.L;
        
        // Get exact locations using contact details + FREE geocoding
        const locations = await getLocationsWithCoordinates();
        
        if (locations.length === 0) {
          setError('No locations could be geocoded. Please check your contact addresses.');
          return;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
          center: [20, 0], // World center
          zoom: 2,
          zoomControl: true,
          scrollWheelZoom: true
        });

        // 🆓 FREE tile layers
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Custom marker icons
        const createCustomIcon = (location) => {
          const hasContact = location.contact !== null;
          const hasDetailedAddress = location.hasDetailedAddress;
          
          let color, emoji;
          if (hasContact && hasDetailedAddress) {
            color = colors.success;
            emoji = '🏢'; // Complete office info
          } else if (hasContact) {
            color = colors.warning;
            emoji = '📧'; // Contact only
          } else {
            color = colors.error;
            emoji = '📍'; // Generic location
          }
          
          return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              width: 28px; 
              height: 28px; 
              background-color: ${color}; 
              border: 4px solid ${colors.white}; 
              border-radius: 50%; 
              box-shadow: 0 3px 12px ${withOpacity(colors.black, 0.4)}; 
              cursor: pointer; 
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              font-weight: bold;
            ">${emoji}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          });
        };

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add markers with enhanced popups
        locations.forEach(location => {
          const marker = L.marker([location.lat, location.lng], { 
            icon: createCustomIcon(location)
          })
          .addTo(map);

          // Create enhanced popup content
          const contact = location.contact;
          const hasDetailedAddress = location.hasDetailedAddress;
          
          let addressInfo = '';
          if (contact && hasDetailedAddress) {
            addressInfo = `
              ${contact.physical_address ? `<p style="margin: 4px 0;"><strong>🏢 Office:</strong> ${contact.physical_address}</p>` : ''}
              ${contact.city ? `<p style="margin: 4px 0;"><strong>🏙️ City:</strong> ${contact.city}</p>` : ''}
              ${contact.state_province ? `<p style="margin: 4px 0;"><strong>📍 State/Province:</strong> ${contact.state_province}</p>` : ''}
              ${contact.postal_code ? `<p style="margin: 4px 0;"><strong>📮 Postal Code:</strong> ${contact.postal_code}</p>` : ''}
              ${contact.mailing_address ? `<p style="margin: 4px 0;"><strong>📬 Mailing:</strong> ${contact.mailing_address}</p>` : ''}
            `;
          } else {
            addressInfo = `<p style="margin: 4px 0; color: ${colors.textSecondary}; font-size: 12px;"><em>${location.address}</em></p>`;
          }
          
          const popupContent = `
            <div style="font-family: Inter, sans-serif; min-width: 250px;">
              <h3 style="margin: 0 0 12px 0; color: ${colors.text}; font-size: 18px; border-bottom: 2px solid ${colors.primary}; padding-bottom: 6px;">${location.name}</h3>
              
              ${addressInfo}
              
              ${contact ? `
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                  <h4 style="margin: 0 0 8px 0; color: ${colors.text}; font-size: 14px;">Contact Information</h4>
                  ${contact.email ? `<p style="margin: 4px 0;"><strong>📧 Email:</strong> <a href="mailto:${contact.email}" style="color: ${colors.primary}; text-decoration: none;">${contact.email}</a></p>` : ''}
                  ${contact.phone ? `<p style="margin: 4px 0;"><strong>📞 Phone:</strong> <a href="tel:${contact.phone}" style="color: ${colors.primary}; text-decoration: none;">${contact.phone}</a></p>` : ''}
                </div>
              ` : `<p style="color: ${colors.textSecondary}; font-style: italic; margin-top: 8px;">Contact information not available</p>`}
              
              <div style="margin-top: 12px; font-size: 12px; color: ${colors.textSecondary};">
                ${hasDetailedAddress ? '✅ Detailed address from contact database' : '📍 Using general country location'}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          
          marker.on('click', () => {
            setSelectedLocation(location);
          });

          markersRef.current.push(marker);
        });

        // Fit map to show all markers
        if (locations.length > 0) {
          const group = new L.featureGroup(markersRef.current);
          map.fitBounds(group.getBounds().pad(0.1));
        }

        mapInstanceRef.current = map;
        setMapReady(true);
        setError('');

        console.log(`🗺️ Map initialized with ${locations.length} locations`);

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
      }
    };

    initializeMap();
  }, [leafletReady, getLocationsWithCoordinates, colors]);

  // Helper functions
  const closeLocationDetails = () => {
    setSelectedLocation(null);
  };

  const zoomToLocation = (location) => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.setView([location.lat, location.lng], 12);
        setSelectedLocation(location);
      } catch (err) {
        console.error('Error zooming to location:', err);
      }
    }
  };

  const getLocationStatus = (location) => {
    if (!location.contact) return { status: 'No Contact Info', icon: '❌' };
    
    const { email, phone, physical_address, city } = location.contact;
    const hasContact = email || phone;
    const hasAddress = physical_address || city;
    
    if (hasContact && hasAddress) return { status: 'Complete Information', icon: '✅' };
    if (hasContact) return { status: 'Contact Available', icon: '📧' };
    if (hasAddress) return { status: 'Address Only', icon: '🏢' };
    return { status: 'Partial Information', icon: '⚠️' };
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 4rem)',
        margin: '2rem',
        fontFamily: 'inherit',
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `5px solid ${colors.border}`,
          borderTop: `5px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>🆓 Loading locations from contact database...</p>
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
        height: 'calc(100vh - 4rem)',
        margin: '2rem',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`
      }}>
        <p>❌ {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!leafletReady) {
    return (
      <div style={{
              alignSelf: 'center', 

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 4rem)',
        margin: '2rem',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `5px solid ${colors.border}`,
          borderTop: `5px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>🆓 Loading map library...</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      alignSelf: 'center', 
      alignContent: 'center',
              justifyContent: 'center',

      alignItems: 'center',
      width: 'calc(80% - 4rem)',
      height: 'calc(80vh - 4rem)',
      margin: '2rem',
      fontFamily: 'Inter, sans-serif',
      background: colors.backgroundSecondary,
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

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 12px;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .leaflet-popup-content {
          margin: 16px 20px;
          line-height: 1.5;
        }
      `}</style>

              <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '16px' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }}></div>
  




      </div>
    </div>
  );
};

export default CompanyLocationsMap;