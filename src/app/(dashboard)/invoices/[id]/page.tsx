'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import DropdownMenu, {
  DropdownMenuItem,
  DropdownMenuDivider,
} from '@/components/UI/DropdownMenu';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';

type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'PARTIALLY_PAID';

const mockUser = {
  businessName: 'Novba',
  email: 'stephen@novba.com',
  phone: '+1 (555) 123-4567',
  address: '123 Freelance Ave, San Francisco, CA 94102',
};

const mockInvoiceDetail = {
  id: '1',
  invoiceNumber: 'INV-0001',
  status: 'PAID' as InvoiceStatus,
  issueDate: '2026-01-15',
  dueDate: '2026-02-14',
  subtotal: 2250.0,
  taxRate: 6.67,
  taxAmount: 150.0,
  total: 2400.0,
  currency: 'USD',
  notes: 'Thank you for your business!',
  terms: 'Payment due within 30 days.',
  paidAt: '2026-02-10',
  sentAt: '2026-01-15',
  client: {
    id: 'c1',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    email: 'billing@acme.com',
    billingAddress: {
      street: '123 Business St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'United States',
    },
  },
  project: {
    id: 'p1',
    name: 'Website Redesign',
    status: 'COMPLETED',
  },
  lineItems: [
    {
      id: 'li1',
      description: 'Website Design - Homepage',
      quantity: 1,
      rate: 1500.0,
      amount: 1500.0,
      order: 0,
    },
    {
      id: 'li2',
      description: 'Website Development - 3 Pages',
      quantity: 3,
      rate: 250.0,
      amount: 750.0,
      order: 1,
    },
  ],
  payments: [
    {
      id: 'pay1',
      amount: 2400.0,
      paidAt: '2026-02-10',
      paymentMethod: 'STRIPE',
      status: 'COMPLETED',
    },
  ],
};

function getStatusBadgeVariant(
  status: InvoiceStatus
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

function formatAddress(addr: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}): string {
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const id = params?.id as string;
  // In real app, fetch by id; for now use mock
  const invoice = mockInvoiceDetail;

  const showPaymentSection = ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(
    invoice.status
  );

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoices
        </Link>
      </nav>

      {/* Header Card */}
      <Card className="mb-6">
        <CardBody padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
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
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  }
                >
                  <DropdownMenuItem onClick={() => {}}>Send Now</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>Schedule</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>Copy Link</DropdownMenuItem>
                </DropdownMenu>
              )}
              <DropdownMenu
                align="right"
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    More
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem
                onClick={() => {
                  sessionStorage.setItem(
                    'duplicateInvoice',
                    JSON.stringify({
                      clientId: invoice.client.id,
                      currency: invoice.currency,
                      taxRate: invoice.taxRate,
                      notes: invoice.notes,
                      terms: invoice.terms,
                      lineItems: invoice.lineItems,
                    }),
                  );
                  showToast('Opening duplicate...', 'info');
                  router.push('/invoices/new?duplicate=true');
                }}
              >
                Duplicate
              </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Download PDF</DropdownMenuItem>
                <DropdownMenuDivider />
                <DropdownMenuItem
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice Preview - PDF style */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardBody padding="lg" className="relative">
              {invoice.status === 'PAID' && (
                <div
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none"
                >
                  <span
                    className="text-8xl font-black text-green-500/20"
                    style={{ transform: 'rotate(-15deg)', letterSpacing: '0.05em' }}
                  >
                    PAID
                  </span>
                </div>
              )}
              <div className="space-y-8">
                {/* Top row: Business info | Invoice info */}
                <div className="flex flex-col gap-6 border-b border-gray-200 pb-6 sm:flex-row sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {mockUser.businessName}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {mockUser.email}
                    </p>
                    <p className="text-sm text-gray-600">{mockUser.phone}</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                      {mockUser.address}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Issue date: {formatDate(invoice.issueDate)}
                    </p>
                    <p className="text-sm text-gray-600">
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

                {/* Bill To */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Bill To
                  </h3>
                  <p className="mt-2 font-medium text-gray-900">
                    {invoice.client.companyName}
                  </p>
                  {invoice.client.contactName && (
                    <p className="text-sm text-gray-600">
                      {invoice.client.contactName}
                    </p>
                  )}
                  {invoice.client.email && (
                    <p className="text-sm text-gray-600">{invoice.client.email}</p>
                  )}
                  {invoice.client.billingAddress && (
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
                      {formatAddress(invoice.client.billingAddress)}
                    </p>
                  )}
                </div>

                {/* Line items table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">
                          Rate
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-3 text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {formatCurrency(item.rate, invoice.currency)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            {formatCurrency(item.amount, invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(invoice.subtotal, invoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Tax ({invoice.taxRate}%)</span>
                      <span>
                        {formatCurrency(invoice.taxAmount, invoice.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>
                        {formatCurrency(invoice.total, invoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Notes
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                      {invoice.notes}
                    </p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Terms
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                      {invoice.terms}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right column: Payment, Activity, Related */}
        <div className="space-y-6">
          {showPaymentSection && (
            <Card>
              <CardHeader title="Payment information" />
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Due</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => {}}
                  >
                    Generate Payment Link
                  </Button>
                  <p className="text-xs text-gray-500">
                    Payment link will appear here when generated.
                  </p>
                </div>
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                      Payment history
                    </h4>
                    <div className="space-y-2">
                      {invoice.payments.map((pay) => (
                        <div
                          key={pay.id}
                          className="flex justify-between text-sm text-gray-700"
                        >
                          <span>
                            {formatCurrency(pay.amount, invoice.currency)} ·{' '}
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
                  <span className="text-gray-700">
                    Created on {formatDate(invoice.issueDate)}
                  </span>
                </li>
                {invoice.sentAt && (
                  <li className="flex gap-3 text-sm">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">
                      Sent on {formatDate(invoice.sentAt)}
                    </span>
                  </li>
                )}
                {invoice.paidAt && (
                  <li className="flex gap-3 text-sm">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">
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
                <p className="text-sm font-medium text-gray-900">
                  {invoice.project.name}
                </p>
                <p className="text-xs text-gray-500">{invoice.project.status}</p>
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
            onClick={() => {
              console.log('DELETE invoice:', invoice.id);
              showToast(`${invoice.invoiceNumber} deleted`, 'success');
              router.push('/invoices');
            }}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Delete Invoice
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
