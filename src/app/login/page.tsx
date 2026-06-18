'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register' | 'forgot';

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email ou senha incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Confirma o teu email antes de entrar. Verifica a caixa de entrada.';
  if (msg.includes('User already registered')) return 'Este email já tem conta. Usa a opção "Entrar".';
  if (msg.includes('Password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.';
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Muitas tentativas. Aguarda uns minutos.';
  if (msg.includes('over_email_send_rate_limit')) return 'Demasiados emails enviados. Aguarda antes de tentar novamente.';
  return 'Ocorreu um erro. Tenta novamente.';
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        router.push('/');
        router.refresh();
        return;
      }

    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(translateError(error.message));
      } else {
        setSuccess('Confirma o teu email para activar a conta. Verifica a tua caixa de entrada (e o spam).');
      }

    } else {
      // forgot password
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });
      if (error) {
        setError(translateError(error.message));
      } else {
        setSuccess('Enviámos um link para redefinires a senha. Verifica o teu email.');
      }
    }

    setLoading(false);
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    // redirectTo deve ser EXACTAMENTE o URL registado no Supabase Dashboard
    // Não adicionar query params aqui — causam falha de validação no Supabase
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-cart border border-ink-700 bg-ink-800 shadow-cart overflow-hidden">

          {/* Tabs Login / Criar conta */}
          {!isForgot && (
            <div className="flex border-b border-ink-700">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    'flex-1 py-3 text-sm font-semibold transition-colors',
                    mode === m
                      ? 'text-cartridge-400 border-b-2 border-cartridge-400 -mb-px bg-ink-800'
                      : 'text-ink-400 hover:text-ink-200 bg-ink-900'
                  )}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>
          )}

          <div className="p-7">
            {isForgot && (
              <div className="mb-5">
                <button
                  onClick={() => switchMode('login')}
                  className="text-xs text-ink-400 hover:text-cartridge-400 transition-colors"
                >
                  ← Voltar ao login
                </button>
                <h2 className="font-display text-xl font-bold text-ink-50 mt-3">
                  Recuperar senha
                </h2>
                <p className="text-sm text-ink-300 mt-1">
                  Enviamos um link para o teu email.
                </p>
              </div>
            )}

            {/* Mensagens de feedback */}
            {error && (
              <div className="mb-4 rounded-cart border border-signal-500/60 bg-signal-500/10 px-4 py-3 text-sm text-signal-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-cart border border-leaf-500/60 bg-leaf-500/10 px-4 py-3 text-sm text-leaf-400">
                {success}
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="o-teu@email.com"
                  className="w-full rounded-cart border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-500 outline-none focus:border-cartridge-400 transition-colors"
                />
              </div>

              {!isForgot && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      placeholder={isRegister ? 'Mínimo 6 caracteres' : '••••••••'}
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
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="mt-1.5 text-xs text-ink-400 hover:text-cartridge-400 transition-colors"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-cart bg-cartridge-400 px-4 py-2.5 text-sm font-bold text-ink-900 hover:bg-cartridge-300 disabled:opacity-60 transition-colors shadow-cart"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLogin ? 'Entrar' : isRegister ? 'Criar conta' : 'Enviar link'}
              </button>
            </form>

            {/* Divider Google */}
            {!isForgot && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <div className="flex-1 border-t border-ink-700" />
                  <span className="text-xs text-ink-500">ou</span>
                  <div className="flex-1 border-t border-ink-700" />
                </div>

                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-3 rounded-cart border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm font-semibold text-ink-200 hover:border-cartridge-400 hover:text-cartridge-400 transition-colors"
                >
                  {/* Ícone SVG do Google */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </button>
              </>
            )}

            <p className="mt-5 text-center text-xs text-ink-500">
              Ao entrares, aceitas os nossos{' '}
              <a href="/termos-e-condicoes" className="underline hover:text-cartridge-400">
                Termos
              </a>{' '}
              e a{' '}
              <a href="/politica-de-privacidade" className="underline hover:text-cartridge-400">
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
