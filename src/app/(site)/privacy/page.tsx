import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Christine's Exotic Eats collects, uses, and protects the personal information you share when sending an enquiry.",
};

const LAST_UPDATED = "31 May 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      overline="The fine print"
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
    >
      <p>
        Christine&rsquo;s Exotic Eats (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;) is a family-run catering business based in Darwin,
        Northern Territory. This policy explains what personal information we
        collect when you use this website, why we collect it, and how we look
        after it. We handle personal information in line with the Australian
        Privacy Principles under the <em>Privacy Act 1988</em> (Cth).
      </p>

      <LegalSection title="What we collect">
        <p>
          We only collect the information you choose to give us. When you send
          an enquiry through this site, that includes:
        </p>
        <ul>
          <li>Your name, email address, and phone number;</li>
          <li>
            Event details — the date, type of event, approximate guest count,
            and your pick-up or delivery preference and address;
          </li>
          <li>
            The items and quantities you&rsquo;re interested in, and any notes
            you add, such as dietary requirements, allergies, or custom requests.
          </li>
        </ul>
        <p>
          We do not collect payment card details through this website. Any
          payment is arranged directly with you after we confirm your booking.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>We use your information only to:</p>
        <ul>
          <li>Respond to your enquiry and confirm availability;</li>
          <li>Prepare a quote and organise your order;</li>
          <li>Arrange pick-up or delivery; and</li>
          <li>Contact you about your booking.</li>
        </ul>
        <p>
          We will not sell or rent your information, and we won&rsquo;t send you
          marketing without your consent.
        </p>
      </LegalSection>

      <LegalSection title="Who we share it with">
        <p>
          Your enquiry is stored securely with our hosting and database provider
          (Supabase) so that Christine can read and respond to it. We may share
          relevant details with delivery help where needed to fulfil your order.
          We do not otherwise disclose your information to third parties unless
          required by law.
        </p>
      </LegalSection>

      <LegalSection title="How we protect it">
        <p>
          Enquiries are transmitted over an encrypted connection and stored on
          access-controlled systems. We keep your information only as long as we
          need it to manage your enquiry and meet our record-keeping
          obligations, then remove it.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can ask us to access, correct, or delete the personal information
          we hold about you. Just get in touch using the details below and
          we&rsquo;ll help. If you have a concern about how we&rsquo;ve handled
          your information, please contact us first so we can put it right.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          For any privacy questions or requests, reach Christine&rsquo;s Exotic
          Eats through the{" "}
          <a href="/inquire">enquiry form</a> or via our Facebook and Instagram
          pages. We&rsquo;re based in Darwin, NT.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
