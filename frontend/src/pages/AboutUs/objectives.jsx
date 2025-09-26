import React, { useState, useEffect, useRef } from "react";
import { Target, CheckCircle2, Lightbulb, Handshake, BarChart3, Users, Globe } from 'lucide-react';
import { useTheme } from '../../theme';
import { motion } from 'framer-motion';

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
              {/* Title section */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto 80px auto',
          textAlign: 'center'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '300',
            color: isDarkMode ? colors.text : colors.primary,
            lineHeight: '1.2',
            marginBottom: '24px',
            letterSpacing: '-0.02em',
            fontFamily: '"Nunito Sans", sans-serif',
          }}
        >
            Strategic <span style={{ fontWeight: '700', color: colors.primary }}>Objectives</span>
        </motion.h1>
        











        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ margin: '-50px' }}
          transition={{ duration: 0.8 }}
          style={{
            width: '60px',
            height: '2px',
            background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
            margin: '0 auto 24px auto',
            borderRadius: '1px',
            transformOrigin: 'center'
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: '0',
            letterSpacing: '0.5px',
            fontWeight: 400,
            opacity: 0.9
          }}
        >
          Guided by Purpose · Driven by Impact
        </motion.p>
      </div>

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