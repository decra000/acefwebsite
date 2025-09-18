import React from 'react';
import { useTheme } from '../../theme';
import { 
  Globe, 
  Handshake, 
  BarChart3, 
  DollarSign,
  Users,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import '../../styles/CrossCuttingStrategies.css';
import {Typography} from '@mui/material';
const CrossCuttingStrategies = () => {
  const { colors, isDarkMode } = useTheme();

  const strategies = [
    {
      id: 1,
      icon: Globe,
      title: "Policy Advocacy",
      description: "UN engagement and youth representation in global discussions",
      features: [
        "Climate policy development",
        "Youth voice amplification",
        "International forums participation",
        "Policy research and analysis"
      ],
      color: colors.primary
    },
    {
      id: 2,
      icon: Handshake,
      title: "Strategic Partnerships",
      description: "Collaboration with agencies, governments, and private sector",
      features: [
        "Multi-sector collaboration",
        "Government partnerships",
        "Private sector engagement",
        "NGO network building"
      ],
      color: colors.secondary
    },
    {
      id: 3,
      icon: BarChart3,
      title: "Knowledge Sharing",
      description: "Research dissemination through our online hub",
      features: [
        "Research publication",
        "Best practices documentation",
        "Digital platform management",
        "Knowledge transfer programs"
      ],
      color: colors.accent
    },
    {
      id: 4,
      icon: DollarSign,
      title: "Resource Mobilization",
      description: "Diversified funding for long-term sustainability",
      features: [
        "Grant writing and management",
        "Donor relationship building",
        "Sustainable financing models",
        "Impact measurement"
      ],
      color: colors.info
    }
  ];

  return (
    <section className="cross-cutting-strategies">
      <div className="strategies-container">
        {/* Header Section */}
        <div className="strategies-header">
          <div className="header-content">
           
             <Typography 
                variant="h3"
                sx={{ 
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: colors.primary,
                  mb: 2,
                  letterSpacing: '-0.02em'
                }}
              >
                Cross-Cutting Strategies
              </Typography>
            <p className="section-description" style={{ color: colors.textSecondary }}>
              Integrated approaches that span across all our programs and initiatives, 
              ensuring comprehensive impact and sustainable change in climate action.
            </p>
          </div>
          
          <div className="header-visual">
            <div 
              className="visual-circle"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Target 
                size={48} 
                style={{ color: colors.primary }}
              />
            </div>
          </div>
        </div>

        {/* Strategies Grid */}
        <div className="strategies-grid">
          {strategies.map((strategy, index) => (
            <div 
              key={strategy.id}
              className="strategy-card"
              style={{
                backgroundColor: isDarkMode ? colors.surface : colors.white,
                border: `1px solid ${isDarkMode ? colors.border : colors.gray200}`,
                '--hover-shadow': `0 20px 60px ${strategy.color}20`
              }}
            >
              {/* Card Header */}
              <div className="card-header">
                <div 
                  className="icon-wrapper"
                  style={{ 
                    backgroundColor: `${strategy.color}15`,
                    border: `2px solid ${strategy.color}30`
                  }}
                >
                  <strategy.icon 
                    size={32} 
                    style={{ color: strategy.color }}
                  />
                </div>
                
                <div className="header-text">
                  <h3 
                    className="strategy-title"
                    style={{ color: colors.text }}
                  >
                    {strategy.title}
                  </h3>
                  <p 
                    className="strategy-description"
                    style={{ color: colors.textSecondary }}
                  >
                    {strategy.description}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="features-section">
                <h4 
                  className="features-title"
                  style={{ color: colors.text }}
                >
                  Activities
                </h4>
                <ul className="features-list">
                  {strategy.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex}
                      className="feature-item"
                      style={{ color: colors.textSecondary }}
                    >
                      <div 
                        className="feature-dot"
                        style={{ backgroundColor: strategy.color }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer
              <div className="card-footer">
                <button 
                  className="learn-more-btn"
                  style={{
                    color: strategy.color,
                    borderColor: `${strategy.color}30`,
                    '--hover-bg': `${strategy.color}10`,
                    '--hover-border': strategy.color
                  }}
                >
                  <BookOpen size={16} />
                  Learn More
                </button>
              </div> */}

              {/* Background Pattern */}
              <div 
                className="card-pattern"
                style={{ 
                  backgroundImage: `radial-gradient(circle at 80% 20%, ${strategy.color}08 0%, transparent 50%)`
                }}
              />
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
       
         
      </div>
    </section>
  );
};

export default CrossCuttingStrategies;