export const ADMIN_PAGE_SIZE = 25;
export type AdminSearchParams = { page?: string; q?: string; filter?: string; category?: string; status?: string };
export function adminPage(value?: string): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
}
export function searchTerm(value?: string): string {
  return (value ?? '').replace(/[^\p{L}\p{N}\s@+.-]/gu, '').trim().slice(0, 100);
}
export function pageHref(path: string, params: AdminSearchParams, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value && key !== 'page') query.set(key, value);
  query.set('page', String(page));
  return `${path}?${query}`;
}
