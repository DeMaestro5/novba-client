'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { ApiInvoice, ApiPagination } from '@/types/api.types';
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
import TableActionsTrigger from '@/components/UI/TableActionsTrigger';
import EmptyState from '@/components/UI/EmptyState';
import Input from '@/components/UI/Input';
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/UI/Modal';
import Pagination from '@/components/UI/Pagination';
import Select from '@/components/UI/Select';
import { useToast } from '@/components/UI/Toast';
import UpgradeModal from '@/components/UI/UpgradeModal';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

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
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    invoiceId: string;
    invoiceNumber: string;
  }>({ open: false, invoiceId: '', invoiceNumber: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await api.get(`/invoices?${params}`);
      setInvoices(res.data.data.invoices);
      setPagination(res.data.data.pagination);
    } catch {
      showToast('Failed to load invoices', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch, showToast]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSend = async (invoiceId: string, invoiceNumber: string) => {
    setActionLoading(invoiceId);
    try {
      await api.post(`/invoices/${invoiceId}/send`);
      showToast(`${invoiceNumber} sent successfully`, 'success');
      fetchInvoices();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(
        ax?.response?.data?.message || 'Failed to send invoice',
        'error',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      const res = await api.post(`/invoices/${invoiceId}/duplicate`);
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
      await api.delete(`/invoices/${deleteModal.invoiceId}`);
      showToast(`${deleteModal.invoiceNumber} deleted`, 'success');
      setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' });
      fetchInvoices();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(ax?.response?.data?.message || 'Failed to delete', 'error');
      setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' });
    }
  };

  const totalPages = pagination?.totalPages ?? 1;
  const effectivePage = Math.min(currentPage, Math.max(1, totalPages));

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Invoices
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Manage and track all your invoices
          </p>
        </div>
        <div className='shrink-0'>
          <Button
            variant='primary'
            className='bg-orange-600 hover:bg-orange-700'
            onClick={() => router.push('/invoices/new')}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title='All invoices'
          subtitle={`${pagination?.total ?? 0} invoice${(pagination?.total ?? 0) !== 1 ? 's' : ''}`}
          action={
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <Input
                type='search'
                placeholder='Search by invoice # or client...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                containerClassName='w-full sm:w-64 max-w-full'
              />
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                placeholder='All statuses'
                containerClassName='w-full sm:w-44'
              />
            </div>
          }
        />
        <CardBody padding='lg' className='overflow-visible'>
          {isLoading ? (
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
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : invoices.length === 0 ? (
            <EmptyState
              title='No invoices found'
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
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className='cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                    >
                      <TableCell>
                        <div
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <Link
                            href={`/invoices/${inv.id}`}
                            className='font-medium text-orange-600 hover:underline'
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{inv.client.companyName}</TableCell>
                      <TableCell>{formatDate(inv.issueDate)}</TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(inv.total), inv.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(inv.status)}>
                          {inv.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <DropdownMenu
                            align='right'
                            trigger={<TableActionsTrigger />}
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/invoices/${inv.id}/edit`)
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(inv.id)}
                            >
                              Duplicate
                            </DropdownMenuItem>
                            {inv.status === 'DRAFT' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSend(inv.id, inv.invoiceNumber)
                                }
                              >
                                Send
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              variant='danger'
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
                <div className='mt-4'>
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
        size='sm'
      >
        <ModalHeader
          title={`Delete ${deleteModal.invoiceNumber}?`}
          onClose={() =>
            setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' })
          }
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
            <p className='text-sm text-gray-500'>
              This invoice will be permanently deleted. This action cannot be
              undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            onClick={() =>
              setDeleteModal({ open: false, invoiceId: '', invoiceNumber: '' })
            }
          >
            Cancel
          </Button>
          <button
            onClick={handleDelete}
            className='rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors'
          >
            Delete Invoice
          </button>
        </ModalFooter>
      </Modal>
      <UpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        feature='invoices'
        used={0}
        limit={0}
      />
    </div>
  );
}
