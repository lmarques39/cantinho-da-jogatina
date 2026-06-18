import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/lib/data/products';
import { getProductType, getProductBrand, PRODUCT_TYPES } from '@/lib/taxonomy';
import { AddToCartForm } from '@/components/product/add-to-cart-form';
import { ConditionBadge } from '@/components/product/condition-badge';
import { ProductCard } from '@/components/product/product-card';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const condition = product.attributes.find((a) => a.attribute_slug === 'pa_estado')?.name;
  const platform = product.attributes.find((a) => a.attribute_slug === 'pa_plataforma')?.name;

  // Tipo de produto (Jogos / Consolas / ...) para o breadcrumb, via taxonomia nova
  const categorySlugs = product.categories.map((c) => c.slug);
  const productTypeSlug = getProductType(categorySlugs);
  const productTypeLabel = PRODUCT_TYPES.find((t) => t.slug === productTypeSlug)?.label;

  const allImages = [
    ...(product.thumbnail_url ? [product.thumbnail_url] : []),
    ...product.images.map((i) => i.url),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-ink-400 mb-6">
        <Link href="/loja" className="hover:text-cartridge-400">
          Loja
        </Link>
        {productTypeSlug && productTypeLabel && (
          <>
            {' / '}
            <Link href={`/loja?tipo=${productTypeSlug}`} className="hover:text-cartridge-400">
              {productTypeLabel}
            </Link>
          </>
        )}
        {' / '}
        <span className="text-ink-200">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square rounded-cart border border-ink-700 bg-ink-900 overflow-hidden">
            {allImages[0] ? (
              <Image
                src={allImages[0]}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-500">Sem imagem</div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {allImages.slice(1, 6).map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-cart border border-ink-700 bg-ink-900 overflow-hidden"
                >
                  <Image src={url} alt={`${product.title} - imagem ${idx + 2}`} fill className="object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {platform && (
            <span className="font-mono text-xs uppercase tracking-wide text-ink-300">{platform}</span>
          )}
          <h1 className="mt-1 font-display text-3xl font-bold text-ink-50">{product.title}</h1>

          <div className="mt-3">
            <ConditionBadge condition={condition} />
          </div>

          {product.short_description && (
            <p className="mt-4 text-ink-200 leading-relaxed">{product.short_description}</p>
          )}

          <div className="mt-6 pt-6 border-t border-ink-700">
            <AddToCartForm product={product} />
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-cart bg-ink-700 px-2.5 py-1 text-xs text-ink-200 font-mono"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {product.description && product.description !== product.short_description && (
        <div className="mt-12 max-w-3xl">
          <h2 className="font-display text-xl font-bold text-ink-50 mb-3">Descrição</h2>
          <p className="text-ink-200 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold text-ink-50 mb-6">Também pode interessar-te</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
