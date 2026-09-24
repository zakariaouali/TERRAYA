"use client";

import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { FadeImage } from "@/components/shared/FadeImage";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";

const tiles = [
  { labelKey: "home.life.medina", image: "https://images.unsplash.com/photo-1565020244281-fe53df7df170?auto=format&fit=crop&w=1400&q=80" },
  { labelKey: "home.life.gueliz", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80" },
  { labelKey: "home.life.hivernage", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80" },
  { labelKey: "home.life.palmeraie", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80" },
  { labelKey: "home.life.ourika", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80" },
];

export function Lifestyle() {
  const { t } = useLang();
  return (
    <section className="py-28 lg:py-40">
      <Container>
        <div className="max-w-2xl mb-16">
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("home.life.eyebrow")}</span></p>
          <RevealText as="h2" className="font-display text-4xl md:text-5xl lg:text-6xl text-sand-900 dark:text-sand-100 leading-[1.05]">{t("home.life.title")}</RevealText>
          <p className="mt-6 text-sand-700 dark:text-sand-300 leading-relaxed text-lg">
            {t("home.life.text")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {tiles.map((tile, i) => (
            <FadeIn key={tile.labelKey} delay={i * 0.08}>
              <div className="group relative aspect-[3/4] overflow-hidden">
                <FadeImage
                  src={tile.image}
                  alt={t(tile.labelKey)}
                  fill
                  sizes="(min-width: 1024px) 25vw, 100vw"
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/75" />
                <div className="pointer-events-none absolute inset-3 border border-white/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-sand-50">
                  <p className="font-display text-2xl transition-transform duration-500 group-hover:-translate-y-0.5">
                    {t(tile.labelKey)}
                  </p>
                  <ArrowUpRight
                    size={18}
                    className="translate-y-1 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
