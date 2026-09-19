
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.describe("Database RLS Security", () => {
  test("Anonymous client cannot insert directly into orders table", async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    expect(supabaseUrl).toContain("supabase.co");
    
    const client = createClient(supabaseUrl, supabaseKey);
    
    const { error, data } = await client.from("orders").insert([
      {
        total_amount: 0,
        status: "pending",
        customer_info: {}
      }
    ]);
    
    // RLS must reject the operation. No data should be returned.
    expect(data).toBeNull();
    expect(error).not.toBeNull();
    
    // The key outcome is that the insert was rejected with an error.
    expect(error?.code).toMatch(/PGRST|42501/);
  });

  test("Anonymous client cannot insert directly into order_items table", async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const client = createClient(supabaseUrl, supabaseKey);
    
    const { error, data } = await client.from("order_items").insert([
      {
        order_id: 1,
        product_id: 1,
        quantity: 1,
        price_at_time: 0
      }
    ]);
    
    expect(data).toBeNull();
    expect(error).not.toBeNull();
    expect(error?.code).toMatch(/PGRST|42501/);
  });
});

