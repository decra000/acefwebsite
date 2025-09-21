import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import CountrySpecificMap from './CountrySpecificMap';

const MapContainerWrapper = ({ countryName, countryData, styles }) => {
  const [containerReady, setContainerReady] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Simplified container check
    const checkContainer = () => {
      if (wrapperRef.current) {
        // Force dimensions immediately
        wrapperRef.current.style.minHeight = '600px';
        wrapperRef.current.style.width = '100%';
        
        // Wait a bit then mark as ready
        setTimeout(() => {
          console.log('MapContainerWrapper: Container marked as ready');
          setContainerReady(true);
        }, 100);
      }
    };

    // Start check immediately
    checkContainer();
  }, []);

  console.log('MapContainerWrapper render:', { containerReady, countryName });

  return (
    <div 
      ref={wrapperRef}
      style={{
        width: '100%',
        minHeight: '600px',
        position: 'relative'
      }}
    >
      {containerReady ? (
        <>
          <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#16a34a' }}>
            ✅ Container ready, initializing map...
          </div>
          <CountrySpecificMap 
            countryName={countryName}
            countryData={countryData}
            styles={styles}
          />
        </>
      ) : (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <MapPin style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Location Map</h2>
              <p style={styles.sectionSubtitle}>
                Preparing map for {countryName}...
              </p>
            </div>
          </div>
          
          <div style={{
            height: '500px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #16a34a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ 
              color: '#64748b', 
              fontFamily: '"Nunito Sans", sans-serif',
              marginTop: '1rem'
            }}>
              Preparing map container...
            </p>
            
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainerWrapper;