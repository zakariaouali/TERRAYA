"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { insights } from "@/data/insights";
import { insightCardFr } from "@/data/content.fr";
import { useLang } from "@/lib/i18n";

export function MarketInsights() {
  const { t, lang } = useLang();
  const featured = insights.slice(0, 3);

  return (
    <section className="py-28 lg:py-40">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <p className="eyebrow mb-4"><span className="luxury-divider">{t("home.journal.eyebrow")}</span></p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-sand-900 dark:text-sand-100 leading-[1.05]">
              {t("home.journal.title")}
            </h2>
          </div>
          <Link href="/insights" className="text-xs tracking-[0.28em] uppercase text-sand-900 dark:text-sand-100 border-b border-sand-900 dark:border-sand-100 pb-1 self-start lg:self-end">
            {t("home.journal.link")}
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {featured.map((i, idx) => {
            const fr = lang === "fr" ? insightCardFr[i.slug] : undefined;
            return (
            <FadeIn key={i.slug} delay={idx * 0.1}>
              <Link href={`/insights/${i.slug}`} className="group block">
                <div className="relative aspect-[5/4] overflow-hidden ">
                  <Image
                    src={i.image}
                    alt={fr?.title ?? i.title}
                    fill
                    sizes="(min-width:1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  />
                </div>
                <p className="eyebrow mt-6">{fr?.tag ?? i.tag}</p>
                <h3 className="font-display text-2xl mt-2 text-sand-900 dark:text-sand-100 transition-colors group-hover:text-sand-600 dark:group-hover:text-sand-300">{fr?.title ?? i.title}</h3>
                <p className="mt-3 text-sand-700 dark:text-sand-300 leading-relaxed">{fr?.excerpt ?? i.excerpt}</p>
              </Link>
            </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
