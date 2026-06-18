import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PRODUCT_TYPES, BRANDS, type ProductTypeSlug, type BrandSlug } from '@/lib/taxonomy';

interface ShopFiltersProps {
  activeType?: ProductTypeSlug;
  activeBrand?: BrandSlug;
  activeCondition?: string;
}

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return `/loja${qs ? `?${qs}` : ''}`;
}

const CONDITION_OPTIONS = [
  { slug: undefined, label: 'Todos' },
  { slug: 'novo', label: 'Novo' },
  { slug: 'usado', label: 'Usado' },
];

export function ShopFilters({ activeType, activeBrand, activeCondition }: ShopFiltersProps) {
  return (
    <aside className="space-y-8">
      {/* Marca / Plataforma — pills horizontais, cruzam livremente com Tipo */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-100 mb-3">
          Plataforma
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref({ tipo: activeType, estado: activeCondition })}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              !activeBrand
                ? 'border-cartridge-400 bg-cartridge-400 text-ink-900'
                : 'border-ink-600 text-ink-200 hover:border-cartridge-400 hover:text-cartridge-400'
            )}
          >
            Todas
          </Link>
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={buildHref({ tipo: activeType, marca: brand.slug, estado: activeCondition })}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                activeBrand === brand.slug
                  ? 'border-cartridge-400 bg-cartridge-400 text-ink-900'
                  : 'border-ink-600 text-ink-200 hover:border-cartridge-400 hover:text-cartridge-400'
              )}
            >
              {brand.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tipo de Produto — lista vertical, eixo independente de Plataforma */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-100 mb-3">
          Tipo de Produto
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href={buildHref({ marca: activeBrand, estado: activeCondition })}
              className={cn(
                'block px-2 py-1.5 rounded-cart text-sm transition-colors',
                !activeType
                  ? 'text-cartridge-400 font-semibold'
                  : 'text-ink-200 hover:text-cartridge-400'
              )}
            >
              Todos
            </Link>
          </li>
          {PRODUCT_TYPES.map((type) => (
            <li key={type.slug}>
              <Link
                href={buildHref({ tipo: type.slug, marca: activeBrand, estado: activeCondition })}
                className={cn(
                  'block px-2 py-1.5 rounded-cart text-sm transition-colors',
                  activeType === type.slug
                    ? 'text-cartridge-400 font-semibold'
                    : 'text-ink-200 hover:text-cartridge-400'
                )}
              >
                {type.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Estado: novo / usado */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-100 mb-3">
          Estado
        </h3>
        <ul className="space-y-1">
          {CONDITION_OPTIONS.map((opt) => (
            <li key={opt.label}>
              <Link
                href={buildHref({ tipo: activeType, marca: activeBrand, estado: opt.slug })}
                className={cn(
                  'block px-2 py-1.5 rounded-cart text-sm transition-colors',
                  activeCondition === opt.slug || (!activeCondition && !opt.slug)
                    ? 'text-cartridge-400 font-semibold'
                    : 'text-ink-200 hover:text-cartridge-400'
                )}
              >
                {opt.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
