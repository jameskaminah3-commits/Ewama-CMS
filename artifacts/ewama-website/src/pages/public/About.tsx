import { PublicLayout } from '@/components/layout/PublicLayout';
import { Seo } from '@/components/Seo';
import { useGetHomepageContent } from '@workspace/api-client-react';
import { Target, Eye, Shield, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function About() {
  const { data: content, isLoading } = useGetHomepageContent();

  return (
    <PublicLayout>
      <Seo
        title="About Us"
        description="Learn about EWAMA Properties Ltd — a Kenyan real estate company bringing banking-level professionalism, transparency, and trust to land investment."
      />
      <div className="bg-primary pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524813686514-a57563d77965?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-5 mix-blend-overlay bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-xl mx-auto mb-6">
            <span className="text-white font-heading font-bold text-3xl">E</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            About EWAMA Properties
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-light tracking-wide uppercase text-sm">
            Foundation of Trust
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          
          {/* History */}
          <div className="prose prose-lg max-w-none text-gray-600 mb-20">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">Our Story</h2>
            <p className="lead">
              EWAMA Properties Ltd was established with a singular vision: to bring banking-level professionalism, transparency, and trust to the Kenyan real estate sector.
            </p>
            <p>
              For years, land buyers both locally and in the diaspora have faced uncertainty when investing in Kenyan real estate. Fake title deeds, hidden fees, and unfulfilled promises have plagued the industry. EWAMA was founded to be the antidote to this chaos.
            </p>
            <p>
              We operate differently. We don't just sell land; we provide investment-grade real estate assets. Before any property reaches our portfolio, it undergoes rigorous legal, financial, and topographical due diligence. When you buy from EWAMA, you are buying peace of mind.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Our Mission</h3>
              {isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {content?.mission || "To provide accessible, verifiable, and high-return real estate investment opportunities through transparent and professional service delivery."}
                </p>
              )}
            </div>

            <div className="bg-primary text-white p-10 rounded-2xl shadow-xl">
              <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-white mb-4">Our Vision</h3>
              {isLoading ? (
                <Skeleton className="h-24 w-full bg-white/20" />
              ) : (
                <p className="text-white/80 leading-relaxed">
                  {content?.vision || "To be the most trusted and preferred real estate investment partner in East Africa, setting the gold standard for integrity in land acquisition."}
                </p>
              )}
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">Our Core Values</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Integrity</h4>
                  <p className="text-gray-600">We do what is right, always. Total transparency in pricing, title processing, and property features.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Client-Centricity</h4>
                  <p className="text-gray-600">We don't rush sales. We advise, guide, and ensure every investment aligns with our client's goals.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CSR */}
          <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100 text-center">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Community Impact</h2>
            {isLoading ? (
              <Skeleton className="h-20 w-3/4 mx-auto" />
            ) : (
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {content?.communityImpact || "At EWAMA, we believe in growing with our communities. We actively participate in local development initiatives, from tree planting drives in our properties to supporting local education infrastructure."}
              </p>
            )}
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
