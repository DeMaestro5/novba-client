'use client';

import { useState, useEffect, useCallback } from 'react';
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

type ContractStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'SIGNED'
  | 'EXPIRED'
  | 'CANCELLED';

type TemplateType =
  | 'service_agreement'
  | 'nda'
  | 'sow'
  | 'freelance'
  | 'consulting'
  | 'custom';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: ContractStatus;
  templateType: TemplateType;
  startDate: string | null;
  endDate: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string | null;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  ContractStatus,
  string
> = {
  DRAFT:
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  SENT:
    'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  VIEWED:
    'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  SIGNED:
    'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  EXPIRED:
    'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  CANCELLED:
    'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const TEMPLATE_LABEL: Record<TemplateType, string> = {
  service_agreement: 'Service Agreement',
  nda: 'NDA',
  sow: 'Statement of Work',
  freelance: 'Freelance',
  consulting: 'Consulting',
  custom: 'Custom',
};

const STATUS_OPTIONS: { value: ContractStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'VIEWED', label: 'Viewed' },
  { value: 'SIGNED', label: 'Signed' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ContractsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchContracts = useCallback(async () => {
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
        data: { contracts: Contract[]; pagination: Pagination };
      }>('/contracts', { params });
      setContracts(res.data.data.contracts);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load contracts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/contracts/${deleteTarget.id}`);
      showToast('Contract deleted', 'success');
      setDeleteTarget(null);
      fetchContracts();
    } catch {
      showToast('Failed to delete contract', 'error');
    }
  }, [deleteTarget, showToast, fetchContracts]);

  const totalPages = pagination?.totalPages ?? 1;
  const showEmptyPageState = !loading && contracts.length === 0 && !search && !statusFilter;
  const showInlineNoResults = !loading && contracts.length === 0 && (!!search || !!statusFilter);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contracts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your client contracts
          </p>
        </div>
        <Link
          href="/contracts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Contract
        </Link>
      </div>

      {showEmptyPageState ? (
        <div className="w-full min-h-[520px]">
          <EmptyPageState
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            badge="Contracts"
            headline={'Protect every project\nwith a signed contract'}
            subtext="Use professionally drafted templates. Get legally binding e-signatures from clients — no printing, no scanning."
            benefits={[
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                label: 'Service agreements, NDAs, SOWs — ready to use',
                description: 'Professional templates built for freelancers, fully customizable.',
              },
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                ),
                label: 'Clients sign from a link on any device',
                description: 'No PDF back-and-forth. No printing. Signed in minutes.',
              },
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                label: 'Convert approved proposals to contracts instantly',
                description: 'One click — all project details carry over automatically.',
              },
            ]}
            ctaLabel="Create First Contract"
            ctaHref="/contracts/new"
            stat={{ value: '2×', label: 'faster payments', context: 'for freelancers who use signed contracts vs verbal agreements' }}
            preview={
              <div className="mx-auto w-full max-w-sm space-y-2">
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">CONT-0001</p>
                  <p className="mt-0.5 font-medium text-gray-900 dark:text-white">Brand Identity Project</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Acme Corp</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Draft</span>
                    <span className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sent</span>
                    <span className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Signed</span>
                  </div>
                </div>
                <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">Signed digitally · No PDF back-and-forth</span>
              </div>
            }
          />
        </div>
      ) : (
        <>
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
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter((e.target.value || '') as ContractStatus | '')}
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
            onClick={() => fetchContracts()}
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
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : showInlineNoResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">No contracts match your filters</p>
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
                    <TableHead>Contract</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => router.push(`/contracts/${c.id}`)}
                    >
                      <TableCell>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {c.contractNumber}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {c.title}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {c.client.companyName}
                        </p>
                        {c.client.contactName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {c.client.contactName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {TEMPLATE_LABEL[c.templateType]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[c.status]}`}
                        >
                          {c.status.toLowerCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400">
                          <span>Started {formatDate(c.startDate)}</span>
                          {c.signedAt ? (
                            <span className="text-green-600 dark:text-green-400">
                              Signed {formatDate(c.signedAt)}
                            </span>
                          ) : null}
                        </div>
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
                            onClick={() => router.push(`/contracts/${c.id}`)}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/contracts/${c.id}/edit`)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="danger"
                            onClick={() => setDeleteTarget(c)}
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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
              Delete contract?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will permanently delete {deleteTarget.contractNumber}. This action cannot be undone.
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
