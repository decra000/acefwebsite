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
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4" // Ocean conservation footage
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
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4" // Ocean conservation footage
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
      bgImage: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4" // Ocean conservation footage
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
      bgImage: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4" // Sustainable technology footage
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
          // Filter and sort hero slide images
          const slideImages = data.data
            ?.filter(img => img.category === 'home_hero_slides')
            ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            ?.slice(0, 4); // Limit to 4 slides max

          if (slideImages && slideImages.length > 0) {
            // Map gallery images to slide format
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
            // No gallery images found, use defaults
            setHeroSlides(defaultSlides);
          }
        } else {
          // API call failed, use defaults
          setHeroSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        // Error occurred, use defaults
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
    
    // If it's a full URL, use it as is
    if (image.image_url.startsWith('http')) {
      return image.image_url;
    }
    
    // Otherwise, prepend the static URL
    return `${STATIC_URL}${image.image_url}`;
  };

  // Use heroSlides instead of slides throughout the component
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

  // Animate particles with optimized performance
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

  // Auto-slide functionality with smooth transitions
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

  // Mouse tracking for parallax effect
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x: x * 100, y: y * 100 });
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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

  // Show loading state while fetching slides
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
      </div>
    );
  }

  // If no slides available, show error state
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
        fontFamily: '"Nunito Sans", sans-serif',
        color: '#ffffff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
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
      className="hero-container"
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        height: '120vh',
        minHeight: '900px',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a451c 0%, #052310 100%)',
        fontFamily: '"Nunito Sans", sans-serif',
      }}
    >
      {/* Background Video/Image Layer with smooth transitions */}
      {currentSlideData.bgImage && (
        <>
          {/* Check if it's a video or image */}
          {currentSlideData.bgImage.includes('.mp4') ? (
            <video
              className="bg-layer"
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
                opacity: isTransitioning ? 0.3 : 0.9,
                transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px) scale(1.05)`,
                transition: isTransitioning ? 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.3s ease-out',
                filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
                zIndex: 1,
                willChange: 'transform, opacity',
              }}
              onError={(e) => {
                console.error('Video failed to load:', e.target.src);
                // Hide failed video
                e.target.style.display = 'none';
              }}
            >
              <source src={currentSlideData.bgImage} type="video/mp4" />
            </video>
          ) : (
            <img
              className="bg-layer"
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
                opacity: isTransitioning ? 0.3 : 0.9,
                transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px) scale(1.05)`,
                transition: isTransitioning ? 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.3s ease-out',
                filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
                zIndex: 1,
                willChange: 'transform, opacity',
              }}
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                // Try fallback to video if image fails
                if (defaultSlides[currentSlide]?.bgImage) {
                  e.target.src = defaultSlides[currentSlide].bgImage;
                }
              }}
            />
          )}
        </>
      )}

      {/* Preload next media for smoother transitions */}
      {slides[(currentSlide + 1) % slides.length]?.bgImage && (
        <>
          {slides[(currentSlide + 1) % slides.length].bgImage.includes('.mp4') ? (
            <video
              className="bg-layer-next"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0,
                transform: 'scale(1.05)',
                filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            >
              <source src={slides[(currentSlide + 1) % slides.length].bgImage} type="video/mp4" />
            </video>
          ) : (
            <img
              className="bg-layer-next"
              src={slides[(currentSlide + 1) % slides.length].bgImage}
              alt="Next slide"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0,
                transform: 'scale(1.05)',
                filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
        </>
      )}

      {/* Sophisticated Half Overlay */}
      <div 
        className="half-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '60%',
          height: '100%',
          background: `
            linear-gradient(90deg, 
              rgba(10, 69, 28, 0.95) 0%, 
              rgba(10, 69, 28, 0.85) 25%,
              rgba(10, 69, 28, 0.7) 50%,
              rgba(10, 69, 28, 0.4) 75%,
              rgba(10, 69, 28, 0.1) 90%,
              transparent 100%
            )
          `,
          opacity: isLoaded ? (isTransitioning ? 0.9 : 1) : 0,
          transition: 'opacity 1.5s ease-in-out',
          zIndex: 2,
        }}
      />

      {/* Additional Atmospheric Overlay */}
      <div 
        className="atmospheric-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse at 20% 40%, rgba(5, 35, 16, 0.3) 0%, transparent 70%),
            linear-gradient(180deg, rgba(5, 35, 16, 0.1) 0%, rgba(5, 35, 16, 0.3) 100%)
          `,
          opacity: isLoaded ? (isTransitioning ? 0.8 : 1) : 0,
          transition: 'opacity 2s ease-in-out',
          zIndex: 1,
        }}
      />

      {/* Enhanced Particles */}
      <div className="particles-layer" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.6,
        zIndex: 3,
      }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(156, 207, 159, ${particle.opacity}) 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(0.3px)',
              transition: 'opacity 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: 'clamp(2rem, 4vw, 3rem)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(44px, 6vw, 48px)',
          height: 'clamp(44px, 6vw, 48px)',
          backgroundColor: 'rgba(156, 207, 159, 0.1)',
          border: '1px solid rgba(156, 207, 159, 0.2)',
          borderRadius: '4px',
          color: '#9ccf9f',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: 20,
          opacity: 0.7,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.2)';
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.1)';
          e.target.style.opacity = '0.7';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronDown size={24} strokeWidth={2} style={{ transform: 'rotate(90deg)' }} />
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: 'clamp(2rem, 4vw, 3rem)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(44px, 6vw, 48px)',
          height: 'clamp(44px, 6vw, 48px)',
          backgroundColor: 'rgba(156, 207, 159, 0.1)',
          border: '1px solid rgba(156, 207, 159, 0.2)',
          borderRadius: '4px',
          color: '#9ccf9f',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: 20,
          opacity: 0.7,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.2)';
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.1)';
          e.target.style.opacity = '0.7';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronDown size={24} strokeWidth={2} style={{ transform: 'rotate(-90deg)' }} />
      </button>

      {/* Main Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100vh',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 clamp(3rem, 6vw, 8rem)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr auto',
        gap: 'clamp(3rem, 5vh, 5rem)',
      }}>
        
        {/* Elevated Header - Only show on first slide */}
        <header style={{
          paddingTop: 'clamp(3rem, 6vh, 5rem)',
          opacity: isLoaded && !isTransitioning ? 1 : 0,
          transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s',
          visibility: currentSlide === 0 ? 'visible' : 'hidden',
          height: 'clamp(6rem, 10vh, 8rem)',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(0.75rem, 1.5vw, 1rem)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(0.75rem, 1.5vw, 1rem)',
            }}>
              <div style={{
                padding: '12px',
                background: 'rgba(252, 207, 60, 0.15)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IconComponent size={32} color="#facf3c" strokeWidth={1.5} />
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <span style={{
                  color: '#facf3c',
                  fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  lineHeight: '1.2',
                }}>
                  ACEF
                </span>
                <span style={{
                  color: '#9ccf9f',
                  fontSize: 'clamp(0.75rem, 1vw, 0.85rem)',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                }}>
                  Foundation
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Main Content */}
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'clamp(2rem, 4vh, 3.5rem)',
          maxWidth: 'clamp(400px, 55vw, 1000px)',
          paddingRight: 'clamp(2rem, 5vw, 4rem)',
        }}>
          
          {/* Enhanced Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: '700',
            lineHeight: '1.05',
            color: '#ffffff',
            margin: 0,
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.7), 0 2px 10px rgba(0, 0, 0, 0.5)',
            letterSpacing: '-0.02em',
          }}>
            {currentSlideData.title}
          </h1>

          {/* Refined Subtitle */}
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
            fontWeight: '500',
            color: '#facf3c',
            margin: 0,
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s',
            letterSpacing: '0.02em',
            textShadow: '0 2px 20px rgba(252, 207, 60, 0.3), 0 1px 8px rgba(0, 0, 0, 0.4)',
            position: 'relative',
          }}>
            {currentSlideData.subtitle}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, #facf3c, transparent)',
            }} />
          </h2>






          {/* Enhanced Description */}
          <p style={{
            fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)',
            lineHeight: '1.7',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: 'clamp(320px, 50vw, 600px)',
            margin: 0,
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s',
            fontWeight: '400',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.01em',
          }}>
            {currentSlideData.description}
          </p>

          {/* Premium CTA Section */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(1.25rem, 2.5vw, 2rem)',
            alignItems: 'center',
            marginTop: 'clamp(1.5rem, 3vh, 2.5rem)',
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.1s',
          }}>
            <button 
              onClick={() => {
                if (currentSlideData.ctaUrl) {
                  window.location.href = `/${currentSlideData.ctaUrl}`;
                }
              }}
              style={{
                padding: 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.8rem, 3.5vw, 2.4rem)',
                fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
                fontWeight: '600',
                color: '#0a451c',
                backgroundColor: '#facf3c',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(0.5rem, 1vw, 0.7rem)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: '0 8px 32px rgba(252, 207, 60, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 40px rgba(252, 207, 60, 0.45), 0 6px 20px rgba(0, 0, 0, 0.25)';
                e.target.style.backgroundColor = '#fbd96b';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 32px rgba(252, 207, 60, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)';
                e.target.style.backgroundColor = '#facf3c';
              }}
            >
              {currentSlideData.cta}
              <ArrowRight size={20} strokeWidth={2} />
            </button>

            <button 
              onClick={() => {
                if (currentSlideData.secondaryUrl) {
                  window.location.href = `/${currentSlideData.secondaryUrl}`;
                }
              }}
              style={{
                padding: 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.5rem, 3vw, 2rem)',
                fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: 'rgba(156, 207, 159, 0.15)',
                border: '1px solid rgba(156, 207, 159, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.25)';
                e.target.style.borderColor = 'rgba(156, 207, 159, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(156, 207, 159, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(156, 207, 159, 0.15)';
                e.target.style.borderColor = 'rgba(156, 207, 159, 0.3)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
            >
              {currentSlideData.secondaryCta}
            </button>
          </div>
        </main>

        {/* Sophisticated Footer Controls */}
        <footer style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 'clamp(3rem, 5vh, 4rem)',
        }}>
          
          {/* Enhanced Media Controls */}
          <div style={{
            display: 'flex',
            gap: 'clamp(1.25rem, 2vw, 1.5rem)',
          }}>
            <button
              onClick={togglePlayPause}
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
              {isPlaying ? <Pause size={20} strokeWidth={1.5} /> : <Play size={20} strokeWidth={1.5} />}
            </button>

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
          </div>

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