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
import TableActionsTrigger from '@/components/UI/TableActionsTrigger';
import EmptyPageState from '@/components/EmptyPageState';
import Input from '@/components/UI/Input';
import Pagination from '@/components/UI/Pagination';
import Select from '@/components/UI/Select';
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';
import {
  MOCK_PROJECTS,
  type MockProject,
  type ProjectStatus,
} from '@/lib/mock-projects';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On hold' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

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

function progressPercent(totalBudget: number, totalInvoiced: number): number {
  if (totalBudget <= 0) return 0;
  return Math.min(100, Math.round((totalInvoiced / totalBudget) * 100));
}

export default function ProjectsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    projectId: string;
    projectName: string;
  }>({ open: false, projectId: '', projectName: '' });

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (statusFilter) {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.companyName.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false),
      );
    }
    return list;
  }, [projects, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);
  const displayProjects = useMemo(() => {
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, effectivePage]);

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'ACTIVE').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    const totalBudget = projects
      .filter((p) => p.status === 'ACTIVE' || p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.totalBudget, 0);
    const totalInvoiced = projects.reduce((sum, p) => sum + (p.totalInvoiced ?? 0), 0);
    return { total: projects.length, active, completed, totalBudget, totalInvoiced };
  }, [projects]);

  const handleDeleteClick = (projectId: string, projectName: string) => {
    const project = projects.find((p) => p.id === projectId);
    const invoiceCount = project?._count?.invoices ?? 0;
    if (invoiceCount > 0) {
      showToast(
        'Cannot delete project with existing invoices. Unlink or delete invoices first.',
        'error',
      );
      return;
    }
    setDeleteModal({ open: true, projectId, projectName });
  };

  const handleDeleteConfirm = () => {
    setProjects((prev) => prev.filter((p) => p.id !== deleteModal.projectId));
    showToast(`${deleteModal.projectName} deleted`, 'success');
    setDeleteModal({ open: false, projectId: '', projectName: '' });
  };

  const isEmpty = projects.length === 0;

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Page header — always visible */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track deliverables, budgets, and invoices by project
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="primary"
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => router.push('/projects/new')}
          >
            New Project
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <div className="w-full min-h-[520px]">
          <EmptyPageState
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            badge="Projects"
            headline={"Keep every project on\ntrack and on budget"}
            subtext="Link clients, proposals, and contracts under one project. Track milestones, budgets, and payments in one place."
            benefits={[
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V5a2 2 0 00-2-2M5 11V5a2 2 0 012-2m0 0V5h14m-7 14v-6m0 0l-3 3m3-3l3 3" />
                  </svg>
                ),
                label: "Everything connected — proposal, contract, invoices",
                description: "One project view ties together your entire client workflow.",
              },
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: "Payment milestones — know what's paid vs outstanding",
                description: "Set a payment plan and track it automatically as invoices are paid.",
              },
              {
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: "Budget health at a glance",
                description: "See exactly how much you've billed vs the total project budget.",
              },
            ]}
            ctaLabel="Start First Project"
            ctaHref="/projects/new"
            stat={{ value: "40%", label: "less scope creep", context: "reported by freelancers who track projects with defined budgets" }}
            preview={
              <div className="mx-auto w-full max-w-sm space-y-3">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Sample project tracker</p>
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">E-commerce Redesign</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">TechStart Inc</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">Active</span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Budget used</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">$7,500 / $12,400</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-orange-500 transition-all" style={{ width: '60%' }} />
                  </div>
                  <p className="mt-1 text-right text-xs text-gray-400">60% complete</p>
                  <div className="mt-4 space-y-1.5">
                    {[
                      { label: 'Upfront (50%)', amount: '$6,200', paid: true },
                      { label: 'On delivery (50%)', amount: '$6,200', paid: false },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${m.paid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          <span className="text-gray-600 dark:text-gray-400">{m.label}</span>
                        </div>
                        <span className={`font-semibold ${m.paid ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}`}>{m.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <>
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Projects
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30">
                <svg
                  className="h-5 w-5 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              all time
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Active
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {stats.active}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              in progress
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Budget
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.totalBudget, 'USD')}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              across active & completed
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody padding="lg">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Invoiced to Date
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.totalInvoiced, 'USD')}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              collected from projects
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Projects table card */}
      <Card>
        <CardHeader
          title="All projects"
          subtitle={`${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
          action={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="search"
                placeholder="Search by name, client, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                containerClassName="w-full sm:w-72 max-w-full"
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
          {displayProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">No projects match your current filter.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                className="mt-2 text-sm text-orange-600 hover:underline dark:text-orange-500"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayProjects.map((project) => {
                    const percent = progressPercent(
                      project.totalBudget,
                      project.totalInvoiced ?? 0,
                    );
                    return (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <TableCell>
                          <div
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          >
                            <Link
                              href={`/projects/${project.id}`}
                              className="font-medium text-orange-600 hover:underline dark:text-orange-400"
                            >
                              {project.name}
                            </Link>
                            {project.description && (
                              <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/clients/${project.client.id}`}
                            className="font-medium text-orange-600 hover:underline dark:text-orange-400"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          >
                            {project.client.companyName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(project.status)}
                            size="sm"
                          >
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatDate(project.startDate)}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatDate(project.endDate)}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(project.totalBudget, project.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 min-w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-orange-500 dark:bg-orange-400 transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                              {percent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {project._count?.invoices ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          >
                            <DropdownMenu
                              align="right"
                              trigger={<TableActionsTrigger />}
                            >
                              <DropdownMenuItem
                                onClick={() => router.push(`/projects/${project.id}/edit`)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/invoices?projectId=${project.id}`)
                                }
                              >
                                View invoices
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="danger"
                                onClick={() =>
                                  handleDeleteClick(project.id, project.name)
                                }
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
        </>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, projectId: '', projectName: '' })
        }
        size="sm"
      >
        <ModalHeader
          title={deleteModal.projectName ? `Delete ${deleteModal.projectName}?` : 'Delete project?'}
          onClose={() =>
            setDeleteModal({ open: false, projectId: '', projectName: '' })
          }
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This project will be permanently deleted. Projects with linked
              invoices cannot be deleted — unlink or delete those invoices first.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() =>
              setDeleteModal({ open: false, projectId: '', projectName: '' })
            }
            className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Project
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
