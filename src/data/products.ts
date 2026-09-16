import { Product, ProductCategory, ProductFilterParams } from '@/types/product';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'pro-01',
    name: 'PROEDGE Runner X1',
    slug: 'proedge-runner-x1',
    brand: 'PROEDGE',
    category: 'sports',
    description: 'High-performance long-distance running shoe equipped with responsive foam cushioning and breathable engineered mesh upper for maximum speed.',
    price: 24500,
    compareAtPrice: 28900,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Red/Black', 'Core White'],
    stock: 18,
    featured: true,
    newArrival: true,
    onSale: true,
  },
  {
    id: 'pro-02',
    name: 'PROEDGE Street 02',
    slug: 'proedge-street-02',
    brand: 'PROEDGE',
    category: 'casual',
    description: 'Minimalist street sneaker crafted with full-grain suede accents and durable rubber cupsole for effortless daily style.',
    price: 18900,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [39, 40, 41, 42, 43],
    colors: ['Off White', 'Charcoal Grey'],
    stock: 24,
    featured: true,
    newArrival: false,
    onSale: false,
  },
  {
    id: 'pro-03',
    name: 'PROEDGE Sport Flex',
    slug: 'proedge-sport-flex',
    brand: 'PROEDGE',
    category: 'sports',
    description: 'Ultra-lightweight cross-training shoe featuring dynamic arch support and high-traction multi-surface outsole.',
    price: 21900,
    compareAtPrice: 26000,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44],
    colors: ['Lime Black', 'Electric Blue'],
    stock: 12,
    featured: true,
    newArrival: true,
    onSale: true,
  },
  {
    id: 'pro-04',
    name: 'PROEDGE Urban Classic',
    slug: 'proedge-urban-classic',
    brand: 'PROEDGE',
    category: 'men',
    description: 'Timeless low-top silhouette tailored for modern urban living, featuring premium leather trims and padded collar.',
    price: 22500,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['All White', 'Midnight Black'],
    stock: 15,
    featured: true,
    newArrival: false,
    onSale: false,
  },
  {
    id: 'pro-05',
    name: 'PROEDGE Airwalk',
    slug: 'proedge-airwalk',
    brand: 'PROEDGE',
    category: 'women',
    description: 'Feather-light lifestyle trainer engineered for all-day comfort with cloud-soft memory foam insoles.',
    price: 19800,
    compareAtPrice: 23000,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [36, 37, 38, 39, 40],
    colors: ['Dusty Rose', 'Pure White'],
    stock: 20,
    featured: true,
    newArrival: true,
    onSale: true,
  },
  {
    id: 'pro-06',
    name: 'PROEDGE Velocity',
    slug: 'proedge-velocity',
    brand: 'PROEDGE',
    category: 'sports',
    description: 'Sprint-inspired trainer with carbon-infused plate feedback for explosive energy return during workout sessions.',
    price: 27900,
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [41, 42, 43, 44, 45],
    colors: ['Neon Crimson', 'Stealth Dark'],
    stock: 8,
    featured: true,
    newArrival: false,
    onSale: false,
  },
  {
    id: 'pro-07',
    name: 'PROEDGE Court 01',
    slug: 'proedge-court-01',
    brand: 'PROEDGE',
    category: 'casual',
    description: 'Retro court sneaker built with clean paneling, breathable eyelets, and non-marking traction rubber.',
    price: 17500,
    compareAtPrice: 21000,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ['White Navy', 'Vintage Green'],
    stock: 30,
    featured: true,
    newArrival: false,
    onSale: true,
  },
  {
    id: 'pro-08',
    name: 'PROEDGE Trail Max',
    slug: 'proedge-trail-max',
    brand: 'PROEDGE',
    category: 'men',
    description: 'Rugged off-road footwear equipped with waterproof membrane technology and deep lugged soles for tough terrains.',
    price: 29500,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Earth Brown', 'Tactical Black'],
    stock: 10,
    featured: true,
    newArrival: true,
    onSale: false,
  },
  {
    id: 'pro-09',
    name: 'PROEDGE Aero Glide',
    slug: 'proedge-aero-glide',
    brand: 'PROEDGE',
    category: 'women',
    description: 'Sleek slip-on performance shoe designed with knit upper structure and flexible shock-absorbing heel unit.',
    price: 20500,
    images: [
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [36, 37, 38, 39, 40],
    colors: ['Lilac Fog', 'Chalk White'],
    stock: 14,
    featured: false,
    newArrival: true,
    onSale: false,
  },
  {
    id: 'pro-10',
    name: 'PROEDGE Apex Runner',
    slug: 'proedge-apex-runner',
    brand: 'PROEDGE',
    category: 'sports',
    description: 'Peak performance road shoe featuring multi-density midsole and reinforced toe cap for marathon resistance.',
    price: 26000,
    compareAtPrice: 31000,
    images: [
      'https://images.unsplash.com/photo-1460353581641-37babbab0fa2?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44],
    colors: ['Volt Orange', 'Black Smoke'],
    stock: 9,
    featured: false,
    newArrival: false,
    onSale: true,
  },
];

export function getAllProducts(): Product[] {
  return MOCK_PRODUCTS;
}

export function getFeaturedProducts(): Product[] {
  return MOCK_PRODUCTS.filter((product) => product.featured);
}

export function getNewArrivals(): Product[] {
  return MOCK_PRODUCTS.filter((product) => product.newArrival);
}

export function getSaleProducts(): Product[] {
  return MOCK_PRODUCTS.filter((product) => product.onSale);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return MOCK_PRODUCTS.filter((product) => product.category === category);
}

export function filterProductList(products: Product[], params: ProductFilterParams): Product[] {
  let result = [...products];

  if (params.category && params.category !== 'all') {
    result = result.filter((p) => p.category === params.category);
  }

  if (params.search && params.search.trim() !== '') {
    const query = params.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  if (params.inStockOnly) {
    result = result.filter((p) => p.stock > 0);
  }

  if (params.minPrice !== undefined) {
    result = result.filter((p) => p.price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= params.maxPrice!);
  }

  if (params.sortBy) {
    switch (params.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
  }

  return result;
}

export function filterProducts(params: ProductFilterParams): Product[] {
  return filterProductList(MOCK_PRODUCTS, params);
}

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((product) => product.slug === slug);
}

export function formatLKR(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('LKR', 'Rs.');
}
