export type PaymentTerms = 'NET_15' | 'NET_30' | 'NET_60' | 'DUE_ON_RECEIPT' | 'CUSTOM';

export interface BillingAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface MockClient {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  billingAddress?: BillingAddress;
  paymentTerms: PaymentTerms;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Derived stats (would come from /stats endpoint)
  totalInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
  overdueCount: number;
}

export interface ClientFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentTerms: PaymentTerms;
  currency: string;
  notes: string;
}
