'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';

const IS_FREE_TIER = true;

// ─── Types ───────────────────────────────────────────────────────────────────

type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';

interface RateResult {
  low: number;
  mid: number;
  high: number;
  yourRate: number | null;
  currency: string;
  annualGap: number;
  recommendation: string;
  confidence: number;
}

interface ProjectResult {
  low: number;
  recommended: number;
  high: number;
  confidence: number;
  reasoning: string[];
  breakdown: { label: string; hours: number; rate: number }[];
}

interface InsightCard {
  id: string;
  type: 'warning' | 'opportunity' | 'positive' | 'tip';
  title: string;
  metric: string;
  body: string;
  action: string;
}

// ─── Mock AI Generators ───────────────────────────────────────────────────────

function generateRateResult(
  role: string,
  experience: ExperienceLevel,
  location: string,
  currentRate: string,
): RateResult {
  const basePrices: Record<string, Record<ExperienceLevel, [number, number, number]>> = {
    'UI/UX Designer':       { JUNIOR: [45,65,85],   MID: [75,95,120],   SENIOR: [110,140,175], EXPERT: [150,190,240] },
    'Frontend Developer':   { JUNIOR: [50,70,90],   MID: [80,105,130],  SENIOR: [120,155,190], EXPERT: [160,200,250] },
    'Backend Developer':    { JUNIOR: [55,75,95],   MID: [85,110,140],  SENIOR: [125,160,200], EXPERT: [165,210,260] },
    'Full-Stack Developer': { JUNIOR: [55,75,95],   MID: [90,115,145],  SENIOR: [130,165,205], EXPERT: [170,215,265] },
    'Content Writer':       { JUNIOR: [30,45,60],   MID: [50,70,90],    SENIOR: [80,105,130],  EXPERT: [110,140,175] },
    'Copywriter':           { JUNIOR: [40,55,70],   MID: [65,85,110],   SENIOR: [100,130,165], EXPERT: [140,175,220] },
    'Brand Designer':       { JUNIOR: [45,60,80],   MID: [75,98,125],   SENIOR: [115,145,180], EXPERT: [155,195,245] },
    'Motion Designer':      { JUNIOR: [50,68,88],   MID: [80,105,132],  SENIOR: [120,152,190], EXPERT: [158,198,248] },
    'Video Editor':         { JUNIOR: [35,50,65],   MID: [60,80,100],   SENIOR: [90,118,148],  EXPERT: [125,158,198] },
    'Social Media Manager': { JUNIOR: [30,42,55],   MID: [50,68,88],    SENIOR: [80,105,132],  EXPERT: [110,140,175] },
  };

  const locationMultiplier: Record<string, number> = {
    'United States': 1.0, 'United Kingdom': 0.95, 'Canada': 0.85,
    'Australia': 0.90, 'Germany': 0.88, 'Netherlands': 0.87,
    'Remote (Global)': 0.92, 'Nigeria': 0.55, 'India': 0.45,
    'Eastern Europe': 0.65, 'Southeast Asia': 0.50, 'Latin America': 0.60,
  };

  const [low, mid, high] = basePrices[role]?.[experience] ?? [60, 90, 120];
  const mult = locationMultiplier[location] ?? 0.85;
  const adjLow = Math.round(low * mult);
  const adjMid = Math.round(mid * mult);
  const adjHigh = Math.round(high * mult);
  const yourRate = currentRate ? Number(currentRate) : null;
  const annualGap = yourRate ? Math.max(0, (adjMid - yourRate) * 2000) : 0;
  const confidence = experience === 'EXPERT' ? 94 : experience === 'SENIOR' ? 91 : 87;

  let recommendation = '';
  if (!yourRate) {
    recommendation = `Based on your profile, the market supports $${adjMid}/hr for ${role}s at your level in ${location}. Aim for the mid-range to start and raise rates every 6 months.`;
  } else if (yourRate < adjLow) {
    recommendation = `You're significantly undercharging. At $${yourRate}/hr you're below the market floor. A ${role} with your experience typically charges $${adjMid}/hr. Raise your rate immediately — clients rarely leave over a $20–30/hr increase.`;
  } else if (yourRate < adjMid) {
    recommendation = `You're slightly below market. Moving from $${yourRate}/hr to $${adjMid}/hr is a realistic next step. Frame it as a rate review, not a raise. Most clients expect this annually.`;
  } else if (yourRate <= adjHigh) {
    recommendation = `You're priced well within market range. Focus on moving toward the top ($${adjHigh}/hr) by specializing further and positioning around outcomes, not hours.`;
  } else {
    recommendation = `You're above typical market rate — which means you're winning on reputation or specialization. Keep positioning around results, not time.`;
  }

  return { low: adjLow, mid: adjMid, high: adjHigh, yourRate, currency: 'USD', annualGap, recommendation, confidence };
}

function generateProjectResult(description: string): ProjectResult {
  const desc = description.toLowerCase();

  if (desc.includes('brand') || desc.includes('identity') || desc.includes('logo')) {
    return {
      low: 3500, recommended: 6500, high: 12000, confidence: 89,
      reasoning: [
        'Brand identity projects carry high strategic value — they define how a company presents itself for years.',
        'Discovery and strategy phases are often underpriced; include 8–12 hours for research and positioning.',
        'Deliverable scope (guidelines doc, file formats, usage rights) significantly affects ceiling — itemize these.',
      ],
      breakdown: [
        { label: 'Discovery & Strategy', hours: 10, rate: 120 },
        { label: 'Concept Development', hours: 16, rate: 120 },
        { label: 'Refinement & Revisions', hours: 12, rate: 120 },
        { label: 'Final Files & Guidelines', hours: 8, rate: 120 },
      ],
    };
  } else if (desc.includes('website') || desc.includes('landing') || desc.includes('web')) {
    return {
      low: 4500, recommended: 8500, high: 18000, confidence: 91,
      reasoning: [
        'Website projects are routinely underpriced because scope creep is invisible at proposal stage — charge per page, not just design.',
        'Development complexity (CMS, animations, integrations) should be scoped separately from design.',
        'Include a content strategy phase — most projects stall waiting for client copy.',
      ],
      breakdown: [
        { label: 'Strategy & Wireframes', hours: 12, rate: 130 },
        { label: 'UI Design', hours: 24, rate: 130 },
        { label: 'Development', hours: 32, rate: 130 },
        { label: 'Testing & Launch', hours: 8, rate: 130 },
      ],
    };
  } else if (desc.includes('app') || desc.includes('mobile') || desc.includes('saas')) {
    return {
      low: 8000, recommended: 18000, high: 45000, confidence: 86,
      reasoning: [
        'App and SaaS design engagements command premium rates because the work directly impacts product revenue.',
        'Insist on a discovery phase before designing — it protects you from scope creep and educates the client.',
        'Embedded design systems significantly increase value and price ceiling.',
      ],
      breakdown: [
        { label: 'Discovery & UX Research', hours: 20, rate: 150 },
        { label: 'Information Architecture', hours: 16, rate: 150 },
        { label: 'UI Design & Prototyping', hours: 48, rate: 150 },
        { label: 'Design System & Handoff', hours: 24, rate: 150 },
      ],
    };
  } else if (desc.includes('content') || desc.includes('copy') || desc.includes('writing')) {
    return {
      low: 800, recommended: 2200, high: 5000, confidence: 85,
      reasoning: [
        'Content projects are often priced per word — pivot to per-project pricing for better margins.',
        'Strategy and research phases are commonly given away free; charge for them explicitly.',
        'Cap revision rounds in the proposal — unlimited revisions silently destroy margins.',
      ],
      breakdown: [
        { label: 'Research & Strategy', hours: 6, rate: 95 },
        { label: 'First Draft', hours: 10, rate: 95 },
        { label: 'Revisions (2 rounds)', hours: 4, rate: 95 },
        { label: 'Final Delivery', hours: 2, rate: 95 },
      ],
    };
  } else {
    return {
      low: 2500, recommended: 5500, high: 10000, confidence: 82,
      reasoning: [
        'Without a specific project type, this estimate is based on a mid-complexity freelance engagement.',
        'Add more detail about deliverables, timeline, and technology to get a sharper estimate.',
        'Always anchor to deliverables and outcomes in proposals, never to hours alone.',
      ],
      breakdown: [
        { label: 'Discovery & Planning', hours: 8, rate: 110 },
        { label: 'Core Deliverable', hours: 24, rate: 110 },
        { label: 'Revisions & Refinement', hours: 10, rate: 110 },
        { label: 'Handoff & Support', hours: 6, rate: 110 },
      ],
    };
  }
}

const STATIC_INSIGHTS: InsightCard[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Your average invoice is below market',
    metric: '$1,840 avg invoice',
    body: 'Your average invoice sits at $1,840. Senior designers in comparable markets average $3,200 per engagement. Based on your invoice volume, this gap costs you an estimated $16,720 per year.',
    action: 'Review your pricing on the next 3 proposals and add a 25% uplift.',
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'You have a high-value repeat client',
    metric: 'Acme Corp — 3 invoices',
    body: 'Acme Corp has paid 3 invoices totalling $14,950. Repeat clients like this are ideal candidates for a retainer agreement — predictable income for you, priority access for them.',
    action: 'Propose a monthly retainer to Acme Corp at $3,500–$4,500/month.',
  },
  {
    id: '3',
    type: 'positive',
    title: 'Your collection rate is excellent',
    metric: '94% collected',
    body: 'You\'ve collected 94% of invoiced revenue. The industry average for freelancers is 78%. Your payment terms and follow-up process is working — protect it as you scale.',
    action: 'Keep NET 30 terms and consider requiring 50% upfront for new clients.',
  },
  {
    id: '4',
    type: 'tip',
    title: 'Software is your biggest deductible category',
    metric: '$935 in software',
    body: 'You\'ve spent $935 on software tools this year — all tax deductible. Make sure you\'re also tracking subscriptions paid on personal cards. Many freelancers miss 20–30% of deductible software spend.',
    action: 'Audit your personal card statements for any business software purchases.',
  },
];

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
  const [rateResult, setRateResult] = useState<RateResult | null>(null);

  // Project Estimator state
  const [projectDesc, setProjectDesc] = useState('');
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectResult, setProjectResult] = useState<ProjectResult | null>(null);

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

  const handleRateAnalyze = async () => {
    setRateLoading(true);
    setRateResult(null);
    await new Promise(r => setTimeout(r, 1800));
    setRateResult(generateRateResult(role, experience, location, currentRate));
    setRateLoading(false);
  };

  const handleProjectEstimate = async () => {
    if (!projectDesc.trim()) return;
    setProjectLoading(true);
    setProjectResult(null);
    await new Promise(r => setTimeout(r, 2000));
    setProjectResult(generateProjectResult(projectDesc));
    setProjectLoading(false);
  };

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
                onClick={handleRateAnalyze}
                disabled={rateLoading}
                className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {rateLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing market data...
                  </span>
                ) : 'Analyze My Rate'}
              </button>
            </div>

            {/* Rate Results */}
            {rateLoading && <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6"><RateResultSkeleton /></div>}

            {rateResult && !rateLoading && (
              <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Market Rate Analysis</h3>
                  <ConfidencePill score={rateResult.confidence} />
                </div>

                {/* Rate range bar */}
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>Low <span className="font-semibold text-gray-600 dark:text-gray-300">${rateResult.low}/hr</span></span>
                    <span>Mid <span className="font-semibold text-gray-600 dark:text-gray-300">${rateResult.mid}/hr</span></span>
                    <span>High <span className="font-semibold text-gray-600 dark:text-gray-300">${rateResult.high}/hr</span></span>
                  </div>

                  {(() => {
                    const contextMax = rateResult.high * 1.4;
                    const lowPct = (rateResult.low / contextMax) * 100;
                    const highPct = (rateResult.high / contextMax) * 100;
                    const yourPct = rateResult.yourRate
                      ? Math.min(100, (rateResult.yourRate / contextMax) * 100)
                      : null;

                    return (
                      <div className="relative h-3 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                        {/* Market range band — only occupies the portion where market rates actually live */}
                        <div
                          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-orange-300 to-orange-500"
                          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
                        />
                        {/* Your rate marker */}
                        {yourPct !== null && (
                          <div
                            className="absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-600 bg-white shadow-md"
                            style={{ left: `${yourPct}%` }}
                            title={`Your rate: $${rateResult.yourRate}/hr`}
                          />
                        )}
                      </div>
                    );
                  })()}

                  {rateResult.yourRate && (
                    <p className="mt-1.5 text-center text-xs text-gray-500 dark:text-gray-400">
                      Your rate: <span className="font-bold text-gray-800 dark:text-white">${rateResult.yourRate}/hr</span>
                      {' · '}
                      <span className="text-gray-500 dark:text-gray-400">Market range: ${rateResult.low}–${rateResult.high}/hr</span>
                    </p>
                  )}
                </div>

                {/* Annual gap */}
                {rateResult.annualGap > 0 && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 dark:bg-red-950/30 dark:border-red-900/40">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600">Estimated Annual Gap</p>
                    <p className="mt-1 text-2xl font-black text-red-700">{formatCurrency(rateResult.annualGap)}</p>
                    <p className="mt-0.5 text-xs text-red-500">left on the table per year vs. market mid-rate</p>
                  </div>
                )}

                {/* Recommendation */}
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 dark:bg-orange-950/30 dark:border-orange-900/40">
                  <div className="mb-2 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
                    </svg>
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">AI Recommendation</p>
                  </div>
                  <p className="text-sm text-orange-900 leading-relaxed">{rateResult.recommendation}</p>
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

              {!projectResult && !projectLoading && (
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
                onClick={handleProjectEstimate}
                disabled={projectLoading || !projectDesc.trim()}
                className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {projectLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Estimating project value...
                  </span>
                ) : 'Estimate Project Value'}
              </button>
              {!projectDesc.trim() && !projectLoading && (
                <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                  Enter a project description above to unlock
                </p>
              )}
            </div>

            {/* Project Results */}
            {projectLoading && <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6"><RateResultSkeleton /></div>}

            {projectResult && !projectLoading && (
              <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Project Estimate</h3>
                  <ConfidencePill score={projectResult.confidence} />
                </div>

                {/* Price range */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                    <p className="text-xs text-gray-400 font-medium dark:text-gray-500">Conservative</p>
                    <p className="mt-1 text-lg font-black text-gray-600 dark:text-gray-300">{formatCurrency(projectResult.low)}</p>
                  </div>
                  <div className="rounded-xl bg-orange-50 border-2 border-orange-200 p-3 text-center">
                    <p className="text-xs text-orange-600 font-bold">Recommended</p>
                    <p className="mt-1 text-lg font-black text-orange-700">{formatCurrency(projectResult.recommended)}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                    <p className="text-xs text-gray-400 font-medium dark:text-gray-500">Premium</p>
                    <p className="mt-1 text-lg font-black text-gray-600 dark:text-gray-300">{formatCurrency(projectResult.high)}</p>
                  </div>
                </div>

                {/* Hour breakdown */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide dark:text-gray-400">Suggested Breakdown</p>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {projectResult.breakdown.map(item => (
                      <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-xs text-gray-400 dark:text-gray-500">{item.hours}h × ${item.rate}</span>
                          <span className="text-sm font-bold text-gray-900 w-20 text-right dark:text-white">{formatCurrency(item.hours * item.rate)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2.5">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Total Hours</span>
                      <span className="text-sm font-black text-orange-600">
                        {projectResult.breakdown.reduce((s, i) => s + i.hours, 0)}h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">
                  <div className="mb-3 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
                    </svg>
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Pricing Intelligence</p>
                  </div>
                  <ul className="space-y-2">
                    {projectResult.reasoning.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-orange-900 leading-relaxed">
                        <span className="mt-0.5 shrink-0 text-orange-400">→</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
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

        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 rounded-2xl">
          {STATIC_INSIGHTS.map(insight => (
            <Card key={insight.id} className="hover:shadow-md transition-shadow duration-200">
              <CardBody padding="lg">
                <div className="flex gap-4">
                  <InsightIcon type={insight.type} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{insight.title}</h3>
                    </div>
                    <p className="mb-2 text-lg font-black text-gray-900 dark:text-white">{insight.metric}</p>
                    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{insight.body}</p>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 dark:bg-gray-800 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5 dark:text-gray-500">Recommended Action</p>
                      <p className="text-xs font-semibold text-gray-700 leading-relaxed dark:text-gray-200">{insight.action}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          {IS_FREE_TIER && (
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
