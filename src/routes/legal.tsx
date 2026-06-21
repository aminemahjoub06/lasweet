import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/legal")({
  component: LegalPage,
  head: () => ({
    meta: [
      { title: "Legal Notice — L&A Sweet" },
      { name: "description", content: "L&A Sweet legal notice and business information." },
      { name: "robots", content: "index,follow" },
    ],
  }),
});

function LegalPage() {
  return (
    <main className="min-h-screen bg-ink text-foreground">
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-16 md:py-24">
        <div className="eyebrow mb-6">Legal</div>
        <h1 className="font-serif-display text-4xl md:text-5xl mb-10">
          Legal <span className="italic text-gold">Notice</span>
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-[color:var(--foreground)]/85">
          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">Business Information</h2>
            <div className="space-y-2">
              <p><strong>Business name:</strong> L&amp;A Sweet</p>
              <p><strong>ABN:</strong> to be provided</p>
              <p><strong>Location:</strong> Brisbane, Queensland, Australia</p>
              <p><strong>Contact:</strong> l.asweetbne@gmail.com</p>
            </div>
            <p className="mt-3">
              L&amp;A Sweet is a small handcrafted dessert business operating from Brisbane, Queensland.
              All products are made by hand in small batches using premium ingredients.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">Website Owner and Publisher</h2>
            <p>
              This website is owned, published and maintained by L&amp;A Sweet.
              All content, imagery and branding are the exclusive property of L&amp;A Sweet unless otherwise credited.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">Hosting and Infrastructure</h2>
            <p>
              This website is hosted on a cloud infrastructure platform. The platform provides server,
              database and content delivery services. For technical issues related to site availability
              or performance, please contact us and we will liaise with our hosting provider as needed.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">Payment Processing</h2>
            <p>
              Online card payments are processed securely by Stripe, a regulated payment services provider.
              Stripe handles all card data in accordance with PCI DSS standards. L&amp;A Sweet does not store
              or have access to your payment card details.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">Intellectual Property</h2>
            <p className="mb-3">
              All intellectual property rights in this website and its content are reserved, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Trademarks, logos and trading names</li>
              <li>Product photographs and visual assets</li>
              <li>Written content, descriptions and recipes</li>
              <li>Website design, layout and user interface</li>
            </ul>
            <p className="mt-3">
              Unauthorised use, reproduction or distribution of any content is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">Liability Disclaimer</h2>
            <p>
              While every effort is made to ensure the accuracy of information on this website,
              L&amp;A Sweet provides all content on an "as is" basis without warranties of any kind,
              express or implied. We reserve the right to correct errors, update product availability
              and modify pricing without prior notice.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">External Links</h2>
            <p>
              This website may contain links to external sites, including our social media profiles.
              L&amp;A Sweet is not responsible for the content, privacy practices or availability of
              third-party websites. We encourage you to review the terms and policies of any external
              sites you visit.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">Complaints and Dispute Resolution</h2>
            <p>
              If you have a complaint about our products or services, please contact us directly
              at l.asweetbne@gmail.com.
              We are committed to resolving issues fairly and promptly.
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
