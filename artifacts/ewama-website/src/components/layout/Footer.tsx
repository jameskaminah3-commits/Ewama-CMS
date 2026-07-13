import { useState } from 'react';
import { Link } from 'wouter';
import { Facebook, Instagram, Linkedin, Youtube, MapPin, Phone, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}
import { useGetSettings, useSubscribeNewsletter } from '@workspace/api-client-react';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = useSubscribeNewsletter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ data: { email } }, {
      onSuccess: () => {
        setSubscribed(true);
        setEmail('');
      },
    });
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-secondary bg-white/5 rounded-lg px-4 py-3">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span className="text-white/90">You're subscribed. Watch your inbox for new opportunities.</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex rounded-lg overflow-hidden border border-white/15 bg-white/5 focus-within:border-secondary transition-colors">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          aria-label="Subscribe to newsletter"
          className="bg-secondary hover:bg-secondary/90 text-white px-4 flex items-center justify-center transition-colors disabled:opacity-60"
        >
          {subscribe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      {subscribe.isError && (
        <p className="text-xs text-red-300">Subscription failed. Please try again.</p>
      )}
    </form>
  );
}

export function Footer() {
  const { data: settings } = useGetSettings();

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12 border-b border-white/10 pb-12">
          
          <div className="space-y-4">
            <div className="mb-6">
              <div className="inline-block bg-white rounded-xl px-4 py-3">
                <img
                  src="/logo.png"
                  alt="EWAMA Properties Ltd — Foundation of Trust"
                  className="h-14 w-auto"
                />
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
              {settings?.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noreferrer" aria-label="EWAMA on TikTok" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube && (
                <a href={settings.youtube} target="_blank" rel="noreferrer" aria-label="EWAMA on YouTube" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-white">Properties</h3>
            <ul className="space-y-3">
              <li><Link href="/properties"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">All Properties</span></Link></li>
              <li><Link href="/properties?county=Kajiado"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Kimana – Imbirikani</span></Link></li>
              <li><Link href="/properties?county=Kirinyaga"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Sagana</span></Link></li>
              <li><Link href="/properties?county=Nakuru"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Naivasha</span></Link></li>
              <li><Link href="/properties?county=Machakos"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Joska · Mananja · Matuu</span></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Home</span></Link></li>
              <li><Link href="/properties"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Properties</span></Link></li>
              <li><Link href="/about"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">About Us</span></Link></li>
              <li><Link href="/communities"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Our Impact</span></Link></li>
              <li><Link href="/articles"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">Insights</span></Link></li>
              <li><Link href="/faq"><span className="text-white/80 hover:text-secondary transition-colors cursor-pointer text-sm">FAQ</span></Link></li>
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
            <h3 className="font-heading font-semibold text-lg mb-6 text-white">Let's Talk</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>{settings?.officeAddress || 'Ewama Properties Ltd, RRW6+G44, Kiambu Road, Kiambu'}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <a href={`tel:${settings?.phone || '+254720769999'}`} className="hover:text-white transition-colors">
                  {settings?.phone || '+254 720 769 999'}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href={`mailto:${settings?.email || 'ewamapropertiesltd@gmail.com'}`} className="hover:text-white transition-colors">
                  {settings?.email || 'ewamapropertiesltd@gmail.com'}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/10 pb-10 mb-8">
          <div className="max-w-md">
            <h3 className="font-heading font-semibold text-lg text-white mb-2">Stay Ahead of the Market</h3>
            <p className="text-white/70 text-sm">
              Get new property launches, price updates, and investment insights delivered to your inbox.
            </p>
          </div>
          <div className="w-full lg:w-96">
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} EWAMA Properties Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy"><span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span></Link>
            <Link href="/terms-of-service"><span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
