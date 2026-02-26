'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PortfolioForm from '@/components/PortfolioForm';
import { useToast } from '@/components/UI/Toast';
import type { PortfolioFormData } from '@/components/PortfolioForm';

export default function NewPortfolioPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: PortfolioFormData) => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    showToast('Project added to your portfolio 🎉', 'success');
    setIsSaving(false);
    router.push('/portfolio');
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Portfolio
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Project</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Showcase your work and attract new clients
        </p>
      </div>
      <PortfolioForm mode="create" onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
