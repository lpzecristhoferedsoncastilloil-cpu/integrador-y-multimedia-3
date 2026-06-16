import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#87CEEB' }}>
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-black border-t-yellow-400 rounded-full animate-spin"></div>
          <p className="mt-4 text-2xl" style={{ fontFamily: 'VT323, monospace' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};