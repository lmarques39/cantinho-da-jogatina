import { NextRequest, NextResponse } from 'next/server';
import { getProductsBySlugs } from '@/lib/data/products';

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('slugs') ?? '';
  const slugs = raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);

  if (!slugs.length) {
    return NextResponse.json({ products: [] });
  }

  const products = await getProductsBySlugs(slugs);
  return NextResponse.json({ products });
}
