'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export type NewUserDashboardProps = {
  firstName: string;
};

function formatCurrency(amount: number): string {
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(1) + 'k';
  return '$' + amount.toLocaleString();
}

const LOCKED_STAT_CARDS: Array<{
  label: string;
  fakeValue: string;
  fakeSub: string;
  iconBg: string;
  icon: React.ReactNode;
}> = [
  {
    label: 'Total Revenue',
    fakeValue: '$12.4k',
    fakeSub: '↑18% this month',
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    icon: (
      <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Pending Invoices',
    fakeValue: '$3.2k',
    fakeSub: '4 invoices out',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    icon: (
      <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Outstanding',
    fakeValue: '$840',
    fakeSub: '1 overdue',
    iconBg: 'bg-red-50 dark:bg-red-950/50',
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Active Clients',
    fakeValue: '8',
    fakeSub: '+2 this month',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    icon: (
      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function NewUserDashboard({ firstName }: NewUserDashboardProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(20);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const monthlyPotential = hourlyRate * hoursPerWeek * 4;
  const withAiPricing = Math.round(monthlyPotential * 1.34);

  const sectionBase = 'transition-all duration-700 ' + (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5');

  return (
    <div className="space-y-5">
      {/* Section 1: Hero Card */}
      <div
        className={sectionBase}
        style={{ transitionDelay: '0ms' }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gray-950">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-orange-600/5 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-between gap-8 px-8 py-10 lg:flex-row lg:px-12">
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wide text-green-400">
                  Account active — let&apos;s build something
                </span>
              </div>
              <h2 className="mb-3 text-3xl font-black leading-tight text-white lg:text-4xl">
                Your freelance business
                <br className="hidden lg:block" />
                starts right here.
              </h2>
              <p className="mb-8 max-w-md text-base text-gray-400">
                Add one client. Create one invoice. Novba handles everything else — reminders, forecasts, and the AI pricing insights to charge what you&apos;re actually worth.
              </p>
              <div className="flex flex-row gap-4">
                <div className="rounded-xl bg-gray-800 px-4 py-3">
                  <div className="text-xl font-black text-orange-400">34%</div>
                  <div className="text-xs text-gray-500">avg. rate increase with AI</div>
                </div>
                <div className="rounded-xl bg-gray-800 px-4 py-3">
                  <div className="text-xl font-black text-white">&lt; 60s</div>
                  <div className="text-xs text-gray-500">to send your first invoice</div>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-3 rounded-2xl bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-xl hover:shadow-orange-500/30"
              >
                Add Your First Client
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <p className="mt-3 text-center text-xs text-gray-600">
                or{' '}
                <Link href="/invoices/new" className="text-gray-400 underline underline-offset-2 transition-colors hover:text-white">
                  skip straight to an invoice
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Locked Stat Cards */}
      <div
        className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${sectionBase}`}
        style={{ transitionDelay: '100ms' }}
      >
        {LOCKED_STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {card.label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className="relative mt-3 min-h-[56px]">
              <div className="pointer-events-none select-none text-2xl font-black text-gray-900 blur-[6px] dark:text-white">
                {card.fakeValue}
              </div>
              <div className="pointer-events-none mt-1 select-none text-xs text-gray-400 blur-[4px]">
                {card.fakeSub}
              </div>
              <div className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80" />
            </div>
            <div className="relative z-20 mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-[11px] font-semibold text-white dark:bg-gray-700">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Unlock with your first invoice
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Section 3: Earning Calculator */}
      <div
        className={sectionBase}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="overflow-hidden rounded-2xl bg-gray-950 p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="border-r border-gray-800 p-8 lg:p-10">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-orange-400">
                Earning Calculator
              </div>
              <h3 className="mb-2 text-2xl font-black text-white">
                What should you be earning?
              </h3>
              <p className="mb-8 text-sm text-gray-400">
                Enter your rate and hours. We&apos;ll show you your monthly potential — and what you could earn with AI Pricing.
              </p>
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-400">Hourly Rate</label>
                <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 transition-all focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/30">
                  <span className="select-none border-r border-gray-700 bg-gray-800 px-4 py-3.5 text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                    className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white focus:outline-none"
                  />
                  <span className="select-none border-l border-gray-700 bg-gray-800 px-4 py-3.5 text-xs text-gray-600">/hr</span>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-gray-400">Hours Per Week</label>
                <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900 transition-all focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/30">
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value) || 0)}
                    className="w-full bg-transparent px-4 py-3.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <p className="mt-8 text-xs italic text-gray-600">
                * Projection based on 4 working weeks/month. AI Pricing uplift based on avg. reported by Novba users.
              </p>
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-10">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Monthly without Novba AI
                </div>
                <div key={monthlyPotential} className="text-4xl font-black text-gray-300">
                  {formatCurrency(monthlyPotential)}
                </div>
              </div>
              <div className="relative my-6 h-px w-full bg-gray-800">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-950 px-3 text-xs font-semibold text-gray-600">
                  VS
                </span>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
                  With Novba AI Pricing
                </div>
                <div key={withAiPricing} className="text-5xl font-black leading-none text-orange-400">
                  {formatCurrency(withAiPricing)}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-400">
                    +34% more
                  </span>
                  <span className="text-xs text-gray-500">based on Novba user data</span>
                </div>
              </div>
              <Link
                href="/ai-pricing"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400"
              >
                Get My AI Rate Analysis →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Getting Started */}
      <div
        className={sectionBase}
        style={{ transitionDelay: '300ms' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Getting Started
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              4 steps to your first payment
            </p>
          </div>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            1 of 4 complete
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1: Complete */}
          <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-green-50 p-5 opacity-70 dark:border-green-900/30 dark:bg-green-950/20">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Complete</span>
            </div>
            <div className="mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">Create your account</div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              You&apos;re in. Your account is active and ready.
            </p>
          </div>

          {/* Step 2: Active */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-orange-400 bg-white p-5 shadow-lg shadow-orange-100 dark:border-orange-500 dark:bg-gray-900 dark:shadow-orange-900/20">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/30 dark:to-transparent" />
            <div className="relative mb-3 flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                2
              </div>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Next up</span>
            </div>
            <div className="relative mb-1 text-sm font-bold text-gray-900 dark:text-white">Add your first client</div>
            <p className="relative mb-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Who are you working with? Takes 30 seconds.
            </p>
            <Link
              href="/clients/new"
              className="relative inline-flex items-center gap-1 text-xs font-bold text-orange-600 transition-all duration-150 hover:gap-2 dark:text-orange-400"
            >
              Add Client →
            </Link>
          </div>

          {/* Step 3: Pending */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-xs font-bold text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
                3
              </div>
            </div>
            <div className="mb-1 text-sm font-bold text-gray-900 dark:text-white">Create your first invoice</div>
            <p className="mb-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Professional invoice in 60 seconds. PDF, payment link, done.
            </p>
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
            >
              Create Invoice →
            </Link>
          </div>

          {/* Step 4: Locked */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-xs font-bold text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-600">
                4
              </div>
            </div>
            <div className="mb-1 text-sm font-bold text-gray-400 dark:text-gray-600">Get paid</div>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-gray-600">
              Novba sends automatic reminders. You focus on the work.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Aspiration Banner */}
      <div
        className={sectionBase}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gray-950">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-20 -right-40 h-96 w-96 rounded-full bg-orange-500/8 blur-3xl" />
            <div className="absolute -top-20 left-1/3 h-64 w-64 rounded-full bg-orange-600/5 blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0 lg:flex-row">
            <div className="flex-1 p-8 lg:p-12">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-green-400">
                  Trusted by 100+ freelancers worldwide
                </span>
              </div>
              <h3 className="mb-3 text-2xl font-black leading-snug text-white lg:text-3xl">
                This is where you&apos;re headed.
              </h3>
              <p className="mb-8 max-w-lg text-sm leading-relaxed text-gray-400">
                Novba users who complete setup average $8.4k/month in tracked revenue within 60 days. With AI Pricing, they earn 34% more per project. Your dashboard will show you exactly this — in real time.
              </p>
              <div className="mb-8 flex flex-row items-center gap-6">
                <div>
                  <div className="text-2xl font-black text-white">$8.4k</div>
                  <div className="mt-0.5 text-xs text-gray-500">avg. monthly revenue</div>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div>
                  <div className="text-2xl font-black text-orange-400">+34%</div>
                  <div className="mt-0.5 text-xs text-gray-500">rate increase with AI</div>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div>
                  <div className="text-2xl font-black text-white">92%</div>
                  <div className="mt-0.5 text-xs text-gray-500">invoice collection rate</div>
                </div>
              </div>
              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10"
              >
                Create Your First Invoice →
              </Link>
            </div>
            <div className="hidden w-[380px] shrink-0 self-stretch lg:block">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-gray-950 to-transparent" />
              <div className="pointer-events-none origin-right scale-95 p-8 opacity-70 blur-[0.3px]">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Total Revenue</div>
                    <div className="mt-1 text-base font-black text-white">$8.4k</div>
                    <div className="mt-0.5 text-[10px] text-green-400">↑12% this month</div>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Pending Invoices</div>
                    <div className="mt-1 text-base font-black text-white">$2.1k</div>
                    <div className="mt-0.5 text-[10px] text-gray-500">3 invoices</div>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Outstanding</div>
                    <div className="mt-1 text-base font-black text-white">$640</div>
                    <div className="mt-0.5 text-[10px] text-red-400">1 overdue</div>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                    <div className="text-[9px] uppercase tracking-wider text-gray-500">Active Clients</div>
                    <div className="mt-1 text-base font-black text-white">7</div>
                    <div className="mt-0.5 text-[10px] text-gray-500">+2 this month</div>
                  </div>
                </div>
                <div className="mt-2 rounded-xl border border-gray-800 bg-gray-900 p-3">
                  <div className="mb-2 text-[9px] uppercase tracking-wider text-gray-500">Revenue Overview</div>
                  <div className="flex h-12 items-end gap-1">
                    <div className="h-3 w-full rounded-sm bg-orange-500/30" />
                    <div className="h-5 w-full rounded-sm bg-orange-500/30" />
                    <div className="h-4 w-full rounded-sm bg-orange-500/30" />
                    <div className="h-7 w-full rounded-sm bg-orange-500/30" />
                    <div className="h-6 w-full rounded-sm bg-orange-500/30" />
                    <div className="h-9 w-full rounded-sm bg-orange-500" />
                    <div className="h-8 w-full rounded-sm bg-orange-500" />
                    <div className="h-10 w-full rounded-sm bg-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
