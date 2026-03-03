/**
 * Mock project data and types for Projects list and detail pages.
 * Matches backend getProjectData + stats shape (no API yet).
 */

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';

export interface PaymentPlanItem {
  milestone: string;
  amount: number;
  dueDate?: string;
  status?: 'pending' | 'invoiced' | 'paid';
}

export interface MockProjectInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  issueDate: string;
  dueDate: string;
}

export interface MockProject {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  totalBudget: number;
  currency: string;
  paymentPlan: PaymentPlanItem[] | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string | null;
  };
  proposal?: {
    id: string;
    proposalNumber: string;
    title: string;
    totalAmount: number;
  } | null;
  contract?: {
    id: string;
    contractNumber: string;
    title: string;
    status: string;
  } | null;
  _count?: { invoices: number };
  totalInvoiced?: number;
  /** For detail page: mock invoices linked to this project */
  invoices?: MockProjectInvoice[];
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign & CMS',
    description: 'Full website redesign with custom CMS and 3 rounds of revisions.',
    status: 'ACTIVE',
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    totalBudget: 24000,
    currency: 'USD',
    paymentPlan: [
      { milestone: 'Discovery & wireframes', amount: 6000, status: 'paid' },
      { milestone: 'Design & development', amount: 12000, status: 'invoiced' },
      { milestone: 'Launch & handoff', amount: 6000, status: 'pending' },
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-20T14:30:00Z',
    client: {
      id: 'c1',
      companyName: 'Acme Corp',
      contactName: 'Jane Smith',
      email: 'jane@acme.com',
    },
    proposal: { id: 'prop-1', proposalNumber: 'PROP-0001', title: 'Website Redesign', totalAmount: 24000 },
    contract: { id: 'cont-1', contractNumber: 'CONT-0001', title: 'Website SOW', status: 'SIGNED' },
    _count: { invoices: 2 },
    totalInvoiced: 12000,
    invoices: [
      { id: 'inv-p1-1', invoiceNumber: 'INV-0015', status: 'PAID', total: 6000, currency: 'USD', issueDate: '2026-01-20', dueDate: '2026-02-19' },
      { id: 'inv-p1-2', invoiceNumber: 'INV-0018', status: 'SENT', total: 6000, currency: 'USD', issueDate: '2026-02-15', dueDate: '2026-03-17' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Mobile App — Phase 1',
    description: 'iOS and Android MVP with auth, dashboard, and push notifications.',
    status: 'ACTIVE',
    startDate: '2026-02-01',
    endDate: '2026-06-01',
    totalBudget: 45000,
    currency: 'USD',
    paymentPlan: [
      { milestone: 'Sprint 1–2', amount: 15000, status: 'paid' },
      { milestone: 'Sprint 3–4', amount: 15000, status: 'invoiced' },
      { milestone: 'Sprint 5–6', amount: 15000, status: 'pending' },
    ],
    createdAt: '2026-01-25T09:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
    client: {
      id: 'c2',
      companyName: 'TechStart Inc',
      contactName: 'Mike Johnson',
      email: 'mike@techstart.io',
    },
    _count: { invoices: 2 },
    totalInvoiced: 15000,
    invoices: [
      { id: 'inv-p2-1', invoiceNumber: 'INV-0020', status: 'PAID', total: 15000, currency: 'USD', issueDate: '2026-02-05', dueDate: '2026-03-07' },
      { id: 'inv-p2-2', invoiceNumber: 'INV-0022', status: 'SENT', total: 15000, currency: 'USD', issueDate: '2026-03-01', dueDate: '2026-03-31' },
    ],
  },
  {
    id: 'proj-3',
    name: 'Brand Identity & Guidelines',
    description: null,
    status: 'COMPLETED',
    startDate: '2025-11-01',
    endDate: '2026-01-15',
    totalBudget: 8500,
    currency: 'USD',
    paymentPlan: [
      { milestone: 'Concept & moodboards', amount: 3000, status: 'paid' },
      { milestone: 'Final deliverables', amount: 5500, status: 'paid' },
    ],
    createdAt: '2025-10-20T14:00:00Z',
    updatedAt: '2026-01-16T09:00:00Z',
    client: {
      id: 'c3',
      companyName: 'Design Studio Co',
      contactName: null,
      email: 'hello@designstudio.com',
    },
    _count: { invoices: 2 },
    totalInvoiced: 8500,
    invoices: [
      { id: 'inv-p3-1', invoiceNumber: 'INV-0008', status: 'PAID', total: 3000, currency: 'USD', issueDate: '2025-11-10', dueDate: '2025-12-10' },
      { id: 'inv-p3-2', invoiceNumber: 'INV-0010', status: 'PAID', total: 5500, currency: 'USD', issueDate: '2026-01-05', dueDate: '2026-01-20' },
    ],
  },
  {
    id: 'proj-4',
    name: 'Q1 Retainer — Content & SEO',
    description: 'Monthly content and SEO support for Q1 2026.',
    status: 'ON_HOLD',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    totalBudget: 9000,
    currency: 'USD',
    paymentPlan: [
      { milestone: 'January', amount: 3000, status: 'paid' },
      { milestone: 'February', amount: 3000, status: 'pending' },
      { milestone: 'March', amount: 3000, status: 'pending' },
    ],
    createdAt: '2025-12-15T08:00:00Z',
    updatedAt: '2026-02-10T16:45:00Z',
    client: {
      id: 'c4',
      companyName: 'Growth Labs',
      contactName: 'Sarah Chen',
      email: 'sarah@growthlabs.com',
    },
    _count: { invoices: 1 },
    totalInvoiced: 3000,
    invoices: [
      { id: 'inv-p4-1', invoiceNumber: 'INV-0012', status: 'PAID', total: 3000, currency: 'USD', issueDate: '2026-01-01', dueDate: '2026-01-31' },
    ],
  },
  {
    id: 'proj-5',
    name: 'E‑commerce Platform Migration',
    description: 'Migration from legacy platform to new stack with data import.',
    status: 'CANCELLED',
    startDate: '2025-09-01',
    endDate: null,
    totalBudget: 32000,
    currency: 'USD',
    paymentPlan: [
      { milestone: 'Discovery', amount: 8000, status: 'paid' },
      { milestone: 'Phase 1 build', amount: 24000, status: 'pending' },
    ],
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2025-11-01T12:00:00Z',
    client: {
      id: 'c5',
      companyName: 'Retail Plus',
      contactName: 'David Brown',
      email: 'david@retailplus.com',
    },
    _count: { invoices: 1 },
    totalInvoiced: 8000,
    invoices: [
      { id: 'inv-p5-1', invoiceNumber: 'INV-0003', status: 'PAID', total: 8000, currency: 'USD', issueDate: '2025-09-15', dueDate: '2025-10-15' },
    ],
  },
  {
    id: 'proj-6',
    name: 'API Integration & Automation',
    description: 'Custom API integrations and workflow automation for internal tools.',
    status: 'ACTIVE',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    totalBudget: 15000,
    currency: 'USD',
    paymentPlan: [
      { milestone: 'Design & spec', amount: 5000, status: 'pending' },
      { milestone: 'Build & test', amount: 10000, status: 'pending' },
    ],
    createdAt: '2026-02-28T09:00:00Z',
    updatedAt: '2026-02-28T09:00:00Z',
    client: {
      id: 'c2',
      companyName: 'TechStart Inc',
      contactName: 'Mike Johnson',
      email: 'mike@techstart.io',
    },
    _count: { invoices: 0 },
    totalInvoiced: 0,
    invoices: [],
  },
];
