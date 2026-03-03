'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ClientForm from '@/components/ClientForm';
import { ClientFormData } from '@/types/client.types';
import { useToast } from '@/components/UI/Toast';

export default function NewClientPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: ClientFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        companyName: data.companyName,
        contactName: data.contactName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        billingAddress:
          data.street || data.city || data.state || data.zip || data.country
            ? {
                street: data.street || undefined,
                city: data.city || undefined,
                state: data.state || undefined,
                zip: data.zip || undefined,
                country: data.country || undefined,
              }
            : undefined,
        paymentTerms: data.paymentTerms,
        currency: data.currency,
        notes: data.notes || undefined,
      };

      await api.post('/clients', payload);
      showToast(`${data.companyName} added successfully`, 'success');
      router.push('/clients');
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } } };
      if (ax?.response?.status === 403) {
        showToast('Client limit reached. Upgrade to add more.', 'error');
      } else {
        const msg = ax?.response?.data?.message || 'Failed to add client';
        showToast(msg, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Client</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a new client to your account.</p>
      </div>

      <ClientForm
        onSave={handleSave}
        onCancel={() => router.push('/clients')}
      />
    </div>
  );
}
