'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { ApiClient, ApiInvoice } from '@/types/api.types';
import InvoiceForm, { type InvoiceFormData } from '@/components/InvoiceForm';
import { useToast } from '@/components/UI/Toast';
import Card, { CardBody } from '@/components/UI/Card';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = (params?.id as string) ?? '';

  const [initialData, setInitialData] = useState<InvoiceFormData | undefined>(
    undefined,
  );
  const [invoiceNumber, setInvoiceNumber] = useState('Loading...');
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.allSettled([
      api.get(`/invoices/${id}`),
      api.get('/clients?limit=100'),
      api.get('/projects?limit=100'),
    ]).then(([invoiceRes, clientsRes, projectsRes]) => {
      if (invoiceRes.status === 'rejected') {
        setNotFound(true);
        return;
      }

      const inv: ApiInvoice = invoiceRes.value.data.data.invoice;
      setInvoiceNumber(inv.invoiceNumber);

      setInitialData({
        clientId: inv.client.id,
        projectId: inv.project?.id || '',
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        currency: inv.currency,
        taxRate: Number(inv.taxRate),
        notes: inv.notes || '',
        terms: inv.terms || '',
        lineItems: inv.lineItems.map((item, index) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
          order: index,
        })),
      });

      if (clientsRes.status === 'fulfilled') {
        setClients(clientsRes.value.data.data.clients ?? []);
      }
      if (projectsRes.status === 'fulfilled') {
        setProjects(projectsRes.value.data.data.projects ?? []);
      }
    }).finally(() => setIsLoading(false));
  }, [id]);

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const handleSave = async (data: InvoiceFormData, action: 'draft' | 'send') => {
    setIsSaving(true);
    try {
      const payload = {
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        projectId: data.projectId && UUID_REGEX.test(data.projectId) ? data.projectId : undefined,
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

      const res = await api.put(`/invoices/${id}`, payload);
      const updated = res.data.data.invoice;

      if (action === 'send') {
        try {
          await api.post(`/invoices/${id}/send`);
          showToast(`Invoice ${updated.invoiceNumber} sent!`, 'success');
        } catch (_sendErr) {
          showToast(
            'Invoice updated but could not send. Check client email.',
            'info',
          );
        }
      } else {
        showToast('Invoice updated', 'success');
      }

      router.push(`/invoices/${id}`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(ax?.response?.data?.message || 'Failed to update invoice', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Link
            href={id ? `/invoices/${id}` : '/invoices'}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoice
          </Link>
        </nav>
        <div className="flex justify-center py-12">
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <Card>
          <CardBody padding="lg">
            <p className="text-gray-700 dark:text-gray-300">Invoice not found.</p>
            <Link
              href="/invoices"
              className="mt-2 inline-block text-sm text-orange-600 hover:underline"
            >
              Back to Invoices
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (initialData === undefined) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <div className="flex justify-center py-12">
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href={id ? `/invoices/${id}` : '/invoices'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
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
        initialData={initialData}
        clients={clients}
        projects={projects}
        invoiceNumber={invoiceNumber}
        onSave={handleSave}
        onCancel={() => router.push(id ? `/invoices/${id}` : '/invoices')}
        isSaving={isSaving}
      />
    </div>
  );
}
