"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Msg = { from: "me" | "them"; key: string; time: string };

const MESSAGES: Msg[] = [
  { from: "me", key: "contact.chat.m1", time: "09:41" },
  { from: "them", key: "contact.chat.m2", time: "09:44" },
  { from: "me", key: "contact.chat.m3", time: "09:46" },
  { from: "them", key: "contact.chat.m4", time: "09:47" },
];

const TYPING_MS = 1100;
const PAUSE_MS = 700;

function TypingBubble() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-0 top-0 inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-sand-200 px-4 py-3.5 animate-chat-in dark:bg-sand-800"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-sand-600 animate-typing-dot dark:bg-sand-400"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * An illustrative (clearly labelled) conversation that plays once when it
 * scrolls into view. Every message stays in the layout from the start —
 * hidden with `invisible`, not unmounted — so nothing shifts as the
 * conversation plays. The sequence runs on timers rather than on the
 * animation clock, so it always completes, and reduced-motion users get the
 * whole conversation immediately.
 */
export function ConversationPreview() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);
  const [typingAt, setTypingAt] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setShown(MESSAGES.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 400;
    MESSAGES.forEach((m, i) => {
      if (m.from === "them") {
        timers.push(setTimeout(() => setTypingAt(i), at));
        at += TYPING_MS;
      }
      timers.push(
        setTimeout(() => {
          setTypingAt(null);
          setShown(i + 1);
        }, at)
      );
      at += PAUSE_MS;
    });
    return () => timers.forEach(clearTimeout);
  }, [inView, reduceMotion]);

  return (
    <div className="mt-12 max-w-md">
    <p className="eyebrow mb-4">
      <span className="luxury-divider">{t("contact.chat.sample")}</span>
    </p>
    <section
      ref={ref}
      aria-label={t("contact.chat.sample")}
      className="border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-900"
    >
      <header className="flex items-center gap-3 border-b border-sand-200 px-5 py-4 dark:border-sand-800">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-900 font-display text-lg text-sand-50 dark:bg-sand-100 dark:text-sand-900"
        >
          T
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-sand-900 dark:text-sand-100">{t("contact.chat.name")}</p>
          <p className="text-xs text-sand-700 dark:text-sand-400">{t("contact.hours.value")}</p>
        </div>
      </header>

      <ol className="flex flex-col gap-3 px-5 py-6">
        {MESSAGES.map((m, i) => {
          const visible = i < shown;
          const mine = m.from === "me";
          return (
            <li key={m.key} className={cn("relative flex flex-col", mine ? "items-end" : "items-start")}>
              {typingAt === i && !visible && <TypingBubble />}
              <div className={cn("flex max-w-[85%] flex-col", mine ? "items-end" : "items-start", visible ? "animate-chat-in" : "invisible")}>
                <p
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-[0.9rem] leading-relaxed",
                    mine
                      ? "rounded-br-md bg-sand-900 text-sand-50 dark:bg-sand-100 dark:text-sand-900"
                      : "rounded-bl-md bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-100"
                  )}
                >
                  {t(m.key)}
                </p>
                <span className="mt-1 px-1 text-[0.6rem] tabular-nums tracking-[0.1em] text-sand-700 dark:text-sand-400">
                  {m.time}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <a
        href={whatsappHref(whatsappMessageForPath("/contact"))}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 border-t border-sand-200 px-5 py-4 text-sm text-sand-700 transition-colors hover:bg-sand-100 hover:text-sand-900 dark:border-sand-800 dark:text-sand-300 dark:hover:bg-sand-800 dark:hover:text-sand-100"
      >
        <WhatsAppIcon size={16} className="shrink-0" />
        <span className="flex-1">{t("contact.chat.cta")}</span>
        <ArrowUpRight
          size={15}
          className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
      <p className="border-t border-sand-200 px-5 py-2.5 text-[0.65rem] text-sand-700 dark:border-sand-800 dark:text-sand-400">
        {t("contact.chat.note")}
      </p>
    </section>
    </div>
  );
}
