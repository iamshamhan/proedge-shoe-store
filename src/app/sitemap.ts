import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/supabase/products';
import { getSiteUrl } from '@/lib/site';

const STATIC_ENTRIES: Array<Pick<MetadataRoute.Sitemap[number], 'url' | 'changeFrequency' | 'priority'>> = [
  { url: '/', changeFrequency: 'daily', priority: 1 },
  { url: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { url: '/men', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/women', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/sports', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/sale', changeFrequency: 'weekly', priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  const products = await getAllProducts();

  return [
    ...STATIC_ENTRIES.map(({ url, changeFrequency, priority }) => ({
      url: `${siteUrl}${url}`,
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8 as const,
    })),
  ];
}