'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requireSuperuser?: boolean;
  redirectTo?: string;
}

/**
 * Component to protect routes that require authentication
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireSuperuser = false,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until authentication is checked
    if (!isLoading) {
      // Redirect if not authenticated
      if (!isAuthenticated) {
        router.push(redirectTo);
      }
      // Redirect if superuser is required but user is not a superuser
      else if (requireSuperuser && !user?.is_superuser) {
        router.push('/403');
      }
    }
  }, [isAuthenticated, user, isLoading, redirectTo, requireSuperuser, router]);

  // Show nothing while loading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Show nothing if not authenticated or lacks permissions
  if (!isAuthenticated || (requireSuperuser && !user?.is_superuser)) {
    return null;
  }

  // Render children if authenticated and has proper permissions
  return <>{children}</>;
};

export default AuthGuard; 