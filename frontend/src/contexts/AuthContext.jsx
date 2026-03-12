// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ✅ Lire localStorage une seule fois au démarrage — synchrone, pas de useEffect
const loadInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) {
      return { token, user: JSON.parse(user), isAuthenticated: true };
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { token: null, user: null, isAuthenticated: false };
};

const initial = loadInitialState();

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(initial.user);
  const [token,           setToken]           = useState(initial.token);
  const [isAuthenticated, setIsAuthenticated] = useState(initial.isAuthenticated);
  const [activeWeddingId, setActiveWeddingId] = useState(localStorage.getItem('activeWeddingId'));

  // ✅ Plus de isLoading — localStorage est synchrone
  const isLoading = false;

  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api`;

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'inscription");

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.wedding?.id) localStorage.setItem('activeWeddingId', data.wedding.id);

      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setActiveWeddingId(data.wedding?.id);
      return { success: true, wedding: data.wedding };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la connexion');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeWeddingId');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setActiveWeddingId(null);
  };

  const setActiveWedding = (weddingId) => {
    localStorage.setItem('activeWeddingId', weddingId);
    setActiveWeddingId(weddingId);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Erreur refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, isLoading,
      activeWeddingId, register, login, logout,
      setActiveWedding, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
