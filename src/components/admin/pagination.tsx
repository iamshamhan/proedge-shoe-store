import Link from 'next/link';
import { ADMIN_PAGE_SIZE, pageHref, type AdminSearchParams } from '@/lib/admin-pagination';

export function AdminPagination({ path, params, page, total }: {
  path: string; params: AdminSearchParams; page: number; total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  return <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm">
    <span>{total} results · Page {page} of {pages}</span>
    <div className="flex gap-4">
      {page > 1 && <Link href={pageHref(path, params, page - 1)}>Previous</Link>}
      {page < pages && <Link href={pageHref(path, params, page + 1)}>Next</Link>}
    </div>
  </nav>;
}
