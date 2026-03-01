'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import zxcvbn from 'zxcvbn';
import axios from 'axios';
import Button from '@/components/UI/Button';
import { authApi } from '@/lib/api';

function InvalidLinkState() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid reset link</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          This password reset link is invalid or has expired.
          Reset links are only valid for 1 hour and can only be used once.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/forgot-password" className="block">
          <Button variant="primary" size="md" fullWidth>
            Request a new reset link
          </Button>
        </Link>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}

function ResetFormState({
  email,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordScore,
  isFormValid,
  isLoading,
  submitError,
  handleSubmit,
}: {
  email: string;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  passwordScore: number;
  isFormValid: boolean;
  isLoading: boolean;
  submitError: string | null;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Invoicing for Freelancers</p>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8 group focus:outline-none"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to log in
      </Link>

      <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set new password</h2>
        <p className="text-sm text-gray-600">
          Resetting password for{' '}
          <span className="font-semibold text-gray-900">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="w-full px-3 py-2 pr-10 text-sm text-gray-900 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((barIndex) => {
                  const getBarColor = () => {
                    if (passwordScore <= 1) return barIndex === 0 ? 'bg-red-500' : 'bg-gray-200';
                    if (passwordScore === 2) return barIndex <= 1 ? 'bg-orange-400' : 'bg-gray-200';
                    if (passwordScore === 3) return barIndex <= 2 ? 'bg-yellow-500' : 'bg-gray-200';
                    return 'bg-green-500';
                  };
                  return (
                    <div
                      key={barIndex}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${getBarColor()}`}
                    />
                  );
                })}
              </div>
              <p className={`text-xs font-medium ${
                passwordScore <= 1 ? 'text-red-600'
                : passwordScore === 2 ? 'text-orange-500'
                : passwordScore === 3 ? 'text-yellow-600'
                : 'text-green-600'
              }`}>
                {passwordScore <= 1
                  ? 'Too weak — try a less common password'
                  : passwordScore === 2
                  ? 'Fair — make it longer or add symbols'
                  : passwordScore === 3
                  ? 'Good — almost there!'
                  : '✓ Strong password'}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className={`w-full px-3 py-2 text-sm text-gray-900 bg-white border-2 rounded-lg transition-all duration-200 focus:outline-none placeholder:text-gray-400 ${
                confirmPassword.length > 0
                  ? password === confirmPassword
                    ? 'border-green-400 pr-14 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    : 'border-red-300 pr-14 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 pr-14 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            {confirmPassword.length > 0 && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                {password === confirmPassword ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {confirmPassword.length > 0 && (
            <p className={`mt-1 text-xs font-medium ${
              password === confirmPassword ? 'text-green-600' : 'text-red-500'
            }`}>
              {password === confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
            </p>
          )}
        </div>

        {submitError && (
          <p className="mb-4 text-sm font-medium text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {submitError}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isLoading}
          disabled={!isFormValid || isLoading}
          className="mb-4"
        >
          Reset password
        </Button>

        <p className="text-xs text-center text-gray-500">
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
          >
            Log in instead
          </Link>
        </p>
      </form>
    </div>
  );
}

function ResetSuccessState() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <Link href="/" className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none">
          Novba
        </Link>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Invoicing for Freelancers</p>
      </div>

      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your password has been successfully updated.
          You can now log in with your new password.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/login" className="block">
          <Button variant="primary" size="md" fullWidth>
            Log in to Novba
          </Button>
        </Link>
      </div>
    </div>
  );
}

function RightPanelReset() {
  return (
    <div
      className="relative order-1 flex min-h-[500px] w-full shrink-0 flex-col items-center justify-center overflow-hidden lg:order-2 lg:min-h-screen lg:w-[60%] lg:flex-1 lg:min-w-0"
      style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
      }}
    >
      <div
        className="absolute -top-24 -right-24 hidden h-[500px] w-[500px] rotate-12 rounded-[60px] bg-white/8 lg:block"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -left-16 hidden h-[450px] w-[450px] rounded-full bg-white/6 lg:block"
        aria-hidden
      />
      <div
        className="absolute top-1/2 left-1/3 hidden h-[350px] w-[350px] -translate-y-1/2 -rotate-12 rounded-[40px] bg-white/5 lg:block"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-2xl px-12 py-16 lg:mx-0 lg:px-20 lg:py-20">
        <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-[-0.02em] mb-6">
          Almost There — Fresh Start Awaits
        </h2>

        <p className="text-lg lg:text-xl text-white/90 leading-relaxed mb-10 max-w-xl">
          You&apos;re one step away from getting back to invoicing and earning more.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-start gap-3 text-white">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-medium">Your old password is immediately invalidated</span>
          </div>
          <div className="flex items-start gap-3 text-white">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-medium">All your invoices and data are safe</span>
          </div>
          <div className="flex items-start gap-3 text-white">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-medium">Locked-forever pricing still applies</span>
          </div>
          <div className="flex items-start gap-3 text-white">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-medium">Log in and get back to earning</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <svg className="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Your data is protected</p>
            <p className="text-white/70 text-xs leading-tight">256-bit SSL · HTTPS secured</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isInvalidLink = !token || !email || linkInvalid;

  const passwordAnalysis = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  const passwordScore = passwordAnalysis?.score ?? 0;

  const isFormValid =
    password.length >= 8 &&
    password === confirmPassword &&
    confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !token || !email) return;
    setIsLoading(true);
    setSubmitError(null);
    try {
      await authApi.resetPassword(token, email, password);
      setIsSuccess(true);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 400) {
        setLinkInvalid(true);
      } else {
        setSubmitError(
          (axios.isAxiosError(err) && err.response?.data?.error?.message) ||
            'Something went wrong. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <div className="order-2 flex w-full flex-col bg-white lg:order-1 lg:w-[40%] overflow-y-auto">
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            {isInvalidLink && <InvalidLinkState />}
            {!isInvalidLink && isSuccess && <ResetSuccessState />}
            {!isInvalidLink && !isSuccess && email && (
              <ResetFormState
                email={email}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                passwordScore={passwordScore}
                isFormValid={isFormValid}
                isLoading={isLoading}
                submitError={submitError}
                handleSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>

      <RightPanelReset />
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
