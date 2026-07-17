import { ReactNode } from 'react';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/**
 * Standard banner for inner pages: navy gradient with a gold kicker,
 * serif title, and optional subtitle — matching the homepage design.
 */
export function PageHeader({ kicker, title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="relative bg-primary py-14 md:py-16 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-1 bg-secondary" aria-hidden="true" />
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-6 lg:px-10 relative z-10 text-left">
        {kicker && (
          <p className="text-secondary font-semibold tracking-[0.25em] uppercase text-sm mb-4">{kicker}</p>
        )}
        <div className="grid gap-5 lg:grid-cols-[0.42fr_0.58fr] lg:items-end">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-white/80 text-lg max-w-4xl font-light lg:justify-self-end lg:text-right">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
