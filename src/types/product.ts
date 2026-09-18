export type SizeSystem = 'UK' | 'US' | 'EU' | 'Custom';

export interface ProductVariant {
  id: string;
  productId?: string;
  colour: string;
  sizeSystem?: SizeSystem;
  sizeValue?: string;
  size: number | string;
  stock: number;
  sku?: string | null;
}

export type ProductCategory = string;

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  sortOrder: number;
  description?: string | null;
  children?: CategoryItem[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categoryName?: string;
  sport?: string;
  sportName?: string;
  description: string;
  price: number; // in LKR
  compareAtPrice?: number; // in LKR
  images: string[];
  sizes: (number | string)[]; // e.g. [40, 41, 42] or ['7', '8', '9'] or ['Size 5', '25L']
  sizeSystem?: SizeSystem;
  colors: string[];
  stock: number;
  featured: boolean;
  newArrival: boolean;
  onSale: boolean;
  variants?: ProductVariant[];
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface ProductFilterParams {
  category?: ProductCategory | 'all';
  sport?: string;
  search?: string;
  sortBy?: SortOption;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}
