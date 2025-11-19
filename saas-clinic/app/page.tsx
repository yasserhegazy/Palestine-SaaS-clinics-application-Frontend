'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LandingPage from './LandingPage/page';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role, isPlatformAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isPlatformAdmin) {
        router.push('/platform/dashboard');
        return;
      }

      switch (role) {
        case 'Manager':
          router.push('/clinic/dashboard');
          break;
        case 'Doctor':
          router.push('/doctor/dashboard');
          break;
        case 'Secretary':
          router.push('/reception/dashboard');
          break;
        case 'Patient':
          router.push('/patient/dashboard');
          break;
        default:
          router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, isPlatformAdmin, role, router]);

  return <LandingPage />;
}

