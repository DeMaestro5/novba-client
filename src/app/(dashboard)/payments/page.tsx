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
import EmptyPageState from '@/components/EmptyPageState';

// ─── Types ─────────────────────────────────────────────────────────────────

type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'STRIPE'
  | 'PAYPAL'
  | 'CHECK'
  | 'OTHER';

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  notes: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    currency: string;
    status: string;
    client: {
      id: string;
      companyName: string;
      contactName: string | null;
    };
  };
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
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

function formatMethod(method: string): string {
  return method
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

const STATUS_BADGE: Record<PaymentStatus, string> = {
  COMPLETED: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  PENDING: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  FAILED: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const STATUS_OPTIONS: { value: PaymentStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: currentPage, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<{
        data: { payments: Payment[]; pagination: Pagination };
      }>('/payments', { params });
      setPayments(res.data.data.payments);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const stats = useMemo(() => {
    const totalCollected = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const completedCount = payments.filter((p) => p.status === 'COMPLETED').length;
    return {
      totalCollected,
      pending,
      completedCount,
      total: payments.length,
    };
  }, [payments]);

  const showEmptyPageState =
    !loading && payments.length === 0 && !statusFilter;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your complete financial history
          </p>
        </div>
      </div>

      {showEmptyPageState ? (
        <div className="w-full min-h-[520px]">
          <EmptyPageState
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
            badge="Payments"
            headline="No payments yet"
            subtext="Payments are recorded when you mark an invoice as paid."
            benefits={[
              {
                icon: (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                label: 'Every payment tied to the invoice it came from',
                description:
                  'Full audit trail — who paid, how much, and when.',
              },
              {
                icon: (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                  </svg>
                ),
                label: 'Revenue trends across months and clients',
                description:
                  'See your busiest periods and highest-value client relationships.',
              },
              {
                icon: (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                label: 'Multiple payment methods supported',
                description:
                  'Bank transfer, Stripe, cash — all tracked in one place.',
              },
            ]}
            ctaLabel="Create an Invoice"
            ctaHref="/invoices/new"
            stat={{
              value: '$0',
              label: 'collected so far',
              context:
                'send your first invoice to start receiving payments',
            }}
            preview={
              <div className="mx-auto w-full max-w-sm space-y-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Sample payment history
                </p>
                {[
                  {
                    invoice: 'INV-0003',
                    client: 'Design Studio',
                    date: 'Mar 1',
                    amount: '$3,200',
                  },
                  {
                    invoice: 'INV-0001',
                    client: 'Acme Corp',
                    date: 'Feb 14',
                    amount: '$8,500',
                  },
                ].map((p) => (
                  <div
                    key={p.invoice}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {p.invoice}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.client}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {p.amount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.date}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      Paid
                    </span>
                  </div>
                ))}
                <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 dark:border-orange-900/40 dark:bg-orange-950/30">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Total collected
                  </p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    $11,700
                  </p>
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/50 dark:from-green-950/40 dark:to-emerald-950/40">
              <CardBody padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Total Collected
                    </p>
                    <p className="mt-2 text-4xl font-black text-green-700">
                      {formatCurrency(stats.totalCollected, 'USD')}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-green-600">
                      lifetime revenue
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Pending
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stats.pending, 'USD')}
                    </p>
                    <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500">
                      {stats.completedCount} completed · {stats.total} total
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter((e.target.value || '') as PaymentStatus | '')
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchPayments()}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

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
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    No payments match your filters
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('')}
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
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow
                          key={p.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell>
                            <Link
                              href={`/invoices/${p.invoiceId}`}
                              className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                            >
                              {p.invoice.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-900 dark:text-white">
                              {p.invoice.client.companyName}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(p.amount, p.currency)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatMethod(p.paymentMethod)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}
                            >
                              {p.status.toLowerCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(p.paidAt ?? p.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div
                              className="inline-block"
                              onClick={(e: React.MouseEvent) =>
                                e.stopPropagation()
                              }
                              role="presentation"
                            >
                              <DropdownMenu
                                align="right"
                                trigger={<TableActionsTrigger />}
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/invoices/${p.invoiceId}`)
                                  }
                                >
                                  View Invoice
                                </DropdownMenuItem>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination?.page ?? 1} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={currentPage >= totalPages}
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
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
    </div>
  );
}
