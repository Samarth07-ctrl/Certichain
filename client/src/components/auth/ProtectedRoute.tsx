import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'VERIFIER'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useBlockchain();
  const location = useLocation();

  // If unauthenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified and does not match
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <Navigate to="/institution/dashboard" replace />;
  }

  return <>{children}</>;
};
