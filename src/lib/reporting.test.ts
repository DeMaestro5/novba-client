import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportInvoiceFetchError } from './reporting';

describe('reportInvoiceFetchError', () => {
  let consoleError: typeof console.error;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('calls console.error in development with invoiceId, status, and message', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    reportInvoiceFetchError({
      invoiceId: 'inv-123',
      status: 404,
      message: 'Not found',
    });
    expect(consoleError).toHaveBeenCalledWith('[reporting] invoice fetch error', {
      invoiceId: 'inv-123',
      status: 404,
      message: 'Not found',
    });
    process.env.NODE_ENV = orig;
  });

  it('accepts minimal params', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    reportInvoiceFetchError({ invoiceId: 'id-only' });
    expect(consoleError).toHaveBeenCalledWith('[reporting] invoice fetch error', {
      invoiceId: 'id-only',
      status: undefined,
      message: undefined,
    });
    process.env.NODE_ENV = orig;
  });
});
