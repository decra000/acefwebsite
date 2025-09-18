import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Linkedin, Globe, MapPin, X, ExternalLink, Users } from 'lucide-react';
import { API_URL, STATIC_URL } from '../../config';
import { useTheme } from '../../theme';
import { motion, AnimatePresence } from 'framer-motion';

const TeamSection = () => {
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const { colors, isDarkMode } = useTheme();

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
    setVisibleCount(6);
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

  if (loading) {
    return (
      <section style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f5 100%)',
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
            border: '3px solid #e5f4e8',
            borderTop: '3px solid #2d5a3d',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '1.1rem',
            color: '#2d5a3d',
            fontWeight: 500
          }}>
            Loading team members...
          </p>
        </motion.div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Nunito Sans", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#2d5a3d',
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
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: '"Nunito Sans", sans-serif'
      }}>
        <div style={{ color: '#2d5a3d' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: '0 0 12px 0'
          }}>
            No team members found
          </h3>
          <p style={{
            fontSize: '1rem',
            opacity: 0.7,
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
      <section style={{
        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f5 100%)',
        minHeight: '100vh',
        fontFamily: '"Nunito Sans", sans-serif',
        position: 'relative'
      }}>
        <div style={{
          position: 'relative',
          padding: '80px 24px',
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
              gap: '12px',
              marginBottom: '20px'
            }}>
              <Users size={32} style={{ color: '#2d5a3d' }} />
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: '#2d5a3d',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Our Team
              </h1>
            </div>
            <p style={{
              fontSize: '1.2rem',
              color: '#5a7a65',
              maxWidth: '540px',
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
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '50px',
              padding: '0 20px'
            }}
          >
            {departments.map((dept) => (
              <motion.button
                key={dept}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDepartmentFilter(dept)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: selectedDepartment === dept 
                    ? '#2d5a3d'
                    : 'rgba(255,255,255,0.7)',
                  color: selectedDepartment === dept ? 'white' : '#2d5a3d',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Nunito Sans", sans-serif',
                  backdropFilter: 'blur(10px)',
                  boxShadow: selectedDepartment === dept 
                    ? '0 4px 20px rgba(45,90,61,0.25)'
                    : '0 2px 10px rgba(45,90,61,0.1)',
                  border: selectedDepartment === dept ? 'none' : '1px solid rgba(45,90,61,0.15)'
                }}
              >
                {dept}
                {dept !== 'All' && (
                  <span style={{ 
                    marginLeft: '6px', 
                    opacity: 0.7,
                    fontSize: '0.85rem'
                  }}>
                    ({members.filter(m => m.department === dept).length})
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Team grid */}
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '50px'
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
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(45,90,61,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => openModal(member)}
                >
                  <div style={{
                    textAlign: 'center'
                  }}>
                    {/* Image */}
                    <div style={{
                      marginBottom: '20px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, rgba(45,90,61,0.05), transparent)',
                        padding: '3px'
                      }}>
                        <img
                          src={member.image_url ? `${STATIC_URL}${member.image_url}` : '/default-profile.png'}
                          alt={member.name}
                          style={{
                            width: '160px',
                            height: '180px',
                            objectFit: 'cover',
                            borderRadius: '13px',
                            filter: 'brightness(1.02) contrast(1.05)',
                            transition: 'all 0.3s ease'
                          }}
                          onError={(e) => { 
                            e.target.src = '/default-profile.png'; 
                          }}
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#2d5a3d',
                      margin: '0 0 8px 0',
                      lineHeight: '1.3'
                    }}>
                      {member.name}
                    </h3>

                    {/* Position */}
                    <p style={{
                      fontSize: '1rem',
                      color: '#5a7a65',
                      margin: '0 0 12px 0',
                      fontWeight: 500,
                      lineHeight: '1.4'
                    }}>
                      {member.position}
                    </p>


                    {/* Country */}
                    {member.country && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'rgba(45,90,61,0.05)',
                        color: '#5a7a65',
                        padding: '6px 12px',
                        borderRadius: '8px',
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
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(member);
                        }}
                        style={{
                          background: '#2d5a3d',
                          color: 'white',
                          border: 'none',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontFamily: '"Nunito Sans", sans-serif'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1e3d29';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#2d5a3d';
                        }}
                      >
                        Read Bio
                      </button>

                      {(member.linkedin_url || member.website_url) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSocialClick(member.linkedin_url || member.website_url);
                          }}
                          style={{
                            background: 'transparent',
                            color: '#2d5a3d',
                            border: '1px solid rgba(45,90,61,0.3)',
                            padding: '10px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '38px',
                            height: '38px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#2d5a3d';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#2d5a3d';
                          }}
                          title={member.linkedin_url ? "LinkedIn Profile" : "Website"}
                        >
                          <ExternalLink size={16} />
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
                onClick={() => setVisibleCount(prev => prev + 6)}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  color: '#2d5a3d',
                  border: '1px solid rgba(45,90,61,0.2)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Nunito Sans", sans-serif',
                  boxShadow: '0 4px 16px rgba(45,90,61,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2d5a3d';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                  e.target.style.color = '#2d5a3d';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Show More Team Members ({filteredMembers.length - visibleCount} remaining)
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal */}
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
              background: 'rgba(45,90,61,0.4)',
              backdropFilter: 'blur(8px)',
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
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 20px 60px rgba(45,90,61,0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(45,90,61,0.1)',
                  border: 'none',
                  color: '#2d5a3d',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2d5a3d';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(45,90,61,0.1)';
                  e.target.style.color = '#2d5a3d';
                }}
              >
                <X size={18} />
              </button>

              {/* Modal content */}
              <div style={{
                padding: '30px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px',
                  marginBottom: '28px'
                }}>
                  <div style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, rgba(45,90,61,0.05), transparent)',
                    padding: '3px',
                    flexShrink: 0
                  }}>
                    <img
                      src={selectedMember.image_url ? `${STATIC_URL}${selectedMember.image_url}` : '/default-profile.png'}
                      alt={selectedMember.name}
                      style={{
                        width: '130px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '13px'
                      }}
                      onError={(e) => { 
                        e.target.src = '/default-profile.png'; 
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: '#2d5a3d',
                      margin: '0 0 8px 0',
                      lineHeight: '1.2'
                    }}>
                      {selectedMember.name}
                    </h2>
                    
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#5a7a65',
                      margin: '0 0 12px 0',
                      fontWeight: 500
                    }}>
                      {selectedMember.position}
                    </p>
                    
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(45,90,61,0.08)',
                      color: '#2d5a3d',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      marginBottom: '12px'
                    }}>
                      {selectedMember.department}
                    </div>
                    
                    {selectedMember.country && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(45,90,61,0.05)',
                        color: '#5a7a65',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        marginBottom: '12px',
                        width: 'fit-content'
                      }}>
                        <MapPin size={14} />
                        {selectedMember.country}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bio */}
                {selectedMember.bio && (
                  <div style={{
                    fontSize: '1.1rem',
                    color: '#2d5a3d',
                    lineHeight: '1.6',
                    marginBottom: '28px',
                    opacity: 0.9,
                    padding: '20px',
                    background: 'rgba(45,90,61,0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(45,90,61,0.08)'
                  }}>
                    {selectedMember.bio}
                  </div>
                )}
                
                {/* Social links */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  {selectedMember.linkedin_url && (
                    <button
                      onClick={() => handleSocialClick(selectedMember.linkedin_url)}
                      style={{
                        background: '#2d5a3d',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        fontFamily: '"Nunito Sans", sans-serif'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1e3d29';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#2d5a3d';
                      }}
                    >
                      <Linkedin size={18} />
                      Portfolio
                    </button>
                  )}
                  
                  {selectedMember.website_url && (
                    <button
                      onClick={() => handleSocialClick(selectedMember.website_url)}
                      style={{
                        background: 'transparent',
                        color: '#2d5a3d',
                        border: '1px solid rgba(45,90,61,0.3)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        fontFamily: '"Nunito Sans", sans-serif'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2d5a3d';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#2d5a3d';
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
        
        @media (max-width: 1024px) {
          .team-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            gap: 20px !important;
          }
        }
        
        @media (max-width: 768px) {
          .filter-buttons {
            justify-content: flex-start !important;
            overflow-x: auto !important;
            padding-bottom: 8px !important;
          }
          
          .filter-buttons::-webkit-scrollbar {
            height: 4px;
          }
          
          .filter-buttons::-webkit-scrollbar-track {
            background: rgba(45,90,61,0.1);
            border-radius: 2px;
          }
          
          .filter-buttons::-webkit-scrollbar-thumb {
            background: rgba(45,90,61,0.3);
            border-radius: 2px;
          }
          
          .modal-content {
            margin: 10px !important;
            max-height: 85vh !important;
          }
          



          
          .modal-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 16px !important;
          }
          
          .modal-header img {
            width: 80px !important;
            height: 100px !important;
          }
          
          .modal-body {
            padding: 20px !important;
          }
        }
        
        @media (max-width: 480px) {
          .team-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .card {
            padding: 16px !important;
          }
          
          .card img {
            width: 100px !important;
            height: 120px !important;
          }
        }
        
        /* Smooth scrolling for filter buttons on mobile */
        .filter-buttons {
          scrollbar-width: thin;
          scrollbar-color: rgba(45,90,61,0.3) rgba(45,90,61,0.1);
        }
        
        /* Enhanced focus states for accessibility */
        button:focus-visible {
          outline: 2px solid #2d5a3d;
          outline-offset: 2px;
        }
        
        /* Smooth scrolling for modal */
        .modal-content {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar for modal */
        .modal-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-content::-webkit-scrollbar-track {
          background: rgba(45,90,61,0.05);
          border-radius: 3px;
        }
        
        .modal-content::-webkit-scrollbar-thumb {
          background: rgba(45,90,61,0.2);
          border-radius: 3px;
        }
        
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(45,90,61,0.3);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default TeamSection;