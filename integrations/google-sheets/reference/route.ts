// Save as: app/api/enquiry/route.ts  (Next.js App Router)
// .env.local (and your hosting env vars):
//   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXXXX/exec
//   SHEETS_SHARED_SECRET=<same long random string as SHARED_SECRET in Apps Script>
//   TURNSTILE_SECRET_KEY=<secret key from Cloudflare Turnstile>
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key from Cloudflare Turnstile>

import { NextResponse } from 'next/server';

const MIN_FILL_MS = 3000; // humans take longer than 3s to fill this form

export async function POST(req: Request) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const sharedSecret = process.env.SHEETS_SHARED_SECRET;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!url || !sharedSecret || !turnstileSecret) {
    return NextResponse.json({ ok: false, errors: ['Form endpoint not configured.'] }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['Invalid request.'] }, { status: 400 });
  }

  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  // 1) Too-fast check
  const startedAt = Number(body.startedAt);
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: false, errors: ['Please take a moment and try again.'] }, { status: 400 });
  }

  // 2) Verify the Turnstile token with Cloudflare
  const token = String(body.turnstileToken || '');
  if (!token) {
    return NextResponse.json({ ok: false, errors: ['Please complete the verification.'] }, { status: 400 });
  }
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: ip }),
  }).then((r) => r.json() as Promise<{ success: boolean }>).catch(() => ({ success: false }));

  if (!verify.success) {
    return NextResponse.json({ ok: false, errors: ['Verification failed. Please try again.'] }, { status: 400 });
  }

  // 3) Forward to Apps Script with the shared secret + IP (for rate limiting)
  const { turnstileToken, startedAt: _s, ...fields } = body;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...fields, secret: sharedSecret, ip }),
      redirect: 'follow', // Apps Script replies via a redirect
      cache: 'no-store',
    });
    const result = await res.json();
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ ok: false, errors: ['Could not reach Google Sheets.'] }, { status: 502 });
  }
}
