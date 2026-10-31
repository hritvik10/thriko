import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EnquiryPayload } from './types';

const mocks = vi.hoisted(() => ({
  config: { apiBaseUrl: '', contactEmail: '', requestTimeoutMs: 15_000 },
}));
vi.mock('../../config', () => ({ config: mocks.config }));

import { EnquiryApiError, submitEnquiry } from './api';

// The tests run in Vitest's node environment, but api.ts uses the window timers.
vi.stubGlobal('window', {
  setTimeout: setTimeout.bind(globalThis),
  clearTimeout: clearTimeout.bind(globalThis),
});

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const PAYLOAD: EnquiryPayload = {
  name: 'Jane Cooper',
  email: 'jane@company.com',
  project_types: ['website'],
  country: 'GB',
  other_country: '',
  budget_amount: 25_000,
  budget_not_sure: false,
  timeline: '1_3_months',
  message: '',
  partner_program: false,
  consent: true,
  website: '',
};

/** Minimal stand-in for the parts of Response that api.ts reads. */
function reply(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

const lastRequest = () => fetchMock.mock.calls[0] as [string, RequestInit];

beforeEach(() => {
  fetchMock.mockReset();
  mocks.config.apiBaseUrl = '';
});

describe('submitEnquiry', () => {
  it('posts JSON to /api/enquiries and returns the reference', async () => {
    fetchMock.mockResolvedValue(reply(201, { id: 'TH-ABC123', message: 'Thanks!' }));

    await expect(submitEnquiry(PAYLOAD)).resolves.toEqual({ id: 'TH-ABC123', message: 'Thanks!' });

    const [url, init] = lastRequest();
    expect(url).toBe('/api/enquiries');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('maps a 422 onto the matching form fields', async () => {
    fetchMock.mockResolvedValue(
      reply(422, { detail: [{ loc: ['body', 'email'], msg: 'Enter a valid email address.' }] }),
    );

    await expect(submitEnquiry(PAYLOAD)).rejects.toMatchObject({
      status: 422,
      fieldErrors: { email: 'Enter a valid email address.' },
    });
  });

  it('reports a 429 as a rate limit', async () => {
    fetchMock.mockResolvedValue(reply(429, null));
    await expect(submitEnquiry(PAYLOAD)).rejects.toBeInstanceOf(EnquiryApiError);
  });
});
