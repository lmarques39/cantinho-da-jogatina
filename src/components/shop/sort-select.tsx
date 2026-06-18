'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Preço: mais baixo' },
  { value: 'price_desc', label: 'Preço: mais alto' },
  { value: 'title_asc', label: 'Nome A-Z' },
] as const;

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(newSort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('ordenar', newSort);
    params.delete('pagina'); // muda a ordenação, volta à primeira página
    router.push(`/loja?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-ink-300">
      <span className="hidden sm:inline">Ordenar por</span>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-cart border border-ink-600 bg-ink-700 px-3 py-2 text-sm text-ink-50 cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
