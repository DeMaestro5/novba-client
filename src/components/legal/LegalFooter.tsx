import Link from 'next/link';

export function LegalFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-gray-600">© 2025 Novba. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
          <Link href="/terms" className="transition-colors hover:text-gray-900">
            Terms
          </Link>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="transition-colors hover:text-gray-900">
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <a
            href="mailto:legal@novba.com"
            className="transition-colors hover:text-gray-900"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
