'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'cantinho-visitados';
const MAX = 10;

export function RecentlyVisitedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      const next = [slug, ...stored.filter((s) => s !== slug)].slice(0, MAX);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, [slug]);

  return null;
}
