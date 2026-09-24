"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { FadeImage } from "@/components/shared/FadeImage";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";
import { HoverFrame } from "@/components/shared/HoverFrame";

/**
 * Two core ways to engage with the collection: Buy, or Rent long-term (a
 * firm 6-month minimum — TERRAYA does not offer nightly or weekly stays).
 * Swap `image` / `href` to re-point a card — labels are resolved from the
 * i18n dictionary.
 */
type Category = {
  href: string;
  image: string;
  alt: string;
  labelKey: string;
  subKey: string;
};

const categories: Category[] = [
  {
    href: "/properties?listingType=SALE",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    alt: "A luxury estate available to buy",
    labelKey: "cat.buy",
    subKey: "cat.buy.sub",
  },
  {
    href: "/properties?listingType=RENT",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    alt: "An elegant residence available for long-term rent",
    labelKey: "cat.rent",
    subKey: "cat.rent.sub",
  },
];

function CategoryCard({
  category,
  priority = false,
}: {
  category: Category;
  priority?: boolean;
}) {
  const { t } = useLang();

  return (
    <Link
      href={category.href}
      aria-label={t(category.labelKey)}
      className="group relative block min-h-[360px] overflow-hidden border border-sand-200/60 shadow-sm transition-shadow duration-500 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-100 dark:border-sand-800 dark:focus-visible:ring-offset-sand-900 lg:min-h-[480px]"
    >
      <HoverFrame
        className="absolute inset-0"
        frame={false}
        image={
          <FadeImage
            src={category.image}
            alt={category.alt}
            fill
            priority={priority}
            quality={85}
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover"
          />
        }
      >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
      <div className="pointer-events-none absolute inset-3 border border-white/20" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <span className="mb-3 max-w-xs text-[0.6rem] uppercase tracking-[0.3em] text-white/75">
          {t(category.subKey)}
        </span>
        <h3 className="font-display text-4xl text-white drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-1 lg:text-6xl">
          {t(category.labelKey)}
        </h3>
        <span className="mt-4 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.28em] text-white/0 transition-all duration-500 group-hover:text-white/90">
          {t("cat.cta")}
          <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
      </HoverFrame>
    </Link>
  );
}

export function PropertyCategories() {
  const { t } = useLang();

  return (
    <section className="py-24 lg:py-32">
      <Container>
        <FadeIn>
          <div className="mb-12 max-w-2xl lg:mb-16">
            <p className="eyebrow mb-4">
              <span className="luxury-divider">{t("cat.eyebrow")}</span>
            </p>
            <RevealText as="h2" className="font-display text-4xl leading-[1.05] text-sand-900 dark:text-sand-100 md:text-5xl lg:text-6xl">{t("cat.title")}</RevealText>
            <p className="mt-6 text-lg leading-relaxed text-sand-700 dark:text-sand-300">
              {t("cat.lead")}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {categories.map((c, i) => (
              <CategoryCard key={c.labelKey} category={c} priority={i === 0} />
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
