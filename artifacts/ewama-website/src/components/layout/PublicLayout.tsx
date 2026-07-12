import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background selection:bg-secondary selection:text-white">
      <Navbar />
      <main className="flex-1 pt-[72px] md:pt-[84px]">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
