"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Slim call-to-action that appears once the visitor has scrolled past the hero
 * and hides again while the full consultation section is on screen. Dismissable
 * for the rest of the visit.
 */
export function ConsultationBar() {
  const { t } = useLang();
  const [pastHero, setPastHero] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById("consultation");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSectionVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = pastHero && !sectionVisible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-sand-900/95 py-1.5 pl-5 pr-1.5 text-sand-50 shadow-2xl backdrop-blur">
            <CalendarCheck size={16} className="hidden text-sand-300 sm:block" />
            <span className="hidden text-sm sm:block">{t("bar.text")}</span>
            <Link
              href="/consultation"
              className="rounded-full bg-sand-50 px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.2em] text-sand-900 transition-colors hover:bg-white"
            >
              {t("bar.cta")}
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label={t("bar.close")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-sand-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
