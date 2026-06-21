import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — L&A Sweet" },
      { name: "description", content: "L&A Sweet privacy policy. How we collect, use and protect your personal information." },
      { name: "robots", content: "index,follow" },
    ],
  }),
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink text-foreground">
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-16 md:py-24">
        <div className="eyebrow mb-6">Legal</div>
        <h1 className="font-serif-display text-4xl md:text-5xl mb-10">
          Privacy <span className="italic text-gold">Policy</span>
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-[color:var(--foreground)]/85">
          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">1. Introduction</h2>
            <p className="mb-3">
              L&A Sweet respects your privacy and is committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, store and disclose the information you provide
              when you visit our website or place an order with us.
            </p>
            <p>
              This Privacy Policy is governed by the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">2. Information We Collect</h2>
            <p className="mb-3">
              When you place an order, we collect the following details to process and fulfil your request:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Delivery address (if applicable)</li>
              <li>Business name (optional)</li>
              <li>Order details, including selected products, quantities and pricing</li>
              <li>Any special notes or requests you include with your order</li>
            </ul>
            <p className="mt-3">
              We do not collect or store your payment card details. All online card payments are processed securely
              through Stripe, and cash orders are settled in person on pick-up or delivery.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your personal information solely for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process, confirm and fulfil your order</li>
              <li>To contact you regarding your order status, delivery or pick-up arrangements</li>
              <li>To respond to your enquiries or special requests</li>
              <li>To maintain records of transactions for accounting and legal compliance</li>
            </ul>
            <p className="mt-3">
              We do not use your information for marketing purposes unless you have explicitly opted in,
              and we never sell or rent your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">4. Cookies and Analytics</h2>
            <p>
              Our website uses essential cookies to ensure basic functionality, such as maintaining your
              shopping cart and remembering your banner preferences. We do not currently use third-party
              analytics or tracking cookies. If this changes in the future, we will update this policy
              and request your consent where required.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">5. Data Storage and Security</h2>
            <p>
              We use Supabase (hosted on AWS) as our database and authentication provider, and Stripe for
              payment processing. Data may be stored or processed outside of Australia.
              We implement reasonable technical and organisational measures to protect your data from unauthorised
              access, alteration or disclosure. Access to order records is restricted to authorised personnel only.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">6. Third-Party Services</h2>
            <p className="mb-3">
              We rely on the following third-party services to operate our business:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Stripe</strong> — for secure online card payment processing. Stripe collects and processes
                your payment information in accordance with its own privacy policy.
              </li>
              <li>
                <strong>Cloud infrastructure provider</strong> — for secure database hosting and server operations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">7. Your Rights</h2>
            <p className="mb-3">
              You have the right to access, correct or request deletion of your personal information held by us.
              To exercise these rights, please contact us using the details below. We will respond within a reasonable timeframe.
            </p>
            <p>
              You have the right to lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au if you believe your privacy has been breached.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">8. Data Retention</h2>
            <p>
              Order and customer data is retained for 7 years to comply with Australian tax and accounting obligations. After this period, data is deleted or anonymised.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
              The latest version will always be available on this page, and we encourage you to review it periodically.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">10. Contact Us</h2>
            <p>
              For any privacy-related request, contact us at l.asweetbne@gmail.com.
            </p>
          </section>

          <div className="pt-8 border-t border-line text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/50">
            Last updated: 21/06/2026
          </div>
        </div>

        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
