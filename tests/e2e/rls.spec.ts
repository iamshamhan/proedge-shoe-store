import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Write-policy assertions live in supabase/tests/rls.sql and roll back all changes.
test('anonymous clients cannot read customer orders', async () => {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (const table of ['orders', 'order_items']) {
    const { data, error } = await client.from(table).select('id').limit(1);
    if (error) expect(error.code).toBe('42501');
    else expect(data).toEqual([]);
  }
});
