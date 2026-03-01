'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import { authApi } from '@/lib/api';
import axios from 'axios';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (value: string) => {
  if (!value.trim()) return 'Email address is required';
  if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
  return '';
};

function EmailFormState({
  email,
  setEmail,
  emailError,
  setEmailError,
  validateEmailFn,
  isLoading,
  submitError,
  handleSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  emailError: string;
  setEmailError: (v: string) => void;
  validateEmailFn: (v: string) => string;
  isLoading: boolean;
  submitError: string | null;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="w-full max-w-[420px]">
      {/* Logo */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
        >
          Novba
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          AI-Powered Invoicing for Freelancers
        </p>
      </div>

      {/* Back to login link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8 group focus:outline-none"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to log in
      </Link>

      {/* Icon */}
      <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Forgot your password?
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          No worries! Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(validateEmailFn(e.target.value));
            }}
            onBlur={() => setEmailError(validateEmailFn(email))}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            className={`w-full px-3 py-2 text-sm text-gray-900 bg-white border-2 rounded-lg transition-all duration-200 focus:outline-none placeholder:text-gray-400 ${
              emailError
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
            }`}
          />
          {emailError && (
            <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {emailError}
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
          disabled={isLoading}
          className="mb-4"
        >
          Send reset link
        </Button>

        <p className="text-xs text-center text-gray-500">
          The reset link expires in{' '}
          <span className="font-medium text-gray-700">1 hour</span>.{' '}
          Check your spam folder if you don&apos;t see it.
        </p>
      </form>
    </div>
  );
}

function SuccessState({
  email,
  onTryDifferentEmail,
}: {
  email: string;
  onTryDifferentEmail: () => void;
}) {
  return (
    <div className="w-full max-w-[420px]">
      {/* Logo */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-3xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
        >
          Novba
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          AI-Powered Invoicing for Freelancers
        </p>
      </div>

      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* Success heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Check your inbox
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          If{' '}
          <span className="font-semibold text-gray-900">{email}</span>
          {' '}is registered with Novba, you&apos;ll receive a password reset link within a few minutes.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          The link will expire in 1 hour. If you don&apos;t see it, check your spam folder.
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 mb-8">
        <a
          href={`mailto:${email}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Open email app
        </a>

        <button
          type="button"
          onClick={onTryDifferentEmail}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm rounded-lg transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Try a different email
        </button>
      </div>

      {/* Back to login */}
      <div className="pt-6 border-t border-gray-100 text-center">
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
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setIsLoading(true);
    setSubmitError(null);
    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 404) {
        setIsSubmitted(true);
      } else {
        setSubmitError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel - 40% */}
      <div className="order-2 flex w-full flex-col bg-white lg:order-1 lg:w-[40%] overflow-y-auto">
        <div className="flex min-h-full w-full flex-col items-center justify-start lg:justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            {isSubmitted ? (
              <SuccessState
                email={email}
                onTryDifferentEmail={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setEmailError('');
                  setSubmitError(null);
                }}
              />
            ) : (
              <EmailFormState
                email={email}
                setEmail={setEmail}
                emailError={emailError}
                setEmailError={setEmailError}
                validateEmailFn={validateEmail}
                isLoading={isLoading}
                submitError={submitError}
                handleSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right panel - 60% - gradient + geometric shapes (same as login) */}
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
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-[-0.02em] mb-6">
            Your Account is Safe With Us
          </h2>

          <p className="text-lg lg:text-xl text-white/90 leading-relaxed mb-10 max-w-xl">
            We use industry-standard security to protect your data and invoices.
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex items-start gap-3 text-white">
              <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-lg font-medium">Reset links expire after 1 hour</span>
            </div>
            <div className="flex items-start gap-3 text-white">
              <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-lg font-medium">Single-use secure token per request</span>
            </div>
            <div className="flex items-start gap-3 text-white">
              <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-lg font-medium">Your invoice data stays protected</span>
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
              <p className="text-white font-semibold text-sm leading-tight">Bank-level encryption</p>
              <p className="text-white/70 text-xs leading-tight">256-bit SSL · HTTPS secured</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
