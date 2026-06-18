import { CheckoutForm } from '@/components/checkout/checkout-form';
import { CheckoutSummary } from '@/components/checkout/checkout-summary';

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-50 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <CheckoutForm />
        <CheckoutSummary />
      </div>
    </div>
  );
}
