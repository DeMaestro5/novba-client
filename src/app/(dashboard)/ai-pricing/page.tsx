'use client';

import { useState, useRef, useEffect } from 'react';

export default function AiPricingPage() {
  const [workType, setWorkType] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  // Mark AI Pricing as visited for the dashboard checklist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('novba_ai_pricing_visited', '1');
    }
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      {/* Section 1 — Hero */}
      <div
        className='mb-8 overflow-hidden rounded-2xl'
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        }}
      >
        <div className='relative flex flex-col gap-8 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10 lg:py-10'>
          <div className='relative z-10 flex flex-1 flex-col gap-4'>
            <span className='inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600'>
              AI-Powered
            </span>
            <h1 className='text-2xl font-bold text-white sm:text-3xl'>
              Stop undercharging. Know your worth.
            </h1>
            <p className='max-w-lg text-sm text-white/90 sm:text-base'>
              Novba AI analyzes your skills, market rates, and client industry to tell you exactly what to charge — so you never leave money on the table again.
            </p>
            <button
              type='button'
              onClick={scrollToForm}
              className='inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none sm:w-auto'
            >
              Analyze My Rates Now →
            </button>
          </div>
          <div className='relative flex shrink-0 flex-col items-center opacity-90'>
            <svg
              className='h-32 w-40 sm:h-36 sm:w-48'
              viewBox='0 0 120 100'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect x='16' y='50' width='28' height='40' rx='4' className='fill-white/60' />
              <rect x='52' y='30' width='28' height='60' rx='4' className='fill-white' />
              <rect x='88' y='10' width='28' height='80' rx='4' className='fill-orange-200' />
            </svg>
            <div className='mt-1 flex w-full justify-around text-xs font-medium text-white/80'>
              <span>You</span>
              <span>Market Rate</span>
            </div>
            <p className='mt-2 text-xs font-medium text-white/80'>See where you stand</p>
          </div>
        </div>
      </div>

      {/* Section 2 — Three feature cards */}
      <div className='mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
          <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30'>
            <svg className='h-5 w-5 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
            </svg>
          </div>
          <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
            Market Rate Analysis
          </h3>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
            Compare your rates against real market data for your skill set, experience level, and target industry.
          </p>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
          <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30'>
            <svg className='h-5 w-5 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
            </svg>
          </div>
          <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
            Project-Based Pricing
          </h3>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
            Describe a project and get an AI-recommended price range — accounting for scope, complexity, and your market position.
          </p>
        </div>
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
          <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30'>
            <svg className='h-5 w-5 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
            </svg>
          </div>
          <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
            Raise Rates With Confidence
          </h3>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
            Know exactly when and how much to raise your rates based on your track record and market benchmarks.
          </p>
        </div>
      </div>

      {/* Section 3 — Pricing form */}
      <div ref={formRef} className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
        <label htmlFor='work-type' className='block text-sm font-semibold text-gray-900 dark:text-white'>
          What type of work do you do?
        </label>
        <input
          id='work-type'
          type='text'
          placeholder='e.g. brand identity design, React development, copywriting...'
          value={workType}
          onChange={(e) => setWorkType(e.target.value)}
          className='mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500'
        />
        <button
          type='button'
          className='mt-4 w-full rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md focus:outline-none sm:w-auto'
        >
          Get AI Pricing Insights →
        </button>
      </div>
    </div>
  );
}
