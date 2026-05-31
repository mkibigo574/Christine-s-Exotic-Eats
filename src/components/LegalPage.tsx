import { Ornament } from "./Ornament";

export function LegalPage({
  overline,
  title,
  lastUpdated,
  children,
}: {
  overline: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="band-warm relative grain-light">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 py-14 md:py-20 text-center fade-up relative">
          <span className="text-overline">{overline}</span>
          <h1 className="mt-3 font-display heading-lg font-semibold text-[var(--color-wine-deep)]">
            {title}
          </h1>
          <div className="mt-5">
            <Ornament />
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Last updated {lastUpdated}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-12 md:py-20">
        <div className="legal-prose text-[var(--color-ink)]">{children}</div>
      </div>
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 md:mt-12">
      <h2 className="font-display text-2xl text-[var(--color-wine-deep)]">
        {title}
      </h2>
      <div className="mt-2 hairline" />
      <div className="mt-4">{children}</div>
    </section>
  );
}
