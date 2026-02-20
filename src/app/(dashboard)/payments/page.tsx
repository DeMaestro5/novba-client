'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card, { CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Table, { TableRow, TableCell, TableHeader, TableBody, TableHead } from '@/components/UI/Table';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import Button from '@/components/UI/Button';
import { useToast } from '@/components/UI/Toast';
import {
  mockPayments,
  groupPaymentsByMonth,
  formatCurrency,
  formatDate,
  formatDateShort,
  type MockPayment,
  type PaymentStatus,
  type PaymentMethod,
} from '@/lib/mock-payments';

// ─── Config ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: string }> = {
  COMPLETED: { label: 'Paid',      variant: 'success' },
  PENDING:   { label: 'Pending',   variant: 'info'    },
  FAILED:    { label: 'Failed',    variant: 'danger'  },
  REFUNDED:  { label: 'Refunded',  variant: 'default' },
};

const METHOD_CONFIG: Record<PaymentMethod, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  STRIPE: {
    label: 'Stripe',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
      </svg>
    ),
  },
  BANK_TRANSFER: {
    label: 'Bank Transfer',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: (
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  CASH: {
    label: 'Cash',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: (
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  CHECK: {
    label: 'Check',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    icon: (
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  MOBILE_MONEY: {
    label: 'Mobile Money',
    color: 'text-teal-700',
    bg: 'bg-teal-100',
    icon: (
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  CRYPTO: {
    label: 'Crypto',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    icon: (
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  OTHER: {
    label: 'Other',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    icon: (
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
      </svg>
    ),
  },
};

const FILTER_TABS: { label: string; value: PaymentStatus | 'ALL' }[] = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending',   value: 'PENDING'   },
  { label: 'Failed',    value: 'FAILED'    },
  { label: 'Refunded',  value: 'REFUNDED'  },
];

// ─── Method Badge ───────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: PaymentMethod }) {
  const config = METHOD_CONFIG[method];
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
      {config.icon}
      {config.label}
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [payments, setPayments] = useState(mockPayments);
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MockPayment | null>(null);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalCollected = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((s, p) => s + p.amount, 0);

    const thisMonthCollected = payments
      .filter(p => p.status === 'COMPLETED' && new Date(p.paidAt) >= thisMonthStart)
      .reduce((s, p) => s + p.amount, 0);

    const lastMonthCollected = payments
      .filter(p => {
        const d = new Date(p.paidAt);
        return p.status === 'COMPLETED' && d >= lastMonthStart && d <= lastMonthEnd;
      })
      .reduce((s, p) => s + p.amount, 0);

    const pendingCount = payments.filter(p => p.status === 'PENDING').length;
    const pendingAmount = payments
      .filter(p => p.status === 'PENDING')
      .reduce((s, p) => s + p.amount, 0);

    const problemAmount = payments
      .filter(p => p.status === 'FAILED' || p.status === 'REFUNDED')
      .reduce((s, p) => s + p.amount, 0);
    const problemCount = payments.filter(p => p.status === 'FAILED' || p.status === 'REFUNDED').length;

    return {
      totalCollected,
      thisMonthCollected,
      lastMonthCollected,
      thisMonthUp: thisMonthCollected >= lastMonthCollected,
      pendingCount,
      pendingAmount,
      problemAmount,
      problemCount,
    };
  }, [payments]);

  // ─── Filtered + Grouped ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchesFilter = activeFilter === 'ALL' || p.status === activeFilter;
      const matchesSearch = !search ||
        p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.amount.toString().includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [payments, activeFilter, search]);

  const grouped = useMemo(() => groupPaymentsByMonth(filtered), [filtered]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTarget) return;
    setPayments(prev => prev.filter(p => p.id !== deleteTarget.id));
    showToast('Payment deleted', 'success');
    setDeleteTarget(null);
  };

  const handleMarkRefunded = (payment: MockPayment) => {
    setPayments(prev =>
      prev.map(p => p.id === payment.id ? { ...p, status: 'REFUNDED' as PaymentStatus } : p)
    );
    showToast(`${payment.invoiceNumber} marked as refunded`, 'success');
  };

  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Your complete financial history</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* Total Collected — Hero card */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700">Total Collected</p>
                <p className="mt-2 text-4xl font-black text-green-700">
                  {formatCurrency(stats.totalCollected)}
                </p>
                <p className="mt-1.5 text-sm font-medium text-green-600">lifetime revenue</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* This Month */}
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  This Month
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.thisMonthCollected)}
                </p>
                <p className="mt-1.5 text-sm text-gray-400">{currentMonthLabel}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending */}
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pending</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.pendingAmount)}
            </p>
            <p className={`mt-1 text-sm font-medium ${stats.pendingCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              {stats.pendingCount > 0 ? `${stats.pendingCount} awaiting payment` : 'all clear'}
            </p>
          </CardBody>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Needs Attention</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.problemAmount)}
            </p>
            <p className={`mt-1 text-sm font-medium ${stats.problemCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {stats.problemCount > 0 ? `${stats.problemCount} failed or refunded` : 'all clear'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Filter tabs + table */}
      <Card>
        <CardBody className="p-0">

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-4 pb-0 scrollbar-hide">
            {FILTER_TABS.map(tab => {
              const count = tab.value === 'ALL'
                ? payments.length
                : payments.filter(p => p.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                    activeFilter === tab.value
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                      activeFilter === tab.value ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search + count */}
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-gray-500">
              {filtered.length} payment{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="relative w-64">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">No payments found</p>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'Try a different search term' : 'Payments are recorded from invoice pages'}
              </p>
            </div>
          ) : (
            /* Month-grouped table */
            <div>
              {grouped.map((group, groupIndex) => (
                <div key={group.key}>
                  {/* Month header */}
                  <div className={`flex items-center justify-between px-6 py-3 ${groupIndex > 0 ? 'border-t-2 border-gray-100' : ''} bg-gray-50`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {group.label}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-400">
                        {group.payments.length}
                      </span>
                    </div>
                    {group.collectedTotal > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">collected</span>
<span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(group.collectedTotal)}
                      </span>
                      </div>
                    )}
                  </div>

                  {/* Payments in this month */}
                  <Table>
                    <TableHeader className="hidden">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="hidden xl:table-cell">Notes</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.payments.map(payment => (
                        <TableRow
                          key={payment.id}
                          className="group transition-colors cursor-default hover:bg-gray-50"
                        >
                          {/* Col 1: Date — narrow, muted */}
                          <TableCell className="w-20 py-4 pl-6">
                            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                              {formatDateShort(payment.paidAt)}
                            </span>
                          </TableCell>

                          {/* Col 2: Client (primary) + Invoice (secondary reference) */}
                          <TableCell className="py-4 min-w-[160px]">
                            <p className="text-sm font-semibold text-gray-900">{payment.clientName}</p>
                            <Link
                              href={`/invoices/${payment.invoiceId}`}
                              className="mt-0.5 text-xs text-gray-400 hover:text-orange-600 transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              {payment.invoiceNumber}
                            </Link>
                          </TableCell>

                          {/* Col 3: Method badge */}
                          <TableCell className="py-4">
                            <MethodBadge method={payment.paymentMethod} />
                          </TableCell>

                          {/* Col 4: Notes — hidden on smaller screens */}
                          <TableCell className="hidden xl:table-cell py-4 max-w-[220px]">
                            {payment.notes && (
                              <p className="truncate text-xs text-gray-400 italic">{payment.notes}</p>
                            )}
                          </TableCell>

                          {/* Col 5: AMOUNT — the hero of every row */}
                          <TableCell className="py-4 text-right min-w-[120px]">
                            <span className={`text-lg font-black tracking-tight ${
                              payment.status === 'COMPLETED' ? 'text-gray-900' :
                              payment.status === 'PENDING'   ? 'text-gray-900' :
                              payment.status === 'FAILED'    ? 'text-red-600'  :
                              'text-gray-400 line-through'
                            }`}>
                              {payment.status === 'REFUNDED' ? '−' : ''}{formatCurrency(payment.amount, payment.currency)}
                            </span>
                          </TableCell>

                          {/* Col 6: Status badge */}
                          <TableCell className="py-4 pl-3">
                            <Badge
                              variant={STATUS_CONFIG[payment.status].variant as 'default' | 'success' | 'warning' | 'danger' | 'info'}
                              size="sm"
                            >
                              {STATUS_CONFIG[payment.status].label}
                            </Badge>
                          </TableCell>

                          {/* Col 7: Actions */}
                          <TableCell className="py-4 pr-4 text-right">
                            <DropdownMenu
                              trigger={
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 transition-all">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="5" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="12" cy="19" r="1.5" />
                                  </svg>
                                </button>
                              }
                            >
                              <DropdownMenuItem onClick={() => router.push(`/invoices/${payment.invoiceId}`)}>
                                View Invoice
                              </DropdownMenuItem>
                              {payment.status === 'COMPLETED' && (
                                <DropdownMenuItem onClick={() => handleMarkRefunded(payment)}>
                                  Mark as Refunded
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteTarget(payment)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <ModalHeader title="Delete Payment?" onClose={() => setDeleteTarget(null)} />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900">{deleteTarget?.invoiceNumber}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {deleteTarget && formatCurrency(deleteTarget.amount, deleteTarget.currency)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Permanently delete this payment record? This cannot be undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Delete Payment
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
