import { CartView } from '@/components/cart/cart-view';

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-50 mb-8">O teu carrinho</h1>
      <CartView />
    </div>
  );
}
