"use client";

import { useEffect } from "react";
import { Container } from "@/components/shared/Container";
import { useLang } from "@/lib/i18n";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLang();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-sand-100 dark:bg-sand-900">
      <Container className="py-32 text-center">
        <h1 className="mx-auto max-w-2xl font-display text-4xl leading-[1.05] text-sand-900 dark:text-sand-100 md:text-5xl">
          {t("error.title")}
        </h1>
        <div className="mx-auto mt-8 h-px w-16 bg-sand-300 dark:bg-sand-700" />
        <p className="mx-auto mt-8 max-w-md leading-relaxed text-sand-700 dark:text-sand-300">
          {t("error.text")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-11 inline-flex items-center justify-center whitespace-nowrap bg-sand-900 px-9 py-4 text-[0.7rem] uppercase tracking-[0.26em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
        >
          {t("error.retry")}
        </button>
      </Container>
    </div>
  );
}
