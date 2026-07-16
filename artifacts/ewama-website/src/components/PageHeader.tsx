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
    <div className="relative bg-primary pt-16 pb-24 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-1 bg-secondary" aria-hidden="true" />
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-left">
        {kicker && (
          <p className="text-secondary font-semibold tracking-[0.25em] uppercase text-sm mb-4">{kicker}</p>
        )}
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">{title}</h1>
        {subtitle && (
          <p className="text-white/80 text-lg max-w-3xl font-light">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
