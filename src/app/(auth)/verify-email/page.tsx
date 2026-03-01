'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/UI/Button';
import { authApi } from '@/lib/api';

const RESEND_COOLDOWN_SEC = 60;

function CheckInboxState({
  email,
  onResend,
  resendCooldown,
  isResending,
}: {
  email: string;
  onResend: () => void;
  resendCooldown: number;
  isResending: boolean;
}) {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <Link
          href="/"
          className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
        >
          Novba
        </Link>
        <p className="mt-1 text-sm text-gray-500">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We sent a verification link to <span className="font-semibold text-gray-900">{email}</span>.
          Click the link to activate your account.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <Button
          type="button"
          variant="primary"
          size="md"
          fullWidth
          onClick={onResend}
          disabled={resendCooldown > 0 || isResending}
          isLoading={isResending}
        >
          {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend email'}
        </Button>
        <div className="text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
          >
            Wrong email? Go back
          </Link>
        </div>
      </div>
    </div>
  );
}

function VerifyingState() {
  return (
    <div className="w-full max-w-[420px] text-center">
      <div className="mb-8 text-left">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="mt-1 text-sm text-gray-500">AI-Powered Invoicing for Freelancers</p>
      </div>
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-sm text-gray-600">Verifying your email...</p>
      </div>
    </div>
  );
}

function VerifiedSuccessState() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="mt-1 text-sm text-gray-500">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your account is now active. Log in to get started.
        </p>
      </div>

      <Link href="/login" className="block">
        <Button variant="primary" size="md" fullWidth>
          Log in to your account
        </Button>
      </Link>
    </div>
  );
}

function InvalidLinkState() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="mt-1 text-sm text-gray-500">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or expired link</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          This verification link is invalid or has expired. Request a new one from sign up.
        </p>
      </div>

      <Link href="/signup" className="block">
        <Button variant="primary" size="md" fullWidth>
          Request new link
        </Button>
      </Link>
    </div>
  );
}

function RightPanel() {
  return (
    <div
      className="relative order-1 flex min-h-[500px] w-full shrink-0 flex-col items-center justify-center overflow-hidden lg:order-2 lg:min-h-screen lg:w-[60%] lg:flex-1 lg:min-w-0"
      style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)' }}
    >
      <div className="absolute -top-24 -right-24 hidden h-[500px] w-[500px] rotate-12 rounded-[60px] bg-white/8 lg:block" aria-hidden />
      <div className="absolute -bottom-32 -left-16 hidden h-[450px] w-[450px] rounded-full bg-white/6 lg:block" aria-hidden />
      <div className="absolute top-1/2 left-1/3 hidden h-[350px] w-[350px] -translate-y-1/2 -rotate-12 rounded-[40px] bg-white/5 lg:block" aria-hidden />

      <div className="relative z-10 mx-auto max-w-2xl px-12 py-16 lg:mx-0 lg:px-20 lg:py-20">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="mb-6 text-5xl font-black leading-[0.95] tracking-[-0.02em] text-white lg:text-7xl">
          One Click Away From Earning More
        </h2>

        <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/90 lg:text-xl">
          Verify your email to unlock your full Novba account and keep your data secure.
        </p>

        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <svg className="h-5 w-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Secure verification</p>
            <p className="text-xs leading-tight text-white/70">We never share your email</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const displayEmail = email ? decodeURIComponent(email) : '';
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>(() =>
    token ? 'verifying' : displayEmail ? 'idle' : 'failed'
  );
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenVerified = useRef(false);

  useEffect(() => {
    if (!token || tokenVerified.current) return;
    tokenVerified.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setVerifyStatus('success'))
      .catch(() => setVerifyStatus('failed'));
  }, [token]);

  useEffect(() => {
    if (resendCooldown <= 0 && cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!displayEmail || resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(displayEmail);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      cooldownRef.current = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } finally {
      setIsResending(false);
    }
  };

  if (token) {
    return (
      <main className="flex min-h-screen flex-col lg:flex-row">
        <div className="order-2 flex w-full flex-col bg-white lg:order-1 lg:w-[40%] overflow-y-auto">
          <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-8 lg:px-12">
            {verifyStatus === 'verifying' && <VerifyingState />}
            {verifyStatus === 'success' && <VerifiedSuccessState />}
            {verifyStatus === 'failed' && <InvalidLinkState />}
          </div>
        </div>
        <RightPanel />
      </main>
    );
  }

  if (displayEmail) {
    return (
      <main className="flex min-h-screen flex-col lg:flex-row">
        <div className="order-2 flex w-full flex-col bg-white lg:order-1 lg:w-[40%] overflow-y-auto">
          <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-8 lg:px-12">
            <CheckInboxState
              email={displayEmail}
              onResend={handleResend}
              resendCooldown={resendCooldown}
              isResending={isResending}
            />
          </div>
        </div>
        <RightPanel />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <div className="order-2 flex w-full flex-col bg-white lg:order-1 lg:w-[40%] overflow-y-auto">
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-8 lg:px-12">
          <InvalidLinkState />
        </div>
      </div>
      <RightPanel />
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
