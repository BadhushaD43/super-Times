import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL as API_BASE } from '../lib/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getSavedToken = () => localStorage.getItem('token');

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getSavedToken());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getSavedToken()));
  const [user, setUser] = useState(() => (getSavedToken() ? { username: 'admin' } : null));

  useEffect(() => {
    const savedToken = getSavedToken();
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/token`, new URLSearchParams({
        username,
        password
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setIsAuthenticated(true);
      setUser({ username });
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return { ok: true };
    } catch (error) {
      console.error('Login failed', error);
      if (error.response?.status === 401) {
        return { ok: false, message: 'Username or password is incorrect.' };
      }
      if ([404, 405].includes(error.response?.status)) {
        return { ok: false, message: `Login API not found at ${API_BASE}. Check VITE_API_BASE_URL.` };
      }
      if (error.response?.status >= 500) {
        return { ok: false, message: 'Backend server error. Check the backend logs.' };
      }
      if (error.request) {
        return { ok: false, message: `Cannot reach backend at ${API_BASE}. Check CORS and the deployed backend URL.` };
      }
      return { ok: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
