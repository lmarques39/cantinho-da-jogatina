-- =====================================================================
-- CANTINHO DA JOGATINA — Schema da base de dados (Supabase / Postgres)
-- =====================================================================
-- Como aplicar:
--   1. Cria um projeto em https://supabase.com
--   2. Vai a "SQL Editor" no painel do Supabase
--   3. Cola e corre este ficheiro completo (de uma vez)
-- =====================================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- CATEGORIAS (suporta hierarquia: ex. Videojogos -> Playstation)
-- ---------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  wp_term_id text, -- referência ao ID original do WordPress (útil na migração)
  slug text not null unique,
  name text not null,
  parent_id uuid references categories(id) on delete set null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_categories_parent on categories(parent_id);

-- ---------------------------------------------------------------------
-- TAGS (géneros, temas: Ação, Aventura, Retro, PS1...)
-- ---------------------------------------------------------------------
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  wp_term_id text,
  slug text not null unique,
  name text not null
);

-- ---------------------------------------------------------------------
-- ATRIBUTOS e VALORES (Plataforma, Estado, Grade, Tipo de Produto)
-- ---------------------------------------------------------------------
create table if not exists attributes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,   -- ex: 'pa_plataforma'
  name text not null           -- ex: 'Plataforma'
);

create table if not exists attribute_values (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references attributes(id) on delete cascade,
  wp_term_id text,
  slug text not null,          -- ex: 'ps1'
  name text not null,          -- ex: 'Playstation 1'
  unique(attribute_id, slug)
);

-- ---------------------------------------------------------------------
-- PRODUTOS
-- ---------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  wp_post_id text,              -- referência ao ID original do WordPress
  slug text not null unique,
  title text not null,
  description text default '',  -- conteúdo longo
  short_description text default '', -- excerto
  product_type text not null default 'simple', -- 'simple' | 'variable'
  sku text,
  regular_price numeric(10,2),
  sale_price numeric(10,2),
  price numeric(10,2) not null default 0, -- preço efetivo (já considera saldo)
  stock_quantity int not null default 0,
  manage_stock boolean not null default true,
  stock_status text not null default 'instock', -- 'instock' | 'outofstock'
  weight numeric(10,2),
  thumbnail_url text,
  status text not null default 'draft', -- 'publish' | 'draft'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_status on products(status);
create index if not exists idx_products_stock_status on products(stock_status);
create index if not exists idx_products_slug on products(slug);

-- Imagens adicionais (galeria) de um produto
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order int default 0
);

create index if not exists idx_product_images_product on product_images(product_id);

-- Relação produtos <-> categorias (N:N)
create table if not exists product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- Relação produtos <-> tags (N:N)
create table if not exists product_tags (
  product_id uuid not null references products(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- Relação produtos <-> valores de atributo (N:N) — ex: Plataforma=PS1, Estado=Usado
create table if not exists product_attribute_values (
  product_id uuid not null references products(id) on delete cascade,
  attribute_value_id uuid not null references attribute_values(id) on delete cascade,
  primary key (product_id, attribute_value_id)
);

-- ---------------------------------------------------------------------
-- VARIAÇÕES DE PRODUTO (ex: consola com Grade A / B / C)
-- ---------------------------------------------------------------------
create table if not exists product_variations (
  id uuid primary key default gen_random_uuid(),
  wp_post_id text,
  parent_product_id uuid not null references products(id) on delete cascade,
  title text not null,
  sku text,
  regular_price numeric(10,2),
  sale_price numeric(10,2),
  price numeric(10,2) not null default 0,
  stock_quantity int not null default 0,
  stock_status text not null default 'instock',
  thumbnail_url text,
  status text not null default 'publish',
  created_at timestamptz default now()
);

create index if not exists idx_variations_parent on product_variations(parent_product_id);

-- Atributos específicos de cada variação (ex: Grade = B)
create table if not exists variation_attribute_values (
  variation_id uuid not null references product_variations(id) on delete cascade,
  attribute_value_id uuid not null references attribute_values(id) on delete cascade,
  primary key (variation_id, attribute_value_id)
);

-- ---------------------------------------------------------------------
-- CLIENTES (perfis ligados ao Supabase Auth)
-- ---------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  nif text, -- número de identificação fiscal (opcional, para fatura)
  created_at timestamptz default now()
);

-- Endereços de entrega/faturação
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text default 'Principal',
  street text not null,
  postal_code text not null,
  city text not null,
  country text not null default 'Portugal',
  is_default boolean default false
);

-- ---------------------------------------------------------------------
-- ENCOMENDAS
-- ---------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique, -- número legível, ex: CDJ-2026-00001
  customer_id uuid references customers(id) on delete set null,
  guest_email text, -- para encomendas sem conta
  guest_name text,
  status text not null default 'pending',
  -- 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded'
  subtotal numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  shipping_address jsonb,
  billing_address jsonb,
  -- Integração EasyPay
  easypay_checkout_id text,
  easypay_payment_id text,
  easypay_payment_method text, -- 'cc' | 'mb' | 'mbw' | etc.
  payment_status text default 'unpaid', -- 'unpaid' | 'paid' | 'failed'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_easypay_checkout on orders(easypay_checkout_id);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variation_id uuid references product_variations(id) on delete set null,
  title_snapshot text not null,    -- nome do produto no momento da compra
  price_snapshot numeric(10,2) not null, -- preço no momento da compra
  quantity int not null default 1,
  line_total numeric(10,2) not null
);

create index if not exists idx_order_items_order on order_items(order_id);

-- ---------------------------------------------------------------------
-- PÁGINAS INSTITUCIONAIS (Sobre Nós, Políticas, Termos...)
-- ---------------------------------------------------------------------
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '', -- markdown ou HTML simples
  updated_at timestamptz default now()
);

-- =====================================================================
-- TRIGGERS — manter updated_at atualizado
-- =====================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================
alter table products enable row level security;
alter table product_images enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table attributes enable row level security;
alter table attribute_values enable row level security;
alter table product_categories enable row level security;
alter table product_tags enable row level security;
alter table product_attribute_values enable row level security;
alter table product_variations enable row level security;
alter table variation_attribute_values enable row level security;
alter table pages enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Leitura pública do catálogo (qualquer visitante pode ver produtos publicados)
create policy "Produtos publicados são visíveis a todos"
  on products for select
  using (status = 'publish');

create policy "Imagens de produtos visíveis a todos"
  on product_images for select using (true);

create policy "Categorias visíveis a todos"
  on categories for select using (true);

create policy "Tags visíveis a todos"
  on tags for select using (true);

create policy "Atributos visíveis a todos"
  on attributes for select using (true);

create policy "Valores de atributos visíveis a todos"
  on attribute_values for select using (true);

create policy "Relações produto-categoria visíveis a todos"
  on product_categories for select using (true);

create policy "Relações produto-tag visíveis a todos"
  on product_tags for select using (true);

create policy "Relações produto-atributo visíveis a todos"
  on product_attribute_values for select using (true);

create policy "Variações visíveis a todos"
  on product_variations for select using (status = 'publish');

create policy "Atributos de variação visíveis a todos"
  on variation_attribute_values for select using (true);

create policy "Páginas visíveis a todos"
  on pages for select using (true);

-- Clientes só veem os seus próprios dados
create policy "Clientes veem o seu próprio perfil"
  on customers for select using (auth.uid() = id);

create policy "Clientes atualizam o seu próprio perfil"
  on customers for update using (auth.uid() = id);

create policy "Clientes criam o seu próprio perfil"
  on customers for insert with check (auth.uid() = id);

-- Endereços só visíveis ao dono
create policy "Clientes veem os seus próprios endereços"
  on addresses for select using (
    customer_id = auth.uid()
  );

create policy "Clientes gerem os seus próprios endereços"
  on addresses for all using (
    customer_id = auth.uid()
  );

-- Encomendas: só o próprio cliente vê as suas; criação é feita via API com service role
create policy "Clientes veem as suas próprias encomendas"
  on orders for select using (
    customer_id = auth.uid()
  );

create policy "Items de encomenda visíveis ao dono da encomenda"
  on order_items for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );

-- NOTA: inserções/atualizações de produtos, encomendas (criação) e pagamentos
-- devem ser feitas a partir do backend (API routes do Next.js) usando a
-- "service role key" do Supabase, que ignora RLS. Nunca exponhas essa chave
-- no lado do cliente (browser).
