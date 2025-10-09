import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme, withOpacity } from '../../theme';
import { API_URL, STATIC_URL } from '../../config';
import { Users, Globe, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

const VirtualVolunteerismBanner = () => {
  const navigate = useNavigate();
  const { theme, colors, isDarkMode } = useTheme();
  
  const [volunteerImage, setVolunteerImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  const defaultImage = 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=1200&q=80';
  const fallbackImage = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80';
  
  const loadingMessages = [
    "Please wait as I match you to the right opportunities...",
    "Finding volunteer programs that suit your interests...",
    "Connecting you with meaningful impact opportunities...",
    "Preparing your personalized volunteer experience...",
    "Almost there! Setting up your dashboard..."
  ];

  useEffect(() => {
    const fetchVolunteerImage = async () => {
      try {
        setImageLoading(true);
        setApiError(false);
        const response = await fetch(`${API_URL}/gallery/protected`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const images = data.data || [];
          
          const posterImage = images.find(img => 
            img.category === 'volunteer_banner' && 
            img.is_active && 
            img.image_url
          );
          
          setVolunteerImage(posterImage);
        } else {
          setApiError(true);
        }
      } catch (error) {
        console.error('Error fetching volunteer image:', error);
        setApiError(true);
      } finally {
        setImageLoading(false);
      }
    };

    fetchVolunteerImage();
  }, []);

  // Rotate loading messages
  useEffect(() => {
    if (isNavigating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [isNavigating]);

  const handleJoinProgram = () => {
    setIsNavigating(true);
    navigate('/get-involved', { state: { autoStartFlow: 'volunteer' } });
  };

  const getImageSource = () => {
    if (apiError) {
      return fallbackImage;
    }
    if (volunteerImage && volunteerImage.image_url) {
      const imageUrl = volunteerImage.image_url.startsWith('http') 
        ? volunteerImage.image_url 
        : `${STATIC_URL}${volunteerImage.image_url}`;
      return imageUrl;
    }
    return defaultImage;
  };

  const getImageAlt = () => {
    if (volunteerImage && volunteerImage.alt_text) {
      return volunteerImage.alt_text;
    }
    return 'Conservation volunteer program';
  };

  const styles = {
    container: {
      width: '100%',
      backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
      padding: '0',
      fontFamily: '"Nunito Sans", sans-serif',
      position: 'relative',
    },

    innerWrapper: {
      maxWidth: '1600px',
      margin: '0 auto',
      position: 'relative',
    },

    imageWrapper: {
      position: 'relative',
      width: '100%',
      height: '65vh',
      minHeight: '500px',
      maxHeight: '700px',
      overflow: 'hidden',
    },

    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
    },

    loadingPlaceholder: {
      width: '100%',
      height: '100%',
      background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDarkMode ? '#666' : '#999',
      fontSize: '0.875rem',
    },

    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: isDarkMode 
        ? `linear-gradient(to top, ${withOpacity('#000000', 0.85)} 0%, ${withOpacity('#000000', 0.6)} 40%, transparent 100%)`
        : `linear-gradient(to top, ${withOpacity('#FFFFFF', 0.95)} 0%, ${withOpacity('#FFFFFF', 0.7)} 40%, transparent 100%)`,
      padding: '80px 60px 60px',
    },

    contentGrid: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '80px',
    },

    textContent: {
      flex: '1',
      maxWidth: '600px',
    },

    eyebrow: {
      fontSize: '0.6875rem',
      fontWeight: '600',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: isDarkMode ? '#999' : '#666',
      marginBottom: '16px',
    },

    title: {
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      fontWeight: '200',
      lineHeight: '1',
      color: isDarkMode ? '#FFFFFF' : '#000000',
      margin: '0 0 20px 0',
      letterSpacing: '-0.03em',
    },

    titleEmphasis: {
      fontWeight: '800',
      color: colors.primary,
    },

    description: {
      fontSize: '1rem',
      lineHeight: '1.7',
      color: isDarkMode ? '#CCCCCC' : '#333333',
      fontWeight: '400',
      margin: '0 0 32px 0',
    },

    metaSection: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignItems: 'flex-end',
    },

    tags: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
    },

    tag: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.875rem',
      color: isDarkMode ? '#AAA' : '#555',
      fontWeight: '500',
    },

    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px 32px',
      fontSize: '0.9375rem',
      fontWeight: '600',
      color: isDarkMode ? '#000000' : '#FFFFFF',
      backgroundColor: colors.primary,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      borderRadius: '2px',
    },

    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    },

    birdContainer: {
      marginBottom: '20px',
    },

    loadingText: {
      color: '#FFFFFF',
      fontSize: '18px',
      fontWeight: '500',
      textAlign: 'center',
      padding: '0 20px',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <>
      <section style={styles.container}>
        <div style={styles.innerWrapper}>
          <div style={styles.imageWrapper} className="imageWrapper">
            {imageLoading ? (
              <div style={styles.loadingPlaceholder}>
                Loading image...
              </div>
            ) : (
              <motion.img
                src={getImageSource()}
                alt={getImageAlt()}
                style={styles.image}
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            )}
            
            <div style={styles.overlay}>
              <div style={styles.contentGrid} className="contentGrid">
                <motion.div
                  style={styles.textContent}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8 }}
                >
                  <div style={styles.eyebrow}>VOLUNTEER PROGRAM</div>
                  
                  <h2 style={styles.title}>
                    Global <span style={styles.titleEmphasis}>Volunteers Program</span>
                  </h2>
                  
                  <p style={styles.description}>
                    Join a global community of students, experts, and researchers dedicated to 
                    environmental conservation and sustainable legal practices across Africa.
                  </p>
                </motion.div>

                <motion.div
                  style={styles.metaSection}
                  className="metaSection"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div style={styles.tags} className="tags">
                    <span style={styles.tag}>
                      <GraduationCap size={16} strokeWidth={1.5} />
                      Students
                    </span>
                    <span style={styles.tag}>
                      <Users size={16} strokeWidth={1.5} />
                      Experts
                    </span>
                    <span style={styles.tag}>
                      <BookOpen size={16} strokeWidth={1.5} />
                      Researchers
                    </span>
                    <span style={styles.tag}>
                      <Globe size={16} strokeWidth={1.5} />
                      Global
                    </span>
                  </div>
                  
                  <motion.button
                    style={styles.button}
                    onClick={handleJoinProgram}
                    disabled={isNavigating}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Join the Program
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .contentGrid {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 40px !important;
            }
            
            .metaSection {
              align-items: flex-start !important;
              width: 100%;
            }
            
            .tags {
              flex-wrap: wrap;
            }
          }

          @media (max-width: 768px) {
            .imageWrapper {
              height: 100vh !important;
              min-height: 600px !important;
            }
            
            .tags {
              gap: 12px !important;
            }
          }

          @media (max-width: 640px) {
            .contentGrid {
              padding: 0 !important;
            }
          }

          @keyframes flyBird {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            25% {
              transform: translateY(-15px) translateX(10px);
            }
            50% {
              transform: translateY(-5px) translateX(20px);
            }
            75% {
              transform: translateY(-20px) translateX(10px);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }

          @keyframes fadeInOut {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            10% {
              opacity: 1;
              transform: translateY(0);
            }
            90% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-10px);
            }
          }

          .bird-animation {
            animation: flyBird 2s ease-in-out infinite;
          }

          .pulse-animation {
            animation: pulse 1.5s ease-in-out infinite;
          }

          .message-animation {
            animation: fadeInOut 2.5s ease-in-out;
          }
        `}</style>
      </section>

      {/* Bird Loading Overlay */}
      {isNavigating && (
        <div style={styles.loadingOverlay}>
          <div style={styles.birdContainer} className="bird-animation">
            <img
              src="/bird.png"
              alt="Loading"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{
              fontSize: '60px',
              display: 'none'
            }}>
              🐦
            </div>
          </div>
          
          <div 
            className="message-animation"
            style={styles.loadingText}
            key={loadingMessageIndex}
          >
            {loadingMessages[loadingMessageIndex]}
          </div>
          
          <div style={{
            marginTop: '16px',
            display: 'flex',
            gap: '8px'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="pulse-animation"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#9ccf9f',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualVolunteerismBanner;