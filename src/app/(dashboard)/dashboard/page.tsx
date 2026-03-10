'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '@/hooks/useDashboard';
import { NewUserDashboard } from '@/components/NewUserDashboard';
import { ActivationDashboard } from '@/components/ActivationDashboard';
import { GettingStartedChecklist } from '@/components/GettingStartedChecklist';

type Period = 'week' | 'month' | 'quarter' | 'year';

const periods = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

// ── Greeting ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ── Formatters ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(1) + 'k';
  return '$' + amount.toLocaleString();
}

function getChangeColor(change: number) {
  return change >= 0 ? 'text-green-600' : 'text-red-600';
}

function getChangeBg(change: number) {
  return change >= 0 ? 'bg-green-50' : 'bg-red-50';
}

function getHealthColor(status: string) {
  switch (status) {
    case 'EXCELLENT':
      return 'text-green-600';
    case 'GOOD':
      return 'text-blue-600';
    case 'FAIR':
      return 'text-yellow-600';
    default:
      return 'text-red-600';
  }
}

function getHealthStrokeColor(status: string) {
  switch (status) {
    case 'EXCELLENT':
      return '#16a34a';
    case 'GOOD':
      return '#2563eb';
    case 'FAIR':
      return '#ca8a04';
    default:
      return '#dc2626';
  }
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Users who haven't completed or skipped onboarding must go to onboarding first.
  useEffect(() => {
    if (!isInitialized) return;
    if (user && user.onboardingCompleted !== true) {
      router.replace('/onboarding');
    }
  }, [isInitialized, user, router]);

  const mustCompleteOnboarding =
    isInitialized && user && user.onboardingCompleted !== true;

  const {
    overview,
    chartData,
    clientRevenue,
    cashFlow,
    healthMetrics,
    recentActivity,
    isLoading,
    refetch,
  } = useDashboard(selectedPeriod);

  const searchParams = useSearchParams();
  // Refetch when landing from onboarding so new client/invoice data appears
  useEffect(() => {
    if (
      searchParams.get('from') === 'onboarding' &&
      typeof refetch === 'function'
    ) {
      refetch();
      const url = new URL(window.location.href);
      url.searchParams.delete('from');
      window.history.replaceState({}, '', url.pathname + (url.search || ''));
    }
  }, [searchParams, refetch]);

  const chartColors = {
    grid: isDark ? '#1f2937' : '#f3f4f6',
    axis: isDark ? '#6b7280' : '#9ca3af',
    tooltip: {
      bg: isDark ? '#111827' : '#ffffff',
      border: isDark ? '#374151' : '#e5e7eb',
      label: isDark ? '#9ca3af' : '#6b7280',
      text: isDark ? '#f9fafb' : '#111827',
    },
  };

  // Derive first name: prefer firstName, fallback to first word of name
  const nameStr =
    user && 'name' in user ? (user as { name?: string }).name : undefined;
  const firstName = user?.firstName || nameStr?.split(' ')[0] || 'there';

  // Format cash flow month label e.g. "2026-03" → "Mar"
  function formatMonth(m: string) {
    if (!m) return '';
    return new Date(m + '-01').toLocaleString('en-US', { month: 'short' });
  }

  const cashFlowChartData =
    cashFlow?.monthlyForecast?.map((m: any) => ({
      month: formatMonth(m.month),
      projected: m.projected,
      conservative: m.conservative,
    })) ?? [];

  const isEmpty =
    !isLoading &&
    overview !== null &&
    (overview?.counts?.totalInvoices ?? 0) === 0 &&
    (overview?.counts?.totalClients ?? 0) === 0;
  const pendingAmount = overview?.outstanding?.total ?? 0;
  const isActivation =
    !isLoading &&
    overview !== null &&
    !isEmpty &&
    (overview?.revenue?.total ?? 0) === 0 &&
    pendingAmount === 0;
  const showHeaderAndBanner = !isEmpty && !isActivation;

  if (mustCompleteOnboarding) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='relative'>
          <div className='w-12 h-12 border-4 border-orange-100 rounded-full' />
          <div className='w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute inset-0' />
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      {/* ===== HEADER (only for active dashboard) ===== */}
      {showHeaderAndBanner && (
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {getFormattedDate()} · Here&apos;s your business overview
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <div className='flex rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 bg-white p-1 shadow-sm'>
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPeriod(p.value as Period)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    selectedPeriod === p.value
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Link
              href='/invoices/new'
              className='flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md focus:outline-none'
            >
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
                  d='M12 4v16m8-8H4'
                />
              </svg>
              New Invoice
            </Link>
          </div>
        </div>
      )}

      {/* ===== AI PRICING COACH BANNER (only for active dashboard) ===== */}
      {showHeaderAndBanner && (
        <div
          className='mb-5 overflow-hidden rounded-2xl'
          style={{
            background:
              'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
          }}
        >
          <div className='relative flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row'>
            <div className='absolute right-0 top-0 h-full w-64 opacity-10'>
              <div className='absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white' />
              <div className='absolute right-12 bottom-0 h-24 w-24 rounded-full bg-white' />
            </div>
            <div className='relative flex items-center gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20'>
                <svg
                  className='h-6 w-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                  />
                </svg>
              </div>
              <div>
                <p className='text-sm font-bold text-white'>AI Pricing Coach</p>
                <p className='text-sm text-white/80'>
                  Freelancers using AI Pricing earn{' '}
                  <span className='font-bold text-white'>30-40% more</span>. See
                  what you should charge.
                </p>
              </div>
            </div>
            <Link
              href='/ai-pricing'
              className='relative flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none'
            >
              Check My Rates
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
                  d='M17 8l4 4m0 0l-4 4m4-4H3'
                />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT: Empty / Activation / Active dashboard ===== */}
      {isEmpty ? (
        <NewUserDashboard firstName={firstName} />
      ) : isActivation ? (
        <ActivationDashboard firstName={firstName} />
      ) : (
        <>
          {/* ===== GET STARTED CHECKLIST ===== */}
          <GettingStartedChecklist
            totalClients={overview?.counts?.totalClients ?? 0}
            totalInvoices={overview?.counts?.totalInvoices ?? 0}
          />

          {/* ===== STAT CARDS ===== */}
          <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Total Revenue */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Total Revenue
                </span>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50'>
                  <svg
                    className='h-5 w-5 text-orange-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
              <div className='mb-2'>
                {isLoading ? (
                  <Skeleton className='h-9 w-32' />
                ) : (
                  <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(overview?.revenue?.total ?? 0)}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-1.5'>
                {isLoading ? (
                  <Skeleton className='h-5 w-20' />
                ) : (
                  <>
                    <span
                      className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${getChangeBg(overview?.revenue?.percentageChange ?? 0)} ${getChangeColor(overview?.revenue?.percentageChange ?? 0)}`}
                    >
                      {(overview?.revenue?.percentageChange ?? 0) >= 0
                        ? '↑'
                        : '↓'}
                      {Math.abs(overview?.revenue?.percentageChange ?? 0)}%
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      vs last period
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Pending Invoices */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Pending Invoices
                </span>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50'>
                  <svg
                    className='h-5 w-5 text-yellow-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
              </div>
              <div className='mb-2'>
                {isLoading ? (
                  <Skeleton className='h-9 w-32' />
                ) : (
                  <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(overview?.pendingInvoices?.total ?? 0)}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-1.5'>
                {isLoading ? (
                  <Skeleton className='h-5 w-20' />
                ) : (
                  <>
                    <span className='rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700'>
                      {overview?.pendingInvoices?.count ?? 0} invoices
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      awaiting payment
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Outstanding */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Outstanding
                </span>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-red-50'>
                  <svg
                    className='h-5 w-5 text-red-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
              <div className='mb-2'>
                {isLoading ? (
                  <Skeleton className='h-9 w-32' />
                ) : (
                  <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(overview?.outstanding?.total ?? 0)}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-1.5'>
                {isLoading ? (
                  <Skeleton className='h-5 w-20' />
                ) : (
                  <>
                    <span className='rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600'>
                      {overview?.outstanding?.overdueCount ?? 0} overdue
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      needs attention
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Active Clients */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                  Active Clients
                </span>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50'>
                  <svg
                    className='h-5 w-5 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                </div>
              </div>
              <div className='mb-2'>
                {isLoading ? (
                  <Skeleton className='h-9 w-20' />
                ) : (
                  <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                    {overview?.activeClients?.count ?? 0}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-1.5'>
                {isLoading ? (
                  <Skeleton className='h-5 w-24' />
                ) : (
                  (() => {
                    const prevCount =
                      overview?.activeClients?.previousCount ?? 0;
                    const currCount = overview?.activeClients?.count ?? 0;
                    if (prevCount === 0 && currCount > 0) {
                      return (
                        <>
                          <span className='rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600'>
                            New
                          </span>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>
                            this period
                          </span>
                        </>
                      );
                    }
                    if (prevCount === 0 && currCount === 0) {
                      return <></>;
                    }
                    const activeChange =
                      overview?.activeClients?.percentageChange ?? 0;
                    return (
                      <>
                        <span
                          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${getChangeBg(activeChange)} ${getChangeColor(activeChange)}`}
                        >
                          {activeChange >= 0 ? '↑' : '↓'}
                          {Math.abs(activeChange)}%
                        </span>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          vs last period
                        </span>
                      </>
                    );
                  })()
                )}
              </div>
            </div>
          </div>

          {/* ===== CHARTS ROW ===== */}
          <div className='mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3'>
            {/* Revenue Overview Chart */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm lg:col-span-2'>
              <div className='mb-5 flex items-center justify-between'>
                <div>
                  <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                    Revenue Overview
                  </h3>
                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    Income vs Expenses
                  </p>
                </div>
              </div>

              {isLoading ? (
                <Skeleton className='h-[260px] w-full' />
              ) : chartData.length === 0 ? (
                <div className='relative h-[260px] w-full overflow-hidden'>
                  {/* Ghost chart — blurred preview */}
                  <div className='absolute inset-0 opacity-30 blur-[2px] pointer-events-none select-none'>
                    <ResponsiveContainer width='100%' height={260}>
                      <AreaChart
                        data={[
                          { period: 'Week 1', income: 800, expenses: 300 },
                          { period: 'Week 2', income: 1400, expenses: 500 },
                          { period: 'Week 3', income: 1100, expenses: 400 },
                          { period: 'Week 4', income: 2200, expenses: 600 },
                          { period: 'Week 5', income: 1800, expenses: 450 },
                          { period: 'Week 6', income: 3100, expenses: 700 },
                          { period: 'Week 7', income: 2700, expenses: 550 },
                          { period: 'Week 8', income: 4200, expenses: 800 },
                        ]}
                        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id='ghostIncomeGradient' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='5%' stopColor='#ea580c' stopOpacity={0.15} />
                            <stop offset='95%' stopColor='#ea580c' stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id='ghostExpenseGradient' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='5%' stopColor='#6b7280' stopOpacity={0.1} />
                            <stop offset='95%' stopColor='#6b7280' stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' stroke={chartColors.grid} />
                        <XAxis dataKey='period' tick={{ fontSize: 12, fill: chartColors.axis }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: chartColors.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'k'} />
                        <Area type='monotone' dataKey='income' stroke='#ea580c' strokeWidth={2.5} fill='url(#ghostIncomeGradient)' dot={false} />
                        <Area type='monotone' dataKey='expenses' stroke='#9ca3af' strokeWidth={2} fill='url(#ghostExpenseGradient)' dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Overlay */}
                  <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/40'>
                      <svg className='h-5 w-5 text-orange-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                      </svg>
                    </div>
                    <div className='text-center'>
                      <p className='text-sm font-semibold text-gray-800 dark:text-white'>Your revenue chart lives here</p>
                      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>Income and expenses will plot here once an invoice is paid</p>
                    </div>
                    <Link
                      href='/invoices'
                      className='rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors'
                    >
                      View invoices →
                    </Link>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={260}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id='incomeGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#ea580c'
                          stopOpacity={0.15}
                        />
                        <stop
                          offset='95%'
                          stopColor='#ea580c'
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id='expenseGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#6b7280'
                          stopOpacity={0.1}
                        />
                        <stop
                          offset='95%'
                          stopColor='#6b7280'
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={chartColors.grid}
                    />
                    <XAxis
                      dataKey='period'
                      tick={{ fontSize: 12, fill: chartColors.axis }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: chartColors.axis }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'k'}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: `1px solid ${chartColors.tooltip.border}`,
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)',
                        backgroundColor: chartColors.tooltip.bg,
                        padding: '10px 14px',
                      }}
                      labelStyle={{
                        color: chartColors.tooltip.label,
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}
                      itemStyle={{
                        color: chartColors.tooltip.text,
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                      formatter={(value: number | undefined, name?: string) => [
                        <span
                          key={name ?? ''}
                          style={{
                            color: name === 'Income' ? '#ea580c' : '#9ca3af',
                            fontWeight: 600,
                          }}
                        >
                          {'$' + (value ?? 0).toLocaleString()}
                        </span>,
                        name ?? '',
                      ]}
                    />
                    <Legend iconType='circle' iconSize={8} />
                    <Area
                      type='monotone'
                      dataKey='income'
                      name='Income'
                      stroke='#ea580c'
                      strokeWidth={2.5}
                      fill='url(#incomeGradient)'
                      dot={false}
                      activeDot={{ r: 5, fill: '#ea580c' }}
                    />
                    <Area
                      type='monotone'
                      dataKey='expenses'
                      name='Expenses'
                      stroke='#9ca3af'
                      strokeWidth={2}
                      fill='url(#expenseGradient)'
                      dot={false}
                      activeDot={{ r: 4, fill: '#9ca3af' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Business Health */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm'>
              <div className='mb-5'>
                <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                  Business Health
                </h3>
                <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                  Based on your activity
                </p>
              </div>

              {isLoading ? (
                <div className='flex flex-col items-center gap-4'>
                  <Skeleton className='h-32 w-32 rounded-full' />
                  <div className='w-full space-y-3'>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className='h-4 w-full' />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className='mb-6 flex flex-col items-center'>
                    <div className='relative flex h-32 w-32 items-center justify-center'>
                      <svg
                        className='absolute inset-0 h-full w-full -rotate-90'
                        viewBox='0 0 120 120'
                      >
                        <circle
                          cx='60'
                          cy='60'
                          r='50'
                          fill='none'
                          stroke={isDark ? '#1f2937' : '#f3f4f6'}
                          strokeWidth='10'
                        />
                        <circle
                          cx='60'
                          cy='60'
                          r='50'
                          fill='none'
                          stroke={getHealthStrokeColor(
                            healthMetrics?.healthStatus ?? 'GOOD',
                          )}
                          strokeWidth='10'
                          strokeLinecap='round'
                          strokeDasharray='314.16'
                          strokeDashoffset={
                            314.16 *
                            (1 - (healthMetrics?.healthScore ?? 0) / 100)
                          }
                          className='transition-all duration-1000 ease-out'
                        />
                      </svg>
                      <div className='text-center'>
                        <span className='text-3xl font-black text-gray-900 dark:text-white'>
                          {healthMetrics?.healthScore ?? 0}
                        </span>
                        <p
                          className={`text-xs font-bold uppercase tracking-wider ${getHealthColor(healthMetrics?.healthStatus ?? 'GOOD')}`}
                        >
                          {healthMetrics?.healthStatus?.replace('_', ' ') ??
                            'GOOD'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    {[
                      {
                        label: 'Collection Rate',
                        value: healthMetrics?.collectionRate ?? 0,
                        unit: '%',
                        isGood: (v: number) => v >= 80,
                      },
                      {
                        label: 'Avg Payment Time',
                        value: healthMetrics?.avgPaymentTime ?? 0,
                        unit: ' days',
                        isGood: (v: number) => v <= 14,
                      },
                      {
                        label: 'Client Retention',
                        value: healthMetrics?.clientRetention ?? 0,
                        unit: '%',
                        isGood: (v: number) => v >= 80,
                      },
                      {
                        label: 'Revenue Growth',
                        value: healthMetrics?.revenueGrowth ?? 0,
                        unit: '%',
                        isGood: (v: number) => v > 0,
                      },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className='flex items-center justify-between'
                      >
                        <span className='text-xs text-gray-600 dark:text-gray-400'>
                          {metric.label}
                        </span>
                        <span
                          className={`text-xs font-semibold ${metric.isGood(metric.value) ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {metric.value}
                          {metric.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ===== BOTTOM ROW ===== */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            {/* Top Clients */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm'>
              <div className='mb-5 flex items-center justify-between'>
                <div>
                  <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                    Top Clients
                  </h3>
                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    By revenue this period
                  </p>
                </div>
                <Link
                  href='/clients'
                  className='text-xs font-medium text-orange-600 hover:text-orange-700 focus:outline-none'
                >
                  View all →
                </Link>
              </div>

              {isLoading ? (
                <div className='space-y-4'>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className='h-10 w-full' />
                  ))}
                </div>
              ) : !clientRevenue?.clients?.length ? (
                <div className='space-y-4'>
                  {/* Ghost client rows using real activity data as fallback */}
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={activity.id}>
                      <div className='mb-1.5 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300'>
                            {index + 1}
                          </span>
                          <span className='text-sm font-medium text-gray-900 dark:text-white'>
                            {activity.clientName}
                          </span>
                        </div>
                        <span className='rounded-full bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400'>
                          pending
                        </span>
                      </div>
                      <div className='h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700'>
                        <div
                          className='h-1.5 rounded-full bg-orange-200 dark:bg-orange-900/50 transition-all duration-500'
                          style={{ width: `${100 - index * 25}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className='text-sm text-gray-400 dark:text-gray-500 text-center py-6'>
                      No client revenue data yet
                    </p>
                  )}
                  <p className='text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800'>
                    Revenue tracked after first payment is collected
                  </p>
                </div>
              ) : (
                <>
                  <div className='space-y-4'>
                    {clientRevenue.clients.map((client: any, index: number) => {
                      const maxRevenue = clientRevenue.clients[0].totalRevenue;
                      const percentage =
                        maxRevenue > 0
                          ? Math.round((client.totalRevenue / maxRevenue) * 100)
                          : 0;
                      return (
                        <div key={client.clientId}>
                          <div className='mb-1.5 flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <span className='flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300'>
                                {index + 1}
                              </span>
                              <span className='text-sm font-medium text-gray-900 dark:text-white'>
                                {client.companyName}
                              </span>
                            </div>
                            <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                              {formatCurrency(client.totalRevenue)}
                            </span>
                          </div>
                          <div className='h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700'>
                            <div
                              className='h-1.5 rounded-full bg-orange-500 transition-all duration-500'
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className='mt-4 border-t border-gray-100 dark:border-gray-700 pt-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        Top {clientRevenue.clients.length} total
                      </span>
                      <span className='text-sm font-bold text-gray-900 dark:text-white'>
                        {formatCurrency(clientRevenue.summary.topNTotal)}
                      </span>
                    </div>
                    <div className='mt-2 flex items-center justify-between'>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        % of total revenue
                      </span>
                      <span className='text-xs font-semibold text-orange-600 dark:text-orange-400'>
                        {clientRevenue.summary.concentrationPercent}%
                      </span>
                    </div>
                    <div className='mt-3'>
                      <p className='mb-1.5 text-xs text-gray-400 dark:text-gray-500'>
                        Client concentration
                      </p>
                      <div className='h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700'>
                        <div
                          className='h-1.5 rounded-full bg-orange-500 transition-all duration-500'
                          style={{
                            width: `${clientRevenue.summary.concentrationPercent}%`,
                          }}
                        />
                      </div>
                      <div className='mt-1 flex items-center justify-between'>
                        <span
                          className={`text-xs font-medium ${clientRevenue.summary.concentrationStatus === 'HEALTHY' ? 'text-green-600' : clientRevenue.summary.concentrationStatus === 'MODERATE' ? 'text-yellow-600' : 'text-red-600'}`}
                        >
                          {clientRevenue.summary.concentrationStatus.charAt(0) +
                            clientRevenue.summary.concentrationStatus
                              .slice(1)
                              .toLowerCase()}
                        </span>
                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                          Diversify at 60%+
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cash Flow Forecast */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm'>
              <div className='mb-5'>
                <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                  Cash Flow Forecast
                </h3>
                <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                  Next 6 months projection
                </p>
              </div>

              {isLoading ? (
                <Skeleton className='h-[220px] w-full' />
              ) : cashFlowChartData.length === 0 ? (
                <div className='flex h-[220px] items-center justify-center text-sm text-gray-400'>
                  No upcoming invoices
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={220}>
                  <BarChart
                    data={cashFlowChartData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    barGap={2}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={chartColors.grid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey='month'
                      tick={{ fontSize: 11, fill: chartColors.axis }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: chartColors.axis }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'k'}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: `1px solid ${chartColors.tooltip.border}`,
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)',
                        backgroundColor: chartColors.tooltip.bg,
                        padding: '10px 14px',
                        fontSize: '12px',
                      }}
                      labelStyle={{
                        color: chartColors.tooltip.label,
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}
                      itemStyle={{
                        color: chartColors.tooltip.text,
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                      formatter={(value: number | undefined) => [
                        '$' + (value ?? 0).toLocaleString(),
                        undefined,
                      ]}
                    />
                    <Legend
                      iconType='circle'
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    />
                    <Bar
                      dataKey='projected'
                      name='Projected'
                      fill='#ea580c'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='conservative'
                      name='Conservative'
                      fill='#fb923c'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}

              <div className='mt-4 border-t border-gray-100 dark:border-gray-700 pt-4'>
                <div className='flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400'>
                  <svg
                    className='h-3.5 w-3.5 shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                  AI Forecast Insight
                </div>
                {isLoading ? (
                  <div className='mt-2 flex gap-3'>
                    <Skeleton className='h-14 flex-1' />
                    <Skeleton className='h-14 flex-1' />
                  </div>
                ) : (
                  <div className='mt-2 flex gap-3'>
                    <div className='rounded-lg border border-green-100 dark:border-green-900/40 bg-green-50 dark:bg-green-950/30 px-3 py-2'>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Peak month
                      </p>
                      <p className='text-sm font-bold text-green-700 dark:text-green-400'>
                        {cashFlow?.insights?.peakMonth?.label ?? '—'} ·{' '}
                        {formatCurrency(
                          cashFlow?.insights?.peakMonth?.projected ?? 0,
                        )}
                      </p>
                    </div>
                    <div className='rounded-lg border border-orange-100 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/30 px-3 py-2'>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Projected growth
                      </p>
                      <p className='text-sm font-bold text-orange-600 dark:text-orange-400'>
                        {cashFlow?.insights?.projectedGrowth?.direction === 'up'
                          ? '+'
                          : ''}
                        {cashFlow?.insights?.projectedGrowth?.percent ?? 0}% vs
                        now
                      </p>
                    </div>
                  </div>
                )}
                <p className='mt-3 text-xs italic text-gray-400 dark:text-gray-500'>
                  Based on current invoice pipeline and historical patterns
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm'>
              <div className='mb-5 flex items-center justify-between'>
                <div>
                  <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                    Recent Activity
                  </h3>
                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    Latest transactions
                  </p>
                </div>
                <Link
                  href='/invoices'
                  className='text-xs font-medium text-orange-600 hover:text-orange-700 focus:outline-none'
                >
                  View all →
                </Link>
              </div>

              {isLoading ? (
                <div className='space-y-3'>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              ) : !recentActivity.length ? (
                <p className='text-sm text-gray-400 text-center py-8'>
                  No recent activity
                </p>
              ) : (
                <div className='space-y-3'>
                  {recentActivity.map((activity) => {
                    const isPayment = activity.type === 'PAYMENT_RECEIVED';
                    const isOverdue = activity.type === 'INVOICE_OVERDUE';
                    return (
                      <div
                        key={activity.id}
                        className='flex items-center gap-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1.5'
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isPayment ? 'bg-green-50' : 'bg-orange-50'}`}
                        >
                          {isPayment ? (
                            <svg
                              className='h-4 w-4 text-green-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                          ) : (
                            <svg
                              className='h-4 w-4 text-orange-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                              />
                            </svg>
                          )}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                            {activity.clientName}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                        <div className='shrink-0 text-right'>
                          <p
                            className={`text-sm font-semibold ${isPayment ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}
                          >
                            {isPayment ? '+' : ''}
                            {formatCurrency(activity.amount)}
                          </p>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                              isPayment
                                ? 'bg-green-50 text-green-700'
                                : isOverdue
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            {isPayment
                              ? 'received'
                              : isOverdue
                                ? 'overdue'
                                : 'sent'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
