import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — L&A Sweet, Brisbane" },
      { name: "description", content: "L&A Sweet terms and conditions of sale, delivery, pick-up, cancellations and refunds. Governed by the laws of Queensland, Australia." },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Terms & Conditions — L&A Sweet" },
      { property: "og:url", content: "https://la-sweet-bne.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://la-sweet-bne.com/terms" }],
  }),
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-ink text-foreground">
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-16 md:py-24">
        <div className="eyebrow mb-6">Legal</div>
        <h1 className="font-serif-display text-4xl md:text-5xl mb-10">
          Terms <span className="italic text-gold">&amp; Conditions</span>
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-[color:var(--foreground)]/85">
          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">1. Overview</h2>
            <p>
              These Terms &amp; Conditions govern your use of the L&A Sweet website and the placement of orders
              for our handcrafted dessert products. By placing an order with us, you agree to be bound by these terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">2. Orders and Acceptance</h2>
            <p className="mb-3">
              All orders placed through our website are subject to confirmation and availability.
              Upon receipt of your order request, we will review the details and contact you to confirm
              availability, final pricing and fulfilment arrangements. An order is only considered accepted
              once we have confirmed it with you directly.
            </p>
            <p>
              We reserve the right to decline any order for reasons including limited production capacity,
              ingredient availability or logistical constraints.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">3. Pricing and Payment</h2>
            <p className="mb-3">
              All prices displayed on our website are in Australian Dollars (AUD) and are inclusive of
              applicable taxes unless otherwise stated.
            </p>
            <p className="mb-3">
              <strong>Order request process.</strong> Due to high demand and the limited availability of our
              premium ingredients, all orders placed on our website are currently submitted as
              <em> requests</em>. No payment is taken when you submit a request. We review availability and
              respond within 24 hours. If your request is approved, we email you a secure payment link
              valid for 24 hours; your order becomes firm once payment is completed. If the link is not used
              within 24 hours, the reservation expires and the time slot is released. If we cannot fulfil your
              request, we decline it and you are charged nothing.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Pay in full:</strong> Pay 100% securely by card via Stripe on the payment link.
                Nothing else to settle on pick-up or delivery.
              </li>
              <li>
                <strong>50% deposit:</strong> Pay a 50% deposit securely by card via Stripe on the payment link
                to secure your order. The remaining 50% is collected in cash at pick-up or delivery.
              </li>
            </ul>
            <p className="mt-3">
              Delivery fees are calculated based on the distance from our Woolloongabba kitchen to your
              delivery address. Your exact fee is shown at checkout: A$10 up to 10 km, A$18 from 10 to 15 km,
              A$28 from 15 to 25 km, A$30 from 25 to 35 km, and A$35 from 35 to 42 km. Deliveries
              beyond 25 km require a minimum of 5 pieces per order. We do not deliver beyond 42 km;
              for those addresses, please contact us at l.asweetbne@gmail.com for a custom quote.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">4. Delivery and Pick-up</h2>
            <p className="mb-3">
              Orders must be placed at least 1 day (D+1) in advance to allow for preparation. Same-day orders are not accepted.
            </p>
            <p className="mb-3">
              We currently serve the Brisbane, Queensland area. Delivery dates and times are arranged
              by mutual agreement after order confirmation. Specific delivery times cannot be guaranteed
              but we will do our best to accommodate your preferred window.
            </p>
            <p className="mb-3">
              Delivery zones and fees, measured from our Woolloongabba kitchen: 0–10 km A$10, 10–15 km
              A$18, 15–25 km A$28 (no minimum order); 25–35 km A$30 and 35–42 km A$35, both requiring a
              minimum of 5 pieces per order. Long-distance deliveries take significantly longer, so they
              are only accepted from 5 pieces upwards — smaller orders remain available as a free pick-up.
              We do not deliver beyond 42 km; please contact us at l.asweetbne@gmail.com for a custom quote.
            </p>
            <p>
              For pick-up orders, we will provide the collection address and agreed time upon confirmation.
              Please ensure you collect your order at the arranged time, as our products are perishable and
              made fresh to order.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">5. Cancellations and Refunds</h2>
            <p className="mb-3">
              Because our desserts are handcrafted to order with fresh ingredients, cancellations must be
              requested as early as possible.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Cancellations made at least 1 day before the agreed delivery or pick-up date are eligible
                for a full refund of any amount paid online (deposit or full payment).
              </li>
              <li>
                Cancellations made less than 1 day before the agreed pick-up or delivery time are
                <strong> not eligible for a refund</strong>, as production has already begun. This applies to
                both deposits and full payments — <strong>deposits are non-refundable</strong> within this
                1-day window.
              </li>
              <li>
                If you are dissatisfied with your order due to a defect or error on our part, please contact us
                within 24 hours of receipt and we will work with you to resolve the matter, which may include
                a partial or full refund at our discretion.
              </li>
            </ul>
            <h3 className="font-serif-display text-lg text-gold mt-6 mb-2">No-show policy (pick-up orders)</h3>
            <p className="mb-3">
              When you place a pick-up order you choose a specific collection time. We allow a grace period of
              <strong> 1 hour</strong> after that time. If your order has not been collected within that hour and
              you have not contacted us, the order is <strong>automatically cancelled</strong> and the amount
              already paid — whether a 50% deposit or a full payment — is <strong>not refundable</strong>. This is
              because your desserts are handcrafted fresh for your chosen slot and cannot be resold.
            </p>
            <p>
              This policy is disclosed before purchase, at checkout and in your order confirmation email. If
              something comes up and you can't make your slot, please contact us as soon as possible at{" "}
              <a href="mailto:l.asweetbne@gmail.com" className="text-gold underline">l.asweetbne@gmail.com</a>{" "}
              and we will do our best to accommodate you. Nothing in this policy limits your rights under the
              Australian Consumer Law.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">6. Allergens and Dietary Requirements</h2>
            <p>
              Our products contain allergens including dairy, eggs, gluten and nuts.
              Full allergen information is available on our website. While we take care to avoid cross-contact,
              our kitchen handles all listed allergens and we cannot guarantee that any product is completely free
              from traces of allergens. If you have a severe allergy, please contact us before ordering.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">7. Product Storage and Transport</h2>
            <p>
              Our desserts are freshly made and must be kept refrigerated at 2–4°C. They are best consumed within 24 hours of pick-up or delivery. Avoid prolonged exposure to heat or direct sunlight during transport.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">8. Intellectual Property</h2>
            <p>
              All content on this website — including images, product descriptions, logos and design — is the
              property of L&A Sweet and is protected by copyright and other intellectual property laws.
              You may not reproduce, distribute or use any content without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">9. Limitation of Liability</h2>
            <p>
              To the extent permitted by Australian consumer law, L&A Sweet's liability for any loss or damage
              arising from your use of our website or products is limited to the amount you paid for the
              specific order in question. We are not liable for indirect, incidental or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">10. Governing Law</h2>
            <p>
              These Terms &amp; Conditions are governed by the laws of Queensland, Australia.
              Any disputes arising from these terms will be resolved in the courts of Queensland.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-gold mb-3">11. Changes to These Terms</h2>
            <p>
              We may update these Terms &amp; Conditions from time to time. The current version will always
              be available on this page. Continued use of our website and services constitutes acceptance of the latest terms.
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
