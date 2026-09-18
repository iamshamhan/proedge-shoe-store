import { Product, ProductCategory, ProductFilterParams } from '@/types/product';
import { getCategorySlugsForQuery } from './categories';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'pro-01',
    name: 'PROEDGE Runner X1',
    slug: 'proedge-runner-x1',
    brand: 'PROEDGE',
    category: 'running-shoes',
    sport: 'running',
    categoryName: 'Running Shoes',
    sportName: 'Running',
    description: 'High-performance long-distance running shoe equipped with responsive foam cushioning and breathable engineered mesh upper for maximum speed.',
    price: 24500,
    compareAtPrice: 28900,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    sizeSystem: 'EU',
    colors: ['Red/Black', 'Core White'],
    stock: 18,
    featured: true,
    newArrival: true,
    onSale: true,
    variants: [
      { id: 'v-01-1', colour: 'Red/Black', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 3 },
      { id: 'v-01-2', colour: 'Red/Black', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 3 },
      { id: 'v-01-3', colour: 'Red/Black', sizeSystem: 'EU', sizeValue: '42', size: 42, stock: 3 },
      { id: 'v-01-4', colour: 'Core White', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 3 },
      { id: 'v-01-5', colour: 'Core White', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 3 },
      { id: 'v-01-6', colour: 'Core White', sizeSystem: 'EU', sizeValue: '42', size: 42, stock: 3 },
    ],
  },
  {
    id: 'pro-02',
    name: 'PROEDGE Street 02',
    slug: 'proedge-street-02',
    brand: 'PROEDGE',
    category: 'slides',
    sport: 'general',
    categoryName: 'Slides & Lifestyle',
    sportName: 'General & Lifestyle',
    description: 'Minimalist street sneaker crafted with full-grain suede accents and durable rubber cupsole for effortless daily style.',
    price: 18900,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [39, 40, 41, 42, 43],
    sizeSystem: 'EU',
    colors: ['Off White', 'Charcoal Grey'],
    stock: 24,
    featured: true,
    newArrival: false,
    onSale: false,
    variants: [
      { id: 'v-02-1', colour: 'Off White', sizeSystem: 'EU', sizeValue: '39', size: 39, stock: 6 },
      { id: 'v-02-2', colour: 'Off White', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 6 },
      { id: 'v-02-3', colour: 'Charcoal Grey', sizeSystem: 'EU', sizeValue: '39', size: 39, stock: 6 },
      { id: 'v-02-4', colour: 'Charcoal Grey', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 6 },
    ],
  },
  {
    id: 'pro-03',
    name: 'PROEDGE Sport Flex',
    slug: 'proedge-sport-flex',
    brand: 'PROEDGE',
    category: 'running-shoes',
    sport: 'running',
    categoryName: 'Running Shoes',
    sportName: 'Running',
    description: 'Ultra-lightweight cross-training shoe featuring dynamic arch support and high-traction multi-surface outsole.',
    price: 21900,
    compareAtPrice: 26000,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44],
    sizeSystem: 'EU',
    colors: ['Lime Black', 'Electric Blue'],
    stock: 12,
    featured: true,
    newArrival: true,
    onSale: true,
    variants: [
      { id: 'v-03-1', colour: 'Lime Black', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 3 },
      { id: 'v-03-2', colour: 'Lime Black', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 3 },
      { id: 'v-03-3', colour: 'Electric Blue', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 3 },
      { id: 'v-03-4', colour: 'Electric Blue', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 3 },
    ],
  },
  {
    id: 'pro-04',
    name: 'PROEDGE Urban Classic',
    slug: 'proedge-urban-classic',
    brand: 'PROEDGE',
    category: 'slides',
    sport: 'general',
    categoryName: 'Slides & Lifestyle',
    sportName: 'General & Lifestyle',
    description: 'Timeless low-top silhouette tailored for modern urban living, featuring premium leather trims and padded collar.',
    price: 22500,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    sizeSystem: 'EU',
    colors: ['All White', 'Midnight Black'],
    stock: 15,
    featured: true,
    newArrival: false,
    onSale: false,
    variants: [
      { id: 'v-04-1', colour: 'All White', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 4 },
      { id: 'v-04-2', colour: 'All White', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 4 },
      { id: 'v-04-3', colour: 'Midnight Black', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 4 },
      { id: 'v-04-4', colour: 'Midnight Black', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 3 },
    ],
  },
  {
    id: 'pro-05',
    name: 'PROEDGE Airwalk',
    slug: 'proedge-airwalk',
    brand: 'PROEDGE',
    category: 'running-shoes',
    sport: 'running',
    categoryName: 'Running Shoes',
    sportName: 'Running',
    description: 'Feather-light lifestyle trainer engineered for all-day comfort with cloud-soft memory foam insoles.',
    price: 19800,
    compareAtPrice: 23000,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [36, 37, 38, 39, 40],
    sizeSystem: 'EU',
    colors: ['Dusty Rose', 'Pure White'],
    stock: 20,
    featured: true,
    newArrival: true,
    onSale: true,
    variants: [
      { id: 'v-05-1', colour: 'Dusty Rose', sizeSystem: 'EU', sizeValue: '36', size: 36, stock: 5 },
      { id: 'v-05-2', colour: 'Dusty Rose', sizeSystem: 'EU', sizeValue: '37', size: 37, stock: 5 },
      { id: 'v-05-3', colour: 'Pure White', sizeSystem: 'EU', sizeValue: '36', size: 36, stock: 5 },
      { id: 'v-05-4', colour: 'Pure White', sizeSystem: 'EU', sizeValue: '37', size: 37, stock: 5 },
    ],
  },
  {
    id: 'pro-06',
    name: 'PROEDGE Velocity',
    slug: 'proedge-velocity',
    brand: 'PROEDGE',
    category: 'running-shoes',
    sport: 'running',
    categoryName: 'Running Shoes',
    sportName: 'Running',
    description: 'Carbon-infused marathon racer built to propel elite runners to their next personal best.',
    price: 27900,
    compareAtPrice: 32000,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [41, 42, 43, 44],
    sizeSystem: 'EU',
    colors: ['Neon Volt', 'Stealth Grey'],
    stock: 8,
    featured: true,
    newArrival: true,
    onSale: false,
    variants: [
      { id: 'v-06-1', colour: 'Neon Volt', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 2 },
      { id: 'v-06-2', colour: 'Neon Volt', sizeSystem: 'EU', sizeValue: '42', size: 42, stock: 2 },
      { id: 'v-06-3', colour: 'Stealth Grey', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 2 },
      { id: 'v-06-4', colour: 'Stealth Grey', sizeSystem: 'EU', sizeValue: '42', size: 42, stock: 2 },
    ],
  },
  {
    id: 'pro-07',
    name: 'PROEDGE Court 01',
    slug: 'proedge-court-01',
    brand: 'PROEDGE',
    category: 'basketball-shoes',
    sport: 'basketball',
    categoryName: 'Basketball Shoes',
    sportName: 'Basketball',
    description: 'Vintage-inspired tennis cupsole shoe with clean lines, reinforced toe cap, and herringbone traction.',
    price: 17500,
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [39, 40, 41, 42, 43, 44],
    sizeSystem: 'EU',
    colors: ['Forest Green', 'Navy Blue'],
    stock: 22,
    featured: false,
    newArrival: false,
    onSale: false,
    variants: [
      { id: 'v-07-1', colour: 'Forest Green', sizeSystem: 'EU', sizeValue: '39', size: 39, stock: 6 },
      { id: 'v-07-2', colour: 'Forest Green', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 5 },
      { id: 'v-07-3', colour: 'Navy Blue', sizeSystem: 'EU', sizeValue: '39', size: 39, stock: 6 },
      { id: 'v-07-4', colour: 'Navy Blue', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 5 },
    ],
  },
  {
    id: 'pro-08',
    name: 'PROEDGE Trail Max',
    slug: 'proedge-trail-max',
    brand: 'PROEDGE',
    category: 'running-shoes',
    sport: 'running',
    categoryName: 'Running Shoes',
    sportName: 'Running',
    description: 'Rugged all-terrain running shoe featuring aggressive multidirectional lugs and water-resistant protective mudguard.',
    price: 29500,
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    sizeSystem: 'EU',
    colors: ['Earth Brown', 'Tactical Olive'],
    stock: 10,
    featured: false,
    newArrival: true,
    onSale: false,
    variants: [
      { id: 'v-08-1', colour: 'Earth Brown', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 3 },
      { id: 'v-08-2', colour: 'Earth Brown', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 2 },
      { id: 'v-08-3', colour: 'Tactical Olive', sizeSystem: 'EU', sizeValue: '40', size: 40, stock: 3 },
      { id: 'v-08-4', colour: 'Tactical Olive', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 2 },
    ],
  },
  {
    id: 'pro-09',
    name: 'PROEDGE Aero Glide',
    slug: 'proedge-aero-glide',
    brand: 'PROEDGE',
    category: 'running-shoes',
    sport: 'running',
    categoryName: 'Running Shoes',
    sportName: 'Running',
    description: 'Ultra-cushioned daily mileage shoe built for seamless heel-to-toe transitions and impact reduction.',
    price: 20500,
    compareAtPrice: 24000,
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    sizeSystem: 'EU',
    colors: ['Soft Mint', 'Lavender Grey'],
    stock: 16,
    featured: false,
    newArrival: false,
    onSale: true,
    variants: [
      { id: 'v-09-1', colour: 'Soft Mint', sizeSystem: 'EU', sizeValue: '36', size: 36, stock: 4 },
      { id: 'v-09-2', colour: 'Soft Mint', sizeSystem: 'EU', sizeValue: '37', size: 37, stock: 4 },
      { id: 'v-09-3', colour: 'Lavender Grey', sizeSystem: 'EU', sizeValue: '36', size: 36, stock: 4 },
      { id: 'v-09-4', colour: 'Lavender Grey', sizeSystem: 'EU', sizeValue: '37', size: 37, stock: 4 },
    ],
  },
  {
    id: 'pro-10',
    name: 'PROEDGE Apex Runner',
    slug: 'proedge-apex-runner',
    brand: 'PROEDGE',
    category: 'running-shoes',
    sport: 'running',
    categoryName: 'Running Shoes',
    sportName: 'Running',
    description: 'Pro-level competition shoe with nitrogen-infused midsole foam and targeted zonal grip for track and road.',
    price: 26000,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop',
    ],
    sizes: [41, 42, 43, 44, 45],
    sizeSystem: 'EU',
    colors: ['Solar Orange', 'Triple Black'],
    stock: 14,
    featured: false,
    newArrival: true,
    onSale: false,
    variants: [
      { id: 'v-10-1', colour: 'Solar Orange', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 4 },
      { id: 'v-10-2', colour: 'Solar Orange', sizeSystem: 'EU', sizeValue: '42', size: 42, stock: 3 },
      { id: 'v-10-3', colour: 'Triple Black', sizeSystem: 'EU', sizeValue: '41', size: 41, stock: 4 },
      { id: 'v-10-4', colour: 'Triple Black', sizeSystem: 'EU', sizeValue: '42', size: 42, stock: 3 },
    ],
  },
  // ---------------------------------------------------------------------------
  // Rugby Catalog Batch (10 Products)
  // ---------------------------------------------------------------------------
  {
    id: '92000000-0000-4000-8000-000000000001',
    name: 'PROEDGE ScrumForce 8-Stud Rugby Boots',
    slug: 'proedge-scrumforce-8-stud-rugby-boots',
    brand: 'PROEDGE',
    category: 'rugby-boots',
    sport: 'rugby',
    categoryName: 'Rugby Boots',
    sportName: 'Rugby',
    description:
      'Engineered for forward pack dominance and scrum stability. Features an 8-stud metal configuration, reinforced heel counter, and water-resistant synthetic upper for superior traction on wet, muddy pitches.',
    price: 26500,
    compareAtPrice: 31000,
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['7', '8', '9', '10', '11'],
    sizeSystem: 'UK',
    colors: ['All Black', 'White/Gold'],
    stock: 25,
    featured: true,
    newArrival: true,
    onSale: true,
    variants: [
      { id: '82000000-0000-4000-8000-000000000001', colour: 'All Black', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 3, sku: 'PE-RUG-SF8-BLK-07' },
      { id: '82000000-0000-4000-8000-000000000002', colour: 'All Black', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 5, sku: 'PE-RUG-SF8-BLK-08' },
      { id: '82000000-0000-4000-8000-000000000003', colour: 'All Black', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 4, sku: 'PE-RUG-SF8-BLK-09' },
      { id: '82000000-0000-4000-8000-000000000004', colour: 'All Black', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 2, sku: 'PE-RUG-SF8-BLK-10' },
      { id: '82000000-0000-4000-8000-000000000005', colour: 'All Black', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 1, sku: 'PE-RUG-SF8-BLK-11' },
      { id: '82000000-0000-4000-8000-000000000006', colour: 'White/Gold', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 0, sku: 'PE-RUG-SF8-WGLD-07' },
      { id: '82000000-0000-4000-8000-000000000007', colour: 'White/Gold', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 3, sku: 'PE-RUG-SF8-WGLD-08' },
      { id: '82000000-0000-4000-8000-000000000008', colour: 'White/Gold', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 4, sku: 'PE-RUG-SF8-WGLD-09' },
      { id: '82000000-0000-4000-8000-000000000009', colour: 'White/Gold', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 2, sku: 'PE-RUG-SF8-WGLD-10' },
      { id: '82000000-0000-4000-8000-000000000010', colour: 'White/Gold', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 1, sku: 'PE-RUG-SF8-WGLD-11' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000002',
    name: 'PROEDGE MatchPace Backs Rugby Boots',
    slug: 'proedge-matchpace-backs-rugby-boots',
    brand: 'PROEDGE',
    category: 'rugby-boots',
    sport: 'rugby',
    categoryName: 'Rugby Boots',
    sportName: 'Rugby',
    description:
      'Lightweight speed boot tailored for fly-halves, centres, and wingers. Features a streamlined 6-stud hybrid layout with textured forefoot strike zone for explosive acceleration and pinpoint kicking accuracy.',
    price: 28000,
    compareAtPrice: 32500,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['7', '8', '9', '10', '11'],
    sizeSystem: 'UK',
    colors: ['Electric Blue', 'Stealth Black'],
    stock: 30,
    featured: true,
    newArrival: true,
    onSale: false,
    variants: [
      { id: '82000000-0000-4000-8000-000000000011', colour: 'Electric Blue', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 4, sku: 'PE-RUG-MPB-BLU-07' },
      { id: '82000000-0000-4000-8000-000000000012', colour: 'Electric Blue', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 6, sku: 'PE-RUG-MPB-BLU-08' },
      { id: '82000000-0000-4000-8000-000000000013', colour: 'Electric Blue', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 5, sku: 'PE-RUG-MPB-BLU-09' },
      { id: '82000000-0000-4000-8000-000000000014', colour: 'Electric Blue', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 3, sku: 'PE-RUG-MPB-BLU-10' },
      { id: '82000000-0000-4000-8000-000000000015', colour: 'Electric Blue', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 2, sku: 'PE-RUG-MPB-BLU-11' },
      { id: '82000000-0000-4000-8000-000000000016', colour: 'Stealth Black', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 2, sku: 'PE-RUG-MPB-BLK-07' },
      { id: '82000000-0000-4000-8000-000000000017', colour: 'Stealth Black', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 4, sku: 'PE-RUG-MPB-BLK-08' },
      { id: '82000000-0000-4000-8000-000000000018', colour: 'Stealth Black', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 3, sku: 'PE-RUG-MPB-BLK-09' },
      { id: '82000000-0000-4000-8000-000000000019', colour: 'Stealth Black', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 0, sku: 'PE-RUG-MPB-BLK-10' },
      { id: '82000000-0000-4000-8000-000000000020', colour: 'Stealth Black', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 1, sku: 'PE-RUG-MPB-BLK-11' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000003',
    name: 'PROEDGE Vortex Match Rugby Ball',
    slug: 'proedge-vortex-match-rugby-ball',
    brand: 'PROEDGE',
    category: 'rugby-balls',
    sport: 'rugby',
    categoryName: 'Rugby Balls',
    sportName: 'Rugby',
    description:
      'Durable 4-ply match-style rugby ball with high-grip dimpled rubber composite surface and balanced latex bladder for consistent flight trajectory in all weather conditions.',
    price: 11500,
    compareAtPrice: 13800,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562077772-3ab121863412?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['Size 5'],
    sizeSystem: 'Custom',
    colors: ['Cyan/Navy', 'White/Amber'],
    stock: 20,
    featured: true,
    newArrival: true,
    onSale: true,
    variants: [
      { id: '82000000-0000-4000-8000-000000000021', colour: 'Cyan/Navy', sizeSystem: 'Custom', sizeValue: 'Size 5', size: 'Size 5', stock: 12, sku: 'PE-RUG-BALL-VORT-CYN' },
      { id: '82000000-0000-4000-8000-000000000022', colour: 'White/Amber', sizeSystem: 'Custom', sizeValue: 'Size 5', size: 'Size 5', stock: 8, sku: 'PE-RUG-BALL-VORT-AMB' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000004',
    name: 'PROEDGE Elevate Adjustable Kick Tee',
    slug: 'proedge-elevate-adjustable-kick-tee',
    brand: 'PROEDGE',
    category: 'rugby-kick-tees',
    sport: 'rugby',
    categoryName: 'Rugby Kick Tees',
    sportName: 'Rugby',
    description:
      'Telescopic height-adjustable kicking tee crafted from ultra-resilient molded polymer. Delivers a zero-slip ball perch engineered for place-kickers demanding precise launch angles.',
    price: 4800,
    images: [
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['One Size'],
    sizeSystem: 'Custom',
    colors: ['Pro Amber', 'Black'],
    stock: 25,
    featured: false,
    newArrival: true,
    onSale: false,
    variants: [
      { id: '82000000-0000-4000-8000-000000000023', colour: 'Pro Amber', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 15, sku: 'PE-RUG-TEE-ELV-AMB' },
      { id: '82000000-0000-4000-8000-000000000024', colour: 'Black', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 10, sku: 'PE-RUG-TEE-ELV-BLK' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000005',
    name: 'PROEDGE Titan Armour Head Gear',
    slug: 'proedge-titan-armour-head-gear',
    brand: 'PROEDGE',
    category: 'head-gear',
    sport: 'rugby',
    categoryName: 'Head Gear',
    sportName: 'Rugby',
    description:
      'Rugby-focused protective scrum cap with multi-density foam padding and ventilated construction.',
    price: 14500,
    compareAtPrice: 17000,
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeSystem: 'Custom',
    colors: ['Matte Black', 'Deep Royal'],
    stock: 27,
    featured: true,
    newArrival: false,
    onSale: true,
    variants: [
      { id: '82000000-0000-4000-8000-000000000025', colour: 'Matte Black', sizeSystem: 'Custom', sizeValue: 'S', size: 'S', stock: 4, sku: 'PE-RUG-HG-TIT-BLK-S' },
      { id: '82000000-0000-4000-8000-000000000026', colour: 'Matte Black', sizeSystem: 'Custom', sizeValue: 'M', size: 'M', stock: 7, sku: 'PE-RUG-HG-TIT-BLK-M' },
      { id: '82000000-0000-4000-8000-000000000027', colour: 'Matte Black', sizeSystem: 'Custom', sizeValue: 'L', size: 'L', stock: 5, sku: 'PE-RUG-HG-TIT-BLK-L' },
      { id: '82000000-0000-4000-8000-000000000028', colour: 'Matte Black', sizeSystem: 'Custom', sizeValue: 'XL', size: 'XL', stock: 2, sku: 'PE-RUG-HG-TIT-BLK-XL' },
      { id: '82000000-0000-4000-8000-000000000029', colour: 'Deep Royal', sizeSystem: 'Custom', sizeValue: 'S', size: 'S', stock: 2, sku: 'PE-RUG-HG-TIT-RYL-S' },
      { id: '82000000-0000-4000-8000-000000000030', colour: 'Deep Royal', sizeSystem: 'Custom', sizeValue: 'M', size: 'M', stock: 4, sku: 'PE-RUG-HG-TIT-RYL-M' },
      { id: '82000000-0000-4000-8000-000000000031', colour: 'Deep Royal', sizeSystem: 'Custom', sizeValue: 'L', size: 'L', stock: 3, sku: 'PE-RUG-HG-TIT-RYL-L' },
      { id: '82000000-0000-4000-8000-000000000032', colour: 'Deep Royal', sizeSystem: 'Custom', sizeValue: 'XL', size: 'XL', stock: 0, sku: 'PE-RUG-HG-TIT-RYL-XL' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000006',
    name: 'PROEDGE ProDent Dual-Layer Mouth Guard',
    slug: 'proedge-prodent-dual-layer-mouth-guard',
    brand: 'PROEDGE',
    category: 'mouth-guards',
    sport: 'rugby',
    categoryName: 'Mouth Guards',
    sportName: 'Rugby',
    description:
      'Dual-layer boil-and-bite mouth guard designed for contact sports and training.',
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['One Size'],
    sizeSystem: 'Custom',
    colors: ['Clear/Black', 'Amber/Black'],
    stock: 45,
    featured: false,
    newArrival: false,
    onSale: false,
    variants: [
      { id: '82000000-0000-4000-8000-000000000033', colour: 'Clear/Black', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 25, sku: 'PE-RUG-MG-PD-CLR' },
      { id: '82000000-0000-4000-8000-000000000034', colour: 'Amber/Black', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 20, sku: 'PE-RUG-MG-PD-AMB' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000007',
    name: 'PROEDGE GripTech Elite Rugby Socks',
    slug: 'proedge-griptech-elite-rugby-socks',
    brand: 'PROEDGE',
    category: 'sports-socks',
    sport: 'rugby',
    categoryName: 'Sports Socks',
    sportName: 'Rugby',
    description:
      'High-performance compression crew socks featuring silicon grip pads on the footbed to lock feet securely inside boots, reinforced arch band, and moisture-wicking yarns.',
    price: 2400,
    images: [
      'https://images.unsplash.com/photo-1582965372486-663c762c222f?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['M (UK 6-8)', 'L (UK 9-11)'],
    sizeSystem: 'Custom',
    colors: ['Black/Amber', 'White/Black'],
    stock: 69,
    featured: false,
    newArrival: true,
    onSale: false,
    variants: [
      { id: '82000000-0000-4000-8000-000000000035', colour: 'Black/Amber', sizeSystem: 'Custom', sizeValue: 'M (UK 6-8)', size: 'M (UK 6-8)', stock: 18, sku: 'PE-RUG-SCK-GT-BLK-M' },
      { id: '82000000-0000-4000-8000-000000000036', colour: 'Black/Amber', sizeSystem: 'Custom', sizeValue: 'L (UK 9-11)', size: 'L (UK 9-11)', stock: 22, sku: 'PE-RUG-SCK-GT-BLK-L' },
      { id: '82000000-0000-4000-8000-000000000037', colour: 'White/Black', sizeSystem: 'Custom', sizeValue: 'M (UK 6-8)', size: 'M (UK 6-8)', stock: 15, sku: 'PE-RUG-SCK-GT-WHT-M' },
      { id: '82000000-0000-4000-8000-000000000038', colour: 'White/Black', sizeSystem: 'Custom', sizeValue: 'L (UK 9-11)', size: 'L (UK 9-11)', stock: 14, sku: 'PE-RUG-SCK-GT-WHT-L' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000008',
    name: 'PROEDGE FlexForce K-Tape (5cm x 5m)',
    slug: 'proedge-flexforce-k-tape',
    brand: 'PROEDGE',
    category: 'k-tape',
    sport: 'rugby',
    categoryName: 'K-Tape',
    sportName: 'Rugby',
    description:
      'Elastic kinesiology tape designed for sports support, mobility, and training use.',
    price: 2800,
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['One Size'],
    sizeSystem: 'Custom',
    colors: ['Jet Black', 'Electric Blue', 'Skin Beige'],
    stock: 75,
    featured: false,
    newArrival: false,
    onSale: false,
    variants: [
      { id: '82000000-0000-4000-8000-000000000039', colour: 'Jet Black', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 30, sku: 'PE-ACC-KT-FF-BLK' },
      { id: '82000000-0000-4000-8000-000000000040', colour: 'Electric Blue', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 20, sku: 'PE-ACC-KT-FF-BLU' },
      { id: '82000000-0000-4000-8000-000000000041', colour: 'Skin Beige', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 25, sku: 'PE-ACC-KT-FF-BGE' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000009',
    name: 'PROEDGE RigidZinc Strapping Tape (3.8cm x 13.7m)',
    slug: 'proedge-rigidzinc-strapping-tape',
    brand: 'PROEDGE',
    category: 'rejit-tape',
    sport: 'rugby',
    categoryName: 'Rejit Tape',
    sportName: 'Rugby',
    description:
      'Heavy-duty non-elastic zinc-oxide rigid athletic tape. Features a serrated edge for easy hand-tearing, designed for secure joint and finger strapping during training and match play.',
    price: 2200,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['One Size'],
    sizeSystem: 'Custom',
    colors: ['Classic Tan', 'Pure White'],
    stock: 75,
    featured: false,
    newArrival: false,
    onSale: false,
    variants: [
      { id: '82000000-0000-4000-8000-000000000042', colour: 'Classic Tan', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 40, sku: 'PE-ACC-RT-RZ-TAN' },
      { id: '82000000-0000-4000-8000-000000000043', colour: 'Pure White', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 35, sku: 'PE-ACC-RT-RZ-WHT' },
    ],
  },
  {
    id: '92000000-0000-4000-8000-000000000010',
    name: 'PROEDGE Dual-Stroke Pressure Ball Pump',
    slug: 'proedge-dual-stroke-pressure-ball-pump',
    brand: 'PROEDGE',
    category: 'air-pumps',
    sport: 'rugby',
    categoryName: 'Air Pumps',
    sportName: 'Rugby',
    description:
      'Rapid dual-action air pump that delivers continuous inflation on both push and pull strokes. Built-in analog PSI pressure gauge, flexible hose extension, and 3 spare stainless steel needles.',
    price: 3900,
    images: [
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['One Size'],
    sizeSystem: 'Custom',
    colors: ['Matte Black'],
    stock: 16,
    featured: false,
    newArrival: true,
    onSale: false,
    variants: [
      { id: '82000000-0000-4000-8000-000000000044', colour: 'Matte Black', sizeSystem: 'Custom', sizeValue: 'One Size', size: 'One Size', stock: 16, sku: 'PE-ACC-PUMP-DS-BLK' },
    ],
  },
  // ---------------------------------------------------------------------------
  // Basketball Catalog Batch (5 Products)
  // ---------------------------------------------------------------------------
  {
    id: '93000000-0000-4000-8000-000000000001',
    name: 'PROEDGE FlightZone High-Top Basketball Shoes',
    slug: 'proedge-flightzone-high-top-basketball-shoes',
    brand: 'PROEDGE',
    category: 'basketball-shoes',
    sport: 'basketball',
    categoryName: 'Basketball Shoes',
    sportName: 'Basketball',
    description:
      'High-top performance basketball shoe featuring an ankle-stabilizing padded collar, responsive dual-density cushioning, and multidirectional herringbone rubber outsole for explosive court cuts.',
    price: 26500,
    compareAtPrice: 31000,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['6', '7', '8', '9', '10', '11'],
    sizeSystem: 'UK',
    colors: ['Black/Amber', 'Triple White'],
    stock: 29,
    featured: true,
    newArrival: true,
    onSale: true,
    variants: [
      { id: '83000000-0000-4000-8000-000000000001', colour: 'Black/Amber', sizeSystem: 'UK', sizeValue: '6', size: '6', stock: 3, sku: 'PE-BKB-FLZ-BLK-06' },
      { id: '83000000-0000-4000-8000-000000000002', colour: 'Black/Amber', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 5, sku: 'PE-BKB-FLZ-BLK-07' },
      { id: '83000000-0000-4000-8000-000000000003', colour: 'Black/Amber', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 4, sku: 'PE-BKB-FLZ-BLK-08' },
      { id: '83000000-0000-4000-8000-000000000004', colour: 'Black/Amber', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 2, sku: 'PE-BKB-FLZ-BLK-09' },
      { id: '83000000-0000-4000-8000-000000000005', colour: 'Black/Amber', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 1, sku: 'PE-BKB-FLZ-BLK-10' },
      { id: '83000000-0000-4000-8000-000000000006', colour: 'Black/Amber', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 0, sku: 'PE-BKB-FLZ-BLK-11' },
      { id: '83000000-0000-4000-8000-000000000007', colour: 'Triple White', sizeSystem: 'UK', sizeValue: '6', size: '6', stock: 2, sku: 'PE-BKB-FLZ-WHT-06' },
      { id: '83000000-0000-4000-8000-000000000008', colour: 'Triple White', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 4, sku: 'PE-BKB-FLZ-WHT-07' },
      { id: '83000000-0000-4000-8000-000000000009', colour: 'Triple White', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 3, sku: 'PE-BKB-FLZ-WHT-08' },
      { id: '83000000-0000-4000-8000-000000000010', colour: 'Triple White', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 2, sku: 'PE-BKB-FLZ-WHT-09' },
      { id: '83000000-0000-4000-8000-000000000011', colour: 'Triple White', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 2, sku: 'PE-BKB-FLZ-WHT-10' },
      { id: '83000000-0000-4000-8000-000000000012', colour: 'Triple White', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 1, sku: 'PE-BKB-FLZ-WHT-11' },
    ],
  },
  {
    id: '93000000-0000-4000-8000-000000000002',
    name: 'PROEDGE ShiftLow Court Basketball Shoes',
    slug: 'proedge-shiftlow-court-basketball-shoes',
    brand: 'PROEDGE',
    category: 'basketball-shoes',
    sport: 'basketball',
    categoryName: 'Basketball Shoes',
    sportName: 'Basketball',
    description:
      'Low-profile agility basketball shoe engineered for perimeter guards. Features an ultra-light breathable knit upper, lateral outrigger support, and sticky non-slip indoor outsole.',
    price: 24500,
    compareAtPrice: 28500,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['6', '7', '8', '9', '10', '11'],
    sizeSystem: 'UK',
    colors: ['Royal/Black', 'Solar Red'],
    stock: 33,
    featured: true,
    newArrival: true,
    onSale: false,
    variants: [
      { id: '83000000-0000-4000-8000-000000000013', colour: 'Royal/Black', sizeSystem: 'UK', sizeValue: '6', size: '6', stock: 2, sku: 'PE-BKB-SLW-RYL-06' },
      { id: '83000000-0000-4000-8000-000000000014', colour: 'Royal/Black', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 5, sku: 'PE-BKB-SLW-RYL-07' },
      { id: '83000000-0000-4000-8000-000000000015', colour: 'Royal/Black', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 6, sku: 'PE-BKB-SLW-RYL-08' },
      { id: '83000000-0000-4000-8000-000000000016', colour: 'Royal/Black', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 4, sku: 'PE-BKB-SLW-RYL-09' },
      { id: '83000000-0000-4000-8000-000000000017', colour: 'Royal/Black', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 3, sku: 'PE-BKB-SLW-RYL-10' },
      { id: '83000000-0000-4000-8000-000000000018', colour: 'Royal/Black', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 1, sku: 'PE-BKB-SLW-RYL-11' },
      { id: '83000000-0000-4000-8000-000000000019', colour: 'Solar Red', sizeSystem: 'UK', sizeValue: '6', size: '6', stock: 1, sku: 'PE-BKB-SLW-RED-06' },
      { id: '83000000-0000-4000-8000-000000000020', colour: 'Solar Red', sizeSystem: 'UK', sizeValue: '7', size: '7', stock: 3, sku: 'PE-BKB-SLW-RED-07' },
      { id: '83000000-0000-4000-8000-000000000021', colour: 'Solar Red', sizeSystem: 'UK', sizeValue: '8', size: '8', stock: 4, sku: 'PE-BKB-SLW-RED-08' },
      { id: '83000000-0000-4000-8000-000000000022', colour: 'Solar Red', sizeSystem: 'UK', sizeValue: '9', size: '9', stock: 2, sku: 'PE-BKB-SLW-RED-09' },
      { id: '83000000-0000-4000-8000-000000000023', colour: 'Solar Red', sizeSystem: 'UK', sizeValue: '10', size: '10', stock: 0, sku: 'PE-BKB-SLW-RED-10' },
      { id: '83000000-0000-4000-8000-000000000024', colour: 'Solar Red', sizeSystem: 'UK', sizeValue: '11', size: '11', stock: 2, sku: 'PE-BKB-SLW-RED-11' },
    ],
  },
  {
    id: '93000000-0000-4000-8000-000000000003',
    name: 'PROEDGE GripLock Composite Basketball',
    slug: 'proedge-griplock-composite-basketball',
    brand: 'PROEDGE',
    category: 'basketballs',
    sport: 'basketball',
    categoryName: 'Basketballs',
    sportName: 'Basketball',
    description:
      'Premium composite leather basketball with deep pebbled channels for fingertip control and moisture-wicking surface feel on hardwood and synthetic courts.',
    price: 11500,
    compareAtPrice: 13500,
    images: [
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['Size 7'],
    sizeSystem: 'Custom',
    colors: ['Classic Amber/Black', 'Stealth Black'],
    stock: 32,
    featured: true,
    newArrival: false,
    onSale: true,
    variants: [
      { id: '83000000-0000-4000-8000-000000000025', colour: 'Classic Amber/Black', sizeSystem: 'Custom', sizeValue: 'Size 7', size: 'Size 7', stock: 18, sku: 'PE-BKB-BAL-GLC-AMB-07' },
      { id: '83000000-0000-4000-8000-000000000026', colour: 'Stealth Black', sizeSystem: 'Custom', sizeValue: 'Size 7', size: 'Size 7', stock: 14, sku: 'PE-BKB-BAL-GLC-BLK-07' },
    ],
  },
  {
    id: '93000000-0000-4000-8000-000000000004',
    name: 'PROEDGE StreetCourt Outdoor Rubber Basketball',
    slug: 'proedge-streetcourt-outdoor-rubber-basketball',
    brand: 'PROEDGE',
    category: 'basketballs',
    sport: 'basketball',
    categoryName: 'Basketballs',
    sportName: 'Basketball',
    description:
      'Ultra-durable vulcanized rubber basketball built to withstand asphalt, concrete, and rough outdoor court surfaces with deep groove grip channels.',
    price: 6900,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['Size 7'],
    sizeSystem: 'Custom',
    colors: ['Brick Red/Black', 'Volt/Black'],
    stock: 35,
    featured: false,
    newArrival: true,
    onSale: false,
    variants: [
      { id: '83000000-0000-4000-8000-000000000027', colour: 'Brick Red/Black', sizeSystem: 'Custom', sizeValue: 'Size 7', size: 'Size 7', stock: 20, sku: 'PE-BKB-BAL-SCO-RED-07' },
      { id: '83000000-0000-4000-8000-000000000028', colour: 'Volt/Black', sizeSystem: 'Custom', sizeValue: 'Size 7', size: 'Size 7', stock: 15, sku: 'PE-BKB-BAL-SCO-VLT-07' },
    ],
  },
  {
    id: '93000000-0000-4000-8000-000000000005',
    name: 'PROEDGE CourtCushion Compression Basketball Socks',
    slug: 'proedge-courtcushion-compression-basketball-socks',
    brand: 'PROEDGE',
    category: 'sports-socks',
    sport: 'basketball',
    categoryName: 'Sports Socks',
    sportName: 'Basketball',
    description:
      'High-density cushioned crew socks with targeted ankle and Achilles padding, arch compression band, and ventilated knit zones for high-impact court play.',
    price: 2600,
    images: [
      'https://images.unsplash.com/photo-1582965372486-663c762c222f?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80&auto=format&fit=crop',
    ],
    sizes: ['M (UK 6-8)', 'L (UK 9-11)'],
    sizeSystem: 'Custom',
    colors: ['White/Black', 'Triple Black'],
    stock: 92,
    featured: false,
    newArrival: true,
    onSale: false,
    variants: [
      { id: '83000000-0000-4000-8000-000000000029', colour: 'White/Black', sizeSystem: 'Custom', sizeValue: 'M (UK 6-8)', size: 'M (UK 6-8)', stock: 22, sku: 'PE-BKB-SCK-CC-WHT-M' },
      { id: '83000000-0000-4000-8000-000000000030', colour: 'White/Black', sizeSystem: 'Custom', sizeValue: 'L (UK 9-11)', size: 'L (UK 9-11)', stock: 28, sku: 'PE-BKB-SCK-CC-WHT-L' },
      { id: '83000000-0000-4000-8000-000000000031', colour: 'Triple Black', sizeSystem: 'Custom', sizeValue: 'M (UK 6-8)', size: 'M (UK 6-8)', stock: 18, sku: 'PE-BKB-SCK-CC-BLK-M' },
      { id: '83000000-0000-4000-8000-000000000032', colour: 'Triple Black', sizeSystem: 'Custom', sizeValue: 'L (UK 9-11)', size: 'L (UK 9-11)', stock: 24, sku: 'PE-BKB-SCK-CC-BLK-L' },
    ],
  },
];

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
  const matchingSlugs = getCategorySlugsForQuery(category);
  return MOCK_PRODUCTS.filter(
    (product) =>
      matchingSlugs.includes(product.category) ||
      (product.sport && matchingSlugs.includes(product.sport)) ||
      product.category === category ||
      product.sport === category,
  );
}

export function filterProductList(products: Product[], params: ProductFilterParams): Product[] {
  let result = [...products];

  if (params.category && params.category !== 'all') {
    const matchingSlugs = getCategorySlugsForQuery(params.category);
    result = result.filter(
      (p) =>
        matchingSlugs.includes(p.category) ||
        (p.sport && matchingSlugs.includes(p.sport)) ||
        p.category === params.category ||
        p.sport === params.category,
    );
  }

  if (params.search && params.search.trim() !== '') {
    const query = params.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query)) ||
        (p.sportName && p.sportName.toLowerCase().includes(query)),
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
