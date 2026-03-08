'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Card, { CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';

// ─── Types ───────────────────────────────────────────────────────────────────

type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';

type BackendExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

interface RateAnalysisResult {
  isUndercharging: boolean;
  percentBelow: number;
  potentialIncrease: number;
  confidence: number;
  marketMin: number;
  marketMax: number;
  marketMedian: number;
  suggestedRate: number;
  message: string;
  category: string;
  experienceLevel: string;
}

interface ProjectEstimateResult {
  minEstimate: number;
  maxEstimate: number;
  recommendedPrice: number;
  rationale: string;
  projectType: string;
  breakdown?: Array<{
    task: string;
    hours?: number;
    rate?: number;
    amount: number;
  }>;
}

interface PricingInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact?: string;
  actionLabel?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon?: string;
}

interface InsightCard {
  id: string;
  type: 'warning' | 'opportunity' | 'positive' | 'tip';
  title: string;
  metric: string;
  body: string;
  action: string;
}

const EXPERIENCE_MAP: Record<string, BackendExperienceLevel> = {
  Junior: 'BEGINNER',
  Mid: 'INTERMEDIATE',
  Senior: 'EXPERT',
  Expert: 'EXPERT',
};

const ROLE_TO_CATEGORY_MAP: Record<string, string> = {
  'UI/UX Designer':        'Design',
  'Brand Designer':        'Design',
  'Motion Designer':       'Design',
  'Frontend Developer':    'Web Development',
  'Backend Developer':     'Web Development',
  'Full-Stack Developer':  'Web Development',
  'Content Writer':        'Writing',
  'Copywriter':            'Writing',
  'Video Editor':          'Video Production',
  'Social Media Manager':  'Marketing',
};

// ─── Helper Components ────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function ConfidencePill({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-100 text-green-700' : score >= 80 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {score}% confidence
    </span>
  );
}

function InsightIcon({ type }: { type: InsightCard['type'] }) {
  if (type === 'warning') return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  );
  if (type === 'opportunity') return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
      <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    </div>
  );
  if (type === 'positive') return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
      <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
  );
}

// ─── Loading Shimmer ──────────────────────────────────────────────────────────

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700 ${className}`} />
  );
}

function RateResultSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-8 w-full" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-20 w-full" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIPricingPage() {
  const router = useRouter();
  // Rate Analyzer state
  const [role, setRole] = useState('UI/UX Designer');
  const [experience, setExperience] = useState<ExperienceLevel>('MID');
  const [location, setLocation] = useState('United States');
  const [currentRate, setCurrentRate] = useState('');
  const [rateLoading, setRateLoading] = useState(false);
  const [rateResult, setRateResult] = useState<RateAnalysisResult | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  // Project Estimator state
  const [projectDesc, setProjectDesc] = useState('');
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateResult, setEstimateResult] = useState<ProjectEstimateResult | null>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  // Pricing Insights state
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insights, setInsights] = useState<PricingInsight[]>([]);
  const [insightsError, setInsightsError] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const ROLES = [
    'UI/UX Designer', 'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
    'Content Writer', 'Copywriter', 'Brand Designer', 'Motion Designer',
    'Video Editor', 'Social Media Manager',
  ];

  const LOCATIONS = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'Netherlands', 'Remote (Global)', 'Nigeria', 'India', 'Eastern Europe',
    'Southeast Asia', 'Latin America',
  ];

  const EXPERIENCE_LABELS: Record<ExperienceLevel, { label: string; sub: string }> = {
    JUNIOR: { label: 'Junior', sub: '0–2 yrs' },
    MID:    { label: 'Mid',    sub: '2–5 yrs' },
    SENIOR: { label: 'Senior', sub: '5–10 yrs' },
    EXPERT: { label: 'Expert', sub: '10+ yrs' },
  };

  const handleAnalyzeRate = async () => {
    const selectedExperienceLevel = EXPERIENCE_LABELS[experience].label;
    const mappedLevel = EXPERIENCE_MAP[selectedExperienceLevel];
    if (!role || !mappedLevel) return;

    setRateLoading(true);
    setRateError(null);
    setRateResult(null);

    try {
      const parsedRate = Number(currentRate);
      if (!currentRate || isNaN(parsedRate) || parsedRate <= 0) {
        setRateError('Please enter your current rate to get a personalized analysis.');
        setRateLoading(false);
        return;
      }

      const mappedCategory = ROLE_TO_CATEGORY_MAP[role] ?? role;

      const payload: Record<string, unknown> = {
        category: mappedCategory,
        experienceLevel: mappedLevel,
        rate: parsedRate,
      };

      const res = await api.post('/pricing/analyze-rate', payload);
      const data = res.data?.data ?? res.data;
      const raw = data?.analysis ?? data;
      if (!raw) return;

      const normalized: RateAnalysisResult = {
        isUndercharging:   raw.isUndercharging ?? false,
        percentBelow:      Number(raw.percentBelow ?? 0),
        potentialIncrease: Number(raw.potentialAnnualIncrease ?? raw.potentialIncrease ?? 0),
        confidence:        Number(raw.confidence ?? 0),
        marketMin:         Number(raw.marketMin ?? 0),
        marketMax:         Number(raw.marketMax ?? 0),
        marketMedian:      Number(raw.marketMedian ?? raw.marketAverage ?? 0),
        suggestedRate:     Number(raw.suggestedRate ?? raw.recommendedRate ?? raw.marketMedian ?? 0),
        message:           raw.message ?? raw.alert ?? '',
        category:          raw.category ?? '',
        experienceLevel:   raw.experienceLevel ?? '',
      };

      setRateResult(normalized);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Analysis failed. Please try again.';
      setRateError(message);
    } finally {
      setRateLoading(false);
    }
  };

  const handleEstimateProject = async () => {
    if (!projectDesc || projectDesc.trim().length < 10) return;

    setEstimateLoading(true);
    setEstimateError(null);
    setEstimateResult(null);

    try {
      const res = await api.post('/pricing/estimate-project', {
        description: projectDesc.trim(),
        projectType: 'FIXED',
      });
      const data = res.data?.data ?? res.data;
      const raw = data?.estimate ?? data;
      if (!raw) return;

      console.log('[ProjectEstimate raw response]', raw);

      const normalized: ProjectEstimateResult = {
        recommendedPrice:
          Number(raw.recommendedPrice ?? raw.recommended ?? raw.recommendedRate
            ?? raw.price ?? raw.midEstimate ?? 0),
        minEstimate:
          Number(raw.minEstimate ?? raw.min ?? raw.minPrice ?? raw.low ?? 0),
        maxEstimate:
          Number(raw.maxEstimate ?? raw.max ?? raw.maxPrice ?? raw.high ?? 0),
        rationale:
          raw.rationale ?? raw.reasoning ?? raw.explanation ?? raw.description ?? '',
        projectType: raw.projectType ?? 'FIXED',
        breakdown: Array.isArray(raw.breakdown)
          ? raw.breakdown.map((item: Record<string, unknown>) => ({
              task:
                String(item.task ?? item.label ?? item.name ?? item.phase ?? ''),
              hours: item.hours != null ? Number(item.hours) : undefined,
              rate: item.rate != null ? Number(item.rate) : undefined,
              amount: Number(item.amount ?? item.total ?? item.cost ?? 0),
            }))
          : undefined,
      };

      setEstimateResult(normalized);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Estimation failed. Please try again.';
      setEstimateError(message);
    } finally {
      setEstimateLoading(false);
    }
  };

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(false);
    try {
      const res = await api.get('/pricing/insights');
      const data = res.data?.data ?? res.data;
      setInsights(data?.insights ?? data ?? []);
      setIsPro(data?.isPro ?? data?.hasAccess ?? false);
    } catch (err: unknown) {
      const status =
        (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setIsPro(false);
      } else {
        setInsightsError(true);
      }
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-8 py-10 shadow-lg shadow-orange-200 dark:shadow-orange-900/40">
        <div className="flex items-start justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
              </svg>
              AI Pricing Coach
            </div>
            <h1 className="text-3xl font-black text-white">Stop undercharging. Start scaling.</h1>
            <p className="mt-3 text-base text-orange-100 leading-relaxed max-w-xl">
              Most freelancers undercharge by 30–40% — not because they lack skill, but because they lack data.
              Your AI Pricing Coach analyzes market rates, estimates project value, and surfaces insights from your own numbers.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              {[
                { n: '10,000+', label: 'market data points' },
                { n: '30–40%', label: 'avg. undercharge rate' },
                { n: '$16K+', label: 'avg. annual gap' },
              ].map(stat => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white">{stat.n}</span>
                  <span className="text-sm text-orange-200">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Two column layout for Rate + Project ─────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">

        {/* ── Section 1: Rate Analyzer ───────────────────────────────────── */}
        <Card className="h-full">
          <CardBody padding="lg">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rate Analyzer</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Find out if your hourly rate matches the market</p>
            </div>

            <div className="space-y-4">
              {/* Role */}
              <div>
                <Select
                  label="Your Role"
                  value={role}
                  onChange={(v) => setRole(v)}
                  options={ROLES.map((r) => ({ value: r, label: r }))}
                  placeholder="Select role"
                />
              </div>

              {/* Experience — segmented control */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Experience Level</label>
                <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
                  {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperience(level)}
                      className={`flex flex-col items-center rounded-lg py-2 text-center transition-all duration-150 ${
                        experience === level
                          ? 'bg-white shadow-sm border border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                          : 'hover:bg-white/60'
                      }`}
                    >
                      <span className={`text-xs font-bold ${experience === level ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        {EXPERIENCE_LABELS[level].label}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{EXPERIENCE_LABELS[level].sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <Select
                  label="Location / Market"
                  value={location}
                  onChange={(v) => setLocation(v)}
                  options={LOCATIONS.map((l) => ({ value: l, label: l }))}
                  placeholder="Select location"
                />
              </div>

              {/* Current rate (optional) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Current Rate <span className="text-gray-400 font-normal dark:text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 dark:text-gray-500">$/hr</span>
                  <input
                    type="number"
                    value={currentRate}
                    onChange={e => setCurrentRate(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-12 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Enter your rate to see how you compare and your annual gap</p>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeRate}
                disabled={rateLoading}
                className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {rateLoading ? (
                  <svg className="h-5 w-5 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Analyze My Rate'}
              </button>
            </div>

            {rateError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                {rateError}
              </div>
            )}

            {rateResult && (
              <div className="mt-6 space-y-4">
                <div className={`rounded-xl border-2 p-4 ${
                  rateResult.isUndercharging
                    ? 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20'
                    : 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-950/20'
                }`}>
                  <p className={`text-sm font-semibold leading-relaxed ${
                    rateResult.isUndercharging
                      ? 'text-red-800 dark:text-red-300'
                      : 'text-green-800 dark:text-green-300'
                  }`}>
                    {rateResult.message}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Market Min</p>
                    <p className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                      ${Number(rateResult.marketMin ?? 0).toLocaleString()}/hr
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-3 text-center border-2 border-orange-200 dark:border-orange-800/50">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Suggested</p>
                    <p className="mt-1 text-lg font-black text-orange-600 dark:text-orange-400">
                      ${Number(rateResult.suggestedRate ?? 0).toLocaleString()}/hr
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Market Max</p>
                    <p className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                      ${Number(rateResult.marketMax ?? 0).toLocaleString()}/hr
                    </p>
                  </div>
                </div>

                {rateResult.isUndercharging && rateResult.potentialIncrease > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4">
                    <div>
                      <p className="text-xs font-bold text-orange-100 uppercase tracking-wider">
                        Annual Income Gap
                      </p>
                      <p className="mt-0.5 text-2xl font-black text-white">
                        +${Number(rateResult.potentialIncrease ?? 0).toLocaleString()}/year
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Data confidence</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {rateResult.confidence >= 90
                      ? 'Very High'
                      : rateResult.confidence >= 70
                      ? 'High'
                      : rateResult.confidence >= 50
                      ? 'Medium'
                      : 'Low'}{' '}
                    ({rateResult.confidence}%)
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Section 2: Project Estimator ───────────────────────────────── */}
        <Card className="h-full">
          <CardBody padding="lg">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Estimator</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Describe your project and get a market-aligned price estimate</p>
            </div>

            <div className="space-y-4">
              {/* Project description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Describe the Project</label>
                <textarea
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  placeholder="e.g. Brand identity for a fintech startup — logo, color system, typography, and brand guidelines doc. Client needs files by end of March."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">More detail = more accurate estimate. Include deliverables, timeline, and complexity.</p>
              </div>

              {/* Quick prompt chips */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400 dark:text-gray-500">Quick examples:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Brand identity',
                    'Website redesign',
                    'Mobile app design',
                    'Content writing',
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setProjectDesc(chip)}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {!estimateResult && !estimateLoading && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">How it works</p>
                  <ul className="space-y-1.5">
                    {[
                      'Describe your deliverables and timeline',
                      'We analyze complexity and market rates',
                      'Get a Conservative / Recommended / Premium range',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={handleEstimateProject}
                disabled={estimateLoading || !projectDesc || projectDesc.trim().length < 10}
                className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {estimateLoading ? (
                  <svg className="h-5 w-5 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Estimate Project Value'}
              </button>
              {!projectDesc.trim() && !estimateLoading && (
                <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                  Enter a project description above to unlock
                </p>
              )}
            </div>

            {estimateError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                {estimateError}
              </div>
            )}

            {estimateResult && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-100">
                    Recommended Price
                  </p>
                  <p className="mt-1 text-4xl font-black text-white">
                    ${Number(estimateResult.recommendedPrice ?? 0).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-orange-200">
                    Range: ${Number(estimateResult.minEstimate ?? 0).toLocaleString()} – ${Number(estimateResult.maxEstimate ?? 0).toLocaleString()}
                  </p>
                </div>

                {estimateResult.rationale && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      How we calculated this
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {estimateResult.rationale}
                    </p>
                  </div>
                )}

                {estimateResult.breakdown && estimateResult.breakdown.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Breakdown
                    </p>
                    {estimateResult.breakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2.5">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.task}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ${Number(item.amount ?? 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ── Section 3: Personalized Insights ─────────────────────────────── */}
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Pricing Insights</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Personalized analysis based on your invoices, payments, and expenses</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
            </svg>
            AI Generated
          </span>
        </div>

        <div className={`relative grid grid-cols-1 gap-4 md:grid-cols-2 rounded-2xl ${!isPro && !insightsLoading ? 'min-h-[320px]' : ''}`}>
          {insightsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            <>
              {isPro && insights.length > 0 && insights.map(insight => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardBody padding="lg">
                    <div className="flex gap-4">
                      <InsightIcon type={['warning', 'opportunity', 'positive', 'tip'].includes(insight.type) ? insight.type as InsightCard['type'] : 'tip'} />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{insight.title}</h3>
                          {insight.impact && (
                            <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                              {insight.impact}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
              {isPro && insights.length === 0 && !insightsError && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8 col-span-full">
                  No insights yet — add more invoices and expenses to unlock personalized analysis.
                </p>
              )}
            </>
          )}
          {!isPro && !insightsLoading && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-900/60 backdrop-blur-sm"
              aria-hidden
            >
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-center font-semibold text-white">
                Upgrade to Pro to unlock AI Insights
              </p>
              <button
                type="button"
                onClick={() => router.push('/subscription')}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
              >
                Upgrade to Pro →
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
