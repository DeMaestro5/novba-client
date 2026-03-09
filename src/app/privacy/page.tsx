import type { Metadata } from 'next';
import { LegalNavbar } from '@/components/legal/LegalNavbar';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { LegalTOC } from '@/components/legal/LegalTOC';

export const metadata: Metadata = {
  title: 'Privacy Policy | Novba',
  description:
    'Privacy Policy for Novba — how we collect, use, and protect your data when you use our AI-powered invoicing and financial management platform.',
};

const TOC_ENTRIES = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'data-sharing', label: 'Data Sharing' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'international', label: 'International Transfers' },
  { id: 'third-party-links', label: 'Third-Party Links' },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LegalNavbar />

      {/* Hero */}
      <section className="bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: March 1, 2025
          </p>
          <p className="mt-3 text-base text-gray-600">
            Novba is committed to protecting your privacy. This policy explains
            what data we collect, how we use it, and your rights regarding your
            information.
          </p>
        </div>
      </section>

      {/* Content + TOC */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto flex max-w-5xl gap-12">
          <LegalTOC entries={TOC_ENTRIES} />
          <article className="min-w-0 flex-1">
            <div className="max-w-3xl rounded-lg bg-white px-6 py-16">
              <Section id="introduction" title="Introduction">
                <p>
                  Novba (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
                  committed to protecting your privacy. This Privacy Policy
                  explains what information we collect, how we use it, how we
                  share it, and what rights you have. It applies to novba.com and
                  all Novba products and services.
                </p>
              </Section>

              <Section id="information-we-collect" title="Information We Collect">
                <p className="mb-4">
                  We collect information in three ways:
                </p>
                <p className="mb-2 font-medium text-gray-900">
                  A. Information you provide
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>
                    <strong>Account:</strong> Name, email address, password
                    (stored in hashed form), and optional profile photo.
                  </li>
                  <li>
                    <strong>Business information:</strong> Business name,
                    address, tax ID, and logo.
                  </li>
                  <li>
                    <strong>Financial data:</strong> Invoice details, client
                    information, expense records, and related documents you
                    create or upload.
                  </li>
                  <li>
                    <strong>Payment:</strong> Billing is processed by Stripe.
                    Novba does not store your full card number; Stripe handles
                    payment card data in accordance with their own policies.
                  </li>
                </ul>
                <p className="mb-2 font-medium text-gray-900">
                  B. Information collected automatically
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>
                    <strong>Usage data:</strong> Pages visited, features used,
                    and session duration.
                  </li>
                  <li>
                    <strong>Device information:</strong> Browser type, operating
                    system, and IP address.
                  </li>
                  <li>
                    <strong>Cookies and similar technologies:</strong> As
                    described in the Cookies section below.
                  </li>
                </ul>
                <p className="mb-2 font-medium text-gray-900">
                  C. Information from third parties
                </p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>
                    <strong>OAuth providers (e.g., Google, GitHub):</strong> Name,
                    email, and profile photo when you sign in with these
                    services.
                  </li>
                  <li>
                    <strong>Stripe:</strong> Payment confirmation and
                    subscription status to manage your billing.
                  </li>
                </ul>
              </Section>

              <Section id="how-we-use" title="How We Use Your Information">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>Provide, maintain, and improve the Novba service;</li>
                  <li>Process payments and manage your subscription;</li>
                  <li>Send transactional emails (e.g., invoices, receipts, verification);</li>
                  <li>Send product updates and relevant communications (you may unsubscribe from marketing);</li>
                  <li>Train and improve our AI pricing models using only anonymized or aggregated data;</li>
                  <li>Prevent fraud and enhance security;</li>
                  <li>Comply with legal obligations.</li>
                </ul>
              </Section>

              <Section id="data-sharing" title="Data Sharing">
                <p>
                  We do <strong>not</strong> sell your personal data—ever. We
                  share data only in these circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>
                    <strong>Stripe</strong> — for payment processing;
                  </li>
                  <li>
                    <strong>Email service providers</strong> — for transactional
                    emails only;
                  </li>
                  <li>
                    <strong>Infrastructure providers</strong> — for hosting and
                    databases, under strict data processing agreements;
                  </li>
                  <li>
                    <strong>Law enforcement</strong> — when legally required.
                  </li>
                </ul>
                <p className="mt-4">
                  We do not share your data with advertising networks or data
                  brokers.
                </p>
              </Section>

              <Section id="cookies" title="Cookies">
                <p>
                  We use cookies and similar technologies for:
                </p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>
                    <strong>Essential cookies:</strong> Authentication and
                    session management so the service works correctly.
                  </li>
                  <li>
                    <strong>Analytics cookies:</strong> Understanding how the
                    product is used (you can disable these in your browser or
                    our settings where offered).
                  </li>
                </ul>
                <p className="mt-4">
                  We do not use third-party advertising cookies. You can manage
                  or delete cookies through your browser settings.
                </p>
              </Section>

              <Section id="data-retention" title="Data Retention">
                <ul className="list-disc pl-6 text-gray-600">
                  <li>
                    <strong>Active accounts:</strong> We retain your data for the
                    duration of your account.
                  </li>
                  <li>
                    <strong>Cancelled accounts:</strong> Data is retained for 30
                    days after cancellation to allow export, then deleted.
                  </li>
                  <li>
                    <strong>Backups:</strong> Deleted data may persist in
                    backups for up to 90 days before being purged.
                  </li>
                  <li>
                    <strong>Legal hold:</strong> We may retain certain data longer
                    when required by law (e.g., litigation, regulatory requests).
                  </li>
                </ul>
              </Section>

              <Section id="data-security" title="Data Security">
                <p>We protect your data using:</p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>256-bit SSL encryption for data in transit;</li>
                  <li>Encryption of data at rest;</li>
                  <li>Regular security assessments;</li>
                  <li>Access controls so only authorized employees can access data as needed;</li>
                  <li>Notification to affected users in the event of a data breach, where required by law.</li>
                </ul>
              </Section>

              <Section id="your-rights" title="Your Rights">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal data;
                  </li>
                  <li>
                    <strong>Correction:</strong> Update inaccurate data in your
                    account;
                  </li>
                  <li>
                    <strong>Deletion:</strong> Delete your account and associated data;
                  </li>
                  <li>
                    <strong>Export:</strong> Download your data in standard formats;
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing emails.
                  </li>
                </ul>
                <p className="mt-4">
                  If you are in the European Economic Area, you also have
                  additional rights under the GDPR, including data portability
                  and the right to object to certain processing. If you are a
                  California resident, you have rights under the CCPA, including
                  the right to know, delete, and opt out of the sale of your
                  data—we do not sell personal data.
                </p>
                <p className="mt-4">
                  To exercise any of these rights, contact us at{' '}
                  <a
                    href="mailto:legal@novba.com"
                    className="font-medium text-orange-600 underline hover:text-orange-700"
                  >
                    legal@novba.com
                  </a>
                  .
                </p>
              </Section>

              <Section id="children" title="Children's Privacy">
                <p>
                  Novba is not directed to children under 13. We do not
                  knowingly collect personal information from children under 13.
                  If we learn that we have collected such information, we will
                  delete it as quickly as possible. If you believe we have
                  collected a child&apos;s information, please contact us at{' '}
                  <a
                    href="mailto:legal@novba.com"
                    className="font-medium text-orange-600 underline hover:text-orange-700"
                  >
                    legal@novba.com
                  </a>
                  .
                </p>
              </Section>

              <Section id="international" title="International Transfers">
                <p>
                  Your data is stored and processed in the United States. If you
                  access Novba from outside the United States, you consent to
                  this transfer. For users in the European Union and other
                  jurisdictions that require additional safeguards, we use
                  Standard Contractual Clauses (or equivalent mechanisms) where
                  applicable to protect your data when it is transferred.
                </p>
              </Section>

              <Section id="third-party-links" title="Third-Party Links">
                <p>
                  Our platform may contain links to external websites or
                  services. Novba is not responsible for the privacy practices
                  of third parties. We encourage you to read their privacy
                  policies before providing any personal information.
                </p>
              </Section>

              <Section id="changes" title="Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of material changes by email or through a prominent
                  notice in the product at least 30 days before the change takes
                  effect. Your continued use of Novba after the effective date
                  constitutes acceptance of the updated policy.
                </p>
              </Section>

              <Section id="contact" title="Contact">
                <p>
                  For privacy-related questions or to submit a data request,
                  contact us at{' '}
                  <a
                    href="mailto:legal@novba.com"
                    className="font-medium text-orange-600 underline hover:text-orange-700"
                  >
                    legal@novba.com
                  </a>
                  .
                </p>
              </Section>
            </div>
          </article>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-b border-gray-100 pb-10 mb-10 last:border-b-0 last:pb-0 last:mb-0"
    >
      <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
      <div className="text-base leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}
