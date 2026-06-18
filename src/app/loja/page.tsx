import { getProducts } from '@/lib/data/products';
import { ShopFilters } from '@/components/shop/shop-filters';
import { ActiveFilters } from '@/components/shop/active-filters';
import { SortSelect } from '@/components/shop/sort-select';
import { ProductGrid } from '@/components/shop/product-grid';
import { RecommendedProducts } from '@/components/shop/recommended-products';
import type { ProductTypeSlug, BrandSlug } from '@/lib/taxonomy';

// Garante que a página é re-renderizada a cada mudança de filtro (query params),
// em vez de servir uma versão em cache — sem isto, mudar de filtro só atualizava
// depois de um refresh manual.
export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{
    tipo?: string;
    marca?: string;
    plataforma?: string;
    estado?: string;
    pesquisa?: string;
    ordenar?: string;
    pagina?: string;
  }>;
}

const PER_PAGE = 24;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const sort = (params.ordenar ?? 'newest') as
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | 'title_asc';
  const productType = params.tipo as ProductTypeSlug | undefined;
  const brand = params.marca as BrandSlug | undefined;
  const platform = params.plataforma;

  const { products, total } = await getProducts({
    productType,
    brand,
    platform,
    conditionSlug: params.estado,
    search: params.pesquisa,
    sort,
    page: 1,
    perPage: PER_PAGE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-50">Loja</h1>
        <p className="mt-1 text-sm text-ink-300">
          {params.pesquisa ? (
            <>
              {total} resultados para <span className="text-cartridge-400">&ldquo;{params.pesquisa}&rdquo;</span>
            </>
          ) : (
            `${total} produtos encontrados`
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <ShopFilters activeType={productType} activeBrand={brand} activePlatform={platform} activeCondition={params.estado} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <ActiveFilters activeType={productType} activeBrand={brand} activePlatform={platform} activeCondition={params.estado} />
            <SortSelect value={sort} />
          </div>

          {products.length === 0 ? (
            <div className="rounded-cart border border-ink-700 bg-ink-700/40 p-10 text-center">
              <p className="text-ink-200">Nenhum produto encontrado com estes filtros.</p>
              <a
                href="/loja"
                className="mt-3 inline-block text-sm font-semibold text-cartridge-400 hover:underline"
              >
                Limpar filtros
              </a>
            </div>
          ) : (
            <ProductGrid
              key={`${productType ?? ''}-${brand ?? ''}-${params.estado ?? ''}-${params.pesquisa ?? ''}-${sort}`}
              initialProducts={products}
              total={total}
              perPage={PER_PAGE}
            />
          )}
        </div>
      </div>

      <div className="-mx-4 sm:-mx-6 lg:-mx-8 mt-12 border-t border-ink-700">
        <RecommendedProducts />
      </div>
    </div>
  );
}
