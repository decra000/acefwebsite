import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL, STATIC_URL } from '../../config';

const AdminManageWhatsapp = () => {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ number: '', description: '', id: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  // WhatsApp number validation functions
  const validateCountryCode = (number) => {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // Common country codes (you can expand this list)
    const countryCodes = [
      '1',    // US, Canada
      '44',   // UK
      '49',   // Germany
      '33',   // France
      '39',   // Italy
      '34',   // Spain
      '7',    // Russia, Kazakhstan
      '86',   // China
      '81',   // Japan
      '82',   // South Korea
      '91',   // India
      '55',   // Brazil
      '52',   // Mexico
      '54',   // Argentina
      '61',   // Australia
      '27',   // South Africa
      '234',  // Nigeria
      '254',  // Kenya
      '256',  // Uganda
      '255',  // Tanzania
      // Add more country codes as needed
    ];

    // Check if number starts with + or has valid country code
    if (number.startsWith('+')) {
      const withoutPlus = cleaned;
      return countryCodes.some(code => withoutPlus.startsWith(code));
    }
    
    return countryCodes.some(code => cleaned.startsWith(code));
  };

  const formatWhatsAppNumber = (number) => {
    // Remove all non-digit characters
    let cleaned = number.replace(/\D/g, '');
    
    // If doesn't start with country code, it's invalid
    if (!validateCountryCode(number)) {
      return null;
    }
    
    // Return in international format
    return `+${cleaned}`;
  };

  const validateWhatsAppNumber = (number) => {
    const errors = {};
    
    if (!number || number.trim() === '') {
      errors.number = 'WhatsApp number is required';
      return errors;
    }

    // Remove all non-digit characters for validation
    const cleaned = number.replace(/\D/g, '');
    
    // Check minimum length (country code + number should be at least 7 digits)
    if (cleaned.length < 7) {
      errors.number = 'Number is too short';
      return errors;
    }
    
    // Check maximum length (most international numbers are max 15 digits)
    if (cleaned.length > 15) {
      errors.number = 'Number is too long';
      return errors;
    }
    
    // Validate country code
    if (!validateCountryCode(number)) {
      errors.number = 'Number must start with a valid country code (e.g., +1, +44, +254, etc.)';
      return errors;
    }
    
    return errors;
  };

  // Enhanced axios error handler
  const handleAxiosError = (error, operation = 'operation') => {
    let errorMessage = `Failed to ${operation}`;
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`${operation} failed:`, {
        status,
        data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else {
        errorMessage = `Server error (${status}): ${errorMessage}`;
      }
    } else if (error.request) {
      // Network error
      console.error(`Network error during ${operation}:`, error.request);
      errorMessage = 'Network error. Please check your connection.';
    } else {
      // Something else
      console.error(`Error during ${operation}:`, error.message);
      errorMessage = error.message || errorMessage;
    }
    
    return errorMessage;
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/whatsapp`);
      setContacts(res.data);
    } catch (err) {
      const errorMessage = handleAxiosError(err, 'fetch contacts');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});

  // Prevent multiple numbers
  if (!form.id && contacts.length > 0) {
    alert('Only one WhatsApp number is allowed. Please edit or delete the existing one.');
    return;
  }

  const validationErrors = validateWhatsAppNumber(form.number);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  const formattedNumber = formatWhatsAppNumber(form.number);
  if (!formattedNumber) {
    setErrors({ number: 'Invalid WhatsApp number format' });
    return;
  }

  try {
    setLoading(true);

    const payload = {
      number: formattedNumber,
      description: form.description.trim(),
    };

    if (form.id) {
      await axios.put(`${API_URL}/whatsapp/${form.id}`, payload);
      alert('Contact updated successfully!');
    } else {
      await axios.post(`${API_URL}/whatsapp`, payload);
      alert('Contact added successfully!');
    }

    setForm({ number: '', description: '', id: null });
    fetchContacts();
  } catch (err) {
    const errorMessage = handleAxiosError(err, 'save contact');
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (contact) => {
    setForm(contact);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/whatsapp/${id}`);
        alert('Contact deleted successfully!');
        fetchContacts();
      } catch (err) {
        const errorMessage = handleAxiosError(err, 'delete contact');
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setForm({ number: '', description: '', id: null });
    setErrors({});
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Manage WhatsApp Contacts</h2>
      {(contacts.length === 0 || form.id) && (

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="WhatsApp Number (e.g., +254712345678)"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: errors.number ? '2px solid red' : '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          {errors.number && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.number}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Include country code (e.g., +1 for US, +44 for UK, +254 for Kenya)
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Processing...' : (form.id ? 'Update Contact' : 'Add Contact')}
          </button>
          
          {form.id && (
            <button 
              type="button" 
              onClick={handleCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
)
}
      <div>
        <h3>Contacts ({contacts.length})</h3>
        {loading && contacts.length === 0 ? (
          <div>Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No contacts found</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {contacts.map((c) => (
              <li 
                key={c.id} 
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '16px' }}>{c.number}</strong>
                  {c.description && (
                    <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                      {c.description}
                    </div>
                  )}
                </div>
                <div>
                  <button 
                    onClick={() => handleEdit(c)}
                    disabled={loading}
                    style={{
                      padding: '5px 15px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    disabled={loading}
                    style={{
                      padding: '5px 15px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminManageWhatsapp;