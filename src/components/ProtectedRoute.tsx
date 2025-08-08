import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './common/LoadingSpinner';
import Auth from '../pages/Auth';
import ErrorBoundary from './common/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default ProtectedRoute;