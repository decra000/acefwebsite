import React, { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../../config';

const API_BASE = API_URL;

const AdminManageContacts = () => {
  const [countries, setCountries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [mode, setMode] = useState('view');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailJSStatus, setEmailJSStatus] = useState({});

  // Initialize empty form
  const initializeForm = () => ({
    country: '',
    email: '',
    phone: '',
    service_id: '',
    template_id: '',
    public_key: '',
    physical_address: '',
    mailing_address: '',
    postal_code: '',
    state_province: '',
    city: '',
    latitude: '',
    longitude: '',
  });

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/countries`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch countries: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from countries endpoint');
      }
      
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sorted);
      setStatus('📦 Countries loaded successfully');
    } catch (err) {
      console.error('❌ Fetch countries error:', err);
      setError(`❌ Failed to load countries: ${err.message}`);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/country-contacts`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch contacts: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from contacts endpoint');
      }
      
      setContacts(data);
      
      // Validate EmailJS configurations
      const emailJSValidations = {};
      for (const contact of data) {
        const hasEmailJS = contact.service_id && contact.template_id && contact.public_key;
        const hasCoordinates = contact.latitude && contact.longitude;
        emailJSValidations[contact.country] = {
          configured: hasEmailJS,
          status: hasEmailJS ? 'Complete' : 'Incomplete',
          coordinates: hasCoordinates
        };
      }
      setEmailJSStatus(emailJSValidations);
      
    } catch (err) {
      console.error('❌ Fetch contacts error:', err);
      setContacts([]);
      setEmailJSStatus({});
    }
  }, []);

  useEffect(() => {
    fetchCountries();
    fetchContacts();
  }, [fetchCountries, fetchContacts]);

  // Clean up orphaned contacts only when countries are loaded and there are potential orphans
  useEffect(() => {
    const cleanupOrphanedContacts = async () => {
      // Only run cleanup if we have both countries and contacts loaded
      if (countries.length === 0 || contacts.length === 0) return;
      
      const countryNames = new Set(countries.map(c => c.name));
      const orphanedContacts = contacts.filter(contact => !countryNames.has(contact.country));
      
      if (orphanedContacts.length > 0) {
        console.log(`Found ${orphanedContacts.length} orphaned contacts, cleaning up...`);
        
        try {
          // Delete orphaned contacts
          const deletePromises = orphanedContacts.map(contact =>
            fetch(`${API_BASE}/country-contacts/${encodeURIComponent(contact.country)}`, {
              method: 'DELETE'
            })
          );
          
          await Promise.all(deletePromises);
          
          // Refresh contacts after cleanup
          await fetchContacts();
          
          setStatus(`🧹 Cleaned up ${orphanedContacts.length} orphaned contact(s)`);
        } catch (err) {
          console.error('Error cleaning up orphaned contacts:', err);
        }
      }
    };

    // Use a timeout to debounce the cleanup and avoid rapid successive calls
    const timeoutId = setTimeout(cleanupOrphanedContacts, 500);
    
    return () => clearTimeout(timeoutId);
  }, [countries, contacts, fetchContacts]);

  const clearMessages = () => {
    setStatus('');
    setError('');
  };

  const handleEdit = (contact) => {
    clearMessages();
    setForm({ ...contact });
    setSelected(contact.country);
    setMode('edit');
  };

  const handleDelete = async (country) => {
    if (!window.confirm(`Are you sure you want to delete the contact configuration for ${country}?`)) {
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/country-contacts/${encodeURIComponent(country)}`, { 
        method: 'DELETE' 
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete contact');
      }

      setStatus(`🗑 Successfully deleted configuration for ${country}`);
      await fetchContacts();
    } catch (err) {
      console.error('Delete error:', err);
      setError(`❌ Failed to delete ${country}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.country) {
      errors.push('Country is required');
    }
    
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.push('Invalid email format');
    }
    
    if (form.phone && !/^[\+]?[0-9\s\-\(\)]{7,}$/.test(form.phone)) {
      errors.push('Invalid phone format');
    }
    
    // Validate latitude
    if (form.latitude && form.latitude.trim() !== '') {
      const lat = parseFloat(form.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Latitude must be a number between -90 and 90');
      }
    }
    
    // Validate longitude
    if (form.longitude && form.longitude.trim() !== '') {
      const lng = parseFloat(form.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push('Longitude must be a number between -180 and 180');
      }
    }
    
    return errors;
  };

  const handleSave = async () => {
    clearMessages();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(`❌ Validation failed: ${validationErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const endpoint = `${API_BASE}/country-contacts/${encodeURIComponent(form.country)}`;
      
      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(form)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to ${mode} contact`);
      }

      setStatus(`✅ Successfully ${mode === 'edit' ? 'updated' : 'added'} configuration for ${form.country}`);
      setMode('view');
      setForm(initializeForm());
      setSelected(null);
      await fetchContacts();
    } catch (err) {
      console.error('Save error:', err);
      setError(`❌ Failed to save changes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startAddNew = () => {
    clearMessages();
    setMode('add');
    setForm(initializeForm());
    setSelected(null);
  };

  const startAddForCountry = (countryName) => {
    clearMessages();
    setMode('add');
    setForm({ ...initializeForm(), country: countryName });
    setSelected(countryName);
  };

  const cancelEdit = () => {
    setMode('view');
    setForm(initializeForm());
    setSelected(null);
    clearMessages();
  };

  const getContactForCountry = (countryName) => {
    return contacts.find(c => c.country === countryName);
  };

  const getEmailJSStatusIcon = (countryName) => {
    const status = emailJSStatus[countryName];
    if (!status) return '❓';
    return status.configured ? '✅' : '⚠️';
  };

  const getEmailJSStatusText = (countryName) => {
    const status = emailJSStatus[countryName];
    if (!status) return 'Unknown';
    return status.status;
  };

  const getCoordinatesStatusIcon = (countryName) => {
    const status = emailJSStatus[countryName];
    if (!status) return '❓';
    return status.coordinates ? '🌍' : '📍';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2>📫 Manage Country Contact Configurations</h2>
      <p>To obtain latitudes and longitudes, do visit https://www.gps-coordinates.net/</p>
      {loading && <p style={{ color: 'blue' }}>⏳ Loading...</p>}
      {status && <p style={{ color: 'green', backgroundColor: '#e8f5e8', padding: '0.5rem', borderRadius: '4px' }}>{status}</p>}
      {error && <p style={{ color: 'red', backgroundColor: '#ffe8e8', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}

      {mode !== 'view' && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>
            {mode === 'edit' ? `✏️ Edit: ${form.country}` : '➕ Add New Country Contact'}
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {mode === 'add' && (
              <div>
                <label>Country: *</label>
                <select 
                  name="country" 
                  value={form.country} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '0.5rem' }}
                  required
                >
                  <option value="">-- Select Country --</option>
                  {countries
                    .filter(c => !getContactForCountry(c.name)) // Only show countries without contacts
                    .map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))
                  }
                </select>
              </div>
            )}
            
            <div>
              <label>Email:</label>
              <input 
                name="email" 
                type="email"
                placeholder="contact@example.com" 
                value={form.email || ''} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            
            <div>
              <label>Phone:</label>
              <input 
                name="phone" 
                type="tel"
                placeholder="+1234567890" 
                value={form.phone || ''} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            
            <div>
              <label>City:</label>
              <input 
                name="city" 
                placeholder="City name" 
                value={form.city || ''} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>

            <div>
              <label>State/Province:</label>
              <input 
                name="state_province" 
                placeholder="State or province" 
                value={form.state_province || ''} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>

            <div>
              <label>Postal Code:</label>
              <input 
                name="postal_code" 
                placeholder="Postal/ZIP code" 
                value={form.postal_code || ''} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', gridColumn: '1 / -1' }}>
              <h4>🌍 Location Coordinates</h4>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label>Latitude:</label>
                  <input 
                    name="latitude" 
                    type="number"
                    step="any"
                    placeholder="e.g., -1.2921" 
                    value={form.latitude || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                    title="Latitude must be between -90 and 90"
                  />
                  <small style={{ color: '#666' }}>Range: -90 to 90</small>
                </div>
                <div>
                  <label>Longitude:</label>
                  <input 
                    name="longitude" 
                    type="number"
                    step="any"
                    placeholder="e.g., 36.8219" 
                    value={form.longitude || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                    title="Longitude must be between -180 and 180"
                  />
                  <small style={{ color: '#666' }}>Range: -180 to 180</small>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '4px', gridColumn: '1 / -1' }}>
              <h4>📧 EmailJS Configuration</h4>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label>Service ID:</label>
                  <input 
                    name="service_id" 
                    placeholder="your_service_id" 
                    value={form.service_id || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label>Template ID:</label>
                  <input 
                    name="template_id" 
                    placeholder="your_template_id" 
                    value={form.template_id || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label>Public Key:</label>
                  <input 
                    name="public_key" 
                    placeholder="your_public_key" 
                    value={form.public_key || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Physical Address:</label>
              <textarea 
                name="physical_address" 
                placeholder="Physical address for this country" 
                value={form.physical_address || ''} 
                onChange={handleFormChange}
                rows={3}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Mailing Address:</label>
              <textarea 
                name="mailing_address" 
                placeholder="Mailing address for this country" 
                value={form.mailing_address || ''} 
                onChange={handleFormChange}
                rows={3}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / -1' }}>
              <button 
                onClick={handleSave}
                disabled={loading}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                💾 {loading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={cancelEdit}
                disabled={loading}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'view' && (
        <div>
          <button 
            onClick={startAddNew}
            style={{ 
              marginBottom: '1rem',
              padding: '0.5rem 1rem', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ➕ Add New Configuration
          </button>
          
          <div style={{ overflowX: 'auto' }}>
            <table 
              style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                border: '1px solid #ddd'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Country</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Phone</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Location</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>EmailJS Status</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map(country => {
                  const contact = getContactForCountry(country.name);
                  return (
                    <tr key={country.name} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        <strong>{country.name}</strong>
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        {contact?.email || '—'}
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        {contact?.phone || '—'}
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        {contact ? (
                          <span>
                            {getCoordinatesStatusIcon(contact.country)}{' '}
                            {contact.latitude && contact.longitude 
                              ? `${parseFloat(contact.latitude).toFixed(4)}, ${parseFloat(contact.longitude).toFixed(4)}`
                              : 'No coordinates'
                            }
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        {contact ? (
                          <span>
                            {getEmailJSStatusIcon(contact.country)} {getEmailJSStatusText(contact.country)}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        {contact ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleEdit(contact)}
                              style={{ 
                                padding: '0.25rem 0.5rem', 
                                backgroundColor: '#ffc107', 
                                color: 'black', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(contact.country)}
                              style={{ 
                                padding: '0.25rem 0.5rem', 
                                backgroundColor: '#dc3545', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startAddForCountry(country.name)}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              backgroundColor: '#28a745', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            ➕ Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {countries.length === 0 && !loading && (
            <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '2rem' }}>
              No countries available. Please check your countries endpoint.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManageContacts;