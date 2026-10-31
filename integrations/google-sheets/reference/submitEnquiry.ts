// Call this from your existing form's onSubmit handler.
// It posts to the Next.js API route (app/api/enquiry/route.ts), which forwards to Google Sheets.

export type EnquiryPayload = {
  fullName: string;
  email: string;
  services: string[]; // e.g. ['Website', 'AI integration']
  country: string;
  budget?: string;
  currency?: string; // e.g. 'INR', 'USD'
  budgetNotSure: boolean;
  timeline: string;
  overview?: string;
  foundingPartner: boolean;
  consent: boolean;
  company_website?: string; // hidden honeypot field; leave empty
  turnstileToken: string; // from the Turnstile widget
  startedAt: number; // Date.now() when the form first rendered
};

export async function submitEnquiry(data: EnquiryPayload) {
  const res = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    }),
  });

  const result: { ok: boolean; errors?: string[] } = await res
    .json()
    .catch(() => ({ ok: false, errors: ['Unexpected response from server.'] }));

  if (!result.ok) {
    throw new Error(result.errors?.join(' ') || 'Something went wrong. Please try again.');
  }
  return result;
}

/* Example usage inside your form component ('use client'):

  import { useRef, useState } from 'react';
  import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
  import { submitEnquiry } from '@/lib/submitEnquiry';

  const [startedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      await submitEnquiry({
        fullName, email, services, country, budget, currency, budgetNotSure,
        timeline, overview, foundingPartner, consent,
        turnstileToken, startedAt,
      });
      setStatus('sent');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
      turnstileRef.current?.reset(); // tokens are single-use
      setTurnstileToken('');
    }
  }

  // Inside the <form>, above the submit button:
  // <Turnstile
  //   ref={turnstileRef}
  //   siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  //   onSuccess={setTurnstileToken}
  //   onExpire={() => setTurnstileToken('')}
  // />
  // <button type="submit" disabled={!turnstileToken || status === 'sending'}>Send enquiry</button>

  // Honeypot (hidden from humans):
  // <input type="text" name="company_website" tabIndex={-1} autoComplete="off"
  //        style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
*/
