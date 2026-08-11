import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminRoute = ({ children, noSidebar = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-bg text-brand-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        <span className="ml-3 font-semibold">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (noSidebar) {
    return (
      <div className="flex flex-1 overflow-hidden bg-dark-bg w-full">
        <div className="flex-1 overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-dark-bg w-full">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto min-w-0 pb-16">
        {children}
      </div>
    </div>
  );
};

export default AdminRoute;
