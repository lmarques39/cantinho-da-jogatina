'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { RecommendedCarousel } from '@/components/shop/recommended-carousel';

const STORAGE_KEY = 'cantinho-visitados';

interface RecentlyVisitedProps {
  /** Slug da página atual — excluído do carousel para não mostrar o produto que estás a ver */
  currentSlug?: string;
  sectionClassName?: string;
}

export function RecentlyVisited({ currentSlug, sectionClassName }: RecentlyVisitedProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      const slugs = stored.filter((s) => s !== currentSlug).slice(0, 8);
      if (!slugs.length) return;

      fetch(`/api/produtos/recentes?slugs=${slugs.join(',')}`)
        .then((r) => r.json())
        .then(({ products }) => { if (Array.isArray(products)) setProducts(products); })
        .catch(() => {});
    } catch {}
  }, [currentSlug]);

  if (!products.length) return null;

  return (
    <RecommendedCarousel
      title="Vistos recentemente"
      products={products}
      shuffle={false}
      sectionClassName={sectionClassName}
    />
  );
}
