import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../theme';
import { Globe, ArrowRight, Loader } from 'lucide-react';

// Priority countries that should be featured first
const PRIORITY_COUNTRIES = ['Cameroon', 'Kenya', 'Ghana'];

// Country to region mapping (from your original component)
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

const CountriesReached = () => {
  const { colors, isDarkMode } = useTheme();
  const [countries, setCountries] = useState([]);
  const [countryImages, setCountryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:3001';

  const fetchCountryImages = async () => {
    try {
      const response = await fetch(`${API_BASE}/gallery/protected`);
      if (response.ok) {
        const data = await response.json();
        // Filter for country-specific images
        const countryImageData = (data.data || []).filter(img => 
          img.category === 'country_images' && img.country_name && img.image_url
        );
        setCountryImages(countryImageData);
      }
    } catch (err) {
      console.error('Error fetching country images:', err);
    }
  };

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
      
      // Sort countries with priority countries first
      const sortedCountries = transformedCountries.sort((a, b) => {
        const aPriority = PRIORITY_COUNTRIES.indexOf(a.name);
        const bPriority = PRIORITY_COUNTRIES.indexOf(b.name);
        
        // If both are priority countries, sort by priority order
        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }
        
        // If only one is priority, priority comes first
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        
        // If neither is priority, sort alphabetically
        return a.name.localeCompare(b.name);
      });
      
      setCountries(sortedCountries);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError(`Failed to load countries: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCountries(), fetchCountryImages()]);
    };
    
    fetchData();
  }, []);

  const handleCountryClick = (country) => {
    // Navigate to country detail page
    window.location.href = `/country/${encodeURIComponent(country.name)}`;
  };

  const getCountryImage = (countryName) => {
    const countryImage = countryImages.find(img => img.country_name === countryName);
    if (countryImage?.image_url) {
      return countryImage.image_url.startsWith('http') 
        ? countryImage.image_url 
        : `${STATIC_URL}${countryImage.image_url}`;
    }
    
    // Fallback images for priority countries if no custom image exists
    const fallbackImages = {
      'Cameroon': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Kenya': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Ghana': 'https://images.unsplash.com/photo-1544_photos_of_africa-16?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    
    return fallbackImages[countryName] || `https://images.unsplash.com/photo-1464822889425-e2998d9fecf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
  };

  const getCountryImageData = (countryName) => {
    return countryImages.find(img => img.country_name === countryName);
  };

  if (loading) {
    return (
      <section style={{
        padding: '6rem 0',
        backgroundColor: colors.primary,
        color: colors.white,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <Loader size={32} style={{ color: colors.white, marginBottom: '1rem' }} />
          <p style={{ color: colors.white, opacity: 0.9 }}>Loading countries...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        padding: '6rem 0',
        backgroundColor: colors.primary,
        color: colors.white,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{
            padding: '2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: colors.white
          }}>
            <p>Error: {error}</p>
            <button
              onClick={fetchCountries}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: colors.white,
                color: colors.primary,
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Get featured countries (priority countries that exist in the data)
  const featuredCountries = countries.filter(country => 
    PRIORITY_COUNTRIES.includes(country.name)
  ).slice(0, 3);

  return (
    <section style={{
      padding: '6rem 0',
      backgroundColor: colors.primary,
      color: colors.white,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: `
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
        `
      }} />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            marginBottom: '1rem'
          }}>
            <Globe size={16} style={{ color: colors.white }} />
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: colors.white,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Global Reach
            </span>
          </div>
          
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            margin: '0 0 1rem 0',
            color: colors.white,
            letterSpacing: '-0.02em'
          }}>
            Countries Reached
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Our impact spans across {countries.length} countries worldwide, transforming communities through education and empowerment
          </p>
        </div>

        {/* Featured Countries Grid */}
        {featuredCountries.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '0',
            marginBottom: '3rem'
          }}>
            {featuredCountries.map((country, index) => {
              const imageData = getCountryImageData(country.name);
              const imageUrl = getCountryImage(country.name);
              
              return (
                <div
                  key={country.id}
                  onClick={() => handleCountryClick(country)}
                  style={{
                    position: 'relative',
                    minHeight: '400px',
                    backgroundColor: colors.white,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end',
                    backgroundImage: `
                      linear-gradient(135deg, 
                        ${colors.primary}15 0%, 
                        ${colors.primary}05 100%),
                      url('${imageUrl}')
                    `,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.querySelector('.country-overlay').style.backgroundColor = 'rgba(10, 69, 28, 0.85)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.querySelector('.country-overlay').style.backgroundColor = 'rgba(10, 69, 28, 0.75)';
                  }}
                >


                  {/* Overlay */}
                  <div 
                    className="country-overlay"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(10, 69, 28, 0.75))',
                      padding: '3rem 2rem 2rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <h3 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      margin: '0 0 0.5rem 0',
                      color: colors.white,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {country.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '1rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      margin: '0 0 0.5rem 0',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {country.region}
                    </p>

                    {imageData?.description && (
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        margin: '0 0 1rem 0',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        fontStyle: 'italic'
                      }}>
                        {imageData.description}
                      </p>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: colors.white,
                      fontWeight: '600'
                    }}>
                      Learn More
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* All Countries Horizontal Scroll */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0 0 2rem 0',
            color: colors.white,
            textAlign: 'center'
          }}>
            All {countries.length} Countries We've Reached
          </h3>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            {countries.map((country, index) => (
              <div
                key={country.id}
                onClick={() => handleCountryClick(country)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: colors.white,
                  color: colors.primary,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.secondary;
                  e.target.style.color = colors.black;
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.white;
                  e.target.style.color = colors.primary;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {PRIORITY_COUNTRIES.includes(country.name) && (
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'currentColor'
                  }} />
                )}
                {country.name}
              </div>
            ))}
          </div>
        </div>

        {/* View All Countries Link */}
        <div style={{ textAlign: 'center' }}>
          <a
            href="/findbycountry"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              backgroundColor: colors.white,
              color: colors.primary,
              fontSize: '1.125rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.secondary;
              e.target.style.color = colors.black;
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.white;
              e.target.style.color = colors.primary;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}
          >
            <Globe size={20} />
            Explore Our Global Impact
            <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .countries-scroll::-webkit-scrollbar {
          height: 6px;
        }
        
        .countries-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        .countries-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        
        .countries-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .countries-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 640px) {
          .countries-scroll {
            max-height: 150px;
          }
        }
      `}</style>
    </section>
  );
};

export default CountriesReached;