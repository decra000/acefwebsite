import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';
import { Facebook, Linkedin, Instagram, Youtube, Twitter, ArrowRight, Sparkles } from "lucide-react";

const ImageFallbackComponent = ({ onStartClick }) => {
  const [imageError, setImageError] = useState(false);
  const { colors, isDarkMode } = useTheme();
  
  const [galleryImages, setGalleryImages] = useState({ light: null, dark: null });
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
    { name: "Facebook", url: "https://www.facebook.com/share/172ZDMd2dL/", icon: Facebook, color: "#1877F2" },
    { name: "LinkedIn", url: "https://www.linkedin.com/company/acef-africa-climate-and-environment-foundation/", icon: Linkedin, color: "#0A66C2" },
    { name: "Instagram", url: "https://www.instagram.com/acefngo?igsh=MXE3YXRmd2hvZ2xodg==", icon: Instagram, color: "#E1306C" },
    { name: "YouTube", url: "https://youtube.com/@acef-africaclimateandenvir6363?si=YfaOJ9L1IpKG0H8X", icon: Youtube, color: "#FF0000" },
    { name: "X", url: "https://x.com/ACEFngo?t=H00D4LR0XgHHRHS73lQ76A&s=09", icon: Twitter, color: isDarkMode ? "#ffffff" : "#000000" }
  ];
  
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setGalleryLoading(true);
        const response = await fetch(`${API_URL}/gallery/protected`, { credentials: 'include' });
        
        if (response.ok) {
          const data = await response.json();
          const images = data.data || [];
          
          const lightModeImage = images.find(img => 
            img.category === 'get_involved_light' && img.is_active && img.image_url && img.title !== 'Country Image Placeholder'
          );
          
          const darkModeImage = images.find(img => 
            img.category === 'get_involved_dark' && img.is_active && img.image_url && img.title !== 'Country Image Placeholder'
          );
          
          setGalleryImages({ light: lightModeImage, dark: darkModeImage });
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
    if (onStartClick) onStartClick();
  };

  const handleReadStoriesClick = () => {
    let testimonialSection = document.getElementById('collvolunteerstestimonials');
    
    if (!testimonialSection) {
      testimonialSection = document.querySelector('[data-section="collvolunteerstestimonials"]');
    }
    
    if (!testimonialSection) {
      testimonialSection = document.querySelector('.collvolunteerstestimonials, .testimonials-section, [class*="testimonial"]');
    }
    
    if (testimonialSection) {
      const headerOffset = 100;
      const elementPosition = testimonialSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.warn('Testimonials section not found');
    }
  };

  const getImageSource = () => {
    if (galleryLoading) return null;
    const galleryImage = isDarkMode ? galleryImages.dark : galleryImages.light;
    if (galleryImage && galleryImage.image_url) {
      return galleryImage.image_url.startsWith('http') ? galleryImage.image_url : `${STATIC_URL}${galleryImage.image_url}`;
    }
    return imageError ? fallbackImage : imagePaths[currentPathIndex];
  };

  const getImageAlt = () => {
    const galleryImage = isDarkMode ? galleryImages.dark : galleryImages.light;
    return galleryImage?.alt_text || "Community empowerment and grassroots development";
  };

  const imageSource = getImageSource();
  
  // Strip alpha channel from surface color if present
  const surfaceColor = colors.surface.length === 9 ? colors.surface.slice(0, 7) : colors.surface;

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
          font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif;
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
        }
        
        .text-content h1 {
          font-size: clamp(1.85rem, 4vw, 3.25rem);
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: ${colors.primary};
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .text-content h1 .highlight-word {
          font-weight: 800;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .text-content p {
          font-size: clamp(0.875rem, 1.1vw, 1rem);
          line-height: 1.7;
          margin-bottom: 2.5rem;
          color: ${colors.textSecondary};
          font-weight: 400;
        }
        
        .button-group {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        
        .social-links {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
          padding-top: 1.75rem;
          border-top: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
        }
        
        .social-links a {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
        }
        
        .social-links a:hover {
          transform: translateY(-3px) scale(1.05);
          opacity: 1;
        }
        
        .cta-button {
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          color: ${colors.white || '#ffffff'};
          padding: 14px 32px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          text-decoration: none;
          box-shadow: 0 6px 24px ${isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.12)'};
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .cta-button:hover::before {
          opacity: 1;
        }
        
        .secondary-button {
          background-color: transparent;
          color: ${colors.primary};
          border: 1.5px solid ${isDarkMode ? `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.4)` : colors.primary};
          padding: 13px 30px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          text-decoration: none;
          backdrop-filter: blur(10px);
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)'};
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.16)'};
        }
        
        .secondary-button:hover {
          transform: translateY(-2px);
          background: ${colors.primary};
          color: ${colors.white || '#ffffff'};
          border-color: ${colors.primary};
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
          background: ${isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(245, 245, 245, 0.8)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.textSecondary};
          font-size: 1.1rem;
          backdrop-filter: blur(10px);
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          pointer-events: none;
        }

        .image-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${
            isDarkMode
              ? `linear-gradient(
                  to right,
                  ${surfaceColor} 0%,
                  ${surfaceColor}f5 2%,
                  ${surfaceColor}eb 4%,
                  ${surfaceColor}dd 7%,
                  ${surfaceColor}cc 10%,
                  ${surfaceColor}b8 14%,
                  ${surfaceColor}a1 18%,
                  ${surfaceColor}87 23%,
                  ${surfaceColor}6b 28%,
                  ${surfaceColor}4d 34%,
                  ${surfaceColor}33 41%,
                  ${surfaceColor}1f 48%,
                  ${surfaceColor}0f 56%,
                  ${surfaceColor}05 65%,
                  transparent 75%
                )`
              : `linear-gradient(
                  to right,
                  ${surfaceColor} 0%,
                  ${surfaceColor}f8 1%,
                  ${surfaceColor}f0 3%,
                  ${surfaceColor}e8 5%,
                  ${surfaceColor}dd 8%,
                  ${surfaceColor}d1 11%,
                  ${surfaceColor}c2 15%,
                  ${surfaceColor}b0 19%,
                  ${surfaceColor}9c 24%,
                  ${surfaceColor}85 30%,
                  ${surfaceColor}6b 36%,
                  ${surfaceColor}52 43%,
                  ${surfaceColor}3d 50%,
                  ${surfaceColor}29 58%,
                  ${surfaceColor}17 66%,
                  ${surfaceColor}0a 74%,
                  ${surfaceColor}03 82%,
                  transparent 90%
                )`
          };
        }
        
        .highlight {
          background: linear-gradient(135deg, ${colors.secondary}, ${colors.secondaryLight || '#f0c346'});
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 600;
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
            backdrop-filter: blur(10px);
            background: ${isDarkMode ? 'rgba(18, 18, 18, 0.92)' : 'rgba(255, 255, 255, 0.92)'};
            border-radius: 20px;
            margin: 2rem;
            border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
          }
          
          .image-section {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
          }
          
          .image-overlay::before {
            background: ${
              isDarkMode
                ? `radial-gradient(
                    ellipse at center,
                    transparent 0%,
                    ${surfaceColor}14 15%,
                    ${surfaceColor}2b 28%,
                    ${surfaceColor}47 40%,
                    ${surfaceColor}66 52%,
                    ${surfaceColor}85 64%,
                    ${surfaceColor}a3 76%,
                    ${surfaceColor}bd 85%,
                    ${surfaceColor}d9 93%,
                    ${surfaceColor}eb 98%
                  )`
                : `radial-gradient(
                    ellipse at center,
                    transparent 0%,
                    ${surfaceColor}1a 20%,
                    ${surfaceColor}40 35%,
                    ${surfaceColor}66 48%,
                    ${surfaceColor}8c 60%,
                    ${surfaceColor}b3 72%,
                    ${surfaceColor}cc 82%,
                    ${surfaceColor}e6 91%,
                    ${surfaceColor}f2 97%
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
            font-size: 14px;
          }
          
          .button-group {
            flex-direction: column;
            gap: 0.875rem;
            width: 100%;
          }
          
          .cta-button,
          .secondary-button {
            width: 100%;
            justify-content: center;
          }
          
          .social-links {
            gap: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .image-container {
            margin-top: 40px;
          }
          
          .cta-button,
          .secondary-button {
            padding: 11px 20px;
            font-size: 13px;
          }
        }
      `}</style>
      
      <div className="content-wrapper">
        <div className="text-content">
          <h1>
            Join ACEF in <span className="highlight-word">Empowering</span> Grassroots
          </h1>
          <p>
            Be part of a movement that transforms communities from the ground up. 
            Together, we're building sustainable solutions, fostering innovation, 
            and creating lasting change that <span className="highlight">empowers every voice</span>. 
            Your involvement makes the difference between hope and reality for countless lives across Africa.
          </p>
          <div className="button-group">
            <button className="cta-button" onClick={handleStartClick}>
              <Sparkles size={18} />
              Get Started
            </button>
            <button className="secondary-button" onClick={handleReadStoriesClick}>
              Read Impact Stories
              <ArrowRight size={16} strokeWidth={2.5} />
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
                  style={{ color: social.color, textDecoration: "none" }}
                >
                  <IconComponent size={22} strokeWidth={1.5} />
                </a>
              );
            })}
            
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              style={{ color: isDarkMode ? "#ffffff" : "#000000", textDecoration: "none" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="image-section">
          {galleryLoading ? (
            <div className="loading-placeholder">Loading...</div>
          ) : isDarkMode ? (
            galleryImages.dark && galleryImages.dark.image_url ? (
              <img src={getImageSource()} alt={getImageAlt()} className="main-image" onError={handleImageError} />
            ) : (
              <video className="main-image" autoPlay loop muted playsInline>
                <source src="/plantdripping.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            galleryImages.light && galleryImages.light.image_url ? (
              <img src={getImageSource()} alt={getImageAlt()} className="main-image" onError={handleImageError} />
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