import { useMemo } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Phone, Mail } from 'lucide-react';
import { useListProperties } from '@workspace/api-client-react';

const buildFaqSections = (locationAnswer: string): { section: string; items: { q: string; a: string }[] }[] => [
  {
    section: 'General Questions',
    items: [
      {
        q: 'What does EWAMA Properties Ltd do?',
        a: 'EWAMA Properties Ltd is a trusted real estate company specialising in the sale of verified residential, commercial, and investment properties across Kenya. We also provide investment guidance, organise site visits, and support clients throughout the property acquisition process.',
      },
      {
        q: 'Where are your projects located?',
        a: locationAnswer,
      },
      {
        q: 'How do I know the property is genuine?',
        a: 'Transparency is at the heart of our business. Every property undergoes due diligence before being offered for sale. We provide clear information about each development and guide clients through the documentation process to ensure confidence and peace of mind.',
      },
    ],
  },
  {
    section: 'Buying Property',
    items: [
      {
        q: 'How do I reserve a plot?',
        a: 'Once you’ve selected your preferred property, our sales team will guide you through the reservation process and explain the next steps, including payment options and required documentation.',
      },
      {
        q: 'Can I visit the property before buying?',
        a: 'Absolutely. We encourage all prospective buyers to schedule a site visit. Seeing the property firsthand allows you to evaluate the location, accessibility, and surrounding environment before making your decision.',
      },
      {
        q: 'Do you offer installment payment plans?',
        a: 'Yes. Many of our developments offer flexible installment options designed to make property ownership more accessible. The available plans vary by project, and our team will gladly explain the options.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'No. We believe in transparent pricing. Any applicable costs, including title deed processing fees where relevant, will be clearly communicated before you commit to a purchase.',
      },
    ],
  },
  {
    section: 'Ownership & Documentation',
    items: [
      {
        q: 'Will I receive ownership documents?',
        a: 'Yes. Once all purchase requirements have been met, we guide you through the documentation process and ensure you receive the appropriate ownership documents for your property.',
      },
      {
        q: 'Are the plots beaconed?',
        a: 'Most of our developments are professionally beaconed, making it easy to identify plot boundaries during and after purchase.',
      },
      {
        q: 'Are the developments fenced?',
        a: 'Many of our projects are fenced to improve organisation, security, and ease of identification. Specific features are listed on each project page.',
      },
    ],
  },
  {
    section: 'Investment',
    items: [
      {
        q: 'Is buying land a good investment?',
        a: 'Land has consistently remained one of the most dependable long-term investments. As infrastructure improves and communities expand, strategically located property often increases in value, making it an attractive option for both families and investors.',
      },
      {
        q: 'Which property is best for me?',
        a: 'The right investment depends on your goals, budget, and timeline. Our advisors will help you compare available developments and recommend options that align with your objectives.',
      },
      {
        q: 'Can Kenyans living abroad purchase property through EWAMA?',
        a: 'Yes. We proudly assist members of the diaspora looking to invest in Kenya. Our team provides regular updates, clear communication, and guidance throughout the purchase process, making it easier to invest with confidence from anywhere in the world.',
      },
    ],
  },
  {
    section: 'Site Visits',
    items: [
      {
        q: 'How do I book a site visit?',
        a: 'You can contact us by phone, email, or through the booking form on our website. We’ll arrange a convenient date and time for a guided visit.',
      },
      {
        q: 'Is there a fee for site visits?',
        a: 'Please contact our sales team for details regarding scheduled site visits and any applicable arrangements.',
      },
    ],
  },
  {
    section: 'Customer Support',
    items: [
      {
        q: 'What happens after I buy a property?',
        a: 'Our relationship doesn’t end after the sale. We continue to support you throughout the ownership process by providing guidance, updates, and assistance whenever you need us.',
      },
      {
        q: 'How can I contact EWAMA?',
        a: 'Phone: +254 720 769 999. Email: info@ewamaproperties.com. You can also visit our Contact page to send an enquiry or request a callback.',
      },
    ],
  },
];

export default function Faq() {
  // Build the locations answer from live listings so it never goes stale
  // as projects are added or retired in the admin.
  const { data: propertiesData } = useListProperties({ status: 'available', limit: 50 });
  const faqSections = useMemo(() => {
    const locations = Array.from(
      new Set((propertiesData?.data || []).map(p => p.location).filter(Boolean))
    );
    const locationAnswer = locations.length > 0
      ? `Our developments are located in carefully selected growth areas, currently including ${locations.join(', ')} — strategic locations with strong investment potential. See our Properties page for the up-to-date list of projects.`
      : 'Our developments are located in carefully selected growth areas across Kenya, chosen for their strong investment potential. See our Properties page for the current list of projects.';
    return buildFaqSections(locationAnswer);
  }, [propertiesData?.data]);

  return (
    <PublicLayout>
      <Seo
        title="Frequently Asked Questions"
        description="Answers to the questions we receive most often about buying land through EWAMA Properties — reservations, payments, title deeds, site visits, and diaspora investment."
      />
      <PageHeader
        kicker="We're Here to Help"
        title="Frequently Asked Questions"
        subtitle="Buying property is one of the most important decisions you'll ever make, and it's natural to have questions. Informed buyers make confident investors."
      />

      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-6 lg:px-10 py-16">
        <div className="space-y-14">
          {faqSections.map((group) => (
            <div key={group.section} className="grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-12">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary lg:sticky lg:top-32">
                  {group.section}
                </h2>
              </div>
              <div>
                <Accordion type="single" collapsible className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 md:px-8">
                  {group.items.map((item, idx) => (
                    <AccordionItem key={idx} value={`${group.section}-${idx}`} className={idx === group.items.length - 1 ? 'border-b-0' : ''}>
                      <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-primary">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}

          <div className="bg-primary rounded-2xl p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">Still Have Questions?</h2>
              <p className="text-white/80">
                Our friendly team is ready to help you make informed decisions with confidence — whether you're buying your first plot, investing for the future, or simply exploring your options.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:justify-end gap-4">
              <a href="tel:+254720769999">
                <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 h-12 px-6 gap-2 w-full font-semibold">
                  <Phone className="w-4 h-4" /> +254 720 769 999
                </Button>
              </a>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-12 px-6 gap-2 w-full bg-white/10 hover:bg-white/20 text-white border-white/25">
                  <Mail className="w-4 h-4" /> Send an Enquiry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
