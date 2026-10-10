import React from 'react';
import { getStoreSettings } from '@/lib/settings';

export const metadata = {
  title: 'Privacy Policy - Pro Edge',
  description: 'Privacy Policy for Pro Edge.',
};

export default async function PrivacyPolicyPage() {
  const settings = await getStoreSettings();
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black mb-10 text-zinc-950 dark:text-white uppercase tracking-tight">Privacy Policy</h1>
      
      <div className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        
        <p>At Pro Edge, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.</p>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">1. Information We Collect</h2>
          <p>We may collect personal information such as your name, delivery address, email address, and phone number when you place an order, subscribe to our newsletter, or contact our support team. We also collect order history and communication records (such as WhatsApp chats) to fulfill your orders effectively.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To process and fulfill your orders, including delivery arrangements.</li>
            <li>To communicate with you regarding your order status, returns, or inquiries.</li>
            <li>To send promotional materials or offers, provided you have opted in.</li>
            <li>To improve our store, website, and customer service experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">3. Data Sharing & Security</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share necessary details (such as your address and phone number) with our trusted delivery and courier partners solely for the purpose of delivering your order. We implement standard security measures to protect your data against unauthorized access.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">4. Cookies</h2>
          <p>Our website may use &ldquo;cookies&rdquo; to enhance user experience, such as keeping track of your shopping cart. You may choose to set your web browser to refuse cookies, but some parts of the site may not function properly as a result.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">5. Your Rights</h2>
          <p>You have the right to request access to the personal data we hold about you and ask for it to be corrected or deleted. Please contact us using the details provided below to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Email:</strong> {settings.contactEmail}</li>
            <li><strong>WhatsApp / Phone:</strong> {settings.contactPhone}</li>
            <li><strong>Address:</strong> {settings.contactAddress}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
