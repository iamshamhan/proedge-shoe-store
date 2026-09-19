
import { HeroSection } from '@/components/home/hero-section';
import { CategorySection } from '@/components/home/category-section';
import { FeaturedSection } from '@/components/home/featured-section';
import { NewArrivalsSection } from '@/components/home/new-arrivals-section';
import { SaleBanner } from '@/components/home/sale-banner';
import { WhyChooseUs } from '@/components/home/why-choose-us';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { getHeroProduct, getCategoriesHierarchy } from '@/lib/supabase/products';
import { getStoreSettings } from '@/lib/settings';

export default async function Home() {
  const [heroProduct, settings, categories] = await Promise.all([
    getHeroProduct(),
    getStoreSettings(),
    getCategoriesHierarchy(),
  ]);

  return (
    <>
      <HeroSection heroProduct={heroProduct} />
      <CategorySection categories={categories} />
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


