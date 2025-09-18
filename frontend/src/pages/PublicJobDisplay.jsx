import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Lottie from "lottie-react";

import { useTheme } from "../theme";
import { API_URL } from "../config";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Lottie animation JSON data (you can replace these with actual animation files)
const loadingAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Loading",
  "ddd": 0,
  "assets": [],
  "layers": [{
    "ddd": 0,
    "ind": 1,
    "ty": 4,
    "nm": "Circle",
    "sr": 1,
    "ks": {
      "o": {"a": 0, "k": 100},
      "r": {"a": 1, "k": [{"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]}, {"t": 60, "s": [360]}]},
      "p": {"a": 0, "k": [100, 100]},
      "a": {"a": 0, "k": [0, 0]},
      "s": {"a": 0, "k": [100, 100]}
    },
    "ao": 0,
    "shapes": [{
      "ty": "gr",
      "it": [{
        "d": 1,
        "ty": "el",
        "s": {"a": 0, "k": [60, 60]},
        "p": {"a": 0, "k": [0, 0]}
      }, {
        "ty": "st",
        "c": {"a": 0, "k": [0.2, 0.4, 0.8, 1]},
        "o": {"a": 0, "k": 100},
        "w": {"a": 0, "k": 8},
        "lc": 2,
        "lj": 2
      }, {
        "ty": "tr",
        "p": {"a": 0, "k": [0, 0]},
        "a": {"a": 0, "k": [0, 0]},
        "s": {"a": 0, "k": [100, 100]},
        "r": {"a": 0, "k": 0},
        "o": {"a": 0, "k": 100}
      }]
    }],
    "ip": 0,
    "op": 60,
    "st": 0,
    "bm": 0
  }]
};

const successAnimation = {
  "v": "5.7.4",
  "fr": 24,
  "ip": 0,
  "op": 48,
  "w": 200,
  "h": 200,
  "nm": "Success",
  "ddd": 0,
  "assets": [],
  "layers": [{
    "ddd": 0,
    "ind": 1,
    "ty": 4,
    "nm": "Check",
    "sr": 1,
    "ks": {
      "o": {"a": 0, "k": 100},
      "r": {"a": 0, "k": 0},
      "p": {"a": 0, "k": [100, 100]},
      "a": {"a": 0, "k": [0, 0]},
      "s": {"a": 1, "k": [{"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 0, "s": [0, 0, 100]}, {"t": 24, "s": [100, 100, 100]}]}
    },
    "ao": 0,
    "shapes": [{
      "ty": "gr",
      "it": [{
        "ind": 0,
        "ty": "sh",
        "ks": {"a": 0, "k": {"i": [[0,0],[0,0],[0,0]], "o": [[0,0],[0,0],[0,0]], "v": [[-20,0],[0,20],[40,-20]], "c": false}}
      }, {
        "ty": "st",
        "c": {"a": 0, "k": [0.1, 0.7, 0.3, 1]},
        "o": {"a": 0, "k": 100},
        "w": {"a": 0, "k": 8},
        "lc": 2,
        "lj": 2
      }, {
        "ty": "tr",
        "p": {"a": 0, "k": [0, 0]},
        "a": {"a": 0, "k": [0, 0]},
        "s": {"a": 0, "k": [100, 100]},
        "r": {"a": 0, "k": 0},
        "o": {"a": 0, "k": 100}
      }]
    }],
    "ip": 0,
    "op": 48,
    "st": 0,
    "bm": 0
  }]
};

const PublicJobDisplay = () => {
  const { colors } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const heroRef = useRef(null);
  const observerRef = useRef();
  const [filter, setFilter] = useState({ level: "", location: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });

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

    // Observe all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [jobs]); // Re-run when jobs change

  // Fetch jobs with proper error handling
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/jobs`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
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
        // Server responded with error
        if (error.response.status === 404) {
          errorMessage += "Job listings not found.";
        } else if (error.response.status >= 500) {
          errorMessage += "Server error. Please try again later.";
        } else {
          errorMessage += error.response.data?.message || "Please try again.";
        }
      } else if (error.request) {
        // Network error
        errorMessage += "Please check your internet connection.";
      } else {
        // Other error
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
    console.log(`Field changed: ${name}`, files ? files[0]?.name : value);
    
    if (files && files[0]) {
      // Validate file type
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
      
      // Validate file size (5MB limit)
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
    
    // Clear status when user makes changes
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
    
    const levelMatch = !filter.level || job.level === filter.level;
    const locationMatch = !filter.location || 
      (job.location && job.location.toLowerCase().includes(filter.location.toLowerCase()));
    
    return levelMatch && locationMatch;
  });

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    
    if (!selectedJob) {
      setSubmitStatus({ message: "No job selected", type: "error" });
      return;
    }

    // Validate form
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

      console.log("Submitting to API:", `${API_URL}/job-applications`);

      const response = await axios.post(`${API_URL}/job-applications`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
        timeout: 30000,
      });

      console.log("API response:", response.data);

      if (response.data && response.data.success !== false) {
        setSubmitStatus({ 
          message: "Application submitted successfully! We'll be in touch soon.", 
          type: "success" 
        });
        
        setTimeout(() => {
          setShowApplicationForm(false);
          setForm({
            name: "",
            email: "",
            phone: "",
            coverLetter: "",
            resume: null,
          });
          setSubmitStatus({ message: "", type: "" });
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
        console.error("Server error:", serverError);
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection and try again.";
        console.error("Network error:", error.request);
      }
      
      setSubmitStatus({ message: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowApplicationForm(false);
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

  const retryFetch = () => {
    fetchJobs();
  };

  const uniqueLocations = [...new Set(jobs.map(job => 
    job?.location ? job.location.split(',')[0].trim() : null
  ).filter(Boolean))];

  return (
    <div style={{ minHeight: "100vh", position: 'relative', overflow: 'hidden' }}>
      <style jsx>{`
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
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
        
        .job-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .job-card:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .floating-elements::before {
          content: '';
          position: absolute;
          top: 10%;
          left: 5%;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(250,207,60,0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 4s ease-in-out infinite;
        }
        
        .floating-elements::after {
          content: '';
          position: absolute;
          top: 60%;
          right: 10%;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(156,207,159,0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 6s ease-in-out infinite reverse;
        }

        .btn {
          border: none;
          border-radius: 50px;
          padding: 1rem 2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          font-size: 1rem;
        }

        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-primary {
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);
          color: ${colors.white};
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(10, 69, 28, 0.3);
        }

        .btn-secondary {
          background: ${colors.gray100};
          color: ${colors.gray700};
          border: 2px solid ${colors.gray300};
        }

        .btn-secondary:hover:not(:disabled) {
          background: ${colors.gray300};
        }

        .btn-retry {
          background: linear-gradient(135deg, ${colors.info} 0%, ${colors.primary} 100%);
          color: ${colors.white};
          animation: bounce 2s infinite;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .alert {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 1px solid;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          color: ${colors.error};
          border-color: ${colors.error};
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          color: ${colors.success};
          border-color: ${colors.success};
        }

        .alert-warning {
          background: rgba(245, 158, 11, 0.1);
          color: ${colors.warning};
          border-color: ${colors.warning};
        }

        .alert-info {
          background: rgba(59, 130, 246, 0.1);
          color: ${colors.info};
          border-color: ${colors.info};
        }

        .form-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid ${colors.gray300};
          border-radius: 12px;
          font-size: 1rem;
          font-family: inherit;
          outline: none;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px rgba(10, 69, 28, 0.1);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: ${colors.white};
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: scaleIn 0.3s ease-out;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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

        .grid {
          display: grid;
          gap: 2rem;
        }

        .grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

        @media (max-width: 768px) {
          .grid-cols-2, .grid-cols-3 {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 769px) {
          .md-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .md-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 1024px) {
          .lg-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        }

        .lottie-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100px;
          height: 100px;
          margin: 0 auto;
        }
      `}</style>

      <Header />

      {/* Animated Background */}
      <div
        ref={heroRef}
        className="floating-elements"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100vh',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.accent} 100%)`,
          zIndex: -2
        }}
      />
      
      {/* Pattern Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
        zIndex: -1
      }} />

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        paddingTop: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Hero Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 0 6rem 0', 
          color: colors.white,
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            margin: '0 0 1.5rem 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1s ease-out'
          }}>
            Join Our Amazing Team
          </h1>
          <p style={{
            fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
            opacity: 0.95,
            margin: '0 auto',
            fontWeight: 300,
            maxWidth: '600px',
            marginBottom: '3rem',
            animation: 'fadeInUp 1s ease-out 0.2s both'
          }}>
            Discover exciting opportunities and build your career with us
          </p>

          {/* Stats Cards */}
          <div className="grid md-grid-cols-3" style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            gap: '1.5rem'
          }}>
            {[
              { number: '50+', label: 'Team Members' },
              { number: '100%', label: 'Remote Friendly' },
              { number: '5★', label: 'Company Rating' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="glass-morphism animate-on-scroll"
                style={{ 
                  padding: '2rem', 
                  borderRadius: '1rem',
                  animationDelay: `${0.4 + index * 0.1}s`
                }}
              >
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div 
            className="glass-morphism animate-on-scroll"
            style={{ 
              padding: '3rem 2rem', 
              borderRadius: '1rem', 
              marginBottom: '3rem',
              textAlign: 'center',
              color: colors.white
            }}
          >
            <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>⚠️</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              marginBottom: '1rem',
              color: colors.white
            }}>
              Oops! Something went wrong
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              marginBottom: '2rem', 
              opacity: 0.9,
              maxWidth: '500px',
              margin: '0 auto 2rem auto'
            }}>
              {error}
            </p>
            <button
              className="btn btn-retry"
              onClick={retryFetch}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: colors.white
          }}>
            <div className="lottie-container">
              <Lottie 
                animationData={loadingAnimation} 
                loop={true}
                style={{ width: 100, height: 100 }}
              />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1rem' }}>
              Loading amazing opportunities...
            </h3>
          </div>
        )}

        {/* Filters - Only show if we have jobs */}
        {!loading && !error && jobs.length > 0 && (
          <div 
            className="glass-morphism animate-on-scroll"
            style={{ 
              padding: '2rem', 
              borderRadius: '1rem', 
              marginBottom: '3rem',
              animationDelay: '0.6s'
            }}
          >
            <h3 style={{ 
              color: colors.white, 
              marginBottom: '1.5rem', 
              textAlign: 'center', 
              fontWeight: 600,
              fontSize: '1.25rem'
            }}>
              Find Your Perfect Role
            </h3>
            <div className="grid md-grid-cols-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <select
                value={filter.location}
                onChange={(e) => setFilter({...filter, location: e.target.value})}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '50px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: colors.white,
                  fontSize: '1rem',
                  outline: 'none'
                }}
              >
                <option value="" style={{color: colors.gray900}}>All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location} style={{color: colors.gray900}}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Job Count */}
        {!loading && !error && jobs.length > 0 && (
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span 
              className="chip"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: colors.white,
                fontSize: '1rem',
                padding: '0.75rem 1.5rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              {filteredJobs.length} position{filteredJobs.length !== 1 ? 's' : ''} available
            </span>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && (
          <>
            {filteredJobs.length === 0 && jobs.length > 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: colors.white
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', opacity: 0.9 }}>
                  No jobs match your filters
                </h3>
                <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                  Try adjusting your search criteria to see more opportunities
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setFilter({ level: "", location: "" })}
                >
                  Clear Filters
                </button>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid md-grid-cols-2 lg-grid-cols-3" style={{ marginBottom: '4rem' }}>
                {filteredJobs.map((job, index) => {
                  const isPastDeadline = isDeadlinePassed(job.lastDate);
                  
                  return (
                    <div 
                      key={job.id}
                      className="animate-on-scroll job-card"
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(20px)',
                        animationDelay: `${0.8 + index * 0.1}s`,
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Status Line */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: isPastDeadline ? colors.error : `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`
                      }} />

                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Status Badge */}
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                          <span
                            className="chip"
                            style={{
                              backgroundColor: isPastDeadline ? colors.error : colors.success,
                              color: colors.white,
                              fontSize: '0.7rem'
                            }}
                          >
                            {isPastDeadline ? "Closed" : "Open"}
                          </span>
                        </div>

                        <h3 style={{ 
                          fontSize: '1.25rem',
                          fontWeight: 700, 
                          color: colors.gray900, 
                          marginBottom: '1rem',
                          paddingRight: '4rem' // Make room for status badge
                        }}>
                          {job.title}
                        </h3>

                        {/* Job Meta */}
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '0.5rem', 
                          marginBottom: '1rem' 
                        }}>
                          <span 
                            className="chip"
                            style={{ backgroundColor: colors.info, color: colors.white, fontSize: '0.7rem' }}
                          >
                            {job.level}
                          </span>
                          <span 
                            className="chip"
                            style={{ backgroundColor: colors.accent, color: colors.gray900, fontSize: '0.7rem' }}
                          >
                            {job.location}
                          </span>
                          {job.salary && (
                            <span 
                              className="chip"
                              style={{ backgroundColor: colors.secondary, color: colors.gray900, fontSize: '0.7rem' }}
                            >
                              {job.salary}
                            </span>
                          )}
                        </div>

                        <p style={{ 
                          color: colors.gray600, 
                          marginBottom: '1.5rem', 
                          lineHeight: 1.6,
                          flex: 1,
                          fontSize: '0.875rem'
                        }}>
                          {job.description}
                        </p>

                        {/* Requirements Preview */}
                        {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ 
                              fontWeight: 600, 
                              color: colors.gray900, 
                              marginBottom: '0.5rem',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Key Skills:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {job.requirements.slice(0, 3).map((req, i) => (
                                <span 
                                  key={i}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    border: `1px solid ${colors.gray300}`,
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    color: colors.gray600
                                  }}
                                >
                                  {req}
                                </span>
                              ))}
                              {job.requirements.length > 3 && (
                                <span 
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    border: `1px solid ${colors.gray300}`,
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    color: colors.gray600,
                                    opacity: 0.7
                                  }}
                                >
                                  +{job.requirements.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div style={{
                          fontWeight: 600,
                          color: isPastDeadline ? colors.error : colors.success,
                          marginBottom: '1rem',
                          fontSize: '0.75rem'
                        }}>
                          Deadline: {formatDate(job.lastDate)}
                        </div>

                        <button
                          className={`btn ${isPastDeadline ? 'btn-secondary' : 'btn-primary'}`}
                          disabled={isPastDeadline}
                          onClick={() => {
                            setSelectedJob(job);
                            setShowApplicationForm(true);
                          }}
                          style={{
                            width: '100%',
                            background: isPastDeadline 
                              ? colors.gray300 
                              : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`
                          }}
                        >
                          {isPastDeadline ? "Position Closed" : "Apply Now"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        )}

        {/* Application Modal */}
        {showApplicationForm && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: colors.gray600,
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  zIndex: 1
                }}
              >
                ×
              </button>
              
              {selectedJob && (
                <div style={{ padding: '2rem' }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: colors.primary,
                    marginBottom: '0.5rem'
                  }}>
                    Apply for {selectedJob.title}
                  </h2>
                  <p style={{
                    color: colors.gray600,
                    marginBottom: '2rem'
                  }}>
                    {selectedJob.location} • {selectedJob.level}
                  </p>

                  {submitStatus.message && (
                    <div className={`alert alert-${submitStatus.type}`}>
                      {submitStatus.type === 'success' && (
                        <div className="lottie-container" style={{ width: 24, height: 24 }}>
                          <Lottie 
                            animationData={successAnimation} 
                            loop={false}
                            style={{ width: 24, height: 24 }}
                          />
                        </div>
                      )}
                      {submitStatus.type === 'info' && submitting && (
                        <div className="lottie-container" style={{ width: 24, height: 24 }}>
                          <Lottie 
                            animationData={loadingAnimation} 
                            loop={true}
                            style={{ width: 24, height: 24 }}
                          />
                        </div>
                      )}
                      <span>{submitStatus.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitApplication}>
                    <div className="grid" style={{ gap: '1rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontWeight: 600,
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem'
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
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem'
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
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem'
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
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem'
                        }}>
                          Cover Letter
                        </label>
                        <textarea
                          name="coverLetter"
                          value={form.coverLetter}
                          onChange={handleChange}
                          disabled={submitting}
                          placeholder="Tell us why you're perfect for this role..."
                          className="form-input form-textarea"
                          rows={4}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontWeight: 600,
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem'
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span>📄</span>
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
                          fontSize: '0.75rem', 
                          color: colors.gray500, 
                          marginTop: '0.5rem' 
                        }}>
                          Maximum file size: 5MB
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      display: "flex", 
                      justifyContent: "flex-end", 
                      marginTop: '2rem', 
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={submitting}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {submitting && (
                          <div className="lottie-container" style={{ width: 20, height: 20 }}>
                            <Lottie 
                              animationData={loadingAnimation} 
                              loop={true}
                              style={{ width: 20, height: 20 }}
                            />
                          </div>
                        )}
                        {submitting ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};



export default PublicJobDisplay;
  