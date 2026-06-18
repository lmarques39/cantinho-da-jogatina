import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/data/products';
import type { ProductTypeSlug, BrandSlug } from '@/lib/taxonomy';

// Devolve produtos filtrados em JSON — usada pelo botão "Carregar mais"
// na loja, para acrescentar produtos sem recarregar a página.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const sort = (searchParams.get('ordenar') ?? 'newest') as
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | 'title_asc';

  const { products, total } = await getProducts({
    productType: (searchParams.get('tipo') as ProductTypeSlug) || undefined,
    brand: (searchParams.get('marca') as BrandSlug) || undefined,
    conditionSlug: searchParams.get('estado') || undefined,
    search: searchParams.get('pesquisa') || undefined,
    sort,
    page: parseInt(searchParams.get('pagina') ?? '1', 10) || 1,
    perPage: 24,
  });

  return NextResponse.json({ products, total });
}
