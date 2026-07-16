import { useEffect, useMemo, useState } from 'react';
import { useGetHomepageContent, useListProperties, useListArticles, useCreateEnquiry } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import {
  MapPin, ChevronRight, ArrowRight, Check, Phone, Mail,
  MessagesSquare, ReceiptText, LineChart, HeartHandshake, Loader2, Ruler,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSettings } from '@workspace/api-client-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

const DEFAULT_WHAT_YOU_GET = [
  'Verified property ownership',
  'Transparent pricing',
  'Professional customer support',
  'Flexible payment plans',
  'Strategic investment locations',
  'Dedicated guidance throughout the buying process',
];

const CONTACT_REASONS = ['Property Inquiry', 'Schedule Viewing', 'Investment Consultation', 'General Question'];

interface Slide {
  kicker: string;
  title: string;
  text: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    kicker: 'EWAMA PROPERTIES LTD',
    title: 'Secure Your Future Through Smart Property Investment',
    text: 'We make land ownership accessible, transparent, and rewarding.',
    ctaLabel: 'Explore Properties',
    ctaHref: '/properties',
  },
  {
    image: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    kicker: 'EWAMA PROPERTIES LTD',
    title: 'Own Today. Prosper Tomorrow.',
    text: 'Prime value-added plots with title deeds guaranteed, in Kenya’s fastest-growing regions.',
    ctaLabel: 'Book a Site Visit',
    ctaHref: '/book-site-visit',
  },
  {
    image: '/office-reception.webp',
    kicker: 'A FOUNDATION OF TRUST',
    title: 'Karibu EWAMA Properties',
    text: 'Visit our Customer Care Centre on Kiambu Road — our team is ready to walk you home.',
    ctaLabel: 'Talk to Us',
    ctaHref: '/contact',
  },
];

function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index]!;
  const hasText = Boolean(slide.kicker || slide.title || slide.text || (slide.ctaLabel && slide.ctaHref));

  return (
    <section className="relative h-[52vh] min-h-[360px] md:h-[62vh] md:min-h-[440px] max-h-[620px] overflow-hidden bg-primary">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="w-full h-full object-cover object-center" />
          {/* Only dim the photo when there's text to read over it. */}
          {hasText && <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/20" />}
        </motion.div>
      </AnimatePresence>

      {hasText && (
        <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              {slide.kicker && (
                <p className="text-secondary font-semibold tracking-[0.25em] uppercase text-sm mb-5">{slide.kicker}</p>
              )}
              {slide.title && (
                <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-[1.12] mb-4">
                  {slide.title}
                </h1>
              )}
              {slide.text && (
                <p className="text-base md:text-lg text-white/85 leading-relaxed mb-7 font-light">{slide.text}</p>
              )}
              {slide.ctaLabel && slide.ctaHref && (
                <Link href={slide.ctaHref}>
                  <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-13 px-8 text-base font-medium">
                    {slide.ctaLabel} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-secondary' : 'w-4 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  );
}

function HomeEnquiryForm() {
  const { toast } = useToast();
  const createEnquiry = useCreateEnquiry();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !reason) {
      toast({ title: 'Please fill in your name, email, and reason for contact', variant: 'destructive' });
      return;
    }
    createEnquiry.mutate({
      data: { name, email, phone: phone || undefined, message: `[${reason}] ${message || 'No additional message.'}` },
    }, {
      onSuccess: () => {
        toast({ title: 'Message sent', description: 'We will get back to you shortly.' });
        setName(''); setEmail(''); setPhone(''); setReason(''); setMessage('');
      },
      onError: () => toast({ title: 'Failed to send. Please try again.', variant: 'destructive' }),
    });
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 h-12" />
        <Input placeholder="Email Address *" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50 h-12" />
      </div>
      <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="bg-gray-50 h-12" />
      <Select value={reason} onValueChange={setReason}>
        <SelectTrigger className="bg-gray-50 h-12">
          <SelectValue placeholder="Reason for Contact *" />
        </SelectTrigger>
        <SelectContent>
          {CONTACT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
        </SelectContent>
      </Select>
      <Textarea placeholder="Your message..." value={message} onChange={e => setMessage(e.target.value)} className="bg-gray-50 min-h-[110px] resize-none" />
      <Button type="submit" disabled={createEnquiry.isPending} className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 text-base font-medium">
        {createEnquiry.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Message'}
      </Button>
    </form>
  );
}

export default function Home() {
  const { data: content } = useGetHomepageContent();
  const { data: settings } = useGetSettings();
  const { data: properties, isLoading: propsLoading } = useListProperties({ featured: true, limit: 3 });
  const { data: allProperties } = useListProperties({ status: 'available', limit: 50 });
  const { data: latestArticles } = useListArticles({ status: 'published', limit: 3 });

  const locations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of allProperties?.data || []) {
      if (p.county) counts.set(p.county, (counts.get(p.county) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count);
  }, [allProperties?.data]);

  const testimonials = content?.testimonials?.length ? content.testimonials : [];
  const slides: Slide[] = content?.heroSlides?.length ? content.heroSlides : DEFAULT_SLIDES;
  const whatYouGet = content?.whatYouGet?.length ? content.whatYouGet : DEFAULT_WHAT_YOU_GET;

  return (
    <PublicLayout>
      <Seo
        description="EWAMA Properties Ltd — Foundation of Trust. Investment-grade land in Kenya with ready title deeds, transparent pricing, and flexible payment plans."
        image={slides[0]?.image}
      />

      <HeroSlider slides={slides} />

      {/* Explore Our Properties */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Explore Our Properties</h2>
            <p className="text-lg text-gray-600">Prime value-added plots with title deeds guaranteed.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propsLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                  <Skeleton className="w-full h-60" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              ))
            ) : properties?.data?.map((property) => (
              <Link key={property.id} href={`/properties/${property.slug}`}>
                <div className="group rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer">
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={property.heroImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={property.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wide">
                      For Sale
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 text-secondary" />
                      {property.location}, {property.county}
                    </div>
                    <p className="text-2xl font-heading font-bold text-primary mb-4">
                      From Ksh. {property.cashPrice.toLocaleString()}
                    </p>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto text-sm text-gray-500">
                      {property.plotSize && (
                        <span className="flex items-center gap-1.5"><Ruler className="w-4 h-4" /> {property.plotSize}</span>
                      )}
                      <span className="flex items-center gap-1 text-secondary font-semibold group-hover:gap-2 transition-all">
                        View Details <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/properties">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 h-12 px-8">
                View All Properties <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Locations */}
      {locations.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Featured Locations</h2>
              <p className="text-lg text-gray-600">Carefully selected developments in Kenya's fastest-growing regions.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {locations.slice(0, 5).map((loc, idx) => (
                <motion.div key={loc.county} {...fadeUp} transition={{ duration: 0.5, delay: idx * 0.07 }}>
                  <Link href={`/properties?county=${encodeURIComponent(loc.county)}`}>
                    <div className="group bg-background border border-gray-100 rounded-2xl p-8 text-center cursor-pointer hover:bg-primary hover:border-primary transition-colors duration-300">
                      <MapPin className="w-7 h-7 mx-auto mb-4 text-secondary" />
                      <p className="font-heading font-bold text-lg text-gray-900 group-hover:text-white transition-colors">{loc.county}</p>
                      <p className="text-sm text-gray-500 group-hover:text-white/70 transition-colors">
                        {loc.count} {loc.count === 1 ? 'listing' : 'listings'}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About / Our Approach */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp} className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/office-frontdesk.webp"
                alt="Inside the EWAMA Properties Customer Care Centre"
                loading="lazy"
                className="w-full h-[420px] object-cover"
              />
            </motion.div>
            <motion.div {...fadeUp}>
              <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">About Us</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">Our Approach</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {content?.approachText || 'Finding the right piece of land is personal. We listen first, then guide you through every step — from your first site visit to the day you receive your title deed.'}
              </p>
              <blockquote className="border-l-4 border-secondary pl-6 mb-8">
                <p className="font-heading text-xl md:text-2xl text-gray-800 italic leading-relaxed">
                  "{content?.approachQuote || "We don't just sell plots. We help families find the place where their best memories will be made."}"
                </p>
                <footer className="text-sm text-gray-500 mt-3">— EWAMA Properties Ltd, Foundation of Trust</footer>
              </blockquote>
              <Link href="/contact">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-12 px-8">
                  Book a Consultation
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Deliver Excellence */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">How We Deliver Excellence</h2>
            <p className="text-lg text-white/70">Growing expertise. Hundreds of happy landowners. One seamless experience.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: `${content?.statsHappyClients || 850}+`, label: 'Satisfied Clients' },
                { value: `${content?.statsPropertiesSold || 1000}+`, label: 'Plots Delivered' },
                { value: `${content?.statsYearsInBusiness || 5}+`, label: 'Years of Excellence' },
                { value: `${content?.statsCountiesCovered || 12}`, label: 'Counties Covered' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-4xl font-heading font-bold text-secondary mb-2">{stat.value}</p>
                  <p className="text-sm text-white/70 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
            <motion.div {...fadeUp} className="bg-white rounded-2xl p-10 shadow-xl">
              <h3 className="text-2xl font-heading font-bold text-primary mb-6">What You Get</h3>
              <ul className="space-y-4">
                {whatYouGet.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Connect with Us Today */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp}>
              <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">Get In Touch</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">Connect with Us Today</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Whether you're looking for your dream plot, need guidance on the buying process, or have any other
                questions, we're here to help.
              </p>
              <div className="space-y-4 mb-10">
                <a href={`tel:${(settings?.phone || '+254720769999').replace(/\s/g, '')}`} className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 text-secondary" /> {settings?.phone || '+254 720 769 999'}
                </a>
                <p className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-secondary" /> {settings?.officeAddress || 'Kiambu Road, Kiambu'}
                </p>
                <a href={`mailto:${settings?.email || 'ewamapropertiesltd@gmail.com'}`} className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 text-secondary" /> {settings?.email || 'ewamapropertiesltd@gmail.com'}
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: MessagesSquare, title: 'Free Consultation', text: 'No-obligation property assessment' },
                  { icon: ReceiptText, title: 'No Hidden Fees', text: 'What you see is what you pay' },
                  { icon: LineChart, title: 'Expert Market Analysis', text: 'Current pricing and trends insights' },
                  { icon: HeartHandshake, title: 'Personalized Approach', text: 'Tailored solutions for your needs' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp}>
              <HomeEnquiryForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      {(latestArticles?.data?.length ?? 0) > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div {...fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary">Latest News</h2>
                <p className="text-lg text-gray-600 mt-2">Market updates, property insights, and expert real estate advice.</p>
              </div>
              <Link href="/articles">
                <Button variant="ghost" className="text-primary hover:text-secondary group">
                  Visit Our Blog <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestArticles!.data!.map((article, idx) => (
                <motion.div key={article.id} {...fadeUp} transition={{ duration: 0.5, delay: idx * 0.08 }}>
                  <Link href={`/articles/${article.slug}`}>
                    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                          src={article.featuredImage || '/office-lounge.webp'}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        {article.category && (
                          <p className="text-secondary text-xs font-bold uppercase tracking-wide mb-2">{article.category}</p>
                        )}
                        <h3 className="font-heading font-bold text-lg text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 flex-1">{article.excerpt}</p>
                        {article.publishedAt && (
                          <p className="text-xs text-gray-400 mt-4">{formatDate(article.publishedAt)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">What Our Clients Say</h2>
              <p className="text-lg text-gray-600">Real stories from investors who built their future with EWAMA.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={idx}
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-background rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col"
                >
                  <div className="text-secondary font-heading text-6xl leading-none mb-4 select-none" aria-hidden="true">&ldquo;</div>
                  <p className="text-gray-700 leading-relaxed flex-1">{t.quote}</p>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="font-heading font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
