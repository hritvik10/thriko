/**
 * Runtime configuration read from Vite env variables (see .env.example).
 * Keep all environment access in this file so it is easy to audit.
 */
export const config = {
  /** Base URL for API calls. Empty string means same origin (/api/...). */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, ''),
  /**
   * Cloudflare Turnstile site key. Public by design. Leave empty to turn the
   * check off, which is what local development against the Python API does.
   */
  turnstileSiteKey: (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim(),
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'career@thriko.com',
  /** Request timeout for form submissions, in milliseconds. */
  requestTimeoutMs: 15_000,
} as const;
