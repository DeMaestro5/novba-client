'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Button from '@/components/UI/Button';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import DropdownMenu, {
  DropdownMenuItem,
  DropdownMenuDivider,
} from '@/components/UI/DropdownMenu';
import EmptyState from '@/components/UI/EmptyState';
import { useToast } from '@/components/UI/Toast';
import api from '@/lib/api';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

interface PaymentPlanItem {
  milestone: string;
  amount: number;
  dueDate?: string | null;
  status?: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  totalBudget: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paymentPlan: PaymentPlanItem[] | null;
  client: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string | null;
  };
  proposal?: {
    id: string;
    title: string;
    proposalNumber: string;
    totalAmount: number;
  } | null;
  contract?: {
    id: string;
    title: string;
    contractNumber: string;
    status: string;
  } | null;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    total: number;
    currency: string;
    status: string;
  }>;
  _count?: { invoices: number };
  totalInvoiced?: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateLong(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusVariant(status: ProjectStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'ACTIVE':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'ON_HOLD':
      return 'warning';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'default';
  }
}

function getInvoiceStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'SENT':
      return 'info';
    case 'OVERDUE':
      return 'danger';
    case 'PARTIALLY_PAID':
      return 'warning';
    case 'DRAFT':
      return 'default';
    default:
      return 'default';
  }
}

function milestoneStatusLabel(status?: string): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'invoiced':
      return 'Invoiced';
    case 'pending':
    default:
      return 'Pending';
  }
}

function milestoneStatusVariant(status?: string): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'invoiced':
      return 'info';
    case 'pending':
    default:
      return 'warning';
  }
}

// ─── Derived stats (matches backend getStats) ────────────────────────────────
function deriveStats(project: ProjectDetail) {
  const totalBudget = project.totalBudget;
  const invoices = project.invoices ?? [];
  const totalInvoiced = project.totalInvoiced ?? invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingAmount = invoices
    .filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.total, 0);
  const budgetUsed = totalBudget > 0 ? (totalInvoiced / totalBudget) * 100 : 0;
  const budgetRemaining = totalBudget - totalInvoiced;
  const totalInvoices = invoices.length > 0 ? invoices.length : (project._count?.invoices ?? 0);
  return {
    totalBudget,
    totalInvoiced,
    totalPaid,
    outstandingAmount,
    budgetUsed: Math.round(budgetUsed * 100) / 100,
    budgetRemaining,
    totalInvoices,
    paidInvoices: paidInvoices.length,
    currency: project.currency,
  };
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setPageLoading(true);
    api.get(`/projects/${id}`)
      .then((res) => {
        const data = res.data.data.project ?? res.data.data;
        setProject(data);
      })
      .catch(() => setPageError(true))
      .finally(() => setPageLoading(false));
  }, [id]);

  const stats = useMemo(() => (project ? deriveStats(project) : null), [project]);
  const invoices = project?.invoices ?? [];

  const handleDelete = useCallback(async () => {
    if (!project) return;
    if ((project._count?.invoices ?? 0) > 0) {
      showToast(
        'Cannot delete project with existing invoices. Unlink or delete those invoices first.',
        'error',
      );
      setShowDeleteModal(false);
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      showToast(`${project.name} deleted`, 'success');
      router.push('/projects');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Failed to delete project';
      showToast(msg, 'error');
    }
    setShowDeleteModal(false);
  }, [project, id, router, showToast]);

  if (!id) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <Card>
          <CardBody padding="lg">
            <p className="text-gray-700 dark:text-gray-300">Project not found.</p>
            <Link href="/projects" className="mt-2 inline-block text-sm text-orange-600 hover:underline dark:text-orange-400">
              Back to Projects
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="h-8 w-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }
  if (pageError) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <p className="text-gray-500">Failed to load project.</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
        </nav>
        <Card>
          <CardBody padding="lg">
            <p className="text-gray-700 dark:text-gray-300">Project not found.</p>
            <Link href="/projects" className="mt-2 inline-block text-sm text-orange-600 hover:underline dark:text-orange-400">
              Back to Projects
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Back nav */}
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
      </nav>

      {/* Header card */}
      <Card className="mb-6">
        <CardBody padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <Badge variant={getStatusVariant(project.status)} size="md">
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Client:{' '}
                <Link
                  href={`/clients/${project.client.id}`}
                  className="font-medium text-orange-600 hover:underline dark:text-orange-400"
                >
                  {project.client.companyName}
                </Link>
                {project.client.contactName && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {' '}
                    · {project.client.contactName}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => router.push(`/projects/${project.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="primary"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => router.push(`/invoices/new?projectId=${project.id}`)}
              >
                New Invoice
              </Button>
              <DropdownMenu
                align="right"
                trigger={
                  <Button
                    variant="outline"
                    className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    More
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </Button>
                }
              >
                <DropdownMenuItem onClick={() => router.push(`/invoices?projectId=${project.id}`)}>
                  View all invoices
                </DropdownMenuItem>
                <DropdownMenuDivider />
                <DropdownMenuItem variant="danger" onClick={() => setShowDeleteModal(true)}>
                  Delete project
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats row */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardBody padding="lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total budget</p>
              <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalBudget, stats.currency)}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody padding="lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Invoiced</p>
              <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalInvoiced, stats.currency)}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {stats.budgetUsed.toFixed(1)}% of budget
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody padding="lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Paid</p>
              <p className="mt-2 text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalPaid, stats.currency)}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody padding="lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Outstanding</p>
              <p className={`mt-2 text-xl font-bold ${stats.outstandingAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                {formatCurrency(stats.outstandingAmount, stats.currency)}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody padding="lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(Math.max(0, stats.budgetRemaining), stats.currency)}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody padding="lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Invoices</p>
              <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalInvoices}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {stats.paidInvoices} paid
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Budget progress bar */}
      {stats && stats.totalBudget > 0 && (
        <Card className="mb-6">
          <CardBody padding="lg">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget usage</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(stats.totalInvoiced, stats.currency)} of {formatCurrency(stats.totalBudget, stats.currency)} invoiced
                </p>
              </div>
              <div className="flex h-3 w-full max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all dark:bg-orange-400"
                  style={{ width: `${Math.min(100, stats.budgetUsed)}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                {stats.budgetUsed.toFixed(0)}%
              </span>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Overview, Payment plan, Invoices */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <Card>
            <CardHeader title="Overview" />
            <CardBody>
              {project.description ? (
                <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                  {project.description}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No description.</p>
              )}
              <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Start date</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatDateLong(project.startDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">End date</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatDateLong(project.endDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Currency</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{project.currency}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Payment plan */}
          <Card>
            <CardHeader
              title="Payment plan"
              subtitle={
                project.paymentPlan?.length
                  ? `${project.paymentPlan.length} milestone${project.paymentPlan.length !== 1 ? 's' : ''}`
                  : undefined
              }
            />
            <CardBody>
              {!project.paymentPlan?.length ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No payment plan defined.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {project.paymentPlan.map((item: PaymentPlanItem, index: number) => (
                    <li key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.milestone}</p>
                        {item.dueDate && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Due {formatDate(item.dueDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.amount, project.currency)}
                        </span>
                        <Badge variant={milestoneStatusVariant(item.status)} size="sm">
                          {milestoneStatusLabel(item.status)}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader
              title="Invoices"
              subtitle={`${stats?.totalInvoices ?? invoices.length} invoice${(stats?.totalInvoices ?? invoices.length) !== 1 ? 's' : ''}`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => router.push(`/invoices/new?projectId=${project.id}`)}
                >
                  New invoice
                </Button>
              }
            />
            <CardBody padding="lg">
              {invoices.length === 0 ? (
                <EmptyState
                  title="No invoices yet"
                  description={`Create an invoice and link it to this project to track payments.`}
                  primaryAction={{
                    label: 'New invoice',
                    onClick: () => router.push(`/invoices/new?projectId=${project.id}`),
                  }}
                />
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Invoice #</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Issue date</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Due date</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="border-b border-gray-100 last:border-0 dark:border-gray-700/50"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="font-medium text-orange-600 hover:underline dark:text-orange-400"
                            >
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(inv.issueDate)}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(inv.dueDate)}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(inv.total, inv.currency)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={getInvoiceStatusVariant(inv.status)} size="sm">
                              {inv.status.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: Client, Proposal, Contract, Activity */}
        <div className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader title="Client" />
            <CardBody>
              <p className="font-medium text-gray-900 dark:text-white">
                <Link
                  href={`/clients/${project.client.id}`}
                  className="text-orange-600 hover:underline dark:text-orange-400"
                >
                  {project.client.companyName}
                </Link>
              </p>
              {project.client.contactName && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.client.contactName}</p>
              )}
              {project.client.email && (
                <a
                  href={`mailto:${project.client.email}`}
                  className="mt-2 block text-sm text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  {project.client.email}
                </a>
              )}
              <Link
                href={`/clients/${project.client.id}`}
                className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
              >
                View client →
              </Link>
            </CardBody>
          </Card>

          {/* Linked proposal */}
          {project.proposal && (
            <Card>
              <CardHeader title="Linked proposal" />
              <CardBody>
                <p className="font-medium text-gray-900 dark:text-white">{project.proposal.title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {project.proposal.proposalNumber} · {formatCurrency(project.proposal.totalAmount, project.currency)}
                </p>
                <Link
                  href={`/proposals/${project.proposal.id}`}
                  className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                >
                  View proposal →
                </Link>
              </CardBody>
            </Card>
          )}

          {/* Linked contract */}
          {project.contract && (
            <Card>
              <CardHeader title="Linked contract" />
              <CardBody>
                <p className="font-medium text-gray-900 dark:text-white">{project.contract.title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {project.contract.contractNumber} · {project.contract.status}
                </p>
                <Link
                  href={`/contracts/${project.contract.id}`}
                  className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                >
                  View contract →
                </Link>
              </CardBody>
            </Card>
          )}

          {/* Activity */}
          <Card>
            <CardHeader title="Activity" />
            <CardBody>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm">
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Created {formatDateLong(project.createdAt)}
                  </span>
                </li>
                <li className="flex gap-3 text-sm">
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Last updated {formatDateLong(project.updatedAt)}
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
      >
        <ModalHeader
          title={`Delete ${project.name}?`}
          onClose={() => setShowDeleteModal(false)}
        />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This project will be permanently deleted. Projects with linked invoices cannot be
              deleted — unlink or delete those invoices first.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete project
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
