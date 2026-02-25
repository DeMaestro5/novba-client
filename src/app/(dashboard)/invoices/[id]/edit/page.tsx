'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import InvoiceForm, {
  initialFormData,
  type InvoiceFormData,
  defaultLineItem,
} from '@/components/InvoiceForm';

// Mock: get invoice by id for pre-fill
function getMockInvoiceForEdit(id: string): InvoiceFormData | null {
  if (id === '1') {
    return {
      clientId: 'c1',
      projectId: 'p1',
      issueDate: new Date('2026-01-15'),
      dueDate: new Date('2026-02-14'),
      currency: 'USD',
      taxRate: 6.67,
      notes: 'Thank you for your business!',
      terms: 'Payment due within 30 days.',
      lineItems: [
        {
          id: 'li1',
          description: 'Website Design - Homepage',
          quantity: 1,
          rate: 1500,
          amount: 1500,
          order: 0,
        },
        {
          id: 'li2',
          description: 'Website Development - 3 Pages',
          quantity: 3,
          rate: 250,
          amount: 750,
          order: 1,
        },
      ],
    };
  }
  if (id === '2') {
    return {
      clientId: 'c2',
      projectId: 'p2',
      issueDate: new Date('2026-02-01'),
      dueDate: new Date('2026-03-01'),
      currency: 'USD',
      taxRate: 0,
      notes: '',
      terms: '',
      lineItems: [
        {
          id: 'li1',
          description: 'Mobile App - Phase 1',
          quantity: 1,
          rate: 3600,
          amount: 3600,
          order: 0,
        },
      ],
    };
  }
  // Default: use initial form with client c1 for any other id
  return {
    ...initialFormData,
    clientId: 'c1',
    lineItems: [
      defaultLineItem(0),
    ],
  };
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? '';
  const initialData = getMockInvoiceForEdit(id);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href={id ? `/invoices/${id}` : '/invoices'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoice
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Invoice</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update invoice details. Changes are saved when you click Save as Draft or Save & Send.
        </p>
      </div>

      <InvoiceForm
        initialData={initialData ?? undefined}
        invoiceNumber={id ? `INV-${String(id).padStart(4, '0')}` : 'Auto-generated'}
        onCancel={() => router.push(id ? `/invoices/${id}` : '/invoices')}
      />
    </div>
  );
}
