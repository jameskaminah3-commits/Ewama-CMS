import { PublicLayout } from '@/components/layout/PublicLayout';
import { Seo } from '@/components/Seo';

export default function TermsOfService() {
  return (
    <PublicLayout>
      <Seo
        title="Terms of Service"
        description="The terms governing your use of the EWAMA Properties Ltd website and services."
      />
      <div className="bg-primary pt-16 pb-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-light">
            The terms that govern your use of our website and services.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto prose prose-lg text-gray-600">
          <p className="text-sm text-gray-400">Last updated: July 2026</p>

          <h2 className="text-2xl font-heading font-bold text-primary">1. About These Terms</h2>
          <p>
            These terms apply to your use of the EWAMA Properties Ltd website. By using this website, you
            agree to these terms. Property purchases themselves are governed by separate sale agreements
            executed between you and EWAMA Properties Ltd.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">2. Property Information</h2>
          <p>
            We make every effort to keep property listings, prices, and availability accurate and current.
            However, listings on this website are an invitation to treat, not a binding offer. Prices,
            availability, and property details are subject to confirmation at the time of purchase and may
            change without notice. Photographs and illustrations are indicative.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">3. Enquiries & Site Visits</h2>
          <p>
            Submitting an enquiry or booking a site visit does not reserve a property. Site visits are
            scheduled subject to confirmation by our team, and we may reschedule where necessary.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">4. Payments</h2>
          <p>
            All payments for properties are made strictly to EWAMA Properties Ltd official accounts as set
            out in your sale agreement. Never make payments to personal accounts. We will never ask you for
            payment through this website.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">5. Intellectual Property</h2>
          <p>
            All content on this website — including text, photographs, logos, and branding — belongs to EWAMA
            Properties Ltd or its licensors and may not be reproduced without our written permission.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">6. Limitation of Liability</h2>
          <p>
            This website is provided "as is". To the fullest extent permitted by law, EWAMA Properties Ltd is
            not liable for any loss arising from reliance on website content alone. Always conduct your own
            due diligence and rely on the executed sale agreement for the terms of any purchase.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">7. Governing Law</h2>
          <p>These terms are governed by the laws of the Republic of Kenya.</p>

          <h2 className="text-2xl font-heading font-bold text-primary">8. Contact</h2>
          <p>
            Questions about these terms? Contact us at{' '}
            <a href="mailto:info@ewamaproperties.co.ke" className="text-secondary">info@ewamaproperties.co.ke</a>{' '}
            or call <a href="tel:0720769999" className="text-secondary">0720 769 999</a>.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
