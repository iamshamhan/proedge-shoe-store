import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
  centered?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  linkText,
  linkHref,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-10 sm:mb-14 flex flex-col ${
        centered ? 'items-center text-center' : 'items-start text-left'
      }`}
    >
      {eyebrow && (
        <span className="text-xs font-semibold tracking-tight text-amber-600 dark:text-amber-400 mb-1.5">
          {eyebrow}
        </span>
      )}
      <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-semibold text-[#1d1d1f] dark:text-white tracking-[-0.025em] leading-[1.1]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2.5 text-sm sm:text-base text-[#6e6e73] dark:text-[#86868b] max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-xs sm:text-[13px] font-medium tracking-tight text-[#1d1d1f] dark:text-white transition-all group shrink-0"
          >
            <span>{linkText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500 motion-safe:group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
