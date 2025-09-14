import React, { useState, useEffect } from 'react';
import { API_URL, STATIC_URL } from '../../config';

const NewsletterManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Message form state
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    messageType: 'newsletter'
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscribers
      const subscribersRes = await fetch(`${API_URL}/newsletter/subscribers`, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/newsletter/stats`, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Fetch messages (this might fail if endpoint doesn't exist yet)
      let messagesData = { data: { messages: [] } };
      try {
        const messagesRes = await fetch(`${API_URL}/newsletter/messages`, { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (messagesRes.ok) {
          messagesData = await messagesRes.json();
        }
      } catch (msgError) {
        console.log('Messages endpoint not available yet:', msgError);
      }

      if (subscribersRes.ok) {
        const subscribersData = await subscribersRes.json();
        setSubscribers(subscribersData.data || []);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || {});
      }
      
      setMessages(messagesData.data?.messages || []);
      
    } catch (error) {
      console.error('Error fetching newsletter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (email) => {
    setConfirmDelete(email);
  };

  const confirmDeleteAction = async () => {
    const email = confirmDelete;
    setConfirmDelete(null);

    try {
      const response = await fetch(`${API_URL}/newsletter/subscribers/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSubscribers(prev => prev.filter(sub => sub.email !== email));
        await fetchData(); // Refresh stats
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Error deleting subscriber');
    }
  };

  const downloadSubscribers = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to download');
      return;
    }

    const emailList = subscribers.map(subscriber => subscriber.email).join('\n');
    const blob = new Blob([emailList], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_emails_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageForm.subject.trim() || !messageForm.message.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch(`${API_URL}/newsletter/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageForm)
      });

      const result = await response.json();

      if (response.ok) {
        setSendResult({
          success: true,
          data: result.data
        });
        
        // Reset form
        setMessageForm({
          subject: '',
          message: '',
          messageType: 'newsletter'
        });
        
        // Refresh data
        await fetchData();
      } else {
        setSendResult({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSendResult({
        success: false,
        message: 'Failed to send message. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '50px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading newsletter data...
      </div>
    );
  }

  const tabStyle = {
    display: 'flex',
    gap: '4px',
    marginBottom: '30px',
    backgroundColor: '#f3f4f6',
    padding: '4px',
    borderRadius: '12px',
    flexWrap: 'wrap'
  };

  const tabButtonStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? 'white' : 'transparent',
    color: isActive ? '#2563eb' : '#6b7280',
    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
  });

  const cardStyle = {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
  };

  const statCardStyle = (gradient) => ({
    background: gradient,
    padding: '24px',
    borderRadius: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#111827', 
          margin: '0 0 8px 0' 
        }}>
          Newsletter Management
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
          Manage subscribers and send messages to your community
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={tabStyle}>
        <button
          onClick={() => setActiveTab('overview')}
          style={tabButtonStyle(activeTab === 'overview')}
        >
          <span>👥</span>
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          style={tabButtonStyle(activeTab === 'compose')}
        >
          <span>💬</span>
          <span>Compose Message</span>
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          style={tabButtonStyle(activeTab === 'subscribers')}
        >
          <span>📧</span>
          <span>Subscribers</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={tabButtonStyle(activeTab === 'history')}
        >
          <span>📜</span>
          <span>Message History</span>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Statistics Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            <div style={statCardStyle('linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)')}>
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total Subscribers</p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>{stats.total_subscribers || 0}</p>
              </div>
              <span style={{ fontSize: '32px', opacity: 0.8 }}>👥</span>
            </div>
            
            <div style={statCardStyle('linear-gradient(135deg, #10b981 0%, #059669 100%)')}>
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Active Subscribers</p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>{stats.active_subscribers || 0}</p>
              </div>
              <span style={{ fontSize: '32px', opacity: 0.8 }}>📧</span>
            </div>
            
            <div style={statCardStyle('linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')}>
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Today's Subscriptions</p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>{stats.today_subscriptions || 0}</p>
              </div>
              <span style={{ fontSize: '32px', opacity: 0.8 }}>📅</span>
            </div>
            
            <div style={statCardStyle('linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')}>
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Messages Sent</p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>{messages.length || 0}</p>
              </div>
              <span style={{ fontSize: '32px', opacity: 0.8 }}>📤</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>Quick Actions</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              <button
                onClick={() => setActiveTab('compose')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                <span>💬</span>
                <span>Compose Message</span>
              </button>
              
              <button
                onClick={downloadSubscribers}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                <span>📥</span>
                <span>Download Emails</span>
              </button>
              
              <button
                onClick={() => setActiveTab('subscribers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                <span>👥</span>
                <span>Manage Subscribers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Tab */}
      {activeTab === 'compose' && (
        <div style={{ maxWidth: '800px' }}>
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#111827'
            }}>
              <span style={{ color: '#3b82f6', fontSize: '28px' }}>💬</span>
              <span>Compose Newsletter Message</span>
            </h3>

            {sendResult && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${sendResult.success ? '#10b981' : '#ef4444'}`,
                backgroundColor: sendResult.success ? '#ecfdf5' : '#fef2f2',
                color: sendResult.success ? '#065f46' : '#991b1b'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {sendResult.success ? '✅' : '❌'}
                  </span>
                  <div>
                    {sendResult.success ? (
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Message sent successfully!</p>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                          Sent to {sendResult.data.successfulSends} of {sendResult.data.totalSubscribers} subscribers
                          {sendResult.data.failedSends > 0 && (
                            <span style={{ color: '#f59e0b' }}> ({sendResult.data.failedSends} failed)</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <p style={{ margin: 0 }}>{sendResult.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 200px', 
                gap: '16px', 
                marginBottom: '24px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Message Type
                  </label>
                  <select
                    value={messageForm.messageType}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, messageType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="newsletter">📰 Newsletter</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="update">🔄 Update</option>
                  </select>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'end' 
                }}>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      color: '#6b7280' 
                    }}>
                      Recipients: <span style={{ fontWeight: '700', color: '#111827' }}>{stats.active_subscribers || 0}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Subject Line
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject..."
                  maxLength={200}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  margin: '4px 0 0 0' 
                }}>
                  {messageForm.subject.length}/200 characters
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Message Content
                </label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your newsletter message here..."
                  rows={12}
                  maxLength={10000}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  margin: '4px 0 0 0' 
                }}>
                  {messageForm.message.length}/10,000 characters
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                paddingTop: '24px', 
                borderTop: '1px solid #e5e7eb' 
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  This message will be sent to all {stats.active_subscribers || 0} active subscribers
                </div>
                <button
                  type="submit"
                  disabled={sending || !messageForm.subject.trim() || !messageForm.message.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: sending ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!sending && messageForm.subject.trim() && messageForm.message.trim()) {
                      e.target.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!sending) {
                      e.target.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  <span>📤</span>
                  <span>{sending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div style={cardStyle}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '600' 
            }}>
              All Subscribers ({subscribers.length})
            </h3>
            <button
              onClick={downloadSubscribers}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              <span>📥</span>
              <span>Download Emails</span>
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Subscribed Date
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber, index) => (
                  <tr 
                    key={index}
                    style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '14px', 
                      color: '#111827' 
                    }}>
                      {subscriber.email}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '14px', 
                      color: '#6b7280' 
                    }}>
                      {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => handleDeleteClick(subscriber.email)}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#dc2626'}
                        onMouseOut={(e) => e.target.style.color = '#ef4444'}
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message History Tab */}
      {activeTab === 'history' && (
        <div style={cardStyle}>
          <div style={{ 
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Message History</h3>
          </div>
          
          <div>
            {messages.length === 0 ? (
              <div style={{ 
                padding: '48px', 
                textAlign: 'center', 
                color: '#6b7280' 
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                <p style={{ margin: 0, fontSize: '16px' }}>No messages sent yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      backgroundColor: '#fafbfc'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#111827' 
                          }}>
                            {msg.subject}
                          </h4>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            borderRadius: '12px',
                            fontWeight: '500',
                            backgroundColor: msg.message_type === 'announcement' 
                              ? '#faf5ff' 
                              : msg.message_type === 'update'
                              ? '#eff6ff'
                              : '#f0fdf4',
                            color: msg.message_type === 'announcement' 
                              ? '#7c3aed' 
                              : msg.message_type === 'update'
                              ? '#2563eb'
                              : '#059669'
                          }}>
                            {msg.message_type}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '16px', 
                          fontSize: '14px', 
                          color: '#6b7280' 
                        }}>
                          <span>📅 Sent: {new Date(msg.sent_at).toLocaleString()}</span>
                          <span>👥 Recipients: {msg.total_recipients || 0}</span>
                          <span style={{ color: '#059669' }}>✅ Success: {msg.successful_sends || 0}</span>
                          {(msg.failed_sends > 0) && (
                            <span style={{ color: '#ef4444' }}>❌ Failed: {msg.failed_sends}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px' 
            }}>
              <div style={{
                backgroundColor: '#fef2f2',
                padding: '8px',
                borderRadius: '50%'
              }}>
                <span style={{ fontSize: '24px' }}>🗑️</span>
              </div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                Confirm Delete
              </h3>
            </div>
            
            <p style={{ 
              margin: '0 0 8px 0', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Are you sure you want to delete this subscriber?
            </p>
            <p style={{ 
              fontWeight: '600', 
              color: '#ef4444', 
              margin: '0 0 24px 0',
              fontSize: '16px'
            }}>
              {confirmDelete}
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px' 
            }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;