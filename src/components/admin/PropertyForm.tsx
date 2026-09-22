"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X, Plus, Upload, Star } from "lucide-react";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type PropertyFormData = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  type: string;
  listingType: string;
  rentalPeriod: string;
  status: string;
  location: string;
  city: string;
  country: string;
  priceEur: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  landSqm: number | null;
  yieldPercent: number | null;
  featured: boolean;
  images: string[];
  amenities: string[];
  highlights: string[];
  latitude: number | null;
  longitude: number | null;
};

const EMPTY: PropertyFormData = {
  slug: "", title: "", tagline: "", description: "", type: "VILLA", listingType: "SALE",
  rentalPeriod: "", status: "AVAILABLE", location: "", city: "", country: "", priceEur: 0,
  bedrooms: 0, bathrooms: 0, areaSqm: 0, landSqm: null, yieldPercent: null, featured: false,
  images: [], amenities: [], highlights: [], latitude: null, longitude: null,
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function ListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v) { onChange([...items, v]); setDraft(""); }
  };
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="shrink-0 border border-sand-300 px-4 hover:bg-sand-100" aria-label="Add">
          <Plus size={16} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((it, i) => (
            <span key={`${it}-${i}`} className="inline-flex items-center gap-2 border border-sand-200 bg-sand-50 px-3 py-1 text-sm text-sand-800">
              {it}
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><X size={13} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyForm({ initial, id }: { initial?: Partial<PropertyFormData>; id?: string }) {
  const router = useRouter();
  const [data, setData] = useState<PropertyFormData>({ ...EMPTY, ...initial });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof PropertyFormData>(k: K, v: PropertyFormData[K]) => setData((d) => ({ ...d, [k]: v }));

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) urls.push(json.data.url);
      else setError(json.error ?? "Upload failed.");
    }
    if (urls.length) set("images", [...data.images, ...urls]);
    setUploading(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (data.images.length === 0) { setError("Add at least one photo."); return; }
    setStatus("saving");
    setError(null);
    const payload = {
      ...data,
      slug: data.slug || slugify(data.title),
      tagline: data.tagline || null,
      rentalPeriod: data.listingType === "HOLIDAY_RENT" && data.rentalPeriod ? data.rentalPeriod : null,
      heroImage: data.images[0],
      landSqm: data.landSqm || null,
      yieldPercent: data.yieldPercent || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    };
    const res = await fetch(id ? `/api/properties/${id}` : "/api/properties", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success) {
      router.push("/admin/properties");
      router.refresh();
    } else {
      setStatus("error");
      setError(json.error ?? "Could not save. Check the fields and try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-8">
      {/* Photos */}
      <section>
        <Label>Photos</Label>
        <p className="mb-3 text-xs text-sand-500">The first photo is used as the cover. Click the star to make a photo the cover.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {data.images.map((src, i) => (
            <div key={`${src}-${i}`} className="group relative aspect-[4/3] overflow-hidden border border-sand-200 bg-sand-100">
              <Image src={src} alt="" fill sizes="150px" className="object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 bg-sand-900/85 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-sand-50">Cover</span>}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button type="button" aria-label="Make cover" onClick={() => set("images", [src, ...data.images.filter((_, j) => j !== i)])} className="rounded-full bg-white p-1.5 text-sand-900"><Star size={13} /></button>
                )}
                <button type="button" aria-label="Remove" onClick={() => set("images", data.images.filter((_, j) => j !== i))} className="rounded-full bg-white p-1.5 text-sand-900"><X size={13} /></button>
              </div>
            </div>
          ))}
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-sand-300 text-sand-500 hover:border-sand-600 hover:text-sand-800">
            <Upload size={18} />
            <span className="text-[0.6rem] uppercase tracking-wider">{uploading ? "Uploading…" : "Add photo"}</span>
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploading}
              onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      </section>

      {/* Core */}
      <section className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={data.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" value={data.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(data.title) || "auto-from-title"} />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" value={data.type} onChange={(e) => set("type", e.target.value)}>
            {["VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"].map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="listingType">Listing</Label>
          <Select id="listingType" value={data.listingType} onChange={(e) => set("listingType", e.target.value)}>
            <option value="SALE">For Sale</option>
            <option value="RENT">For Rent</option>
            <option value="HOLIDAY_RENT">Holiday Rental</option>
          </Select>
        </div>
        {data.listingType === "HOLIDAY_RENT" && (
          <div>
            <Label htmlFor="rentalPeriod">Rental period</Label>
            <Select id="rentalPeriod" value={data.rentalPeriod} onChange={(e) => set("rentalPeriod", e.target.value)}>
              <option value="">—</option>
              <option value="DAY">Per night</option>
              <option value="WEEK">Per week</option>
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" value={data.status} onChange={(e) => set("status", e.target.value)}>
            {["DRAFT", "AVAILABLE", "RESERVED", "SOLD"].map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={data.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={240} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={data.description} onChange={(e) => set("description", e.target.value)} required minLength={20} className="min-h-32" />
        </div>
      </section>

      {/* Location + figures */}
      <section className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-3"><Label htmlFor="location">Address / location</Label><Input id="location" value={data.location} onChange={(e) => set("location", e.target.value)} /></div>
        <div><Label htmlFor="city">City</Label><Input id="city" value={data.city} onChange={(e) => set("city", e.target.value)} /></div>
        <div><Label htmlFor="country">Country</Label><Input id="country" value={data.country} onChange={(e) => set("country", e.target.value)} /></div>
        <div><Label htmlFor="priceEur">Price (EUR)</Label><Input id="priceEur" type="number" min={0} value={data.priceEur} onChange={(e) => set("priceEur", Number(e.target.value))} /></div>
        <div><Label htmlFor="bedrooms">Bedrooms</Label><Input id="bedrooms" type="number" min={0} value={data.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} /></div>
        <div><Label htmlFor="bathrooms">Bathrooms</Label><Input id="bathrooms" type="number" min={0} value={data.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} /></div>
        <div><Label htmlFor="areaSqm">Interior (m²)</Label><Input id="areaSqm" type="number" min={0} value={data.areaSqm} onChange={(e) => set("areaSqm", Number(e.target.value))} /></div>
        <div><Label htmlFor="landSqm">Land (m²)</Label><Input id="landSqm" type="number" min={0} value={data.landSqm ?? ""} onChange={(e) => set("landSqm", e.target.value ? Number(e.target.value) : null)} /></div>
        <div><Label htmlFor="yieldPercent">Yield (%)</Label><Input id="yieldPercent" type="number" step="0.1" min={0} value={data.yieldPercent ?? ""} onChange={(e) => set("yieldPercent", e.target.value ? Number(e.target.value) : null)} /></div>
        <div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" type="number" step="any" value={data.latitude ?? ""} onChange={(e) => set("latitude", e.target.value ? Number(e.target.value) : null)} /></div>
        <div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" type="number" step="any" value={data.longitude ?? ""} onChange={(e) => set("longitude", e.target.value ? Number(e.target.value) : null)} /></div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <ListEditor label="Amenities" items={data.amenities} onChange={(v) => set("amenities", v)} placeholder="e.g. Infinity Pool" />
        <ListEditor label="Highlights" items={data.highlights} onChange={(v) => set("highlights", v)} placeholder="e.g. 8 hectares of grounds" />
      </section>

      <label className="flex items-center gap-3 text-sm text-sand-800">
        <input type="checkbox" checked={data.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4" />
        Feature on the homepage
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={status === "saving" || uploading}>
          {status === "saving" ? "Saving…" : id ? "Save changes" : "Create property"}
        </Button>
        <button type="button" onClick={() => router.push("/admin/properties")} className="px-6 text-xs uppercase tracking-[0.18em] text-sand-600 hover:text-sand-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
