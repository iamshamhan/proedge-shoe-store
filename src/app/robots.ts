import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

// Private / user-specific routes that should never be crawled or indexed.
const PRIVATE_PATHS = ['/admin/', '/cart', '/checkout', '/wishlist'];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: PRIVATE_PATHS,
    },
    ...(siteUrl ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}