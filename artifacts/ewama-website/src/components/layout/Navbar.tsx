import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Phone, Mail, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGetSettings } from '@workspace/api-client-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Properties', href: '/properties' },
  { label: 'Our Impact', href: '/communities' },
  { label: 'Blog', href: '/articles' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { data: settings } = useGetSettings();

  const phone = settings?.phone || '+254 720 769 999';
  const email = settings?.email || 'info@ewamaproperties.com';

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
      {/* Top tier: logo, contact info, CTA */}
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/">
          <div className="flex items-center cursor-pointer shrink-0">
            <img
              src="/logo.png"
              alt="EWAMA Properties Ltd — Foundation of Trust"
              className="h-12 md:h-14 w-auto"
            />
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-secondary/15 text-primary flex items-center justify-center group-hover:bg-secondary transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Call Support</p>
              <p className="text-sm font-semibold text-primary">{phone}</p>
            </div>
          </a>
          <a href={`mailto:${email}`} className="hidden xl:flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-secondary/15 text-primary flex items-center justify-center group-hover:bg-secondary transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
              <p className="text-sm font-semibold text-primary">{email}</p>
            </div>
          </a>
          <Link href="/contact">
            <Button className="bg-secondary text-primary hover:bg-secondary/90 font-semibold h-11 px-6">
              Get In Touch
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-primary p-2"
          aria-label="Toggle menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Bottom tier: brand gold nav strip */}
      <nav className="hidden lg:block bg-secondary">
        <div className="container mx-auto px-4 md:px-6 flex items-center">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className={cn(
                'inline-block px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer',
                location === link.href
                  ? 'bg-primary text-white'
                  : 'text-primary/90 hover:bg-primary hover:text-white'
              )}>
                {link.label}
              </span>
            </Link>
          ))}
          <Link href="/book-site-visit">
            <span className="ml-auto inline-block px-5 py-3.5 text-sm font-semibold bg-primary text-secondary hover:bg-primary/85 transition-colors cursor-pointer">
              Book a Site Visit
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-6 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
              <span className={cn(
                'block text-base font-medium py-3 border-b border-gray-50',
                location === link.href ? 'text-secondary' : 'text-gray-800'
              )}>
                {link.label}
              </span>
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-md text-primary font-medium">
              <Phone className="w-4 h-4" />
              {phone}
            </a>
            <Link href="/book-site-visit" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-secondary text-primary hover:bg-secondary/90 h-12 font-semibold">
                Book a Site Visit
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
