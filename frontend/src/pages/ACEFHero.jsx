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
import { API_URL, STATIC_URL } from '../config';

const ACEFHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heroSlides, setHeroSlides] = useState([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const heroRef = useRef(null);
  const intervalRef = useRef(null);

  // Default fallback slides data
  const defaultSlides = [
    {
      id: 1,
      title: "Africa Climate & Environment Foundation",
      subtitle: "Empowering Grassroots for a Sustainable Future",
      description: "Transforming communities across Africa through innovative climate solutions, environmental education, and sustainable development programs.",
      cta: "Get Involved",
      ctaUrl: "get-involved",
      secondaryCta: "Our Impact",
      secondaryUrl: "impact",
      icon: Leaf,
      country: "Kenya",
      countryCode: "🇰🇪",
      gradient: "from-green-600 via-emerald-500 to-lime-400",
      particleColor: "#10b981",
      bgImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80"
    },
    {
      id: 2,
      title: "Marine Conservation Revolution",
      subtitle: "Protecting Our Blue Planet",
      description: "Advanced monitoring systems safeguarding marine ecosystems across the African coastline, preserving biodiversity for future generations.",
      cta: "Explore Impact",
      ctaUrl: "impact",
      secondaryCta: "Learn More",
      secondaryUrl: "about-us",
      icon: Waves,
      country: "Tanzania",
      countryCode: "🇹🇿",
      gradient: "from-blue-600 via-cyan-500 to-teal-400",
      particleColor: "#06b6d4",
      bgImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80"
    },
    {
      id: 3,
      title: "Reforestation Initiative",
      subtitle: "Restoring Africa's Green Heritage",
      description: "Comprehensive reforestation combining traditional knowledge with modern techniques to restore landscapes and create sustainable livelihoods.",
      cta: "Join Us",
      ctaUrl: "get-involved",
      secondaryCta: "Our Impact", 
      secondaryUrl: "impact",
      icon: Leaf,
      country: "Uganda",
      countryCode: "🇺🇬",
      gradient: "from-green-600 via-emerald-500 to-lime-400",
      particleColor: "#10b981",
      bgImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80"
    },
    {
      id: 4,
      title: "Waste Management Solutions",
      subtitle: "From Waste to Resource",
      description: "Next-generation waste management solutions converting waste streams into sustainable resources for a circular economy.",
      cta: "Learn More",
      ctaUrl: "about-us",
      secondaryCta: "Our Impact",
      secondaryUrl: "impact", 
      icon: Recycle,
      country: "Rwanda",
      countryCode: "🇷🇼",
      gradient: "from-purple-600 via-violet-500 to-indigo-400",
      particleColor: "#8b5cf6",
      bgImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&q=80"
    }
  ];

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image?.image_url) return null;
    if (image.image_url.startsWith('http')) {
      return image.image_url;
    }
    return `${STATIC_URL}${image.image_url}`;
  };

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Initialize particles
  useEffect(() => {
    const createParticles = () => {
      const newParticles = [];
      const particleCount = isMobile ? 15 : 25;
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.12,
          speedY: (Math.random() - 0.5) * 0.12,
          opacity: Math.random() * 0.3 + 0.1,
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
        opacity: 0.1 + Math.sin(Date.now() * 0.001 + particle.id) * 0.12,
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
    const slides = heroSlides.length > 0 ? heroSlides : defaultSlides;
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
  }, [isPlaying, heroSlides, defaultSlides]);

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

  // Determine slides to use
  const slides = heroSlides.length > 0 ? heroSlides : defaultSlides;

  const goToSlide = (index) => {
    if (index !== currentSlide && slides.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }
  };

  // Show loading state while fetching slides (after all hooks)
  if (slidesLoading) {
    return (
      <div style={{
        position: 'relative',
        height: '90vh',
        minHeight: '700px',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #000000 0%, #0a2818 40%, #0a451c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Nunito Sans", sans-serif',
      }}>
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
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
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
        height: '80vh',
        minHeight: '700px',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #000000 0%, #0a2818 40%, #0a451c 100%)',
        fontFamily: '"Nunito Sans", sans-serif',
      }}
    >
      {/* Background Image Layer */}
      <div
        key={currentSlideData.id}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: isTransitioning ? 0 : 0.85,
          transition: 'opacity 0.8s ease-in-out',
        }}
      >
        <img
          src={currentSlideData.bgImage}
          alt={currentSlideData.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isMobile ? 'scale(1.05)' : `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * -0.008}px) scale(1.05)`,
            transition: 'transform 0.3s ease-out',
            filter: 'brightness(0.7) contrast(1.1) saturate(1.05)',
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: isMobile ? '100%' : '65%',
          height: '100%',
          background: isMobile 
            ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(10, 40, 24, 0.7) 50%, rgba(10, 69, 28, 0.5) 100%)'
            : 'linear-gradient(90deg, rgba(0, 0, 0, 0.92) 0%, rgba(10, 40, 24, 0.85) 30%, rgba(10, 69, 28, 0.7) 55%, rgba(10, 69, 28, 0.3) 80%, transparent 100%)',
          zIndex: 2,
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
        opacity: isMobile ? 0.25 : 0.45,
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
              filter: 'blur(0.3px)',
              transition: 'all 0.1s linear',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 1.5rem' : '0 3rem',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr auto',
        gap: isMobile ? '1.5rem' : '2rem',
      }}>
        
        {/* Header - Hidden now */}
        <header
          style={{
            paddingTop: isMobile ? '1.5rem' : '2.5rem',
            opacity: 0,
            visibility: 'hidden',
            height: '0',
          }}
        >
        </header>

        {/* Main Content */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: isMobile ? '1rem' : '1.5rem',
          maxWidth: isMobile ? '100%' : '700px',
        }}>
          
          <div
            key={currentSlide}
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
              transition: 'all 0.6s ease',
            }}
          >
            <h1 
              style={{
                fontSize: isMobile ? '1.9rem' : '3rem',
                fontWeight: '700',
                lineHeight: '1.1',
                color: '#ffffff',
                margin: 0,
                marginBottom: isMobile ? '0.75rem' : '1rem',
                textShadow: '0 3px 20px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)',
                letterSpacing: '-0.02em',
              }}
            >
              {currentSlideData.title}
            </h1>

            <h2 style={{
              fontSize: isMobile ? '1.05rem' : '1.25rem',
              fontWeight: '500',
              color: '#facf3c',
              margin: 0,
              marginBottom: isMobile ? '0.75rem' : '1rem',
              letterSpacing: '0.01em',
              textShadow: '0 2px 15px rgba(252, 207, 60, 0.25), 0 1px 6px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              paddingBottom: '8px',
            }}>
              {currentSlideData.subtitle}
              <div 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '50px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #facf3c, transparent)',
                }}
              />
            </h2>

            <p
              style={{
                fontSize: isMobile ? '0.9rem' : '1.05rem',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.88)',
                maxWidth: isMobile ? '100%' : '600px',
                margin: 0,
                fontWeight: '400',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
                letterSpacing: '0.005em',
              }}
            >
              {currentSlideData.description}
            </p>
          </div>

          {/* CTA Buttons */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: isMobile ? '0.75rem' : '1rem',
              alignItems: 'center',
              marginTop: isMobile ? '0.5rem' : '1rem',
            }}
          >
            <button 
              onClick={() => {
                if (currentSlideData.ctaUrl) {
                  window.location.href = `/${currentSlideData.ctaUrl}`;
                }
              }}
              style={{
                padding: isMobile ? '0.7rem 1.3rem' : '0.85rem 1.6rem',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: '600',
                color: '#0a451c',
                backgroundColor: '#facf3c',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 6px 24px rgba(252, 207, 60, 0.3), 0 3px 12px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.03)';
                e.target.style.boxShadow = '0 8px 32px rgba(252, 207, 60, 0.4), 0 4px 16px rgba(0, 0, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 6px 24px rgba(252, 207, 60, 0.3), 0 3px 12px rgba(0, 0, 0, 0.2)';
              }}
            >
              {currentSlideData.cta}
              <ArrowRight size={16} strokeWidth={2} />
            </button>

            <button 
              onClick={() => {
                if (currentSlideData.secondaryUrl) {
                  window.location.href = `/${currentSlideData.secondaryUrl}`;
                }
              }}
              style={{
                padding: isMobile ? '0.7rem 1.3rem' : '0.85rem 1.4rem',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: 'rgba(156, 207, 159, 0.12)',
                border: '1px solid rgba(156, 207, 159, 0.25)',
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.12)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {currentSlideData.secondaryCta}
            </button>
          </div>
        </main>

        {/* Footer Controls */}
        <footer style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: isMobile ? '1.5rem' : '2.5rem',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1rem' : '0',
        }}>
          
          {/* Media Controls */}
          <div 
            style={{
              display: 'flex',
              gap: '1rem',
              order: isMobile ? 2 : 1,
            }}
          >
            <button
              onClick={togglePlayPause}
              style={{
                width: isMobile ? '44px' : '48px',
                height: isMobile ? '44px' : '48px',
                backgroundColor: 'rgba(156, 207, 159, 0.12)',
                border: '1px solid rgba(156, 207, 159, 0.25)',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.2)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.12)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {isPlaying ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
            </button>

            <button
              onClick={toggleMute}
              style={{
                width: isMobile ? '44px' : '48px',
                height: isMobile ? '44px' : '48px',
                backgroundColor: 'rgba(156, 207, 159, 0.12)',
                border: '1px solid rgba(156, 207, 159, 0.25)',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.2)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.12)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {isMuted ? <VolumeX size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Navigation Dots with Colors */}
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
            order: isMobile ? 1 : 2,
          }}>
            {slides.map((slide, index) => {
              const dotColors = [
                '#10b981', // Green
                '#06b6d4', // Cyan
                '#8b5cf6', // Purple
                '#f59e0b', // Amber
              ];
              const color = dotColors[index % dotColors.length];
              
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: currentSlide === index ? '28px' : '24px',
                    height: currentSlide === index ? '28px' : '24px',
                    backgroundColor: currentSlide === index ? `${color}40` : `${color}20`,
                    border: currentSlide === index ? `2px solid ${color}80` : `1px solid ${color}40`,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: currentSlide === index 
                      ? `0 0 16px ${color}60, 0 3px 10px rgba(0, 0, 0, 0.2)` 
                      : '0 2px 6px rgba(0, 0, 0, 0.1)',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (index !== currentSlide) {
                      e.target.style.backgroundColor = `${color}35`;
                      e.target.style.width = '26px';
                      e.target.style.height = '26px';
                      e.target.style.borderColor = `${color}60`;
                      e.target.style.boxShadow = `0 0 12px ${color}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentSlide) {
                      e.target.style.backgroundColor = `${color}20`;
                      e.target.style.width = '24px';
                      e.target.style.height = '24px';
                      e.target.style.borderColor = `${color}40`;
                      e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                >
                  {currentSlide === index && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      border: `2px solid ${color}60`,
                      borderRadius: '50%',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </footer>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @media (max-width: 768px) {
          .hero-container {
            height: 50vh !important;
            min-height: 500px !important;
          }
        }

        @media (max-width: 640px) {
          .hero-container {
            min-height: 450px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ACEFHero;