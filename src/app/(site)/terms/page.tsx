import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you use the Christine's Exotic Eats website and send an enquiry.",
};

const LAST_UPDATED = "31 May 2026";

export default function TermsPage() {
  return (
    <LegalPage
      overline="The fine print"
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
    >
      <p>
        These terms apply to your use of the Christine&rsquo;s Exotic Eats
        website and the enquiries you send through it. By using this site, you
        agree to them. We&rsquo;re a Darwin-based, family-run catering business,
        and we&rsquo;ve kept this plain on purpose.
      </p>

      <LegalSection title="Enquiries, not orders">
        <p>
          Sending an enquiry through this site is a request — not a confirmed,
          paid order. Christine will reply to confirm availability, finalise the
          details, and provide a quote before any payment is requested. A
          booking is only confirmed once we&rsquo;ve agreed it with you in
          writing.
        </p>
      </LegalSection>

      <LegalSection title="Pricing and GST">
        <p>
          Prices shown on this website are indicative and may change. Unless
          stated otherwise, listed prices exclude GST. The total shown on the
          enquiry form is an estimate only — your final price is confirmed on
          the quote we send you, and depends on your final selections, guest
          numbers, and delivery arrangements.
        </p>
      </LegalSection>

      <LegalSection title="Pick-up and delivery">
        <p>
          We offer pick-up from Zuccoli and delivery within selected Darwin
          areas. Delivery fees depend on the zone and are shown when you make
          your selection. Please make sure someone is available to receive the
          order at the agreed time and place.
        </p>
      </LegalSection>

      <LegalSection title="Allergies and dietary requirements">
        <p>
          Please tell us about any allergies or dietary requirements in your
          enquiry. While we take care with preparation, our food is made in a
          kitchen that handles common allergens (including nuts, dairy, gluten,
          and eggs), and we cannot guarantee any item is free from traces of
          them. If you have a severe allergy, let us know so we can advise
          whether we can safely cater for you.
        </p>
      </LegalSection>

      <LegalSection title="Changes and cancellations">
        <p>
          If you need to change or cancel a confirmed booking, please contact us
          as early as possible. Because our food is freshly made to order,
          changes close to your event date may not be possible, and any deposit
          terms agreed at the time of booking will apply.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          When you send an enquiry, please give us accurate information. We
          handle the details you share in line with our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </LegalSection>

      <LegalSection title="This website">
        <p>
          We provide this website and its content as a guide to our catering. We
          do our best to keep menus, photos, and prices current, but they may
          change without notice. All images, branding, and content remain the
          property of Christine&rsquo;s Exotic Eats and may not be reused without
          our permission.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          Questions about these terms? Reach us through the{" "}
          <a href="/inquire">enquiry form</a> or via our Facebook and Instagram
          pages. These terms are governed by the laws of the Northern Territory,
          Australia.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
