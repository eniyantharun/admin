'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="home-page-container min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="home-page-loading-wrapper text-center">
        <div className="home-page-spinner animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
        <h2 className="home-page-loading-title text-lg font-semibold text-secondary-900 mb-2">
          {process.env.NEXT_PUBLIC_APP_NAME || 'Admin Portal'}
        </h2>
        <p className="home-page-loading-text text-secondary-600">
          Loading application...
        </p>
      </div>
    </div>
  );
}