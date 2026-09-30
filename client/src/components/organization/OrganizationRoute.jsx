import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';

export const OrganizationRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'organization') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
