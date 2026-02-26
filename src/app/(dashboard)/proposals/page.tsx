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
import UpgradeModal from '@/components/UI/UpgradeModal';
import { mockProposals, formatCurrency, type MockProposal, type ProposalStatus } from '@/lib/mock-proposals';

const MOCK_USAGE = {
  invoices: { used: 10, limit: 10 },
  clients: { used: 3, limit: 3 },
  proposals: { used: 5, limit: 5 },
  projects: { used: 3, limit: 3 },
  portfolio: { used: 3, limit: 3 },
};
const IS_FREE_TIER = true;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProposalStatus, { label: string; variant: string; color: string }> = {
  DRAFT:    { label: 'Draft',    variant: 'default',  color: 'text-gray-500' },
  SENT:     { label: 'Sent',     variant: 'info',     color: 'text-blue-600' },
  VIEWED:   { label: 'Viewed',   variant: 'warning',  color: 'text-amber-600' },
  APPROVED: { label: 'Approved', variant: 'success', color: 'text-green-600' },
  DECLINED: { label: 'Declined', variant: 'danger',   color: 'text-red-600' },
  EXPIRED:  { label: 'Expired',  variant: 'default',  color: 'text-gray-400' },
};

const FILTER_TABS: { label: string; value: ProposalStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Viewed', value: 'VIEWED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Declined', value: 'DECLINED' },
  { label: 'Expired', value: 'EXPIRED' },
];

export default function ProposalsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [proposals, setProposals] = useState(mockProposals);
  const [activeFilter, setActiveFilter] = useState<ProposalStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MockProposal | null>(null);
  const [upgradeModal, setUpgradeModal] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: proposals.length,
    totalValue: proposals.reduce((s, p) => s + p.totalAmount, 0),
    pendingResponse: proposals.filter(p => p.status === 'SENT' || p.status === 'VIEWED').length,
    approved: proposals.filter(p => p.status === 'APPROVED').length,
    approvedValue: proposals.filter(p => p.status === 'APPROVED').reduce((s, p) => s + p.totalAmount, 0),
  }), [proposals]);

  // Filtered list
  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      const matchesFilter = activeFilter === 'ALL' || p.status === activeFilter;
      const matchesSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.proposalNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [proposals, activeFilter, search]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setProposals(prev => prev.filter(p => p.id !== deleteTarget.id));
    showToast(`${deleteTarget.proposalNumber} deleted`, 'success');
    setDeleteTarget(null);
  };

  const handleDuplicate = (proposal: MockProposal) => {
    const newNum = `PROP-${String(proposals.length + 1).padStart(4, '0')}`;
    const dup = {
      ...proposal,
      id: `p${Date.now()}`,
      proposalNumber: newNum,
      status: 'DRAFT' as ProposalStatus,
      title: `${proposal.title} (Copy)`,
      sentAt: undefined, viewedAt: undefined, respondedAt: undefined,
      createdAt: new Date().toISOString(),
    };
    setProposals(prev => [dup, ...prev]);
    showToast(`Proposal duplicated as ${newNum}`, 'success');
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and track project proposals for clients</p>
        </div>
        <Button
          variant="primary"
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            if (IS_FREE_TIER && MOCK_USAGE.proposals.used >= MOCK_USAGE.proposals.limit) {
              setUpgradeModal(true);
            } else {
              router.push('/proposals/new');
            }
          }}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Proposal
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Proposals</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">all time</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Value</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
            <p className="mt-1 text-sm text-green-600 font-medium">pipeline value</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Awaiting Response</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stats.pendingResponse > 0 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <svg className={`h-5 w-5 ${stats.pendingResponse > 0 ? 'text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={`mt-3 text-3xl font-bold ${stats.pendingResponse > 0 ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
              {stats.pendingResponse}
            </p>
            <p className={`mt-1 text-sm font-medium ${stats.pendingResponse > 0 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-600'}`}>
              {stats.pendingResponse > 0 ? 'needs follow-up' : 'all clear'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Approved</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-green-600">{stats.approved}</p>
            <p className="mt-1 text-sm text-green-600 font-medium">{formatCurrency(stats.approvedValue)} won</p>
          </CardBody>
        </Card>
      </div>

      {/* Filter tabs + search */}
      <Card>
        <CardBody className="p-0">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-4 pb-0 scrollbar-hide">
            {FILTER_TABS.map((tab) => {
              const count = tab.value === 'ALL'
                ? proposals.length
                : proposals.filter(p => p.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                    activeFilter === tab.value
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                      activeFilter === tab.value ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
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
            <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} proposal{filtered.length !== 1 ? 's' : ''}</p>
            <div className="relative w-64">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search proposals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg className="h-7 w-7 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">No proposals found</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {search ? 'Try a different search term' : 'Create your first proposal to get started'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  className="mt-4 bg-orange-600 hover:bg-orange-700"
                  onClick={() => router.push('/proposals/new')}
                >
                  New Proposal
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((proposal) => {
                  const sc = STATUS_CONFIG[proposal.status];
                  const isExpiringSoon = proposal.validUntil &&
                    new Date(proposal.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    proposal.status !== 'APPROVED' && proposal.status !== 'DECLINED' && proposal.status !== 'EXPIRED';

                  return (
                    <TableRow
                      key={proposal.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => router.push(`/proposals/${proposal.id}`)}
                    >
                      <TableCell>
                        <div>
                          <Link
                            href={`/proposals/${proposal.id}`}
                            className="font-medium text-orange-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {proposal.proposalNumber}
                          </Link>
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{proposal.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{proposal.clientName}</p>
                          {proposal.clientContact && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{proposal.clientContact}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(proposal.totalAmount, proposal.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">{sc.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`text-sm ${isExpiringSoon ? 'font-semibold text-amber-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            {new Date(proposal.validUntil).toLocaleDateString()}
                          </p>
                          {isExpiringSoon && (
                            <p className="text-xs text-amber-500">Expiring soon</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu
                          trigger={
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>
                          }
                        >
                          <DropdownMenuItem onClick={() => router.push(`/proposals/${proposal.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(proposal)}>
                            Duplicate
                          </DropdownMenuItem>
                          {proposal.status === 'APPROVED' && (
                            <DropdownMenuItem onClick={() => {
                              console.log('POST /api/v1/proposals/:id/convert-to-contract');
                              showToast('Convert to contract coming soon', 'info');
                            }}>
                              Convert to Contract
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteTarget(proposal)}
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
        <ModalHeader title="Delete Proposal?" onClose={() => setDeleteTarget(null)} />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{deleteTarget?.proposalNumber}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will permanently delete &quot;{deleteTarget?.title}&quot;. This action cannot be undone.
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
            Delete Proposal
          </button>
        </ModalFooter>
      </Modal>
      <UpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        feature="proposals"
        used={MOCK_USAGE.proposals.used}
        limit={MOCK_USAGE.proposals.limit}
      />
    </div>
  );
}
