import { CartPage } from '@/components/cart/cart-page';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Shopping Cart',
  description: 'Review your PROEDGE footwear order before checkout.',
  path: '/cart',
  noindex: true,
});


export default function CartPageWrapper() {
  return <CartPage />;
}