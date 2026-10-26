import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { loadTs } from './load-ts.mjs';

test('checkout security fails closed and only saves after verification and durable limits', async (t) => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  const calls = [];
  let ip = '203.0.113.1';
  let verification = { success: true, action: 'checkout', hostname: 'store.example' };
  let limited = { data: true, error: null };
  let ok = true;
  let throws = false;
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  process.env.TURNSTILE_SECRET_KEY = 'test-fixture-secret';
  process.env.SUPABASE_SECRET_KEY = 'test-fixture-server-key';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fixture.supabase.co';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://store.example';
  globalThis.fetch = async () => {
    calls.push('verify');
    if (throws) throw new Error('private detail');
    return { ok, json: async () => verification };
  };
  const { saveVerifiedInquiry, verifyTurnstile } = loadTs('src/lib/checkout-security.ts', {
    'server-only': {}, 'node:net': { isIP }, 'node:crypto': { createHmac },
    'next/headers': { headers: async () => new Headers(ip ? { 'x-vercel-forwarded-for': ip } : {}) },
    '@supabase/supabase-js': { createClient: () => ({ rpc: async (name, args) => {
      calls.push(name);
      if (name === 'consume_checkout_limits') {
        assert.match(args.p_ip, /^[a-f0-9]{64}$/);
        assert.match(args.p_email, /^[a-f0-9]{64}$/);
        return limited;
      }
      return { data: { order_number: 'TEST' }, error: null };
    } }) },
  });
  const save = token => saveVerifiedInquiry({ email: ' TEST@EXAMPLE.COM ' }, [], token);
  try {
    await t.test('missing and oversized tokens never reach network or database', async () => {
      for (const token of [undefined, '', ' ', 'x'.repeat(2049), {}]) {
        calls.length = 0;
        assert.ok((await save(token)).error);
        assert.deepEqual(calls, []);
      }
    });
    await t.test('invalid, expired, replayed and malformed responses never save', async () => {
      for (const value of [null, {}, { success: false, 'error-codes': ['timeout-or-duplicate'] },
        { success: 'true' }, { success: true, action: 'other', hostname: 'store.example' },
        { success: true, action: 'checkout', hostname: 'attacker.example' }]) {
        verification = value; calls.length = 0;
        assert.ok((await save('token')).error);
        assert.deepEqual(calls, ['verify']);
      }
      verification = { success: true, action: 'checkout', hostname: 'store.example' };
    });
    await t.test('network and HTTP errors fail closed', async () => {
      throws = true; assert.equal(await verifyTurnstile('token',ip),false); throws = false;
      ok = false; assert.equal(await verifyTurnstile('token',ip),false); ok = true;
    });
    await t.test('missing and test production secrets fail closed', async () => {
      for (const secret of ['', '1x0000000000000000000000000000000AA']) {
        process.env.TURNSTILE_SECRET_KEY = secret; calls.length = 0;
        assert.ok((await save('token')).error); assert.deepEqual(calls, []);
      }
      process.env.TURNSTILE_SECRET_KEY = 'test-fixture-secret';
    });
    await t.test('absent or untrusted IP fails closed', async () => {
      ip = ''; calls.length = 0; assert.ok((await save('token')).error); assert.deepEqual(calls, []);
      ip = '203.0.113.1'; delete process.env.VERCEL;
      assert.ok((await save('token')).error); process.env.VERCEL = '1';
    });
    await t.test('rate limit denial and outage prevent insertion', async () => {
      for (const result of [{ data: false, error: null }, { data: null, error: { message: 'private' } }]) {
        limited = result; calls.length = 0;
        assert.ok((await save('token')).error);
        assert.deepEqual(calls, ['verify','consume_checkout_limits']);
      }
    });
    await t.test('verified and permitted inquiry saves in the correct order', async () => {
      limited = { data: true, error: null }; calls.length = 0;
      assert.equal((await save('token')).error,null);
      assert.deepEqual(calls, ['verify','consume_checkout_limits','place_order']);
    });
    await t.test('missing Supabase secret prevents any database call', async () => {
      delete process.env.SUPABASE_SECRET_KEY; calls.length = 0;
      assert.ok((await save('token')).error); assert.deepEqual(calls,['verify']);
    });
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env,originalEnv);
  }
});
