import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Phone, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Properties', href: '/properties' },
    { label: 'About Us', href: '/about' },
    { label: 'Our Impact', href: '/communities' },
    { label: 'Insights', href: '/articles' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-sm border-gray-100 py-3" 
        : "bg-white border-transparent py-4"
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm">
              <span className="text-secondary font-heading font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg tracking-tight text-primary leading-tight">
                EWAMA
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 leading-tight">
                Properties Ltd
              </p>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={cn(
                  "text-sm font-medium transition-colors hover:text-secondary cursor-pointer",
                  location === link.href ? "text-secondary" : "text-gray-600"
                )}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">Call us today</span>
              <a href="tel:+254720769999" className="text-sm font-semibold text-primary flex items-center gap-1 hover:text-secondary transition-colors">
                <Phone className="w-3 h-3" />
                +254 720 769 999
              </a>
            </div>
            <Link href="/book-site-visit">
              <Button className="bg-secondary text-white hover:bg-secondary/90 font-medium">
                Book Site Visit
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Nav Toggle */}
        <button
          className="lg:hidden text-primary p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
              <span className={cn(
                "block text-base font-medium py-2 border-b border-gray-50",
                location === link.href ? "text-secondary" : "text-gray-800"
              )}>
                {link.label}
              </span>
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-4">
            <a href="tel:+254720769999" className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-md text-primary font-medium">
              <Phone className="w-4 h-4" />
              +254 720 769 999
            </a>
            <Link href="/book-site-visit" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-12">
                Book Site Visit
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
