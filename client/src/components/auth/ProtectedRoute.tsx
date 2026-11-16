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

  // If unauthenticated, redirect to login with redirect path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified and does not match, redirect to respective home with warning
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    const targetRedirect = user.role === 'VERIFIER' ? '/verifier/dashboard' : '/admin/dashboard';
    return <Navigate to={targetRedirect} replace />;
  }

  return <>{children}</>;
};
