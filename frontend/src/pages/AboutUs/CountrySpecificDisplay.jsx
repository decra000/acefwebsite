import React, { useState, useEffect, useCallback } from 'react';
import { Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Mail, Phone, Globe, Award, Zap, ExternalLink, Heart, CheckCircle, ChevronDown, MapIcon, X, Briefcase, Eye } from 'lucide-react';
import { useTheme } from '../../theme';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MapContainerWrapper from './MapContainerWrapper';

const CountryInfoDisplay = () => {
  const { countryName } = useParams();
  const navigate = useNavigate();
  const { colors, isDarkMode } = useTheme();
  
  const [countryData, setCountryData] = useState({
    country: null,
    team: [],
    projects: [],
    events: [],
    jobs: [], // Add jobs array
    contact: null,
    transactionMethods: [],
    countryNews: [],
    volunteerForms: []
  });
  const [countryImage, setCountryImage] = useState(null);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState({});
  const [activeBio, setActiveBio] = useState(null);
  const [volunteersModalOpen, setVolunteersModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';

  // Placeholder data for when API data is not available
  const getPlaceholderData = () => ({
    team: [],
    projects: [],
    events: [],
    jobs: [], // Add jobs placeholder
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

  // Fetch country-specific image from gallery
  const fetchCountryImage = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/gallery/protected`);
      if (response.ok) {
        const data = await response.json();
        const images = data.data || [];
        
        // Find country-specific image
        const countrySpecificImage = images.find(img => 
          img.category === 'country_images' && 
          img.country_name === countryName
        );
        
        if (countrySpecificImage) {
          setCountryImage(countrySpecificImage);
        }
      }
    } catch (err) {
      console.error('Error fetching country image:', err);
    }
  }, [countryName, API_BASE]);

  // Job navigation handler
  const handleJobClick = (job) => {
    navigate(`/jobs/${job.id}`, { 
      state: { 
        job,
        from: `/country/${countryName}`,
        fromPath: `/country/${countryName}`
      }
    });
  };

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
    setActiveBio(bio);
  };

  // Volunteers modal handlers
  const openVolunteersModal = () => {
    setVolunteersModalOpen(true);
  };

  const closeVolunteersModal = () => {
    setVolunteersModalOpen(false);
  };

  // Enhanced fetchCountryData function with jobs
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
      
      // Fetch countries to get the country code
      const countriesRes = await fetch(`${API_BASE}/countries`).catch(() => ({ ok: false }));
      
      let country = null;
      let countryIdentifier = countryName;
      let allCountries = [];

      if (countriesRes.ok) {
        try {
          const countriesData = await countriesRes.json();
          const countries = Array.isArray(countriesData) ? countriesData : countriesData.data || [];
          allCountries = countries.map(c => c.name).sort();
          setAvailableCountries(allCountries);
          
          country = countries.find(c => c.name === countryName);
          if (country) {
            const countryCode = country.code || country.country_code || country.iso_code || country.alpha2;
            if (countryCode) {
              countryIdentifier = countryCode;
              console.log(`Using country code: ${countryCode} for ${countryName}`);
            } else {
              console.log(`No country code found, using country name: ${countryName}`);
            }
          } else {
            console.warn(`Country "${countryName}" not found in countries list, using name directly`);
          }
        } catch (e) {
          console.warn('Failed to parse countries data:', e);
        }
      }

      // Fetch all data in parallel including jobs
      const [teamRes, projectsRes, eventsRes, jobsRes, contactsRes, transactionRes, newsRes, volunteerFormsRes] = await Promise.all([
        fetch(`${API_BASE}/team`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/projects`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/events`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/jobs`).catch(() => ({ ok: false })), // Add jobs API call
        fetch(`${API_BASE}/country-contacts`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/transaction-details`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/blogs/news/country/${encodeURIComponent(countryIdentifier)}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/volunteer-forms/country/${encodeURIComponent(countryName)}`).catch(() => ({ ok: false }))
      ]);

      let team = [];
      let projects = [];
      let events = [];
      let jobs = []; // Initialize jobs array
      let contact = null;
      let transactionMethods = [];
      let countryNews = [];
      let volunteerForms = [];

      // Process jobs data
      if (jobsRes.ok) {
        try {
          const jobsData = await jobsRes.json();
          const allJobs = Array.isArray(jobsData) ? jobsData : jobsData.jobs || jobsData.data || [];
          
          // Filter jobs for the specific country and exclude expired ones
          jobs = allJobs.filter(job => {
            const isFromCountry = job.country === countryName || 
                                 job.countryName === countryName ||
                                 job.location?.includes(countryName);
            
            // Check if job is still open (not expired)
            const isOpen = job.lastDate ? new Date(job.lastDate) >= new Date() : true;
            
            return isFromCountry && isOpen;
          });
          
          console.log(`Active jobs for ${countryName}:`, jobs.length);
        } catch (e) {
          console.warn('Failed to parse jobs data:', e);
          jobs = [];
        }
      }

      // Process country-specific news
      if (newsRes.ok) {
        try {
          const newsData = await newsRes.json();
          if (newsData.success && newsData.data) {
            countryNews = Array.isArray(newsData.data) ? newsData.data : [];
          } else if (Array.isArray(newsData)) {
            countryNews = newsData;
          } else {
            countryNews = [];
          }
          console.log(`News articles for ${countryName}:`, countryNews.length);
        } catch (e) {
          console.error('Failed to parse news data:', e);
          countryNews = [];
        }
      }

      // Process volunteer forms
      if (volunteerFormsRes.ok) {
        try {
          const formsData = await volunteerFormsRes.json();
          volunteerForms = Array.isArray(formsData) ? formsData : formsData.data || [];
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
        countryCode: countryIdentifier,
        team: team || [],
        projects: projects || [],
        events: events || [],
        jobs: jobs || [], // Include jobs in final data
        contact: contact || placeholderData.contact,
        countryNews: countryNews || [],
        volunteerForms: volunteerForms || [],
        transactionMethods: transactionMethods || []
      };

      setCountryData(finalData);

      console.log('Final country data summary:', {
        countryName,
        countryIdentifier,
        jobsLength: finalData.jobs.length,
        newsLength: finalData.countryNews.length,
        formsLength: finalData.volunteerForms.length,
        teamLength: finalData.team.length,
        projectsLength: finalData.projects.length
      });

    } catch (err) {
      console.error('Error fetching country data:', err);
      setError('Failed to load country information');
      const placeholderData = getPlaceholderData();
      setCountryData({
        country: null,
        countryCode: null,
        team: [],
        projects: [],
        events: [],
        jobs: [], // Include jobs in error state
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
      fetchCountryImage();
    } else {
      setError('No country specified');
      setLoading(false);
    }
  }, [countryName, fetchCountryData, fetchCountryImage]);

  // Handle country selection from dropdown
  const handleCountrySelect = (selectedCountry) => {
    setDropdownOpen(false);
    if (selectedCountry !== countryName) {
      navigate(`/country/${encodeURIComponent(selectedCountry)}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

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

  // Get country image URL with fallback
  const getCountryImageUrl = () => {
    if (countryImage?.image_url) {
      return countryImage.image_url.startsWith('http') 
        ? countryImage.image_url 
        : `${STATIC_URL}${countryImage.image_url}`;
    }
    // Fallback to a default background gradient
    return null;
  };

  // Check if we have real data or just placeholders
  const hasRealData = countryData?.team?.length > 0 || 
                      countryData?.projects?.length > 0 || 
                      countryData?.events?.length > 0 ||
                      countryData?.jobs?.length > 0; // Include jobs in real data check

  // Create dynamic styles using theme colors
  const dynamicStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: '"Nunito Sans", sans-serif',
    },
    
    stickyHeader: {
      position: 'sticky',
      top: '0',
      zIndex: '100',
      background: `${colors.headerBg}95`,
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${colors.border}`,
      padding: '1rem 0'
    },

    heroSection: {
      background: getCountryImageUrl() 
        ? `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%), url(${getCountryImageUrl()})`
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 50%, ${colors.secondary}20 100%)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: colors.white,
      position: 'relative',
      overflow: 'hidden'
    },

    statCard: {
      background: colors.cardBg,
      borderRadius: '16px',
      padding: '1.5rem',
      border: `1px solid ${colors.border}`,
      boxShadow: `0 4px 6px ${colors.cardShadow}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },

    sectionTitle: {
      fontSize: '2.25rem',
      fontWeight: '700',
      color: colors.text,
      margin: '0 0 0.5rem 0',
      lineHeight: '1.2'
    },

    newsCard: {
      background: colors.cardBg,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: `0 4px 6px ${colors.cardShadow}`,
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },

    jobCard: {
      background: colors.cardBg,
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: `0 4px 6px ${colors.cardShadow}`,
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }
  };

  if (!countryName) {
    return (
      <div>
        <Header />
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: colors.text
          }}>
            <div>No country specified</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '1rem'
            }}>
              Discovering {countryName}...
            </div>
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
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '500',
              color: colors.error,
              marginBottom: '1rem'
            }}>
              Error: {error}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const volunteerForms = Array.isArray(countryData?.volunteerForms)
    ? countryData.volunteerForms
    : countryData?.volunteerForms
      ? [countryData.volunteerForms]
      : [];

  return (
    <div style={dynamicStyles.container}>
      <Header />
      
      {/* Add spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Sticky Country Header */}
      <div style={dynamicStyles.stickyHeader}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <button 
            onClick={handleBack} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1'
          }}>
            <MapIcon size={20} style={{ color: colors.primary }} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: colors.text,
              margin: '0'
            }}>
              {countryName}
            </h2>
          </div>
          
          <button 
            onClick={handleExplore} 
            style={{
              padding: '0.5rem 1rem',
              background: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Explore All
          </button>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        {/* Hero Section */}
        <section style={dynamicStyles.heroSection}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '120px 32px 80px',
            textAlign: 'center',
            position: 'relative',
            zIndex: '2'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '3rem' }}>🌍</div>
              <h1 style={{
                fontSize: '4rem',
                fontWeight: '800',
                margin: '0',
                color: colors.white,
                letterSpacing: '-0.02em'
              }}>
                {countryName}
              </h1>
            </div>
            <p style={{
              fontSize: '1.5rem',
              color: colors.white,
              opacity: 0.95,
              marginBottom: '2rem',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.5'
            }}>
              See our impact in {countryName} through sustainable development and community empowerment initiatives that create lasting change.
            </p>
          </div>
        </section>

        {/* Main Content Container */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          
          {/* Content Coming Soon Placeholder */}
          {!hasRealData && (
            <section style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                maxWidth: '600px',
                textAlign: 'center',
                background: colors.surface,
                borderRadius: '16px',
                padding: '3rem',
                boxShadow: `0 4px 6px ${colors.cardShadow}`
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🤝</div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: '1rem'
                }}>
                  Content Coming Soon
                </h2>
                <p style={{
                  fontSize: '1.125rem',
                  color: colors.textSecondary,
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  We're currently gathering detailed information about our operations in {countryName}. 
                  Check back soon for updates on our team, projects, and local initiatives.
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '2rem'
                }}>
                  <button 
                    onClick={handleExplore} 
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: colors.primary,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Explore Other Countries
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Job Opportunities Section */}
          {countryData.jobs && countryData.jobs.length > 0 && (
            <section style={{ padding: '4rem 0', position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '2.5rem',
                maxWidth: '800px'
              }}>
                <Briefcase style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: colors.primary,
                  marginTop: '0.25rem',
                  flexShrink: '0'
                }} />
                <div>
                  <h2 style={dynamicStyles.sectionTitle}>
                    Career Opportunities in {countryName}
                  </h2>
                  <p style={{
                    fontSize: '1.125rem',
                    color: colors.textSecondary,
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    Join our team and make a meaningful impact in {countryName}. Explore current openings.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {countryData.jobs.map(job => (
                  <div
                    key={job.id}
                    style={dynamicStyles.jobCard}
                    onClick={() => handleJobClick(job)}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '0.5rem',
                        lineHeight: '1.4'
                      }}>
                        {job.title}
                      </h3>
                      
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '1rem'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          gap: '4px',
                          background: colors.primary,
                          color: colors.white
                        }}>
                          {job.level}
                        </span>
                        
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          gap: '4px',
                          background: colors.backgroundSecondary,
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}>
                          <MapPin size={12} />
                          {job.location}
                        </span>

                        {job.salary && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            gap: '4px',
                            background: colors.success,
                            color: colors.white
                          }}>
                            <DollarSign size={12} />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{
                      color: colors.textSecondary,
                      lineHeight: 1.6,
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.description && job.description.length > 150
                        ? `${job.description.substring(0, 150)}...`
                        : job.description || 'Join our team and contribute to meaningful projects that create positive impact in the community.'}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: `1px solid ${colors.border}`
                    }}>
                      <div style={{ 
                        fontSize: '12px',
                        color: colors.textMuted,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Calendar size={12} />
                        Apply by {formatDate(job.lastDate)}
                      </div>

                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          padding: '6px 12px',
                          background: 'transparent',
                          border: `2px solid ${colors.primary}`,
                          color: colors.primary,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
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
                        <Eye size={12} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Country-Specific News Section */}
          {countryData && countryData.countryNews && Array.isArray(countryData.countryNews) && countryData.countryNews.length > 0 && (
            <section style={{ padding: '4rem 0', position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '2.5rem',
                maxWidth: '800px'
              }}>
                <Globe style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: colors.primary,
                  marginTop: '0.25rem',
                  flexShrink: '0'
                }} />
                <div>
                  <h2 style={dynamicStyles.sectionTitle}>Latest News from {countryName}</h2>
                  <p style={{
                    fontSize: '1.125rem',
                    color: colors.textSecondary,
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    Stay updated with the latest developments and announcements.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {countryData.countryNews.map(article => (
                  <div
                    key={article.id}
                    style={dynamicStyles.newsCard}
                    onClick={() => navigate(`/news/${article.id}`)}
                  >
                    {article.featured_image && (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={article.featured_image.startsWith('http') 
                            ? article.featured_image 
                            : `${STATIC_URL}${article.featured_image}`}
                          alt={article.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '0.75rem',
                        lineHeight: '1.4'
                      }}>
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p style={{
                          color: colors.textSecondary,
                          lineHeight: '1.6',
                          marginBottom: '1rem'
                        }}>
                          {article.excerpt.length > 120
                            ? `${article.excerpt.substring(0, 120)}...`
                            : article.excerpt}
                        </p>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: colors.textMuted
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Calendar size={14} />
                          <span>{formatDate(article.created_at)}</span>
                        </div>
                        {article.author_name && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
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

          {/* Map Section */}
          <MapContainerWrapper 
            countryName={countryName}
            countryData={countryData}
            styles={dynamicStyles}
          />

          {/* Team Section */}
          {countryData?.team && countryData.team.length > 0 && (
            <section style={{ padding: '3rem 1rem', position: 'relative' }}>
              <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                textAlign: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.3rem 1rem',
                  background: `${colors.primary}15`,
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: colors.primary
                }}>
                  Team
                </span>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  margin: '0.5rem 0',
                  color: colors.text
                }}>
                  Meet {countryName} Team
                </h2>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: '0.95rem'
                }}>
                  The professionals driving change in {countryName}
                </p>
              </div>

              <div style={{ position: 'relative', marginTop: '2rem' }}>
                <div
                  id="team-grid-carousel"
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    paddingBottom: '1rem'
                  }}
                >
                  {countryData.team.map((member, i) => {
                    const MAX = 100;
                    const isLong = member.bio?.length > MAX;
                    const displayedBio = isLong ? member.bio.slice(0, MAX) + "..." : member.bio;

                    return (
                      <div key={member.id} style={{
                        flex: '0 0 300px',
                        padding: '1rem',
                        background: colors.cardBg,
                        borderRadius: '12px',
                        boxShadow: `0 4px 12px ${colors.cardShadow}`,
                        border: `1px solid ${colors.border}`
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          {member.image_url ? (
                            <img
                              src={`${STATIC_URL}${member.image_url}`}
                              alt={member.name}
                              style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '8px',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '8px',
                              background: colors.primary,
                              color: colors.white,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              {member.name[0]}
                            </div>
                          )}

                          <div style={{ marginLeft: '0.5rem' }}>
                            <h3 style={{
                              margin: '0',
                              fontSize: '0.9rem',
                              color: colors.text
                            }}>
                              {member.name}
                            </h3>
                            <small style={{ color: colors.primary }}>
                              {member.position}
                            </small>
                          </div>
                        </div>

                        <p style={{
                          fontSize: '0.8rem',
                          color: colors.textSecondary
                        }}>
                          {displayedBio}
                        </p>

                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          {isLong && (
                            <button
                              onClick={() => toggleExpand(member.id, member.bio)}
                              style={{
                                flex: '1',
                                fontSize: '0.7rem',
                                padding: '0.3rem',
                                background: colors.primary,
                                color: colors.white,
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              More
                            </button>
                          )}
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              style={{
                                flex: '1',
                                fontSize: '0.7rem',
                                padding: '0.3rem',
                                textAlign: 'center',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                textDecoration: 'none',
                                color: colors.textSecondary,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              📧 Email
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bio Modal */}
              {activeBio && (
                <div
                  onClick={() => setActiveBio(null)}
                  style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    background: colors.overlayBg,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '1000'
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: colors.surface,
                      padding: '2rem',
                      borderRadius: '12px',
                      maxWidth: '500px',
                      color: colors.text
                    }}
                  >
                    <p>{activeBio}</p>
                    <button 
                      onClick={() => setActiveBio(null)}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: colors.primary,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Volunteer Opportunities Section */}
          {volunteerForms.length > 0 ? (
            <section style={{ padding: '4rem 0', position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '2.5rem',
                maxWidth: '800px'
              }}>
                <Heart style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: colors.primary,
                  marginTop: '0.25rem',
                  flexShrink: '0'
                }} />
                <div>
                  <h2 style={dynamicStyles.sectionTitle}>Volunteer Opportunities in {countryName}</h2>
                  <p style={{
                    fontSize: '1.125rem',
                    color: colors.textSecondary,
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    Join us in making a difference. Explore volunteer opportunities available in your area.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {volunteerForms.map((form) => (
                  <div key={form.id} style={{
                    background: colors.cardBg,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: `0 4px 6px ${colors.cardShadow}`,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '0.75rem'
                      }}>
                        {form.form_title}
                      </h3>

                      {form.description && (
                        <p style={{
                          color: colors.textSecondary,
                          lineHeight: '1.6',
                          marginBottom: '1rem',
                          flex: '1'
                        }}>
                          {form.description}
                        </p>
                      )}

                      <div style={{ marginBottom: '1rem' }}>
                        <Chip
                          label={form.is_active ? "Active" : "Inactive"}
                          color={form.is_active ? "success" : "default"}
                          size="small"
                        />
                      </div>

                      {form.is_active && (
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => setActiveForm(form)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem 1.25rem',
                              background: colors.primary,
                              color: colors.white,
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                              border: 'none',
                              cursor: 'pointer'
                            }}
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
            </section>
          ) : (
            <section style={{ padding: '4rem 0', position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '2.5rem',
                maxWidth: '800px'
              }}>
                <Heart style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: colors.primary,
                  marginTop: '0.25rem',
                  flexShrink: '0'
                }} />
                <div>
                  <h2 style={dynamicStyles.sectionTitle}>Volunteer Opportunities in {countryName}</h2>
                  <p style={{
                    fontSize: '1.125rem',
                    color: colors.textSecondary,
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    We're currently setting up volunteer opportunities in {countryName}.
                    Check back soon or contact us to learn about upcoming opportunities.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Events Section */}
          {countryData.events && countryData.events.length > 0 && (
            <section style={{ padding: '4rem 0', position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '2.5rem',
                maxWidth: '800px'
              }}>
                <Calendar style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: colors.primary,
                  marginTop: '0.25rem',
                  flexShrink: '0'
                }} />
                <div>
                  <h2 style={dynamicStyles.sectionTitle}>{countryName} Events</h2>
                  <p style={{
                    fontSize: '1.125rem',
                    color: colors.textSecondary,
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    Join us at upcoming events and community gatherings.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {countryData.events.map(event => {
                  const status = getEventStatus(event.start_date, event.end_date);
                  return (
                    <div
                      key={event.id}
                      style={{
                        background: colors.cardBg,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: `0 4px 6px ${colors.cardShadow}`,
                        border: `1px solid ${colors.border}`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div style={{ height: '100%' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.75rem',
                          gap: '1rem'
                        }}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: colors.text,
                            margin: '0',
                            lineHeight: '1.4'
                          }}>
                            {event.title}
                          </h3>

                          {event.is_paid ? (
                            <div style={{
                              padding: '0.25rem 0.75rem',
                              background: '#fee2e2',
                              color: '#dc2626',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              flexShrink: '0'
                            }}>
                              {event.currency} {parseFloat(event.price).toFixed(2)}
                            </div>
                          ) : (
                            <div style={{
                              padding: '0.25rem 0.75rem',
                              background: '#dcfce7',
                              color: '#16a34a',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              flexShrink: '0'
                            }}>
                              Free
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p style={{
                            color: colors.textSecondary,
                            lineHeight: '1.6',
                            marginBottom: '1rem'
                          }}>
                            {event.description.length > 150
                              ? `${event.description.substring(0, 150)}...`
                              : event.description}
                          </p>
                        )}

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          color: colors.textMuted
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Calendar size={14} />
                            <span>
                              {formatDateTime(event.start_date)}
                              {event.end_date && ` - ${formatDateTime(event.end_date)}`}
                            </span>
                          </div>
                          {event.location && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
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

          {/* Projects Section */}
          {countryData.projects && countryData.projects.length > 0 && (
            <section style={{ padding: '4rem 0', position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '2.5rem',
                maxWidth: '800px'
              }}>
                <Award style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  color: colors.primary,
                  marginTop: '0.25rem',
                  flexShrink: '0'
                }} />
                <div>
                  <h2 style={dynamicStyles.sectionTitle}>Projects in {countryName}</h2>
                  <p style={{
                    fontSize: '1.125rem',
                    color: colors.textSecondary,
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    Transformative initiatives making a real difference.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {countryData.projects.map(project => (
                  <div
                    key={project.id}
                    style={{
                      background: colors.cardBg,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: `0 4px 6px ${colors.cardShadow}`,
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleProjectClick(project)}
                  >
                    {project.featured_image && (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img 
                          src={project.featured_image.startsWith('http') 
                            ? project.featured_image 
                            : `${STATIC_URL}${project.featured_image}`}
                          alt={project.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {project.status && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: project.status === 'completed' ? 'rgba(34, 197, 94, 0.9)' :
                                       project.status === 'ongoing' ? 'rgba(59, 130, 246, 0.9)' :
                                       project.status === 'planning' ? 'rgba(245, 158, 11, 0.9)' :
                                       'rgba(156, 163, 175, 0.9)',
                            color: 'white'
                          }}>
                            {project.status === 'completed' && (
                              <CheckCircle style={{ width: '14px', height: '14px' }} />
                            )}
                            {project.status.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '0.75rem',
                        lineHeight: '1.4'
                      }}>
                        {project.title}
                      </h3>
                      <p style={{
                        color: colors.textSecondary,
                        lineHeight: '1.6',
                        marginBottom: '1rem'
                      }}>
                        {project.short_description || 
                         (project.description && project.description.substring(0, 150) + '...') ||
                         'This project is designed to create meaningful impact in the community.'}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: colors.textMuted
                      }}>
                        {project.location && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <MapPin size={14} />
                            <span>{project.location}</span>
                          </div>
                        )}
                        {project.start_date && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
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
          )}

          {/* Contact Section */}
          <section style={{ padding: '4rem 0', position: 'relative' }}>
            <div style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent 0%, ${colors.border} 50%, transparent 100%)`,
              marginBottom: '2rem'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              marginBottom: '2.5rem',
              maxWidth: '800px'
            }}>
              <Mail style={{
                width: '1.5rem',
                height: '1.5rem',
                color: colors.primary,
                marginTop: '0.25rem',
                flexShrink: '0'
              }} />
              <div>
                <h2 style={dynamicStyles.sectionTitle}>Get In Touch</h2>
                <p style={{
                  fontSize: '1.125rem',
                  color: colors.textSecondary,
                  margin: '0',
                  lineHeight: '1.6'
                }}>
                  Ready to collaborate or learn more? We'd love to hear from you.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gap: '2rem'
            }}>
              <div style={{
                background: colors.cardBg,
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: `0 4px 6px ${colors.cardShadow}`,
                border: `1px solid ${colors.border}`
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: '1.5rem'
                }}>
                  Contact Information
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {countryData.contact.email && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}>
                      <Mail style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        flexShrink: '0',
                        color: colors.success
                      }} />
                      <div style={{ flex: '1' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: colors.textMuted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.25rem'
                        }}>
                          Email Address
                        </div>
                        <a 
                          href={`mailto:${countryData.contact.email}`}
                          style={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: colors.primary,
                            textDecoration: 'none',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {countryData.contact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {countryData.contact.phone && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}>
                      <Phone style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        flexShrink: '0',
                        color: colors.info
                      }} />
                      <div style={{ flex: '1' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: colors.textMuted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.25rem'
                        }}>
                          Phone Number
                        </div>
                        <a 
                          href={`tel:${countryData.contact.phone}`}
                          style={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: colors.primary,
                            textDecoration: 'none',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {countryData.contact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {countryData.contact.physical_address && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}>
                      <MapPin style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        flexShrink: '0',
                        color: colors.warning
                      }} />
                      <div style={{ flex: '1' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: colors.textMuted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.25rem'
                        }}>
                          Address
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: colors.text
                        }}>
                          {countryData.contact.physical_address}
                        </div>
                        {countryData.contact.city && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: colors.textMuted,
                            marginTop: '0.25rem'
                          }}>
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

      {/* Volunteers Modal */}
      {volunteersModalOpen && (
        <div className="modal-overlay" onClick={closeVolunteersModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '1.5rem',
              borderBottom: `1px solid ${colors.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <Heart style={{
                  width: '24px',
                  height: '24px',
                  color: colors.primary,
                  marginTop: '2px'
                }} />
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: colors.text,
                    margin: '0 0 0.5rem 0'
                  }}>
                    Volunteer Opportunities in {countryName}
                  </h2>
                  <p style={{
                    color: colors.textSecondary,
                    margin: '0'
                  }}>
                    Join us in making a difference. Explore volunteer opportunities available in your area.
                  </p>
                </div>
              </div>
              <button 
                onClick={closeVolunteersModal} 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {volunteerForms.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '1rem'
                }}>
                  {volunteerForms.map((form) => (
                    <div
                      key={form.id}
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: colors.text,
                          margin: '0'
                        }}>
                          {form.form_title}
                        </h3>

                        {form.description && (
                          <p style={{
                            color: colors.textSecondary,
                            margin: '0'
                          }}>
                            {form.description}
                          </p>
                        )}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Chip
                            label={form.is_active ? "Active" : "Inactive"}
                            color={form.is_active ? "success" : "default"}
                            size="small"
                          />
                        </div>

                        {form.is_active && (
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                          }}>
                            <button
                              onClick={() => setActiveForm(form)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: colors.primary,
                                color: colors.white,
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
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
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem'
                }}>
                  <Heart size={48} style={{
                    color: colors.textMuted,
                    marginBottom: '1rem'
                  }} />
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '0.5rem'
                  }}>
                    No Volunteer Opportunities Yet
                  </h3>
                  <p style={{
                    color: colors.textSecondary,
                    marginBottom: '1.5rem',
                    lineHeight: '1.6'
                  }}>
                    We're currently setting up volunteer opportunities in {countryName}. 
                    Check back soon or contact us to learn about upcoming opportunities.
                  </p>
                  <button 
                    onClick={closeVolunteersModal}
                    style={{
                      padding: '0.5rem 1rem',
                      background: colors.primary,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Google Form Modal */}
      {activeForm && (
        <div className="modal-overlay" onClick={() => setActiveForm(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px', maxHeight: '95vh' }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: `1px solid ${colors.border}`,
              background: colors.surface,
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: colors.text,
                  margin: '0 0 0.25rem 0'
                }}>
                  {activeForm.form_title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  margin: '0'
                }}>
                  Complete the form below to apply for this volunteer opportunity
                </p>
              </div>
              <button 
                onClick={() => setActiveForm(null)} 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  background: colors.backgroundSecondary,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.error;
                  e.target.style.color = colors.white;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = colors.backgroundSecondary;
                  e.target.style.color = colors.textSecondary;
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ 
              background: colors.backgroundSecondary,
              minHeight: '70vh'
            }}>
              <iframe
                src={`${activeForm.form_url}?embedded=true`}
                title={activeForm.form_title}
                style={{
                  width: '100%',
                  height: '70vh',
                  minHeight: '600px',
                  border: 'none',
                  borderRadius: '0 0 16px 16px',
                  background: 'white'
                }}
                allow="clipboard-write"
                loading="lazy"
              />
            </div>
            
            {/* Optional footer with external link */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: `1px solid ${colors.border}`,
              background: colors.surface,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: colors.textMuted
              }}>
                Having trouble with the form? Try opening it in a new tab.
              </div>
              <a
                href={activeForm.form_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}`,
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
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
                <ExternalLink size={14} />
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
      
      <Footer />

      {/* Modal Overlay Styles */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${colors.overlayBg};
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: ${colors.surface};
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px ${colors.cardShadow};
          border: 1px solid ${colors.border};
        }
      `}</style>
    </div>
  );
};

export default CountryInfoDisplay;