'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '@/types';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';

interface AddToCartFormProps {
  product: Product;
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    product.variations[0]?.id ?? null
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariation = useMemo(
    () => product.variations.find((v) => v.id === selectedVariationId) ?? null,
    [product.variations, selectedVariationId]
  );

  const isVariable = product.product_type === 'variable';
  const activePrice = selectedVariation?.price ?? product.price;
  const activeStock = selectedVariation?.stock_quantity ?? product.stock_quantity;
  const activeStockStatus = selectedVariation?.stock_status ?? product.stock_status;
  const isOutOfStock = activeStockStatus === 'outofstock' || activeStock <= 0;

  function handleAdd() {
    if (isOutOfStock) return;
    if (isVariable && !selectedVariation) return;

    addItem({
      productId: product.id,
      variationId: selectedVariation?.id ?? null,
      title: selectedVariation ? `${product.title} — ${selectedVariation.title}` : product.title,
      price: activePrice,
      quantity,
      thumbnailUrl: selectedVariation?.thumbnail_url ?? product.thumbnail_url,
      slug: product.slug,
      stockQuantity: activeStock,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="space-y-5">
      {isVariable && product.variations.length > 0 && (
        <div>
          <label className="font-display text-sm font-semibold text-ink-100 mb-2 block">
            Escolhe a variante
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variations.map((v) => {
              const gradeAttr = v.attributes[0];
              const disabled = v.stock_status === 'outofstock';
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedVariationId(v.id)}
                  className={`rounded-cart border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedVariationId === v.id
                      ? 'border-cartridge-400 text-cartridge-400 bg-cartridge-900/20'
                      : 'border-ink-600 text-ink-200 hover:border-ink-400'
                  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {gradeAttr?.name ?? v.title}
                  {disabled && ' (esgotado)'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-cartridge-400">{formatPrice(activePrice)}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-cart border border-ink-600">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-ink-200 hover:text-cartridge-400 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-mono text-sm text-ink-50">{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            onClick={() => setQuantity((q) => Math.min(activeStock || 1, q + 1))}
            className="p-2.5 text-ink-200 hover:text-cartridge-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-cart px-6 py-3 font-display text-sm font-bold transition-all shadow-cart hover:shadow-cart-hover ${
            isOutOfStock
              ? 'bg-ink-600 text-ink-300 cursor-not-allowed shadow-none'
              : justAdded
              ? 'bg-leaf-500 text-ink-900'
              : 'bg-cartridge-400 text-ink-900 hover:bg-cartridge-300'
          }`}
        >
          {isOutOfStock ? (
            'Esgotado'
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" /> Adicionado
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho
            </>
          )}
        </button>
      </div>

      {!isOutOfStock && activeStock <= 3 && (
        <p className="text-xs text-signal-400 font-medium">Últimas {activeStock} unidades em stock</p>
      )}
    </div>
  );
}
