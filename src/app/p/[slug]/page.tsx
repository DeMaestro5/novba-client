'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MOCK_PORTFOLIO,
  MOCK_PUBLIC_PROFILE,
  type PortfolioItem,
} from '@/lib/mock-portfolio';
import Modal, {
  ModalHeader,
  ModalBody,
} from '@/components/UI/Modal';

function formatMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getCoverGradient(category: string): string {
  const gradients: Record<string, string> = {
    'UI/UX Design': 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600',
    'Full-Stack Development': 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600',
    'Frontend Development': 'bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600',
    'Backend Development': 'bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800',
    'Brand Design': 'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600',
    'Motion Design': 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
    'Web Design': 'bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600',
    'Mobile App': 'bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600',
    'Content Writing': 'bg-gradient-to-br from-lime-500 via-green-500 to-teal-600',
    'Marketing': 'bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600',
    'Video Production': 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-700',
    'Other': 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
  };
  return gradients[category] ?? 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600';
}

function getCategoryIcon(category: string): React.ReactNode {
  const iconClass = 'h-14 w-14 text-white';
  if (category.includes('Design') || category.includes('UI')) {
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
      </svg>
    );
  }
  if (category.includes('Development') || category.includes('Backend') || category.includes('Frontend')) {
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>
    );
  }
  if (category.includes('Mobile')) {
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    );
  }
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
    </svg>
  );
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [caseStudyItem, setCaseStudyItem] = useState<PortfolioItem | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (slug !== MOCK_PUBLIC_PROFILE.slug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <h1 className="text-xl font-bold text-gray-900">Portfolio not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The portfolio you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const publishedProjects = MOCK_PORTFOLIO.filter((p) => p.isPublished);
  const categories = useMemo(() => {
    const cats = new Set(publishedProjects.map((p) => p.category));
    return ['ALL', ...Array.from(cats).sort()];
  }, [publishedProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'ALL') return publishedProjects;
    return publishedProjects.filter((p) => p.category === activeCategory);
  }, [publishedProjects, activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold text-orange-600">
            Novba
          </Link>
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Hire Me
          </button>
        </div>
      </header>

      {/* Profile Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-700">
            {getInitials(MOCK_PUBLIC_PROFILE.name)}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {MOCK_PUBLIC_PROFILE.name}
          </h1>
          <p className="mt-1 text-gray-600">{MOCK_PUBLIC_PROFILE.title}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {MOCK_PUBLIC_PROFILE.location}
            </span>
            <span className="text-gray-400">•</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                MOCK_PUBLIC_PROFILE.isAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {MOCK_PUBLIC_PROFILE.isAvailable && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              )}
              {MOCK_PUBLIC_PROFILE.isAvailable
                ? 'Available for work'
                : 'Not available'}
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-gray-600">{MOCK_PUBLIC_PROFILE.bio}</p>
          <div className="mt-6 flex items-center gap-2">
            <a
              href={MOCK_PUBLIC_PROFILE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
              aria-label="LinkedIn"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href={MOCK_PUBLIC_PROFILE.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
              aria-label="Twitter"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={MOCK_PUBLIC_PROFILE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a
              href={`mailto:${MOCK_PUBLIC_PROFILE.email}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
              aria-label="Email"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>
          {/* Stats */}
          <div className="mt-8 flex items-center gap-6 border-t border-gray-200 pt-8">
            <span className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{MOCK_PUBLIC_PROFILE.totalProjects}</span>{' '}
              Projects
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{MOCK_PUBLIC_PROFILE.totalViews}</span>{' '}
              Total Views
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">6</span> Years Exp
            </span>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="border-t border-gray-100 bg-gray-50/50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900">Work</h2>
          {/* Category tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-orange-600 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Project grid */}
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {filteredProjects.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-52">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className={`h-full w-full relative ${getCoverGradient(item.category)}`}>
                      <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id={`pub-grid-${item.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
                              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#pub-grid-${item.id})`}/>
                        </svg>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        {getCategoryIcon(item.category)}
                      </div>
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
                <div className="p-5">
                  {item.client && (
                    <p className="text-xs text-gray-400">{item.client}</p>
                  )}
                  <h3 className="mt-0.5 text-base font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {item.views} views
                    </span>
                    <button
                      type="button"
                      onClick={() => setCaseStudyItem(item)}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      View Case Study →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              No projects in this category yet.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs text-gray-400">
          Built with{' '}
          <span className="font-semibold text-orange-600">Novba</span>
          {' · '}
          <Link
            href="/signup"
            className="text-orange-600 hover:text-orange-700 hover:underline"
          >
            Create your free portfolio →
          </Link>
        </p>
      </footer>

      {/* Case Study Modal */}
      <Modal
        isOpen={!!caseStudyItem}
        onClose={() => setCaseStudyItem(null)}
        size="lg"
      >
        {caseStudyItem && (
          <>
            <div className="flex justify-end border-b border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setCaseStudyItem(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ModalBody className="space-y-6">
              <div className="-mt-8">
                <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  {caseStudyItem.category}
                </span>
                <h2 className="mt-3 text-3xl font-black text-gray-900">
                  {caseStudyItem.title}
                </h2>
                <p className="mt-1 text-gray-500">
                  {caseStudyItem.client ?? 'Unknown'} ·{' '}
                  {formatMonthYear(caseStudyItem.projectDate)}
                </p>
                {(caseStudyItem.liveUrl || caseStudyItem.githubUrl) && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {caseStudyItem.liveUrl && (
                      <a
                        href={caseStudyItem.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        Live Site →
                      </a>
                    )}
                    {caseStudyItem.githubUrl && (
                      <a
                        href={caseStudyItem.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        GitHub →
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {caseStudyItem.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  About this project
                </h3>
                <p className="mt-2 text-gray-600">{caseStudyItem.description}</p>
              </div>
              {caseStudyItem.caseStudy && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Case Study
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-gray-600">
                    {caseStudyItem.caseStudy}
                  </p>
                </div>
              )}
              {caseStudyItem.testimonial && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-gray-700">&ldquo;{caseStudyItem.testimonial}&rdquo;</p>
                  {caseStudyItem.client && (
                    <p className="mt-3 text-sm font-medium text-gray-600">
                      — {caseStudyItem.client}
                    </p>
                  )}
                </div>
              )}
            </ModalBody>
          </>
        )}
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        size="sm"
      >
        <ModalHeader
          title="Get in touch"
          onClose={() => setShowContactModal(false)}
        />
        <ModalBody>
          <p className="text-sm text-gray-600">
            Reach out via email to discuss your project:
          </p>
          <p className="mt-2 font-medium text-gray-900">
            {MOCK_PUBLIC_PROFILE.email}
          </p>
          <a
            href={`mailto:${MOCK_PUBLIC_PROFILE.email}`}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Send Email
          </a>
        </ModalBody>
      </Modal>
    </div>
  );
}
