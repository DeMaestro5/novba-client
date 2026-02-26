'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { mockClients } from '@/lib/mock-clients';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

const CLIENT_OPTIONS = mockClients.map(c => ({ value: c.id, label: c.companyName }));

const defaultLineItem = (): LineItem => ({
  id: `temp-${Date.now()}`,
  description: '',
  quantity: 1,
  rate: 0,
  amount: 0,
  order: 0,
});

export default function NewProposalPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPreview, setShowPreview] = useState(true);

  const [form, setForm] = useState({
    clientId: '',
    title: '',
    currency: 'USD',
    validUntil: null as Date | null,
    scope: '',
    terms: 'Payment is 50% upfront and 50% upon delivery. Revisions are limited to 3 rounds.',
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  const selectedClient = mockClients.find(c => c.id === form.clientId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = 'Please select a client';
    if (!form.title.trim()) e.title = 'Title is required';
    if (lineItems.some(i => !i.description.trim())) e.lineItems = 'All line items need a description';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (isDraft = true) => {
    if (!validate()) return;

    const payload = {
      clientId: form.clientId,
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
    console.log(`=== POST /api/v1/proposals ${isDraft ? '(DRAFT)' : '(SEND)'} ===`);
    console.log(JSON.stringify(payload, null, 2));
    showToast(isDraft ? 'Proposal saved as draft' : 'Proposal created and sent', 'success');
    router.push('/proposals');
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/proposals" className="flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-600 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Proposals
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">New Proposal</span>
      </div>

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Proposal</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Build your proposal and preview it in real time</p>
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

      {/* Split panel */}
      <div className={`flex gap-6 ${showPreview ? 'lg:flex-row' : 'flex-col'}`}>
        {/* LEFT: Editor */}
        <div className={`space-y-6 ${showPreview ? 'lg:w-[55%]' : 'w-full'}`}>
          {/* Basic info */}
          <Card>
            <CardHeader title="Proposal details" subtitle="Basic information about this proposal" />
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Client *"
                  options={[{ value: '', label: 'Select a client...' }, ...CLIENT_OPTIONS]}
                  value={form.clientId}
                  onChange={(v) => update({ clientId: v })}
                  fullWidth
                  error={errors.clientId}
                />
                <Input
                  label="Proposal Title *"
                  placeholder="e.g. Brand Identity Design for Acme Corp"
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  fullWidth
                  error={errors.title}
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

          {/* Scope */}
          <Card>
            <CardHeader title="Scope of work" subtitle="Describe what's included in this proposal" />
            <CardBody>
              <TextArea
                label=""
                placeholder="Describe the work you'll be doing, what's included, and any important details the client should know..."
                value={form.scope}
                onChange={(e) => update({ scope: e.target.value })}
                fullWidth
                minRows={5}
              />
            </CardBody>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader title="Pricing" subtitle="Add your services and pricing" />
            <CardBody>
              {errors.lineItems && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">{errors.lineItems}</p>
                </div>
              )}
              <ProposalLineItems
                items={lineItems}
                currency={form.currency}
                onChange={setLineItems}
              />
            </CardBody>
          </Card>

          {/* Terms */}
          <Card>
            <CardHeader title="Terms & conditions" subtitle="Payment terms and project conditions" />
            <CardBody>
              <TextArea
                label=""
                placeholder="e.g. Payment is 50% upfront and 50% on delivery. Revisions limited to 3 rounds."
                value={form.terms}
                onChange={(e) => update({ terms: e.target.value })}
                fullWidth
                minRows={4}
              />
            </CardBody>
          </Card>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/proposals')}>
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave(true)}>
                Save as Draft
              </Button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Create & Send
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live preview */}
        {showPreview && (
          <div className="lg:w-[45%]">
            <div className="lg:sticky lg:top-8">
              <ProposalPreview
                proposalNumber="PROP-NEW"
                title={form.title}
                clientName={selectedClient?.companyName || ''}
                clientContact={selectedClient?.contactName || undefined}
                businessName="Novba Studio"
                businessEmail="billing@novba.com"
                scope={form.scope}
                terms={form.terms}
                currency={form.currency}
                validUntil={form.validUntil ? form.validUntil.toISOString().split('T')[0] : undefined}
                lineItems={lineItems}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
