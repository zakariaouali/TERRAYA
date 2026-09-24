"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Upload, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { RevealText } from "@/components/shared/RevealText";

const PROPERTY_TYPES = ["VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"];
const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const EASE = [0.16, 1, 0.3, 1] as const;

type ListingType = "SALE" | "RENT";
type Photo = { id: string; file: File; url: string };
type Details = { propertyType: string; city: string; name: string; email: string; phone: string };

const STEP_KEYS = ["sell.step.intent", "sell.step.photos", "sell.step.contact", "sell.step.review"];

function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sizeError, setSizeError] = useState(false);
  const photosRef = useRef<Photo[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function add(files: FileList | File[] | null) {
    if (!files) return;
    const room = Math.max(0, MAX_PHOTOS - photos.length);
    const incoming = Array.from(files).slice(0, room);
    const accepted = incoming.filter((f) => f.size <= MAX_BYTES);
    setSizeError(incoming.length !== accepted.length);
    const next = accepted.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    if (next.length) setPhotos((p) => [...p, ...next]);
  }

  function remove(id: string) {
    setPhotos((p) => {
      const found = p.find((x) => x.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return p.filter((x) => x.id !== id);
    });
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

  return { photos, add, remove, makeCover, sizeError };
}

function StepHeader({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center">
      {labels.map((label, i) => (
        <div key={label} className={cn("flex items-center", i < labels.length - 1 && "flex-1")}>
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
              <motion.div
                className="absolute inset-y-0 left-0 bg-sand-900 dark:bg-sand-100"
                initial={false}
                animate={{ width: i < step ? "100%" : "0%" }}
                transition={{ duration: 0.45, ease: EASE }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
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
  const intents: { value: ListingType; titleKey: string; descKey: string }[] = [
    { value: "SALE", titleKey: "sell.intent.sale.title", descKey: "sell.intent.sale.desc" },
    { value: "RENT", titleKey: "sell.intent.rent.title", descKey: "sell.intent.rent.desc" },
  ];
  return (
    <div>
      <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{t("sell.intent.title")}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {intents.map((o) => {
          const active = listingType === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onListingType(o.value)}
              className={cn(
                "relative overflow-hidden border p-6 text-left transition-colors duration-300",
                active ? "border-sand-900 dark:border-sand-100" : "border-sand-300 hover:border-sand-500 dark:border-sand-700 dark:hover:border-sand-500"
              )}
            >
              {active && (
                <motion.div
                  layoutId="intent-bg"
                  className="absolute inset-0 bg-sand-900 dark:bg-sand-100"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <div className="relative z-10">
                <p className={cn("font-display text-2xl", active ? "text-sand-50 dark:text-sand-900" : "text-sand-900 dark:text-sand-100")}>
                  {t(o.titleKey)}
                </p>
                <p className={cn("mt-1 text-sm leading-relaxed", active ? "text-sand-200 dark:text-sand-700" : "text-sand-600 dark:text-sand-400")}>
                  {t(o.descKey)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="propertyType">{t("sell.form.type")}</Label>
          <Select id="propertyType" value={details.propertyType} onChange={(e) => onDetails({ propertyType: e.target.value })}>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="city">{t("sell.form.city")}</Label>
          <Input
            id="city"
            value={details.city}
            onChange={(e) => onDetails({ city: e.target.value })}
            minLength={2}
            maxLength={120}
            placeholder="e.g. Gueliz"
          />
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
  sizeError,
}: {
  photos: Photo[];
  onAdd: (files: FileList | File[] | null) => void;
  onRemove: (id: string) => void;
  onMakeCover: (id: string) => void;
  sizeError: boolean;
}) {
  const { t } = useLang();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{t("sell.photos.title")}</h2>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (photos.length < MAX_PHOTOS) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onAdd(e.dataTransfer.files);
        }}
        className={cn(
          "mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-10 text-center transition-colors duration-300",
          photos.length >= MAX_PHOTOS
            ? "cursor-not-allowed border-sand-200 opacity-50 dark:border-sand-800"
            : dragOver
              ? "border-sand-900 bg-sand-100 dark:border-sand-100 dark:bg-sand-800"
              : "border-sand-300 hover:border-sand-500 dark:border-sand-700 dark:hover:border-sand-500"
        )}
      >
        <motion.div animate={{ scale: dragOver ? 1.15 : 1 }} transition={{ duration: 0.2 }}>
          <Upload size={22} className="text-sand-500" />
        </motion.div>
        <p className="text-sm text-sand-700 dark:text-sand-300">{t("sell.photos.drop")}</p>
        <p className="text-xs text-sand-500">{t("sell.form.photos.hint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={photos.length >= MAX_PHOTOS}
          onChange={(e) => {
            onAdd(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {sizeError && <p className="mt-3 text-sm text-red-700 dark:text-red-400">{t("sell.photos.error.size")}</p>}

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
        <AnimatePresence initial={false}>
          {photos.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="group relative aspect-square overflow-hidden border border-sand-200 bg-sand-100 dark:border-sand-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, next/image can't optimize object URLs */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 bg-sand-900/85 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-sand-50">
                  {t("sell.photos.cover")}
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => onRemove(p.id)}
                  className="rounded-full bg-white p-1.5 text-sand-900"
                >
                  <X size={13} />
                </button>
              </div>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => onMakeCover(p.id)}
                  className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-[0.55rem] uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {t("sell.photos.cover")}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center border border-dashed border-sand-300 text-sand-400 transition-colors hover:border-sand-500 hover:text-sand-600 dark:border-sand-700 dark:hover:border-sand-500"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
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
          <Input id="name" value={details.name} onChange={(e) => onDetails({ name: e.target.value })} minLength={2} maxLength={120} />
        </div>
        <div>
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input id="email" type="email" value={details.email} onChange={(e) => onDetails({ email: e.target.value })} maxLength={255} />
        </div>
        <div>
          <Label htmlFor="phone">{t("sell.form.phone")}</Label>
          <Input id="phone" type="tel" value={details.phone} onChange={(e) => onDetails({ phone: e.target.value })} minLength={4} maxLength={40} />
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ listingType, details, photos }: { listingType: ListingType; details: Details; photos: Photo[] }) {
  const { t } = useLang();
  const rows: [string, string][] = [
    [t("sell.review.intent"), listingType === "RENT" ? t("sell.review.for.rent") : t("sell.review.for.sale")],
    [t("sell.form.type"), details.propertyType],
    [t("sell.form.city"), details.city],
    [t("form.name"), details.name],
    [t("form.email"), details.email],
    [t("sell.form.phone"), details.phone],
  ];
  return (
    <div>
      <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{t("sell.review.title")}</h2>
      <dl className="mt-6 divide-y divide-sand-200 border-y border-sand-200 dark:divide-sand-800 dark:border-sand-800">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs uppercase tracking-[0.18em] text-sand-500 dark:text-sand-400">{label}</dt>
            <dd className="text-right text-sand-900 dark:text-sand-100">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-sand-500 dark:text-sand-400">
        {t("sell.review.photos")} ({photos.length})
      </p>
      <div className="mt-3 flex gap-2">
        {photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img key={p.id} src={p.url} alt="" className="h-14 w-14 object-cover border border-sand-200 dark:border-sand-800" />
        ))}
      </div>
    </div>
  );
}

export function SellView() {
  const { t } = useLang();
  const { photos, add, remove, makeCover, sizeError } = usePhotos();
  const [listingType, setListingType] = useState<ListingType>("SALE");
  const [details, setDetails] = useState<Details>({ propertyType: "VILLA", city: "", name: "", email: "", phone: "" });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const patchDetails = (patch: Partial<Details>) => setDetails((d) => ({ ...d, ...patch }));

  const stepValid = [
    details.city.trim().length >= 2,
    photos.length > 0,
    details.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(details.email) && details.phone.trim().length >= 4,
    true,
  ];

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

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

    const res = await fetch("/api/listing-submissions", { method: "POST", body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      setStatus("error");
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setStatus("sent");
  }

  const stepLabels = STEP_KEYS.map((k) => t(k));

  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container className="max-w-2xl">
        <p className="eyebrow mb-4"><span className="luxury-divider">{t("sell.eyebrow")}</span></p>
        <RevealText as="h1" className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.02]">{t("sell.title")}</RevealText>
        <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">
          {t("sell.text")}
        </p>

        {status === "sent" ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-12 border border-sand-300 dark:border-sand-700 p-10 text-center"
          >
            <motion.svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              className="mx-auto text-sand-900 dark:text-sand-100"
            >
              <motion.circle
                cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0.3 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              />
              <motion.path
                d="M17 29l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
              />
            </motion.svg>
            <p className="font-display text-3xl text-sand-900 dark:text-sand-100 mt-6">{t("sell.success.title")}</p>
            <p className="mt-4 text-sand-700 dark:text-sand-300 leading-relaxed">{t("sell.success.text")}</p>
          </motion.div>
        ) : (
          <div className="mt-14">
            <StepHeader step={step} labels={stepLabels} />

            <div className="relative mt-10 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -32 : 32 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {step === 0 && (
                    <IntentStep listingType={listingType} onListingType={setListingType} details={details} onDetails={patchDetails} />
                  )}
                  {step === 1 && (
                    <PhotosStep photos={photos} onAdd={add} onRemove={remove} onMakeCover={makeCover} sizeError={sizeError} />
                  )}
                  {step === 2 && <ContactStep details={details} onDetails={patchDetails} />}
                  {step === 3 && <ReviewStep listingType={listingType} details={details} photos={photos} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {error && <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className={cn(
                  "text-xs uppercase tracking-[0.22em] text-sand-600 transition-opacity dark:text-sand-400",
                  step === 0 ? "pointer-events-none opacity-0" : "opacity-100 hover:text-sand-900 dark:hover:text-sand-100"
                )}
              >
                {t("sell.nav.back")}
              </button>

              {step < 3 ? (
                <Button type="button" disabled={!stepValid[step]} onClick={() => goTo(step + 1)}>
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
