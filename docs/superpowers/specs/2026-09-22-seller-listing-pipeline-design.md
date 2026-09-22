# TERRAYA — Sub-project 4: Seller "List Your Property" Pipeline

Status: approved for implementation planning
Date: 2026-09-22

## Context

TERRAYA is a Marrakech-only luxury real-estate agency site. Three sub-
projects are complete: the MySQL migration + hardening, the Marrakech-only
inventory + monthly-rental pricing model, and contextual WhatsApp + dormant
email confirmations. This is sub-project 4 on the roadmap: a free listing
pipeline for property owners who want TERRAYA to sell or rent their
property, matching the business's actual process (owner describes it
below, paraphrased):

> A seller submits their name, phone, basic property info, and their own
> (non-professional) photos. TERRAYA's owner contacts them directly by
> phone/WhatsApp to gather more detail, then sends a professional team to
> shoot real photos. The submission is then published as a real listing.
> This is free for the seller — commission is taken later, on a sale/rent.

## Goals

- A public page where a prospective seller submits: name, phone, email,
  property type, city/district, and up to 5 of their own photos.
- The submission lands in a new admin review queue — it is **not** a live
  `Property` until the owner explicitly converts it.
- The owner can update a submission's status (New / Contacted / Declined)
  and, when ready, convert it into a real property listing without
  re-typing what the seller already provided.
- A contextual WhatsApp CTA and a dormant confirmation email (client +
  owner), matching the pattern already established in sub-project 3.
- A new "Sell" link in the header nav, since this is a first-class way to
  reach the business, not a buried footer link.

## Non-goals

- No pricing/valuation logic — the seller does not state an asking price,
  and TERRAYA does not estimate one automatically. That's a human,
  off-platform judgment call, consistent with the owner's actual process.
- No in-app messaging/chat with the seller — contact happens by phone or
  WhatsApp, off-platform, as today.
- No automatic photo enhancement or the professional photoshoot itself —
  those are the owner's real-world next steps after contact, not app
  features.
- No commission tracking/invoicing — out of scope entirely for this
  platform right now.
- No changes to the existing `/api/upload` (staff-only) endpoint — the new
  public upload path is a separate, independently-secured endpoint.

## Design

### 1. Data model

New Prisma model, alongside `Inquiry`/`ConsultationRequest`:

```prisma
model ListingSubmission {
  id                  String   @id @default(cuid())
  name                String
  phone               String
  email               String   @db.VarChar(255)
  propertyType        String // VILLA | ESTATE | PENTHOUSE | RESIDENCE | RIAD | LAND
  city                String
  images              String   @db.Text // JSON-encoded string[]
  status              String   @default("NEW") // NEW | CONTACTED | CONVERTED | DECLINED
  convertedPropertyId String?
  ip                  String?
  createdAt           DateTime @default(now())

  @@index([status, createdAt])
}
```

`images` is sized `@db.Text` from the start — the earlier truncation bug
(sub-project 2's DB fix) makes this an established, deliberate pattern now,
not an oversight to repeat.

### 2. Public submission endpoint

`POST /api/listing-submissions` — a single atomic multipart request,
mirroring the shape of `POST /api/inquiries` for the non-file fields and
`POST /api/upload` for file handling, but as its own endpoint (no auth
required, unlike `/api/upload`):

- Rate limit: `listing-submission:${ip}`, 5/min — same ceiling as
  inquiries and consultations.
- Text fields validated via a new `listingSubmissionSchema` in
  `src/lib/validation.ts`: `name` (2–120), `phone` (max 40), `email`
  (email, max 255), `propertyType` (enum, matching `Property.type`'s
  existing values), `city` (max 120).
- Photos: up to 5 files, 5MB each (tighter than the admin upload's 8MB,
  since this is a new anonymous-write surface). Each file's real content
  is sniffed with the existing `sniffImageType()` from sub-project 1 — the
  same allowlist (JPEG/PNG/WebP/AVIF), same rejection of anything else
  (including SVG). At least 1 photo is required.
- Saved to `public/uploads/` with a `submission-` filename prefix (kept
  distinct from admin-uploaded property photos, though both live in the
  same directory).
- On success: creates the `ListingSubmission` row, then (dormant until
  `RESEND_API_KEY` is configured, per sub-project 3's `hasEmail()` pattern)
  sends a confirmation email to the seller and a notification email to
  `ADMIN_EMAIL`.
- No `hasDatabase()` fallback-to-file path here — unlike inquiries, a
  listing submission's photos already require a real upload target, so
  there is no meaningful no-database mode for this endpoint. If
  `DATABASE_URL` is ever unset, this endpoint returns a clear 503 rather
  than silently dropping photos.

### 3. Admin review queue

- `GET /api/listing-submissions` (ADMIN/EDITOR only, same auth pattern as
  every other admin API route) — list, newest first.
- `PATCH /api/listing-submissions/[id]` (ADMIN/EDITOR only) — updates
  `status`, or (from the conversion flow) sets `status = CONVERTED` and
  `convertedPropertyId`.
- New `/admin/listings` page: a table (name, phone, email, property type,
  city, thumbnail of the first photo, status, submitted date), with a
  status `<select>` per row (New/Contacted/Declined) and a "Convert to
  property" button.
- Admin nav (`AdminShell`) gets a "Listings" link alongside Properties and
  Inquiries.

### 4. Conversion into a real property

- "Convert to property" links to
  `/admin/properties/new?fromSubmission=<id>`.
- `/admin/properties/new`'s server component, when `fromSubmission` is
  present, loads that `ListingSubmission` and passes an `initial` object
  into the existing `PropertyForm` (already accepts partial `initial`):
  `title` seeded from the seller's name + property type (e.g. "Villa —
  submitted by Karim"), `type`, `city`, `country: "Morocco"`, and `images`
  copied from the submission's photos (so the admin doesn't have to
  re-upload them, and can still add/replace with professional photos once
  shot). Price, description, bedrooms, etc. are left blank — the admin
  fills those in after following up with the seller.
- `PropertyForm` gains an optional `fromSubmissionId` prop. On successful
  property creation *when this prop is set*, it calls
  `PATCH /api/listing-submissions/[id]` with
  `{ status: "CONVERTED", convertedPropertyId: <new property id> }`
  immediately after the property POST succeeds.

### 5. Public page, WhatsApp, nav

- New page `/list-your-property`, following the visual pattern of
  `/consultation` (a page-level form, not a modal): hero copy explaining
  the free, no-commitment nature of the process (matching the owner's
  actual pitch — free submission, professional photos provided, commission
  only on a completed sale/rent), the form itself, and a WhatsApp CTA
  ("I'd like to list my property") using the existing
  `whatsappMessageForPath()` map from sub-project 3 (add a `/list-your-
  property` entry).
- `Header.tsx`'s `links` array gets one more entry: `{ href:
  "/list-your-property", key: "nav.sell" }`. `Footer.tsx`'s "Explore"
  column also gets a matching link, for consistency with how Properties/
  Investment/Services already appear in both places.
- i18n: `nav.sell`, and a small set of `sell.*` keys for the new page's
  copy (EN + FR), following the existing key-naming convention.

## Testing

- Extend `scripts/smoke-test.mjs`:
  - Anonymous `POST /api/listing-submissions` with valid fields + one
    valid PNG succeeds (201); the row is queryable by staff via
    `GET /api/listing-submissions` immediately after.
  - A non-image file (magic-byte check) is rejected, same as the existing
    upload-rejection check.
  - Anonymous `GET`/`PATCH` on `/api/listing-submissions` are rejected
    (401), matching every other admin-only route's pattern.
  - Rate limit (5/min) is exercised the same way as the existing
    inquiry/consultation checks.
- Manual check of the conversion flow: submit → convert via the admin UI
  → confirm the resulting `Property` row has the right seeded fields and
  the submission flips to `CONVERTED` with `convertedPropertyId` set.
- `npx tsc --noEmit` clean.

## Rollout

1. Schema: add `ListingSubmission`, migrate, regenerate client.
2. `POST /api/listing-submissions` + validation + `sniffImageType` reuse.
3. `GET`/`PATCH /api/listing-submissions/[id]`.
4. Admin `/admin/listings` page + nav link.
5. Conversion flow: `PropertyForm`'s `fromSubmissionId` prop +
   `/admin/properties/new`'s `fromSubmission` query param handling.
6. Public `/list-your-property` page + form + WhatsApp CTA + nav/footer
   links + i18n copy.
7. Dormant email templates (seller confirmation + owner notification),
   wired the same way as sub-project 3.
8. Extend `scripts/smoke-test.mjs`; run it end to end.
