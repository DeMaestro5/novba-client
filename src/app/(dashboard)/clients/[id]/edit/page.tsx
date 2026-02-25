'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientForm, { initialClientFormData } from '@/components/ClientForm';
import { ClientFormData } from '@/types/client.types';
import { mockClients } from '@/lib/mock-clients';
import { useToast } from '@/components/UI/Toast';

function getEditData(id: string): ClientFormData | null {
  const client = mockClients.find((c) => c.id === id);
  if (!client) return null;
  return {
    companyName: client.companyName,
    contactName: client.contactName || '',
    email: client.email || '',
    phone: client.phone || '',
    street: client.billingAddress?.street || '',
    city: client.billingAddress?.city || '',
    state: client.billingAddress?.state || '',
    zip: client.billingAddress?.zip || '',
    country: client.billingAddress?.country || 'United States',
    paymentTerms: client.paymentTerms,
    currency: client.currency,
    notes: client.notes || '',
  };
}

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id as string;
  const initialData = getEditData(id) ?? initialClientFormData;

  const handleSave = (data: ClientFormData) => {
    showToast(`${data.companyName} updated successfully`, 'success');
    router.push(`/clients/${id}`);
  };

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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update client information and billing preferences.</p>
      </div>

      <ClientForm
        initialData={initialData}
        onSave={handleSave}
        onCancel={() => router.push(`/clients/${id}`)}
        isEdit
      />
    </div>
  );
}
