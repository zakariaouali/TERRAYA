"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { FadeIn } from "@/components/shared/FadeIn";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";

const buyerItems = [
  { tKey: "services.buyers.item1.t", dKey: "services.buyers.item1.d" },
  { tKey: "services.buyers.item2.t", dKey: "services.buyers.item2.d" },
  { tKey: "services.buyers.item3.t", dKey: "services.buyers.item3.d" },
];

const sellerItems = [
  { tKey: "services.sellers.item1.t", dKey: "services.sellers.item1.d" },
  { tKey: "services.sellers.item2.t", dKey: "services.sellers.item2.d" },
  { tKey: "services.sellers.item3.t", dKey: "services.sellers.item3.d" },
  { tKey: "services.sellers.item4.t", dKey: "services.sellers.item4.d" },
  { tKey: "services.sellers.item5.t", dKey: "services.sellers.item5.d" },
];

function Audience({
  eyebrow,
  title,
  text,
  items,
}: {
  eyebrow: string;
  title: string;
  text: string;
  items: { tKey: string; dKey: string }[];
}) {
  const { t } = useLang();
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow mb-4"><span className="luxury-divider">{eyebrow}</span></p>
          <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">{title}</RevealText>
          <p className="mt-6 text-lg leading-relaxed text-sand-700 dark:text-sand-300">
            {text}
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <FadeIn key={it.tKey} delay={i * 0.06}>
              <div className="border-t border-sand-400 dark:border-sand-600 pt-6 h-full">
                <p className="font-display text-2xl text-sand-900 dark:text-sand-100">{t(it.tKey)}</p>
                <p className="mt-3 text-sand-700 dark:text-sand-300 leading-relaxed">{t(it.dKey)}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

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

      <Audience
        eyebrow={t("services.buyers.eyebrow")}
        title={t("services.buyers.title")}
        text={t("services.buyers.text")}
        items={buyerItems}
      />

      <div className="border-t border-sand-200 dark:border-sand-800">
        <Audience
          eyebrow={t("services.sellers.eyebrow")}
          title={t("services.sellers.title")}
          text={t("services.sellers.text")}
          items={sellerItems}
        />
      </div>

      <section className="py-28 lg:py-40 border-t border-sand-200 dark:border-sand-800">
        <Container className="text-center max-w-2xl mx-auto">
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("services.consult.eyebrow")}</span></p>
          <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">{t("services.consult.title")}</RevealText>
          <p className="mt-6 text-sand-700 dark:text-sand-300 leading-relaxed text-lg">
            {t("services.consult.text")}
          </p>
          <Link
            href="/consultation"
            className="mt-10 inline-block bg-sand-900 text-sand-50 px-10 py-4 tracking-[0.22em] uppercase text-xs hover:bg-sand-800 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-200 transition-colors"
          >
            {t("services.consult.button")}
          </Link>
        </Container>
      </section>
    </>
  );
}
