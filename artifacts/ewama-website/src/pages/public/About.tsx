import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { useGetHomepageContent } from '@workspace/api-client-react';
import { Target, Eye, Shield, Users, Home as HomeIcon, CalendarCheck, LineChart, Headphones, Wallet, FileSearch, ArrowRight, Award, Sprout, Lightbulb, HeartHandshake } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const SERVICES = [
  { icon: HomeIcon, title: 'Property Sales', tagline: 'Secure Investments. Endless Possibilities.', description: 'Carefully selected residential, commercial, and investment properties in areas with strong growth potential — every one vetted before it is introduced to our clients.' },
  { icon: LineChart, title: 'Investment Advisory', tagline: 'Making Every Investment Count', description: 'Professional guidance based on market trends, location potential, and your personal objectives. Our goal is not simply to sell property — it is to help you make smart decisions.' },
  { icon: CalendarCheck, title: 'Site Visits', tagline: 'Experience the Property Before You Invest', description: 'Guided visits covering boundaries, accessibility, infrastructure, nearby amenities, and investment potential. Informed buyers make confident investors.' },
  { icon: FileSearch, title: 'Property Verification & Due Diligence', tagline: 'Confidence Begins with Transparency', description: 'Every property we market undergoes comprehensive verification — ownership documentation, legal compliance, and accurate information — before being offered to clients.' },
  { icon: Wallet, title: 'Flexible Payment Plans', tagline: 'Property Ownership Made Accessible', description: 'Upfront purchase or structured installments — we work with you to find an option that fits your budget, with schedules and timelines clearly explained. No surprises.' },
  { icon: Headphones, title: 'Customer Support', tagline: 'A Relationship That Continues Beyond the Sale', description: 'From first inquiry to ownership and beyond, our team is available to answer questions, provide updates, and assist throughout your investment journey.' },
];

const CORE_VALUES = [
  { icon: Shield, title: 'Trust', description: 'Trust is the cornerstone of our business. We communicate openly, act with integrity, and honour every commitment we make.' },
  { icon: Eye, title: 'Transparency', description: 'From property information and pricing to legal documentation and payment plans, we ensure every detail is communicated honestly.' },
  { icon: HeartHandshake, title: 'Customer First', description: 'Every client has unique goals. We take time to understand them and provide tailored guidance aligned with their vision.' },
  { icon: Award, title: 'Excellence', description: 'We continuously pursue the highest standards in service delivery, professionalism, and operational efficiency.' },
  { icon: Sprout, title: 'Sustainability', description: 'We support responsible development that promotes environmental stewardship and long-term community growth.' },
  { icon: Lightbulb, title: 'Innovation', description: 'By embracing modern technologies and customer-focused solutions, we make property ownership simpler and more convenient.' },
];

export default function About() {
  const { data: content, isLoading } = useGetHomepageContent();

  return (
    <PublicLayout>
      <Seo
        title="About Us"
        description="Learn about EWAMA Properties Ltd — a Kenyan real estate company bringing banking-level professionalism, transparency, and trust to land investment."
      />
      <PageHeader
        kicker="About Us"
        title="About EWAMA Properties"
        subtitle="Building Trust. Creating Wealth. Transforming Communities."
      />

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          
          {/* History */}
          <div className="prose prose-lg max-w-none text-gray-600 mb-20">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">Our Story</h2>
            <p className="lead">
              EWAMA Properties Ltd was established with a simple yet powerful purpose: to make property ownership accessible, transparent, and rewarding.
            </p>
            <p>
              We recognised that many aspiring homeowners and investors faced uncertainty when navigating the real estate market — unclear processes, questionable documentation, and limited professional guidance often stood between them and their dreams.
            </p>
            <p>
              We envisioned a different experience. An experience where clients receive honest advice, verified investment opportunities, and personalised support from their first inquiry to the day they proudly receive ownership documents. That vision continues to define everything we do.
            </p>
            <p>
              Today, EWAMA serves individuals looking to build family homes, investors seeking long-term value, businesses searching for strategic locations, and members of the diaspora looking for a trusted partner back home. Regardless of where our clients begin their journey, our mission remains the same: helping them secure a piece of tomorrow with confidence.
            </p>
          </div>

          {/* Office */}
          <div className="mb-20">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/office-frontdesk.webp"
                alt="Inside the EWAMA Properties Customer Care Centre in Kiambu Town"
                loading="lazy"
                className="w-full h-[320px] md:h-[420px] object-cover"
              />
            </div>
            <p className="text-sm text-gray-500 text-center mt-3">
              Our Customer Care Centre in Kiambu Town — karibu.
            </p>
          </div>

          {/* Differentiator */}
          <div className="bg-primary rounded-2xl p-10 md:p-14 text-center mb-20">
            <p className="text-white/60 uppercase tracking-widest text-sm font-semibold mb-4">What Makes EWAMA Different</p>
            <p className="font-heading text-3xl md:text-4xl font-bold text-white leading-snug">
              Many companies sell plots.<br />
              <span className="text-secondary">We build confidence.</span>
            </p>
            <p className="text-white/75 mt-6 max-w-2xl mx-auto leading-relaxed">
              Our focus extends far beyond completing property transactions. We guide clients through every stage of their investment journey, ensuring they understand every decision they make. An informed client is an empowered client.
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
                  <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-secondary text-xs font-semibold uppercase tracking-wide mb-3">{service.tagline}</p>
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
              {CORE_VALUES.map((value) => (
                <div key={value.title} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
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
