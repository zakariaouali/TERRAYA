"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { useLang } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: EASE },
});

export function Hero() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "14%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Full-bleed background image */}
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: EASE }}
        style={{ y: parallaxY }}
        className="absolute inset-[-7%]"
      >
        <Image
          src="/hero.jpg"
          alt="A TERRAYA villa with infinity pool overlooking the Marrakech valley at dusk"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Legibility overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/45" />

      {/* Centered content */}
      <Container className="relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center py-28 text-center text-white">
          <motion.div
            {...fadeUp(0.15)}
            className="flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.36em] text-white/80"
          >
            <span className="h-px w-8 bg-white/40" />
            {t("hero.location")}
            <span className="h-px w-8 bg-white/40" />
          </motion.div>

          <motion.h1
            {...fadeUp(0.3)}
            className="mt-9 font-display text-7xl leading-[0.92] tracking-[0.12em] drop-shadow-md md:text-8xl lg:text-[9rem]"
          >
            TERRAYA
          </motion.h1>

          <motion.div
            {...fadeUp(0.5)}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
          >
            <Link
              href="/properties"
              className="group inline-flex items-center justify-center whitespace-nowrap bg-white px-10 py-4 text-[0.7rem] uppercase tracking-[0.26em] text-sand-900 transition-colors duration-300 hover:bg-white/90"
            >
              {t("hero.discover")}
              <ArrowRight size={14} className="ml-3 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center whitespace-nowrap border border-white/60 px-10 py-4 text-[0.7rem] uppercase tracking-[0.26em] text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-sand-900"
            >
              {t("hero.consult")}
            </Link>
          </motion.div>
        </div>
      </Container>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.4em] text-white/70">{t("hero.scroll")}</span>
        <span className="relative h-12 w-px overflow-hidden bg-white/30">
          <motion.span
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-0 h-1/2 bg-white/80"
          />
        </span>
      </motion.div>
    </section>
  );
}
