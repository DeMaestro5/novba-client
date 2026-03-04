'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import Table, { TableRow, TableCell, TableHeader, TableBody, TableHead } from '@/components/UI/Table';
import { useToast } from '@/components/UI/Toast';

type ProposalStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'DECLINED' | 'EXPIRED';

interface LineItemRow {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  order: number;
}

interface ProposalClient {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
}

interface ApiProposal {
  id: string;
  proposalNumber: string;
  title: string;
  status: ProposalStatus;
  scope: string | null;
  terms: string | null;
  currency: string;
  totalAmount: number;
  validUntil: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  lineItems: LineItemRow[];
  client: ProposalClient;
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB');
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(value));
}

function getStatusBadgeVariant(
  status: ProposalStatus
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'SENT':
      return 'info';
    case 'VIEWED':
      return 'default'; // use className for purple
    case 'APPROVED':
      return 'success';
    case 'DECLINED':
      return 'danger';
    case 'EXPIRED':
      return 'default'; // use className for orange
    default:
      return 'default';
  }
}

function getStatusBadgeClassName(status: ProposalStatus): string {
  if (status === 'VIEWED')
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
  if (status === 'EXPIRED')
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
  return '';
}

function getStatusLabel(status: ProposalStatus): string {
  const labels: Record<ProposalStatus, string> = {
    DRAFT: 'Draft',
    SENT: 'Sent',
    VIEWED: 'Viewed',
    APPROVED: 'Approved',
    DECLINED: 'Declined',
    EXPIRED: 'Expired',
  };
  return labels[status] ?? status;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const id = params?.id as string;

  const [proposal, setProposal] = useState<ApiProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fetchProposal = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      setNotFound(true);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await api.get<{ data: { proposal: ApiProposal } }>(`/proposals/${id}`);
      const p = res.data?.data?.proposal;
      if (p) setProposal(p);
      else setNotFound(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) setNotFound(true);
      else showToast('Failed to load proposal', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  const handleSend = async () => {
    if (!id) return;
    setActionLoading('send');
    try {
      await api.post(`/proposals/${id}/send`);
      showToast('Proposal sent to client', 'success');
      fetchProposal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!id || !proposal) return;
    setActionLoading('pdf');
    try {
      const res = await api.get(`/proposals/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${proposal.proposalNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('PDF downloaded', 'success');
    } catch {
      showToast('Failed to download PDF', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    setActionLoading('duplicate');
    try {
      await api.post(`/proposals/${id}/duplicate`);
      showToast('Proposal duplicated', 'success');
      router.push('/proposals');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to duplicate';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await api.delete(`/proposals/${id}`);
      showToast('Proposal deleted', 'success');
      router.push('/proposals');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete';
      showToast(msg, 'error');
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  const handleConvertToContract = async () => {
    if (!id) return;
    setActionLoading('convert');
    try {
      await api.post(`/proposals/${id}/convert-to-contract`);
      showToast('Contract created', 'success');
      router.push('/contracts');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to convert';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-40" />
        </nav>
        <Card className="mb-6">
          <CardBody padding="lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </CardBody>
        </Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8 flex flex-col items-center justify-center min-h-[40vh]">
        <p className="text-gray-700 dark:text-gray-300">Proposal not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/proposals')}>
          Back to Proposals
        </Button>
      </div>
    );
  }

  if (!proposal) return null;

  const scVariant = getStatusBadgeVariant(proposal.status);
  const scClassName = getStatusBadgeClassName(proposal.status);
  const preparedByName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email : '—';
  const preparedByEmail = user?.email ?? '';

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Proposals
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">{proposal.proposalNumber}</span>
      </nav>

      {/* Header */}
      <Card className="mb-6 border-b-2 border-orange-100 bg-gradient-to-br from-white to-orange-50/30 dark:border-orange-900/30 dark:from-gray-900 dark:to-orange-950/10">
        <CardBody padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{proposal.proposalNumber}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{proposal.title}</h1>
                <Badge variant={scVariant} className={scClassName}>
                  {getStatusLabel(proposal.status)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Created {formatDate(proposal.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {proposal.status === 'DRAFT' && (
                <Button
                  variant="primary"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleSend}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'send' ? (
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4a8 8 0 018-8z" />
                    </svg>
                  ) : (
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  Send Proposal
                </Button>
              )}
              {(proposal.status === 'SENT' || proposal.status === 'VIEWED') && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </button>
              )}
              {proposal.status === 'APPROVED' && (
                <>
                  <Button
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleConvertToContract}
                    disabled={!!actionLoading}
                  >
                    Convert to Contract
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={!!actionLoading}>
                    Download PDF
                  </Button>
                </>
              )}
              {proposal.status === 'DRAFT' && (
                <Link href={`/proposals/${id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              )}
              <DropdownMenu
                align="right"
                trigger={
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
                {(proposal.status === 'DRAFT' || proposal.status === 'APPROVED' || proposal.status === 'DECLINED' || proposal.status === 'EXPIRED') && (
                  <DropdownMenuItem onClick={handleDownloadPdf}>Download PDF</DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
          {isConfirmingDelete && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Delete this proposal? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsConfirmingDelete(false)}>
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1 — Proposal summary */}
          <Card>
            <CardBody padding="lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {proposal.client.companyName}
              </h2>
              {proposal.client.contactName && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{proposal.client.contactName}</p>
              )}
              {proposal.client.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <a href={`mailto:${proposal.client.email}`} className="text-orange-600 hover:underline dark:text-orange-400">
                    {proposal.client.email}
                  </a>
                </p>
              )}
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Prepared by</span>
                  <span className="text-gray-900 dark:text-white">{preparedByName}</span>
                </div>
                {preparedByEmail && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{preparedByEmail}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Valid until</span>
                  <span className="text-gray-900 dark:text-white">
                    {proposal.validUntil ? formatDate(proposal.validUntil) : '—'}
                  </span>
                </div>
                {proposal.sentAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Sent at</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(proposal.sentAt)}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Card 2 — Scope (only if exists) */}
          {proposal.scope && (
            <Card>
              <CardHeader title="Scope of work" />
              <CardBody>
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                  <p className="whitespace-pre-wrap">{proposal.scope}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Card 3 — Pricing */}
          <Card>
            <CardHeader title="Pricing" />
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposal.lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="font-medium text-gray-900 dark:text-white">{item.description}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 dark:text-gray-400">{Number(item.quantity)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatCurrency(Number(item.rate), proposal.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(Number(item.amount), proposal.currency)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(Number(proposal.totalAmount), proposal.currency)}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Card 4 — Terms (only if exists) */}
          {proposal.terms && (
            <Card>
              <CardHeader title="Terms & conditions" />
              <CardBody>
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                  <p className="whitespace-pre-wrap">{proposal.terms}</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status timeline */}
          <Card>
            <CardHeader title="Status timeline" />
            <CardBody>
              {(() => {
                const events: { label: string; date: string }[] = [];
                if (proposal.createdAt) events.push({ label: 'Created', date: proposal.createdAt });
                if (proposal.sentAt) events.push({ label: 'Sent', date: proposal.sentAt });
                if (proposal.viewedAt) events.push({ label: 'Viewed', date: proposal.viewedAt });
                if (proposal.respondedAt) events.push({ label: 'Responded', date: proposal.respondedAt });
                return (
                  <ul className="border-l-2 border-gray-100 dark:border-gray-700 ml-[5px] pl-4 space-y-0">
                    {events.map((evt, idx) => {
                      const isLast = idx === events.length - 1;
                      return (
                        <li
                          key={evt.label}
                          className="relative pt-1 pb-3 first:pt-0 last:pb-0"
                        >
                          <span
                            className={`absolute -left-4 top-1.5 rounded-full bg-orange-500 -translate-x-1/2 ${
                              isLast
                                ? 'h-3 w-3 ring-2 ring-orange-200 dark:ring-orange-800/50 animate-pulse'
                                : 'h-2.5 w-2.5'
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{evt.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(evt.date)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </CardBody>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader title="Quick stats" />
            <CardBody>
              <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total value</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(Number(proposal.totalAmount), proposal.currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Line items</span>
                  <span className="text-gray-900 dark:text-white">{proposal.lineItems.length}</span>
                </div>
                <div className="flex justify-between pt-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Currency</span>
                  <span className="text-gray-900 dark:text-white">{proposal.currency}</span>
                </div>
                <div className="flex justify-between pt-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Valid until</span>
                  <span className="text-gray-900 dark:text-white">
                    {proposal.validUntil ? formatDate(proposal.validUntil) : 'No expiry'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
