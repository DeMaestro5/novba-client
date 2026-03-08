'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import DatePicker from '@/components/UI/DatePicker';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Toggle from '@/components/UI/Toggle';
import { useToast } from '@/components/UI/Toast';
import { PORTFOLIO_CATEGORIES } from '@/lib/mock-portfolio';
import type { PortfolioItem } from '@/lib/mock-portfolio';
import api, { getErrorMessage } from '@/lib/api';

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
  imageUrl?: string;
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
  imageUrl: '',
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
    imageUrl: item.imageUrl ?? '',
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
  const { showToast } = useToast();
  const [form, setForm] = useState<PortfolioFormData>(() =>
    initialData ? itemToForm(initialData) : emptyForm
  );
  const [techInput, setTechInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageFile = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPEG, PNG, and WebP images are allowed', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/portfolio-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = res.data?.data?.imageUrl;
      update({ imageUrl });
      setLocalPreview(null);
      showToast('Cover image uploaded', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setLocalPreview(null);
      update({ imageUrl: '' });
    } finally {
      setIsUploading(false);
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
      imageUrl: payload.imageUrl,
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
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Slug
                </label>
                <div className="flex items-center rounded-lg border-2 border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 dark:border-gray-700">
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">novba.app/p/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => update({ slug: e.target.value })}
                    placeholder="my-project"
                    className="flex-1 border-0 bg-transparent py-2.5 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
              <Button
                variant="outline"
                type="button"
                onClick={addTech}
                disabled={form.technologies.length >= 15 || !techInput.trim()}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Add
              </Button>
            </div>
            {form.technologies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.technologies.map((t, i) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTech(i)}
                      className="ml-1 rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
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
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
                Cover Image
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                  e.target.value = '';
                }}
              />

              {/* Preview state — image already set */}
              {(form.imageUrl || localPreview) ? (
                <div className="relative h-48 w-full overflow-hidden rounded-xl">
                  <img
                    src={localPreview ?? form.imageUrl}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                  {/* Upload spinner overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <svg
                        className="h-8 w-8 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                  )}
                  {/* Remove button — only when not uploading */}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => {
                        update({ imageUrl: '' });
                        setLocalPreview(null);
                      }}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                      aria-label="Remove image"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                  {/* Replace button — only when not uploading */}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-black/70"
                    >
                      Replace
                    </button>
                  )}
                </div>
              ) : (
                /* Empty upload area */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
                    isDragging
                      ? 'border-orange-400 bg-orange-50/30 dark:bg-orange-950/10'
                      : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/30 dark:border-gray-600 dark:hover:border-orange-500 dark:hover:bg-orange-950/10'
                  }`}
                >
                  <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isDragging ? 'Drop to upload' : 'Add cover image'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    PNG, JPG, WebP up to 5MB
                  </span>
                </div>
              )}
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
