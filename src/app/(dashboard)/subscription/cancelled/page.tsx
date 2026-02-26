'use client';

import Link from 'next/link';
import Button from '@/components/UI/Button';
import Card, { CardBody } from '@/components/UI/Card';

const missedItems = [
  'Unlimited invoices — no monthly cap',
  'AI pricing insights to stop undercharging',
  'Accept card payments via Stripe',
  'Custom branding on all client documents',
  '14-day free trial, no credit card needed',
];

export default function SubscriptionCancelledPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-12 flex flex-col items-center">
      <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </span>
      <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white text-center">
        No worries — you&apos;re still on Free
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400 text-center">
        You left before completing checkout. Nothing has changed.
      </p>

      <Card className="mt-6 w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <CardBody padding="lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What you&apos;re still missing:
          </p>
          <ul className="space-y-2">
            {missedItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="text-orange-500 dark:text-orange-400 shrink-0">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/subscription">
          <Button variant="primary" className="bg-orange-600 hover:bg-orange-700">
            View Plans
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
