'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';

export function CartView() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <div className="rounded-cart border border-ink-700 bg-ink-700/40 p-12 text-center">
        <p className="text-ink-200 mb-4">O teu carrinho está vazio.</p>
        <Link
          href="/loja"
          className="inline-flex items-center gap-2 rounded-cart bg-cartridge-400 px-5 py-2.5 font-display text-sm font-bold text-ink-900 hover:bg-cartridge-300 transition-colors"
        >
          Ver produtos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variationId ?? 'base'}`}
            className="flex gap-4 rounded-cart border border-ink-700 bg-ink-700/40 p-4"
          >
            <Link
              href={`/produto/${item.slug}`}
              className="relative h-20 w-20 shrink-0 rounded-cart bg-ink-900 overflow-hidden"
            >
              {item.thumbnailUrl ? (
                <Image src={item.thumbnailUrl} alt={item.title} fill className="object-contain p-1.5" />
              ) : null}
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/produto/${item.slug}`} className="font-display font-semibold text-ink-50 hover:text-cartridge-400 line-clamp-2">
                {item.title}
              </Link>
              <p className="mt-1 font-mono text-sm text-cartridge-400">{formatPrice(item.price)}</p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center rounded-cart border border-ink-600">
                  <button
                    aria-label="Diminuir quantidade"
                    onClick={() => updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                    className="p-1.5 text-ink-200 hover:text-cartridge-400"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                  <button
                    aria-label="Aumentar quantidade"
                    onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                    className="p-1.5 text-ink-200 hover:text-cartridge-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.variationId)}
                  aria-label="Remover item"
                  className="p-1.5 text-ink-400 hover:text-signal-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="font-mono text-sm font-semibold text-ink-50 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-cart border border-ink-700 bg-ink-700/40 p-5 h-fit">
        <h2 className="font-display font-bold text-ink-50 mb-4">Resumo</h2>
        <div className="flex justify-between text-sm text-ink-200 mb-2">
          <span>Subtotal</span>
          <span className="font-mono">{formatPrice(totalPrice)}</span>
        </div>
        <p className="text-xs text-ink-400 mb-4">Portes calculados no checkout</p>
        <div className="border-t border-ink-700 pt-4 mb-4 flex justify-between font-display font-bold text-ink-50">
          <span>Total</span>
          <span className="font-mono text-cartridge-400">{formatPrice(totalPrice)}</span>
        </div>
        <Link
          href="/checkout"
          className="block text-center rounded-cart bg-cartridge-400 px-5 py-3 font-display text-sm font-bold text-ink-900 hover:bg-cartridge-300 transition-colors"
        >
          Finalizar compra
        </Link>
      </div>
    </div>
  );
}
