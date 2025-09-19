import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, Globe, MapPin, X, ExternalLink, Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { API_URL, STATIC_URL } from '../../config';
import { useTheme } from '../../theme';
import { motion, AnimatePresence } from 'framer-motion';

const TeamSection = () => {
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [scrollPosition, setScrollPosition] = useState({ horizontal: 0, vertical: 0 });
  const { colors, isDarkMode } = useTheme();
  const containerRef = useRef(null);
  const gridRef = useRef(null);

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
        setError('');
      } catch (err) {
        console.error('Failed to load team data:', err);
        setError('Failed to load team members');
        setMembers([]);
        setFilteredMembers([]);
        setDepartments(['All']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDepartment === 'All') {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter(member => member.department === selectedDepartment));
    }
    setVisibleCount(8);
  }, [selectedDepartment, members]);

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

  const handleSocialClick = (url) => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  // Carousel navigation functions
  const scrollHorizontal = (direction) => {
    if (gridRef.current) {
      const scrollAmount = 320; // Card width + gap
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition.horizontal - scrollAmount)
        : scrollPosition.horizontal + scrollAmount;
      
      gridRef.current.scrollTo({ 
        left: newPosition, 
        behavior: 'smooth' 
      });
      setScrollPosition(prev => ({ ...prev, horizontal: newPosition }));
    }
  };

  const scrollVertical = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 400; // Row height + gap
      const newPosition = direction === 'up'
        ? Math.max(0, scrollPosition.vertical - scrollAmount)
        : scrollPosition.vertical + scrollAmount;
      
      containerRef.current.scrollTo({ 
        top: newPosition, 
        behavior: 'smooth' 
      });
      setScrollPosition(prev => ({ ...prev, vertical: newPosition }));
    }
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (gridRef.current) {
        setScrollPosition(prev => ({ 
          ...prev, 
          horizontal: gridRef.current.scrollLeft 
        }));
      }
      if (containerRef.current) {
        setScrollPosition(prev => ({ 
          ...prev, 
          vertical: containerRef.current.scrollTop 
        }));
      }
    };

    const gridElement = gridRef.current;
    const containerElement = containerRef.current;

    if (gridElement) {
      gridElement.addEventListener('scroll', handleScroll);
    }
    if (containerElement) {
      containerElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (gridElement) {
        gridElement.removeEventListener('scroll', handleScroll);
      }
      if (containerElement) {
        containerElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

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
        ref={containerRef}
        style={{
          background: colors.background,
          minHeight: '100vh',
          fontFamily: '"Nunito Sans", sans-serif',
          position: 'relative',
          paddingBottom: '80px',
          overflow: 'auto'
        }}
      >
        <div style={{
          position: 'relative',
          padding: '80px 60px 0',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              textAlign: 'center',
              marginBottom: '60px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <Users size={36} style={{ color: colors.primary }} />
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: colors.text,
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Our Team
              </h1>
            </div>
            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
              color: colors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: 400
            }}>
              Meet the passionate individuals driving positive environmental change across Africa
            </p>
          </motion.div>

          {/* Department filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '60px',
              padding: '0 16px'
            }}
          >
            {departments.map((dept) => (
              <motion.button
                key={dept}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDepartmentFilter(dept)}
                style={{
                  padding: '12px 24px',
                  background: selectedDepartment === dept 
                    ? colors.primary
                    : 'transparent',
                  color: selectedDepartment === dept ? colors.white : colors.text,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Nunito Sans", sans-serif',
                  boxShadow: selectedDepartment === dept 
                    ? `0 4px 20px ${colors.primary}25`
                    : `0 2px 8px ${colors.cardShadow}`,
                  border: selectedDepartment === dept 
                    ? 'none' 
                    : `1px solid ${colors.border}`,
                  borderRadius: '0'
                }}
              >
                {dept}
                {dept !== 'All' && (
                  <span style={{ 
                    marginLeft: '8px', 
                    opacity: 0.8,
                    fontSize: '0.85rem'
                  }}>
                    ({members.filter(m => m.department === dept).length})
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Team grid with carousel functionality */}
          <div style={{ position: 'relative' }}>








            <motion.div
              ref={gridRef}
              layout
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '40px 30px',
                marginBottom: '60px',
                overflowX: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: `${colors.border} transparent`
              }}
            >
            <AnimatePresence mode="popLayout">
              {filteredMembers.slice(0, visibleCount).map((member, index) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => openModal(member)}
                >
                  {/* Large portrait image */}
                  <div style={{
                    marginBottom: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 8px 32px ${colors.cardShadow}`
                  }}>
                    <img
                      src={member.image_url ? `${STATIC_URL}${member.image_url}` : '/default-profile.png'}
                      alt={member.name}
                      style={{
                        width: '100%',
                        height: '320px',
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
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}
                    className="social-overlay"
                    >
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
                            boxShadow: `0 4px 12px ${colors.cardShadow}`,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.color = colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = colors.surface;
                            e.target.style.color = colors.primary;
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
                            boxShadow: `0 4px 12px ${colors.cardShadow}`,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.color = colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = colors.surface;
                            e.target.style.color = colors.primary;
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
                            fontFamily: '"Nunito Sans", sans-serif'
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
                            fontFamily: '"Nunito Sans", sans-serif'
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
            </AnimatePresence>
          </motion.div>

          {/* Show more button */}
          {visibleCount < filteredMembers.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <button
                onClick={() => setVisibleCount(prev => prev + 8)}
                style={{
                  background: colors.primary,
                  color: colors.white,
                  border: 'none',
                  padding: '16px 32px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Nunito Sans", sans-serif',
                  boxShadow: `0 4px 16px ${colors.primary}30`
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primaryDark;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 20px ${colors.primary}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.primary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 16px ${colors.primary}30`;
                }}
              >
                Load More Team Members ({filteredMembers.length - visibleCount} remaining)
              </button>
            </motion.div>
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
              background: colors.overlayBg,
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
                background: colors.surface,
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: `0 20px 60px ${colors.cardShadow}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: `${colors.text}15`,
                  border: 'none',
                  color: colors.text,
                  cursor: 'pointer',
                  padding: '10px',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary;
                  e.target.style.color = colors.white;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = `${colors.text}15`;
                  e.target.style.color = colors.text;
                }}
              >
                <X size={20} />
              </button>

              {/* Modal content */}
              <div style={{
                padding: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '30px',
                  marginBottom: '32px',
                  flexDirection: window.innerWidth < 768 ? 'column' : 'row'
                }}>
                  <div style={{
                    flexShrink: 0,
                    alignSelf: window.innerWidth < 768 ? 'center' : 'flex-start'
                  }}>
                    <img
                      src={selectedMember.image_url ? `${STATIC_URL}${selectedMember.image_url}` : '/default-profile.png'}
                      alt={selectedMember.name}
                      style={{
                        width: '200px',
                        height: '240px',
                        objectFit: 'cover',
                        boxShadow: `0 8px 32px ${colors.cardShadow}`
                      }}
                      onError={(e) => { 
                        e.target.src = '/default-profile.png'; 
                      }}
                    />
                  </div>
                  
                  <div style={{ 
                    flex: 1, 
                    minWidth: 0,
                    textAlign: window.innerWidth < 768 ? 'center' : 'left'
                  }}>
                    <h2 style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                      fontWeight: 700,
                      color: colors.text,
                      margin: '0 0 12px 0',
                      lineHeight: '1.2'
                    }}>
                      {selectedMember.name}
                    </h2>
                    
                    <p style={{
                      fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
                      color: colors.textSecondary,
                      margin: '0 0 16px 0',
                      fontWeight: 500
                    }}>
                      {selectedMember.position}
                    </p>
                    
                    {selectedMember.department && (
                      <div style={{
                        display: 'inline-block',
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '16px'
                      }}>
                        {selectedMember.department}
                      </div>
                    )}
                    
                    {selectedMember.country && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: colors.textMuted,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        marginBottom: '20px',
                        justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start'
                      }}>
                        <MapPin size={16} />
                        {selectedMember.country}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bio */}
                {selectedMember.bio && (
                  <div style={{
                    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                    color: colors.text,
                    lineHeight: '1.7',
                    marginBottom: '32px',
                    padding: '30px',
                    background: `${colors.primary}05`,
                    boxShadow: `0 4px 16px ${colors.cardShadow}`
                  }}>
                    {selectedMember.bio}
                  </div>
                )}
                
                {/* Social links */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start'
                }}>
                  {selectedMember.linkedin_url && (
                    <button
                      onClick={() => handleSocialClick(selectedMember.linkedin_url)}
                      style={{
                        background: colors.primary,
                        color: colors.white,
                        border: 'none',
                        padding: '14px 24px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        fontFamily: '"Nunito Sans", sans-serif',
                        boxShadow: `0 4px 15px ${colors.primary}30`
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.primaryDark;
                        e.target.style.boxShadow = `0 6px 20px ${colors.primary}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = colors.primary;
                        e.target.style.boxShadow = `0 4px 15px ${colors.primary}30`;
                      }}
                    >
                      <User size={18} />
                      Profile
                    </button>
                  )}
                  
                  {selectedMember.website_url && (
                    <button
                      onClick={() => handleSocialClick(selectedMember.website_url)}
                      style={{
                        background: 'transparent',
                        color: colors.primary,
                        border: `1px solid ${colors.primary}`,
                        padding: '14px 24px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        fontFamily: '"Nunito Sans", sans-serif',
                        boxShadow: `0 2px 8px ${colors.cardShadow}`
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.primary;
                        e.target.style.color = colors.white;
                        e.target.style.boxShadow = `0 4px 15px ${colors.primary}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = colors.primary;
                        e.target.style.boxShadow = `0 2px 8px ${colors.cardShadow}`;
                      }}
                    >
                      <Globe size={18} />
                      Website
                    </button>
                  )}
                </div>
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
        
        /* Custom scrollbar for carousel */
        [style*="overflowX: auto"]::-webkit-scrollbar {
          height: 6px;
        }
        
        [style*="overflowX: auto"]::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        
        [style*="overflowX: auto"]::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        
        [style*="overflowX: auto"]::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.4);
        }

        @media (max-width: 1200px) {
          [style*="grid-template-columns"] {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)) !important;
            gap: 30px 25px !important;
          }
        }
        
        @media (max-width: 768px) {
          [style*="grid-template-columns"] {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
            gap: 25px 20px !important;
          }
          
          [style*="padding: 80px 60px 0"] {
            padding: 60px 20px 0 !important;
          }
          
          [style*="height: 320px"] {
            height: 280px !important;
          }
          
          [style*="padding: 40px"] {
            padding: 24px !important;
          }
          
          [style*="width: 200px"] {
            width: 160px !important;
            height: 200px !important;
          }
          
          .social-overlay {
            opacity: 1 !important;
          }
        }
        
        @media (max-width: 480px) {
          [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          [style*="height: 280px"] {
            height: 260px !important;
          }
          
          [style*="padding: 24px"] {
            padding: 16px !important;
          }
          
          [style*="width: 160px"] {
            width: 140px !important;
            height: 180px !important;
          }
        }
        
        @media (max-width: 360px) {
          [style*="padding: 60px 16px 0"] {
            padding: 40px 12px 0 !important;
          }
          
          [style*="height: 260px"] {
            height: 240px !important;
          }
        }
        
        /* Enhanced focus states for accessibility */
        button:focus-visible {
          outline: 2px solid var(--color-primary, #2563eb);
          outline-offset: 2px;
        }
        
        /* Smooth scrolling for modal */
        [style*="overflow: auto"] {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar styling */
        [style*="overflow: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        
        [style*="overflow: auto"]::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        
        [style*="overflow: auto"]::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
        }
        
        [style*="overflow: auto"]::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.4);
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
          
          .social-overlay {
            opacity: 1 !important;
            position: static !important;
            margin-top: 12px !important;
          }
          
          [style*="whileHover"] {
            transform: none !important;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          button {
            border: 2px solid currentColor !important;
          }
          
          [style*="boxShadow"] {
            box-shadow: 0 0 0 2px currentColor !important;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          [style*="whileHover"] {
            transform: none !important;
          }
        }
        
        /* Print styles */
        @media print {
          [style*="position: fixed"] {
            display: none !important;
          }
          
          [style*="boxShadow"] {
            box-shadow: none !important;
          }
          
          * {
            background: white !important;
            color: black !important;
          }
          
          [style*="height: 320px"] {
            height: auto !important;
            max-height: 200px !important;
          }
        }
        
        /* Loading animation */
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
        
        /* Hover effect for social buttons */
        @media (hover: hover) and (pointer: fine) {
          .social-overlay button:hover {
            transform: translateY(-2px) !important;
          }
        }
        
        /* Ensure proper image aspect ratio */
        [style*="height: 320px"] {
          aspect-ratio: 4/5;
          object-position: center top;
        }
        
        /* Smooth transitions for all interactive elements */
        button, [style*="cursor: pointer"] {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </>
  );
};

export default TeamSection;