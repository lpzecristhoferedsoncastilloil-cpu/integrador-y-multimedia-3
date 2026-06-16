import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(data);
    } catch (error) {
      setUser(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      const { data } = await axios.post(
        `${API}/auth/register`,
        { email, password, name },
        { withCredentials: true }
      );
      setUser(data);
      return { success: true, data };
    } catch (error) {
      const detail = error.response?.data?.detail;
      let message = 'Registration failed';
      if (typeof detail === 'string') message = detail;
      else if (Array.isArray(detail)) message = detail.map(e => e.msg || JSON.stringify(e)).join(' ');
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(data);
      return { success: true, data };
    } catch (error) {
      const detail = error.response?.data?.detail;
      let message = 'Login failed';
      if (typeof detail === 'string') message = detail;
      else if (Array.isArray(detail)) message = detail.map(e => e.msg || JSON.stringify(e)).join(' ');
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};