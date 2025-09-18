




import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL, STATIC_URL } from "../../config";
import { useTheme, withOpacity } from "../../theme";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLocation } from "react-router-dom";

const EventsPublicDisplay = () => {
  const { theme, colors, isDarkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'calendar', 'detail'
  const [detailEvent, setDetailEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const location = useLocation();

  // Animation states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [visibleElements, setVisibleElements] = useState(new Set());

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
  
  const observerRef = useRef();

  // Mouse tracking for premium effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Intersection Observer for scroll animations
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleElements(prev => new Set([...prev, entry.target.dataset.animateId]));
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Animate elements as they come into view
  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate-id]');
    elements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });
  }, [events, viewMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get("eventId");

    if (eventId && events.length > 0) {
      const foundEvent = events.find(e => e.id.toString() === eventId);
      if (foundEvent) {
        handleExpressInterest(foundEvent);
      }
    }
  }, [location.search, events]);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/events`);
      setEvents(data);
      setCalendarEvents(data);
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

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

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

  const handleViewDetails = (event) => {
    setDetailEvent(event);
    setViewMode('detail');
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

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: isDarkMode 
        ? `radial-gradient(ellipse at top, ${withOpacity(colors.primaryDark, 0.3)}, ${colors.black})`
        : `radial-gradient(ellipse at top, ${withOpacity(colors.primary, 0.1)}, ${colors.white})`,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      color: theme.colors.text,
      position: 'relative',
      fontSize: '14px',
      lineHeight: 1.5
    },

    backgroundEffect: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDarkMode
        ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${withOpacity(colors.primary, 0.1)}, transparent 40%)`
        : `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, ${withOpacity(colors.secondary, 0.08)}, transparent 40%)`,
      pointerEvents: 'none',
      zIndex: 0,
      transition: 'all 0.3s ease'
    },

    heroSection: {
      position: 'relative',
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDarkMode 
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 50%, ${colors.secondary} 100%)`
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%)`,
      color: colors.white,
      zIndex: 1
    },

    heroContent: {
      maxWidth: '800px',
      textAlign: 'center',
      padding: '0 2rem'
    },

    heroTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 800,
      marginBottom: '1.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      textShadow: '0 4px 8px rgba(0,0,0,0.3)'
    },

    heroSubtitle: {
      fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
      opacity: 0.95,
      lineHeight: 1.6,
      fontWeight: 300,
      marginBottom: '3rem'
    },

    mainContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '4rem 2rem',
      position: 'relative',
      zIndex: 1
    },

    viewToggle: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '2rem',
      padding: '0.5rem',
      background: isDarkMode 
        ? withOpacity(colors.black, 0.3)
        : withOpacity(colors.white, 0.7),
      borderRadius: '50px',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      maxWidth: '400px',
      margin: '0 auto 2rem auto'
    },

    viewButton: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },

    filterSection: {
      background: isDarkMode 
        ? `linear-gradient(145deg, ${withOpacity(colors.black, 0.4)}, ${withOpacity(colors.primaryDark, 0.1)})`
        : `linear-gradient(145deg, ${withOpacity(colors.white, 0.9)}, ${withOpacity(colors.primary, 0.05)})`,
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '2rem',
      marginBottom: '3rem',
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      boxShadow: `0 8px 32px ${withOpacity(colors.black, 0.1)}`,
    },

    select: {
      width: '100%',
      maxWidth: '300px',
      padding: '1rem 1.5rem',
      background: isDarkMode 
        ? withOpacity(colors.black, 0.3)
        : withOpacity(colors.white, 0.8),
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      borderRadius: '50px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      color: theme.colors.text,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='${colors.primary.replace('#', '%23')}' viewBox='0 0 16 16'%3e%3cpath d='m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '12px'
    },

    eventsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
      marginBottom: '4rem'
    },

    eventCard: {
      background: isDarkMode 
        ? `linear-gradient(145deg, ${withOpacity(colors.black, 0.4)}, ${withOpacity(colors.primaryDark, 0.1)})`
        : `linear-gradient(145deg, ${withOpacity(colors.white, 0.95)}, ${withOpacity(colors.primary, 0.05)})`,
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: `0 8px 32px ${withOpacity(colors.black, 0.1)}`,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    },

    calendar: {
      background: isDarkMode 
        ? `linear-gradient(145deg, ${withOpacity(colors.black, 0.4)}, ${withOpacity(colors.primaryDark, 0.1)})`
        : `linear-gradient(145deg, ${withOpacity(colors.white, 0.95)}, ${withOpacity(colors.primary, 0.05)})`,
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: `0 8px 32px ${withOpacity(colors.black, 0.1)}`,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${withOpacity(colors.primary, 0.2)}`
    },

    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      background: withOpacity(colors.primary, 0.1),
      borderRadius: '12px',
      overflow: 'hidden'
    },

    calendarDay: {
      minHeight: '60px',
      background: isDarkMode ? colors.black : colors.white,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0.5rem',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },

    animateSlideUp: {
      transform: 'translateY(50px)',
      opacity: 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    animateSlideUpVisible: {
      transform: 'translateY(0)',
      opacity: 1,
    },

    animateFadeIn: {
      opacity: 0,
      transition: 'all 0.8s ease-in-out',
    },

    animateFadeInVisible: {
      opacity: 1,
    },

    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: `3px solid ${withOpacity(colors.primary, 0.2)}`,
      borderTopColor: colors.primary,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.backgroundEffect}></div>
        <Header />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={styles.loadingSpinner}></div>
          <p style={{ 
            fontSize: '1.125rem', 
            fontWeight: '500',
            color: theme.colors.text 
          }}>
            Loading events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.backgroundEffect}></div>
      <Header />

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Discover Amazing Events</h1>
          <p style={styles.heroSubtitle}>
            Connect, learn, and grow with events happening around the world
          </p>
        </div>
      </div>

      <div style={styles.mainContainer}>
        {viewMode !== 'detail' && (
          <>
            {/* View Toggle */}
            <div 
              style={styles.viewToggle}
              data-animate-id="view-toggle"
            >
              <button
                style={{
                  ...styles.viewButton,
                  background: viewMode === 'grid' 
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                    : 'transparent',
                  color: viewMode === 'grid' ? colors.white : theme.colors.text
                }}
                onClick={() => setViewMode('grid')}
              >
                📱 Grid View
              </button>
              <button
                style={{
                  ...styles.viewButton,
                  background: viewMode === 'calendar' 
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                    : 'transparent',
                  color: viewMode === 'calendar' ? colors.white : theme.colors.text
                }}
                onClick={() => setViewMode('calendar')}
              >
                📅 Calendar View
              </button>
            </div>

            {/* Filter Section */}
            <div 
              style={{
                ...styles.filterSection,
                ...styles.animateSlideUp,
                ...(visibleElements.has('filter') ? styles.animateSlideUpVisible : {})
              }}
              data-animate-id="filter"
            >
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.primary,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Filter by Location
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={styles.select}
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Events Count */}
            {filteredEvents.length > 0 && (
              <div 
                style={{
                  textAlign: 'center',
                  marginBottom: '3rem',
                  fontSize: '1.125rem',
                  opacity: 0.9
                }}
                data-animate-id="count"
              >
                <span style={{
                  background: isDarkMode 
                    ? withOpacity(colors.black, 0.3)
                    : withOpacity(colors.white, 0.7),
                  padding: '0.75rem 2rem',
                  borderRadius: '25px',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
                  color: theme.colors.text
                }}>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} available
                  {selectedCountry && ` in ${selectedCountry}`}
                </span>
              </div>
            )}
          </>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <>
            {filteredEvents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: isDarkMode 
                  ? withOpacity(colors.black, 0.3)
                  : withOpacity(colors.white, 0.7),
                borderRadius: '24px',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${withOpacity(colors.primary, 0.2)}`
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  margin: '0 0 1rem 0',
                  color: theme.colors.text
                }}>
                  No events found
                </h3>
                <p style={{ color: theme.colors.textSecondary }}>
                  Check back later for upcoming events{selectedCountry && ` in ${selectedCountry}`}.
                </p>
              </div>
            ) : (
              <div style={styles.eventsGrid}>
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
                      style={{
                        ...styles.eventCard,
                        ...styles.animateSlideUp,
                        transitionDelay: `${index * 0.1}s`,
                        ...(visibleElements.has('events-grid') ? styles.animateSlideUpVisible : {})
                      }}
                      data-animate-id="events-grid"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.boxShadow = `0 20px 40px ${withOpacity(colors.primary, 0.2)}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = `0 8px 32px ${withOpacity(colors.black, 0.1)}`;
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
                        fontWeight: 600,
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
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '200px',
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.white,
                          fontSize: '1.125rem',
                          fontWeight: 500
                        }}>
                          {event.title}
                        </div>
                      )}

                      {/* Event Content */}
                      <div style={{ padding: '1.5rem' }}>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: theme.colors.text,
                          margin: '0 0 1rem 0',
                          lineHeight: 1.3
                        }}>
                          {event.title}
                        </h3>
                        
                        {/* Event Meta */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          {event.country && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: colors.info,
                              color: colors.white
                            }}>
                              {event.country}
                            </span>
                          )}
                          {event.is_paid ? (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: colors.success,
                              color: colors.white
                            }}>
                              {event.currency} {parseFloat(event.price).toFixed(2)}
                            </span>
                          ) : (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
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
                            color: theme.colors.textSecondary,
                            lineHeight: 1.6,
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem'
                          }}>
                            {event.description.length > 100 
                              ? `${event.description.substring(0, 100)}...`
                              : event.description
                            }
                          </p>
                        )}

                        {/* Event Details */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.25rem',
                            color: theme.colors.textSecondary,
                            fontSize: '0.8125rem'
                          }}>
                            <span>📅</span>
                            <span>{formatDateShort(event.start_date)}</span>
                          </div>
                          
                          {event.location && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              color: theme.colors.textSecondary,
                              fontSize: '0.8125rem'
                            }}>
                              <span>📍</span>
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '0.75rem'
                        }}>
                          <button
                            onClick={() => handleViewDetails(event)}
                            style={{
                              flex: 1,
                              padding: '0.75rem 1rem',
                              border: `2px solid ${colors.primary}`,
                              borderRadius: '25px',
                              background: 'transparent',
                              color: colors.primary,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = colors.primary;
                              e.target.style.color = colors.white;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = colors.primary;
                            }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleExpressInterest(event)}
                            disabled={status === 'past'}
                            style={{
                              flex: 1,
                              padding: '0.75rem 1rem',
                              border: 'none',
                              borderRadius: '25px',
                              background: status === 'past' 
                                ? colors.gray400 
                                : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                              color: colors.white,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              cursor: status === 'past' ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease',
                              opacity: status === 'past' ? 0.6 : 1,
                              fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                              if (status !== 'past') {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 4px 12px ${withOpacity(colors.primary, 0.3)}`;
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
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div 
            style={{
              ...styles.calendar,
              ...styles.animateSlideUp,
              ...(visibleElements.has('calendar') ? styles.animateSlideUpVisible : {})
            }}
            data-animate-id="calendar"
          >
            {/* Calendar Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: `1px solid ${withOpacity(colors.primary, 0.3)}`,
                  borderRadius: '25px',
                  background: 'transparent',
                  color: colors.primary,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = withOpacity(colors.primary, 0.1);
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                ← Previous
              </button>
              
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: theme.colors.text,
                margin: 0
              }}>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: `1px solid ${withOpacity(colors.primary, 0.3)}`,
                  borderRadius: '25px',
                  background: 'transparent',
                  color: colors.primary,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = withOpacity(colors.primary, 0.1);
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                Next →
              </button>
            </div>

            {/* Calendar Days Header */}
            <div style={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{
                  padding: '1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  background: withOpacity(colors.primary, 0.1),
                  color: theme.colors.text
                }}>
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                <div key={`empty-${i}`} style={styles.calendarDay}></div>
              ))}

              {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={i + 1}
                    style={{
                      ...styles.calendarDay,
                      background: isToday 
                        ? withOpacity(colors.primary, 0.2)
                        : (isDarkMode ? colors.black : colors.white)
                    }}
                    onMouseEnter={(e) => {
                      if (dayEvents.length > 0) {
                        e.target.style.background = withOpacity(colors.secondary, 0.2);
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = isToday 
                        ? withOpacity(colors.primary, 0.2)
                        : (isDarkMode ? colors.black : colors.white);
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? colors.primary : theme.colors.text,
                      marginBottom: '0.25rem'
                    }}>
                      {i + 1}
                    </div>
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div
                        key={event.id}
                        onClick={() => handleViewDetails(event)}
                        style={{
                          width: '100%',
                          padding: '0.125rem 0.25rem',
                          background: colors.primary,
                          color: colors.white,
                          fontSize: '0.625rem',
                          borderRadius: '3px',
                          marginBottom: '0.125rem',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div style={{
                        fontSize: '0.625rem',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer'
                      }}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detail View */}
        {viewMode === 'detail' && detailEvent && (
          <div 
            style={{
              ...styles.calendar,
              ...styles.animateSlideUp,
              ...(visibleElements.has('detail') ? styles.animateSlideUpVisible : {})
            }}
            data-animate-id="detail"
          >
            {/* Back Button */}
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: `1px solid ${withOpacity(colors.primary, 0.3)}`,
                borderRadius: '25px',
                color: colors.primary,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '2rem',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = withOpacity(colors.primary, 0.1);
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              ← Back to Events
            </button>

            {/* Event Image */}
            {detailEvent.image_url && (
              <div style={{
                width: '100%',
                height: '300px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '2rem',
                boxShadow: `0 8px 24px ${withOpacity(colors.black, 0.1)}`
              }}>
                <img
                  src={`${STATIC_URL}${detailEvent.image_url}`}
                  alt={detailEvent.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            {/* Event Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: theme.colors.text,
                margin: '0 0 1rem 0',
                lineHeight: 1.2
              }}>
                {detailEvent.title}
              </h1>

              {/* Event Meta */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {detailEvent.country && (
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: colors.info,
                    color: colors.white
                  }}>
                    📍 {detailEvent.country}
                  </span>
                )}
                {detailEvent.is_paid ? (
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: colors.success,
                    color: colors.white
                  }}>
                    💰 {detailEvent.currency} {parseFloat(detailEvent.price).toFixed(2)}
                  </span>
                ) : (
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: colors.secondary,
                    color: colors.black
                  }}>
                    🎉 Free Event
                  </span>
                )}
              </div>

              {/* Event Times */}
              <div style={{
                background: isDarkMode 
                  ? withOpacity(colors.black, 0.3)
                  : withOpacity(colors.white, 0.5),
                padding: '1.5rem',
                borderRadius: '16px',
                border: `1px solid ${withOpacity(colors.primary, 0.2)}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: detailEvent.end_date ? '0.75rem' : 0,
                  color: theme.colors.text,
                  fontSize: '1rem',
                  fontWeight: 500
                }}>
                  <span>📅</span>
                  <span>Starts: {formatDate(detailEvent.start_date)}</span>
                </div>
                
                {detailEvent.end_date && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: theme.colors.text,
                    fontSize: '1rem',
                    fontWeight: 500
                  }}>
                    <span>⏰</span>
                    <span>Ends: {formatDate(detailEvent.end_date)}</span>
                  </div>
                )}
                
                {detailEvent.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.75rem',
                    color: theme.colors.text,
                    fontSize: '1rem',
                    fontWeight: 500
                  }}>
                    <span>📍</span>
                    <span>{detailEvent.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Full Description */}
            {detailEvent.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: theme.colors.text,
                  marginBottom: '1rem'
                }}>
                  About This Event
                </h2>
                <div style={{
                  color: theme.colors.textSecondary,
                  lineHeight: 1.8,
                  fontSize: '1rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {detailEvent.description}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => handleExpressInterest(detailEvent)}
                style={{
                  padding: '1rem 3rem',
                  border: 'none',
                  borderRadius: '50px',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: colors.white,
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                  boxShadow: `0 4px 20px ${withOpacity(colors.primary, 0.3)}`
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = `0 8px 30px ${withOpacity(colors.primary, 0.4)}`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 20px ${withOpacity(colors.primary, 0.3)}`;
                }}
              >
                Express Interest
              </button>
            </div>
          </div>
        )}

        {/* Interest Form Modal - keeping original styling but improved */}
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
            backdropFilter: 'blur(10px)'
          }} onClick={closeInterestForm}>
            <div 
              style={{
                background: isDarkMode 
                  ? `linear-gradient(145deg, ${colors.black}, ${withOpacity(colors.primaryDark, 0.2)})`
                  : `linear-gradient(145deg, ${colors.white}, ${withOpacity(colors.primary, 0.05)})`,
                borderRadius: '24px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: `0 20px 60px ${withOpacity(colors.black, 0.3)}`,
                border: `1px solid ${withOpacity(colors.primary, 0.2)}`,
                backdropFilter: 'blur(20px)'
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
                  color: theme.colors.textSecondary,
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = withOpacity(colors.primary, 0.1);
                  e.target.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.colors.textSecondary;
                }}
              >
                ×
              </button>
              
              {/* Modal Header */}
              <div style={{
                padding: '2rem 2rem 1rem 2rem',
                borderBottom: `1px solid ${withOpacity(colors.primary, 0.1)}`
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: theme.colors.text,
                  margin: '0 0 0.5rem 0'
                }}>
                  Express Interest
                </h2>
                <p style={{
                  color: theme.colors.textSecondary,
                  margin: '0',
                  fontSize: '0.875rem'
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
                      ? withOpacity(colors.error, 0.1)
                      : submitStatus.type === 'success'
                      ? withOpacity(colors.success, 0.1)
                      : submitStatus.type === 'warning'
                      ? withOpacity(colors.warning, 0.1)
                      : withOpacity(colors.info, 0.1),
                    color: submitStatus.type === 'error' 
                      ? colors.error
                      : submitStatus.type === 'success'
                      ? colors.success
                      : submitStatus.type === 'warning'
                      ? colors.warning
                      : colors.info,
                    border: `1px solid ${submitStatus.type === 'error' 
                      ? withOpacity(colors.error, 0.3)
                      : submitStatus.type === 'success'
                      ? withOpacity(colors.success, 0.3)
                      : submitStatus.type === 'warning'
                      ? withOpacity(colors.warning, 0.3)
                      : withOpacity(colors.info, 0.3)}`,
                    fontSize: '0.875rem'
                  }}>
                    {submitStatus.message}
                  </div>
                )}





                <form onSubmit={submitInterest}>
                 <div style={{ marginBottom: '1.5rem' }}>                    <label style={{



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

      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;500;600;700;800;900&display=swap');

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

        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem !important;
          }
          
          .hero-subtitle {
            font-size: 1.125rem !important;
          }
          
          .events-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .view-toggle {
            flex-direction: column !important;
            gap: 0.25rem !important;
          }
          
          .calendar-grid {
            font-size: 0.75rem !important;
          }
          
          .calendar-day {
            min-height: 50px !important;
            padding: 0.25rem !important;
          }
        }

        @media (max-width: 480px) {
          .main-container {
            padding: 2rem 1rem !important;
          }
          
          .hero-title {
            font-size: 2rem !important;
          }
          
          .hero-subtitle {
            font-size: 1rem !important;
          }
          
          .event-card {
            margin: 0 !important;
          }
          
          .filter-section {
            padding: 1.5rem !important;
            border-radius: 16px !important;
          }
          
          .calendar {
            padding: 1.5rem !important;
            border-radius: 16px !important;
          }
          
          .modal-content {
            margin: 0.5rem !important;
            border-radius: 16px !important;
          }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? colors.gray800 : colors.gray100};
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.primaryDark};
        }

        /* Selection styling */
        ::selection {
          background: ${withOpacity(colors.primary, 0.3)};
          color: ${theme.colors.text};
        }

        /* Focus outline styling */
        button:focus-visible,
        select:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid ${colors.primary} !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  );
};

export default EventsPublicDisplay;