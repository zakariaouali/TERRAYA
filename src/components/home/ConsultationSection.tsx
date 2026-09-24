"use client";

import { CalendarCheck, KeyRound, Scale } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeImage } from "@/components/shared/FadeImage";
import { FadeIn } from "@/components/shared/FadeIn";
import { RevealText } from "@/components/shared/RevealText";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { useLang } from "@/lib/i18n";

const benefits = [
  { icon: CalendarCheck, title: "home.cta.b1.title", text: "home.cta.b1.text" },
  { icon: KeyRound, title: "home.cta.b2.title", text: "home.cta.b2.text" },
  { icon: Scale, title: "home.cta.b3.title", text: "home.cta.b3.text" },
];

export function ConsultationSection() {
  const { t } = useLang();
  return (
    <section id="consultation" className="relative overflow-hidden py-28 lg:py-44">
      <FadeImage
        src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2400&q=80"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sand-900/85 via-sand-900/70 to-sand-900/90" />
      <Container className="relative text-sand-50">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-sand-300"><span className="luxury-divider">{t("home.cta.eyebrow")}</span></p>
          <RevealText as="h2" className="mt-6 font-display text-5xl leading-[1.02] md:text-6xl lg:text-7xl">
            {t("home.cta.title")}
          </RevealText>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-sand-200/90">{t("home.cta.text")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MagneticButton href="/consultation" variant="light" className="whitespace-nowrap">
              {t("home.cta.button")}
            </MagneticButton>
            <MagneticButton
              href={whatsappHref(whatsappMessageForPath("/consultation"))}
              variant="outline-light"
              className="whitespace-nowrap"
            >
              <WhatsAppIcon size={16} />
              WhatsApp
            </MagneticButton>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }, i) => (
            <FadeIn key={title} delay={i * 0.1} className="h-full">
              <div className="group h-full bg-sand-900/60 p-8 backdrop-blur-sm transition-colors duration-500 hover:bg-sand-900/40">
                <Icon size={22} className="text-sand-200 transition-transform duration-500 group-hover:-translate-y-1" />
                <h3 className="mt-5 font-display text-xl">{t(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand-300">{t(text)}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
