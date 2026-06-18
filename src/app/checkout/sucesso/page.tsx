import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{ encomenda?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { encomenda } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-leaf-400" />
      <h1 className="mt-6 font-display text-3xl font-bold text-ink-50">Encomenda confirmada!</h1>
      <p className="mt-3 text-ink-200">
        {encomenda
          ? `A tua encomenda ${encomenda} foi recebida com sucesso.`
          : 'A tua encomenda foi recebida com sucesso.'}{' '}
        Vais receber um email de confirmação em breve.
      </p>
      <Link
        href="/loja"
        className="mt-8 inline-flex items-center gap-2 rounded-cart bg-cartridge-400 px-6 py-3 font-display text-sm font-bold text-ink-900 hover:bg-cartridge-300 transition-colors"
      >
        Continuar a explorar
      </Link>
    </div>
  );
}
