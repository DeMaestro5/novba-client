'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { mockClients } from '@/lib/mock-clients';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import DropdownMenu, { DropdownMenuItem, DropdownMenuDivider } from '@/components/UI/DropdownMenu';
import EmptyState from '@/components/UI/EmptyState';
import { useToast } from '@/components/UI/Toast';

// Reuse mock invoice data scoped to this client
const mockClientInvoices: Record<string, { id: string; invoiceNumber: string; status: string; total: number; currency: string; dueDate: string; issueDate: string }[]> = {
  c1: [
    { id: '1', invoiceNumber: 'INV-0001', status: 'PAID', total: 2400, currency: 'USD', dueDate: '2026-02-14', issueDate: '2026-01-15' },
    { id: '7', invoiceNumber: 'INV-0007', status: 'PAID', total: 1800, currency: 'USD', dueDate: '2025-12-31', issueDate: '2025-12-01' },
  ],
  c2: [
    { id: '2', invoiceNumber: 'INV-0002', status: 'SENT', total: 3600, currency: 'USD', dueDate: '2026-03-01', issueDate: '2026-02-01' },
  ],
  c3: [
    { id: '3', invoiceNumber: 'INV-0003', status: 'OVERDUE', total: 1800, currency: 'USD', dueDate: '2026-02-09', issueDate: '2026-01-10' },
    { id: '11', invoiceNumber: 'INV-0011', status: 'PAID', total: 2200, currency: 'USD', dueDate: '2025-12-15', issueDate: '2025-11-15' },
  ],
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPaymentTerms(terms: string) {
  const map: Record<string, string> = {
    NET_15: 'Net 15', NET_30: 'Net 30', NET_60: 'Net 60',
    DUE_ON_RECEIPT: 'Due on Receipt', CUSTOM: 'Custom',
  };
  return map[terms] || terms;
}

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'PAID': return 'success';
    case 'SENT': return 'info';
    case 'OVERDUE': return 'danger';
    case 'PARTIALLY_PAID': return 'warning';
    case 'CANCELLED': return 'default';
    default: return 'default';
  }
}

function HealthScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-green-600 bg-green-50' : score >= 70 ? 'text-blue-600 bg-blue-50' : score >= 40 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
  const label = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${color}`}>
      <span className="text-lg font-bold">{score}</span>
      <span>{label}</span>
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id as string;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const client = mockClients.find((c) => c.id === id) ?? mockClients[0];
  const invoices = mockClientInvoices[client.id] ?? [];

  // Derived health score (simplified — API provides this)
  const healthScore = client.overdueCount === 0 && client.outstandingBalance === 0 ? 95
    : client.overdueCount > 0 ? 55
    : 80;

  const formatAddress = () => {
    if (!client.billingAddress) return null;
    const { street, city, state, zip, country } = client.billingAddress;
    const line2 = [city, state, zip].filter(Boolean).join(', ');
    return [street, line2, country].filter(Boolean).join('\n');
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Back nav */}
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </Link>
      </nav>

      {/* Header card */}
      <Card className="mb-6">
        <CardBody padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.companyName}</h1>
              {client.contactName && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{client.contactName}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/clients/${id}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>
              <Link href="/invoices/new">
                <Button variant="primary" className="bg-orange-600 hover:bg-orange-700">
                  Create Invoice
                </Button>
              </Link>
              <DropdownMenu
                align="right"
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    More
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem
                  onClick={() => {
                    if (client.email) {
                      navigator.clipboard.writeText(client.email);
                      showToast('Email copied to clipboard', 'success');
                    }
                  }}
                >
                  Copy Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/invoices?clientId=${client.id}`)}>
                  View All Invoices
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuDivider />
                <DropdownMenuItem variant="danger" onClick={() => setShowDeleteModal(true)}>
                  Delete Client
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Invoices</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{client.totalInvoices}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">invoices sent</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Revenue</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(client.totalRevenue, client.currency)}</p>
            <p className="mt-1 text-sm font-medium text-green-600">collected to date</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Outstanding</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${client.outstandingBalance > 0 ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <svg className={`h-5 w-5 ${client.outstandingBalance > 0 ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={`mt-3 text-3xl font-bold ${client.outstandingBalance > 0 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(client.outstandingBalance, client.currency)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{client.outstandingBalance > 0 ? 'awaiting payment' : 'fully paid up'}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Overdue</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${client.overdueCount > 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <svg className={`h-5 w-5 ${client.overdueCount > 0 ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            </div>
            <p className={`mt-3 text-3xl font-bold ${client.overdueCount > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {client.overdueCount}
            </p>
            <p className={`mt-1 text-sm font-medium ${client.overdueCount > 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-600'}`}>
              {client.overdueCount > 0 ? 'needs attention' : 'all clear'}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: invoices */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Invoices"
              subtitle={`${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`}
              action={
                <Link href="/invoices/new">
                  <Button variant="outline" size="sm">New Invoice</Button>
                </Link>
              }
            />
            <CardBody padding="lg">
              {invoices.length === 0 ? (
                <EmptyState
                  title="No invoices yet"
                  description={`Start billing ${client.companyName} by creating their first invoice.`}
                  primaryAction={{
                    label: 'Create Invoice',
                    onClick: () => router.push('/invoices/new'),
                  }}
                />
              ) : (
                <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 text-left font-semibold text-gray-700 dark:text-gray-300">Invoice #</th>
                      <th className="pb-3 text-left font-semibold text-gray-700 dark:text-gray-300">Issue Date</th>
                      <th className="pb-3 text-left font-semibold text-gray-700 dark:text-gray-300">Due Date</th>
                      <th className="pb-3 text-right font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="pl-4 pb-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700/50">
                        <td className="py-3">
                          <Link href={`/invoices/${inv.id}`} className="font-medium text-orange-600 hover:underline">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-gray-700 dark:text-gray-300">{formatDate(inv.issueDate)}</td>
                        <td className="py-3 text-gray-700 dark:text-gray-300">{formatDate(inv.dueDate)}</td>
                        <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(inv.total, inv.currency)}
                        </td>
                        <td className="pl-4 py-3">
                          <Badge variant={getStatusVariant(inv.status)} size="sm">
                            {inv.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invoices.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3 text-center">
                    <Link
                      href={`/invoices?clientId=${client.id}`}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      View all invoices for {client.companyName} →
                    </Link>
                  </div>
                )}
                </>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: client info + health */}
        <div className="space-y-6">
          {/* Client health */}
          <Card>
            <CardHeader title="Client Health" />
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Health Score</p>
                  <div className="mt-2">
                    <HealthScoreBadge score={healthScore} />
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      Based on payment history and overdue invoices
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Overdue invoices</span>
                  <span className={client.overdueCount > 0 ? 'font-semibold text-red-600' : 'text-gray-900 dark:text-white'}>
                    {client.overdueCount}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Payment rate</span>
                  <span className="text-gray-900 dark:text-white">
                    {client.totalInvoices > 0
                      ? `${Math.round(((client.totalInvoices - client.overdueCount) / client.totalInvoices) * 100)}%`
                      : '—'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Contact info */}
          <Card>
            <CardHeader title="Contact details" />
            <CardBody>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {client.email && (
                  <div className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Email</p>
                    <a href={`mailto:${client.email}`} className="mt-1 block text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Phone</p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{client.phone}</p>
                  </div>
                )}
                {formatAddress() && (
                  <div className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Billing Address</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">{formatAddress()}</p>
                  </div>
                )}
                <div className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Payment Terms</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatPaymentTerms(client.paymentTerms)}</p>
                </div>
                <div className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Currency</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{client.currency}</p>
                </div>
                {client.notes && (
                  <div className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Notes</p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{client.notes}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm">
        <ModalHeader title={`Delete ${client.companyName}?`} onClose={() => setShowDeleteModal(false)} />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              This client will be permanently deleted. Clients with existing invoices cannot be deleted — delete or reassign their invoices first.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <button
            onClick={() => {
              console.log('DELETE client:', client.id);
              showToast(`${client.companyName} deleted`, 'success');
              router.push('/clients');
            }}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Client
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
