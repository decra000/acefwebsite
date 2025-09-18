import React, { useState, useEffect, useCallback } from 'react';
import { Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Mail, Phone, Globe, Award, Zap, ExternalLink, Heart, CheckCircle, ChevronDown, MapIcon, X } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from './CountrySpecificDisplay.styles.js';

const CountryInfoDisplay = () => {
  const { countryName } = useParams();
  const navigate = useNavigate();
  const [countryData, setCountryData] = useState({
    country: null,
    team: [],
    projects: [],
    events: [],
    contact: null,
    transactionMethods: [],
    countryNews: [],
    volunteerForms: []
  });
  const [availableCountries, setAvailableCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState({});
  const [activeBio, setActiveBio] = useState(null);
  const [volunteersModalOpen, setVolunteersModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:3001';

  // Placeholder data for when API data is not available
  const getPlaceholderData = () => ({
    team: [],
    projects: [],
    events: [],
    contact: {
      country: countryName || 'Unknown',
      email: `info.${(countryName || 'unknown').toLowerCase().replace(/\s+/g, '')}@organization.org`,
      phone: '+1 (555) 000-0000',
      physical_address: 'Address information coming soon',
      city: 'City information coming soon',
      postal_code: '00000',
      mailing_address: 'Mailing address information coming soon'
    },
    transactionMethods: [],
    countryNews: [],
    volunteerForms: []
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

  // Event navigation handlers
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

  // Volunteers modal handlers
  const openVolunteersModal = () => {
    setVolunteersModalOpen(true);
  };

  const closeVolunteersModal = () => {
    setVolunteersModalOpen(false);
  };

  const fetchCountryData = useCallback(async () => {
    if (!countryName) {
      setError('No country specified');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log(`Fetching data for country: ${countryName}`);
      
      const [countriesRes, teamRes, projectsRes, eventsRes, contactsRes, transactionRes, newsRes, volunteerFormsRes] = await Promise.all([
        fetch(`${API_BASE}/countries`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/team`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/projects`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/events`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/country-contacts`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/transaction-details`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/blogs/news/country/${encodeURIComponent(countryName)}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/volunteer-forms/country/${encodeURIComponent(countryName)}`).catch(() => ({ ok: false }))
      ]);

      let country = null;
      let team = [];
      let projects = [];
      let events = [];
      let contact = null;
      let transactionMethods = [];
      let allCountries = [];
      let countryNews = [];
      let volunteerForms = [];

      // Process countries
      if (countriesRes.ok) {
        try {
          const countriesData = await countriesRes.json();
          const countries = Array.isArray(countriesData) ? countriesData : countriesData.data || [];
          allCountries = countries.map(c => c.name).sort();
          setAvailableCountries(allCountries);
          country = countries.find(c => c.name === countryName);
          console.log('Countries loaded:', allCountries.length);
        } catch (e) {
          console.warn('Failed to parse countries data:', e);
        }
      }

      // Process country-specific news
      if (newsRes.ok) {
        try {
          const newsData = await newsRes.json();
          countryNews = Array.isArray(newsData) ? newsData : newsData.data || [];
          console.log(`News data for ${countryName}:`, countryNews);
        } catch (e) {
          console.warn('Failed to parse news data:', e);
          countryNews = [];
        }
      } else {
        console.warn(`News API failed for ${countryName}:`, newsRes.status);
      }

      // Process volunteer forms
      if (volunteerFormsRes.ok) {
        try {
          const formsData = await volunteerFormsRes.json();
          volunteerForms = Array.isArray(formsData) ? formsData : formsData.data || [];
          console.log(`Volunteer forms for ${countryName}:`, volunteerForms);
        } catch (e) {
          console.warn('Failed to parse volunteer forms data:', e);
          volunteerForms = [];
        }
      }

      // Process team members
      if (teamRes.ok) {
        try {
          const teamData = await teamRes.json();
          const allTeam = Array.isArray(teamData) ? teamData : teamData.members || teamData.data || [];
          team = allTeam.filter(member => member.country === countryName);
          console.log(`Team members for ${countryName}:`, team.length);
        } catch (e) {
          console.warn('Failed to parse team data:', e);
        }
      }

      // Process projects
      if (projectsRes.ok) {
        try {
          const projectsData = await projectsRes.json();
          const allProjects = Array.isArray(projectsData) ? projectsData : projectsData.data || [];
          projects = allProjects.filter(project => 
            project.country_name === countryName || 
            project.countryName === countryName ||
            project.country === countryName ||
            (project.location && project.location.includes(countryName))
          );
          console.log(`Projects for ${countryName}:`, projects.length);
        } catch (e) {
          console.warn('Failed to parse projects data:', e);
        }
      }

      // Process events
      if (eventsRes.ok) {
        try {
          const eventsData = await eventsRes.json();
          const allEvents = Array.isArray(eventsData) ? eventsData : eventsData.data || [];
          events = allEvents.filter(event => 
            event.country === countryName ||
            (event.location && event.location.includes(countryName))
          );
          console.log(`Events for ${countryName}:`, events.length);
        } catch (e) {
          console.warn('Failed to parse events data:', e);
        }
      }

      // Process contact information
      if (contactsRes.ok) {
        try {
          const contactsData = await contactsRes.json();
          const contacts = Array.isArray(contactsData) ? contactsData : contactsData.data || [];
          contact = contacts.find(c => c.country === countryName);
        } catch (e) {
          console.warn('Failed to parse contacts data:', e);
        }
      }

      // Process transaction methods
      if (transactionRes.ok) {
        try {
          const transactionData = await transactionRes.json();
          const allMethods = Array.isArray(transactionData) ? transactionData : transactionData.data || [];
          transactionMethods = allMethods.filter(method => 
            method.country === countryName || !method.country
          );
        } catch (e) {
          console.warn('Failed to parse transaction data:', e);
        }
      }

      // Use placeholder data if no real data is available
      const placeholderData = getPlaceholderData();
      
      const finalData = {
        country,
        team: team || [],
        projects: projects || [],
        events: events || [],
        contact: contact || placeholderData.contact,
        countryNews: countryNews || [],
        volunteerForms: volunteerForms || [],
        transactionMethods: transactionMethods || []
      };

      setCountryData(finalData);

      console.log('Final country data:', {
        countryNews: finalData.countryNews,
        volunteerForms: finalData.volunteerForms,
        newsLength: finalData.countryNews.length,
        formsLength: finalData.volunteerForms.length
      });

    } catch (err) {
      console.error('Error fetching country data:', err);
      setError('Failed to load country information');
      // Use placeholder data on error
      const placeholderData = getPlaceholderData();
      setCountryData({
        country: null,
        team: [],
        projects: [],
        events: [],
        contact: placeholderData.contact,
        transactionMethods: [],
        countryNews: [],
        volunteerForms: []
      });
    } finally {
      setLoading(false);
    }
  }, [countryName, API_BASE]);

  useEffect(() => {
    if (countryName) {
      fetchCountryData();
    } else {
      setError('No country specified');
      setLoading(false);
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
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getEventStatus = (startDate, endDate) => {
    if (!startDate) return 'unknown';
    
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;

      if (now < start) return 'upcoming';
      if (end && now > end) return 'completed';
      return 'ongoing';
    } catch (e) {
      return 'unknown';
    }
  };

  // Check if we have real data or just placeholders
  const hasRealData = countryData?.team?.length > 0 || countryData?.projects?.length > 0 || countryData?.events?.length > 0;

  if (!countryName) {
    return (
      <div>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingContent}>
            <div style={styles.loadingText}>No country specified</div>
          </div>
        </div>
        {activeForm && (








  <div className="modal-overlay" onClick={() => setActiveForm(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Modal Header */}
      <div style={styles.modalHeader}>
        <h3>{activeForm.form_title}</h3>
        <button 
          onClick={() => setActiveForm(null)} 
          style={styles.modalCloseButton}
        >
          <X size={20} />
        </button>
      </div>

      {/* Embedded Google Form */}
      <iframe
        src={`${activeForm.form_url}?embedded=true`}
        title={activeForm.form_title}
        style={{ width: "100%", height: "600px", border: "none", borderRadius: "8px" }}
      />
    </div>
    {/* Active Google Form Modal */}
{activeForm && (
  <div className="modal-overlay" onClick={() => setActiveForm(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Modal Header */}
      <div style={styles.modalHeader}>
        <h3>{activeForm.form_title}</h3>
        <button 
          onClick={() => setActiveForm(null)} 
          style={styles.modalCloseButton}
        >
          <X size={20} />
        </button>
      </div>

      {/* Embedded Google Form */}
      <iframe
        src={`${activeForm.form_url}?embedded=true`}
        title={activeForm.form_title}
        style={{ width: "100%", height: "600px", border: "none", borderRadius: "8px" }}
      />
    </div>
  </div>
)}

  </div>
)}

        <Footer />
      </div>
    );
  }

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

  if (error) {
    return (
      <div>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingContent}>
            <div style={styles.loadingText}>Error: {error}</div>
            <button onClick={() => window.location.reload()} style={{marginTop: '16px', padding: '8px 16px'}}>
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
// Normalize volunteerForms so it's always an array
const volunteerForms = Array.isArray(countryData?.volunteerForms)
  ? countryData.volunteerForms
  : countryData?.volunteerForms
    ? [countryData.volunteerForms]
    : [];

  const stats = [
    { label: 'Team Members', value: countryData?.team?.length || 0, icon: Users },
    { label: 'Active Projects', value: countryData?.projects?.filter(p => p.status === 'ongoing' || p.status === 'planning')?.length || 0, icon: Zap },
    { label: 'Upcoming Events', value: countryData?.events?.filter(e => getEventStatus(e.start_date, e.end_date) === 'upcoming')?.length || 0, icon: Calendar },
{ label: 'Volunteer Opportunities', value: volunteerForms.filter(f => f.is_active).length, icon: Heart, onClick: openVolunteersModal },
    { label: 'Payment Methods', value: countryData?.transactionMethods?.length || 0, icon: DollarSign }
  ];

  // DEBUG: Log rendering conditions
  console.log('🎯 RENDERING DEBUG:');
  console.log('- countryData:', countryData);
  console.log('- countryData.volunteerForms:', countryData.volunteerForms);
  console.log('- countryData.countryNews:', countryData.countryNews);
  console.log('- volunteerForms exists?', !!countryData.volunteerForms);
  console.log('- volunteerForms length:', countryData.volunteerForms?.length);
  console.log('- countryNews exists?', !!countryData.countryNews);
  console.log('- countryNews length:', countryData.countryNews?.length);
  console.log('- countryNews > 0?', countryData.countryNews && countryData.countryNews.length > 0);

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

          .news-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          }

          .volunteer-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          }

          .volunteer-button:hover {
            background: #0f5132 !important;
            transform: translateY(-1px) !important;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease-out;
          }

          .modal-content {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideInUp 0.3s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideInUp {
            from { 
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
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

            .modal-content {
              width: 95%;
              max-height: 95vh;
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

            .news-grid {
              grid-template-columns: 1fr !important;
            }

            .volunteer-grid {
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
                <div 
                  key={index} 
                  style={{
                    ...styles.statCard,
                    cursor: stat.onClick ? 'pointer' : 'default'
                  }} 
                  className="stat-card"
                  onClick={stat.onClick}
                >
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

        {/* Volunteers Modal */}
        {volunteersModalOpen && (
          <div className="modal-overlay" onClick={closeVolunteersModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderContent}>
                  <Heart style={styles.modalIcon} />
                  <div>
                    <h2 style={styles.modalTitle}>
                      Volunteer Opportunities in {countryName}
                    </h2>
                    <p style={styles.modalSubtitle}>
                      Join us in making a difference. Explore volunteer opportunities available in your area.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeVolunteersModal} 
                  style={styles.modalCloseButton}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={styles.modalBody}>
{volunteerForms.length > 0 ? (
                  <div style={styles.modalVolunteerGrid}>
    {volunteerForms.map((form) => (
                      <div
                        key={form.id}
                        style={styles.modalVolunteerCard}
                      >
                        <div style={styles.modalVolunteerContent}>
                          <h3 style={styles.modalVolunteerTitle}>{form.form_title}</h3>

                          {form.description && (
                            <p style={styles.modalVolunteerDescription}>
                              {form.description}
                            </p>
                          )}

                          <div style={styles.modalVolunteerMeta}>
                            <div style={styles.modalVolunteerStatus}>
                              <Chip
                                label={form.is_active ? "Active" : "Inactive"}
                                color={form.is_active ? "success" : "default"}
                                size="small"
                              />
                            </div>
                          </div>

                          {form.is_active && (
                            <div style={styles.modalVolunteerActions}>
                             <button
  onClick={() => setActiveForm(form)}
  style={styles.modalVolunteerButton}
  className="volunteer-button"
>
  <ExternalLink size={16} />
  Apply Now
</button>

                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.modalEmptyState}>
                    <Heart size={48} style={styles.modalEmptyIcon} />
                    <h3 style={styles.modalEmptyTitle}>No Volunteer Opportunities Yet</h3>
                    <p style={styles.modalEmptyText}>
                      We're currently setting up volunteer opportunities in {countryName}. 
                      Check back soon or contact us to learn about upcoming opportunities.
                    </p>
                    <button 
                      onClick={closeVolunteersModal}
                      style={styles.modalEmptyButton}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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

          {/* Country-Specific News Section - FIXED CONDITION */}
          {countryData && countryData.countryNews && Array.isArray(countryData.countryNews) && countryData.countryNews.length > 0 && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <Globe style={styles.sectionIcon} />
                <div>
                  <h2 style={styles.sectionTitle}>Latest News from {countryName}</h2>
                  <p style={styles.sectionSubtitle}>
                    Stay updated with the latest developments and announcements.
                  </p>
                </div>
              </div>

              <div style={styles.newsGrid} className="news-grid">
                {countryData.countryNews.map(article => (
                  <div
                    key={article.id}
                    style={styles.newsCard}
                    className="news-card"
                    onClick={() => navigate(`/news/${article.id}`)}



                  >
                    {article.featured_image && (
                      <div style={styles.newsImage}>
                        <img 
                          src={article.featured_image.startsWith('http') 
                            ? article.featured_image 
                            : `${STATIC_URL}${article.featured_image}`}
                          alt={article.title}
                          style={styles.newsImageImg}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={styles.newsContent}>
                      <h3 style={styles.newsTitle}>{article.title}</h3>
                      {article.excerpt && (
                        <p style={styles.newsExcerpt}>
                          {article.excerpt.length > 120
                            ? `${article.excerpt.substring(0, 120)}...`
                            : article.excerpt}
                        </p>
                      )}
                      
                      <div style={styles.newsMeta}>
                        <div style={styles.newsMetaItem}>
                          <Calendar size={14} />
                          <span>{formatDate(article.created_at)}</span>
                        </div>
                        {article.author_name && (
                          <div style={styles.newsMetaItem}>
                            <span>{article.author_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

{/* Compact Premium Team Grid Carousel */}
{countryData?.team && countryData.team.length > 0 && (
  <section style={{ padding: "3rem 1rem", position: "relative" }}>
    {/* Header */}
    <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
      <span style={{
        display: "inline-block", padding: "0.3rem 1rem",
        background: "rgba(99,102,241,0.08)", borderRadius: "20px",
        fontSize: "0.75rem", fontWeight: 600, color: "#6366f1"
      }}>Team</span>

      <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.5rem 0" }}>
        Meet {countryName} Team
      </h2>
      <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
        The professionals driving change in {countryName}
      </p>
    </div>

    {/* Carousel */}
    <div style={{ position: "relative", marginTop: "2rem" }}>
      <button
        onClick={() => {
          const c = document.getElementById('team-grid-carousel');
          c.scrollBy({ left: -c.offsetWidth, behavior: 'smooth' });
        }}
        style={{ position: "absolute", left: 0, top: "40%", zIndex: 10 }}
      >←</button>

      <button
        onClick={() => {
          const c = document.getElementById('team-grid-carousel');
          c.scrollBy({ left: c.offsetWidth, behavior: 'smooth' });
        }}
        style={{ position: "absolute", right: 0, top: "40%", zIndex: 10 }}
      >→</button>

      <div
        id="team-grid-carousel"
        style={{ display: "flex", gap: "1rem", overflowX: "auto", scrollBehavior: "smooth" }}
      >
        {countryData.team.map((member, i) => {
          const MAX = 100;
          const isLong = member.bio?.length > MAX;
          const displayedBio = isLong ? member.bio.slice(0, MAX) + "..." : member.bio;

          return (
            <div key={member.id} style={{
              flex: "0 0 300px", padding: "1rem",
              background: "white", borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                {member.image_url ? (
                  <img
                    src={`${STATIC_URL}${member.image_url}`}
                    alt={member.name}
                    style={{ width: "45px", height: "45px", borderRadius: "8px", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width: "45px", height: "45px", borderRadius: "8px",
                    background: "#6366f1", color: "white",
                    display: "flex", justifyContent: "center", alignItems: "center"
                  }}>{member.name[0]}</div>
                )}

                <div style={{ marginLeft: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "0.9rem" }}>{member.name}</h3>
                  <small style={{ color: "#6366f1" }}>{member.position}</small>
                </div>
              </div>

              {/* Bio */}
              <p style={{ fontSize: "0.8rem", color: "#475569" }}>{displayedBio}</p>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {isLong && (
                  <button
                    onClick={() => toggleExpand(member.id, member.bio)}
                    style={{ flex: 1, fontSize: "0.7rem", padding: "0.3rem", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px" }}
                  >More</button>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    style={{ flex: 1, fontSize: "0.7rem", padding: "0.3rem", textAlign: "center", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#64748b" }}
                  >✉️ Email</a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Modal */}
    {activeBio && (
      <div
        onClick={() => setActiveBio(null)}
        style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center"
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ background: "#fff", padding: "2rem", borderRadius: "12px", maxWidth: "500px" }}
        >
          <p>{activeBio}</p>
          <button onClick={() => setActiveBio(null)}>Close</button>
        </div>
      </div>
    )}
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
                    onClick={() => handleProjectClick(project)}
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
                    We're currently gathering more insights for {countryName}. Check back soon!
                  </p>
                </div>
              </div>
            </section>
          )}
{/* Volunteer Opportunities Section */}
{volunteerForms.length > 0 ? (
  <section style={styles.section}>
    <div style={styles.sectionHeader}>
      <Heart style={styles.sectionIcon} />
      <div>
        <h2 style={styles.sectionTitle}>Volunteer Opportunities in {countryName}</h2>
        <p style={styles.sectionSubtitle}>
          Join us in making a difference. Explore volunteer opportunities available in your area.
        </p>
      </div>
    </div>

    <div style={styles.volunteerGrid} className="volunteer-grid">
      {volunteerForms.map((form) => (
        <div key={form.id} style={styles.volunteerCard} className="volunteer-card">
          <div style={styles.volunteerContent}>
            <h3 style={styles.volunteerTitle}>{form.form_title}</h3>

            {form.description && (
              <p style={styles.volunteerDescription}>{form.description}</p>
            )}

            <div style={styles.volunteerMeta}>
              <Chip
                label={form.is_active ? "Active" : "Inactive"}
                color={form.is_active ? "success" : "default"}
                size="small"
              />
            </div>

            {form.is_active && (
              <div style={styles.volunteerActions}>
                <a
                  href={form.form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.volunteerButton}
                  className="volunteer-button"
                >
                  <ExternalLink size={16} />
                  Apply Now
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
) : (
  <section style={styles.section}>
    <div style={styles.sectionHeader}>
      <Heart style={styles.sectionIcon} />
      <div>
        <h2 style={styles.sectionTitle}>Volunteer Opportunities in {countryName}</h2>
        <p style={styles.sectionSubtitle}>
          We're currently setting up volunteer opportunities in {countryName}.
          Check back soon or contact us to learn about upcoming opportunities.
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
                      onClick={() => handleEventClick(event)}
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

export default CountryInfoDisplay;