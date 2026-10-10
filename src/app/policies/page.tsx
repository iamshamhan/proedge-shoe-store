import React from 'react';
import { getStoreSettings } from '@/lib/settings';

export const metadata = {
  title: 'Store Policies - Pro Edge',
  description: 'Delivery, returns, exchanges, and payment policies for Pro Edge.',
};

export default async function PoliciesPage() {
  const settings = await getStoreSettings();
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black mb-10 text-zinc-950 dark:text-white uppercase tracking-tight">Store Policies</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">Delivery Information</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Delivery Areas:</strong> Island-wide delivery across Sri Lanka.</li>
            <li><strong>Delivery Time:</strong> 1 - 2 working days.</li>
            <li><strong>Delivery Fee:</strong> Rs. 600 - 800 depending on the delivery location.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">Returns, Exchanges & Refunds</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Accepted:</strong> We accept returns, exchanges, and issue refunds (T&C apply).</li>
            <li><strong>Timeframe:</strong> Customers have <strong>7 days</strong> from the date of sale to request a return or exchange.</li>
            <li><strong>Condition:</strong> Items must be unused, in their original packaging, with all tags intact.</li>
            <li><strong>Return Shipping:</strong> The customer is responsible for return shipping costs.</li>
            <li><strong>Wrong or Damaged Products:</strong> Returns/exchanges are accepted for wrong or damaged products (T&C apply).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">Orders & Payments</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Order Cancellation:</strong> Customers can cancel their orders before the item has been dispatched.</li>
            <li><strong>Payment Methods:</strong> We currently accept Cash on Delivery (COD), Bank Transfer, or via WhatsApp order arrangements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-500 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-2">Contact Support</h2>
          <p className="text-zinc-700 dark:text-zinc-300">If you have any questions about our policies, please contact us:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Address:</strong> {settings.contactAddress}</li>
            <li><strong>Phone / WhatsApp:</strong> {settings.contactPhone}</li>
            <li><strong>Email:</strong> {settings.contactEmail}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
