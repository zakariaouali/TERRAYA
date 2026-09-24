"use client";

import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { FadeIn } from "@/components/shared/FadeIn";
import { ArrowLink } from "@/components/shared/ArrowLink";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";
import { ConsultationSection } from "@/components/home/ConsultationSection";
import { cn } from "@/lib/utils";

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

/**
 * Two-column layout: the audience pitch stays pinned on the left while its
 * numbered services scroll past on the right. Each row lights up on hover.
 */
function Audience({
  eyebrow,
  title,
  text,
  items,
  cta,
  ctaHref,
  tinted,
}: {
  eyebrow: string;
  title: string;
  text: string;
  items: { tKey: string; dKey: string }[];
  cta: string;
  ctaHref: string;
  tinted?: boolean;
}) {
  const { t } = useLang();
  return (
    <section className={cn("py-24 lg:py-32", tinted && "bg-sand-200/40 dark:bg-sand-800/30")}>
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow mb-4"><span className="luxury-divider">{eyebrow}</span></p>
          <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">{title}</RevealText>
          <p className="mt-6 text-lg leading-relaxed text-sand-700 dark:text-sand-300">{text}</p>
          <ArrowLink href={ctaHref} className="mt-8">{cta}</ArrowLink>
        </div>

        <ol className="border-t border-sand-300 dark:border-sand-700">
          {items.map((it, i) => (
            <li key={it.tKey}>
              <FadeIn delay={i * 0.05}>
                <div className="group relative flex gap-6 border-b border-sand-300 py-8 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-3 dark:border-sand-700 sm:gap-10 sm:py-10">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-sand-900 transition-transform duration-500 group-hover:scale-y-100 dark:bg-sand-100"
                  />
                  <span className="font-display text-4xl leading-none text-sand-400 transition-colors duration-500 group-hover:text-sand-900 dark:text-sand-600 dark:group-hover:text-sand-100 sm:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-2xl text-sand-900 dark:text-sand-100 sm:text-3xl">{t(it.tKey)}</p>
                    <p className="mt-3 max-w-xl leading-relaxed text-sand-700 dark:text-sand-300">{t(it.dKey)}</p>
                  </div>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
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
        cta={t("services.buyers.cta")}
        ctaHref="/properties"
      />

      <Audience
        tinted
        eyebrow={t("services.sellers.eyebrow")}
        title={t("services.sellers.title")}
        text={t("services.sellers.text")}
        items={sellerItems}
        cta={t("services.sellers.cta")}
        ctaHref="/list-your-property"
      />

      <ConsultationSection />
    </>
  );
}
