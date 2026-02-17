'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < MIN_PASSWORD_LENGTH)
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    return '';
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) return;

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      console.log('Login:', { email, password, rememberMe });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-screen min-h-screen flex-col overflow-hidden lg:flex-row'>
      {/* Left panel - 40% */}
      <div className='order-2 flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden bg-white px-6 py-12 lg:order-1 lg:w-[40%] lg:flex-none lg:px-12 lg:py-16'>
        <div className='w-full max-w-[420px]'>
          {/* Logo + Tagline */}
          <div className='mb-8'>
            <Link
              href='/'
              className='text-3xl font-extrabold text-orange-600 transition-colors duration-200 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg'
            >
              Novba
            </Link>
            <p className='mt-1 text-sm text-gray-500'>
              AI-Powered Invoicing for Freelancers
            </p>
          </div>

          {/* Heading */}
          <div className='mb-6'>
            <h2 className='mb-2 text-2xl font-bold text-gray-900'>
              Log in to your account
            </h2>
            <p className='text-sm text-gray-600'>
              Don&apos;t have an account?{' '}
              <Link
                href='/signup'
                className='font-medium text-orange-600 transition-colors duration-200 hover:text-orange-700 rounded'
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Social login */}
          <div className='mb-6 space-y-3'>
            <button
              type='button'
              className='flex w-full items-center cursor-pointer justify-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus:outline-none'
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
          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center' aria-hidden>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-xs'>
              <span className='bg-white px-3 text-gray-500'>
                Or with email and password
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-0'>
            <div className='mb-4'>
              <Input
                id='email'
                label='Email'
                type='email'
                autoComplete='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailTouched)
                    setEmailError(validateEmail(e.target.value));
                }}
                onBlur={handleEmailBlur}
                error={emailTouched ? emailError : undefined}
                fullWidth
              />
            </div>
            <div className='mb-5'>
              <div className='mb-2'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Password
                </label>
              </div>
              <Input
                id='password'
                type='password'
                autoComplete='current-password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordTouched)
                    setPasswordError(validatePassword(e.target.value));
                }}
                onBlur={handlePasswordBlur}
                error={passwordTouched ? passwordError : undefined}
                fullWidth
              />
            </div>

            {/* Remember me + Forgot password */}
            <div className='mb-6 flex items-center justify-between'>
              <label className='group flex cursor-pointer items-center gap-2'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='h-4 w-4 rounded border-2 border-gray-300 accent-orange-600 transition-colors duration-200'
                  aria-describedby='remember-me-description'
                />
                <span
                  id='remember-me-description'
                  className='text-sm text-gray-600 transition-colors group-hover:text-gray-900'
                >
                  Remember me
                </span>
              </label>
              <Link
                href='/forgot-password'
                className='text-sm font-medium text-orange-600 transition-colors duration-200 hover:text-orange-700 cursor-pointer focus:outline-none rounded'
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type='submit'
              variant='primary'
              size='md'
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              className='mb-5 cursor-pointer'
            >
              Log in
            </Button>
          </form>

          {/* Terms */}
          <p className='text-center text-xs text-gray-500'>
            By logging in, you agree to our{' '}
            <Link
              href='/terms'
              className='text-orange-600 underline transition-colors duration-200 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded'
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='text-orange-600 underline transition-colors duration-200 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded'
            >
              Privacy Policy
            </Link>
            .
          </p>
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
          <h1 className='mb-6 text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white lg:text-7xl'>
            Stop Leaving Money on the Table
          </h1>
          <p className='mb-8 max-w-xl text-base leading-relaxed text-white/90 lg:mb-10 lg:text-xl'>
            AI-powered pricing insights help you charge what you&apos;re worth.
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
                30-40% average rate increase
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
              <span className='text-lg font-medium'>Join 100+ freelancers</span>
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
                Locked-forever pricing
              </span>
            </div>
          </div>

          <Link
            href='/pricing'
            className='group inline-flex items-center gap-2 font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500 rounded'
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
    </div>
  );
}
