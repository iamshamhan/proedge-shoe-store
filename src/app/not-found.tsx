import Link from 'next/link';
import { PackageX, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 sm:p-16 shadow-xs">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
            <PackageX className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
            Page Not Found
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
            We could not find the page or product you are looking for. The item may have
            been moved or discontinued.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all shadow-md"
            >
              <span>Shop All Footwear</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}