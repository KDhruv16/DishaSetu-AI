import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen label="Verifying session credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect organization users to their dashboard
  if (user?.role === 'organization') {
    return <Navigate to="/organization" replace />;
  }

  // Redirect admin users to their dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
