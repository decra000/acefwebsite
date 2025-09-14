import React, { useState, useEffect, useRef  } from "react";
import axios from "axios";
import { API_URL, STATIC_URL } from "../config";
import { useTheme } from "../theme";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation } from "react-router-dom";

const EventsPublicDisplay = () => {
  const { colors, isDarkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
    const location = useLocation();

  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestForm, setInterestForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    event_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });
  const [visibleEvents, setVisibleEvents] = useState([]);
  
  const observerRef = useRef();
  const heroRef = useRef();
  const filterRef = useRef();

  // Scroll animation setup
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Animate elements as they come into view
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });
  }, [events]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get("eventId");

    if (eventId && events.length > 0) {
      const foundEvent = events.find(e => e.id.toString() === eventId);
      if (foundEvent) {
        handleExpressInterest(foundEvent); // auto open modal
      }
    }
  }, [location.search, events]);

  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroRef.current.style.transform = `translateY(${parallax}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/events`);
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/countries`);
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCountries();
  }, []);

  const filteredEvents = selectedCountry 
    ? events.filter(event => event.country === selectedCountry)
    : events;

  const handleInterestChange = (e) => {
    const { name, value } = e.target;
    setInterestForm({ ...interestForm, [name]: value });
    
    if (submitStatus.message) {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  const handleExpressInterest = (event) => {
    setSelectedEvent(event);
    setInterestForm({ 
      name: "",
      email: "",
      phone: "",
      message: "",
      event_id: event.id 
    });
    setShowInterestForm(true);
    setSubmitStatus({ message: "", type: "" });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!interestForm.name.trim()) errors.push("Name is required");
    if (!interestForm.email.trim()) errors.push("Email is required");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (interestForm.email && !emailRegex.test(interestForm.email)) {
      errors.push("Please enter a valid email address");
    }
    
    return errors;
  };

  const checkExistingInterest = async (eventId, email) => {
    try {
      const response = await axios.get(`${API_URL}/event-interests/check`, {
        params: { event_id: eventId, email: email.toLowerCase().trim() }
      });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking existing interest:", error);
      return false;
    }
  };

  const submitInterest = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitStatus({ 
        message: validationErrors.join(", "), 
        type: "error" 
      });
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ message: "Submitting your interest...", type: "info" });
    
    try {
      // Check for existing interest
      const existingInterest = await checkExistingInterest(
        interestForm.event_id, 
        interestForm.email
      );
      
      if (existingInterest) {
        setSubmitStatus({ 
          message: "You have already expressed interest in this event", 
          type: "warning" 
        });
        return;
      }

      const response = await axios.post(`${API_URL}/event-interests`, {
        ...interestForm,
        email: interestForm.email.toLowerCase().trim(),
        name: interestForm.name.trim(),
        phone: interestForm.phone.trim(),
        message: interestForm.message.trim()
      });

      if (response.data.success !== false) {
        setSubmitStatus({ 
          message: "Thank you for your interest! We'll be in touch soon.", 
          type: "success" 
        });
        
        setTimeout(() => {
          closeInterestForm();
        }, 2000);
      } else {
        setSubmitStatus({ 
          message: response.data.error || "Failed to submit interest", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error submitting interest:", error);
      
      let errorMessage = "Sorry, there was an error submitting your interest. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSubmitStatus({ message: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeInterestForm = () => {
    setShowInterestForm(false);
    setSelectedEvent(null);
    setInterestForm({
      name: "",
      email: "",
      phone: "",
      message: "",
      event_id: null,
    });
    setSubmitStatus({ message: "", type: "" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: colors.white
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${colors.white}`,
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }} />
          <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.accent} 100%);
          z-index: -2;
        }
        
        .hero-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%);
          z-index: -1;
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .event-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
<Header/>
      {/* Animated Background */}
      <div className="hero-bg" ref={heroRef} />
      <div className="hero-pattern" />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Hero Section */}
        <header style={{
          textAlign: 'center',
          padding: '4rem 0 6rem 0',
          color: colors.white
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            margin: '0 0 1rem 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1s ease-out'
          }}>
            Discover Amazing Events
          </h1>
          <p style={{
            fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
            opacity: '0.95',
            margin: '0',
            fontWeight: '300',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            animation: 'fadeInUp 1s ease-out 0.2s both'
          }}>
            Connect, learn, and grow with events happening around the world
          </p>
        </header>

        {/* Filter Section */}
        <div 
          ref={filterRef}
          className="animate-on-scroll glass-morphism"
          style={{
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '3rem',
            animationDelay: '0.4s'
          }}
        >
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: colors.white,
            margin: '0 0 1.5rem 0',
            textAlign: 'center'
          }}>
            Filter by Location
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                padding: '1rem 1.5rem',
                border: `2px solid rgba(255,255,255,0.2)`,
                borderRadius: '50px',
                fontSize: '1rem',
                minWidth: '250px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: colors.white,
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.secondary;
                e.target.style.boxShadow = `0 0 0 3px rgba(250,207,60,0.2)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="" style={{ color: colors.black }}>All Countries</option>
              {countries.map((country) => (
                <option key={country.id} value={country.name} style={{ color: colors.black }}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Count */}
        {filteredEvents.length > 0 && (
          <div className="animate-on-scroll" style={{
            textAlign: 'center',
            color: colors.white,
            marginBottom: '3rem',
            fontSize: '1.125rem',
            opacity: '0.9',
            animationDelay: '0.6s'
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1.5rem',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)'
            }}>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} available
              {selectedCountry && ` in ${selectedCountry}`}
            </span>
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="animate-on-scroll" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: colors.white
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              opacity: '0.9'
            }}>
              No events found
            </h3>
            <p style={{ opacity: '0.7' }}>
              Check back later for upcoming events{selectedCountry && ` in ${selectedCountry}`}.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {filteredEvents.map((event, index) => {
              const now = new Date();
              const startDate = new Date(event.start_date);
              const endDate = event.end_date ? new Date(event.end_date) : null;
              
              let status = 'upcoming';
              if (endDate && now > endDate) {
                status = 'past';
              } else if (now >= startDate && (!endDate || now <= endDate)) {
                status = 'ongoing';
              }

              return (
                <div 
                  key={event.id}
                  className="animate-on-scroll event-card"
                  style={{
                    background: isDarkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.95)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    animationDelay: `${0.8 + index * 0.1}s`
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    zIndex: 10,
                    backgroundColor: status === 'upcoming' 
                      ? colors.success 
                      : status === 'ongoing' 
                      ? colors.warning 
                      : colors.gray500,
                    color: colors.white
                  }}>
                    {status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Live Now' : 'Past Event'}
                  </div>

                  {/* Event Image */}
                  {event.image_url ? (
                    <img
                      src={`${STATIC_URL}${event.image_url}`}
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: `linear-gradient(45deg, ${colors.primary}, ${colors.accent})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.white,
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}>
                      {event.title}
                    </div>
                  )}

                  {/* Event Content */}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: isDarkMode ? colors.white : colors.gray900,
                      margin: '0 0 1rem 0',
                      lineHeight: '1.3'
                    }}>
                      {event.title}
                    </h3>
                    
                    {/* Event Meta */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      {event.country && (
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: colors.info,
                          color: colors.white
                        }}>
                          {event.country}
                        </span>
                      )}
                      {event.is_paid ? (
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: colors.success,
                          color: colors.white
                        }}>
                          {event.currency} {parseFloat(event.price).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: colors.secondary,
                          color: colors.black
                        }}>
                          Free
                        </span>
                      )}
                    </div>




                    {/* Description */}
                    {event.description && (
                      <p style={{
                        color: isDarkMode ? colors.gray300 : colors.gray600,
                        lineHeight: '1.6',
                        marginBottom: '1.5rem'
                      }}>
                        {event.description.length > 120 
                          ? `${event.description.substring(0, 120)}...`
                          : event.description
                        }
                      </p>
                    )}

                    {/* Event Details */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem',
                        color: isDarkMode ? colors.gray300 : colors.gray700,
                        fontSize: '0.875rem'
                      }}>
                        <span>📅</span>
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      
                      {event.end_date && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.5rem',
                          color: isDarkMode ? colors.gray300 : colors.gray700,
                          fontSize: '0.875rem'
                        }}>
                          <span>⏰</span>
                          <span>Ends: {formatDate(event.end_date)}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          color: isDarkMode ? colors.gray300 : colors.gray700,
                          fontSize: '0.875rem'
                        }}>
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleExpressInterest(event)}
                      disabled={status === 'past'}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: 'none',
                        borderRadius: '50px',
                        background: status === 'past' 
                          ? colors.gray400 
                          : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                        color: colors.white,
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: status === 'past' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: status === 'past' ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (status !== 'past') {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = `0 8px 20px rgba(${colors.primary.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (status !== 'past') {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {status === 'past' ? 'Event Ended' : 'Express Interest'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Interest Form Modal */}
        {showInterestForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(5px)'
          }} onClick={closeInterestForm}>
            <div 
              style={{
                background: isDarkMode ? colors.gray800 : colors.white,
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                animation: 'scaleIn 0.3s ease-out',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }} 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeInterestForm}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? colors.gray300 : colors.gray600,
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? colors.gray700 : colors.gray100;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
              
              {/* Modal Header */}
              <div style={{
                padding: '2rem 2rem 1rem 2rem',
                borderBottom: `1px solid ${isDarkMode ? colors.gray700 : colors.gray200}`
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: isDarkMode ? colors.white : colors.gray900,
                  margin: '0 0 0.5rem 0'
                }}>
                  Express Interest
                </h2>
                <p style={{
                  color: isDarkMode ? colors.gray300 : colors.gray600,
                  margin: '0'
                }}>
                  {selectedEvent?.title}
                </p>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '2rem' }}>
                {/* Status Message */}
                {submitStatus.message && (
                  <div style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    backgroundColor: submitStatus.type === 'error' 
                      ? 'rgba(239, 68, 68, 0.1)'
                      : submitStatus.type === 'success'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : submitStatus.type === 'warning'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(59, 130, 246, 0.1)',
                    color: submitStatus.type === 'error' 
                      ? colors.error
                      : submitStatus.type === 'success'
                      ? colors.success
                      : submitStatus.type === 'warning'
                      ? colors.warning
                      : colors.info,
                    border: `1px solid ${submitStatus.type === 'error' 
                      ? colors.error
                      : submitStatus.type === 'success'
                      ? colors.success
                      : submitStatus.type === 'warning'
                      ? colors.warning
                      : colors.info}`
                  }}>
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={submitInterest}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: isDarkMode ? colors.white : colors.gray700,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={interestForm.name}
                      onChange={handleInterestChange}
                      required
                      disabled={submitting}
                      placeholder="Enter your full name"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${isDarkMode ? colors.gray600 : colors.gray300}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                        color: isDarkMode ? colors.white : colors.gray900,
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px rgba(10, 69, 28, 0.1)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = isDarkMode ? colors.gray600 : colors.gray300;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: isDarkMode ? colors.white : colors.gray700,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={interestForm.email}
                      onChange={handleInterestChange}
                      required
                      disabled={submitting}
                      placeholder="Enter your email address"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${isDarkMode ? colors.gray600 : colors.gray300}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                        color: isDarkMode ? colors.white : colors.gray900,
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px rgba(10, 69, 28, 0.1)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = isDarkMode ? colors.gray600 : colors.gray300;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: isDarkMode ? colors.white : colors.gray700,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={interestForm.phone}
                      onChange={handleInterestChange}
                      disabled={submitting}
                      placeholder="Enter your phone number"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${isDarkMode ? colors.gray600 : colors.gray300}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                        color: isDarkMode ? colors.white : colors.gray900,
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px rgba(10, 69, 28, 0.1)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = isDarkMode ? colors.gray600 : colors.gray300;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      color: isDarkMode ? colors.white : colors.gray700,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={interestForm.message}
                      onChange={handleInterestChange}
                      disabled={submitting}
                      placeholder="Any questions or additional information..."
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${isDarkMode ? colors.gray600 : colors.gray300}`,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        backgroundColor: isDarkMode ? colors.gray700 : colors.white,
                        color: isDarkMode ? colors.white : colors.gray900,
                        minHeight: '100px',
                        resize: 'vertical',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px rgba(10, 69, 28, 0.1)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = isDarkMode ? colors.gray600 : colors.gray300;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Form Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem'
                  }}>
                    <button
                      type="button"
                      onClick={closeInterestForm}
                      disabled={submitting}
                      style={{
                        flex: '1',
                        padding: '1rem',
                        border: `2px solid ${isDarkMode ? colors.gray600 : colors.gray300}`,
                        borderRadius: '50px',
                        backgroundColor: isDarkMode ? colors.gray700 : colors.gray100,
                        color: isDarkMode ? colors.white : colors.gray700,
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: submitting ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) {
                          e.target.style.backgroundColor = isDarkMode ? colors.gray600 : colors.gray200;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) {
                          e.target.style.backgroundColor = isDarkMode ? colors.gray700 : colors.gray100;
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flex: '1',
                        padding: '1rem',
                        border: 'none',
                        borderRadius: '50px',
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                        color: colors.white,
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: submitting ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 20px rgba(10, 69, 28, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Interest'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
                  <Footer/>

    </div>
  );
};

export default EventsPublicDisplay;