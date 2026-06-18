import { createClient } from '@/lib/supabase/server';
import type { Product, Category, AttributeValue, ProductVariation } from '@/types';
import { getProductType, getProductBrand, type ProductTypeSlug, type BrandSlug } from '@/lib/taxonomy';

/**
 * Mapeia uma linha "crua" do Supabase (com joins aninhados) para o tipo Product
 * usado em toda a aplicação.
 */
function mapProductRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    short_description: row.short_description ?? '',
    product_type: row.product_type,
    sku: row.sku,
    regular_price: row.regular_price !== null ? Number(row.regular_price) : null,
    sale_price: row.sale_price !== null ? Number(row.sale_price) : null,
    price: Number(row.price),
    stock_quantity: row.stock_quantity,
    stock_status: row.stock_status,
    thumbnail_url: row.thumbnail_url,
    status: row.status,
    categories: (row.product_categories ?? []).map((pc: any) => pc.categories as Category).filter(Boolean),
    tags: (row.product_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
    attributes: (row.product_attribute_values ?? [])
      .map((pav: any) => {
        const av = pav.attribute_values;
        if (!av) return null;
        const result: AttributeValue = {
          id: av.id,
          slug: av.slug,
          name: av.name,
          attribute_slug: av.attributes?.slug ?? '',
          attribute_name: av.attributes?.name ?? '',
        };
        return result;
      })
      .filter(Boolean),
    images: (row.product_images ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => ({ id: img.id, url: img.url, sort_order: img.sort_order })),
    variations: (row.product_variations ?? []).map((v: any) => mapVariationRow(v)),
  };
}

function mapVariationRow(row: any): ProductVariation {
  return {
    id: row.id,
    title: row.title,
    sku: row.sku,
    price: Number(row.price),
    stock_quantity: row.stock_quantity,
    stock_status: row.stock_status,
    thumbnail_url: row.thumbnail_url,
    attributes: (row.variation_attribute_values ?? [])
      .map((vav: any) => {
        const av = vav.attribute_values;
        if (!av) return null;
        const result: AttributeValue = {
          id: av.id,
          slug: av.slug,
          name: av.name,
          attribute_slug: av.attributes?.slug ?? '',
          attribute_name: av.attributes?.name ?? '',
        };
        return result;
      })
      .filter(Boolean),
  };
}

const PRODUCT_SELECT = `
  *,
  product_categories ( categories ( id, slug, name, parent_id ) ),
  product_tags ( tags ( id, slug, name ) ),
  product_attribute_values ( attribute_values ( id, slug, name, attributes ( slug, name ) ) ),
  product_images ( id, url, sort_order ),
  product_variations (
    *,
    variation_attribute_values ( attribute_values ( id, slug, name, attributes ( slug, name ) ) )
  )
`;

export interface ProductFilters {
  /** Eixo 1: Jogos | Jogos Soltos | Consolas | Acessórios — ver src/lib/taxonomy.ts */
  productType?: ProductTypeSlug;
  /** Eixo 2: Playstation | Xbox | Nintendo | PC | Retro — ver src/lib/taxonomy.ts */
  brand?: BrandSlug;
  conditionSlug?: string; // pa_estado: novo/usado
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'title_asc';
  page?: number;
  perPage?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();
  const { page = 1, perPage = 24 } = filters;

  // Os filtros de Tipo de Produto e Marca dependem de relações N:N
  // (categorias, atributos) que não mapeiam de forma direta para uma
  // condição SQL simples — por isso buscamos TODOS os produtos publicados
  // que respeitam os filtros "planos" (preço, pesquisa) e só então filtramos
  // por tipo/marca em memória, e SÓ DEPOIS paginamos o resultado já filtrado.
  // (Anteriormente a paginação corria antes do filtro em memória, cortando
  // a lista de forma incorreta.)
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'publish');

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'title_asc':
      query = query.order('title', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao obter produtos:', error.message);
    return { products: [] as Product[], total: 0 };
  }

  let products = (data ?? []).map(mapProductRow);

  if (filters.productType) {
    products = products.filter(
      (p) => getProductType(p.categories.map((c) => c.slug)) === filters.productType
    );
  }
  if (filters.brand) {
    products = products.filter((p) => {
      const platformSlugs = p.attributes
        .filter((a) => a.attribute_slug === 'pa_plataforma')
        .map((a) => a.slug);
      return getProductBrand(p.categories.map((c) => c.slug), platformSlugs) === filters.brand;
    });
  }
  if (filters.conditionSlug) {
    products = products.filter((p) =>
      p.attributes.some((a) => a.attribute_slug === 'pa_estado' && a.slug === filters.conditionSlug)
    );
  }

  const total = products.length;
  const from = (page - 1) * perPage;
  products = products.slice(from, from + perPage);

  return { products, total };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('status', 'publish')
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao obter produto:', error.message);
    }
    return null;
  }

  return mapProductRow(data);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!product.categories.length) return [];
  const supabase = await createClient();
  const categoryId = product.categories[0].id;

  const { data, error } = await supabase
    .from('product_categories')
    .select('product_id')
    .eq('category_id', categoryId);

  if (error || !data) return [];

  const ids = data.map((r) => r.product_id).filter((id) => id !== product.id);
  if (!ids.length) return [];

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('id', ids.slice(0, limit * 2))
    .eq('status', 'publish')
    .limit(limit);

  if (prodError || !products) return [];
  return products.map(mapProductRow);
}

/**
 * Devolve uma amostra de produtos publicados para a secção "Recomendados".
 *
 * IMPORTANTE: a ordem é determinística (NÃO usa Math.random no servidor),
 * para o HTML gerado no servidor bater certo com o cliente e evitar erros de
 * hydration. O baralhamento "aleatório" é feito no cliente (ver
 * recommended-products.tsx). Mais tarde isto pode ser substituído por
 * recomendações baseadas no histórico do cliente (cookies) sem mudar a
 * assinatura.
 */
export async function getRandomProducts(limit = 12): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'publish')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('Erro ao obter produtos recomendados:', error?.message);
    return [];
  }

  return data.map(mapProductRow);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, parent_id')
    .order('name', { ascending: true });

  if (error || !data) {
    console.error('Erro ao obter categorias:', error?.message);
    return [];
  }
  return data;
}

export async function getPlatforms(): Promise<AttributeValue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attribute_values')
    .select('id, slug, name, attributes!inner(slug, name)')
    .eq('attributes.slug', 'pa_plataforma')
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    attribute_slug: row.attributes.slug,
    attribute_name: row.attributes.name,
  }));
}
