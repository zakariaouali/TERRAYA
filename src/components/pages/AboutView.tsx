"use client";

import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { FadeIn } from "@/components/shared/FadeIn";
import { FadeImage } from "@/components/shared/FadeImage";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";
import { HoverFrame } from "@/components/shared/HoverFrame";

const values = [
  { tKey: "about.values.discretion.t", dKey: "about.values.discretion.d" },
  { tKey: "about.values.judgment.t", dKey: "about.values.judgment.d" },
  { tKey: "about.values.place.t", dKey: "about.values.place.d" },
  { tKey: "about.values.time.t", dKey: "about.values.time.d" },
];

const team = [
  { name: "Inès Lahlou", roleKey: "about.team.r1", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80" },
  { name: "Henri Marchetti", roleKey: "about.team.r2", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80" },
  { name: "Sofia Cardoso", roleKey: "about.team.r3", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80" },
];

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

      <section className="py-28 lg:py-40">
        <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <p className="eyebrow mb-4"><span className="luxury-divider">{t("about.story.eyebrow")}</span></p>
            <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">{t("about.story.title")}</RevealText>
            <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">{t("about.story.p1")}</p>
            <p className="mt-4 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">{t("about.story.p2")}</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <FadeImage
                src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80"
                alt=""
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-28 lg:py-40 bg-sand-200/40 dark:bg-sand-800/30">
        <Container>
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("about.values.eyebrow")}</span></p>
          <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05] max-w-3xl">{t("about.values.title")}</RevealText>
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <FadeIn key={v.tKey} delay={i * 0.08}>
                <div className="border-t border-sand-400 dark:border-sand-600 pt-6">
                  <p className="font-display text-2xl text-sand-900 dark:text-sand-100">{t(v.tKey)}</p>
                  <p className="mt-3 text-sand-700 dark:text-sand-300 leading-relaxed">{t(v.dKey)}</p>
                </div>
              </FadeIn>
            ))}
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
    </>
  );
}
