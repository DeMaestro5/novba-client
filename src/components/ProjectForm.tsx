'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import DatePicker from '@/components/UI/DatePicker';
import type {
  ProjectFormData,
  PaymentPlanRow,
  ProjectStatus,
  MilestoneStatus,
} from '@/types/project.types';
import { getDefaultProjectFormData } from '@/types/project.types';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On hold' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

const MILESTONE_STATUS_OPTIONS: { value: MilestoneStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
];

function generateRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface ProjectFormClientOption {
  id: string;
  companyName: string;
  contactName?: string | null;
  email?: string | null;
}

export interface ProjectFormProps {
  /** Omit for create mode (uses default); required for edit */
  initialData?: ProjectFormData;
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
  isSaving?: boolean;
  isEdit?: boolean;
  /** For edit mode: client info to show as read-only */
  client?: ProjectFormClientOption;
  /** For create mode: list of clients to select from (required to create project) */
  clients?: ProjectFormClientOption[];
}

export default function ProjectForm({
  initialData,
  onSave,
  onCancel,
  isSaving = false,
  isEdit = false,
  client,
  clients = [],
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData ?? getDefaultProjectFormData(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = useCallback((updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const updatePaymentPlan = useCallback((updater: (prev: PaymentPlanRow[]) => PaymentPlanRow[]) => {
    setFormData((prev) => ({ ...prev, paymentPlan: updater(prev.paymentPlan) }));
  }, []);

  const addMilestone = useCallback(() => {
    updatePaymentPlan((prev) => [
      ...prev,
      {
        id: generateRowId(),
        milestone: '',
        amount: 0,
        dueDate: '',
        status: 'pending',
      },
    ]);
  }, [updatePaymentPlan]);

  const removeMilestone = useCallback(
    (id: string) => {
      updatePaymentPlan((prev) => prev.filter((row) => row.id !== id));
    },
    [updatePaymentPlan],
  );

  const updateMilestone = useCallback(
    (id: string, field: keyof PaymentPlanRow, value: string | number) => {
      updatePaymentPlan((prev) =>
        prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    },
    [updatePaymentPlan],
  );

  const validate = useCallback((): boolean => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'Project name is required';
    if (formData.totalBudget < 0) next.totalBudget = 'Budget cannot be negative';
    if (!formData.startDate) next.startDate = 'Start date is required';
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      next.endDate = 'End date must be on or after start date';
    }
    if (!isEdit && !formData.clientId?.trim()) {
      next.clientId = 'Select a client';
    }
    const planSum = formData.paymentPlan.reduce((s, r) => s + r.amount, 0);
    if (formData.paymentPlan.length > 0 && planSum > 0 && formData.totalBudget > 0 && Math.abs(planSum - formData.totalBudget) > 0.01) {
      // Warning only, don't block
      next.paymentPlan = `Payment plan total (${planSum.toLocaleString()}) doesn't match project budget (${formData.totalBudget.toLocaleString()}).`;
    }
    setErrors(next);
    return !next.name && !next.totalBudget && !next.startDate && !next.endDate && !next.clientId;
  }, [formData, isEdit]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    const payload: ProjectFormData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate.trim() || '',
      totalBudget: Number(formData.totalBudget),
      currency: formData.currency,
      paymentPlan: formData.paymentPlan.map((row) => ({
        ...row,
        amount: Number(row.amount) || 0,
        dueDate: row.dueDate.trim(),
      })),
    };
    if (!isEdit && formData.clientId?.trim()) {
      payload.clientId = formData.clientId.trim();
    }
    onSave(payload);
  }, [formData, isEdit, validate, onSave]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Basic info */}
        <Card>
          <CardHeader title="Project details" subtitle="Name, dates, and budget" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Project name *"
                placeholder="e.g. Website Redesign & CMS"
                value={formData.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                error={errors.name}
                fullWidth
              />
              <TextArea
                label="Description"
                placeholder="Brief description of the project scope and deliverables..."
                value={formData.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                fullWidth
                minRows={3}
                className="resize-y"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DatePicker
                  label="Start date *"
                  value={formData.startDate ? new Date(formData.startDate + 'T12:00:00') : null}
                  onChange={(d) => updateForm({ startDate: d ? d.toISOString().slice(0, 10) : '' })}
                  placeholder="Select start date"
                  error={errors.startDate}
                />
                <DatePicker
                  label="End date"
                  value={formData.endDate ? new Date(formData.endDate + 'T12:00:00') : null}
                  onChange={(d) => updateForm({ endDate: d ? d.toISOString().slice(0, 10) : '' })}
                  placeholder="Select end date"
                  error={errors.endDate}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Total budget *"
                  type="number"
                  min={0}
                  step={1}
                  value={formData.totalBudget === 0 ? '' : formData.totalBudget}
                  onChange={(e) =>
                    updateForm({
                      totalBudget: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                  error={errors.totalBudget}
                  fullWidth
                />
                <Select
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                  value={formData.currency}
                  onChange={(value) => updateForm({ currency: value })}
                  fullWidth
                />
              </div>
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(value) => updateForm({ status: value as ProjectStatus })}
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Payment plan */}
        <Card>
          <CardHeader
            title="Payment plan"
            subtitle="Milestones and amounts. Sum can match total budget."
          />
          <CardBody>
            {errors.paymentPlan && (
              <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">{errors.paymentPlan}</p>
            )}
            <div className="space-y-4">
              {formData.paymentPlan.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
                  No milestones yet. Add at least one to define payment schedule.
                </p>
              ) : (
                <>
                  {/* Single header row — no labels on data rows to avoid duplication */}
                  <div className="grid grid-cols-[1fr_120px_160px_140px_40px] gap-3 pb-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Milestone</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Due date</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <div aria-hidden />
                  </div>
                  <div className="space-y-3">
                    {formData.paymentPlan.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[1fr_120px_160px_140px_40px] items-center gap-3"
                      >
                        <div className="min-w-0">
                          <Input
                            placeholder="e.g. Discovery & wireframes"
                            value={row.milestone}
                            onChange={(e) => updateMilestone(row.id, 'milestone', e.target.value)}
                            fullWidth
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={row.amount === 0 ? '' : row.amount}
                            onChange={(e) =>
                              updateMilestone(
                                row.id,
                                'amount',
                                e.target.value === '' ? 0 : Number(e.target.value),
                              )
                            }
                            fullWidth
                            className="h-10"
                          />
                        </div>
                        <div>
                          <DatePicker
                            value={row.dueDate ? new Date(row.dueDate + 'T12:00:00') : null}
                            onChange={(d) =>
                              updateMilestone(row.id, 'dueDate', d ? d.toISOString().slice(0, 10) : '')
                            }
                            placeholder="Due date"
                          />
                        </div>
                        <div>
                          <Select
                            options={MILESTONE_STATUS_OPTIONS}
                            value={row.status}
                            onChange={(value) =>
                              updateMilestone(row.id, 'status', value as MilestoneStatus)
                            }
                            fullWidth
                            containerClassName="[&_button]:h-10"
                          />
                        </div>
                        <div className="flex items-center justify-center h-10">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMilestone(row.id)}
                            className="min-w-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:border-gray-600 dark:bg-gray-800"
                            aria-label="Remove milestone"
                          >
                            <svg
                              className="h-5 w-5"
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
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addMilestone}
                className="w-full sm:w-auto dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add milestone
                </span>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right column: Client (edit: read-only; create: select) + Actions */}
      <div className="lg:col-span-1">
        <div className="space-y-6 lg:sticky lg:top-8">
          {isEdit && client && (
            <Card>
              <CardHeader title="Client" subtitle="Linked client (read-only)" />
              <CardBody>
                <p className="font-medium text-gray-900 dark:text-white">
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-orange-600 hover:underline dark:text-orange-400"
                  >
                    {client.companyName}
                  </Link>
                </p>
                {client.contactName && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {client.contactName}
                  </p>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="mt-1 block text-sm text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                  >
                    {client.email}
                  </a>
                )}
                <Link
                  href={`/clients/${client.id}`}
                  className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                >
                  View client →
                </Link>
              </CardBody>
            </Card>
          )}

          {!isEdit && clients.length > 0 && (
            <Card>
              <CardHeader title="Client" subtitle="Choose the client for this project" />
              <CardBody>
                <Select
                  label="Client *"
                  options={clients.map((c) => ({
                    value: c.id,
                    label: c.contactName
                      ? `${c.companyName} — ${c.contactName}`
                      : c.companyName,
                  }))}
                  value={formData.clientId ?? ''}
                  onChange={(value) => updateForm({ clientId: value })}
                  placeholder="Select a client"
                  error={errors.clientId}
                  fullWidth
                  searchable
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Don&apos;t see your client? <Link href="/clients/new" className="font-medium text-orange-600 hover:underline dark:text-orange-400">Add a client</Link> first.
                </p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Actions" />
            <CardBody>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create project'}
                </button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
