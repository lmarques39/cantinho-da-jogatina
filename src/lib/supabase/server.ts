import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para o servidor (Server Components, Route Handlers, Server Actions).
 * Usa a chave pública "anon" e propaga os cookies de sessão do utilizador.
 * Continua a respeitar as políticas RLS — não usar para operações privilegiadas.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // chamado de um Server Component sem permissão de escrita — ignorável
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // idem
          }
        },
      },
    }
  );
}

/**
 * Cliente Supabase com "service role" — ignora RLS por completo.
 * USAR APENAS em código de servidor de confiança (Route Handlers de API,
 * scripts de importação). NUNCA importar isto num Client Component ou
 * expor a chave SUPABASE_SERVICE_ROLE_KEY ao browser.
 */
export function createServiceRoleClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
