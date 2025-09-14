import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, Mail, Phone, Globe, ChevronRight, Star, Award, Zap, ExternalLink, Heart, Briefcase, CheckCircle, ChevronDown, MapIcon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CountryInfoDisplay = () => {
  const { countryName } = useParams();
  const navigate = useNavigate();
  const [countryData, setCountryData] = useState({
    country: null,
    team: [],
    projects: [],
    events: [],
    contact: null,
    transactionMethods: []
  });
  const [availableCountries, setAvailableCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState({});
  const [activeBio, setActiveBio] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:3001';

  // Placeholder data for when API data is not available
  const getPlaceholderData = () => ({
    team: [],
    projects: [],
    events: [],
    contact: {
      country: countryName,
      email: `info.${countryName.toLowerCase().replace(/\s+/g, '')}@organization.org`,
      phone: '+1 (555) 000-0000',
      physical_address: 'Address information coming soon',
      city: 'City information coming soon',
      postal_code: '00000',
      mailing_address: 'Mailing address information coming soon'
    },
    transactionMethods: []
  });

  
  // Project navigation handlers
  const handleProjectClick = (project, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    sessionStorage.setItem('lastVisitedPath', '/');
    
    navigate(`/project/${project.id}`, { 
      state: { 
        project,
        from: '/',
        fromPath: '/'
      }
    });
  };
  // Track expanded bios by member ID
  // Project navigation handlers
const handleEventClick = (event) => {
  navigate(`/events?eventId=${event.id}`);
};
 const toggleExpand = (id, bio) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setActiveBio(bio); // open the modal with full bio
  };

  const fetchCountryData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const [countriesRes, teamRes, projectsRes, eventsRes, contactsRes, transactionRes] = await Promise.all([
        fetch(`${API_BASE}/countries`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/team`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/projects`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/events`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/country-contacts`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/transaction-details`).catch(() => ({ ok: false }))
      ]);

      let country = null;
      let team = [];
      let projects = [];
      let events = [];
      let contact = null;
      let transactionMethods = [];
      let allCountries = [];

      // Process countries
      if (countriesRes.ok) {
        const countriesData = await countriesRes.json();
        const countries = Array.isArray(countriesData) ? countriesData : countriesData.data || [];
        allCountries = countries.map(c => c.name).sort();
        setAvailableCountries(allCountries);
        country = countries.find(c => c.name === countryName);
      }

      // Process team members
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        const allTeam = Array.isArray(teamData) ? teamData : teamData.members || teamData.data || [];
        team = allTeam.filter(member => member.country === countryName);
      }

      // Process projects
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        const allProjects = Array.isArray(projectsData) ? projectsData : projectsData.data || [];
        projects = allProjects.filter(project => 
          project.country_name === countryName || 
          project.countryName === countryName ||
          project.country === countryName ||
          (project.location && project.location.includes(countryName))
        );
      }

      // Process events
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const allEvents = Array.isArray(eventsData) ? eventsData : eventsData.data || [];
        events = allEvents.filter(event => 
          event.country === countryName ||
          (event.location && event.location.includes(countryName))
        );
      }

      // Process contact information
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        const contacts = Array.isArray(contactsData) ? contactsData : contactsData.data || [];
        contact = contacts.find(c => c.country === countryName);
      }

      // Process transaction methods
      if (transactionRes.ok) {
        const transactionData = await transactionRes.json();
        const allMethods = Array.isArray(transactionData) ? transactionData : transactionData.data || [];
        transactionMethods = allMethods.filter(method => 
          method.country === countryName || !method.country
        );
      }

      // Use placeholder data if no real data is available
      const placeholderData = getPlaceholderData();
      
      setCountryData({
        country,
        team: team.length > 0 ? team : placeholderData.team,
        projects: projects.length > 0 ? projects : placeholderData.projects,
        events: events.length > 0 ? events : placeholderData.events,
        contact: contact || placeholderData.contact,
        transactionMethods: transactionMethods.length > 0 ? transactionMethods : placeholderData.transactionMethods
      });
    } catch (err) {
      console.error('Error fetching country data:', err);
      setError('Failed to load country information');
      // Use placeholder data on error
      const placeholderData = getPlaceholderData();
      setCountryData({
        country: null,
        team: placeholderData.team,
        projects: placeholderData.projects,
        events: placeholderData.events,
        contact: placeholderData.contact,
        transactionMethods: placeholderData.transactionMethods
      });
    } finally {
      setLoading(false);
    }
  }, [countryName, API_BASE]);

  useEffect(() => {
    if (countryName) {
      fetchCountryData();
    }
  }, [countryName, fetchCountryData]);

  // Handle country selection from dropdown
  const handleCountrySelect = (selectedCountry) => {
    setDropdownOpen(false);
    if (selectedCountry !== countryName) {
      navigate(`/country/${encodeURIComponent(selectedCountry)}`);
    }
  };

  // Go back to where the user came from
  const handleBack = () => {
    navigate(-1);
  };

  // Go to "Explore More Countries"
  const handleExplore = () => {
    navigate('/findbycountry');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (now < start) return 'upcoming';
    if (end && now > end) return 'completed';
    return 'ongoing';
  };

  // Check if we have real data or just placeholders
  const hasRealData = countryData.team.length > 0 || countryData.projects.length > 0 || countryData.events.length > 0;

  if (loading) {
    return (
      <div>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingContent}>
            <div style={styles.loadingSpinner}></div>
            <div style={styles.loadingText}>Discovering {countryName}...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = [
    { label: 'Team Members', value: countryData.team.length, icon: Users },
    { label: 'Active Projects', value: countryData.projects.filter(p => p.status === 'ongoing' || p.status === 'planning').length, icon: Zap },
    { label: 'Upcoming Events', value: countryData.events.filter(e => getEventStatus(e.start_date, e.end_date) === 'upcoming').length, icon: Calendar },
    { label: 'Payment Methods', value: countryData.transactionMethods.length, icon: DollarSign }
  ];

  return (
    <div>
      <Header />
      
      {/* Sticky Country Header */}
      <div style={styles.stickyHeader}>
        <div style={styles.stickyHeaderContent}>
          <button onClick={handleBack} style={styles.backButton} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          
          <div style={styles.countryInfo}>
            <MapIcon size={20} style={styles.countryIcon} />
            <h2 style={styles.countryTitle}>{countryName}</h2>
          </div>
          
          <div style={styles.dropdownContainer}>
            <button 
              style={styles.dropdownButton}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Select country"
            >
              Switch Country
              <ChevronDown size={16} style={{
                ...styles.dropdownChevron,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>
            
            {dropdownOpen && (
              <div style={styles.dropdownMenu}>
                <div style={styles.dropdownHeader}>Select a Country</div>
                <div style={styles.dropdownList}>
                  {availableCountries.map(country => (
                    <button
                      key={country}
                      style={{
                        ...styles.dropdownItem,
                        ...(country === countryName ? styles.dropdownItemActive : {})
                      }}
                      onClick={() => handleCountrySelect(country)}
                    >
                      {country}
                      {country === countryName && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button onClick={handleExplore} style={styles.exploreButton}>
            Explore All
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .team-action:hover {
            background: #0a451c !important;
            color: white !important;
            transform: translateY(-1px) !important;
          }

          .register-button:hover {
            background: #0f5132 !important;
            transform: translateY(-1px) !important;
          }

          .contact-item-value:hover {
            color: #0f5132 !important;
          }

          .cta-button:hover {
            background: #0f5132 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(10, 69, 28, 0.4) !important;
          }

          .project-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          }

          .event-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          }

          .team-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          }

          .stat-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(10, 69, 28, 0.15) !important;
          }
            

          .payment-method:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
          }

          @media (max-width: 1200px) {
            .hero-content {
              padding: 60px 24px !important;
            }
          }

          @media (max-width: 1024px) {
            .hero-title {
              font-size: 3.5rem !important;
            }
            
            .hero-subtitle {
              font-size: 1.25rem !important;
            }

            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }

            .content-container {
              padding: 40px 24px !important;
            }
          }

          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.5rem !important;
            }
            
            .hero-subtitle {
              font-size: 1.125rem !important;
            }

            .hero-title-container {
              flex-direction: column !important;
            }

            .team-grid {
              grid-template-columns: 1fr !important;
            }

            .projects-grid {
              grid-template-columns: 1fr !important;
            }

            .events-grid {
              grid-template-columns: 1fr !important;
            }

            .contact-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 480px) {
            .hero-title {
              font-size: 2rem !important;
            }

            .hero-content {
              padding: 40px 16px !important;
            }

            .content-container {
              padding: 24px 16px !important;
            }

            .cta-buttons {
              flex-direction: column !important;
              width: 100% !important;
            }

            .cta-button {
              width: 100% !important;
            }
          }
        `}</style>

        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroContent} className="hero-content">
            <div style={styles.heroTitleContainer} className="hero-title-container">
              <div style={styles.heroFlag}>🌍</div>
              <h1 style={styles.heroTitle} className="hero-title">
                {countryName}
              </h1>
            </div>
            <p style={styles.heroSubtitle} className="hero-subtitle">
              Our commitment to sustainable development and community empowerment in {countryName}.
            </p>
            
            {/* Stats Grid */}
            <div style={styles.statsGrid} className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} style={styles.statCard} className="stat-card">
                  <div style={styles.statContent}>
                    <stat.icon style={styles.statIcon} />
                    <div style={styles.statNumber}>{stat.value}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Container */}
        <div style={styles.mainContainer}>
          
          {/* Content Coming Soon Placeholder */}
          {!hasRealData && (
            <section style={styles.placeholderSection}>
              <div style={styles.placeholderCard}>
                <div style={styles.placeholderIcon}>🤝</div>
                <h2 style={styles.placeholderTitle}>Content Coming Soon</h2>
                <p style={styles.placeholderText}>
                  We're currently gathering detailed information about our operations in {countryName}. 
                  Check back soon for updates on our team, projects, and local initiatives.
                </p>
                <p style={styles.placeholderSubtext}>
                  Meanwhile, feel free to explore other countries from the dropdown above or contact us for more information.
                </p>
                <div style={styles.placeholderActions}>
                  <button onClick={handleExplore} style={styles.placeholderButton}>
                    Explore Other Countries
                  </button>
                </div>
              </div>
            </section>
          )}
{/* Compact Premium Team Grid Carousel */}
{countryData.team.length > 0 && (
  <section style={{ 
    padding: "3rem 1rem",
    // background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    position: "relative",
    overflow: "hidden"
  }}>
    {/* Subtle background elements */}
    <div style={{
      position: "absolute",
      top: "-5%",
      right: "-5%",
      width: "20%",
      height: "110%",
      background: "linear-gradient(45deg, rgba(99, 102, 241, 0.02), rgba(139, 69, 19, 0.01))",
      borderRadius: "50%",
      filter: "blur(60px)",
      zIndex: 0
    }} />

    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto",
      position: "relative",
      zIndex: 1
    }}>
      {/* Compact Header */}
      <div style={{ 
        textAlign: "center",
        marginBottom: "2.5rem"
      }}>
        <div style={{
          display: "inline-block",
          padding: "0.3rem 1rem",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 69, 19, 0.03))",
          borderRadius: "20px",
          border: "1px solid rgba(99, 102, 241, 0.15)",
          marginBottom: "1rem",
          fontSize: "0.75rem",
          fontWeight: "600",
          color: "#6366f1",
          letterSpacing: "0.5px",
          textTransform: "uppercase"
        }}>
          Team
        </div>
        
        <h2 style={{ 
          fontSize: "1.75rem",
          fontWeight: "700",
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #1e293b, #475569)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: "1.3",
          letterSpacing: "-0.02em"
        }}>
          Meet Our {countryName} Team
        </h2>
        
        <p style={{ 
          color: "#64748b",
          fontSize: "0.95rem",
          maxWidth: "500px",
          margin: "0 auto",
          lineHeight: "1.5"
        }}>
          The professionals driving change in {countryName}
        </p>
      </div>

      {/* Carousel Container */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px"
      }}>
        {/* Navigation Buttons */}
        <button
          onClick={() => {
            const container = document.getElementById('team-grid-carousel');
            const gridWidth = container.offsetWidth;
            container.scrollBy({ left: -gridWidth, behavior: 'smooth' });
          }}
          style={{
            position: "absolute",
            left: "-20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#374151",
            fontSize: "1.2rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-50%) scale(1.1)";
            e.target.style.boxShadow = "0 12px 35px -5px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(-50%) scale(1)";
            e.target.style.boxShadow = "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
          }}
        >
          ←
        </button>

        <button
          onClick={() => {
            const container = document.getElementById('team-grid-carousel');
            const gridWidth = container.offsetWidth;
            container.scrollBy({ left: gridWidth, behavior: 'smooth' });
          }}
          style={{
            position: "absolute",
            right: "-20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#374151",
            fontSize: "1.2rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-50%) scale(1.1)";
            e.target.style.boxShadow = "0 12px 35px -5px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(-50%) scale(1)";
            e.target.style.boxShadow = "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
          }}
        >
          →
        </button>

        {/* Scrollable Grid Container */}
        <div
          id="team-grid-carousel"
          style={{
            display: "flex",
            gap: "2rem",
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: "smooth",
            padding: "1rem 0",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitScrollbar: { display: "none" }
          }}
        >
          {/* Create pages of 6 members each (3x2 grid) */}
          {Array.from({ length: Math.ceil(countryData.team.length / 6) }, (_, pageIndex) => (
            <div
              key={pageIndex}
              style={{
                minWidth: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(2, 1fr)",
                gap: "1rem",
                alignItems: "stretch"
              }}
            >
              {countryData.team.slice(pageIndex * 6, (pageIndex + 1) * 6).map((member, index) => {
                const globalIndex = pageIndex * 6 + index;
                const MAX_LENGTH = 100;
                const isLong = member.bio && member.bio.length > MAX_LENGTH;
                const displayedBio = isLong
                  ? member.bio.slice(0, MAX_LENGTH) + "..."
                  : member.bio;

                return (
                  <div
                    key={member.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 8px 12px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      height: "280px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 8px -5px rgba(0, 0, 0, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 12px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    {/* Top accent */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: `linear-gradient(135deg, 
                        ${globalIndex % 3 === 0 ? '#6366f1, #8b5cf6' : 
                          globalIndex % 3 === 1 ? '#10b981, #059669' : 
                          '#f59e0b, #d97706'})`,
                      borderRadius: "12px 12px 0 0"
                    }} />

                    {/* Header with Avatar and Info */}
                    <div style={{ 
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      gap: "0.75rem"
                    }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {member.image_url ? (
                          <img
                            src={`${STATIC_URL}${member.image_url}`}
                            alt={member.name}
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "2px solid rgba(255, 255, 255, 0.8)",
                              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}

                        <div
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "8px",
                            background: `linear-gradient(135deg, 
                              ${globalIndex % 3 === 0 ? '#6366f1, #8b5cf6' : 
                                globalIndex % 3 === 1 ? '#10b981, #059669' : 
                                '#f59e0b, #d97706'})`,
                            display: member.image_url ? "none" : "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#ffffff",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)"
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          margin: "0 0 0.2rem 0",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          color: "#1e293b",
                          letterSpacing: "-0.01em",
                          lineHeight: "1.2",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {member.name}
                        </h3>

                        <div style={{
                          fontSize: "0.7rem",
                          fontWeight: "600",
                          color: globalIndex % 3 === 0 ? '#6366f1' : 
                            globalIndex % 3 === 1 ? '#10b981' : '#f59e0b',
                          background: `${globalIndex % 3 === 0 ? 'rgba(99, 102, 241, 0.1)' : 
                            globalIndex % 3 === 1 ? 'rgba(16, 185, 129, 0.1)' : 
                            'rgba(245, 158, 11, 0.1)'}`,
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          display: "inline-block",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {member.position}
                        </div>
                      </div>
                    </div>

                    {member.department && (
                      <div style={{ 
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {member.department}
                      </div>
                    )}

                    {/* Bio Section */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <p style={{ 
                        marginBottom: "0.75rem",
                        color: "#475569",
                        lineHeight: "1.4",
                        fontSize: "0.8rem",
                        flex: 1,
                        overflow: "hidden"
                      }}>
                        {displayedBio}
                      </p>

                      {/* Action Buttons */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginTop: "auto"
                      }}>
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(member.id, member.bio)}
                            style={{
                              padding: "0.3rem 0.6rem",
                              border: "none",
                              borderRadius: "6px",
                              background: `linear-gradient(135deg, 
                                ${globalIndex % 3 === 0 ? '#6366f1, #8b5cf6' : 
                                  globalIndex % 3 === 1 ? '#10b981, #059669' : 
                                  '#f59e0b, #d97706'})`,
                              color: "#ffffff",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "0.7rem",
                              transition: "all 0.2s ease",
                              flex: 1,
                              maxWidth: "80px"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            More
                          </button>
                        )}

                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              textDecoration: "none",
                              color: "#64748b",
                              fontSize: "0.7rem",
                              fontWeight: "500",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.2s ease",
                              background: "rgba(255, 255, 255, 0.8)",
                              flex: 1,
                              maxWidth: "70px",
                              justifyContent: "center"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.borderColor = "#6366f1";
                              e.target.style.color = "#6366f1";
                              e.target.style.background = "rgba(99, 102, 241, 0.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.borderColor = "#e2e8f0";
                              e.target.style.color = "#64748b";
                              e.target.style.background = "rgba(255, 255, 255, 0.8)";
                            }}
                          >
                            <span style={{ fontSize: "0.7rem" }}>✉️</span>
                            Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Scroll indicators */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1.5rem"
        }}>
          {Array.from({ length: Math.ceil(countryData.team.length / 6) }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                const container = document.getElementById('team-grid-carousel');
                const gridWidth = container.offsetWidth;
                container.scrollTo({ left: i * gridWidth, behavior: 'smooth' });
              }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                border: "none",
                background: i === 0 ? "#6366f1" : "#cbd5e1",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Enhanced Modal with Full Details */}
    {activeBio && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          animation: "modalFadeIn 0.2s ease-out"
        }}
        onClick={() => setActiveBio(null)}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            padding: "2.5rem",
            borderRadius: "20px",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
            margin: "2rem",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Find the current member details */}
          {(() => {
            const currentMember = countryData.team.find(member => member.bio === activeBio);
            if (!currentMember) return null;
            
            return (
              <div>
                {/* Member Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                  paddingBottom: "1.5rem",
                  borderBottom: "2px solid #e2e8f0"
                }}>
                  <div style={{ position: "relative" }}>
                    {currentMember.image_url ? (
                      <img
                        src={`${STATIC_URL}${currentMember.image_url}`}
                        alt={currentMember.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "16px",
                          objectFit: "cover",
                          border: "3px solid rgba(255, 255, 255, 0.8)",
                          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)"
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "16px",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "2rem",
                          fontWeight: "700",
                          color: "#ffffff",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
                        }}
                      >
                        {currentMember.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1e293b",
                      lineHeight: "1.3"
                    }}>
                      {currentMember.name}
                    </h3>
                    
                    <div style={{
                      display: "inline-block",
                      padding: "0.4rem 1rem",
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))",
                      borderRadius: "12px",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#6366f1",
                      marginBottom: "0.5rem"
                    }}>
                      {currentMember.position}
                    </div>
                    
                    {currentMember.department && (
                      <div style={{
                        color: "#64748b",
                        fontSize: "0.95rem",
                        fontWeight: "500"
                      }}>
                        {currentMember.department}
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Bio */}
                <div style={{ marginBottom: "2rem" }}>
                  <h4 style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#374151"
                  }}>
                    About
                  </h4>
                  <p style={{ 
                    whiteSpace: "pre-wrap", 
                    lineHeight: "1.7",
                    color: "#374151",
                    fontSize: "1rem",
                    margin: 0
                  }}>
                    {activeBio}
                  </p>
                </div>

                {/* Contact Information */}
                {currentMember.email && (
                  <div style={{
                    padding: "1.5rem",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.02))",
                    borderRadius: "12px",
                    border: "1px solid rgba(99, 102, 241, 0.1)",
                    marginBottom: "2rem"
                  }}>
                    <h4 style={{
                      margin: "0 0 1rem 0",
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#374151"
                    }}>
                      Contact Information
                    </h4>
                    <a
                      href={`mailto:${currentMember.email}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        textDecoration: "none",
                        color: "#6366f1",
                        fontSize: "0.95rem",
                        fontWeight: "500",
                        padding: "0.6rem 1.2rem",
                        borderRadius: "10px",
                        border: "2px solid #6366f1",
                        transition: "all 0.3s ease",
                        background: "rgba(255, 255, 255, 0.8)"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#6366f1";
                        e.target.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.8)";
                        e.target.style.color = "#6366f1";
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>✉️</span>
                      {currentMember.email}
                    </a>
                  </div>
                )}

                {/* Close Button */}
                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={() => setActiveBio(null)}
                    style={{
                      padding: "0.75rem 2rem",
                      border: "none",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.05)";
                      e.target.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)";
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    )}

    {/* Custom styles */}
    <style>
      {`
        #team-grid-carousel::-webkit-scrollbar {
          display: none;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          #team-grid-carousel > div {
            grid-template-columns: repeat(2, 1fr) !important;
            grid-template-rows: repeat(3, 1fr) !important;
          }
          
          #team-grid-carousel > div > div {
            height: 250px !important;
          }
        }

        @media (max-width: 480px) {
          #team-grid-carousel > div {
            grid-template-columns: 1fr !important;
            grid-template-rows: repeat(6, 1fr) !important;
          }
        }
      `}
    </style>
  </section>
)}
          

   {/* Projects Section */}
{countryData.projects && countryData.projects.length > 0 ? (
  <section style={styles.section}>
    <div style={styles.sectionHeader}>
      <Award style={styles.sectionIcon} />
      <div>
        <h2 style={styles.sectionTitle}>Projects in {countryName} </h2>
        <p style={styles.sectionSubtitle}>
          Transformative initiatives making a real difference.
        </p>
      </div>
    </div>

    <div style={styles.projectsGrid} className="projects-grid">
      {countryData.projects.map(project => (
        <div
          key={project.id}
          style={styles.projectCard}
          className="project-card"
          onClick={() => handleProjectClick(project)}   // 🔥 clickable card
        >
          {project.featured_image && (
            <div style={styles.projectImage}>
              <img 
                src={project.featured_image.startsWith('http') 
                  ? project.featured_image 
                  : `${STATIC_URL}${project.featured_image}`}
                alt={project.title}
                style={styles.projectImageImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {project.status && (
                <div style={{
                  ...styles.projectStatus,
                  ...(project.status === 'completed' ? styles.statusCompleted :
                     project.status === 'ongoing' ? styles.statusOngoing :
                     project.status === 'planning' ? styles.statusPlanning :
                     styles.statusOnHold)
                }}>
                  {project.status === 'completed' && (
                    <CheckCircle style={{width: '14px', height: '14px'}} />
                  )}
                  {project.status.replace('_', ' ')}
                </div>
              )}
            </div>
          )}
          
          <div style={styles.projectContent}>
            <h3 style={styles.projectTitle}>{project.title}</h3>
            <p style={styles.projectDescription}>
              {project.short_description || 
               (project.description && project.description.substring(0, 150) + '...') ||
               'This project is designed to create meaningful impact in the community.'}
            </p>
            
            <div style={styles.projectMeta}>
              {project.location && (
                <div style={styles.projectMetaItem}>
                  <MapPin size={14} />
                  <span>{project.location}</span>
                </div>
              )}
              {project.start_date && (
                <div style={styles.projectMetaItem}>
                  <Calendar size={14} />
                  <span>Started {formatDate(project.start_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
) : (
  // Placeholder if no projects
  <section style={styles.section}>
    <div style={styles.sectionHeader}>
      <Award style={styles.sectionIcon} />
      <div>
        <h2 style={styles.sectionTitle}>Our {countryName} Projects</h2>
        <p style={styles.sectionSubtitle}>
          We’re currently gathering more insights for {countryName}. Check back soon!
        </p>
      </div>
    </div>
  </section>
)}


          
{/* Events Section */}
{countryData.events.length > 0 && (
  <section style={styles.section}>
    <div style={styles.sectionHeader}>
      <Calendar style={styles.sectionIcon} />
      <div>
        <h2 style={styles.sectionTitle}>{countryName} Events</h2>
        <p style={styles.sectionSubtitle}>
          Join us at upcoming events and community gatherings.
        </p>
      </div>
    </div>

    <div style={styles.eventsGrid} className="events-grid">
      {countryData.events.map(event => {
        const status = getEventStatus(event.start_date, event.end_date);
        return (
          <div
            key={event.id}
            style={styles.eventCard}
            className="event-card"
            onClick={() => handleEventClick(event)} // 👈 added here
          >
            <div style={styles.eventContent}>
              <div style={styles.eventHeader}>
                <h3 style={styles.eventTitle}>{event.title}</h3>

                {event.is_paid ? (
                  <div style={styles.eventPricePaid}>
                    {event.currency} {parseFloat(event.price).toFixed(2)}
                  </div>
                ) : (
                  <div style={styles.eventPriceFree}>Free</div>
                )}
              </div>

              {event.description && (
                <p style={styles.eventDescription}>
                  {event.description.length > 150
                    ? `${event.description.substring(0, 150)}...`
                    : event.description}
                </p>
              )}

              <div style={styles.eventMeta}>
                <div style={styles.eventMetaItem}>
                  <Calendar size={14} />
                  <span>
                    {formatDateTime(event.start_date)}
                    {event.end_date && ` - ${formatDateTime(event.end_date)}`}
                  </span>
                </div>
                {event.location && (
                  <div style={styles.eventMetaItem}>
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
)}




          {/* Contact & Support Section */}
          <section style={styles.section}>
            <div style={styles.sectionDivider}></div>
            <div style={styles.sectionHeader}>
              <Mail style={styles.sectionIcon} />
              <div>
                <h2 style={styles.sectionTitle}>Get In Touch</h2>
                <p style={styles.sectionSubtitle}>
                  Ready to collaborate or learn more? We'd love to hear from you.
                </p>
              </div>
            </div>

            <div style={styles.contactGrid} className="contact-grid">
              {/* Contact Information */}
              <div style={styles.contactSection}>
                <h3 style={styles.contactTitle}>Contact Information</h3>
                
                <div style={styles.contactItems}>
                  {countryData.contact.email && (
                    <div style={styles.contactItem}>
                      <Mail style={{...styles.contactItemIcon, color: '#16a34a'}} />
                      <div style={styles.contactItemContent}>
                        <div style={styles.contactItemLabel}>Email Address</div>
                        <a 
                          href={`mailto:${countryData.contact.email}`}
                          style={styles.contactItemValue}
                          className="contact-item-value"
                        >
                          {countryData.contact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {countryData.contact.phone && (
                    <div style={styles.contactItem}>
                      <Phone style={{...styles.contactItemIcon, color: '#3b82f6'}} />
                      <div style={styles.contactItemContent}>
                        <div style={styles.contactItemLabel}>Phone Number</div>
                        <a 
                          href={`tel:${countryData.contact.phone}`}
                          style={styles.contactItemValue}
                          className="contact-item-value"
                        >
                          {countryData.contact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {countryData.contact.physical_address && (
                    <div style={styles.contactItem}>
                      <MapPin style={{...styles.contactItemIcon, color: '#8b5cf6'}} />
                      <div style={styles.contactItemContent}>
                        <div style={styles.contactItemLabel}>Address</div>
                        <div style={styles.contactItemValue}>{countryData.contact.physical_address}</div>
                        {countryData.contact.city && (
                          <div style={styles.contactItemMeta}>
                            {countryData.contact.city}
                            {countryData.contact.postal_code && `, ${countryData.contact.postal_code}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

// Header (non-sticky, shorter)
stickyHeader: {
  position: 'relative', // no stickiness
  top: '0',
  zIndex: 10,
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
},

stickyHeaderContent: {
  maxWidth: '900px',   // narrower than before
  margin: '0 auto',
  padding: '0.5rem 1rem', // reduced padding for shorter height
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  justifyContent: 'space-between',
},


  backButton: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },

  countryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
  },

  countryIcon: {
    color: '#0a451c',
  },

  countryTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },

  dropdownContainer: {
    position: 'relative',
  },

  dropdownButton: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },

  dropdownChevron: {
    transition: 'transform 0.2s ease',
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 50,
    minWidth: '200px',
    maxHeight: '300px',
    overflow: 'hidden',
    marginTop: '0.25rem',
  },

  dropdownHeader: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  dropdownList: {
    maxHeight: '250px',
    overflowY: 'auto',
  },

  dropdownItem: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'left',
  },

  dropdownItemActive: {
    backgroundColor: '#f0fdf4',
    color: '#0a451c',
    fontWeight: '500',
  },

  exploreButton: {
    backgroundColor: '#0a451c',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    fontWeight: '500',
  },

  // Loading states
  loadingContainer: {
    minHeight: '50vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContent: {
    textAlign: 'center',
  },

  loadingSpinner: {
    width: '3rem',
    height: '3rem',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #0a451c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },

  loadingText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#64748b',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Hero Section
  heroSection: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderBottom: '1px solid #e5e7eb',
  },

  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
    textAlign: 'center',
  },

  heroTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },

  heroFlag: {
    fontSize: '3rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },

  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.1',
    color: '#0a451c',
    margin: 0,
    fontFamily: '"Nunito Sans", sans-serif',
  },

  heroSubtitle: {
    color: '#64748b',
    marginBottom: '2.5rem',
    fontSize: '1.125rem',
    lineHeight: 1.7,
    maxWidth: '600px',
    margin: '0 auto 2.5rem auto',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  },

  statCard: {
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },

  statContent: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },

  statIcon: {
    width: '2rem',
    height: '2rem',
    color: '#0a451c',
    margin: '0 auto 0.75rem',
  },

  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0a451c',
    marginBottom: '0.5rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Main Container - Condensed Layout
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },

  // Placeholder Section
  placeholderSection: {
    padding: '4rem 0',
  },

  placeholderCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    padding: '3rem 2rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    maxWidth: '600px',
    margin: '0 auto',
  },

  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
  },

  placeholderTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  placeholderText: {
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  placeholderSubtext: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '2rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  placeholderActions: {
    display: 'flex',
    justifyContent: 'center',
  },

  placeholderButton: {
    backgroundColor: '#0a451c',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Section Styles
  section: {
    padding: '3rem 0',
    position: 'relative',
  },

  sectionDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '2rem 0',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '2.5rem',
    textAlign: 'left',
  },

  sectionIcon: {
    width: '2rem',
    height: '2rem',
    color: '#0a451c',
    flexShrink: 0,
    marginTop: '0.25rem',
  },

  sectionTitle: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
    lineHeight: '1.2',
  },

  sectionSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: 1.6,
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Team
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },

  teamCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },

  teamCardContent: {
    padding: '1.5rem',
    textAlign: 'center',
  },

  teamAvatar: {
    position: 'relative',
    width: '4rem',
    height: '4rem',
    margin: '0 auto 1rem',
  },

  teamAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '2px solid #0a451c',
  },

  teamAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a451c',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '700',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamPosition: {
    color: '#0a451c',
    fontWeight: '500',
    marginBottom: '0.5rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamDepartment: {
    display: 'inline-block',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamBio: {
    color: '#64748b',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '1rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  teamActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  },

  teamAction: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Projects
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },

  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },

  projectImage: {
    position: 'relative',
    height: '10rem',
    overflow: 'hidden',
    background: 'linear-gradient(45deg, #f0fdf4, #dcfce7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  projectImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  projectStatus: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: '"Nunito Sans", sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },

  statusOngoing: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },

  statusPlanning: {
    backgroundColor: '#fef3c7',
    color: '#a16207',
  },

  statusOnHold: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },

  projectContent: {
    padding: '1.5rem',
  },

  projectTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  projectDescription: {
    color: '#64748b',
    marginBottom: '1rem',
    lineHeight: 1.6,
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  projectMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  projectMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Events
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },

  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },

  eventContent: {
    padding: '1.5rem',
  },

  eventHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    gap: '1rem',
  },

  eventTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    flex: '1',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventPricePaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.375rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventPriceFree: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    padding: '0.375rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventDescription: {
    color: '#64748b',
    marginBottom: '1rem',
    lineHeight: 1.6,
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  eventMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  eventMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
    fontSize: '0.75rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  // Contact
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
    maxWidth: '600px',
  },

  contactSection: {
    display: 'flex',
    flexDirection: 'column',
  },

  contactTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  contactItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },

  contactItemIcon: {
    width: '1.25rem',
    height: '1.25rem',
    marginTop: '0.125rem',
    flexShrink: 0,
  },

  contactItemContent: {
    flex: 1,
  },

  contactItemLabel: {
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  contactItemValue: {
    color: '#0a451c',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    fontSize: '0.875rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },

  contactItemMeta: {
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    fontFamily: '"Nunito Sans", sans-serif',
  },
};


export default CountryInfoDisplay;