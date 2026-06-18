'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/loja?pesquisa=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1.5 rounded-cart border border-ink-600 bg-ink-700 px-2.5 py-1.5 focus-within:border-cartridge-400 transition-colors"
    >
      <Search className="h-4 w-4 text-ink-400 shrink-0" aria-hidden />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Procurar..."
        aria-label="Procurar produtos"
        className="w-28 sm:w-44 lg:w-56 bg-transparent text-sm text-ink-50 placeholder:text-ink-400 outline-none"
      />
    </form>
  );
}
