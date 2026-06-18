/**
 * Script de importação: lê scripts/wordpress-export.json (já extraído do
 * ficheiro WXR original) e povoa a base de dados Supabase com categorias,
 * tags, atributos, produtos e variações.
 *
 * Como correr:
 *   1. Configura .env.local com NEXT_PUBLIC_SUPABASE_URL e
 *      SUPABASE_SERVICE_ROLE_KEY (a service role key, não a anon key)
 *   2. Garante que já correste o schema em supabase/migrations/0001_initial_schema.sql
 *   3. npm run import:wordpress
 *
 * Nota sobre imagens: os URLs importados apontam ainda para o domínio
 * antigo (cantinhodajogatina.shop/wp-content/uploads/...). Quando tiveres
 * as imagens exportadas, basta fazer upload para o Supabase Storage e
 * correr um UPDATE em massa nas tabelas products/product_images/
 * product_variations a substituir o prefixo do URL.
 */
import { config } from 'dotenv';
import path from 'node:path';

// dotenv/config por defeito só lê um ficheiro chamado ".env" — como este
// projeto segue a convenção do Next.js e usa ".env.local", carregamo-lo
// explicitamente aqui.
config({ path: path.join(__dirname, '..', '.env.local') });

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Erro: define NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local antes de correr este script.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------
// Tipos do ficheiro de export (formato gerado pelo extrator do WXR)
// ---------------------------------------------------------------------
interface WpTerm {
  id: string;
  taxonomy: string;
  slug: string;
  parent: string;
  name: string;
}

interface WpCategoryRef {
  slug: string;
  name: string;
}

interface WpProduct {
  id: string;
  title: string;
  slug: string;
  status: string;
  link: string;
  post_parent: string;
  product_type: string;
  excerpt: string;
  content: string;
  categories: WpCategoryRef[];
  tags: WpCategoryRef[];
  attribute_terms: Record<string, WpCategoryRef[]>;
  thumbnail_url: string | null;
  gallery_urls: (string | null)[];
  regular_price: string | null;
  sale_price: string | null;
  price: string | null;
  sku: string | null;
  stock: string | null;
  stock_status: string;
  manage_stock: string;
  weight: string | null;
  variation_attributes: Record<string, string>;
}

interface ExportData {
  products: WpProduct[];
  variations: WpProduct[];
  pages: { id: string; title: string; slug: string; status: string; content: string }[];
  terms_by_taxonomy: Record<string, WpTerm[]>;
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  pa_plataforma: 'Plataforma',
  pa_estado: 'Estado',
  pa_grade: 'Grade',
  'pa_tipo-produto': 'Tipo de Produto',
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumber(val: string | null): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const dataPath = path.join(__dirname, 'wordpress-export.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data: ExportData = JSON.parse(raw);

  console.log(`A importar ${data.products.length} produtos e ${data.variations.length} variações...`);

  // -------------------------------------------------------------
  // 1. CATEGORIAS (product_cat) — duas passagens para resolver parent_id
  // -------------------------------------------------------------
  const categoryTerms = data.terms_by_taxonomy['product_cat'] || [];
  const categorySlugToId = new Map<string, string>();

  for (const term of categoryTerms) {
    const { data: inserted, error } = await supabase
      .from('categories')
      .upsert(
        { wp_term_id: term.id, slug: term.slug, name: term.name },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single();

    if (error) {
      console.error(`Erro ao inserir categoria ${term.slug}:`, error.message);
      continue;
    }
    categorySlugToId.set(term.slug, inserted.id);
  }

  // segunda passagem: definir parent_id usando o slug do termo pai
  const termIdToSlug = new Map(categoryTerms.map((t) => [t.id, t.slug]));
  for (const term of categoryTerms) {
    if (!term.parent) continue;
    const parentSlug = termIdToSlug.get(term.parent);
    if (!parentSlug) continue;
    const parentId = categorySlugToId.get(parentSlug);
    const childId = categorySlugToId.get(term.slug);
    if (!parentId || !childId) continue;

    await supabase.from('categories').update({ parent_id: parentId }).eq('id', childId);
  }
  console.log(`Categorias importadas: ${categorySlugToId.size}`);

  // -------------------------------------------------------------
  // 2. TAGS (product_tag)
  // -------------------------------------------------------------
  const tagTerms = data.terms_by_taxonomy['product_tag'] || [];
  const tagSlugToId = new Map<string, string>();

  for (const term of tagTerms) {
    const { data: inserted, error } = await supabase
      .from('tags')
      .upsert({ wp_term_id: term.id, slug: term.slug, name: term.name }, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) {
      console.error(`Erro ao inserir tag ${term.slug}:`, error.message);
      continue;
    }
    tagSlugToId.set(term.slug, inserted.id);
  }
  console.log(`Tags importadas: ${tagSlugToId.size}`);

  // -------------------------------------------------------------
  // 3. ATRIBUTOS + VALORES (pa_plataforma, pa_estado, pa_grade, pa_tipo-produto)
  // -------------------------------------------------------------
  const attributeValueKeyToId = new Map<string, string>(); // `${attrSlug}:${valueSlug}` -> id

  for (const [attrSlug, label] of Object.entries(ATTRIBUTE_LABELS)) {
    const { data: attrRow, error: attrError } = await supabase
      .from('attributes')
      .upsert({ slug: attrSlug, name: label }, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (attrError) {
      console.error(`Erro ao inserir atributo ${attrSlug}:`, attrError.message);
      continue;
    }

    const terms = data.terms_by_taxonomy[attrSlug] || [];
    for (const term of terms) {
      const { data: valRow, error: valError } = await supabase
        .from('attribute_values')
        .upsert(
          { attribute_id: attrRow.id, wp_term_id: term.id, slug: term.slug, name: term.name },
          { onConflict: 'attribute_id,slug' }
        )
        .select('id, slug')
        .single();

      if (valError) {
        console.error(`Erro ao inserir valor de atributo ${attrSlug}:${term.slug}:`, valError.message);
        continue;
      }
      attributeValueKeyToId.set(`${attrSlug}:${term.slug}`, valRow.id);
    }
  }
  console.log(`Valores de atributo importados: ${attributeValueKeyToId.size}`);

  // -------------------------------------------------------------
  // 4. PRODUTOS
  // -------------------------------------------------------------
  const productWpIdToId = new Map<string, string>();

  for (const p of data.products) {
    const price = toNumber(p.price) ?? toNumber(p.regular_price) ?? 0;

    const { data: inserted, error } = await supabase
      .from('products')
      .upsert(
        {
          wp_post_id: p.id,
          slug: p.slug,
          title: p.title,
          description: stripHtml(p.content || p.excerpt || ''),
          short_description: stripHtml(p.excerpt || ''),
          product_type: p.product_type === 'variable' ? 'variable' : 'simple',
          sku: p.sku,
          regular_price: toNumber(p.regular_price),
          sale_price: toNumber(p.sale_price),
          price,
          stock_quantity: Math.round(toNumber(p.stock) ?? 0),
          manage_stock: p.manage_stock === 'yes',
          stock_status: p.stock_status === 'outofstock' ? 'outofstock' : 'instock',
          weight: toNumber(p.weight),
          thumbnail_url: p.thumbnail_url,
          status: p.status === 'publish' ? 'publish' : 'draft',
        },
        { onConflict: 'slug' }
      )
      .select('id, wp_post_id')
      .single();

    if (error) {
      console.error(`Erro ao inserir produto ${p.slug}:`, error.message);
      continue;
    }
    productWpIdToId.set(p.id, inserted.id);

    // Galeria de imagens
    if (p.gallery_urls?.length) {
      const galleryRows = p.gallery_urls
        .filter((url): url is string => !!url)
        .map((url, idx) => ({ product_id: inserted.id, url, sort_order: idx }));
      if (galleryRows.length) {
        await supabase.from('product_images').delete().eq('product_id', inserted.id);
        await supabase.from('product_images').insert(galleryRows);
      }
    }

    // Categorias do produto
    const catIds = p.categories
      .map((c) => categorySlugToId.get(c.slug))
      .filter((id): id is string => !!id);
    if (catIds.length) {
      await supabase.from('product_categories').delete().eq('product_id', inserted.id);
      await supabase
        .from('product_categories')
        .insert(catIds.map((category_id) => ({ product_id: inserted.id, category_id })));
    }

    // Tags do produto
    const tagIds = p.tags
      .map((t) => tagSlugToId.get(t.slug))
      .filter((id): id is string => !!id);
    if (tagIds.length) {
      await supabase.from('product_tags').delete().eq('product_id', inserted.id);
      await supabase
        .from('product_tags')
        .insert(tagIds.map((tag_id) => ({ product_id: inserted.id, tag_id })));
    }

    // Atributos do produto (Plataforma, Estado, Tipo de Produto)
    const attrValueIds: string[] = [];
    for (const [attrSlug, values] of Object.entries(p.attribute_terms || {})) {
      for (const v of values) {
        const key = `${attrSlug}:${v.slug}`;
        const id = attributeValueKeyToId.get(key);
        if (id) attrValueIds.push(id);
      }
    }
    if (attrValueIds.length) {
      await supabase.from('product_attribute_values').delete().eq('product_id', inserted.id);
      await supabase
        .from('product_attribute_values')
        .insert(attrValueIds.map((attribute_value_id) => ({ product_id: inserted.id, attribute_value_id })));
    }
  }
  console.log(`Produtos importados: ${productWpIdToId.size}`);

  // -------------------------------------------------------------
  // 5. VARIAÇÕES (ex: Nintendo 64 Ice Azul - Grade A/B/C)
  // -------------------------------------------------------------
  let variationCount = 0;
  for (const v of data.variations) {
    const parentId = productWpIdToId.get(v.post_parent);
    if (!parentId) {
      console.warn(`Variação ${v.slug} sem produto pai encontrado (wp_post_id ${v.post_parent}), a ignorar.`);
      continue;
    }

    const price = toNumber(v.price) ?? toNumber(v.regular_price) ?? 0;

    const { data: insertedVar, error } = await supabase
      .from('product_variations')
      .upsert(
        {
          wp_post_id: v.id,
          parent_product_id: parentId,
          title: v.title,
          sku: v.sku,
          regular_price: toNumber(v.regular_price),
          sale_price: toNumber(v.sale_price),
          price,
          stock_quantity: Math.round(toNumber(v.stock) ?? 0),
          stock_status: v.stock_status === 'outofstock' ? 'outofstock' : 'instock',
          thumbnail_url: v.thumbnail_url,
          status: v.status === 'publish' ? 'publish' : 'draft',
        },
        { onConflict: 'wp_post_id' }
      )
      .select('id')
      .single();

    if (error) {
      console.error(`Erro ao inserir variação ${v.slug}:`, error.message);
      continue;
    }

    // Atributos da variação (ex: attribute_pa_grade=grade-b)
    const attrValueIds: string[] = [];
    for (const [metaKey, valueSlug] of Object.entries(v.variation_attributes || {})) {
      const attrSlug = metaKey.replace('attribute_', '');
      const key = `${attrSlug}:${valueSlug}`;
      const id = attributeValueKeyToId.get(key);
      if (id) attrValueIds.push(id);
    }
    if (attrValueIds.length) {
      await supabase.from('variation_attribute_values').delete().eq('variation_id', insertedVar.id);
      await supabase
        .from('variation_attribute_values')
        .insert(attrValueIds.map((attribute_value_id) => ({ variation_id: insertedVar.id, attribute_value_id })));
    }

    variationCount++;
  }
  console.log(`Variações importadas: ${variationCount}`);

  // -------------------------------------------------------------
  // 6. PÁGINAS INSTITUCIONAIS (apenas as relevantes, conteúdo simplificado)
  // -------------------------------------------------------------
  const relevantPageSlugs = [
    'sobre-nos',
    'contactos',
    'politica-de-privacidade',
    'politica-de-trocas-e-devolucoes',
    'termos-e-condicoes',
  ];
  let pageCount = 0;
  for (const page of data.pages) {
    if (!relevantPageSlugs.includes(page.slug)) continue;
    const { error } = await supabase.from('pages').upsert(
      {
        slug: page.slug,
        title: page.title,
        content: stripHtml(page.content || ''),
      },
      { onConflict: 'slug' }
    );
    if (error) {
      console.error(`Erro ao inserir página ${page.slug}:`, error.message);
      continue;
    }
    pageCount++;
  }
  console.log(`Páginas importadas: ${pageCount}`);

  console.log('\nImportação concluída com sucesso.');
  console.log(
    '\nNota: as páginas construídas em Elementor (Sobre Nós, Contactos, Políticas) tinham' +
      ' formatação visual complexa que não foi preservada — o texto foi extraído e limpo,' +
      ' mas vale a pena reveres e reescreveres o conteúdo dessas páginas no novo site.'
  );
}

main().catch((err) => {
  console.error('Falha na importação:', err);
  process.exit(1);
});
