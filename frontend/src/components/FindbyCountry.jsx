import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FollowACEF from './FollowAcef';
import CompanyLocationsMap from './CompanyLocationsMap'
import ChatAssistant from './ChatAssistant'

import {
  Typography, Container, Box, Button, CircularProgress
} from '@mui/material';

// Enhanced styling with scroll animations + MOBILE WIDTH FIX
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(30px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .scroll-reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }
  
  .scroll-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .minimal-card {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }
  
  .minimal-card:hover {
    background: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  }
  
  .minimal-input {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }
  
  .minimal-input:focus {
    background: rgba(255, 255, 255, 0.5);
    border-color: rgba(10, 69, 28, 0.3);
    outline: none;
  }
  
  .minimal-button {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }
  
  .minimal-button:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  .minimal-button.active {
    background: rgba(10, 69, 28, 0.9);
    color: white;
    border-color: rgba(10, 69, 28, 0.3);
  }

  /* ============================================ */
  /* CRITICAL MOBILE WIDTH FIX - FORCE FULL WIDTH */
  /* ============================================ */
  * {
    box-sizing: border-box !important;
  }
  
  @media (max-width: 768px) {
    /* Force full width on EVERYTHING */
    body, html, #root, #root > *, #root > * > * {
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
    }
    
    body, html {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Target ALL divs with inline styles containing maxWidth */
    div[style*="maxWidth"] {
      max-width: 100% !important;
      width: 100% !important;
      padding-left: 1rem !important;
      padding-right: 1rem !important;
      box-sizing: border-box !important;
    }
    
    /* Target the specific sections by their style attributes */
    div[style*="padding: '6rem 1rem 2rem'"],
    div[style*="paddingTop: 'max(6rem"] {
      max-width: 100% !important;
      width: 100% !important;
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    
    div[style*="padding: '0 1rem 1rem'"],
    div[style*="padding: '0 1rem 2rem'"] {
      max-width: 100% !important;
      width: 100% !important;
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    
    /* Fix controls grid */
    div[style*="flexDirection: 'row'"][style*="gap: '0.75rem'"] {
      flex-direction: column !important;
      gap: 0.5rem !important;
      width: 100% !important;
    }
    
    /* Ensure all inputs are full width */
    input, .minimal-input {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Fix view toggle */
    div[style*="display: 'flex'"][style*="gap: '0.25rem'"] {
      width: 100% !important;
    }
    
    div[style*="display: 'flex'"][style*="gap: '0.25rem'"] button {
      flex: 1 !important;
    }
    
    /* Make ALL grids single column */
    div[style*="display: 'grid'"],
    div[style*="display: grid"] {
      grid-template-columns: 1fr !important;
      width: 100% !important;
      max-width: 100% !important;
    }
    
    /* Ensure all cards are full width */
    .minimal-card,
    div[class*="minimal-card"] {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Fix ALL h2 titles */
    h2[style*="fontSize"] {
      font-size: clamp(1.5rem, 6vw, 2.5rem) !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    
    /* Fix filter container */
    div[style*="flexWrap: 'wrap'"][style*="justifyContent: 'center'"] {
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
    }
    
    /* Additional class-based targeting */
    .countries-header,
    .countries-controls,
    .countries-content,
    .countries-controls-grid,
    .countries-view-toggle,
    .countries-grid,
    .countries-filters,
    .countries-title {
      max-width: 100% !important;
      width: 100% !important;
    }
  }
  
  /* Extra small screens */
  @media (max-width: 480px) {
    div[style*="maxWidth"] {
      padding-left: 0.75rem !important;
      padding-right: 0.75rem !important;
    }
    
    h2[style*="fontSize"] {
      font-size: clamp(1.25rem, 7vw, 2rem) !important;
    }
    
    .minimal-button {
      font-size: 0.75rem !important;
      padding: 0.625rem 0.75rem !important;
    }
  }
`;

if (!document.head.querySelector('style[data-minimal-countries]')) {
  styleSheet.setAttribute('data-minimal-countries', 'true');
  document.head.appendChild(styleSheet);
}

// Refined color system
const colors = {
  primary: '#0a451c',
  secondary: '#6b7280',
  accent: '#9ccf9f',
  text: '#374151',
  textLight: '#9ca3af',
  success: '#10b981',
  error: '#ef4444',
  border: 'rgba(255, 255, 255, 0.2)',
};

// Country to region mapping
const countryToRegion = {
  'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America', 'Guatemala': 'North America',
  'Costa Rica': 'North America', 'Panama': 'North America', 'Jamaica': 'North America', 'Bahamas': 'North America',
  'Cuba': 'North America', 'Dominican Republic': 'North America', 'Haiti': 'North America', 'Trinidad and Tobago': 'North America',
  'Barbados': 'North America', 'Nicaragua': 'North America', 'Honduras': 'North America', 'Belize': 'North America',
  'El Salvador': 'North America', 'Antigua and Barbuda': 'North America', 'Dominica': 'North America', 'Grenada': 'North America',
  'Saint Kitts and Nevis': 'North America', 'Saint Lucia': 'North America', 'Saint Vincent and the Grenadines': 'North America',
  
  'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America', 'Peru': 'South America',
  'Colombia': 'South America', 'Venezuela': 'South America', 'Ecuador': 'South America', 'Uruguay': 'South America',
  'Paraguay': 'South America', 'Bolivia': 'South America', 'Guyana': 'South America', 'Suriname': 'South America',
  
  'United Kingdom': 'Europe', 'Germany': 'Europe', 'France': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe',
  'Netherlands': 'Europe', 'Belgium': 'Europe', 'Switzerland': 'Europe', 'Austria': 'Europe', 'Sweden': 'Europe',
  'Norway': 'Europe', 'Denmark': 'Europe', 'Finland': 'Europe', 'Poland': 'Europe', 'Czech Republic': 'Europe',
  'Hungary': 'Europe', 'Portugal': 'Europe', 'Greece': 'Europe', 'Ireland': 'Europe', 'Luxembourg': 'Europe',
  'Iceland': 'Europe', 'Malta': 'Europe', 'Cyprus': 'Europe', 'Croatia': 'Europe', 'Slovenia': 'Europe',
  'Slovakia': 'Europe', 'Estonia': 'Europe', 'Latvia': 'Europe', 'Lithuania': 'Europe', 'Romania': 'Europe',
  'Bulgaria': 'Europe', 'Serbia': 'Europe', 'Montenegro': 'Europe', 'Bosnia and Herzegovina': 'Europe',
  'Albania': 'Europe', 'North Macedonia': 'Europe', 'Moldova': 'Europe', 'Ukraine': 'Europe', 'Belarus': 'Europe',
  'Russia': 'Europe', 'Monaco': 'Europe', 'Andorra': 'Europe', 'San Marino': 'Europe', 'Vatican City': 'Europe',
  'Liechtenstein': 'Europe',
  
  'China': 'Asia', 'Japan': 'Asia', 'India': 'Asia', 'South Korea': 'Asia', 'Thailand': 'Asia', 'Singapore': 'Asia',
  'Malaysia': 'Asia', 'Indonesia': 'Asia', 'Philippines': 'Asia', 'Vietnam': 'Asia', 'Cambodia': 'Asia',
  'Laos': 'Asia', 'Myanmar': 'Asia', 'Bangladesh': 'Asia', 'Pakistan': 'Asia', 'Sri Lanka': 'Asia', 'Nepal': 'Asia',
  'Bhutan': 'Asia', 'Mongolia': 'Asia', 'Kazakhstan': 'Asia', 'Uzbekistan': 'Asia', 'Kyrgyzstan': 'Asia',
  'Tajikistan': 'Asia', 'Turkmenistan': 'Asia', 'Afghanistan': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia',
  'Turkey': 'Asia', 'Syria': 'Asia', 'Lebanon': 'Asia', 'Jordan': 'Asia', 'Israel': 'Asia', 'Palestine': 'Asia',
  'Saudi Arabia': 'Asia', 'United Arab Emirates': 'Asia', 'Qatar': 'Asia', 'Kuwait': 'Asia', 'Bahrain': 'Asia',
  'Oman': 'Asia', 'Yemen': 'Asia', 'Georgia': 'Asia', 'Armenia': 'Asia', 'Azerbaijan': 'Asia', 'Maldives': 'Asia',
  'Brunei': 'Asia', 'Timor-Leste': 'Asia', 'North Korea': 'Asia',
  
  'South Africa': 'Africa', 'Nigeria': 'Africa', 'Egypt': 'Africa', 'Kenya': 'Africa', 'Ghana': 'Africa',
  'Ethiopia': 'Africa', 'Morocco': 'Africa', 'Algeria': 'Africa', 'Tunisia': 'Africa', 'Libya': 'Africa',
  'Sudan': 'Africa', 'South Sudan': 'Africa', 'Chad': 'Africa', 'Central African Republic': 'Africa',
  'Cameroon': 'Africa', 'Democratic Republic of the Congo': 'Africa', 'Congo': 'Africa',
  'Gabon': 'Africa', 'Equatorial Guinea': 'Africa', 'Sao Tome and Principe': 'Africa', 'Angola': 'Africa',
  'Zambia': 'Africa', 'Zimbabwe': 'Africa', 'Botswana': 'Africa', 'Namibia': 'Africa', 'Lesotho': 'Africa',
  'Eswatini': 'Africa', 'Mozambique': 'Africa', 'Malawi': 'Africa', 'Tanzania': 'Africa', 'Uganda': 'Africa',
  'Rwanda': 'Africa', 'Burundi': 'Africa', 'Somalia': 'Africa', 'Djibouti': 'Africa', 'Eritrea': 'Africa',
  'Mali': 'Africa', 'Burkina Faso': 'Africa', 'Niger': 'Africa', 'Mauritania': 'Africa', 'Senegal': 'Africa',
  'Gambia': 'Africa', 'Guinea-Bissau': 'Africa', 'Guinea': 'Africa', 'Sierra Leone': 'Africa', 'Liberia': 'Africa',
  'Ivory Coast': 'Africa', 'Togo': 'Africa', 'Benin': 'Africa', 'Cabo Verde': 'Africa', 'Mauritius': 'Africa',
  'Seychelles': 'Africa', 'Comoros': 'Africa', 'Madagascar': 'Africa',
  
  'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Papua New Guinea': 'Oceania', 'Fiji': 'Oceania',
  'Solomon Islands': 'Oceania', 'Vanuatu': 'Oceania', 'Samoa': 'Oceania', 'Tonga': 'Oceania',
  'Kiribati': 'Oceania', 'Tuvalu': 'Oceania', 'Nauru': 'Oceania', 'Palau': 'Oceania', 'Marshall Islands': 'Oceania',
  'Micronesia': 'Oceania',
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const FindbyCountry = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [countries]);

  const fetchCountries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/countries`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      const transformedCountries = data.map(country => ({
        id: country.id,
        name: country.name,
        region: countryToRegion[country.name] || 'Other',
        reached: true,
        ...country
      }));
      
      const sortedCountries = transformedCountries.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      setCountries(sortedCountries);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError(`Failed to load countries: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleCountryClick = (country) => {
    navigate(`/country/${encodeURIComponent(country.name)}`);
  };

  const groupedCountries = countries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {});

  const regions = ['All', ...Object.keys(groupedCountries).sort()];
  const filteredCountries = selectedRegion === 'All' 
    ? countries 
    : groupedCountries[selectedRegion] || [];
    
  const searchResults = filteredCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRegionColor = (region) => {
    const colorMap = {
      'North America': '#0ea5e9',
      'South America': '#10b981',
      'Europe': '#8b5cf6',
      'Africa': '#f59e0b',
      'Asia': '#ef4444',
      'Oceania': '#06b6d4',
      'Other': colors.textLight
    };
    return colorMap[region] || colors.accent;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingText}>Loading network...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />

      {/* Header with proper spacing */}
      <div style={styles.header} className="scroll-reveal countries-header">
        <div style={styles.headerContent}>
          <h2
            className="countries-title"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: "300",
              color: colors.text,
              marginBottom: "24px",
              fontFamily: 'inherit',
              lineHeight: "1.2",
              letterSpacing: '-0.02em',
              alignSelf: 'left'
            }}
          >
            All <span style={{ fontWeight: '700', color: colors.primary }}>Countries</span> Reached
          </h2>
          
          <p style={styles.subtitle}>
            {countries.length} countries across {Object.keys(groupedCountries).length} regions
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls} className="scroll-reveal countries-controls">
        <div style={styles.controlsGrid} className="countries-controls-grid">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            className="minimal-input"
          />
          
          <div style={styles.viewToggle} className="countries-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`minimal-button ${viewMode === 'grid' ? 'active' : ''}`}
              style={styles.toggleBtn}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`minimal-button ${viewMode === 'list' ? 'active' : ''}`}
              style={styles.toggleBtn}
            >
              List
            </button>
          </div>
        </div>

        <div style={styles.filters} className="countries-filters">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`minimal-button ${selectedRegion === region ? 'active' : ''}`}
              style={styles.filterBtn}
            >
              {region}
              {region !== 'All' && (
                <span style={styles.count}>
                  {(groupedCountries[region] || []).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content} className="countries-content">
        {error ? (
          <div style={styles.errorState} className="minimal-card scroll-reveal">
            <div style={styles.errorIcon}>!</div>
            <div>
              <h3 style={styles.errorTitle}>Connection Error</h3>
              <p style={styles.errorMessage}>{error}</p>
              <button 
                onClick={fetchCountries} 
                style={styles.retryBtn}
                className="minimal-button"
              >
                Retry
              </button>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          <div style={styles.emptyState} className="minimal-card scroll-reveal">
            <div style={styles.emptyIcon}>∅</div>
            <div>
              <h3 style={styles.emptyTitle}>No Results</h3>
              <p style={styles.emptyMessage}>
                {searchTerm ? `No matches for "${searchTerm}"` : 'Adjust filters'}
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="countries-grid"
            style={{
              ...styles.grid,
              gridTemplateColumns: viewMode === 'grid' 
                ? 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))' 
                : '1fr',
            }}
          >
            {searchResults.map((country, index) => {
              const regionColor = getRegionColor(country.region);
              
              return (
                <div
                  key={country.id}
                  className="minimal-card scroll-reveal"
                  style={{
                    ...styles.card,
                    ...(viewMode === 'list' ? styles.listCard : {}),
                    transitionDelay: `${Math.min(index * 30, 300)}ms`,
                  }}
                  onClick={() => handleCountryClick(country)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div 
                        style={{
                          ...styles.indicator,
                          backgroundColor: regionColor,
                        }}
                      ></div>
                      <h3 style={styles.countryName}>{country.name}</h3>
                      <span style={{
                        ...styles.region,
                        color: regionColor,
                      }}>
                        {country.region}
                      </span>
                    </>
                  ) : (
                    <>
                      <div 
                        style={{
                          ...styles.indicatorSmall,
                          backgroundColor: regionColor,
                        }}
                      ></div>
                      <div style={styles.listContent}>
                        <h3 style={styles.listName}>{country.name}</h3>
                        <span style={{
                          ...styles.listRegion,
                          color: regionColor,
                        }}>
                          {country.region}
                        </span>
                      </div>
                      <div style={{
                        ...styles.arrow,
                        color: regionColor
                      }}>→</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <CompanyLocationsMap />
      <ChatAssistant/>
      <FollowACEF />
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: colors.text,
    background: 'linear-gradient(135deg, #e0f7fa, #80deea, #e0f7fa, #ffffff)',
  },

  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    paddingTop: '80px',
  },

  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid rgba(10, 69, 28, 0.2)',
    borderTop: '2px solid #0a451c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    fontSize: '0.875rem',
    color: colors.secondary,
    fontWeight: '500',
  },

  header: {
    textAlign: 'center',
    padding: '6rem 1rem 2rem',
    paddingTop: 'max(6rem, calc(80px + 2rem))',
    maxWidth: '800px',
    margin: '0 auto',
  },

  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },

  subtitle: {
    fontSize: '0.9375rem',
    color: colors.secondary,
    margin: '0',
    textAlign: 'center',
    paddingX: '1rem',
  },

  controls: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem 1rem',
  },

  controlsGrid: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexDirection: 'row',
  },

  searchInput: {
    flex: '1',
    minWidth: '0',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    borderRadius: '12px',
    color: colors.text,
    minHeight: '44px',
    boxSizing: 'border-box',
  },

  viewToggle: {
    display: 'flex',
    gap: '0.25rem',
    minWidth: 'fit-content',
  },

  toggleBtn: {
    padding: '0.75rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    borderRadius: '8px',
    cursor: 'pointer',
    minHeight: '44px',
    minWidth: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  },

  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    borderRadius: '20px',
    cursor: 'pointer',
    minHeight: '40px',
    whiteSpace: 'nowrap',
  },

  count: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },

  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem 2rem',
  },

  grid: {
    display: 'grid',
    gap: '0.875rem',
  },

  card: {
    padding: '1.25rem',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  listCard: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    padding: '1rem 1.25rem',
    flexDirection: 'row',
  },

  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    margin: '0 auto 0.875rem',
  },

  indicatorSmall: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '1rem',
    flexShrink: 0,
  },

  countryName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: colors.text,
    lineHeight: '1.3',
  },

  region: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    lineHeight: '1.2',
  },

  listContent: {
    flex: '1',
    minWidth: '0',
  },

  listName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    margin: '0 0 0.25rem 0',
    color: colors.text,
    lineHeight: '1.3',
  },

  listRegion: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    lineHeight: '1.2',
  },

  arrow: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginLeft: '0.75rem',
  },

  errorState: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    borderRadius: '16px',
    maxWidth: '400px',
    margin: '0 auto',
  },

  errorIcon: {
    fontSize: '1.5rem',
    color: colors.error,
    fontWeight: '600',
  },

  errorTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: colors.error,
    margin: '0 0 0.5rem 0',
  },

  errorMessage: {
    fontSize: '0.875rem',
    color: colors.secondary,
    margin: '0 0 1rem 0',
    lineHeight: '1.4',
  },

  retryBtn: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
    borderRadius: '8px',
    cursor: 'pointer',
    minHeight: '44px',
  },

  emptyState: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    borderRadius: '16px',
    maxWidth: '400px',
    margin: '0 auto',
  },

  emptyIcon: {
    fontSize: '1.5rem',
    color: colors.textLight,
    fontWeight: '300',
  },

  emptyTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: colors.text,
    margin: '0 0 0.5rem 0',
  },

  emptyMessage: {
    fontSize: '0.875rem',
    color: colors.secondary,
    margin: '0',
    lineHeight: '1.4',
  },
};

export default FindbyCountry;