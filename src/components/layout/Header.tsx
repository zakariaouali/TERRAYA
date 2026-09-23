"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, X, ChevronDown, Sun, Moon, Heart, Instagram, Facebook } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Wordmark } from "@/components/shared/Wordmark";
import { useLang, type Lang } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { useCurrency, CURRENCIES } from "@/lib/currency";
import { CONTACT } from "@/lib/contact";
import { cn } from "@/lib/utils";

// Routes whose top section is a full-bleed dark hero — the header floats white over them.
const DARK_HERO_ROUTES = ["/", "/about", "/services", "/insights"];

function SnapchatIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.206 1.5c1.98.008 3.77 1.05 4.68 2.78.42.8.36 2.03.31 3.02l-.01.14c-.01.14-.02.28-.02.42a.6.6 0 0 0 .32.11c.28-.01.62-.15.95-.29.24-.1.48-.15.7-.15.19 0 .58.04.75.42.13.28.05.58-.22.83-.09.08-.24.17-.44.27-.28.14-.7.35-.78.55-.05.11 0 .27.08.44.02.05 1.02 2.24 3.15 2.59.2.03.34.21.33.41 0 .06-.02.12-.04.18-.16.38-.86.66-2.13.85-.05.07-.1.32-.14.47-.03.14-.06.28-.11.43-.05.18-.18.27-.38.27h-.03c-.1 0-.24-.02-.42-.06-.3-.06-.62-.12-1.03-.12-.24 0-.49.02-.74.06-.48.08-.89.37-1.36.71-.68.48-1.44 1.03-2.62 1.03l-.14-.01h-.09l-.11.01c-1.17 0-1.94-.55-2.61-1.03-.47-.34-.88-.63-1.36-.71a4.6 4.6 0 0 0-.74-.06c-.43 0-.77.07-1.03.12-.17.03-.32.06-.42.06-.26 0-.4-.15-.44-.29-.05-.14-.08-.29-.11-.42-.04-.16-.09-.4-.14-.47-1.27-.19-1.97-.47-2.13-.86a.5.5 0 0 1-.04-.17.41.41 0 0 1 .33-.42c2.13-.35 3.13-2.54 3.15-2.59.08-.17.13-.33.08-.44-.08-.2-.5-.41-.78-.55-.2-.1-.35-.19-.44-.27-.27-.25-.35-.55-.22-.83.17-.38.56-.42.75-.42.22 0 .46.05.7.15.33.14.67.28.95.29a.6.6 0 0 0 .32-.11c0-.14-.01-.28-.02-.42l-.01-.14c-.05-.99-.11-2.22.31-3.02.91-1.73 2.71-2.78 4.7-2.78z"/>
    </svg>
  );
}

const controlBase = "transition-colors duration-300";
const controlColor = (onDark: boolean) =>
  onDark
    ? "text-white hover:text-white/70"
    : "text-sand-800 hover:text-sand-600 dark:text-sand-200 dark:hover:text-sand-400";

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
      <Heart
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

const links = [
  { href: "/properties", key: "nav.properties" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/contact", key: "nav.contact" },
  { href: "/list-your-property", key: "nav.sell" },
];

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
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function CurrencySwitcher({ onDark, compact = false }: { onDark: boolean; compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select currency"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 uppercase",
          compact ? "text-[0.62rem] tracking-[0.22em]" : "text-[0.72rem] tracking-[0.26em]",
          controlBase,
          controlColor(onDark)
        )}
      >
        {currency} <ChevronDown size={12} className={cn("mt-px transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-3 min-w-[5.5rem] border border-sand-200 bg-sand-50 py-1 dark:border-sand-800 dark:bg-sand-900"
        >
          {CURRENCIES.map((c) => (
            <li key={c} role="option" aria-selected={currency === c}>
              <button
                type="button"
                onClick={() => {
                  setCurrency(c);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-4 py-2 text-left text-[0.72rem] uppercase tracking-[0.26em] transition-colors hover:bg-sand-100 dark:hover:bg-sand-800",
                  currency === c ? "text-sand-900 dark:text-sand-100" : "text-sand-500"
                )}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LangSwitcher({ onDark, compact = false }: { onDark: boolean; compact?: boolean }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const choose = (l: Lang) => {
    setLang(l);
    setOpen(false);
  };
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 uppercase",
          compact ? "text-[0.62rem] tracking-[0.22em]" : "text-[0.72rem] tracking-[0.26em]",
          controlBase,
          controlColor(onDark)
        )}
      >
        {lang} <ChevronDown size={12} className={cn("mt-px transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-3 min-w-[7rem] border border-sand-200 bg-sand-50 py-1 dark:border-sand-800 dark:bg-sand-900"
        >
          {(["en", "fr"] as Lang[]).map((l) => (
            <li key={l} role="option" aria-selected={lang === l}>
              <button
                type="button"
                onClick={() => choose(l)}
                className={cn(
                  "block w-full px-4 py-2 text-left text-[0.72rem] uppercase tracking-[0.26em] transition-colors hover:bg-sand-100 dark:hover:bg-sand-800",
                  lang === l ? "text-sand-900 dark:text-sand-100" : "text-sand-500"
                )}
              >
                {l === "en" ? "English" : "Français"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const { t } = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDarkHero = DARK_HERO_ROUTES.includes(pathname);
  const onDark = !scrolled && isDarkHero && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
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
            <p
              className={cn(
                "text-[0.62rem] uppercase tracking-[0.24em]",
                onDark ? "text-white/70" : "text-sand-600 dark:text-sand-400"
              )}
            >
              Marrakech · Real Estate
            </p>
            <div
              className={cn(
                "flex items-center gap-5 text-[0.62rem] uppercase tracking-[0.22em]",
                onDark ? "text-white/80" : "text-sand-700 dark:text-sand-300"
              )}
            >
              <a href={CONTACT.phoneHref} className="transition-opacity hover:opacity-60">
                {CONTACT.phone}
              </a>
              <span className={onDark ? "text-white/30" : "text-sand-400"}>·</span>
              <a href={`mailto:${CONTACT.email}`} className="transition-opacity hover:opacity-60">
                {CONTACT.email}
              </a>
              <span className="flex items-center gap-3 pl-1">
                <a href="https://www.instagram.com/estate.terraya?utm_source=qr" aria-label="TERRAYA on Instagram" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60">
                  <Instagram size={13} />
                </a>
                <a href="https://facebook.com" aria-label="TERRAYA on Facebook" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60">
                  <Facebook size={13} />
                </a>
                <a href="https://snapchat.com/t/xB4yqcPM" aria-label="TERRAYA on Snapchat" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60">
                  <SnapchatIcon size={13} />
                </a>
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

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn("text-[0.72rem] uppercase tracking-[0.26em]", controlBase, controlColor(onDark))}
            >
              {t(l.key)}
            </Link>
          ))}
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
            href="/contact"
            className={cn(
              "px-7 py-3 text-[0.72rem] uppercase tracking-[0.26em] transition-colors duration-300",
              onDark
                ? "border border-white/60 text-white hover:bg-white hover:text-sand-900"
                : "border border-sand-900/30 text-sand-900 hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100/30 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900"
            )}
          >
            {t("nav.inquire")}
          </Link>
        </div>

        <div className="flex items-center justify-end gap-5 lg:hidden">
          <SavedLink onDark={onDark} />
          <ThemeToggle onDark={onDark} />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className={cn(controlBase, onDark ? "text-white" : "text-sand-900 dark:text-sand-100")}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900 lg:hidden">
          <Container className="flex flex-col gap-5 py-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.24em] text-sand-800 dark:text-sand-200"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="flex items-center gap-6 pt-2">
              <LangSwitcher onDark={false} />
              <CurrencySwitcher onDark={false} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="border border-sand-900/30 px-6 py-3 text-center text-xs uppercase tracking-[0.26em] text-sand-900 dark:border-sand-100/30 dark:text-sand-100"
              >
                {t("nav.inquire")}
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
