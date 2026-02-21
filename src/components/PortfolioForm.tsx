'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import DatePicker from '@/components/UI/DatePicker';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Toggle from '@/components/UI/Toggle';
import { PORTFOLIO_CATEGORIES } from '@/lib/mock-portfolio';
import type { PortfolioItem } from '@/lib/mock-portfolio';

export interface PortfolioFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  projectDate: string;
  client: string;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  caseStudy: string;
  testimonial: string;
  isPublished: boolean;
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const emptyForm: PortfolioFormData = {
  title: '',
  slug: '',
  description: '',
  category: '',
  projectDate: '',
  client: '',
  technologies: [],
  liveUrl: '',
  githubUrl: '',
  caseStudy: '',
  testimonial: '',
  isPublished: true,
};

function itemToForm(item: Partial<PortfolioItem>): PortfolioFormData {
  return {
    title: item.title ?? '',
    slug: item.slug ?? '',
    description: item.description ?? '',
    category: item.category ?? '',
    projectDate: item.projectDate ?? '',
    client: item.client ?? '',
    technologies: item.technologies ?? [],
    liveUrl: item.liveUrl ?? '',
    githubUrl: item.githubUrl ?? '',
    caseStudy: item.caseStudy ?? '',
    testimonial: item.testimonial ?? '',
    isPublished: item.isPublished ?? true,
  };
}

interface PortfolioFormProps {
  initialData?: Partial<PortfolioItem>;
  onSave: (data: PortfolioFormData) => void;
  isSaving: boolean;
  mode: 'create' | 'edit';
}

export default function PortfolioForm({
  initialData,
  onSave,
  isSaving,
  mode,
}: PortfolioFormProps) {
  const [form, setForm] = useState<PortfolioFormData>(() =>
    initialData ? itemToForm(initialData) : emptyForm
  );
  const [techInput, setTechInput] = useState('');

  const update = useCallback((patch: Partial<PortfolioFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    update({ title });
    if (mode === 'create') {
      update({ slug: titleToSlug(title) });
    }
  };

  const addTech = () => {
    const t = techInput.trim();
    if (!t || form.technologies.length >= 15) return;
    if (form.technologies.includes(t)) return;
    update({ technologies: [...form.technologies, t] });
    setTechInput('');
  };

  const removeTech = (idx: number) => {
    update({
      technologies: form.technologies.filter((_, i) => i !== idx),
    });
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTech();
    }
  };

  const handleSave = (asDraft: boolean) => {
    const payload = {
      ...form,
      isPublished: asDraft ? false : form.isPublished,
    };
    console.log('Portfolio save payload:', {
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      category: payload.category,
      projectDate: payload.projectDate,
      client: payload.client,
      technologies: payload.technologies,
      liveUrl: payload.liveUrl,
      githubUrl: payload.githubUrl,
      caseStudy: payload.caseStudy,
      testimonial: payload.testimonial,
      isPublished: payload.isPublished,
    });
    onSave(payload);
  };

  const categoryOptions = PORTFOLIO_CATEGORIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Left column */}
      <div className="flex-1 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader title="Basic Info" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Fintech Dashboard Redesign"
                fullWidth
                containerClassName="w-full"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <div className="flex items-center rounded-lg border-2 border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
                  <span className="ml-3 text-sm text-gray-500">novba.app/p/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => update({ slug: e.target.value })}
                    placeholder="my-project"
                    className="flex-1 border-0 bg-transparent py-2.5 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  URL-friendly, lowercase letters and hyphens only
                </p>
              </div>
              <Select
                label="Category"
                options={categoryOptions}
                value={form.category}
                onChange={(v) => update({ category: v })}
                placeholder="Select category"
                fullWidth
                containerClassName="w-full"
              />
              <TextArea
                label="Description"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Describe the project, your role, and the impact you delivered"
                rows={4}
                fullWidth
                containerClassName="w-full"
              />
              <DatePicker
                label="Project Date"
                value={form.projectDate ? new Date(form.projectDate) : null}
                onChange={(d) =>
                  update({
                    projectDate: d ? d.toISOString().slice(0, 10) : '',
                  })
                }
                placeholder="Select date"
              />
              <Input
                label="Client Name"
                value={form.client}
                onChange={(e) => update({ client: e.target.value })}
                placeholder="Optional"
                fullWidth
                containerClassName="w-full"
              />
            </div>
          </CardBody>
        </Card>

        {/* Technologies */}
        <Card>
          <CardHeader title="Technologies" />
          <CardBody>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="Add technology"
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <Button
                variant="outline"
                type="button"
                onClick={addTech}
                disabled={form.technologies.length >= 15 || !techInput.trim()}
              >
                Add
              </Button>
            </div>
            {form.technologies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.technologies.map((t, i) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTech(i)}
                      className="ml-1 rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                      aria-label={`Remove ${t}`}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Max 15 tags. Press Enter to add.
            </p>
          </CardBody>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader title="Links" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Live URL"
                value={form.liveUrl}
                onChange={(e) => update({ liveUrl: e.target.value })}
                placeholder="https://"
                fullWidth
                containerClassName="w-full"
                leftIcon={
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                }
              />
              <Input
                label="GitHub URL"
                value={form.githubUrl}
                onChange={(e) => update({ githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                fullWidth
                containerClassName="w-full"
                leftIcon={
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                }
              />
            </div>
          </CardBody>
        </Card>

        {/* Case Study */}
        <Card>
          <CardHeader
            title="Case Study"
            subtitle="Optional — tell the story behind the project"
          />
          <CardBody>
            <TextArea
              value={form.caseStudy}
              onChange={(e) => update({ caseStudy: e.target.value })}
              placeholder="Challenges, decisions, and outcomes. This is what separates a portfolio from a resume."
              rows={8}
              fullWidth
              showCharCount
              maxLength={2000}
              containerClassName="w-full"
            />
          </CardBody>
        </Card>

        {/* Testimonial */}
        <Card>
          <CardHeader
            title="Client Testimonial"
            subtitle="Optional"
          />
          <CardBody>
            <TextArea
              value={form.testimonial}
              onChange={(e) => update({ testimonial: e.target.value })}
              placeholder="What did your client say about working with you?"
              rows={4}
              fullWidth
              containerClassName="w-full"
            />
          </CardBody>
        </Card>
      </div>

      {/* Right column */}
      <div className="w-full lg:w-80 lg:shrink-0">
        <div className="sticky top-6 space-y-6">
          {/* Cover Image */}
          <Card>
            <CardBody>
              <button
                type="button"
                onClick={() => {}}
                onMouseDown={() => {}}
                className="flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white text-gray-500 transition-colors hover:border-orange-300 hover:bg-orange-50"
              >
                <svg
                  className="mb-2 h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span className="text-sm font-medium">Add cover image</span>
                <span className="mt-0.5 text-xs text-gray-400">
                  PNG, JPG up to 5MB
                </span>
              </button>
            </CardBody>
          </Card>

          {/* Publish Settings */}
          <Card>
            <CardBody>
              <Toggle
                label="Publish to portfolio"
                description="Visible on your public portfolio page"
                checked={form.isPublished}
                onChange={(checked) => update({ isPublished: checked })}
              />
              <p className="mt-3 text-xs text-gray-500">
                {form.isPublished ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Live on your portfolio
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    Saved as draft
                  </span>
                )}
              </p>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardBody>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  isLoading={isSaving}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                >
                  Save as Draft
                </Button>
                {mode === 'edit' && form.isPublished && (
                  <Link
                    href={`/p/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    View Public Page →
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
