import { CheckoutPage } from '@/components/checkout/checkout-page';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Checkout',
  description: 'Complete your PROEDGE order and send it via WhatsApp for islandwide delivery in Sri Lanka.',
  path: '/checkout',
  noindex: true,
});

export default function CheckoutPageWrapper() {
  return <CheckoutPage />;
}