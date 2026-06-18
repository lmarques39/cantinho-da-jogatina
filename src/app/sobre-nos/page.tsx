import Image from 'next/image';

export const metadata = {
  title: 'Sobre Nós — Cantinho da Jogatina',
};

export default function SobreNosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 space-y-20">

      {/* ── Secção 1: Texto + imagem à direita ─────────────────────────── */}
      <section className="flex flex-col-reverse gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-5">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-50 leading-tight">
            Uma loja feita por <span className="text-cartridge-400">jogadores</span>, para jogadores.
          </h1>
          <p className="text-ink-300 leading-relaxed">
            O Cantinho da Jogatina nasceu da paixão pelo retro gaming e pela vontade de dar uma segunda
            vida a consolas e jogos que merecem continuar a ser jogados. Somos uma loja portuguesa,
            localizada em [Localidade], com atendimento personalizado e conhecimento aprofundado de cada
            produto que colocamos à venda.
          </p>
          <p className="text-ink-300 leading-relaxed">
            Cada consola é testada, cada jogo inspecionado e classificado com honestidade. Não vendemos
            o que não usaríamos nós próprios. Essa é a nossa promessa.
          </p>
        </div>
        <div className="lg:w-[420px] shrink-0">
          {/* Substitui /sobre-nos/foto-loja.jpg pela tua imagem real */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-cart border border-ink-700 bg-ink-800">
            <Image
              src="/sobre-nos/foto-loja.jpg"
              alt="Interior da loja Cantinho da Jogatina"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 420px, 100vw"
            />
          </div>
        </div>
      </section>

      {/* ── Secção 2: Duas imagens lado a lado ─────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-cart border border-ink-700 bg-ink-800">
            {/* Substitui pelo teu caminho real */}
            <Image
              src="/sobre-nos/foto-2.jpg"
              alt="Produtos em exposição"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-cart border border-ink-700 bg-ink-800">
            <Image
              src="/sobre-nos/foto-3.jpg"
              alt="Reparação de consolas"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* ── Secção 3: Mais texto + imagem à direita ─────────────────────── */}
      <section className="flex flex-col-reverse gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-50 leading-tight">
            Mais do que uma loja — um <span className="text-cartridge-400">serviço</span>.
          </h2>
          <p className="text-ink-300 leading-relaxed">
            Para além de comprar e vender, reparamos consolas e acessórios de todas as gerações.
            Desde um botão danificado a uma placa mãe a precisar de atenção, a nossa equipa trata de
            tudo com o cuidado que cada máquina merece.
          </p>
          <p className="text-ink-300 leading-relaxed">
            Também compramos coleções — seja um único jogo ou uma prateleira inteira. Contacta-nos
            e avaliamos sem compromisso.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/contactos"
              className="inline-flex items-center gap-2 rounded-cart bg-cartridge-400 px-5 py-2.5 text-sm font-bold text-ink-900 hover:bg-cartridge-300 transition-colors shadow-cart"
            >
              Fala connosco
            </a>
            <a
              href="/loja"
              className="inline-flex items-center gap-2 rounded-cart border border-ink-600 px-5 py-2.5 text-sm font-bold text-ink-100 hover:border-cartridge-400 hover:text-cartridge-400 transition-colors"
            >
              Ver loja
            </a>
          </div>
        </div>
        <div className="lg:w-[420px] shrink-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-cart border border-ink-700 bg-ink-800">
            <Image
              src="/sobre-nos/foto-reparacao.jpg"
              alt="Serviço de reparação de consolas"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 420px, 100vw"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
