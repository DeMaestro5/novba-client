'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/UI/Toast';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isInitialized } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }
  };

  return (
    <div className='bg-gray-50 dark:bg-gray-950 min-h-screen'>
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
        <main className='min-h-screen bg-gray-50 dark:bg-gray-950'>
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
