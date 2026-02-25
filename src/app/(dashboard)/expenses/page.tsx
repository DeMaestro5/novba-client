'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardBody, CardHeader } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Table, {
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
  TableHead,
} from '@/components/UI/Table';
import DropdownMenu, { DropdownMenuItem } from '@/components/UI/DropdownMenu';
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/UI/Modal';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { useToast } from '@/components/UI/Toast';
import DatePicker from '@/components/UI/DatePicker';
import {
  mockExpenses,
  formatCurrency,
  formatDate,
  formatDateShort,
  getCategoryTotals,
  CATEGORY_CONFIG,
  type MockExpense,
  type ExpenseCategory,
} from '@/lib/mock-expenses';

// ─── Constants ──────────────────────────────────────────────────────────────

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as ExpenseCategory[];

const USED_CATEGORIES: ExpenseCategory[] = [
  'SOFTWARE',
  'EQUIPMENT',
  'TRAVEL',
  'MEALS',
  'MARKETING',
  'OTHER',
];

// ─── Category Badge ──────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ExpenseCategory }) {
  const config = CATEGORY_CONFIG[category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${config.lightBg} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
}

// ─── Tax Badge ───────────────────────────────────────────────────────────────

function TaxBadge({ deductible }: { deductible: boolean }) {
  if (deductible) {
    return (
      <span className='inline-flex items-center gap-1 text-xs font-semibold text-green-600'>
        <svg
          className='h-3.5 w-3.5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2.5}
            d='M5 13l4 4L19 7'
          />
        </svg>
        Deductible
      </span>
    );
  }
  return <span className='text-xs text-gray-400'>—</span>;
}

// ─── Category Breakdown Bar ──────────────────────────────────────────────────

function CategoryBreakdownBar({ expenses }: { expenses: MockExpense[] }) {
  const totals = getCategoryTotals(expenses);
  if (totals.length === 0) return null;

  return (
    <Card className='mb-6'>
      <CardBody padding='lg'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
              Spending by Category
            </h3>
            <p className='mt-0.5 text-xs text-gray-400 dark:text-gray-400'>
              Where your money is going
            </p>
          </div>
        </div>

        {/* Stacked bar */}
        <div className='mb-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
          {totals.map((item, i) => (
            <div
              key={item.category}
              className={`h-full transition-all duration-300 ${CATEGORY_CONFIG[item.category].color} ${i === 0 ? 'rounded-l-full' : ''} ${i === totals.length - 1 ? 'rounded-r-full' : ''}`}
              style={{ width: `${item.percentage}%` }}
              title={`${CATEGORY_CONFIG[item.category].label}: ${formatCurrency(item.total)} (${item.percentage.toFixed(1)}%)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className='flex flex-wrap gap-x-5 gap-y-2'>
          {totals.map((item) => (
            <div key={item.category} className='flex items-center gap-1.5'>
              <div
                className={`h-2 w-2 rounded-full ${CATEGORY_CONFIG[item.category].color}`}
              />
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {CATEGORY_CONFIG[item.category].label}
              </span>
              <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                {formatCurrency(item.total)}
              </span>
              <span className='text-xs text-gray-400 dark:text-gray-500'>
                ({item.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Add Expense Slide Panel ─────────────────────────────────────────────────

interface AddExpensePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: MockExpense) => void;
}

function AddExpensePanel({ isOpen, onClose, onAdd }: AddExpensePanelProps) {
  const [form, setForm] = useState({
    vendor: '',
    amount: '',
    category: '' as ExpenseCategory | '',
    description: '',
    taxDeductible: true,
    date: null as Date | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.vendor.trim()) e.vendor = 'Vendor is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Valid amount required';
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newExpense: MockExpense = {
      id: `exp${Date.now()}`,
      date: form.date!.toISOString().split('T')[0],
      vendor: form.vendor.trim(),
      amount: Number(form.amount),
      currency: 'USD',
      category: form.category as ExpenseCategory,
      description: form.description.trim() || undefined,
      taxDeductible: form.taxDeductible,
      createdAt: new Date().toISOString(),
    };
    onAdd(newExpense);
    setForm({
      vendor: '',
      amount: '',
      category: '',
      description: '',
      taxDeductible: true,
      date: null,
    });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm({
      vendor: '',
      amount: '',
      category: '',
      description: '',
      taxDeductible: true,
      date: null,
    });
    setErrors({});
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity'
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white dark:bg-gray-900 dark:border-l dark:border-gray-700 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-5'>
          <div>
            <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Add Expense</h2>
            <p className='mt-0.5 text-sm text-gray-400 dark:text-gray-400'>
              Record a new business expense
            </p>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-white transition-colors'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-6'>
          <div className='space-y-5'>
            {/* Vendor */}
            <Input
              label='Vendor *'
              placeholder='e.g. Adobe, Delta Airlines'
              value={form.vendor}
              onChange={(e) => update({ vendor: e.target.value })}
              error={errors.vendor}
              fullWidth
            />

            {/* Amount */}
            <Input
              label='Amount *'
              placeholder='0.00'
              type='number'
              value={form.amount}
              onChange={(e) => update({ amount: e.target.value })}
              error={errors.amount}
              fullWidth
            />

            {/* Date */}
            <DatePicker
              label='Date *'
              value={form.date}
              onChange={(date) => update({ date })}
              placeholder='Select date'
              error={errors.date}
            />

            {/* Category */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Category *
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {ALL_CATEGORIES.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  const selected = form.category === cat;
                  return (
                    <button
                      key={cat}
                      type='button'
                      onClick={() => update({ category: cat })}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-xs font-semibold transition-all duration-150 ${
                        selected
                          ? `${config.lightBg} ${config.textColor} border-current`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className='text-base leading-none'>
                        {config.icon}
                      </span>
                      {config.label}
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p className='mt-1.5 text-xs text-red-600'>{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder='What was this for?'
                rows={2}
                className='w-full rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-orange-500 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none transition-colors'
              />
            </div>

            {/* Tax Deductible toggle */}
            <div
              className={`flex items-center justify-between rounded-xl border-2 p-4 transition-colors ${form.taxDeductible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}
            >
              <div>
                <p
                  className={`text-sm font-semibold ${form.taxDeductible ? 'text-green-800' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  Tax Deductible
                </p>
                <p
                  className={`mt-0.5 text-xs ${form.taxDeductible ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  {form.taxDeductible
                    ? 'This expense is claimable at tax time'
                    : 'Mark if this is a business expense'}
                </p>
              </div>
              <button
                type='button'
                role='switch'
                aria-checked={form.taxDeductible}
                onClick={() => update({ taxDeductible: !form.taxDeductible })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${form.taxDeductible ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.taxDeductible ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-gray-100 dark:border-gray-700 px-6 py-4'>
          <div className='flex gap-3'>
            <Button variant='outline' onClick={handleClose} className='flex-1'>
              Cancel
            </Button>
            <button
              type='button'
              onClick={handleSubmit}
              className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors'
            >
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState(mockExpenses);
  const [activeCategory, setActiveCategory] = useState<ExpenseCategory | 'ALL'>(
    'ALL',
  );
  const [search, setSearch] = useState('');
  const [showTaxOnly, setShowTaxOnly] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MockExpense | null>(null);

  // ─── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const taxDeductible = expenses
      .filter((e) => e.taxDeductible)
      .reduce((s, e) => s + e.amount, 0);
    const thisMonth = expenses
      .filter((e) => new Date(e.date) >= thisMonthStart)
      .reduce((s, e) => s + e.amount, 0);

    const categoryTotals = getCategoryTotals(expenses);
    const topCategory = categoryTotals[0] ?? null;

    return { totalSpent, taxDeductible, thisMonth, topCategory };
  }, [expenses]);

  // ─── Filtered ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        const matchCat =
          activeCategory === 'ALL' || e.category === activeCategory;
        const matchTax = !showTaxOnly || e.taxDeductible;
        const matchSearch =
          !search ||
          e.vendor.toLowerCase().includes(search.toLowerCase()) ||
          e.description?.toLowerCase().includes(search.toLowerCase()) ||
          e.amount.toString().includes(search);
        return matchCat && matchTax && matchSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, activeCategory, showTaxOnly, search]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleAdd = (expense: MockExpense) => {
    setExpenses((prev) => [expense, ...prev]);
    showToast('Expense added', 'success');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    showToast('Expense deleted', 'success');
    setDeleteTarget(null);
  };

  const handleToggleTax = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, taxDeductible: !e.taxDeductible } : e,
      ),
    );
    showToast('Updated', 'success');
  };

  const currentMonthLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
        {/* Header */}
        <div className='mb-6 flex items-start justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Expenses</h1>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Track spending and maximize tax deductions
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => showToast('CSV export coming soon', 'info')}
              className='inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'
            >
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                />
              </svg>
              Export CSV
            </button>
            <button
              type='button'
              onClick={() => setPanelOpen(true)}
              className='inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors'
            >
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Add Expense
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {/* Total Spent */}
          <Card>
            <CardBody padding='lg'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                    Total Spent
                  </p>
                  <p className='mt-2 text-3xl font-black text-gray-900 dark:text-white'>
                    {formatCurrency(stats.totalSpent)}
                  </p>
                  <p className='mt-1.5 text-sm text-gray-400'>all time</p>
                </div>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tax Deductible — hero green, this is money back in pocket */}
          <Card className='border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'>
            <CardBody padding='lg'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-wider text-green-700'>
                    Tax Deductible
                  </p>
                  <p className='mt-2 text-3xl font-black text-green-700'>
                    {formatCurrency(stats.taxDeductible)}
                  </p>
                  <p className='mt-1.5 text-sm font-semibold text-green-600'>
                    claimable this year
                  </p>
                </div>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-green-100'>
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
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* This Month */}
          <Card>
            <CardBody padding='lg'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                    This Month
                  </p>
                  <p className='mt-2 text-3xl font-black text-gray-900 dark:text-white'>
                    {formatCurrency(stats.thisMonth)}
                  </p>
                  <p className='mt-1.5 text-sm text-gray-400'>
                    {currentMonthLabel}
                  </p>
                </div>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50'>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Top Category */}
          <Card>
            <CardBody padding='lg'>
              <div className='flex items-start justify-between'>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-bold uppercase tracking-wider text-gray-500'>
                    Top Category
                  </p>
                  {stats.topCategory ? (
                    <>
                      <p className='mt-2 text-3xl font-black text-gray-900 dark:text-white'>
                        {formatCurrency(stats.topCategory.total)}
                      </p>
                      <div className='mt-1.5 flex items-center gap-1.5'>
                        <div
                          className={`h-2 w-2 rounded-full ${CATEGORY_CONFIG[stats.topCategory.category].color}`}
                        />
                        <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
                          {CATEGORY_CONFIG[stats.topCategory.category].label}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className='mt-2 text-2xl font-bold text-gray-400'>—</p>
                  )}
                </div>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50'>
                  <svg
                    className='h-5 w-5 text-orange-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Category breakdown bar */}
        <CategoryBreakdownBar expenses={expenses} />

        {/* Table card */}
        <Card>
          <CardBody className='p-0'>
            {/* Category filter tabs */}
            <div className='flex items-center gap-1 overflow-x-auto border-b border-gray-200 px-4 pt-4 pb-0 scrollbar-hide'>
              {(['ALL', ...USED_CATEGORIES] as (ExpenseCategory | 'ALL')[]).map(
                (cat) => {
                  const count =
                    cat === 'ALL'
                      ? expenses.length
                      : expenses.filter((e) => e.category === cat).length;
                  const label =
                    cat === 'ALL' ? 'All' : CATEGORY_CONFIG[cat].label;
                  return (
                    <button
                      key={cat}
                      type='button'
                      onClick={() => setActiveCategory(cat)}
                      className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                        activeCategory === cat
                          ? 'border-orange-600 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                          activeCategory === cat
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            {/* Toolbar */}
            <div className='flex items-center justify-between px-4 py-3'>
              <div className='flex items-center gap-3'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
                  {filtered.length > 0 && (
                    <span className='ml-1 font-semibold text-gray-700 dark:text-gray-300'>
                      ·{' '}
                      {formatCurrency(
                        filtered.reduce((s, e) => s + e.amount, 0),
                      )}
                    </span>
                  )}
                </p>
                {/* Tax deductible toggle */}
                <button
                  type='button'
                  onClick={() => setShowTaxOnly(!showTaxOnly)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    showTaxOnly
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <svg
                    className='h-3 w-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2.5}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Tax Deductible Only
                </button>
              </div>
              <div className='relative w-64'>
                <svg
                  className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <input
                  type='text'
                  placeholder='Search expenses...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-orange-500 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20'
                />
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                  <svg
                    className='h-7 w-7 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <p className='font-semibold text-gray-900 dark:text-white'>No expenses found</p>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  {search
                    ? 'Try a different search term'
                    : 'Add your first expense to get started'}
                </p>
                <button
                  type='button'
                  onClick={() => setPanelOpen(true)}
                  className='mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors'
                >
                  Add Expense
                </button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='pl-6'>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      Description
                    </TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead className='text-right pr-4'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className='group hover:bg-gray-50 transition-colors'
                    >
                      {/* Date */}
                      <TableCell className='w-24 py-4 pl-6'>
                        <span className='text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap'>
                          {formatDateShort(expense.date)}
                        </span>
                      </TableCell>

                      {/* Vendor */}
                      <TableCell className='py-4 min-w-[140px]'>
                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                          {expense.vendor}
                        </p>
                      </TableCell>

                      {/* Category */}
                      <TableCell className='py-4'>
                        <CategoryBadge category={expense.category} />
                      </TableCell>

                      {/* Description */}
                      <TableCell className='hidden lg:table-cell py-4 max-w-[200px]'>
                        {expense.description && (
                          <p className='truncate text-xs text-gray-400 dark:text-gray-500 italic'>
                            {expense.description}
                          </p>
                        )}
                      </TableCell>

                      {/* Tax deductible */}
                      <TableCell className='py-4'>
                        <TaxBadge deductible={expense.taxDeductible} />
                      </TableCell>

                      {/* Amount */}
                      <TableCell className='py-4 text-right'>
                        <span className='text-base font-black text-gray-900 dark:text-white'>
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className='py-4 pr-4 text-right'>
                        <DropdownMenu
                          trigger={
                            <button className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-900 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-all'>
                              <svg
                                className='h-4 w-4'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <circle cx='12' cy='5' r='1.5' />
                                <circle cx='12' cy='12' r='1.5' />
                                <circle cx='12' cy='19' r='1.5' />
                              </svg>
                            </button>
                          }
                        >
                          <DropdownMenuItem
                            onClick={() => handleToggleTax(expense.id)}
                          >
                            {expense.taxDeductible
                              ? 'Mark Not Deductible'
                              : 'Mark as Deductible'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => setDeleteTarget(expense)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Add Expense Panel */}
      <AddExpensePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onAdd={handleAdd}
      />

      {/* Delete modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size='sm'
      >
        <ModalHeader
          title='Delete Expense?'
          onClose={() => setDeleteTarget(null)}
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
            <p className='font-semibold text-gray-900'>
              {deleteTarget?.vendor}
            </p>
            <p className='mt-1 text-2xl font-bold text-gray-900'>
              {deleteTarget &&
                formatCurrency(deleteTarget.amount, deleteTarget.currency)}
            </p>
            <p className='mt-2 text-sm text-gray-500'>
              Permanently delete this expense? This cannot be undone.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <button
            type='button'
            onClick={handleDelete}
            className='rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors'
          >
            Delete Expense
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
