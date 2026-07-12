import { PublicLayout } from '@/components/layout/PublicLayout';
import { Seo } from '@/components/Seo';
import { useGetHomepageContent } from '@workspace/api-client-react';
import { Target, Eye, Shield, Users, Home as HomeIcon, CalendarCheck, LineChart, Headphones, Wallet, Lightbulb, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const SERVICES = [
  { icon: HomeIcon, title: 'Property Sales', description: 'Access carefully selected properties suited to residential, commercial, and investment purposes.' },
  { icon: CalendarCheck, title: 'Site Visits', description: 'Experience properties firsthand through organised site visits designed to help you make informed decisions.' },
  { icon: LineChart, title: 'Investment Advisory', description: 'Receive professional guidance on selecting property opportunities aligned with your financial objectives.' },
  { icon: Headphones, title: 'Customer Support', description: 'Our team remains available throughout your property ownership journey, ensuring a seamless experience.' },
  { icon: Wallet, title: 'Flexible Payment Arrangements', description: 'We work with clients to explore payment options that make property ownership more achievable.' },
  { icon: Lightbulb, title: 'Property Consultation', description: 'Gain insights into property trends, growth areas, and investment opportunities from experienced professionals.' },
];

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
          <p className="text-white/85 text-xl max-w-2xl mx-auto font-light">
            Building Trust. Creating Wealth. Transforming Communities.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          
          {/* History */}
          <div className="prose prose-lg max-w-none text-gray-600 mb-20">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">Who We Are</h2>
            <p className="lead">
              EWAMA Properties Ltd is a trusted real estate company dedicated to providing secure, transparent, and sustainable property investment opportunities. Our goal is to make property ownership a reality for every aspiring homeowner and investor while fostering thriving communities across Kenya.
            </p>
            <p>
              Guided by our belief that every property purchase is a step toward a better future, we focus on delivering value through honesty, professionalism, and customer-centered service.
            </p>
            <p>
              We understand that purchasing property is one of life's most significant investments. That's why we walk with our clients every step of the journey, ensuring they have the information, support, and confidence they need to make informed decisions.
            </p>
          </div>

          {/* Services */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">Comprehensive Real Estate Solutions</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We provide more than property listings. We offer guidance, support, and solutions that simplify your investment journey.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((service) => (
                <div key={service.title} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-5">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
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
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Building More Than Properties</h2>
            {isLoading ? (
              <Skeleton className="h-20 w-3/4 mx-auto" />
            ) : (
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
                {content?.communityImpact || "Through our community-focused initiatives and commitment to social responsibility, we have helped settle more than ten families. Because true success is measured by the difference we make in people's lives."}
              </p>
            )}
            <Link href="/communities">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white gap-2">
                Read Our Impact Story <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
