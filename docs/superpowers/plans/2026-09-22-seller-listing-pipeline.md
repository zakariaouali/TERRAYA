# Seller Listing Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a prospective seller submit their property (name, phone, email, type, city, up to 5 of their own photos) through a new public page; the submission lands in a new admin review queue where the owner can update its status and, when ready, convert it into a real property listing without re-typing the seller's info.

**Architecture:** One new Prisma model (`ListingSubmission`) plus one new atomic public endpoint (`POST /api/listing-submissions`, no auth, rate-limited, reuses the existing `sniffImageType` content-sniffing) that accepts form fields and photo files together in a single multipart request. A staff-only `GET`/`PATCH` on the same resource for the admin review queue. The existing admin `PropertyForm` gains an optional `fromSubmissionId` prop so converting a submission into a property reuses the existing create-property flow instead of a new one.

**Tech Stack:** Next.js 15 App Router (Node runtime API routes), Prisma 5 + MySQL, Zod, the existing `sniffImageType` (src/lib/image-sniff.ts) and `sendEmail`/`hasEmail` (src/lib/email.ts) helpers from earlier sub-projects.

**Spec:** [docs/superpowers/specs/2026-09-22-seller-listing-pipeline-design.md](../specs/2026-09-22-seller-listing-pipeline-design.md)

## Global Constraints

- Up to 5 photos per submission, 5MB each (tighter than the admin upload's 8MB — this is a new anonymous-write surface).
- Every photo's real content is sniffed with the existing `sniffImageType()` — same JPEG/PNG/WebP/AVIF allowlist, no exceptions.
- Rate limit on the public submission endpoint: `listing-submission:${ip}`, 5/min — same ceiling as inquiries/consultations.
- `propertyType` reuses `Property.type`'s existing values exactly: `VILLA | ESTATE | PENTHOUSE | RESIDENCE | RIAD | LAND`. No new enum.
- `status` values: `NEW | CONTACTED | CONVERTED | DECLINED`.
- `images` column is `@db.Text` from the start (the truncation bug from an earlier sub-project is now a known failure mode to avoid, not something to repeat).
- No `hasDatabase()`-style file fallback for this endpoint — if the database is unreachable, it returns a clear `503`, since there's no meaningful place to put uploaded photos without a database record to reference them.
- Email confirmations (client + owner) follow the exact dormant pattern from the WhatsApp/email sub-project: `sendEmail()` is a silent no-op until `RESEND_API_KEY` is set. Do not add a different gating mechanism here.
- Property type labels are shown untranslated (raw enum text) everywhere in this app already (admin table, PropertyCard's badge) — the new seller-facing select follows that same convention, not a new translation scheme.

---

## File Structure

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | Add `ListingSubmission` model |
| `src/lib/validation.ts` | Add `listingSubmissionSchema` (text fields only; photos validated separately in the route) |
| `src/lib/email-templates.ts` | Add `sellerClientEmail`, `sellerOwnerEmail` |
| `src/app/api/listing-submissions/route.ts` | Create: `POST` (public, multipart) + `GET` (staff list) |
| `src/app/api/listing-submissions/[id]/route.ts` | Create: `PATCH` (staff — status update / conversion link) |
| `src/components/admin/ListingSubmissionRowActions.tsx` | Create: status `<select>` + "Convert to property" link, mirrors `PropertyRowActions.tsx` |
| `src/app/admin/listings/page.tsx` | Create: admin review queue table, mirrors `admin/inquiries/page.tsx` |
| `src/components/admin/AdminShell.tsx` | Modify: add "Listings" nav link |
| `src/components/admin/PropertyForm.tsx` | Modify: add optional `fromSubmissionId` prop, PATCH the submission on successful create |
| `src/app/admin/properties/new/page.tsx` | Modify: read `?fromSubmission=`, prefill `PropertyForm`'s `initial` |
| `src/components/pages/SellView.tsx` | Create: the public page's content — hero copy, form (name/phone/email/type/city/photos), WhatsApp CTA |
| `src/app/list-your-property/page.tsx` | Create: route wrapper (metadata + `<SellView />`), mirrors `app/consultation/page.tsx` |
| `src/lib/contact.ts` | Modify: add a `/list-your-property` entry to the route-message map |
| `src/components/layout/Header.tsx` | Modify: add nav link |
| `src/components/layout/Footer.tsx` | Modify: add matching footer link |
| `src/lib/i18n.tsx` | Modify: `nav.sell`, `footer.link.sell`, `sell.*` keys (EN + FR) |
| `scripts/smoke-test.mjs` | Modify: extend with submission/rejection/auth checks |

---

### Task 1: Schema — `ListingSubmission` model

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: Prisma model `ListingSubmission { id, name, phone, email, propertyType, city, images, status, convertedPropertyId, ip, createdAt }` — consumed by every later task.

- [ ] **Step 1: Confirm XAMPP's MySQL is running**

Same as every earlier sub-project: open XAMPP's control panel, confirm MySQL is started. (If it's already running from earlier work, skip this.)

- [ ] **Step 2: Add the model**

Append to the end of `prisma/schema.prisma` (after `ConsultationRequest`):

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

- [ ] **Step 3: Generate and apply the migration**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx prisma migrate dev --name listing_submissions
```

If this errors with "non-interactive environment" (it shouldn't for a pure `CREATE TABLE`, since there's no data-loss warning, but if it does): run `npx prisma migrate dev --name listing_submissions --create-only`, then `npx prisma migrate deploy`.

Expected: migration created and applied, ending with "Your database is now in sync with your schema."

- [ ] **Step 4: Regenerate the client**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx prisma generate
```

If this fails with an `EPERM`/file-lock error on the query engine DLL, a running dev server is holding it — find and stop it first:
```bash
netstat -ano | grep -E ":4321" | grep LISTENING
taskkill //F //PID <the PID from that line>
```
Then re-run `npx prisma generate`.

- [ ] **Step 5: Verify**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const { PrismaClient } = require('./node_modules/@prisma/client');
(async () => {
  const p = new PrismaClient();
  console.log('count:', await p.listingSubmission.count());
  await p.\$disconnect();
})();
"
```
Expected: `count: 0` (table exists, empty).

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add prisma/schema.prisma prisma/migrations && git commit -m "feat(db): add ListingSubmission model for the seller pipeline

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Validation schema + email templates

**Files:**
- Modify: `src/lib/validation.ts`
- Modify: `src/lib/email-templates.ts`

**Interfaces:**
- Produces: `listingSubmissionSchema: ZodObject<{ name, phone, email, propertyType, city }>`, `type ListingSubmissionInput` — consumed by Task 3.
- Produces: `sellerClientEmail(data: { name: string }): { subject, html }`, `sellerOwnerEmail(data: { name, phone, email, propertyType, city }): { subject, html }` — consumed by Task 3.

- [ ] **Step 1: Add the validation schema**

In `src/lib/validation.ts`, add after `consultationSchema` (before the `imageRef` comment):

```typescript
export const listingSubmissionSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(4).max(40),
  email: z.string().email().max(255),
  propertyType: z.enum(["VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"]),
  city: z.string().min(2).max(120),
});
```

And add to the type-export block at the bottom of the file:

```typescript
export type ListingSubmissionInput = z.infer<typeof listingSubmissionSchema>;
```

- [ ] **Step 2: Add the email templates**

In `src/lib/email-templates.ts`, add at the end of the file (after `consultationOwnerEmail`):

```typescript
export function sellerClientEmail(data: { name: string }): { subject: string; html: string } {
  return {
    subject: "We've received your property submission — TERRAYA",
    html: wrap(
      "Thank you.",
      `<p style="font-size: 15px; line-height: 1.6;">Dear ${escapeHtml(data.name)},</p>
       <p style="font-size: 15px; line-height: 1.6;">We've received your property submission. A member of our office will contact you directly by phone or WhatsApp to learn more, and if it's a fit, we'll arrange for our own team to photograph the property professionally — free of charge. There is no commission unless and until we complete a sale or rental for you.</p>
       <p style="font-size: 15px; line-height: 1.6;">If it's more convenient, you're welcome to reach us directly on WhatsApp at +212 694-838739.</p>`
    ),
  };
}

export function sellerOwnerEmail(data: {
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  city: string;
}): { subject: string; html: string } {
  return {
    subject: `New listing submission — ${data.name}`,
    html: wrap(
      "New listing submission.",
      `${row("Name", data.name)}
       ${row("Phone", data.phone)}
       ${row("Email", data.email)}
       ${row("Property type", data.propertyType)}
       ${row("City", data.city)}
       <p style="margin: 16px 0 0; font-size: 13px; color: #55493d;">Review it and its photos in /admin/listings.</p>`
    ),
  };
}
```

- [ ] **Step 3: Verify**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx tsc --noEmit
```
Expected: clean (no output).

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/lib/validation.ts src/lib/email-templates.ts && git commit -m "feat(seller): add validation schema and email templates

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Public submission endpoint

**Files:**
- Create: `src/app/api/listing-submissions/route.ts`

**Interfaces:**
- Consumes: `listingSubmissionSchema` (Task 2), `sniffImageType` (`src/lib/image-sniff.ts`), `sendEmail`, `sellerClientEmail`/`sellerOwnerEmail` (Task 2), `hasDatabase` (`src/lib/leads.ts`), `getSession` (`src/lib/auth.ts`), `rateLimit`/`clientIp` (`src/lib/rate-limit.ts`), `ok`/`fail` (`src/lib/api.ts`).
- Produces: `POST /api/listing-submissions` → `{ id: string }` on 201; `GET /api/listing-submissions` → `ListingSubmission[]` — consumed by Task 6 (admin list page) and the public form (Task 8).

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { listingSubmissionSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sniffImageType } from "@/lib/image-sniff";
import { sendEmail } from "@/lib/email";
import { sellerClientEmail, sellerOwnerEmail } from "@/lib/email-templates";
import { hasDatabase } from "@/lib/leads";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB per photo
const MAX_PHOTOS = 5;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`listing-submission:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  if (!hasDatabase()) {
    return fail("Submissions are temporarily unavailable. Please contact us directly on WhatsApp instead.", 503);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Invalid submission.");
  }

  const parsed = listingSubmissionSchema.safeParse({
    name: form.get("name"),
    phone: form.get("phone"),
    email: form.get("email"),
    propertyType: form.get("propertyType"),
    city: form.get("city"),
  });
  if (!parsed.success) return fail("Please review the form and try again.");

  const files = form.getAll("photos").filter((f): f is File => f instanceof File);
  if (files.length === 0) return fail("Add at least one photo.");
  if (files.length > MAX_PHOTOS) return fail(`Add at most ${MAX_PHOTOS} photos.`);

  const dir = path.join(process.cwd(), "public", "uploads");
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) return fail("Each photo must be 5MB or smaller.");
    const buf = Buffer.from(await file.arrayBuffer());
    const detected = sniffImageType(buf);
    if (!detected) return fail("One of the files is not a supported image (JPEG, PNG, WebP, or AVIF).");

    const name = `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected}`;
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, name), buf);
    } catch (err) {
      console.error("[listing-submissions]", err);
      return fail("Could not save the photos.", 500);
    }
    urls.push(`/uploads/${name}`);
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const submission = await prisma.listingSubmission.create({
    data: {
      name: data.name,
      phone: data.phone,
      email,
      propertyType: data.propertyType,
      city: data.city,
      images: JSON.stringify(urls),
      ip,
    },
  });

  const client = sellerClientEmail({ name: data.name });
  await sendEmail({ to: email, subject: client.subject, html: client.html });

  const ownerEmail = process.env.ADMIN_EMAIL;
  if (ownerEmail) {
    const owner = sellerOwnerEmail({ name: data.name, phone: data.phone, email, propertyType: data.propertyType, city: data.city });
    await sendEmail({ to: ownerEmail, subject: owner.subject, html: owner.html });
  }

  return ok({ id: submission.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const submissions = await prisma.listingSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(submissions);
}
```

- [ ] **Step 2: Verify with a running dev server**

Start the dev server if it isn't running:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npm run dev -- --port 4321
```

Then, in a separate terminal:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const B = 'http://localhost:4321';
(async () => {
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
  const fd = new FormData();
  fd.append('name', 'Plan Smoke');
  fd.append('phone', '+212600000000');
  fd.append('email', 'plan-smoke@test.local');
  fd.append('propertyType', 'VILLA');
  fd.append('city', 'Gueliz');
  fd.append('photos', new Blob([png], { type: 'image/png' }), 'photo.png');
  const r = await fetch(B + '/api/listing-submissions', { method: 'POST', body: fd });
  console.log('valid submission:', r.status, await r.text());

  const fdBad = new FormData();
  fdBad.append('name', 'Plan Smoke');
  fdBad.append('phone', '+212600000000');
  fdBad.append('email', 'plan-smoke@test.local');
  fdBad.append('propertyType', 'VILLA');
  fdBad.append('city', 'Gueliz');
  fdBad.append('photos', new Blob(['not an image'], { type: 'image/jpeg' }), 'fake.jpg');
  const r2 = await fetch(B + '/api/listing-submissions', { method: 'POST', body: fdBad });
  console.log('fake photo rejected:', r2.status, await r2.text());

  const r3 = await fetch(B + '/api/listing-submissions');
  console.log('anon GET (expect 401):', r3.status);
})();
"
```
Expected: valid submission `201`; fake photo `400`; anonymous `GET` `401`.

Clean up the test row:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const { PrismaClient } = require('./node_modules/@prisma/client');
(async () => {
  const p = new PrismaClient();
  const del = await p.listingSubmission.deleteMany({ where: { email: 'plan-smoke@test.local' } });
  console.log('cleaned', del.count);
  await p.\$disconnect();
})();
"
```
Also delete the uploaded test photo file from `public/uploads/` (its filename was printed as `url` in the `201` response body above).

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/app/api/listing-submissions/route.ts && git commit -m "feat(seller): public listing-submission endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Admin `PATCH` endpoint

**Files:**
- Create: `src/app/api/listing-submissions/[id]/route.ts`

**Interfaces:**
- Produces: `PATCH /api/listing-submissions/[id]` accepting `{ status?, convertedPropertyId? }` → `{ id, status }` — consumed by Task 5 (row actions) and Task 7 (conversion flow).

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/api";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONVERTED", "DECLINED"]).optional(),
  convertedPropertyId: z.string().max(120).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid body."); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) return fail("Nothing to update.");

  const existing = await prisma.listingSubmission.findUnique({ where: { id } });
  if (!existing) return fail("Not found.", 404);

  const updated = await prisma.listingSubmission.update({
    where: { id },
    data: parsed.data,
  });

  return ok({ id: updated.id, status: updated.status });
}
```

- [ ] **Step 2: Verify with a running dev server**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const B = 'http://localhost:4321';
(async () => {
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
  const fd = new FormData();
  fd.append('name', 'Patch Smoke'); fd.append('phone', '+212600000000'); fd.append('email', 'patch-smoke@test.local');
  fd.append('propertyType', 'RIAD'); fd.append('city', 'Medina');
  fd.append('photos', new Blob([png], { type: 'image/png' }), 'photo.png');
  const created = await fetch(B + '/api/listing-submissions', { method: 'POST', body: fd });
  const { data } = await created.json();

  const login = await fetch(B + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@terraya.com', password: 'Terraya2026!' }),
  });
  const cookie = (login.headers.getSetCookie()[0] || '').split(';')[0];

  const anonPatch = await fetch(B + '/api/listing-submissions/' + data.id, {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'CONTACTED' }),
  });
  console.log('anon PATCH (expect 401):', anonPatch.status);

  const staffPatch = await fetch(B + '/api/listing-submissions/' + data.id, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify({ status: 'CONTACTED' }),
  });
  console.log('staff PATCH (expect 200):', staffPatch.status, await staffPatch.text());
})();
"
```
Expected: anon `401`, staff `200` with `{"status":"CONTACTED"}`.

Clean up (delete the `patch-smoke@test.local` row the same way as Task 3, plus its uploaded photo file).

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add "src/app/api/listing-submissions/[id]/route.ts" && git commit -m "feat(seller): admin PATCH endpoint for submission status/conversion

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Admin review queue page

**Files:**
- Create: `src/components/admin/ListingSubmissionRowActions.tsx`
- Create: `src/app/admin/listings/page.tsx`
- Modify: `src/components/admin/AdminShell.tsx`

**Interfaces:**
- Consumes: `PATCH /api/listing-submissions/[id]` (Task 4).
- Produces: nothing new consumed elsewhere — this is the leaf admin UI.

- [ ] **Step 1: Write the row-actions component**

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "DECLINED"] as const;

export function ListingSubmissionRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onStatusChange(next: string) {
    setBusy(true);
    const res = await fetch(`/api/listing-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Could not update. Please try again.");
  }

  return (
    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.18em]">
      <select
        value={status}
        disabled={busy || status === "CONVERTED"}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border border-sand-300 bg-sand-50 px-2 py-1 text-sand-800 disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {status !== "CONVERTED" && (
        <Link href={`/admin/properties/new?fromSubmission=${id}`} className="text-sand-900 hover:underline">
          Convert
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the admin listings page**

```typescript
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ListingSubmissionRowActions } from "@/components/admin/ListingSubmissionRowActions";

export const dynamic = "force-dynamic";

function parseArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default async function AdminListingsPage() {
  let submissions: Awaited<ReturnType<typeof prisma.listingSubmission.findMany>> = [];
  try {
    submissions = await prisma.listingSubmission.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    // ignore — DB not connected
  }

  return (
    <div>
      <p className="eyebrow">Sellers</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">Listing submissions.</h1>

      <div className="mt-10 border border-sand-200 bg-sand-50">
        <table className="w-full text-sm">
          <thead className="bg-sand-100">
            <tr className="text-left text-sand-700">
              <th className="px-5 py-4 eyebrow">Photo</th>
              <th className="px-5 py-4 eyebrow">Name</th>
              <th className="px-5 py-4 eyebrow">Contact</th>
              <th className="px-5 py-4 eyebrow">Type</th>
              <th className="px-5 py-4 eyebrow">City</th>
              <th className="px-5 py-4 eyebrow text-right">Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const images = parseArr(s.images);
              return (
                <tr key={s.id} className="border-t border-sand-200">
                  <td className="px-5 py-4">
                    {images[0] ? (
                      <div className="relative h-14 w-14 overflow-hidden border border-sand-200">
                        <Image src={images[0]} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-14 w-14 border border-sand-200 bg-sand-100" />
                    )}
                  </td>
                  <td className="px-5 py-4 text-sand-900 font-medium">{s.name}</td>
                  <td className="px-5 py-4 text-sand-700">{s.phone} · {s.email}</td>
                  <td className="px-5 py-4 text-sand-700">{s.propertyType}</td>
                  <td className="px-5 py-4 text-sand-700">{s.city}</td>
                  <td className="px-5 py-4 text-right"><ListingSubmissionRowActions id={s.id} status={s.status} /></td>
                </tr>
              );
            })}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sand-600 italic">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add the nav link**

In `src/components/admin/AdminShell.tsx`, replace the import line and add the link:

```typescript
import { LayoutDashboard, Building2, Inbox, Users, LogOut } from "lucide-react";
```

Then, right after the existing `<NavLink href="/admin/inquiries" ...>` line:

```typescript
          <NavLink href="/admin/inquiries" icon={<Inbox size={16} />} label="Inquiries" />
          <NavLink href="/admin/listings" icon={<Users size={16} />} label="Listings" />
```

- [ ] **Step 4: Verify**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx tsc --noEmit
```
Expected: clean. Then log into `/admin` in a browser and confirm `/admin/listings` renders (empty table is fine at this point — Task 3's smoke-test row should already be cleaned up).

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/components/admin/ListingSubmissionRowActions.tsx src/app/admin/listings/page.tsx src/components/admin/AdminShell.tsx && git commit -m "feat(seller): admin listing-submissions review queue

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Conversion flow — prefill the property form

**Files:**
- Modify: `src/components/admin/PropertyForm.tsx`
- Modify: `src/app/admin/properties/new/page.tsx`

**Interfaces:**
- Consumes: `PATCH /api/listing-submissions/[id]` (Task 4).
- Produces: `PropertyForm`'s new `fromSubmissionId?: string` prop — consumed only by `admin/properties/new/page.tsx`.

- [ ] **Step 1: Add `fromSubmissionId` to `PropertyForm`**

In `src/components/admin/PropertyForm.tsx`, change the component signature:

```typescript
export function PropertyForm({ initial, id, fromSubmissionId }: { initial?: Partial<PropertyFormData>; id?: string; fromSubmissionId?: string }) {
```

Then replace the `onSubmit` function's success branch:

```typescript
    const res = await fetch(id ? `/api/properties/${id}` : "/api/properties", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success) {
      if (!id && fromSubmissionId) {
        await fetch(`/api/listing-submissions/${fromSubmissionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONVERTED", convertedPropertyId: json.data.id }),
        }).catch(() => {});
      }
      router.push("/admin/properties");
      router.refresh();
    } else {
      setStatus("error");
      setError(json.error ?? "Could not save. Check the fields and try again.");
    }
```

(Only the `if (res.ok && json.success) { ... }` block changes — everything else in `onSubmit` stays the same.)

- [ ] **Step 2: Prefill from a submission in `admin/properties/new/page.tsx`**

Replace the whole file:

```typescript
import { PropertyForm, type PropertyFormData } from "@/components/admin/PropertyForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ fromSubmission?: string }>;
}) {
  const { fromSubmission } = await searchParams;

  let initial: Partial<PropertyFormData> | undefined;
  if (fromSubmission) {
    const submission = await prisma.listingSubmission.findUnique({ where: { id: fromSubmission } });
    if (submission) {
      initial = {
        title: `${submission.propertyType} — submitted by ${submission.name}`,
        type: submission.propertyType,
        city: submission.city,
        country: "Morocco",
        images: parseArr(submission.images),
      };
    }
  }

  return (
    <div>
      <p className="eyebrow">Portfolio</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">New property.</h1>
      <div className="mt-10">
        <PropertyForm initial={initial} fromSubmissionId={fromSubmission} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify end to end with a running dev server**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const B = 'http://localhost:4321';
(async () => {
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
  const fd = new FormData();
  fd.append('name', 'Convert Smoke'); fd.append('phone', '+212600000000'); fd.append('email', 'convert-smoke@test.local');
  fd.append('propertyType', 'ESTATE'); fd.append('city', 'Palmeraie');
  fd.append('photos', new Blob([png], { type: 'image/png' }), 'photo.png');
  const created = await fetch(B + '/api/listing-submissions', { method: 'POST', body: fd });
  const { data: sub } = await created.json();
  console.log('submission created:', sub.id);

  const login = await fetch(B + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@terraya.com', password: 'Terraya2026!' }),
  });
  const cookie = (login.headers.getSetCookie()[0] || '').split(';')[0];

  // Simulate what PropertyForm does: create a property, then PATCH the submission.
  const propRes = await fetch(B + '/api/properties', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({
      slug: 'convert-smoke-test', title: 'Convert Smoke', description: 'x'.repeat(30),
      type: 'ESTATE', status: 'DRAFT', location: 'Test', city: 'Marrakech', country: 'Morocco',
      priceEur: 100000, bedrooms: 1, bathrooms: 1, areaSqm: 100,
      heroImage: '/uploads/x.jpg', images: [], amenities: [], highlights: [],
    }),
  });
  const { data: prop } = await propRes.json();

  const patchRes = await fetch(B + '/api/listing-submissions/' + sub.id, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ status: 'CONVERTED', convertedPropertyId: prop.id }),
  });
  console.log('conversion PATCH:', patchRes.status, await patchRes.text());

  await fetch(B + '/api/properties/' + prop.id, { method: 'DELETE', headers: { cookie } });
})();
"
```
Expected: `submission created: <id>`, conversion PATCH `200` with `{"status":"CONVERTED"}`.

Then manually confirm the pre-fill UI: sign into `/admin` in a browser, submit a fresh test listing via a small script like the one above (or reuse the one from Task 3), find it at `/admin/listings`, click "Convert", and confirm `/admin/properties/new?fromSubmission=<id>` shows the property form with title/type/city/images already filled in.

Clean up both the test submission and the test property row afterward.

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/components/admin/PropertyForm.tsx "src/app/admin/properties/new/page.tsx" && git commit -m "feat(seller): convert-to-property prefills the admin property form

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Public page — form, WhatsApp, i18n

**Files:**
- Create: `src/components/pages/SellView.tsx`
- Create: `src/app/list-your-property/page.tsx`
- Modify: `src/lib/contact.ts`
- Modify: `src/lib/i18n.tsx`

**Interfaces:**
- Consumes: `POST /api/listing-submissions` (Task 3), `whatsappHref`/`whatsappMessageForPath` (`src/lib/contact.ts`).

- [ ] **Step 1: Add a route-message entry for the new page**

In `src/lib/contact.ts`, add one entry to the `ROUTE_MESSAGES` array (before the `/contact` entry, so it's matched first — route order matters since `.startsWith()` is checked in array order and `/contact` wouldn't otherwise match `/list-your-property` anyway, but keep it grouped logically near the top):

```typescript
const ROUTE_MESSAGES: { prefix: string; message: string }[] = [
  { prefix: "/properties", message: "Hello TERRAYA, I have a question about your properties." },
  { prefix: "/list-your-property", message: "Hello TERRAYA, I'd like to list my property." },
  { prefix: "/investment", message: "Hello TERRAYA, I'd like to know more about your investment advisory." },
  { prefix: "/services", message: "Hello TERRAYA, I'd like to know more about your services." },
  { prefix: "/about", message: "Hello TERRAYA, I'd like to know more about your agency." },
  { prefix: "/consultation", message: "Hello TERRAYA, I'd like to arrange a private consultation." },
  { prefix: "/contact", message: "Hello TERRAYA, I'd like to get in touch." },
];
```

- [ ] **Step 2: Add i18n keys**

In `src/lib/i18n.tsx`, add to the `en` dictionary, right after the `"nav.contact"` line:

```typescript
  "nav.contact": "Contact",
  "nav.sell": "Sell",
```

And add a new block right after the `// Consultation booking` block's last line (`"consult.success.text": ...`), before `// About page`:

```typescript
  // Sell / list your property
  "sell.eyebrow": "List Your Property",
  "sell.title": "Sell or rent, without the friction.",
  "sell.text": "Submit your property free of charge. We'll contact you directly to learn more, then send our own team to photograph it professionally — at no cost to you. There is no commission unless and until we complete a sale or rental on your behalf.",
  "sell.form.type": "Property type",
  "sell.form.city": "City / district",
  "sell.form.photos": "Photos",
  "sell.form.photos.hint": "Up to 5 photos, 5MB each. Your own phone photos are fine — we'll arrange professional photography later.",
  "sell.submit": "Submit Property",
  "sell.sending": "Sending…",
  "sell.success.title": "Submission received.",
  "sell.success.text": "A member of our office will contact you directly by phone or WhatsApp.",
```

Add the same keys to the `fr` dictionary, in the same two places:

```typescript
  "nav.contact": "Contact",
  "nav.sell": "Vendre",
```

```typescript
  // Vendre / proposer un bien
  "sell.eyebrow": "Proposer un bien",
  "sell.title": "Vendre ou louer, sans friction.",
  "sell.text": "Soumettez votre bien gratuitement. Nous vous contacterons directement pour en savoir plus, puis nous enverrons notre équipe le photographier professionnellement — à nos frais. Aucune commission n'est due, sauf lorsque nous concluons une vente ou une location pour vous.",
  "sell.form.type": "Type de bien",
  "sell.form.city": "Ville / quartier",
  "sell.form.photos": "Photos",
  "sell.form.photos.hint": "Jusqu'à 5 photos, 5 Mo chacune. Des photos prises avec votre téléphone suffisent — nous organiserons une séance professionnelle par la suite.",
  "sell.submit": "Soumettre le bien",
  "sell.sending": "Envoi…",
  "sell.success.title": "Demande reçue.",
  "sell.success.text": "Un membre de notre bureau vous contactera directement par téléphone ou WhatsApp.",
```

Also add `footer.link.sell` to both dictionaries, next to `footer.link.contact`:

EN: `"footer.link.sell": "Sell / List",`
FR: `"footer.link.sell": "Vendre",`

- [ ] **Step 3: Write the public page's view component**

```typescript
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
```

This follows the same plain-header pattern as `ConsultationView` (no full-bleed hero image, just eyebrow/title/text directly in the page).

- [ ] **Step 4: Write the route wrapper**

```typescript
import type { Metadata } from "next";
import { SellView } from "@/components/pages/SellView";

export const metadata: Metadata = {
  title: "Sell or List Your Property",
  description: "Submit your Marrakech property to TERRAYA, free of charge.",
};

export default function ListYourPropertyPage() {
  return <SellView />;
}
```

Save this as `src/app/list-your-property/page.tsx`.

- [ ] **Step 5: Verify**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx tsc --noEmit
```
Expected: clean. Then visit `http://localhost:4321/list-your-property` in a browser, fill in the form with a real small image file, submit, and confirm the success message appears and the row shows up in `/admin/listings`. Clean up the test row afterward.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/components/pages/SellView.tsx src/app/list-your-property src/lib/contact.ts src/lib/i18n.tsx && git commit -m "feat(seller): public list-your-property page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Nav links + smoke test + final verification

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `scripts/smoke-test.mjs`

**Interfaces:**
- Consumes everything from Tasks 1–7, exercised end-to-end.

- [ ] **Step 1: Add the header nav link**

In `src/components/layout/Header.tsx`, add one entry to the `links` array (after `/contact`):

```typescript
const links = [
  { href: "/properties", key: "nav.properties" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/investment", key: "nav.invest" },
  { href: "/contact", key: "nav.contact" },
  { href: "/list-your-property", key: "nav.sell" },
];
```

- [ ] **Step 2: Add the footer link**

In `src/components/layout/Footer.tsx`, add one entry to the first column (`footer.col.explore`)'s `links` array:

```typescript
  {
    titleKey: "footer.col.explore",
    links: [
      { href: "/properties", key: "footer.link.properties" },
      { href: "/investment", key: "footer.link.investment" },
      { href: "/services", key: "footer.link.services" },
      { href: "/list-your-property", key: "footer.link.sell" },
    ],
  },
```

- [ ] **Step 3: Extend the smoke test**

In `scripts/smoke-test.mjs`, add a new numbered section right before the final `console.log` summary line (after the newsletter/consultation checks, i.e., right before the `console.log(\`\n${failures === 0 ...`  line):

```javascript
  // 7. Seller listing-submission pipeline.
  const submissionForm = new FormData();
  submissionForm.append("name", "Smoke Seller");
  submissionForm.append("phone", "+212600000000");
  submissionForm.append("email", `seller-smoke-${Date.now()}@test.local`);
  submissionForm.append("propertyType", "VILLA");
  submissionForm.append("city", "Gueliz");
  const realPngForSubmission = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  submissionForm.append("photos", new Blob([realPngForSubmission], { type: "image/png" }), "photo.png");
  const submissionRes = await fetch(BASE + "/api/listing-submissions", { method: "POST", body: submissionForm });
  const submissionBody = await submissionRes.json().catch(() => ({}));
  check("listing submission with a real photo succeeds", submissionRes.status === 201 && !!submissionBody.data?.id);

  const badSubmissionForm = new FormData();
  badSubmissionForm.append("name", "Smoke Seller");
  badSubmissionForm.append("phone", "+212600000000");
  badSubmissionForm.append("email", "seller-smoke-bad@test.local");
  badSubmissionForm.append("propertyType", "VILLA");
  badSubmissionForm.append("city", "Gueliz");
  badSubmissionForm.append("photos", new Blob(["not an image"], { type: "image/jpeg" }), "fake.jpg");
  const badSubmissionRes = await fetch(BASE + "/api/listing-submissions", { method: "POST", body: badSubmissionForm });
  check("listing submission with a fake photo is rejected", badSubmissionRes.status === 400);

  const anonListingsGet = await fetch(BASE + "/api/listing-submissions");
  check("anonymous GET on listing-submissions is rejected", anonListingsGet.status === 401);

  const anonListingsPatch = await fetch(BASE + "/api/listing-submissions/" + submissionBody.data?.id, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "CONTACTED" }),
  });
  check("anonymous PATCH on listing-submissions is rejected", anonListingsPatch.status === 401);

  const staffListingsPatch = await fetch(BASE + "/api/listing-submissions/" + submissionBody.data?.id, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ status: "DECLINED" }),
  });
  check("staff PATCH on listing-submissions succeeds", staffListingsPatch.status === 200);

  const prisma2 = new PrismaClient();
  await prisma2.listingSubmission.deleteMany({ where: { name: "Smoke Seller" } });
  await prisma2.$disconnect();
```

This section uses the `cookie` variable already established earlier in `main()` by the admin-login check — no new login call needed. It reuses the `PrismaClient` import already at the top of the file (a second `new PrismaClient()` instance here is fine and matches how the file already opens a fresh one further up for the newsletter/consultation cleanup).

- [ ] **Step 4: Run the full smoke test**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && set -a && . ./.env && set +a && node scripts/smoke-test.mjs
```
Expected: every line `PASS:`, ending `ALL PASS`, exit code 0. If anything fails, stop and fix before proceeding.

Also manually delete any leftover `public/uploads/submission-*.png` files this run created (the smoke test's DB cleanup doesn't currently remove the uploaded files themselves, same as the existing upload-rejection checks elsewhere in this script).

- [ ] **Step 5: Final regression pass**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/components/layout/Header.tsx src/components/layout/Footer.tsx scripts/smoke-test.mjs && git commit -m "feat(seller): nav/footer links + smoke-test coverage for the listing pipeline

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Final Verification (after all 8 tasks)

- [ ] `npx tsc --noEmit` is clean.
- [ ] `node scripts/smoke-test.mjs` reports `ALL PASS`.
- [ ] Manual walkthrough: submit a test listing at `/list-your-property` with a real photo → appears in `/admin/listings` → change its status → click "Convert" → confirm the property form is pre-filled → save → confirm the submission flips to `CONVERTED` and the new property is visible (as a `DRAFT`, so it's safe to delete afterward) in `/admin/properties`.
- [ ] `git log --oneline` shows 8 new commits since the branch point, one per task.
- [ ] Clean up all test artifacts: DB rows, and any `public/uploads/submission-*` files created during manual testing.
