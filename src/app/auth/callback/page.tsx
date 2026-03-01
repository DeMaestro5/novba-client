'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setTokens, clearTokens } from '@/lib/tokens';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    async function handleCallback() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (!accessToken?.trim() || !refreshToken?.trim()) {
          router.replace('/login?error=oauth_failed');
          return;
        }

        // Store tokens first
        setTokens(accessToken, refreshToken);

        // Fetch profile so we have user.onboardingCompleted before redirecting.
        await initializeAuth();

        // Clean URL
        window.history.replaceState({}, '', '/auth/callback');

        const user = useAuthStore.getState().user;
        const target = user?.onboardingCompleted === true ? '/dashboard' : '/onboarding';
        router.replace(target);
      } catch {
        clearTokens();
        router.replace('/login?error=oauth_failed');
      }
    }

    handleCallback();
  }, [router, initializeAuth]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-white'>
      <div className='mb-8'>
        <span className='text-3xl font-extrabold text-orange-600'>Novba</span>
      </div>
      <div className='relative mb-6'>
        <div className='w-12 h-12 border-4 border-orange-100 rounded-full' />
        <div className='w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute inset-0' />
      </div>
      <p className='text-sm font-medium text-gray-600'>Signing you in...</p>
      <p className='text-xs text-gray-400 mt-1'>Just a moment</p>
    </div>
  );
}
