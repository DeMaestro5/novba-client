'use client';

import Link from 'next/link';

export interface Benefit {
  icon: React.ReactNode;
  label: string;
  description: string;
}

export interface EmptyPageStateStat {
  value: string;
  label: string;
  context: string;
}

export interface EmptyPageStateProps {
  /** Simple mode: use title + description instead of headline/subtext/benefits/preview */
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  headline?: string;
  subtext?: string;
  benefits?: Benefit[];
  ctaLabel: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  stat?: EmptyPageStateStat;
  preview?: React.ReactNode;
  secondaryLabel?: string;
  secondaryHref?: string;
}

const defaultIcon = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

export default function EmptyPageState({
  title,
  description,
  icon,
  badge,
  headline,
  subtext,
  benefits = [],
  ctaLabel,
  ctaHref,
  ctaOnClick,
  stat,
  preview,
  secondaryLabel,
  secondaryHref,
}: EmptyPageStateProps) {
  const ctaClassName =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md hover:shadow-orange-600/20 focus:outline-none w-full sm:w-auto';

  const isSimple = Boolean(title && description);
  const displayHeadline = (isSimple ? title : headline) ?? '';
  const displaySubtext = (isSimple ? description : subtext) ?? '';
  const displayIcon = icon ?? defaultIcon;
  const hasPreview = Boolean(preview && !isSimple);

  return (
    <div className='h-[calc(100vh-160px)] max-h-[740px] min-h-[560px] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-900'>
      <div className={`grid h-full grid-cols-1 ${hasPreview ? 'lg:grid-cols-2' : ''}`}>
        {/* Left column */}
        <div className='flex flex-col justify-center px-8 py-8 lg:px-10 lg:py-10'>
          {!isSimple && (
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:ring-orange-900/50'>
              <span className='flex h-5 w-5 items-center justify-center text-orange-600'>
                {displayIcon}
              </span>
            </div>
            {badge && (
              <span className='rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-400'>
                {badge}
              </span>
            )}
          </div>
          )}

          <h2 className='whitespace-pre-line text-xl font-bold leading-tight text-gray-900 dark:text-white lg:text-2xl'>
            {displayHeadline}
          </h2>

          <p className='mt-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400'>
            {displaySubtext}
          </p>

          {benefits.length > 0 && (
          <div className='mt-5 space-y-2'>
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className='flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition-colors hover:border-orange-100 hover:bg-orange-50/30 dark:border-gray-700/60 dark:bg-gray-800/50 dark:hover:border-orange-900/40 dark:hover:bg-orange-950/10'
              >
                <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700'>
                  <span className='flex h-3.5 w-3.5 items-center justify-center text-orange-600'>
                    {benefit.icon}
                  </span>
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {benefit.label}
                  </p>
                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          )}

          <div className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center'>
            {ctaHref ? (
              <Link href={ctaHref} className={ctaClassName}>
                {ctaLabel}
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>
            ) : (
              <button type='button' onClick={ctaOnClick} className={ctaClassName}>
                {ctaLabel}
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </button>
            )}
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className='text-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 sm:text-left'
              >
                {secondaryLabel} →
              </Link>
            )}
          </div>

          {stat && (
            <div className='mt-4 flex items-start gap-4 rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50/50 px-4 py-3 dark:border-orange-900/30 dark:from-orange-950/20 dark:to-amber-950/10'>
              <div>
                <span className='text-2xl font-black text-orange-600 dark:text-orange-500'>
                  {stat.value}
                </span>
              </div>
              <div>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {stat.label}
                </p>
                <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                  {stat.context}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column — preview */}
        {hasPreview && (
        <div className='relative hidden h-full items-center justify-center overflow-hidden border-l border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100/50 px-6 py-8 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-800/30 lg:flex'>
          <div className='absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-100/40 blur-3xl dark:bg-orange-900/10' />
          <div className='absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-amber-100/40 blur-3xl dark:bg-amber-900/10' />
          <div className='relative z-10 w-full'>{preview}</div>
        </div>
        )}
      </div>
    </div>
  );
}
