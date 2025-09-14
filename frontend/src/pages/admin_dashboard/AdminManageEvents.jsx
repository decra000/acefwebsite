import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, STATIC_URL } from "../../config";

const AdminManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [eventInterests, setEventInterests] = useState({});
  const [selectedEventInterests, setSelectedEventInterests] = useState([]);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    recipient: null,
    mode: "all", // "all" or "single"
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    country: "",
    location: "",
    start_date: "",
    end_date: "",
    image: null,
    is_paid: false,
    price: "",
    currency: "USD",
  });
  const [editingId, setEditingId] = useState(null);

  // Show message function
  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/events`);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      showMessage('error', 'Failed to fetch events. Please try again.');
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/countries`);
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
      showMessage('error', 'Failed to fetch countries. Please try again.');
    }
  };

  // Fetch event interests for all events
  const fetchEventInterests = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/event-interests`);
      // Group interests by event_id
      const groupedInterests = data.reduce((acc, interest) => {
        if (!acc[interest.event_id]) {
          acc[interest.event_id] = [];
        }
        acc[interest.event_id].push(interest);
        return acc;
      }, {});
      setEventInterests(groupedInterests);
    } catch (error) {
      console.error("Error fetching event interests:", error);
      showMessage('error', 'Failed to fetch event applications. Please try again.');
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCountries();
    fetchEventInterests();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      for (let key in form) {
        if (form[key]) formData.append(key, form[key]);
      }

      if (editingId) {
        await axios.put(`${API_URL}/events/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showMessage('success', 'Event updated successfully!');
      } else {
        await axios.post(`${API_URL}/events`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showMessage('success', 'Event created successfully!');
      }

      setForm({
        title: "",
        description: "",
        country: "",
        location: "",
        start_date: "",
        end_date: "",
        image: null,
        is_paid: false,
        price: "",
        currency: "USD",
      });
      setEditingId(null);
      setShowForm(false);
      fetchEvents();
      fetchEventInterests();
    } catch (error) {
      console.error("Error submitting form:", error);
      showMessage('error', 'Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit event
  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description,
      country: event.country || "",
      location: event.location,
      start_date: event.start_date.slice(0, 16),
      end_date: event.end_date ? event.end_date.slice(0, 16) : "",
      image: null,
      is_paid: event.is_paid || false,
      price: event.price || "",
      currency: event.currency || "USD",
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  // Delete event
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}/events/${id}`);
        showMessage('success', 'Event deleted successfully!');
        fetchEvents();
        fetchEventInterests();
      } catch (error) {
        console.error("Error deleting event:", error);
        showMessage('error', 'Failed to delete event. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle viewing event interests
  const handleViewInterests = (event) => {
    const interests = eventInterests[event.id] || [];
    setSelectedEvent(event);
    setSelectedEventInterests(interests);
    setShowInterestsModal(true);
  };

  // Handle deleting an interest
  const handleDeleteInterest = async (interestId) => {
    if (window.confirm("Are you sure you want to delete this interest?")) {
      try {
        await axios.delete(`${API_URL}/event-interests/${interestId}`);
        showMessage('success', 'Application deleted successfully!');
        fetchEventInterests();
        const updatedInterests = selectedEventInterests.filter(interest => interest.id !== interestId);
        setSelectedEventInterests(updatedInterests);
      } catch (error) {
        console.error("Error deleting interest:", error);
        showMessage('error', 'Failed to delete application. Please try again.');
      }
    }
  };

  const closeInterestsModal = () => {
    setShowInterestsModal(false);
    setSelectedEvent(null);
    setSelectedEventInterests([]);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setEmailForm({
      subject: "",
      message: "",
      recipient: null,
      mode: "all",
    });
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

  // Open email modal for all applicants
  const openEmailAllModal = () => {
    setEmailForm({
      subject: `Update regarding: ${selectedEvent.title}`,
      message: "",
      recipient: null,
      mode: "all",
    });
    setShowMessageModal(true);
  };

  // Open email modal for single applicant
  const openEmailSingleModal = (applicant) => {
    setEmailForm({
      subject: `Update regarding: ${selectedEvent.title}`,
      message: "",
      recipient: applicant,
      mode: "single",
    });
    setShowMessageModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      showMessage('error', 'Please fill in both subject and message');
      return;
    }

    setIsSendingEmail(true);

    try {
      if (emailForm.mode === "single" && emailForm.recipient) {
        // Send to single applicant
        await axios.post(`${API_URL}/event-interests/email-applicant`, {
          email: emailForm.recipient.email,
          name: emailForm.recipient.name,
          subject: emailForm.subject,
          message: emailForm.message,
        });
        showMessage('success', 'Email sent successfully!');
      } else if (emailForm.mode === "all") {
        // Send to all applicants
        const applicants = eventInterests[selectedEvent.id] || [];
        if (applicants.length === 0) {
          showMessage('error', 'No applicants to email');
          return;
        }

        await axios.post(`${API_URL}/event-interests/email-applicants`, {
          applicants,
          subject: emailForm.subject,
          message: emailForm.message,
        });
        showMessage('success', `Email sent to ${applicants.length} applicants successfully!`);
      }

      closeMessageModal();
    } catch (err) {
      console.error("Email send error:", err);
      showMessage('error', 'Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      title: "",
      description: "",
      country: "",
      location: "",
      start_date: "",
      end_date: "",
      image: null,
      is_paid: false,
      price: "",
      currency: "USD",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <>
      <style>{`
        .admin-events-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f8fafc;
          min-height: 100vh;
        }

        .admin-events-header {
          margin-bottom: 2rem;
        }

        .admin-events-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .admin-events-subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .form-toggle-container {
          margin-bottom: 2rem;
        }

        .form-toggle-btn {
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }

        .form-toggle-btn:hover {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .admin-events-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .form-slide-enter {
          max-height: 0;
          opacity: 0;
          padding: 0 2rem;
        }

        .form-slide-enter-active {
          max-height: 1000px;
          opacity: 1;
          padding: 2rem;
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
          min-height: 100px;
          resize: vertical;
        }

        .form-file {
          padding: 0.5rem;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          background-color: #f9fafb;
          transition: all 0.2s ease;
        }

        .form-file:hover {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .image-preview {
          margin-top: 1rem;
          border-radius: 8px;
          max-height: 120px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
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
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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

        .btn-secondary:hover:not(:disabled) {
          background-color: #4b5563;
        }

        .loading-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .message-alert {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 500;
          animation: slideDown 0.3s ease;
        }

        .message-success {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .message-error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .events-table-container {
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

        .events-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .events-table th {
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

        .events-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .events-table tr:hover {
          background-color: #f8fafc;
        }

        .event-image {
          height: 60px;
          width: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .event-actions {
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

        .country-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #eff6ff;
          color: #1d4ed8;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .checkbox-input {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .checkbox-label {
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          margin: 0;
        }

        .pricing-section {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          animation: slideIn 0.3s ease;
        }

        .pricing-title {
          font-weight: 600;
          color: #1e40af;
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .price-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.75rem;
          background-color: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .free-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.75rem;
          background-color: #f3f4f6;
          color: #374151;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .applicants-btn {
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

        .applicants-btn:hover {
          background-color: #7c3aed;
          transform: translateY(-1px);
        }

        .applicants-count {
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
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: modalSlideIn 0.3s ease;
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

        .interests-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .interests-table th {
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

        .interests-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .interests-table tr:hover {
          background-color: #f8fafc;
        }

        .interest-name {
          font-weight: 600;
          color: #1e293b;
        }

        .interest-email {
          color: #3b82f6;
          text-decoration: none;
        }

        .interest-email:hover {
          text-decoration: underline;
        }

        .interest-phone {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .interest-message {
          color: #374151;
          font-style: italic;
          max-width: 200px;
          word-wrap: break-word;
        }

        .interest-date {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .btn-delete-interest {
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

        .btn-delete-interest:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .btn-email-single {
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

        .btn-email-single:hover {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .no-interests {
          text-align: center;
          padding: 3rem 2rem;
          color: #6b7280;
        }

        .no-interests-title {
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

        .email-all-btn {
          background-color: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          margin-bottom: 1.5rem;
          margin-left: 1rem;
        }

        .email-all-btn:hover {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .email-form {
          background-color: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .email-form h3 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .email-form .form-group {
          margin-bottom: 1rem;
        }

        .email-form .form-input,
        .email-form .form-textarea {
          width: 100%;
          box-sizing: border-box;
        }

        .email-form .form-textarea {
          min-height: 120px;
        }

        .email-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-send {
          background-color: #10b981;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn-send:hover:not(:disabled) {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .btn-cancel {
          background-color: #6b7280;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn-cancel:hover {
          background-color: #4b5563;
        }

        .no-events {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .admin-events-container {
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .events-table-container {
            overflow-x: auto;
          }

          .events-table {
            min-width: 900px;
          }

          .event-actions {
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
        }
      `}</style>

      <div className="admin-events-container">
        <header className="admin-events-header">
          <h1 className="admin-events-title">Event Management</h1>
          <p className="admin-events-subtitle">Create, edit, and manage your events</p>
        </header>

        {/* Message Alert */}
        {message.text && (
          <div className={`message-alert message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Form Toggle */}
        <div className="form-toggle-container">
          <button 
            className="form-toggle-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✖' : '+'} 
            {editingId ? "Edit Event" : "Create New Event"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="admin-events-form">
            <h2 className="form-title">
              {editingId ? "Edit Event" : "Create New Event"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter event title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    className="form-select"
                    disabled={isLoading}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter event description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-textarea"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group form-group-full">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="is_paid"
                      id="is_paid"
                      checked={form.is_paid}
                      onChange={handleChange}
                      className="checkbox-input"
                      disabled={isLoading}
                    />
                    <label htmlFor="is_paid" className="checkbox-label">
                      This is a paid event
                    </label>
                  </div>
                </div>

                {form.is_paid && (
                  <div className="form-group-full">
                    <div className="pricing-section">
                      <h3 className="pricing-title">Event Pricing</h3>
                      <div className="pricing-grid">
                        <div className="form-group">
                          <label className="form-label">Price *</label>
                          <input
                            type="number"
                            name="price"
                            placeholder="Enter event price"
                            value={form.price}
                            onChange={handleChange}
                            required={form.is_paid}
                            min="0"
                            step="0.01"
                            className="form-input"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Currency *</label>
                          <select
                            name="currency"
                            value={form.currency}
                            onChange={handleChange}
                            required={form.is_paid}
                            className="form-select"
                            disabled={isLoading}
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="KES">KES (KSh)</option>
                            <option value="UGX">UGX (USh)</option>
                            <option value="TZS">TZS (TSh)</option>
                            <option value="RWF">RWF (RF)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter event location"
                    value={form.location}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Event Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="form-file"
                    disabled={isLoading}
                  />
                  
                  {form.image ? (
                    <img 
                      src={URL.createObjectURL(form.image)} 
                      alt="preview" 
                      className="image-preview" 
                    />
                  ) : editingId && events.find(e => e.id === editingId)?.image_url ? (
                    <img 
                      src={`${STATIC_URL}${events.find(e => e.id === editingId).image_url}`} 
                      alt="current" 
                      className="image-preview" 
                    />
                  ) : null}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading && <div className="loading-spinner"></div>}
                  {editingId ? "Update Event" : "Create Event"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events Table */}
        <div className="events-table-container">
          <div className="table-header">
            <h3 className="table-title">All Events ({events.length})</h3>
          </div>
          
          {events.length === 0 ? (
            <div className="no-events">
              <p>No events found. Create your first event above.</p>
            </div>
          ) : (
            <table className="events-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Country</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Applicants</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div style={{ fontWeight: '500', color: '#1e293b' }}>
                        {event.title}
                      </div>
                      {event.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {event.description.length > 50 
                            ? `${event.description.substring(0, 50)}...`
                            : event.description
                          }
                        </div>
                      )}
                    </td>
                    <td>
                      {event.country && (
                        <span className="country-badge">{event.country}</span>
                      )}
                    </td>
                    <td>{event.location || '-'}</td>
                    <td>
                      {event.is_paid ? (
                        <span className="price-badge">
                          {event.currency} {parseFloat(event.price).toFixed(2)}
                        </span>
                      ) : (
                        <span className="free-badge">Free</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewInterests(event)}
                        className="applicants-btn"
                        title="View interested applicants"
                      >
                        👥 
                        <span className="applicants-count">
                          {eventInterests[event.id]?.length || 0}
                        </span>
                      </button>
                    </td>
                    <td className="date-text">
                      {new Date(event.start_date).toLocaleString()}
                    </td>
                    <td className="date-text">
                      {event.end_date ? new Date(event.end_date).toLocaleString() : '-'}
                    </td>
                    <td>
                      {event.image_url ? (
                        <img
                          src={`${STATIC_URL}${event.image_url}`}
                          alt="event"
                          className="event-image"
                        />
                      ) : (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: '#f3f4f6', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                          fontSize: '0.75rem'
                        }}>
                          No image
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="event-actions">
                        <button
                          onClick={() => handleEdit(event)}
                          className="btn-edit"
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="btn-delete"
                          disabled={isLoading}
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

        {/* Interests Modal */}
        {showInterestsModal && (
          <div className="modal-overlay" onClick={closeInterestsModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeInterestsModal}>
                ×
              </button>
              
              <div className="modal-header">
                <h2 className="modal-title">Event Applicants</h2>
                <p className="modal-subtitle">
                  {selectedEvent?.title} • {selectedEventInterests.length} interested people
                </p>
              </div>

              <div className="modal-body">
                {selectedEventInterests.length === 0 ? (
                  <div className="no-interests">
                    <h3 className="no-interests-title">No applications yet</h3>
                    <p>No one has expressed interest in this event yet.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <button 
                        className="export-btn"
                        onClick={() => {
                          const csvContent = [
                            'Name,Email,Phone,Message,Date Applied',
                            ...selectedEventInterests.map(interest => 
                              `"${interest.name}","${interest.email}","${interest.phone || 'N/A'}","${interest.message || 'N/A'}","${formatDate(interest.created_at)}"`
                            )
                          ].join('\n');
                          
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          const url = URL.createObjectURL(blob);
                          link.setAttribute('href', url);
                          link.setAttribute('download', `${selectedEvent?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_applicants.csv`);
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        📥 Export to CSV
                      </button>

                      <button 
                        className="email-all-btn"
                        onClick={openEmailAllModal}
                      >
                        ✉️ Email All Applicants
                      </button>
                    </div>

                    <table className="interests-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Message</th>
                          <th>Applied</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEventInterests.map((interest) => (
                          <tr key={interest.id}>
                            <td>
                              <div className="interest-name">{interest.name}</div>
                            </td>
                            <td>
                              <div>
                                <a 
                                  href={`mailto:${interest.email}`}
                                  className="interest-email"
                                >
                                  {interest.email}
                                </a>
                              </div>
                              {interest.phone && (
                                <div className="interest-phone">
                                  📞 {interest.phone}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="interest-message">
                                {interest.message || 'No message provided'}
                              </div>
                            </td>
                            <td>
                              <div className="interest-date">
                                {formatDate(interest.created_at)}
                              </div>
                            </td>
                            <td>
                              <button
                                onClick={() => openEmailSingleModal(interest)}
                                className="btn-email-single"
                                title="Email this applicant"
                              >
                                ✉️
                              </button>
                              <button
                                onClick={() => handleDeleteInterest(interest.id)}
                                className="btn-delete-interest"
                                title="Delete this interest"
                              >
                                🗑️
                              </button>
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
        {showMessageModal && (
          <div className="modal-overlay" onClick={closeMessageModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeMessageModal}>
                ×
              </button>
              
              <div className="modal-header">
                <h2 className="modal-title">
                  {emailForm.mode === "single" 
                    ? `Email ${emailForm.recipient?.name}` 
                    : `Email All Applicants`
                  }
                </h2>
                <p className="modal-subtitle">
                  {emailForm.mode === "single"
                    ? `Send a personal message to ${emailForm.recipient?.email}`
                    : `Send message to ${selectedEventInterests.length} applicants for "${selectedEvent?.title}"`
                  }
                </p>
              </div>

              <div className="modal-body">
                <div className="email-form">
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                      placeholder="Enter email subject"
                      required
                      disabled={isSendingEmail}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-textarea"
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                      placeholder="Enter your message here..."
                      required
                      disabled={isSendingEmail}
                    />
                  </div>

                  <div className="email-actions">
                    <button 
                      className="btn btn-send"
                      onClick={handleSendEmail}
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail && <div className="loading-spinner"></div>}
                      {isSendingEmail 
                        ? "Sending..." 
                        : emailForm.mode === "single" 
                          ? "Send Email" 
                          : `Send to ${selectedEventInterests.length} Recipients`
                      }
                    </button>
                    <button 
                      className="btn btn-cancel"
                      onClick={closeMessageModal}
                      disabled={isSendingEmail}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminManageEvents;