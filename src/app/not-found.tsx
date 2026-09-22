"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-sand-100 dark:bg-sand-900">
      <Container className="py-32 text-center">
        <p className="text-[0.72rem] uppercase tracking-[0.34em] text-sand-500 dark:text-sand-400">
          {t("notfound.eyebrow")}
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-[0.02em] text-sand-900 dark:text-sand-100 md:text-6xl">
          {t("notfound.title")}
        </h1>
        <div className="mx-auto mt-8 h-px w-16 bg-sand-300 dark:bg-sand-700" />
        <p className="mx-auto mt-8 max-w-md leading-relaxed text-sand-700 dark:text-sand-300">
          {t("notfound.text")}
        </p>
        <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center whitespace-nowrap bg-sand-900 px-9 py-4 text-[0.7rem] uppercase tracking-[0.26em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
          >
            {t("notfound.home")}
          </Link>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center whitespace-nowrap border border-sand-900/25 px-9 py-4 text-[0.7rem] uppercase tracking-[0.26em] text-sand-900 transition-colors hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100/25 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900"
          >
            {t("notfound.properties")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
