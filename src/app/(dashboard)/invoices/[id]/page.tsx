'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ApiInvoice } from '@/types/api.types';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import DropdownMenu, {
  DropdownMenuItem,
  DropdownMenuDivider,
} from '@/components/UI/DropdownMenu';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

function getStatusBadgeVariant(
  status: string,
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'SENT':
      return 'info';
    case 'PAID':
      return 'success';
    case 'OVERDUE':
      return 'danger';
    case 'CANCELLED':
      return 'default';
    case 'PARTIALLY_PAID':
      return 'warning';
    default:
      return 'default';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatAddress(addr: ApiInvoice['client']['billingAddress']): string {
  if (!addr) return '';
  const parts = [
    addr.street,
    [addr.city, addr.state, addr.zip].filter(Boolean).join(', '),
    addr.country,
  ].filter(Boolean);
  return parts.join('\n');
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [invoice, setInvoice] = useState<ApiInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    api
      .get(`/invoices/${id}`)
      .then((res) => setInvoice(res.data.data.invoice))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const businessName =
    (user as { businessName?: string })?.businessName ||
    (user as { name?: string })?.name ||
    'Your Business';
  const businessEmail =
    (user as { businessEmail?: string })?.businessEmail || user?.email || '';
  const businessPhone =
    (user as { businessPhone?: string })?.businessPhone ||
    (user as { phone?: string })?.phone ||
    '';
  const businessAddress = [
    (user as { businessAddress?: string })?.businessAddress,
    (user as { businessCity?: string })?.businessCity,
    (user as { businessState?: string })?.businessState,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSend = async () => {
    if (!invoice) return;
    setActionLoading('send');
    try {
      const res = await api.post(`/invoices/${id}/send`);
      setInvoice(res.data.data.invoice);
      showToast('Invoice sent successfully', 'success');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(ax?.response?.data?.message || 'Failed to send invoice', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async () => {
    setActionLoading('duplicate');
    try {
      const res = await api.post(`/invoices/${id}/duplicate`);
      const newInvoice = res.data.data.invoice;
      showToast('Invoice duplicated', 'success');
      router.push(`/invoices/${newInvoice.id}/edit`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(ax?.response?.data?.message || 'Failed to duplicate', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${id}`);
      showToast(`${invoice?.invoiceNumber} deleted`, 'success');
      router.push('/invoices');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(ax?.response?.data?.message || 'Failed to delete', 'error');
      setShowDeleteModal(false);
    }
  };

  const handlePaymentLink = async () => {
    setActionLoading('payment');
    try {
      const res = await api.get(`/invoices/${id}/payment-link`);
      const { paymentLink } = res.data.data;
      await navigator.clipboard.writeText(paymentLink);
      showToast('Payment link copied to clipboard', 'success');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(
        ax?.response?.data?.message || 'Failed to generate payment link',
        'error',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    setActionLoading('pdf');
    try {
      const res = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice?.invoiceNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Failed to download PDF', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoices
          </Link>
        </nav>
        <Card className="mb-6">
          <CardBody padding="lg">
            <Skeleton className="h-8 w-48" />
          </CardBody>
        </Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <Card>
          <CardBody padding="lg">
            <p className="text-gray-700 dark:text-gray-300">Invoice not found.</p>
            <Link
              href="/invoices"
              className="mt-2 inline-block text-sm text-orange-600 hover:underline"
            >
              Back to Invoices
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  const showPaymentSection = ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(
    invoice.status,
  );

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoices
        </Link>
      </nav>

      <Card className="mb-6">
        <CardBody padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {invoice.invoiceNumber}
              </h1>
              <Badge variant={getStatusBadgeVariant(invoice.status)} size="md">
                {invoice.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {invoice.status === 'DRAFT' && (
                <Button
                  variant="primary"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleSend}
                  disabled={!!actionLoading}
                >
                  Send Invoice
                </Button>
              )}
              <Link href={`/invoices/${id}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>
              {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <DropdownMenu
                  align="right"
                  trigger={
                    <Button variant="outline">
                      Send
                      <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  }
                >
                  <DropdownMenuItem onClick={handleSend}>
                    Send Now
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>Schedule</DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePaymentLink}>
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenu>
              )}
              <DropdownMenu
                align="right"
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    More
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem onClick={handleDuplicate}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPdf}>
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuDivider />
                <DropdownMenuItem variant="danger" onClick={() => setShowDeleteModal(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardBody padding="lg" className="relative">
              {invoice.status === 'PAID' && (
                <div className="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center">
                  <span
                    className="text-8xl font-black text-green-500/20"
                    style={{ transform: 'rotate(-15deg)', letterSpacing: '0.05em' }}
                  >
                    PAID
                  </span>
                </div>
              )}
              <div className="space-y-8">
                <div className="flex flex-col gap-6 border-b border-gray-200 pb-6 dark:border-gray-700 sm:flex-row sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {businessName}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {businessEmail}
                    </p>
                    {businessPhone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {businessPhone}
                      </p>
                    )}
                    {businessAddress && (
                      <p className="mt-1 whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">
                        {businessAddress}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Issue date: {formatDate(invoice.issueDate)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Due date: {formatDate(invoice.dueDate)}
                    </p>
                    <Badge
                      variant={getStatusBadgeVariant(invoice.status)}
                      size="sm"
                      className="mt-2"
                    >
                      {invoice.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Bill To
                  </h3>
                  <p className="mt-2 font-medium text-gray-900 dark:text-white">
                    {invoice.client.companyName}
                  </p>
                  {invoice.client.contactName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {invoice.client.contactName}
                    </p>
                  )}
                  {invoice.client.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {invoice.client.email}
                    </p>
                  )}
                  {invoice.client.billingAddress &&
                    formatAddress(invoice.client.billingAddress) && (
                      <p className="mt-1 whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">
                        {formatAddress(invoice.client.billingAddress)}
                      </p>
                    )}
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                          Rate
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                            {Number(item.quantity)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                            {formatCurrency(Number(item.rate), invoice.currency)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                            {formatCurrency(Number(item.amount), invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(Number(invoice.subtotal), invoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Tax ({Number(invoice.taxRate)}%)</span>
                      <span>
                        {formatCurrency(Number(invoice.taxAmount), invoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                      <span>Total</span>
                      <span>
                        {formatCurrency(Number(invoice.total), invoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Notes
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                      {invoice.notes}
                    </p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Terms
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                      {invoice.terms}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {showPaymentSection && (
            <Card>
              <CardHeader title="Payment information" />
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Due</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(Number(invoice.total), invoice.currency)}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handlePaymentLink}
                    disabled={!!actionLoading}
                  >
                    Generate Payment Link
                  </Button>
                  <p className="text-xs text-gray-500">
                    Payment link will appear here when generated.
                  </p>
                </div>
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      Payment history
                    </h4>
                    <div className="space-y-2">
                      {invoice.payments.map((pay) => (
                        <div
                          key={pay.id}
                          className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span>
                            {formatCurrency(Number(pay.amount), invoice.currency)} ·{' '}
                            {formatDate(pay.paidAt)}
                          </span>
                          <Badge variant="success" size="sm">
                            {pay.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Activity" />
            <CardBody>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm">
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Created on {formatDate(invoice.createdAt)}
                  </span>
                </li>
                {invoice.sentAt && (
                  <li className="flex gap-3 text-sm">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Sent on {formatDate(invoice.sentAt)}
                    </span>
                  </li>
                )}
                {invoice.paidAt && (
                  <li className="flex gap-3 text-sm">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Paid on {formatDate(invoice.paidAt)}
                    </span>
                  </li>
                )}
              </ul>
            </CardBody>
          </Card>

          {invoice.project && (
            <Card>
              <CardHeader title="Related" />
              <CardBody>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {invoice.project.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {invoice.project.status}
                </p>
                <Link
                  href="#"
                  className="mt-2 inline-block text-sm text-orange-600 hover:underline"
                >
                  View project →
                </Link>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
      >
        <ModalHeader
          title={`Delete ${invoice.invoiceNumber}?`}
          onClose={() => setShowDeleteModal(false)}
        />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              This invoice will be permanently deleted. This action cannot be
              undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Invoice
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
