'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { ApiClient } from '@/types/api.types';
import ClientForm from '@/components/ClientForm';
import { ClientFormData } from '@/types/client.types';
import { useToast } from '@/components/UI/Toast';
import Card, { CardBody } from '@/components/UI/Card';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id as string;

  const [initialData, setInitialData] = useState<ClientFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/clients/${id}`)
      .then((res) => {
        const c: ApiClient = res.data.data.client;
        setInitialData({
          companyName: c.companyName,
          contactName: c.contactName || '',
          email: c.email || '',
          phone: c.phone || '',
          street: c.billingAddress?.street || '',
          city: c.billingAddress?.city || '',
          state: c.billingAddress?.state || '',
          zip: c.billingAddress?.zip || '',
          country: c.billingAddress?.country || 'United States',
          paymentTerms: c.paymentTerms as ClientFormData['paymentTerms'],
          currency: c.currency,
          notes: c.notes || '',
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async (data: ClientFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const payload = {
        companyName: data.companyName,
        contactName: data.contactName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        billingAddress:
          data.street || data.city || data.state || data.zip
            ? {
                street: data.street,
                city: data.city,
                state: data.state,
                zip: data.zip,
                country: data.country,
              }
            : undefined,
        paymentTerms: data.paymentTerms,
        currency: data.currency,
        notes: data.notes || undefined,
      };
      await api.put(`/clients/${id}`, payload);
      showToast(`${data.companyName} updated successfully`, 'success');
      router.push(`/clients/${id}`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      showToast(ax?.response?.data?.message || 'Failed to update client', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Link
            href={`/clients/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Client
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
            <p className="text-gray-700 dark:text-gray-300">Client not found.</p>
            <Link
              href="/clients"
              className="mt-2 inline-block text-sm text-orange-600 hover:underline"
            >
              Back to Clients
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href={`/clients/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Client
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Client</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update client information and billing preferences.
        </p>
      </div>

      <ClientForm
        initialData={initialData}
        onSave={handleSave}
        onCancel={() => router.push(`/clients/${id}`)}
        isEdit
        isSubmitting={isSaving}
      />
    </div>
  );
}
