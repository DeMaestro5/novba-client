'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import Table, { TableRow, TableCell, TableHeader, TableBody, TableHead } from '@/components/UI/Table';
import { useToast } from '@/components/UI/Toast';
import { mockProposals, formatCurrency, type ProposalStatus } from '@/lib/mock-proposals';

const STATUS_CONFIG: Record<ProposalStatus, { label: string; variant: string; description: string }> = {
  DRAFT:    { label: 'Draft',    variant: 'default', description: 'Not yet sent to client' },
  SENT:     { label: 'Sent',     variant: 'info',    description: 'Awaiting client response' },
  VIEWED:   { label: 'Viewed',   variant: 'warning', description: 'Client has opened the proposal' },
  APPROVED: { label: 'Approved', variant: 'success', description: 'Client approved this proposal' },
  DECLINED: { label: 'Declined', variant: 'danger',  description: 'Client declined this proposal' },
  EXPIRED:  { label: 'Expired',  variant: 'default', description: 'Proposal validity has passed' },
};

// Status timeline steps
const STATUS_STEPS: ProposalStatus[] = ['DRAFT', 'SENT', 'VIEWED', 'APPROVED'];

function StatusTimeline({ status, sentAt, viewedAt, respondedAt }: {
  status: ProposalStatus;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
}) {
  const isDeclined = status === 'DECLINED';
  const isExpired = status === 'EXPIRED';
  const currentStepIndex = isDeclined || isExpired
    ? 2
    : STATUS_STEPS.indexOf(status);

  const steps = [
    { key: 'DRAFT', label: 'Draft created', date: null },
    { key: 'SENT', label: 'Sent to client', date: sentAt },
    { key: 'VIEWED', label: 'Viewed by client', date: viewedAt },
    {
      key: isDeclined ? 'DECLINED' : 'APPROVED',
      label: isDeclined ? 'Declined' : isExpired ? 'Expired' : 'Approved',
      date: respondedAt
    },
  ];

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && (status === 'APPROVED' || status === 'DECLINED'));
        const isCurrent = idx === currentStepIndex && status !== 'APPROVED' && status !== 'DECLINED';
        const isLast = idx === steps.length - 1;
        const isBadOutcome = (status === 'DECLINED' || status === 'EXPIRED') && idx === 3;

        return (
          <div key={step.key} className="flex flex-1 items-start">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                isBadOutcome
                  ? 'border-red-400 bg-red-50'
                  : isCompleted
                  ? 'border-green-500 bg-green-500'
                  : isCurrent
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800'
              }`}>
                {isBadOutcome ? (
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : isCompleted ? (
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                )}
              </div>
              <p className={`mt-2 text-center text-xs font-medium ${
                isBadOutcome ? 'text-red-500' : isCompleted ? 'text-gray-900 dark:text-white' : isCurrent ? 'text-orange-600' : 'text-gray-400 dark:text-gray-600'
              }`}>
                {step.label}
              </p>
              {step.date && (
                <p className="mt-0.5 text-center text-xs text-gray-400 dark:text-gray-500">
                  {new Date(step.date).toLocaleDateString()}
                </p>
              )}
            </div>
            {!isLast && (
              <div className={`mt-4 flex-1 border-t-2 ${
                idx < currentStepIndex ? 'border-green-400' : 'border-gray-200 dark:border-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);

  const proposal = mockProposals.find(p => p.id === params.id);

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Proposal not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/proposals')}>
          Back to Proposals
        </Button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[proposal.status];
  const isExpiringSoon = proposal.validUntil &&
    new Date(proposal.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    proposal.status !== 'APPROVED' && proposal.status !== 'DECLINED' && proposal.status !== 'EXPIRED';

  const handleSend = () => {
    console.log(`=== POST /api/v1/proposals/${params.id}/send ===`);
    showToast('Proposal sent to client', 'success');
  };

  const handleConvertToContract = () => {
    console.log(`=== POST /api/v1/proposals/${params.id}/convert-to-contract ===`);
    showToast('Convert to contract coming soon', 'info');
  };

  const handleDelete = () => {
    console.log(`=== DELETE /api/v1/proposals/${params.id} ===`);
    showToast(`${proposal.proposalNumber} deleted`, 'success');
    router.push('/proposals');
  };

  const handleDuplicate = () => {
    console.log(`=== POST /api/v1/proposals/${params.id}/duplicate ===`);
    showToast('Proposal duplicated', 'success');
    router.push('/proposals');
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <Link href="/proposals" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-600 transition-colors w-fit">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Proposals
      </Link>

      {/* Header card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{proposal.title}</h1>
                <Badge variant={sc.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'}>{sc.label}</Badge>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{proposal.proposalNumber}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{proposal.clientName}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(proposal.totalAmount, proposal.currency)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {proposal.status === 'DRAFT' && (
                <Button
                  variant="primary"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleSend}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send to Client
                </Button>
              )}
              {proposal.status === 'APPROVED' && (
                <button
                  type="button"
                  onClick={handleConvertToContract}
                  className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Convert to Contract
                </button>
              )}
              <Button variant="outline" onClick={() => router.push(`/proposals/${proposal.id}/edit`)}>
                Edit
              </Button>
              <DropdownMenu
                trigger={
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                    </svg>
                  </button>
                }
              >
                <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  console.log(`=== GET /api/v1/proposals/${params.id}/pdf ===`);
                  showToast('PDF download coming soon', 'info');
                }}>
                  Download PDF
                </DropdownMenuItem>
                {proposal.status === 'SENT' || proposal.status === 'VIEWED' ? (
                  <DropdownMenuItem onClick={handleSend}>Resend</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setDeleteModal(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Approved CTA banner */}
      {proposal.status === 'APPROVED' && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">This proposal has been approved!</p>
              <p className="text-sm text-green-600">Convert it to a contract to lock in the agreement.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleConvertToContract}
            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shrink-0"
          >
            Convert to Contract →
          </button>
        </div>
      )}

      {/* Expiring soon banner */}
      {isExpiringSoon && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm font-medium text-amber-800">
            This proposal expires on {new Date(proposal.validUntil).toLocaleDateString()}. Consider following up with {proposal.clientName}.
          </p>
        </div>
      )}

      {/* Status timeline */}
      <Card className="mb-6">
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Proposal Status</p>
          <StatusTimeline
            status={proposal.status}
            sentAt={proposal.sentAt}
            viewedAt={proposal.viewedAt}
            respondedAt={proposal.respondedAt}
          />
        </CardBody>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2/3: Proposal content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Scope */}
          {proposal.scope && (
            <Card>
              <CardHeader title="Scope of work" />
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{proposal.scope}</p>
              </CardBody>
            </Card>
          )}

          {/* Line items */}
          <Card>
            <CardHeader title="Pricing breakdown" />
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
                        <span className="text-gray-600 dark:text-gray-400">{item.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 dark:text-gray-400">{formatCurrency(item.rate, proposal.currency)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.amount, proposal.currency)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Total row */}
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(proposal.totalAmount, proposal.currency)}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Terms */}
          {proposal.terms && (
            <Card>
              <CardHeader title="Terms & conditions" />
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{proposal.terms}</p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right 1/3: Sidebar */}
        <div className="space-y-6">
          {/* Client info */}
          <Card>
            <CardHeader title="Client" />
            <CardBody>
              <div className="space-y-3">
                <div>
                  <Link
                    href={`/clients/${proposal.clientId}`}
                    className="font-semibold text-orange-600 hover:underline"
                  >
                    {proposal.clientName}
                  </Link>
                  {proposal.clientContact && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{proposal.clientContact}</p>
                  )}
                </div>
                {proposal.clientEmail && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Email</p>
                    <a href={`mailto:${proposal.clientEmail}`} className="text-sm text-gray-700 hover:text-orange-600 dark:text-gray-300 transition-colors">
                      {proposal.clientEmail}
                    </a>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Proposal details */}
          <Card>
            <CardHeader title="Details" />
            <CardBody>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Status</span>
                  <Badge variant={sc.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">{sc.label}</Badge>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(proposal.totalAmount, proposal.currency)}</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Currency</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{proposal.currency}</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Valid Until</span>
                  <span className={`text-sm font-medium ${isExpiringSoon ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {new Date(proposal.validUntil).toLocaleDateString()}
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Created</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(proposal.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {proposal.sentAt && (
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Sent</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(proposal.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Actions" />
            <CardBody>
              <div className="space-y-2">
                {proposal.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={handleSend}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send to Client
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => router.push(`/proposals/${params.id}/edit`)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Proposal
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log(`=== GET /api/v1/proposals/${params.id}/pdf ===`);
                    showToast('PDF download coming soon', 'info');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-700" />
                <button
                  type="button"
                  onClick={() => setDeleteModal(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} size="sm">
        <ModalHeader title="Delete Proposal?" onClose={() => setDeleteModal(false)} />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{proposal.proposalNumber}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Permanently delete &quot;{proposal.title}&quot;? This cannot be undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Delete Proposal
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
