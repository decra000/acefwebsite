import React, { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../../config';

const API_BASE = API_URL;

const AdminManageEmailAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [mode, setMode] = useState('view');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testingAccount, setTestingAccount] = useState({});
  const [statsData, setStatsData] = useState({});

  const initializeForm = () => ({
    account_key: '',
    account_name: '',
    account_type: 'role',
    smtp_host: 'lim107.truehost.cloud',
    smtp_port: '465',
    smtp_secure: true,
    smtp_user: '',
    smtp_pass: '',
    from_name: '',
    description: '',
    is_active: true
  });

  const accountTypeOptions = [
    { value: 'role', label: 'Role-based (e.g., info, recruitment)' },
    { value: 'country', label: 'Country-specific' },
    { value: 'functional', label: 'Functional (e.g., no-reply)' }
  ];

  const predefinedAccounts = [
    { key: 'info', name: 'General Information', type: 'role', from: 'ACEF Team', desc: 'General inquiries and information' },
    { key: 'fundraising', name: 'Fundraising & Donations', type: 'role', from: 'ACEF Fundraising', desc: 'Donation-related communications' },
    { key: 'recruitment', name: 'Recruitment', type: 'role', from: 'ACEF Recruitment', desc: 'Job applications and hiring' },
    { key: 'community', name: 'Community & Newsletter', type: 'role', from: 'ACEF Community', desc: 'Newsletter and community engagement' },
    { key: 'support', name: 'Support', type: 'role', from: 'ACEF Support', desc: 'Technical support and assistance' },
    { key: 'noreply', name: 'No-Reply', type: 'functional', from: 'ACEF (No Reply)', desc: 'System notifications (do not reply)' }
  ];

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/email-accounts`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch accounts: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setAccounts(data);
      setStatus('📧 Email accounts loaded successfully');
    } catch (err) {
      console.error('❌ Fetch accounts error:', err);
      setError(`❌ Failed to load accounts: ${err.message}`);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccountStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/email-accounts/stats`);
      if (res.ok) {
        const stats = await res.json();
        const statsMap = {};
        stats.forEach(stat => {
          statsMap[stat.account_key] = {
            primaryUsage: stat.primary_country_usage || 0,
            secondaryUsage: stat.secondary_country_usage || 0,
            totalUsage: stat.total_usage || 0
          };
        });
        setStatsData(statsMap);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchAccountStats();
  }, [fetchAccounts, fetchAccountStats]);

  const clearMessages = () => {
    setStatus('');
    setError('');
  };

  const handleEdit = (account) => {
    clearMessages();
    setForm({ ...account });
    setSelected(account.account_key);
    setMode('edit');
  };

  const handleDelete = async (accountKey) => {
    if (!window.confirm(`Are you sure you want to delete the email account '${accountKey}'?`)) {
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/email-accounts/${encodeURIComponent(accountKey)}`, { 
        method: 'DELETE' 
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete account');
      }

      setStatus(`🗑 Successfully deleted account '${accountKey}'`);
      await fetchAccounts();
      await fetchAccountStats();
    } catch (err) {
      console.error('Delete error:', err);
      setError(`❌ Failed to delete ${accountKey}: ${err.message}`);
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
    
    if (!form.account_key || !/^[a-z0-9_-]+$/.test(form.account_key)) {
      errors.push('Account key is required and must be lowercase alphanumeric with - or _');
    }
    
    if (!form.account_name) {
      errors.push('Account name is required');
    }
    
    if (!form.smtp_user || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.smtp_user)) {
      errors.push('Valid SMTP user email is required');
    }
    
    if (!form.smtp_pass) {
      errors.push('SMTP password is required');
    }
    
    if (!form.from_name) {
      errors.push('From name is required');
    }
    
    if (form.smtp_port && (isNaN(form.smtp_port) || form.smtp_port < 1 || form.smtp_port > 65535)) {
      errors.push('SMTP port must be between 1 and 65535');
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
      const endpoint = `${API_BASE}/email-accounts/${encodeURIComponent(form.account_key)}`;
      
      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(form)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to ${mode} account`);
      }

      setStatus(`✅ Successfully ${mode === 'edit' ? 'updated' : 'added'} account '${form.account_key}'`);
      setMode('view');
      setForm(initializeForm());
      setSelected(null);
      await fetchAccounts();
      await fetchAccountStats();
    } catch (err) {
      console.error('Save error:', err);
      setError(`❌ Failed to save changes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSmtpConnection = async (accountKey) => {
    setTestingAccount(prev => ({ ...prev, [accountKey]: true }));
    setError('');

    try {
      const res = await fetch(`${API_BASE}/email-accounts/${encodeURIComponent(accountKey)}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();

      if (result.success) {
        setStatus(`✅ SMTP test successful for '${accountKey}'`);
      } else {
        setError(`❌ SMTP test failed for '${accountKey}': ${result.message}`);
      }
    } catch (err) {
      setError(`❌ SMTP test error for '${accountKey}': ${err.message}`);
    } finally {
      setTestingAccount(prev => ({ ...prev, [accountKey]: false }));
    }
  };

  const testAllConnections = async () => {
    setLoading(true);
    clearMessages();

    try {
      const res = await fetch(`${API_BASE}/email-accounts/test-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();

      if (result.success) {
        setStatus(`✅ All tests completed: ${result.summary.successful}/${result.summary.total} successful`);
      } else {
        setError(`⚠️ Tests completed: ${result.summary.successful}/${result.summary.total} successful. Check individual accounts.`);
      }
    } catch (err) {
      setError(`❌ Test all error: ${err.message}`);
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

  const startAddPredefined = (predefined) => {
    clearMessages();
    setMode('add');
    const initialForm = initializeForm();
    initialForm.account_key = predefined.key;
    initialForm.account_name = predefined.name;
    initialForm.account_type = predefined.type;
    initialForm.smtp_user = `${predefined.key}@acef-ngo.org`;
    initialForm.from_name = predefined.from;
    initialForm.description = predefined.desc;
    setForm(initialForm);
    setSelected(predefined.key);
  };

  const cancelEdit = () => {
    setMode('view');
    setForm(initializeForm());
    setSelected(null);
    clearMessages();
  };

  const getAccountStatus = (account) => {
    if (!account.is_active) return { icon: '⏸️', text: 'Disabled', color: '#6c757d' };
    
    const hasComplete = account.smtp_host && account.smtp_port && 
                       account.smtp_user && account.smtp_pass && account.from_name;
    
    if (hasComplete) return { icon: '✅', text: 'Active', color: '#28a745' };
    return { icon: '⚠️', text: 'Incomplete', color: '#ffc107' };
  };

  const getUsageInfo = (accountKey) => {
    const stats = statsData[accountKey];
    if (!stats || stats.totalUsage === 0) return null;
    
    return (
      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
        Used by {stats.totalUsage} country contact(s)
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2>📧 Manage Email Accounts (SMTP)</h2>
      <p>Configure role-based and functional email accounts for the ACEF system</p>
      
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
            {mode === 'edit' ? `✏️ Edit: ${form.account_key}` : '➕ Add New Email Account'}
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div>
              <label>Account Key: * <small>(lowercase, no spaces)</small></label>
              <input 
                name="account_key" 
                placeholder="e.g., info, fundraising" 
                value={form.account_key || ''} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
                disabled={mode === 'edit'}
                required
              />
            </div>
            
            <div>
              <label>Account Name: *</label>
              <input 
                name="account_name" 
                placeholder="e.g., General Information" 
                value={form.account_name || ''} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
                required
              />
            </div>
            
            <div>
              <label>Account Type: *</label>
              <select 
                name="account_type" 
                value={form.account_type || 'role'} 
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                {accountTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '4px', gridColumn: '1 / -1' }}>
              <h4>📧 SMTP Configuration</h4>
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
                    placeholder="info@acef-ngo.org" 
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
                  <label>From Name: *</label>
                  <input 
                    name="from_name" 
                    placeholder="ACEF Team" 
                    value={form.from_name || ''} 
                    onChange={handleFormChange}
                    style={{ width: '100%', padding: '0.5rem' }}
                    required
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
                  <label>Account Active</label>
                </div>
              </div>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Description:</label>
              <textarea 
                name="description" 
                placeholder="Purpose of this email account..." 
                value={form.description || ''} 
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
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={startAddNew}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ➕ Add New Account
            </button>
            
            <button 
              onClick={testAllConnections}
              disabled={loading || accounts.length === 0}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: (loading || accounts.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              🧪 Test All Connections
            </button>
          </div>

          {/* Quick Add Predefined Accounts */}
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1rem', 
            backgroundColor: '#fff3cd', 
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <h4 style={{ marginTop: 0 }}>⚡ Quick Add Predefined Accounts:</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {predefinedAccounts
                .filter(p => !accounts.find(a => a.account_key === p.key))
                .map(p => (
                  <button
                    key={p.key}
                    onClick={() => startAddPredefined(p)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: '#ffc107',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    ➕ {p.name}
                  </button>
                ))
              }
              {predefinedAccounts.every(p => accounts.find(a => a.account_key === p.key)) && (
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  All predefined accounts have been added ✓
                </span>
              )}
            </div>
          </div>
          
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
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Account Key</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Name & Type</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>SMTP User</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => {
                  const status = getAccountStatus(account);
                  return (
                    <tr key={account.account_key} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        <strong>{account.account_key}</strong>
                        {getUsageInfo(account.account_key)}
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        <div>{account.account_name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          Type: {account.account_type}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        {account.smtp_user}
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {account.from_name}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        <span style={{ color: status.color }}>
                          {status.icon} {status.text}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleEdit(account)}
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
                            onClick={() => testSmtpConnection(account.account_key)}
                            disabled={testingAccount[account.account_key]}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              backgroundColor: '#17a2b8', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: testingAccount[account.account_key] ? 'not-allowed' : 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            {testingAccount[account.account_key] ? '⏳' : '📧'} Test
                          </button>
                          <button 
                            onClick={() => handleDelete(account.account_key)}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {accounts.length === 0 && !loading && (
            <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '2rem' }}>
              No email accounts configured. Add your first account to get started.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManageEmailAccounts;