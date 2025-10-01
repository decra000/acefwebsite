import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Leaf, 
  Waves, 
  Recycle 
} from 'lucide-react';
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
  const heroRef = useRef(null);
  const intervalRef = useRef(null);

  // Default fallback slides data
  const defaultSlides = [
    {
      id: 1,
      title: "Africa Climate & Environment Foundation",
      description: "Transforming communities across Africa through innovative climate solutions, environmental education, and sustainable development programs that create lasting positive change from the ground up.",
      cta: "Get Involved",
      ctaUrl: "get-involved",
      secondaryCta: "Our Impact",
      secondaryUrl: "impact",
      icon: Leaf,
      gradient: "from-green-600 via-emerald-500 to-lime-400",
      particleColor: "#10b981",
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 2,
      title: "Marine Conservation Revolution",
      description: "Advanced AI-driven monitoring systems safeguarding marine ecosystems across the African coastline, utilizing cutting-edge satellite technology and autonomous underwater vehicles to preserve biodiversity for future generations.",
      cta: "Explore Impact",
      ctaUrl: "impact",
      secondaryCta: "Learn More",
      secondaryUrl: "about-us",
      icon: Waves,
      gradient: "from-blue-600 via-cyan-500 to-teal-400",
      particleColor: "#06b6d4",
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 3,
      title: "Reforestation Initiative",
      description: "Comprehensive reforestation initiatives combining traditional knowledge with modern techniques to restore degraded landscapes, combat desertification, and create sustainable livelihoods for local communities across the continent.",
      cta: "Get Involved",
      ctaUrl: "get-involved",
      secondaryCta: "Our Impact", 
      secondaryUrl: "impact",
      icon: Leaf,
      gradient: "from-green-600 via-emerald-500 to-lime-400",
      particleColor: "#10b981",
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
    },
    {
      id: 4,
      title: "Waste Management Innovation",
      description: "Next-generation waste management solutions converting waste streams into sustainable resources using molecular-level transformation technologies that redefine the relationship between consumption and environmental impact.",
      cta: "Learn More",
      ctaUrl: "about-us",
      secondaryCta: "Our Impact",
      secondaryUrl: "impact", 
      icon: Recycle,
      gradient: "from-purple-600 via-violet-500 to-indigo-400",
      particleColor: "#8b5cf6",
      bgImage: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4"
    }
  ];

  // Fetch hero slides from gallery API - PRESERVED EXACTLY AS ORIGINAL
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

  // Helper function to get image URL - PRESERVED
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
      for (let i = 0; i < 35; i++) {
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
  }, []);

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
    if (!heroRef.current) return;
    
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x: x * 100, y: y * 100 });
  }, []);

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

  const nextSlide = () => {
    if (slides.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }
  };

  // Loading state
  if (slidesLoading) {
    return (
      <div style={{
        position: 'relative',
        height: '120vh',
        minHeight: '900px',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a451c 0%, #052310 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
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
            Loading experience...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (slides.length === 0) {
    return (
      <div style={{
        position: 'relative',
        height: '120vh',
        minHeight: '900px',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a451c 0%, #052310 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>
            Africa Climate & Environment Foundation
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
            Empowering Grassroots for a Sustainable Future
          </p>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div 
      ref={heroRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: '#000000',
        fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Media Layer */}
      {currentSlideData.bgImage && (
        <>
          {currentSlideData.bgImage.includes('.mp4') ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              key={currentSlideData.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isTransitioning ? 0.4 : 0.85,
                transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px) scale(1.08)`,
                transition: isTransitioning ? 'opacity 0.6s ease-out' : 'transform 0.3s ease-out',
                filter: 'brightness(0.75) contrast(1.15)',
                zIndex: 1,
              }}
            >
              <source src={currentSlideData.bgImage} type="video/mp4" />
            </video>
          ) : (
            <img
              src={currentSlideData.bgImage}
              alt={currentSlideData.title}
              key={currentSlideData.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isTransitioning ? 0.4 : 0.85,
                transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px) scale(1.08)`,
                transition: isTransitioning ? 'opacity 0.6s ease-out' : 'transform 0.3s ease-out',
                filter: 'brightness(0.75) contrast(1.15)',
                zIndex: 1,
              }}
            />
          )}
        </>
      )}

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(135deg, 
            rgba(10, 69, 28, 0.92) 0%,
            rgba(10, 69, 28, 0.78) 30%,
            rgba(5, 35, 16, 0.65) 60%,
            rgba(0, 0, 0, 0.7) 100%
          )
        `,
        zIndex: 2,
      }} />

      {/* Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.5,
        zIndex: 3,
      }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(156, 207, 159, ${particle.opacity}) 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '48px',
          height: '48px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 20,
          opacity: 0.8,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(156, 207, 159, 0.25)';
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronDown size={22} strokeWidth={2.5} style={{ transform: 'rotate(90deg)' }} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '48px',
          height: '48px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 20,
          opacity: 0.8,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(156, 207, 159, 0.25)';
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronDown size={22} strokeWidth={2.5} style={{ transform: 'rotate(-90deg)' }} />
      </button>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 clamp(2rem, 5vw, 6rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        
        {/* Content Wrapper */}
        <div style={{
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1.75rem, 3.5vh, 2.5rem)',
        }}>
          
          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            color: '#ffffff',
            margin: 0,
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            textShadow: '0 2px 40px rgba(0, 0, 0, 0.8)',
            letterSpacing: '-0.025em',
          }}>
            {currentSlideData.title}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(1.05rem, 1.45vw, 1.25rem)',
            lineHeight: '1.7',
            color: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '680px',
            margin: 0,
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(25px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
            fontWeight: '400',
            textShadow: '0 1px 20px rgba(0, 0, 0, 0.6)',
            letterSpacing: '0.01em',
          }}>
            {currentSlideData.description}
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            alignItems: 'center',
            marginTop: 'clamp(0.5rem, 1.5vh, 1rem)',
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
          }}>
            <button 
              onClick={() => currentSlideData.ctaUrl && (window.location.href = `/${currentSlideData.ctaUrl}`)}
              style={{
                padding: 'clamp(0.95rem, 2vh, 1.15rem) clamp(2rem, 3.5vw, 2.5rem)',
                fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
                fontWeight: '700',
                color: '#0a451c',
                backgroundColor: '#facf3c',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 20px rgba(252, 207, 60, 0.4)',
                letterSpacing: '0.015em',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(252, 207, 60, 0.5)';
                e.currentTarget.style.backgroundColor = '#fce05c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(252, 207, 60, 0.4)';
                e.currentTarget.style.backgroundColor = '#facf3c';
              }}
            >
              {currentSlideData.cta}
              <ArrowRight size={19} strokeWidth={2.5} />
            </button>

            <button 
              onClick={() => currentSlideData.secondaryUrl && (window.location.href = `/${currentSlideData.secondaryUrl}`)}
              style={{
                padding: 'clamp(0.95rem, 2vh, 1.15rem) clamp(1.75rem, 3vw, 2.25rem)',
                fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '0.015em',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {currentSlideData.secondaryCta}
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div style={{
          position: 'absolute',
          bottom: 'clamp(2.5rem, 4vh, 3.5rem)',
          left: 'clamp(2rem, 5vw, 6rem)',
          right: 'clamp(2rem, 5vw, 6rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          
          {/* Media Controls */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                width: '54px',
                height: '54px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(156, 207, 159, 0.25)';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isPlaying ? <Pause size={20} strokeWidth={2} /> : <Play size={20} strokeWidth={2} />}
            </button>

            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              style={{
                width: '54px',
                height: '54px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(156, 207, 159, 0.25)';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isMuted ? <VolumeX size={20} strokeWidth={2} /> : <Volume2 size={20} strokeWidth={2} />}
            </button>
          </div>

          {/* Slide Indicators */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                style={{
                  width: currentSlide === index ? '48px' : '24px',
                  height: '4px',
                  backgroundColor: currentSlide === index ? '#facf3c' : 'rgba(255, 255, 255, 0.3)',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: currentSlide === index ? '0 0 16px rgba(252, 207, 60, 0.5)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (index !== currentSlide) {
                    e.currentTarget.style.backgroundColor = 'rgba(252, 207, 60, 0.6)';
                    e.currentTarget.style.width = '36px';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentSlide) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.width = '24px';
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
                    animation: 'slideProgress 8s linear infinite',
                    transformOrigin: 'left',
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Tablet Optimization */
        @media (max-width: 1024px) {
          [style*="maxWidth: '1400px'"] {
            padding: 0 3rem !important;
          }
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          /* Hide navigation arrows on mobile */
          button[aria-label="Previous slide"],
          button[aria-label="Next slide"] {
            display: none !important;
          }

          /* Adjust main container */
          [style*="maxWidth: '1400px'"] {
            padding: 0 1.5rem !important;
            justify-content: flex-start !important;
            padding-top: 25vh !important;
          }

          /* Optimize title for mobile */
          h1 {
            font-size: clamp(2rem, 8vw, 2.75rem) !important;
            line-height: 1.15 !important;
            margin-bottom: 0.5rem !important;
          }

          /* Optimize description for mobile */
          p[style*="fontSize: 'clamp(1.05rem"] {
            font-size: clamp(0.95rem, 4vw, 1.1rem) !important;
            line-height: 1.65 !important;
            max-width: 100% !important;
          }

          /* Stack buttons vertically on mobile */
          div[style*="display: 'flex'"][style*="flexWrap: 'wrap'"] {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.875rem !important;
            margin-top: 1.5rem !important;
          }

          /* Full-width buttons on mobile */
          div[style*="display: 'flex'"][style*="flexWrap: 'wrap'"] button {
            width: 100% !important;
            justify-content: center !important;
            padding: 1rem 1.5rem !important;
            font-size: 1rem !important;
          }

          /* Bottom controls - stack vertically */
          div[style*="position: 'absolute'"][style*="bottom:"] {
            flex-direction: column !important;
            gap: 1.5rem !important;
            align-items: center !important;
            left: 1.5rem !important;
            right: 1.5rem !important;
            bottom: 2rem !important;
          }

          /* Media controls - center on mobile */
          div[style*="position: 'absolute'"][style*="bottom:"] > div:first-child {
            order: 2;
          }

          /* Slide indicators - show first on mobile */
          div[style*="position: 'absolute'"][style*="bottom:"] > div:last-child {
            order: 1;
          }

          /* Reduce particle opacity on mobile for performance */
          div[style*="particles"] {
            opacity: 0.25 !important;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          [style*="maxWidth: '1400px'"] {
            padding: 0 1.25rem !important;
            padding-top: 22vh !important;
          }

          h1 {
            font-size: clamp(1.75rem, 9vw, 2.25rem) !important;
          }

          p[style*="fontSize: 'clamp(1.05rem"] {
            font-size: 0.95rem !important;
          }

          /* Smaller control buttons on small screens */
          button[style*="width: '54px'"] {
            width: 48px !important;
            height: 48px !important;
          }

          /* Smaller indicator dots */
          div[style*="display: 'flex'"][style*="gap: '1rem'"] button[style*="height: '4px'"] {
            width: 32px !important;
          }

          div[style*="display: 'flex'"][style*="gap: '1rem'"] button[style*="height: '4px'"]:not([style*="currentSlide"]) {
            width: 18px !important;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          [style*="maxWidth: '1400px'"] {
            padding-top: 15vh !important;
          }

          h1 {
            font-size: clamp(1.5rem, 6vw, 2rem) !important;
          }

          p[style*="fontSize: 'clamp(1.05rem"] {
            font-size: 0.9rem !important;
            line-height: 1.5 !important;
          }

          div[style*="position: 'absolute'"][style*="bottom:"] {
            bottom: 1.5rem !important;
          }
        }

        /* Touch targets for better mobile UX */
        @media (max-width: 768px) {
          button {
            min-height: 44px !important;
            min-width: 44px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ACEFHero;