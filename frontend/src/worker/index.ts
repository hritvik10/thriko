/**
 * Cloudflare Worker that serves the site and handles quote requests.
 *
 * The browser posts to /api/enquiries on this same origin, so none of the
 * secrets below ever reach it. The Worker checks the Turnstile token, validates
 * the payload, then forwards the enquiry to the Google Apps Script web app,
 * signed with a shared secret so the webhook URL alone is not enough to write
 * to the sheet.
 *
 * Secrets are set with `npx wrangler secret put <NAME>` for production, and in
 * frontend/.dev.vars for `wrangler dev`. Everything else is served from ./dist.
 */
import { projectTypeOptions, timelineOptions } from '../features/enquiry/options';
import { findMarket, OTHER_MARKET } from '../features/enquiry/markets';
import { validateEnquiryPayload } from './validateEnquiryPayload';

interface Env {
  /** Static assets binding, declared in wrangler.jsonc. */
  ASSETS: { fetch(request: Request): Promise<Response> };
  TURNSTILE_SECRET_KEY?: string;
  SHEETS_SHARED_SECRET?: string;
  GOOGLE_SHEETS_WEBHOOK_URL?: string;
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** A form filled in faster than this was not filled in by a person. */
const MIN_FILL_MS = 3000;

/**
 * Cloudflare's documented test secrets. They accept any token, which is fine on
 * localhost and a wide-open door anywhere else, so the Worker refuses to use
 * one unless it really is serving a local request.
 */
const TEST_SECRETS = new Set([
  '1x0000000000000000000000000000000AA',
  '2x0000000000000000000000000000000AA',
  '3x0000000000000000000000000000000AA',
]);

/**
 * The visitor's address, which the Apps Script uses to rate limit per IP.
 *
 * A deployed Worker always has CF-Connecting-IP, set by Cloudflare itself. The
 * X-Forwarded-For fallback is only consulted for localhost, because a client can
 * forge that header and would otherwise rotate it to walk past the rate limit.
 */
function clientIp(request: Request): string {
  const connecting = request.headers.get('CF-Connecting-IP');
  if (connecting) return connecting;
  if (isLocalHost(request)) {
    const forwarded = request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim();
    return forwarded || 'local-dev';
  }
  return 'unknown';
}

function isLocalHost(request: Request): boolean {
  const { hostname } = new URL(request.url);
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Looks like a real submission to a bot, but stores nothing. */
function silentlyAccepted(): Response {
  return json({ id: reference(), message: successMessage }, 201);
}

const successMessage = "Thanks! We'll be in touch within one business day.";

function reference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return `TH-${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

async function turnstilePassed(token: unknown, secret: string, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || !token) return false;

  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  try {
    const result = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
    const outcome = (await result.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false;
  }
}

/**
 * Translates an enquiry into the shape the Apps Script web app expects.
 *
 * The script uses its own camelCase field names and stores readable labels
 * rather than the codes the form posts, so "ai" becomes "AI integration" and
 * "GB" becomes "United Kingdom", matching what the Python store writes.
 *
 * Nothing outside this object is forwarded: the Turnstile token, the timing
 * signal and anything else a caller invents all stay in the Worker.
 */
function toSheetsPayload(payload: Record<string, unknown>, secret: string, request: Request) {
  const country = typeof payload.country === 'string' ? payload.country : '';
  const otherCountry = typeof payload.other_country === 'string' ? payload.other_country.trim() : '';
  const types = Array.isArray(payload.project_types) ? (payload.project_types as string[]) : [];
  const timeline = typeof payload.timeline === 'string' ? payload.timeline : '';
  const notSure = payload.budget_not_sure === true;
  const market = findMarket(country);

  return {
    fullName: typeof payload.name === 'string' ? payload.name.trim() : '',
    email: typeof payload.email === 'string' ? payload.email.trim() : '',
    services: types.map((type) => projectTypeOptions.find((option) => option.value === type)?.label ?? type),
    country: country === OTHER_MARKET ? `Other: ${otherCountry}` : (market?.name ?? country),
    budget: notSure ? null : (payload.budget_amount ?? null),
    currency: market?.currency ?? '',
    budgetNotSure: notSure,
    timeline: timelineOptions.find((option) => option.value === timeline)?.label ?? timeline,
    overview: typeof payload.message === 'string' ? payload.message.trim() : '',
    foundingPartner: payload.partner_program === true,
    consent: true,
    // The script's own honeypot field. The Worker has already dropped real
    // honeypot hits, so this is always empty by the time it gets here.
    company_website: '',
    // The script rate limits per IP, and only ever sees the Worker, so it needs
    // the visitor's address passed through explicitly.
    ip: clientIp(request),
    pageUrl: request.headers.get('Referer') ?? '',
    secret,
  };
}

async function handleEnquiry(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ detail: 'Method not allowed' }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ detail: 'Expected a JSON body.' }, 400);
  }

  // Honeypot: hidden from people, so anything here came from a bot.
  if (typeof payload.website === 'string' && payload.website.trim()) {
    return silentlyAccepted();
  }

  // Submitted implausibly fast. Spoofable on its own, which is why it only
  // backs up Turnstile rather than replacing it.
  const startedAt = payload.started_at;
  if (typeof startedAt === 'number' && Date.now() - startedAt < MIN_FILL_MS) {
    return silentlyAccepted();
  }

  if (env.TURNSTILE_SECRET_KEY) {
    if (TEST_SECRETS.has(env.TURNSTILE_SECRET_KEY) && !isLocalHost(request)) {
      console.error('Refusing to run: TURNSTILE_SECRET_KEY is a Cloudflare test secret, which accepts any token.');
      return json({ detail: 'Storage is not configured.' }, 500);
    }
    const ip = request.headers.get('CF-Connecting-IP');
    if (!(await turnstilePassed(payload.turnstile_token, env.TURNSTILE_SECRET_KEY, ip))) {
      return json({ detail: 'Could not verify that you are human. Please try again.' }, 403);
    }
  }

  const issues = validateEnquiryPayload(payload);
  if (issues.length) {
    return json({ detail: issues }, 422);
  }

  if (!env.GOOGLE_SHEETS_WEBHOOK_URL) {
    console.error('GOOGLE_SHEETS_WEBHOOK_URL is not set; the enquiry was not stored.');
    return json({ detail: 'Storage is not configured.' }, 500);
  }

  const enquiry = toSheetsPayload(payload, env.SHEETS_SHARED_SECRET ?? '', request);

  let stored: Response;
  try {
    stored = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
  } catch (error) {
    console.error('Could not reach the Google Apps Script endpoint', error);
    return json({ detail: 'Could not save your enquiry. Please try again.' }, 502);
  }

  const result = (await stored.json().catch(() => null)) as
    | { ok?: boolean; status?: number; id?: string; errors?: string[] }
    | null;

  if (!stored.ok || result?.ok === false) {
    const errors = result?.errors ?? [];

    // The script rate limits per IP, per email and per day. Pass that through as
    // a 429 so the visitor is told to wait rather than shown a server error.
    if (errors.some((message) => message.toLowerCase().includes('too many'))) {
      return json({ detail: 'Too many submissions. Please wait a little and try again.' }, 429);
    }

    // The Worker already validated, so anything else rejected here means the
    // script's contract changed. Log what it objected to rather than guessing.
    console.error('Apps Script rejected the enquiry', stored.status, errors.length ? errors : result?.status);
    return json({ detail: 'Could not save your enquiry. Please try again.' }, 502);
  }

  return json({ id: result?.id ?? reference(), message: successMessage }, 201);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/enquiries') {
      return handleEnquiry(request, env);
    }
    if (pathname === '/api/health') {
      return json({ status: 'ok' }, 200);
    }
    // Everything else is the built site.
    return env.ASSETS.fetch(request);
  },
};
