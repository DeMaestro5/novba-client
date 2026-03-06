'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Card, { CardBody } from '@/components/UI/Card';
import Table, {
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
  TableHead,
} from '@/components/UI/Table';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import TableActionsTrigger from '@/components/UI/TableActionsTrigger';
import { useToast } from '@/components/UI/Toast';
import EmptyPageState from '@/components/EmptyPageState';

// ─── Types ─────────────────────────────────────────────────────────────────

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  totalBudget: number;
  currency: string;
  paymentPlan: unknown[] | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    companyName: string;
    contactName: string | null;
  };
  invoiceCount?: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

const STATUS_BADGE: Record<ProjectStatus, string> = {
  ACTIVE:
    'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED:
    'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  ON_HOLD:
    'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-600',
  CANCELLED:
    'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
};

const STATUS_OPTIONS: { value: ProjectStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 20,
      };
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get<{
        data: { projects: Project[]; pagination: Pagination };
      }>('/projects', { params });
      setProjects(res.data.data.projects);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      showToast('Project deleted', 'success');
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      showToast('Failed to delete project', 'error');
    }
  }, [deleteTarget, showToast, fetchProjects]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'ACTIVE').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    const totalBudget = projects.reduce(
      (sum, p) => sum + Number(p.totalBudget),
      0
    );
    return { total, active, completed, totalBudget };
  }, [projects]);

  const totalPages = pagination?.totalPages ?? 1;
  const showEmptyPageState = !loading && projects.length === 0 && !search && !statusFilter;
  const showInlineNoResults = !loading && projects.length === 0 && (!!search || !!statusFilter);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your active projects and budgets
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {showEmptyPageState ? (
        <div className="w-full min-h-[520px]">
          <EmptyPageState
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            }
            badge="Projects"
            headline={'Keep every project on\ntrack and on budget'}
            subtext="Link clients, proposals, and contracts under one project. Track milestones, budgets, and payments in one place."
            benefits={[
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
                label: 'Everything connected — proposal, contract, invoices',
                description: 'One project view ties together your entire client workflow.',
              },
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: 'Payment milestones — know what\'s paid vs outstanding',
                description: 'Set a payment plan and track it automatically as invoices are paid.',
              },
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: 'Budget health at a glance',
                description: 'See exactly how much you\'ve billed vs the total project budget.',
              },
            ]}
            ctaLabel="Start First Project"
            ctaHref="/projects/new"
            stat={{ value: '40%', label: 'less scope creep', context: 'reported by freelancers who track projects with defined budgets' }}
            preview={
              <div className="mx-auto w-full max-w-sm space-y-2">
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-white">E-commerce Redesign</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">TechStart Inc</p>
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">Active</span>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full w-[60%] rounded-full bg-orange-500 dark:bg-orange-400" />
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-gray-900 dark:text-white">$7,500 / $12,400 budget used</p>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Upfront (50%) $6,200</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span>On delivery (50%) $6,200</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <>
      {/* Summary stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Total Projects
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
            <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        </Card>
        <Card className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Active
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {stats.active}
          </p>
          <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
            <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </Card>
        <Card className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Total Budget
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalBudget, 'USD')}
          </p>
          <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
            <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Card>
        <Card className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Completed
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {stats.completed}
          </p>
          <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
            <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter((e.target.value || '') as ProjectStatus | '')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => fetchProjects()}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table card */}
      <Card className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-gray-100 py-4 last:border-0 dark:border-gray-800"
                >
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 flex-1 max-w-[200px] animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : showInlineNoResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">No projects match your filters</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or status filter.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setStatusFilter(''); }}
                className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => router.push(`/projects/${p.id}`)}
                    >
                      <TableCell>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {p.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {p.client.companyName}
                        </p>
                        {p.client.contactName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.client.contactName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(Number(p.totalBudget), p.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}
                        >
                          {STATUS_LABEL[p.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400">
                          <span>Started {formatDate(p.startDate)}</span>
                          <span>
                            Ends {p.endDate ? formatDate(p.endDate) : <span className="text-gray-400 dark:text-gray-500">No end date</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-300">
                          {p.invoiceCount ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div
                          className="inline-block"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          role="presentation"
                        >
                          <DropdownMenu
                            align="right"
                            trigger={<TableActionsTrigger />}
                          >
                            <DropdownMenuItem
                              onClick={() => router.push(`/projects/${p.id}`)}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/projects/${p.id}/edit`)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="danger"
                              onClick={() => setDeleteTarget(p)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination?.page ?? 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((pg) => Math.max(1, pg - 1))}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((pg) => Math.min(totalPages, pg + 1))}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete project?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will permanently delete {deleteTarget.name}. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
