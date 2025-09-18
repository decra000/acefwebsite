import React, { useState, useEffect, useRef } from "react";
import { Target, CheckCircle2, ArrowRight, ArrowLeft, Lightbulb, Handshake, BarChart3, Users, Globe } from 'lucide-react';
import { useTheme } from '../../theme';

export default function ObjectivesSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const sectionRef = useRef(null);
  const { colors, isDarkMode } = useTheme();

  const objectives = [
    { id: 1, icon: Users, title: "Economic Empowerment", description: "Promote economic empowerment and ensure meaningful participation of the community in poverty reduction", category: "Community", color: colors.primary },
    { id: 2, icon: Lightbulb, title: "Education & Training", description: "Provide education and training in sustainable development and climate change through collaboration", category: "Capacity", color: colors.info },
    { id: 3, icon: BarChart3, title: "Waste Management", description: "Promote effective solid waste management through proper dumping, sorting, and recycling initiatives", category: "Environment", color: colors.accent },
    { id: 4, icon: Globe, title: "Water Conservation", description: "Empower community action on water conservation, quality management, and sanitation infrastructure", category: "Resources", color: colors.secondary },
    { id: 5, icon: Target, title: "Innovation & Sustainability", description: "Develop innovations to eliminate harmful processes and utilize natural resources sustainably", category: "Innovation", color: colors.primary },
    { id: 6, icon: Handshake, title: "Community Advocacy", description: "Campaign against traditions that hinder sustainable development and promote climate action", category: "Social", color: colors.info },
    { id: 7, icon: CheckCircle2, title: "Environmental Protection", description: "Safeguard environmental protection rights through advocacy and community mobilization", category: "Advocacy", color: colors.accent }
  ];

  const itemsPerPage = 3;
  const totalPages = Math.ceil(objectives.length / itemsPerPage);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.3 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 🔥 Autoplay effect
  useEffect(() => {
    if (!isVisible) return; // only autoplay when section is visible
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
      setHoveredIndex(null);
    }, 5000); // change every 5s
    return () => clearInterval(interval);
  }, [isVisible, totalPages]);

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
        background: isDarkMode
          ? `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundSecondary} 100%)`
          : `linear-gradient(180deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`,
        padding: '50px 20px',
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

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '36px',
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s ease'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              color: colors.text,
              margin: '0 0 6px 0',
              letterSpacing: '-0.01em'
            }}>
              Strategic Objectives
            </h2>
            <div style={{
              width: '50px',
              height: '3px',
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              borderRadius: '2px'
            }}></div>
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: colors.textSecondary,
            fontWeight: '500',
            fontFamily: 'monospace'
          }}>
            {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </div>
        </div>

        {/* Objectives grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
          minHeight: '200px'
        }}>
          {getCurrentItems().map((objective, localIndex) => {
            const globalIndex = currentPage * itemsPerPage + localIndex;
            const isHovered = hoveredIndex === localIndex;

            return (
              <div
                key={objective.id}
                style={{
                  backgroundColor: isDarkMode ? colors.surface : colors.white,
                  border: `1px solid ${isHovered ? `${objective.color}60` : colors.border}`,
                  borderRadius: '12px',
                  padding: '22px 20px',
                  position: 'relative',
                  cursor: 'pointer',
                  transform: isVisible ? (isHovered ? 'translateY(-4px)' : 'translateY(0)') : 'translateY(15px)',
                  opacity: isVisible ? 1 : 0,
                  transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${localIndex * 0.05}s`,
                  boxShadow: isHovered
                    ? `0 8px 25px ${objective.color}25`
                    : isDarkMode
                      ? '0 2px 6px rgba(0,0,0,0.6)'
                      : '0 2px 8px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setHoveredIndex(localIndex)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: objective.color,
                  opacity: isHovered ? 1 : 0.4,
                  transition: 'opacity 0.3s ease'
                }}></div>

                {/* Icon + number */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    backgroundColor: `${objective.color}15`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    <objective.icon size={20} style={{ color: objective.color }} />
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: colors.textSecondary,
                    fontFamily: 'monospace'
                  }}>
                    {String(globalIndex + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Category */}
                <div style={{
                  fontSize: '0.7rem',
                  color: objective.color,
                  backgroundColor: `${objective.color}15`,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  {objective.category}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: colors.text,
                  margin: '0 0 10px 0',
                  lineHeight: '1.35'
                }}>
                  {objective.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  {objective.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={prevPage}
            disabled={totalPages <= 1}
            style={{
              width: '38px',
              height: '38px',
              border: `1px solid ${colors.border}`,
              background: isDarkMode ? colors.surface : colors.white,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: totalPages <= 1 ? 'not-allowed' : 'pointer',
              opacity: totalPages <= 1 ? 0.4 : 1
            }}
          >
            <ArrowLeft size={18} style={{ color: colors.primary }} />
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => { setCurrentPage(index); setHoveredIndex(null); }}
                style={{
                  width: index === currentPage ? '18px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  border: 'none',
                  background: index === currentPage
                    ? `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`
                    : colors.textSecondary,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={totalPages <= 1}
            style={{
              width: '38px',
              height: '38px',
              border: `1px solid ${colors.border}`,
              background: isDarkMode ? colors.surface : colors.white,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: totalPages <= 1 ? 'not-allowed' : 'pointer',
              opacity: totalPages <= 1 ? 0.4 : 1
            }}
          >
            <ArrowRight size={18} style={{ color: colors.primary }} />
          </button>
        </div>
      </div>
    </section>
  );
}
