'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import DatePicker from '@/components/UI/DatePicker';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import { useToast } from '@/components/UI/Toast';
import ProposalLineItems, { type LineItem } from '@/components/ProposalLineItems';
import ProposalPreview from '@/components/ProposalPreview';
import { mockProposals } from '@/lib/mock-proposals';
import { mockClients } from '@/lib/mock-clients';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

const CLIENT_OPTIONS = mockClients.map(c => ({ value: c.id, label: c.companyName }));

export default function EditProposalPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const [showPreview, setShowPreview] = useState(true);

  const proposal = mockProposals.find(p => p.id === params.id);

  const [form, setForm] = useState({
    clientId: proposal?.clientId || '',
    title: proposal?.title || '',
    currency: proposal?.currency || 'USD',
    validUntil: proposal?.validUntil ? new Date(proposal.validUntil) : null as Date | null,
    scope: proposal?.scope || '',
    terms: proposal?.terms || '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(
    proposal?.lineItems.map(i => ({ ...i })) || []
  );

  const update = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));
  const selectedClient = mockClients.find(c => c.id === form.clientId);

  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Proposal not found</p>
      </div>
    );
  }

  const handleSave = () => {
    const payload = {
      title: form.title.trim(),
      scope: form.scope || undefined,
      terms: form.terms || undefined,
      currency: form.currency,
      validUntil: form.validUntil ? form.validUntil.toISOString().split('T')[0] : undefined,
      lineItems: lineItems.map((item, idx) => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        order: idx,
      })),
    };
    console.log(`=== PUT /api/v1/proposals/${params.id} ===`);
    console.log(JSON.stringify(payload, null, 2));
    showToast('Proposal updated', 'success');
    router.push(`/proposals/${params.id}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href={`/proposals/${params.id}`} className="flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-600 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Proposal
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Proposal</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{proposal.proposalNumber} · Update proposal details</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(p => !p)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      <div className={`flex gap-6 ${showPreview ? 'lg:flex-row' : 'flex-col'}`}>
        <div className={`space-y-6 ${showPreview ? 'lg:w-[55%]' : 'w-full'}`}>
          <Card>
            <CardHeader title="Proposal details" />
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Client"
                  options={[{ value: '', label: 'Select a client...' }, ...CLIENT_OPTIONS]}
                  value={form.clientId}
                  onChange={(v) => update({ clientId: v })}
                  fullWidth
                />
                <Input
                  label="Proposal Title"
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  fullWidth
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Currency"
                    options={CURRENCY_OPTIONS}
                    value={form.currency}
                    onChange={(v) => update({ currency: v })}
                    fullWidth
                  />
                  <DatePicker
                    label="Valid Until"
                    value={form.validUntil}
                    onChange={(date) => update({ validUntil: date })}
                    placeholder="Select date"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Scope of work" />
            <CardBody>
              <TextArea
                label=""
                value={form.scope}
                onChange={(e) => update({ scope: e.target.value })}
                fullWidth
                minRows={5}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pricing" />
            <CardBody>
              <ProposalLineItems
                items={lineItems}
                currency={form.currency}
                onChange={setLineItems}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Terms & conditions" />
            <CardBody>
              <TextArea
                label=""
                value={form.terms}
                onChange={(e) => update({ terms: e.target.value })}
                fullWidth
                minRows={4}
              />
            </CardBody>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push(`/proposals/${params.id}`)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="lg:w-[45%]">
            <div className="lg:sticky lg:top-8">
              <ProposalPreview
                proposalNumber={proposal.proposalNumber}
                title={form.title}
                clientName={selectedClient?.companyName || proposal.clientName}
                clientContact={selectedClient?.contactName || proposal.clientContact}
                businessName="Novba Studio"
                businessEmail="billing@novba.com"
                scope={form.scope}
                terms={form.terms}
                currency={form.currency}
                validUntil={form.validUntil ? form.validUntil.toISOString().split('T')[0] : undefined}
                lineItems={lineItems}
                createdDate={new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
