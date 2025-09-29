import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { User, Globe, MapPin, X, ExternalLink, Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Eye, Menu } from 'lucide-react';
import { API_URL, STATIC_URL } from '../../config';
import { useTheme } from '../../theme';
import { motion, AnimatePresence } from 'framer-motion';

const TeamSection = () => {
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(4);
  const { colors, isDarkMode } = useTheme();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-close navigation on desktop
      if (!mobile) {
        setIsNavigationOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch team members
        const teamRes = await axios.get(`${API_URL}/team`, { withCredentials: true });
        const teamArray = Array.isArray(teamRes.data)
          ? teamRes.data
          : teamRes.data.members || teamRes.data.data || [];

        // Fetch departments
        const deptRes = await axios.get(`${API_URL}/team/departments`, { withCredentials: true });
        const departmentsArray = deptRes.data.data || [];

        // Extract unique countries from team members
        const uniqueCountries = [...new Set(
          teamArray
            .map(member => member.country)
            .filter(country => country && country.trim())
        )].sort();

        // Create department order map
        const departmentOrderMap = {};
        departmentsArray.forEach((dept, index) => {
          departmentOrderMap[dept.name] = dept.order_index !== undefined ? dept.order_index : index;
        });

        // Sort team members by department order
        const sorted = [...teamArray].sort((a, b) => {
          const orderA = departmentOrderMap[a.department] !== undefined 
            ? departmentOrderMap[a.department] 
            : 999;
          const orderB = departmentOrderMap[b.department] !== undefined 
            ? departmentOrderMap[b.department] 
            : 999;
          return orderA - orderB;
        });

        setMembers(sorted);
        setFilteredMembers(sorted);
        setDepartments(['All', ...departmentsArray.map(dept => dept.name)]);
        setCountries(['All', ...uniqueCountries]);
        setError('');
      } catch (err) {
        console.error('Failed to load team data:', err);
        setError('Failed to load team members');
        setMembers([]);
        setFilteredMembers([]);
        setDepartments(['All']);
        setCountries(['All']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = members;

    // Apply department filter
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    // Apply country filter
    if (selectedCountry !== 'All') {
      filtered = filtered.filter(member => member.country === selectedCountry);
    }

    setFilteredMembers(filtered);
    setCurrentIndex(0); // Reset to first page when filters change
    setMobileDisplayCount(4); // Reset mobile display count
    
    // Scroll to top when filters change
    setTimeout(() => {
      const container = document.getElementById('team-slider');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }, [selectedDepartment, selectedCountry, members]);

  // Get available countries based on selected department
  const getAvailableCountries = () => {
    if (selectedDepartment === 'All') {
      return countries;
    }
    
    const departmentMembers = members.filter(member => member.department === selectedDepartment);
    const departmentCountries = [...new Set(
      departmentMembers
        .map(member => member.country)
        .filter(country => country && country.trim())
    )].sort();
    
    return ['All', ...departmentCountries];
  };

  // Reset country filter when department changes and selected country is not available
  useEffect(() => {
    const availableCountries = getAvailableCountries();
    if (!availableCountries.includes(selectedCountry)) {
      setSelectedCountry('All');
    }
  }, [selectedDepartment]);

  // Chunk members into groups of 6 for desktop (3x2 grid), 1 for mobile
  const getMemberChunks = () => {
    const chunkSize = isMobile ? 1 : 6;
    const chunks = [];
    for (let i = 0; i < filteredMembers.length; i += chunkSize) {
      chunks.push(filteredMembers.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const memberChunks = getMemberChunks();

  // Navigation functions
  const scrollToIndex = (index) => {
    const chunks = getMemberChunks();
    if (index >= chunks.length) {
      index = Math.max(0, chunks.length - 1);
    }
    if (index < 0) {
      index = 0;
    }
    
    setCurrentIndex(index);
    const container = document.getElementById('team-slider');
    if (container) {
      const itemHeight = isMobile ? 550 : 900;
      container.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      });
    }
    // Close navigation after selection on mobile
    if (isMobile) {
      setIsNavigationOpen(false);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const itemHeight = isMobile ? 550 : 900;
    const newIndex = Math.round(container.scrollTop / itemHeight);
    const chunks = getMemberChunks();
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < chunks.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentIndex < memberChunks.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
    if (isDownSwipe && currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const openModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
  };

  const handleCountryFilter = (country) => {
    setSelectedCountry(country);
  };

  const handleSocialClick = (url) => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  // Navigation Panel Component (for desktop slider only)
  const NavigationPanel = ({ style = {} }) => (
    <div style={{
      ...style,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => currentIndex > 0 && scrollToIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{
            background: currentIndex === 0 ? 'transparent' : colors.primary,
            color: currentIndex === 0 ? colors.textSecondary : colors.white,
            border: `1px solid ${currentIndex === 0 ? colors.textSecondary : colors.primary}`,
            padding: '8px',
            borderRadius: '6px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === 0 ? 0.5 : 1,
            transition: 'all 0.3s ease',
            minWidth: '32px',
            minHeight: '32px'
          }}
        >
          <ChevronUp size={16} />
        </button>
        
        <button
          onClick={() => currentIndex < memberChunks.length - 1 && scrollToIndex(currentIndex + 1)}
          disabled={currentIndex === memberChunks.length - 1}
          style={{
            background: currentIndex === memberChunks.length - 1 ? 'transparent' : colors.primary,
            color: currentIndex === memberChunks.length - 1 ? colors.textSecondary : colors.white,
            border: `1px solid ${currentIndex === memberChunks.length - 1 ? colors.textSecondary : colors.primary}`,
            padding: '8px',
            borderRadius: '6px',
            cursor: currentIndex === memberChunks.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === memberChunks.length - 1 ? 0.5 : 1,
            transition: 'all 0.3s ease',
            minWidth: '32px',
            minHeight: '32px'
          }}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Progress indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <span style={{
          fontSize: '12px',
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          {currentIndex + 1} / {memberChunks.length}
        </span>
        <div style={{
          flex: '1',
          height: '2px',
          backgroundColor: colors.textSecondary + '30',
          borderRadius: '1px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentIndex + 1) / memberChunks.length) * 100}%`,
            height: '100%',
            backgroundColor: colors.primary,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Page Navigation Dots */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {memberChunks.map((chunk, index) => (
          <motion.button
            key={index}
            onClick={() => scrollToIndex(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? colors.primary : colors.textSecondary,
              transition: 'all 0.3s ease',
              opacity: index === currentIndex ? 1 : 0.5,
              flexShrink: 0
            }} />
            <div style={{
              fontSize: '12px',
              color: index === currentIndex ? colors.primary : colors.textSecondary,
              fontWeight: index === currentIndex ? '600' : '400',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.2',
              transition: 'all 0.3s ease'
            }}>
              Page {index + 1}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // Dropdown component for mobile
  const FilterDropdown = ({ label, value, options, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: colors.text,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '"Nunito Sans", sans-serif',
            boxShadow: `0 2px 4px ${colors.cardShadow}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon size={16} color={colors.textSecondary} />
            <span>{label}: {value}</span>
            {value !== 'All' && (
              <span style={{ 
                fontSize: '0.8rem', 
                opacity: 0.7,
                marginLeft: '4px'
              }}>
                ({value === 'All' ? filteredMembers.length : 
                  label === 'Department' ? 
                    members.filter(m => m.department === value).length :
                    (selectedDepartment === 'All' ? 
                      members.filter(m => m.country === value).length :
                      members.filter(m => m.department === selectedDepartment && m.country === value).length)
                })
              </span>
            )}
          </div>
          <ChevronDown 
            size={16} 
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                boxShadow: `0 8px 24px ${colors.cardShadow}`,
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '4px'
              }}
            >
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: value === option ? `${colors.primary}15` : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: value === option ? colors.primary : colors.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontWeight: value === option ? 600 : 400,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option) {
                      e.target.style.backgroundColor = `${colors.textSecondary}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{option}</span>
                  {option !== 'All' && (
                    <span style={{ 
                      fontSize: '0.8rem', 
                      opacity: 0.7,
                      color: colors.textSecondary
                    }}>
                      ({label === 'Department' ? 
                        members.filter(m => m.department === option).length :
                        (selectedDepartment === 'All' ? 
                          members.filter(m => m.country === option).length :
                          members.filter(m => m.department === selectedDepartment && m.country === option).length)
                      })
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading) {
    return (
      <section style={{ 
        minHeight: '100vh', 
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Nunito Sans", sans-serif'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            border: `3px solid ${colors.border}`,
            borderTop: `3px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '1.1rem',
            color: colors.text,
            fontWeight: 500
          }}>
            Loading team members...
          </p>
        </motion.div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Nunito Sans", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: colors.error,
          fontSize: '1.1rem'
        }}>
          {error}
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: '"Nunito Sans", sans-serif'
      }}>
        <div style={{ color: colors.text }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: '0 0 12px 0'
          }}>
            No team members found
          </h3>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            margin: 0
          }}>
            Team members will appear here once they are added.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section 
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)' 
            : 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
          minHeight: '100vh',
          fontFamily: '"Nunito Sans", sans-serif',
          position: 'relative',
          padding: isMobile ? '40px 0' : '100px 0'
        }}
      >
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 20px'
        }}>
          {/* Title section */}
          <div
            style={{
              maxWidth: '1100px',
              margin: isMobile ? '0 auto 40px auto' : '0 auto 60px auto',
              textAlign: 'center'
            }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-50px' }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: isMobile ? '1.8rem' : 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '300',
                color: isDarkMode ? colors.text : colors.primary,
                lineHeight: '1.2',
                marginBottom: '20px',
                letterSpacing: '-0.02em',
                fontFamily: '"Nunito Sans", sans-serif',
              }}
            >
              Our <span style={{ fontWeight: '700', color: colors.primary }}>Team</span>
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
                margin: '0 auto 20px auto',
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
                fontSize: isMobile ? '14px' : '16px',
                color: colors.textSecondary,
                margin: '0',
                letterSpacing: '0.5px',
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: '1.5'
              }}
            >
              Meet the passionate individuals driving positive environmental change across Africa
            </motion.p>
          </div>

          {/* Filters - Mobile Only */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '40px'
              }}
            >
              <FilterDropdown
                label="Department"
                value={selectedDepartment}
                options={departments}
                onChange={handleDepartmentFilter}
                icon={Users}
              />
              
              {getAvailableCountries().length > 2 && (
                <FilterDropdown
                  label="Country"
                  value={selectedCountry}
                  options={getAvailableCountries()}
                  onChange={handleCountryFilter}
                  icon={MapPin}
                />
              )}
            </motion.div>
          )}

          {/* Team Display Container */}
          <div style={{
            display: 'flex',
            gap: isMobile ? '0' : '40px',
            alignItems: 'stretch',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            {/* Team Content */}
            {isMobile ? (
              // Mobile: Collapsible groups of 4
              <div style={{
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.3)' 
                  : 'rgba(255, 255, 255, 0.5)',
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                backdropFilter: 'blur(20px)',
                boxShadow: isDarkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.08)',
                padding: '24px 20px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {filteredMembers.slice(0, mobileDisplayCount).map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: (index % 4) * 0.1,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.3 }
                      }}
                      style={{
                        cursor: 'pointer',
                        position: 'relative',
                        width: '100%'
                      }}
                      onClick={() => openModal(member)}
                    >
                      {/* Large portrait image */}
                      <div style={{
                        marginBottom: '20px',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        boxShadow: `0 8px 32px ${colors.cardShadow}`
                      }}>
                        <img
                          src={member.image_url ? `${STATIC_URL}${member.image_url}` : '/default-profile.png'}
                          alt={member.name}
                          style={{
                            width: '100%',
                            height: '260px',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'all 0.3s ease'
                          }}
                          onError={(e) => { 
                            e.target.src = '/default-profile.png'; 
                          }}
                        />
                        
                        {/* Overlay with social links */}
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          display: 'flex',
                          gap: '8px',
                          opacity: 1
                        }}>
                          {member.linkedin_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSocialClick(member.linkedin_url);
                              }}
                              style={{
                                background: colors.surface,
                                color: colors.primary,
                                border: 'none',
                                padding: '8px',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                boxShadow: `0 4px 12px ${colors.cardShadow}`,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <User size={16} />
                            </button>
                          )}
                          
                          {member.website_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSocialClick(member.website_url);
                              }}
                              style={{
                                background: colors.surface,
                                color: colors.primary,
                                border: 'none',
                                padding: '8px',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                boxShadow: `0 4px 12px ${colors.cardShadow}`,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Globe size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Member info */}
                      <div style={{ textAlign: 'left' }}>
                        <h3 style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: colors.text,
                          margin: '0 0 8px 0',
                          lineHeight: '1.2'
                        }}>
                          {member.name}
                        </h3>

                        <p style={{
                          fontSize: '1rem',
                          color: colors.textSecondary,
                          margin: '0 0 12px 0',
                          fontWeight: 500,
                          lineHeight: '1.4'
                        }}>
                          {member.position}
                        </p>

                        {member.country && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: colors.textMuted,
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            marginBottom: '16px'
                          }}>
                            <MapPin size={14} />
                            {member.country}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          marginTop: '12px'
                        }}>
                          {/* Bio button */}
                          {member.bio && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(member);
                              }}
                              style={{
                                background: 'transparent',
                                color: colors.primary,
                                border: `1px solid ${colors.border}`,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                fontFamily: '"Nunito Sans", sans-serif',
                                borderRadius: '4px',
                                minHeight: '36px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = colors.primary;
                                e.target.style.color = colors.white;
                                e.target.style.borderColor = colors.primary;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = colors.primary;
                                e.target.style.borderColor = colors.border;
                              }}
                            >
                              <FileText size={12} />
                              Read Bio
                            </button>
                          )}

                          {/* Profile link */}
                          {(member.linkedin_url || member.website_url) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSocialClick(member.linkedin_url || member.website_url);
                              }}
                              style={{
                                background: 'transparent',
                                color: colors.primary,
                                border: `1px solid ${colors.border}`,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                fontFamily: '"Nunito Sans", sans-serif',
                                borderRadius: '4px',
                                minHeight: '36px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = colors.primary;
                                e.target.style.color = colors.white;
                                e.target.style.borderColor = colors.primary;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = colors.primary;
                                e.target.style.borderColor = colors.border;
                              }}
                            >
                              {member.linkedin_url ? (
                                <User size={12} />
                              ) : (
                                <Globe size={12} />
                              )}
                              View Profile
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Show More Button */}
                  {mobileDisplayCount < filteredMembers.length && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMobileDisplayCount(prev => Math.min(prev + 4, filteredMembers.length))}
                      style={{
                        background: colors.primary,
                        color: colors.white,
                        border: 'none',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: '"Nunito Sans", sans-serif',
                        boxShadow: `0 4px 16px ${colors.primary}30`,
                        transition: 'all 0.3s ease',
                        alignSelf: 'center',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '48px'
                      }}
                    >
                      <ChevronDown size={20} />
                      Show More ({Math.min(4, filteredMembers.length - mobileDisplayCount)} more)
                    </motion.button>
                  )}

                  {/* Show Less Button - appears when more than 4 are shown */}
                  {mobileDisplayCount > 4 && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setMobileDisplayCount(4);
                        // Scroll to top of the team section
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }}
                      style={{
                        background: 'transparent',
                        color: colors.textSecondary,
                        border: `1px solid ${colors.border}`,
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: '"Nunito Sans", sans-serif',
                        transition: 'all 0.3s ease',
                        alignSelf: 'center',
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '44px'
                      }}
                    >
                      <ChevronUp size={16} />
                      Show Less
                    </motion.button>
                  )}
                </div>
              </div>
            ) : (
              // Desktop: Slider with 3x2 grid
              <div
                id="team-slider"
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  flex: '1',
                  height: '900px',
                  overflowY: memberChunks.length > 1 ? 'scroll' : 'hidden',
                  scrollSnapType: 'y mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  background: isDarkMode 
                    ? 'rgba(30, 41, 59, 0.3)' 
                    : 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
                    : '0 8px 32px rgba(0, 0, 0, 0.08)'
                }}
              >
                <style>
                  {`
                    #team-slider::-webkit-scrollbar {
                      display: none;
                    }
                  `}
                </style>
                
                {memberChunks.map((chunk, chunkIndex) => (
                  <div
                    key={chunkIndex}
                    style={{
                      height: '900px',
                      scrollSnapAlign: 'start',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '30px',
                      padding: '40px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Desktop: Grid layout for 6 members (3x2) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '30px',
                      width: '100%',
                      height: '100%'
                    }}>
                      {chunk.map((member, memberIndex) => (
                        <div
                          key={member.id}
                          style={{
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                          }}
                          onClick={() => openModal(member)}
                        >
                          {/* Member portrait */}
                          <div style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            height: '250px',
                            marginBottom: '16px'
                          }}>
                            <img
                              src={member.image_url ? `${STATIC_URL}${member.image_url}` : '/default-profile.png'}
                              alt={member.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'all 0.3s ease'
                              }}
                              onError={(e) => { 
                                e.target.src = '/default-profile.png'; 
                              }}
                            />
                            
                            {/* Overlay with social links */}
                            <div 
                              className="social-overlay"
                              style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                display: 'flex',
                                gap: '8px',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                              }}
                            >
                              {member.linkedin_url && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSocialClick(member.linkedin_url);
                                  }}
                                  style={{
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <User size={14} />
                                </button>
                              )}
                              
                              {member.website_url && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSocialClick(member.website_url);
                                  }}
                                  style={{
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Globe size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Member info */}
                          <div style={{ 
                            textAlign: 'left', 
                            flex: '1', 
                            display: 'flex', 
                            flexDirection: 'column',
                            minHeight: '120px'
                          }}>
                            <h3 style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: colors.text,
                              margin: '0 0 6px 0',
                              lineHeight: '1.3',
                              fontFamily: '"Nunito Sans", sans-serif',
                              wordBreak: 'break-word',
                              hyphens: 'auto'
                            }}>
                              {member.name}
                            </h3>

                            <p style={{
                              fontSize: '0.85rem',
                              color: colors.textSecondary,
                              margin: '0 0 10px 0',
                              fontWeight: 500,
                              lineHeight: '1.4',
                              wordBreak: 'break-word',
                              hyphens: 'auto',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {member.position}
                            </p>

                            {member.country && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: colors.textMuted,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                marginBottom: '10px'
                              }}>
                                <MapPin size={11} />
                                {member.country}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div style={{
                              display: 'flex',
                              gap: '6px',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              marginTop: 'auto'
                            }}>
                              {/* Bio button */}
                              {member.bio && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(member);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    color: colors.text,
                                    border: 'none',
                                    padding: "0",
                                    fontWeight: "500",
                                    fontSize: '11px',
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    fontFamily: '"Nunito Sans", sans-serif',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Eye size={10} />
                                  <span style={{
                                    borderBottom: `1px solid ${colors.textSecondary}`,
                                    paddingBottom: '1px',
                                  }}>
                                    Read Bio
                                  </span>
                                </button>
                              )}

                              {/* Profile link */}
                              {(member.linkedin_url || member.website_url) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSocialClick(member.linkedin_url || member.website_url);
                                  }}
                                  style={{
                                    background: colors.primary,
                                    color: colors.white,
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    fontWeight: "600",
                                    fontSize: '10px',
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    fontFamily: '"Nunito Sans", sans-serif',
                                    boxShadow: `0 2px 8px ${colors.primary}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  {member.linkedin_url ? (
                                    <User size={9} />
                                  ) : (
                                    <Globe size={9} />
                                  )}
                                  View Profile
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Filters - Show if not mobile */}
            {!isMobile && (
              <div style={{
                flex: '0 0 auto',
                width: '240px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Department filter */}
                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '12px',
                    fontFamily: '"Nunito Sans", sans-serif'
                  }}>
                    Department
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {departments.map((dept) => (
                      <motion.button
                        key={dept}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDepartmentFilter(dept)}
                        style={{
                          padding: '10px 16px',
                          background: selectedDepartment === dept 
                            ? colors.primary
                            : 'transparent',
                          color: selectedDepartment === dept ? colors.white : colors.text,
                          fontSize: '13px',
                          fontWeight: selectedDepartment === dept ? 600 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: '"Nunito Sans", sans-serif',
                          border: `1px solid ${selectedDepartment === dept ? colors.primary : colors.border}`,
                          borderRadius: '6px',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{dept}</span>
                        {dept !== 'All' && (
                          <span style={{ 
                            opacity: 0.8,
                            fontSize: '11px'
                          }}>
                            ({members.filter(m => m.department === dept).length})
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Country filter - only show if there are multiple countries available */}
                {getAvailableCountries().length > 2 && (
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: '12px',
                      fontFamily: '"Nunito Sans", sans-serif'
                    }}>
                      Country
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {getAvailableCountries().map((country) => (
                        <motion.button
                          key={country}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCountryFilter(country)}
                          style={{
                            padding: '10px 16px',
                            background: selectedCountry === country 
                              ? colors.secondary || colors.primary
                              : 'transparent',
                            color: selectedCountry === country ? colors.white : colors.textSecondary,
                            fontSize: '13px',
                            fontWeight: selectedCountry === country ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontFamily: '"Nunito Sans", sans-serif',
                            border: `1px solid ${selectedCountry === country ? (colors.secondary || colors.primary) : colors.border}`,
                            borderRadius: '6px',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{country}</span>
                          {country !== 'All' && (
                            <span style={{ 
                              opacity: 0.8,
                              fontSize: '11px'
                            }}>
                              ({selectedDepartment === 'All' 
                                ? members.filter(m => m.country === country).length
                                : members.filter(m => m.department === selectedDepartment && m.country === country).length
                              })
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                background: isDarkMode 
                  ? 'rgba(30, 41, 59, 0.98)' 
                  : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(30px)',
                borderRadius: '16px',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                maxWidth: isMobile ? '95vw' : '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: isDarkMode 
                  ? '0 25px 80px rgba(0, 0, 0, 0.5)' 
                  : '0 25px 80px rgba(0, 0, 0, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Image */}
              <div style={{ 
                height: isMobile ? '200px' : '280px',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '16px 16px 0 0'
              }}>
                <img
                  src={selectedMember.image_url ? `${STATIC_URL}${selectedMember.image_url}` : '/default-profile.png'}
                  alt={selectedMember.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '60px',
                  background: isDarkMode 
                    ? 'linear-gradient(transparent, rgba(30, 41, 59, 0.8))'
                    : 'linear-gradient(transparent, rgba(255, 255, 255, 0.8))'
                }} />
                
                <button
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    width: isMobile ? '36px' : '32px',
                    height: isMobile ? '36px' : '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <X size={isMobile ? 18 : 16} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ 
                padding: isMobile ? '20px 20px 24px' : '32px 32px 32px', 
                maxHeight: isMobile ? '300px' : '400px', 
                overflow: 'auto' 
              }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  lineHeight: '1.2',
                  fontFamily: '"Nunito Sans", sans-serif',
                }}>
                  {selectedMember.website_url && (
                    <motion.button
                      onClick={() => handleSocialClick(selectedMember.website_url)}
                      style={{
                        background: 'transparent',
                        color: colors.text,
                        border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                        padding: isMobile ? '14px 24px' : '12px 24px',
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: '"Nunito Sans", sans-serif',
                        flex: selectedMember.linkedin_url ? '1' : '2',
                        minHeight: isMobile ? '48px' : '40px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      whileHover={{
                        backgroundColor: colors.text,
                        color: colors.background
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Globe size={16} />
                      Website
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={closeModal}
                    style={{
                      background: 'transparent',
                      color: colors.textSecondary,
                      border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                      padding: isMobile ? '14px 24px' : '12px 24px',
                      borderRadius: '8px',
                      fontSize: isMobile ? '14px' : '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: '"Nunito Sans", sans-serif',
                      minHeight: isMobile ? '48px' : '40px',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{
                      backgroundColor: colors.textSecondary,
                      color: colors.background
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                                </h3>

                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800;900&display=swap');
        
        .social-overlay {
          opacity: 0;
        }
        
        [style*="cursor: pointer"]:hover .social-overlay {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .social-overlay {
            opacity: 1 !important;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 44px !important;
            min-width: 44px !important;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default TeamSection;