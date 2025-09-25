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
  const [smtpStatus, setSmtpStatus] = useState({});
  const [testingEmail, setTestingEmail] = useState({});

  // Initialize empty form with SMTP fields
  const initializeForm = () => ({
    country: '',
    email: '',
    phone: '',
    physical_address: '',
    mailing_address: '',
    postal_code: '',
    state_province: '',
    city: '',
    latitude: '',
    longitude: '',
    // SMTP Configuration
    smtp_host: 'lim107.truehost.cloud',
    smtp_port: '465',
    smtp_secure: true,
    smtp_user: '',
    smtp_pass: '',
    smtp_from_name: '',
    is_active: true,
    // Email Templates
    welcome_template: '',
    contact_template: '',
    notification_template: ''
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
      
      // Validate SMTP configurations
      const smtpValidations = {};
      for (const contact of data) {
        const hasSmtp = contact.smtp_host && contact.smtp_port && contact.smtp_user && contact.smtp_pass;
        const hasCoordinates = contact.latitude && contact.longitude;
        smtpValidations[contact.country] = {
          configured: hasSmtp,
          status: hasSmtp ? 'Complete' : 'Incomplete',
          coordinates: hasCoordinates,
          active: contact.is_active
        };
      }
      setSmtpStatus(smtpValidations);
      
    } catch (err) {
      console.error('❌ Fetch contacts error:', err);
      setContacts([]);
      setSmtpStatus({});
    }
  }, []);

  useEffect(() => {
    fetchCountries();
    fetchContacts();
  }, [fetchCountries, fetchContacts]);

  // Clean up orphaned contacts
  useEffect(() => {
    const cleanupOrphanedContacts = async () => {
      if (countries.length === 0 || contacts.length === 0) return;
      
      const countryNames = new Set(countries.map(c => c.name));
      const orphanedContacts = contacts.filter(contact => !countryNames.has(contact.country));
      
      if (orphanedContacts.length > 0) {
        console.log(`Found ${orphanedContacts.length} orphaned contacts, cleaning up...`);
        
        try {
          const deletePromises = orphanedContacts.map(contact =>
            fetch(`${API_BASE}/country-contacts/${encodeURIComponent(contact.country)}`, {
              method: 'DELETE'
            })
          );
          
          await Promise.all(deletePromises);
          await fetchContacts();
          
          setStatus(`🧹 Cleaned up ${orphanedContacts.length} orphaned contact(s)`);
        } catch (err) {
          console.error('Error cleaning up orphaned contacts:', err);
        }
      }
    };

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
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
    
    // Validate SMTP configuration
    if (form.smtp_user && !form.smtp_pass) {
      errors.push('SMTP password is required when SMTP user is provided');
    }
    
    if (form.smtp_user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.smtp_user)) {
      errors.push('SMTP user must be a valid email address');
    }
    
    if (form.smtp_port && (isNaN(form.smtp_port) || form.smtp_port < 1 || form.smtp_port > 65535)) {
      errors.push('SMTP port must be a number between 1 and 65535');
    }
    
    // Validate coordinates
    if (form.latitude && form.latitude.trim() !== '') {
      const lat = parseFloat(form.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Latitude must be a number between -90 and 90');
      }
    }
    
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

  const testSmtpConnection = async (country) => {
    const contact = getContactForCountry(country);
    if (!contact) return;

    setTestingEmail(prev => ({ ...prev, [country]: true }));
    setError('');

    try {
      const res = await fetch(`${API_BASE}/country-contacts/${encodeURIComponent(country)}/test-smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();

      if (result.success) {
        setStatus(`✅ SMTP test successful for ${country}`);
      } else {
        setError(`❌ SMTP test failed for ${country}: ${result.message}`);
      }
    } catch (err) {
      setError(`❌ SMTP test error for ${country}: ${err.message}`);
    } finally {
      setTestingEmail(prev => ({ ...prev, [country]: false }));
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
    const initialForm = initializeForm();
    initialForm.country = countryName;
    initialForm.smtp_user = `${countryName.toLowerCase().replace(/\s+/g, '')}@acef-ngo.org`;
    initialForm.smtp_from_name = `ACEF ${countryName}`;
    setForm(initialForm);
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

  const getSmtpStatusIcon = (countryName) => {
    const status = smtpStatus[countryName];
    if (!status) return '❓';
    if (!status.active) return '⏸️';
    return status.configured ? '✅' : '⚠️';
  };

  const getSmtpStatusText = (countryName) => {
    const status = smtpStatus[countryName];
    if (!status) return 'Unknown';
    if (!status.active) return 'Disabled';
    return status.status;
  };

  const getCoordinatesStatusIcon = (countryName) => {
    const status = smtpStatus[countryName];
    if (!status) return '❓';
    return status.coordinates ? '🌍' : '📍';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2>📫 Manage Country SMTP Configurations</h2>
      <p>Manage SMTP email settings and contact information for each ACEF region. For coordinates, visit https://www.gps-coordinates.net/</p>
      
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
            {mode === 'edit' ? `✏️ Edit: ${form.country}` : '➕ Add New Country Configuration'}
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
                    .filter(c => !getContactForCountry(c.name))
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
            
            {/* Location Coordinates Section */}
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
                  />
                  <small style={{ color: '#666' }}>Range: -180 to 180</small>
                </div>
              </div>
            </div>
            
            {/* SMTP Configuration Section */}
            <div style={{ padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '4px', gridColumn: '1 / -1' }}>
              <h4>📧 SMTP Email Configuration</h4>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label>SMTP Host: *</label>
                  <input 
                    name="smtp_host" 
                    placeholder="lim107.truehost.cloud" 
                    value={form.smtp_host || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                    required
                  />
                </div>
                <div>
                  <label>SMTP Port: *</label>
                  <input 
                    name="smtp_port" 
                    type="number"
                    placeholder="465" 
                    value={form.smtp_port || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                    required
                  />
                </div>
                <div>
                  <label>SMTP User (Email): *</label>
                  <input 
                    name="smtp_user" 
                    type="email"
                    placeholder="country@acef-ngo.org" 
                    value={form.smtp_user || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                    required
                  />
                </div>
                <div>
                  <label>SMTP Password: *</label>
                  <input 
                    name="smtp_pass" 
                    type="password"
                    placeholder="Email password" 
                    value={form.smtp_pass || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                    required
                  />
                </div>
                <div>
                  <label>From Name:</label>
                  <input 
                    name="smtp_from_name" 
                    placeholder="ACEF Country" 
                    value={form.smtp_from_name || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    name="smtp_secure"
                    type="checkbox" 
                    checked={form.smtp_secure || false}
                    onChange={handleFormChange}
                  />
                  <label>Use SSL/TLS (Port 465)</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    name="is_active"
                    type="checkbox" 
                    checked={form.is_active !== false}
                    onChange={handleFormChange}
                  />
                  <label>Configuration Active</label>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
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
            
            {/* Action Buttons */}
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
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Contact</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Location</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>SMTP Status</th>
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
                        {contact ? (
                          <div>
                            <div>{contact.email || '—'}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              {contact.phone || '—'}
                            </div>
                          </div>
                        ) : '—'}
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
                          <div>
                            <div>
                              {getSmtpStatusIcon(contact.country)} {getSmtpStatusText(contact.country)}
                            </div>
                            {contact.smtp_user && (
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {contact.smtp_user}
                              </div>
                            )}
                          </div>
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
                              onClick={() => testSmtpConnection(contact.country)}
                              disabled={testingEmail[contact.country] || !contact.smtp_user}
                              style={{ 
                                padding: '0.25rem 0.5rem', 
                                backgroundColor: contact.smtp_user ? '#17a2b8' : '#6c757d', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: (testingEmail[contact.country] || !contact.smtp_user) ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              {testingEmail[contact.country] ? '⏳' : '📧'} Test
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