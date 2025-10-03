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

// Mock API_URL and STATIC_URL for demo
const API_URL = 'https://api.example.com';
const STATIC_URL = 'https://static.example.com';

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

  if (slidesLoading) {
    return (
      <div className="hero-loading">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading hero content...</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="hero-error">
        <div>
          <h1>Africa Climate & Environment Foundation</h1>
          <p>Empowering Grassroots for a Sustainable Future</p>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <>
      <div 
        ref={heroRef}
        className="hero-container"
        onMouseMove={handleMouseMove}
      >
        {/* Background Media Layer */}
        {currentSlideData.bgImage && (
          <>
            {currentSlideData.bgImage.includes('.mp4') ? (
              <video
                className="bg-layer"
                autoPlay
                loop
                muted
                playsInline
                key={currentSlideData.id}
                style={{
                  opacity: isTransitioning ? 0.3 : 0.9,
                  transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px) scale(1.05)`,
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
                  opacity: isTransitioning ? 0.3 : 0.9,
                  transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px) scale(1.05)`,
                }}
              />
            )}
          </>
        )}

        {/* Overlays */}
        <div className="half-overlay" style={{ opacity: isLoaded ? (isTransitioning ? 0.9 : 1) : 0 }} />
        <div className="atmospheric-overlay" style={{ opacity: isLoaded ? (isTransitioning ? 0.8 : 1) : 0 }} />

        {/* Particles */}
        <div className="particles-layer">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `radial-gradient(circle, rgba(156, 207, 159, ${particle.opacity}) 0%, transparent 70%)`,
              }}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button onClick={prevSlide} className="nav-arrow nav-arrow-left">
          <ChevronDown size={24} strokeWidth={2} style={{ transform: 'rotate(90deg)' }} />
        </button>

        <button onClick={nextSlide} className="nav-arrow nav-arrow-right">
          <ChevronDown size={24} strokeWidth={2} style={{ transform: 'rotate(-90deg)' }} />
        </button>

        {/* Main Content */}
        <div className="content-container">
          
          {/* Header */}
          <header className="hero-header" style={{
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            visibility: currentSlide === 0 ? 'visible' : 'hidden',
          }}>
            <div className="header-content">
              <div className="icon-wrapper">
                <IconComponent size={32} color="#facf3c" strokeWidth={1.5} />
              </div>
              <div className="header-text">
                <span className="acef-text">ACEF</span>
                <span className="foundation-text">Foundation</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="hero-main">
            
            <h1 className="hero-title" style={{
              opacity: isLoaded && !isTransitioning ? 1 : 0,
              transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(40px)',
            }}>
              {currentSlideData.title}
            </h1>

            <h2 className="hero-subtitle" style={{
              opacity: isLoaded && !isTransitioning ? 1 : 0,
              transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            }}>
              {currentSlideData.subtitle}
              <div className="subtitle-underline" />
            </h2>

            <p className="hero-description" style={{
              opacity: isLoaded && !isTransitioning ? 1 : 0,
              transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            }}>
              {currentSlideData.description}
            </p>

            <div className="cta-section" style={{
              opacity: isLoaded && !isTransitioning ? 1 : 0,
              transform: isLoaded && !isTransitioning ? 'translateY(0)' : 'translateY(30px)',
            }}>
              <button 
                onClick={() => window.location.href = `/${currentSlideData.ctaUrl}`}
                className="cta-primary"
              >
                {currentSlideData.cta}
                <ArrowRight size={20} strokeWidth={2} />
              </button>

              <button 
                onClick={() => window.location.href = `/${currentSlideData.secondaryUrl}`}
                className="cta-secondary"
              >
                {currentSlideData.secondaryCta}
              </button>
            </div>
          </main>

          {/* Footer */}
          <footer className="hero-footer">
            
            <div className="media-controls">
              <button onClick={togglePlayPause} className="control-btn">
                {isPlaying ? <Pause size={20} strokeWidth={1.5} /> : <Play size={20} strokeWidth={1.5} />}
              </button>

              <button onClick={toggleMute} className="control-btn">
                {isMuted ? <VolumeX size={20} strokeWidth={1.5} /> : <Volume2 size={20} strokeWidth={1.5} />}
              </button>
            </div>

            <div className="slide-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`indicator ${currentSlide === index ? 'active' : ''}`}
                >
                  {currentSlide === index && (
                    <div className="progress-bar" />
                  )}
                </button>
              ))}
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        .hero-container {
          position: relative;
          height: 120vh;
          min-height: 900px;
          width: 100%;
          overflow: hidden;
          background: linear-gradient(135deg, #0a451c 0%, #052310 100%);
          font-family: "Nunito Sans", sans-serif;
        }

        .bg-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out;
          filter: brightness(0.8) contrast(1.1) saturate(1.1);
          z-index: 1;
          will-change: transform, opacity;
        }

        .half-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(10, 69, 28, 0.95) 0%, 
            rgba(10, 69, 28, 0.85) 25%,
            rgba(10, 69, 28, 0.7) 50%,
            rgba(10, 69, 28, 0.4) 75%,
            rgba(10, 69, 28, 0.1) 90%,
            transparent 100%
          );
          transition: opacity 1.5s ease-in-out;
          z-index: 2;
        }

        .atmospheric-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at 20% 40%, rgba(5, 35, 16, 0.3) 0%, transparent 70%),
            linear-gradient(180deg, rgba(5, 35, 16, 0.1) 0%, rgba(5, 35, 16, 0.3) 100%);
          transition: opacity 2s ease-in-out;
          z-index: 1;
        }

        .particles-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.6;
          z-index: 3;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          filter: blur(0.3px);
          transition: opacity 0.4s ease;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: clamp(44px, 6vw, 48px);
          height: clamp(44px, 6vw, 48px);
          background-color: rgba(156, 207, 159, 0.1);
          border: 1px solid rgba(156, 207, 159, 0.2);
          border-radius: 4px;
          color: #9ccf9f;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 20;
          opacity: 0.7;
        }

        .nav-arrow:hover {
          background-color: rgba(156, 207, 159, 0.2);
          opacity: 1;
          transform: translateY(-50%) scale(1.05);
        }

        .nav-arrow-left {
          left: clamp(2rem, 4vw, 3rem);
        }

        .nav-arrow-right {
          right: clamp(2rem, 4vw, 3rem);
        }

        .content-container {
          position: relative;
          z-index: 10;
          height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(3rem, 6vw, 8rem);
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr auto;
          gap: clamp(3rem, 5vh, 5rem);
        }

        .hero-header {
          padding-top: clamp(3rem, 6vh, 5rem);
          transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s;
          height: clamp(6rem, 10vh, 8rem);
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: clamp(0.75rem, 1.5vw, 1rem);
        }

        .header-content > div:first-child {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 1.5vw, 1rem);
        }

        .icon-wrapper {
          padding: 12px;
          background: rgba(252, 207, 60, 0.15);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-text {
          display: flex;
          flex-direction: column;
        }

        .acef-text {
          color: #facf3c;
          font-size: clamp(0.9rem, 1.2vw, 1rem);
          font-weight: 700;
          letter-spacing: 0.05em;
          line-height: 1.2;
        }

        .foundation-text {
          color: #9ccf9f;
          font-size: clamp(0.75rem, 1vw, 0.85rem);
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .hero-main {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(2rem, 4vh, 3.5rem);
          max-width: clamp(400px, 55vw, 1000px);
          padding-right: clamp(2rem, 5vw, 4rem);
        }

        .hero-title {
          font-size: clamp(2.5rem, 7vw, 5.5rem);
          font-weight: 700;
          line-height: 1.05;
          color: #ffffff;
          margin: 0;
          transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.7), 0 2px 10px rgba(0, 0, 0, 0.5);
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.6rem);
          font-weight: 500;
          color: #facf3c;
          margin: 0;
          transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 20px rgba(252, 207, 60, 0.3), 0 1px 8px rgba(0, 0, 0, 0.4);
          position: relative;
        }

        .subtitle-underline {
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, #facf3c, transparent);
        }

        .hero-description {
          font-size: clamp(0.9rem, 1.4vw, 1.1rem);
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.9);
          max-width: clamp(320px, 50vw, 600px);
          margin: 0;
          transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s;
          font-weight: 400;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
          letter-spacing: 0.01em;
        }

        .cta-section {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(1.25rem, 2.5vw, 2rem);
          align-items: center;
          margin-top: clamp(1.5rem, 3vh, 2.5rem);
          transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.1s;
        }

        .cta-primary {
          padding: clamp(0.9rem, 2vw, 1.2rem) clamp(1.8rem, 3.5vw, 2.4rem);
          font-size: clamp(0.9rem, 1.1vw, 1rem);
          font-weight: 600;
          color: #0a451c;
          background-color: #facf3c;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: clamp(0.5rem, 1vw, 0.7rem);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 8px 32px rgba(252, 207, 60, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.01em;
          white-space: nowrap;
          font-family: inherit;
        }

        .cta-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 40px rgba(252, 207, 60, 0.45), 0 6px 20px rgba(0, 0, 0, 0.25);
          background-color: #fbd96b;
        }

        .cta-secondary {
          padding: clamp(0.9rem, 2vw, 1.2rem) clamp(1.5rem, 3vw, 2rem);
          font-size: clamp(0.9rem, 1.1vw, 1rem);
          font-weight: 500;
          color: #ffffff;
          background-color: rgba(156, 207, 159, 0.15);
          border: 1px solid rgba(156, 207, 159, 0.3);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          letter-spacing: 0.01em;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          font-family: inherit;
        }

        .cta-secondary:hover {
          background-color: rgba(156, 207, 159, 0.25);
          border-color: rgba(156, 207, 159, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(156, 207, 159, 0.2);
        }

        .hero-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: clamp(3rem, 5vh, 4rem);
        }

        .media-controls {
          display: flex;
          gap: clamp(1.25rem, 2vw, 1.5rem);
        }

        .control-btn {
          width: clamp(52px, 7vw, 56px);
          height: clamp(52px, 7vw, 56px);
          background-color: rgba(156, 207, 159, 0.15);
          border: 1px solid rgba(156, 207, 159, 0.3);
          border-radius: 4px;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .control-btn:hover {
          background-color: rgba(156, 207, 159, 0.25);
          transform: scale(1.05);
          box-shadow: 0 6px 24px rgba(156, 207, 159, 0.25);
        }

        .slide-indicators {
          display: flex;
          gap: clamp(1rem, 1.5vw, 1.25rem);
          align-items: center;
        }

        .indicator {
          width: clamp(20px, 3vw, 24px);
          height: clamp(3px, 0.4vw, 4px);
          background-color: rgba(156, 207, 159, 0.4);
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .indicator.active {
          width: clamp(40px, 6vw, 48px);
          background-color: #facf3c;
          box-shadow: 0 0 12px rgba(252, 207, 60, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .indicator:hover:not(.active) {
          background-color: rgba(252, 207, 60, 0.6);
          width: clamp(30px, 5vw, 36px);
          box-shadow: 0 0 8px rgba(252, 207, 60, 0.3);
        }

        .progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: #facf3c;
          animation: progress 8s linear infinite;
          transform-origin: left;
        }

        .hero-loading,
        .hero-error {
          position: relative;
          height: 120vh;
          min-height: 900px;
          width: 100%;
          overflow: hidden;
          background: linear-gradient(135deg, #0a451c 0%, #052310 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Nunito Sans", sans-serif;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #ffffff;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(156, 207, 159, 0.2);
          border-top: 4px solid #9ccf9f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-content p {
          font-size: 1.1rem;
          font-weight: 500;
          opacity: 0.9;
        }

        .hero-error {
          color: #ffffff;
          text-align: center;
          padding: 2rem;
        }

        .hero-error h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .hero-error p {
          font-size: 1.1rem;
          opacity: 0.8;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .hero-container {
            height: 100vh !important;
            min-height: 700px !important;
          }

          .content-container {
            grid-template-rows: auto 1fr auto !important;
            gap: 2rem !important;
            padding: 0 2rem !important;
          }

          .half-overlay {
            width: 100% !important;
            background: linear-gradient(180deg, 
              rgba(10, 69, 28, 0.92) 0%, 
              rgba(10, 69, 28, 0.75) 40%,
              rgba(10, 69, 28, 0.85) 100%
            ) !important;
          }

          .hero-main {
            max-width: 100% !important;
            padding-right: 0 !important;
            gap: 1.5rem !important;
          }

          .hero-title {
            font-size: clamp(2rem, 10vw, 3rem) !important;
          }

          .hero-subtitle {
            font-size: clamp(1rem, 5vw, 1.3rem) !important;
          }

          .hero-description {
            font-size: clamp(0.875rem, 4vw, 1rem) !important;
            max-width: 100% !important;
          }

          .cta-section {
            flex-direction: column !important;
            gap: 1rem !important;
            width: 100%;
          }

          .cta-primary,
          .cta-secondary {
            width: 100%;
            justify-content: center;
            padding: 1rem 1.5rem !important;
          }

          .hero-footer {
            flex-direction: column-reverse !important;
            gap: 1.5rem !important;
            align-items: center !important;
          }

          .media-controls {
            order: 2;
          }

          .slide-indicators {
            order: 1;
          }

          .nav-arrow {
            display: none !important;
          }

          .particles-layer {
            opacity: 0.3 !important;
          }

          .bg-layer {
            transform: scale(1.1) !important;
          }

          .hero-header {
            padding-top: 2rem !important;
            height: auto !important;
          }
        }

        @media (max-width: 640px) {
          .hero-container {
            min-height: 650px !important;
          }

          .content-container {
            padding: 0 1.5rem !important;
          }

          .icon-wrapper {
            padding: 10px !important;
          }

          .icon-wrapper svg {
            width: 24px !important;
            height: 24px !important;
          }

          .hero-main {
            gap: 1.25rem !important;
          }

          .control-btn {
            width: 48px !important;
            height: 48px !important;
          }

          .indicator {
            width: 16px !important;
            height: 3px !important;
          }

          .indicator.active {
            width: 36px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-container {
            height: 100vh !important;
            min-height: 800px !important;
          }

          .content-container {
            padding: 0 3rem !important;
          }

          .half-overlay {
            width: 75% !important;
          }

          .hero-main {
            max-width: 70% !important;
          }
        }

        /* High DPI screens */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .bg-layer {
            image-rendering: -webkit-optimize-contrast;
          }
        }

        /* Reduce motion preference */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .bg-layer {
            transform: scale(1.05) !important;
          }
        }

        /* Performance optimizations */
        * {
          box-sizing: border-box;
        }

        .bg-layer {
          transform-origin: center center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .particle {
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Font rendering */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </>
  );
};

export default ACEFHero;