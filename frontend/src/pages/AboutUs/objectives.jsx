import React, { useState, useEffect, useRef } from "react";
import { Target, CheckCircle2, Lightbulb, Handshake, BarChart3, Users, Globe } from 'lucide-react';
import { useTheme } from '../../theme';

export default function ObjectivesSection() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { colors, isDarkMode } = useTheme();

  const objectives = [
    { id: 1, icon: Users, description: "Promote economic empowerment and ensure meaningful participation of the community in poverty reduction", color: colors.primary },
    { id: 2, icon: Lightbulb, description: "Provide education and training in sustainable development and climate change through collaboration", color: colors.info },
    { id: 3, icon: BarChart3, description: "Promote effective solid waste management through proper dumping, sorting, and recycling initiatives", color: colors.accent },
    { id: 4, icon: Globe, description: "Empower community action on water conservation, quality management, and sanitation infrastructure", color: colors.secondary },
    { id: 5, icon: Target, description: "Develop innovations to eliminate harmful processes and utilize natural resources sustainably", color: colors.primary },
    { id: 6, icon: Handshake, description: "Campaign against traditions that hinder sustainable development and promote climate action", color: colors.info },
    { id: 7, icon: CheckCircle2, description: "Safeguard environmental protection rights through advocacy and community mobilization", color: colors.accent }
  ];

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

  return (
    <section
      ref={sectionRef}
      style={{
        fontFamily: '"Inter", sans-serif',
        background: isDarkMode
          ? `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundSecondary} 100%)`
          : `linear-gradient(180deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`,
        padding: '60px 20px',
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

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <div style={{
          marginBottom: '30px',
          textAlign: 'center',
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s ease'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: colors.text,
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            Strategic Objectives
          </h2>
          <div style={{
            width: '80px',
            height: '4px',
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
            margin: '0 auto'
          }}></div>
        </div>

        {/* Two Column List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
          gap: '16px',
          alignItems: 'start'
        }}>
          {objectives.map((objective, index) => (
            <div
              key={objective.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 0',
                borderBottom: `1px solid ${colors.border}20`,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0,
                transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s`
              }}
            >
              {/* Icon only */}
              <div style={{
                minWidth: '32px',
                width: '32px',
                height: '32px',
                backgroundColor: `${objective.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <objective.icon size={18} style={{ color: objective.color }} />
              </div>

              {/* Description */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  color: colors.text,
                  margin: 0,
                  fontWeight: '400'
                }}>
                  {objective.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s ease 0.4s'
        }}>
          <div style={{
            width: '60px',
            height: '2px',
            background: `linear-gradient(90deg, ${colors.primary}40, ${colors.accent}40)`,
            margin: '0 auto'
          }}></div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .objectives-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}