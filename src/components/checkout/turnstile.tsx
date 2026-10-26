'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const sitekey = process.env.NODE_ENV === 'development'
    ? '1x00000000000000000000AA' : process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    const api = window.turnstile;
    if (!ready || !container.current || !api || !sitekey) return;
    const id = api.render(container.current, {
      sitekey, action: 'checkout',
      callback: (token: string) => { setFailed(false); onToken(token); },
      'expired-callback': () => onToken(''),
      'error-callback': () => { onToken(''); setFailed(true); },
      'timeout-callback': () => onToken(''),
    });
    return () => { api.remove(id); };
  }, [ready, sitekey, onToken]);
  return <div>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      onReady={() => setReady(true)} onError={() => { onToken(''); setFailed(true); }} />
    <div ref={container} />
    {(!sitekey || failed) && <p role="alert">Security check unavailable. Please reload and try again.</p>}
  </div>;
}
