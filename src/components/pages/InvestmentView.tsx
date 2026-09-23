"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { FadeIn } from "@/components/shared/FadeIn";
import { useLang } from "@/lib/i18n";

const pillars = [
  { tKey: "inv.pillar1.t", dKey: "inv.pillar1.d" },
  { tKey: "inv.pillar2.t", dKey: "inv.pillar2.d" },
  { tKey: "inv.pillar3.t", dKey: "inv.pillar3.d" },
  { tKey: "inv.pillar4.t", dKey: "inv.pillar4.d" },
];

const markets = [
  { name: "Route de l'Ourika", yield: "6–8%", trend: "Expanding" },
  { name: "Palmeraie", yield: "5–6%", trend: "Stable" },
  { name: "Hivernage", yield: "6–7%", trend: "Expanding" },
  { name: "Gueliz", yield: "5–7%", trend: "Scarce" },
  { name: "Medina", yield: "6–9%", trend: "Scarce" },
  { name: "Kasbah", yield: "5–8%", trend: "Emerging" },
];

export function InvestmentView() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t("inv.hero.eyebrow")}
        title={t("inv.hero.title")}
        description={t("inv.hero.desc")}
        image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=80"
      />

      <section className="py-28 lg:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <FadeIn>
              <p className="eyebrow mb-4"><span className="luxury-divider">{t("inv.mandate.eyebrow")}</span></p>
              <h2 className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">
                {t("inv.mandate.title")}
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-sand-700 dark:text-sand-300 text-lg leading-relaxed">{t("inv.mandate.text")}</p>
            </FadeIn>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <FadeIn key={p.tKey} delay={i * 0.08}>
                <div className="border-t border-sand-400 dark:border-sand-600 pt-6 h-full">
                  <p className="font-display text-2xl text-sand-900 dark:text-sand-100">{t(p.tKey)}</p>
                  <p className="mt-3 text-sand-700 dark:text-sand-300 leading-relaxed">{t(p.dKey)}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-28 lg:py-40 bg-sand-900 text-sand-50">
        <Container>
          <p className="eyebrow text-sand-300 mb-4"><span className="luxury-divider">{t("inv.market.eyebrow")}</span></p>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">{t("inv.market.title")}</h2>
          <p className="mt-6 text-sand-300 max-w-2xl leading-relaxed">{t("inv.market.text")}</p>
          <div className="mt-16 grid gap-px bg-sand-700 border border-sand-700 md:grid-cols-2 lg:grid-cols-3">
            {markets.map((m) => (
              <div key={m.name} className="bg-sand-900 p-8">
                <p className="font-display text-3xl">{m.name}</p>
                <div className="mt-6 flex items-end justify-between text-sand-300">
                  <div>
                    <p className="eyebrow text-sand-400">{t("inv.market.yield")}</p>
                    <p className="text-sand-50 text-2xl font-medium">{m.yield}</p>
                  </div>
                  <div className="text-right">
                    <p className="eyebrow text-sand-400">{t("inv.market.cycle")}</p>
                    <p className="text-sand-50 font-display text-2xl">{t(`inv.trend.${m.trend}`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-28 lg:py-40">
        <Container className="text-center max-w-2xl mx-auto">
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("inv.begin.eyebrow")}</span></p>
          <h2 className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">
            {t("inv.begin.title")}
          </h2>
          <p className="mt-6 text-sand-700 dark:text-sand-300 leading-relaxed text-lg">{t("inv.begin.text")}</p>
          <Link
            href="/contact"
            className="mt-10 inline-block bg-sand-900 text-sand-50 px-10 py-4 tracking-[0.22em] uppercase text-xs hover:bg-sand-800 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-200 transition-colors"
          >
            {t("inv.begin.button")}
          </Link>
        </Container>
      </section>
    </>
  );
}
