import React, { useState, useEffect, useCallback } from 'react';
import { Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Mail, Phone, Globe, Award, Zap, ExternalLink, Heart, CheckCircle, ChevronDown, MapIcon, X, Briefcase, Eye, TrendingUp } from 'lucide-react';
import { useTheme } from '../../theme';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MapContainerWrapper from './MapContainerWrapper';
import './CountrySpecificDisplay.css';


// Default placeholder image
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e3f2fd'/%3E%3Ccircle cx='320' cy='60' r='35' fill='%23ffeb3b'/%3E%3Cpath d='M0 200 Q100 140 200 200 T400 200 V300 H0 Z' fill='%23a5d6a7'/%3E%3Cpath d='M0 230 Q120 170 250 230 T400 230 V300 H0 Z' fill='%238bc34a'/%3E%3Crect x='90' y='150' width='18' height='70' fill='%236d4c41'/%3E%3Ccircle cx='99' cy='140' r='40' fill='%234caf50'/%3E%3Crect x='280' y='160' width='16' height='60' fill='%236d4c41'/%3E%3Ccircle cx='288' cy='145' r='35' fill='%23389e3c'/%3E%3C/svg%3E";

const CountryInfoDisplay = () => {
  const { countryName } = useParams();
  const navigate = useNavigate();
  const { colors, isDarkMode } = useTheme();
  
  const [countryData, setCountryData] = useState({
    country: null,
    team: [],
    projects: [],
    events: [],
    jobs: [],
    contact: null,
    transactionMethods: [],
    countryNews: [],
    recommendedNews: [],
    hasCountrySpecificNews: false,
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

  // Enhanced image URL handler for news
  const getNewsImageUrl = useCallback((imagePath) => {
    if (!imagePath) return DEFAULT_IMAGE;
    
    let cleanPath = imagePath;
    cleanPath = cleanPath.replace(/^\/+/, '');
    
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }
    
    if (cleanPath.includes('uploads/')) {
      return `${STATIC_URL}/${cleanPath}`;
    } else if (cleanPath.includes('blogs/')) {
      return `${STATIC_URL}/uploads/${cleanPath}`;
    } else {
      return `${STATIC_URL}/uploads/blogs/${cleanPath}`;
    }
  }, [STATIC_URL]);

  // Enhanced news data fetching with fallbacks
  const fetchEnhancedNewsData = useCallback(async (countryName, countryIdentifier) => {
    let countryNews = [];
    let recommendedNews = [];

    try {
      console.log(`Fetching news for ${countryName} with identifier: ${countryIdentifier}`);
      
      // First, try to get country-specific news
      const countryNewsRes = await fetch(`${API_BASE}/blogs/news/country/${encodeURIComponent(countryIdentifier)}`).catch(() => ({ ok: false }));
      
      if (countryNewsRes.ok) {
        const countryNewsData = await countryNewsRes.json();
        if (countryNewsData.success && countryNewsData.data) {
          countryNews = Array.isArray(countryNewsData.data) ? countryNewsData.data : [];
        }
      }

      // If no country-specific news or less than 3 articles, fetch general news as fallback/recommendations
      if (countryNews.length < 3) {
        try {
          const generalNewsRes = await fetch(`${API_BASE}/blogs/news`).catch(() => ({ ok: false }));
          
          if (generalNewsRes.ok) {
            const generalNewsData = await generalNewsRes.json();
            let allGeneralNews = [];
            
            if (Array.isArray(generalNewsData)) {
              allGeneralNews = generalNewsData;
            } else if (generalNewsData.success && generalNewsData.data) {
              allGeneralNews = Array.isArray(generalNewsData.data) ? generalNewsData.data : [];
            } else if (generalNewsData.data) {
              allGeneralNews = Array.isArray(generalNewsData.data) ? generalNewsData.data : [];
            }

            const filteredGeneralNews = allGeneralNews
              .filter(article => !countryNews.some(countryArticle => countryArticle.id === article.id))
              .sort((a, b) => new Date(b.created_at || b.publishedAt) - new Date(a.created_at || a.publishedAt))
              .slice(0, 6);

            if (countryNews.length === 0) {
              countryNews = filteredGeneralNews.slice(0, 3);
              recommendedNews = filteredGeneralNews.slice(3);
            } else {
              recommendedNews = filteredGeneralNews;
            }
          }
        } catch (generalNewsError) {
          console.warn('Failed to fetch general news:', generalNewsError);
        }
      }

      console.log(`News for ${countryName}: ${countryNews.length} country-specific, ${recommendedNews.length} recommended`);
      
      return {
        countryNews,
        recommendedNews,
        hasCountrySpecificNews: countryNews.length > 0 && countryNews.some(article => 
          article.country === countryName || 
          (article.location && article.location.includes(countryName))
        )
      };

    } catch (error) {
      console.error('Error fetching enhanced news data:', error);
      return {
        countryNews: [],
        recommendedNews: [],
        hasCountrySpecificNews: false
      };
    }
  }, [API_BASE]);

  // News navigation handler
  const handleNewsClick = useCallback((article) => {
    if (article.id) {
      navigate(`/news/${article.id}`, { 
        state: { 
          article,
          from: `/country/${countryName}`,
          fromPath: `/country/${countryName}`
        }
      });
    } else {
      navigate(`/blog?article=${article.id || article._id}`);
    }
  }, [navigate, countryName]);

  // Placeholder data for when API data is not available
  const getPlaceholderData = () => ({
    team: [],
    projects: [],
    events: [],
    jobs: [],
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
    recommendedNews: [],
    hasCountrySpecificNews: false,
    volunteerForms: []
  });

  // Fetch country-specific image from gallery
  const fetchCountryImage = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/gallery/protected`);
      if (response.ok) {
        const data = await response.json();
        const images = data.data || [];
        
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

  // Enhanced fetchCountryData function with improved news handling
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

      // Fetch all data in parallel
      const [teamRes, projectsRes, eventsRes, jobsRes, contactsRes, transactionRes, volunteerFormsRes] = await Promise.all([
        fetch(`${API_BASE}/team`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/projects`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/events`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/jobs`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/country-contacts`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/transaction-details`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/volunteer-forms/country/${encodeURIComponent(countryName)}`).catch(() => ({ ok: false }))
      ]);

      let team = [];
      let projects = [];
      let events = [];
      let jobs = [];
      let contact = null;
      let transactionMethods = [];
      let volunteerForms = [];

      // Process jobs data
      if (jobsRes.ok) {
        try {
          const jobsData = await jobsRes.json();
          const allJobs = Array.isArray(jobsData) ? jobsData : jobsData.jobs || jobsData.data || [];
          
          jobs = allJobs.filter(job => {
            const isFromCountry = job.country === countryName || 
                                 job.countryName === countryName ||
                                 job.location?.includes(countryName);
            
            const isOpen = job.lastDate ? new Date(job.lastDate) >= new Date() : true;
            
            return isFromCountry && isOpen;
          });
          
          console.log(`Active jobs for ${countryName}:`, jobs.length);
        } catch (e) {
          console.warn('Failed to parse jobs data:', e);
          jobs = [];
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

      // Enhanced news data fetching
      const newsData = await fetchEnhancedNewsData(countryName, countryIdentifier);

      // Use placeholder data if no real data is available
      const placeholderData = getPlaceholderData();
      
      const finalData = {
        country,
        countryCode: countryIdentifier,
        team: team || [],
        projects: projects || [],
        events: events || [],
        jobs: jobs || [],
        contact: contact || placeholderData.contact,
        countryNews: newsData.countryNews || [],
        recommendedNews: newsData.recommendedNews || [],
        hasCountrySpecificNews: newsData.hasCountrySpecificNews,
        volunteerForms: volunteerForms || [],
        transactionMethods: transactionMethods || []
      };

      setCountryData(finalData);

      console.log('Final country data summary:', {
        countryName,
        countryIdentifier,
        jobsLength: finalData.jobs.length,
        countryNewsLength: finalData.countryNews.length,
        recommendedNewsLength: finalData.recommendedNews.length,
        hasCountrySpecificNews: finalData.hasCountrySpecificNews,
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
        jobs: [],
        contact: placeholderData.contact,
        transactionMethods: [],
        countryNews: [],
        recommendedNews: [],
        hasCountrySpecificNews: false,
        volunteerForms: []
      });
    } finally {
      setLoading(false);
    }
  }, [countryName, API_BASE, fetchEnhancedNewsData]);

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
    return null;
  };

  // Check if we have real data or just placeholders
  const hasRealData = countryData?.team?.length > 0 || 
                      countryData?.projects?.length > 0 || 
                      countryData?.events?.length > 0 ||
                      countryData?.jobs?.length > 0 ||
                      countryData?.countryNews?.length > 0;

  if (!countryName) {
    return (
      <div>
        <Header />
        <div className="country-error-container">
          <div className="error-content">
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
        <div className="country-loading-container">
          <div className="loading-content">
            <div className="loading-spinner" />
            <div className="loading-text">
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
        <div className="country-error-container">
          <div className="error-content">
            <div className="error-message">
              Error: {error}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
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
    <div className="country-container">
      <Header />
      
      {/* Sticky Country Header */}
      <div className="sticky-header">
        <div className="sticky-header-content">
          <button 
            onClick={handleBack} 
            className="back-button"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="header-info">
            <MapIcon size={20} className="header-icon" />
            <h2 className="header-title">{countryName}</h2>
          </div>
          
          <button 
            onClick={handleExplore} 
            className="explore-button"
          >
            Explore All
          </button>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          backgroundImage: getCountryImageUrl() 
            ? `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%), url(${getCountryImageUrl()})`
            : undefined
        }}
      >
        <div className="hero-pattern" />
        <div className="hero-content">
          <motion.div 
            className="hero-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="country-flag">🌍</div>
            <h1 className="hero-title">{countryName}</h1>
          </motion.div>
          
          <motion.p 
            className="hero-description"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover our transformative impact in {countryName} through sustainable development, 
            community empowerment, and environmental initiatives that create lasting positive change 
            for current and future generations.
          </motion.p>
          
          {/* Enhanced Stats Cards */}
          <motion.div 
            className="stats-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {countryData.projects?.length > 0 && (
              <div className="stat-card">
                <div className="stat-number">{countryData.projects.length}</div>
                <div className="stat-label">Active Projects</div>
              </div>
            )}
            
            {countryData.team?.length > 0 && (
              <div className="stat-card">
                <div className="stat-number">{countryData.team.length}</div>
                <div className="stat-label">Team Members</div>
              </div>
            )}
            
            {countryData.jobs?.length > 0 && (
              <div className="stat-card">
                <div className="stat-number">{countryData.jobs.length}</div>
                <div className="stat-label">Open Positions</div>
              </div>
            )}
            
            {(countryData.countryNews?.length > 0 || countryData.recommendedNews?.length > 0) && (
              <div className="stat-card">
                <div className="stat-number">
                  {(countryData.countryNews?.length || 0) + (countryData.recommendedNews?.length || 0)}
                </div>
                <div className="stat-label">News Updates</div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Content Coming Soon Placeholder */}
        {!hasRealData && (
          <motion.section 
            className="coming-soon-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="coming-soon-card">
              <div className="coming-soon-icon">🤝</div>
              <h2 className="coming-soon-title">Content Coming Soon</h2>
              <p className="coming-soon-description">
                We're currently gathering detailed information about our operations in {countryName}. 
                Check back soon for updates on our team, projects, and local initiatives.
              </p>
              <button 
                onClick={handleExplore} 
                className="coming-soon-button"
              >
                Explore Other Countries
              </button>
            </div>
          </motion.section>
        )}

        {/* News Section Grid Layout */}
        {countryData && (countryData.countryNews?.length > 0 || countryData.recommendedNews?.length > 0) && (
          <motion.section 
            className="news-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-header">
              <Globe className="section-icon" />
              <div>
                <h2 className="section-title">
                  {countryData.hasCountrySpecificNews 
                    ? `Latest News from ${countryName}`
                    : `News & Updates`
                  }
                </h2>
                <p className="section-description">
                  {countryData.hasCountrySpecificNews
                    ? `Stay updated with the latest developments and announcements from ${countryName}.`
                    : `Stay informed with the latest news and developments while we gather more content specific to ${countryName}.`
                  }
                </p>
              </div>
            </div>

            {/* News Grid */}
            <div className="news-grid">
              {(countryData.countryNews || []).map(article => (
                <motion.div
                  key={article.id}
                  className="news-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: '-50px' }}
                  transition={{ duration: 0.5 }}
                  onClick={() => handleNewsClick(article)}
                  whileHover={{ y: -4 }}
                >
                  {article.featured_image && (
                    <div className="news-image">
                      <img 
                        src={getNewsImageUrl(article.featured_image)}
                        alt={article.title}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                          e.target.onerror = null;
                        }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="news-content">
                    {countryData.hasCountrySpecificNews && (
                      <div className="news-badge">
                        {countryName} News
                      </div>
                    )}
                    
                    <h3 className="news-title">{article.title}</h3>
                    
                    {article.excerpt && (
                      <p className="news-excerpt">
                        {article.excerpt.length > 120
                          ? `${article.excerpt.substring(0, 120)}...`
                          : article.excerpt}
                      </p>
                    )}
                    
                    <div className="news-meta">
                      <div className="news-date">
                        <Calendar size={14} />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      {article.author_name && (
                        <div className="news-author">
                          <span>{article.author_name}</span>
                        </div>
                      )}
                      <div className="news-read-more">
                        Read More →
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recommended News Section */}
            {countryData.recommendedNews?.length > 0 && (
              <div className="recommended-news">
                <div className="recommended-header">
                  <TrendingUp className="recommended-icon" />
                  <div>
                    <h3 className="recommended-title">Recommended News</h3>
                    <p className="recommended-subtitle">
                      Other news and updates you might find interesting
                    </p>
                  </div>
                </div>

                <div className="recommended-grid">
                  {countryData.recommendedNews.slice(0, 3).map(article => (
                    <motion.div
                      key={article.id}
                      className="recommended-card"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ margin: '-50px' }}
                      transition={{ duration: 0.5 }}
                      onClick={() => handleNewsClick(article)}
                      whileHover={{ x: 2 }}
                    >
                      <div className="recommended-content">
                        {article.featured_image && (
                          <div className="recommended-image">
                            <img 
                              src={getNewsImageUrl(article.featured_image)}
                              alt={article.title}
                              onError={(e) => {
                                e.target.src = DEFAULT_IMAGE;
                                e.target.onerror = null;
                              }}
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        <div className="recommended-text">
                          <h4 className="recommended-card-title">{article.title}</h4>
                          <div className="recommended-meta">
                            <Calendar size={12} />
                            <span>{formatDate(article.created_at)}</span>
                            <span className="general-badge">General</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Jobs and Opportunities Section */}
        <div className="opportunities-section">
          {/* Job Opportunities */}
          {countryData.jobs && countryData.jobs.length > 0 && (
            <motion.section 
              className="jobs-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-header">
                <Briefcase className="section-icon" />
                <div>
                  <h2 className="section-title">Career Opportunities in {countryName}</h2>
                  <p className="section-description">
                    Join our team and make a meaningful impact in {countryName}. Explore current openings.
                  </p>
                </div>
              </div>

              <div className="jobs-grid">
                {countryData.jobs.map(job => (
                  <motion.div
                    key={job.id}
                    className="job-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    onClick={() => handleJobClick(job)}
                    whileHover={{ y: -2 }}
                  >
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      
                      <div className="job-badges">
                        <span className="job-level-badge">{job.level}</span>
                        <span className="job-location-badge">
                          <MapPin size={12} />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="job-salary-badge">
                            <DollarSign size={12} />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="job-description">
                      {job.description && job.description.length > 150
                        ? `${job.description.substring(0, 150)}...`
                        : job.description || 'Join our team and contribute to meaningful projects that create positive impact in the community.'}
                    </p>

                    <div className="job-footer">
                      <div className="job-deadline">
                        <Calendar size={12} />
                        Apply by {formatDate(job.lastDate)}
                      </div>

                      <button
                        className="job-view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                      >
                        <Eye size={12} />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Volunteer Opportunities */}
          <motion.section 
            className="volunteer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-header">
              <Heart className="section-icon" />
              <div>
                <h2 className="section-title">Volunteer Opportunities in {countryName}</h2>
                <p className="section-description">
                  {volunteerForms.length > 0
                    ? "Join us in making a difference. Explore volunteer opportunities available in your area."
                    : `We're currently setting up volunteer opportunities in ${countryName}. Check back soon or contact us to learn about upcoming opportunities.`
                  }
                </p>
              </div>
            </div>

            {volunteerForms.length > 0 ? (
              <div className="volunteer-grid">
                {volunteerForms.map((form) => (
                  <motion.div 
                    key={form.id} 
                    className="volunteer-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="volunteer-content">
                      <h3 className="volunteer-title">{form.form_title}</h3>

                      {form.description && (
                        <p className="volunteer-description">{form.description}</p>
                      )}

                      <div className="volunteer-status">
                        <Chip
                          label={form.is_active ? "Active" : "Inactive"}
                          color={form.is_active ? "success" : "default"}
                          size="small"
                        />
                      </div>

                      {form.is_active && (
                        <button
                          onClick={() => setActiveForm(form)}
                          className="volunteer-apply-button"
                        >
                          <ExternalLink size={16} />
                          Apply Now
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="volunteer-placeholder">
                <Heart size={48} className="volunteer-placeholder-icon" />
                <p className="volunteer-placeholder-text">
                  Volunteer opportunities coming soon. Stay tuned for updates!
                </p>
              </div>
            )}
          </motion.section>
        </div>

        {/* Projects and Team Section */}
        <div className="content-grid">
          {/* Projects Section */}
          {countryData.projects && countryData.projects.length > 0 && (
            <motion.section 
              className="projects-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-header">
                <Award className="section-icon" />
                <div>
                  <h2 className="section-title">Projects in {countryName}</h2>
                  <p className="section-description">
                    Transformative initiatives making a real difference.
                  </p>
                </div>
              </div>

              <div className="projects-grid">
                {countryData.projects.map(project => (
                  <motion.div
                    key={project.id}
                    className="project-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    onClick={() => handleProjectClick(project)}
                    whileHover={{ y: -4 }}
                  >
                    {project.featured_image && (
                      <div className="project-image">
                        <img 
                          src={project.featured_image.startsWith('http') 
                            ? project.featured_image 
                            : `${STATIC_URL}${project.featured_image}`}
                          alt={project.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {project.status && (
                          <div className={`project-status ${project.status}`}>
                            {project.status === 'completed' && (
                              <CheckCircle className="status-icon" />
                            )}
                            {project.status.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="project-content">
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-description">
                        {project.short_description || 
                         (project.description && project.description.substring(0, 150) + '...') ||
                         'This project is designed to create meaningful impact in the community.'}
                      </p>
                      
                      <div className="project-meta">
                        {project.location && (
                          <div className="project-location">
                            <MapPin size={14} />
                            <span>{project.location}</span>
                          </div>
                        )}
                        {project.start_date && (
                          <div className="project-date">
                            <Calendar size={14} />
                            <span>Started {formatDate(project.start_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Team Section */}
          {countryData?.team && countryData.team.length > 0 && (
            <motion.section 
              className="team-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="team-header">
                <span className="team-badge">Team</span>
                <h2 className="team-title">Meet {countryName} Team</h2>
                <p className="team-description">
                  The professionals driving change in {countryName}
                </p>
              </div>

              <div className="team-carousel">
                {countryData.team.map((member, i) => {
                  const MAX = 100;
                  const isLong = member.bio?.length > MAX;
                  const displayedBio = isLong ? member.bio.slice(0, MAX) + "..." : member.bio;

                  return (
                    <motion.div 
                      key={member.id} 
                      className="team-card"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ margin: '-50px' }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="member-header">
                        {member.image_url ? (
                          <img
                            src={`${STATIC_URL}${member.image_url}`}
                            alt={member.name}
                            className="member-avatar"
                          />
                        ) : (
                          <div className="member-avatar-placeholder">
                            {member.name[0]}
                          </div>
                        )}

                        <div className="member-info">
                          <h3 className="member-name">{member.name}</h3>
                          <small className="member-position">{member.position}</small>
                        </div>
                      </div>

                      <p className="member-bio">{displayedBio}</p>

                      <div className="member-actions">
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(member.id, member.bio)}
                            className="member-more-button"
                          >
                            More
                          </button>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="member-email-button"
                          >
                            📧 Email
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </div>

        {/* Events Section */}
        {countryData.events && countryData.events.length > 0 && (
          <motion.section 
            className="events-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-header">
              <Calendar className="section-icon" />
              <div>
                <h2 className="section-title">{countryName} Events</h2>
                <p className="section-description">
                  Join us at upcoming events and community gatherings.
                </p>
              </div>
            </div>

            <div className="events-grid">
              {countryData.events.map(event => {
                const status = getEventStatus(event.start_date, event.end_date);
                return (
                  <motion.div
                    key={event.id}
                    className="event-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    onClick={() => handleEventClick(event)}
                    whileHover={{ y: -2 }}
                  >
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>

                      {event.is_paid ? (
                        <div className="event-price paid">
                          {event.currency} {parseFloat(event.price).toFixed(2)}
                        </div>
                      ) : (
                        <div className="event-price free">
                          Free
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="event-description">
                        {event.description.length > 150
                          ? `${event.description.substring(0, 150)}...`
                          : event.description}
                      </p>
                    )}

                    <div className="event-meta">
                      <div className="event-date">
                        <Calendar size={14} />
                        <span>
                          {formatDateTime(event.start_date)}
                          {event.end_date && ` - ${formatDateTime(event.end_date)}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="event-location">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Map Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <MapContainerWrapper 
            countryName={countryName}
            countryData={countryData}
          />
        </motion.section>

        {/* Contact Section */}
        <motion.section 
          className="contact-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="contact-divider" />
          <div className="section-header">
            <Mail className="section-icon" />
            <div>
              <h2 className="section-title">Get In Touch</h2>
              <p className="section-description">
                Ready to collaborate or learn more? We'd love to hear from you.
              </p>
            </div>
          </div>

          <div className="contact-card">
            <h3 className="contact-card-title">Contact Information</h3>
            
            <div className="contact-info">
              {countryData.contact.email && (
                <div className="contact-item">
                  <Mail className="contact-icon email" />
                  <div className="contact-details">
                    <div className="contact-label">Email Address</div>
                    <a 
                      href={`mailto:${countryData.contact.email}`}
                      className="contact-value"
                    >
                      {countryData.contact.email}
                    </a>
                  </div>
                </div>
              )}
              
              {countryData.contact.phone && (
                <div className="contact-item">
                  <Phone className="contact-icon phone" />
                  <div className="contact-details">
                    <div className="contact-label">Phone Number</div>
                    <a 
                      href={`tel:${countryData.contact.phone}`}
                      className="contact-value"
                    >
                      {countryData.contact.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {countryData.contact.physical_address && (
                <div className="contact-item">
                  <MapPin className="contact-icon address" />
                  <div className="contact-details">
                    <div className="contact-label">Address</div>
                    <div className="contact-value">
                      {countryData.contact.physical_address}
                    </div>
                    {countryData.contact.city && (
                      <div className="contact-city">
                        {countryData.contact.city}
                        {countryData.contact.postal_code && `, ${countryData.contact.postal_code}`}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Bio Modal */}
      {activeBio && (
        <div className="bio-modal-overlay" onClick={() => setActiveBio(null)}>
          <div className="bio-modal-content" onClick={(e) => e.stopPropagation()}>
            <p className="bio-text">{activeBio}</p>
            <button 
              onClick={() => setActiveBio(null)}
              className="bio-close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Volunteers Modal */}
      {volunteersModalOpen && (
        <div className="modal-overlay" onClick={closeVolunteersModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <Heart className="modal-icon" />
                <div>
                  <h2 className="modal-title">Volunteer Opportunities in {countryName}</h2>
                  <p className="modal-subtitle">
                    Join us in making a difference. Explore volunteer opportunities available in your area.
                  </p>
                </div>
              </div>
              <button onClick={closeVolunteersModal} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {volunteerForms.length > 0 ? (
                <div className="modal-forms-grid">
                  {volunteerForms.map((form) => (
                    <div key={form.id} className="modal-form-card">
                      <div className="modal-form-content">
                        <h3 className="modal-form-title">{form.form_title}</h3>

                        {form.description && (
                          <p className="modal-form-description">{form.description}</p>
                        )}

                        <div className="modal-form-status">
                          <Chip
                            label={form.is_active ? "Active" : "Inactive"}
                            color={form.is_active ? "success" : "default"}
                            size="small"
                          />
                        </div>

                        {form.is_active && (
                          <button
                            onClick={() => setActiveForm(form)}
                            className="modal-form-apply"
                          >
                            <ExternalLink size={16} />
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="modal-placeholder">
                  <Heart size={48} className="modal-placeholder-icon" />
                  <h3 className="modal-placeholder-title">No Volunteer Opportunities Yet</h3>
                  <p className="modal-placeholder-text">
                    We're currently setting up volunteer opportunities in {countryName}. 
                    Check back soon or contact us to learn about upcoming opportunities.
                  </p>
                  <button onClick={closeVolunteersModal} className="modal-placeholder-button">
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
        <div className="form-modal-overlay" onClick={() => setActiveForm(null)}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <div>
                <h3 className="form-modal-title">{activeForm.form_title}</h3>
                <p className="form-modal-subtitle">
                  Complete the form below to apply for this volunteer opportunity
                </p>
              </div>
              <button onClick={() => setActiveForm(null)} className="form-modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="form-modal-body">
              <iframe
                src={`${activeForm.form_url}?embedded=true`}
                title={activeForm.form_title}
                className="form-iframe"
                allow="clipboard-write"
                loading="lazy"
              />
            </div>
            
            <div className="form-modal-footer">
              <div className="form-modal-help">
                Having trouble with the form? Try opening it in a new tab.
              </div>
              <a
                href={activeForm.form_url}
                target="_blank"
                rel="noopener noreferrer"
                className="form-modal-external"
              >
                <ExternalLink size={14} />
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default CountryInfoDisplay;