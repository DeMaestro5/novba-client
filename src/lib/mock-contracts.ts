export type ContractStatus = 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED' | 'TERMINATED';
export type TemplateType = 'service_agreement' | 'nda' | 'sow' | 'freelance' | 'consulting' | 'custom';

export interface MockContract {
  id: string;
  contractNumber: string;
  title: string;
  status: ContractStatus;
  templateType: TemplateType;
  clientId: string;
  clientName: string;
  clientContact?: string;
  clientEmail?: string;
  proposalId?: string;
  proposalNumber?: string;
  content: string;
  terms?: {
    amount?: number;
    currency?: string;
    scope?: string;
  };
  startDate?: string;
  endDate?: string;
  sentAt?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockContracts: MockContract[] = [
  {
    id: 'c1',
    contractNumber: 'CONT-0001',
    title: 'Brand Identity Service Agreement',
    status: 'SIGNED',
    templateType: 'service_agreement',
    clientId: 'client1',
    clientName: 'Acme Corp',
    clientContact: 'John Doe',
    clientEmail: 'billing@acme.com',
    proposalId: 'p1',
    proposalNumber: 'PROP-0001',
    content: `SERVICE AGREEMENT

This Service Agreement is entered into as of January 9, 2026 between:

SERVICE PROVIDER:
Novba Studio
billing@novba.com

CLIENT:
Acme Corp
John Doe

1. SERVICES
The Service Provider agrees to deliver a complete brand identity system including logo design, color palette, typography system, brand guidelines document, and a full design system for digital products.

2. COMPENSATION
Total Amount: $8,500.00 USD
Payment Terms: 50% upfront ($4,250) and 50% upon delivery ($4,250).

3. TERM
This Agreement commences on January 9, 2026 and continues until March 15, 2026.

4. DELIVERABLES
- Logo Design (3 concepts + revisions)
- Brand Guidelines Document
- Design System (Components library)
- Brand Assets Package

5. INTELLECTUAL PROPERTY
All work product created under this Agreement shall be owned by the Client upon full payment.

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information shared during the project.

7. REVISIONS
Includes 3 rounds of revisions. Additional revisions billed at $150/hour.

8. TERMINATION
Either party may terminate this Agreement with 7 days written notice. Kill fee of 25% applies if cancelled after work has commenced.

SIGNATURES:

Service Provider: Novba Studio     Date: January 9, 2026
Client: Acme Corp / John Doe       Date: January 10, 2026`,
    terms: { amount: 8500, currency: 'USD', scope: 'Complete brand identity system' },
    startDate: '2026-01-09T00:00:00.000Z',
    endDate: '2026-03-15T00:00:00.000Z',
    sentAt: '2026-01-09T10:00:00.000Z',
    signedAt: '2026-01-10T14:00:00.000Z',
    createdAt: '2026-01-09T09:00:00.000Z',
    updatedAt: '2026-01-10T14:00:00.000Z',
  },
  {
    id: 'c2',
    contractNumber: 'CONT-0002',
    title: 'E-commerce Project NDA',
    status: 'SENT',
    templateType: 'nda',
    clientId: 'client2',
    clientName: 'TechStart Inc',
    clientContact: 'Sarah Chen',
    clientEmail: 'sarah@techstart.com',
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into as of January 15, 2026 between:

DISCLOSING PARTY:
Novba Studio

RECEIVING PARTY:
TechStart Inc
Sarah Chen

1. CONFIDENTIAL INFORMATION
Both parties may disclose confidential information including business strategies, technical specifications, customer data, financial information, and proprietary processes related to the E-commerce Website Development project.

2. OBLIGATIONS
The Receiving Party agrees to:
- Maintain strict confidentiality of all Confidential Information
- Use Confidential Information solely for the Purpose of the project
- Not disclose to any third parties without prior written consent
- Protect with at least the same degree of care as own confidential information

3. TERM
This Agreement shall remain in effect for 2 years from the date of execution.

4. EXCLUSIONS
This Agreement does not apply to information that is publicly available, was known prior to disclosure, or is independently developed.

5. RETURN OF MATERIALS
Upon termination or request, all Confidential Information must be returned or securely destroyed within 5 business days.

SIGNATURES:

Disclosing Party: Novba Studio     Date: _____________
Receiving Party: TechStart Inc     Date: _____________`,
    terms: {},
    startDate: '2026-01-15T00:00:00.000Z',
    sentAt: '2026-01-15T11:00:00.000Z',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T11:00:00.000Z',
  },
  {
    id: 'c3',
    contractNumber: 'CONT-0003',
    title: 'Mobile App MVP Statement of Work',
    status: 'DRAFT',
    templateType: 'sow',
    clientId: 'client4',
    clientName: 'Growth Labs',
    clientContact: 'Priya Patel',
    clientEmail: 'priya@growthlabs.com',
    proposalId: 'p4',
    proposalNumber: 'PROP-0004',
    content: `STATEMENT OF WORK

Project: Mobile App MVP Development
Date: January 20, 2026

PARTIES:
Service Provider: Novba Studio
Client: Growth Labs / Priya Patel

1. PROJECT OVERVIEW
Design and development of a minimum viable product (MVP) mobile application including user authentication, core feature set, and app store submission preparation.

2. SCOPE OF WORK
- UI/UX Design for iOS and Android
- React Native development
- Backend API integration
- User authentication system
- Push notification setup
- App store submission assets

3. DELIVERABLES
- Figma design files (all screens)
- React Native source code
- API documentation
- App store submission package
- 30 days post-launch support

4. TIMELINE
Start Date: February 1, 2026
End Date: April 30, 2026
Total Duration: 3 months

5. PAYMENT SCHEDULE
Total Project Cost: $18,000.00 USD
- Milestone 1 (Design complete): $6,000 — Feb 28, 2026
- Milestone 2 (Development complete): $8,000 — Apr 15, 2026
- Milestone 3 (Launch): $4,000 — Apr 30, 2026

6. CHANGE MANAGEMENT
Any changes to this SOW must be documented and approved by both parties in writing before implementation.

APPROVED BY:

Service Provider: _________________     Date: _____________
Client: _________________              Date: _____________`,
    terms: { amount: 18000, currency: 'USD' },
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2026-04-30T00:00:00.000Z',
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'c4',
    contractNumber: 'CONT-0004',
    title: 'Annual SEO Consulting Agreement',
    status: 'EXPIRED',
    templateType: 'consulting',
    clientId: 'client5',
    clientName: 'Solo Ventures',
    clientContact: 'Alex Rivera',
    clientEmail: 'alex@soloventures.com',
    content: `CONSULTING AGREEMENT

This Consulting Agreement is made as of January 1, 2025 between:

CONSULTANT: Novba Studio
CLIENT: Solo Ventures / Alex Rivera

1. CONSULTING SERVICES
Monthly SEO consulting including keyword research, content strategy, technical SEO audits, backlink analysis, and monthly performance reporting.

2. COMPENSATION
Monthly Retainer: $2,200.00 USD
Payment due on the 1st of each month.

3. TERM
This Agreement is effective from January 1, 2025 to December 31, 2025.

4. INDEPENDENT CONTRACTOR
The Consultant is an independent contractor, not an employee of the Client.

5. DELIVERABLES
- Monthly SEO audit report
- Keyword ranking report
- Content recommendations
- Technical fixes log

6. TERMINATION
Either party may terminate with 30 days written notice.

SIGNATURES:

Consultant: Novba Studio         Date: January 1, 2025
Client: Solo Ventures            Date: January 2, 2025`,
    terms: { amount: 2200, currency: 'USD' },
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T00:00:00.000Z',
    sentAt: '2025-01-01T09:00:00.000Z',
    signedAt: '2025-01-02T10:00:00.000Z',
    createdAt: '2025-01-01T09:00:00.000Z',
    updatedAt: '2025-12-31T00:00:00.000Z',
  },
  {
    id: 'c5',
    contractNumber: 'CONT-0005',
    title: 'Social Media Content Freelance Contract',
    status: 'TERMINATED',
    templateType: 'freelance',
    clientId: 'client3',
    clientName: 'Design Studio',
    clientContact: 'Marcus Williams',
    clientEmail: 'marcus@designstudio.com',
    content: `FREELANCE CONTRACT

This Freelance Contract is entered into on December 1, 2025 between:

FREELANCER: Novba Studio
Email: billing@novba.com

CLIENT: Design Studio
Email: marcus@designstudio.com

1. PROJECT DESCRIPTION
Social media content strategy and creation including platform management, content calendar, copy, and graphics for Q1 2026.

2. SCOPE OF WORK
- Monthly content calendar (30 posts)
- Copy for all platforms
- Graphic design for posts
- Monthly analytics report

3. COMPENSATION
Fixed Fee: $3,600.00 USD
Payment: 50% upfront, 50% at end of quarter.

4. DEADLINE
Project completion date: March 31, 2026

5. REVISIONS
Includes 2 rounds of revisions per deliverable.

6. TERMINATION
Contract terminated by mutual agreement on January 15, 2026. Kill fee of 25% ($900) applied.

SIGNATURES:

Freelancer: Novba Studio         Date: December 1, 2025
Client: Design Studio            Date: December 2, 2025`,
    terms: { amount: 3600, currency: 'USD' },
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-03-31T00:00:00.000Z',
    sentAt: '2025-12-01T10:00:00.000Z',
    signedAt: '2025-12-02T11:00:00.000Z',
    createdAt: '2025-12-01T09:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
  },
];

export function formatCurrency(amount?: number, currency = 'USD') {
  if (!amount) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
