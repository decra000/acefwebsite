import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Leaf, 
  Waves, 
  Recycle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, STATIC_URL } from '../config';

const ACEFHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [heroSlides, setHeroSlides] = useState([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);
  const intervalRef = useRef(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Default fallback slides data with professional environmental footage
  const defaultSlides = [
    {
      id: 1,
      title: "Africa Climate & Environment Foundation",
      subtitle: "Empowering Grassroots for a Sustainable Future",
      description: "Transforming communities across Africa through innovative climate solutions, environmental education, and sustainable development programs that create lasting positive change from the ground up.",
      cta: "Get Involved",
      ctaUrl: "get-involved",
      secondaryCta: "Impact",
      secondaryUrl: "impact",
      icon: Leaf,
      gradient: "from-green-600 via-emerald-500 to-lime-400",
      particleColor: "#10b981",
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 2,
      title: "Marine Conservation Revolution",
      subtitle: "Protecting Our Blue Planet",
      description: "Advanced AI-driven monitoring systems safeguarding marine ecosystems across the African coastline, utilizing cutting-edge satellite technology and autonomous underwater vehicles to preserve biodiversity for future generations.",
      cta: "Explore Impact",
      ctaUrl: "impact",
      secondaryCta: "Impact",
      secondaryUrl: "impact",
      icon: Waves,
      gradient: "from-blue-600 via-cyan-500 to-teal-400",
      particleColor: "#06b6d4",
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 3,
      title: "Reforestation",
      subtitle: "Restoring Africa's Green Heritage",
      description: "Comprehensive reforestation initiatives combining traditional knowledge with modern techniques to restore degraded landscapes, combat desertification, and create sustainable livelihoods for local communities across the continent.",
      cta: "Get Involved",
      ctaUrl: "get-involved",
      secondaryCta: "Impact", 
      secondaryUrl: "impact",
      icon: Leaf,
      gradient: "from-green-600 via-emerald-500 to-lime-400",
      particleColor: "#10b981",
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 4,
      title: "Waste Management",
      subtitle: "From Waste to Resource",
      description: "Next-generation waste management solutions converting waste streams into sustainable resources using molecular-level transformation technologies that redefine the relationship between consumption and environmental impact.",
      cta: "Learn More",
      ctaUrl: "about-us",
      secondaryCta: "Impact",
      secondaryUrl: "impact", 
      icon: Recycle,
      gradient: "from-purple-600 via-violet-500 to-indigo-400",
      particleColor: "#8b5cf6",
      bgImage: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4"
    }
  ];

  // Fetch hero slides from gallery API
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        setSlidesLoading(true);
        const response = await fetch(`${API_URL}/gallery/protected?section=home_hero_slides`, { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const slideImages = data.data
            ?.filter(img => img.category === 'home_hero_slides')
            ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            ?.slice(0, 4);

          if (slideImages && slideImages.length > 0) {
            const gallerySlides = slideImages.map((img, index) => {
              const defaultSlide = defaultSlides[index] || defaultSlides[0];
              return {
                ...defaultSlide,
                id: img.id,
                title: img.title || defaultSlide.title,
                subtitle: img.description || defaultSlide.subtitle,
                description: img.alt_text || defaultSlide.description,
                bgImage: getImageUrl(img)
              };
            });
            setHeroSlides(gallerySlides);
          } else {
            setHeroSlides(defaultSlides);
          }
        } else {
          setHeroSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        setHeroSlides(defaultSlides);
      } finally {
        setSlidesLoading(false);
      }
    };

    fetchHeroSlides();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image?.image_url) return null;
    if (image.image_url.startsWith('http')) {
      return image.image_url;
    }
    return `${STATIC_URL}${image.image_url}`;
  };

  const slides = heroSlides;

  // Initialize particles
  useEffect(() => {
    const createParticles = () => {
      const newParticles = [];
      const particleCount = isMobile ? 20 : 35;
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 0.5,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
      setParticles(newParticles);
    };

    createParticles();
    setIsLoaded(true);
  }, [isMobile]);

  // Animate particles
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId;
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.speedX + 100) % 100,
        y: (particle.y + particle.speedY + 100) % 100,
        opacity: 0.1 + Math.sin(Date.now() * 0.001 + particle.id) * 0.15,
      })));
      
      animationFrameId = requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, slides.length]);

  // Mouse tracking for parallax
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current || isMobile) return;
    
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x: x * 100, y: y * 100 });
  }, [isMobile]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const goToSlide = (index) => {
    if (index !== currentSlide && slides.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }
  };

  // Show loading state
  if (slidesLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'relative',
          height: isMobile ? '100vh' : '120vh',
          minHeight: isMobile ? '700px' : '900px',
          width: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a451c 0%, #052310 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Nunito Sans", sans-serif',
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: '#ffffff'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(156, 207, 159, 0.2)',
            borderTop: '4px solid #9ccf9f',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9 }}>
            Loading hero content...
          </p>
        </div>
      </motion.div>
    );
  }

  // If no slides available
  if (slides.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'relative',
          height: isMobile ? '100vh' : '120vh',
          minHeight: isMobile ? '700px' : '900px',
          width: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a451c 0%, #052310 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Nunito Sans", sans-serif',
          color: '#ffffff',
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Africa Climate & Environment Foundation
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
            Empowering Grassroots for a Sustainable Future
          </p>
        </div>
      </motion.div>
    );
  }

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div 
      ref={heroRef}
      className="hero-container"
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        height: isMobile ? '100vh' : '120vh',
        minHeight: isMobile ? '700px' : '900px',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a451c 0%, #052310 100%)',
        fontFamily: '"Nunito Sans", sans-serif',
      }}
    >
      {/* Background Media Layer */}
      <AnimatePresence mode="wait">
        {currentSlideData.bgImage && (
          <motion.div
            key={currentSlideData.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
            }}
          >
            {currentSlideData.bgImage.includes('.mp4') ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: isMobile ? 'scale(1.05)' : `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px) scale(1.05)`,
                  transition: 'transform 0.3s ease-out',
                  filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
                }}
                onError={(e) => {
                  console.error('Video failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
              >
                <source src={currentSlideData.bgImage} type="video/mp4" />
              </video>
            ) : (
              <img
                src={currentSlideData.bgImage}
                alt={currentSlideData.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: isMobile ? 'scale(1.05)' : `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px) scale(1.05)`,
                  transition: 'transform 0.3s ease-out',
                  filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
                }}
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: isMobile ? '100%' : '60%',
          height: '100%',
          background: isMobile 
            ? 'linear-gradient(180deg, rgba(10, 69, 28, 0.9) 0%, rgba(10, 69, 28, 0.7) 50%, rgba(10, 69, 28, 0.5) 100%)'
            : 'linear-gradient(90deg, rgba(10, 69, 28, 0.95) 0%, rgba(10, 69, 28, 0.85) 25%, rgba(10, 69, 28, 0.7) 50%, rgba(10, 69, 28, 0.4) 75%, rgba(10, 69, 28, 0.1) 90%, transparent 100%)',
          zIndex: 2,
        }}
      />

      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 20% 40%, rgba(5, 35, 16, 0.3) 0%, transparent 70%), linear-gradient(180deg, rgba(5, 35, 16, 0.1) 0%, rgba(5, 35, 16, 0.3) 100%)',
          zIndex: 1,
        }}
      />

      {/* Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: isMobile ? 0.3 : 0.6,
        zIndex: 3,
      }}>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            animate={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              opacity: particle.opacity,
            }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(156, 207, 159, ${particle.opacity}) 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(0.3px)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100vh',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 2rem' : '0 clamp(3rem, 6vw, 8rem)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr auto',
        gap: isMobile ? '2rem' : 'clamp(3rem, 5vh, 5rem)',
      }}>
        
        {/* Header - Only first slide */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: currentSlide === 0 ? 1 : 0,
            y: currentSlide === 0 ? 0 : 30,
            visibility: currentSlide === 0 ? 'visible' : 'hidden'
          }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            paddingTop: isMobile ? '2rem' : 'clamp(3rem, 6vh, 5rem)',
            height: isMobile ? 'auto' : 'clamp(6rem, 10vh, 8rem)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.75rem, 1.5vw, 1rem)',
          }}>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                padding: '12px',
                background: 'rgba(252, 207, 60, 0.15)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComponent size={isMobile ? 28 : 32} color="#facf3c" strokeWidth={1.5} />
            </motion.div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              <span style={{
                color: '#facf3c',
                fontSize: isMobile ? '0.85rem' : 'clamp(0.9rem, 1.2vw, 1rem)',
                fontWeight: '700',
                letterSpacing: '0.05em',
                lineHeight: '1.2',
              }}>
                ACEF
              </span>
              <span style={{
                color: '#9ccf9f',
                fontSize: isMobile ? '0.7rem' : 'clamp(0.75rem, 1vw, 0.85rem)',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                lineHeight: '1.2',
              }}>
                Foundation
              </span>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: isMobile ? '1.5rem' : 'clamp(2rem, 4vh, 3.5rem)',
          maxWidth: isMobile ? '100%' : 'clamp(400px, 55vw, 1000px)',
          paddingRight: isMobile ? '0' : 'clamp(2rem, 5vw, 4rem)',
        }}>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1 
                style={{
                  fontSize: isMobile ? 'clamp(2rem, 10vw, 2.5rem)' : 'clamp(2.5rem, 7vw, 5.5rem)',
                  fontWeight: '700',
                  lineHeight: '1.05',
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '0 4px 30px rgba(0, 0, 0, 0.7), 0 2px 10px rgba(0, 0, 0, 0.5)',
                  letterSpacing: '-0.02em',
                  marginBottom: isMobile ? '1rem' : '0',
                }}
              >
                {currentSlideData.title}
              </motion.h1>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`subtitle-${currentSlide}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 style={{
                fontSize: isMobile ? 'clamp(1rem, 5vw, 1.25rem)' : 'clamp(1.1rem, 2.5vw, 1.6rem)',
                fontWeight: '500',
                color: '#facf3c',
                margin: 0,
                letterSpacing: '0.02em',
                textShadow: '0 2px 20px rgba(252, 207, 60, 0.3), 0 1px 8px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                paddingBottom: '12px',
              }}>
                {currentSlideData.subtitle}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '60px' }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #facf3c, transparent)',
                  }}
                />
              </h2>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                fontSize: isMobile ? 'clamp(0.85rem, 4vw, 1rem)' : 'clamp(0.9rem, 1.4vw, 1.1rem)',
                lineHeight: '1.7',
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: isMobile ? '100%' : 'clamp(320px, 50vw, 600px)',
                margin: 0,
                fontWeight: '400',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.01em',
              }}
            >
              {currentSlideData.description}
            </motion.p>
          </AnimatePresence>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: isMobile ? '1rem' : 'clamp(1.25rem, 2.5vw, 2rem)',
              alignItems: 'center',
              marginTop: isMobile ? '1rem' : 'clamp(1.5rem, 3vh, 2.5rem)',
            }}
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (currentSlideData.ctaUrl) {
                  window.location.href = `/${currentSlideData.ctaUrl}`;
                }
              }}
              style={{
                padding: isMobile ? '0.85rem 1.5rem' : 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.8rem, 3.5vw, 2.4rem)',
                fontSize: isMobile ? '0.85rem' : 'clamp(0.9rem, 1.1vw, 1rem)',
                fontWeight: '600',
                color: '#0a451c',
                backgroundColor: '#facf3c',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(0.5rem, 1vw, 0.7rem)',
                boxShadow: '0 8px 32px rgba(252, 207, 60, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
              }}
            >
              {currentSlideData.cta}
              <ArrowRight size={18} strokeWidth={2} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (currentSlideData.secondaryUrl) {
                  window.location.href = `/${currentSlideData.secondaryUrl}`;
                }
              }}
              style={{
                padding: isMobile ? '0.85rem 1.5rem' : 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.5rem, 3vw, 2rem)',
                fontSize: isMobile ? '0.85rem' : 'clamp(0.9rem, 1.1vw, 1rem)',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: 'rgba(156, 207, 159, 0.15)',
                border: '1px solid rgba(156, 207, 159, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
              }}
            >
              {currentSlideData.secondaryCta}
            </motion.button>
          </motion.div>
        </main>

        {/* Footer Controls */}
        <footer style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: isMobile ? '2rem' : 'clamp(3rem, 5vh, 4rem)',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1.5rem' : '0',
        }}>
          
          {/* Media Controls */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              display: 'flex',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
              order: isMobile ? 2 : 1,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayPause}
              style={{
                width: isMobile ? '48px' : 'clamp(52px, 7vw, 56px)',
                height: isMobile ? '48px' : 'clamp(52px, 7vw, 56px)',
                backgroundColor: 'rgba(156, 207, 159, 0.15)',
                border: '1px solid rgba(156, 207, 159, 0.3)',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.25)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 24px rgba(156, 207, 159, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.15)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
            >
              {isPlaying ? <Pause size={20} strokeWidth={1.5} /> : <Play size={20} strokeWidth={1.5} />}
            </motion.button>

            <button
              onClick={toggleMute}
              style={{
                width: 'clamp(52px, 7vw, 56px)',
                height: 'clamp(52px, 7vw, 56px)',
                backgroundColor: 'rgba(156, 207, 159, 0.15)',
                border: '1px solid rgba(156, 207, 159, 0.3)',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.25)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 24px rgba(156, 207, 159, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.15)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
            >
              {isMuted ? <VolumeX size={20} strokeWidth={1.5} /> : <Volume2 size={20} strokeWidth={1.5} />}
            </button>
          </motion.div>

          {/* Premium Slide Indicators */}
          <div style={{
            display: 'flex',
            gap: 'clamp(1rem, 1.5vw, 1.25rem)',
            alignItems: 'center',
          }}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: currentSlide === index ? 'clamp(40px, 6vw, 48px)' : 'clamp(20px, 3vw, 24px)',
                  height: 'clamp(3px, 0.4vw, 4px)',
                  backgroundColor: currentSlide === index ? '#facf3c' : 'rgba(156, 207, 159, 0.4)',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: currentSlide === index ? '0 0 12px rgba(252, 207, 60, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  if (index !== currentSlide) {
                    e.target.style.backgroundColor = 'rgba(252, 207, 60, 0.6)';
                    e.target.style.width = 'clamp(30px, 5vw, 36px)';
                    e.target.style.boxShadow = '0 0 8px rgba(252, 207, 60, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentSlide) {
                    e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.4)';
                    e.target.style.width = 'clamp(20px, 3vw, 24px)';
                    e.target.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {currentSlide === index && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#facf3c',
                    animation: 'progress 8s linear infinite',
                    transformOrigin: 'left',
                  }} />
                )}
              </button>
            ))}
          </div>
        </footer>
      </div>



      {/* Custom CSS animations with scroll optimization */}
      <style jsx>{`
        /* Optimize scroll performance */
        * {
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }

        /* Reduce motion for performance */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateX(-50%) translateY(0px); 
            opacity: 0.8; 
          }
          50% { 
            transform: translateX(-50%) translateY(-8px); 
            opacity: 1; 
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }

        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        /* Optimize video performance */
        .bg-layer, .bg-layer-next {
          transform-origin: center center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }

        /* Particle optimization */
        .particle {
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }

        @media (max-width: 768px) {
          .hero-container {
            height: 100vh !important;
            min-height: 700px !important;
          }
          
          .hero-container > div:nth-child(4) {
            grid-template-rows: auto 1fr auto !important;
            gap: clamp(2rem, 4vh, 3rem) !important;
            padding: 0 clamp(2rem, 4vw, 3rem) !important;
          }
          
          .half-overlay {
            width: 100% !important;
            background: linear-gradient(180deg, 
              rgba(10, 69, 28, 0.9) 0%, 
              rgba(10, 69, 28, 0.7) 50%,
              rgba(10, 69, 28, 0.5) 100%
            ) !important;
          }
          
          main {
            max-width: 100% !important;
            padding-right: 0 !important;
          }
          
          footer {
            flex-direction: column !important;
            gap: 1.5rem !important;
            align-items: center !important;
          }
          
          footer > div:first-child {
            order: 2;
          }
          
          footer > div:last-child {
            order: 1;
          }

          /* Reduce particles on mobile for better performance */
          .particles-layer {
            opacity: 0.3 !important;
          }
        }

        @media (max-width: 640px) {
          .hero-container {
            min-height: 650px !important;
          }

          /* Minimal animations on small screens */
          .bg-layer {
            transform: scale(1.05) !important;
            transition: opacity 0.3s ease !important;
          }
        }

        /* High-end details with performance optimization */
        .hero-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 80% 20%, rgba(252, 207, 60, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(156, 207, 159, 0.02) 0%, transparent 50%);
          z-index: 5;
          pointer-events: none;
          opacity: ${isTransitioning ? 0.5 : 1};
          transition: opacity 0.3s ease;
          will-change: opacity;
        }

        /* Subtle grain effect */
        .hero-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle, transparent 1px, rgba(156, 207, 159, 0.003) 1px);
          background-size: 4px 4px;
          z-index: 6;
          pointer-events: none;
          opacity: ${isTransitioning ? 0.15 : 0.25};
          transition: opacity 0.3s ease;
        }

        /* Scroll performance improvements */
        .hero-container {
          contain: layout style paint;
          will-change: scroll-position;
        }

        /* GPU acceleration for smooth scrolling */
        .hero-container * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default ACEFHero;