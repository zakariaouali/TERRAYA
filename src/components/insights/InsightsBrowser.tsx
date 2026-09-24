"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeImage } from "@/components/shared/FadeImage";
import { HoverFrame } from "@/components/shared/HoverFrame";
import { insightCardFr } from "@/data/content.fr";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type InsightCard = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  readingMinutes: number;
  image: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

function Underlined({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
      {children}
    </span>
  );
}

export function InsightsBrowser({ items }: { items: InsightCard[] }) {
  const { t, lang } = useLang();
  const [tag, setTag] = useState("");

  const localized = useMemo(
    () =>
      items.map((i) => {
        const fr = lang === "fr" ? insightCardFr[i.slug] : undefined;
        return { ...i, title: fr?.title ?? i.title, excerpt: fr?.excerpt ?? i.excerpt, tagLabel: fr?.tag ?? i.tag };
      }),
    [items, lang]
  );
  const tags = useMemo(() => Array.from(new Set(localized.map((i) => i.tagLabel))), [localized]);
  const shown = tag ? localized.filter((i) => i.tagLabel === tag) : localized;
  const [lead, ...rest] = shown;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const minutes = (n: number) => (lang === "fr" ? `${n} min de lecture` : `${n} min read`);

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("insights.filter")}>
          {["", ...tags].map((label) => {
            const on = tag === label;
            return (
              <button
                key={label || "all"}
                type="button"
                aria-pressed={on}
                onClick={() => setTag(label)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm transition-colors",
                  on
                    ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
                    : "border-sand-300 text-sand-800 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200"
                )}
              >
                {label || t("insights.all")}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={tag}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {lead && (
              <Link href={`/insights/${lead.slug}`} className="group mt-12 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-14">
                <HoverFrame
                  className="aspect-[16/11]"
                  cursorLabel={t("cursor.read")}
                  image={<FadeImage src={lead.image} alt={lead.title} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />}
                />
                <div>
                  <p className="eyebrow">{lead.tagLabel}</p>
                  <h2 className="mt-4 font-display text-4xl leading-[1.08] text-sand-900 dark:text-sand-100 lg:text-5xl">
                    <Underlined>{lead.title}</Underlined>
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-sand-700 dark:text-sand-300">{lead.excerpt}</p>
                  <p className="mt-6 text-xs uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400">
                    {fmt(lead.date)} · {minutes(lead.readingMinutes)}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 border-b border-sand-900 pb-1 text-[0.7rem] uppercase tracking-[0.24em] text-sand-900 dark:border-sand-100 dark:text-sand-100">
                    {t("cursor.read")} <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-20 grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <Link key={a.slug} href={`/insights/${a.slug}`} className="group block">
                    <HoverFrame
                      className="aspect-[5/4]"
                      cursorLabel={t("cursor.read")}
                      image={<FadeImage src={a.image} alt={a.title} fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover" />}
                    />
                    <p className="eyebrow mt-6">{a.tagLabel}</p>
                    <h3 className="mt-2 font-display text-2xl text-sand-900 dark:text-sand-100">
                      <Underlined>{a.title}</Underlined>
                    </h3>
                    <p className="mt-3 leading-relaxed text-sand-700 dark:text-sand-300">{a.excerpt}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400">
                      {fmt(a.date)} · {minutes(a.readingMinutes)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}
