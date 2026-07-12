import { useGetHomepageContent, useListProperties } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { MapPin, Shield, TrendingUp, Handshake, ChevronRight, ArrowRight, FileCheck2, CalendarCheck, BadgeCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const ADVANTAGE_ICONS = [Shield, TrendingUp, Handshake];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

export default function Home() {
  const { data: content, isLoading: contentLoading } = useGetHomepageContent();
  const { data: properties, isLoading: propsLoading } = useListProperties({ featured: true, limit: 3 });

  const advantages = content?.advantages?.length ? content.advantages : [
    { title: 'Secure & Verified', description: 'Every property we sell has undergone rigorous due diligence. We guarantee genuine, ready title deeds.' },
    { title: 'Investment Grade', description: 'We select land in high-growth corridors positioned for maximum appreciation and development potential.' },
    { title: 'Transparent Process', description: 'No hidden fees, no rushed decisions. We walk you through every step of the buying process with clarity.' },
  ];

  const processSteps = content?.processSteps?.length ? content.processSteps : [
    { title: 'Explore & Enquire', description: 'Browse our vetted properties online or speak to an advisor about your investment goals.' },
    { title: 'Visit the Site', description: 'Book a free guided site visit and see the land, beacons, and surrounding developments for yourself.' },
    { title: 'Secure Your Plot', description: 'Pay a deposit or the full amount to official EWAMA accounts and sign your sale agreement.' },
    { title: 'Receive Your Title', description: 'We process and hand over your genuine title deed — your ownership, fully documented.' },
  ];

  const testimonials = content?.testimonials?.length ? content.testimonials : [];

  return (
    <PublicLayout>
      <Seo
        description="EWAMA Properties Ltd — Foundation of Trust. Investment-grade land in Kenya with ready title deeds, transparent pricing, and flexible payment plans."
        image={content?.heroImage || undefined}
      />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={content?.heroImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
            alt="Premium Kenyan land"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-24">
          <div className="max-w-3xl">
            {contentLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 bg-white/20" />
                <Skeleton className="h-12 w-1/2 bg-white/20" />
                <Skeleton className="h-24 w-full bg-white/20 mt-6" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-secondary/40 bg-secondary/15 backdrop-blur-sm text-secondary font-medium text-sm tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {content?.heroBadge || 'Foundation of Trust'}
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.08] mb-6 drop-shadow-sm">
                  {content?.heroHeading || "Secure Your Future with Premium Land in Kenya"}
                </h1>
                <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-2xl font-light">
                  {content?.heroSubheading || "We make land ownership accessible, transparent, and secure for Kenyans at home and in the diaspora."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/properties">
                    <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-14 px-8 text-base font-medium shadow-xl shadow-secondary/20">
                      Explore Properties
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/book-site-visit">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-sm">
                      Book a Free Site Visit
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
                  <span className="flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-secondary" /> Ready Title Deeds</span>
                  <span className="flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-secondary" /> Free Site Visits</span>
                  <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-secondary" /> Flexible Payment Plans</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-12 -mt-10 relative z-20 mx-4 md:mx-auto md:max-w-6xl rounded-2xl shadow-xl shadow-primary/5 border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 text-center md:divide-x divide-gray-100">
          {[
            { value: content?.statsYearsInBusiness || 5, suffix: '+', label: 'Years of Trust' },
            { value: content?.statsPropertiesSold || 1000, suffix: '+', label: 'Plots Delivered' },
            { value: content?.statsHappyClients || 850, suffix: '+', label: 'Happy Clients' },
            { value: content?.statsCountiesCovered || 12, suffix: '', label: 'Counties Covered' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">Featured Opportunities</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Investment-Grade Properties</h2>
              <p className="text-gray-600 text-lg">Curated land parcels in high-growth areas, with ready title deeds and flexible payment plans.</p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="text-primary hover:text-secondary group">
                View All Properties <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propsLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                  <Skeleton className="w-full h-64" />
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
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={property.heroImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                      alt={property.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm uppercase tracking-wide">
                        {property.status === 'available' ? 'Available' : property.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary mb-3">
                      <MapPin className="w-4 h-4" />
                      {property.location}, {property.county}
                    </div>
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                      {property.shortDescription}
                    </p>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Cash Price from</p>
                        <p className="text-lg font-bold text-primary">
                          Ksh. {property.cashPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">A Clear Path to Ownership</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">How to Own Your Plot</h2>
            <p className="text-lg text-white/70">Four straightforward steps — no surprises, no pressure, full documentation.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, idx) => (
              <motion.div
                key={idx}
                {...fadeUp}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
              >
                <div className="text-secondary font-heading font-bold text-5xl mb-6 opacity-90">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">Why EWAMA</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">The EWAMA Advantage</h2>
            <p className="text-lg text-gray-600">We operate with the precision of a bank, ensuring your real estate investments are secure, transparent, and profitable.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((advantage, idx) => {
              const Icon = ADVANTAGE_ICONS[idx % ADVANTAGE_ICONS.length]!;
              return (
                <motion.div
                  key={idx}
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="group text-center bg-background border border-gray-100 rounded-2xl p-10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 mx-auto bg-primary/5 text-primary group-hover:bg-secondary group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">{advantage.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-3">Client Stories</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">What Our Clients Say</h2>
              <p className="text-lg text-gray-600">Real stories from investors who built their future with EWAMA.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={idx}
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col"
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

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              {content?.ctaHeading || 'Ready to Secure Your Piece of Kenya?'}
            </h2>
            <p className="text-xl text-white/80 mb-10 font-light">
              {content?.ctaSubheading || 'Join hundreds of smart investors who trust EWAMA Properties. Schedule a free consultation or book a site visit today.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-14 px-8 text-base font-medium">
                  Contact an Advisor
                </Button>
              </Link>
              <Link href="/book-site-visit">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Book a Site Visit
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
