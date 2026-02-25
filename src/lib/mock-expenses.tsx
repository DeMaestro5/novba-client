import type { ReactNode } from 'react';

export type ExpenseCategory =
  | 'OFFICE_SUPPLIES'
  | 'TRAVEL'
  | 'MEALS'
  | 'UTILITIES'
  | 'SOFTWARE'
  | 'EQUIPMENT'
  | 'MARKETING'
  | 'PROFESSIONAL_SERVICES'
  | 'RENT'
  | 'INSURANCE'
  | 'TAXES'
  | 'OTHER';

export interface MockExpense {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description?: string;
  taxDeductible: boolean;
  receiptUrl?: string;
  createdAt: string;
}

export const mockExpenses: MockExpense[] = [
  {
    id: 'exp1',
    date: '2026-01-05',
    vendor: 'Figma',
    amount: 144,
    currency: 'USD',
    category: 'SOFTWARE',
    description: 'Annual design tool subscription',
    taxDeductible: true,
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'exp2',
    date: '2026-01-08',
    vendor: 'Adobe Creative Cloud',
    amount: 599,
    currency: 'USD',
    category: 'SOFTWARE',
    description: 'Annual Creative Cloud subscription',
    taxDeductible: true,
    createdAt: '2026-01-08T10:00:00.000Z',
  },
  {
    id: 'exp3',
    date: '2026-01-15',
    vendor: 'Delta Airlines',
    amount: 420,
    currency: 'USD',
    category: 'TRAVEL',
    description: 'Flight to NYC client meeting',
    taxDeductible: true,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'exp4',
    date: '2026-01-18',
    vendor: 'Nobu Restaurant',
    amount: 180,
    currency: 'USD',
    category: 'MEALS',
    description: 'Client dinner — Acme Corp',
    taxDeductible: true,
    createdAt: '2026-01-18T10:00:00.000Z',
  },
  {
    id: 'exp5',
    date: '2026-01-22',
    vendor: 'Apple Store',
    amount: 2499,
    currency: 'USD',
    category: 'EQUIPMENT',
    description: 'MacBook Pro 16" M3',
    taxDeductible: true,
    createdAt: '2026-01-22T10:00:00.000Z',
  },
  {
    id: 'exp6',
    date: '2026-02-01',
    vendor: 'Notion',
    amount: 96,
    currency: 'USD',
    category: 'SOFTWARE',
    description: 'Annual Notion subscription',
    taxDeductible: true,
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'exp7',
    date: '2026-02-03',
    vendor: 'Equinox',
    amount: 60,
    currency: 'USD',
    category: 'OTHER',
    description: 'Monthly gym membership',
    taxDeductible: false,
    createdAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'exp8',
    date: '2026-02-06',
    vendor: 'Google Ads',
    amount: 350,
    currency: 'USD',
    category: 'MARKETING',
    description: 'February ad campaign',
    taxDeductible: true,
    createdAt: '2026-02-06T10:00:00.000Z',
  },
  {
    id: 'exp9',
    date: '2026-02-10',
    vendor: 'Blue Bottle Coffee',
    amount: 45,
    currency: 'USD',
    category: 'MEALS',
    description: 'Personal coffee — not business',
    taxDeductible: false,
    createdAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'exp10',
    date: '2026-02-14',
    vendor: 'Slack',
    amount: 96,
    currency: 'USD',
    category: 'SOFTWARE',
    description: 'Annual Slack Pro subscription',
    taxDeductible: true,
    createdAt: '2026-02-14T10:00:00.000Z',
  },
];

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  {
    label: string;
    color: string;
    textColor: string;
    lightBg: string;
    icon: ReactNode;
  }
> = {
  SOFTWARE: {
    label: 'Software',
    color: 'bg-violet-400',
    textColor: 'text-violet-700',
    lightBg: 'bg-violet-50',
    icon: (
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
          d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
        />
      </svg>
    ),
  },
  EQUIPMENT: {
    label: 'Equipment',
    color: 'bg-blue-400',
    textColor: 'text-blue-700',
    lightBg: 'bg-blue-50',
    icon: (
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
          d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        />
      </svg>
    ),
  },
  TRAVEL: {
    label: 'Travel',
    color: 'bg-sky-400',
    textColor: 'text-sky-700',
    lightBg: 'bg-sky-50',
    icon: (
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
          d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
        />
      </svg>
    ),
  },
  MEALS: {
    label: 'Meals',
    color: 'bg-amber-400',
    textColor: 'text-amber-700',
    lightBg: 'bg-amber-50',
    icon: (
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
          d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
        />
      </svg>
    ),
  },
  MARKETING: {
    label: 'Marketing',
    color: 'bg-orange-400',
    textColor: 'text-orange-700',
    lightBg: 'bg-orange-50',
    icon: (
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
          d='M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
        />
      </svg>
    ),
  },
  OFFICE_SUPPLIES: {
    label: 'Office Supplies',
    color: 'bg-teal-400',
    textColor: 'text-teal-700',
    lightBg: 'bg-teal-50',
    icon: (
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
          d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
        />
      </svg>
    ),
  },
  PROFESSIONAL_SERVICES: {
    label: 'Professional Services',
    color: 'bg-indigo-400',
    textColor: 'text-indigo-700',
    lightBg: 'bg-indigo-50',
    icon: (
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
          d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        />
      </svg>
    ),
  },
  UTILITIES: {
    label: 'Utilities',
    color: 'bg-cyan-400',
    textColor: 'text-cyan-700',
    lightBg: 'bg-cyan-50',
    icon: (
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
          d='M13 10V3L4 14h7v7l9-11h-7z'
        />
      </svg>
    ),
  },
  RENT: {
    label: 'Rent',
    color: 'bg-rose-400',
    textColor: 'text-rose-700',
    lightBg: 'bg-rose-50',
    icon: (
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
          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        />
      </svg>
    ),
  },
  INSURANCE: {
    label: 'Insurance',
    color: 'bg-slate-400',
    textColor: 'text-slate-700',
    lightBg: 'bg-slate-50',
    icon: (
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
          d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        />
      </svg>
    ),
  },
  TAXES: {
    label: 'Taxes',
    color: 'bg-red-400',
    textColor: 'text-red-700',
    lightBg: 'bg-red-50',
    icon: (
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
          d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
        />
      </svg>
    ),
  },
  OTHER: {
    label: 'Other',
    color: 'bg-gray-300',
    textColor: 'text-gray-600',
    lightBg: 'bg-gray-50',
    icon: (
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
          d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
        />
      </svg>
    ),
  },
};

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export function getCategoryTotals(expenses: MockExpense[]): CategoryTotal[] {
  const totals: Partial<
    Record<ExpenseCategory, { total: number; count: number }>
  > = {};
  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  for (const expense of expenses) {
    if (!totals[expense.category]) {
      totals[expense.category] = { total: 0, count: 0 };
    }
    totals[expense.category]!.total += expense.amount;
    totals[expense.category]!.count += 1;
  }

  return Object.entries(totals)
    .map(([category, data]) => ({
      category: category as ExpenseCategory,
      total: data!.total,
      count: data!.count,
      percentage: grandTotal > 0 ? (data!.total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
