"use client";

import { Container } from "@/components/shared/Container";
import { FadeImage } from "@/components/shared/FadeImage";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function ContactCTA() {
  const { t } = useLang();
  return (
    <section className="relative py-32 lg:py-48 overflow-hidden">
      <FadeImage
        src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2400&q=80"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-sand-900/65" />
      <Container className="relative text-center text-sand-50">
        <p className="eyebrow text-sand-300"><span className="luxury-divider">{t("home.cta.eyebrow")}</span></p>
        <RevealText as="h2" className="font-display text-4xl md:text-6xl lg:text-7xl mt-6 leading-[1.05] max-w-3xl mx-auto">{t("home.cta.title")}</RevealText>
        <p className="mt-6 text-sand-200/90 max-w-xl mx-auto leading-relaxed text-lg">
          {t("home.cta.text")}
        </p>
        <MagneticButton href="/contact" variant="light" className="mt-12">
          {t("home.cta.button")}
        </MagneticButton>
      </Container>
    </section>
  );
}
