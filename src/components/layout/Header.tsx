"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Instagram, Facebook, Phone, Mail } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Wordmark } from "@/components/shared/Wordmark";
import { SnapchatIcon } from "@/components/shared/SnapchatIcon";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { AnimatedChevron, AnimatedThemeIcon, AnimatedHeart } from "@/components/shared/AnimatedIcon";
import { useLang, type Lang } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { useCurrency, CURRENCIES } from "@/lib/currency";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

// Routes whose top section is a full-bleed dark hero — the header floats white over them.
const DARK_HERO_ROUTES = ["/", "/about", "/services", "/insights"];
const EASE = [0.16, 1, 0.3, 1] as const;

const controlBase = "transition-colors duration-300";
const controlColor = (onDark: boolean) =>
  onDark
    ? "text-white hover:text-white/70"
    : "text-sand-800 hover:text-sand-600 dark:text-sand-200 dark:hover:text-sand-400";

const links = [
  { href: "/properties", key: "nav.properties" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/contact", key: "nav.contact" },
  { href: "/list-your-property", key: "nav.sell" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Closes a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function SavedLink({ onDark, onClick }: { onDark: boolean; onClick?: () => void }) {
  const { favorites, ready } = useFavorites();
  const count = ready ? favorites.length : 0;
  return (
    <Link
      href="/favorites"
      onClick={onClick}
      aria-label="Saved properties"
      className={cn("group relative inline-flex items-center", controlBase, controlColor(onDark))}
    >
      <AnimatedHeart
        active={count > 0}
        size={16}
        className={cn(
          count > 0 && !onDark && "fill-sand-700 text-sand-700 dark:fill-sand-300 dark:text-sand-300",
          count > 0 && onDark && "fill-white text-white"
        )}
      />
      {count > 0 && <span className="ml-1.5 text-[0.66rem] tabular-nums tracking-[0.1em]">{count}</span>}
    </Link>
  );
}

function ThemeToggle({ onDark }: { onDark: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(controlBase, controlColor(onDark))}
    >
      <AnimatedThemeIcon isDark={isDark} size={16} />
    </button>
  );
}

/** Shared dropdown used by the currency and language pickers. */
function Picker<T extends string>({
  label,
  value,
  options,
  display,
  onChange,
  onDark,
  compact,
  width,
  up = false,
}: {
  label: string;
  value: T;
  options: readonly T[];
  display: (v: T) => string;
  onChange: (v: T) => void;
  onDark: boolean;
  compact: boolean;
  width: string;
  up?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 uppercase",
          compact ? "text-[0.62rem] tracking-[0.22em]" : "text-[0.72rem] tracking-[0.26em]",
          controlBase,
          controlColor(onDark)
        )}
      >
        {value} <AnimatedChevron open={open} size={12} className="mt-px" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className={cn(
              "absolute right-0 z-50 border border-sand-200 bg-sand-50 py-1 shadow-xl dark:border-sand-800 dark:bg-sand-900",
              up ? "bottom-full mb-3" : "top-full mt-3",
              width
            )}
          >
            {options.map((o) => (
              <li key={o} role="option" aria-selected={value === o}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={cn(
                    "block w-full px-4 py-2 text-left text-[0.72rem] uppercase tracking-[0.26em] transition-colors hover:bg-sand-100 dark:hover:bg-sand-800",
                    value === o ? "text-sand-900 dark:text-sand-100" : "text-sand-500"
                  )}
                >
                  {display(o)}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function CurrencySwitcher({ onDark, compact = false, up = false }: { onDark: boolean; compact?: boolean; up?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <Picker
      label="Select currency"
      value={currency}
      options={CURRENCIES}
      display={(c) => c}
      onChange={setCurrency}
      onDark={onDark}
      compact={compact}
      width="min-w-[5.5rem]"
      up={up}
    />
  );
}

function LangSwitcher({ onDark, compact = false, up = false }: { onDark: boolean; compact?: boolean; up?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <Picker<Lang>
      label="Select language"
      value={lang}
      options={["en", "fr"]}
      display={(l) => (l === "en" ? "English" : "Français")}
      onChange={setLang}
      onDark={onDark}
      compact={compact}
      width="min-w-[7rem]"
      up={up}
    />
  );
}

function MenuToggle({ open, onClick, onDark }: { open: boolean; onClick: () => void; onDark: boolean }) {
  const bar = cn("absolute left-0 block h-px w-full bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={cn("relative z-[70] h-10 w-10", controlBase, open || !onDark ? "text-sand-900 dark:text-sand-100" : "text-white")}
    >
      <span className="absolute left-1/2 top-1/2 block h-4 w-6 -translate-x-1/2 -translate-y-1/2">
        <span className={cn(bar, open ? "top-1/2 rotate-45" : "top-0")} />
        <span className={cn(bar, "top-1/2", open && "opacity-0")} />
        <span className={cn(bar, open ? "top-1/2 -rotate-45" : "bottom-0")} />
      </span>
    </button>
  );
}

export function Header() {
  const { t, lang } = useLang();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Slide away while reading downwards, return on any upward scroll.
      if (y > 320 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 320) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation, and lock page scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isDarkHero = DARK_HERO_ROUTES.includes(pathname);
  const onDark = !scrolled && isDarkHero && !open;

  return (
    <>
      <header
        onFocusCapture={() => setHidden(false)}
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !open && "-translate-y-full",
          open
            ? "bg-sand-100 dark:bg-sand-900"
            : scrolled
              ? "border-b border-sand-200 bg-sand-100/90 backdrop-blur-md dark:border-sand-800 dark:bg-sand-900/90"
              : onDark
                ? "bg-gradient-to-b from-black/45 via-black/15 to-transparent"
                : "bg-gradient-to-b from-sand-100/90 via-sand-100/45 to-transparent backdrop-blur-[2px] dark:from-sand-900/90 dark:via-sand-900/45"
        )}
      >
        {/* Top utility bar — visible at the top of the page, collapses on scroll */}
        <div
          className={cn(
            "hidden overflow-hidden transition-all duration-500 lg:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          )}
        >
          <div className={cn("border-b", onDark ? "border-white/15" : "border-sand-300/50 dark:border-sand-700/50")}>
            <Container className="flex h-9 items-center justify-between">
              <p className={cn("text-[0.62rem] uppercase tracking-[0.24em]", onDark ? "text-white/70" : "text-sand-600 dark:text-sand-400")}>
                Marrakech · Real Estate
              </p>
              <div className={cn("flex items-center gap-5 text-[0.62rem] uppercase tracking-[0.22em]", onDark ? "text-white/80" : "text-sand-700 dark:text-sand-300")}>
                <a href={CONTACT.phoneHref} className="transition-opacity hover:opacity-60">{CONTACT.phone}</a>
                <span className={onDark ? "text-white/30" : "text-sand-400"}>·</span>
                <a href={`mailto:${CONTACT.email}`} className="transition-opacity hover:opacity-60">{CONTACT.email}</a>
                <span className="flex items-center gap-3 pl-1">
                  <a href="https://www.instagram.com/estate.terraya?utm_source=qr" aria-label="TERRAYA on Instagram" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60"><Instagram size={13} /></a>
                  <a href="https://facebook.com" aria-label="TERRAYA on Facebook" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60"><Facebook size={13} /></a>
                  <a href="https://snapchat.com/t/xB4yqcPM" aria-label="TERRAYA on Snapchat" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60"><SnapchatIcon size={13} /></a>
                </span>
                <span className={cn("h-3 w-px", onDark ? "bg-white/25" : "bg-sand-300 dark:bg-sand-700")} />
                <SavedLink onDark={onDark} />
                <ThemeToggle onDark={onDark} />
                <span className={cn("h-3 w-px", onDark ? "bg-white/25" : "bg-sand-300 dark:bg-sand-700")} />
                <CurrencySwitcher onDark={onDark} compact />
                <LangSwitcher onDark={onDark} compact />
              </div>
            </Container>
          </div>
        </div>

        <Container className="grid h-20 grid-cols-2 items-center lg:h-24 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-10">
          <Wordmark subtitle={false} onDark={onDark} />

          <nav aria-label="Primary" className="hidden items-center justify-center gap-9 lg:flex">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("group relative py-2 text-[0.72rem] uppercase tracking-[0.26em]", controlBase, controlColor(onDark))}
                >
                  {t(l.key)}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center justify-end gap-6 lg:flex">
            {/* When scrolled the top utility bar collapses, so surface the controls here instead. */}
            {scrolled && (
              <>
                <SavedLink onDark={onDark} />
                <ThemeToggle onDark={onDark} />
                <CurrencySwitcher onDark={onDark} compact />
                <LangSwitcher onDark={onDark} compact />
              </>
            )}
            <Link
              href="/consultation"
              className={cn(
                "px-7 py-3 text-[0.72rem] uppercase tracking-[0.26em] transition-colors duration-300",
                onDark
                  ? "border border-white/60 text-white hover:bg-white hover:text-sand-900"
                  : "border border-sand-900/30 text-sand-900 hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100/30 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900"
              )}
            >
              {t("nav.consult")}
            </Link>
          </div>

          <div className="flex items-center justify-end gap-4 lg:hidden">
            <SavedLink onDark={onDark} />
            <MenuToggle open={open} onClick={() => setOpen((v) => !v)} onDark={onDark} />
          </div>
        </Container>

        {/* Reading progress */}
        {scrolled && !reduce && (
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress }}
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-sand-900/60 dark:bg-sand-100/60"
          />
        )}
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-sand-100 px-6 pb-8 pt-28 dark:bg-sand-900 lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {links.map((l, i) => {
                const active = isActive(pathname, l.href);
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.08 + i * 0.06, ease: EASE }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="flex items-baseline justify-between border-b border-sand-300/70 py-4 font-display text-4xl text-sand-900 dark:border-sand-700 dark:text-sand-100"
                    >
                      {t(l.key)}
                      <span className="text-xs tabular-nums tracking-[0.2em] text-sand-500">{active ? "●" : `0${i + 1}`}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              className="mt-auto pt-10"
            >
              <Link
                href="/consultation"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center bg-sand-900 px-6 py-4 text-xs uppercase tracking-[0.26em] text-sand-50 dark:bg-sand-100 dark:text-sand-900"
              >
                {t("nav.consult")}
              </Link>
              <div className="mt-6 flex items-center justify-between text-sand-800 dark:text-sand-200">
                <div className="flex items-center gap-5">
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon size={20} /></a>
                  <a href={CONTACT.phoneHref} aria-label={lang === "fr" ? "Appeler" : "Call"}><Phone size={19} /></a>
                  <a href={`mailto:${CONTACT.email}`} aria-label="Email"><Mail size={19} /></a>
                  <a href="https://www.instagram.com/estate.terraya?utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={19} /></a>
                </div>
                <div className="flex items-center gap-5">
                  <ThemeToggle onDark={false} />
                  <CurrencySwitcher onDark={false} compact up />
                  <LangSwitcher onDark={false} compact up />
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
