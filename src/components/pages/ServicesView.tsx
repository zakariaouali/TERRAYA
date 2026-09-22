"use client";

import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { FadeIn } from "@/components/shared/FadeIn";
import { useLang } from "@/lib/i18n";

const services = [
  { n: "01", tKey: "services.s1.t", dKey: "services.s1.d" },
  { n: "02", tKey: "services.s2.t", dKey: "services.s2.d" },
  { n: "03", tKey: "services.s3.t", dKey: "services.s3.d" },
  { n: "04", tKey: "services.s4.t", dKey: "services.s4.d" },
  { n: "05", tKey: "services.s5.t", dKey: "services.s5.d" },
  { n: "06", tKey: "services.s6.t", dKey: "services.s6.d" },
];

export function ServicesView() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t("services.hero.eyebrow")}
        title={t("services.hero.title")}
        description={t("services.hero.desc")}
        image="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2400&q=80"
      />

      <section className="py-28 lg:py-40">
        <Container>
          <div className="grid gap-px bg-sand-200 dark:bg-sand-800 border border-sand-200 dark:border-sand-800 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.05}>
                <div className="bg-sand-100 dark:bg-sand-900 p-10 h-full">
                  <p className="font-display text-3xl text-sand-500">{s.n}</p>
                  <p className="font-display text-2xl text-sand-900 dark:text-sand-100 mt-6">{t(s.tKey)}</p>
                  <p className="mt-4 text-sand-700 dark:text-sand-300 leading-relaxed">{t(s.dKey)}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
