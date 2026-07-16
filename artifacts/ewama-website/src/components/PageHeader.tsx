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
    <div className="relative bg-primary pt-14 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[hsl(159,45%,14%)]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        {kicker && (
          <p className="text-secondary font-semibold tracking-[0.25em] uppercase text-sm mb-4">{kicker}</p>
        )}
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">{title}</h1>
        {subtitle && (
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-light">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
