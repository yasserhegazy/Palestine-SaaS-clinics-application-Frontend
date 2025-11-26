import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';

/**
 * Custom hook to guard routes based on user roles
 * Redirects to /403 if user doesn't have required role
 * 
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @param requirePlatformAdmin - If true, requires user to be a platform admin
 * @returns Object with isAuthorized and isLoading states
 */
export function useRoleGuard(
  allowedRoles: UserRole[],
  requirePlatformAdmin: boolean = false
) {
  const { user, role, isPlatformAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Check if user is authenticated
    if (!user || !role) {
      router.push('/login');
      return;
    }

    // Check platform admin requirement
    if (requirePlatformAdmin && !isPlatformAdmin) {
      router.push('/403');
      return;
    }

    // Check role-based access
    if (!requirePlatformAdmin && !allowedRoles.includes(role)) {
      router.push('/403');
      return;
    }
  }, [user, role, isPlatformAdmin, isLoading, allowedRoles, requirePlatformAdmin, router]);

  const isAuthorized = requirePlatformAdmin 
    ? isPlatformAdmin 
    : role ? allowedRoles.includes(role) : false;

  return {
    isAuthorized,
    isLoading,
  };
}
