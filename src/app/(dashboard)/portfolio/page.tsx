'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import Card, { CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import DropdownMenu, {
  DropdownMenuItem,
  DropdownMenuDivider,
} from '@/components/UI/DropdownMenu';
import TableActionsTrigger from '@/components/UI/TableActionsTrigger';
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/UI/Modal';
import EmptyState from '@/components/UI/EmptyState';
import { useToast } from '@/components/UI/Toast';
import UpgradeModal from '@/components/UI/UpgradeModal';
import {
  MOCK_PORTFOLIO,
  MOCK_PUBLIC_PROFILE,
  type PortfolioItem,
} from '@/lib/mock-portfolio';

const MOCK_USAGE = {
  invoices: { used: 10, limit: 10 },
  clients: { used: 3, limit: 3 },
  proposals: { used: 5, limit: 5 },
  projects: { used: 3, limit: 3 },
  portfolio: { used: 3, limit: 3 },
};
const IS_FREE_TIER = true;

function formatMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function getCoverGradient(category: string): string {
  const gradients: Record<string, string> = {
    'UI/UX Design':
      'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600',
    'Full-Stack Development':
      'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600',
    'Frontend Development':
      'bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600',
    'Backend Development':
      'bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800',
    'Brand Design':
      'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600',
    'Motion Design':
      'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
    'Web Design': 'bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600',
    'Mobile App': 'bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600',
    'Content Writing':
      'bg-gradient-to-br from-lime-500 via-green-500 to-teal-600',
    Marketing: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600',
    'Video Production':
      'bg-gradient-to-br from-red-500 via-rose-600 to-pink-700',
    Other: 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
  };
  return (
    gradients[category] ??
    'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600'
  );
}

function getCategoryIcon(category: string): React.ReactNode {
  const iconClass = 'h-14 w-14 text-white';
  if (category.includes('Design') || category.includes('UI')) {
    return (
      <svg
        className={iconClass}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1}
          d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
        />
      </svg>
    );
  }
  if (
    category.includes('Development') ||
    category.includes('Backend') ||
    category.includes('Frontend')
  ) {
    return (
      <svg
        className={iconClass}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1}
          d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
        />
      </svg>
    );
  }
  if (category.includes('Mobile')) {
    return (
      <svg
        className={iconClass}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1}
          d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
        />
      </svg>
    );
  }
  return (
    <svg
      className={iconClass}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={1}
        d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
      />
    </svg>
  );
}

export default function PortfolioPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>(MOCK_PORTFOLIO);
  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'PUBLISHED' | 'DRAFTS'
  >('ALL');
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);
  const [upgradeModal, setUpgradeModal] = useState(false);

  const publishedCount = useMemo(
    () => items.filter((i) => i.isPublished).length,
    [items],
  );
  const totalViews = useMemo(
    () => items.reduce((s, i) => s + i.views, 0),
    [items],
  );
  const profileVisits = 1240;

  const filtered = useMemo(() => {
    if (activeFilter === 'PUBLISHED') return items.filter((i) => i.isPublished);
    if (activeFilter === 'DRAFTS') return items.filter((i) => !i.isPublished);
    return items;
  }, [items, activeFilter]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(`novba.app/p/${MOCK_PUBLIC_PROFILE.slug}`);
    showToast('Link copied to clipboard', 'success');
  };

  const togglePublish = (item: PortfolioItem) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, isPublished: !p.isPublished } : p,
      ),
    );
    showToast(
      item.isPublished
        ? 'Project unpublished'
        : 'Project published — now visible on your portfolio',
      'success',
    );
  };

  const copyPublicLink = (item: PortfolioItem) => {
    navigator.clipboard.writeText(`novba.app/p/${item.slug}`);
    showToast('Link copied to clipboard', 'success');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast('Project deleted', 'success');
    setDeleteTarget(null);
  };

  return (
    <div className='mx-auto max-w-[1200px] p-6 lg:p-8'>
      {/* Header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Portfolio
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Manage your public portfolio and showcase your work
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            onClick={copyShareLink}
            className='border-gray-300'
          >
            Share Portfolio
          </Button>
          <Button
            variant='primary'
            className='bg-orange-600 hover:bg-orange-700'
            onClick={() => {
              if (
                IS_FREE_TIER &&
                MOCK_USAGE.portfolio.used >= MOCK_USAGE.portfolio.limit
              ) {
                setUpgradeModal(true);
              } else {
                router.push('/portfolio/new');
              }
            }}
          >
            <svg
              className='mr-2 h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            Add Project
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
              Total Projects
            </p>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/30'>
              <svg
                className='h-4 w-4 text-orange-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
          </div>
          <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
            {items.length}
          </p>
          <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
            all time
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
              Published
            </p>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30'>
              <svg
                className='h-4 w-4 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
          </div>
          <p className='mt-3 text-3xl font-bold text-green-600'>
            {publishedCount}
          </p>
          <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
            live on portfolio
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
              Total Views
            </p>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30'>
              <svg
                className='h-4 w-4 text-blue-600'
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
            </div>
          </div>
          <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
            {totalViews}
          </p>
          <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
            across all projects
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
              Profile Visits
            </p>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30'>
              <svg
                className='h-4 w-4 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
          </div>
          <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
            {profileVisits.toLocaleString()}
          </p>
          <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
            this month
          </p>
        </div>
      </div>

      {/* Public portfolio link banner */}
      {publishedCount >= 1 && (
        <div className='mb-6 flex flex-col gap-3 rounded-xl bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-orange-950/30 dark:border dark:border-orange-900/30'>
          <div className='flex items-center gap-2'>
            <span className='font-medium text-gray-900 dark:text-white'>
              Public portfolio:
            </span>
            <code className='rounded bg-white px-2 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
              novba.app/p/{MOCK_PUBLIC_PROFILE.slug}
            </code>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={copyShareLink}>
              Copy Link
            </Button>
            <a
              href={`/p/${MOCK_PUBLIC_PROFILE.slug}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm font-medium text-orange-600 hover:text-orange-700'
            >
              Preview →
            </a>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className='mb-6 flex flex-wrap gap-2'>
        {(['ALL', 'PUBLISHED', 'DRAFTS'] as const).map((tab) => {
          const count =
            tab === 'ALL'
              ? items.length
              : tab === 'PUBLISHED'
                ? publishedCount
                : items.length - publishedCount;
          return (
            <button
              key={tab}
              type='button'
              onClick={() => setActiveFilter(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'PUBLISHED'
                ? 'Published'
                : tab === 'DRAFTS'
                  ? 'Drafts'
                  : 'All'}{' '}
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${
                  activeFilter === tab
                    ? 'bg-white/20'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state: no projects at all */}
      {items.length === 0 ? (
        <Card>
          <CardBody padding='lg'>
            <EmptyState
              icon={
                <svg
                  className='h-8 w-8 text-orange-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                  />
                </svg>
              }
              title='Your portfolio is empty'
              description='Add your best work to attract clients and showcase your skills. A complete portfolio increases your chances of winning new projects.'
              primaryAction={{
                label: 'Add Your First Project',
                onClick: () => router.push('/portfolio/new'),
              }}
            />
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        /* Empty state: filtered, no matches */
        <Card>
          <CardBody padding='lg'>
            <div className='py-12 text-center'>
              <p className='font-semibold text-gray-900 dark:text-white'>
                No {activeFilter.toLowerCase()} projects
              </p>
              <button
                type='button'
                onClick={() => setActiveFilter('ALL')}
                className='mt-2 text-sm text-orange-600 hover:text-orange-700'
              >
                Clear filter
              </button>
            </div>
          </CardBody>
        </Card>
      ) : (
        /* Project grid */
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((item) => (
            <div
              key={item.id}
              className='group rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg hover:border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-gray-600'
            >
              {/* Cover image area */}
              <div className='relative h-48 overflow-hidden'>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=''
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div
                    className={`h-full w-full ${getCoverGradient(item.category)}`}
                  >
                    {/* Decorative pattern overlay */}
                    <div className='absolute inset-0 opacity-10'>
                      <svg
                        width='100%'
                        height='100%'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <defs>
                          <pattern
                            id={`grid-${item.id}`}
                            width='32'
                            height='32'
                            patternUnits='userSpaceOnUse'
                          >
                            <path
                              d='M 32 0 L 0 0 0 32'
                              fill='none'
                              stroke='white'
                              strokeWidth='0.5'
                            />
                          </pattern>
                        </defs>
                        <rect
                          width='100%'
                          height='100%'
                          fill={`url(#grid-${item.id})`}
                        />
                      </svg>
                    </div>
                    {/* Category icon center */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='flex flex-col items-center gap-2 opacity-40'>
                        {getCategoryIcon(item.category)}
                      </div>
                    </div>
                  </div>
                )}
                {/* Status badge - top left */}
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
                    item.isPublished
                      ? 'bg-green-500/90 text-white'
                      : 'bg-black/40 text-white'
                  }`}
                >
                  {item.isPublished && (
                    <span className='h-1.5 w-1.5 rounded-full bg-white animate-pulse' />
                  )}
                  {item.isPublished ? 'Live' : 'Draft'}
                </span>
                {/* Category badge - top right */}
                <span className='absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm'>
                  {item.category}
                </span>
              </div>

              {/* Card body */}
              <div className='p-5'>
                <div className='mb-3'>
                  <h3 className='text-base font-bold text-gray-900 dark:text-white leading-snug'>
                    {item.title}
                  </h3>
                  {item.client && (
                    <p className='mt-0.5 text-sm text-gray-500 dark:text-gray-400'>
                      {item.client}
                    </p>
                  )}
                </div>

                {/* Tech tags */}
                <div className='flex flex-wrap gap-1.5'>
                  {item.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className='rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 3 && (
                    <span className='rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-500'>
                      +{item.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className='mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4'>
                  <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500'>
                    <span className='flex items-center gap-1'>
                      <svg
                        className='h-3.5 w-3.5'
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
                      {item.views}
                    </span>
                    <span className='flex items-center gap-1'>
                      <svg
                        className='h-3.5 w-3.5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                      {formatMonthYear(item.projectDate)}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <button
                      type='button'
                      onClick={() => router.push(`/portfolio/${item.id}/edit`)}
                      className='rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    >
                      Edit
                    </button>
                    <DropdownMenu
                      trigger={<TableActionsTrigger />}
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/portfolio/${item.id}/edit`)
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(item)}>
                        {item.isPublished ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      {item.isPublished && (
                        <DropdownMenuItem onClick={() => copyPublicLink(item)}>
                          Copy Public Link
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuDivider />
                      <DropdownMenuItem
                        variant='danger'
                        onClick={() => setDeleteTarget(item)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size='sm'
      >
        <ModalHeader
          title={`Delete ${deleteTarget?.title ?? ''}?`}
          onClose={() => setDeleteTarget(null)}
        />
        <ModalBody>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            This will permanently remove this project from your portfolio. This
            cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <button
            type='button'
            onClick={handleDelete}
            className='rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700'
          >
            Delete
          </button>
        </ModalFooter>
      </Modal>
      <UpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        feature='portfolio items'
        used={MOCK_USAGE.portfolio.used}
        limit={MOCK_USAGE.portfolio.limit}
      />
    </div>
  );
}
