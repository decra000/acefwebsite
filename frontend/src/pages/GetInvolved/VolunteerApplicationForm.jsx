import React, { useState, useEffect } from "react";
import axios from "axios";

// Replace with your actual config
import { API_URL, STATIC_URL } from '../../config';

const VolunteerApplicationForm = () => {
  const [countries, setCountries] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    email: "",
    nationality: "",
    country_of_residence: "",
    city_of_residence: "",
    application_country: "",
    
    // Step 2: Professional Background
    core_professional_area: "",
    skills: "",
    interests: "",
    
    // Step 3: Availability
    time_commitment_weeks: "",
    preferred_duration: "",
    anticipated_start_date: "",
    engagement_preference: "",
    confirmed_in_person: false,
    
    // Step 4: Motivation
    why_volunteer: "",
    
    // Step 5: Study Program
    is_study_program: false,
    has_sponsor: false,
    sponsor_name: "",
    sponsor_type: "",
    sponsor_documents_url: "",
    sponsor_notes: "",
    open_to_sponsorship_connections: false,
    
    // Final
    additional_remarks: ""
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/countries`);
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (submitStatus.message) {
      setSubmitStatus({ message: "", type: "" });
    }
  };

  const validateStep = (step) => {
    const errors = [];
    
    switch(step) {
      case 1:
        if (!formData.email.trim()) errors.push("Email is required");
        if (!formData.nationality) errors.push("Nationality is required");
        if (!formData.country_of_residence) errors.push("Country of residence is required");
        if (!formData.city_of_residence.trim()) errors.push("City is required");
        if (!formData.application_country) errors.push("Application country is required");
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          errors.push("Please enter a valid email address");
        }
        break;
        
      case 3:
        if (!formData.engagement_preference) {
          errors.push("Please select how you'd like to engage");
        }
        if (formData.engagement_preference === 'in-person' && !formData.confirmed_in_person) {
          errors.push("Please confirm your in-person availability");
        }
        break;
        
      case 4:
        if (!formData.why_volunteer.trim()) {
          errors.push("Please tell us why you'd like to volunteer");
        }
        break;
        
      case 5:
        if (formData.has_sponsor && !formData.sponsor_name.trim()) {
          errors.push("Please provide your sponsor's name");
        }
        break;
    }
    
    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setSubmitStatus({ message: errors.join(", "), type: "error" });
      return;
    }
    setSubmitStatus({ message: "", type: "" });
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setSubmitStatus({ message: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setSubmitStatus({ message: errors.join(", "), type: "error" });
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ message: "Submitting your application...", type: "info" });

    try {
      const response = await axios.post(`${API_URL}/volunteer-applications`, formData);
      
      setSubmitStatus({ 
        message: "Application submitted successfully! We'll be in touch soon.", 
        type: "success" 
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.error || 
                          "Failed to submit application. Please try again.";
      setSubmitStatus({ message: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <>
            <h3 className="step-title">Basic Information</h3>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nationality *</label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Nationality</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Country of Residence *</label>
                <select
                  name="country_of_residence"
                  value={formData.country_of_residence}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City of Residence *</label>
                <input
                  type="text"
                  name="city_of_residence"
                  value={formData.city_of_residence}
                  onChange={handleChange}
                  required
                  placeholder="Your city"
                />
              </div>
              
              <div className="form-group">
                <label>Country You're Applying to Volunteer In *</label>
                <select
                  name="application_country"
                  value={formData.application_country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <h3 className="step-title">Professional Background</h3>
            <div className="form-group">
              <label>Core Professional Area</label>
              <input
                type="text"
                name="core_professional_area"
                value={formData.core_professional_area}
                onChange={handleChange}
                placeholder="e.g., Environmental Science, Education, Marketing"
              />
            </div>
            
            <div className="form-group">
              <label>Skills</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="List your relevant skills (e.g., project management, graphic design, data analysis)"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Interests</label>
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="What are you interested in? (e.g., climate action, community development, education)"
                rows="3"
              />
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h3 className="step-title">Availability</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Time Commitment (weeks)</label>
                <input
                  type="number"
                  name="time_commitment_weeks"
                  value={formData.time_commitment_weeks}
                  onChange={handleChange}
                  min="1"
                  placeholder="Number of weeks"
                />
              </div>
              
              <div className="form-group">
                <label>Preferred Duration</label>
                <select
                  name="preferred_duration"
                  value={formData.preferred_duration}
                  onChange={handleChange}
                >
                  <option value="">Select duration</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1+ year">1+ year</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Anticipated Starting Date</label>
              <input
                type="date"
                name="anticipated_start_date"
                value={formData.anticipated_start_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>How would you prefer to engage? *</label>
              <select
                name="engagement_preference"
                value={formData.engagement_preference}
                onChange={handleChange}
                required
              >
                <option value="">Select preference</option>
                <option value="in-person">In-Person</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            {formData.engagement_preference === 'in-person' && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="confirmed_in_person"
                    checked={formData.confirmed_in_person}
                    onChange={handleChange}
                  />
                  <span>
                    I confirm that I am available to volunteer in person in{' '}
                    {formData.application_country || 'the selected country'} *
                  </span>
                </label>
              </div>
            )}
          </>
        );
        
      case 4:
        return (
          <>
            <h3 className="step-title">Motivation</h3>
            <div className="form-group">
              <label>Why would you like to volunteer with ACEF? *</label>
              <textarea
                name="why_volunteer"
                value={formData.why_volunteer}
                onChange={handleChange}
                required
                placeholder="Tell us about your motivation to volunteer..."
                rows="6"
              />
            </div>
          </>
        );
        
      case 5:
        return (
          <>
            <h3 className="step-title">Study Program & Sponsorship</h3>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_study_program"
                  checked={formData.is_study_program}
                  onChange={handleChange}
                />
                <span>
                  Are you doing this in partial fulfillment of a study program?
                </span>
              </label>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="has_sponsor"
                  checked={formData.has_sponsor}
                  onChange={handleChange}
                />
                <span>
                  Do you currently have a sponsor or instructing institution?
                </span>
              </label>
            </div>
            
            {formData.has_sponsor && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sponsor Name *</label>
                    <input
                      type="text"
                      name="sponsor_name"
                      value={formData.sponsor_name}
                      onChange={handleChange}
                      required={formData.has_sponsor}
                      placeholder="Organization or institution name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Sponsor Type</label>
                    <select
                      name="sponsor_type"
                      value={formData.sponsor_type}
                      onChange={handleChange}
                    >
                      <option value="">Select type</option>
                      <option value="University">University</option>
                      <option value="Organization">Organization</option>
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Supporting Documents URL</label>
                  <input
                    type="url"
                    name="sponsor_documents_url"
                    value={formData.sponsor_documents_url}
                    onChange={handleChange}
                    placeholder="Link to documents (Google Drive, Dropbox, etc.)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Notes on Sponsorship</label>
                  <textarea
                    name="sponsor_notes"
                    value={formData.sponsor_notes}
                    onChange={handleChange}
                    placeholder="Any additional information about your sponsorship"
                    rows="3"
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="open_to_sponsorship_connections"
                  checked={formData.open_to_sponsorship_connections}
                  onChange={handleChange}
                />
                <span>
                  I would like to be considered for potential sponsorship opportunities
                </span>
              </label>
            </div>
          </>
        );
        
      case 6:
        return (
          <>
            <h3 className="step-title">Final Remarks</h3>
            <div className="form-group">
              <label>Additional Remarks</label>
              <textarea
                name="additional_remarks"
                value={formData.additional_remarks}
                onChange={handleChange}
                placeholder="Any additional information you'd like to share..."
                rows="5"
              />
            </div>
            
            <div className="summary-box">
              <h4>Application Summary</h4>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Applying to:</strong> {formData.application_country}</p>
              <p><strong>Engagement:</strong> {formData.engagement_preference}</p>
              <p><strong>Study Program:</strong> {formData.is_study_program ? 'Yes' : 'No'}</p>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="volunteer-form-container">
      <style>{`
        .volunteer-form-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .form-header h1 {
          font-size: 2rem;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }
        
        .form-header p {
          color: #64748b;
          margin: 0;
        }
        
        .progress-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }
        
        .progress-bar::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e2e8f0;
          z-index: 0;
        }
        
        .progress-step {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: all 0.3s;
        }
        
        .step-circle.active {
          background: #0a451c;
          color: white;
        }
        
        .step-circle.completed {
          background: #10b981;
          color: white;
        }
        
        .step-label {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
        }
        
        .form-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        
        .step-title {
          font-size: 1.5rem;
          color: #1e293b;
          margin: 0 0 1.5rem 0;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="url"],
        input[type="date"],
        input[type="number"],
        select,
        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #0a451c;
          box-shadow: 0 0 0 3px rgba(10, 69, 28, 0.1);
        }
        
        textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin-top: 0.25rem;
        }
        
        .checkbox-label span {
          flex: 1;
        }
        
        .summary-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .summary-box h4 {
          margin: 0 0 1rem 0;
          color: #1e293b;
        }
        
        .summary-box p {
          margin: 0.5rem 0;
          color: #64748b;
        }
        
        .status-message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        
        .status-message.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        
        .status-message.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        
        .status-message.info {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: #f1f5f9;
          color: #64748b;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }
        
        .btn-primary {
          background: #0a451c;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #0d5a24;
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .volunteer-form-container {
            padding: 1rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .progress-bar {
            overflow-x: auto;
          }
          
          .step-label {
            display: none;
          }
        }
      `}</style>
      
      <div className="form-header">
        <h1>Volunteer Application</h1>
        <p>Join ACEF and make a difference in environmental conservation</p>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-bar">
        {[1, 2, 3, 4, 5, 6].map(step => (
          <div key={step} className="progress-step">
            <div className={`step-circle ${
              currentStep === step ? 'active' : 
              currentStep > step ? 'completed' : ''
            }`}>
              {currentStep > step ? '✓' : step}
            </div>
            <span className="step-label">
              {step === 1 && 'Basic'}
              {step === 2 && 'Professional'}
              {step === 3 && 'Availability'}
              {step === 4 && 'Motivation'}
              {step === 5 && 'Sponsorship'}
              {step === 6 && 'Review'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="form-card">
        {submitStatus.message && (
          <div className={`status-message ${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {renderStep()}
          
          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={prevStep}
                disabled={submitting}
              >
                Previous
              </button>
            )}
            
            <div style={{ flex: 1 }} />
            
            {currentStep < 6 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={nextStep}
                disabled={submitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerApplicationForm;