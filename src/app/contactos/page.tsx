import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-50 mb-2">Contactos</h1>
      <p className="text-ink-300 mb-10">
        A tua consola está a dar tilt? Tens um jogo para vender? Fala connosco.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-cartridge-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-ink-50">Email</p>
              <p className="text-ink-300 text-sm">geral@cantinhodajogatina.shop</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-cartridge-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-ink-50">Telefone</p>
              <p className="text-ink-300 text-sm">Disponível em horário comercial</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-cartridge-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-ink-50">Localização</p>
              <p className="text-ink-300 text-sm">Portugal</p>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-ink-200 mb-1.5">Nome</span>
            <input
              type="text"
              required
              className="w-full rounded-cart border border-ink-600 bg-ink-700 px-3 py-2.5 text-sm text-ink-50 focus:border-cartridge-400"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-ink-200 mb-1.5">Email</span>
            <input
              type="email"
              required
              className="w-full rounded-cart border border-ink-600 bg-ink-700 px-3 py-2.5 text-sm text-ink-50 focus:border-cartridge-400"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-ink-200 mb-1.5">Mensagem</span>
            <textarea
              required
              rows={5}
              className="w-full rounded-cart border border-ink-600 bg-ink-700 px-3 py-2.5 text-sm text-ink-50 focus:border-cartridge-400"
            />
          </label>
          <button
            type="submit"
            className="rounded-cart bg-cartridge-400 px-6 py-3 font-display text-sm font-bold text-ink-900 hover:bg-cartridge-300 transition-colors"
          >
            Enviar mensagem
          </button>
          <p className="text-xs text-ink-400">
            Nota: este formulário ainda precisa de ser ligado a um serviço de envio de email (ex: Resend,
            SendGrid) ou a uma tabela de mensagens na base de dados.
          </p>
        </form>
      </div>
    </div>
  );
}
