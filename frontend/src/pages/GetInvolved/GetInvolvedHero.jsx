import React, { useState } from 'react';
import { useTheme } from '../../theme';

const ImageFallbackComponent = ({ onStartClick }) => {
  const [imageError, setImageError] = useState(false);
    const { colors, isDarkMode } = useTheme();
  
  // Multiple path attempts for debugging
  const imagePaths = [
    "/heroimageget.jpg",           // Standard public folder path
    "./heroimageget.jpg",          // Relative path
    "heroimageget.jpg",            // Without leading slash
    "/public/heroimageget.jpg",    // Your original path (shouldn't work but let's try)
    process.env.PUBLIC_URL + "/heroimageget.jpg" // Environment-aware path
  ];
  
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [attemptedPaths, setAttemptedPaths] = useState([]);
  
  const fallbackImage = `https://picsum.photos/800/1000?random=${Date.now()}`;
  
  const handleImageError = () => {
    const failedPath = imagePaths[currentPathIndex];
    console.log(`Image failed to load from: ${failedPath}`);
    setAttemptedPaths(prev => [...prev, failedPath]);
    
    if (currentPathIndex < imagePaths.length - 1) {
      console.log(`Trying next path: ${imagePaths[currentPathIndex + 1]}`);
      setCurrentPathIndex(prev => prev + 1);
    } else {
      console.log('All paths failed, using fallback image');
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully from: ${imagePaths[currentPathIndex]}`);
  };

  const handleStartClick = () => {
    if (onStartClick) {
      onStartClick();
    }
  };

  const handleReadStoriesClick = () => {
    const testimonialSection = document.getElementById('collvolunteerstestimonials');
    if (testimonialSection) {
      testimonialSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="image-container">
      <style>{`
        .image-container {
          position: relative;
          width: 100%;
          min-height: 100vh;

          background-color: ${colors.surface};
          margin-top: 80px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .content-wrapper {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .text-content {
          position: relative;
          z-index: 10;
          flex: 0 0 45%;
          padding: 0 5%;
          color: ${colors.text};
          backdrop-filter: blur(2px);
        }
        
        .text-content h1 {
          font-size: clamp(1.5rem, 4vw, 3rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: ${colors.primary};
          line-height: 1.1;
          text-shadow: ${isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(255, 255, 255, 0.9)'};
          letter-spacing: -0.02em;
        }
        
        .text-content .subtitle {
          font-size: clamp(0.5rem, 1vw, 1.0rem);
          font-weight: 600;
          color: ${colors.secondary};
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .text-content p {
          font-size: clamp(1rem, 0.8vw, 0.5rem);
          line-height: 1.7;
          margin-bottom: 2.5rem;
          color: ${colors.textSecondary};
          font-weight: 400;
          text-shadow: ${isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(255, 255, 255, 0.8)'};
        }
        
        .button-group {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .cta-button {
          background-color: ${colors.primary};
          color: ${colors.white || '#ffffff'};
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: "Nunito Sans", sans-serif;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(250, 207, 60, 0.3);
        }
        
        .secondary-button {
          background-color: transparent;
          color: ${colors.primary};
          border: 2px solid ${colors.primary};
          padding: 10px 22px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: "Nunito Sans", sans-serif;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          box-shadow: 0 4px 15px ${isDarkMode ? 'rgba(250, 207, 60, 0.1)' : 'rgba(250, 207, 60, 0.2)'};
        }
        
        .cta-button::before,
        .secondary-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }
        
        .cta-button:hover::before,
        .secondary-button:hover::before {
          left: 100%;
        }
        
        .cta-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 40px rgba(250, 207, 60, 0.5);
          filter: brightness(1.1);
        }
        
        .secondary-button:hover {
          transform: translateY(-3px) scale(1.02);
          background-color: ${colors.primary};
          color: ${colors.white || '#ffffff'};
          box-shadow: 0 12px 40px rgba(250, 207, 60, 0.4);
        }
        
        .cta-button:active,
        .secondary-button:active {
          transform: translateY(-1px) scale(1.01);
        }
        
        .image-section {
          position: absolute;
          right: 0;
          top: 0;
          width: 65%;
          height: 100vh;
          z-index: 1;
        }
        
        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          background: ${
            isDarkMode
              ? `linear-gradient(
                  90deg,
                  ${colors.surface} 0%,
                  rgba(18, 18, 18, 0.98) 5%,
                  rgba(18, 18, 18, 0.85) 12%,
                  rgba(18, 18, 18, 0.7) 20%,
                  rgba(18, 18, 18, 0.5) 30%,
                  rgba(18, 18, 18, 0.3) 40%,
                  rgba(18, 18, 18, 0.1) 50%,
                  transparent 60%
                )`
              : `linear-gradient(
                  90deg,
                  ${colors.surface} 0%,
                  rgba(255, 255, 255, 0.98) 5%,
                  rgba(255, 255, 255, 0.85) 12%,
                  rgba(255, 255, 255, 0.7) 20%,
                  rgba(255, 255, 255, 0.5) 30%,
                  rgba(255, 255, 255, 0.3) 40%,
                  rgba(255, 255, 255, 0.1) 50%,
                  transparent 60%
                )`
          };
        }
        
        .bottom-fade {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            ${isDarkMode ? 'rgba(18, 18, 18, 0.1)' : 'rgba(255, 255, 255, 0.1)'} 30%,
            ${isDarkMode ? 'rgba(18, 18, 18, 0.3)' : 'rgba(255, 255, 255, 0.3)'} 60%,
            ${isDarkMode ? 'rgba(18, 18, 18, 0.6)' : 'rgba(255, 255, 255, 0.6)'} 80%,
            ${isDarkMode ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)'} 100%
          );
          z-index: 5;
          pointer-events: none;
        }
        
        .futuristic-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            ${isDarkMode ? 'rgba(10, 69, 28, 0.08)' : 'rgba(10, 69, 28, 0.05)'} 0%,
            transparent 30%,
            ${isDarkMode ? 'rgba(250, 207, 60, 0.05)' : 'rgba(250, 207, 60, 0.03)'} 70%,
            transparent 100%
          );
          z-index: 3;
          pointer-events: none;
        }
        
        .accent-elements {
          position: absolute;
          top: 20%;
          right: 10%;
          width: 200px;
          height: 200px;
          z-index: 4;
          pointer-events: none;
        }
        
        .accent-circle {
          position: absolute;
          border: 2px solid rgba(250, 207, 60, ${isDarkMode ? '0.4' : '0.3'});
          border-radius: 50%;
          animation: pulse 3s infinite ease-in-out;
        }
        
        .accent-circle:nth-child(1) {
          width: 80px;
          height: 80px;
          top: 0;
          right: 0;
        }
        
        .accent-circle:nth-child(2) {
          width: 120px;
          height: 120px;
          top: 40px;
          right: 60px;
          animation-delay: -1s;
        }
        
        .fallback-indicator {
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(10, 69, 28, 0.9);
          color: #fff;
          padding: 0.8rem 1.2rem;
          border-radius: 25px;
          font-size: 0.9rem;
          z-index: 15;
          backdrop-filter: blur(10px);
          font-weight: 600;
          border: 1px solid rgba(250, 207, 60, 0.3);
        }
        
        .local-indicator {
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(10, 69, 28, 0.9);
          color: #fff;
          padding: 0.8rem 1.2rem;
          border-radius: 25px;
          font-size: 0.9rem;
          z-index: 15;
          backdrop-filter: blur(10px);
          font-weight: 600;
          border: 1px solid rgba(250, 207, 60, 0.3);
        }
        
        .highlight {
          background: linear-gradient(135deg, ${colors.secondary}, #f0c346);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: ${isDarkMode ? '0.4' : '0.3'};
          }
          50% {
            transform: scale(1.1);
            opacity: ${isDarkMode ? '0.7' : '0.6'};
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .text-content {
          animation: float 6s ease-in-out infinite;
        }
        
        @media (max-width: 1024px) {
          .image-container {
            margin-top: 60px;
          }
          
          .content-wrapper {
            flex-direction: column;
            justify-content: center;
          }
          
          .text-content {
            flex: none;
            padding: 2rem;
            text-align: center;
            backdrop-filter: blur(5px);
            background: ${isDarkMode ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
            border-radius: 20px;
            margin: 2rem;
            box-shadow: 0 20px 40px ${isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
          }
          
          .image-section {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
          }
          
          .image-overlay {
            background: ${
              isDarkMode
                ? `linear-gradient(
                    180deg,
                    transparent 0%,
                    rgba(18, 18, 18, 0.1) 20%,
                    rgba(18, 18, 18, 0.3) 40%,
                    rgba(18, 18, 18, 0.6) 60%,
                    rgba(18, 18, 18, 0.8) 80%,
                    rgba(18, 18, 18, 0.95) 100%
                  )`
                : `linear-gradient(
                    180deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.1) 20%,
                    rgba(255, 255, 255, 0.3) 40%,
                    rgba(255, 255, 255, 0.6) 60%,
                    rgba(255, 255, 255, 0.8) 80%,
                    rgba(255, 255, 255, 0.95) 100%
                  )`
            };
          }
          
          .accent-elements {
            display: none;
          }
          
          .button-group {
            justify-content: center;
            gap: 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .image-container {
            margin-top: 50px;
          }
          
          .text-content {
            margin: 1rem;
            padding: 1.5rem;
          }
          
          .cta-button,
          .secondary-button {
            padding: 12px 20px;
            font-size: 15px;
          }
          
          .button-group {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }
          
          .cta-button,
          .secondary-button {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .image-container {
            margin-top: 40px;
          }
          
          .cta-button,
          .secondary-button {
            padding: 10px 18px;
            font-size: 14px;
          }
        }
      `}</style>
      
      <div className="content-wrapper">
        <div className="text-content">
          <h1>Join ACEF in Empowering Grassroots</h1>
          <p>
            Be part of a movement that transforms communities from the ground up. 
            Together, we're building sustainable solutions, fostering innovation, 
            and creating lasting change that <span className="highlight">empowers every voice</span>. 
            Your involvement makes the difference between hope and reality for countless lives across Africa.
          </p>
          <div className="button-group">
            <button className="cta-button" onClick={handleStartClick}>
              Start
            </button>
            <button className="secondary-button" onClick={handleReadStoriesClick}>
              Read Impact Stories
            </button>
          </div>
        </div>
        
        <div className="image-section">
         {isDarkMode ? (
  <video
    className="main-image"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src="/plantdripping.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
) : (
  <img
    src={imageError ? fallbackImage : imagePaths[currentPathIndex]}
    alt="Community empowerment and grassroots development"
    className="main-image"
    onError={handleImageError}
    onLoad={handleImageLoad}
  />
)}

          <div className="image-overlay"></div>
          <div className="bottom-fade"></div>
          <div className="futuristic-overlay"></div>
          <div className="accent-elements">
            <div className="accent-circle"></div>
            <div className="accent-circle"></div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ImageFallbackComponent;