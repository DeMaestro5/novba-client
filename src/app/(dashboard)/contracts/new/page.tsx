'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import DatePicker from '@/components/UI/DatePicker';
import { useToast } from '@/components/UI/Toast';
import ContractTemplateCard, { TEMPLATES, type TemplateType } from '@/components/ContractTemplateCard';
import { mockClients } from '@/lib/mock-clients';

const CLIENT_OPTIONS = mockClients.map(c => ({ value: c.id, label: c.companyName }));

// Template content pre-fills
const TEMPLATE_CONTENT: Record<TemplateType, string> = {
  service_agreement: `SERVICE AGREEMENT

This Service Agreement is entered into as of [START_DATE] between:

SERVICE PROVIDER:
[YOUR_BUSINESS_NAME]
[YOUR_EMAIL]

CLIENT:
[CLIENT_NAME]
[CLIENT_EMAIL]

1. SERVICES
The Service Provider agrees to provide the following services:
[DESCRIBE_SCOPE_OF_WORK]

2. COMPENSATION
Total Amount: [AMOUNT] [CURRENCY]
Payment Terms: [PAYMENT_TERMS]

3. TERM
This Agreement shall commence on [START_DATE] and continue until [END_DATE].

4. DELIVERABLES
[LIST_DELIVERABLES]

5. INTELLECTUAL PROPERTY
All work product created under this Agreement shall be owned by the Client upon full payment.

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

7. REVISIONS
Includes [NUMBER] rounds of revisions. Additional revisions billed at [HOURLY_RATE]/hour.

8. TERMINATION
Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.

SIGNATURES:

Service Provider: _________________     Date: _____________
Client: _________________              Date: _____________`,

  nda: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into as of [START_DATE] between:

DISCLOSING PARTY:
[YOUR_BUSINESS_NAME]

RECEIVING PARTY:
[CLIENT_NAME]
[CLIENT_EMAIL]

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party that is marked as confidential or should reasonably be understood as confidential given the nature of the information.

2. OBLIGATIONS
The Receiving Party agrees to:
- Maintain strict confidentiality of all Confidential Information
- Use Confidential Information solely for the Purpose of [PROJECT_PURPOSE]
- Not disclose to any third parties without prior written consent
- Protect with at least the same degree of care as own confidential information

3. TERM
This Agreement shall remain in effect for [DURATION] years from the date of execution.

4. EXCLUSIONS
This Agreement does not apply to information that is publicly available, was known prior to disclosure, or is independently developed.

5. RETURN OF MATERIALS
Upon termination or request, all Confidential Information must be returned or securely destroyed.

SIGNATURES:

Disclosing Party: _________________     Date: _____________
Receiving Party: _________________     Date: _____________`,

  sow: `STATEMENT OF WORK

Project: [PROJECT_TITLE]
Date: [START_DATE]

PARTIES:
Service Provider: [YOUR_BUSINESS_NAME]
Client: [CLIENT_NAME]

1. PROJECT OVERVIEW
[DESCRIBE_PROJECT]

2. SCOPE OF WORK
[DETAILED_SCOPE]

3. DELIVERABLES
[LIST_DELIVERABLES]

4. TIMELINE
Start Date: [START_DATE]
End Date: [END_DATE]
Total Duration: [DURATION]

5. PAYMENT SCHEDULE
Total Project Cost: [AMOUNT] [CURRENCY]
[LIST_PAYMENT_MILESTONES]

6. ACCEPTANCE CRITERIA
[DEFINE_ACCEPTANCE_CRITERIA]

7. ASSUMPTIONS & EXCLUSIONS
[LIST_ASSUMPTIONS]
[LIST_OUT_OF_SCOPE_ITEMS]

8. CHANGE MANAGEMENT
Any changes to this SOW must be documented and approved by both parties in writing.

APPROVED BY:

Service Provider: _________________     Date: _____________
Client: _________________              Date: _____________`,

  freelance: `FREELANCE CONTRACT

This Freelance Contract is entered into on [START_DATE] between:

FREELANCER:
[YOUR_BUSINESS_NAME]
Email: [YOUR_EMAIL]

CLIENT:
[CLIENT_NAME]
Email: [CLIENT_EMAIL]

1. PROJECT DESCRIPTION
[DESCRIBE_PROJECT]

2. SCOPE OF WORK
[SCOPE_DETAILS]

3. COMPENSATION
Fixed Fee: [TOTAL_AMOUNT] [CURRENCY]
Payment: 50% upfront, 50% upon delivery.

4. DEADLINE
Project completion date: [END_DATE]

5. REVISIONS
Includes [NUMBER] rounds of revisions. Additional revisions at [REVISION_RATE]/hour.

6. INTELLECTUAL PROPERTY
Work product becomes Client's property upon receipt of full payment.

7. KILL FEE
If project is cancelled after work has commenced, [KILL_FEE_PERCENTAGE]% of total fee is due.

8. INDEPENDENT CONTRACTOR
Freelancer is an independent contractor, not an employee.

AGREED:

Freelancer: _________________     Date: _____________
Client: _________________         Date: _____________`,

  consulting: `CONSULTING AGREEMENT

This Consulting Agreement is made as of [START_DATE] between:

CONSULTANT:
[YOUR_BUSINESS_NAME]
[YOUR_EMAIL]

CLIENT:
[CLIENT_NAME]
[CLIENT_EMAIL]

1. CONSULTING SERVICES
The Consultant agrees to provide the following services:
[SERVICES_DESCRIPTION]

2. COMPENSATION
Monthly Retainer: [MONTHLY_AMOUNT] [CURRENCY]
OR
Project Fee: [TOTAL_AMOUNT] [CURRENCY]
Payment due within [PAYMENT_DAYS] days of invoice.

3. TERM
This Agreement is effective from [START_DATE] to [END_DATE].

4. INDEPENDENT CONTRACTOR
The Consultant is an independent contractor, not an employee of the Client.

5. CONFIDENTIALITY
Consultant agrees to maintain strict confidentiality of all Client information.

6. DELIVERABLES
[LIST_DELIVERABLES_OR_REPORTS]

7. TERMINATION
Either party may terminate with [NOTICE_PERIOD] days written notice.

SIGNATURES:

Consultant: _________________     Date: _____________
Client: _________________         Date: _____________`,

  custom: `[DOCUMENT TITLE]

This Agreement is entered into as of [DATE] between:

PARTY A:
[YOUR_BUSINESS_NAME]
[YOUR_EMAIL]

PARTY B:
[CLIENT_NAME]
[CLIENT_EMAIL]

1. [SECTION_TITLE]
[SECTION_CONTENT]

2. [SECTION_TITLE]
[SECTION_CONTENT]

3. [SECTION_TITLE]
[SECTION_CONTENT]

SIGNATURES:

Party A: _________________     Date: _____________
Party B: _________________     Date: _____________`,
};

export default function NewContractPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);

  const [form, setForm] = useState({
    clientId: '',
    title: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  const handleTemplateSelect = (key: TemplateType) => {
    setSelectedTemplate(key);
  };

  const handleContinue = () => {
    if (!selectedTemplate) return;
    const template = TEMPLATES.find(t => t.key === selectedTemplate);
    setForm(prev => ({
      ...prev,
      title: template?.name || '',
    }));
    setContent(TEMPLATE_CONTENT[selectedTemplate]);
    setStep(2);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = 'Please select a client';
    if (!form.title.trim()) e.title = 'Title is required';
    if (!content.trim()) e.content = 'Contract content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (sendImmediately = false) => {
    if (!validate()) return;
    const payload = {
      clientId: form.clientId,
      title: form.title,
      templateType: selectedTemplate,
      content,
      startDate: form.startDate ? form.startDate.toISOString() : undefined,
      endDate: form.endDate ? form.endDate.toISOString() : undefined,
    };
    console.log(`=== POST /api/v1/contracts ${sendImmediately ? '(SEND)' : '(DRAFT)'} ===`);
    console.log(JSON.stringify(payload, null, 2));
    showToast(sendImmediately ? 'Contract sent to client' : 'Contract saved as draft', 'success');
    router.push('/contracts');
  };

  // ─── STEP 1: Template selection ────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/contracts" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Contracts
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200 font-medium">New Contract</span>
        </div>

        {/* Step header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">1</div>
              <span className="text-sm font-semibold text-orange-600">Choose Template</span>
            </div>
            <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-400 dark:text-gray-500">2</div>
              <span className="text-sm font-medium text-gray-400 dark:text-gray-600">Contract Details</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">What type of contract do you need?</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a template to get started. You can customize the content in the next step.</p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map(template => (
            <ContractTemplateCard
              key={template.key}
              template={template}
              isSelected={selectedTemplate === template.key}
              onSelect={handleTemplateSelect}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push('/contracts')}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Continue
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Form + editor ──────────────────────────────────────────────────
  const selectedTemplateMeta = TEMPLATES.find(t => t.key === selectedTemplate);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/contracts" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Contracts
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">New Contract</span>
      </div>

      {/* Step header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-600">Template</span>
          </button>
          <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">2</div>
            <span className="text-sm font-semibold text-orange-600">Contract Details</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Contract</h1>
          {selectedTemplateMeta && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${selectedTemplateMeta.bgColor} ${selectedTemplateMeta.color}`}>
              {selectedTemplateMeta.name}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fill in the details and customize the contract content</p>
      </div>

      {/* Split layout: 40% form / 60% editor */}
      <div className="flex gap-6 lg:flex-row flex-col">
        {/* LEFT: Form (40%) */}
        <div className="lg:w-[40%] flex flex-col gap-5">
          <Card>
            <CardHeader title="Contract details" subtitle="Basic information for this contract" />
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Client *"
                  options={[{ value: '', label: 'Select a client...' }, ...CLIENT_OPTIONS]}
                  value={form.clientId}
                  onChange={v => update({ clientId: v })}
                  fullWidth
                  error={errors.clientId}
                />
                <Input
                  label="Contract Title *"
                  placeholder="e.g. Brand Identity Service Agreement"
                  value={form.title}
                  onChange={e => update({ title: e.target.value })}
                  fullWidth
                  error={errors.title}
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

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/contracts')}>
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave(false)}>
                Save as Draft
              </Button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Send to Client
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Contract editor (60%) */}
        <div className="lg:w-[60%]">
          <Card>
            <CardHeader
              title="Contract content"
              subtitle="Customize the template below. Replace all [PLACEHOLDERS] with real values."
            />
            <CardBody>
              {errors.content && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">{errors.content}</p>
                </div>
              )}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={32}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-[13px] leading-7 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-orange-500"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
                placeholder="Your contract content will appear here..."
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">Replace all [PLACEHOLDERS] with actual values before sending</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{content.length} characters</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
