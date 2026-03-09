import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalNavbar } from '@/components/legal/LegalNavbar';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { LegalTOC } from '@/components/legal/LegalTOC';

export const metadata: Metadata = {
  title: 'Terms of Service | Novba',
  description:
    'Terms of Service for Novba — AI-powered invoicing and financial management for freelancers and digital creators.',
};

const TOC_ENTRIES = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'description', label: 'Description of Service' },
  { id: 'account', label: 'Account Registration & Security' },
  { id: 'billing', label: 'Subscription & Billing' },
  { id: 'acceptable-use', label: 'Acceptable Use' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'payment-processing', label: 'Payment Processing' },
  { id: 'privacy-data', label: 'Privacy & Data' },
  { id: 'limitation', label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'termination', label: 'Termination' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LegalNavbar />

      {/* Hero */}
      <section className="bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black text-gray-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: March 1, 2025
          </p>
          <p className="mt-3 text-base text-gray-600">
            Please read these terms carefully before using Novba. By using our
            service, you agree to be bound by these terms.
          </p>
        </div>
      </section>

      {/* Content + TOC */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto flex max-w-5xl gap-12">
          <LegalTOC entries={TOC_ENTRIES} />
          <article className="min-w-0 flex-1">
            <div className="max-w-3xl rounded-lg bg-white px-6 py-16">
              <Section id="acceptance" title="Acceptance of Terms">
                <p>
                  By accessing or using Novba (&quot;the Service&quot;), you agree
                  to be bound by these Terms of Service. If you do not agree to
                  these terms, you may not use the Service. You must be at least
                  18 years of age to use Novba, or have the consent of a parent
                  or legal guardian. If you are using the Service on behalf of a
                  business or other entity, you represent that you have the
                  authority to bind that entity to these terms.
                </p>
              </Section>

              <Section id="description" title="Description of Service">
                <p>
                  Novba provides an AI-powered invoicing and financial management
                  platform designed for freelancers and digital creators. Our
                  features include invoice creation and management, client
                  management, proposal and contract creation, expense tracking,
                  AI pricing recommendations, cash flow forecasting, and payment
                  processing. The Service is provided &quot;as is.&quot; We do
                  not guarantee uninterrupted availability, and the free tier
                  does not include a service-level agreement (SLA). Pro and
                  Studio subscription tiers receive priority support as described
                  in our pricing materials.
                </p>
              </Section>

              <Section id="account" title="Account Registration & Security">
                <p>
                  You must provide accurate, current, and complete information
                  when registering and must keep that information up to date. You
                  are responsible for maintaining the confidentiality of your
                  password and for all activity under your account. You must
                  notify Novba immediately of any unauthorized access or use of
                  your account. Each person may maintain only one account; account
                  sharing is not permitted. Novba reserves the right to suspend
                  or terminate accounts that violate these terms or that we
                  reasonably believe pose a security or abuse risk.
                </p>
              </Section>

              <Section id="billing" title="Subscription & Billing">
                <p>
                  The free tier offers limited features as described on our
                  pricing page. Paid tiers (Pro and Studio) are billed monthly or
                  annually via Stripe. Subscriptions automatically renew unless
                  you cancel before the renewal date. We do not provide refunds
                  for partial months. For annual plans, we may offer a pro-rated
                  refund if you cancel within 14 days of purchase. Novba reserves
                  the right to change pricing with at least 30 days&apos; notice.
                  Beta users who received lifetime free access remain subject to
                  their original terms and are grandfathered accordingly.
                </p>
              </Section>

              <Section id="acceptable-use" title="Acceptable Use">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>
                    Conduct or facilitate illegal activity, fraud, or money
                    laundering;
                  </li>
                  <li>
                    Upload malicious code or attempt to breach or circumvent our
                    security measures;
                  </li>
                  <li>
                    Impersonate another user, business, or entity;
                  </li>
                  <li>
                    Scrape, crawl, or use automated means to access the Service
                    without our prior written permission;
                  </li>
                  <li>
                    Resell, white-label, or commercially redistribute Novba
                    without a separate written agreement.
                  </li>
                </ul>
                <p className="mt-4">
                  Violations may result in immediate termination of your account
                  without refund.
                </p>
              </Section>

              <Section id="ip" title="Intellectual Property">
                <p>
                  Novba owns all intellectual property in the platform, including
                  branding, software, and proprietary AI models. You retain
                  ownership of your data—including invoices, client information,
                  and documents you create or upload. By using the Service, you
                  grant Novba a limited, non-exclusive license to process your
                  data as necessary to provide and improve the Service. Novba may
                  use anonymized, aggregated data to improve AI features and
                  product quality.
                </p>
              </Section>

              <Section id="payment-processing" title="Payment Processing">
                <p>
                  Payment processing is provided through Stripe and is subject to
                  Stripe&apos;s terms of service. Novba is not responsible for
                  payment failures, delays, or errors caused by third-party
                  processors. You are responsible for ensuring that tax
                  information on your invoices is accurate and compliant with
                  applicable law. Novba does not provide tax, legal, or
                  accounting advice.
                </p>
              </Section>

              <Section id="privacy-data" title="Privacy & Data">
                <p>
                  How we collect, use, and protect your data is described in our{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-orange-600 underline hover:text-orange-700"
                  >
                    Privacy Policy
                  </Link>
                  . Novba uses industry-standard encryption to protect your data
                  in transit and at rest. You may export or delete your data at
                  any time through your account settings.
                </p>
              </Section>

              <Section id="limitation" title="Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, Novba is not liable for
                  any indirect, incidental, special, consequential, or punitive
                  damages arising from your use of the Service. Our total
                  liability for any claims arising from or related to the Service
                  is limited to the fees you paid to Novba in the 12 months
                  preceding the claim. Novba is not responsible for client
                  non-payment, lost business, or other losses you may experience.
                  We are not liable for failures or delays caused by events
                  beyond our reasonable control, including natural disasters,
                  outages of third-party services, or other force majeure events.
                </p>
              </Section>

              <Section id="indemnification" title="Indemnification">
                <p>
                  You agree to indemnify, defend, and hold harmless Novba and its
                  officers, directors, employees, and agents from and against any
                  claims, damages, losses, liabilities, and expenses (including
                  reasonable attorneys&apos; fees) arising from your use of the
                  Service, your violation of these terms, or your violation of
                  any third-party rights.
                </p>
              </Section>

              <Section id="termination" title="Termination">
                <p>
                  You may cancel your account at any time from your account
                  settings. Novba may suspend or terminate your account if you
                  violate these terms. Upon termination, you will have 30 days
                  to export your data; after that period, we will delete your
                  data in accordance with our data retention policy. Paid
                  subscriptions will remain active until the end of the current
                  billing period and will not renew after cancellation.
                </p>
              </Section>

              <Section id="governing-law" title="Governing Law">
                <p>
                  These terms are governed by the laws of the State of Delaware,
                  United States, without regard to conflict of law principles.
                  Any dispute arising from or relating to these terms or the
                  Service shall be resolved by binding arbitration in accordance
                  with the rules of the American Arbitration Association. You
                  agree to waive any right to participate in a class action or
                  class-wide arbitration.
                </p>
              </Section>

              <Section id="changes" title="Changes to Terms">
                <p>
                  Novba may update these terms from time to time. We will provide
                  at least 30 days&apos; notice of material changes by email to
                  the address associated with your account. Your continued use of
                  the Service after the effective date of the changes
                  constitutes acceptance of the updated terms.
                </p>
              </Section>

              <Section id="contact" title="Contact">
                <p>
                  For questions about these Terms of Service, please contact us
                  at{' '}
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
