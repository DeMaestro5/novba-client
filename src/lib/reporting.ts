/**
 * Lightweight reporting for critical flows (e.g. invoice fetch errors).
 * Replace or extend with Sentry/Datadog when available.
 */
export function reportInvoiceFetchError(params: {
  invoiceId: string;
  status?: number;
  message?: string;
}): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[reporting] invoice fetch error', params);
  }
  // When integrating Sentry: Sentry.captureMessage('invoice_fetch_error', { extra: params });
}
