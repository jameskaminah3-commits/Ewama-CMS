import { Link } from 'wouter';
import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import { useGetSettings } from '@workspace/api-client-react';

export function Footer() {
  const { data: settings } = useGetSettings();

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-sm">
                <span className="text-white font-heading font-bold text-xl">E</span>
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl tracking-tight text-white leading-tight">
                  EWAMA
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-white/70 leading-tight">
                  Properties Ltd
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              Foundation of Trust. We are a trusted, investment-grade land company committed to helping Kenyans and diaspora investors secure their future through real estate.
            </p>
            <div className="flex gap-4 pt-2">
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Home</span></Link></li>
              <li><Link href="/properties"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Properties</span></Link></li>
              <li><Link href="/about"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">About Us</span></Link></li>
              <li><Link href="/articles"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Insights</span></Link></li>
              <li><Link href="/contact"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Contact</span></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-white">Services</h3>
            <ul className="space-y-3">
              <li className="text-white/80 text-sm">Land Sales</li>
              <li className="text-white/80 text-sm">Property Investment Advisory</li>
              <li className="text-white/80 text-sm">Diaspora Investment Setup</li>
              <li className="text-white/80 text-sm">Title Deed Processing</li>
              <li><Link href="/book-site-visit"><span className="text-secondary font-medium hover:text-white transition-colors cursor-pointer text-sm">Book a Site Visit &rarr;</span></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>{settings?.officeAddress || 'Nairobi, Kenya'}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <a href={`tel:${settings?.phone || '0720769999'}`} className="hover:text-white transition-colors">
                  {settings?.phone || '0720 769 999'}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href={`mailto:${settings?.email || 'info@ewamaproperties.co.ke'}`} className="hover:text-white transition-colors">
                  {settings?.email || 'info@ewamaproperties.co.ke'}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} EWAMA Properties Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
