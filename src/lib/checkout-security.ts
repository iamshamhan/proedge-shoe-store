import 'server-only';
import { headers } from 'next/headers';
import { isIP } from 'node:net';
import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const local = process.env.NODE_ENV === 'development' && !process.env.VERCEL;
  const secret = local ? '1x0000000000000000000000000000000AA' : process.env.TURNSTILE_SECRET_KEY;
  if (!secret || (!local && /^[123]x0+AA$/.test(secret))
    || typeof token !== 'string' || !token.trim() || token.length > 2048) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000), cache: 'no-store',
    });
    if (!response.ok) return false;
    const result = await response.json();
    if (result?.success !== true) return false;
    if (local) return true;
    return result.action === 'checkout'
      && result.hostname === new URL(process.env.NEXT_PUBLIC_SITE_URL || '').hostname;
  } catch { return false; }
}

export async function saveVerifiedInquiry(customer: Record<string, unknown>, items: unknown[], token: unknown) {
  try {
    const local = process.env.NODE_ENV === 'development' && !process.env.VERCEL;
    // Trust only Vercel's overwritten header, never a client-provided IP argument.
    const ip = local ? '127.0.0.1' : process.env.VERCEL === '1'
      ? (await headers()).get('x-vercel-forwarded-for')?.trim() : undefined;
    if (!ip || !isIP(ip) || !await verifyTurnstile(token, ip)) {
      return { data: null, error: { message: 'ERR_BOT_VERIFICATION' } };
    }
    const secret = process.env.SUPABASE_SECRET_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!secret || !url) return { data: null, error: { message: 'ERR_CHECKOUT_UNAVAILABLE' } };
    const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const hash = (value: string) => createHmac('sha256', secret).update(value).digest('hex');
    const email = typeof customer.email === 'string' ? customer.email.trim().toLowerCase() : '';
    const limited = await client.rpc('consume_checkout_limits', {
      p_ip: hash('ip:' + ip), p_email: email ? hash('email:' + email) : null,
    });
    if (limited.error || limited.data !== true) {
      return { data: null, error: { message: limited.error ? 'ERR_CHECKOUT_UNAVAILABLE' : 'ERR_RATE_LIMIT' } };
    }
    return await client.rpc('place_order', { p_customer: customer, p_items: items });
  } catch { return { data: null, error: { message: 'ERR_CHECKOUT_UNAVAILABLE' } }; }
}
