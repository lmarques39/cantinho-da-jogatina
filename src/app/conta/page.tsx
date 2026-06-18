'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Save, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface ProfileForm {
  nome: string;
  data_nascimento: string;
  telefone: string;
  nif: string;
  morada: string;
  codigo_postal: string;
  cidade: string;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">
        {label}
        {hint && <span className="ml-1 normal-case text-ink-500 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-cart border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-500 outline-none focus:border-cartridge-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export default function ContaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>({
    nome: '',
    data_nascimento: '',
    telefone: '',
    nif: '',
    morada: '',
    codigo_postal: '',
    cidade: '',
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/login?next=/conta');
        return;
      }
      const u = session.user;
      setUser(u);
      const m = u.user_metadata ?? {};
      setForm({
        nome: m.full_name ?? m.nome ?? '',
        data_nascimento: m.data_nascimento ?? '',
        telefone: m.telefone ?? '',
        nif: m.nif ?? '',
        morada: m.morada ?? '',
        codigo_postal: m.codigo_postal ?? '',
        cidade: m.cidade ?? '',
      });
      setLoading(false);
    });
  }, [router]);

  function set(key: keyof ProfileForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        nome: form.nome,
        full_name: form.nome,
        data_nascimento: form.data_nascimento,
        telefone: form.telefone,
        nif: form.nif,
        morada: form.morada,
        codigo_postal: form.codigo_postal,
        cidade: form.cidade,
      },
    });

    if (error) {
      setError('Não foi possível guardar. Tenta novamente.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cartridge-400" />
      </div>
    );
  }

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const isGoogle = user.app_metadata?.provider === 'google';

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Cabeçalho do perfil */}
      <div className="flex items-center gap-4 mb-8">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="rounded-full h-16 w-16 object-cover border-2 border-ink-700"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cartridge-400 text-2xl font-bold text-ink-900">
            {(form.nome || user.email || '?')[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-50">
            {form.nome || 'A minha conta'}
          </h1>
          <p className="text-sm text-ink-400">{user.email}</p>
          {isGoogle && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-ink-600 px-2 py-0.5 text-[11px] text-ink-400">
              <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </span>
          )}
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-cart border border-ink-700 bg-ink-800 p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-ink-100 border-b border-ink-700 pb-3">
            Dados pessoais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Nome completo">
                <input
                  type="text"
                  value={form.nome}
                  onChange={set('nome')}
                  placeholder="O teu nome"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Data de nascimento">
              <input
                type="date"
                value={form.data_nascimento}
                onChange={set('data_nascimento')}
                className={inputCls}
              />
            </Field>

            <Field label="NIF" hint="opcional">
              <input
                type="text"
                value={form.nif}
                onChange={set('nif')}
                placeholder="123456789"
                maxLength={9}
                className={inputCls}
              />
            </Field>

            <Field label="Telefone">
              <input
                type="tel"
                value={form.telefone}
                onChange={set('telefone')}
                placeholder="+351 9XX XXX XXX"
                className={inputCls}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-cart border border-ink-700 bg-ink-800 p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-ink-100 border-b border-ink-700 pb-3">
            Morada de entrega
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Morada" hint="rua, número, andar">
                <input
                  type="text"
                  value={form.morada}
                  onChange={set('morada')}
                  placeholder="Rua Exemplo, 123, 2º Dto"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Código postal">
              <input
                type="text"
                value={form.codigo_postal}
                onChange={set('codigo_postal')}
                placeholder="1234-567"
                maxLength={8}
                className={inputCls}
              />
            </Field>

            <Field label="Cidade">
              <input
                type="text"
                value={form.cidade}
                onChange={set('cidade')}
                placeholder="Lisboa"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="rounded-cart border border-signal-500/60 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-cart border border-leaf-500/60 bg-leaf-500/10 px-4 py-3 text-sm text-leaf-400">
            Perfil guardado com sucesso.
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 rounded-cart border border-ink-600 px-4 py-2.5 text-sm font-medium text-ink-300 hover:border-signal-400 hover:text-signal-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Terminar sessão
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-cart bg-cartridge-400 px-6 py-2.5 text-sm font-bold text-ink-900 hover:bg-cartridge-300 disabled:opacity-60 transition-colors shadow-cart"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
