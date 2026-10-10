export interface ValidatedOrderItem {
  product_id: string;
  variant_id: string;
  name: string;
  colour: string;
  size: number | string;
  size_system?: string;
  size_value?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ValidatedOrderCustomer {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

export interface ValidatedOrder {
  order_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer: ValidatedOrderCustomer;
  items: ValidatedOrderItem[];
}

export const VALID_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

export interface SaleItemInput {
  productId: string;
  variantId: string;
  productName: string;
  colour: string;
  size: string;
  sizeSystem?: string;
  sizeValue?: string;
  quantity: number;
  unitPrice: number;
}

export interface CatalogVariantOption {
  id: string;
  colour: string;
  size: number | string | null;
  size_system?: string;
  size_value?: string;
  stock: number;
}

export interface CatalogProductOption {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
  product_variants: CatalogVariantOption[];
}

export interface OrderItemWithStock {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  colour: string;
  size: string;
  size_system?: string;
  size_value?: string;
  quantity: number;
  unit_price: number;
  current_stock?: number;
}