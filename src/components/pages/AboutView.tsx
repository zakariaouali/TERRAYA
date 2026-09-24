"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Eye, Scale, MapPinned, Hourglass, type LucideIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { FadeIn } from "@/components/shared/FadeIn";
import { FadeImage } from "@/components/shared/FadeImage";
import { CountUp } from "@/components/shared/CountUp";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";
import { HoverFrame } from "@/components/shared/HoverFrame";
import { ConsultationSection } from "@/components/home/ConsultationSection";

const values: { tKey: string; dKey: string; icon: LucideIcon }[] = [
  { tKey: "about.values.discretion.t", dKey: "about.values.discretion.d", icon: Eye },
  { tKey: "about.values.judgment.t", dKey: "about.values.judgment.d", icon: Scale },
  { tKey: "about.values.place.t", dKey: "about.values.place.d", icon: MapPinned },
  { tKey: "about.values.time.t", dKey: "about.values.time.d", icon: Hourglass },
];

// Every figure here is already stated elsewhere in our copy (story: two
// decades; services: free to list; consultation: reply within a day).
const stats: { to?: number; prefix?: string; suffix?: string; text?: string; labelKey: string }[] = [
  { to: 20, suffix: "+", labelKey: "about.stats.years" },
  { text: "Marrakech", labelKey: "about.stats.market" },
  { to: 0, prefix: "€", labelKey: "about.stats.list" },
  { to: 1, suffix: " day", labelKey: "about.stats.reply" },
];

const team = [
  { name: "Inès Lahlou", roleKey: "about.team.r1", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80" },
  { name: "Henri Marchetti", roleKey: "about.team.r2", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80" },
  { name: "Sofia Cardoso", roleKey: "about.team.r3", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80" },
];

function ParallaxImage({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  return (
    <div ref={ref} className="relative aspect-[4/5] overflow-hidden bg-sand-200 dark:bg-sand-800">
      <motion.div style={{ y }} className="absolute inset-[-10%]">
        <FadeImage src={src} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      </motion.div>
    </div>
  );
}

export function AboutView() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t("about.hero.eyebrow")}
        title={t("about.hero.title")}
        description={t("about.hero.desc")}
        image="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=80"
      />

      {/* Facts band */}
      <section className="border-b border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-900">
        <Container>
          <dl className="grid grid-cols-2 divide-sand-200 dark:divide-sand-800 md:grid-cols-4 md:divide-x">
            {stats.map((s, i) => (
              <FadeIn key={s.labelKey} delay={i * 0.08}>
                <div className="px-2 py-10 text-center md:px-6 md:py-14">
                  <dt className="font-display text-4xl text-sand-900 dark:text-sand-100 md:text-5xl">
                    {s.text ?? <CountUp to={s.to ?? 0} prefix={s.prefix} suffix={s.suffix} />}
                  </dt>
                  <dd className="mt-3 text-[0.68rem] uppercase tracking-[0.24em] text-sand-600 dark:text-sand-400">{t(s.labelKey)}</dd>
                </div>
              </FadeIn>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-28 lg:py-40">
        <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <p className="eyebrow mb-4"><span className="luxury-divider">{t("about.story.eyebrow")}</span></p>
            <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">{t("about.story.title")}</RevealText>
            <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">{t("about.story.p1")}</p>
            <p className="mt-4 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">{t("about.story.p2")}</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <ParallaxImage src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80" />
          </FadeIn>
        </Container>
      </section>

      <section className="bg-sand-200/40 py-28 dark:bg-sand-800/30 lg:py-40">
        <Container>
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("about.values.eyebrow")}</span></p>
          <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05] max-w-3xl">{t("about.values.title")}</RevealText>
          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeIn key={v.tKey} delay={i * 0.08} className="h-full">
                  <div className="group relative h-full overflow-hidden border border-sand-300/70 bg-sand-50/70 p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-sand-900 hover:shadow-xl dark:border-sand-700 dark:bg-sand-900/50 dark:hover:border-sand-300">
                    <span aria-hidden="true" className="absolute right-5 top-3 font-display text-6xl text-sand-900/[0.06] transition-colors duration-500 group-hover:text-sand-900/15 dark:text-sand-100/[0.06] dark:group-hover:text-sand-100/20">
                      0{i + 1}
                    </span>
                    <Icon size={26} strokeWidth={1.4} className="text-sand-700 transition-transform duration-500 group-hover:scale-110 dark:text-sand-300" />
                    <p className="mt-8 font-display text-2xl text-sand-900 dark:text-sand-100">{t(v.tKey)}</p>
                    <p className="mt-3 leading-relaxed text-sand-700 dark:text-sand-300">{t(v.dKey)}</p>
                    <span aria-hidden="true" className="mt-6 block h-px w-8 bg-sand-500 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-28 lg:py-40">
        <Container>
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("about.office.eyebrow")}</span></p>
          <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">{t("about.office.title")}</RevealText>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {team.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.08}>
                <div className="group/team">
                  <HoverFrame
                    className="aspect-[3/4]"
                    image={
                      <FadeImage
                        src={member.img}
                        alt={member.name}
                        fill
                        sizes="(min-width:768px) 33vw, 100vw"
                        className="object-cover grayscale-[0.45] transition-[filter] duration-[900ms] group-hover/hf:grayscale-0"
                      />
                    }
                  />
                  <p className="mt-6 font-display text-2xl text-sand-900 transition-transform duration-500 ease-out group-hover/team:translate-x-1.5 dark:text-sand-100">{member.name}</p>
                  <p className="eyebrow mt-2">{t(member.roleKey)}</p>
                  <span
                    aria-hidden="true"
                    className="mt-4 block h-px w-10 bg-sand-400 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/team:w-full dark:bg-sand-600"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <ConsultationSection />
    </>
  );
}
