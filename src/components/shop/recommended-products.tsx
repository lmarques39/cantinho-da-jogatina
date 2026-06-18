import { getRandomProducts } from '@/lib/data/products';
import { RecommendedCarousel } from './recommended-carousel';

interface RecommendedProductsProps {
  title?: string;
  limit?: number;
  sectionClassName?: string;
}

export async function RecommendedProducts({
  title = 'Recomendados para ti',
  limit = 12,
  sectionClassName,
}: RecommendedProductsProps) {
  const products = await getRandomProducts(limit);
  if (products.length === 0) return null;

  return <RecommendedCarousel title={title} products={products} sectionClassName={sectionClassName} />;
}
