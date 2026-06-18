import Link from 'next/link';
import { getProducts } from '@/lib/data/products';
import { RecommendedProducts } from '@/components/shop/recommended-products';
import { RecommendedCarousel } from '@/components/shop/recommended-carousel';
import { PromoBanner } from '@/components/layout/promo-banner';

export default async function HomePage() {
  const { products: featured } = await getProducts({ sort: 'newest', perPage: 12 });

  return (
    <div>
      {/* Banner principal rotativo (inclui o hero da marca como 1º slide) */}
      <PromoBanner />

      {/* Categorias rápidas — cores alternadas branco / verde */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Jogos', href: '/loja?tipo=jogos', accent: false },
            { label: 'Consolas', href: '/loja?tipo=consolas', accent: true },
            { label: 'Jogos Soltos', href: '/loja?tipo=jogos-soltos', accent: false },
            { label: 'Acessórios', href: '/loja?tipo=acessorios', accent: true },
          ].map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`rounded-cart border px-4 py-6 text-center font-display font-semibold transition-colors ${
                cat.accent
                  ? 'border-leaf-500/30 bg-leaf-500/15 text-leaf-400 hover:bg-leaf-500/25 hover:text-leaf-400'
                  : 'border-ink-700 bg-ink-800 text-ink-100 hover:border-cartridge-400 hover:text-cartridge-400'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Produtos recentes */}
      {featured.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-display text-2xl font-bold text-ink-50 mb-6">Chegou agora</h2>
          <p className="text-ink-300 text-sm">
            Ainda sem produtos publicados — liga a base de dados Supabase e corre o script de
            importação para veres o catálogo aqui.
          </p>
        </section>
      ) : (
        <RecommendedCarousel title="Chegou agora" products={featured} shuffle={false} viewAllHref="/loja" />
      )}

      <RecommendedProducts />

      {/* Faixa de confiança */}
      <section className="border-t border-ink-700 bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-display text-lg font-bold text-cartridge-400">Estado verificado</p>
            <p className="mt-1 text-sm text-ink-300">Cada produto testado e classificado antes da venda</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-cartridge-400">Reparações</p>
            <p className="mt-1 text-sm text-ink-300">A tua consola com problemas? Nós resolvemos</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-cartridge-400">Vende-nos o teu jogo</p>
            <p className="mt-1 text-sm text-ink-300">Aquele jogo na estante vale mais do que pensas</p>
          </div>
        </div>
      </section>
    </div>
  );
}
