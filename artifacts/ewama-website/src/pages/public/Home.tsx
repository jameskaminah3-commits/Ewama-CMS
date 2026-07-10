import { useGetHomepageContent, useGetSettings, useListProperties, useGetDashboardStats } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { MapPin, Shield, TrendingUp, Handshake, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Home() {
  const { data: content, isLoading: contentLoading } = useGetHomepageContent();
  const { data: properties, isLoading: propsLoading } = useListProperties({ featured: true, limit: 3 });
  const { data: stats } = useGetDashboardStats();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={content?.heroImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"} 
            alt="Beautiful Kenyan landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
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
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-secondary/30 bg-secondary/10 backdrop-blur-sm text-secondary font-medium text-sm tracking-wide uppercase">
                  Foundation of Trust
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] mb-6 drop-shadow-sm">
                  {content?.heroHeading || "Secure Your Future with Premium Land in Kenya"}
                </h1>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl font-light">
                  {content?.heroSubheading || "We make land ownership accessible, transparent, and secure for Kenyans at home and in the diaspora."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/properties">
                    <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-14 px-8 text-base font-medium shadow-lg">
                      Explore Properties
                    </Button>
                  </Link>
                  <Link href="/book-site-visit">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                      Book a Site Visit
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-12 -mt-8 relative z-20 mx-4 md:mx-auto md:max-w-6xl rounded-xl shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 text-center divide-x divide-gray-100">
          <div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
              {content?.statsYearsInBusiness || 5}+
            </p>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Years of Trust</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
              {content?.statsPropertiesSold || 1000}+
            </p>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Plots Delivered</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
              {content?.statsHappyClients || 850}+
            </p>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Happy Clients</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
              {content?.statsCountiesCovered || 12}
            </p>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Counties Covered</p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Investment-Grade Properties</h2>
              <p className="text-gray-600 text-lg">Curated land parcels in high-growth areas, with ready title deeds and flexible payment plans.</p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="text-primary hover:text-secondary group">
                View All Properties <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

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

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">The EWAMA Advantage</h2>
            <p className="text-lg text-gray-600">We operate with the precision of a bank, ensuring your real estate investments are secure, transparent, and profitable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Secure & Verified</h3>
              <p className="text-gray-600">Every property we sell has undergone rigorous due diligence. We guarantee genuine, ready title deeds.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Investment Grade</h3>
              <p className="text-gray-600">We select land in high-growth corridors positioned for maximum appreciation and development potential.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Handshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Transparent Process</h3>
              <p className="text-gray-600">No hidden fees, no rushed decisions. We walk you through every step of the buying process with clarity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              Ready to Secure Your Piece of Kenya?
            </h2>
            <p className="text-xl text-white/80 mb-10 font-light">
              Join hundreds of smart investors who trust EWAMA Properties. Schedule a free consultation or book a site visit today.
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
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

// Ensure lucide arrow is available
import { ArrowRight } from 'lucide-react';
