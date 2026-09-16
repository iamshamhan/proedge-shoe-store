export const dynamic = 'force-dynamic';

import { HeroSection } from '@/components/home/hero-section';
import { CategorySection } from '@/components/home/category-section';
import { FeaturedSection } from '@/components/home/featured-section';
import { NewArrivalsSection } from '@/components/home/new-arrivals-section';
import { SaleBanner } from '@/components/home/sale-banner';
import { WhyChooseUs } from '@/components/home/why-choose-us';
import { NewsletterSection } from '@/components/home/newsletter-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <NewArrivalsSection />
      <SaleBanner />
      <WhyChooseUs />
      <NewsletterSection />
    </>
  );
}
