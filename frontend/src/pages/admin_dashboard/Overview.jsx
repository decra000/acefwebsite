import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Eye, Users, Calendar, TrendingUp, Clock, Globe, RefreshCw, Activity, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

// Import the menu items configuration from the Sidebar
import { ALL_MENU_ITEMS } from './SideBar'; // Adjust path as needed

const API_BASE = API_URL;

const DashboardOverview = () => {
  const [isQuickLinksExpanded, setIsQuickLinksExpanded] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [visitAnalytics, setVisitAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use ref to prevent loading check race conditions
  const isLoadingRef = useRef(false);

  // Fixed fetchAnalytics function - remove loading from dependencies
  const fetchAnalytics = useCallback(async () => {
    // Prevent multiple simultaneous calls using ref
    if (isLoadingRef.current) {
      console.log('Analytics fetch already in progress, skipping...');
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError('');
    console.log('Starting analytics fetch...');
    
    try {
      const analyticsResponse = await fetch(`${API_BASE}/visits/analytics`, { 
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Analytics response status:', analyticsResponse.status);
      
      if (!analyticsResponse.ok) {
        throw new Error(`Analytics endpoint failed: ${analyticsResponse.status}`);
      }
      
      const analyticsResult = await analyticsResponse.json();
      console.log('Analytics data received:', analyticsResult);
      
      if (analyticsResult.success && analyticsResult.data) {
        const consolidatedData = {
          // Map the analytics data to your component's expected format
          todayViews: analyticsResult.data.today_views || 0,
          lifetimeViews: parseInt(analyticsResult.data.total_views) || 0,
          uniqueVisitors: analyticsResult.data.unique_visitors || 0,
          newVisitors: analyticsResult.data.new_visitors || 0,
          returningVisitors: analyticsResult.data.returning_visitors || 0,
          avgSessionTime: '0m 0s',
          topCountry: analyticsResult.data.top_countries?.[0]?.country || 'Unknown',
          topCountries: analyticsResult.data.top_countries || [],
          popularPages: analyticsResult.data.popular_pages || [],
          trafficSources: analyticsResult.data.traffic_sources || [],
          dailyTrend: analyticsResult.data.daily_trend || [],
          browserStats: analyticsResult.data.browser_stats || [],
          
          // Default values for other fields
          activeUsers: 0,
          newUsersToday: 0,
          totalSubscribers: 0,
          totalContent: 0,
          publishedToday: 0,
          totalProjects: 0,
          activeProjects: 0
        };

        console.log('Consolidated analytics data:', consolidatedData);
        setAnalyticsData(consolidatedData);
        setVisitAnalytics(analyticsResult.data);
        setLastRefresh(new Date());
      } else {
        throw new Error('Invalid analytics response format');
      }
      
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(`Failed to load analytics: ${err.message}`);
      
      // Set fallback data to prevent UI breaking
      setAnalyticsData({
        todayViews: 0,
        lifetimeViews: 0,
        uniqueVisitors: 0,
        newVisitors: 0,
        returningVisitors: 0,
        activeUsers: 0,
        newUsersToday: 0,
        avgSessionTime: '0m 0s',
        topCountry: 'Unknown',
        totalSubscribers: 0,
        totalContent: 0,
        publishedToday: 0,
        totalProjects: 0,
        activeProjects: 0,
        topCountries: [],
        popularPages: [],
        trafficSources: [],
        dailyTrend: [],
        browserStats: []
      });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [API_BASE]); // Only depend on API_BASE

  // Refresh analytics data
  const handleRefresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Function to check if user has access to a menu item
  const hasAccess = (menuItem) => {
    if (!user) return false;

    if (!menuItem.requiredRole.includes(user.role)) {
      return false;
    }

    if (user.role === 'admin') {
      return true;
    }

    if (!menuItem.requiredPermission) {
      return true;
    }

    if (user.role === 'Assistant Admin') {
      return user.permissions && user.permissions.includes(menuItem.requiredPermission);
    }

    if (user.role === 'Content Manager') {
      if (menuItem.id === 'manage_blogs') {
        return true;
      }
      return false;
    }

    return false;
  };

  // Generate dynamic quick links based on user permissions
  const getQuickLinks = () => {
    if (!user) return [];

    return ALL_MENU_ITEMS
      .filter(hasAccess)
      .filter(item => item.id !== 'overview' && item.id !== 'logout')
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        to: item.path,
        label: item.text,
        icon: item.icon
      }));
  };

  const quickLinks = getQuickLinks();

  // Get user greeting based on role
  const getUserGreeting = () => {
    if (!user) return 'Welcome';
    
    switch (user.role) {
      case 'admin':
        return `Welcome Admin ${user.name}`;
      case 'Assistant Admin':
        return `Welcome ${user.name}`;
      case 'Content Manager':
        return `Welcome ${user.name}`;
      default:
        return `Welcome ${user.name}`;
    }
  };

  // Get description based on user role and permissions
  const getUserDescription = () => {
    if (!user) return 'Manage your platform from the dashboard.';
    
    switch (user.role) {
      case 'admin':
        return 'Full administrative access to manage your platform with enhanced analytics tracking.';
      case 'Assistant Admin':
        const permCount = user.permissions?.length || 0;
        return `You have access to ${permCount} management ${permCount === 1 ? 'area' : 'areas'}.`;
      case 'Content Manager':
        return 'Manage content, blogs, and projects from your dashboard.';
      default:
        return 'Manage your platform from the dashboard.';
    }
  };

  // Format session time properly
  const formatSessionTime = (timeStr) => {
    if (!timeStr || timeStr === '0m 0s') return '0m 0s';
    return timeStr;
  };

  // Get role-specific analytics cards with enhanced visit tracking
  const getAnalyticsCards = () => {
    if (!analyticsData) return [];

    const baseCards = [
      {
        title: "Today's Views",
        value: analyticsData.todayViews.toLocaleString(),
        subtitle: `of ${analyticsData.lifetimeViews.toLocaleString()} total views`,
        icon: Eye,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        showProgress: true,
        progressPercent: analyticsData.lifetimeViews > 0 
          ? (analyticsData.todayViews / analyticsData.lifetimeViews * 100).toFixed(1)
          : 0
      },
      {
        title: "Unique Visitors",
        value: analyticsData.uniqueVisitors.toString(),
        subtitle: `${analyticsData.newVisitors} new, ${analyticsData.returningVisitors} returning`,
        icon: Users,
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        title: "Avg Session",
        value: formatSessionTime(analyticsData.avgSessionTime),
        subtitle: "per user session",
        icon: Clock,
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        title: "Top Location",
        value: analyticsData.topCountry,
        subtitle: `${analyticsData.topCountries.length} countries total`,
        icon: Globe,
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ];

    // Add role-specific cards
    if (user?.role === 'admin') {
      baseCards.push({
        title: "Newsletter",
        value: analyticsData.totalSubscribers.toString(),
        subtitle: "total subscribers",
        icon: TrendingUp,
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      });
    }

    if (user?.role === 'admin' || user?.role === 'Content Manager' || 
        (user?.role === 'Assistant Admin' && user?.permissions?.includes('manage_content'))) {
      baseCards.push({
        title: "Content",
        value: analyticsData.totalContent.toString(),
        subtitle: `+${analyticsData.publishedToday} published today`,
        icon: Calendar,
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
      });
    }

    return baseCards;
  };

  // Fixed useEffect - only run once when user changes
  useEffect(() => {
    let mounted = true;

    const initializeAnalytics = async () => {
      if (!user || !mounted) return;
      
      // Only fetch if we don't have data yet
      if (!analyticsData && !isLoadingRef.current) {
        fetchAnalytics();
      }
    };

    initializeAnalytics();

    // Listen for visit updates from header component
    const handleVisitUpdate = (event) => {
      if (event.detail && analyticsData && mounted) {
        setAnalyticsData(prev => ({
          ...prev,
          todayViews: event.detail.dailyVisits || prev.todayViews,
          lifetimeViews: event.detail.lifetimeVisits || prev.lifetimeViews
        }));
      }
    };

    window.addEventListener('visitRecorded', handleVisitUpdate);
    
    return () => {
      mounted = false;
      window.removeEventListener('visitRecorded', handleVisitUpdate);
    };
  }, [user]); // Only depend on user, not fetchAnalytics or analyticsData

  const analyticsCards = getAnalyticsCards();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            {getUserGreeting()}
          </h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: loading ? '#e5e7eb' : '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            <RefreshCw size={16} style={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} />
            Refresh
          </button>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          {getUserDescription()}
        </p>
        {lastRefresh && !loading && (
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '24px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Pinned Quick Links Section */}
      {quickLinks.length > 0 && (
        <div style={{ 
          position: 'sticky', 
          top: '0', 
          zIndex: 10, 
          backgroundColor: '#ffffff', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div 
            style={{ 
              padding: '16px 20px', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: isQuickLinksExpanded ? '1px solid #e5e7eb' : 'none'
            }}
            onClick={() => setIsQuickLinksExpanded(!isQuickLinksExpanded)}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>
              Quick Links ({quickLinks.length} available)
            </h3>
            {isQuickLinksExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {isQuickLinksExpanded && (
            <div style={{ 
              padding: '16px 20px',
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px' 
            }}>
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => navigate(link.to)}
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {link.icon && React.cloneElement(link.icon, { size: 16 })}
                    <span>{link.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Access Message for users with limited permissions */}
      {quickLinks.length === 0 && user && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', margin: '0 0 8px 0' }}>
            Limited Access
          </h3>
          <p style={{ color: '#92400e', fontSize: '14px', margin: 0 }}>
            {user.role === 'Assistant Admin' 
              ? 'No additional permissions granted. Contact an administrator to request access to management areas.'
              : 'Contact an administrator if you need access to additional features.'
            }
          </p>
        </div>
      )}

      {/* Enhanced Analytics Dashboard */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            {user?.role === 'admin' ? 'Enhanced Platform Analytics' : 'Dashboard Overview'}
          </h2>
          {loading && (
            <div style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} />
              Loading analytics...
            </div>
          )}
        </div>
        
        {/* Analytics Cards */}
        {analyticsData && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '24px'
          }}>
            {analyticsCards.map((card, index) => (
              <div 
                key={index}
                style={{
                  background: card.gradient,
                  padding: '24px',
                  borderRadius: '16px',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <card.icon size={24} style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>{card.title}</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {card.subtitle}
                  </div>
                  {card.showProgress && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '2px',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        width: `${Math.min(card.progressPercent, 100)}%`,
                        height: '100%',
                        backgroundColor: 'white',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Quick Stats Bar with Visit Analytics */}
        {analyticsData && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.lifetimeViews > 0 
                  ? ((analyticsData.todayViews / analyticsData.lifetimeViews) * 100).toFixed(1)
                  : '0.0'
                }%
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Today's Share</div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#cbd5e1' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.lifetimeViews > 0 
                  ? Math.round(analyticsData.lifetimeViews / 365).toLocaleString()
                  : '0'
                }
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Daily Average</div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#cbd5e1' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.topCountries.length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Countries</div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#cbd5e1' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.uniqueVisitors.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Unique Visitors</div>
            </div>
            {user?.role === 'admin' && (
              <>
                <div style={{ width: '1px', height: '40px', backgroundColor: '#cbd5e1' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                    {analyticsData.totalSubscribers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Newsletter Subs</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Enhanced Visit Analytics for Admins */}
        {user?.role === 'admin' && analyticsData && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Top Countries */}
            {analyticsData.topCountries.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  Top Countries
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analyticsData.topCountries.slice(0, 5).map((country, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ fontSize: '14px', color: '#374151' }}>{country.country}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {country.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Pages */}
            {analyticsData.popularPages.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                  Popular Pages
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analyticsData.popularPages.slice(0, 5).map((page, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{ fontSize: '14px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {page.page_url}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {page.visits}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && !analyticsData && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ color: '#6b7280', margin: 0 }}>Loading enhanced analytics data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Role-specific insights */}
      {user?.role === 'Assistant Admin' && user.permissions && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
            Your Permissions
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '12px' 
          }}>
            {user.permissions.map((permission, index) => {
              const menuItem = ALL_MENU_ITEMS.find(item => item.requiredPermission === permission);
              return (
                <div
                  key={index}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {menuItem?.icon && React.cloneElement(menuItem.icon, { size: 16, color: '#0ea5e9' })}
                  <span style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '500' }}>
                    {menuItem?.text || permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Platform Summary for Admins */}
      {user?.role === 'admin' && analyticsData && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
            Enhanced Platform Summary
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.totalProjects}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Total Projects</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                {analyticsData.activeProjects} active
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.totalContent}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Total Content</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                +{analyticsData.publishedToday} today
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.newVisitors}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>New Visitors</div>
              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>
                vs {analyticsData.returningVisitors} returning
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                {analyticsData.trafficSources.length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Traffic Sources</div>
              <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
                tracked channels
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Counter Integration */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
          Real-time Visit Tracking
        </h3>
        {analyticsData ? (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ecfdf5', 
              borderRadius: '8px',
              border: '1px solid #10b981'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46' }}>
                {analyticsData.todayViews}
              </div>
              <div style={{ fontSize: '12px', color: '#047857' }}>Views Today</div>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#eff6ff', 
              borderRadius: '8px',
              border: '1px solid #3b82f6'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af' }}>
                {analyticsData.lifetimeViews}
              </div>
              <div style={{ fontSize: '12px', color: '#1d4ed8' }}>Total Views</div>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fef3c7', 
              borderRadius: '8px',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>
                {analyticsData.uniqueVisitors}
              </div>
              <div style={{ fontSize: '12px', color: '#b45309' }}>Unique Visitors</div>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f3e8ff', 
              borderRadius: '8px',
              border: '1px solid #8b5cf6'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b21a8' }}>
                {formatSessionTime(analyticsData.avgSessionTime)}
              </div>
              <div style={{ fontSize: '12px', color: '#7c3aed' }}>Avg Session</div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            Enhanced visit tracking is loading...
          </div>
        )}
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && user && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#475569'
        }}>
          <strong>Debug Info:</strong><br />
          Role: {user.role}<br />
          Permissions: {user.permissions?.length || 0}<br />
          Available Quick Links: {quickLinks.length}<br />
          {user.permissions && (
            <>Granted Permissions: {user.permissions.join(', ')}<br /></>
          )}
          Analytics Data Status: {analyticsData ? 'Loaded' : 'Not loaded'}<br />
          Visit Analytics: {visitAnalytics ? 'Available' : 'Not available'}<br />
          Last Refresh: {lastRefresh.toLocaleString()}<br />
          Enhanced Tracking: {analyticsData?.uniqueVisitors ? 'Active' : 'Inactive'}<br />
          Loading Ref: {isLoadingRef.current ? 'True' : 'False'}
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const linkStyle = {
  display: 'block',
  padding: '12px 16px',
  textAlign: 'center',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  transition: 'all 0.2s ease',
  fontSize: '14px',
  cursor: 'pointer',
  width: '100%'
};

export default DashboardOverview;