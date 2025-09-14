import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, MessageSquare, Calendar, User, Mail, Phone,
  Clock, CheckCircle, AlertTriangle, Star, TrendingUp, Users, 
  RefreshCw, Download, Send, X, Plus, ArrowRight, Edit3
} from 'lucide-react';

const AdminCollaborationManagement = ({ API_BASE = 'http://localhost:5000/api' }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    thisMonth: 0,
    pendingReview: 0,
    overdue: 0
  });

  const [contactForm, setContactForm] = useState({
    contactType: 'email',
    subject: '',
    message: '',
    contactMethod: ''
  });

  const [statusForm, setStatusForm] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    adminNotes: '',
    followUpDate: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Enhanced notification system
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    const colors = {
      success: { bg: '#10b981', text: '#ffffff' },
      error: { bg: '#ef4444', text: '#ffffff' },
      info: { bg: '#3b82f6', text: '#ffffff' },
      warning: { bg: '#f59e0b', text: '#ffffff' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color.bg};
      color: ${color.text};
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Inter', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 450px;
      word-wrap: break-word;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  };

  // Calculate statistics from current filtered reports
  const calculateStatistics = (reportsList) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonth = reportsList.filter(report => {
      const reportDate = new Date(report.created_at);
      return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
    }).length;

    const pendingReview = reportsList.filter(report => 
      report.status === 'new' || report.status === 'under_review'
    ).length;

    const overdue = reportsList.filter(report => {
      if (!report.follow_up_date) return false;
      const followUpDate = new Date(report.follow_up_date);
      return followUpDate < now && report.status !== 'completed' && report.status !== 'declined';
    }).length;

    return {
      total: reportsList.length,
      thisMonth: thisMonth,
      pendingReview: pendingReview,
      overdue: overdue
    };
  };

  // Enhanced fetch reports with better error handling
  const fetchReports = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      console.log('Fetching from:', `${API_BASE}/collaboration/admin/all?${params}`);
      
      const response = await fetch(`${API_BASE}/collaboration/admin/all?${params}`, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server did not return JSON data');
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.success) {
        const reportsList = data.data?.reports || [];
        const paginationData = data.data?.pagination || {
          page: 1,
          limit: 20,
          total: reportsList.length,
          pages: Math.ceil(reportsList.length / 20)
        };

        setReports(reportsList);
        setFilteredReports(reportsList);
        setPagination(paginationData);
        
        // Calculate and update statistics
        const newStats = calculateStatistics(reportsList);
        setStatistics(newStats);
        
        if (reportsList.length === 0) {
          console.log('No reports found');
        }
      } else {
        throw new Error(data.message || 'API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching collaboration reports:', error);
      setError(error.message);
      showNotification(`Failed to fetch reports: ${error.message}`, 'error');
      
      // Set empty state on error
      setReports([]);
      setFilteredReports([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      });
      setStatistics({
        total: 0,
        thisMonth: 0,
        pendingReview: 0,
        overdue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced report details loading
  const loadReportDetails = async (reportId) => {
    try {
      console.log('Loading report details for ID:', reportId);
      
      const response = await fetch(`${API_BASE}/collaboration/admin/${reportId}`, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Report details:', data);
        
        if (data.success) {
          setSelectedReport(data.data);
        } else {
          throw new Error(data.message || 'Failed to load report details');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading report details:', error);
      showNotification(`Failed to load report details: ${error.message}`, 'error');
    }
  };

  // Enhanced status update
  const updateStatus = async () => {
    if (!selectedReport) return;

    try {
      console.log('Updating status for report:', selectedReport.id);
      
      const response = await fetch(`${API_BASE}/collaboration/admin/${selectedReport.id}/status`, {
        method: 'PUT',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(statusForm)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          showNotification('Report status updated successfully', 'success');
          setShowStatusModal(false);
          fetchReports(pagination.page);
          if (selectedReport) {
            loadReportDetails(selectedReport.id);
          }
        } else {
          throw new Error(data.message || 'Failed to update status');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification(`Failed to update status: ${error.message}`, 'error');
    }
  };

  // Enhanced contact addition
  const addContact = async () => {
    if (!selectedReport) return;

    try {
      console.log('Adding contact for report:', selectedReport.id);
      
      const response = await fetch(`${API_BASE}/collaboration/admin/${selectedReport.id}/contact`, {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contactForm)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          showNotification('Contact record added successfully', 'success');
          setShowContactModal(false);
          setContactForm({
            contactType: 'email',
            subject: '',
            message: '',
            contactMethod: ''
          });
          fetchReports(pagination.page);
          if (selectedReport) {
            loadReportDetails(selectedReport.id);
          }
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      showNotification(`Failed to send message: ${error.message}`, 'error');
    }
  };

  // Enhanced search and filtering
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchReports(1); // Reset to page 1 when searching/filtering
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [activeTab, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchReports();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: '#3b82f6', bg: '#dbeafe', label: 'New' },
      under_review: { color: '#f59e0b', bg: '#fef3c7', label: 'Under Review' },
      contacted: { color: '#8b5cf6', bg: '#ede9fe', label: 'Contacted' },
      in_progress: { color: '#10b981', bg: '#d1fae5', label: 'In Progress' },
      completed: { color: '#059669', bg: '#a7f3d0', label: 'Completed' },
      declined: { color: '#6b7280', bg: '#f3f4f6', label: 'Declined' }
    };

    const config = statusConfig[status] || statusConfig.new;
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        textTransform: 'uppercase'
      }}>
        {config.label}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    if (!priority) priority = 'medium';
    
    const priorityConfig = {
      low: { color: '#6b7280', bg: '#f3f4f6' },
      medium: { color: '#3b82f6', bg: '#dbeafe' },
      high: { color: '#f59e0b', bg: '#fef3c7' },
      urgent: { color: '#ef4444', bg: '#fee2e2' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {priority}
      </span>
    );
  };

  // Enhanced report data rendering with error handling
  const renderReportData = (data) => {
    if (!data || typeof data !== 'object') {
      return <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No additional data available</div>;
    }

    try {
      const entries = Object.entries(data).filter(([key, value]) => 
        value !== null && value !== undefined && value !== ''
      );

      if (entries.length === 0) {
        return <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No data to display</div>;
      }

      return entries.map(([key, value]) => {
        const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return (
          <div key={key} style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '4px',
              textTransform: 'capitalize'
            }}>
              {displayKey}:
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#1f2937',
              backgroundColor: '#f9fafb',
              padding: '8px 12px',
              borderRadius: '6px',
              whiteSpace: 'pre-wrap'
            }}>
              {typeof value === 'string' && value.length > 100 
                ? `${value.substring(0, 100)}...` 
                : String(value)
              }
            </div>
          </div>
        );
      });
    } catch (error) {
      console.error('Error rendering report data:', error);
      return <div style={{ color: '#ef4444' }}>Error displaying data</div>;
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#0a451c', fontSize: '28px', fontWeight: '700' }}>
              Collaboration Management
            </h1>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '16px' }}>
              Manage collaboration requests and partnership inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#dc2626' }}>Connection Error</h3>
              <p style={{ margin: '0', color: '#7f1d1d', fontSize: '14px' }}>
                {error}
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#7f1d1d', fontSize: '12px' }}>
                API URL: {API_BASE}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #0a451c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={20} color="#0a451c" />
            <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              {activeTab !== 'all' ? `${activeTab.replace('_', ' ').toUpperCase()} REPORTS` : 'TOTAL REPORTS'}
            </h3>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0' }}>
            {statistics.total}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #facf3c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={20} color="#facf3c" />
            <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              THIS MONTH
            </h3>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0' }}>
            {statistics.thisMonth}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #9ccf9f'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={20} color="#9ccf9f" />
            <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              PENDING REVIEW
            </h3>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0' }}>
            {statistics.pendingReview}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              OVERDUE FOLLOW-UPS
            </h3>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0' }}>
            {statistics.overdue}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'new', 'under_review', 'contacted', 'in_progress', 'completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: activeTab === tab ? '#0a451c' : 'white',
                  color: activeTab === tab ? 'white' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchReports(pagination.page)}
            disabled={loading}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#6b7280',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading ? 0.5 : 1
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Contact Info
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Type
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Priority
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Created
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>
                    <RefreshCw size={24} className="animate-spin" />
                    <span style={{ marginLeft: '8px' }}>Loading reports...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#dc2626' }}>
                    <AlertTriangle size={24} />
                    <div style={{ marginTop: '8px' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Failed to load reports</h3>
                      <p style={{ margin: '0', fontSize: '14px' }}>{error}</p>
                      <button
                        onClick={() => fetchReports(1)}
                        style={{
                          marginTop: '12px',
                          padding: '6px 12px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                    <Users size={24} />
                    <div style={{ marginTop: '8px' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No reports found</h3>
                      <p style={{ margin: '0' }}>
                        {searchTerm || activeTab !== 'all' 
                          ? 'No collaboration reports match your current filters' 
                          : 'No collaboration reports have been submitted yet'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>{report.name}</span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{report.email}</span>
                        {report.organization && (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{report.organization}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      <span style={{ textTransform: 'capitalize', color: '#1f2937' }}>
                        {report.flow_type}
                      </span>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      {getStatusBadge(report.status)}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      {getPriorityBadge(report.priority)}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', color: '#6b7280' }}>
                      {formatDate(report.created_at)}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            loadReportDetails(report.id);
                          }}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setStatusForm({
                              status: report.status,
                              priority: report.priority,
                              assignedTo: report.assigned_to || '',
                              adminNotes: report.admin_notes || '',
                              followUpDate: report.follow_up_date || ''
                            });
                            setShowStatusModal(true);
                          }}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#dbeafe',
                            color: '#1e40af',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Update Status"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setContactForm({
                              contactType: 'email',
                              subject: `Re: ${report.flow_type === 'collaborate' ? 'Collaboration' : 'Partnership'} Request`,
                              message: '',
                              contactMethod: report.email
                            });
                            setShowContactModal(true);
                          }}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#fef3c7',
                            color: '#92400e',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Send Message"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => fetchReports(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            
            <button
              onClick={() => fetchReports(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= pagination.pages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && !showContactModal && !showStatusModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedReport(null)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: '0', color: '#1f2937' }}>
                {selectedReport.flow_type === 'collaborate' ? 'Collaboration' : 'Partnership'} Request Details
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: '#0a451c', fontSize: '16px' }}>Contact Information</h3>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  <p><strong>Name:</strong> {selectedReport.name}</p>
                  <p><strong>Email:</strong> {selectedReport.email}</p>
                  {selectedReport.organization && (
                    <p><strong>Organization:</strong> {selectedReport.organization}</p>
                  )}
                  <p><strong>Type:</strong> {selectedReport.flow_type}</p>
                </div>
              </div>
              
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: '#0a451c', fontSize: '16px' }}>Status & Management</h3>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  <p><strong>Status:</strong> {getStatusBadge(selectedReport.status)}</p>
                  <p><strong>Priority:</strong> {getPriorityBadge(selectedReport.priority)}</p>
                  {selectedReport.assigned_to && (
                    <p><strong>Assigned to:</strong> {selectedReport.assigned_to}</p>
                  )}
                  <p><strong>Contact Count:</strong> {selectedReport.contact_count || 0}</p>
                  {selectedReport.last_contacted_at && (
                    <p><strong>Last Contact:</strong> {formatDate(selectedReport.last_contacted_at)}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#0a451c', fontSize: '16px' }}>Submitted Information</h3>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                {renderReportData(selectedReport.report_data)}
              </div>
            </div>

            {selectedReport.admin_notes && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#0a451c', fontSize: '16px' }}>Admin Notes</h3>
                <div style={{
                  background: '#fff7ed',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {selectedReport.admin_notes}
                </div>
              </div>
            )}

            {selectedReport.activities && selectedReport.activities.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#0a451c', fontSize: '16px' }}>Activity Log</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedReport.activities.map((activity, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontSize: '13px'
                    }}>
                      <div style={{ color: '#1f2937', fontWeight: '500', marginBottom: '4px' }}>
                        {activity.description}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        {formatDate(activity.created_at)}
                        {activity.admin_user && ` • by ${activity.admin_user}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setStatusForm({
                    status: selectedReport.status,
                    priority: selectedReport.priority,
                    assignedTo: selectedReport.assigned_to || '',
                    adminNotes: selectedReport.admin_notes || '',
                    followUpDate: selectedReport.follow_up_date || ''
                  });
                  setShowStatusModal(true);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#0a451c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit3 size={16} />
                Update Status
              </button>

              <button
                onClick={() => {
                  setContactForm({
                    contactType: 'email',
                    subject: `Re: ${selectedReport.flow_type === 'collaborate' ? 'Collaboration' : 'Partnership'} Request`,
                    message: '',
                    contactMethod: selectedReport.email
                  });
                  setShowContactModal(true);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#facf3c',
                  color: '#92400e',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={16} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowStatusModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: '0', color: '#1f2937' }}>Update Report Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Status
              </label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="new">New</option>
                <option value="under_review">Under Review</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Priority
              </label>
              <select
                value={statusForm.priority}
                onChange={(e) => setStatusForm(prev => ({ ...prev, priority: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Assigned To
              </label>
              <input
                type="text"
                value={statusForm.assignedTo}
                onChange={(e) => setStatusForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Enter admin name or email"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Follow-up Date
              </label>
              <input
                type="datetime-local"
                value={statusForm.followUpDate}
                onChange={(e) => setStatusForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Admin Notes
              </label>
              <textarea
                value={statusForm.adminNotes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder="Add internal notes about this report..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                style={{
                  padding: '8px 16px',
                  background: '#0a451c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle size={16} />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowContactModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: '0', color: '#1f2937' }}>Send Message</h2>
              <button
                onClick={() => setShowContactModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Contact Type
              </label>
              <select
                value={contactForm.contactType}
                onChange={(e) => setContactForm(prev => ({ ...prev, contactType: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Contact Method/Details
              </label>
              <input
                type="text"
                value={contactForm.contactMethod}
                onChange={(e) => setContactForm(prev => ({ ...prev, contactMethod: e.target.value }))}
                placeholder="e.g., email address, phone number, meeting location"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Subject
              </label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter contact subject"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Message/Notes
              </label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter the message content or notes about the contact..."
                rows="6"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addContact}
                style={{
                  padding: '8px 16px',
                  background: '#facf3c',
                  color: '#92400e',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={16} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminCollaborationManagement;