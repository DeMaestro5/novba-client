'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import Card, { CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Table, { TableRow, TableCell, TableHeader, TableBody, TableHead } from '@/components/UI/Table';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';
import { mockContracts, formatCurrency, type MockContract, type ContractStatus, type TemplateType } from '@/lib/mock-contracts';

const STATUS_CONFIG: Record<ContractStatus, { label: string; variant: string }> = {
  DRAFT:      { label: 'Draft',      variant: 'default' },
  SENT:       { label: 'Sent',       variant: 'info' },
  SIGNED:     { label: 'Signed',     variant: 'success' },
  EXPIRED:    { label: 'Expired',    variant: 'default' },
  TERMINATED: { label: 'Terminated', variant: 'danger' },
};

const TEMPLATE_CONFIG: Record<TemplateType, { label: string; variant: string }> = {
  service_agreement: { label: 'Service Agreement', variant: 'info' },
  nda:               { label: 'NDA',               variant: 'warning' },
  sow:               { label: 'SOW',               variant: 'warning' },
  freelance:         { label: 'Freelance',          variant: 'info' },
  consulting:        { label: 'Consulting',         variant: 'success' },
  custom:            { label: 'Custom',             variant: 'default' },
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateLong = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const FILTER_TABS: { label: string; value: ContractStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Signed', value: 'SIGNED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Terminated', value: 'TERMINATED' },
];

export default function ContractsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [contracts, setContracts] = useState(mockContracts);
  const [activeFilter, setActiveFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MockContract | null>(null);

  const stats = useMemo(() => ({
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'SIGNED').length,
    awaitingSignature: contracts.filter(c => c.status === 'SENT').length,
    totalValue: contracts
      .filter(c => c.status === 'SIGNED')
      .reduce((s, c) => s + (c.terms?.amount || 0), 0),
  }), [contracts]);

  const filtered = useMemo(() => {
    return contracts.filter(c => {
      const matchesFilter = activeFilter === 'ALL' || c.status === activeFilter;
      const matchesSearch = !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.clientName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [contracts, activeFilter, search]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setContracts(prev => prev.filter(c => c.id !== deleteTarget.id));
    showToast(`${deleteTarget.contractNumber} deleted`, 'success');
    setDeleteTarget(null);
  };

  const handleDuplicate = (contract: MockContract) => {
    const newNum = `CONT-${String(contracts.length + 1).padStart(4, '0')}`;
    const dup: MockContract = {
      ...contract,
      id: `c${Date.now()}`,
      contractNumber: newNum,
      status: 'DRAFT' as ContractStatus,
      title: `${contract.title} (Copy)`,
      sentAt: undefined,
      signedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContracts(prev => [dup, ...prev]);
    showToast(`Contract duplicated as ${newNum}`, 'success');
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage legally binding agreements</p>
        </div>
        <Button
          variant="primary"
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => router.push('/contracts/new')}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Contract
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Contracts */}
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Total Contracts</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="mt-1 text-sm text-gray-500">all time</p>
          </CardBody>
        </Card>

        {/* Signed */}
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Active Contracts</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-green-600">{stats.signed}</p>
            <p className="mt-1 text-sm text-green-600 font-medium">currently signed</p>
          </CardBody>
        </Card>

        {/* Awaiting Signature */}
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Awaiting Signature</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stats.awaitingSignature > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <svg className={`h-5 w-5 ${stats.awaitingSignature > 0 ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <p className={`mt-3 text-3xl font-bold ${stats.awaitingSignature > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
              {stats.awaitingSignature}
            </p>
            <p className={`mt-1 text-sm font-medium ${stats.awaitingSignature > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
              {stats.awaitingSignature > 0 ? 'needs signature' : 'all clear'}
            </p>
          </CardBody>
        </Card>

        {/* Total Value */}
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Contracted Value</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalValue) || '$0.00'}
            </p>
            <p className="mt-1 text-sm text-green-600 font-medium">locked in</p>
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
                ? contracts.length
                : contracts.filter(c => c.status === tab.value).length;
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
            <p className="text-sm text-gray-500">{filtered.length} contract{filtered.length !== 1 ? 's' : ''}</p>
            <div className="relative w-64">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search contracts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">No contracts found</p>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'Try a different search term' : 'Create your first contract to protect your work'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-4 bg-orange-600 hover:bg-orange-700"
                  onClick={() => router.push('/contracts/new')}
                >
                  New Contract
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(contract => {
                  const sc = STATUS_CONFIG[contract.status];
                  const tc = TEMPLATE_CONFIG[contract.templateType];
                  return (
                    <TableRow
                      key={contract.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                    >
                      <TableCell>
                        <div>
                          <Link
                            href={`/contracts/${contract.id}`}
                            className="font-medium text-orange-600 hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            {contract.contractNumber}
                          </Link>
                          <p className="mt-0.5 text-sm text-gray-600 line-clamp-1">{contract.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{contract.clientName}</p>
                          {contract.clientContact && (
                            <p className="text-xs text-gray-500">{contract.clientContact}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tc.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">
                          {tc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(contract.terms?.amount, contract.terms?.currency) || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          {contract.startDate && (
                            <span>{formatDate(contract.startDate)}</span>
                          )}
                          {contract.startDate && contract.endDate && (
                            <span className="mx-1 text-gray-400">→</span>
                          )}
                          {contract.endDate && (
                            <span>{formatDate(contract.endDate)}</span>
                          )}
                          {!contract.startDate && !contract.endDate && (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div onClick={e => e.stopPropagation()}>
                          <DropdownMenu
                            trigger={
                              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                                </svg>
                              </button>
                            }
                          >
                            <DropdownMenuItem onClick={() => router.push(`/contracts/${contract.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(contract)}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              console.log(`GET /api/v1/contracts/${contract.id}/pdf`);
                              showToast('PDF download coming soon', 'info');
                            }}>
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteTarget(contract)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <ModalHeader title="Delete Contract?" onClose={() => setDeleteTarget(null)} />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900">{deleteTarget?.contractNumber}</p>
            <p className="mt-2 text-sm text-gray-500">
              Permanently delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.
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
            Delete Contract
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
