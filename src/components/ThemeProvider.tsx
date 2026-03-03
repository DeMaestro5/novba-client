'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  resolvedTheme: 'light',
  setMode: () => {},
});

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

/** Auth routes always use light theme so login/signup stay white. */
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];

function isAuthPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('novba_theme_mode') as ThemeMode) || 'light';
    const resolved = saved === 'system' ? getSystemTheme() : saved;
    setModeState(saved);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    const effective = isAuthPath(pathname) ? 'light' : resolvedTheme;
    applyTheme(effective);
  }, [pathname, resolvedTheme]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    const resolved = newMode === 'system' ? getSystemTheme() : newMode;
    setModeState(newMode);
    setResolvedTheme(resolved);
    localStorage.setItem('novba_theme_mode', newMode);
    if (!isAuthPath(pathname)) applyTheme(resolved);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
