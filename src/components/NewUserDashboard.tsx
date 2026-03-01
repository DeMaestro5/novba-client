'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export type NewUserDashboardProps = {
  firstName: string;
};

const LOCKED_STAT_CARDS = [
  {
    label: 'Total Revenue',
    value: '$0.0k',
    subtitle: '↑0% vs last period',
    icon: (
      <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
  },
  {
    label: 'Pending Invoices',
    value: '$0.0k',
    subtitle: '0 invoices awaiting',
    icon: (
      <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    iconBg: 'bg-yellow-50 dark:bg-yellow-950/40',
  },
  {
    label: 'Outstanding',
    value: '$0.0k',
    subtitle: '0 overdue',
    icon: (
      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-red-50 dark:bg-red-950/40',
  },
  {
    label: 'Active Clients',
    value: '0',
    subtitle: '↑0% vs last period',
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
  },
];

const STEPS = [
  { id: 1, label: 'Create your account', completed: true, href: null },
  { id: 2, label: 'Add your first client', completed: false, href: '/clients/new' },
  { id: 3, label: 'Create your first invoice', completed: false, href: '/invoices/new' },
  { id: 4, label: 'Get paid', completed: false, href: null },
];

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString();
}

export function NewUserDashboard({ firstName }: NewUserDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setProgressWidth(25), 100);
    return () => clearTimeout(t);
  }, [mounted]);

  const monthlyPotential = hourlyRate * hoursPerWeek * 4;
  const withAiPricing = Math.round(monthlyPotential * 1.34);

  const sectionClass = (delay: number) =>
    `transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

  return (
    <div className="space-y-6">
      {/* Section 1 — Locked stat cards */}
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${sectionClass(0)}`}
        style={{ transitionDelay: '0ms' }}
      >
        {LOCKED_STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {card.label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className="relative mb-2 min-h-[3.5rem]">
              <div className="blur-md select-none pointer-events-none text-3xl font-bold text-gray-400 dark:text-gray-500">
                {card.value}
              </div>
              <div className="blur-sm select-none pointer-events-none mt-0.5 text-xs text-gray-300 dark:text-gray-500">
                {card.subtitle}
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-transparent to-white/60 dark:to-gray-900/60 pointer-events-none" />
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Unlock with your first invoice
            </div>
          </div>
        ))}
      </div>

      {/* Section 2 — Getting Started progress strip */}
      <div
        className={`rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-900 shadow-sm bg-gradient-to-br from-orange-50/40 to-transparent dark:from-orange-950/10 dark:to-transparent ${sectionClass(100)}`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Getting Started</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">4 steps to your first payment</p>
            </div>
            <span className="inline-flex rounded-full bg-orange-100 dark:bg-orange-900/40 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
              1 of 4 complete
            </span>
          </div>

          <div className="mb-6 flex flex-row items-start gap-0">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {index > 0 && (
                    <hr className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                  )}
                  <div className="flex flex-col items-center gap-1.5 px-1">
                    {step.completed ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {step.id}
                      </div>
                    )}
                    <span className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-[80px]">
                      {step.href ? (
                        <Link href={step.href} className="text-orange-600 dark:text-orange-400 hover:underline">
                          {step.label}
                        </Link>
                      ) : (
                        step.label
                      )}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <hr className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-orange-500 transition-[width] duration-1000 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
          <p className="text-xs italic text-gray-400 dark:text-gray-500">
            Complete these steps to unlock your full dashboard
          </p>
        </div>
      </div>

      {/* Section 3 — Two column */}
      <div
        className={`grid grid-cols-1 gap-4 lg:grid-cols-5 ${sectionClass(200)}`}
        style={{ transitionDelay: '200ms' }}
      >
        {/* Left: Earning Potential Calculator */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm lg:col-span-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Your Earning Potential</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            See what you could earn with Novba this month
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Your hourly rate
              </label>
              <div className="flex items-center gap-2">
                <span className="flex h-10 items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                  className="h-10 flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Hours per week
              </label>
              <input
                type="number"
                min={1}
                max={80}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value) || 0)}
                className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-orange-100 dark:border-orange-800/40 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly potential</p>
                <p className="mt-0.5 font-black text-2xl text-gray-900 dark:text-white transition-opacity duration-300">
                  {formatCurrency(monthlyPotential)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">With AI Pricing (+34%)</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="font-black text-2xl text-orange-600 dark:text-orange-400 transition-opacity duration-300">
                    {formatCurrency(withAiPricing)}
                  </p>
                  <span className="rounded-full bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                    +34%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs italic text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4 shrink-0 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>
              Novba users who use AI Pricing increase their rates by an average of 34% within 3 months.
            </span>
          </div>

          <Link
            href="/ai-pricing"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Check My AI Rates →
          </Link>
        </div>

        {/* Right: Feature Spotlight */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">What Novba does for you</h3>

          <div className="mt-5 space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="py-4 first:pt-0">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                  <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-xl text-gray-900 dark:text-white">60s</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">to send a professional invoice</p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Templates, PDF export, payment links built in.</p>
                </div>
              </div>
            </div>
            <div className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-xl text-gray-900 dark:text-white">3×</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">faster invoice payment</p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Auto-reminders chase clients so you don&apos;t have to.</p>
                </div>
              </div>
            </div>
            <div className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-xl text-gray-900 dark:text-white">100%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">client visibility in one place</p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Health scores, history, contact info — all synced.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 — Aspiration banner */}
      <div
        className={`overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm ${sectionClass(300)}`}
        style={{ transitionDelay: '300ms' }}
      >
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Used by 100+ freelancers
            </span>
            <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
              Your dashboard will look like this.
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Once you add clients and send invoices, Novba gives you a real-time view of your entire
              freelance business — revenue, forecasts, client health, and more.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <p className="text-lg font-bold text-gray-900 dark:text-white">$8.4k</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">avg. monthly revenue</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <p className="text-lg font-bold text-gray-900 dark:text-white">92%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">collection rate</p>
              </div>
            </div>
            <Link
              href="/invoices/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 dark:bg-white dark:text-gray-900"
            >
              Create Your First Invoice →
            </Link>
          </div>

          <div className="relative hidden overflow-hidden lg:block lg:w-[320px] lg:shrink-0">
            <div className="absolute inset-0 bg-gradient-to-l from-white to-transparent dark:from-gray-900 z-10 pointer-events-none" />
            <div className="blur-[0.5px] scale-90 origin-right p-6 opacity-80 pointer-events-none">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">$8.4k</p>
                  <span className="mt-0.5 inline-block rounded bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">+12% vs last period</span>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Pending Invoices</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">$2.1k</p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">3 invoices</p>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Outstanding</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">$640</p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">1 overdue</p>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Active Clients</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">7</p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">+2 this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
