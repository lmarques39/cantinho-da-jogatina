'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { cn } from '@/lib/utils';
import { SearchBar } from './search-bar';
import { ThemeToggle } from './theme-toggle';
import { HeaderAuth } from './header-auth';

const NAV_LINKS = [
  { href: '/loja', label: 'Loja' },
  { href: '/loja?tipo=jogos', label: 'Jogos' },
  { href: '/loja?tipo=consolas', label: 'Consolas' },
  { href: '/loja?tipo=acessorios', label: 'Acessórios' },
  { href: '/sobre-nos', label: 'Sobre Nós' },
  { href: '/contactos', label: 'Contactos' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  // O carrinho é lido do localStorage — só existe no cliente.
  // Sem este guard, o servidor renderiza 0 itens e o cliente renderiza N,
  // causando hydration mismatch.
  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700 bg-ink-800/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="Cantinho da Jogatina"
              width={160}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-ink-200 hover:text-cartridge-400 transition-colors rounded-cart"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <SearchBar />
            <ThemeToggle />
            <HeaderAuth />
            <Link
              href="/carrinho"
              aria-label="Carrinho de compras"
              className="relative p-2 text-ink-200 hover:text-cartridge-400 transition-colors rounded-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-signal-500 px-1 text-[10px] font-bold text-ink-50 font-mono">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="lg:hidden p-2 text-ink-200 hover:text-cartridge-400 transition-colors rounded-cart"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden flex flex-col gap-1 pb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'px-3 py-2.5 text-sm font-medium text-ink-200 hover:text-cartridge-400 hover:bg-ink-700 transition-colors rounded-cart'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
