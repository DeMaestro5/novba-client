'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/UI/Button';
import Card, { CardBody } from '@/components/UI/Card';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.replace('/dashboard');
      return;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown, router]);

  const unlocked = [
    'Unlimited clients, invoices, and proposals',
    'AI pricing insights to price with confidence',
    'Stripe Connect — get paid by card',
    'Custom branding on invoices and proposals',
    'Priority support when you need it',
  ];

  return (
    <div className="mx-auto max-w-lg px-6 py-12 flex flex-col items-center">
      <div className="relative inline-flex">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-25 animate-ping" />
        <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500 dark:bg-green-600 text-white">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white text-center">
        You&apos;re all set! 🎉
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400 text-center">
        Your subscription is now active.
      </p>

      <Card className="mt-6 w-full border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20">
        <CardBody padding="lg">
          <ul className="space-y-2">
            {unlocked.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <span className="text-green-500 dark:text-green-400 shrink-0">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button
          variant="primary"
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </Button>
        <Link href="/invoices/new">
          <Button variant="outline">Create First Invoice</Button>
        </Link>
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Redirecting in {countdown}s...
      </p>
      {sessionId && (
        <input type="hidden" value={sessionId} readOnly aria-hidden />
      )}
    </div>
  );
}
