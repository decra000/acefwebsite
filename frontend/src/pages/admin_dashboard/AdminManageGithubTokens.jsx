import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const AdminManageGithubTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [form, setForm] = useState({ token: '', description: '', is_active: false, id: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const validateToken = (token) => {
    const errors = {};
    
    if (!token || token.trim() === '') {
      errors.token = 'GitHub token is required';
      return errors;
    }

    const cleaned = token.trim();
    
    if (cleaned.length < 10) {
      errors.token = 'Token is too short (minimum 10 characters)';
      return errors;
    }
    
    if (cleaned.length > 500) {
      errors.token = 'Token is too long (maximum 500 characters)';
      return errors;
    }
    
    return errors;
  };

  const handleAxiosError = (error, operation = 'operation') => {
    let errorMessage = `Failed to ${operation}`;
    
    if (error.response) {
      const { status, data } = error.response;
      console.error(`${operation} failed:`, { status, data });
      
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else {
        errorMessage = `Server error (${status}): ${errorMessage}`;
      }
    } else if (error.request) {
      console.error(`Network error during ${operation}:`, error.request);
      errorMessage = 'Network error. Please check your connection.';
    } else {
      console.error(`Error during ${operation}:`, error.message);
      errorMessage = error.message || errorMessage;
    }
    
    return errorMessage;
  };

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/github-tokens`);
      setTokens(res.data);
    } catch (err) {
      const errorMessage = handleAxiosError(err, 'fetch tokens');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateToken(form.token);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        token: form.token.trim(),
        description: form.description.trim(),
        is_active: form.is_active
      };

      if (form.id) {
        await axios.put(`${API_URL}/github-tokens/${form.id}`, payload);
        alert('Token updated successfully!');
      } else {
        await axios.post(`${API_URL}/github-tokens`, payload);
        alert('Token added successfully!');
      }

      setForm({ token: '', description: '', is_active: false, id: null });
      setShowToken(false);
      fetchTokens();
    } catch (err) {
      const errorMessage = handleAxiosError(err, 'save token');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (token) => {
    setForm({
      id: token.id,
      token: '', // Don't show the actual token
      description: token.description,
      is_active: token.is_active === 1
    });
    setErrors({});
    setShowToken(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this token? This cannot be undone.')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/github-tokens/${id}`);
        alert('Token deleted successfully!');
        fetchTokens();
      } catch (err) {
        const errorMessage = handleAxiosError(err, 'delete token');
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetActive = async (id) => {
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/github-tokens/${id}/activate`);
      alert('Token activated successfully!');
      fetchTokens();
    } catch (err) {
      const errorMessage = handleAxiosError(err, 'activate token');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ token: '', description: '', is_active: false, id: null });
    setErrors({});
    setShowToken(false);
  };

  const getStatusBadge = (isActive) => {
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: isActive ? '#28a745' : '#6c757d',
        color: 'white'
      }}>
        {isActive ? 'ACTIVE' : 'INACTIVE'}
      </span>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0 }}>Manage GitHub Tokens</h2>
        <div style={{ 
          padding: '10px 15px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>Active Token:</strong> {
            tokens.find(t => t.is_active === 1) 
              ? tokens.find(t => t.is_active === 1).token 
              : 'None'
          }
        </div>
      </div>

      <div style={{
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <strong>⚠️ Security Notice:</strong> GitHub tokens are sensitive credentials. Only one token can be active at a time. Store them securely.
      </div>

      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3 style={{ marginTop: 0 }}>{form.id ? 'Update Token' : 'Add New Token'}</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            GitHub Token *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showToken ? 'text' : 'password'}
              placeholder={form.id ? 'Enter new token to update' : 'Enter GitHub token'}
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              required={!form.id}
              style={{
                width: '100%',
                padding: '10px',
                paddingRight: '100px',
                border: errors.token ? '2px solid red' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'monospace'
              }}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '5px 10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.token && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.token}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Get your token from GitHub: Settings → Developer settings → Personal access tokens
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description
          </label>
          <input
            type="text"
            placeholder="e.g., Production Token, Backup Token"
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              style={{ marginRight: '8px', width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 'bold' }}>Set as Active Token</span>
          </label>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '26px' }}>
            Only one token can be active. This will deactivate all other tokens.
          </div>
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
              marginRight: '10px',
              fontSize: '16px'
            }}
          >
            {loading ? 'Processing...' : (form.id ? 'Update Token' : 'Add Token')}
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
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h3>Stored Tokens ({tokens.length})</h3>
        {loading && tokens.length === 0 ? (
          <div>Loading tokens...</div>
        ) : tokens.length === 0 ? (
          <div style={{ 
            color: '#666', 
            fontStyle: 'italic',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '5px'
          }}>
            No tokens found. Add your first GitHub token above.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {tokens.map((t) => (
              <div 
                key={t.id} 
                style={{
                  padding: '20px',
                  border: t.is_active === 1 ? '2px solid #28a745' : '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: t.is_active === 1 ? '#f0fff4' : '#ffffff',
                  boxShadow: t.is_active === 1 ? '0 2px 8px rgba(40, 167, 69, 0.2)' : 'none'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      {getStatusBadge(t.is_active === 1)}
                    </div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '5px'
                    }}>
                      {t.token}
                    </div>
                    {t.description && (
                      <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                        {t.description}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      Created: {new Date(t.created_at).toLocaleDateString()}
                      {' • '}
                      Updated: {new Date(t.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {t.is_active !== 1 && (
                      <button 
                        onClick={() => handleSetActive(t.id)}
                        disabled={loading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Activate
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(t)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageGithubTokens;