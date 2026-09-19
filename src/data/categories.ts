import type { CategoryItem } from '@/types/product';

// ---------------------------------------------------------------------------
// Canonical Category Definitions matching Supabase catalog_restructure.sql
// ---------------------------------------------------------------------------

export interface NavCategory {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  sortOrder: number;
  description?: string | null;
  image_url?: string | null;
  subtitle?: string | null;
  tagline?: string | null;
  children?: NavCategory[];
}

// Primary Sports / Departments (parent_id is null)
export const PARENT_SPORTS: NavCategory[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    slug: 'football',
    name: 'Football',
    sortOrder: 10,
    description: 'Engineered football boots, balls, and matchday accessories.',
    children: [
      {
        id: '21000000-0000-4000-8000-000000000001',
        slug: 'football-boots',
        name: 'Football Boots',
        sortOrder: 11,
        parentId: '20000000-0000-4000-8000-000000000001',
        description: 'Firm ground and soft ground football boots.',
      },
      {
        id: '21000000-0000-4000-8000-000000000002',
        slug: 'turf-shoes',
        name: 'Turf Shoes',
        sortOrder: 12,
        parentId: '20000000-0000-4000-8000-000000000001',
        description: 'Artificial grass and astro turf football footwear.',
      },
      {
        id: '21000000-0000-4000-8000-000000000003',
        slug: 'non-marking-shoes',
        name: 'Non-Marking Shoes',
        sortOrder: 13,
        parentId: '20000000-0000-4000-8000-000000000001',
        description: 'Indoor court and futsal non-marking shoes.',
      },
      {
        id: '21000000-0000-4000-8000-000000000004',
        slug: 'footballs',
        name: 'Footballs',
        sortOrder: 14,
        parentId: '20000000-0000-4000-8000-000000000001',
        description: 'Match, training, and futsal footballs.',
      },
      {
        id: '21000000-0000-4000-8000-000000000005',
        slug: 'goalkeeper-gloves',
        name: 'Goalkeeper Gloves',
        sortOrder: 15,
        parentId: '20000000-0000-4000-8000-000000000001',
        description: 'Pro grip goalkeeper match and training gloves.',
      },
      {
        id: '21000000-0000-4000-8000-000000000006',
        slug: 'shin-guards',
        name: 'Shin Guards',
        sortOrder: 16,
        parentId: '20000000-0000-4000-8000-000000000001',
        description: 'Impact-resistant protective football shin guards.',
      },
      {
        id: '21000000-0000-4000-8000-000000000007',
        slug: 'stud-packs',
        name: 'Stud Packs',
        sortOrder: 17,
        parentId: '20000000-0000-4000-8000-000000000001',
        description: 'Replacement metal and TPU boot studs.',
      },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    slug: 'rugby',
    name: 'Rugby',
    sortOrder: 20,
    description: 'Durable rugby boots, balls, kick tees, and protective gear.',
    children: [
      {
        id: '22000000-0000-4000-8000-000000000001',
        slug: 'rugby-boots',
        name: 'Rugby Boots',
        sortOrder: 21,
        parentId: '20000000-0000-4000-8000-000000000002',
        description: 'High-traction forward and back rugby boots.',
      },
      {
        id: '22000000-0000-4000-8000-000000000002',
        slug: 'rugby-balls',
        name: 'Rugby Balls',
        sortOrder: 22,
        parentId: '20000000-0000-4000-8000-000000000002',
        description: 'Grip-textured match and training rugby balls.',
      },
      {
        id: '22000000-0000-4000-8000-000000000003',
        slug: 'rugby-kick-tees',
        name: 'Rugby Kick Tees',
        sortOrder: 23,
        parentId: '20000000-0000-4000-8000-000000000002',
        description: 'Adjustable height rugby kicking tees.',
      },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    slug: 'basketball',
    name: 'Basketball',
    sortOrder: 30,
    description: 'High-traction court shoes, balls, and athletic accessories.',
    children: [
      {
        id: '23000000-0000-4000-8000-000000000001',
        slug: 'basketball-shoes',
        name: 'Basketball Shoes',
        sortOrder: 31,
        parentId: '20000000-0000-4000-8000-000000000003',
        description: 'Cushioned high-top and mid-top basketball shoes.',
      },
      {
        id: '23000000-0000-4000-8000-000000000002',
        slug: 'basketballs',
        name: 'Basketballs',
        sortOrder: 32,
        parentId: '20000000-0000-4000-8000-000000000003',
        description: 'Indoor composite and outdoor rubber basketballs.',
      },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    slug: 'running',
    name: 'Running',
    sortOrder: 40,
    description: 'Performance distance runners, trainers, and running accessories.',
    children: [
      {
        id: '24000000-0000-4000-8000-000000000001',
        slug: 'running-shoes',
        name: 'Running Shoes',
        sortOrder: 41,
        parentId: '20000000-0000-4000-8000-000000000004',
        description: 'Road, trail, and sprint running footwear.',
      },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    slug: 'general',
    name: 'General & Lifestyle',
    sortOrder: 50,
    description: 'Slides, boot bags, duffle bags, backpacks, and headwear.',
    children: [
      {
        id: '25000000-0000-4000-8000-000000000001',
        slug: 'slides',
        name: 'Slides',
        sortOrder: 51,
        parentId: '20000000-0000-4000-8000-000000000005',
        description: 'Post-game recovery slides and lifestyle slip-ons.',
      },
      {
        id: '25000000-0000-4000-8000-000000000002',
        slug: 'boot-bags',
        name: 'Boot Bags',
        sortOrder: 52,
        parentId: '20000000-0000-4000-8000-000000000005',
        description: 'Ventilated athletic footwear carry bags.',
      },
      {
        id: '25000000-0000-4000-8000-000000000003',
        slug: 'duffle-bags',
        name: 'Duffle Bags',
        sortOrder: 53,
        parentId: '20000000-0000-4000-8000-000000000005',
        description: 'Spacious training gym and team duffle bags.',
      },
      {
        id: '25000000-0000-4000-8000-000000000004',
        slug: 'backpacks',
        name: 'Backpacks',
        sortOrder: 54,
        parentId: '20000000-0000-4000-8000-000000000005',
        description: 'Multi-compartment sports and gear backpacks.',
      },
      {
        id: '25000000-0000-4000-8000-000000000005',
        slug: 'sports-hats-caps',
        name: 'Sports Hats & Caps',
        sortOrder: 55,
        parentId: '20000000-0000-4000-8000-000000000005',
        description: 'Breathable athletic caps, visors, and beanies.',
      },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000006',
    slug: 'accessories',
    name: 'Accessories',
    sortOrder: 60,
    description: 'Universal sports socks, strapping tape, air pumps, and sports gear.',
    children: [
      {
        id: '26000000-0000-4000-8000-000000000001',
        slug: 'sports-socks',
        name: 'Sports Socks',
        sortOrder: 61,
        parentId: '20000000-0000-4000-8000-000000000006',
        description: 'Anti-slip grip socks and performance crew socks.',
      },
      {
        id: '26000000-0000-4000-8000-000000000002',
        slug: 'k-tape',
        name: 'K-Tape',
        sortOrder: 62,
        parentId: '20000000-0000-4000-8000-000000000006',
        description: 'Elastic athletic kinesiology support tape.',
      },
      {
        id: '26000000-0000-4000-8000-000000000003',
        slug: 'rejit-tape',
        name: 'Rejit Tape',
        sortOrder: 63,
        parentId: '20000000-0000-4000-8000-000000000006',
        description: 'Rigid zinc-oxide sports strapping tape.',
      },
      {
        id: '26000000-0000-4000-8000-000000000004',
        slug: 'air-pumps',
        name: 'Air Pumps',
        sortOrder: 64,
        parentId: '20000000-0000-4000-8000-000000000006',
        description: 'Dual-action ball inflation pumps and pressure gauges.',
      },
      {
        id: '26000000-0000-4000-8000-000000000005',
        slug: 'mouth-guards',
        name: 'Mouth Guards',
        sortOrder: 65,
        parentId: '20000000-0000-4000-8000-000000000006',
        description: 'Boil-and-bite shock absorbing sports gumshields.',
      },
      {
        id: '26000000-0000-4000-8000-000000000006',
        slug: 'head-gear',
        name: 'Head Gear',
        sortOrder: 66,
        parentId: '20000000-0000-4000-8000-000000000006',
        description: 'Impact padding protective rugby headgear and scull caps.',
      },
      {
        id: '26000000-0000-4000-8000-000000000007',
        slug: 'general-accessories',
        name: 'General Accessories',
        sortOrder: 67,
        parentId: '20000000-0000-4000-8000-000000000006',
        description: 'Laces, sweatbands, water bottles, and gear care.',
      },
    ],
  },
];

// Legacy categories for backward compatibility
export const LEGACY_CATEGORIES: NavCategory[] = [
  { id: '10000000-0000-4000-8000-000000000001', slug: 'men', name: "Men's Collection", sortOrder: 1 },
  { id: '10000000-0000-4000-8000-000000000002', slug: 'women', name: "Women's Collection", sortOrder: 2 },
  { id: '10000000-0000-4000-8000-000000000003', slug: 'sports', name: 'Sports & Training', sortOrder: 3 },
  { id: '10000000-0000-4000-8000-000000000004', slug: 'casual', name: 'Casual Sneakers', sortOrder: 4 },
];

// Flat lookup table of all categories
export const ALL_CANONICAL_CATEGORIES: NavCategory[] = [
  ...PARENT_SPORTS.flatMap((sport) => [sport, ...(sport.children || [])]),
  ...LEGACY_CATEGORIES,
];

// Legacy URL fallbacks mapped to child slugs
export const LEGACY_SLUG_MAP: Record<string, string[]> = {
  men: ['running-shoes', 'football-boots', 'basketball-shoes', 'slides', 'men'],
  women: ['running-shoes', 'slides', 'women'],
  sports: ['running-shoes', 'football-boots', 'turf-shoes', 'basketball-shoes', 'rugby-boots', 'sports'],
  casual: ['slides', 'boot-bags', 'backpacks', 'casual'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns all child slugs for a given slug.
 * If the slug is a parent department (e.g. 'football'), returns [football, football-boots, turf-shoes, ...]
 * If the slug is a legacy category (e.g. 'sports'), returns mapped sport/shoe slugs.
 * If the slug is a child category (e.g. 'football-boots'), returns ['football-boots'].
 */
export function getCategorySlugsForQuery(slug: string | null | undefined): string[] {
  if (!slug || slug === 'all') return [];

  // Check legacy mapping
  if (LEGACY_SLUG_MAP[slug]) {
    return LEGACY_SLUG_MAP[slug];
  }

  // Rugby query resolves rugby footwear, equipment, and protective gear
  if (slug === 'rugby') {
    return [
      'rugby',
      'rugby-boots',
      'rugby-balls',
      'rugby-kick-tees',
      'mouth-guards',
      'head-gear',
    ];
  }

  // Check parent sports
  const parent = PARENT_SPORTS.find((s) => s.slug === slug);
  if (parent) {
    const childSlugs = (parent.children || []).map((c) => c.slug);
    return [parent.slug, ...childSlugs];
  }

  // It's a specific subcategory
  return [slug];
}

/**
 * Given a category slug or ID, finds its parent sport if any.
 */
export function getParentCategory(slugOrId: string): NavCategory | undefined {
  for (const sport of PARENT_SPORTS) {
    if (sport.id === slugOrId || sport.slug === slugOrId) return sport;
    if (sport.children?.some((c) => c.id === slugOrId || c.slug === slugOrId)) {
      return sport;
    }
  }
  return undefined;
}

/**
 * Turns a flat list of category rows (e.g. from Supabase) into a hierarchical tree.
 */
export function buildCategoryHierarchy(flat: CategoryItem[]): CategoryItem[] {
  const parents = flat.filter((c) => !c.parentId && !['men', 'women', 'sports', 'casual'].includes(c.slug));
  return parents
    .map((parent) => ({
      ...parent,
      children: flat
        .filter((c) => c.parentId === parent.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

