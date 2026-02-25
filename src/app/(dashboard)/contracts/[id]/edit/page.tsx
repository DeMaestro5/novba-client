'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import DatePicker from '@/components/UI/DatePicker';
import { useToast } from '@/components/UI/Toast';
import { TEMPLATES } from '@/components/ContractTemplateCard';
import { mockContracts } from '@/lib/mock-contracts';
import { mockClients } from '@/lib/mock-clients';

const CLIENT_OPTIONS = mockClients.map(c => ({ value: c.id, label: c.companyName }));

export default function EditContractPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const contract = mockContracts.find(c => c.id === params.id);

  const [form, setForm] = useState({
    clientId: contract?.clientId || '',
    title: contract?.title || '',
    startDate: contract?.startDate ? new Date(contract.startDate) : null as Date | null,
    endDate: contract?.endDate ? new Date(contract.endDate) : null as Date | null,
  });
  const [content, setContent] = useState(contract?.content || '');
  const update = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Contract not found</p>
      </div>
    );
  }

  // Temporary debug — verify clientId matches CLIENT_OPTIONS values
  console.log('contract clientId:', contract.clientId);
  console.log('CLIENT_OPTIONS:', CLIENT_OPTIONS);

  const templateMeta = TEMPLATES.find(t => t.key === contract.templateType);

  const handleSave = () => {
    const payload = {
      title: form.title,
      content,
      startDate: form.startDate ? form.startDate.toISOString() : undefined,
      endDate: form.endDate ? form.endDate.toISOString() : undefined,
    };
    console.log(`=== PUT /api/v1/contracts/${params.id} ===`);
    console.log(JSON.stringify(payload, null, 2));
    showToast('Contract updated', 'success');
    router.push(`/contracts/${contract.id}`);
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
            <Button
              variant="primary"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSave}
            >
              Save Changes
            </Button>
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
