'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import { useToast } from '@/components/UI/Toast';
import ContractDocument from '@/components/ContractDocument';
import { mockContracts, formatCurrency, type ContractStatus, type TemplateType } from '@/lib/mock-contracts';

const STATUS_CONFIG: Record<ContractStatus, { label: string; variant: string }> = {
  DRAFT:      { label: 'Draft',      variant: 'default' },
  SENT:       { label: 'Sent',       variant: 'info' },
  SIGNED:     { label: 'Signed',     variant: 'success' },
  EXPIRED:    { label: 'Expired',    variant: 'default' },
  TERMINATED: { label: 'Terminated', variant: 'danger' },
};

const TEMPLATE_LABELS: Record<TemplateType, string> = {
  service_agreement: 'Service Agreement',
  nda: 'NDA',
  sow: 'Statement of Work',
  freelance: 'Freelance Contract',
  consulting: 'Consulting Agreement',
  custom: 'Custom',
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

const STATUS_STEPS = ['DRAFT', 'SENT', 'SIGNED'] as const;

function StatusTimeline({ status, sentAt, signedAt }: {
  status: ContractStatus;
  sentAt?: string;
  signedAt?: string;
}) {
  const isTerminated = status === 'TERMINATED';
  const isExpired = status === 'EXPIRED';
  const currentStepIndex = isTerminated || isExpired
    ? 1
    : STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);

  const steps = [
    { key: 'DRAFT', label: 'Draft created', date: null },
    { key: 'SENT', label: 'Sent to client', date: sentAt },
    {
      key: isTerminated ? 'TERMINATED' : isExpired ? 'EXPIRED' : 'SIGNED',
      label: isTerminated ? 'Terminated' : isExpired ? 'Expired' : 'Signed',
      date: signedAt,
    },
  ];

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && status === 'SIGNED');
        const isCurrent = idx === currentStepIndex && status !== 'SIGNED';
        const isLast = idx === steps.length - 1;
        const isBadOutcome = (isTerminated || isExpired) && idx === 2;

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
                  <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
              </div>
              <p className={`mt-2 text-center text-xs font-medium ${
                isBadOutcome ? 'text-red-500' : isCompleted ? 'text-gray-900 dark:text-white' : isCurrent ? 'text-orange-600' : 'text-gray-400 dark:text-gray-600'
              }`}>
                {step.label}
              </p>
              {step.date && (
                <p className="mt-0.5 text-center text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(step.date)}
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

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);

  const contract = mockContracts.find(c => c.id === params.id);

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Contract not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/contracts')}>
          Back to Contracts
        </Button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[contract.status];

  const handleSend = () => {
    console.log(`=== POST /api/v1/contracts/${params.id}/send ===`);
    showToast('Contract sent to client', 'success');
  };

  const handleMarkSigned = () => {
    console.log(`=== POST /api/v1/contracts/${params.id}/sign ===`);
    showToast('Contract marked as signed', 'success');
  };

  const handleDelete = () => {
    console.log(`=== DELETE /api/v1/contracts/${params.id} ===`);
    showToast(`${contract.contractNumber} deleted`, 'success');
    router.push('/contracts');
  };

  const handleDuplicate = () => {
    console.log(`=== POST /api/v1/contracts/${params.id}/duplicate ===`);
    showToast('Contract duplicated', 'success');
    router.push('/contracts');
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <Link href="/contracts" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 dark:text-gray-400 transition-colors w-fit">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Contracts
      </Link>

      {/* Header card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{contract.title}</h1>
                <Badge variant={sc.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'}>{sc.label}</Badge>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {TEMPLATE_LABELS[contract.templateType]}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400">{contract.contractNumber}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{contract.clientName}</span>
                {contract.terms?.amount && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(contract.terms.amount, contract.terms.currency)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {contract.status === 'DRAFT' && (
                <button
                  type="button"
                  onClick={handleSend}
                  className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Send to Client
                </button>
              )}
              {contract.status === 'SENT' && (
                <button
                  type="button"
                  onClick={handleMarkSigned}
                  className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Mark as Signed
                </button>
              )}
              <Button variant="outline" onClick={() => router.push(`/contracts/${contract.id}/edit`)}>
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
                  console.log(`=== GET /api/v1/contracts/${params.id}/pdf ===`);
                  showToast('PDF download coming soon', 'info');
                }}>
                  Download PDF
                </DropdownMenuItem>
                {(contract.status === 'SENT') && (
                  <DropdownMenuItem onClick={handleSend}>Resend</DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteModal(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* SIGNED ceremony banner */}
      {contract.status === 'SIGNED' && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">
              Contract Signed
              {contract.signedAt && ` · ${formatDateLong(contract.signedAt)}`}
            </p>
            <p className="text-sm text-green-600">This contract is legally binding. Both parties have agreed to the terms.</p>
          </div>
        </div>
      )}

      {/* Awaiting signature banner */}
      {contract.status === 'SENT' && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-blue-800">
              Awaiting signature from {contract.clientName}. Sent {formatDate(contract.sentAt)}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkSigned}
            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shrink-0"
          >
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Mark as Signed →
          </button>
        </div>
      )}

      {/* Proposal link banner */}
      {contract.proposalId && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-5 py-3">
          <svg className="h-4 w-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="text-sm text-orange-700">
            Based on{' '}
            <Link href={`/proposals/${contract.proposalId}`} className="font-semibold underline hover:text-orange-900">
              {contract.proposalNumber}
            </Link>
          </p>
        </div>
      )}

      {/* Status timeline */}
      <Card className="mb-6">
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Contract Status</p>
          <StatusTimeline
            status={contract.status}
            sentAt={contract.sentAt}
            signedAt={contract.signedAt}
          />
        </CardBody>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2/3: Document */}
        <div className="space-y-6 lg:col-span-2">
          <ContractDocument
            content={contract.content}
            contractNumber={contract.contractNumber}
            title={contract.title}
          />
        </div>

        {/* Right 1/3: Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Client */}
          <Card>
            <CardHeader title="Client" />
            <CardBody>
              <div className="space-y-3">
                <div>
                  <Link
                    href={`/clients/${contract.clientId}`}
                    className="font-semibold text-orange-600 hover:underline"
                  >
                    {contract.clientName}
                  </Link>
                  {contract.clientContact && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{contract.clientContact}</p>
                  )}
                </div>
                {contract.clientEmail && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Email</p>
                    <a href={`mailto:${contract.clientEmail}`} className="text-sm text-gray-700 hover:text-orange-600 dark:text-gray-300 transition-colors">
                      {contract.clientEmail}
                    </a>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader title="Details" />
            <CardBody>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Status</span>
                  <Badge variant={sc.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'} size="sm">{sc.label}</Badge>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Type</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{TEMPLATE_LABELS[contract.templateType]}</span>
                </div>
                {contract.terms?.amount && (
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Value</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(contract.terms.amount, contract.terms.currency)}</span>
                  </div>
                )}
                {contract.startDate && (
                  <div className="py-3 flex items-center justify-between">
<span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Start Date</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(contract.startDate)}</span>
                  </div>
                )}
                {contract.endDate && (
                  <div className="py-3 flex items-center justify-between">
<span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">End Date</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(contract.endDate)}</span>
                  </div>
                )}
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Created</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(contract.createdAt)}</span>
                </div>
                {contract.sentAt && (
                  <div className="py-3 flex items-center justify-between">
<span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Sent</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(contract.sentAt)}</span>
                  </div>
                )}
                {contract.signedAt && (
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Signed</span>
                    <span className="text-sm font-semibold text-green-600">{formatDate(contract.signedAt)}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader title="Actions" />
            <CardBody>
              <div className="space-y-2">
                {contract.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={handleSend}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Send to Client
                  </button>
                )}
                {contract.status === 'SENT' && (
                  <button
                    type="button"
                    onClick={handleMarkSigned}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Mark as Signed
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => router.push(`/contracts/${params.id}/edit`)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Contract
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
                    console.log(`=== GET /api/v1/contracts/${params.id}/pdf ===`);
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
        <ModalHeader title="Delete Contract?" onClose={() => setDeleteModal(false)} />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{contract.contractNumber}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Permanently delete &quot;{contract.title}&quot;? This cannot be undone.
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
            Delete Contract
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
