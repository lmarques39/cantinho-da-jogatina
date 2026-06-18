'use client';

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

function SearchBarInner() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) {
      params.set('pesquisa', trimmed);
    } else {
      params.delete('pesquisa');
    }
    params.delete('pagina');
    const qs = params.toString();
    router.push(`/loja${qs ? `?${qs}` : ''}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1.5 rounded-cart border border-ink-600 bg-ink-700 px-2.5 py-1.5 transition-colors"
    >
      <Search className="h-4 w-4 text-ink-400 shrink-0" aria-hidden />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Procurar..."
        aria-label="Procurar produtos"
        className="w-28 sm:w-44 lg:w-56 bg-transparent text-sm text-ink-50 placeholder:text-ink-400 outline-none focus:outline-none ring-0 focus:ring-0 border-0"
      />
    </form>
  );
}

// Suspense obrigatório: useSearchParams() causa falha no build estático
// se não estiver dentro de um boundary (ex: renderização do 404).
export function SearchBar() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-1.5 rounded-cart border border-ink-600 bg-ink-700 px-2.5 py-1.5">
        <Search className="h-4 w-4 text-ink-400 shrink-0" aria-hidden />
        <div className="w-28 sm:w-44 lg:w-56 h-4" />
      </div>
    }>
      <SearchBarInner />
    </Suspense>
  );
}
