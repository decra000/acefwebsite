import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, MapPin, Clock, DollarSign, Users, Calendar, Eye } from "lucide-react";
import { useTheme } from "../theme";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PublicJobDisplay = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'details', 'application'
  const heroRef = useRef(null);
  const observerRef = useRef();
  const [filter, setFilter] = useState({ level: "", location: "", country: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });

  // Use theme context
  const { colors, isDarkMode } = useTheme();

  const API_URL = 'http://localhost:5000/api'; // Replace with your API URL

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    observerRef.current = observer;

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [jobs]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/jobs`, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && Array.isArray(response.data)) {
        setJobs(response.data);
      } else if (response.data.jobs && Array.isArray(response.data.jobs)) {
        setJobs(response.data.jobs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      let errorMessage = "Failed to load job listings. ";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage += "Job listings not found.";
        } else if (error.response.status >= 500) {
          errorMessage += "Server error. Please try again later.";
        } else {
          errorMessage += error.response.data?.message || "Please try again.";
        }
      } else if (error.request) {
        errorMessage += "Please check your internet connection.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    try {
      return new Date(deadline) < new Date();
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && files[0]) {
      const validTypes = ['.pdf', '.doc', '.docx'];
      const fileName = files[0].name.toLowerCase();
      const isValidType = validTypes.some(type => fileName.endsWith(type));
      
      if (!isValidType) {
        setSubmitStatus({ 
          message: "Please upload a PDF, DOC, or DOCX file.", 
          type: "error" 
        });
        return;
      }
      
      if (files[0].size > 5 * 1024 * 1024) {
        setSubmitStatus({ 
          message: "Resume file must be smaller than 5MB.", 
          type: "error" 
        });
        return;
      }
      
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    if (submitStatus.message) {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.name.trim()) errors.push("Name is required");
    if (!form.email.trim()) errors.push("Email is required");
    if (!form.resume) errors.push("Resume file is required");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email.trim())) {
      errors.push("Please enter a valid email address");
    }
    
    return errors;
  };
  
  const filteredJobs = jobs.filter(job => {
    if (!job) return false;
    
    // Filter out jobs with closed applications
    const isApplicationOpen = !isDeadlinePassed(job.lastDate);
    if (!isApplicationOpen) return false;
    
    const levelMatch = !filter.level || job.level === filter.level;
    const locationMatch = !filter.location || 
      (job.location && job.location.toLowerCase().includes(filter.location.toLowerCase()));
    const countryMatch = !filter.country || 
      (job.country && job.country.toLowerCase().includes(filter.country.toLowerCase()));
    
    return levelMatch && locationMatch && countryMatch;
  });

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!selectedJob) {
      setSubmitStatus({ message: "No job selected", type: "error" });
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitStatus({ message: validationErrors.join(", "), type: "error" });
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ message: "Submitting application...", type: "info" });

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("phone", form.phone.trim());
      formData.append("coverLetter", form.coverLetter.trim());
      formData.append("resume", form.resume);
      formData.append("job_id", selectedJob.id);

      const response = await axios.post(`${API_URL}/job-applications`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      if (response.data && response.data.success !== false) {
        setSubmitStatus({ 
          message: "Application submitted successfully! We'll be in touch soon.", 
          type: "success" 
        });
        
        setTimeout(() => {
          closeModal();
        }, 3000);
      } else {
        throw new Error(response.data?.error || "Failed to submit application");
      }

    } catch (error) {
      console.error("Error submitting application:", error);
      
      let errorMessage = "Error submitting application. Please try again.";
      
      if (error.response) {
        const serverError = error.response.data;
        if (serverError?.error) {
          errorMessage = serverError.error;
        } else if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (error.response.status === 413) {
          errorMessage = "File too large. Please upload a smaller resume.";
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setSubmitStatus({ message: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowApplicationForm(false);
    setShowJobDetails(false);
    setCurrentView('list');
    setSelectedJob(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      coverLetter: "",
      resume: null,
    });
    setSubmitStatus({ message: "", type: "" });
  };

  const viewJobDetails = (job) => {
    setSelectedJob(job);
    setCurrentView('details');
    setShowJobDetails(true);
  };

  const startApplication = () => {
    setCurrentView('application');
    setShowApplicationForm(true);
  };

  const goBackToList = () => {
    closeModal();
  };

  const getLocationDisplay = (location) => {
    const icons = {
      'Remote': '🏠',
      'In-Person': '🏢', 
      'Hybrid': '🔄'
    };
    return `${icons[location] || ''} ${location}`;
  };

  const uniqueLocations = [...new Set(jobs.map(job => job?.location).filter(Boolean))];
  const uniqueCountries = [...new Set(jobs.map(job => job?.country).filter(Boolean))];
  const uniqueLevels = [...new Set(jobs.map(job => job?.level).filter(Boolean))];

  return (
    <>
      <Header />
      <div style={{ 
        minHeight: "100vh", 
        background: colors.background,
        fontFamily: '"Nunito Sans", sans-serif',
        paddingTop: '80px' // Account for fixed header
      }}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .animate-in {
            opacity: 1;
            transform: translateY(0);
          }
          
          .job-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          
          .job-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px ${colors.cardShadow};
          }
          
          .glass-card {
            background: ${colors.surface};
            backdrop-filter: blur(10px);
            border: 1px solid ${colors.border};
          }

          .btn {
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .btn-primary {
            background: ${colors.primary};
            color: ${colors.white};
          }

          .btn-primary:hover:not(:disabled) {
            background: ${colors.primaryDark};
            transform: translateY(-1px);
          }

          .btn-secondary {
            background: ${colors.backgroundSecondary};
            color: ${colors.text};
          }

          .btn-secondary:hover:not(:disabled) {
            background: ${colors.borderHover};
          }

          .btn-outline {
            background: transparent;
            border: 2px solid ${colors.primary};
            color: ${colors.primary};
          }

          .btn-outline:hover:not(:disabled) {
            background: ${colors.primary};
            color: ${colors.white};
          }

          .badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            gap: 4px;
          }

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
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 20px 60px ${colors.cardShadow};
          }

          .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid ${colors.border};
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
            box-sizing: border-box;
            background: ${colors.surface};
            color: ${colors.text};
          }

          .form-input:focus {
            border-color: ${colors.primary};
            box-shadow: 0 0 0 3px ${colors.primary}20;
          }

          .form-input::placeholder {
            color: ${colors.textMuted};
          }

          .form-input option {
            background: ${colors.surface};
            color: ${colors.text};
          }

          /* Ensure good contrast for all text elements */
          .text-primary {
            color: ${colors.text} !important;
          }

          .text-secondary {
            color: ${colors.textSecondary} !important;
          }

          .text-muted {
            color: ${colors.textMuted} !important;
          }

          .bg-surface {
            background-color: ${colors.surface} !important;
          }
        `}</style>

        {/* Header */}
        <div style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          padding: '60px 20px',
          textAlign: 'center',
          color: colors.white,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              margin: '0 0 16px 0',
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              Join Our Team
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
              opacity: 0.9,
              margin: '0 auto 40px auto',
              maxWidth: '600px',
              animation: 'fadeInUp 0.6s ease-out 0.2s both'
            }}>
              Discover amazing opportunities and build your career with innovative projects
            </p>

            {/* Quick Stats */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {[
                { icon: '💼', number: filteredJobs.length, label: 'Open Positions' },
                { icon: '🌍', number: uniqueCountries.length, label: 'Countries' },
                { icon: '📊', number: uniqueLevels.length, label: 'Experience Levels' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="glass-card animate-on-scroll"
                  style={{ 
                    padding: '24px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    animationDelay: `${0.4 + index * 0.1}s`,
                    background: `rgba(255, 255, 255, 0.1)`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    color: colors.white
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>
                    {stat.number}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            zIndex: 0
          }} />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                border: `3px solid ${colors.border}`,
                borderTop: `3px solid ${colors.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px auto'
              }} />
              <h3 style={{ fontSize: '1.25rem', color: colors.textSecondary }}>
                Loading opportunities...
              </h3>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.error}`,
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ color: colors.error, marginBottom: '16px' }}>
                Something went wrong
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>
                {error}
              </p>
              <button className="btn btn-primary" onClick={fetchJobs}>
                Try Again
              </button>
            </div>
          )}

          {/* Filters */}
          {!loading && !error && jobs.length > 0 && (
            <div 
              className="animate-on-scroll"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '40px',
                boxShadow: `0 4px 6px ${colors.cardShadow}`
              }}
            >
              <h3 style={{ 
                color: colors.text,
                marginBottom: '24px',
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                Filter Opportunities
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <select
                  value={filter.level}
                  onChange={(e) => setFilter({...filter, level: e.target.value})}
                  className="form-input"
                  style={{ height: '48px' }}
                >
                  <option value="">All Experience Levels</option>
                  {uniqueLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>

                <select
                  value={filter.location}
                  onChange={(e) => setFilter({...filter, location: e.target.value})}
                  className="form-input"
                  style={{ height: '48px' }}
                >
                  <option value="">All Work Types</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{getLocationDisplay(location)}</option>
                  ))}
                </select>

                <select
                  value={filter.country}
                  onChange={(e) => setFilter({...filter, country: e.target.value})}
                  className="form-input"
                  style={{ height: '48px' }}
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '24px',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
                  {filteredJobs.length} position{filteredJobs.length !== 1 ? 's' : ''} found
                </div>
                
                <button 
                  className="btn btn-secondary"
                  onClick={() => setFilter({ level: "", location: "", country: "" })}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Jobs Grid */}
          {!loading && !error && filteredJobs.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {filteredJobs.map((job, index) => {
                return (
                  <div 
                    key={job.id}
                    className="animate-on-scroll job-card"
                    style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '16px',
                      padding: '24px',
                      position: 'relative',
                      boxShadow: `0 2px 8px ${colors.cardShadow}`,
                      animationDelay: `${index * 0.1}s`
                    }}
                    onClick={() => viewJobDetails(job)}
                  >
                    {/* Status indicator - Green since all are open */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: colors.success
                    }} />

                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: colors.text,
                        marginBottom: '8px',
                        paddingRight: '24px'
                      }}>
                        {job.title}
                      </h3>
                      
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '16px'
                      }}>
                        <span className="badge" style={{ 
                          background: colors.primary,
                          color: colors.white
                        }}>
                          {job.level}
                        </span>
                        
                        <span className="badge" style={{ 
                          background: colors.backgroundSecondary,
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}>
                          <MapPin size={12} />
                          {job.location}
                        </span>

                        {job.country && (
                          <span className="badge" style={{ 
                            background: colors.secondary,
                            color: colors.black
                          }}>
                            {job.country}
                          </span>
                        )}

                        {job.salary && (
                          <span className="badge" style={{ 
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
                      marginBottom: '20px',
                      fontSize: '14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '16px',
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

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline"
                          style={{ 
                            fontSize: '12px',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            viewJobDetails(job);
                          }}
                        >
                          <Eye size={12} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No jobs found */}
          {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
            <div style={{
              background: colors.surface,
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ color: colors.text, marginBottom: '12px' }}>
                No positions match your criteria
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>
                Try adjusting your filters to see more opportunities
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setFilter({ level: "", location: "", country: "" })}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Job Details Modal */}
          {showJobDetails && selectedJob && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                  padding: '32px',
                  borderBottom: `1px solid ${colors.border}`,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                  color: colors.white,
                  borderRadius: '16px 16px 0 0'
                }}>
                  <button
                    onClick={closeModal}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: `${colors.white}20`,
                      border: 'none',
                      borderRadius: '8px',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.white,
                      cursor: 'pointer',
                      fontSize: '20px'
                    }}
                  >
                    ×
                  </button>

                  <div style={{ paddingRight: '60px' }}>
                    <h1 style={{ 
                      fontSize: '2rem',
                      fontWeight: 700,
                      marginBottom: '12px'
                    }}>
                      {selectedJob.title}
                    </h1>

                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <span className="badge" style={{ 
                        background: `${colors.white}20`,
                        color: colors.white
                      }}>
                        <MapPin size={14} />
                        {selectedJob.location}
                      </span>

                      <span className="badge" style={{ 
                        background: `${colors.white}20`,
                        color: colors.white
                      }}>
                        <Users size={14} />
                        {selectedJob.level}
                      </span>

                      {selectedJob.country && (
                        <span className="badge" style={{ 
                          background: `${colors.white}20`,
                          color: colors.white
                        }}>
                          {selectedJob.country}
                        </span>
                      )}

                      {selectedJob.salary && (
                        <span className="badge" style={{ 
                          background: `${colors.white}20`,
                          color: colors.white
                        }}>
                          <DollarSign size={14} />
                          {selectedJob.salary}
                        </span>
                      )}
                    </div>

                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      opacity: 0.9
                    }}>
                      <Calendar size={14} />
                      Apply by {formatDate(selectedJob.lastDate)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '32px' }}>
                  {currentView === 'details' && (
                    <div>
                      <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ 
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: colors.text,
                          marginBottom: '16px'
                        }}>
                          Job Description
                        </h3>
                        <div style={{
                          color: colors.textSecondary,
                          lineHeight: 1.7,
                          fontSize: '16px',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {selectedJob.description}
                        </div>
                      </div>

                      <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ 
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: colors.text,
                          marginBottom: '16px'
                        }}>
                          Requirements
                        </h3>
                        <div style={{
                          color: colors.textSecondary,
                          lineHeight: 1.7,
                          fontSize: '16px',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {selectedJob.requirements}
                        </div>
                      </div>

                      {selectedJob.createdBy && (
                        <div style={{
                          background: colors.backgroundSecondary,
                          borderRadius: '12px',
                          padding: '20px',
                          marginBottom: '32px'
                        }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: colors.textSecondary,
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Posted by
                          </h4>
                          <div style={{ color: colors.text, fontSize: '16px' }}>
                            {selectedJob.createdBy}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ 
                        display: 'flex',
                        gap: '16px',
                        justifyContent: 'flex-end',
                        paddingTop: '24px',
                        borderTop: `1px solid ${colors.border}`,
                        flexWrap: 'wrap'
                      }}>
                        <button
                          className="btn btn-secondary"
                          onClick={closeModal}
                        >
                          <ChevronLeft size={16} />
                          Back to Jobs
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={startApplication}
                          style={{
                            background: colors.primary,
                            color: colors.white,
                            opacity: 1
                          }}
                        >
                          Apply for this Position
                        </button>
                      </div>
                    </div>
                  )}

                  {currentView === 'application' && (
                    <div>
                      <div style={{ marginBottom: '32px' }}>
                        <h2 style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: colors.text,
                          marginBottom: '8px'
                        }}>
                          Application Form
                        </h2>
                        <p style={{ color: colors.textSecondary }}>
                          Complete the form below to apply for this position
                        </p>
                      </div>

                      {submitStatus.message && (
                        <div style={{
                          padding: '16px',
                          borderRadius: '8px',
                          marginBottom: '24px',
                          border: `1px solid ${
                            submitStatus.type === 'success' ? colors.success :
                            submitStatus.type === 'error' ? colors.error :
                            submitStatus.type === 'warning' ? colors.warning :
                            colors.info
                          }`,
                          background: `${
                            submitStatus.type === 'success' ? colors.success :
                            submitStatus.type === 'error' ? colors.error :
                            submitStatus.type === 'warning' ? colors.warning :
                            colors.info
                          }15`,
                          color: submitStatus.type === 'success' ? colors.success :
                            submitStatus.type === 'error' ? colors.error :
                            submitStatus.type === 'warning' ? colors.warning :
                            colors.info
                        }}>
                          {submitStatus.message}
                        </div>
                      )}

                      <form onSubmit={handleSubmitApplication}>
                        <div style={{ 
                          display: 'grid',
                          gap: '24px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              marginBottom: '8px',
                              color: colors.text
                            }}>
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              required
                              disabled={submitting}
                              placeholder="Enter your full name"
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              marginBottom: '8px',
                              color: colors.text
                            }}>
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              required
                              disabled={submitting}
                              placeholder="Enter your email address"
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              marginBottom: '8px',
                              color: colors.text
                            }}>
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              disabled={submitting}
                              placeholder="Enter your phone number"
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              marginBottom: '8px',
                              color: colors.text
                            }}>
                              Cover Letter
                            </label>
                            <textarea
                              name="coverLetter"
                              value={form.coverLetter}
                              onChange={handleChange}
                              disabled={submitting}
                              placeholder="Tell us why you're perfect for this role..."
                              className="form-input"
                              rows={5}
                              style={{ minHeight: '120px', resize: 'vertical' }}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontWeight: 600,
                              marginBottom: '8px',
                              color: colors.text
                            }}>
                              Resume *
                            </label>
                            <label 
                              className="btn btn-secondary"
                              style={{
                                width: '100%',
                                textAlign: 'center',
                                borderStyle: 'dashed',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.6 : 1,
                                justifyContent: 'center',
                                padding: '20px',
                                background: form.resume ? colors.backgroundSecondary : colors.surface,
                                color: colors.text,
                                border: `2px dashed ${colors.border}`
                              }}
                            >
                              <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>📄</span>
                              {form.resume ? `Selected: ${form.resume.name}` : 'Upload Resume (PDF, DOC, DOCX)'}
                              <input
                                type="file"
                                name="resume"
                                style={{ display: 'none' }}
                                accept=".pdf,.doc,.docx"
                                onChange={handleChange}
                                required
                                disabled={submitting}
                              />
                            </label>
                            <div style={{ 
                              fontSize: '12px', 
                              color: colors.textMuted, 
                              marginTop: '8px' 
                            }}>
                              Maximum file size: 5MB
                            </div>
                          </div>
                        </div>

                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          marginTop: '40px',
                          paddingTop: '24px',
                          borderTop: `1px solid ${colors.border}`,
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}>
                          <button
                            type="button"
                            onClick={() => setCurrentView('details')}
                            disabled={submitting}
                            className="btn btn-secondary"
                          >
                            <ChevronLeft size={16} />
                            Back to Details
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                          >
                            {submitting ? "Submitting..." : "Submit Application"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PublicJobDisplay;