"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { registerServiceWorker } from '@/lib/registerSW';
export default function Home() {
  const { student, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (student) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [student, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
