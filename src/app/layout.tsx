import type { Metadata } from 'next';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
} from '@/lib/site';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { WhatsAppFloatingButton } from '@/components/ui/whatsapp-floating-button';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { SettingsProvider } from '@/context/settings-context';
import { ThemeProvider } from '@/context/theme-context';
import { getStoreSettings } from '@/lib/settings';
import { getCategoriesHierarchy } from '@/lib/supabase/products';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'PROEDGE',
    'shoes Sri Lanka',
    'running shoes Sri Lanka',
    'sneakers',
    'performance footwear',
    'casual sneakers',
    'islandwide delivery',
  ],
  generator: 'Next.js',
  category: 'shopping',
  creator: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: siteUrl ?? undefined,
  },
  twitter: {
    card: 'summary',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getStoreSettings(),
    getCategoriesHierarchy(),
  ]);

  return (
    <html
      lang="en"
      className="light h-full antialiased selection:bg-amber-500/20 selection:text-amber-600 dark:selection:bg-amber-400/25 dark:selection:text-amber-300"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('proedge_theme')||'light';if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#000000] dark:text-[#f5f5f7] transition-colors duration-300">
        <ThemeProvider>
          <SettingsProvider settings={settings}>
            <CartProvider>
              <WishlistProvider>
                <Header categories={categories} />
                <main id="main" className="flex-1">{children}</main>
                <Footer categories={categories} />
                <CartDrawer />
                <WhatsAppFloatingButton />
              </WishlistProvider>
            </CartProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
