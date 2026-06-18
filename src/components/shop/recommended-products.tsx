import { getRandomProducts } from '@/lib/data/products';
import { RecommendedCarousel } from './recommended-carousel';

interface RecommendedProductsProps {
  title?: string;
  limit?: number;
}

// Server component: busca os dados (ordem estável) e delega a apresentação
// e o baralhamento ao client component, evitando erros de hydration.
export async function RecommendedProducts({
  title = 'Recomendados para ti',
  limit = 12,
}: RecommendedProductsProps) {
  const products = await getRandomProducts(limit);
  if (products.length === 0) return null;

  return <RecommendedCarousel title={title} products={products} />;
}
