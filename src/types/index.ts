// Tipos de domínio principais — espelham o schema em supabase/migrations

export type ProductStatus = 'publish' | 'draft';
export type StockStatus = 'instock' | 'outofstock';
export type ProductType = 'simple' | 'variable';

export interface Category {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface AttributeValue {
  id: string;
  attribute_slug: string; // ex: 'pa_plataforma'
  attribute_name: string; // ex: 'Plataforma'
  slug: string; // ex: 'ps1'
  name: string; // ex: 'Playstation 1'
}

export interface ProductImage {
  id: string;
  url: string;
  sort_order: number;
}

export interface ProductVariation {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  stock_status: StockStatus;
  thumbnail_url: string | null;
  attributes: AttributeValue[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  product_type: ProductType;
  sku: string | null;
  regular_price: number | null;
  sale_price: number | null;
  price: number;
  stock_quantity: number;
  stock_status: StockStatus;
  thumbnail_url: string | null;
  status: ProductStatus;
  categories: Category[];
  tags: Tag[];
  attributes: AttributeValue[];
  images: ProductImage[];
  variations: ProductVariation[];
}

export interface CartItem {
  productId: string;
  variationId: string | null;
  title: string;
  price: number;
  quantity: number;
  thumbnailUrl: string | null;
  slug: string;
  stockQuantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface OrderItem {
  productId: string | null;
  variationId: string | null;
  titleSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  paymentStatus: 'unpaid' | 'paid' | 'failed';
  createdAt: string;
}
