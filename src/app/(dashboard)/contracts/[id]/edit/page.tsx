'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import DatePicker from '@/components/UI/DatePicker';
import { useToast } from '@/components/UI/Toast';
import { TEMPLATES, type TemplateType } from '@/components/ContractTemplateCard';
import api from '@/lib/api';

export default function EditContractPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [contract, setContract] = useState<{
    id: string;
    contractNumber: string;
    title: string;
    status: string;
    templateType: string;
    content: string;
    startDate: string | null;
    endDate: string | null;
    client: { id: string; companyName: string };
  } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; companyName: string }>>([]);
  const [form, setForm] = useState({
    clientId: '',
    title: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      api.get(`/contracts/${params.id}`),
      api.get('/clients', { params: { limit: 100 } }),
    ])
      .then(([contractRes, clientsRes]) => {
        const c = contractRes.data.data.contract ?? contractRes.data.data;
        setContract(c);
        setClients(clientsRes.data.data.clients ?? []);
        setForm({
          clientId: c.client?.id || '',
          title: c.title || '',
          startDate: c.startDate ? new Date(c.startDate) : null,
          endDate: c.endDate ? new Date(c.endDate) : null,
        });
        setContent(c.content || '');
      })
      .catch(() => setPageError(true))
      .finally(() => setPageLoading(false));
  }, [params.id]);

  const CLIENT_OPTIONS = clients.map(c => ({ value: c.id, label: c.companyName }));

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="h-8 w-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (pageError || !contract) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Contract not found</p>
      </div>
    );
  }

  const templateMeta = TEMPLATES.find(t => t.key === (contract.templateType as TemplateType));

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      title: form.title,
      content,
      startDate: form.startDate ? form.startDate.toISOString() : undefined,
      endDate: form.endDate ? form.endDate.toISOString() : undefined,
    };
    try {
      await api.put(`/contracts/${params.id}`, payload);
      showToast('Contract updated', 'success');
      router.push(`/contracts/${params.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update contract';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href={`/contracts/${params.id}`} className="flex items-center gap-1.5 hover:text-orange-600 dark:text-gray-400 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Contract
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Contract</h1>
          {templateMeta && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${templateMeta.bgColor} ${templateMeta.color}`}>
              {templateMeta.name}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{contract.contractNumber} · Update contract details</p>
      </div>

      {/* Split layout 40/60 */}
      <div className="flex gap-6 lg:flex-row flex-col">
        {/* LEFT: Form (40%) */}
        <div className="lg:w-[40%] flex flex-col gap-5">
          <Card>
            <CardHeader title="Contract details" />
            <CardBody>
              <div className="space-y-4">
                <Select
                  key={form.clientId || 'empty'}
                  label="Client"
                  options={[{ value: '', label: 'Select a client...' }, ...CLIENT_OPTIONS]}
                  value={form.clientId}
                  onChange={v => update({ clientId: v })}
                  fullWidth
                />
                <Input
                  label="Contract Title"
                  value={form.title}
                  onChange={e => update({ title: e.target.value })}
                  fullWidth
                />
              </div>
            </CardBody>
          </Card>

          <Card className="overflow-visible">
            <CardBody className="min-h-[80px]">
              <div className="relative overflow-visible grid grid-cols-2 gap-4">
                <DatePicker
                  label="Start Date"
                  value={form.startDate}
                  onChange={date => update({ startDate: date })}
                  placeholder="Select start date"
                />
                <DatePicker
                  label="End Date"
                  value={form.endDate}
                  onChange={date => update({ endDate: date })}
                  placeholder="Select end date"
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push(`/contracts/${params.id}`)}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* RIGHT: Editor (60%) */}
        <div className="lg:w-[60%]">
          <Card>
            <CardHeader
              title="Contract content"
              subtitle="Edit the contract below. Ensure all details are accurate before sending."
            />
            <CardBody>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={32}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-[13px] leading-7 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-orange-500"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              />
              <div className="mt-2 text-right">
                <p className="text-xs text-gray-400 dark:text-gray-500">{content.length} characters</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
