'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import { useToast } from '@/components/UI/Toast';

// ─── Types ─────────────────────────────────────────────────────────────────

type ExpenseCategory =
  | 'SOFTWARE'
  | 'EQUIPMENT'
  | 'OFFICE_SUPPLIES'
  | 'TRAVEL'
  | 'MEALS'
  | 'MARKETING'
  | 'PROFESSIONAL_SERVICES'
  | 'UTILITIES'
  | 'RENT'
  | 'INSURANCE'
  | 'TAXES'
  | 'OTHER';

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'SOFTWARE',
  'EQUIPMENT',
  'OFFICE_SUPPLIES',
  'TRAVEL',
  'MEALS',
  'MARKETING',
  'PROFESSIONAL_SERVICES',
  'UTILITIES',
  'RENT',
  'INSURANCE',
  'TAXES',
  'OTHER',
];

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({
  value: c,
  label: formatCategory(c),
}));

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'NGN', label: 'NGN' },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { showToast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    amount: '',
    currency: 'USD',
    category: '' as ExpenseCategory | '',
    description: '',
    taxDeductible: false,
    receiptUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) {
      setPageError(true);
      setPageLoading(false);
      return;
    }
    api
      .get(`/expenses/${id}`)
      .then((res) => {
        const data = res.data?.data;
        const e = data?.expense ?? data;
        if (!e) {
          setPageError(true);
          return;
        }
        setForm({
          date: new Date(e.date).toISOString().split('T')[0],
          vendor: e.vendor ?? '',
          amount: String(e.amount ?? ''),
          currency: e.currency ?? 'USD',
          category: e.category ?? '',
          description: e.description ?? '',
          taxDeductible: e.taxDeductible ?? false,
          receiptUrl: e.receiptUrl ?? '',
        });
      })
      .catch(() => setPageError(true))
      .finally(() => setPageLoading(false));
  }, [id]);

  const update = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.vendor.trim()) e.vendor = 'Vendor is required';
    if (!form.amount.trim()) e.amount = 'Amount is required';
    else {
      const num = Number(form.amount);
      if (isNaN(num) || num <= 0) e.amount = 'Amount must be a positive number';
    }
    if (!form.category) e.category = 'Category is required';
    if (!form.date.trim()) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !id) return;
    setIsSubmitting(true);
    try {
      const payload = {
        date: new Date(form.date).toISOString(),
        vendor: form.vendor.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description.trim() || undefined,
        taxDeductible: form.taxDeductible,
        receiptUrl: form.receiptUrl.trim() || undefined,
      };
      await api.put(`/expenses/${id}`, payload);
      showToast('Expense updated', 'success');
      router.push('/expenses');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <div className="flex items-center justify-center py-24">
          <svg
            className="h-8 w-8 animate-spin text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Failed to load expense. It may have been deleted.
          </p>
          <Link
            href="/expenses"
            className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Back to Expenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/expenses"
          className="flex items-center gap-1.5 hover:text-orange-600 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Expenses
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-gray-200">
          Edit Expense
        </span>
      </div>

      <div className="space-y-6">
        {/* Card 1 — Expense details */}
        <Card>
          <CardHeader title="Expense details" />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Vendor *"
                placeholder="e.g. Adobe, Delta Airlines"
                value={form.vendor}
                onChange={(e) => update({ vendor: e.target.value })}
                error={errors.vendor}
                fullWidth
              />
              <Input
                label="Date *"
                type="date"
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
                error={errors.date}
                fullWidth
              />
              <Input
                label="Amount *"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => update({ amount: e.target.value })}
                error={errors.amount}
                fullWidth
              />
              <Select
                label="Currency"
                options={CURRENCY_OPTIONS}
                value={form.currency}
                onChange={(v) => update({ currency: v as string })}
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Card 2 — Category */}
        <Card>
          <CardHeader title="Category" />
          <CardBody>
            <div className="space-y-4">
              <Select
                label="Category *"
                options={CATEGORY_OPTIONS}
                value={form.category}
                onChange={(v) => update({ category: v as ExpenseCategory | '' })}
                placeholder="Select category"
                error={errors.category}
                fullWidth
              />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax Deductible
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.taxDeductible}
                  onClick={() => update({ taxDeductible: !form.taxDeductible })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${form.taxDeductible ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${form.taxDeductible ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Card 3 — Additional details */}
        <Card>
          <CardHeader title="Additional details" />
          <CardBody>
            <div className="space-y-4">
              <TextArea
                label="Description"
                placeholder="What was this for?"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                fullWidth
                minRows={2}
              />
              <Input
                label="Receipt URL"
                placeholder="https://..."
                value={form.receiptUrl}
                onChange={(e) => update({ receiptUrl: e.target.value })}
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push('/expenses')}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {isSubmitting ? 'Saving...' : 'Update Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
