import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';
import { Facebook, Linkedin, Instagram, Youtube, Twitter } from "lucide-react";

const ImageFallbackComponent = ({ onStartClick }) => {
  const [imageError, setImageError] = useState(false);
  const { colors, isDarkMode } = useTheme();
  
  // Gallery state
  const [galleryImages, setGalleryImages] = useState({
    light: null,
    dark: null
  });
  const [galleryLoading, setGalleryLoading] = useState(true);
  
  const imagePaths = [
    "/heroimageget.jpg",
    "./heroimageget.jpg",
    "heroimageget.jpg",
    "/public/heroimageget.jpg",
    process.env.PUBLIC_URL + "/heroimageget.jpg"
  ];
  
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const fallbackImage = `https://picsum.photos/800/1000?random=${Date.now()}`;
  
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/172ZDMd2dL/",
      icon: Facebook,
      color: "#1877F2"
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/acef-africa-climate-and-environment-foundation/",
      icon: Linkedin,
      color: "#0A66C2"
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/acefngo?igsh=MXE3YXRmd2hvZ2xodg==",
      icon: Instagram,
      color: "#E1306C"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@acef-africaclimateandenvir6363?si=YfaOJ9L1IpKG0H8X",
      icon: Youtube,
      color: "#FF0000"
    },
    {
      name: "X",
      url: "https://x.com/ACEFngo?t=H00D4LR0XgHHRHS73lQ76A&s=09",
      icon: Twitter,
      color: isDarkMode ? "#ffffff" : "#000000"
    }
  ];
  
  // Fetch gallery images on component mount
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setGalleryLoading(true);
        const response = await fetch(`${API_URL}/gallery/protected`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const images = data.data || [];
          
          const lightModeImage = images.find(img => 
            img.category === 'get_involved_light' && 
            img.is_active && 
            img.image_url && 
            img.title !== 'Country Image Placeholder'
          );
          
          const darkModeImage = images.find(img => 
            img.category === 'get_involved_dark' && 
            img.is_active && 
            img.image_url && 
            img.title !== 'Country Image Placeholder'
          );
          
          setGalleryImages({
            light: lightModeImage,
            dark: darkModeImage
          });
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);
  
  const handleImageError = () => {
    if (currentPathIndex < imagePaths.length - 1) {
      setCurrentPathIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
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

  // Get the appropriate image source
  const getImageSource = () => {
    if (galleryLoading) {
      return null;
    }
    
    const galleryImage = isDarkMode ? galleryImages.dark : galleryImages.light;
    
    if (galleryImage && galleryImage.image_url) {
      const imageUrl = galleryImage.image_url.startsWith('http') 
        ? galleryImage.image_url 
        : `${STATIC_URL}${galleryImage.image_url}`;
      return imageUrl;
    }
    
    if (imageError) {
      return fallbackImage;
    }
    
    return imagePaths[currentPathIndex];
  };

  const getImageAlt = () => {
    const galleryImage = isDarkMode ? galleryImages.dark : galleryImages.light;
    if (galleryImage && galleryImage.alt_text) {
      return galleryImage.alt_text;
    }
    return "Community empowerment and grassroots development";
  };

  const imageSource = getImageSource();

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
          font-family: inherit;
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
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: ${colors.primary};
          line-height: 1.2;
          letter-spacing: -0.02em;
          font-family: inherit;
        }
        
        .text-content p {
          font-size: clamp(0.5rem, 0.8vw, 0.7rem);
          line-height: 1.8;
          margin-bottom: 3rem;
          color: ${colors.textSecondary};
          font-weight: 400;
        }
        
        .button-group {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        
        .social-links {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
          padding-top: 2rem;
          border-top: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }
        
        .social-links a {
          transition: transform 0.3s ease, opacity 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .social-links a:hover {
          transform: translateY(-3px);
          opacity: 0.8;
        }
        
        .cta-button {
          background-color: ${colors.primary};
          color: ${colors.white || '#ffffff'};
          padding: 14px 32px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: inherit;
          text-decoration: none;
        }
        
        .secondary-button {
          background-color: transparent;
          color: ${colors.primary};
          border: 2px solid ${colors.primary};
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: inherit;
          text-decoration: none;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        
        .secondary-button:hover {
          transform: translateY(-2px);
          background-color: ${colors.primary};
          color: ${colors.white || '#ffffff'};
        }
        
        .cta-button:active,
        .secondary-button:active {
          transform: translateY(0);
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
        
        .loading-placeholder {
          width: 100%;
          height: 100%;
          background: ${isDarkMode ? 'rgba(40, 40, 40, 0.8)' : 'rgba(240, 240, 240, 0.8)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.textSecondary};
          font-size: 1.2rem;
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
        
        .highlight {
          background: linear-gradient(135deg, ${colors.secondary}, #f0c346);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
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
            border-radius: 16px;
            margin: 2rem;
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
          
          .button-group {
            justify-content: center;
            gap: 1rem;
          }
          
          .social-links {
            justify-content: center;
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
            padding: 12px 24px;
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
          
          .social-links {
            gap: 18px;
          }
        }
        
        @media (max-width: 480px) {
          .image-container {
            margin-top: 40px;
          }
          
          .cta-button,
          .secondary-button {
            padding: 10px 20px;
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
          
          <div className="social-links">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  style={{ 
                    color: social.color,
                    textDecoration: "none",
                  }}
                >
                  <IconComponent size={24} strokeWidth={1.5} />
                </a>
              );
            })}
            
            {/* TikTok SVG */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              style={{ 
                color: isDarkMode ? "#ffffff" : "#000000",
                textDecoration: "none",
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="image-section">
          {galleryLoading ? (
            <div className="loading-placeholder">
              Loading...
            </div>
          ) : isDarkMode ? (
            galleryImages.dark && galleryImages.dark.image_url ? (
              <img
                src={getImageSource()}
                alt={getImageAlt()}
                className="main-image"
                onError={handleImageError}
              />
            ) : (
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
            )
          ) : (
            galleryImages.light && galleryImages.light.image_url ? (
              <img
                src={getImageSource()}
                alt={getImageAlt()}
                className="main-image"
                onError={handleImageError}
              />
            ) : (
              <img
                src={imageError ? fallbackImage : imagePaths[currentPathIndex]}
                alt="Community empowerment and grassroots development"
                className="main-image"
                onError={handleImageError}
              />
            )
          )}

          <div className="image-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default ImageFallbackComponent;