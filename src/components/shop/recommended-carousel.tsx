'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/product-card';

interface RecommendedCarouselProps {
  title: string;
  products: Product[];
  shuffle?: boolean;
  viewAllHref?: string;
}

export function RecommendedCarousel({
  title,
  products,
  shuffle = true,
  viewAllHref,
}: RecommendedCarouselProps) {
  // Começa com a ordem do servidor (estável) para o HTML inicial bater certo.
  // Só depois de montar no cliente é que baralha — assim não há hydration error.
  const [items, setItems] = useState(products);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shuffle) {
      setItems(products);
      return;
    }
    const shuffled = [...products];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
  }, [products, shuffle]);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-bold text-ink-50">{title}</h2>
        <div className="flex items-center gap-3">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-cartridge-400 hover:text-cartridge-300"
            >
              Ver tudo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              aria-label="Anterior"
              className="rounded-full border border-ink-600 p-2 text-ink-200 hover:border-cartridge-400 hover:text-cartridge-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Seguinte"
              className="rounded-full border border-ink-600 p-2 text-ink-200 hover:border-cartridge-400 hover:text-cartridge-400 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
      >
        {items.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[160px] sm:w-[200px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
