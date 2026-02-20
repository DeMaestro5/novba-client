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

export const CATEGORY_CONFIG: Record<ExpenseCategory, {
  label: string;
  color: string;      // tailwind bg for bar chart
  textColor: string;  // tailwind text color
  lightBg: string;    // tailwind bg for badge
  icon: string;       // emoji fallback for quick render
}> = {
  SOFTWARE:             { label: 'Software',             color: 'bg-violet-400',  textColor: 'text-violet-700',  lightBg: 'bg-violet-50',  icon: '💻' },
  EQUIPMENT:            { label: 'Equipment',            color: 'bg-blue-400',    textColor: 'text-blue-700',    lightBg: 'bg-blue-50',    icon: '🖥️' },
  TRAVEL:               { label: 'Travel',               color: 'bg-sky-400',     textColor: 'text-sky-700',     lightBg: 'bg-sky-50',     icon: '✈️' },
  MEALS:                { label: 'Meals',                color: 'bg-amber-400',   textColor: 'text-amber-700',   lightBg: 'bg-amber-50',   icon: '🍽️' },
  MARKETING:            { label: 'Marketing',            color: 'bg-orange-400',  textColor: 'text-orange-700',  lightBg: 'bg-orange-50',  icon: '📣' },
  OFFICE_SUPPLIES:      { label: 'Office Supplies',      color: 'bg-teal-400',    textColor: 'text-teal-700',    lightBg: 'bg-teal-50',    icon: '📎' },
  PROFESSIONAL_SERVICES:{ label: 'Professional Services',color: 'bg-indigo-400',  textColor: 'text-indigo-700',  lightBg: 'bg-indigo-50',  icon: '⚖️' },
  UTILITIES:            { label: 'Utilities',            color: 'bg-cyan-400',    textColor: 'text-cyan-700',    lightBg: 'bg-cyan-50',    icon: '⚡' },
  RENT:                 { label: 'Rent',                 color: 'bg-rose-400',    textColor: 'text-rose-700',    lightBg: 'bg-rose-50',    icon: '🏠' },
  INSURANCE:            { label: 'Insurance',            color: 'bg-slate-400',   textColor: 'text-slate-700',   lightBg: 'bg-slate-50',   icon: '🛡️' },
  TAXES:                { label: 'Taxes',                color: 'bg-red-400',     textColor: 'text-red-700',     lightBg: 'bg-red-50',     icon: '🧾' },
  OTHER:                { label: 'Other',                color: 'bg-gray-300',    textColor: 'text-gray-600',    lightBg: 'bg-gray-50',    icon: '📦' },
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
  const totals: Partial<Record<ExpenseCategory, { total: number; count: number }>> = {};
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
