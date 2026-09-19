import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings';


export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(settings, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
