// pages/visitCounters.js
import React, { useState, useEffect } from 'react';

const VisitCounter = () => {
  const [visitStats, setVisitStats] = useState({
    dailyVisits: 0,
    lifetimeVisits: 0,
    visitDate: null,
    lastUpdated: null
  });
  const [visitHistory, setVisitHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Function to fetch current visit statistics
  const fetchVisitStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/visits/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setVisitStats(result.data);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to fetch visit statistics');
      }
    } catch (err) {
      console.error('Error fetching visit stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch visit history
  const fetchVisitHistory = async (days = 7) => {
    try {
      const response = await fetch(`${API_URL}/visits/history?days=${days}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setVisitHistory(result.data.history);
      }
    } catch (err) {
      console.error('Error fetching visit history:', err);
    }
  };

  // Function to fetch visit trends
  const fetchVisitTrends = async (days = 7) => {
    try {
      const response = await fetch(`${API_URL}/visits/trends?days=${days}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setTrends(result.data);
      }
    } catch (err) {
      console.error('Error fetching visit trends:', err);
    }
  };

  // Function to record a new visit
  const recordVisit = async () => {
    try {
      const response = await fetch(`${API_URL}/visits/record`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setVisitStats(result.data);
        setError(null);
        // Refresh related data
        await fetchVisitHistory();
        await fetchVisitTrends();
      } else {
        throw new Error(result.message || 'Failed to record visit');
      }
    } catch (err) {
      console.error('Error recording visit:', err);
      setError(err.message);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await fetchVisitStats();
      await fetchVisitHistory();
      await fetchVisitTrends();
    };

    loadData();
  }, []);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVisitStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Website Analytics Dashboard
        </h1>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
          error 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            error ? 'bg-red-400' : 'bg-green-400'
          }`}></div>
          {error ? 'Offline' : 'Live'}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            <strong>Connection Error:</strong> {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              fetchVisitStats();
            }}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Today's Visits */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today's Visits</p>
              <p className="text-3xl font-bold">{visitStats.dailyVisits.toLocaleString()}</p>
              <p className="text-blue-100 text-xs mt-1">
                {formatDate(visitStats.visitDate)}
              </p>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
        </div>

        {/* Lifetime Visits */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Visits</p>
              <p className="text-3xl font-bold">{visitStats.lifetimeVisits.toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-1">
                All time tracking
              </p>
            </div>
            <div className="text-4xl opacity-80">🌍</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={recordVisit}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
          >
            Record New Visit
          </button>
          <button
            onClick={fetchVisitStats}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-medium"
          >
            Refresh Data
          </button>
          <button
            onClick={() => fetchVisitHistory(30)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Load 30 Days
          </button>
        </div>
      </div>

      {/* Visit History Table */}
      {visitHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Visit History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day of Week</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visitHistory.map((visit, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(visit.visit_date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {visit.daily_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(visit.visit_date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trends Visualization */}
      {trends.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Visit Trends</h2>
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {formatDate(trend.visit_date)}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Daily: {trend.daily_count}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    Total: {trend.cumulative_total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated Info */}
      {visitStats.lastUpdated && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {formatTimestamp(visitStats.lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default VisitCounter;