export type ProductCategory = 'men' | 'women' | 'sports' | 'casual';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  description: string;
  price: number; // in LKR
  compareAtPrice?: number; // in LKR
  images: string[];
  sizes: number[]; // EU sizing e.g. [40, 41, 42, 43, 44]
  colors: string[];
  stock: number;
  featured: boolean;
  newArrival: boolean;
  onSale: boolean;
  variants?: { id: string; size: number; colour: string }[];
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface ProductFilterParams {
  category?: ProductCategory | 'all';
  search?: string;
  sortBy?: SortOption;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}
