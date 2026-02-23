'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FormData {
  role: string;
  hourlyRate: string;
  companyName: string;
  contactName: string;
  clientEmail: string;
  description: string;
  hours: string;
  dueDate: string;
}

export interface OnboardingSliderProps {
  onComplete: () => void;
  onSendInvoice: (invoiceId: string) => void;
  userFirstName?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getDefaultDueDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
};

const ROLE_DEFAULTS: Record<string, string> = {
  designer: '85',
  developer: '95',
  writer: '65',
  consultant: '110',
};

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
// All icons are 20×20, stroke-based, consistent 1.5 stroke weight

const IconDesign = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='10' cy='10' r='3' />
    <path d='M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42' />
  </svg>
);

const IconDev = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='6 8 2 12 6 16' />
    <polyline points='14 8 18 12 14 16' />
    <line x1='11' y1='5' x2='9' y2='19' />
  </svg>
);

const IconWrite = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M14.5 2.5a2.121 2.121 0 013 3L6 17H3v-3L14.5 2.5z' />
  </svg>
);

const IconConsult = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M17 8C17 13 10 18 10 18S3 13 3 8a7 7 0 0114 0z' />
    <circle cx='10' cy='8' r='2' />
  </svg>
);

const IconOther = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='10' cy='10' r='1' />
    <circle cx='4' cy='10' r='1' />
    <circle cx='16' cy='10' r='1' />
  </svg>
);

const IconAI = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M9 2H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9' />
    <path d='M13 2l5 5-9 9H5v-4L13 2z' />
  </svg>
);

const IconReminder = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='10' cy='10' r='8' />
    <polyline points='10 6 10 10 13 13' />
  </svg>
);

const IconPortfolio = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <rect x='2' y='5' width='16' height='13' rx='2' />
    <path d='M6 5V4a2 2 0 014 0v1M7 12l2 2 4-4' />
  </svg>
);

const IconTip = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='10' cy='10' r='8' />
    <line x1='10' y1='14' x2='10' y2='10' />
    <line x1='10' y1='7' x2='10' y2='7' />
  </svg>
);

// ─── Animation config ──────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const stepTransition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };

// ─── Shared input class ────────────────────────────────────────────────────────

const inputCls =
  'border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300 rounded-xl px-4 py-3 w-full focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm';

// ─── STEP 0: Welcome ───────────────────────────────────────────────────────────

function StepWelcome({
  userFirstName,
  onNext,
}: {
  userFirstName?: string;
  onNext: () => void;
}) {
  return (
    <div className='flex flex-col items-center text-center'>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className='mb-7 text-2xl font-black tracking-tight'
      >
        <span className='text-gray-900'>nov</span>
        <span className='text-orange-500'>ba</span>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='font-black text-gray-900 mb-3 leading-tight'
        style={{ fontSize: 'clamp(26px, 4vw, 34px)' }}
      >
        Welcome{userFirstName ? `, ${userFirstName}` : ''} to Novba
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className='text-gray-500 text-base mb-8 max-w-xs leading-relaxed'
      >
        Let&apos;s get you set up in under 2 minutes. No complicated setup.
      </motion.p>

      {/* Feature pills — SVG icons, no emojis */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='flex flex-wrap justify-center gap-2 mb-9'
      >
        {[
          { icon: <IconAI />, label: 'AI Pricing Insights' },
          { icon: <IconReminder />, label: 'Automated Reminders' },
          { icon: <IconPortfolio />, label: 'Public Portfolio' },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className='inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600'
          >
            <span className='text-orange-500'>{icon}</span>
            {label}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className='w-full'
      >
        <button
          type='button'
          onClick={onNext}
          className='w-full bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white rounded-xl font-bold px-6 py-3.5 transition-all shadow-sm shadow-orange-200'
        >
          Let&apos;s go →
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='text-xs text-gray-500 mt-4'
      >
        Takes about 90 seconds. You can skip anytime.
      </motion.p>
    </div>
  );
}

// ─── STEP 1: Your Work ─────────────────────────────────────────────────────────

const ROLES = [
  { id: 'designer', label: 'Designer', icon: <IconDesign /> },
  { id: 'developer', label: 'Developer', icon: <IconDev /> },
  { id: 'writer', label: 'Writer', icon: <IconWrite /> },
  { id: 'consultant', label: 'Consultant', icon: <IconConsult /> },
  { id: 'other', label: 'Other', icon: <IconOther /> },
];

function StepWork({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const selectRole = (role: string) => {
    const rate = ROLE_DEFAULTS[role] ?? '75';
    setFormData((p) => ({ ...p, role, hourlyRate: rate }));
  };

  return (
    <div className='flex flex-col'>
      <h2 className='font-black text-gray-900 text-xl mb-1'>
        What kind of work do you do?
      </h2>
      <p className='text-gray-500 text-sm mb-6'>
        This helps us personalize your pricing insights.
      </p>

      {/* Role grid — 2 cols, Other spans full width */}
      <div className='grid grid-cols-2 gap-2.5 mb-5'>
        {ROLES.map((r) => (
          <button
            key={r.id}
            type='button'
            onClick={() => selectRole(r.id)}
            className={`
              flex items-center gap-2.5 rounded-xl p-3.5 font-semibold text-sm transition-all text-left
              ${
                formData.role === r.id
                  ? 'border-2 border-orange-500 bg-orange-50 text-orange-600 shadow-sm shadow-orange-100'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <span
              className={
                formData.role === r.id ? 'text-orange-500' : 'text-gray-400'
              }
            >
              {r.icon}
            </span>
            {r.label}
          </button>
        ))}
        <div aria-hidden='true' className='invisible' />
      </div>

      {/* Rate input — fades in after role selected */}
      <AnimatePresence>
        {formData.role && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className='mb-5'
          >
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              What&apos;s your typical hourly rate?
            </label>
            <div className='flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all'>
              <span className='px-3 py-3 bg-gray-50 text-gray-600 text-sm border-r border-gray-200 select-none'>
                $
              </span>
              <input
                type='number'
                min={0}
                step={1}
                value={formData.hourlyRate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, hourlyRate: e.target.value }))
                }
                className='flex-1 px-3 py-3 bg-white text-gray-900 text-sm focus:outline-none min-w-0'
                placeholder='85'
              />
              <span className='px-3 py-3 bg-gray-50 text-gray-600 text-sm border-l border-gray-200 select-none'>
                /hr
              </span>
            </div>

            {/* Subtle insight — shows market rate hint */}
            {formData.role && formData.role !== 'other' && (
              <p className='mt-2 text-xs text-orange-500/80'>
                Market rate for {formData.role}s: $
                {formData.role === 'designer'
                  ? '75–110'
                  : formData.role === 'developer'
                    ? '85–130'
                    : formData.role === 'writer'
                      ? '55–85'
                      : '95–150'}
                /hr — we&apos;ll refine this with AI.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type='button'
        onClick={onNext}
        disabled={!formData.role}
        className='w-full bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white rounded-xl font-bold px-6 py-3.5 transition-all shadow-sm shadow-orange-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-gray-200'
      >
        Continue →
      </button>
    </div>
  );
}

// ─── STEP 2: First Client ──────────────────────────────────────────────────────

function StepClient({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  return (
    <div className='flex flex-col'>
      <h2 className='font-black text-gray-900 text-xl mb-1'>
        Add your first client
      </h2>
      <p className='text-gray-500 text-sm mb-6'>
        The company or person you&apos;ll be invoicing.
      </p>

      <div className='space-y-4 mb-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>
            Company Name *
          </label>
          <input
            type='text'
            value={formData.companyName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, companyName: e.target.value }))
            }
            placeholder='Acme Corp'
            className={inputCls}
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>
            Contact Name{' '}
            <span className='text-gray-400 font-normal'>(optional)</span>
          </label>
          <input
            type='text'
            value={formData.contactName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, contactName: e.target.value }))
            }
            placeholder='John Smith'
            className={inputCls}
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>
            Email <span className='text-gray-400 font-normal'>(optional)</span>
          </label>
          <input
            type='email'
            value={formData.clientEmail}
            onChange={(e) =>
              setFormData((p) => ({ ...p, clientEmail: e.target.value }))
            }
            placeholder='john@acmecorp.com'
            className={inputCls}
          />
        </div>
      </div>

      {/* Info box */}
      <div className='bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 mb-6'>
        <span className='text-blue-400 mt-0.5 shrink-0'>
          <IconTip />
        </span>
        <p className='text-xs text-blue-600 leading-relaxed'>
          You can add more clients and edit these details anytime from your
          Clients page.
        </p>
      </div>

      <button
        type='button'
        onClick={onNext}
        disabled={!formData.companyName.trim()}
        className='w-full bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white rounded-xl font-bold px-6 py-3.5 transition-all shadow-sm shadow-orange-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-gray-200'
      >
        Continue →
      </button>
    </div>
  );
}

// ─── STEP 3: First Invoice ─────────────────────────────────────────────────────

function StepInvoice({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const hours = Number(formData.hours) || 0;
  const rate = Number(formData.hourlyRate) || 0;
  const total = hours * rate;
  const canContinue = formData.description.trim().length > 0 && hours > 0;

  const formattedDue = formData.dueDate
    ? new Date(formData.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const formattedTotal =
    hours > 0 && rate > 0
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(total)
      : '—';

  return (
    <div className='flex flex-col'>
      <h2 className='font-black text-gray-900 text-xl mb-1'>
        Create your first invoice
      </h2>
      <p className='text-gray-500 text-sm mb-5'>
        We&apos;ll save it as a draft — you can edit it before sending.
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* ── Inputs ── */}
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Service Description *
            </label>
            <input
              type='text'
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder='e.g. Website redesign'
              className={inputCls}
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Hours *
              </label>
              <input
                type='number'
                min={0}
                step={0.5}
                value={formData.hours}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, hours: e.target.value }))
                }
                placeholder='10'
                className={inputCls}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Rate ($/hr)
              </label>
              <input
                type='number'
                min={0}
                value={formData.hourlyRate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, hourlyRate: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Due Date
            </label>
            <input
              type='date'
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((p) => ({ ...p, dueDate: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Live Invoice Preview (desktop only) ── */}
        <div className='hidden lg:flex flex-col'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5'>
            Invoice Preview
          </p>
          <div className='bg-gray-50 border border-gray-200 rounded-2xl p-5 flex-1'>
            {/* Header */}
            <div className='flex items-start justify-between mb-3'>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-gray-600'>
                  Invoice #0001
                </p>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Due: {formattedDue}
                </p>
              </div>
              <span className='text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5'>
                Draft
              </span>
            </div>

            {/* Billed to */}
            <div className='border-t border-gray-200 pt-3 mb-3'>
<p className='text-[10px] uppercase tracking-widest text-gray-600 mb-1'>
              Billed to
              </p>
              <p className='text-sm font-semibold text-gray-900'>
                {formData.companyName || '—'}
              </p>
            </div>

            {/* Line item */}
            <div className='border-t border-gray-200 pt-3 mb-3'>
              <p className='text-sm text-gray-800'>
                {formData.description || '—'}
              </p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {formData.hours || '—'} hrs @ ${formData.hourlyRate || '—'}/hr
              </p>
            </div>

            {/* Total */}
            <div className='border-t border-gray-200 pt-3'>
              <p className='text-[10px] uppercase tracking-widest text-gray-600 mb-1'>
                Total
              </p>
              <p className='text-2xl font-black text-orange-500'>
                {formattedTotal}
              </p>
            </div>

            <p className='text-[10px] text-gray-300 text-center mt-4 tracking-wide'>
              — Powered by Novba —
            </p>
          </div>
        </div>

        {/* Mobile: Collapsed preview link */}
        <div className='lg:hidden'>
          <AnimatePresence>
            {canContinue && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className='bg-gray-50 border border-gray-200 rounded-xl p-4'
              >
                <p className='text-xs text-gray-500 mb-1'>Invoice preview</p>
                <p className='text-xl font-black text-orange-500'>
                  {formattedTotal}
                </p>
                <p className='text-xs text-gray-500'>
                  {formData.description} · {formData.hours} hrs
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        type='button'
        onClick={onNext}
        disabled={!canContinue}
        className='w-full mt-5 bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white rounded-xl font-bold px-6 py-3.5 transition-all shadow-sm shadow-orange-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-gray-200'
      >
        Create Invoice →
      </button>
    </div>
  );
}

// ─── STEP 4: All Done ──────────────────────────────────────────────────────────

function StepDone({
  formData,
  userFirstName,
  onComplete,
  onSendInvoice,
  clientId,
  invoiceId,
  apiError,
  isLoading,
  setClientId,
  setInvoiceId,
  setApiError,
  setIsLoading,
}: {
  formData: FormData;
  userFirstName?: string;
  onComplete: () => void;
  onSendInvoice: (invoiceId: string) => void;
  clientId: string | null;
  invoiceId: string | null;
  apiError: string | null;
  isLoading: boolean;
  setClientId: (id: string | null) => void;
  setInvoiceId: (id: string | null) => void;
  setApiError: (err: string | null) => void;
  setIsLoading: (v: boolean) => void;
}) {
  const hours = Number(formData.hours) || 0;
  const rate = Number(formData.hourlyRate) || 0;
  const total = hours * rate;

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total);

  const marketRate = ROLE_DEFAULTS[formData.role]
    ? Number(ROLE_DEFAULTS[formData.role])
    : null;
  const isUndercharging =
    marketRate && Number(formData.hourlyRate) < marketRate;

  // Confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#f97316', '#fb923c', '#fdba74', '#ffffff', '#fed7aa'],
    });
  }, []);

  // API calls on mount
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (clientId !== null) return;
      setIsLoading(true);
      setApiError(null);
      try {
        // TODO: Replace with: const clientRes = await fetch('/api/v1/clients', { method: 'POST', ... })
        await new Promise((r) => setTimeout(r, 1500));
        if (cancelled) return;
        const clientPayload = {
          companyName: formData.companyName,
          contactName: formData.contactName || undefined,
          email: formData.clientEmail || undefined,
        };
        console.log('POST /api/v1/clients', clientPayload);
        const mockClientId = 'client_' + Date.now();
        setClientId(mockClientId);

        // TODO: Replace with: const invoiceRes = await fetch('/api/v1/invoices', { method: 'POST', ... })
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;
        const invoicePayload = {
          clientId: mockClientId,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: formData.dueDate,
          status: 'DRAFT',
          lineItems: [
            {
              description: formData.description,
              quantity: Number(formData.hours),
              rate: Number(formData.hourlyRate),
              amount: Number(formData.hours) * Number(formData.hourlyRate),
              order: 1,
            },
          ],
        };
        console.log('POST /api/v1/invoices', invoicePayload);
        setInvoiceId('inv_' + Date.now());
      } catch {
        if (!cancelled) setApiError('Something went wrong. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeAndGo = () => {
    localStorage.setItem('novba_onboarding_completed', 'true');
    onComplete();
  };

  const handleSendInvoice = () => {
    if (invoiceId && !isLoading) {
      localStorage.setItem('novba_onboarding_completed', 'true');
      onSendInvoice(invoiceId);
    }
  };

  return (
    <div className='flex flex-col items-center text-center'>
      {/* Animated checkmark */}
      <div className='w-16 h-16 mb-6'>
        <svg viewBox='0 0 64 64' className='w-full h-full'>
          <motion.circle
            cx='32'
            cy='32'
            r='28'
            fill='none'
            stroke='#f97316'
            strokeWidth='2.5'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.path
            d='M20 32l8 8 16-16'
            fill='none'
            stroke='#f97316'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.45,
              delay: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </svg>
      </div>

      <h2 className='font-black text-2xl text-gray-900 mb-2'>
        You&apos;re all set{userFirstName ? `, ${userFirstName}` : ''}!
      </h2>
      <p className='text-gray-500 text-sm mb-6'>
        Your first invoice has been created as a draft.
      </p>

      {/* Summary */}
      <div className='bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm w-full text-left mb-5 space-y-2.5'>
        <div className='flex items-center gap-2.5 text-gray-700'>
          <span className='w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0'>
            <svg width='8' height='8' viewBox='0 0 8 8' fill='none'>
              <path
                d='M1 4l2 2 4-4'
                stroke='#16a34a'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </span>
          Client added:{' '}
          <span className='font-semibold text-gray-900'>
            {formData.companyName}
          </span>
        </div>
        <div className='flex items-center gap-2.5 text-gray-700'>
          <span className='w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0'>
            <svg width='8' height='8' viewBox='0 0 8 8' fill='none'>
              <path
                d='M1 4l2 2 4-4'
                stroke='#16a34a'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </span>
          Invoice created:{' '}
          <span className='font-semibold text-gray-900'>{formattedTotal}</span>{' '}
          for {formData.description}
        </div>
        {/* Real AI insight — not filler */}
        <div className='flex items-center gap-2.5 text-gray-700'>
          <span className='w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center shrink-0'>
            <svg width='8' height='8' viewBox='0 0 8 8' fill='none'>
              <circle cx='4' cy='4' r='2' fill='#f97316' />
            </svg>
          </span>
          {isUndercharging ? (
            <span>
              AI insight: market rate is{' '}
              <span className='font-semibold text-orange-600'>
                ${marketRate}/hr
              </span>{' '}
              — you may be undercharging
            </span>
          ) : (
            <span>
              AI Pricing Coach: your rate looks{' '}
              <span className='font-semibold text-green-600'>competitive</span>
            </span>
          )}
        </div>
      </div>

      {apiError && <p className='text-red-500 text-sm mb-3'>{apiError}</p>}

      <div className='flex flex-col gap-2.5 w-full'>
        <button
          type='button'
          onClick={handleSendInvoice}
          disabled={isLoading || !invoiceId}
          className='w-full bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white rounded-xl font-bold px-6 py-3.5 transition-all shadow-sm shadow-orange-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-gray-200 flex items-center justify-center gap-2'
        >
          {isLoading ? (
            <>
              <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin' />
              Creating your invoice…
            </>
          ) : (
            'Send Invoice Now →'
          )}
        </button>
        <p className='text-xs text-gray-400 text-center -mt-1'>
          You&apos;ll be taken to your invoice to review before sending
        </p>
        <button
          type='button'
          onClick={() => !isLoading && completeAndGo()}
          disabled={isLoading}
          className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold px-6 py-3.5 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-200'
        >
          Explore My Dashboard
        </button>
      </div>

      <p className='text-xs text-gray-500 mt-4'>
        Your invoice is saved as a draft in your Invoices tab.
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function OnboardingSlider({
  onComplete,
  onSendInvoice,
  userFirstName,
}: OnboardingSliderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [clientId, setClientId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    role: '',
    hourlyRate: '',
    companyName: '',
    contactName: '',
    clientEmail: '',
    description: '',
    hours: '',
    dueDate: getDefaultDueDateStr(),
  });

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, 4));
  }, []);

  const handleSkip = useCallback(() => {
    localStorage.setItem('novba_onboarding_completed', 'true');
    onComplete();
  }, [onComplete]);

  // Lock body scroll when onboarding is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className='flex items-center justify-center w-full'>
      {/* Card — explicitly white, no dark variants until dark mode is implemented */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className='relative bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-[580px] w-full p-8 lg:p-10 min-h-[560px]'
        style={{
          boxShadow:
            '0 32px 80px rgba(0,0,0,0.14), 0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        {/* Progress dots + skip */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-1.5'>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={
                  i === currentStep
                    ? 'h-2 w-6 rounded-full bg-orange-500'
                    : i < currentStep
                      ? 'h-2 w-2 rounded-full bg-orange-200'
                      : 'h-2 w-2 rounded-full bg-gray-200'
                }
                layout
                transition={{ duration: 0.25 }}
              />
            ))}
          </div>
          {currentStep < 4 && (
            <button
              type='button'
              onClick={handleSkip}
              className='text-gray-300 hover:text-gray-400 text-sm font-medium transition-colors'
            >
              Skip
            </button>
          )}
        </div>

        {/* Step content */}
        <AnimatePresence mode='wait' custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={stepTransition}
            className='min-h-[400px] flex flex-col'
          >
            {currentStep === 0 && (
              <StepWelcome userFirstName={userFirstName} onNext={goNext} />
            )}
            {currentStep === 1 && (
              <StepWork
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
              />
            )}
            {currentStep === 2 && (
              <StepClient
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
              />
            )}
            {currentStep === 3 && (
              <StepInvoice
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
              />
            )}
            {currentStep === 4 && (
              <StepDone
                formData={formData}
                userFirstName={userFirstName}
                onComplete={onComplete}
                onSendInvoice={onSendInvoice}
                clientId={clientId}
                invoiceId={invoiceId}
                apiError={apiError}
                isLoading={isLoading}
                setClientId={setClientId}
                setInvoiceId={setInvoiceId}
                setApiError={setApiError}
                setIsLoading={setIsLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
