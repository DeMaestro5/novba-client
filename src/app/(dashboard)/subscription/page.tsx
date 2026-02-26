'use client';

import { useState, useRef } from 'react';
import Button from '@/components/UI/Button';
import { useToast } from '@/components/UI/Toast';

// ─── Plan / pricing data (single source of truth — from spec) ─────────────────

type Tier = 'FREE' | 'PRO' | 'STUDIO';

const PLANS = {
  FREE: {
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Get started with core features.',
    limits: {
      clients: 3,
      invoicesPerMonth: 10,
      proposalsPerMonth: 5,
      projects: 3,
      portfolioItems: 3,
      storage: '100MB',
    },
    features: [
      { text: '3 clients', included: true },
      { text: '10 invoices/month', included: true },
      { text: '5 proposals/month', included: true },
      { text: '3 projects', included: true },
      { text: '3 portfolio items', included: true },
      { text: '100MB storage', included: true },
      { text: 'AI pricing insights', included: false },
      { text: 'Custom branding', included: false },
      { text: 'Stripe Connect', included: false },
      { text: 'Public portfolio', included: true },
      { text: 'Contract templates', included: true },
    ],
    trial: false,
    badge: null as string | null,
    borderClass: '',
  },
  PRO: {
    name: 'Pro',
    priceMonthly: 29,
    priceAnnual: 22,
    description: 'Unlimited everything for serious freelancers.',
    limits: { clients: Infinity, invoicesPerMonth: Infinity, proposalsPerMonth: Infinity, projects: Infinity, portfolioItems: Infinity, storage: '10GB' },
    features: [
      { text: 'Unlimited clients', included: true },
      { text: 'Unlimited invoices', included: true },
      { text: 'Unlimited proposals', included: true },
      { text: 'Unlimited projects', included: true },
      { text: 'Unlimited portfolio items', included: true },
      { text: '10GB storage', included: true },
      { text: 'AI pricing insights', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Stripe Connect', included: true },
      { text: 'Public portfolio', included: true },
      { text: 'Contract templates', included: true },
      { text: 'Priority support', included: true },
    ],
    trial: true,
    badge: 'Most Popular',
    borderClass: 'border-2 border-orange-500',
  },
  STUDIO: {
    name: 'Studio',
    priceMonthly: 99,
    priceAnnual: 79,
    description: 'Teams, white-label, and advanced tools.',
    limits: { clients: Infinity, invoicesPerMonth: Infinity, proposalsPerMonth: Infinity, projects: Infinity, portfolioItems: Infinity, storage: '50GB' },
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '5 team members', included: true },
      { text: 'White-label', included: true },
      { text: 'API access', included: true },
      { text: 'Advanced analytics', included: true },
      { text: '50GB storage', included: true },
      { text: '14-day free trial', included: true },
    ],
    trial: true,
    badge: 'Best Value',
    borderClass: 'border-2 border-violet-500/50',
  },
} as const;

// Mock usage for FREE tier (replace with API later)
const DEFAULT_USAGE = {
  clients: 2,
  invoicesUsed: 7,
  proposalsUsed: 3,
  projects: 2,
  portfolioItems: 1,
};

// ─── Feature comparison table rows (from spec) ─────────────────────────────────

const COMPARISON_CORE = [
  { feature: 'Clients', free: '3', pro: 'Unlimited', studio: 'Unlimited' },
  { feature: 'Monthly invoices', free: '10', pro: 'Unlimited', studio: 'Unlimited' },
  { feature: 'Monthly proposals', free: '5', pro: 'Unlimited', studio: 'Unlimited' },
  { feature: 'Active projects', free: '3', pro: 'Unlimited', studio: 'Unlimited' },
  { feature: 'Portfolio items', free: '3', pro: 'Unlimited', studio: 'Unlimited' },
  { feature: 'Storage', free: '100MB', pro: '10GB', studio: '50GB' },
];

const COMPARISON_FEATURES = [
  { feature: 'AI pricing insights', free: false, pro: true, studio: true },
  { feature: 'Custom branding', free: false, pro: true, studio: true },
  { feature: 'Stripe payments', free: false, pro: true, studio: true },
  { feature: 'Public portfolio', free: true, pro: true, studio: true },
  { feature: 'Contract templates', free: true, pro: true, studio: true },
];

const COMPARISON_TEAM = [
  { feature: 'Team members', free: '1', pro: '1', studio: '5' },
  { feature: 'White-label', free: false, pro: false, studio: true },
  { feature: 'API access', free: false, pro: false, studio: true },
  { feature: 'Advanced analytics', free: false, pro: false, studio: true },
];

const COMPARISON_SUPPORT = [
  { feature: 'Support type', free: 'Community', pro: 'Priority', studio: 'Dedicated' },
  { feature: 'Response time', free: '72h', pro: '24h', studio: '4h' },
  { feature: 'SLA guarantee', free: false, pro: false, studio: true },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── Usage pill (for slim banner) ───────────────────────────────────────────────

function UsagePill({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number;
  label: string;
}) {
  const pct = limit === 0 ? 0 : (used / limit) * 100;
  const pillColor =
    pct >= 100
      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
      : pct >= 80
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pillColor}`}
    >
      {used}/{limit} {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const { showToast } = useToast();
  const plansRef = useRef<HTMLDivElement>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [currentTier, setCurrentTier] = useState<Tier>('FREE');
  const [usage] = useState(DEFAULT_USAGE);
  const [checkoutLoading, setCheckoutLoading] = useState<Tier | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const nextBillingDate = 'Jan 1, 2027';

  const scrollToPlans = () => plansRef.current?.scrollIntoView({ behavior: 'smooth' });

  const startCheckout = async (tier: Tier) => {
    if (tier === 'FREE') return;
    setCheckoutLoading(tier);
    try {
      const res = await fetch('/api/v1/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Checkout failed');
      const url = data?.data?.checkoutUrl ?? data?.checkoutUrl;
      if (url) window.location.href = url;
      else throw new Error('No checkout URL');
    } catch {
      showToast('Failed to start checkout', 'error');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const freeLimits = PLANS.FREE.limits;

  const renderComparisonCell = (val: string | boolean, key: string) => {
    if (typeof val === 'boolean') {
      return val ? (
        <CheckIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
      ) : (
        <XIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      );
    }
    return val;
  };

  return (
    <div className="mx-auto max-w-[1100px] p-6 lg:p-8">
      {/* Section 1 — Page Hero + Billing Toggle */}
      <header className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
          Simple Pricing
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Invest in your freelance business
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Start free. Upgrade when you&apos;re ready. Cancel anytime — no lock-in.
        </p>
        <div className="flex justify-center mt-6 mb-8">
          <div
            role="tablist"
            className="inline-flex rounded-full p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === 'monthly'}
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === 'annual'}
              onClick={() => setBillingPeriod('annual')}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Annual
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Section 2 — Current Plan (slim banner) */}
      <div
        className="mb-8 rounded-xl border border-orange-900/30 bg-orange-950/20 dark:bg-orange-950/20 dark:border-orange-900/30 px-5 py-3 flex flex-wrap items-center justify-between gap-3"
      >
        {currentTier === 'FREE' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                You&apos;re on the <strong className="text-gray-900 dark:text-white">Free</strong> plan
              </span>
              <span className="text-gray-400 dark:text-gray-500">·</span>
              <UsagePill
                used={usage.invoicesUsed}
                limit={freeLimits.invoicesPerMonth}
                label="invoices"
              />
              <UsagePill used={usage.clients} limit={freeLimits.clients} label="clients" />
              <UsagePill used={usage.projects} limit={freeLimits.projects} label="projects" />
              <UsagePill
                used={usage.proposalsUsed}
                limit={freeLimits.proposalsPerMonth}
                label="proposals"
              />
              <UsagePill
                used={usage.portfolioItems}
                limit={freeLimits.portfolioItems}
                label="portfolio"
              />
            </div>
            <button
              type="button"
              onClick={scrollToPlans}
              className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors shrink-0"
            >
              Upgrade Plan →
            </button>
          </>
        )}
        {(currentTier === 'PRO' || currentTier === 'STUDIO') && (
          <div className="flex flex-wrap items-center gap-2 w-full justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">{PLANS[currentTier].name} Plan</strong>
              {' · '}
              <span className="text-green-600 dark:text-green-400">Active</span>
              {' · '}
              Renews {nextBillingDate}
            </span>
            <button
              type="button"
              onClick={() => {}}
              className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors shrink-0"
            >
              Manage Billing →
            </button>
          </div>
        )}
      </div>

      {/* Section 3 — Pricing Cards */}
      <div
        ref={plansRef}
        className="grid gap-6 lg:grid-cols-3 mb-12 items-center"
      >
        {(['FREE', 'PRO', 'STUDIO'] as const).map((tier) => {
          const plan = PLANS[tier];
          const isCurrent = currentTier === tier;
          const isDowngrade =
            (tier === 'FREE' && currentTier !== 'FREE') ||
            (tier === 'PRO' && currentTier === 'STUDIO');
          const price =
            billingPeriod === 'annual' ? plan.priceAnnual : plan.priceMonthly;
          const period = billingPeriod === 'annual' ? '/mo billed annually' : '/mo';
          const isPro = tier === 'PRO';

          return (
            <div
              key={tier}
              className={`relative flex flex-col h-full ${
                isPro ? 'lg:-mt-4 lg:pb-4' : ''
              }`}
            >
              {plan.badge && (
                <div className="flex justify-center absolute left-0 right-0 -top-3 z-10">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isPro
                        ? 'bg-orange-500 text-white'
                        : 'bg-violet-500 text-white dark:bg-violet-500'
                    }`}
                  >
                    {isPro ? 'MOST POPULAR' : 'BEST VALUE'}
                  </span>
                </div>
              )}
              <div
                className={`flex flex-col flex-1 rounded-xl border overflow-hidden ${
                  isPro
                    ? 'bg-gray-900 shadow-[0_0_0_1px_rgb(234,88,12),0_20px_60px_-10px_rgba(234,88,12,0.25)]'
                    : tier === 'FREE'
                      ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-900 border-violet-200 dark:border-violet-800/50'
                } ${isCurrent && !isPro ? 'ring-2 ring-dashed ring-gray-400 dark:ring-gray-500' : ''}`}
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h3
                      className={`text-lg font-semibold ${
                        isPro ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <span
                      className={
                        isPro
                          ? 'text-5xl font-black text-white'
                          : tier === 'STUDIO'
                            ? 'text-3xl font-bold text-violet-600 dark:text-violet-400'
                            : 'text-3xl font-bold text-gray-900 dark:text-white'
                      }
                    >
                      ${price}
                    </span>
                    <span
                      className={
                        isPro ? 'text-white/70 text-lg' : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {period}
                    </span>
                    {billingPeriod === 'annual' && tier !== 'FREE' && (
                      <p
                        className={`mt-1 text-sm ${
                          isPro ? 'text-green-400' : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        Save ${(plan.priceMonthly - plan.priceAnnual) * 12}/year
                      </p>
                    )}
                  </div>

                  <p
                    className={`text-sm mb-4 ${
                      isPro ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div
                    className={
                      isPro
                        ? 'border-white/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }
                    style={{ borderTopWidth: 1 }}
                  />

                  <ul className="flex-1 py-4 space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <CheckIcon
                            className={`h-4 w-4 shrink-0 ${
                              isPro ? 'text-green-400' : 'text-green-500 dark:text-green-400'
                            }`}
                          />
                        ) : (
                          <XIcon className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                        )}
                        <span
                          className={
                            f.included
                              ? isPro
                                ? 'text-white/90'
                                : 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-400 dark:text-gray-500'
                          }
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div
                    className={
                      isPro
                        ? 'border-white/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }
                    style={{ borderTopWidth: 1 }}
                  />

                  <div className="pt-4">
                    {isCurrent && (
                      <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        Current Plan
                      </div>
                    )}
                    {!isCurrent && tier === 'FREE' && (
                      <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        Always Free
                      </div>
                    )}
                    {!isCurrent && isDowngrade && (
                      <Button variant="outline" fullWidth disabled className="rounded-xl">
                        Downgrade
                      </Button>
                    )}
                    {!isCurrent && !isDowngrade && tier === 'PRO' && (
                      <Button
                        variant="primary"
                        fullWidth
                        className="rounded-xl py-3 font-bold bg-orange-500 hover:bg-orange-600 shadow-[0_0_0_1px_rgba(234,88,12,0.3),0_4px_14px_-2px_rgba(234,88,12,0.4)] border-0"
                        isLoading={checkoutLoading === tier}
                        onClick={() => startCheckout(tier)}
                      >
                        Start Free Trial →
                      </Button>
                    )}
                    {!isCurrent && !isDowngrade && tier === 'STUDIO' && (
                      <Button
                        variant="primary"
                        fullWidth
                        className="rounded-xl py-3 bg-violet-600 hover:bg-violet-700 border-0"
                        isLoading={checkoutLoading === tier}
                        onClick={() => startCheckout(tier)}
                      >
                        Start Free Trial →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 4 — Feature Comparison */}
      <div className="mb-4 flex justify-center">
        <button
          type="button"
          onClick={() => setComparisonOpen((o) => !o)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1.5"
        >
          Compare all features
          <svg
            className={`h-4 w-4 transition-transform ${comparisonOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {comparisonOpen && (
        <div className="mb-8 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="p-3 font-semibold text-gray-900 dark:text-white">
                  Feature
                </th>
                <th className="p-3 font-semibold text-gray-900 dark:text-white">
                  Free
                </th>
                <th className="p-3 font-semibold text-gray-900 dark:text-white border-b-2 border-orange-500">
                  Pro
                </th>
                <th className="p-3 font-semibold text-gray-900 dark:text-white">
                  Studio
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td colSpan={4} className="p-2.5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Core
                </td>
              </tr>
              {COMPARISON_CORE.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                >
                  <td className="p-3">{row.feature}</td>
                  <td className="p-3">{row.free}</td>
                  <td className="p-3">{row.pro}</td>
                  <td className="p-3">{row.studio}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td colSpan={4} className="p-2.5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Features
                </td>
              </tr>
              {COMPARISON_FEATURES.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                >
                  <td className="p-3">{row.feature}</td>
                  <td className="p-3">{renderComparisonCell(row.free, 'free')}</td>
                  <td className="p-3">{renderComparisonCell(row.pro, 'pro')}</td>
                  <td className="p-3">{renderComparisonCell(row.studio, 'studio')}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td colSpan={4} className="p-2.5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Team
                </td>
              </tr>
              {COMPARISON_TEAM.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                >
                  <td className="p-3">{row.feature}</td>
                  <td className="p-3">{renderComparisonCell(row.free, 'free')}</td>
                  <td className="p-3">{renderComparisonCell(row.pro, 'pro')}</td>
                  <td className="p-3">{renderComparisonCell(row.studio, 'studio')}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td colSpan={4} className="p-2.5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Support
                </td>
              </tr>
              {COMPARISON_SUPPORT.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                >
                  <td className="p-3">{row.feature}</td>
                  <td className="p-3">{renderComparisonCell(row.free, 'free')}</td>
                  <td className="p-3">{renderComparisonCell(row.pro, 'pro')}</td>
                  <td className="p-3">{renderComparisonCell(row.studio, 'studio')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 5 — Trust bar (single slim row) */}
      <div className="mb-8 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-8 py-4">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 dark:text-gray-400">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden>🔒</span>
            No hidden fees
          </span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden>🔄</span>
            14-day free trial
          </span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden>⚡</span>
            Cancel anytime
          </span>
        </div>
      </div>
    </div>
  );
}
