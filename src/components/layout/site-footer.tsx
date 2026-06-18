import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-700 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-display text-lg font-bold text-cartridge-400">
              Cantinho<span className="text-ink-50">DaJogatina</span>
            </span>
            <p className="mt-3 text-sm text-ink-300 max-w-xs">
              Compra e vende jogos e consolas usadas com confiança. Do retro ao atual, para todas as
              plataformas.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-100">
              Loja
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-300">
              <li><Link href="/loja" className="hover:text-cartridge-400 transition-colors">Todos os produtos</Link></li>
              <li><Link href="/loja?tipo=jogos" className="hover:text-cartridge-400 transition-colors">Jogos</Link></li>
              <li><Link href="/loja?tipo=consolas" className="hover:text-cartridge-400 transition-colors">Consolas</Link></li>
              <li><Link href="/loja?tipo=acessorios" className="hover:text-cartridge-400 transition-colors">Acessórios</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-100">
              Apoio ao Cliente
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-300">
              <li><Link href="/contactos" className="hover:text-cartridge-400 transition-colors">Contactos</Link></li>
              <li><Link href="/politica-de-trocas-e-devolucoes" className="hover:text-cartridge-400 transition-colors">Trocas e Devoluções</Link></li>
              <li><Link href="/termos-e-condicoes" className="hover:text-cartridge-400 transition-colors">Termos e Condições</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-100">
              Empresa
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-300">
              <li><Link href="/sobre-nos" className="hover:text-cartridge-400 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/politica-de-privacidade" className="hover:text-cartridge-400 transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink-700 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-400">
          <p>© {new Date().getFullYear()} Cantinho da Jogatina. Todos os direitos reservados.</p>
          <p>Pagamentos processados com segurança via EasyPay</p>
        </div>
      </div>
    </footer>
  );
}
