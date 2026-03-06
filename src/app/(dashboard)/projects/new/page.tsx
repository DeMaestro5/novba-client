'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { ApiClient } from '@/types/api.types';
import ProjectForm from '@/components/ProjectForm';
import Button from '@/components/UI/Button';
import Card, { CardBody } from '@/components/UI/Card';
import { useToast } from '@/components/UI/Toast';
import type { ProjectFormData } from '@/types/project.types';

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api
      .get('/clients?limit=500')
      .then((res) => {
        setClients(res.data?.data?.clients ?? []);
      })
      .catch(() => {
        setClients([]);
        showToast('Could not load clients. Please try again.', 'error');
      })
      .finally(() => setIsLoadingClients(false));
  }, []);

  const handleSave = async (data: ProjectFormData) => {
    if (!data.clientId?.trim()) {
      showToast('Please select a client', 'error');
      return;
    }
    setIsSaving(true);
    try {
      // Build payload to match backend schema exactly: no status (create), no order in paymentPlan, amount must be positive
      const paymentPlan = data.paymentPlan
        .filter((row) => row.milestone.trim() && Number(row.amount) > 0)
        .map((row) => ({
          milestone: row.milestone.trim(),
          amount: Number(row.amount),
          dueDate: row.dueDate.trim() ? row.dueDate.trim() : undefined,
          status: row.status,
        }));

      const payload = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        startDate: data.startDate,
        endDate: data.endDate.trim() || undefined,
        totalBudget: Number(data.totalBudget),
        currency: data.currency,
        clientId: data.clientId.trim(),
        ...(paymentPlan.length > 0 && { paymentPlan }),
      };

      const res = await api.post('/projects', payload);
      const newId = res.data.data.project?.id ?? res.data.data?.id;
      showToast(`"${data.name}" created successfully`, 'success');
      router.push(newId ? `/projects/${newId}` : '/projects');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const message =
        axiosErr.response?.data?.message ||
        (axiosErr.response?.status === 400 ? 'Invalid data. Check required fields and payment plan amounts (must be positive).' : 'Failed to create project.');
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingClients) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <nav className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-32" />
        </nav>
        <div className="mb-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="mt-6 h-36 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const clientOptions = clients.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName,
    email: c.email,
  }));

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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          New project
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a project to track scope, budget, milestones, and invoices for a client.
        </p>
      </div>

      {clientOptions.length === 0 ? (
        <Card>
          <CardBody padding="lg">
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
                <svg
                  className="h-7 w-7 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Add a client first
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Projects are linked to a client. Create at least one client, then come back to add a project.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => router.push('/clients/new')}
                >
                  Add client
                </Button>
                <Button
                  variant="outline"
                  className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => router.push('/projects')}
                >
                  Back to Projects
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <ProjectForm
          onSave={handleSave}
          onCancel={() => router.push('/projects')}
          isSaving={isSaving}
          isEdit={false}
          clients={clientOptions}
        />
      )}
    </div>
  );
}
