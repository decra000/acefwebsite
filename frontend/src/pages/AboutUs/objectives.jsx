import React, { useState, useEffect, useRef } from "react";
import { Target, CheckCircle2, ArrowRight, ArrowLeft, Lightbulb, Handshake, BarChart3, Users, Globe } from 'lucide-react';

export default function ObjectivesSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const sectionRef = useRef(null);

  const colors = {
    primary: '#0a451c',
    secondary: '#facf3c',
    accent: '#9ccf9f',
    info: '#3b82f6',
    primaryLight: '#1a5a2c',
    white: '#ffffff',
    surface: '#fafafa',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };

  const objectives = [
    {
      id: 1,
      icon: Users,
      title: "Economic Empowerment",
      description: "Promote economic empowerment and ensure meaningful participation of the community in poverty reduction",
      category: "Community",
      color: colors.primary
    },
    {
      id: 2,
      icon: Lightbulb,
      title: "Education & Training",
      description: "Provide education and training in sustainable development and climate change through collaboration",
      category: "Capacity",
      color: colors.info
    },
    {
      id: 3,
      icon: BarChart3,
      title: "Waste Management",
      description: "Promote effective solid waste management through proper dumping, sorting, and recycling initiatives",
      category: "Environment",
      color: colors.accent
    },
    {
      id: 4,
      icon: Globe,
      title: "Water Conservation",
      description: "Empower community action on water conservation, quality management, and sanitation infrastructure",
      category: "Resources",
      color: colors.secondary
    },
    {
      id: 5,
      icon: Target,
      title: "Innovation & Sustainability",
      description: "Develop innovations to eliminate harmful processes and utilize natural resources sustainably",
      category: "Innovation",
      color: colors.primary
    },
    {
      id: 6,
      icon: Handshake,
      title: "Community Advocacy",
      description: "Campaign against traditions that hinder sustainable development and promote climate action",
      category: "Social",
      color: colors.info
    },
    {
      id: 7,
      icon: CheckCircle2,
      title: "Environmental Protection",
      description: "Safeguard environmental protection rights through advocacy and community mobilization",
      category: "Advocacy",
      color: colors.accent
    }
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(objectives.length / itemsPerPage);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const getCurrentItems = () => {
    const start = currentPage * itemsPerPage;
    return objectives.slice(start, start + itemsPerPage);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setHoveredIndex(null);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setHoveredIndex(null);
  };

  return (
    <section 
      ref={sectionRef}
      style={{
        fontFamily: '"Inter", sans-serif',
        background: colors.white,
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background accent */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '8%',
        width: '1px',
        height: '100px',
        background: `linear-gradient(180deg, transparent, ${colors.accent}30, transparent)`,
        transform: `translateY(-50%) translateY(${scrollY * -0.02}px)`
      }}></div>

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* Minimal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s ease'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: colors.text,
              margin: '0 0 6px 0',
              letterSpacing: '-0.01em'
            }}>
              Strategic Objectives
            </h2>
            <div style={{
              width: '40px',
              height: '2px',
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              borderRadius: '1px'
            }}></div>
          </div>
          
          <div style={{
            fontSize: '0.75rem',
            color: colors.textSecondary,
            fontWeight: '500',
            fontFamily: 'monospace'
          }}>
            {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </div>
        </div>

        {/* Objectives Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
          minHeight: '180px'
        }}>
          {getCurrentItems().map((objective, localIndex) => {
            const globalIndex = currentPage * itemsPerPage + localIndex;
            const isHovered = hoveredIndex === localIndex;
            
            return (
              <div
                key={objective.id}
                style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${isHovered ? `${objective.color}40` : colors.border}`,
                  borderRadius: '12px',
                  padding: '20px 18px',
                  position: 'relative',
                  cursor: 'pointer',
                  transform: isVisible ? 
                    (isHovered ? 'translateY(-3px)' : 'translateY(0)') : 
                    'translateY(15px)',
                  opacity: isVisible ? 1 : 0,
                  transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${localIndex * 0.05}s`,
                  boxShadow: isHovered ? 
                    `0 8px 25px ${objective.color}15` : 
                    '0 2px 8px rgba(0,0,0,0.04)',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setHoveredIndex(localIndex)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: objective.color,
                  opacity: isHovered ? 1 : 0.3,
                  transition: 'opacity 0.3s ease'
                }}></div>
                
                {/* Icon and number */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: `${objective.color}10`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                  }}>
                    <objective.icon size={18} style={{ color: objective.color }} />
                  </div>
                  
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                    fontFamily: 'monospace'
                  }}>
                    {String(globalIndex + 1).padStart(2, '0')}
                  </div>
                </div>
                
                {/* Category tag */}
                <div style={{
                  fontSize: '0.65rem',
                  color: objective.color,
                  backgroundColor: `${objective.color}08`,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  {objective.category}
                </div>
                
                {/* Title */}
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: colors.text,
                  margin: '0 0 8px 0',
                  lineHeight: '1.3'
                }}>
                  {objective.title}
                </h3>
                
                {/* Description */}
                <p style={{
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  {objective.description}
                </p>
                
                {/* Bottom indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '20%',
                  right: '20%',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${objective.color}40, transparent)`,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}></div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          {/* Previous button */}
          <button
            onClick={prevPage}
            disabled={totalPages <= 1}
            style={{
              width: '36px',
              height: '36px',
              border: `1px solid ${colors.border}`,
              background: colors.white,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: totalPages <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: totalPages <= 1 ? 0.4 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => {
              if (totalPages > 1) {
                e.target.style.borderColor = colors.primary;
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (totalPages > 1) {
                e.target.style.borderColor = colors.border;
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            <ArrowLeft size={16} style={{ color: colors.primary }} />
          </button>

          {/* Page dots */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentPage(index);
                  setHoveredIndex(null);
                }}
                style={{
                  width: index === currentPage ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  border: 'none',
                  background: index === currentPage 
                    ? `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`
                    : colors.gray200,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={nextPage}
            disabled={totalPages <= 1}
            style={{
              width: '36px',
              height: '36px',
              border: `1px solid ${colors.border}`,
              background: colors.white,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: totalPages <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: totalPages <= 1 ? 0.4 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => {
              if (totalPages > 1) {
                e.target.style.borderColor = colors.primary;
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (totalPages > 1) {
                e.target.style.borderColor = colors.border;
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            <ArrowRight size={16} style={{ color: colors.primary }} />
          </button>
        </div>

        {/* Bottom accent */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '24px',
          gap: '6px',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.4s'
        }}>
          <div style={{
            width: '12px',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${colors.primary}40)`
          }}></div>
          <div style={{
            fontSize: '0.6rem',
            color: colors.textSecondary,
            fontWeight: '500',
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}>
            IMPACT FRAMEWORK
          </div>
          <div style={{
            width: '12px',
            height: '1px',
            background: `linear-gradient(90deg, ${colors.primary}40, transparent)`
          }}></div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section {
            padding: 30px 20px !important;
          }
          
          div[style*="gridTemplateColumns: repeat(auto-fit, minmax(230px, 1fr))"] {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            gap: 12px !important;
          }
          
          h2[style*="fontSize: '1.75rem'"] {
            font-size: 1.5rem !important;
          }
          
          div[style*="padding: '20px 18px'"] {
            padding: 18px 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          div[style*="gridTemplateColumns: repeat(auto-fit, minmax(280px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}