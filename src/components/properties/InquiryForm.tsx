"use client";

import { useState } from "react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export function InquiryForm({ propertyId }: { propertyId?: string }) {
  const { t } = useLang();
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (propertyId) (payload as Record<string, unknown>).propertyId = propertyId;

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setStatus("error");
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setStatus("sent");
    (e.target as HTMLFormElement).reset();
  }

  if (status === "sent") {
    return (
      <div className="border border-sand-300 dark:border-sand-700 p-10 text-center">
        <p className="eyebrow">{t("form.received")}</p>
        <p className="font-display text-3xl text-sand-900 dark:text-sand-100 mt-4">{t("form.thanks")}</p>
        <p className="mt-4 text-sand-700 dark:text-sand-300 leading-relaxed">
          {t("form.thanks.text")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input id="name" name="name" required minLength={2} maxLength={120} />
        </div>
        <div>
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input id="email" name="email" type="email" required maxLength={255} />
        </div>
        <div>
          <Label htmlFor="phone">{t("form.phone")}</Label>
          <Input id="phone" name="phone" type="tel" maxLength={40} />
        </div>
        <div>
          <Label htmlFor="budget">{t("form.budget")}</Label>
          <Input id="budget" name="budget" placeholder={t("form.budget.ph")} maxLength={80} />
        </div>
      </div>
      <div>
        <Label htmlFor="message">{t("form.message")}</Label>
        <Textarea id="message" name="message" required minLength={10} maxLength={2000} />
      </div>
      {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
      <Button type="submit" disabled={status === "loading"} className="mt-4">
        {status === "loading" ? t("form.sending") : t("form.submit")}
      </Button>
      <p className="text-xs text-sand-600 dark:text-sand-400">
        {t("form.privacy")}
      </p>
    </form>
  );
}
