// Novba Landing Page v2 — all polish fixes applied
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ─── FLOATING INVOICE CARDS DATA ─────────────────────────────────────────────

const FLOATING_CARDS = [
  {
    client: 'Acme Corp',
    amount: '$4,200',
    status: 'paid' as const,
    x: 6,
    y: 18,
    rot: -8,
    delay: 0,
  },
  {
    client: 'TechStart',
    amount: '$8,500',
    status: 'pending' as const,
    x: 74,
    y: 12,
    rot: 6,
    delay: 1.2,
  },
  {
    client: 'Growth Labs',
    amount: '$3,100',
    status: 'paid' as const,
    x: 2,
    y: 58,
    rot: -4,
    delay: 2.1,
  },
  {
    client: 'Nova Co',
    amount: '$12,800',
    status: 'paid' as const,
    x: 78,
    y: 52,
    rot: 5,
    delay: 0.6,
  },
  {
    client: 'Spark Studio',
    amount: '$2,400',
    status: 'pending' as const,
    x: 44,
    y: 80,
    rot: -2,
    delay: 3.0,
  },
];

const PAIN_PHRASES = [
  'Just sent my 3rd follow-up email this week',
  'Quoted $60/hr and client said yes immediately',
  'Invoice #47 is 30 days overdue',
  'Am I even charging enough?',
  'FreshBooks raised prices again mid-year',
  'Another "can we do a quick call" — 2 hours gone',
  'Client wants unlimited revisions for $500',
  "My rate hasn't changed since 2021",
  'Chasing payments is humiliating',
  'The market rate is $120/hr??',
  'I should have charged more',
  '45-day payment terms. Again.',
];

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className='fixed top-0 z-50 w-full transition-all duration-500'
      style={{
        background: scrolled ? 'rgba(8,8,8,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
        <span className='text-xl font-black tracking-tight text-white'>
          <span className='text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]'>
            nov
          </span>
          <span className='text-orange-500'>ba</span>
        </span>
        <div className='flex items-center gap-5'>
          <Link
            href='/login'
            className='text-sm font-medium text-white/40 transition-colors hover:text-white'
          >
            Login
          </Link>
          <Link
            href='/signup'
            className='rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-orange-400 active:scale-95'
          >
            Get early access
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── FLOATING INVOICE CARD ────────────────────────────────────────────────────

function FloatingCard({
  client,
  amount,
  status,
  x,
  y,
  rot,
  delay,
}: {
  client: string;
  amount: string;
  status: 'paid' | 'pending';
  x: number;
  y: number;
  rot: number;
  delay: number;
}) {
  return (
    <motion.div
      className='pointer-events-none absolute select-none'
      style={{ left: `${x}%`, top: `${y}%`, rotate: rot }}
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: [0, 0.75, 0.75, 0],
        y: [40, 0, -20, -50],
      }}
      transition={{
        duration: 10,
        delay,
        repeat: Infinity,
        repeatDelay: 6,
        ease: 'easeInOut',
      }}
    >
      <div
        className='w-44 rounded-2xl p-4 shadow-2xl'
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className='mb-3 flex items-center justify-between'>
          <div
            className='flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-orange-400'
            style={{ background: 'rgba(249,115,22,0.15)' }}
          >
            {client[0]}
          </div>
          <span
            className='rounded-full px-2 py-0.5 text-[10px] font-bold'
            style={{
              background:
                status === 'paid'
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(249,115,22,0.12)',
              color: status === 'paid' ? 'rgb(74,222,128)' : 'rgb(251,146,60)',
            }}
          >
            {status === 'paid' ? '✓ Paid' : 'Pending'}
          </span>
        </div>
        <p className='mb-0.5 text-xs text-white/30'>{client}</p>
        <p className='text-xl font-black text-white'>{amount}</p>
      </div>
    </motion.div>
  );
}

// ─── PAIN MARQUEE ─────────────────────────────────────────────────────────────

function PainMarquee() {
  const doubled = [...PAIN_PHRASES, ...PAIN_PHRASES];
  return (
    <div
      className='overflow-hidden py-5'
      style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.015)',
      }}
    >
      <motion.div
        className='flex gap-0 whitespace-nowrap'
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((phrase, i) => (
          <span key={i} className='flex shrink-0 items-center gap-10 pr-10'>
            <span className='text-sm text-white/25'>{phrase}</span>
            <span className='text-orange-500/30'>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── EMAIL CAPTURE ────────────────────────────────────────────────────────────

function EmailCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='flex items-center gap-3 rounded-2xl px-5 py-3'
        style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.15)',
        }}
      >
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-green-500'>
          <svg
            className='h-4 w-4 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <div>
          <p className='text-sm font-bold text-white'>
            You&apos;re on the list.
          </p>
          <p className='text-xs text-white/40'>
            We&apos;ll reach out when it&apos;s your turn.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setSubmitted(true);
      }}
      className='flex w-full max-w-sm gap-2'
    >
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='your@email.com'
        className='flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none'
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid rgba(249,115,22,0.4)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
        }}
      />
      <button
        type='submit'
        className='rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-orange-400 active:scale-95'
      >
        Join →
      </button>
    </form>
  );
}

// ─── AI RATE REVEAL ───────────────────────────────────────────────────────────

function AIRateReveal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-120px' });
  const [displayRate, setDisplayRate] = useState(45);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => {
      const target = 85;
      const steps = 80;
      const duration = 2200;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const p = step / steps;
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplayRate(Math.round(45 + (target - 45) * eased));
        if (step >= steps) {
          clearInterval(interval);
          setPhase(2);
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isInView]);

  return (
    <div
      ref={ref}
      className='flex flex-col items-center justify-center text-center'
    >
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className='mb-4 text-xs uppercase tracking-[0.35em] text-white/25'
      >
        AI Market Analysis
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView && phase >= 1 ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
        className='mb-2 text-sm text-white/30'
      >
        Your market rate is
      </motion.p>

      <div className='flex items-start'>
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.35 } : {}}
          transition={{ delay: 0.5 }}
          className='mt-3 text-4xl font-black text-white lg:mt-6 lg:text-6xl'
        >
          $
        </motion.span>
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{
            delay: 0.5,
            type: 'spring',
            stiffness: 150,
            damping: 15,
          }}
          className='font-black text-white'
          style={{ fontSize: 'clamp(80px, 15vw, 160px)', lineHeight: 1 }}
        >
          {displayRate}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.35 } : {}}
          transition={{ delay: 0.7 }}
          className='mt-4 text-2xl font-bold text-white lg:mt-8 lg:text-4xl'
        >
          /hr
        </motion.span>
      </div>

      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='mt-6 space-y-2'
          >
            <p className='text-base text-white/35'>
              You&apos;ve been charging{' '}
              <span className='font-bold text-white/50 line-through'>
                $45/hr
              </span>
            </p>
            <p className='text-lg font-bold text-orange-400'>
              That&apos;s $83,200 left on the table this year.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LIVE INVOICE DEMO ───────────────────────────────────────────────────────

function LiveInvoiceDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 3200),
      setTimeout(() => setStep(4), 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className='relative mx-auto max-w-md'>
      {/* Main invoice */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className='overflow-hidden rounded-3xl'
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Invoice top */}
        <div
          className='px-6 py-5'
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-white/20'>
                Invoice #1024
              </p>
              <p className='mt-1 text-3xl font-black text-white'>$8,500.00</p>
            </div>
            <motion.div
              animate={
                step >= 3
                  ? {
                      background: 'rgba(34,197,94,0.12)',
                      borderColor: 'rgba(34,197,94,0.25)',
                    }
                  : {
                      background: 'rgba(249,115,22,0.1)',
                      borderColor: 'rgba(249,115,22,0.2)',
                    }
              }
              transition={{ duration: 0.5 }}
              className='rounded-xl border px-4 py-2'
            >
              <motion.p
                animate={
                  step >= 3
                    ? { color: 'rgb(74,222,128)' }
                    : { color: 'rgb(251,146,60)' }
                }
                transition={{ duration: 0.5 }}
                className='text-sm font-bold'
              >
                {step >= 3 ? '✓  Paid' : 'Pending'}
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Billed to */}
        <div
          className='px-6 py-4'
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className='mb-1 text-xs text-white/20'>Billed to</p>
          <p className='font-semibold text-white'>TechStart Inc</p>
          <p className='text-sm text-white/35'>accounts@techstart.io</p>
        </div>

        {/* Line items */}
        <div className='space-y-4 px-6 py-5'>
          {[
            { item: 'UI/UX Design', qty: '40 hrs', price: '$5,000' },
            { item: 'Prototype & Testing', qty: '20 hrs', price: '$2,500' },
            { item: 'Final Delivery', qty: '8 hrs', price: '$1,000' },
          ].map((line, i) => (
            <motion.div
              key={line.item}
              initial={{ opacity: 0, x: -12 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.15, duration: 0.4 }}
              className='flex items-center justify-between'
            >
              <div>
                <p className='text-sm font-medium text-white/75'>{line.item}</p>
                <p className='text-xs text-white/25'>{line.qty}</p>
              </div>
              <p className='text-sm font-bold text-white'>{line.price}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Auto-reminder notification */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className='absolute -right-4 -top-4 w-56 rounded-2xl p-3'
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className='flex items-start gap-2.5'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500'>
                <svg
                  className='h-3 w-3 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2.5}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <p className='text-xs font-bold text-blue-300'>Reminder sent</p>
                <p className='text-[11px] leading-relaxed text-blue-300/50'>
                  Novba followed up on your behalf · just now
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revenue update */}
      <AnimatePresence>
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className='absolute -bottom-5 -left-4 w-48 rounded-2xl p-4'
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.15)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className='text-xs text-green-400/50'>Revenue · This month</p>
            <p className='text-2xl font-black text-green-400'>$24,850</p>
            <p className='text-[11px] text-green-500/40'>↑ 34% vs last month</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── STAT TICKER ─────────────────────────────────────────────────────────────

function StatTicker({
  value,
  label,
  prefix = '',
}: {
  value: string;
  label: string;
  prefix?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className='text-center'
    >
      <p className='text-4xl font-black text-white lg:text-5xl'>
        {prefix}
        {value}
      </p>
      <p className='mt-1 text-sm text-white/30'>{label}</p>
    </motion.div>
  );
}

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className='min-h-screen min-h-[100dvh] text-white bg-[#080808]'
      style={{ overscrollBehavior: 'none' }}
    >
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32'>
        {/* Warm ambient background */}
        <div className='absolute inset-0 pointer-events-none'>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.09), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 40% 40% at 15% 85%, rgba(249,115,22,0.06), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 30% 30% at 85% 15%, rgba(249,115,22,0.04), transparent)',
            }}
          />
          {/* Subtle grain */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.025,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating invoice cards */}
        {FLOATING_CARDS.map((card, i) => (
          <FloatingCard key={i} {...card} />
        ))}

        {/* Hero content */}
        <div className='relative z-10 max-w-5xl text-center'>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='mb-8 inline-flex items-center gap-2.5 rounded-full px-5 py-2'
            style={{
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.2)',
            }}
          >
            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500' />
            <span className='text-xs font-semibold text-orange-400'>
              Early Access · First 100 users get lifetime free
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className='mb-7 font-black leading-[0.92] tracking-tight'
            style={{ fontSize: 'clamp(52px, 9vw, 120px)' }}
          >
            The platform
            <br />
            that pays you{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              what
            </span>
            <br />
            you&apos;re worth.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className='mx-auto mb-10 max-w-lg text-lg leading-relaxed text-white/35'
          >
            AI-powered pricing insights, automated payment reminders, and a
            portfolio that wins clients — built exclusively for freelancers who
            are done undercharging.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='flex flex-col items-center gap-3'
          >
            <EmailCapture />
            <p className='text-xs text-white/20'>
              Free during beta. No credit card. No nonsense.
            </p>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2'
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <p className='text-[10px] uppercase tracking-[0.35em] text-white/15'>
            Scroll
          </p>
          <div
            className='h-10 w-[1px]'
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
            }}
          />
        </motion.div>
      </section>

      {/* ── PAIN MARQUEE ────────────────────────────────────────────────────── */}
      <PainMarquee />

      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <div
        className='px-6 py-16'
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className='mx-auto grid max-w-4xl grid-cols-3 gap-8'>
          <StatTicker value='39%' label='avg. freelancer undercharging rate' />
          <StatTicker
            value='83k'
            label='extra/year at market rate'
            prefix='$'
          />
          <StatTicker value='94%' label='on-time payment rate w/ reminders' />
        </div>
      </div>

      {/* ── AI RATE SECTION ─────────────────────────────────────────────────── */}
      <section className='px-6 py-28 lg:py-36'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid items-center gap-16 lg:grid-cols-2'>
            {/* Left copy */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className='mb-4 text-xs font-bold uppercase tracking-[0.35em] text-orange-500/60'
              >
                AI Pricing Intelligence
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className='mb-5 font-black leading-[0.95] tracking-tight text-white'
                style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}
              >
                Stop guessing.
                <br />
                <span className='text-white/20'>Start commanding.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className='mb-8 text-lg leading-relaxed text-white/35'
              >
                Our AI studies your skills, years of experience, location, and
                thousands of current market data points to tell you exactly what
                rate the market will pay for your work. No more hoping. No more
                guessing.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className='rounded-2xl p-4'
                style={{
                  background: 'rgba(249,115,22,0.06)',
                  border: '1px solid rgba(249,115,22,0.1)',
                }}
              >
                <p className='text-sm text-white/40'>
                  💡 Freelancers using AI Pricing earn{' '}
                  <span className='font-bold text-white/70'>30–40% more</span>{' '}
                  within 90 days of switching.
                </p>
              </motion.div>
            </div>

            {/* Right: dramatic rate reveal */}
            <AIRateReveal />
          </div>
        </div>
      </section>

      {/* ── LIVE INVOICE SECTION ────────────────────────────────────────────── */}
      <section
        className='px-6 py-28 lg:py-36'
        style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(255,255,255,0.015)',
        }}
      >
        <div className='mx-auto max-w-7xl'>
          <div className='grid items-center gap-20 lg:grid-cols-2'>
            {/* Left: live invoice */}
            <LiveInvoiceDemo />

            {/* Right: copy */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className='mb-4 text-xs font-bold uppercase tracking-[0.35em] text-orange-500/60'
              >
                Automated Reminders
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className='mb-5 font-black leading-[0.95] tracking-tight text-white'
                style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}
              >
                Payments find
                <br />
                <span className='text-white/20'>their own way home.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className='mb-8 text-lg leading-relaxed text-white/35'
              >
                Set your reminder cadence once. Novba sends professional,
                on-brand follow-ups at exactly the right moment. You focus on
                the work. We handle the awkward part.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className='rounded-2xl p-4'
                style={{
                  background: 'rgba(34,197,94,0.05)',
                  border: '1px solid rgba(34,197,94,0.1)',
                }}
              >
                <p className='text-sm text-white/40'>
                  📈{' '}
                  <span className='font-bold text-white/70'>
                    94% of invoices
                  </span>{' '}
                  get paid on time when using automated reminders.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO SECTION ───────────────────────────────────────────────── */}
      <section className='px-6 py-28 lg:py-36'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid items-center gap-16 lg:grid-cols-2'>
            {/* Left: copy */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className='mb-4 text-xs font-bold uppercase tracking-[0.35em] text-orange-500/60'
              >
                Public Portfolio
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className='mb-5 font-black leading-[0.95] tracking-tight text-white'
                style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}
              >
                Your work speaks.
                <br />
                <span className='text-white/20'>Give it a stage.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className='mb-8 text-lg leading-relaxed text-white/35'
              >
                Every Novba account includes a beautiful public portfolio at
                novba.app/p/your-name. Add it to your email signature. Share it
                in proposals. Win clients who already trust you before the first
                call.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className='rounded-2xl p-4'
                style={{
                  background: 'rgba(168,85,247,0.05)',
                  border: '1px solid rgba(168,85,247,0.1)',
                }}
              >
                <p className='text-sm text-white/40'>
                  🚀 Goes live in{' '}
                  <span className='font-bold text-white/70'>
                    under 2 minutes
                  </span>
                  . No design skills needed.
                </p>
              </motion.div>
            </div>

            {/* Right: portfolio mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='overflow-hidden rounded-3xl'
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Profile header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #111111, #0a0a0a)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
                className='px-6 py-5'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-white'>
                    S
                  </div>
                  <div>
                    <p className='font-bold text-white'>Stephen Okafor</p>
                    <p className='text-xs text-white/30'>
                      UI/UX Designer · Lagos, Nigeria
                    </p>
                  </div>
                  <span
                    className='ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-green-400'
                    style={{
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.15)',
                    }}
                  >
                    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-green-400' />
                    Available
                  </span>
                </div>
                <p className='mt-3 text-xs text-white/20'>
                  novba.app/p/stephen-okafor
                </p>
              </div>

              {/* Projects */}
              <div className='space-y-3 p-5'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-white/20'>
                  Projects
                </p>
                {[
                  {
                    title: 'Fintech Dashboard',
                    type: 'UI/UX Design',
                    views: 142,
                    g: 'linear-gradient(135deg, #8b5cf6, #4f46e5)',
                  },
                  {
                    title: 'E-commerce App',
                    type: 'Full-Stack Dev',
                    views: 89,
                    g: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                  },
                  {
                    title: 'Brand Identity',
                    type: 'Branding',
                    views: 67,
                    g: 'linear-gradient(135deg, #f43f5e, #ec4899)',
                  },
                ].map((proj, i) => (
                  <motion.div
                    key={proj.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className='flex items-center gap-3 rounded-xl p-3'
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className='h-10 w-14 shrink-0 rounded-lg'
                      style={{ background: proj.g }}
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold text-white'>
                        {proj.title}
                      </p>
                      <p className='text-xs text-white/25'>{proj.type}</p>
                    </div>
                    <div className='flex items-center gap-1 text-xs text-white/20'>
                      <svg
                        className='h-3 w-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                      {proj.views}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section
        className='px-6 py-24'
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className='mx-auto max-w-lg text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className='mb-3 text-xs font-bold uppercase tracking-[0.35em] text-orange-500/60'>
              Pricing
            </p>
            <h2
              className='mb-3 font-black leading-tight text-white'
              style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
            >
              $0 now.
              <br />
              <span className='text-white/15'>Forever yours.</span>
            </h2>
            <p className='mb-10 text-white/25'>
              First 100 users get lifetime free access. We don&apos;t change
              prices mid-contract. That&apos;s a promise, not marketing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className='overflow-hidden rounded-3xl'
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className='px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-white'
              style={{ background: 'linear-gradient(90deg, #ea580c, #f97316)' }}
            >
              Beta · Limited Spots Available
            </div>
            <div className='p-8'>
              <div className='mb-7 flex items-end justify-center gap-2'>
                <span
                  className='font-black text-white'
                  style={{ fontSize: 80, lineHeight: 1 }}
                >
                  $0
                </span>
                <span className='mb-2 text-white/25 text-xl'>/month</span>
              </div>
              <div className='mb-8 grid grid-cols-2 gap-3 text-left text-sm'>
                {[
                  'Unlimited invoices',
                  'AI Rate Analyzer',
                  'Automated reminders',
                  'Portfolio page',
                  'Expense tracking',
                  'Proposals & contracts',
                  'Client management',
                  'Payment tracking',
                ].map((f) => (
                  <div
                    key={f}
                    className='flex items-center gap-2 text-white/40'
                  >
                    <span className='text-orange-500'>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href='/signup'
                className='block w-full rounded-2xl py-4 text-center text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]'
                style={{
                  background: 'linear-gradient(135deg, #ea580c, #f97316)',
                }}
              >
                Claim your free account →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section
        className='relative overflow-hidden px-6 py-36'
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {/* Warm glow */}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(249,115,22,0.08), transparent)',
          }}
        />
        <div className='relative mx-auto max-w-4xl text-center'>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className='mb-6 font-black leading-[0.92] tracking-tight text-white'
              style={{ fontSize: 'clamp(48px, 8vw, 100px)' }}
            >
              You&apos;ve built
              <br />
              something real.
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Get paid for it.
              </span>
            </h2>
            <p className='mb-10 text-xl text-white/25'>
              Join freelancers who stopped undercharging and started scaling.
            </p>
            <div className='flex justify-center'>
              <EmailCapture />
            </div>
            <p className='mt-4 text-xs text-white/15'>
              Free during beta · No credit card · Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        className='px-6 py-10'
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row'>
          <span className='text-lg font-black text-white'>
            nov<span className='text-orange-500'>ba</span>
          </span>
          <div className='flex flex-wrap items-center justify-center gap-6 text-sm text-white/40'>
            <Link
              href='/login'
              className='transition-colors hover:text-white/60'
            >
              Login
            </Link>
            <Link
              href='/signup'
              className='transition-colors hover:text-white/60'
            >
              Get Started
            </Link>
            <a
              href='mailto:hello@novba.com'
              className='transition-colors hover:text-white/60'
            >
              Contact
            </a>
            <span className='text-white/20'>·</span>
            <Link href='/privacy' className='transition-colors hover:text-white/60'>
              Privacy
            </Link>
            <Link href='/terms' className='transition-colors hover:text-white/60'>
              Terms
            </Link>
          </div>
          <p className='text-sm text-white/30'>
            © 2026 Novba. Built for freelancers.
          </p>
        </div>
      </footer>
    </div>
  );
}
