import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Minimalistic styling with scroll animations
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

const CountriesReached = () => {
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
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingText}>Loading network...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Minimal Header */}
      <div style={styles.header} className="scroll-reveal">
        <div style={styles.headerContent}>
          <div style={styles.badge} className="minimal-card">
            <div style={styles.statusDot}></div>
            <span>Global Network</span>
          </div>
          
          <h1 style={styles.mainHeading}>Countries Reached</h1>
          <p style={styles.subtitle}>
            {countries.length} countries across {Object.keys(groupedCountries).length} regions
          </p>
        </div>
      </div>

      {/* Minimal Controls */}
      <div style={styles.controls} className="scroll-reveal">
        <div style={styles.controlsGrid}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            className="minimal-input"
          />
          
          <div style={styles.viewToggle}>
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

        <div style={styles.filters}>
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
      <div style={styles.content}>
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
          <div style={{
            ...styles.grid,
            gridTemplateColumns: viewMode === 'grid' 
              ? 'repeat(auto-fill, minmax(200px, 1fr))' 
              : '1fr',
          }}>
            {searchResults.map((country, index) => {
              const regionColor = getRegionColor(country.region);
              
              return (
                <div
                  key={country.id}
                  className="minimal-card scroll-reveal"
                  style={{
                    ...styles.card,
                    ...(viewMode === 'list' ? styles.listCard : {}),
                    transitionDelay: `${index * 30}ms`,
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
    padding: '2rem 1rem 1rem',
    maxWidth: '800px',
    margin: '0 auto',
  },

  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: colors.primary,
  },

  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: colors.success,
  },

  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    margin: '0',
    color: colors.text,
  },
      mainHeading: {
       fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.primary,
      fontFamily: 'inherit'
    },

  subtitle: {
    fontSize: '0.875rem',
    color: colors.secondary,
    margin: '0',
  },

  controls: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '1rem',
  },

  controlsGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },

  searchInput: {
    flex: '1',
    minWidth: '200px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '8px',
    color: colors.text,
  },

  viewToggle: {
    display: 'flex',
    gap: '0.25rem',
  },

  toggleBtn: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
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
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '16px',
    cursor: 'pointer',
  },

  count: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: '0.125rem 0.375rem',
    borderRadius: '8px',
    fontSize: '0.625rem',
    fontWeight: '600',
  },

  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem 2rem',
  },

  grid: {
    display: 'grid',
    gap: '0.75rem',
  },

  card: {
    padding: '1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  listCard: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    padding: '0.75rem 1rem',
  },

  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    margin: '0 auto 0.75rem',
  },

  indicatorSmall: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '0.75rem',
    flexShrink: 0,
  },

  countryName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0 0 0.375rem 0',
    color: colors.text,
  },

  region: {
    fontSize: '0.75rem',
    fontWeight: '500',
  },

  listContent: {
    flex: '1',
  },

  listName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0 0 0.125rem 0',
    color: colors.text,
  },

  listRegion: {
    fontSize: '0.75rem',
    fontWeight: '500',
  },

  arrow: {
    fontSize: '0.875rem',
    fontWeight: '600',
  },

  errorState: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    borderRadius: '12px',
    maxWidth: '400px',
    margin: '0 auto',
  },

  errorIcon: {
    fontSize: '1.25rem',
    color: colors.error,
    fontWeight: '600',
  },

  errorTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: colors.error,
    margin: '0 0 0.25rem 0',
  },

  errorMessage: {
    fontSize: '0.75rem',
    color: colors.secondary,
    margin: '0 0 0.75rem 0',
  },

  retryBtn: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  emptyState: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    borderRadius: '12px',
    maxWidth: '400px',
    margin: '0 auto',
  },

  emptyIcon: {
    fontSize: '1.25rem',
    color: colors.textLight,
    fontWeight: '300',
  },

  emptyTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: colors.text,
    margin: '0 0 0.25rem 0',
  },

  emptyMessage: {
    fontSize: '0.75rem',
    color: colors.secondary,
    margin: '0',
  },
};

// Add spin animation to global styles
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (!document.head.querySelector('style[data-spin-animation]')) {
  const spinStyle = document.createElement('style');
  spinStyle.setAttribute('data-spin-animation', 'true');
  spinStyle.textContent = spinAnimation;
  document.head.appendChild(spinStyle);
}

export default CountriesReached;