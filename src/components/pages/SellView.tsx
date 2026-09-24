"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, ImagePlus, KeyRound, Pencil, Tag, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { TYPE_ICONS } from "@/components/properties/featureIcons";
import { whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { RevealText } from "@/components/shared/RevealText";

const PROPERTY_TYPES = ["VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"];
const DISTRICTS = ["Palmeraie", "Hivernage", "Gueliz", "Medina", "Ourika", "Targa"];
const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 2400;
const EASE = [0.16, 1, 0.3, 1] as const;

type ListingType = "SALE" | "RENT";
type Photo = { id: string; file: File; url: string };
type Details = { propertyType: string; city: string; name: string; email: string; phone: string };
type PhotoIssue = "type" | "size" | null;

const STEP_KEYS = ["sell.step.intent", "sell.step.photos", "sell.step.contact", "sell.step.review"];

/**
 * Makes a picked file safe to upload: decodes it, downsizes anything larger
 * than MAX_EDGE and re-encodes as JPEG when needed. Phone photos are often
 * 8–12MB (over our 5MB limit) or HEIC — this turns those into small JPEGs
 * instead of rejecting them. Returns null when the browser can't read it.
 */
async function prepareImage(file: File): Promise<File | null> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const passthrough = scale === 1 && file.size <= MAX_BYTES && /^image\/(jpeg|png|webp)$/.test(file.type);
    if (passthrough) {
      bmp.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return null;
    }
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return null;
  }
}

function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [issue, setIssue] = useState<PhotoIssue>(null);
  const [busy, setBusy] = useState(false);
  const photosRef = useRef<Photo[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  async function add(files: FileList | File[] | null) {
    if (!files) return;
    const room = Math.max(0, MAX_PHOTOS - photosRef.current.length);
    const incoming = Array.from(files).slice(0, room);
    if (incoming.length === 0) return;
    setBusy(true);
    setIssue(null);
    const next: Photo[] = [];
    let failed = false;
    for (const original of incoming) {
      const file = await prepareImage(original);
      if (!file || file.size > MAX_BYTES) {
        failed = true;
        continue;
      }
      next.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        url: URL.createObjectURL(file),
      });
    }
    if (failed) setIssue("type");
    if (next.length) setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS));
    setBusy(false);
  }

  function remove(id: string) {
    setPhotos((p) => {
      const found = p.find((x) => x.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return p.filter((x) => x.id !== id);
    });
    setIssue(null);
  }

  function makeCover(id: string) {
    setPhotos((p) => {
      const idx = p.findIndex((x) => x.id === id);
      if (idx <= 0) return p;
      const copy = [...p];
      const [item] = copy.splice(idx, 1);
      copy.unshift(item);
      return copy;
    });
  }

  return { photos, add, remove, makeCover, issue, busy };
}

function StepHeader({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="flex items-center">
      {labels.map((label, i) => (
        <li key={label} className={cn("flex items-center", i < labels.length - 1 && "flex-1")} aria-current={i === step ? "step" : undefined}>
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs transition-colors duration-300",
                i < step
                  ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
                  : i === step
                    ? "border-sand-900 text-sand-900 dark:border-sand-100 dark:text-sand-100"
                    : "border-sand-300 text-sand-400 dark:border-sand-700 dark:text-sand-600"
              )}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-[0.6rem] uppercase tracking-[0.18em] sm:block",
                i <= step ? "text-sand-800 dark:text-sand-200" : "text-sand-400 dark:text-sand-600"
              )}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className="relative mx-2 h-px flex-1 -translate-y-3.5 bg-sand-200 dark:bg-sand-800 sm:mx-3">
              <div
                className="absolute inset-y-0 left-0 bg-sand-900 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:bg-sand-100"
                style={{ width: i < step ? "100%" : "0%" }}
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function IntentStep({
  listingType,
  onListingType,
  details,
  onDetails,
}: {
  listingType: ListingType;
  onListingType: (v: ListingType) => void;
  details: Details;
  onDetails: (patch: Partial<Details>) => void;
}) {
  const { t } = useLang();
  const intents = [
    { value: "SALE" as const, icon: Tag, titleKey: "sell.intent.sale.title", descKey: "sell.intent.sale.desc" },
    { value: "RENT" as const, icon: KeyRound, titleKey: "sell.intent.rent.title", descKey: "sell.intent.rent.desc" },
  ];
  return (
    <div>
      <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{t("sell.intent.title")}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {intents.map((o) => {
          const active = listingType === o.value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onListingType(o.value)}
              className={cn(
                "group relative overflow-hidden border p-6 text-left transition-all duration-500",
                active
                  ? "border-sand-900 bg-sand-900 dark:border-sand-100 dark:bg-sand-100"
                  : "border-sand-300 hover:-translate-y-0.5 hover:border-sand-600 dark:border-sand-700 dark:hover:border-sand-400"
              )}
            >
              <Icon size={24} strokeWidth={1.4} className={cn("transition-transform duration-500 group-hover:scale-110", active ? "text-sand-50 dark:text-sand-900" : "text-sand-700 dark:text-sand-300")} />
              <p className={cn("mt-5 font-display text-2xl", active ? "text-sand-50 dark:text-sand-900" : "text-sand-900 dark:text-sand-100")}>{t(o.titleKey)}</p>
              <p className={cn("mt-1 text-sm leading-relaxed", active ? "text-sand-200 dark:text-sand-700" : "text-sand-600 dark:text-sand-400")}>{t(o.descKey)}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-9">
        <Label>{t("sell.form.type")}</Label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((pt) => {
            const on = details.propertyType === pt;
            const Icon = TYPE_ICONS[pt];
            return (
              <button
                key={pt}
                type="button"
                aria-pressed={on}
                onClick={() => onDetails({ propertyType: pt })}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize transition-colors",
                  on
                    ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
                    : "border-sand-300 text-sand-800 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200"
                )}
              >
                {Icon && <Icon size={15} strokeWidth={1.6} />}
                {pt.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        <Label htmlFor="city">{t("sell.form.city")}</Label>
        <Input id="city" value={details.city} onChange={(e) => onDetails({ city: e.target.value })} minLength={2} maxLength={120} placeholder="e.g. Gueliz" />
        <div className="mt-3 flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDetails({ city: d })}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                details.city === d
                  ? "bg-sand-900 text-sand-50 dark:bg-sand-100 dark:text-sand-900"
                  : "bg-sand-200 text-sand-800 hover:bg-sand-300 dark:bg-sand-800 dark:text-sand-200 dark:hover:bg-sand-700"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhotosStep({
  photos,
  onAdd,
  onRemove,
  onMakeCover,
  issue,
  busy,
}: {
  photos: Photo[];
  onAdd: (files: FileList | File[] | null) => void;
  onRemove: (id: string) => void;
  onMakeCover: (id: string) => void;
  issue: PhotoIssue;
  busy: boolean;
}) {
  const { t } = useLang();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const full = photos.length >= MAX_PHOTOS;
  const open = () => !full && inputRef.current?.click();

  return (
    <div>
      <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{t("sell.photos.title")}</h2>
      <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{t("sell.photos.tips")}</p>

      {/* Always-visible drop area with a real, labelled button */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onAdd(e.dataTransfer.files);
        }}
        className={cn(
          "mt-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors duration-300",
          full
            ? "border-sand-200 bg-sand-100/50 dark:border-sand-800 dark:bg-sand-800/30"
            : dragOver
              ? "border-sand-900 bg-sand-100 dark:border-sand-100 dark:bg-sand-800"
              : "border-sand-400 bg-sand-50/60 dark:border-sand-600 dark:bg-white/[0.03]"
        )}
      >
        <motion.div animate={{ scale: dragOver ? 1.2 : 1 }} transition={{ duration: 0.2 }}>
          <Camera size={30} strokeWidth={1.3} className="text-sand-600 dark:text-sand-300" />
        </motion.div>
        <p className="text-sand-800 dark:text-sand-200">{t("sell.photos.drop")}</p>
        <button
          type="button"
          onClick={open}
          disabled={full || busy}
          className="mt-1 inline-flex items-center gap-2 bg-sand-900 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-50 transition-colors hover:bg-sand-700 disabled:opacity-50 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
        >
          {busy ? <Spinner size={14} /> : <ImagePlus size={15} />}
          {busy ? t("sell.photos.processing") : t("sell.photos.choose")}
        </button>
        <p className="text-xs text-sand-500 dark:text-sand-400">{t("sell.form.photos.hint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label={t("sell.photos.choose")}
          onChange={(e) => {
            onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {issue && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          {t("sell.photos.error.type")}
        </p>
      )}

      {/* Five numbered slots so it is obvious how many fit */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-sand-600 dark:text-sand-400">
          {t("sell.photos.count").replace("{n}", String(photos.length)).replace("{max}", String(MAX_PHOTOS))}
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
          const p = photos[i];
          return (
            <li key={i} className="relative aspect-square overflow-hidden">
              {p ? (
                <div className="group absolute inset-0 border border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-800">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, next/image can't optimize object URLs */}
                  <img src={p.url} alt="" className="h-full w-full animate-page-in object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 bg-sand-900/90 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-sand-50">
                      {t("sell.photos.cover")}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={t("sell.photos.remove")}
                    onClick={() => onRemove(p.id)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-sand-900 shadow transition-transform hover:scale-110"
                  >
                    <X size={13} />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => onMakeCover(p.id)}
                      className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-[0.55rem] uppercase tracking-wider text-white [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:group-hover:opacity-100"
                    >
                      {t("sell.photos.makeCover")}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={open}
                  disabled={busy}
                  aria-label={t("sell.photos.choose")}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 border border-dashed border-sand-300 text-sand-400 transition-colors hover:border-sand-600 hover:text-sand-700 dark:border-sand-700 dark:text-sand-500 dark:hover:border-sand-400 dark:hover:text-sand-300"
                >
                  <ImagePlus size={18} strokeWidth={1.4} />
                  <span className="text-[0.65rem] tabular-nums">{i + 1}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContactStep({ details, onDetails }: { details: Details; onDetails: (patch: Partial<Details>) => void }) {
  const { t } = useLang();
  return (
    <div>
      <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{t("sell.contact.title")}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input id="name" autoComplete="name" value={details.name} onChange={(e) => onDetails({ name: e.target.value })} minLength={2} maxLength={120} />
        </div>
        <div>
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input id="email" type="email" autoComplete="email" value={details.email} onChange={(e) => onDetails({ email: e.target.value })} maxLength={255} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="phone">{t("sell.form.phone")}</Label>
          <Input id="phone" type="tel" autoComplete="tel" value={details.phone} onChange={(e) => onDetails({ phone: e.target.value })} minLength={4} maxLength={40} />
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ listingType, details, photos, onEdit }: { listingType: ListingType; details: Details; photos: Photo[]; onEdit: (step: number) => void }) {
  const { t } = useLang();
  const groups: { step: number; rows: [string, string][] }[] = [
    {
      step: 0,
      rows: [
        [t("sell.review.intent"), listingType === "RENT" ? t("sell.review.for.rent") : t("sell.review.for.sale")],
        [t("sell.form.type"), details.propertyType.toLowerCase()],
        [t("sell.form.city"), details.city],
      ],
    },
    {
      step: 2,
      rows: [
        [t("form.name"), details.name],
        [t("form.email"), details.email],
        [t("sell.form.phone"), details.phone],
      ],
    },
  ];
  return (
    <div>
      <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{t("sell.review.title")}</h2>
      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <div key={g.step} className="border border-sand-200 dark:border-sand-800">
            <dl className="divide-y divide-sand-200 dark:divide-sand-800">
              {g.rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="text-xs uppercase tracking-[0.18em] text-sand-500 dark:text-sand-400">{label}</dt>
                  <dd className="text-right capitalize text-sand-900 dark:text-sand-100">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => onEdit(g.step)} className="flex w-full items-center justify-center gap-2 border-t border-sand-200 py-2.5 text-xs uppercase tracking-[0.2em] text-sand-600 transition-colors hover:text-sand-900 dark:border-sand-800 dark:text-sand-400 dark:hover:text-sand-100">
              <Pencil size={12} /> {t("sell.review.edit")}
            </button>
          </div>
        ))}

        <div className="border border-sand-200 p-5 dark:border-sand-800">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-sand-500 dark:text-sand-400">
              {t("sell.review.photos")} ({photos.length})
            </p>
            <button type="button" onClick={() => onEdit(1)} className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100">
              <Pencil size={12} /> {t("sell.review.edit")}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img key={p.id} src={p.url} alt="" className="h-16 w-16 border border-sand-200 object-cover dark:border-sand-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ASIDE = [
  { t: "services.sellers.item1.t", d: "services.sellers.item1.d" },
  { t: "services.sellers.item2.t", d: "services.sellers.item2.d" },
  { t: "services.sellers.item4.t", d: "services.sellers.item4.d" },
];

export function SellView() {
  const { t } = useLang();
  const { photos, add, remove, makeCover, issue, busy } = usePhotos();
  const [listingType, setListingType] = useState<ListingType>("SALE");
  const [details, setDetails] = useState<Details>({ propertyType: "VILLA", city: "", name: "", email: "", phone: "" });
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const patchDetails = (patch: Partial<Details>) => setDetails((d) => ({ ...d, ...patch }));

  const stepValid = [
    details.city.trim().length >= 2,
    photos.length > 0 && !busy,
    details.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(details.email) && details.phone.trim().length >= 4,
    true,
  ];

  async function onSubmit() {
    setStatus("loading");
    setError(null);
    const form = new FormData();
    form.append("name", details.name);
    form.append("email", details.email);
    form.append("phone", details.phone);
    form.append("propertyType", details.propertyType);
    form.append("listingType", listingType);
    form.append("city", details.city);
    for (const p of photos) form.append("photos", p.file);

    try {
      const res = await fetch("/api/listing-submissions", { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setStatus("error");
        setError(json.error ?? "Something went wrong.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong.");
    }
  }

  const stepLabels = STEP_KEYS.map((k) => t(k));

  return (
    <div className="pb-24 pt-32 lg:pt-40">
      <Container className="grid gap-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-24">
        <div className="min-w-0">
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("sell.eyebrow")}</span></p>
          <RevealText as="h1" className="font-display text-5xl leading-[1.02] text-sand-900 dark:text-sand-100 lg:text-6xl">{t("sell.title")}</RevealText>
          <p className="mt-6 text-lg leading-relaxed text-sand-700 dark:text-sand-300">{t("sell.text")}</p>

          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              role="status"
              className="mt-12 border border-sand-300 p-10 text-center dark:border-sand-700"
            >
              <motion.svg width="56" height="56" viewBox="0 0 56 56" className="mx-auto text-sand-900 dark:text-sand-100" aria-hidden="true">
                <motion.circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0, opacity: 0.3 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6, ease: EASE }} />
                <motion.path d="M17 29l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4, ease: EASE }} />
              </motion.svg>
              <p className="mt-6 font-display text-3xl text-sand-900 dark:text-sand-100">{t("sell.success.title")}</p>
              <p className="mt-4 leading-relaxed text-sand-700 dark:text-sand-300">{t("sell.success.text")}</p>
            </motion.div>
          ) : (
            <div className="mt-14">
              <StepHeader step={step} labels={stepLabels} />

              {/* Plain keyed CSS fade: every step is always mounted straight away —
                  no exit animation to wait on, so a step can never render blank. */}
              <div key={step} className="mt-10 animate-page-in">
                {step === 0 && <IntentStep listingType={listingType} onListingType={setListingType} details={details} onDetails={patchDetails} />}
                {step === 1 && <PhotosStep photos={photos} onAdd={add} onRemove={remove} onMakeCover={makeCover} issue={issue} busy={busy} />}
                {step === 2 && <ContactStep details={details} onDetails={patchDetails} />}
                {step === 3 && <ReviewStep listingType={listingType} details={details} photos={photos} onEdit={setStep} />}
              </div>

              {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className={cn(
                    "text-xs uppercase tracking-[0.22em] text-sand-600 transition-opacity dark:text-sand-400",
                    step === 0 ? "pointer-events-none opacity-0" : "opacity-100 hover:text-sand-900 dark:hover:text-sand-100"
                  )}
                >
                  {t("sell.nav.back")}
                </button>

                {step < 3 ? (
                  <Button type="button" disabled={!stepValid[step]} onClick={() => setStep((s) => s + 1)}>
                    {t("sell.nav.next")}
                  </Button>
                ) : (
                  <Button type="button" disabled={status === "loading"} onClick={onSubmit} className="gap-2">
                    {status === "loading" && <Spinner size={15} />}
                    {status === "loading" ? t("sell.sending") : t("sell.submit")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-sand-200 bg-sand-50 p-8 dark:border-sand-800 dark:bg-sand-900">
            <p className="eyebrow mb-6">{t("sell.aside.title")}</p>
            <ul className="space-y-6">
              {ASIDE.map((a, i) => (
                <li key={a.t} className="flex gap-4">
                  <span className="font-display text-3xl leading-none text-sand-400 dark:text-sand-600">0{i + 1}</span>
                  <div>
                    <p className="font-display text-xl text-sand-900 dark:text-sand-100">{t(a.t)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-sand-700 dark:text-sand-300">{t(a.d)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href={whatsappHref(whatsappMessageForPath("/list-your-property"))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-sand-900/30 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-900 transition-colors hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100/30 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900"
            >
              <WhatsAppIcon size={15} /> {t("card.whatsapp")}
            </a>
          </div>
        </aside>
      </Container>
    </div>
  );
}
