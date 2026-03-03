'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { ApiClient } from '@/types/api.types';
import InvoiceForm, { type InvoiceFormData } from '@/components/InvoiceForm';
import { useToast } from '@/components/UI/Toast';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function NewInvoicePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get('/clients?limit=100'),
      api.get('/projects?limit=100'),
    ]).then(([clientsRes, projectsRes]) => {
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data.data.clients ?? []);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data.data.projects ?? []);
    });
  }, []);

  const handleSave = async (data: InvoiceFormData, action: 'draft' | 'send') => {
    setIsSaving(true);
    try {
      const payload = {
        clientId: data.clientId,
        projectId: data.projectId && UUID_REGEX.test(data.projectId) ? data.projectId : undefined,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        taxRate: data.taxRate,
        currency: data.currency,
        notes: data.notes || undefined,
        terms: data.terms || undefined,
        lineItems: data.lineItems.map((item, index) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
          order: index,
        })),
      };

      const createRes = await api.post('/invoices', payload);
      const newInvoice = createRes.data.data.invoice;

      if (action === 'send') {
        try {
          await api.post(`/invoices/${newInvoice.id}/send`);
          showToast(`Invoice ${newInvoice.invoiceNumber} sent!`, 'success');
        } catch (sendErr: unknown) {
          const ax = sendErr as { response?: { data?: { message?: string } } };
          showToast(
            `Invoice created but could not send: ${ax?.response?.data?.message || 'No client email'}`,
            'info',
          );
        }
      } else {
        showToast(
          `Invoice ${newInvoice.invoiceNumber} saved as draft`,
          'success',
        );
      }

      router.push(`/invoices/${newInvoice.id}`);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } } };
      if (ax?.response?.status === 403) {
        showToast('Invoice limit reached. Upgrade to create more.', 'error');
      } else {
        showToast(
          ax?.response?.data?.message || 'Failed to create invoice',
          'error',
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

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
        clients={clients}
        projects={projects}
        invoiceNumber="Auto-generated"
        onSave={handleSave}
        onCancel={() => router.push('/invoices')}
        isSaving={isSaving}
      />
    </div>
  );
}
