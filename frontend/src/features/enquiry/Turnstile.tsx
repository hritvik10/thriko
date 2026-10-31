import { useEffect, useRef, useState } from 'react';

/**
 * Cloudflare Turnstile widget.
 *
 * Loaded only when VITE_TURNSTILE_SITE_KEY is set, so local development and the
 * self-hosted Python API keep working without it. The token it produces is sent
 * with the enquiry and verified by the Worker, which holds the secret key.
 */

interface TurnstileApi {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

/** Adds the Turnstile script once, however many widgets ask for it. */
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null; // Let a later attempt retry.
        reject(new Error('Could not load the Turnstile script.'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

interface TurnstileProps {
  siteKey: string;
  /** Called with a token when the check passes, and with '' when it expires or fails. */
  onToken: (token: string) => void;
  className?: string;
}

export default function Turnstile({ siteKey, onToken, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => onTokenRef.current(''),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [siteKey]);

  if (failed) {
    return (
      <p className={className} role="alert">
        The security check could not load. Please disable any ad blocker for this page and reload, or email us instead.
      </p>
    );
  }

  return <div ref={containerRef} className={className} />;
}
