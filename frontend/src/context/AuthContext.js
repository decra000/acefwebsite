import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ Use the API URL directly without adding /api again
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔐 Safe JSON parser to catch non-JSON errors
  const safeJson = async (res) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || 'Unexpected server response');
    }
  };

  // 👤 Load user from /auth/me
  const fetchProfile = async () => {
    try {
      console.log('🔍 Fetching profile from:', `${API_BASE}/auth/me`);
      
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Unable to fetch user');

      setUser(data);
    } catch (error) {
      console.error('❌ Fetch profile failed:', error.message);
      setUser(null);
    }
  };

  // 🔓 Login
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login to:', `${API_BASE}/auth/login`);
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Login failed');

      await fetchProfile();
      return data;
    } catch (err) {
      console.error('❌ Login failed:', err.message);
      throw new Error(err.message || 'Login error');
    }
  };

  // 🔒 Logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (err) {
      console.warn('⚠️ Logout failed:', err.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};