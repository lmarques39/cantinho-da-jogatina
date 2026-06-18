'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';

declare global {
  interface Window {
    easypayCheckout?: {
      startCheckout: (
        manifest: unknown,
        options: {
          id?: string;
          display?: 'inline' | 'popup';
          language?: string;
          onSuccess?: (info: unknown) => void;
          onError?: (error: unknown) => void;
          onPaymentError?: (error: unknown) => void;
          onClose?: () => void;
        }
      ) => { unmount: () => void };
    };
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clear);

  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variationId: i.variationId,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
          customer: { name: form.name, email: form.email, phone: form.phone },
          shippingAddress: {
            street: form.street,
            postalCode: form.postalCode,
            city: form.city,
            country: 'Portugal',
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? 'Não foi possível processar o pedido.');
        setLoading(false);
        return;
      }

      setStep('payment');
      setLoading(false);

      // Aguarda o SDK estar disponível antes de iniciar o checkout
      const startWhenReady = () => {
        if (window.easypayCheckout) {
          window.easypayCheckout.startCheckout(result.manifest, {
            id: 'easypay-checkout-container',
            display: 'inline',
            language: 'pt_PT',
            onSuccess: () => {
              clearCart();
              router.push(`/checkout/sucesso?encomenda=${result.orderNumber}`);
            },
            onPaymentError: (err) => {
              console.error('Erro de pagamento recuperável:', err);
              setError('O pagamento não foi aceite. Podes tentar novamente.');
            },
            onError: (err) => {
              console.error('Erro irrecuperável no checkout:', err);
              setError('Ocorreu um erro no checkout. Recarrega a página e tenta novamente.');
            },
          });
        } else {
          setTimeout(startWhenReady, 200);
        }
      };
      startWhenReady();
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro de rede. Verifica a tua ligação e tenta novamente.');
      setLoading(false);
    }
  }

  return (
    <>
      {/* SDK de checkout da EasyPay — carregado apenas quando necessário */}
      <Script
        src="https://cdn.easypay.pt/checkout/v2/easypay-checkout.js"
        strategy="lazyOnload"
        onReady={() => setSdkReady(true)}
      />

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-50 mb-3">Dados de contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome completo" value={form.name} onChange={(v) => update('name', v)} required />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update('email', v)}
                required
              />
              <Field label="Telefone" value={form.phone} onChange={(v) => update('phone', v)} />
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-ink-50 mb-3">Endereço de entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Rua e número" value={form.street} onChange={(v) => update('street', v)} required />
              </div>
              <Field
                label="Código postal"
                value={form.postalCode}
                onChange={(v) => update('postalCode', v)}
                required
              />
              <Field label="Localidade" value={form.city} onChange={(v) => update('city', v)} required />
            </div>
          </div>

          {error && (
            <p className="rounded-cart border border-signal-500 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full rounded-cart bg-cartridge-400 px-6 py-3 font-display text-sm font-bold text-ink-900 hover:bg-cartridge-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'A processar...' : `Continuar para pagamento — ${formatPrice(totalPrice)}`}
          </button>
        </form>
      ) : (
        <div>
          <h2 className="font-display text-lg font-bold text-ink-50 mb-3">Pagamento</h2>
          {error && (
            <p className="mb-4 rounded-cart border border-signal-500 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
              {error}
            </p>
          )}
          {/* O SDK da EasyPay injeta o formulário de pagamento neste contentor */}
          <div id="easypay-checkout-container" className="rounded-cart bg-white p-1 min-h-[400px]" />
          {!sdkReady && (
            <p className="mt-3 text-sm text-ink-400">A carregar o formulário de pagamento seguro...</p>
          )}
        </div>
      )}
    </>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

function Field({ label, value, onChange, type = 'text', required }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-200 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-cart border border-ink-600 bg-ink-700 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-400 focus:border-cartridge-400"
      />
    </label>
  );
}
