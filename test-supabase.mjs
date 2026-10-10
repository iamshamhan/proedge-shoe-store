import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve('.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase Connection to:', supabaseUrl);
  
  // Try to fetch settings
  const { data: settingsData, error: settingsError } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1);
    
  if (settingsError) {
    console.error('Error fetching store_settings:', settingsError.message);
  } else {
    console.log('store_settings table exists. Rows:', settingsData.length);
  }

  // Try to fetch products
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, name')
    .limit(1);

  if (productsError) {
    console.error('Error fetching products:', productsError.message);
  } else {
    console.log('products table exists. Rows:', productsData.length);
  }
}

testConnection();
