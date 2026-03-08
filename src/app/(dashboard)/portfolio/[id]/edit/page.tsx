'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PortfolioForm from '@/components/PortfolioForm';
import { useToast } from '@/components/UI/Toast';
import type { PortfolioFormData } from '@/components/PortfolioForm';
import api, { getErrorMessage } from '@/lib/api';

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string | null;
  images: string[] | null;
  projectDate: string;
  client: string | null;
  technologies: string[] | null;
  liveUrl: string | null;
  githubUrl: string | null;
  caseStudy: string | null;
  testimonial: string | null;
  isPublished: boolean;
  order: number;
  views: number;
}

export default function EditPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [item, setItem] = useState<PortfolioFormData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) {
      setPageError(true);
      setPageLoading(false);
      return;
    }
    api.get('/profile')
      .then((res) => {
        setPortfolioSlug(res.data?.data?.user?.portfolioSlug ?? null);
      })
      .catch(() => {});
    api
      .get(`/portfolio/${params.id}`)
      .then((res) => {
        const data = res.data?.data;
        const raw: PortfolioItem = data?.portfolio ?? data;
        if (!raw) {
          setPageError(true);
          return;
        }
        setItem({
          title: raw.title ?? '',
          slug: raw.slug ?? '',
          description: raw.description ?? '',
          category: raw.category ?? '',
          imageUrl: raw.imageUrl ?? '',
          projectDate: raw.projectDate
            ? raw.projectDate.split('T')[0]
            : '',
          client: raw.client ?? '',
          technologies: (raw.technologies as string[]) ?? [],
          liveUrl: raw.liveUrl ?? '',
          githubUrl: raw.githubUrl ?? '',
          caseStudy: raw.caseStudy ?? '',
          testimonial: raw.testimonial ?? '',
          isPublished: raw.isPublished ?? true,
        });
      })
      .catch(() => setPageError(true))
      .finally(() => setPageLoading(false));
  }, [params?.id]);

  const handleSave = async (data: PortfolioFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        title: data.title?.trim(),
        slug: data.slug?.trim(),
        description: data.description?.trim(),
        category: data.category?.trim(),
        imageUrl: data.imageUrl?.trim() || undefined,
        projectDate: data.projectDate
          ? new Date(data.projectDate).toISOString()
          : undefined,
        client: data.client?.trim() || undefined,
        technologies: data.technologies?.filter(Boolean) ?? undefined,
        liveUrl: data.liveUrl?.trim() || undefined,
        githubUrl: data.githubUrl?.trim() || undefined,
        caseStudy: data.caseStudy?.trim() || undefined,
        testimonial: data.testimonial?.trim() || undefined,
        isPublished: data.isPublished ?? true,
      };
      await api.put(`/portfolio/${params.id}`, payload);
      showToast('Project updated successfully', 'success');
      router.push('/portfolio');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className='mx-auto max-w-[1200px] p-6 lg:p-8'>
        <div className='flex items-center justify-center py-24'>
          <svg
            className='h-8 w-8 animate-spin text-orange-600'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
            />
          </svg>
        </div>
      </div>
    );
  }

  if (pageError || !item) {
    return (
      <div className='mx-auto max-w-[1200px] p-6 lg:p-8'>
        <div className='flex flex-col items-center justify-center py-24 text-center'>
          <p className='font-semibold text-gray-900 dark:text-white'>
            Project not found
          </p>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href='/portfolio'
            className='mt-4 text-sm font-medium text-orange-600 hover:text-orange-700'
          >
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-[1200px] p-6 lg:p-8'>
      <div className='mb-6'>
        <Link
          href='/portfolio'
          className='inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500'
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
              d='M10 19l-7-7m0 0l7-7m-7 7h18'
            />
          </svg>
          Back to Portfolio
        </Link>
      </div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Edit Project
        </h1>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Update your project details and showcase
        </p>
        {portfolioSlug && (
          <a
            href={`/p/${portfolioSlug}`}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-block text-sm font-medium text-orange-600 hover:text-orange-700'
          >
            View Public Page →
          </a>
        )}
      </div>
      <PortfolioForm
        mode='edit'
        initialData={item}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
