'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type TOCEntry = { id: string; label: string };

export function LegalTOC({ entries }: { entries: TOCEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const ids = entries.map((e) => e.id);

    const observer = new IntersectionObserver(
      (observed) => {
        observed.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          if (id && ids.includes(id)) {
            setActiveId(id);
          }
        });
      },
      {
        rootMargin: '-80px 0% -70% 0%',
        threshold: 0,
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav
      aria-label="Table of contents"
      className="hidden lg:block lg:w-56 lg:shrink-0"
    >
      <div className="sticky top-24 space-y-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          On this page
        </p>
        <ul className="space-y-1">
          {entries.map(({ id, label }) => (
            <li key={id}>
              <Link
                href={`#${id}`}
                className={`block rounded-md py-1.5 pl-3 text-sm transition-colors ${
                  activeId === id
                    ? 'font-medium text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
