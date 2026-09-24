"use client";

import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";

type Status = "idle" | "loading" | "sent" | "error";

export function ConsultationView() {
  const { t } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setStatus("sent");
      } else {
        setStatus("error");
        setError(json.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong.");
    }
  }

  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container className="max-w-2xl">
        <p className="eyebrow mb-4"><span className="luxury-divider">{t("consult.eyebrow")}</span></p>
        <RevealText as="h1" className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.02]">{t("consult.title")}</RevealText>
        <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">
          {t("consult.text")}
        </p>

        {status === "sent" ? (
          <div className="mt-12 border border-sand-300 dark:border-sand-700 p-10 text-center">
            <p className="font-display text-3xl text-sand-900 dark:text-sand-100">{t("consult.success.title")}</p>
            <p className="mt-4 text-sand-700 dark:text-sand-300 leading-relaxed">{t("consult.success.text")}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
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
                <Label htmlFor="date">{t("consult.date")}</Label>
                <Input id="date" name="date" type="date" min={today} />
              </div>
            </div>
            <div>
              <Label htmlFor="time">{t("consult.time")}</Label>
              <Select id="time" name="time" defaultValue="">
                <option value="" disabled>—</option>
                <option value="morning">{t("consult.time.morning")}</option>
                <option value="afternoon">{t("consult.time.afternoon")}</option>
                <option value="evening">{t("consult.time.evening")}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">{t("consult.message")}</Label>
              <Textarea id="message" name="message" maxLength={2000} className="min-h-24" />
            </div>
            {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={status === "loading"} className="mt-2 gap-2">
              {status === "loading" && <Spinner size={15} />}
              {status === "loading" ? t("consult.sending") : t("consult.submit")}
            </Button>
          </form>
        )}
      </Container>
    </div>
  );
}
