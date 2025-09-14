import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Play, Pause, ArrowRight, Globe, Leaf, Droplets, Recycle } from 'lucide-react';

const ACEFHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const particlesRef = useRef([]);

  // Project slides data
  const slides = [
    {
      id: 1,
      title: "Marine Conservation",
      subtitle: "Protecting Our Blue Planet",
      description: "Safeguarding marine ecosystems across Africa's coastlines through innovative conservation strategies and community engagement.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      icon: <Droplets className="w-8 h-8" />,
      stats: { number: "50+", label: "Marine Projects" }
    },
    {
      id: 2,
      title: "Reforestation Initiative",
      subtitle: "Growing Tomorrow's Forests",
      description: "Restoring Africa's green cover through strategic tree planting and forest management programs.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      icon: <Leaf className="w-8 h-8" />,
      stats: { number: "2M+", label: "Trees Planted" }
    },
    {
      id: 3,
      title: "Waste Management",
      subtitle: "Circular Economy Solutions",
      description: "Transforming waste into resources through innovative recycling and sustainable waste management systems.",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      icon: <Recycle className="w-8 h-8" />,
      stats: { number: "1000+", label: "Communities Served" }
    },
    {
      id: 4,
      title: "Climate Action",
      subtitle: "Global Impact Network",
      description: "Building resilient communities through climate adaptation and mitigation strategies across the continent.",
      image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      icon: <Globe className="w-8 h-8" />,
      stats: { number: "15", label: "Countries" }
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Initialize floating particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.2
    }));
  }, []);

  const currentSlideData = slides[currentSlide];

  return (
    <div 
      ref={heroRef}
      className="relative h-screen overflow-hidden bg-black"
      style={{
        background: `linear-gradient(135deg, #0a451c 0%, #052310  50%, #1a5a2c 100%)`
      }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particlesRef.current.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${10 + particle.id}s infinite ease-in-out`
            }}
          />
        ))}
      </div>

      {/* Dynamic Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(156, 207, 159, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 207, 159, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
        }}
      />

      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${1.1 + mousePosition.x * 0.05})`,
                transition: 'transform 0.3s ease-out'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Floating ACEF Logo */}
      <div 
        className="absolute top-8 left-8 z-20"
        style={{
          transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <div className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-green-600 flex items-center justify-center">
            <div 
              className="w-8 h-8 rounded-lg"
              style={{
                background: `linear-gradient(135deg, #facf3c 0%, #9ccf9f 50%, #0a451c 100%)`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            />
          </div>
          <div className="text-white">
            <div className="font-bold text-lg">ACEF</div>
            <div className="text-xs opacity-80">Climate Foundation</div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-8 right-8 z-20 flex items-center space-x-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-yellow-400 scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div 
            className="space-y-8"
            style={{
              transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {/* Animated Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-green-400/20 backdrop-blur-md rounded-full border border-yellow-400/30">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 font-medium text-sm">Empowering Grassroots for a Sustainable Future</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                AFRICA
                <br />
                <span 
                  className="bg-gradient-to-r from-yellow-400 via-green-400 to-green-600 bg-clip-text text-transparent"
                  style={{
                    animation: 'gradient-shift 3s ease-in-out infinite'
                  }}
                >
                  CLIMATE
                </span>
                <br />
                <span className="text-green-400">FOUNDATION</span>
              </h1>
              
              {/* Dynamic Project Info */}
              <div className="bg-gradient-to-r from-green-900/50 to-transparent p-6 rounded-2xl backdrop-blur-sm border border-green-400/20">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="p-2 bg-yellow-400 rounded-lg text-black">
                    {currentSlideData.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{currentSlideData.title}</h3>
                    <p className="text-yellow-400 font-medium">{currentSlideData.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-200 leading-relaxed mb-4">
                  {currentSlideData.description}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{currentSlideData.stats.number}</div>
                    <div className="text-sm text-gray-300">{currentSlideData.stats.label}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-2xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2">
                <span>Explore Projects</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Story</span>
              </button>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-yellow-400 group-hover:scale-110 transition-transform">50M+</div>
                <div className="text-sm text-gray-300">Lives Impacted</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform">15</div>
                <div className="text-sm text-gray-300">Countries</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-yellow-400 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-sm text-gray-300">Projects</div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Elements */}
          <div className="relative">
            {/* 3D Floating Cards */}
            <div className="relative h-96 lg:h-[500px]">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === currentSlide 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : index === (currentSlide + 1) % slides.length
                        ? 'opacity-70 scale-95 translate-y-4 translate-x-8'
                        : 'opacity-30 scale-90 translate-y-8 translate-x-16'
                  }`}
                  style={{
                    zIndex: slides.length - Math.abs(index - currentSlide),
                    transform: `
                      ${index === currentSlide ? 'translateZ(0)' : `translateZ(-${Math.abs(index - currentSlide) * 20}px)`}
                      translate(${mousePosition.x * (index === currentSlide ? 10 : 5)}px, ${mousePosition.y * (index === currentSlide ? 10 : 5)}px)
                    `,
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-green-400/20 transition-all duration-500">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative p-8 h-full flex flex-col justify-end">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-yellow-400 rounded-xl text-black">
                            {slide.icon}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
                            <p className="text-yellow-400">{slide.subtitle}</p>
                          </div>
                        </div>
                        <p className="text-gray-200 leading-relaxed">{slide.description}</p>
                        <div className="flex justify-between items-center pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">{slide.stats.number}</div>
                            <div className="text-xs text-gray-300">{slide.stats.label}</div>
                          </div>
                          <button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500 transition-colors">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 L0,80 Q300,20 600,80 T1200,80 L1200,120 Z"
            fill="url(#waveGradient)"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#facf3c', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#9ccf9f', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#0a451c', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center space-y-2 text-white/80 hover:text-yellow-400 transition-colors cursor-pointer group">
          <span className="text-sm font-medium">Discover More</span>
          <ChevronDown className="w-6 h-6 animate-bounce group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Futuristic HUD Elements */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-20">
        <div className="space-y-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-16 rounded-full transition-all duration-500 cursor-pointer ${
                index === currentSlide 
                  ? 'bg-gradient-to-b from-yellow-400 to-green-400 shadow-lg shadow-yellow-400/50' 
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Geometric Accent Elements */}
      <div className="absolute top-1/4 right-16 w-32 h-32 opacity-20">
        <div 
          className="w-full h-full border-2 border-yellow-400 rounded-full animate-spin"
          style={{ animationDuration: '20s' }}
        />
        <div 
          className="absolute top-4 left-4 w-24 h-24 border-2 border-green-400 rounded-full animate-spin"
          style={{ animationDuration: '15s', animationDirection: 'reverse' }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(250, 207, 60, 0.5); }
          50% { box-shadow: 0 0 40px rgba(250, 207, 60, 0.8), 0 0 60px rgba(156, 207, 159, 0.3); }
        }

        .container {
          max-width: 1200px;
        }

        /* Smooth entrance animations */
        .fade-in-up {
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #facf3c, #9ccf9f);
          border-radius: 10px;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ACEFHeroSection;