export const dynamic = 'force-dynamic';

import { HeroSection } from '@/components/home/hero-section';
import { CategorySection } from '@/components/home/category-section';
import { FeaturedSection } from '@/components/home/featured-section';
import { NewArrivalsSection } from '@/components/home/new-arrivals-section';
import { SaleBanner } from '@/components/home/sale-banner';
import { WhyChooseUs } from '@/components/home/why-choose-us';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { getHeroProduct } from '@/lib/supabase/products';
import { getStoreSettings } from '@/lib/settings';

export default async function Home() {
  const [heroProduct, settings] = await Promise.all([
    getHeroProduct(),
    getStoreSettings(),
  ]);

  return (
    <>
      <HeroSection heroProduct={heroProduct} />
      <CategorySection />
      <FeaturedSection />
      <NewArrivalsSection />
      {settings.saleEnabled !== false && (
        <SaleBanner discountPercent={settings.saleDiscountPercent ?? 30} />
      )}
      <WhyChooseUs />
      <NewsletterSection />
    </>
  );
}

