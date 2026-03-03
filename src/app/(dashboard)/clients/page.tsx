'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { dashboardApi } from '@/lib/api';
import type { ApiClient, ApiPagination } from '@/types/api.types';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
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
import Pagination from '@/components/UI/Pagination';
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';
import UpgradeModal from '@/components/UI/UpgradeModal';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    amount,
  );
}

function formatPaymentTerms(terms: string) {
  const map: Record<string, string> = {
    NET_15: 'Net 15',
    NET_30: 'Net 30',
    NET_60: 'Net 60',
    DUE_ON_RECEIPT: 'Due on Receipt',
    CUSTOM: 'Custom',
  };
  return map[terms] || terms;
}

export default function ClientsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    clientId: string;
    companyName: string;
  }>({
    open: false,
    clientId: '',
    companyName: '',
  });
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [aggStats, setAggStats] = useState<{
    totalRevenue: number;
    outstanding: number;
    overdueCount: number;
  } | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await api.get(`/clients?${params}`);
      setClients(res.data.data.clients);
      setPagination(res.data.data.pagination);
    } catch {
      showToast('Failed to load clients', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, showToast]);

  const fetchAggStats = useCallback(async () => {
    try {
      const res = await dashboardApi.getOverview();
      const data = res.data.data.overview;
      setAggStats({
        totalRevenue: data.revenue?.total ?? 0,
        outstanding: data.outstanding?.total ?? 0,
        overdueCount: data.outstanding?.overdueCount ?? 0,
      });
    } catch {
      // silently fail — stats are supplementary
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchAggStats();
  }, [fetchAggStats]);

  const handleDelete = async (clientId: string, companyName: string) => {
    try {
      await api.delete(`/clients/${clientId}`);
      showToast(`${companyName} deleted`, 'success');
      setDeleteModal({ open: false, clientId: '', companyName: '' });
      fetchClients();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      const msg = ax?.response?.data?.message || 'Cannot delete this client';
      showToast(msg, 'error');
      setDeleteModal({ open: false, clientId: '', companyName: '' });
    }
  };

  const totalPages = pagination?.totalPages ?? 1;
  const effectivePage = Math.min(currentPage, Math.max(1, totalPages));

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Clients
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Manage your client relationships
          </p>
        </div>
        <div className='shrink-0'>
          <Button
            variant='primary'
            className='bg-orange-600 hover:bg-orange-700'
            onClick={() => router.push('/clients/new')}
          >
            Add Client
          </Button>
        </div>
      </div>

      <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Total Clients
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
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </div>
            </div>
            {isLoading ? (
              <Skeleton className='mt-3 h-9 w-20' />
            ) : (
              <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
                {pagination?.total ?? 0}
              </p>
            )}
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              active relationships
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Total Revenue
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
            {aggStats === null ? (
              <Skeleton className='mt-3 h-9 w-24' />
            ) : (
              <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
                {formatCurrency(aggStats?.totalRevenue ?? 0, 'USD')}
              </p>
            )}
            <p className='mt-1 text-sm font-medium text-green-600'>
              collected to date
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Outstanding
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
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
            {aggStats === null ? (
              <Skeleton className='mt-3 h-9 w-24' />
            ) : (
              <p className='mt-3 text-3xl font-bold text-gray-900 dark:text-white'>
                {formatCurrency(aggStats?.outstanding ?? 0, 'USD')}
              </p>
            )}
            <p className='mt-1 text-sm font-medium text-orange-600'>
              awaiting payment
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding='lg'>
            <div className='flex items-start justify-between'>
              <p className='text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Overdue Invoices
              </p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${(aggStats?.overdueCount ?? 0) > 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}
              >
                <svg
                  className={`h-5 w-5 ${(aggStats?.overdueCount ?? 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
                  />
                </svg>
              </div>
            </div>
            {aggStats === null ? (
              <Skeleton className='mt-3 h-9 w-12' />
            ) : (
              <p
                className={`mt-3 text-3xl font-bold ${(aggStats?.overdueCount ?? 0) > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}
              >
                {aggStats?.overdueCount ?? 0}
              </p>
            )}
            <p
              className={`mt-1 text-sm font-medium ${(aggStats?.overdueCount ?? 0) > 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-600'}`}
            >
              {(aggStats?.overdueCount ?? 0) > 0 ? 'needs attention' : 'all clear'}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title='All clients'
          subtitle={`${pagination?.total ?? 0} client${(pagination?.total ?? 0) !== 1 ? 's' : ''}`}
          action={
            <Input
              type='search'
              placeholder='Search by name, contact, or email...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              containerClassName='w-full sm:w-72'
            />
          }
        />
        <CardBody padding='lg' className='overflow-visible'>
          {isLoading ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className='h-4 w-full' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-full' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-full' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-full' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-full' /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : clients.length === 0 ? (
            <EmptyState
              title='No clients found'
              description={
                searchQuery
                  ? 'Try adjusting your search.'
                  : 'Add your first client to get started.'
              }
              primaryAction={
                searchQuery
                  ? undefined
                  : {
                      label: 'Add Client',
                      onClick: () => router.push('/clients/new'),
                    }
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow
                      key={client.id}
                      className='cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <TableCell>
                        <div
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <Link
                            href={`/clients/${client.id}`}
                            className='font-medium text-orange-600 hover:underline'
                          >
                            {client.companyName}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className='text-gray-700 dark:text-gray-300'>
                        {client.contactName || (
                          <span className='text-gray-400'>—</span>
                        )}
                      </TableCell>
                      <TableCell className='text-gray-700 dark:text-gray-300'>
                        {client.email ? (
                          <a
                            href={`mailto:${client.email}`}
                            className='hover:text-orange-600 hover:underline'
                          >
                            {client.email}
                          </a>
                        ) : (
                          <span className='text-gray-400'>—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          {formatPaymentTerms(client.paymentTerms)}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <DropdownMenu
                            align='right'
                            trigger={
                              <button
                                type='button'
                                className='rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                aria-label='Actions'
                              >
                                <svg
                                  className='h-5 w-5'
                                  fill='currentColor'
                                  viewBox='0 0 20 20'
                                >
                                  <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                                </svg>
                              </button>
                            }
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/clients/${client.id}/edit`)
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant='danger'
                              onClick={() =>
                                setDeleteModal({
                                  open: true,
                                  clientId: client.id,
                                  companyName: client.companyName,
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
          setDeleteModal({ open: false, clientId: '', companyName: '' })
        }
        size='sm'
      >
        <ModalHeader
          title={`Delete ${deleteModal.companyName}?`}
          onClose={() =>
            setDeleteModal({ open: false, clientId: '', companyName: '' })
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
              This client and all associated data will be permanently deleted.
              Clients with existing invoices cannot be deleted.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            onClick={() =>
              setDeleteModal({ open: false, clientId: '', companyName: '' })
            }
          >
            Cancel
          </Button>
          <button
            onClick={() =>
              handleDelete(deleteModal.clientId, deleteModal.companyName)
            }
            className='rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
          >
            Delete Client
          </button>
        </ModalFooter>
      </Modal>
      <UpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        feature='clients'
        used={0}
        limit={0}
      />
    </div>
  );
}
