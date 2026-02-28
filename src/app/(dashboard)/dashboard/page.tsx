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
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

// GET /dashboard/overview?startDate=X&endDate=Y
const mockOverview = {
  revenue: {
    current: 24850,
    previous: 19200,
    percentChange: 29.4,
    currency: 'USD',
  },
  pendingInvoices: {
    count: 8,
    amount: 12400,
  },
  outstandingPayments: {
    count: 3,
    amount: 5200,
    overdueCount: 1,
  },
  activeClients: {
    current: 12,
    previous: 9,
    percentChange: 33.3,
  },
};

// GET /dashboard/income-chart?groupBy=month
const mockIncomeData = [
  { period: 'Aug', income: 8200, expenses: 2100 },
  { period: 'Sep', income: 11400, expenses: 3200 },
  { period: 'Oct', income: 9800, expenses: 2800 },
  { period: 'Nov', income: 13200, expenses: 3600 },
  { period: 'Dec', income: 10500, expenses: 2900 },
  { period: 'Jan', income: 15800, expenses: 4100 },
  { period: 'Feb', income: 24850, expenses: 5200 },
];

// GET /dashboard/client-revenue?limit=5
const mockClientRevenue = [
  { name: 'Acme Corp', revenue: 8400, invoices: 6, color: '#ea580c' },
  { name: 'TechStart Inc', revenue: 6200, invoices: 4, color: '#f97316' },
  { name: 'Design Studio', revenue: 4800, invoices: 5, color: '#fb923c' },
  { name: 'Growth Labs', revenue: 3200, invoices: 3, color: '#fdba74' },
  { name: 'Solo Ventures', revenue: 2250, invoices: 2, color: '#fed7aa' },
];

// GET /dashboard/cash-flow-forecast?months=6
const mockForecast = [
  { month: 'Mar', projected: 22000, conservative: 17000 },
  { month: 'Apr', projected: 26500, conservative: 20000 },
  { month: 'May', projected: 24000, conservative: 18500 },
  { month: 'Jun', projected: 29000, conservative: 22000 },
  { month: 'Jul', projected: 31500, conservative: 24000 },
  { month: 'Aug', projected: 28000, conservative: 21500 },
];

// GET /dashboard/health-metrics
const mockHealth = {
  healthScore: 78,
  healthStatus: 'GOOD',
  invoiceCollectionRate: 87,
  avgPaymentTime: 12,
  clientRetentionRate: 92,
  revenueGrowthRate: 29.4,
};

// Recent activity (from invoices/payments endpoints in future)
const mockRecentActivity = [
  { id: 1, type: 'payment', client: 'Acme Corp', amount: 2400, time: '2 hours ago', status: 'received' },
  { id: 2, type: 'invoice', client: 'TechStart Inc', amount: 1800, time: '5 hours ago', status: 'sent' },
  { id: 3, type: 'invoice', client: 'Design Studio', amount: 3200, time: '1 day ago', status: 'overdue' },
  { id: 4, type: 'payment', client: 'Growth Labs', amount: 950, time: '2 days ago', status: 'received' },
  { id: 5, type: 'invoice', client: 'Solo Ventures', amount: 1100, time: '3 days ago', status: 'sent' },
];

const periods = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return '$' + (amount / 1000).toFixed(1) + 'k';
  }
  return '$' + amount.toLocaleString();
}

function getChangeColor(change: number): string {
  return change >= 0 ? 'text-green-600' : 'text-red-600';
}

function getChangeBg(change: number): string {
  return change >= 0 ? 'bg-green-50' : 'bg-red-50';
}

function getHealthColor(status: string): string {
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

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartGroupBy, setChartGroupBy] = useState<'day' | 'week' | 'month'>('month');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
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

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* ===== HEADER ===== */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Good morning, Stephen 👋</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tuesday, February 17, 2026 · Here&apos;s your business overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 bg-white p-1 shadow-sm">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setSelectedPeriod(p.value as typeof selectedPeriod)}
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
            href="/invoices/new"
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md focus:outline-none"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </Link>
        </div>
      </div>

      {/* ===== AI PRICING COACH BANNER ===== */}
      <div
        className="mb-5 overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)' }}
      >
        <div className="relative flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
          <div className="absolute right-0 top-0 h-full w-64 opacity-10">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white" />
            <div className="absolute right-12 bottom-0 h-24 w-24 rounded-full bg-white" />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Pricing Coach</p>
              <p className="text-sm text-white/80">
                Freelancers using AI Pricing earn <span className="font-bold text-white">30-40% more</span>. See what you should charge.
              </p>
            </div>
          </div>

          <Link
            href="/pricing"
            className="relative flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none"
          >
            Check My Rates
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ===== STAT CARDS ROW ===== */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
              <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(mockOverview.revenue.current)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${getChangeBg(mockOverview.revenue.percentChange)} ${getChangeColor(mockOverview.revenue.percentChange)}`}>
              {mockOverview.revenue.percentChange > 0 ? '↑' : '↓'}
              {Math.abs(mockOverview.revenue.percentChange)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending Invoices
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50">
              <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(mockOverview.pendingInvoices.amount)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">
              {mockOverview.pendingInvoices.count} invoices
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">awaiting payment</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Outstanding
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(mockOverview.outstandingPayments.amount)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
              {mockOverview.outstandingPayments.overdueCount} overdue
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">needs attention</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active Clients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {mockOverview.activeClients.current}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${getChangeBg(mockOverview.activeClients.percentChange)} ${getChangeColor(mockOverview.activeClients.percentChange)}`}>
              ↑ {mockOverview.activeClients.percentChange}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
          </div>
        </div>
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Income vs Expenses</p>
            </div>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
              {(['day', 'week', 'month'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setChartGroupBy(g)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all duration-200 ${
                    chartGroupBy === g ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockIncomeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: chartColors.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: chartColors.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: `1px solid ${chartColors.tooltip.border}`,
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)',
                  backgroundColor: chartColors.tooltip.bg,
                  padding: '10px 14px',
                }}
                labelStyle={{ color: chartColors.tooltip.label, fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}
                itemStyle={{ color: chartColors.tooltip.text, fontSize: '13px', fontWeight: 600 }}
                formatter={(value: number | undefined, name: string | undefined) => [
                  <span key={name ?? ''} style={{ color: name === 'Income' ? '#ea580c' : '#9ca3af', fontWeight: 600 }}>
                    {'$' + (value ?? 0).toLocaleString()}
                  </span>,
                  name ?? '',
                ]}
              />
              <Legend iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#ea580c"
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#ea580c' }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#9ca3af"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#9ca3af' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Business Health</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Based on your activity</p>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke={isDark ? '#1f2937' : '#f3f4f6'} strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={mockHealth.healthScore >= 90 ? '#16a34a' : mockHealth.healthScore >= 70 ? '#2563eb' : mockHealth.healthScore >= 50 ? '#ca8a04' : '#dc2626'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="314.16"
                  strokeDashoffset={314.16 * (1 - mockHealth.healthScore / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="text-center">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{mockHealth.healthScore}</span>
                <p className={`text-xs font-bold uppercase tracking-wider ${getHealthColor(mockHealth.healthStatus)}`}>
                  {mockHealth.healthStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Collection Rate', value: mockHealth.invoiceCollectionRate, unit: '%', threshold: 80 },
              { label: 'Avg Payment Time', value: mockHealth.avgPaymentTime, unit: ' days', threshold: null, lower: true },
              { label: 'Client Retention', value: mockHealth.clientRetentionRate, unit: '%', threshold: 80 },
              { label: 'Revenue Growth', value: mockHealth.revenueGrowthRate, unit: '%', threshold: 0 },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</span>
                <span
                  className={`text-xs font-semibold ${
                    metric.lower
                      ? metric.value <= 14
                        ? 'text-green-600'
                        : 'text-red-600'
                      : metric.threshold !== null
                        ? metric.value >= metric.threshold
                          ? 'text-green-600'
                          : 'text-red-600'
                        : metric.value > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                  }`}
                >
                  {metric.value}
                  {metric.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BOTTOM ROW ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Clients</h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">By revenue this period</p>
            </div>
            <Link href="/clients" className="text-xs font-medium text-orange-600 hover:text-orange-700 focus:outline-none">
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {mockClientRevenue.map((client, index) => {
              const maxRevenue = mockClientRevenue[0].revenue;
              const percentage = Math.round((client.revenue / maxRevenue) * 100);
              return (
                <div key={client.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(client.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-1.5 rounded-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Top 5 total</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">$24.9k</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">% of total revenue</span>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">82.3%</span>
            </div>
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-gray-400 dark:text-gray-500">Client concentration</p>
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-1.5 w-[82%] rounded-full bg-orange-500" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-green-600 dark:text-green-400">Healthy</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Diversify at 60%+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Cash Flow Forecast</h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Next 6 months projection</p>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockForecast} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: `1px solid ${chartColors.tooltip.border}`,
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)',
                  backgroundColor: chartColors.tooltip.bg,
                  padding: '10px 14px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: chartColors.tooltip.label, fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}
                itemStyle={{ color: chartColors.tooltip.text, fontSize: '13px', fontWeight: 600 }}
                formatter={(value: number | undefined) => ['$' + (value ?? 0).toLocaleString(), undefined]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="projected" name="Projected" fill="#ea580c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conservative" name="Conservative" fill="#fb923c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Forecast Insight
            </div>
            <div className="mt-2 flex gap-3">
              <div className="rounded-lg border border-green-100 dark:border-green-900/40 bg-green-50 dark:bg-green-950/30 px-3 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Peak month</p>
                <p className="text-sm font-bold text-green-700 dark:text-green-400">July · $31.2k</p>
              </div>
              <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/30 px-3 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Projected growth</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">+18% vs now</p>
              </div>
            </div>
            <p className="mt-3 text-xs italic text-gray-400 dark:text-gray-500">
              Based on current invoice pipeline and historical patterns
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Latest transactions</p>
            </div>
            <Link href="/invoices" className="text-xs font-medium text-orange-600 hover:text-orange-700 focus:outline-none">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <Link
                key={activity.id}
                href={`/invoices/${activity.id}`}
                className="flex items-center gap-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-1.5"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    activity.type === 'payment' ? 'bg-green-50' : 'bg-orange-50'
                  }`}
                >
                  {activity.type === 'payment' ? (
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{activity.client}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold ${
                      activity.type === 'payment' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {activity.type === 'payment' ? '+' : ''}
                    {formatCurrency(activity.amount)}
                  </p>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                      activity.status === 'received'
                        ? 'bg-green-50 text-green-700'
                        : activity.status === 'overdue'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
