"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Sun, Sunset, Moon, type LucideIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { FadeIn } from "@/components/shared/FadeIn";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { CONTACT, whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "sent" | "error";

const SLOTS: { value: string; key: string; icon: LucideIcon }[] = [
  { value: "morning", key: "consult.time.morning", icon: Sun },
  { value: "afternoon", key: "consult.time.afternoon", icon: Sunset },
  { value: "evening", key: "consult.time.evening", icon: Moon },
];

const STEPS = [1, 2, 3];

export function ConsultationView() {
  const { t } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState("");
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
    <div className="pb-24 pt-32 lg:pt-40">
      <Container className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
        {/* Left: the promise, what happens next, direct lines */}
        <div>
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("consult.eyebrow")}</span></p>
          <RevealText as="h1" className="font-display text-5xl leading-[1.02] text-sand-900 dark:text-sand-100 lg:text-7xl">{t("consult.title")}</RevealText>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-sand-700 dark:text-sand-300">{t("consult.text")}</p>

          <div className="mt-14">
            <p className="eyebrow mb-6">{t("consult.steps.title")}</p>
            <ol className="relative space-y-8 border-l border-sand-300 pl-8 dark:border-sand-700">
              {STEPS.map((n, i) => (
                <li key={n} className="relative">
                  <FadeIn delay={i * 0.1}>
                    <span className="absolute -left-[2.85rem] top-0 flex h-9 w-9 items-center justify-center rounded-full border border-sand-300 bg-sand-50 font-display text-sm text-sand-900 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-100">
                      {n}
                    </span>
                    <p className="font-display text-2xl text-sand-900 dark:text-sand-100">{t(`consult.step${n}.t`)}</p>
                    <p className="mt-1.5 max-w-md leading-relaxed text-sand-700 dark:text-sand-300">{t(`consult.step${n}.d`)}</p>
                  </FadeIn>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-14 border-t border-sand-300 pt-8 dark:border-sand-700">
            <p className="eyebrow mb-4">{t("consult.direct")}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappHref(whatsappMessageForPath("/consultation"))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-sand-900 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
              >
                <WhatsAppIcon size={15} /> {t("card.whatsapp")}
              </a>
              <a
                href={CONTACT.phoneHref}
                className="inline-flex items-center gap-2 border border-sand-300 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-900 transition-colors hover:border-sand-900 dark:border-sand-700 dark:text-sand-100 dark:hover:border-sand-100"
              >
                <Phone size={14} /> {CONTACT.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Right: the form (sticky on desktop) */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-sand-200 bg-sand-50 p-8 shadow-sm dark:border-sand-800 dark:bg-sand-900 sm:p-10">
            {status === "sent" ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="py-8 text-center" role="status">
                <svg viewBox="0 0 52 52" className="mx-auto h-16 w-16" aria-hidden="true">
                  <motion.circle cx="26" cy="26" r="24" fill="none" strokeWidth="2" className="stroke-sand-300 dark:stroke-sand-700" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                  <motion.path d="M15 27l8 8 14-16" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-sand-900 dark:stroke-sand-100" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                </svg>
                <p className="mt-6 font-display text-3xl text-sand-900 dark:text-sand-100">{t("consult.success.title")}</p>
                <p className="mt-4 leading-relaxed text-sand-700 dark:text-sand-300">{t("consult.success.text")}</p>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">{t("form.name")}</Label>
                    <Input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input id="email" name="email" type="email" required maxLength={255} autoComplete="email" />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("form.phone")}</Label>
                    <Input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" />
                  </div>
                  <div>
                    <Label htmlFor="date">{t("consult.date")}</Label>
                    <Input id="date" name="date" type="date" min={today} />
                  </div>
                </div>

                <div>
                  <Label>{t("consult.time")}</Label>
                  <input type="hidden" name="time" value={slot} />
                  <div role="radiogroup" aria-label={t("consult.time")} className="grid gap-2 sm:grid-cols-3">
                    {SLOTS.map(({ value, key, icon: Icon }) => {
                      const on = slot === value;
                      const [name, hours] = t(key).split(" (");
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setSlot(on ? "" : value)}
                          className={cn(
                            "flex flex-col items-start gap-1 border px-4 py-3 text-left transition-all duration-300",
                            on
                              ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
                              : "border-sand-300 text-sand-800 hover:-translate-y-0.5 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-400"
                          )}
                        >
                          <Icon size={17} strokeWidth={1.5} />
                          <span className="text-sm">{name}</span>
                          {hours && <span className={cn("text-xs", on ? "opacity-80" : "text-sand-500 dark:text-sand-400")}>{hours.replace(")", "")}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">{t("consult.message")}</Label>
                  <Textarea id="message" name="message" maxLength={2000} className="min-h-24" />
                </div>
                {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
                <Button type="submit" disabled={status === "loading"} className="mt-2 gap-2">
                  {status === "loading" && <Spinner size={15} />}
                  {status === "loading" ? t("consult.sending") : t("consult.submit")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
