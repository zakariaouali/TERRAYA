"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

type Status = "idle" | "loading" | "sent" | "error";

export function NewsletterSignup() {
  const { t } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const email = new FormData(e.currentTarget).get("email");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setStatus("sent");
      } else {
        setStatus("error");
        setError(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="eyebrow mb-3">{t("newsletter.eyebrow")}</p>
        <h2 className="font-display text-3xl md:text-4xl leading-[1.1] text-sand-900 dark:text-sand-100">
          {t("newsletter.title")}
        </h2>
      </div>

      {status === "sent" ? (
        <p className="font-display text-2xl text-sand-700 dark:text-sand-300 lg:text-right">
          {t("newsletter.success")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="lg:justify-self-end lg:w-full lg:max-w-md">
          <div className="flex items-center border-b border-sand-400 dark:border-sand-600 focus-within:border-sand-900 dark:focus-within:border-sand-100 transition-colors">
            <label htmlFor="newsletter-email" className="sr-only">
              {t("newsletter.placeholder")}
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              maxLength={255}
              placeholder={t("newsletter.placeholder")}
              className="h-12 w-full bg-transparent text-sand-900 dark:text-sand-100 placeholder:text-sand-500 dark:placeholder:text-sand-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label={t("newsletter.cta")}
              className="shrink-0 p-2 text-sand-900 dark:text-sand-100 transition-transform duration-300 hover:translate-x-1 disabled:opacity-50"
            >
              <ArrowRight size={18} />
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
