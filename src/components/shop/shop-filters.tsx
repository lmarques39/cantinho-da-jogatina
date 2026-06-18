'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT_TYPES, BRANDS, BRAND_PLATFORMS, type ProductTypeSlug, type BrandSlug } from '@/lib/taxonomy';

interface ShopFiltersProps {
  activeType?: ProductTypeSlug;
  activeBrand?: BrandSlug;
  activePlatform?: string;
  activeCondition?: string;
  activeSearch?: string;
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

export function ShopFilters({
  activeType,
  activeBrand,
  activePlatform,
  activeCondition,
  activeSearch,
}: ShopFiltersProps) {
  const router = useRouter();
  const subPlatforms = activeBrand ? (BRAND_PLATFORMS[activeBrand] ?? []) : [];

  function navigate(href: string) {
    router.push(href);
    router.refresh();
  }

  function pill(href: string, label: string, active: boolean, small = false) {
    return (
      <button
        key={label}
        onClick={() => navigate(href)}
        className={cn(
          'rounded-full border font-medium transition-colors',
          small ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
          active
            ? 'border-cartridge-400 bg-cartridge-400 text-ink-900'
            : 'border-ink-600 text-ink-200 hover:border-cartridge-400 hover:text-cartridge-400'
        )}
      >
        {label}
      </button>
    );
  }

  function subPill(href: string, label: string, active: boolean) {
    return (
      <button
        key={label}
        onClick={() => navigate(href)}
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          active
            ? 'border-cartridge-400 bg-cartridge-400/20 text-cartridge-400'
            : 'border-ink-600 text-ink-300 hover:border-cartridge-400 hover:text-cartridge-400'
        )}
      >
        {label}
      </button>
    );
  }

  function listItem(href: string, label: string, active: boolean) {
    return (
      <li key={label}>
        <button
          onClick={() => navigate(href)}
          className={cn(
            'block w-full text-left px-2 py-1.5 rounded-cart text-sm transition-colors',
            active ? 'text-cartridge-400 font-semibold' : 'text-ink-200 hover:text-cartridge-400'
          )}
        >
          {label}
        </button>
      </li>
    );
  }

  return (
    <aside className="space-y-8">
      {/* Plataforma */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-100 mb-3">
          Plataforma
        </h3>
        <div className="flex flex-wrap gap-2">
          {pill(buildHref({ tipo: activeType, estado: activeCondition, pesquisa: activeSearch }), 'Todas', !activeBrand)}
          {BRANDS.map((brand) =>
            pill(
              buildHref({ tipo: activeType, marca: brand.slug, estado: activeCondition, pesquisa: activeSearch }),
              brand.label,
              activeBrand === brand.slug
            )
          )}
        </div>

        {subPlatforms.length > 0 && (
          <div className="mt-3 pl-1 border-l-2 border-ink-700">
            <p className="text-[11px] uppercase tracking-widest text-ink-400 mb-2 ml-2">Geração</p>
            <div className="flex flex-wrap gap-1.5 ml-2">
              {subPill(
                buildHref({ tipo: activeType, marca: activeBrand, estado: activeCondition, pesquisa: activeSearch }),
                'Todas',
                !activePlatform
              )}
              {subPlatforms.map((p) =>
                subPill(
                  buildHref({ tipo: activeType, marca: activeBrand, plataforma: p.slug, estado: activeCondition, pesquisa: activeSearch }),
                  p.label,
                  activePlatform === p.slug
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tipo de Produto */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-100 mb-3">
          Tipo de Produto
        </h3>
        <ul className="space-y-1">
          {listItem(
            buildHref({ marca: activeBrand, plataforma: activePlatform, estado: activeCondition, pesquisa: activeSearch }),
            'Todos',
            !activeType
          )}
          {PRODUCT_TYPES.map((type) =>
            listItem(
              buildHref({ tipo: type.slug, marca: activeBrand, plataforma: activePlatform, estado: activeCondition, pesquisa: activeSearch }),
              type.label,
              activeType === type.slug
            )
          )}
        </ul>
      </div>

      {/* Estado */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-100 mb-3">
          Estado
        </h3>
        <ul className="space-y-1">
          {CONDITION_OPTIONS.map((opt) =>
            listItem(
              buildHref({ tipo: activeType, marca: activeBrand, plataforma: activePlatform, estado: opt.slug, pesquisa: activeSearch }),
              opt.label,
              activeCondition === opt.slug || (!activeCondition && !opt.slug)
            )
          )}
        </ul>
      </div>
    </aside>
  );
}
