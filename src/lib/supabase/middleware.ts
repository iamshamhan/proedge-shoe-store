import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Apply anti-caching headers so a refreshed session is never served
          // to another user from a CDN/static cache.
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do NOT run any code between createServerClient and
  // supabase.auth.getClaims(), otherwise the refresh logic can be skipped.
  const { data } = await supabase.auth.getClaims();

  // Protect the admin area at the network boundary for unauthenticated
  // visitors. The definitive admin check still happens inside the page.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    const isLoginPage = request.nextUrl.pathname === '/admin/login';
    const hasValidSession = Boolean(data?.claims && data.claims.role);

    if (!hasValidSession && !isLoginPage) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    if (hasValidSession && isLoginPage) {
      // The login page decides whether to redirect to /admin based on the
      // server-side is_admin check, so an authenticated non-admin is not
      // sent into the admin area here.
      return supabaseResponse;
    }
  }

  return supabaseResponse;
}