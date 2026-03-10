'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
  sublabel: string;
  done: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

interface Props {
  totalClients: number;
  totalInvoices: number;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckCircle() {
  return (
    <svg className="h-5 w-5 text-orange-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function EmptyCircle() {
  return (
    <svg className="h-5 w-5 text-gray-300 dark:text-gray-600 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="10" cy="10" r="8" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GettingStartedChecklist({ totalClients, totalInvoices }: Props) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';

  const DISMISSED_KEY = `novba_checklist_dismissed_${userId}`;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasSentInvoice, setHasSentInvoice] = useState(false);
  const [hasPublishedPortfolio, setHasPublishedPortfolio] = useState(false);
  const [hasReminders, setHasReminders] = useState(false);
  const [aiPricingVisited, setAiPricingVisited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;
    if (localStorage.getItem(DISMISSED_KEY) === '1') {
      setIsDismissed(true);
    }
    if (localStorage.getItem('novba_ai_pricing_visited') === '1') {
      setAiPricingVisited(true);
    }
  }, [userId, DISMISSED_KEY]);

  // Fetch checklist data
  const fetchData = useCallback(async () => {
    try {
      const [sentRes, portfolioRes, remindersRes] = await Promise.allSettled([
        api.get('/invoices?status=SENT&limit=1'),
        api.get('/portfolio?limit=10'),
        api.get('/settings/reminders'),
      ]);

      if (sentRes.status === 'fulfilled') {
        const invoices = sentRes.value.data?.data?.invoices ?? [];
        setHasSentInvoice(invoices.length > 0);
      }

      if (portfolioRes.status === 'fulfilled') {
        const items = portfolioRes.value.data?.data?.items ?? [];
        setHasPublishedPortfolio(items.some((i: any) => i.isPublished === true));
      }

      if (remindersRes.status === 'fulfilled') {
        const reminders = remindersRes.value.data?.data?.reminders;
        setHasReminders(reminders?.enabled === true && reminders?.userConfigured === true);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
    setIsDismissed(true);
  };

  const items: ChecklistItem[] = [
    {
      id: 'account',
      label: 'Create your account',
      sublabel: 'You\'re here — welcome to Novba',
      done: true,
    },
    {
      id: 'client',
      label: 'Add your first client',
      sublabel: 'Every invoice needs a client attached',
      done: totalClients > 0,
      ctaLabel: 'Add client',
      ctaHref: '/clients/new',
    },
    {
      id: 'invoice',
      label: 'Send your first invoice',
      sublabel: 'Get paid — send an invoice to your client',
      done: hasSentInvoice,
      ctaLabel: 'Create invoice',
      ctaHref: '/invoices/new',
    },
    {
      id: 'ai-pricing',
      label: 'Try AI Pricing Coach',
      sublabel: 'See what the market says you should charge',
      done: aiPricingVisited,
      ctaLabel: 'Check rates',
      ctaHref: '/ai-pricing',
    },
    {
      id: 'portfolio',
      label: 'Publish your portfolio',
      sublabel: 'A public page that showcases your best work',
      done: hasPublishedPortfolio,
      ctaLabel: 'Set up portfolio',
      ctaHref: '/portfolio',
    },
    {
      id: 'reminders',
      label: 'Set up payment reminders',
      sublabel: 'Automatically follow up on unpaid invoices',
      done: hasReminders,
      ctaLabel: 'Configure',
      ctaHref: '/settings?tab=reminders',
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;
  const progressPct = Math.round((doneCount / items.length) * 100);

  // Auto-dismiss when everything is complete
  useEffect(() => {
    if (allDone && !isLoading && userId) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [allDone, isLoading, userId]);

  if (isDismissed || (!isLoading && allDone)) return null;

  return (
    <div className="mb-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Get started with Novba</h3>
              <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 text-xs font-semibold text-orange-600">
                {doneCount}/{items.length}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Complete these steps to unlock the full power of Novba
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Dismiss */}
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Checklist items */}
      {!isCollapsed && (
        <div className="px-5 py-3">
          {isLoading ? (
            <div className="space-y-3 py-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
                  <div className="h-4 flex-1 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    item.done
                      ? 'bg-orange-50/50 dark:bg-orange-950/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {item.done ? <CheckCircle /> : <EmptyCircle />}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${
                      item.done
                        ? 'text-gray-400 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-600'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.label}
                    </p>
                    {!item.done && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {item.sublabel}
                      </p>
                    )}
                  </div>
                  {!item.done && item.ctaLabel && item.ctaHref && (
                    <Link
                      href={item.ctaHref}
                      className="shrink-0 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                    >
                      {item.ctaLabel} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All done state */}
      {allDone && !isLoading && (
        <div className="px-5 pb-4 text-center">
          <p className="text-sm font-semibold text-orange-600">
            🎉 You're all set! Your dashboard is now fully unlocked.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            This card will close in a moment…
          </p>
        </div>
      )}
    </div>
  );
}
