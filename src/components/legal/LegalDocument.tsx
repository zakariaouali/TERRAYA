import { Container } from "@/components/shared/Container";

export type LegalSection = { heading: string; body: string[] };

export function LegalDocument({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-4">
            <span className="luxury-divider">{eyebrow}</span>
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-sand-900 dark:text-sand-100">
            {title}
          </h1>
          <p className="mt-5 text-xs uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400">
            Last updated {updated}
          </p>
          <p className="mt-8 text-lg leading-relaxed text-sand-700 dark:text-sand-300">{intro}</p>

          <div className="mt-14 space-y-12">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{s.heading}</h2>
                <div className="mt-4 space-y-4">
                  {s.body.map((p, i) => (
                    <p key={i} className="leading-relaxed text-sand-700 dark:text-sand-300">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-16 border-t border-sand-200 dark:border-sand-800 pt-8 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            Questions about this document may be directed to{" "}
            <a href="mailto:private@terraya.com" className="underline underline-offset-4 hover:text-sand-900 dark:hover:text-sand-100">
              private@terraya.com
            </a>
            .
          </p>
        </div>
      </Container>
    </div>
  );
}
