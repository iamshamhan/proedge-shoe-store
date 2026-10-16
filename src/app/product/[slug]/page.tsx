
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug, getProductsByCategory, getAllProducts } from '@/lib/supabase/products';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductGrid } from '@/components/ui/product-grid';
import { SectionHeading } from '@/components/ui/section-heading';
import { ChevronRight } from 'lucide-react';
import { SITE_NAME, canonical } from '@/lib/site';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}


export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false },
    };
  }

  const productDescription =
    product.description ||
    `Shop the ${product.name} sneaker from ${SITE_NAME} in Sri Lanka. Performance and street style engineered for your next step.`;

  const url = canonical(`/product/${product.slug}`);
  const heroImage = product.images[0];

  const result: Metadata = {
    title: product.name,
    description: productDescription,
  };

  if (url) result.alternates = { canonical: url };

  result.openGraph = {
    type: 'website',
    locale: 'en_LK',
    siteName: SITE_NAME,
    title: product.name,
    description: productDescription,
    ...(url ? { url } : {}),
    ...(heroImage ? { images: [{ url: heroImage, alt: product.name }] } : {}),
  };

  result.twitter = {
    card: 'summary',
    title: product.name,
    description: productDescription,
    ...(heroImage ? { images: [heroImage] } : {}),
  };

  return result;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get related products from same category, excluding current product
  let relatedProducts = (await getProductsByCategory(product.category)).filter(
    (p) => p.id !== product.id
  );

  if (relatedProducts.length < 4) {
    const remaining = (await getAllProducts()).filter(
      (p) => p.id !== product.id && !relatedProducts.some((rp) => rp.id === p.id)
    );
    relatedProducts = [...relatedProducts, ...remaining].slice(0, 4);
  } else {
    relatedProducts = relatedProducts.slice(0, 4);
  }

  return (
    <div className="pt-6 sm:pt-12 pb-32 sm:pb-16 bg-[#f5f5f7] dark:bg-[#000000] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-medium text-[#6e6e73] dark:text-[#86868b] overflow-x-auto py-1">
            <li>
              <Link href="/" className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#86868b]" />
            </li>
            <li>
              <Link href="/shop" className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
                Shop
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#86868b]" />
            </li>
            <li>
              <Link
                href={`/shop?category=${product.category}`}
                className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors capitalize"
              >
                {product.categoryName || product.category.replace(/-/g, ' ')}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#86868b]" />
            </li>
            <li className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold truncate max-w-[150px] sm:max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Detail Main Grid Layout */}
        <div className="bg-white dark:bg-[#1d1d1f] rounded-[32px] border border-black/[0.05] dark:border-white/[0.08] p-6 sm:p-10 soft-shadow mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Gallery Column (Desktop: 7 cols, Mobile: Top) */}
            <div className="lg:col-span-7">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Information Column (Desktop: 5 cols, Mobile: Underneath) */}
            <div className="lg:col-span-5">
              <ProductInfo product={product} />
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        <div className="pt-8 border-t border-black/[0.06] dark:border-white/[0.08]">
          <SectionHeading
            eyebrow="You Might Also Like"
            title="Related Footwear."
            subtitle="Explore other engineered styles from our collection."
            linkText="View All"
            linkHref="/shop"
          />
          <ProductGrid products={relatedProducts} />
        </div>

      </div>
    </div>
  );
}