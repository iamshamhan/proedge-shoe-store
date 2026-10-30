import type { Product, ProductFilterParams, CategoryItem } from '@/types/product';
import { getCategorySlugsForQuery, type NavCategory } from '@/data/categories';

export function filterProductList(
  products: Product[],
  params: ProductFilterParams,
  categoriesHierarchy?: (CategoryItem | NavCategory)[],
): Product[] {
  let result = [...products];

  if (params.category && params.category !== 'all') {
    const matchingSlugs = getCategorySlugsForQuery(params.category, categoriesHierarchy);
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
