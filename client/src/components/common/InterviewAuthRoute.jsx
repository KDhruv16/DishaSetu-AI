import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Route guard that ensures the user is authenticated (candidate, organization, or admin)
 * without role-based redirects. Allows organization users to preview the AI Interview Room
 * while keeping unauthorized visitors out.
 */
export const InterviewAuthRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen label="Verifying session credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
