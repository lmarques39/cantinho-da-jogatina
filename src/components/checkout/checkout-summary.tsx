'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';

export function CheckoutSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalPrice());
  const shippingCost = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  return (
    <div className="rounded-cart border border-ink-700 bg-ink-700/40 p-5 h-fit">
      <h2 className="font-display font-bold text-ink-50 mb-4">A tua encomenda</h2>
      <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variationId ?? 'base'}`} className="flex gap-3">
            <div className="relative h-12 w-12 shrink-0 rounded-cart bg-ink-900 overflow-hidden">
              {item.thumbnailUrl && (
                <Image src={item.thumbnailUrl} alt={item.title} fill className="object-contain p-1" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink-100 line-clamp-1">{item.title}</p>
              <p className="text-xs text-ink-400 font-mono">x{item.quantity}</p>
            </div>
            <p className="text-xs font-mono text-ink-200 shrink-0">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-ink-200">
          <span>Subtotal</span>
          <span className="font-mono">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-ink-200">
          <span>Portes</span>
          <span className="font-mono">{shippingCost === 0 ? 'Grátis' : formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between font-display font-bold text-ink-50 pt-2 border-t border-ink-700">
          <span>Total</span>
          <span className="font-mono text-cartridge-400">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
