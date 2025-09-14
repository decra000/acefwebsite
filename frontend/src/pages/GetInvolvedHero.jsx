import React, { useState } from 'react';
import { useTheme } from '../theme';

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
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9);
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
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }
        
        .cta-button {
          background-color: ${colors.primary};
          color: ${colors.white || '#ffffff'};
          padding: 10px 22px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          align-self: flex-start;
          font-family: "Nunito Sans", sans-serif;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(250, 207, 60, 0.3);
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .cta-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 40px rgba(250, 207, 60, 0.5);
          filter: brightness(1.1);
        }
        
        .cta-button:active {
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
          background: linear-gradient(
            90deg,
            ${colors.surface} 0%,
            rgba(255, 255, 255, 0.95) 8%,
            rgba(255, 255, 255, 0.8) 15%,
            rgba(255, 255, 255, 0.6) 25%,
            rgba(255, 255, 255, 0.3) 35%,
            rgba(255, 255, 255, 0.1) 45%,
            transparent 55%
          );
          z-index: 2;
          pointer-events: none;
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
            rgba(255, 255, 255, 0.1) 30%,
            rgba(255, 255, 255, 0.3) 60%,
            rgba(255, 255, 255, 0.6) 80%,
            rgba(255, 255, 255, 0.9) 100%
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
            rgba(10, 69, 28, 0.05) 0%,
            transparent 30%,
            rgba(250, 207, 60, 0.03) 70%,
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
          border: 2px solid rgba(250, 207, 60, 0.3);
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
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.6;
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
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            margin: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          
          .image-section {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
          }
          
          .image-overlay {
            background: linear-gradient(
              180deg,
              transparent 0%,
              rgba(255, 255, 255, 0.1) 20%,
              rgba(255, 255, 255, 0.3) 40%,
              rgba(255, 255, 255, 0.6) 60%,
              rgba(255, 255, 255, 0.8) 80%,
              rgba(255, 255, 255, 0.95) 100%
            );
          }
          
          .accent-elements {
            display: none;
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
          
          .cta-button {
            padding: 14px 28px;
            font-size: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .image-container {
            margin-top: 40px;
          }
          
          .cta-button {
            padding: 12px 24px;
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
          <button className="cta-button" onClick={handleStartClick}>
            Start
          </button>
            <button className="cta-button" onClick={handleStartClick}>
            Read Impact Stories
          </button>
        </div>
        
        <div className="image-section">
          <img
            src={imageError ? fallbackImage : imagePaths[currentPathIndex]}
            alt="Community empowerment and grassroots development"
            className="main-image"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
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