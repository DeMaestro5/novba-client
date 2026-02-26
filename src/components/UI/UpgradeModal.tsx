'use client';

import { useRouter } from 'next/navigation';
import Modal from '@/components/UI/Modal';
import Button from '@/components/UI/Button';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  used: number;
  limit: number;
  description?: string;
}

const LEFT_FEATURES = [
  { key: 'unlimited-feature', getLabel: (feature: string) => `Unlimited ${feature}` },
  { key: 'clients-proposals', getLabel: () => 'Unlimited clients & proposals' },
  { key: 'ai-insights', getLabel: () => 'AI pricing insights' },
  { key: 'stripe', getLabel: () => 'Stripe payments' },
  { key: 'branding', getLabel: () => 'Custom branding & white-label' },
];

function CheckCircleIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 p-1">
      <svg className="h-3 w-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

export default function UpgradeModal({
  isOpen,
  onClose,
  feature,
  used,
  limit,
  description,
}: UpgradeModalProps) {
  const router = useRouter();

  const defaultDescription = `Upgrade to Pro for unlimited ${feature}, AI pricing insights, Stripe payments, and more.`;
  const _message = description ?? defaultDescription;

  const handleUpgrade = () => {
    router.push('/subscription');
    onClose();
  };

  const usagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-none dark:bg-transparent"
    >
      <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl shadow-2xl lg:flex-row">
        {/* LEFT PANEL — always dark */}
        <div className="flex w-full flex-col bg-gray-900 py-6 px-8 dark:bg-gray-950 lg:w-[40%] lg:p-8">
          <span className="mb-6 inline-block w-fit rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400">
            PRO PLAN
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-white">$29</span>
            <span className="text-lg text-white/50">/mo</span>
          </div>
          <p className="mt-1 text-xs text-white/40">or $22/mo billed annually</p>
          <div className="my-6 border-t border-white/10" />
          {/* Feature list — hidden on mobile */}
          <ul className="hidden flex-1 space-y-3 lg:block">
            {LEFT_FEATURES.map((item) => (
              <li key={item.key} className="flex items-center gap-2">
                <CheckCircleIcon />
                <span className="text-xs text-white/80 whitespace-nowrap">{item.getLabel(feature)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <div className="w-full rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-center text-xs text-green-400">
              14-day free trial
            </div>
            <p className="mt-1.5 text-center text-xs text-white/40">No credit card required</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative flex min-h-[420px] w-full flex-col bg-white p-8 dark:bg-gray-900 lg:w-[60%]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex min-h-0 flex-1 flex-col justify-between pt-10">
            {/* Usage bar — top */}
            <div className="mb-6">
              <div className="mb-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{feature} usage</span>
                <span>{used}/{limit}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all ${usagePct >= 100 ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>

            {/* Headline + social proof — middle */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                You&apos;ve outgrown the Free plan
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Serious freelancers need serious tools. Upgrade to Pro and never hit a wall again.
              </p>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-xs text-orange-500">★★★★★</p>
                <p className="mt-1 text-sm italic text-gray-600 dark:text-gray-400">
                  &quot;Novba Pro paid for itself in the first week.&quot;
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">— Beta tester</p>
              </div>
            </div>

            {/* CTA — bottom */}
            <div className="mt-6">
            <Button
              variant="primary"
              fullWidth
              className="rounded-xl py-3 font-bold text-white shadow-[0_4px_14px_-2px_rgba(234,88,12,0.4)] bg-orange-600 hover:bg-orange-700 border-0"
              onClick={handleUpgrade}
            >
              Upgrade to Pro →
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              Maybe later
            </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
