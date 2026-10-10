import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setting force-dynamic ensures this route isn't cached and actually runs the query every time it's called
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { status: 'error', message: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // A simple lightweight query just to trigger activity and keep the DB awake
    const { error } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Keep-alive ping failed:', error);
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      status: 'awake', 
      message: 'Database ping successful',
      time: new Date().toISOString() 
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
