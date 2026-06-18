# Cantinho da Jogatina — Loja Online

Site de e-commerce em Next.js para a loja de jogos e consolas retro/usados
"Cantinho da Jogatina", migrado a partir do WordPress/WooCommerce original.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 3
- **Supabase** (Postgres + Auth) para produtos, encomendas e clientes
- **EasyPay** para pagamentos (Multibanco, MB WAY, cartão)
- **Zustand** para o estado do carrinho (persistido no browser)

> **Nota sobre versões:** este projeto foi atualizado para Next.js 16.2.9 e
> React 19, depois de o Next.js 14 ter atingido fim de vida (EOL, outubro de
> 2025) e deixado de receber patches de segurança. Se vires avisos de
> vulnerabilidade no `npm install`, corre `npm audit` e considera atualizar
> para a versão mais recente disponível — `npm install next@latest`.

## 1. Pré-requisitos

- Node.js 20.9 ou superior (exigido pelo Next.js 16)
- Uma conta gratuita em [supabase.com](https://supabase.com)
- Uma conta EasyPay (já tens, segundo me disseste) com credenciais de API

## 2. Instalação

```bash
npm install
```

## 3. Configurar o Supabase

1. Cria um novo projeto em [supabase.com](https://supabase.com) (gratuito para começar)
2. No painel do projeto, vai a **SQL Editor**
3. Cola e corre o conteúdo completo de `supabase/migrations/0001_initial_schema.sql`
   — isto cria todas as tabelas, relações e políticas de segurança (RLS)
4. Vai a **Project Settings → API** e copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, nunca exposta ao browser)

## 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edita `.env.local` e preenche com os valores do Supabase e da EasyPay.

## 5. Importar os dados do WordPress

O ficheiro `scripts/wordpress-export.json` já contém os 195 produtos, categorias,
tags e atributos extraídos do export WordPress original. Para os importar para
o Supabase:

```bash
npm run import:wordpress
```

**Nota sobre imagens:** os produtos importados apontam para os URLs antigos
(`cantinhodajogatina.shop/wp-content/uploads/...`). Isto funciona como
placeholder imediato, mas o domínio antigo pode deixar de existir no futuro.
Quando exportares as imagens reais:

1. Faz upload para o **Supabase Storage** (cria um bucket público `product-images`)
2. Corre um `UPDATE` em massa nas tabelas `products`, `product_images` e
   `product_variations` a substituir o prefixo do URL antigo pelo novo

## 6. Configurar a EasyPay

1. As credenciais (`AccountId`, `ApiKey`) ficam em `.env.local`
2. Define `EASYPAY_ENV=test` enquanto testas (sandbox, sem dinheiro real) e
   muda para `EASYPAY_ENV=prod` quando estiveres pronto para vender de verdade
3. No painel da EasyPay, configura o **Webhook** para apontar para:
   `https://o-teu-dominio.pt/api/webhooks/easypay`
   (isto garante que o estado do pagamento é confirmado no servidor)

## 7. Correr em desenvolvimento

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 8. Deploy

Recomendado: [Vercel](https://vercel.com) (criadores do Next.js, integração trivial).

1. Faz push deste projeto para um repositório Git (GitHub/GitLab)
2. Importa o repositório em Vercel
3. Configura as mesmas variáveis de ambiente do `.env.local` no painel da Vercel
4. Deploy automático a cada push

## Estrutura do projeto

```
src/
  app/                    Páginas (App Router) e API routes
    api/checkout/         Cria encomendas + sessão EasyPay
    api/webhooks/easypay/ Confirma pagamentos no servidor
    loja/                 Catálogo com filtros
    produto/[slug]/       Página de produto individual
    carrinho/, checkout/  Fluxo de compra
  components/
    layout/               Header, footer
    product/               Cartão de produto, selo de estado, add-to-cart
    shop/                  Filtros da loja
    cart/, checkout/       Carrinho e checkout
  lib/
    supabase/              Clientes Supabase (browser, servidor, service role)
    data/products.ts       Queries de produtos/categorias
    easypay/client.ts      Integração com a API EasyPay
    store/cart.ts           Estado do carrinho (Zustand)
supabase/migrations/        Schema SQL
scripts/
  wordpress-export.json     Dados extraídos do WordPress original
  import-wordpress-data.ts  Script de importação para o Supabase
```

## Notas sobre a migração

- **195 produtos** importados (171 publicados, 24 em rascunho — revê estes antes
  de os publicares)
- **2 produtos variáveis** (consolas com Grade A/B/C) com as respetivas variações
- **23 categorias** hierárquicas (Videojogos → Playstation/Xbox/Nintendo, etc.)
- As páginas institucionais (Sobre Nós, Contactos, Políticas) foram construídas em
  Elementor no WordPress original — o texto foi extraído e limpo de HTML, mas
  vale a pena reveres e ajustares o conteúdo na tabela `pages` do Supabase
- O método de pagamento "EasyPay" referido nos metadados do WooCommerce original
  foi mantido como gateway de pagamento principal neste novo site

## Próximos passos sugeridos

- [ ] Rever e publicar os 24 produtos em rascunho (ou confirmar que devem
      continuar por publicar)
- [ ] Substituir os URLs de imagem antigos pelas imagens reais no Supabase Storage
- [ ] Obter e configurar as credenciais EasyPay de produção
- [ ] Ligar o formulário de Contactos a um serviço de email (Resend, SendGrid)
- [ ] Implementar autenticação de cliente (Supabase Auth) para histórico de
      encomendas — o schema já tem as tabelas `customers` e `addresses` prontas
- [ ] Adicionar página de gestão administrativa (ou usar o painel do Supabase
      diretamente para gerir produtos/stock no início)
