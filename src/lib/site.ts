import type { Metadata } from 'next';

// ---------------------------------------------------------------------------
// Central SEO / production metadata configuration for the PROEDGE storefront.
// ---------------------------------------------------------------------------

export const SITE_NAME = 'PROEDGE';
export const SITE_TAGLINE = 'Built for Your Next Step';
export const SITE_DESCRIPTION =
  'Shop PROEDGE performance running shoes and casual sneakers in Sri Lanka. Engineered footwear with islandwide courier delivery.';

/**
 * Resolves the canonical production site URL (no trailing slash), or null when
 * NEXT_PUBLIC_SITE_URL is not configured. localhost is intentionally never
 * hard-coded here — set NEXT_PUBLIC_SITE_URL=https://your-domain.com once a
 * production domain exists.
 */
export function getSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;

  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/.+/i.test(trimmed)) return null;

  try {
    new URL(trimmed);
  } catch {
    return null;
  }

  return trimmed;
}

/** Absolute URL for a site path, or null when no production URL is set. */
export function absoluteUrl(path: string): string | null {
  const base = getSiteUrl();
  if (!base) return null;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Canonical/OG URL for a site path. Returns undefined when no production URL
 * is configured so metadata simply omits the field (never localhost, never a
 * placeholder domain).
 */
export function canonical(path: string): string | undefined {
  return absoluteUrl(path) ?? undefined;
}

/**
 * Small factory for consistent storefront page metadata. Titles omit the
 * brand suffix because the root layout title template appends " | PROEDGE".
 */
export function pageMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const url = opts.path ? canonical(opts.path) : undefined;

  return {
    title: opts.title,
    ...(opts.description ? { description: opts.description } : {}),
    ...(url ? { alternates: { canonical: url } } : {}),
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}