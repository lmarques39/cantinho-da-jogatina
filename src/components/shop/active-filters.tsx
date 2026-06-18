import Link from 'next/link';
import { PRODUCT_TYPES, BRANDS, type ProductTypeSlug, type BrandSlug } from '@/lib/taxonomy';

interface ActiveFiltersProps {
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

export function ActiveFilters({ activeType, activeBrand, activeCondition }: ActiveFiltersProps) {
  const chips: { label: string; removeHref: string }[] = [];

  if (activeType) {
    const type = PRODUCT_TYPES.find((t) => t.slug === activeType);
    if (type) {
      chips.push({
        label: type.label,
        removeHref: buildHref({ marca: activeBrand, estado: activeCondition }),
      });
    }
  }
  if (activeBrand) {
    const brand = BRANDS.find((b) => b.slug === activeBrand);
    if (brand) {
      chips.push({
        label: brand.label,
        removeHref: buildHref({ tipo: activeType, estado: activeCondition }),
      });
    }
  }
  if (activeCondition) {
    chips.push({
      label: activeCondition === 'novo' ? 'Novo' : 'Usado',
      removeHref: buildHref({ tipo: activeType, marca: activeBrand }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.removeHref}
          className="group flex items-center gap-1.5 rounded-full bg-ink-700 border border-ink-600 px-3 py-1 text-xs font-medium text-ink-100 hover:border-signal-400 transition-colors"
        >
          {chip.label}
          <span className="text-ink-400 group-hover:text-signal-400" aria-hidden>
            ✕
          </span>
        </Link>
      ))}
      <Link href="/loja" className="text-xs text-ink-400 hover:text-cartridge-400 underline">
        Limpar tudo
      </Link>
    </div>
  );
}
