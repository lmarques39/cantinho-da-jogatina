'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import type { Product } from '@/types';

interface ProductGridProps {
  initialProducts: Product[];
  total: number;
  perPage: number;
}

export function ProductGrid({ initialProducts, total, perPage }: ProductGridProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const hasMore = products.length < total;

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set('pagina', String(nextPage));

    try {
      const res = await fetch(`/api/produtos?${params.toString()}`);
      const data = await res.json();
      setProducts((prev) => [...prev, ...data.products]);
      setPage(nextPage);
    } catch {
      // silenciosamente falha; o botão continua disponível para nova tentativa
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-cart border border-cartridge-400 px-6 py-2.5 text-sm font-semibold text-cartridge-400 hover:bg-cartridge-400 hover:text-ink-900 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A carregar...
              </>
            ) : (
              `Carregar mais (${products.length} de ${total})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
