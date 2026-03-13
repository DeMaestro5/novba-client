'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import DatePicker from '@/components/UI/DatePicker';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import { useToast } from '@/components/UI/Toast';
import ProposalLineItems, {
  type LineItem,
} from '@/components/ProposalLineItems';
import ProposalPreview from '@/components/ProposalPreview';
import api, { getErrorMessage } from '@/lib/api';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

interface ApiClient {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
}

interface ApiProposal {
  id: string;
  proposalNumber: string;
  title: string;
  status: string;
  scope: string | null;
  terms: string | null;
  currency: string;
  totalAmount: number;
  validUntil: string | null;
  createdAt: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    order: number;
  }>;
  client: ApiClient;
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

export default function EditProposalPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const id = params?.id as string;
  const [showPreview, setShowPreview] = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  const [proposal, setProposal] = useState<ApiProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: '',
    currency: 'USD',
    validUntil: null as Date | null,
    scope: '',
    terms: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const fetchProposal = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get(`/proposals/${id}`);
      const p: ApiProposal = res.data?.data?.proposal;
      if (!p) {
        setNotFound(true);
        return;
      }
      if (p.status !== 'DRAFT') {
        showToast('Only draft proposals can be edited', 'error');
        router.push(`/proposals/${id}`);
        return;
      }
      setProposal(p);
      setForm({
        title: p.title,
        currency: p.currency,
        validUntil: p.validUntil ? new Date(p.validUntil) : null,
        scope: p.scope ?? '',
        terms: p.terms ?? '',
      });
      setLineItems(
        p.lineItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
          order: item.order,
        })),
      );
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) setNotFound(true);
      else showToast('Failed to load proposal', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, router, showToast]);

  useEffect(() => {
    fetchProposal().finally(() => {
      api
        .get('/settings/profile')
        .then((res) => {
          setBusinessName(
            res.data?.data?.settings?.business?.businessName ?? '',
          );
          setBusinessEmail(res.data?.data?.settings?.profile?.email ?? '');
        })
        .catch(() => {});
    });
  }, [fetchProposal]);

  const update = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    if (!proposal) return;
    if (!form.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (lineItems.length === 0) {
      showToast('At least one line item is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/proposals/${id}`, {
        title: form.title.trim(),
        scope: form.scope || undefined,
        terms: form.terms || undefined,
        currency: form.currency,
        validUntil: form.validUntil ? form.validUntil.toISOString() : undefined,
        lineItems: lineItems.map((item, idx) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.quantity) * Number(item.rate),
          order: idx,
        })),
      });
      showToast('Proposal updated', 'success');
      router.push(`/proposals/${id}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='mx-auto max-w-[1400px] p-6 lg:p-8 space-y-6'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (notFound || !proposal) {
    return (
      <div className='mx-auto max-w-[1400px] p-6 lg:p-8 flex flex-col items-center justify-center min-h-[40vh]'>
        <p className='text-gray-700 dark:text-gray-300'>Proposal not found.</p>
        <Button
          variant='outline'
          className='mt-4'
          onClick={() => router.push('/proposals')}
        >
          Back to Proposals
        </Button>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      {/* Breadcrumb */}
      <div className='mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
        <Link
          href={`/proposals/${id}`}
          className='flex items-center gap-1.5 hover:text-orange-600 transition-colors'
        >
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          Back to Proposal
        </Link>
      </div>

      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Edit Proposal
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            {proposal.proposalNumber} · {proposal.client.companyName}
          </p>
        </div>
        <button
          type='button'
          onClick={() => setShowPreview((p) => !p)}
          className='flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'
        >
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
            />
          </svg>
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      <div className={`flex gap-6 ${showPreview ? 'lg:flex-row' : 'flex-col'}`}>
        {/* Form — left side */}
        <div
          className={showPreview ? 'lg:w-[55%] space-y-6' : 'w-full space-y-6'}
        >
          <Card>
            <CardHeader title='Proposal details' />
            <CardBody>
              <div className='space-y-4'>
                {/* Client is read-only on edit — changing client on an existing proposal is not supported */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                    Client
                  </label>
                  <div className='rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400'>
                    {proposal.client.companyName}
                    {proposal.client.contactName &&
                      ` · ${proposal.client.contactName}`}
                  </div>
                </div>
                <Input
                  label='Proposal Title'
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  fullWidth
                />
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <Select
                    label='Currency'
                    options={CURRENCY_OPTIONS}
                    value={form.currency}
                    onChange={(v) => update({ currency: v })}
                    fullWidth
                  />
                  <DatePicker
                    label='Valid Until'
                    value={form.validUntil}
                    onChange={(date) => update({ validUntil: date })}
                    placeholder='Select date'
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title='Scope of work' />
            <CardBody>
              <TextArea
                label=''
                value={form.scope}
                onChange={(e) => update({ scope: e.target.value })}
                fullWidth
                minRows={5}
                placeholder='Describe the work to be done...'
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title='Pricing' />
            <CardBody>
              <ProposalLineItems
                items={lineItems}
                currency={form.currency}
                onChange={setLineItems}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title='Terms & conditions' />
            <CardBody>
              <TextArea
                label=''
                value={form.terms}
                onChange={(e) => update({ terms: e.target.value })}
                fullWidth
                minRows={4}
                placeholder='Payment terms, revision policy, etc...'
              />
            </CardBody>
          </Card>

          <div className='flex items-center justify-between'>
            <Button
              variant='outline'
              onClick={() => router.push(`/proposals/${id}`)}
            >
              Cancel
            </Button>
            <Button
              variant='primary'
              className='bg-orange-600 hover:bg-orange-700'
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Live preview — right side */}
        {showPreview && (
          <div className='lg:w-[45%]'>
            <div className='lg:sticky lg:top-8'>
              <ProposalPreview
                proposalNumber={proposal.proposalNumber}
                title={form.title || 'Proposal Title'}
                clientName={proposal.client.companyName}
                clientContact={proposal.client.contactName ?? undefined}
                businessName={businessName}
                businessEmail={businessEmail}
                scope={form.scope}
                terms={form.terms}
                currency={form.currency}
                validUntil={
                  form.validUntil
                    ? form.validUntil.toISOString().split('T')[0]
                    : undefined
                }
                lineItems={lineItems}
                createdDate={new Date(proposal.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  },
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
