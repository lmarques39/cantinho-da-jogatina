'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError('Não foi possível actualizar a senha. O link pode ter expirado.');
    } else {
      setDone(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-cart border border-ink-700 bg-ink-800 p-7 shadow-cart">
          <h1 className="font-display text-xl font-bold text-ink-50 mb-1">Nova senha</h1>
          <p className="text-sm text-ink-300 mb-6">Define uma nova senha para a tua conta.</p>

          {error && (
            <div className="mb-4 rounded-cart border border-signal-500/60 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
              {error}
            </div>
          )}

          {done ? (
            <div className="rounded-cart border border-leaf-500/60 bg-leaf-500/10 px-4 py-3 text-sm text-leaf-400">
              Senha actualizada com sucesso! A redirecionar...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-cart border border-ink-600 bg-ink-900 px-3 py-2.5 pr-10 text-sm text-ink-50 placeholder:text-ink-500 outline-none focus:border-cartridge-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">
                  Confirmar senha
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repete a nova senha"
                  className="w-full rounded-cart border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-500 outline-none focus:border-cartridge-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-cart bg-cartridge-400 px-4 py-2.5 text-sm font-bold text-ink-900 hover:bg-cartridge-300 disabled:opacity-60 transition-colors shadow-cart"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar nova senha
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
