'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        />
      </svg>
    ),
  },
  {
    href: '/invoices',
    label: 'Invoices',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        />
      </svg>
    ),
  },
  {
    href: '/clients',
    label: 'Clients',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
        />
      </svg>
    ),
  },
  {
    href: '/proposals',
    label: 'Proposals',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
        />
      </svg>
    ),
  },
  {
    href: '/contracts',
    label: 'Contracts',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        />
      </svg>
    ),
  },
  {
    href: '/payments',
    label: 'Payments',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
        />
      </svg>
    ),
  },
  {
    href: '/expenses',
    label: 'Expenses',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z'
        />
      </svg>
    ),
  },
  {
    href: '/pricing',
    label: 'AI Pricing',
    isSpecial: true,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
        />
      </svg>
    ),
  },
  {
    href: '/portfolio',
    label: 'Portfolio',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    isSpecial: false,
    icon: (
      <svg
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        className='h-5 w-5'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
        />
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
        />
      </svg>
    ),
  },
];

interface SidebarProps {
  onCollapseChange: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const { mode, setMode } = useTheme();

  // Read from localStorage on mount; defer setState to avoid synchronous setState in effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('sidebarCollapsed');
    const shouldCollapse = saved === 'true';
    const id = requestAnimationFrame(() => {
      if (shouldCollapse) {
        setIsCollapsed(true);
        onCollapseChange(true);
      }
      setIsHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCollapse = (value: boolean) => {
    setIsCollapsed(value);
    onCollapseChange(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', value.toString());
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* MOBILE HEADER */}
      <header className='fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900 bg-white px-4 lg:hidden'>
        <button
          onClick={() => setMobileOpen(true)}
          className='flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none'
        >
          <svg
            className='h-5 w-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>
        <Link
          href='/dashboard'
          className='text-xl font-extrabold text-orange-600 focus:outline-none'
        >
          Novba
        </Link>
        <div className='h-9 w-9' />
      </header>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR - Hidden until hydrated to prevent flash */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-100 dark:border-gray-800 dark:bg-gray-900 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'w-[240px] translate-x-0' : 'w-[240px] -translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'} ${
          isHydrated ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transition: isHydrated
            ? 'all 300ms ease-in-out'
            : 'opacity 150ms ease-in-out',
        }}
      >
        {/* HEADER */}
        <div
          className={`flex h-14 shrink-0 items-center border-b border-gray-100 dark:border-gray-800 px-4 ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}
        >
          {/* Logo - hide when collapsed */}
          {!isCollapsed && (
            <Link
              href='/dashboard'
              className='text-xl font-extrabold text-orange-600 hover:text-orange-700 focus:outline-none transition-opacity duration-200'
            >
              Novba
            </Link>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 focus:outline-none lg:hidden'
          >
            <svg
              className='h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => handleCollapse(!isCollapsed)}
            className='hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 focus:outline-none lg:flex'
          >
            {isCollapsed ? (
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            ) : (
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            )}
          </button>
        </div>

        {/* NAVIGATION - Icons always visible, labels hide when collapsed */}
        <nav className='flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5'>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  isCollapsed ? 'lg:justify-center lg:px-2' : 'px-3'
                } ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-200 dark:shadow-orange-900'
                      : 'bg-orange-50 text-orange-600 dark:bg-orange-600/20 dark:text-orange-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {/* Icon - ALWAYS VISIBLE */}
                <span className='shrink-0'>{item.icon}</span>

                {/* Label - hidden when collapsed */}
                {!isCollapsed && (
                  <>
                    <span className='ml-3 whitespace-nowrap'>{item.label}</span>
                    {item.isSpecial && !isActive && (
                      <span className='ml-auto shrink-0 rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-bold text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'>
                        NEW
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* THEME TOGGLE */}
        {!isCollapsed && (
          <div className='px-3 pb-2'>
            <div className='flex items-center rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-0.5'>
              {(
                [
                  {
                    value: 'light' as const,
                    label: 'Light',
                    icon: (
                      <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                          d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z' />
                      </svg>
                    ),
                  },
                  {
                    value: 'dark' as const,
                    label: 'Dark',
                    icon: (
                      <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                          d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
                      </svg>
                    ),
                  },
                  {
                    value: 'system' as const,
                    label: 'System',
                    icon: (
                      <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                          d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                      </svg>
                    ),
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  title={option.label}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
                    mode === option.value
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className='px-3 pb-2 hidden lg:block'>
            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark')}
              title={`Theme: ${mode}`}
              className='flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mx-auto'
            >
              {mode === 'dark' ? (
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
                </svg>
              ) : mode === 'system' ? (
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
              ) : (
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z' />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* USER PROFILE */}
        <div className='shrink-0 border-t border-gray-100 dark:border-gray-800 p-3'>
          <div
            className={`flex cursor-pointer items-center rounded-xl p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}
          >
            {/* Avatar - always visible */}
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white'>
              S
            </div>
            {/* Name/Plan - hidden when collapsed */}
            {!isCollapsed && (
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
                  Stephen O.
                </p>
                <p className='truncate text-xs text-gray-500 dark:text-gray-500'>Free Plan</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
