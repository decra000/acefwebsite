import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Typography, Container, Box, Button, CircularProgress
} from '@mui/material';
import {
  TrendingUp, Public, Nature, School, WaterDrop,
  Forest, RecyclingOutlined, VolunteerActivism,
  Category as CategoryIcon, ArrowForward, Assessment, GroupsOutlined, CheckCircle,
  Handshake, AttachMoney
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import JoinMovement from '../../components/JoinMovement'; 
import ProjectsDisplay from '../Projects/ProjectsDisplay';
import { useTheme } from '../../theme';
import { API_URL } from '../../config';
import FeaturedImpactsDisplay from './FeaturedImpactsDashboard'
import CountriesReached from './countriesReached'; 
import ImpactHero from './ImpactHero'; 
import TestimonialsSlider from '../../pages/Testimonials/TestimonialsSlider';
import GeneralTestimonialsDisplay from '../../pages/Testimonials/GeneralTestimonialsDisplay';


const API_BASE = API_URL;

// Color palette matching objectives section exactly
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

// Modern container with clean styling
const ModernContainer = styled(Box)(({ customTheme }) => ({
  minHeight: '100vh',
  backgroundColor: customTheme?.colors?.background || colors.surface,
  position: 'relative',
  overflow: 'hidden',
      fontFamily: '"Inter", sans-serif'
}));

// Clean section with subtle background
const CleanSection = styled(Box)({
  position: 'relative',
  background: colors.white,
  padding: '40px 20px',
  overflow: 'hidden'
});

// Refined button styling
const ModernButton = styled(Button)(({ variant = 'primary' }) => ({
  background: variant === 'primary' 
    ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`
    : colors.white,
  color: variant === 'primary' ? colors.white : colors.primary,
  border: variant === 'outline' ? `1px solid ${colors.border}` : 'none',
  borderRadius: '12px',
  padding: '0.75rem 1.5rem',
  fontSize: '0.9rem',
  fontWeight: 500,
  textTransform: 'none',
      fontFamily: '"Inter", sans-serif',
  boxShadow: variant === 'primary' 
    ? `0 4px 16px ${colors.primary}20`
    : '0 2px 8px rgba(0,0,0,0.04)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'primary' 
      ? `0 8px 24px ${colors.primary}30`
      : `0 6px 16px rgba(0,0,0,0.08)`,
    
    ...(variant === 'outline' && {
      background: `${colors.primary}08`,
      borderColor: colors.primary
    })
  }
}));

// Focus area button matching objectives exactly
const FocusAreaButton = styled('button')(({ delay = 0, isVisible = false }) => ({
  width: '100%',
  minHeight: '80px',
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  padding: '20px 18px',
  position: 'relative',
  cursor: 'pointer',
      fontFamily: '"Inter", sans-serif',
  fontSize: '1rem',
  fontWeight: 600,
  color: colors.text,
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
  opacity: isVisible ? 1 : 0,
  transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${delay * 0.05}s`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: colors.primary,
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 25px ${colors.primary}15`,
    borderColor: `${colors.primary}40`,
    
    '&::before': {
      opacity: 1
    }
  }
}));

// Icon mapping for dynamic impact data
const getIconComponent = (iconName) => {
  const iconMap = {
    people: GroupsOutlined,
    location_city: Public,
    check_circle: CheckCircle,
    handshake: Handshake,
    attach_money: AttachMoney,
    volunteer_activism: VolunteerActivism,
    assessment: Assessment,
    trending_up: TrendingUp,
    public: Public,
    nature: Nature,
    school: School,
    water_drop: WaterDrop,
    forest: Forest,
    recycling: RecyclingOutlined
  };
  
  const IconComponent = iconMap[iconName] || Assessment;
  return <IconComponent />;
};

// Enhanced utility functions
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('marine') || name.includes('water') || name.includes('coastal')) return <WaterDrop />;
  if (name.includes('climate') || name.includes('nature') || name.includes('environment')) return <Nature />;
  if (name.includes('agriculture') || name.includes('farming') || name.includes('food')) return <Nature />;
  if (name.includes('waste') || name.includes('recycling') || name.includes('circular')) return <RecyclingOutlined />;
  if (name.includes('community') || name.includes('empowerment') || name.includes('social')) return <GroupsOutlined />;
  if (name.includes('education') || name.includes('training') || name.includes('awareness')) return <School />;
  if (name.includes('forest') || name.includes('tree') || name.includes('biodiversity')) return <Forest />;
  return <CategoryIcon />;
};

// Intersection observer hook
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef(null);

  const memoizedOptions = useMemo(() => ({
    threshold: 0.3,
    ...options
  }), [options]);

  useEffect(() => {
    const currentRef = ref.current;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, memoizedOptions);

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [memoizedOptions]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return [ref, isIntersecting, scrollY];
};

export default function Impact() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProjects, setShowProjects] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const [focusRef, focusVisible, scrollY] = useIntersectionObserver();

  // Memoized function to format impact values
  const formatImpactValue = useCallback((value, unit) => {
    const numValue = parseInt(value) || 0;
    let formatted = '';
    
    if (numValue >= 1000000) {
      formatted = (numValue / 1000000).toFixed(1) + 'M';
    } else if (numValue >= 1000) {
      formatted = (numValue / 1000).toFixed(1) + 'K';
    } else {
      formatted = numValue.toLocaleString();
    }

    if (unit && !unit.toLowerCase().includes('usd') && !unit.toLowerCase().includes('$')) {
      formatted += '+';
    }

    return formatted;
  }, []);

  // Memoized fetchCategories function
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to load categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Fetch categories error:', err);
      setError('Failed to fetch focus areas.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized fetchImpactStats function
  const fetchImpactStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/impacts?is_active=true`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        const transformedStats = data.data
          .filter(impact => impact.is_active)
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map(impact => ({
            icon: getIconComponent(impact.icon),
            value: formatImpactValue(impact.current_value, impact.unit),
            label: impact.name,
            color: impact.color || colors.primary,
            description: impact.description
          }));
        
        console.log('Impact stats loaded:', transformedStats);
      } else {
        console.error('Unexpected impact response format:', data);
      }
    } catch (err) {
      console.error('❌ Fetch impact stats error:', err);
    }
  }, [formatImpactValue]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchImpactStats()
      ]);
    };
    
    initializeData();
  }, [fetchCategories, fetchImpactStats]);

  const handleFocusAreaClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowProjects(true);
    
    setTimeout(() => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  const handleBackToImpact = () => {
    setShowProjects(false);
    setSelectedCategoryId(null);
    
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  if (showProjects) {
    return (
      <ModernContainer customTheme={theme}>
        <Header />
        <Box sx={{ pt: '80px' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <ModernButton
              variant="outline"
              onClick={handleBackToImpact}
              startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
              sx={{ mb: 4 }}
            >
              Back to Impact Overview
            </ModernButton>
          </Container>

          <ProjectsDisplay initialCategoryFilter={selectedCategoryId} />
        </Box>

        <Footer />
      </ModernContainer>
    );
  }

  return (
    <ModernContainer customTheme={theme}>
      <Header />
      <ImpactHero/>
      <FeaturedImpactsDisplay/>
      <CountriesReached/>

      {/* Focus Areas Section - Matching Objectives Style Exactly */}
      <CleanSection ref={focusRef}>
        {/* Subtle background accent */}
        <div style={{
          position: 'absolute',
                    margin: '96px', // 1 inch margin (96px = 1 inch at 96 DPI)

          top: '50%',
          // right: '8%',
          // width: '1px',
          height: '100px',
              background: "linear-gradient(180deg, #21a851 0%, #067a3a 100%)",

          transform: `translateY(-50%) translateY(${scrollY * -0.02}px)`
        }}></div>

        <div style={{
          maxWidth: '1000px',
          // margin: '0 auto',
                    margin: '96px',

          position: 'relative',
          zIndex: 2
        }}>
          
          {/* Header matching objectives exactly */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            transform: focusVisible ? 'translateY(0)' : 'translateY(20px)',
            opacity: focusVisible ? 1 : 0,
            transition: 'all 0.6s ease'
          }}>
            <div>
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
Focus Areas              </Typography>
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
      fontFamily: '"Inter", sans-serif',
            }}>
              IMPACT AREAS
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              gap: '16px'
            }}>
              <CircularProgress 
                size={50} 
                thickness={4}
                style={{ color: colors.primary }} 
              />
              <div style={{
                fontSize: '0.85rem',
                color: colors.textSecondary,
                fontWeight: '500'
              }}>
                Loading focus areas...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '48px 0'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: colors.textSecondary,
                marginBottom: '24px',
                fontWeight: '500'
              }}>
                {error}
              </div>
              <ModernButton onClick={fetchCategories}>
                Try Again
              </ModernButton>
            </div>
          )}

          {/* Focus Areas Grid */}
          {!loading && !error && categories.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}>
              {categories.map((category, index) => (
                <FocusAreaButton
                  key={category.id}
                  delay={index}
                  isVisible={focusVisible}
                  onClick={() => handleFocusAreaClick(category.id)}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: `${colors.primary}10`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'left',
                    justifyContent: 'left',
                    flexShrink: 0
                  }}>
                    {React.cloneElement(getCategoryIcon(category.name), {
                      style: { fontSize: '18px', color: colors.primary }
                    })}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: colors.text,
                      lineHeight: '1.3'
                    }}>
                      {category.name}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: colors.primary,
                      backgroundColor: `${colors.primary}08`,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontWeight: '500',
                      display: 'inline-block',
                      marginTop: '4px'
                    }}>
                      Initiative
                    </div>
                  </div>
                </FocusAreaButton>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && categories.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 0'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: colors.textSecondary,
                marginBottom: '24px',
                fontWeight: '500'
              }}>
                No focus areas available at the moment
              </div>
              <ModernButton onClick={fetchCategories}>
                Refresh
              </ModernButton>
            </div>
          )}

          {/* Bottom accent matching objectives */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '24px',
            gap: '6px',
            opacity: focusVisible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.4s'
          }}>
            <div style={{
              width: '12px',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${colors.primary}40)`
            }}></div>
        
            <div style={{
              width: '12px',
              height: '1px',
              background: `linear-gradient(90deg, ${colors.primary}40, transparent)`
            }}></div>
          </div>
        </div>

        {/* Responsive Styles */}
        <style>{`
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns: repeat(auto-fit, minmax(280px, 1fr))"] {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            
            h2[style*="fontSize: '1.75rem'"] {
              font-size: 1.5rem !important;
            }
          }
        `}</style>
      </CleanSection>

      <ProjectsDisplay/>
      <GeneralTestimonialsDisplay/>
      <JoinMovement/>
      <Footer />
    </ModernContainer>
  );
}