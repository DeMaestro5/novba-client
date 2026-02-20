export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'STRIPE' | 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'MOBILE_MONEY' | 'CRYPTO' | 'OTHER';

export interface MockPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  notes?: string;
  createdAt: string;
}

export const mockPayments: MockPayment[] = [
  {
    id: 'pay1',
    invoiceId: 'inv1',
    invoiceNumber: 'INV-0001',
    clientId: 'client1',
    clientName: 'Acme Corp',
    amount: 4250,
    currency: 'USD',
    paymentMethod: 'STRIPE',
    status: 'COMPLETED',
    paidAt: '2026-01-10T14:00:00.000Z',
    notes: 'First milestone payment',
    createdAt: '2026-01-10T14:00:00.000Z',
  },
  {
    id: 'pay2',
    invoiceId: 'inv2',
    invoiceNumber: 'INV-0002',
    clientId: 'client5',
    clientName: 'Solo Ventures',
    amount: 2200,
    currency: 'USD',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED',
    paidAt: '2026-01-12T10:00:00.000Z',
    notes: 'Monthly retainer - January',
    createdAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'pay3',
    invoiceId: 'inv3',
    invoiceNumber: 'INV-0003',
    clientId: 'client1',
    clientName: 'Acme Corp',
    amount: 8500,
    currency: 'USD',
    paymentMethod: 'STRIPE',
    status: 'COMPLETED',
    paidAt: '2026-01-20T09:00:00.000Z',
    notes: 'Final delivery payment — Brand Identity',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'pay4',
    invoiceId: 'inv4',
    invoiceNumber: 'INV-0004',
    clientId: 'client3',
    clientName: 'Design Studio',
    amount: 500,
    currency: 'USD',
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    paidAt: '2026-02-01T11:00:00.000Z',
    createdAt: '2026-02-01T11:00:00.000Z',
  },
  {
    id: 'pay5',
    invoiceId: 'inv5',
    invoiceNumber: 'INV-0005',
    clientId: 'client2',
    clientName: 'TechStart Inc',
    amount: 1800,
    currency: 'USD',
    paymentMethod: 'STRIPE',
    status: 'PENDING',
    paidAt: '2026-02-05T08:00:00.000Z',
    notes: 'Awaiting card authorization',
    createdAt: '2026-02-05T08:00:00.000Z',
  },
  {
    id: 'pay6',
    invoiceId: 'inv6',
    invoiceNumber: 'INV-0006',
    clientId: 'client4',
    clientName: 'Growth Labs',
    amount: 750,
    currency: 'USD',
    paymentMethod: 'MOBILE_MONEY',
    status: 'COMPLETED',
    paidAt: '2026-02-08T15:00:00.000Z',
    createdAt: '2026-02-08T15:00:00.000Z',
  },
  {
    id: 'pay7',
    invoiceId: 'inv7',
    invoiceNumber: 'INV-0007',
    clientId: 'client6',
    clientName: 'Legacy Co',
    amount: 3200,
    currency: 'USD',
    paymentMethod: 'CHECK',
    status: 'REFUNDED',
    paidAt: '2026-02-10T12:00:00.000Z',
    notes: 'Refunded — project cancelled by client',
    createdAt: '2026-02-10T12:00:00.000Z',
  },
  {
    id: 'pay8',
    invoiceId: 'inv8',
    invoiceNumber: 'INV-0008',
    clientId: 'client3',
    clientName: 'Design Studio',
    amount: 650,
    currency: 'USD',
    paymentMethod: 'STRIPE',
    status: 'FAILED',
    paidAt: '2026-02-15T16:00:00.000Z',
    notes: 'Card declined — insufficient funds',
    createdAt: '2026-02-15T16:00:00.000Z',
  },
];

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

// Group payments by month, sorted newest first
export interface PaymentGroup {
  key: string; // e.g. "2026-02"
  label: string; // e.g. "February 2026"
  payments: MockPayment[];
  collectedTotal: number; // sum of COMPLETED only
}

export function groupPaymentsByMonth(payments: MockPayment[]): PaymentGroup[] {
  const groups: Map<string, PaymentGroup> = new Map();

  const sorted = [...payments].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );

  for (const payment of sorted) {
    const date = new Date(payment.paidAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!groups.has(key)) {
      groups.set(key, { key, label, payments: [], collectedTotal: 0 });
    }

    const group = groups.get(key)!;
    group.payments.push(payment);
    if (payment.status === 'COMPLETED') {
      group.collectedTotal += payment.amount;
    }
  }

  return Array.from(groups.values());
}
