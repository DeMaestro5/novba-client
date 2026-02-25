'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/UI/Table';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import EmptyState from '@/components/UI/EmptyState';
import Input from '@/components/UI/Input';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import Pagination from '@/components/UI/Pagination';
import Select from '@/components/UI/Select';
import { useToast } from '@/components/UI/Toast';

type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'PARTIALLY_PAID';

interface MockInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  client: { id: string; companyName: string; email?: string };
  issueDate: string;
  dueDate: string;
  total: number;
  currency: string;
  paidAt?: string;
  sentAt?: string;
}

const mockInvoices: MockInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-0001',
    status: 'PAID',
    client: { id: 'c1', companyName: 'Acme Corp', email: 'billing@acme.com' },
    issueDate: '2026-01-15',
    dueDate: '2026-02-14',
    total: 2400.0,
    currency: 'USD',
    paidAt: '2026-02-10',
  },
  {
    id: '2',
    invoiceNumber: 'INV-0002',
    status: 'SENT',
    client: {
      id: 'c2',
      companyName: 'TechStart Inc',
      email: 'finance@techstart.com',
    },
    issueDate: '2026-02-01',
    dueDate: '2026-03-01',
    total: 3600.0,
    currency: 'USD',
    sentAt: '2026-02-01',
  },
  {
    id: '3',
    invoiceNumber: 'INV-0003',
    status: 'OVERDUE',
    client: {
      id: 'c3',
      companyName: 'Design Studio',
      email: 'accounts@designstudio.com',
    },
    issueDate: '2026-01-10',
    dueDate: '2026-02-09',
    total: 1800.0,
    currency: 'USD',
    sentAt: '2026-01-10',
  },
  {
    id: '4',
    invoiceNumber: 'INV-0004',
    status: 'DRAFT',
    client: {
      id: 'c4',
      companyName: 'Growth Labs',
      email: 'billing@growthlabs.com',
    },
    issueDate: '2026-02-15',
    dueDate: '2026-03-15',
    total: 4200.0,
    currency: 'USD',
  },
  {
    id: '5',
    invoiceNumber: 'INV-0005',
    status: 'PARTIALLY_PAID',
    client: { id: 'c5', companyName: 'Solo Ventures', email: 'pay@soloventures.com' },
    issueDate: '2026-02-01',
    dueDate: '2026-03-02',
    total: 5500.0,
    currency: 'USD',
    sentAt: '2026-02-01',
  },
  {
    id: '6',
    invoiceNumber: 'INV-0006',
    status: 'CANCELLED',
    client: { id: 'c6', companyName: 'Legacy Co', email: 'billing@legacy.com' },
    issueDate: '2026-01-20',
    dueDate: '2026-02-19',
    total: 1200.0,
    currency: 'USD',
  },
  {
    id: '7',
    invoiceNumber: 'INV-0007',
    status: 'PAID',
    client: { id: 'c1', companyName: 'Acme Corp', email: 'billing@acme.com' },
    issueDate: '2025-12-01',
    dueDate: '2025-12-31',
    total: 1800.0,
    currency: 'USD',
    paidAt: '2025-12-28',
  },
  {
    id: '8',
    invoiceNumber: 'INV-0008',
    status: 'SENT',
    client: { id: 'c7', companyName: 'Cloud Nine', email: 'finance@cloudnine.io' },
    issueDate: '2026-02-10',
    dueDate: '2026-03-12',
    total: 2900.0,
    currency: 'USD',
    sentAt: '2026-02-10',
  },
  {
    id: '9',
    invoiceNumber: 'INV-0009',
    status: 'DRAFT',
    client: { id: 'c8', companyName: 'Pixel Perfect', email: 'billing@pixelperfect.com' },
    issueDate: '2026-02-18',
    dueDate: '2026-03-20',
    total: 3100.0,
    currency: 'USD',
  },
  {
    id: '10',
    invoiceNumber: 'INV-0010',
    status: 'OVERDUE',
    client: { id: 'c9', companyName: 'Startup Alpha', email: 'accounts@startupalpha.com' },
    issueDate: '2026-01-05',
    dueDate: '2026-02-04',
    total: 4500.0,
    currency: 'USD',
    sentAt: '2026-01-05',
  },
  {
    id: '11',
    invoiceNumber: 'INV-0011',
    status: 'PAID',
    client: { id: 'c3', companyName: 'Design Studio', email: 'accounts@designstudio.com' },
    issueDate: '2025-11-15',
    dueDate: '2025-12-15',
    total: 2200.0,
    currency: 'USD',
    paidAt: '2025-12-10',
  },
  {
    id: '12',
    invoiceNumber: 'INV-0012',
    status: 'SENT',
    client: { id: 'c10', companyName: 'DataFlow Inc', email: 'billing@dataflow.com' },
    issueDate: '2026-02-14',
    dueDate: '2026-03-16',
    total: 6700.0,
    currency: 'USD',
    sentAt: '2026-02-14',
  },
];

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
];

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

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function InvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    invoiceId: string;
    invoiceNumber: string;
  }>({ open: false, invoiceId: '', invoiceNumber: '' });

  const filteredInvoices = useMemo(() => {
    let list = mockInvoices;
    if (statusFilter) {
      list = list.filter((inv) => inv.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.client.companyName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [statusFilter, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)
  );
  const effectivePage = Math.min(currentPage, totalPages);
  const displayInvoices = useMemo(() => {
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvoices, effectivePage]);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track all your invoices
          </p>
        </div>
        <Link href="/invoices/new" className="shrink-0">
          <Button variant="primary" className="bg-orange-600 hover:bg-orange-700">
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader
          title="All invoices"
          subtitle={`${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''}`}
          action={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="search"
                placeholder="Search by invoice # or client..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                containerClassName="w-full sm:w-64 max-w-full"
              />
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                placeholder="All statuses"
                containerClassName="w-full sm:w-44"
              />
            </div>
          }
        />
        <CardBody padding="lg" className="overflow-visible">
          {displayInvoices.length === 0 ? (
            <EmptyState
              title="No invoices found"
              description={
                searchQuery || statusFilter
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first invoice to get started.'
              }
              primaryAction={
                searchQuery || statusFilter
                  ? undefined
                  : {
                      label: 'Create Invoice',
                      onClick: () => router.push('/invoices/new'),
                    }
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayInvoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                    >
                      <TableCell>
                        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="font-medium text-orange-600 hover:underline"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{inv.client.companyName}</TableCell>
                      <TableCell>{formatDate(inv.issueDate)}</TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell>
                        {formatCurrency(inv.total, inv.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(inv.status)}>
                          {inv.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <DropdownMenu
                          align="right"
                          trigger={
                            <button
                              type="button"
                              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              aria-label="Actions"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          }
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/invoices/${inv.id}/edit`)
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              sessionStorage.setItem(
                                'duplicateInvoice',
                                JSON.stringify({
                                  clientId: inv.client.id,
                                  currency: inv.currency,
                                }),
                              );
                              showToast('Opening duplicate...', 'info');
                              router.push('/invoices/new?duplicate=true');
                            }}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          {inv.status === 'DRAFT' && (
                            <DropdownMenuItem onClick={() => {}}>
                              Send
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="danger"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                invoiceId: inv.id,
                                invoiceNumber: inv.invoiceNumber,
                              })
                            }
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
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={effectivePage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showPageNumbers
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' })
        }
        size="sm"
      >
        <ModalHeader
          title={`Delete ${deleteModal.invoiceNumber}?`}
          onClose={() =>
            setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' })
          }
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
          <Button
            variant="outline"
            onClick={() =>
              setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' })
            }
          >
            Cancel
          </Button>
          <button
            onClick={() => {
              console.log('DELETE invoice:', deleteModal.invoiceId);
              showToast(`${deleteModal.invoiceNumber} deleted`, 'success');
              setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' });
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
