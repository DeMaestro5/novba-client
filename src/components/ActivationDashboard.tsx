'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export interface ActivationDashboardProps {
  firstName?: string | null;
}

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

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

const LockIcon = () => (
  <svg className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

export function ActivationDashboard({ firstName }: ActivationDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [draftInvoice, setDraftInvoice] = useState<{
    id: string;
    invoiceNumber: string;
    total: number;
    currency: string;
    status: string;
  } | null>(null);
  const [firstClient, setFirstClient] = useState<{ companyName: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [draftRes, sentRes, clientsRes] = await Promise.all([
        api.get<{ data: { invoices: Array<{ id: string; invoiceNumber: string; total: number; currency: string; status: string }> } }>(
          '/invoices?limit=5&status=DRAFT'
        ),
        api.get<{ data: { invoices: Array<{ id: string; invoiceNumber: string; total: number; currency: string; status: string }> } }>(
          '/invoices?limit=5&status=SENT'
        ),
        api.get<{ data: { clients: Array<{ companyName: string }> } }>('/clients?limit=1'),
      ]);
      const drafts = draftRes.data?.data?.invoices ?? [];
      const sent = sentRes.data?.data?.invoices ?? [];
      const firstInvoice = drafts[0] ?? sent[0] ?? null;
      const clients = clientsRes.data?.data?.clients ?? [];
      if (firstInvoice) {
        setDraftInvoice({
          id: firstInvoice.id,
          invoiceNumber: firstInvoice.invoiceNumber,
          total: Number(firstInvoice.total),
          currency: firstInvoice.currency || 'USD',
          status: firstInvoice.status ?? 'DRAFT',
        });
      } else {
        setDraftInvoice(null);
      }
      if (clients.length > 0) {
        setFirstClient({ companyName: clients[0].companyName });
      } else {
        setFirstClient(null);
      }
    } catch {
      setDraftInvoice(null);
      setFirstClient(null);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const sectionBase = 'transition-all duration-700 ' + (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4');
  const stepsComplete = 1 + (firstClient ? 1 : 0) + (draftInvoice ? 1 : 0);
  const sendHref = draftInvoice ? `/invoices/${draftInvoice.id}` : '/invoices';
  const clientLabel = firstClient ? firstClient.companyName : 'Done';
  const invoiceLabel = draftInvoice
    ? formatCurrency(draftInvoice.total, draftInvoice.currency) + ' · ' + draftInvoice.invoiceNumber
    : 'Done';
  const progressPercent = Math.round((stepsComplete / 5) * 100);

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Header */}
      <div className={sectionBase} style={{ transitionDelay: '0ms' }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {firstName ?? 'there'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {getFormattedDate()} · Let&apos;s get your first invoice paid
        </p>
      </div>

      {/* SECTION 2 — Progress tracker card */}
      <div className={sectionBase} style={{ transitionDelay: '100ms' }}>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Your business is ready. Time to get paid.
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete these steps to unlock your dashboard.
          </p>

          <ul className="mt-6 space-y-3">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Account created</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                First client added — {clientLabel}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                First invoice created — {invoiceLabel}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900" />
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Send your invoice to {firstClient ? firstClient.companyName : 'your client'} — get paid faster
              </span>
              <Link
                href={sendHref}
                className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500"
              >
                Send Now →
              </Link>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800" />
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                Collect your first payment
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Unlocks after sending</span>
            </li>
          </ul>

          <div className="mt-6">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-orange-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {stepsComplete} of 5 steps · You&apos;re almost there
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Two column grid */}
      <div className={`grid grid-cols-1 gap-6 lg:grid-cols-3 ${sectionBase}`} style={{ transitionDelay: '200ms' }}>
        {/* LEFT COLUMN — What your dashboard will look like */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              What your dashboard will look like
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Total Revenue — locked */}
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <LockIcon />
                    Total Revenue
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 opacity-40 dark:text-white">$0</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Unlocks with first payment</p>
              </div>
              {/* Pending Invoices — real if draft or sent invoice exists */}
              <div className={`rounded-xl border border-gray-100 p-4 dark:border-gray-700 ${draftInvoice ? 'border-l-2 border-l-orange-500 dark:bg-gray-800/50' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {draftInvoice ? null : <LockIcon />}
                    Pending Invoices
                  </span>
                </div>
                <p className={`text-2xl font-bold text-gray-900 dark:text-white ${!draftInvoice ? 'opacity-50' : ''}`}>
                  {draftInvoice ? formatCurrency(draftInvoice.total, draftInvoice.currency) : '$0'}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {draftInvoice
                    ? draftInvoice.status === 'SENT'
                      ? 'Sent · awaiting payment'
                      : 'Draft ready to send'
                    : 'Unlocks when invoices are sent'}
                </p>
              </div>
              {/* Outstanding — locked */}
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <LockIcon />
                    Outstanding
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 opacity-40 dark:text-white">$0</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Unlocks when invoices are sent</p>
              </div>
              {/* Active Clients — real if client exists */}
              <div className={`rounded-xl border border-gray-100 p-4 dark:border-gray-700 ${firstClient ? 'border-l-2 border-l-orange-500 dark:bg-gray-800/50' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {firstClient ? null : <LockIcon />}
                    Active Clients
                  </span>
                </div>
                <p className={`text-2xl font-bold text-gray-900 dark:text-white ${!firstClient ? 'opacity-50' : ''}`}>
                  {firstClient ? '1' : '0'}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {firstClient ? 'First client added' : 'Unlocks when you add clients'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Why freelancers love Novba */}
        <div className={sectionBase} style={{ transitionDelay: '300ms' }}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Why freelancers love Novba
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">AI knows your worth</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Get pricing recommendations based on your role and market rates
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Get paid 3x faster</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Automated reminders so you never chase payments manually
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                    <line x1="2" y1="20" x2="22" y2="20"/>
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">See your business clearly</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Revenue forecasting, client health scores, cash flow insights
                  </p>
                </div>
              </li>
            </ul>
            <Link
              href="/ai-pricing"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              Check AI Pricing Insights →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
