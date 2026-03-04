'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import Card, { CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Table, {
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
  TableHead,
} from '@/components/UI/Table';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import TableActionsTrigger from '@/components/UI/TableActionsTrigger';
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';
import UpgradeModal from '@/components/UI/UpgradeModal';
import EmptyPageState from '@/components/EmptyPageState';
import api from '@/lib/api';

type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'APPROVED'
  | 'DECLINED'
  | 'EXPIRED';

interface ProposalClient {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
}

interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  status: ProposalStatus;
  totalAmount: number;
  currency: string;
  validUntil: string | null;
  sentAt: string | null;
  createdAt: string;
  client: ProposalClient;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; variant: string; color: string }
> = {
  DRAFT: { label: 'Draft', variant: 'default', color: 'text-gray-500' },
  SENT: { label: 'Sent', variant: 'info', color: 'text-blue-600' },
  VIEWED: { label: 'Viewed', variant: 'warning', color: 'text-amber-600' },
  APPROVED: { label: 'Approved', variant: 'success', color: 'text-green-600' },
  DECLINED: { label: 'Declined', variant: 'danger', color: 'text-red-600' },
  EXPIRED: { label: 'Expired', variant: 'default', color: 'text-gray-400' },
};

const FILTER_TABS: { label: string; value: ProposalStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Viewed', value: 'VIEWED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Declined', value: 'DECLINED' },
  { label: 'Expired', value: 'EXPIRED' },
];

export default function ProposalsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [activeFilter, setActiveFilter] = useState<ProposalStatus | 'ALL'>(
    'ALL',
  );
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [upgradeModal, setUpgradeModal] = useState(false);

  const fetchTable = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: 1, limit: 20 };
      if (activeFilter !== 'ALL') params.status = activeFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get<{
        data: { proposals: Proposal[]; pagination: PaginationMeta };
      }>('/proposals', { params });
      setProposals(res.data.data.proposals);
      setPagination(res.data.data.pagination);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to load proposals';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, debouncedSearch]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get<{
        data: { proposals: Proposal[]; pagination: PaginationMeta };
      }>('/proposals', { params: { page: 1, limit: 100 } });
      setAllProposals(res.data.data.proposals);
    } catch {
      // keep existing allProposals on stats fetch failure
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchTable(), fetchStats()]);
  }, [fetchTable, fetchStats]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = useMemo(
    () => ({
      total: pagination.total,
      totalValue: allProposals
        .filter((p) => ['SENT', 'VIEWED', 'APPROVED'].includes(p.status))
        .reduce((s, p) => s + p.totalAmount, 0),
      awaitingResponse: allProposals.filter(
        (p) => p.status === 'SENT' || p.status === 'VIEWED',
      ).length,
      approved: allProposals.filter((p) => p.status === 'APPROVED').length,
      approvedValue: allProposals
        .filter((p) => p.status === 'APPROVED')
        .reduce((s, p) => s + p.totalAmount, 0),
    }),
    [allProposals, pagination.total],
  );

  const tabCounts = useMemo(
    () => ({
      ALL: pagination.total,
      DRAFT: allProposals.filter((p) => p.status === 'DRAFT').length,
      SENT: allProposals.filter((p) => p.status === 'SENT').length,
      VIEWED: allProposals.filter((p) => p.status === 'VIEWED').length,
      APPROVED: allProposals.filter((p) => p.status === 'APPROVED').length,
      DECLINED: allProposals.filter((p) => p.status === 'DECLINED').length,
      EXPIRED: allProposals.filter((p) => p.status === 'EXPIRED').length,
    }),
    [allProposals, pagination.total],
  );

  const sevenDaysFromNow = useMemo(
    () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    [],
  );

  const handleSend = async (id: string) => {
    setSendingId(id);
    try {
      await api.post(`/proposals/${id}/send`);
      showToast('Proposal sent to client', 'success');
      await refreshAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to send proposal';
      showToast(msg, 'error');
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/proposals/${deleteTarget.id}`);
      showToast(`${deleteTarget.proposalNumber} deleted`, 'success');
      setDeleteTarget(null);
      await refreshAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to delete proposal';
      showToast(msg, 'error');
      setDeleteTarget(null);
    }
  };

  const clearFilters = () => {
    setActiveFilter('ALL');
    setSearch('');
    setDebouncedSearch('');
  };

  const isEmpty = !isLoading && pagination.total === 0;

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      {/* Header — always visible */}
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Proposals
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Create and track project proposals for clients
          </p>
        </div>
        <Button
          variant='primary'
          className='bg-orange-600 hover:bg-orange-700'
          onClick={() => router.push('/proposals/new')}
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
          New Proposal
        </Button>
      </div>

      {isLoading ? (
        <>
          <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='animate-pulse rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 h-28'
              />
            ))}
          </div>
          <Card>
            <CardBody className='p-0'>
              <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                <div className='animate-pulse h-10 rounded bg-gray-100 dark:bg-gray-700 w-48' />
              </div>
              <div className='p-4'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className='animate-pulse h-12 rounded bg-gray-100 dark:bg-gray-700 my-2' />
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      ) : isEmpty ? (
        <div className='w-full min-h-[520px]'>
          <EmptyPageState
            icon={
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            }
            badge='Proposals'
            headline={'Win more clients with\nstandout proposals'}
            subtext='Create professional proposals in minutes. Track when clients open them. Convert approvals to invoices in one click.'
            benefits={[
              {
                icon: (
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                  </svg>
                ),
                label: 'Know the moment a client opens your proposal',
                description: 'Real-time view notifications so you follow up at exactly the right time.',
              },
              {
                icon: (
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                  </svg>
                ),
                label: 'Zero double entry — proposal to invoice in one click',
                description: 'Approved proposals convert directly into invoices with all line items intact.',
              },
              {
                icon: (
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                  </svg>
                ),
                label: 'Track your win rate and pipeline value',
                description: 'See which proposals convert and which clients are most valuable.',
              },
            ]}
            ctaLabel='Create First Proposal'
            ctaHref='/proposals/new'
            stat={{ value: '3×', label: 'more projects won', context: 'by freelancers who send proposals within 24 hours of an inquiry' }}
            preview={
              <div className='mx-auto w-full max-w-sm space-y-2'>
                <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>Sample proposal pipeline</p>
                {[
                  { num: 'PROP-0003', client: 'Acme Corp', amount: '$8,500', status: 'Approved', statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
                  { num: 'PROP-0002', client: 'TechStart Inc', amount: '$12,400', status: 'Viewed', statusColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
                  { num: 'PROP-0001', client: 'Design Studio', amount: '$3,600', status: 'Sent', statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
                ].map((p, i) => (
                  <div key={p.num} className='flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-800' style={{ opacity: 1 - i * 0.15 }}>
                    <div>
                      <p className='text-xs font-semibold text-orange-600'>{p.num}</p>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>{p.client}</p>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                      <span className='text-sm font-bold text-gray-900 dark:text-white'>{p.amount}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.statusColor}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
                <div className='mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5 dark:border-orange-900/40 dark:bg-orange-950/30'>
                  <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>Pipeline value</span>
                  <span className='text-sm font-bold text-orange-600'>$24,500</span>
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <>
      {/* Stats */}
      <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='animate-pulse rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 h-28'
              />
            ))}
          </>
        ) : (
          <>
        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Total Proposals
              </p>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30'>
                <svg
                  className='h-5 w-5 text-orange-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
            </div>
            <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
              {stats.total}
            </p>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              all time
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Total Value
              </p>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30'>
                <svg
                  className='h-5 w-5 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
            <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
              {formatCurrency(stats.totalValue, 'USD')}
            </p>
            <p className='mt-1 text-sm text-green-600 font-medium'>
              pipeline value
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Awaiting Response
              </p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stats.awaitingResponse > 0 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}
              >
                <svg
                  className={`h-5 w-5 ${stats.awaitingResponse > 0 ? 'text-amber-600' : 'text-gray-400'}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
            <p
              className={`mt-3 text-3xl font-bold ${stats.awaitingResponse > 0 ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}
            >
              {stats.awaitingResponse}
            </p>
            <p
              className={`mt-1 text-sm font-medium ${stats.awaitingResponse > 0 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-600'}`}
            >
              {stats.awaitingResponse > 0 ? 'needs follow-up' : 'all clear'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Approved
              </p>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30'>
                <svg
                  className='h-5 w-5 text-green-600'
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
              {stats.approved}
            </p>
            <p className='mt-1 text-sm text-green-600 font-medium'>
              {formatCurrency(stats.approvedValue, 'USD')} won
            </p>
          </CardBody>
        </Card>
          </>
        )}
      </div>

      {/* Filter tabs + search */}
      <Card>
        <CardBody className='p-0'>
          {/* Filter tabs */}
          <div className='flex items-center gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-4 pb-0 scrollbar-hide'>
            {FILTER_TABS.map((tab) => {
              const count = tabCounts[tab.value] ?? 0;
              return (
                <button
                  key={tab.value}
                  type='button'
                  onClick={() => setActiveFilter(tab.value)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                    activeFilter === tab.value
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                        activeFilter === tab.value
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search + count */}
          <div className='flex items-center justify-between px-4 py-3'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
            </p>
            <div className='relative w-64'>
              <svg
                className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
              <input
                type='text'
                placeholder='Search proposals...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500'
              />
            </div>
          </div>

          {error ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-sm text-red-500 font-medium'>{error}</p>
              <button
                type='button'
                onClick={() => refreshAll()}
                className='mt-3 text-sm text-orange-600 hover:underline'
              >
                Try again
              </button>
            </div>
          ) : isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <td colSpan={6} className='px-4 py-3'>
                      <div className='animate-pulse h-12 rounded bg-gray-100 dark:bg-gray-700 my-1' />
                    </td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : proposals.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-sm text-gray-400 dark:text-gray-500'>
                No proposals match your current filter.
              </p>
              <button
                type='button'
                onClick={clearFilters}
                className='mt-2 text-sm text-orange-600 hover:underline dark:text-orange-500'
              >
                Clear filters
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => {
                  const sc = STATUS_CONFIG[proposal.status];
                  const validUntilDate = proposal.validUntil
                    ? new Date(proposal.validUntil)
                    : null;
                  const isExpiringSoon =
                    validUntilDate &&
                    validUntilDate < sevenDaysFromNow &&
                    validUntilDate >= new Date() &&
                    !['APPROVED', 'DECLINED', 'EXPIRED'].includes(
                      proposal.status,
                    );
                  const isOverdue =
                    validUntilDate &&
                    validUntilDate < new Date() &&
                    ['SENT', 'VIEWED'].includes(proposal.status);
                  const isSending = sendingId === proposal.id;

                  return (
                    <TableRow
                      key={proposal.id}
                      className='cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                      onClick={() => router.push(`/proposals/${proposal.id}`)}
                    >
                      <TableCell>
                        <div>
                          <Link
                            href={`/proposals/${proposal.id}`}
                            className='font-medium text-orange-600 hover:underline'
                            onClick={(e) => e.stopPropagation()}
                          >
                            {proposal.proposalNumber}
                          </Link>
                          <p className='mt-0.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-1'>
                            {proposal.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {proposal.client.companyName}
                          </p>
                          {proposal.client.contactName && (
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                              {proposal.client.contactName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {formatCurrency(
                            proposal.totalAmount,
                            proposal.currency,
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sc.variant as
                              | 'default'
                              | 'success'
                              | 'warning'
                              | 'danger'
                              | 'info'
                          }
                          size='sm'
                        >
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {!proposal.validUntil ? (
                            <p className='text-sm text-gray-500'>—</p>
                          ) : (
                            <>
                              <p
                                className={`text-sm ${
                                  isOverdue
                                    ? 'font-semibold text-red-600'
                                    : isExpiringSoon
                                      ? 'font-semibold text-amber-600'
                                      : 'text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {validUntilDate
                                  ? validUntilDate.toLocaleDateString(
                                      'en-GB',
                                      {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                      },
                                    )
                                  : '—'}
                              </p>
                              {isExpiringSoon && (
                                <p className='text-xs text-amber-500'>
                                  Expiring soon
                                </p>
                              )}
                              {isOverdue && (
                                <p className='text-xs text-red-500'>
                                  Overdue
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu
                            trigger={
                              isSending ? (
                                <span className='inline-flex h-8 w-8 items-center justify-center'>
                                  <svg
                                    className='h-4 w-4 animate-spin text-gray-500'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                  >
                                    <circle
                                      className='opacity-25'
                                      cx='12'
                                      cy='12'
                                      r='10'
                                      stroke='currentColor'
                                      strokeWidth='4'
                                    />
                                    <path
                                      className='opacity-75'
                                      fill='currentColor'
                                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    />
                                  </svg>
                                </span>
                              ) : (
                                <TableActionsTrigger />
                              )
                            }
                          >
                            {proposal.status === 'DRAFT' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/proposals/${proposal.id}/edit`,
                                    )
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSend(proposal.id)}
                                >
                                  Send
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-red-600'
                                  onClick={() => setDeleteTarget(proposal)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                            {(proposal.status === 'SENT' ||
                              proposal.status === 'VIEWED') && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/proposals/${proposal.id}`)
                                  }
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-red-600'
                                  onClick={() => setDeleteTarget(proposal)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                            {proposal.status === 'APPROVED' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/proposals/${proposal.id}`)
                                }
                              >
                                View Details
                              </DropdownMenuItem>
                            )}
                            {(proposal.status === 'DECLINED' ||
                              proposal.status === 'EXPIRED') && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/proposals/${proposal.id}`)
                                  }
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-red-600'
                                  onClick={() => setDeleteTarget(proposal)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
        </>
      )}

      {/* Delete modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size='sm'
      >
        <ModalHeader
          title='Delete Proposal?'
          onClose={() => setDeleteTarget(null)}
        />
        <ModalBody>
          <div className='flex flex-col items-center py-4 text-center'>
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <svg
                className='h-6 w-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            </div>
            <p className='font-semibold text-gray-900 dark:text-white'>
              {deleteTarget?.proposalNumber}
            </p>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              This will permanently delete &quot;{deleteTarget?.title}&quot;.
              This action cannot be undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <button
            type='button'
            onClick={handleDelete}
            className='rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors'
          >
            Delete Proposal
          </button>
        </ModalFooter>
      </Modal>
      <UpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        feature='proposals'
        used={0}
        limit={0}
      />
    </div>
  );
}
