'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/UI/Button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  const [resendEmail, setResendEmail] = useState('');
  const [resendEmailError, setResendEmailError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('failed');
      return;
    }

    const verifyToken = async () => {
      try {
        // When connecting to backend: POST /verify-email with body: { token: string }
        // const response = await fetch('/api/verify-email', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ token }),
        // });
        // if (!response.ok) throw new Error('Verification failed');
        await new Promise((r) => setTimeout(r, 2000));
        setStatus('success');
      } catch {
        setStatus('failed');
      }
    };

    verifyToken();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail.trim()) {
      setResendEmailError('Email address is required');
      return;
    }
    if (!EMAIL_REGEX.test(resendEmail)) {
      setResendEmailError('Please enter a valid email address');
      return;
    }

    setIsResending(true);
    setResendEmailError('');

    try {
      // When connecting to backend: POST /resend-verification with body: { email: string }
      // Same security pattern: always return same generic message regardless of whether email exists
      // const response = await fetch('/api/resend-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: resendEmail }),
      // });
      await new Promise((r) => setTimeout(r, 1200));
      setResendSuccess(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* LEFT PANEL - 40% */}
      <div className="order-2 flex w-full flex-col bg-white lg:order-1 lg:w-[40%] overflow-y-auto">
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            {status === 'verifying' && <VerifyingState />}
            {status === 'success' && <SuccessState />}
            {status === 'failed' && (
              <FailedState
                resendEmail={resendEmail}
                setResendEmail={setResendEmail}
                resendEmailError={resendEmailError}
                setResendEmailError={setResendEmailError}
                isResending={isResending}
                resendSuccess={resendSuccess}
                handleResend={handleResend}
              />
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - 60% */}
      <div
        className="relative order-1 flex min-h-[400px] w-full shrink-0 flex-col items-center justify-center overflow-hidden lg:order-2 lg:min-h-screen lg:w-[60%]"
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
            Verify your email to unlock your full Novba account and AI Pricing Coach.
          </p>

          <div className="mb-10 space-y-4">
            {[
              'AI Pricing Coach ready to use',
              'Create unlimited invoices',
              'Automated payment reminders',
              'Free forever for first 100 users',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-white">
                <svg className="mt-0.5 h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <svg className="h-5 w-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold leading-tight text-white">Secure verification</p>
              <p className="text-xs leading-tight text-white/70">Token expires in 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function VerifyingState() {
  return (
    <div className="w-full text-center">
      <div className="mb-10 text-left">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="mt-1 text-sm text-gray-500">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-transparent border-t-orange-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-8 w-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <h2 className="mb-3 text-2xl font-bold text-gray-900">Verifying your email...</h2>
      <p className="text-sm leading-relaxed text-gray-600">
        Please wait while we confirm your email address.
        This will only take a moment.
      </p>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="w-full">
      <div className="mb-10">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="mt-1 text-sm text-gray-500">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-green-600">
            Verified
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Email confirmed!</h2>
        </div>
      </div>

      <p className="mb-8 text-sm leading-relaxed text-gray-600">
        Your email address has been successfully verified.
        Your Novba account is now active and ready to use.
      </p>

      <div className="mb-8 rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-600">
          What&apos;s next
        </p>
        <div className="space-y-2.5">
          {[
            'Log in to your account',
            'Create your first invoice',
            'Check your AI Pricing Coach',
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600">
                <span className="text-xs font-bold text-white">{i + 1}</span>
              </div>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/login" className="block">
        <Button variant="primary" size="md" fullWidth>
          Log in to Novba
        </Button>
      </Link>
    </div>
  );
}

function FailedState({
  resendEmail,
  setResendEmail,
  resendEmailError,
  setResendEmailError,
  isResending,
  resendSuccess,
  handleResend,
}: {
  resendEmail: string;
  setResendEmail: (v: string) => void;
  resendEmailError: string;
  setResendEmailError: (v: string) => void;
  isResending: boolean;
  resendSuccess: boolean;
  handleResend: (e: React.FormEvent) => void;
}) {
  return (
    <div className="w-full">
      <div className="mb-10">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="mt-1 text-sm text-gray-500">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-red-600">
            Failed
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Link expired</h2>
        </div>
      </div>

      <p className="mb-8 text-sm leading-relaxed text-gray-600">
        This verification link has expired or already been used.
        Links are valid for{' '}
        <span className="font-semibold text-gray-900">24 hours</span>
        {' '}and can only be used once.
        Enter your email below to receive a new one.
      </p>

      {resendSuccess ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">New link sent!</p>
            <p className="mt-0.5 text-xs text-green-700">
              If <span className="font-medium">{resendEmail}</span> is registered,
              you&apos;ll receive a new verification link. Check your inbox and spam folder.
              It expires in 24 hours.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleResend} className="mb-6">
          <div className="mb-3">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Your email address
            </label>
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => {
                setResendEmail(e.target.value);
                if (resendEmailError) setResendEmailError('');
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:outline-none ${
                resendEmailError
                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
              }`}
            />
            {resendEmailError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {resendEmailError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isResending}
            disabled={isResending}
          >
            Resend verification email
          </Button>
        </form>
      )}

      <div className="border-t border-gray-100 pt-4 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to log in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
