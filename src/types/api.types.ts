export interface ApiClient {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  billingAddress: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null;
  paymentTerms: string;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiClientStats {
  clientId: string;
  companyName: string;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
  currency: string;
}

export interface ApiClientHealth {
  clientId: string;
  healthScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  averageDaysToPay: number;
  overdueCount: number;
  paymentRate: number;
}

export type InvoiceStatus =
  | 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';

export interface ApiLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  order: number;
}

export interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  pdfUrl: string | null;
  sentAt: string | null;
  paidAt: string | null;
  lastReminderSentAt: string | null;
  reminderCount: number;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string | null;
    billingAddress: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    } | null;
  };
  lineItems: ApiLineItem[];
  project?: { id: string; name: string; status: string } | null;
  payments?: Array<{
    id: string;
    amount: number;
    paidAt: string;
    paymentMethod: string;
    status: string;
  }>;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
