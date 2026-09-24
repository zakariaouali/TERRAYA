"use client";

import Link from "next/link";
import { ArrowUp, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Wordmark } from "@/components/shared/Wordmark";
import { SnapchatIcon } from "@/components/shared/SnapchatIcon";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { FadeIn } from "@/components/shared/FadeIn";
import { useLang } from "@/lib/i18n";
import { CONTACT, whatsappHref } from "@/lib/contact";

const columns: { titleKey: string; links: { href: string; key: string }[] }[] = [
  {
    titleKey: "footer.col.explore",
    links: [
      { href: "/properties", key: "footer.link.properties" },
      { href: "/services", key: "footer.link.services" },
      { href: "/list-your-property", key: "footer.link.sell" },
      { href: "/consultation", key: "footer.link.consultation" },
    ],
  },
  {
    titleKey: "footer.col.maison",
    links: [
      { href: "/about", key: "footer.link.about" },
      { href: "/contact", key: "footer.link.contact" },
      { href: "/insights", key: "footer.link.insights" },
    ],
  },
  {
    titleKey: "footer.col.private",
    links: [
      { href: "/login", key: "footer.link.portal" },
      { href: "/legal/privacy", key: "footer.link.privacy" },
      { href: "/legal/terms", key: "footer.link.terms" },
    ],
  },
];

/** Link with a hairline that draws in on hover. */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-block py-0.5 text-sand-700 transition-colors hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100"
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />
    </Link>
  );
}

const social =
  "flex h-10 w-10 items-center justify-center rounded-full border border-sand-300 text-sand-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-sand-900 hover:bg-sand-900 hover:text-sand-50 dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900";

export function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
      <Container className="border-b border-sand-200 py-16 dark:border-sand-800">
        <NewsletterSignup />
      </Container>

      <Container className="grid gap-14 py-20 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-7">
          <Wordmark />
          <p className="max-w-sm leading-relaxed text-sand-700 dark:text-sand-300">{t("footer.desc")}</p>

          <ul className="space-y-3 text-sm text-sand-700 dark:text-sand-300">
            <li className="flex items-center gap-3"><MapPin size={16} className="shrink-0 text-sand-500" /> Marrakech, Morocco</li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="shrink-0 text-sand-500" />
              <a href={CONTACT.phoneHref} className="transition-colors hover:text-sand-900 dark:hover:text-sand-100">{CONTACT.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="shrink-0 text-sand-500" />
              <a href={`mailto:${CONTACT.email}`} className="break-all transition-colors hover:text-sand-900 dark:hover:text-sand-100">{CONTACT.email}</a>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <a href={whatsappHref()} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className={social}><WhatsAppIcon size={17} /></a>
            <a href="https://www.instagram.com/estate.terraya?utm_source=qr" aria-label="TERRAYA on Instagram" target="_blank" rel="noopener noreferrer" className={social}><Instagram size={17} /></a>
            <a href="https://snapchat.com/t/xB4yqcPM" aria-label="TERRAYA on Snapchat" target="_blank" rel="noopener noreferrer" className={social}><SnapchatIcon size={17} /></a>
          </div>
        </div>

        {columns.map((c, i) => (
          <FadeIn key={c.titleKey} delay={i * 0.08}>
            <p className="eyebrow mb-6">{t(c.titleKey)}</p>
            <ul className="space-y-3.5">
              {c.links.map((l) => (
                <li key={l.href}><FooterLink href={l.href}>{t(l.key)}</FooterLink></li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </Container>

      {/* Oversized wordmark — decorative */}
      <div aria-hidden="true" className="pointer-events-none select-none px-4 text-center">
        <p className="font-display text-[clamp(4rem,19vw,17rem)] leading-[0.8] tracking-[0.06em] text-sand-900/[0.05] dark:text-sand-100/[0.06]">
          TERRAYA
        </p>
      </div>

      <div className="border-t border-sand-200 dark:border-sand-800">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-sand-600 dark:text-sand-400 lg:flex-row">
          <p>© {new Date().getFullYear()} TERRAYA Maison. {t("footer.rights")}</p>
          <p className="uppercase tracking-[0.28em]">{t("footer.tagline")}</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 uppercase tracking-[0.22em] transition-colors hover:text-sand-900 dark:hover:text-sand-100"
          >
            {lang === "fr" ? "Haut de page" : "Back to top"}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-sand-900 dark:border-sand-700 dark:group-hover:border-sand-100">
              <ArrowUp size={14} />
            </span>
          </button>
        </Container>
      </div>
    </footer>
  );
}
