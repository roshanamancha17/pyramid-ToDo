'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useApp();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/tasks' : '/login');
  }, [loading, user, router]);

  return null;
}
