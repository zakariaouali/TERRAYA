"use client";

import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";

const quotes = [
  { quoteKey: "home.testi.q1", authorKey: "home.testi.a1" },
  { quoteKey: "home.testi.q2", authorKey: "home.testi.a2" },
  { quoteKey: "home.testi.q3", authorKey: "home.testi.a3" },
];

export function Testimonials() {
  const { t } = useLang();
  return (
    <section className="py-28 lg:py-40 bg-sand-900 text-sand-50">
      <Container>
        <p className="eyebrow mb-4 text-sand-300"><span className="luxury-divider">{t("home.testi.eyebrow")}</span></p>
        <RevealText as="h2" className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] max-w-3xl">{t("home.testi.title")}</RevealText>

        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          {quotes.map((q, i) => (
            <FadeIn key={q.authorKey} delay={i * 0.12}>
              <figure className="border-t border-sand-700 pt-8">
                <blockquote className="font-display text-2xl leading-snug italic text-sand-100">
                  “{t(q.quoteKey)}”
                </blockquote>
                <figcaption className="mt-6 text-xs tracking-[0.28em] uppercase text-sand-400">
                  — {t(q.authorKey)}
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
