import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

function cookieJar() {
  const values = new Map();
  return {
    getAll: () => [...values.values()],
    set: (name, value, options) => {
      const cookie = typeof name === 'object' ? name : { name, value, ...options };
      values.set(cookie.name, cookie);
    },
  };
}
function response() { return { cookies: cookieJar(), headers: new Headers() }; }
function setup(claims) {
  const request = { cookies: cookieJar(), nextUrl: {
    pathname: '/admin/orders', clone: () => ({ pathname: '/admin/orders' }),
  } };
  let downstreamCookies;
  const { updateSession } = loadTs('src/lib/supabase/middleware.ts', {
    'next/server': { NextResponse: {
      next: ({ request }) => { downstreamCookies = request.cookies.getAll(); return response(); },
      redirect: url => ({ ...response(), location: url.pathname }),
    } },
    '@supabase/ssr': { createServerClient: (_url, _key, { cookies }) => ({ auth: {
      getClaims: async () => {
        cookies.setAll([{ name: 'session', value: 'refreshed', options: { httpOnly: true } }],
          { 'cache-control': 'private, no-store', pragma: 'no-cache' });
        return { data: { claims } };
      },
    } }) },
  });
  return { request, updateSession, downstream: () => downstreamCookies };
}
test('session refresh is visible to downstream rendering and browser response', async () => {
  const setupResult = setup({ role: 'authenticated' });
  const result = await setupResult.updateSession(setupResult.request);
  assert.equal(setupResult.downstream()[0].value, 'refreshed');
  assert.equal(result.cookies.getAll()[0].value, 'refreshed');
  assert.equal(result.headers.get('cache-control'), 'private, no-store');
});
test('redirect retains refreshed cookies and private cache headers', async () => {
  const setupResult = setup(null);
  const result = await setupResult.updateSession(setupResult.request);
  assert.equal(result.location, '/admin/login');
  assert.equal(result.cookies.getAll()[0].httpOnly, true);
  assert.equal(result.headers.get('cache-control'), 'private, no-store');
});
