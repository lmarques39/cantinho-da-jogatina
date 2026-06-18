import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ConditionBadge } from './condition-badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const condition = product.attributes.find((a) => a.attribute_slug === 'pa_estado')?.name;
  const platform = product.attributes.find((a) => a.attribute_slug === 'pa_plataforma')?.name;
  const isOutOfStock = product.stock_status === 'outofstock';
  const onSale = product.sale_price !== null && product.sale_price < (product.regular_price ?? Infinity);

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col rounded-cart border border-ink-700 bg-ink-700/40 overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      <div className="relative aspect-square bg-ink-900 overflow-hidden">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-500 text-sm">Sem imagem</div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-ink-900/70 flex items-center justify-center">
            <span className="condition-badge text-ink-200 border-ink-300">Esgotado</span>
          </div>
        )}

        {onSale && !isOutOfStock && (
          <span className="absolute top-2 left-2 condition-badge text-signal-400 border-signal-400 bg-ink-900/80">
            Saldo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {platform && (
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-300">{platform}</span>
        )}
        <h3 className="font-display text-sm font-semibold text-ink-50 line-clamp-2 leading-snug">
          {product.title}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-1.5">
            {onSale ? (
              <>
                <span className="font-mono text-base font-bold text-signal-400">
                  {formatPrice(product.sale_price!)}
                </span>
                <span className="font-mono text-xs text-ink-400 line-through">
                  {formatPrice(product.regular_price!)}
                </span>
              </>
            ) : (
              <span className="font-mono text-base font-bold text-cartridge-400">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <ConditionBadge condition={condition} />
        </div>
      </div>
    </Link>
  );
}
