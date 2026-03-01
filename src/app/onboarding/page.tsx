'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingSlider from '@/components/onboarding/OnboardingSlider';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const FLOATER_CARDS = [
  {
    position: 'top-[8%] left-[3%]',
    rotate: -10,
    letter: 'A',
    company: 'Acme Corp',
    amount: '$4,200',
    status: 'Paid' as const,
    duration: 16,
    delay: 0,
  },
  {
    position: 'top-[12%] right-[3%]',
    rotate: 8,
    letter: 'T',
    company: 'TechStart',
    amount: '$8,500',
    status: 'Pending' as const,
    duration: 20,
    delay: 2.5,
  },
  {
    position: 'top-[52%] left-[2%]',
    rotate: 6,
    letter: 'G',
    company: 'Growth Labs',
    amount: '$3,100',
    status: 'Paid' as const,
    duration: 18,
    delay: 1,
  },
  {
    position: 'top-[58%] right-[2%]',
    rotate: -7,
    letter: 'N',
    company: 'Nova Co',
    amount: '$12,800',
    status: 'Paid' as const,
    duration: 22,
    delay: 3.5,
  },
  {
    position: 'top-[30%] left-[1%]',
    rotate: 12,
    letter: 'M',
    company: 'Melo Studio',
    amount: '$6,400',
    status: 'Pending' as const,
    duration: 15,
    delay: 1.8,
  },
  {
    position: 'top-[35%] right-[1%]',
    rotate: -4,
    letter: 'S',
    company: 'Spark Inc',
    amount: '$2,950',
    status: 'Paid' as const,
    duration: 19,
    delay: 4.2,
  },
];

function LoadingSpinner() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='relative'>
        <div className='w-12 h-12 border-4 border-orange-100 rounded-full' />
        <div className='w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute inset-0' />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isInitialized, setUser } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.onboardingCompleted === true) {
      router.replace('/dashboard');
    }
  }, [isInitialized, user, router]);

  const handleComplete = async () => {
    try {
      await api.post('/onboarding/skip', { reason: 'completed' });
    } catch {
      // Don't block navigation on API failure
    }
    // Update store so middleware/page guard sees onboardingCompleted: true
    if (user) {
      setUser({ ...user, onboardingCompleted: true });
    }
    router.replace('/dashboard');
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await api.post('/onboarding/skip', { reason: 'completed' });
    } catch {
      // Don't block
    }
    if (user) {
      setUser({ ...user, onboardingCompleted: true });
    }
    router.replace('/invoices/' + invoiceId);
  };

  // Show spinner until auth is resolved
  if (!isInitialized || !user) {
    return <LoadingSpinner />;
  }

  // Already completed — show spinner while redirect fires
  if (user.onboardingCompleted === true) {
    return <LoadingSpinner />;
  }

  // User exists and hasn't completed onboarding — show the page
  return (
    <div
      className='relative min-h-screen overflow-hidden bg-gray-50 flex items-center justify-center p-4'
      style={{
        backgroundImage:
          'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Subtle warm glow */}
      <div
        className='fixed inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,0.08), transparent)',
        }}
        aria-hidden
      />

      {/* Floating invoice cards */}
      {FLOATER_CARDS.map((card, i) => (
        <div
          key={i}
          className={`absolute pointer-events-none ${card.position}`}
          style={{ transform: `rotate(${card.rotate}deg)`, zIndex: 0 }}
          aria-hidden
        >
          <motion.div
            className='h-[110px] w-[180px] rounded-2xl border border-gray-200 bg-white p-4'
            style={{
              boxShadow:
                '0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.85, 0.85, 0],
              y: [-8, 8, -6, -8],
            }}
            transition={{
              duration: card.duration,
              delay: card.delay,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          >
            <div className='flex items-start justify-between gap-2'>
              <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-xs font-black text-white'>
                {card.letter}
              </div>
              <span
                className={
                  card.status === 'Paid'
                    ? 'rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600'
                    : 'rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600'
                }
              >
                {card.status}
              </span>
            </div>
            <p className='mt-2 text-xs font-semibold text-gray-700'>
              {card.company}
            </p>
            <p className='mt-1 text-base font-black text-gray-900'>
              {card.amount}
            </p>
          </motion.div>
        </div>
      ))}

      <OnboardingSlider
        onComplete={handleComplete}
        onSendInvoice={handleSendInvoice}
        userFirstName={user.firstName}
      />
    </div>
  );
}
