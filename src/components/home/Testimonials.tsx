"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { RevealText } from "@/components/shared/RevealText";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const quotes = [
  { quoteKey: "home.testi.q1", authorKey: "home.testi.a1" },
  { quoteKey: "home.testi.q2", authorKey: "home.testi.a2" },
  { quoteKey: "home.testi.q3", authorKey: "home.testi.a3" },
];

const INTERVAL = 7000;
const EASE = [0.16, 1, 0.3, 1] as const;

const initials = (s: string) =>
  s.split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export function Testimonials() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // restarts the progress bar on manual pick
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => {
    setActive((i + quotes.length) % quotes.length);
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => go(active + 1), INTERVAL);
    return () => clearTimeout(id);
  }, [active, paused, reduce, tick, go]);

  const q = quotes[active];

  return (
    <section
      className="relative overflow-hidden bg-sand-900 py-28 text-sand-50 lg:py-40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Slow drifting glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-sand-500/20 blur-[120px]"
        animate={reduce ? undefined : { x: [0, 120, 0], y: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-sand-300/10 blur-[110px]"
        animate={reduce ? undefined : { x: [0, -90, 0], y: [0, -50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container className="relative">
        <p className="eyebrow mb-4 text-sand-300"><span className="luxury-divider">{t("home.testi.eyebrow")}</span></p>
        <RevealText as="h2" className="max-w-3xl font-display text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
          {t("home.testi.title")}
        </RevealText>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          {/* Active quote */}
          <div
            className="relative min-h-[22rem] rounded-sm border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm sm:p-12"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
            }}
          >
            <span aria-hidden="true" className="absolute right-8 top-2 font-display text-[9rem] leading-none text-white/[0.07]">”</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={active}
                initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <div className="flex gap-1 text-sand-300" role="img" aria-label="5 out of 5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <motion.span
                      key={s}
                      initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.15 + s * 0.07, duration: 0.4, ease: EASE }}
                    >
                      <Star size={16} fill="currentColor" strokeWidth={0} />
                    </motion.span>
                  ))}
                </div>
                <blockquote className="mt-8 font-display text-2xl italic leading-snug text-sand-50 sm:text-3xl lg:text-[2rem]">
                  “{t(q.quoteKey)}”
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-50 font-display text-lg text-sand-900">
                    {initials(t(q.authorKey))}
                  </span>
                  <span className="text-xs uppercase tracking-[0.26em] text-sand-300">{t(q.authorKey)}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Selector with progress */}
          <ul className="flex flex-col justify-center gap-3" role="tablist" aria-label={t("home.testi.eyebrow")}>
            {quotes.map((item, i) => {
              const on = i === active;
              return (
                <li key={item.authorKey} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => go(i)}
                    className={cn(
                      "relative w-full overflow-hidden border px-5 py-4 text-left transition-all duration-500",
                      on ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="flex items-center gap-4">
                      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm transition-colors duration-500", on ? "bg-sand-50 text-sand-900" : "bg-white/10 text-sand-200")}>
                        {initials(t(item.authorKey))}
                      </span>
                      <span className={cn("text-xs uppercase tracking-[0.22em] transition-colors duration-500", on ? "text-sand-50" : "text-sand-400")}>
                        {t(item.authorKey)}
                      </span>
                    </span>
                    {on && !reduce && (
                      <motion.span
                        key={`${active}-${tick}-${paused}`}
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-px w-full origin-left bg-sand-200"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: paused ? 0 : 1 }}
                        transition={{ duration: paused ? 0 : INTERVAL / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
