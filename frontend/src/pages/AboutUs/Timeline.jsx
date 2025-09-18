import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme';

const PublicHighlights = () => {
  const [highlights, setHighlights] = useState({});
  const [years, setYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { colors, isDarkMode } = useTheme();

  const API_URL = 'http://localhost:5000/api'; // Replace with your API URL
  const STATIC_URL = 'http://localhost:5000'; // Replace with your static files URL

  // Generate fallback image SVG
  const generateFallbackImage = (title) => {
    const initials = title ? title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() : 'ACE';
    const svgString = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
              text-anchor="middle" dominant-baseline="middle" fill="${colors.white}">${initials}</text>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" dominant-baseline="middle" fill="${colors.white}" opacity="0.8">
          No Image Available
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  // Fetch highlights data
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/highlights`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch highlights');
        }

        const data = await response.json();
        const highlightsData = data.data || {};
        
        setHighlights(highlightsData);
        const sortedYears = Object.keys(highlightsData).map(Number).sort((a, b) => b - a);
        setYears(sortedYears);
        
        if (sortedYears.length > 0) {
          setCurrentYear(sortedYears[0]);
          setCurrentSlideIndex(0);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching highlights:', err);
        setError('Failed to load highlights');
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  // Handle year click
  const handleYearClick = (year) => {
    setCurrentYear(year);
    setCurrentSlideIndex(0);
  };

  // Handle manual navigation
  const goToSlide = (direction) => {
    const currentYearHighlights = highlights[currentYear] || [];
    let newSlideIndex = currentSlideIndex + direction;

    if (newSlideIndex < 0) {
      const currentYearIndex = years.indexOf(currentYear);
      const prevYearIndex = currentYearIndex - 1;
      
      if (prevYearIndex >= 0) {
        const prevYear = years[prevYearIndex];
        setCurrentYear(prevYear);
        setCurrentSlideIndex((highlights[prevYear] || []).length - 1);
      }
    } else if (newSlideIndex >= currentYearHighlights.length) {
      const currentYearIndex = years.indexOf(currentYear);
      const nextYearIndex = currentYearIndex + 1;
      
      if (nextYearIndex < years.length) {
        setCurrentYear(years[nextYearIndex]);
        setCurrentSlideIndex(0);
      }
    } else {
      setCurrentSlideIndex(newSlideIndex);
    }
  };

  const currentHighlight = highlights[currentYear]?.[currentSlideIndex];
  const totalHighlights = highlights[currentYear]?.length || 0;

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        background: isDarkMode 
          ? `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accentDark} 100%)`
          : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.white
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `4px solid ${colors.white}30`,
            borderTop: `4px solid ${colors.white}`,
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p>Loading highlights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '80vh',
        background: isDarkMode 
          ? `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.accentDark} 100%)`
          : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.white,
        textAlign: 'center'
      }}>
        <div>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{error}</p>
          <p style={{ opacity: 0.8 }}>Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <div style={{
        minHeight: '80vh',
        background: isDarkMode 
          ? `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.accentDark} 100%)`
          : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.white,
        textAlign: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No highlights available</h3>
          <p style={{ opacity: 0.8 }}>Check back soon for our organizational achievements and milestones.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '80vh',
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.accentDark} 100%)`
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      padding: '1.5rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: colors.white
      }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 700,
          margin: '0 0 0.8rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Key Highlights and Achievements
        </h1>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.9,
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: 1.5
        }}>
          Discover our achievements and milestones throughout the years
        </p>
      </div>

      {/* Timeline */}
      <div style={{
        position: 'relative',
        margin: '0 auto 2rem auto',
        maxWidth: '700px',
        padding: '1.5rem 1rem'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50px',
          right: '50px',
          height: '4px',
          background: `${colors.white}50`,
          transform: 'translateY(-50%)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.accent} 100%)`,
            width: `${((years.indexOf(currentYear) + 1) / years.length) * 100}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>

        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 50px'
        }}>
          {years.map((year) => (
            <div
              key={year}
              onClick={() => handleYearClick(year)}
              style={{
                position: 'relative',
                background: currentYear === year 
                  ? `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`
                  : `${colors.white}30`,
                border: currentYear === year 
                  ? `3px solid ${colors.white}`
                  : `3px solid ${colors.white}60`,
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: colors.white,
                backdropFilter: 'blur(10px)',
                boxShadow: currentYear === year 
                  ? `0 0 20px ${colors.secondary}80`
                  : 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = currentYear === year ? 'scale(1.15)' : 'scale(1)';
              }}
            >
              {year}
            </div>
          ))}
        </div>
      </div>

      {/* Main Slider Container */}
      <div style={{
        position: 'relative',
        maxWidth: '1100px',
        margin: '0 auto',
        background: `${colors.white}F5`,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        minHeight: '500px'
      }}>
        {/* Left Navigation Arrow */}
        <button
          onClick={() => goToSlide(-1)}
          disabled={years.indexOf(currentYear) === 0 && currentSlideIndex === 0}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: `${colors.white}F0`,
            border: `2px solid ${colors.primary}40`,
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            fontSize: '1.5rem',
            color: colors.primary,
            transition: 'all 0.3s ease',
            opacity: (years.indexOf(currentYear) === 0 && currentSlideIndex === 0) ? 0.4 : 1,
            boxShadow: `0 4px 20px ${colors.primary}20`
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
              e.target.style.backgroundColor = colors.primary;
              e.target.style.color = colors.white;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)';
            e.target.style.backgroundColor = `${colors.white}F0`;
            e.target.style.color = colors.primary;
          }}
        >
          &#8249;
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={() => goToSlide(1)}
          disabled={years.indexOf(currentYear) === years.length - 1 && 
                   currentSlideIndex === totalHighlights - 1}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: `${colors.white}F0`,
            border: `2px solid ${colors.primary}40`,
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            fontSize: '1.5rem',
            color: colors.primary,
            transition: 'all 0.3s ease',
            opacity: (years.indexOf(currentYear) === years.length - 1 && 
                     currentSlideIndex === totalHighlights - 1) ? 0.4 : 1,
            boxShadow: `0 4px 20px ${colors.primary}20`
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
              e.target.style.backgroundColor = colors.primary;
              e.target.style.color = colors.white;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)';
            e.target.style.backgroundColor = `${colors.white}F0`;
            e.target.style.color = colors.primary;
          }}
        >
          &#8250;
        </button>

        {/* Slide Content */}
        <div style={{
          position: 'relative',
          height: '100%',
          minHeight: '500px',
          overflow: 'hidden'
        }}>
          {currentHighlight && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
              gridTemplateRows: window.innerWidth <= 768 ? '300px 1fr' : '1fr',
              height: '100%',
              minHeight: '500px'
            }}>
              {/* Image Section */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}20 100%)`
              }}>
                <img
                  src={currentHighlight.image_url && currentHighlight.image_url.trim() 
                    ? `${STATIC_URL}${currentHighlight.image_url}` 
                    : generateFallbackImage(currentHighlight.title)}
                  alt={currentHighlight.title}
                  onError={(e) => {
                    e.target.src = generateFallbackImage(currentHighlight.title);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
              </div>

              {/* Content Section */}
              <div style={{
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.backgroundSecondary} 100%)`,
                position: 'relative'
              }}>
                {/* Slide indicators for current year */}
                {totalHighlights > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    {Array.from({ length: totalHighlights }, (_, index) => (
                      <div
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        style={{
                          width: index === currentSlideIndex ? '24px' : '8px',
                          height: '8px',
                          backgroundColor: index === currentSlideIndex ? colors.accent : `${colors.gray400}60`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                )}

                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: colors.text,
                  margin: '0 0 1.5rem 0',
                  lineHeight: 1.3,
                  paddingRight: '4rem' // Space for slide indicators
                }}>
                  {currentHighlight.title}
                </h3>

                {currentHighlight.description && (
                  <p style={{
                    fontSize: '1.1rem',
                    color: colors.textSecondary,
                    lineHeight: 1.7,
                    margin: 0
                  }}>
                    {currentHighlight.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicHighlights;