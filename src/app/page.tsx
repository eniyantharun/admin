'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/shared/utils/helpers/cookieHelper';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
}