type Page<T> = { data: T[] | null; error: { message: string } | null };

// Callers must supply a deterministic order, including a unique tie-breaker.
export async function readAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<Page<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await fetchPage(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
  }
}
