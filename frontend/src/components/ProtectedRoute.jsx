// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireWedding = false }) => {
  const { isAuthenticated, activeWeddingId } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireWedding && !activeWeddingId) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
