"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Wordmark } from "@/components/shared/Wordmark";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { useLang } from "@/lib/i18n";
import { CONTACT } from "@/lib/contact";

function SnapchatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.206 1.5c1.98.008 3.77 1.05 4.68 2.78.42.8.36 2.03.31 3.02l-.01.14c-.01.14-.02.28-.02.42a.6.6 0 0 0 .32.11c.28-.01.62-.15.95-.29.24-.1.48-.15.7-.15.19 0 .58.04.75.42.13.28.05.58-.22.83-.09.08-.24.17-.44.27-.28.14-.7.35-.78.55-.05.11 0 .27.08.44.02.05 1.02 2.24 3.15 2.59.2.03.34.21.33.41 0 .06-.02.12-.04.18-.16.38-.86.66-2.13.85-.05.07-.1.32-.14.47-.03.14-.06.28-.11.43-.05.18-.18.27-.38.27h-.03c-.1 0-.24-.02-.42-.06-.3-.06-.62-.12-1.03-.12-.24 0-.49.02-.74.06-.48.08-.89.37-1.36.71-.68.48-1.44 1.03-2.62 1.03l-.14-.01h-.09l-.11.01c-1.17 0-1.94-.55-2.61-1.03-.47-.34-.88-.63-1.36-.71a4.6 4.6 0 0 0-.74-.06c-.43 0-.77.07-1.03.12-.17.03-.32.06-.42.06-.26 0-.4-.15-.44-.29-.05-.14-.08-.29-.11-.42-.04-.16-.09-.4-.14-.47-1.27-.19-1.97-.47-2.13-.86a.5.5 0 0 1-.04-.17.41.41 0 0 1 .33-.42c2.13-.35 3.13-2.54 3.15-2.59.08-.17.13-.33.08-.44-.08-.2-.5-.41-.78-.55-.2-.1-.35-.19-.44-.27-.27-.25-.35-.55-.22-.83.17-.38.56-.42.75-.42.22 0 .46.05.7.15.33.14.67.28.95.29a.6.6 0 0 0 .32-.11c0-.14-.01-.28-.02-.42l-.01-.14c-.05-.99-.11-2.22.31-3.02.91-1.73 2.71-2.78 4.7-2.78z"/>
    </svg>
  );
}

const columns: { titleKey: string; links: { href: string; key: string }[] }[] = [
  {
    titleKey: "footer.col.explore",
    links: [
      { href: "/properties", key: "footer.link.properties" },
      { href: "/services", key: "footer.link.services" },
      { href: "/list-your-property", key: "footer.link.sell" },
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

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-32 border-t border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
      <Container className="border-b border-sand-200 dark:border-sand-800 py-16">
        <NewsletterSignup />
      </Container>
      <Container className="py-20 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Wordmark />
          <p className="text-sand-700 leading-relaxed max-w-sm dark:text-sand-300">
            {t("footer.desc")}
          </p>
          <div className="text-sand-600 text-sm space-y-1 dark:text-sand-400">
            <p>Marrakech, Morocco</p>
            <p>
              <a href={CONTACT.phoneHref} className="transition-colors hover:text-sand-900 dark:hover:text-sand-100">
                {CONTACT.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-sand-900 dark:hover:text-sand-100">
                {CONTACT.email}
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4 text-sand-600 dark:text-sand-400">
            <a
              href="https://www.instagram.com/estate.terraya?utm_source=qr"
              aria-label="TERRAYA on Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-sand-900 dark:hover:text-sand-100"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://snapchat.com/t/xB4yqcPM"
              aria-label="TERRAYA on Snapchat"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-sand-900 dark:hover:text-sand-100"
            >
              <SnapchatIcon size={18} />
            </a>
          </div>
        </div>

        {columns.map((c) => (
          <div key={c.titleKey}>
            <p className="eyebrow mb-5">{t(c.titleKey)}</p>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sand-700 hover:text-sand-900 transition-colors dark:text-sand-300 dark:hover:text-sand-100"
                  >
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-sand-200 dark:border-sand-800">
        <Container className="py-6 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs text-sand-600 dark:text-sand-400">
          <p>© {new Date().getFullYear()} TERRAYA Maison. {t("footer.rights")}</p>
          <p className="tracking-[0.28em] uppercase">{t("footer.tagline")}</p>
        </Container>
      </div>
    </footer>
  );
}
