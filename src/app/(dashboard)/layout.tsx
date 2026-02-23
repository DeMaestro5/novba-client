'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/UI/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage on mount (before paint)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
      // Mark as hydrated immediately after reading
      setIsHydrated(true);
    }
  }, []);

  // Enable transitions after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect new users to onboarding
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = localStorage.getItem('novba_onboarding_completed');
    if (completed !== 'true') {
      router.replace('/onboarding');
    }
  }, [router]);

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Sidebar onCollapseChange={handleCollapseChange} />

      <div
        className={`pt-14 lg:pt-0 ${isMounted ? 'transition-all duration-300 ease-in-out' : ''} ${
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'
        } ${isHydrated ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transition:
            isHydrated && isMounted
              ? 'all 300ms ease-in-out'
              : 'opacity 150ms ease-in-out',
        }}
      >
        <main className='min-h-screen bg-gray-50'>
        <ToastProvider>{children}</ToastProvider>
      </main>
      </div>
    </div>
  );
}
