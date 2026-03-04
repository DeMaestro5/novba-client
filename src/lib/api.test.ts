import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './api';

describe('getErrorMessage', () => {
  it('returns message from response.data.message', () => {
    const err = {
      response: { data: { message: 'Invoice not found' } },
    };
    expect(getErrorMessage(err)).toBe('Invoice not found');
  });

  it('returns message from response.data.error.message', () => {
    const err = {
      response: { data: { error: { message: 'Forbidden' } } },
    };
    expect(getErrorMessage(err)).toBe('Forbidden');
  });

  it('returns Error message when present and no response body', () => {
    const err = new Error('Network error');
    expect(getErrorMessage(err)).toBe('Network error');
  });

  it('returns fallback for unknown shape with no response or message', () => {
    expect(getErrorMessage({})).toBe('Something went wrong');
  });
});
