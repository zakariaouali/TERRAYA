"use client";

import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { useLang } from "@/lib/i18n";

const PROPERTY_TYPES = ["VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"];
const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;

export function SellView() {
  const { t } = useLang();
  const [photos, setPhotos] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function onPhotosChange(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).slice(0, MAX_PHOTOS);
    setPhotos(next);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (photos.length === 0) { setError("Add at least one photo."); return; }
    if (photos.some((f) => f.size > MAX_BYTES)) { setError("Each photo must be 5MB or smaller."); return; }

    setStatus("loading");
    setError(null);
    const form = new FormData(e.currentTarget);
    for (const photo of photos) form.append("photos", photo);

    const res = await fetch("/api/listing-submissions", { method: "POST", body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      setStatus("error");
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container className="max-w-2xl">
        <p className="eyebrow mb-4"><span className="luxury-divider">{t("sell.eyebrow")}</span></p>
        <h1 className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.02]">
          {t("sell.title")}
        </h1>
        <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">
          {t("sell.text")}
        </p>

        {status === "sent" ? (
          <div className="mt-12 border border-sand-300 dark:border-sand-700 p-10 text-center">
            <p className="font-display text-3xl text-sand-900 dark:text-sand-100">{t("sell.success.title")}</p>
            <p className="mt-4 text-sand-700 dark:text-sand-300 leading-relaxed">{t("sell.success.text")}</p>
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
                <Input id="phone" name="phone" type="tel" required minLength={4} maxLength={40} />
              </div>
              <div>
                <Label htmlFor="propertyType">{t("sell.form.type")}</Label>
                <Select id="propertyType" name="propertyType" defaultValue="VILLA">
                  {PROPERTY_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="city">{t("sell.form.city")}</Label>
                <Input id="city" name="city" required minLength={2} maxLength={120} placeholder="e.g. Gueliz" />
              </div>
            </div>
            <div>
              <Label htmlFor="photos">{t("sell.form.photos")}</Label>
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPhotosChange(e.target.files)}
                className="block w-full text-sm text-sand-700 dark:text-sand-300"
              />
              <p className="mt-2 text-xs text-sand-500">{t("sell.form.photos.hint")}</p>
              {photos.length > 0 && (
                <p className="mt-2 text-xs text-sand-600">{photos.length} photo{photos.length > 1 ? "s" : ""} selected</p>
              )}
            </div>
            {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={status === "loading"} className="mt-2">
              {status === "loading" ? t("sell.sending") : t("sell.submit")}
            </Button>
          </form>
        )}

        <div className="mt-12 border-t border-sand-200 dark:border-sand-800 pt-8">
          <a
            href={whatsappHref(whatsappMessageForPath("/list-your-property"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-sand-900 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
          >
            <WhatsAppIcon size={15} /> {t("card.whatsapp")}
          </a>
        </div>
      </Container>
    </div>
  );
}
