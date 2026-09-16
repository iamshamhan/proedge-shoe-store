import { getSupabaseServer } from '@/lib/supabase/server';

type AccessTokenClaims = {
  sub?: string;
  email?: string;
  role?: string;
  app_metadata?: {
    is_admin?: boolean;
  };
};

export type AuthUser = {
  id: string;
  email: string | null;
  isAdmin: boolean;
};

/**
 * Server-only helper. Verifies the request's Supabase auth token via
 * getClaims() (JWT signature is validated against the project's JWKS) and
 * returns the user's id, email and server-side admin status.
 *
 * The admin flag comes from the signed JWT's app_metadata.is_admin — the same
 * claim the database is_admin() function reads — so it cannot be forged by a
 * client and can never be self-granted through the public SDK.
 *
 * Returns null when there is no valid session.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) return null;

  const claims = data.claims as AccessTokenClaims;

  // Defense in depth: only real authenticated users may be considered for the
  // admin role. Service-role JWTs or malformed tokens never qualify.
  if (claims.role !== 'authenticated' || !claims.sub) return null;

  return {
    id: claims.sub,
    email: claims.email ?? null,
    isAdmin: claims.app_metadata?.is_admin === true,
  };
}