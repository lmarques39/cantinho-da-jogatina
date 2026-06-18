'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserMenuProps {
  user: SupabaseUser | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-cart border border-ink-600 px-3 py-1.5 text-sm font-medium text-ink-200 hover:border-cartridge-400 hover:text-cartridge-400 transition-colors"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Utilizador';
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu do utilizador"
        className="flex items-center gap-1.5 rounded-cart p-1 text-ink-200 hover:text-cartridge-400 transition-colors"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} width={28} height={28} className="rounded-full h-7 w-7 object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cartridge-400 text-[11px] font-bold text-ink-900">
            {initials}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-cart border border-ink-700 bg-ink-800 shadow-cart z-50">
          <div className="border-b border-ink-700 px-4 py-3">
            <p className="text-sm font-semibold text-ink-50 truncate">{name}</p>
            <p className="text-xs text-ink-400 truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/conta"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-cart px-3 py-2 text-sm text-ink-200 hover:bg-ink-700 hover:text-cartridge-400 transition-colors"
            >
              <UserCircle className="h-4 w-4" />
              A minha conta
            </Link>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-cart px-3 py-2 text-sm text-ink-200 hover:bg-ink-700 hover:text-signal-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Terminar sessão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
