import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL, STATIC_URL } from "../../config";
import { useTheme, withOpacity } from "../../theme";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLocation } from "react-router-dom";
import { ChevronDown, Calendar, Grid3X3, ArrowLeft, MapPin, Clock, DollarSign, Users } from "lucide-react";

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
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
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
      background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundSecondary} 100%)`,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      color: colors.text,
      position: 'relative',
    },

    backgroundEffect: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(252, 207, 60, 0.05), transparent 40%)`,
      pointerEvents: 'none',
      zIndex: 0,
      transition: 'all 0.3s ease'
    },

    // Hero Section with accent color background and proper theme integration
    heroSection: {
      position: 'relative',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, 
        ${isDarkMode ? colors.accentDark : colors.accentLight} 0%, 
        ${isDarkMode ? colors.accent : colors.accent} 50%, 
        ${isDarkMode ? colors.accentLight : colors.accentDark} 100%)`,
      color: colors.text,
      zIndex: 1,
      overflow: 'hidden'
    },

    // Updated typography following your style guidelines
    heroTitle: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: '300',
      marginBottom: '24px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      color: colors.text
    },

    // Title emphasis for "Environmental" word
    heroTitleEmphasis: {
      fontWeight: '700',
      color: colors.primary
    },

    // Hero subtitle using paragraph styles
    heroSubtitle: {
      color: colors.textSecondary,
      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
      lineHeight: '1.7',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '400',
      marginBottom: '2.5rem',
      maxWidth: '600px',
      margin: '0 auto'
    },

    mainContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '4rem 2rem',
      position: 'relative',
      zIndex: 1
    },

    // Section titles using your typography system
    sectionTitle: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: '300',
      color: colors.text,
      marginBottom: '24px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      textAlign: 'center'
    },

    // Emphasized part of section titles
    sectionTitleEmphasis: {
      fontWeight: '700',
      color: colors.primary
    },

    // Subtitle/description using paragraph styles
    sectionSubtitle: {
      color: colors.textSecondary,
      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
      lineHeight: '1.7',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '400',
      textAlign: 'center',
      marginBottom: '3rem',
      maxWidth: '600px',
      margin: '0 auto 3rem auto'
    },

    filterSection: {
      background: colors.surface,
      padding: '1.5rem',
      marginBottom: '2rem',
      border: `2px solid ${colors.border}`,
      boxShadow: `0 4px 20px ${withOpacity(colors.text, 0.05)}`,
      borderRadius: '12px'
    },

    twoColumnLayout: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
      alignItems: 'start'
    },

    eventsSection: {
      background: colors.surface,
      padding: '1.5rem',
      border: `2px solid ${colors.border}`,
      boxShadow: `0 4px 20px ${withOpacity(colors.text, 0.05)}`,
      borderRadius: '12px'
    },

    calendarSection: {
      background: colors.surface,
      padding: '1.5rem',
      border: `2px solid ${colors.border}`,
      boxShadow: `0 4px 20px ${withOpacity(colors.text, 0.05)}`,
      position: 'sticky',
      top: '2rem',
      borderRadius: '12px'
    },

    calendarIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      color: colors.primary,
      fontSize: '1.125rem',
      fontWeight: 600,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    viewToggle: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      padding: '0.5rem',
      background: colors.backgroundSecondary,
      border: `2px solid ${colors.border}`,
      maxWidth: 'fit-content'
    },

    viewButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    select: {
      width: '100%',
      maxWidth: '300px',
      padding: '1rem 1.5rem',
      background: colors.surface,
      border: `2px solid ${colors.border}`,
      fontSize: '1rem',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      color: colors.text,
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem'
    },

    eventCard: {
      background: colors.surface,
      overflow: 'hidden',
      boxShadow: `0 2px 10px ${withOpacity(colors.text, 0.05)}`,
      border: `2px solid ${colors.border}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      borderRadius: '12px'
    },

    calendar: {
      background: colors.surface
    },

    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },

    calendarNav: {
      padding: '0.5rem 1rem',
      border: `2px solid ${colors.border}`,
      background: colors.surface,
      color: colors.primary,
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    calendarTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: colors.text,
      margin: 0,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      background: colors.border,
      border: `2px solid ${colors.border}`
    },

    calendarDay: {
      minHeight: '70px',
      background: colors.surface,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      padding: '0.4rem',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },

    calendarDayHeader: {
      padding: '0.75rem',
      fontWeight: 700,
      textAlign: 'center',
      background: colors.backgroundSecondary,
      color: colors.textSecondary,
      border: 'none',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    statusBadge: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      zIndex: 10,
      color: colors.white,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    eventMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '1rem'
    },

    metaBadge: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: colors.white,
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    actionButtons: {
      display: 'flex',
      gap: '0.75rem'
    },

    primaryButton: {
      flex: 1,
      padding: '0.75rem 1rem',
      border: 'none',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
      color: colors.white,
      fontWeight: 600,
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    secondaryButton: {
      flex: 1,
      padding: '0.75rem 1rem',
      border: `2px solid ${colors.primary}`,
      background: 'transparent',
      color: colors.primary,
      fontWeight: 600,
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlayBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },

    modalContent: {
      background: colors.surface,
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      position: 'relative',
      boxShadow: `0 20px 60px ${withOpacity(colors.text, 0.3)}`,
      border: `2px solid ${colors.border}`
    },

    modalHeader: {
      padding: '2rem 2rem 1rem 2rem',
      borderBottom: `2px solid ${colors.border}`
    },

    modalBody: {
      padding: '2rem'
    },

    formGroup: {
      marginBottom: '1.5rem'
    },

    label: {
      display: 'block',
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    input: {
      width: '100%',
      padding: '1rem',
      border: `2px solid ${colors.border}`,
      fontSize: '1rem',
      backgroundColor: colors.surface,
      color: colors.text,
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    textarea: {
      width: '100%',
      padding: '1rem',
      border: `2px solid ${colors.border}`,
      fontSize: '1rem',
      backgroundColor: colors.surface,
      color: colors.text,
      minHeight: '100px',
      resize: 'vertical',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    formActions: {
      display: 'flex',
      gap: '1rem'
    },

    cancelButton: {
      flex: '1',
      padding: '1rem',
      border: `2px solid ${colors.borderLight}`,
      backgroundColor: colors.backgroundSecondary,
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    submitButton: {
      flex: '1',
      padding: '1rem',
      border: 'none',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
      color: colors.white,
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    },

    mobileCalendarToggle: {
      display: 'none',
      width: '100%',
      padding: '0.875rem 1.5rem',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
      color: colors.white,
      border: 'none',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      marginBottom: '1rem',
      transition: 'all 0.3s ease',
      fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },

    mobileCalendarCollapse: {
      background: colors.surface,
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: `0 4px 20px ${withOpacity(colors.text, 0.05)}`,
      display: 'none'
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
            color: colors.textSecondary,
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            lineHeight: '1.7',
            fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '400'
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
          <h1 style={styles.heroTitle}>
            Discover <span style={styles.heroTitleEmphasis}>Our</span> Events
          </h1>
          
        </div>
      </div>

      <div style={styles.mainContainer}>
        {viewMode !== 'detail' && (
          <>
            {/* Mobile Calendar Toggle Button */}
            <button
              style={styles.mobileCalendarToggle}
              className="mobile-calendar-toggle"
              onClick={() => setShowMobileCalendar(!showMobileCalendar)}
            >
              <Calendar size={18} />
              {showMobileCalendar ? 'Hide Calendar' : 'View Calendar'}
            </button>

            {/* Mobile Calendar Collapse */}
            <div 
              style={{
                ...styles.mobileCalendarCollapse,
                display: showMobileCalendar ? 'block' : 'none'
              }}
              className="mobile-calendar-collapse"
            >
              <div style={styles.calendarIndicator}>
                <Calendar size={20} />
                <span>Event Calendar</span>
              </div>

              <div style={styles.calendar}>
                {/* Calendar Header */}
                <div style={styles.calendarHeader}>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    style={styles.calendarNav}
                    onMouseEnter={(e) => {
                      e.target.style.background = colors.backgroundSecondary;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = colors.surface;
                    }}
                  >
                    ←
                  </button>
                  
                  <h3 style={styles.calendarTitle}>
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    style={styles.calendarNav}
                    onMouseEnter={(e) => {
                      e.target.style.background = colors.backgroundSecondary;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = colors.surface;
                    }}
                  >
                    →
                  </button>
                </div>

                {/* Calendar Grid */}
                <div style={styles.calendarGrid}>
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed','Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={styles.calendarDayHeader}>
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                    <div key={`empty-${i}`} style={styles.calendarDay}></div>
                  ))}

                  {/* Calendar Days */}
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
                            ? `rgba(10, 69, 28, 0.1)`
                            : colors.white,
                          border: isToday ? `2px solid ${colors.primary}` : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (dayEvents.length > 0) {
                            e.target.style.background = `rgba(252, 207, 60, 0.1)`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = isToday 
                            ? `rgba(10, 69, 28, 0.1)`
                            : colors.white;
                        }}
                      >
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? colors.primary : colors.gray900,
                          marginBottom: '0.25rem'
                        }}>
                          {i + 1}
                        </div>
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => {
                              handleViewDetails(event);
                              setShowMobileCalendar(false); // Close calendar when event is clicked
                            }}
                            style={{
                              width: '100%',
                              padding: '0.125rem 0.25rem',
                              background: colors.primary,
                              color: colors.white,
                              fontSize: '0.625rem',
                              marginBottom: '0.125rem',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              fontWeight: 500
                            }}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div style={{
                            fontSize: '0.625rem',
                            color: colors.gray500,
                            cursor: 'pointer',
                            fontWeight: 500
                          }}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div style={styles.filterSection} data-animate-id="filter">
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.primary,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Filter Events by Location
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.gray200;
                  }}
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

            {/* Two Column Layout */}
            <div style={styles.twoColumnLayout}>
              {/* Events Section */}
              <div style={styles.eventsSection}>
                {/* View Toggle */}
                <div style={styles.viewToggle}>
                  <button
                    style={{
                      ...styles.viewButton,
                      background: viewMode === 'grid' ? colors.primary : 'transparent',
                      color: viewMode === 'grid' ? colors.white : colors.gray600
                    }}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 size={16} />
                    Grid View
                  </button>
                  <button
                    style={{
                      ...styles.viewButton,
                      background: viewMode === 'list' ? colors.primary : 'transparent',
                      color: viewMode === 'list' ? colors.white : colors.gray600
                    }}
                    onClick={() => setViewMode('list')}
                  >
                    List View
                  </button>
                </div>

                <h2 style={styles.sectionTitle}>Upcoming Events</h2>
                <p style={styles.sectionSubtitle}>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} available
                  {selectedCountry && ` in ${selectedCountry}`}
                </p>

                {/* Events Grid */}
                {filteredEvents.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    background: colors.gray50,
                    border: `2px solid ${colors.gray200}`
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      margin: '0 0 1rem 0',
                      color: colors.gray700
                    }}>
                      No events found
                    </h3>
                    <p style={{ color: colors.gray500 }}>
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
                      let statusColor = colors.info;
                      if (endDate && now > endDate) {
                        status = 'past';
                        statusColor = colors.gray500;
                      } else if (now >= startDate && (!endDate || now <= endDate)) {
                        status = 'ongoing';
                        statusColor = colors.success;
                      }

                      return (
                        <div 
                          key={event.id}
                          style={styles.eventCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = colors.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.borderColor = colors.gray200;
                          }}
                        >
                          {/* Status Badge */}
                          <div style={{
                            ...styles.statusBadge,
                            backgroundColor: statusColor
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
                                height: '150px',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '150px',
                              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: colors.white,
                              fontSize: '1rem',
                              fontWeight: 600,
                              position: 'relative'
                            }}>
                              {event.title}
                            </div>
                          )}

                          {/* Event Content */}
                          <div style={{ padding: '1.25rem' }}>
                            <h3 style={{
                              fontSize: '1.125rem',
                              fontWeight: 700,
                              color: colors.gray900,
                              margin: '0 0 0.75rem 0',
                              lineHeight: 1.3
                            }}>
                              {event.title}
                            </h3>
                            
                            {/* Event Meta */}
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.4rem',
                              marginBottom: '0.75rem'
                            }}>
                              {event.country && (
                                <span style={{
                                  padding: '0.2rem 0.6rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: colors.white,
                                  backgroundColor: colors.info,
                                  borderRadius: '12px'
                                }}>
                                  <MapPin size={10} style={{ marginRight: '0.2rem', display: 'inline' }} />
                                  {event.country}
                                </span>
                              )}
                              {event.is_paid ? (
                                <span style={{
                                  padding: '0.2rem 0.6rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: colors.white,
                                  backgroundColor: colors.success,
                                  borderRadius: '12px'
                                }}>
                                  <DollarSign size={10} style={{ marginRight: '0.2rem', display: 'inline' }} />
                                  {event.currency} {parseFloat(event.price).toFixed(0)}
                                </span>
                              ) : (
                                <span style={{
                                  padding: '0.2rem 0.6rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: colors.secondary,
                                  color: colors.black,
                                  borderRadius: '12px'
                                }}>
                                  Free
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            {event.description && (
                              <p style={{
                                color: colors.gray600,
                                lineHeight: 1.5,
                                marginBottom: '1rem',
                                fontSize: '0.8125rem'
                              }}>
                                {event.description.length > 80 
                                  ? `${event.description.substring(0, 80)}...`
                                  : event.description
                                }
                              </p>
                            )}

                            {/* Event Details */}
                            <div style={{ marginBottom: '1rem' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                marginBottom: '0.3rem',
                                color: colors.gray600,
                                fontSize: '0.8125rem'
                              }}>
                                <Clock size={12} />
                                <span>{formatDateShort(event.start_date)}</span>
                              </div>
                              
                              {event.location && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  color: colors.gray600,
                                  fontSize: '0.8125rem'
                                }}>
                                  <MapPin size={12} />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                              display: 'flex',
                              gap: '0.5rem'
                            }}>
                              <button
                                onClick={() => handleViewDetails(event)}
                                style={{
                                  flex: 1,
                                  padding: '0.6rem 0.8rem',
                                  border: `2px solid ${colors.primary}`,
                                  background: 'transparent',
                                  color: colors.primary,
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  fontFamily: 'inherit',
                                  borderRadius: '6px'
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
                                Details
                              </button>
                              <button
                                onClick={() => handleExpressInterest(event)}
                                disabled={status === 'past'}
                                style={{
                                  flex: 1,
                                  padding: '0.6rem 0.8rem',
                                  border: 'none',
                                  borderRadius: '6px',
                                  background: status === 'past' 
                                    ? colors.gray400 
                                    : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                                  color: colors.white,
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: status === 'past' ? 'not-allowed' : 'pointer',
                                  opacity: status === 'past' ? 0.6 : 1,
                                  transition: 'all 0.3s ease',
                                  fontFamily: 'inherit'
                                }}
                                onMouseEnter={(e) => {
                                  if (status !== 'past') {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = `0 4px 12px rgba(10, 69, 28, 0.3)`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (status !== 'past') {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                  }
                                }}
                              >
                                {status === 'past' ? 'Ended' : 'Join'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Calendar Section */}
              <div style={styles.calendarSection}>
                <div style={styles.calendarIndicator}>
                  <Calendar size={20} />
                  <span>Event Calendar</span>
                </div>

                <div style={styles.calendar}>
                  {/* Calendar Header */}
                  <div style={styles.calendarHeader}>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      style={styles.calendarNav}
                      onMouseEnter={(e) => {
                        e.target.style.background = colors.gray100;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = colors.white;
                      }}
                    >
                      ←
                    </button>
                    
                    <h3 style={styles.calendarTitle}>
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      style={styles.calendarNav}
                      onMouseEnter={(e) => {
                        e.target.style.background = colors.gray100;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = colors.white;
                      }}
                    >
                      →
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div style={styles.calendarGrid}>
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={styles.calendarDayHeader}>
                        {day}
                      </div>
                    ))}

                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                      <div key={`empty-${i}`} style={styles.calendarDay}></div>
                    ))}

                    {/* Calendar Days */}
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
                              ? `rgba(10, 69, 28, 0.1)`
                              : colors.white,
                            border: isToday ? `2px solid ${colors.primary}` : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (dayEvents.length > 0) {
                              e.target.style.background = `rgba(252, 207, 60, 0.1)`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = isToday 
                              ? `rgba(10, 69, 28, 0.1)`
                              : colors.white;
                          }}
                        >
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: isToday ? 700 : 500,
                            color: isToday ? colors.primary : colors.gray900,
                            marginBottom: '0.25rem'
                          }}>
                            {i + 1}
                          </div>
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              onClick={() => handleViewDetails(event)}
                              style={{
                                width: '100%',
                                padding: '0.125rem 0.25rem',
                                background: colors.primary,
                                color: colors.white,
                                fontSize: '0.625rem',
                                marginBottom: '0.125rem',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                fontWeight: 500
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div style={{
                              fontSize: '0.625rem',
                              color: colors.gray500,
                              cursor: 'pointer',
                              fontWeight: 500
                            }}>
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detail View */}
        {viewMode === 'detail' && detailEvent && (
          <div style={{
            ...styles.eventsSection,
            gridColumn: '1 / -1'
          }}>
            {/* Back Button */}
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: `2px solid ${colors.gray300}`,
                color: colors.primary,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '2rem',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.gray100;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={16} />
              Back to Events
            </button>

            {/* Event Image */}
            {detailEvent.image_url && (
              <div style={{
                width: '100%',
                height: '300px',
                overflow: 'hidden',
                marginBottom: '2rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
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
                color: colors.gray900,
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
                    ...styles.metaBadge,
                    backgroundColor: colors.info,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem'
                  }}>
                    <MapPin size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                    {detailEvent.country}
                  </span>
                )}
                {detailEvent.is_paid ? (
                  <span style={{
                    ...styles.metaBadge,
                    backgroundColor: colors.success,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem'
                  }}>
                    <DollarSign size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                    {detailEvent.currency} {parseFloat(detailEvent.price).toFixed(2)}
                  </span>
                ) : (
                  <span style={{
                    ...styles.metaBadge,
                    backgroundColor: colors.secondary,
                    color: colors.black,
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem'
                  }}>
                    Free Event
                  </span>
                )}
              </div>

              {/* Event Times */}
              <div style={{
                background: colors.gray100,
                padding: '1.5rem',
                border: `2px solid ${colors.gray200}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: detailEvent.end_date ? '0.75rem' : 0,
                  color: colors.gray900,
                  fontSize: '1rem',
                  fontWeight: 500
                }}>
                  <Clock size={18} />
                  <span>Starts: {formatDate(detailEvent.start_date)}</span>
                </div>
                
                {detailEvent.end_date && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: colors.gray900,
                    fontSize: '1rem',
                    fontWeight: 500
                  }}>
                    <Clock size={18} />
                    <span>Ends: {formatDate(detailEvent.end_date)}</span>
                  </div>
                )}
                
                {detailEvent.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.75rem',
                    color: colors.gray900,
                    fontSize: '1rem',
                    fontWeight: 500
                  }}>
                    <MapPin size={18} />
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
                  color: colors.gray900,
                  marginBottom: '1rem'
                }}>
                  About This Event
                </h2>
                <div style={{
                  color: colors.gray600,
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
                  ...styles.primaryButton,
                  padding: '1rem 3rem',
                  fontSize: '1.125rem',
                  fontWeight: 700
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = `0 8px 30px rgba(10, 69, 28, 0.4)`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Express Interest
              </button>
            </div>
          </div>
        )}

        {/* Interest Form Modal */}
        {showInterestForm && (
          <div style={styles.modal} onClick={closeInterestForm}>
            <div 
              style={styles.modalContent} 
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
                  color: colors.gray500,
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.gray100;
                  e.target.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.gray500;
                }}
              >
                ×
              </button>
              
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: colors.gray900,
                  margin: '0 0 0.5rem 0'
                }}>
                  Express Interest
                </h2>
                <p style={{
                  color: colors.gray600,
                  margin: '0',
                  fontSize: '0.875rem'
                }}>
                  {selectedEvent?.title}
                </p>
              </div>

              {/* Modal Body */}
              <div style={styles.modalBody}>
                {/* Status Message */}
                {submitStatus.message && (
                  <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    backgroundColor: submitStatus.type === 'error' 
                      ? `rgba(239, 68, 68, 0.1)`
                      : submitStatus.type === 'success'
                      ? `rgba(16, 185, 129, 0.1)`
                      : submitStatus.type === 'warning'
                      ? `rgba(245, 158, 11, 0.1)`
                      : `rgba(59, 130, 246, 0.1)`,
                    color: submitStatus.type === 'error' 
                      ? colors.error
                      : submitStatus.type === 'success'
                      ? colors.success
                      : submitStatus.type === 'warning'
                      ? colors.warning
                      : colors.info,
                    border: `2px solid ${submitStatus.type === 'error' 
                      ? colors.error
                      : submitStatus.type === 'success'
                      ? colors.success
                      : submitStatus.type === 'warning'
                      ? colors.warning
                      : colors.info}`,
                    fontSize: '0.875rem'
                  }}>
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={submitInterest}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
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
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.gray200;
                      }}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
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
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.gray200;
                      }}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={interestForm.phone}
                      onChange={handleInterestChange}
                      disabled={submitting}
                      placeholder="Enter your phone number"
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.gray200;
                      }}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={interestForm.message}
                      onChange={handleInterestChange}
                      disabled={submitting}
                      placeholder="Any questions or additional information..."
                      style={styles.textarea}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.gray200;
                      }}
                    />
                  </div>

                  {/* Form Actions */}
                  <div style={styles.formActions}>
                    <button
                      type="button"
                      onClick={closeInterestForm}
                      disabled={submitting}
                      style={{
                        ...styles.cancelButton,
                        opacity: submitting ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) {
                          e.target.style.backgroundColor = colors.gray200;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) {
                          e.target.style.backgroundColor = colors.gray100;
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        ...styles.submitButton,
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
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800;900&display=swap');

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          [style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          [style*="position: sticky"] {
            position: static !important;
          }

          /* Show mobile calendar toggle on tablets and smaller */
          .mobile-calendar-toggle {
            display: flex !important;
          }

          /* Hide desktop calendar on tablets and smaller */
          [style*="position: sticky"][style*="top: 2rem"] {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem !important;
          }
          
          .hero-subtitle {
            font-size: 1rem !important;
          }
          
          [style*="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"] {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          
          [style*="padding: 4rem 2rem"] {
            padding: 2rem 1rem !important;
          }
          
          [style*="padding: 1.5rem"] {
            padding: 1rem !important;
          }

          [style*="min-height: 60vh"] {
            min-height: 50vh !important;
          }
          
          [style*="display: flex"][style*="gap: 0.5rem"] {
            flex-direction: column !important;
            gap: 0.25rem !important;
          }

          [style*="grid-template-columns: repeat(7, 1fr)"] {
            font-size: 0.75rem !important;
          }
          
          [style*="min-height: 70px"] {
            min-height: 50px !important;
            padding: 0.2rem !important;
          }
        }

        @media (max-width: 600px) {
          [style*="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
          
          [style*="max-width: 300px"] {
            max-width: 100% !important;
          }

          [style*="flex-direction: column"] {
            gap: 0.5rem !important;
          }
        }

        @media (max-width: 480px) {
          [style*="max-width: 500px"] {
            margin: 0.5rem !important;
            max-width: calc(100vw - 1rem) !important;
          }
          
          [style*="padding: 2rem 2rem 1rem 2rem"] {
            padding: 1.5rem 1.5rem 1rem 1.5rem !important;
          }
          
          [style*="padding: 2rem"] {
            padding: 1.5rem !important;
          }

          .hero-title {
            font-size: 1.75rem !important;
          }
          
          .hero-subtitle {
            font-size: 0.9rem !important;
          }

          [style*="font-size: 2.5rem"] {
            font-size: 1.75rem !important;
          }

          [style*="font-size: 1.5rem"] {
            font-size: 1.25rem !important;
          }

          [style*="padding: 1rem 3rem"] {
            padding: 0.875rem 2rem !important;
            font-size: 1rem !important;
          }
        }

        /* Improved touch targets for mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px !important;
            padding: 0.75rem 1rem !important;
          }

          input, textarea, select {
            padding: 0.875rem 1rem !important;
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
        }

        /* Calendar mobile optimization */
        @media (max-width: 600px) {
          [style*="grid-template-columns: repeat(7, 1fr)"] div {
            font-size: 0.7rem !important;
            padding: 0.25rem !important;
          }
          
          [style*="min-height: 50px"] {
            min-height: 40px !important;
          }
        }

        /* Optimize calendar for very small screens but keep visible */
        @media (max-width: 480px) {
          [style*="min-height: 40px"] {
            min-height: 35px !important;
            padding: 0.15rem !important;
          }
          
          [style*="font-size: 0.7rem"] {
            font-size: 0.65rem !important;
          }
          
          /* Make calendar section more compact */
          [style*="position: sticky"][style*="top: 2rem"] {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsPublicDisplay;