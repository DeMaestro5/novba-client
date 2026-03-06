'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card, { CardBody } from '@/components/UI/Card';
import ProjectForm from '@/components/ProjectForm';
import { useToast } from '@/components/UI/Toast';
import type { ProjectFormData, PaymentPlanRow } from '@/types/project.types';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id as string;

  const [project, setProject] = useState<any | null>(null);
  const [initialData, setInitialData] = useState<ProjectFormData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; companyName: string; contactName: string | null; email: string | null }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Normalize API date (ISO or YYYY-MM-DD) to YYYY-MM-DD for form/DatePicker
  const toDateOnly = (value: string | null | undefined): string => {
    if (value == null || value === '') return '';
    const s = String(value).trim();
    const datePart = s.includes('T') ? s.split('T')[0] : s.slice(0, 10);
    return datePart || '';
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/projects/${id}`),
      api.get('/clients', { params: { limit: 100 } }),
    ])
      .then(([projectRes, clientsRes]) => {
        const p = projectRes.data.data.project ?? projectRes.data.data;
        setProject(p);
        setClients(clientsRes.data.data.clients ?? []);
        const paymentPlan: PaymentPlanRow[] = (p.paymentPlan ?? []).map(
          (item: any, i: number) => ({
            id: `milestone-${p.id}-${i}`,
            milestone: item.milestone ?? '',
            amount: item.amount ?? 0,
            dueDate: toDateOnly(item.dueDate),
            status: item.status ?? 'pending',
          })
        );
        setInitialData({
          name: p.name,
          description: p.description ?? '',
          status: p.status,
          startDate: toDateOnly(p.startDate),
          endDate: toDateOnly(p.endDate),
          totalBudget: Number(p.totalBudget),
          currency: p.currency,
          clientId: p.client?.id ?? '',
          paymentPlan,
        });
      })
      .catch(() => setPageError(true))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleSave = async (data: ProjectFormData) => {
    setIsSaving(true);
    try {
      // Backend update schema: no `order` in paymentPlan; amount must be positive when sent
      const paymentPlan = data.paymentPlan
        .filter((row) => row.milestone.trim() && Number(row.amount) > 0)
        .map((row) => ({
          milestone: row.milestone.trim(),
          amount: Number(row.amount),
          dueDate: row.dueDate?.trim() ? row.dueDate.trim() : undefined,
          status: row.status,
        }));

      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate?.trim() || undefined,
        totalBudget: Number(data.totalBudget),
        currency: data.currency,
        clientId: data.clientId || undefined,
        ...(paymentPlan.length > 0 && { paymentPlan }),
      };

      await api.put(`/projects/${id}`, payload);
      showToast(`"${data.name}" updated successfully`, 'success');
      router.push(`/projects/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Failed to update project';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!id) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
        </nav>
        <Card>
          <CardBody padding="lg">
            <p className="text-gray-700 dark:text-gray-300">Project not found.</p>
            <Link
              href="/projects"
              className="mt-2 inline-block text-sm text-orange-600 hover:underline dark:text-orange-400"
            >
              Back to Projects
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

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
  if (pageError) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <p className="text-gray-500">Failed to load project.</p>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit project</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update project details, dates, budget, and payment plan.
        </p>
      </div>

      <ProjectForm
        initialData={initialData}
        onSave={handleSave}
        onCancel={() => router.push(`/projects/${id}`)}
        isSaving={isSaving}
        isEdit
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName, contactName: c.contactName, email: c.email }))}
        client={project?.client}
      />
    </div>
  );
}
