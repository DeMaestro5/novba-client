'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Card, { CardBody } from '@/components/UI/Card';
import ProjectForm from '@/components/ProjectForm';
import { useToast } from '@/components/UI/Toast';
import type { ProjectFormData, PaymentPlanRow } from '@/types/project.types';
import { MOCK_PROJECTS } from '@/lib/mock-projects';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

function projectToFormData(project: (typeof MOCK_PROJECTS)[0]): ProjectFormData {
  const paymentPlan: PaymentPlanRow[] = (project.paymentPlan ?? []).map((item, i) => ({
    id: `milestone-${project.id}-${i}`,
    milestone: item.milestone,
    amount: item.amount,
    dueDate: item.dueDate ?? '',
    status: (item.status as PaymentPlanRow['status']) ?? 'pending',
  }));
  return {
    name: project.name,
    description: project.description ?? '',
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate ?? '',
    totalBudget: project.totalBudget,
    currency: project.currency,
    paymentPlan,
  };
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id as string;

  const project = useMemo(() => (id ? MOCK_PROJECTS.find((p) => p.id === id) ?? null : null), [id]);
  const initialData = useMemo(() => (project ? projectToFormData(project) : null), [project]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: ProjectFormData) => {
    setIsSaving(true);
    try {
      // TODO: replace with api.put(`/projects/${id}`, payload) when backend is ready
      await new Promise((r) => setTimeout(r, 400));
      showToast(`"${data.name}" updated successfully`, 'success');
      router.push(`/projects/${id}`);
    } catch {
      showToast('Failed to update project', 'error');
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

  if (project === null) {
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

  if (!initialData) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-40" />
        </nav>
        <div className="flex justify-center py-12">
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    );
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
        client={project.client}
      />
    </div>
  );
}
