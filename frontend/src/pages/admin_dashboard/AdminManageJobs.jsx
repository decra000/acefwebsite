import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";

const AdminManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState({});
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null); // null means "all applicants"
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: ""
  });
  const [isEmailSending, setIsEmailSending] = useState(false);

  // New states for form visibility and notifications
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [form, setForm] = useState({
    title: "",
    level: "",
    location: "",
    description: "",
    requirements: "",
    salary: "",
    lastDate: "",
    createdBy: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Job levels
  const jobLevels = [
    "Entry Level",
    "Junior",
    "Mid Level", 
    "Senior",
    "Lead",
    "Manager",
    "Director",
    "Executive"
  ];

  // Custom notification system
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/jobs`);
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showNotification("Error fetching jobs", "error");
    }
  };

 // Fetch job applications for all jobs
const fetchJobApplications = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/job-applications`);
    // Group applications by jobId (not job_id)
    const groupedApplications = data.reduce((acc, application) => {
      if (!acc[application.jobId]) {  // Changed from job_id to jobId
        acc[application.jobId] = [];
      }
      acc[application.jobId].push(application);
      return acc;
    }, {});
    setJobApplications(groupedApplications);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    showNotification("Error fetching job applications", "error");
  }
};

  useEffect(() => {
    fetchJobs();
    fetchJobApplications();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle email form change
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm({ ...emailForm, [name]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...form,
        lastDate: form.lastDate ? new Date(form.lastDate).toISOString() : null,
      };

      if (editingId) {
        await axios.put(`${API_URL}/jobs/${editingId}`, jobData);
        showNotification("Job updated successfully!");
      } else {
        await axios.post(`${API_URL}/jobs`, jobData);
        showNotification("Job created successfully!");
      }

      setForm({
        title: "",
        level: "",
        location: "",
        description: "",
        requirements: "",
        salary: "",
        lastDate: "",
        createdBy: "",
      });
      setEditingId(null);
      setShowForm(false); // Hide form after successful submission
      fetchJobs();
      fetchJobApplications();
    } catch (error) {
      console.error("Error submitting form:", error);
      showNotification("Error saving job. Please try again.", "error");
    }
  };

  // Edit job
  const handleEdit = (job) => {
    setForm({
      title: job.title,
      level: job.level,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary || "",
      lastDate: job.lastDate ? job.lastDate.slice(0, 16) : "",
      createdBy: job.createdBy,
    });
    setEditingId(job.id);
    setShowForm(true); // Show form when editing
  };

  // Delete job
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${API_URL}/jobs/${id}`);
        showNotification("Job deleted successfully!");
        fetchJobs();
        fetchJobApplications();
      } catch (error) {
        console.error("Error deleting job:", error);
        showNotification("Error deleting job. Please try again.", "error");
      }
    }
  };

 // Handle viewing job applications
const handleViewApplications = (job) => {
  const applications = jobApplications[job.id] || []; // This should work if job.id matches jobId
  setSelectedJobApplications(applications);
  setSelectedJobTitle(job.title);
  setSelectedJob(job);
  setShowApplicationsModal(true);
};

  // Handle deleting an application
  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await axios.delete(`${API_URL}/job-applications/${applicationId}`);
        showNotification("Application deleted successfully!");
        fetchJobApplications();
        const updatedApplications = selectedJobApplications.filter(app => app.id !== applicationId);
        setSelectedJobApplications(updatedApplications);
      } catch (error) {
        console.error("Error deleting application:", error);
        showNotification("Error deleting application. Please try again.", "error");
      }
    }
  };

  // Handle opening email modal
  const handleOpenEmailModal = (applicant = null) => {
    setSelectedApplicant(applicant);
    
    // Set default subject based on whether it's for a specific applicant or all
    const defaultSubject = applicant 
      ? `Response to your ${selectedJobTitle} application`
      : `Update regarding your ${selectedJobTitle} application`;
      
    setEmailForm({
      subject: defaultSubject,
      message: ""
    });
    setShowEmailModal(true);
  };

  // Handle sending email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsEmailSending(true);
    
    try {
      if (selectedApplicant) {
        // Send to specific applicant
        await axios.post(`${API_URL}/job-applications/reply`, {
          applicantEmail: selectedApplicant.email,
          applicantName: selectedApplicant.name,
          jobTitle: selectedJobTitle,
          message: emailForm.message,
          subject: emailForm.subject
        });
        showNotification(`Email sent successfully to ${selectedApplicant.name}!`);
      } else {
        // Send to all applicants for this job
        const emailPromises = selectedJobApplications.map(applicant =>
          axios.post(`${API_URL}/job-applications/reply`, {
            applicantEmail: applicant.email,
            applicantName: applicant.name,
            jobTitle: selectedJobTitle,
            message: emailForm.message,
            subject: emailForm.subject
          })
        );
        
        await Promise.all(emailPromises);
        showNotification(`Email sent successfully to all ${selectedJobApplications.length} applicants!`);
      }

      setShowEmailModal(false);
      setEmailForm({ subject: "", message: "" });
      setSelectedApplicant(null);
    } catch (error) {
      console.error("Error sending email:", error);
      showNotification("Failed to send email. Please try again.", "error");
    } finally {
      setIsEmailSending(false);
    }
  };

  const closeApplicationsModal = () => {
    setShowApplicationsModal(false);
    setSelectedJobApplications([]);
    setSelectedJobTitle("");
    setSelectedJob(null);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailForm({ subject: "", message: "" });
    setSelectedApplicant(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = (deadline) => {
    return deadline && new Date(deadline) < new Date();
  };

  const handleCancelEdit = () => {
    setForm({
      title: "",
      level: "",
      location: "",
      description: "",
      requirements: "",
      salary: "",
      lastDate: "",
      createdBy: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <>
      <style>{`
        .admin-jobs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f8fafc;
          min-height: 100vh;
          position: relative;
        }

        .admin-jobs-header {
          margin-bottom: 2rem;
        }

        .admin-jobs-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .admin-jobs-subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .form-toggle-section {
          margin-bottom: 2rem;
        }

        .form-toggle-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .form-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .form-toggle-btn:active {
          transform: translateY(0);
        }

        .form-toggle-icon {
          transition: transform 0.3s ease;
          font-size: 1.2rem;
        }

        .form-toggle-btn.active .form-toggle-icon {
          transform: rotate(180deg);
        }

        .admin-jobs-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top;
        }

        .form-collapsible {
          opacity: 0;
          max-height: 0;
          transform: scaleY(0);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-collapsible.show {
          opacity: 1;
          max-height: 2000px;
          transform: scaleY(1);
        }

        .form-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 1.5rem 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group-full {
          grid-column: 1 / -1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
          font-family: inherit;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background-color: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #4b5563;
        }

        .btn-success {
          background-color: #10b981;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .jobs-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .table-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #334155;
          margin: 0;
        }

        .jobs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .jobs-table th {
          background-color: #f8fafc;
          color: #374151;
          font-weight: 600;
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .jobs-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .jobs-table tr:hover {
          background-color: #f8fafc;
        }

        .job-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit {
          background-color: #f59e0b;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn-edit:hover {
          background-color: #d97706;
          transform: translateY(-1px);
        }

        .btn-delete {
          background-color: #dc2626;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn-delete:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .date-text {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .level-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #e0f2fe;
          color: #0369a1;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .salary-text {
          font-weight: 600;
          color: #059669;
        }

        .deadline-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .deadline-active {
          background-color: #dcfce7;
          color: #166534;
        }

        .deadline-expired {
          background-color: #fef2f2;
          color: #dc2626;
        }

        .applications-btn {
          background-color: #8b5cf6;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .applications-btn:hover {
          background-color: #7c3aed;
          transform: translateY(-1px);
        }

        .applications-count {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 0.125rem 0.375rem;
          font-size: 0.625rem;
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: modalSlideIn 0.3s ease;
        }

        .modal-content.email-modal {
          max-width: 600px;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .modal-subtitle {
          color: #64748b;
          margin: 0;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background-color: #f1f5f9;
          color: #374151;
        }

        .modal-body {
          padding: 2rem;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .applications-table th {
          background-color: #f8fafc;
          color: #374151;
          font-weight: 600;
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .applications-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .applications-table tr:hover {
          background-color: #f8fafc;
        }

        .applicant-name {
          font-weight: 600;
          color: #1e293b;
        }

        .applicant-email {
          color: #3b82f6;
          text-decoration: none;
        }

        .applicant-email:hover {
          text-decoration: underline;
        }

        .applicant-phone {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .applicant-message {
          color: #374151;
          font-style: italic;
          max-width: 200px;
          word-wrap: break-word;
        }

        .application-date {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .btn-delete-application {
          background-color: #dc2626;
          color: white;
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn-delete-application:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .btn-email {
          background-color: #10b981;
          color: white;
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          margin-right: 0.5rem;
        }

        .btn-email:hover {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .email-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .no-applications {
          text-align: center;
          padding: 3rem 2rem;
          color: #6b7280;
        }

        .no-applications-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .export-btn {
          background-color: #059669;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .export-btn:hover {
          background-color: #047857;
          transform: translateY(-1px);
        }

        .no-jobs {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .resume-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .resume-link:hover {
          text-decoration: underline;
        }

        .email-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .application-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        /* Notification System Styles */
        .notifications-container {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 2000;
          max-width: 400px;
          pointer-events: none;
        }

        .notification {
          background: white;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 0.75rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-left: 4px solid;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: all;
          animation: slideInRight 0.3s ease;
          transition: all 0.3s ease;
        }

        .notification.success {
          border-left-color: #10b981;
        }

        .notification.error {
          border-left-color: #dc2626;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .notification-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .notification.success .notification-icon {
          color: #10b981;
        }

        .notification.error .notification-icon {
          color: #dc2626;
        }

        .notification-message {
          color: #374151;
          font-weight: 500;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .notification-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
          margin-left: 1rem;
          flex-shrink: 0;
        }

        .notification-close:hover {
          background-color: #f3f4f6;
          color: #374151;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .admin-jobs-container {
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .jobs-table-container {
            overflow-x: auto;
          }

          .jobs-table {
            min-width: 1000px;
          }

          .job-actions {
            flex-direction: column;
          }

          .modal-content {
            margin: 1rem;
            max-width: calc(100vw - 2rem);
          }

          .modal-header,
          .modal-body {
            padding: 1.5rem;
          }

          .email-actions {
            flex-direction: column;
          }

          .application-actions {
            flex-direction: column;
          }

          .notifications-container {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
          }

          .notification {
            margin-bottom: 0.5rem;
          }
        }
      `}</style>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <div className="notification-content">
              <div className="notification-icon">
                {notification.type === 'success' ? '✅' : '❌'}
              </div>
              <div className="notification-message">{notification.message}</div>
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="admin-jobs-container">
        <header className="admin-jobs-header">
          <h1 className="admin-jobs-title">Job Management</h1>
          <p className="admin-jobs-subtitle">Create, edit, and manage job postings</p>
        </header>

        {/* Form Toggle Section */}
        <div className="form-toggle-section">
          <button 
            className={`form-toggle-btn ${showForm ? 'active' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            <span className="form-toggle-icon">⬇</span>
            {editingId ? "Edit Job" : "Create New Job"}
          </button>
        </div>

        {/* Collapsible Form */}
        <div className={`form-collapsible ${showForm ? 'show' : ''}`}>
          <div className="admin-jobs-form">
            <h2 className="form-title">
              {editingId ? "Edit Job" : "Create New Job"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter job title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Level *</label>
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Level</option>
                    {jobLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter job location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g., $50,000 - $70,000"
                    value={form.salary}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input
                    type="datetime-local"
                    name="lastDate"
                    value={form.lastDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Created By</label>
                  <input
                    type="text"
                    name="createdBy"
                    placeholder="HR Manager, John Doe, etc."
                    value={form.createdBy}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Job Description *</label>
                  <textarea
                    name="description"
                    placeholder="Enter detailed job description..."
                    value={form.description}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Requirements *</label>
                  <textarea
                    name="requirements"
                    placeholder="Enter job requirements and qualifications..."
                    value={form.requirements}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Job" : "Create Job"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  {editingId ? "Cancel Edit" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="jobs-table-container">
          <div className="table-header">
            <h3 className="table-title">All Jobs ({jobs.length})</h3>
          </div>
          
          {jobs.length === 0 ? (
            <div className="no-jobs">
              <p>No jobs found. Create your first job posting above.</p>
            </div>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Applications</th>
                  <th>Deadline</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>
                      <span className="level-badge">{job.level}</span>
                    </td>
                    <td>{job.location}</td>
                    <td>
                      {job.salary ? (
                        <span className="salary-text">{job.salary}</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Not specified</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewApplications(job)}
                        className="applications-btn"
                        title="View job applications"
                      >
                        📄 
                        <span className="applications-count">
                          {jobApplications[job.id]?.length || 0}
                        </span>
                      </button>
                    </td>
                    <td>
                      {job.lastDate ? (
                        <span className={`deadline-badge ${
                          isDeadlinePassed(job.lastDate) ? 'deadline-expired' : 'deadline-active'
                        }`}>
                          {formatDate(job.lastDate)}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>No deadline</span>
                      )}
                    </td>
                    <td className="date-text">
                      {job.createdBy || 'Unknown'}
                    </td>
                    <td>
                      <div className="job-actions">
                        <button
                          onClick={() => handleEdit(job)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Applications Modal */}
        {showApplicationsModal && (
          <div className="modal-overlay" onClick={closeApplicationsModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeApplicationsModal}>
                ×
              </button>
              
              <div className="modal-header">
                <h2 className="modal-title">Job Applications</h2>
                <p className="modal-subtitle">
                  {selectedJobTitle} • {selectedJobApplications.length} applications
                </p>
              </div>

              <div className="modal-body">
                {selectedJobApplications.length === 0 ? (
                  <div className="no-applications">
                    <h3 className="no-applications-title">No applications yet</h3>
                    <p>No one has applied for this job yet.</p>
                  </div>
                ) : (
                  <>
                    {/* Email Actions */}
                    <div className="email-actions">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleOpenEmailModal()}
                      >
                        ✉️ Email All Applicants ({selectedJobApplications.length})
                      </button>
                      
                      <button 
                        className="export-btn"
                        onClick={() => {
                          const csvContent = [
                            'Name,Email,Phone,Cover Letter,Resume,Applied Date',
                            ...selectedJobApplications.map(app => 
                              `"${app.name}","${app.email}","${app.phone || 'N/A'}","${app.coverLetter || 'N/A'}","${app.resumeUrl || 'N/A'}","${formatDate(app.createdAt)}"`
                            )
                          ].join('\n');
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          const url = URL.createObjectURL(blob);
                          link.setAttribute('href', url);
                          link.setAttribute('download', `${selectedJobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_applications.csv`);
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        📥 Export to CSV
                      </button>
                    </div>

                    <table className="applications-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Contact</th>
                          <th>Cover Letter</th>
                          <th>Resume</th>
                          <th>Applied</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedJobApplications.map((application) => (
                          <tr key={application.id}>
                            <td>
                              <div className="applicant-name">{application.name}</div>
                            </td>
                            <td>
                              <div>
                                <a 
                                  href={`mailto:${application.email}`}
                                  className="applicant-email"
                                >
                                  {application.email}
                                </a>
                              </div>
                              {application.phone && (
                                <div className="applicant-phone">
                                  {application.phone}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="applicant-message">
                                {application.coverLetter || 'No cover letter provided'}
                              </div>
                            </td>
                            <td>
                              {application.cvPath ? (
                                <a 
                                  href={application.cvPath} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="resume-link"
                                >
                                  📄 View Resume
                                </a>
                              ) : (
                                <span style={{ color: '#6b7280' }}>No resume</span>
                              )}
                            </td>
                            <td>
                              <div className="application-date">
                                {formatDate(application.createdAt)}
                              </div>
                            </td>
                            <td>
                              <div className="application-actions">
                                <button
                                  onClick={() => handleOpenEmailModal(application)}
                                  className="btn-email"
                                  title="Send email to this applicant"
                                >
                                  ✉️ Email
                                </button>
                                <button
                                  onClick={() => handleDeleteApplication(application.id)}
                                  className="btn-delete-application"
                                  title="Delete this application"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="modal-overlay" onClick={closeEmailModal}>
            <div className="modal-content email-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeEmailModal}>
                ×
              </button>
              
              <div className="modal-header">
                <h2 className="modal-title">Send Email</h2>
                <p className="modal-subtitle">
                  {selectedApplicant 
                    ? `To: ${selectedApplicant.name} (${selectedApplicant.email})`
                    : `To: All applicants for ${selectedJobTitle} (${selectedJobApplications.length} recipients)`
                  }
                </p>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSendEmail} className="email-form">
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={emailForm.subject}
                      onChange={handleEmailChange}
                      required
                      className="form-input"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      name="message"
                      value={emailForm.message}
                      onChange={handleEmailChange}
                      required
                      className="form-textarea"
                      placeholder={selectedApplicant 
                        ? `Write your message to ${selectedApplicant.name}...`
                        : `Write your message to all applicants...`
                      }
                      rows="8"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isEmailSending}
                    >
                      {isEmailSending ? (
                        <>
                          <span className="loading-spinner"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          ✉️ Send Email
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={closeEmailModal}
                      disabled={isEmailSending}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminManageJobs;