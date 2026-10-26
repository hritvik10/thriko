/**
 * Runtime configuration read from Vite env variables (see .env.example).
 * Keep all environment access in this file so it is easy to audit.
 */
export const config = {
  /** Base URL for API calls. Empty string means same origin (/api/...). */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, ''),
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'hello@thriko.com',
  /** Request timeout for form submissions, in milliseconds. */
  requestTimeoutMs: 15_000,
} as const;
