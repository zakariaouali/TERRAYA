"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { FadeImage } from "@/components/shared/FadeImage";
import { insights } from "@/data/insights";
import { insightCardFr } from "@/data/content.fr";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";
import { ArrowLink } from "@/components/shared/ArrowLink";
import { HoverFrame } from "@/components/shared/HoverFrame";

export function MarketInsights() {
  const { t, lang } = useLang();
  const featured = insights.slice(0, 3);

  return (
    <section className="py-28 lg:py-40">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <p className="eyebrow mb-4"><span className="luxury-divider">{t("home.journal.eyebrow")}</span></p>
            <RevealText as="h2" className="font-display text-4xl md:text-5xl lg:text-6xl text-sand-900 dark:text-sand-100 leading-[1.05]">{t("home.journal.title")}</RevealText>
          </div>
          <ArrowLink href="/insights" className="self-start lg:self-end">{t("home.journal.link")}</ArrowLink>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {featured.map((i, idx) => {
            const fr = lang === "fr" ? insightCardFr[i.slug] : undefined;
            return (
            <FadeIn key={i.slug} delay={idx * 0.1}>
              <Link href={`/insights/${i.slug}`} className="group block">
                <HoverFrame
                  className="aspect-[5/4]"
                  cursorLabel={t("cursor.read")}
                  image={
                    <FadeImage
                      src={i.image}
                      alt={fr?.title ?? i.title}
                      fill
                      sizes="(min-width:1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                  }
                />
                <p className="eyebrow mt-6">{fr?.tag ?? i.tag}</p>
                <h3 className="font-display text-2xl mt-2 text-sand-900 dark:text-sand-100"><span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">{fr?.title ?? i.title}</span></h3>
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
