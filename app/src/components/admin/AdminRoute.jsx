import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  console.log({
      user,
      isAuthenticated,
      isLoading
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    console.log("Redirecting because:", { isAuthenticated, role: user?.role });
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
