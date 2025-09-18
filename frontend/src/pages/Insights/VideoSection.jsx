import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme';

const VideoSection = () => {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme, colors, isDarkMode } = useTheme();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        
        let response;
        let data;
        
        // First, try to get a featured video specifically
        try {
          console.log('Attempting to fetch featured video...');
          response = await fetch(`${API_URL}/video-sections/featured`);
          
          if (response.ok) {
            data = await response.json();
            console.log('Featured video API Response:', data);
            
            if (data.success && data.data) {
              console.log('Featured video found:', data.data);
              setVideoData(data.data);
              return; // Exit early if we found a featured video
            }
          }
          
          console.log('No featured video available, trying latest...');
        } catch (featuredError) {
          console.log('Featured endpoint failed, trying latest...', featuredError.message);
        }
        
        // Fallback: Get the latest video if no featured video exists
        try {
          console.log('Attempting to fetch latest video...');
          response = await fetch(`${API_URL}/video-sections/latest`);
          
          if (response.ok) {
            data = await response.json();
            console.log('Latest video API Response:', data);
            
            if (data.success && data.data) {
              console.log('Latest video found:', data.data);
              setVideoData(data.data);
              return;
            }
          }
          
          console.log('No latest video available, trying general endpoint...');
        } catch (latestError) {
          console.log('Latest endpoint failed, trying general...', latestError.message);
        }
        
        // Final fallback: Get all videos and find the best one
        try {
          console.log('Attempting to fetch all videos...');
          response = await fetch(`${API_URL}/video-sections`);
          
          if (response.ok) {
            data = await response.json();
            console.log('All videos API Response:', data);
            
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              // Priority: Featured + Active > Featured > Active > Any
              const featuredActive = data.data.find(video => video.is_featured && video.is_active);
              const featured = data.data.find(video => video.is_featured);
              const active = data.data.find(video => video.is_active);
              
              const selectedVideo = featuredActive || featured || active || data.data[0];
              console.log('Selected video from all videos:', selectedVideo);
              setVideoData(selectedVideo);
              return;
            }
          }
        } catch (generalError) {
          console.log('General endpoint failed:', generalError.message);
        }
        
        // If we reach here, no videos were found
        console.log('No videos found at all');
        setError('No video content available');
        
      } catch (err) {
        console.error('Error in fetchVideoData:', err);
        setError('Failed to load video content');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [API_URL]);

  // Theme-aware styles
  const getBackgroundGradient = () => {
    if (isDarkMode) {
      return 'linear-gradient(135deg, #000408ff, #000308ff)';
    }
    return 'linear-gradient(135deg, #ffffff, #9ccf9f, #ffffff)';
  };

  const getLoadingSpinnerColor = () => {
    return isDarkMode ? colors.accent : colors.primary;
  };

  const getTextColor = () => {
    return colors.text;
  };

  const getSecondaryTextColor = () => {
    return colors.textSecondary;
  };

  const getBadgeStyles = (isFeatured) => {
    if (isDarkMode) {
      return isFeatured ? {
        background: 'rgba(251, 191, 36, 0.15)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        color: '#fbbf24'
      } : {
        background: 'rgba(156, 207, 159, 0.15)',
        border: '1px solid rgba(156, 207, 159, 0.3)',
        color: colors.accent
      };
    }
    
    return isFeatured ? {
      background: 'rgba(251, 191, 36, 0.15)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      color: '#92400e'
    } : {
      background: 'rgba(10, 69, 28, 0.15)',
      border: '1px solid rgba(10, 69, 28, 0.2)',
      color: colors.primary
    };
  };

  const getVideoWrapperStyles = () => {
    if (isDarkMode) {
      return {
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      };
    }
    
    return {
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    };
  };

  const getTitleGradient = () => {
    if (isDarkMode) {
      return `linear-gradient(45deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`;
    }
    return `linear-gradient(45deg, ${colors.primary} 0%, rgba(10, 69, 28, 0.8) 100%)`;
  };

  const getButtonStyles = () => {
    return {
      backgroundColor: colors.primary,
      color: isDarkMode ? colors.white : colors.white,
      boxShadow: `0 8px 25px rgba(${colors.primary.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '10, 69, 28'}, 0.3)`
    };
  };

  const getButtonHoverStyles = () => {
    return {
      backgroundColor: colors.primaryDark || '#052310',
      boxShadow: `0 12px 35px rgba(${colors.primary.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '10, 69, 28'}, 0.4)`
    };
  };

  if (loading) {
    return (
      <section className="video-section">
        <style jsx>{`
          .video-section {
            position: relative;
            padding: 120px 0;
            background: ${getBackgroundGradient()};
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid ${getLoadingSpinnerColor()}30;
            border-top: 3px solid ${getLoadingSpinnerColor()};
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-spinner"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="video-section">
        <style jsx>{`
          .video-section {
            position: relative;
            padding: 120px 0;
            background: ${getBackgroundGradient()};
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-message {
            color: ${getTextColor()};
            font-size: 1.1rem;
            text-align: center;
          }
        `}</style>
        <div className="error-message">
          Unable to load video content. Please try again later.
        </div>
      </section>
    );
  }

  if (!videoData) {
    return null;
  }

  const { tag, title, description, youtube_url: videoUrl, is_featured } = videoData;
  const badgeStyles = getBadgeStyles(is_featured);
  const videoWrapperStyles = getVideoWrapperStyles();
  const buttonStyles = getButtonStyles();
  
  return (
    <section className="video-section">
      <style jsx>{`
        .video-section {
          position: relative;
          padding: 120px 0;
          background: ${getBackgroundGradient()};
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .video-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.1)'} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.1)'} 0%, transparent 50%);
          pointer-events: none;
        }

        .video-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(45deg, transparent 48%, ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.02)'} 49%, ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.02)'} 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.02)'} 49%, ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.02)'} 51%, transparent 52%);
          background-size: 60px 60px;
          opacity: 0.5;
          pointer-events: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .video-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${videoWrapperStyles.boxShadow};
          backdrop-filter: blur(10px);
          border: ${videoWrapperStyles.border};
          transition: all 0.3s ease;
        }

        .video-wrapper:hover {
          transform: translateY(-4px);
          box-shadow: ${isDarkMode 
            ? '0 35px 80px rgba(0, 0, 0, 0.6), 0 15px 40px rgba(0, 0, 0, 0.4)' 
            : '0 35px 80px rgba(0, 0, 0, 0.4), 0 15px 40px rgba(0, 0, 0, 0.3)'
          };
        }

        .video-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${isDarkMode 
            ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)' 
            : 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
          };
          z-index: 1;
          pointer-events: none;
        }

        .video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 20px;
        }

        .video-text {
          color: ${getTextColor()};
        }

        .video-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: ${badgeStyles.background};
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 25px;
          border: ${badgeStyles.border};
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          color: ${badgeStyles.color};
          transition: all 0.3s ease;
        }

        .video-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px ${badgeStyles.color}30;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: ${is_featured ? '#fbbf24' : '#ff6b6b'};
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 ${is_featured ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 107, 107, 0.7)'};
          }
          70% {
            box-shadow: 0 0 0 10px ${is_featured ? 'rgba(251, 191, 36, 0)' : 'rgba(255, 107, 107, 0)'};
          }
          100% {
            box-shadow: 0 0 0 0 ${is_featured ? 'rgba(251, 191, 36, 0)' : 'rgba(255, 107, 107, 0)'};
          }
        }

        .video-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 20px;
          background: ${getTitleGradient()};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }

        .video-title:hover {
          transform: translateX(4px);
        }

        .video-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: ${getSecondaryTextColor()};
          margin-bottom: 30px;
          transition: color 0.3s ease;
        }

        .video-actions {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .read-latest-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          background: ${buttonStyles.backgroundColor};
          color: ${buttonStyles.color};
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
          box-shadow: ${buttonStyles.boxShadow};
          font-family: '"Nunito Sans", sans-serif';
        }

        .read-latest-btn:hover {
          background: ${getButtonHoverStyles().backgroundColor};
          transform: translateY(-2px);
          box-shadow: ${getButtonHoverStyles().boxShadow};
          border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
        }

        .read-latest-btn:active {
          transform: translateY(0);
        }

        .btn-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .read-latest-btn:hover .btn-icon {
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .video-section {
            padding: 80px 0;
          }

          .video-content {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .video-title {
            font-size: 2rem;
          }

          .video-actions {
            margin-top: 30px;
          }

          .read-latest-btn {
            font-size: 14px;
            padding: 12px 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .video-wrapper,
          .video-badge,
          .video-title,
          .read-latest-btn,
          .pulse-dot {
            animation: none !important;
            transition: none !important;
          }
          
          .video-wrapper:hover,
          .video-badge:hover,
          .video-title:hover,
          .read-latest-btn:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div className="container">
        <div className="video-content">
          <div className="video-text">
            <div className="video-badge">
              <span className="pulse-dot"></span>
              {tag}
            </div>
            
            <h2 className="video-title">{title}</h2>
            <p className="video-description">{description}</p>
          </div>

          <div className="video-wrapper">
            <iframe
              className="video-iframe"
              src={videoUrl}
              title="ACEF Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="video-actions">
          <a 
            href="/insights" 
            style={{
              padding: '16px 32px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: buttonStyles.boxShadow,
              alignSelf: 'flex-start',
              fontFamily: '"Nunito Sans", sans-serif',
              backgroundColor: buttonStyles.backgroundColor,
              color: buttonStyles.color,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              const hoverStyles = getButtonHoverStyles();
              e.currentTarget.style.backgroundColor = hoverStyles.backgroundColor;
              e.currentTarget.style.boxShadow = hoverStyles.boxShadow;
              e.currentTarget.style.transform = 'translateY(-2px)';
              // Animate arrow
              const arrow = e.currentTarget.querySelector('.btn-icon');
              if (arrow) {
                arrow.style.transform = 'translateX(3px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyles.backgroundColor;
              e.currentTarget.style.boxShadow = buttonStyles.boxShadow;
              e.currentTarget.style.transform = 'translateY(0)';
              // Reset arrow
              const arrow = e.currentTarget.querySelector('.btn-icon');
              if (arrow) {
                arrow.style.transform = 'translateX(0)';
              }
            }}
          >
            Read the Latest from ACEF
            <svg 
              className="btn-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ 
                width: '20px', 
                height: '20px',
                transition: 'transform 0.3s ease',
                strokeWidth: '2'
              }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;