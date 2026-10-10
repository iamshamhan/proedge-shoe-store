import React from 'react';

export const metadata = {
  title: 'Terms of Service - Pro Edge',
  description: 'Terms of Service and Conditions for Pro Edge.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black mb-10 text-zinc-950 dark:text-white uppercase tracking-tight">Terms of Service</h1>
      
      <div className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        
        <p>Welcome to Pro Edge. By accessing or using our website, placing an order, or engaging with our services, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.</p>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">1. General</h2>
          <p>These terms govern your use of the Pro Edge website and the purchase of any products from it. We reserve the right to modify these terms at any time without prior notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">2. Products & Pricing</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>We make every effort to display the colors, features, and details of our products accurately. However, we do not guarantee that the displays of any color or detail will be perfectly accurate.</li>
            <li>All prices are displayed in Sri Lankan Rupees (LKR) and are subject to change without notice.</li>
            <li>We reserve the right to limit the quantities of any products or services that we offer.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">3. Orders & Payments</h2>
          <p>By placing an order, you represent that all information provided is accurate. We reserve the right to refuse or cancel any order for any reason, including limitations on available quantities or errors in product or pricing information. Payment must be arranged via accepted methods (Cash on Delivery, Bank Transfer) as communicated through WhatsApp.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">4. Intellectual Property</h2>
          <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Pro Edge or its content suppliers and protected by intellectual property laws. You may not reproduce, distribute, or use this content without express written permission.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">5. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, Pro Edge shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or website.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">6. Governing Law</h2>
          <p>These Terms and Conditions and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Sri Lanka.</p>
        </section>
      </div>
    </div>
  );
}
