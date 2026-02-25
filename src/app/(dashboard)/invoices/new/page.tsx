'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import InvoiceForm, {
  type InvoiceFormData,
  defaultLineItem,
  initialFormData,
} from '@/components/InvoiceForm';

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInitialData, setFormInitialData] = useState<
    InvoiceFormData | undefined
  >(undefined);

  useEffect(() => {
    if (searchParams.get('duplicate') === 'true') {
      const stored = sessionStorage.getItem('duplicateInvoice');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormInitialData({
          ...initialFormData,
          clientId: parsed.clientId || '',
          currency: parsed.currency || 'USD',
          taxRate: parsed.taxRate ?? 0,
          notes: parsed.notes || '',
          terms: parsed.terms || '',
          lineItems: parsed.lineItems?.length
            ? parsed.lineItems
            : [defaultLineItem(0)],
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          projectId: '',
        });
        sessionStorage.removeItem('duplicateInvoice');
      }
    }
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoices
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Fill in the details below. You can save as draft or send to the client.
        </p>
      </div>

      <InvoiceForm
        initialData={formInitialData}
        invoiceNumber="Auto-generated"
        onCancel={() => router.push('/invoices')}
      />
    </div>
  );
}
