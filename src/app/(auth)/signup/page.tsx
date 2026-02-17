'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import zxcvbn from 'zxcvbn';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordAnalysis = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  const passwordScore = passwordAnalysis?.score ?? 0;

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.includes('@') &&
    password.length >= 8 &&
    password === confirmPassword &&
    confirmPassword.length > 0 &&
    agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      console.log('Signup:', {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        agreedToTerms,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='flex min-h-screen flex-col lg:flex-row'>
      {/* Left panel - 40% */}
      <div className='order-2 flex w-full flex-col overflow-y-auto bg-white lg:order-1 lg:w-[40%]'>
        <div className='flex min-h-full w-full flex-col items-center justify-start px-6 py-8 lg:justify-center lg:px-12'>
          <div className='w-full max-w-[420px]'>
            {/* Logo + Tagline */}
            <div className='mb-5'>
              <Link
                href='/'
                className='mb-0.5 block text-3xl font-extrabold text-orange-600 transition-colors duration-200 hover:text-orange-700 focus:outline-none rounded-lg'
              >
                Novba
              </Link>
              <p className='text-sm text-gray-500'>
                AI-Powered Invoicing for Freelancers
              </p>
            </div>

            {/* Heading */}
            <div className='mb-4'>
              <h2 className='mb-1.5 text-2xl font-bold text-gray-900'>
                Create your account
              </h2>
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link
                  href='/login'
                  className='font-medium text-orange-600 transition-colors duration-200 hover:text-orange-700 focus:outline-none rounded'
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Social signup */}
            <div className='mb-4 space-y-2'>
              <button
                type='button'
                className='flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-200 cursor-pointer bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus:outline-none'
              >
                <svg className='h-5 w-5' viewBox='0 0 24 24' aria-hidden>
                  <path
                    fill='currentColor'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='#34A853'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='#EA4335'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
                Continue with Google
              </button>
              <button
                type='button'
                className='flex w-full items-center cursor-pointer justify-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus:outline-none'
              >
                <svg
                  className='h-5 w-5'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden
                >
                  <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className='relative my-4'>
              <div className='absolute inset-0 flex items-center' aria-hidden>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='bg-white px-3 text-gray-500'>
                  Or create account with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-0'>
              {/* First name + Last name - side by side */}
              <div className='mb-2.5 grid grid-cols-2 gap-2.5'>
                <Input
                  id='firstName'
                  label='First name'
                  type='text'
                  autoComplete='given-name'
                  placeholder='John'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                  className='border-gray-200 text-sm'
                />
                <Input
                  id='lastName'
                  label='Last name'
                  type='text'
                  autoComplete='family-name'
                  placeholder='Doe'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                  className='border-gray-200 text-sm'
                />
              </div>

              {/* Email - full width */}
              <div className='mb-2.5'>
                <Input
                  id='email'
                  label='Email address'
                  type='email'
                  autoComplete='email'
                  placeholder='you@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  className='border-gray-200 text-sm'
                />
              </div>

              {/* Password field */}
              <div className='mb-2.5'>
                <label
                  htmlFor='password'
                  className='mb-1.5 block text-sm font-medium text-gray-700'
                >
                  Password
                </label>
                <div className='relative'>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Create a password'
                    className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none'
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
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
                          d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
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
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className='mt-2 space-y-1'>
                    <div className='flex gap-1'>
                      {[0, 1, 2, 3].map((barIndex) => {
                        const getBarColor = () => {
                          if (passwordScore <= 1) {
                            return barIndex === 0
                              ? 'bg-red-500'
                              : 'bg-gray-200';
                          }
                          if (passwordScore === 2) {
                            return barIndex <= 1
                              ? 'bg-orange-400'
                              : 'bg-gray-200';
                          }
                          if (passwordScore === 3) {
                            return barIndex <= 2
                              ? 'bg-yellow-500'
                              : 'bg-gray-200';
                          }
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
                    <p
                      className={`text-xs font-medium ${
                        passwordScore <= 1
                          ? 'text-red-600'
                          : passwordScore === 2
                            ? 'text-orange-500'
                            : passwordScore === 3
                              ? 'text-yellow-600'
                              : 'text-green-600'
                      }`}
                    >
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

              {/* Confirm password */}
              <div className='mb-3'>
                <label
                  htmlFor='confirmPassword'
                  className='mb-1.5 block text-sm font-medium text-gray-700'
                >
                  Confirm password
                </label>
                <div className='relative'>
                  <input
                    id='confirmPassword'
                    type='password'
                    autoComplete='new-password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm your password'
                    className={`w-full rounded-lg border-2 px-3 py-2 text-sm text-gray-900 bg-white transition-all duration-200 placeholder:text-gray-400 focus:outline-none ${
                      confirmPassword.length > 0
                        ? password === confirmPassword
                          ? 'border-green-400 pr-10 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                          : 'border-red-300 pr-10 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                    }`}
                  />
                  {confirmPassword.length > 0 && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                      {password === confirmPassword ? (
                        <svg
                          className='h-4 w-4 text-green-500'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2.5}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      ) : (
                        <svg
                          className='h-4 w-4 text-red-400'
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
                      )}
                    </div>
                  )}
                </div>
                {confirmPassword.length > 0 && (
                  <p
                    className={`mt-1 text-xs font-medium ${
                      password === confirmPassword
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {password === confirmPassword
                      ? '✓ Passwords match'
                      : 'Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <div className='mb-4'>
                <label className='group flex cursor-pointer items-start gap-2.5'>
                  <input
                    type='checkbox'
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className='mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-2 border-gray-300 accent-orange-600 transition-colors duration-200'
                    aria-describedby='terms-description'
                  />
                  <span
                    id='terms-description'
                    className='leading-relaxed text-sm text-gray-600'
                  >
                    I agree to Novba&apos;s{' '}
                    <Link
                      href='/terms'
                      className='font-medium text-orange-600 decoration-orange-300 underline underline-offset-2 transition-all hover:text-orange-700 hover:decoration-orange-600 focus:outline-none rounded'
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href='/privacy'
                      className='font-medium text-orange-600 decoration-orange-300 underline underline-offset-2 transition-all hover:text-orange-700 hover:decoration-orange-600 focus:outline-none rounded'
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <Button
                type='submit'
                variant='primary'
                size='md'
                fullWidth
                isLoading={isLoading}
                disabled={!isFormValid || isLoading}
                className='mb-3 cursor-pointer'
              >
                Create account
              </Button>
            </form>

            {/* Sign in link */}
            <p className='text-center text-xs text-gray-500'>
              Already have an account?{' '}
              <Link
                href='/login'
                className='font-medium text-orange-600 transition-colors duration-200 hover:text-orange-700 focus:outline-none rounded'
              >
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - 60% - gradient + geometric shapes */}
      <div
        className='relative order-1 flex min-h-[500px] w-full shrink-0 flex-col items-center justify-center overflow-hidden lg:order-2 lg:min-h-screen lg:w-[60%] lg:flex-1 lg:min-w-0'
        style={{
          background:
            'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        }}
      >
        {/* Geometric shapes - visible on desktop */}
        <div
          className='absolute -top-24 -right-24 hidden h-[500px] w-[500px] rotate-12 rounded-[60px] bg-white/8 lg:block'
          aria-hidden
        />
        <div
          className='absolute -bottom-32 -left-16 hidden h-[450px] w-[450px] rounded-full bg-white/6 lg:block'
          aria-hidden
        />
        <div
          className='absolute top-1/2 left-1/3 hidden h-[350px] w-[350px] -translate-y-1/2 -rotate-12 rounded-[40px] bg-white/5 lg:block'
          aria-hidden
        />

        {/* Content wrapper */}
        <div className='relative z-10 mx-auto max-w-2xl px-12 py-16 lg:mx-0 lg:px-20 lg:py-20'>
          <h2 className='mb-6 text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white lg:text-7xl'>
            Join 100+ Freelancers Earning More
          </h2>
          <p className='mb-8 max-w-xl text-base leading-relaxed text-white/90 lg:mb-10 lg:text-xl'>
            Stop undercharging. Start earning what you&apos;re worth with
            AI-powered pricing.
          </p>

          <div className='mb-10 space-y-4'>
            <div className='flex items-start gap-3 text-white'>
              <svg
                className='mt-0.5 h-6 w-6 shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              <span className='text-lg font-medium'>
                Free forever for first 100 users
              </span>
            </div>
            <div className='flex items-start gap-3 text-white'>
              <svg
                className='mt-0.5 h-6 w-6 shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              <span className='text-lg font-medium'>
                AI Pricing Coach included
              </span>
            </div>
            <div className='flex items-start gap-3 text-white'>
              <svg
                className='mt-0.5 h-6 w-6 shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              <span className='text-lg font-medium'>
                No credit card required
              </span>
            </div>
            <div className='flex items-start gap-3 text-white'>
              <svg
                className='mt-0.5 h-6 w-6 shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              <span className='text-lg font-medium'>
                Setup in under 2 minutes
              </span>
            </div>
          </div>

          {/* Social proof badge */}
          <div className='mb-8 inline-flex max-w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm'>
            <div className='flex -space-x-2 shrink-0'>
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div
                  key={letter}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold ${
                    i === 0
                      ? 'bg-orange-300 text-orange-900'
                      : i === 1
                        ? 'bg-orange-200 text-orange-800'
                        : i === 2
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-white/30 text-white'
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <p className='text-sm font-semibold leading-tight text-white'>
                100+ freelancers joined
              </p>
              <p className='text-xs leading-tight text-white/70'>
                Free forever · No credit card
              </p>
            </div>
          </div>

          <Link
            href='/pricing'
            className='group inline-flex items-center gap-2 rounded font-semibold text-white transition-all duration-200 focus:outline-none'
          >
            <span className='border-b-2 border-white/60 transition-all duration-200 group-hover:border-white'>
              Learn more about AI Pricing
            </span>
            <svg
              className='h-5 w-5 transition-transform duration-200 group-hover:translate-x-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              aria-hidden
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 8l4 4m0 0l-4 4m4-4H3'
              />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
