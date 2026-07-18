import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <Seo
        title="Privacy Policy"
        description="How EWAMA Properties Ltd collects, uses, and protects your personal information."
      />
      <PageHeader
        kicker="Legal"
        title="Privacy Policy"
        subtitle="Your trust is our foundation. Here is how we handle your information."
      />

      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto prose prose-lg text-gray-600">
          <p className="text-sm text-gray-400">Last updated: July 2026</p>

          <h2 className="text-2xl font-heading font-bold text-primary">1. Who We Are</h2>
          <p>
            EWAMA Properties Ltd ("EWAMA", "we", "us") is a Kenyan real estate company. This policy explains
            how we collect, use, and protect personal information when you use our website, enquire about a
            property, book a site visit, or subscribe to our updates. We process personal data in accordance
            with the Data Protection Act, 2019 (Kenya).
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">2. Information We Collect</h2>
          <p>We collect only the information you choose to share with us:</p>
          <ul>
            <li><strong>Contact details</strong> — your name, email address, and phone number when you submit an enquiry, book a site visit, or contact us.</li>
            <li><strong>Enquiry details</strong> — the property you are interested in and the message you send us.</li>
            <li><strong>Newsletter subscription</strong> — your email address if you subscribe to our updates.</li>
          </ul>
          <p>We do not collect payment card details through this website.</p>

          <h2 className="text-2xl font-heading font-bold text-primary">3. How We Use Your Information</h2>
          <ul>
            <li>To respond to your enquiries and schedule site visits.</li>
            <li>To share information about properties and investment opportunities you have expressed interest in.</li>
            <li>To send occasional newsletters if you have subscribed (you can unsubscribe at any time).</li>
            <li>To improve our services and website experience.</li>
          </ul>

          <h2 className="text-2xl font-heading font-bold text-primary">4. Sharing of Information</h2>
          <p>
            We do not sell or rent your personal information. We only share it with trusted service providers
            who help us operate this website (such as our hosting providers), and only to the extent necessary,
            or where required by law.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">5. Data Security & Retention</h2>
          <p>
            We apply appropriate technical and organisational measures to protect your data, and we retain it
            only for as long as needed to serve you or as required by law.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">6. Your Rights</h2>
          <p>
            Under Kenyan data protection law you have the right to access, correct, or request deletion of your
            personal data, and to object to or restrict its processing. To exercise any of these rights, contact
            us at <a href="mailto:info@ewamaproperties.com" className="text-secondary">info@ewamaproperties.com</a>.
          </p>

          <h2 className="text-2xl font-heading font-bold text-primary">7. Contact</h2>
          <p>
            For any privacy questions, reach us at{' '}
            <a href="mailto:info@ewamaproperties.com" className="text-secondary">info@ewamaproperties.com</a>{' '}
            or call <a href="tel:+254720769999" className="text-secondary">+254 720 769 999</a>.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
