import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const AdminVolunteerManagement = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [stats, setStats] = useState(null);
  
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    mode: "single" // "single" or "bulk"
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchApplications();
      fetchStats();
    }
  }, [selectedCountry, selectedStatus]);

  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/countries`);
      setCountries(data);
    } catch (error) {
      showMessage("error", "Failed to fetch countries");
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/volunteer-applications/admin/country/${selectedCountry}`;
      if (selectedStatus !== "all") {
        url = `${API_URL}/volunteer-applications/admin/status/${selectedStatus}?country=${selectedCountry}`;
      }
      const { data } = await axios.get(url);
      setApplications(data);
    } catch (error) {
      showMessage("error", "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/volunteer-applications/admin/stats/${selectedCountry}`
      );
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleViewDetails = async (app) => {
    setSelectedApplication(app);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (appId, newStatus, reason = "") => {
    try {
      await axios.put(`${API_URL}/volunteer-applications/admin/${appId}/status`, {
        status: newStatus,
        reason,
        reviewedBy: "Admin"
      });
      showMessage("success", `Application ${newStatus}`);
      fetchApplications();
      fetchStats();
      setShowDetailModal(false);
    } catch (error) {
      showMessage("error", error.response?.data?.error || "Failed to update status");
    }
  };

  const handleEmailSingle = (app) => {
    setSelectedApplication(app);
    setEmailForm({
      subject: `Regarding Your Volunteer Application - ${selectedCountry}`,
      message: "",
      mode: "single"
    });
    setShowEmailModal(true);
  };

  const handleEmailBulk = () => {
    if (applications.length === 0) {
      showMessage("error", "No applications to email");
      return;
    }
    setEmailForm({
      subject: `Update on Volunteer Applications - ${selectedCountry}`,
      message: "",
      mode: "bulk"
    });
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    try {
      if (emailForm.mode === "single") {
        await axios.post(`${API_URL}/volunteer-applications/admin/email-single`, {
          applicationId: selectedApplication.id,
          subject: emailForm.subject,
          message: emailForm.message,
          sentBy: "Admin"
        });
        showMessage("success", "Email sent successfully");
      } else {
        const applicationIds = applications.map(a => a.id);
        await axios.post(`${API_URL}/volunteer-applications/admin/email-bulk`, {
          applicationIds,
          subject: emailForm.subject,
          message: emailForm.message,
          sentBy: "Admin"
        });
        showMessage("success", `Email sent to ${applications.length} applicants`);
      }
      setShowEmailModal(false);
    } catch (error) {
      showMessage("error", "Failed to send email");
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Email', 'Nationality', 'City', 'Professional Area', 'Skills',
      'Engagement', 'Status', 'Applied Date'
    ];
    
    const rows = applications.map(app => [
      app.email,
      app.nationality,
      app.city_of_residence,
      app.core_professional_area || 'N/A',
      app.skills || 'N/A',
      app.engagement_preference,
      app.status,
      new Date(app.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `volunteer_applications_${selectedCountry}_${Date.now()}.csv`;
    link.click();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      under_review: '#3b82f6',
      shortlisted: '#8b5cf6',
      accepted: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="admin-container">
      <style>{`
        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .admin-header {
          margin-bottom: 2rem;
        }
        
        .admin-header h1 {
          font-size: 2rem;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }
        
        .admin-header p {
          color: #64748b;
          margin: 0;
        }
        
        .filter-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .filter-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr;
          gap: 1rem;
          align-items: end;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-group label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        select, input {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card h3 {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .stat-card p {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
        
        .message-alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        
        .message-alert.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        
        .message-alert.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        
        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: #0a451c;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0d5a24;
          transform: translateY(-1px);
        }
        
        .btn-secondary {
          background: #3b82f6;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #2563eb;
        }
        
        .applications-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        td {
          padding: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        
        tr:hover {
          background: #f8fafc;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .btn-view {
          background: #8b5cf6;
          color: white;
        }
        
        .btn-view:hover {
          background: #7c3aed;
        }
        
        .btn-email {
          background: #10b981;
          color: white;
        }
        
        .btn-email:hover {
          background: #059669;
        }
        
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1e293b;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
          padding: 0.5rem;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .detail-section {
          margin-bottom: 1.5rem;
        }
        
        .detail-section h3 {
          font-size: 1rem;
          color: #374151;
          margin: 0 0 0.75rem 0;
          font-weight: 600;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        
        .detail-value {
          font-size: 0.875rem;
          color: #1e293b;
        }
        
        .status-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        
        .btn-status {
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .btn-accept {
          background: #10b981;
          color: white;
        }
        
        .btn-accept:hover {
          background: #059669;
        }
        
        .btn-reject {
          background: #ef4444;
          color: white;
        }
        
        .btn-reject:hover {
          background: #dc2626;
        }
        
        .btn-review {
          background: #3b82f6;
          color: white;
        }
        
        .btn-review:hover {
          background: #2563eb;
        }
        
        .btn-shortlist {
          background: #8b5cf6;
          color: white;
        }
        
        .btn-shortlist:hover {
          background: #7c3aed;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          min-height: 100px;
          resize: vertical;
          box-sizing: border-box;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .btn-cancel {
          background: #f1f5f9;
          color: #64748b;
          flex: 1;
        }
        
        .btn-cancel:hover {
          background: #e2e8f0;
        }
        
        .btn-send {
          background: #10b981;
          color: white;
          flex: 1;
        }
        
        .btn-send:hover {
          background: #059669;
        }
        
        .no-data {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
        
        @media (max-width: 768px) {
          .filter-row {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .detail-grid {
            grid-template-columns: 1fr;
          }
          
          .status-actions {
            grid-template-columns: 1fr;
          }
          
          table {
            font-size: 0.875rem;
          }
          
          th, td {
            padding: 0.5rem;
          }
        }
      `}</style>

      <div className="admin-header">
        <h1>Volunteer Applications</h1>
        <p>Manage volunteer applications by country</p>
      </div>

      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={!selectedCountry}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <button
              className="btn btn-secondary"
              onClick={exportToCSV}
              disabled={!selectedCountry || applications.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Applications</h3>
            <p style={{ color: '#0a451c' }}>{stats.total}</p>
          </div>
          {stats.by_status.map((s) => (
            <div key={s.status} className="stat-card">
              <h3>{s.status.replace(/_/g, ' ')}</h3>
              <p style={{ color: getStatusColor(s.status) }}>{s.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions Bar */}
      {selectedCountry && applications.length > 0 && (
        <div className="actions-bar">
          <h2 style={{ margin: 0, color: '#1e293b' }}>
            {applications.length} Application{applications.length !== 1 ? 's' : ''}
          </h2>
          <button className="btn btn-primary" onClick={handleEmailBulk}>
            Email All ({applications.length})
          </button>
        </div>
      )}

      {/* Applications Table */}
      {loading ? (
        <div className="loading">Loading applications...</div>
      ) : !selectedCountry ? (
        <div className="no-data">
          <p>Please select a country to view applications</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="no-data">
          <p>No applications found for the selected filters</p>
        </div>
      ) : (
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Nationality</th>
                <th>City</th>
                <th>Professional Area</th>
                <th>Engagement</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.email}</td>
                  <td>{app.nationality}</td>
                  <td>{app.city_of_residence}</td>
                  <td>{app.core_professional_area || 'N/A'}</td>
                  <td>{app.engagement_preference}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-small btn-view"
                        onClick={() => handleViewDetails(app)}
                      >
                        View
                      </button>
                      <button
                        className="btn-small btn-email"
                        onClick={() => handleEmailSingle(app)}
                      >
                        Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="modal" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Basic Info */}
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedApplication.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nationality</span>
                    <span className="detail-value">{selectedApplication.nationality}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Country of Residence</span>
                    <span className="detail-value">{selectedApplication.country_of_residence}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City</span>
                    <span className="detail-value">{selectedApplication.city_of_residence}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Applying to</span>
                    <span className="detail-value">{selectedApplication.application_country}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedApplication.status) }}
                    >
                      {selectedApplication.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="detail-section">
                <h3>Professional Background</h3>
                <div className="detail-item" style={{ marginBottom: '1rem' }}>
                  <span className="detail-label">Core Professional Area</span>
                  <span className="detail-value">
                    {selectedApplication.core_professional_area || 'Not provided'}
                  </span>
                </div>
                <div className="detail-item" style={{ marginBottom: '1rem' }}>
                  <span className="detail-label">Skills</span>
                  <span className="detail-value">
                    {selectedApplication.skills || 'Not provided'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Interests</span>
                  <span className="detail-value">
                    {selectedApplication.interests || 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Availability */}
              <div className="detail-section">
                <h3>Availability</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Time Commitment</span>
                    <span className="detail-value">
                      {selectedApplication.time_commitment_weeks 
                        ? `${selectedApplication.time_commitment_weeks} weeks`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Preferred Duration</span>
                    <span className="detail-value">
                      {selectedApplication.preferred_duration || 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Start Date</span>
                    <span className="detail-value">
                      {selectedApplication.anticipated_start_date
                        ? new Date(selectedApplication.anticipated_start_date).toLocaleDateString()
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Engagement Preference</span>
                    <span className="detail-value">
                      {selectedApplication.engagement_preference}
                    </span>
                  </div>
                </div>
              </div>

              {/* Motivation */}
              <div className="detail-section">
                <h3>Motivation</h3>
                <div className="detail-item">
                  <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedApplication.why_volunteer || 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Sponsorship */}
              {(selectedApplication.is_study_program || selectedApplication.has_sponsor) && (
                <div className="detail-section">
                  <h3>Study Program & Sponsorship</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Study Program</span>
                      <span className="detail-value">
                        {selectedApplication.is_study_program ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Has Sponsor</span>
                      <span className="detail-value">
                        {selectedApplication.has_sponsor ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedApplication.has_sponsor && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Sponsor Name</span>
                          <span className="detail-value">
                            {selectedApplication.sponsor_name}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Sponsor Type</span>
                          <span className="detail-value">
                            {selectedApplication.sponsor_type || 'Not specified'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="detail-section">
                <h3>Update Status</h3>
                <div className="status-actions">
                  <button
                    className="btn-status btn-review"
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'under_review')}
                    disabled={selectedApplication.status === 'under_review'}
                  >
                    Under Review
                  </button>
                  <button
                    className="btn-status btn-shortlist"
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'shortlisted')}
                    disabled={selectedApplication.status === 'shortlisted'}
                  >
                    Shortlist
                  </button>
                  <button
                    className="btn-status btn-accept"
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'accepted')}
                    disabled={selectedApplication.status === 'accepted'}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-status btn-reject"
                    onClick={() => {
                      const reason = prompt('Rejection reason (optional):');
                      handleStatusUpdate(selectedApplication.id, 'rejected', reason || '');
                    }}
                    disabled={selectedApplication.status === 'rejected'}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {emailForm.mode === 'single' 
                  ? `Email ${selectedApplication?.email}`
                  : `Email ${applications.length} Applicants`}
              </h2>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, subject: e.target.value })
                  }
                  placeholder="Email subject"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, message: e.target.value })
                  }
                  placeholder="Your message to applicants..."
                  rows="8"
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-send"
                  onClick={sendEmail}
                  disabled={!emailForm.subject || !emailForm.message}
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteerManagement;