"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { CountUp } from "@/components/shared/CountUp";
import { useLang } from "@/lib/i18n";

const stats = [
  { prefix: "€", value: 1.4, decimals: 1, suffix: "B", labelKey: "home.inv.stat1" },
  { value: 6.1, decimals: 1, suffix: "%", labelKey: "home.inv.stat2" },
  { value: 15, decimals: 0, suffix: "", labelKey: "home.inv.stat3" },
  { value: 92, decimals: 0, suffix: "%", labelKey: "home.inv.stat4" },
];

export function InvestmentTeaser() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <section className="py-28 lg:py-40 bg-sand-200/50 dark:bg-sand-800/30">
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <FadeIn>
          <div ref={ref} className="relative aspect-[4/5] overflow-hidden">
            <motion.div style={{ y }} className="absolute inset-[-8%]">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
                alt="Investment advisory"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="eyebrow mb-5"><span className="luxury-divider">{t("home.inv.eyebrow")}</span></p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-sand-900 dark:text-sand-100 leading-[1.05]">
            {t("home.inv.title")}
          </h2>
          <p className="mt-6 text-sand-700 dark:text-sand-300 leading-relaxed text-lg max-w-lg">
            {t("home.inv.text")}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-y-10 gap-x-8 max-w-md">
            {stats.map((s) => (
              <div key={s.labelKey}>
                <p className="text-4xl font-medium text-sand-900 dark:text-sand-100">
                  <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-xs tracking-[0.22em] uppercase text-sand-600 dark:text-sand-400 leading-relaxed">
                  {t(s.labelKey)}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/investment"
            className="mt-12 inline-block text-xs tracking-[0.28em] uppercase text-sand-900 dark:text-sand-100 border-b border-sand-900 dark:border-sand-100 pb-1"
          >
            {t("home.inv.link")}
          </Link>
        </FadeIn>
      </Container>
    </section>
  );
}
