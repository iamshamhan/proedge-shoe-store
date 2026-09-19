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
        <span className="text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-2">
          {eyebrow}
        </span>
      )}
      <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group shrink-0"
          >
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4 motion-safe:group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
