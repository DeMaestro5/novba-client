export type ProposalStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'DECLINED' | 'EXPIRED';

export interface MockLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  order: number;
}

export interface MockProposal {
  id: string;
  proposalNumber: string;
  title: string;
  status: ProposalStatus;
  clientId: string;
  clientName: string;
  clientContact?: string;
  clientEmail?: string;
  scope: string;
  terms: string;
  currency: string;
  totalAmount: number;
  validUntil: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  createdAt: string;
  lineItems: MockLineItem[];
}

export const mockProposals: MockProposal[] = [
  {
    id: 'p1',
    proposalNumber: 'PROP-0001',
    title: 'Brand Identity & Design System',
    status: 'APPROVED',
    clientId: 'c1',
    clientName: 'Acme Corp',
    clientContact: 'John Doe',
    clientEmail: 'billing@acme.com',
    scope: 'Complete brand identity including logo design, color palette, typography system, brand guidelines document, and a full design system for digital products.',
    terms: 'Payment is 50% upfront and 50% upon delivery. Revisions are limited to 3 rounds. Final files delivered within 30 days of project kickoff.',
    currency: 'USD',
    totalAmount: 8500,
    validUntil: '2026-03-15',
    sentAt: '2026-01-10T10:00:00Z',
    viewedAt: '2026-01-11T14:30:00Z',
    respondedAt: '2026-01-13T09:00:00Z',
    createdAt: '2026-01-09T10:00:00Z',
    lineItems: [
      { id: 'li1', description: 'Logo Design (3 concepts + revisions)', quantity: 1, rate: 2500, amount: 2500, order: 0 },
      { id: 'li2', description: 'Brand Guidelines Document', quantity: 1, rate: 2000, amount: 2000, order: 1 },
      { id: 'li3', description: 'Design System (Components library)', quantity: 1, rate: 3500, amount: 3500, order: 2 },
      { id: 'li4', description: 'Brand Assets Package', quantity: 1, rate: 500, amount: 500, order: 3 },
    ],
  },
  {
    id: 'p2',
    proposalNumber: 'PROP-0002',
    title: 'E-commerce Website Development',
    status: 'VIEWED',
    clientId: 'c2',
    clientName: 'TechStart Inc',
    clientContact: 'Sarah Chen',
    clientEmail: 'finance@techstart.com',
    scope: 'Full-stack e-commerce development using Next.js and Stripe. Includes product catalog, cart, checkout, order management, and admin dashboard.',
    terms: '30% upfront, 40% at mid-point delivery, 30% on final delivery. Scope changes require written approval and may affect timeline and cost.',
    currency: 'USD',
    totalAmount: 12400,
    validUntil: '2026-02-28',
    sentAt: '2026-02-01T09:00:00Z',
    viewedAt: '2026-02-03T11:20:00Z',
    createdAt: '2026-01-30T08:00:00Z',
    lineItems: [
      { id: 'li5', description: 'UX/UI Design (Figma)', quantity: 40, rate: 120, amount: 4800, order: 0 },
      { id: 'li6', description: 'Frontend Development', quantity: 32, rate: 150, amount: 4800, order: 1 },
      { id: 'li7', description: 'Backend & API Integration', quantity: 16, rate: 150, amount: 2400, order: 2 },
      { id: 'li8', description: 'QA Testing & Deployment', quantity: 8, rate: 100, amount: 800, order: 3 },
      { id: 'li9', description: 'Documentation', quantity: 4, rate: 150, amount: 600, order: 4 },
    ],
  },
  {
    id: 'p3',
    proposalNumber: 'PROP-0003',
    title: 'Social Media Content Strategy Q1',
    status: 'SENT',
    clientId: 'c3',
    clientName: 'Design Studio',
    clientContact: 'Marcus Williams',
    clientEmail: 'accounts@designstudio.com',
    scope: 'Monthly social media management including content calendar, copywriting, graphic design for posts, scheduling, and monthly performance report.',
    terms: 'Billed monthly in advance. 30-day notice required for cancellation. Content revisions capped at 2 rounds per piece.',
    currency: 'USD',
    totalAmount: 3600,
    validUntil: '2026-03-01',
    sentAt: '2026-02-10T14:00:00Z',
    createdAt: '2026-02-09T10:00:00Z',
    lineItems: [
      { id: 'li10', description: 'Content Strategy & Calendar', quantity: 1, rate: 800, amount: 800, order: 0 },
      { id: 'li11', description: 'Post Copywriting (20 posts/month)', quantity: 3, rate: 600, amount: 1800, order: 1 },
      { id: 'li12', description: 'Graphic Design (20 posts/month)', quantity: 3, rate: 400, amount: 1200, order: 2 },
    ],
  },
  {
    id: 'p4',
    proposalNumber: 'PROP-0004',
    title: 'Mobile App MVP Development',
    status: 'DRAFT',
    clientId: 'c4',
    clientName: 'Growth Labs',
    clientContact: 'Priya Patel',
    clientEmail: 'billing@growthlabs.com',
    scope: 'MVP development for iOS and Android using React Native. Includes user auth, core feature set, push notifications, and App Store submission.',
    terms: 'Payment in 3 milestones. All work remains property of client upon final payment.',
    currency: 'USD',
    totalAmount: 18000,
    validUntil: '2026-03-20',
    createdAt: '2026-02-15T09:00:00Z',
    lineItems: [
      { id: 'li13', description: 'Product Discovery & Wireframes', quantity: 1, rate: 3000, amount: 3000, order: 0 },
      { id: 'li14', description: 'UI/UX Design', quantity: 1, rate: 4000, amount: 4000, order: 1 },
      { id: 'li15', description: 'React Native Development', quantity: 80, rate: 120, amount: 9600, order: 2 },
      { id: 'li16', description: 'QA & App Store Submission', quantity: 1, rate: 1400, amount: 1400, order: 3 },
    ],
  },
  {
    id: 'p5',
    proposalNumber: 'PROP-0005',
    title: 'SEO Audit & Implementation',
    status: 'DECLINED',
    clientId: 'c5',
    clientName: 'Solo Ventures',
    clientContact: 'Alex Rivera',
    clientEmail: 'pay@soloventures.com',
    scope: 'Full technical SEO audit, keyword research, on-page optimization, and 3-month content strategy.',
    terms: 'Full payment required upfront. Deliverables provided within 2 weeks.',
    currency: 'USD',
    totalAmount: 2200,
    validUntil: '2026-02-01',
    sentAt: '2026-01-15T10:00:00Z',
    viewedAt: '2026-01-16T08:00:00Z',
    respondedAt: '2026-01-18T14:00:00Z',
    createdAt: '2026-01-14T10:00:00Z',
    lineItems: [
      { id: 'li17', description: 'Technical SEO Audit', quantity: 1, rate: 800, amount: 800, order: 0 },
      { id: 'li18', description: 'Keyword Research & Strategy', quantity: 1, rate: 600, amount: 600, order: 1 },
      { id: 'li19', description: 'On-page Optimization (10 pages)', quantity: 10, rate: 80, amount: 800, order: 2 },
    ],
  },
  {
    id: 'p6',
    proposalNumber: 'PROP-0006',
    title: 'Annual Website Maintenance',
    status: 'EXPIRED',
    clientId: 'c6',
    clientName: 'Legacy Co',
    clientContact: 'Robert Thompson',
    clientEmail: 'billing@legacy.com',
    scope: 'Annual retainer for website maintenance, security updates, backups, and up to 10 hours/month of content updates.',
    terms: 'Annual contract billed quarterly.',
    currency: 'USD',
    totalAmount: 4800,
    validUntil: '2026-01-15',
    sentAt: '2026-01-05T10:00:00Z',
    createdAt: '2026-01-04T10:00:00Z',
    lineItems: [
      { id: 'li20', description: 'Annual Maintenance Retainer', quantity: 12, rate: 400, amount: 4800, order: 0 },
    ],
  },
];

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
