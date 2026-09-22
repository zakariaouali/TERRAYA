# DB Migration + Targeted Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move TERRAYA's database from local SQLite to MySQL (dev via the existing XAMPP install, production via a new Docker artifact), and fix three security gaps found in a manual audit — without touching business logic, pricing model, UX, or content.

**Architecture:** Prisma's `datasource` switches from `sqlite` to `mysql`; two new Prisma models (`NewsletterSignup`, `ConsultationRequest`) replace the file-only lead capture for those two forms. A new `Dockerfile` (Next.js standalone build) and `docker-compose.yml` (`app` + `db` services, no reverse proxy) package the app for eventual server deployment, but local development keeps using `next dev` directly against the developer's XAMPP MySQL instance. Three existing route/lib files get narrowly-scoped security fixes.

**Tech Stack:** Next.js 15 (App Router, Node runtime API routes), Prisma 5 + MySQL 8, TypeScript, `tsx` for standalone scripts (already a devDependency), Docker + Docker Compose for the deployment artifact.

**Spec:** [docs/superpowers/specs/2026-09-22-db-migration-design.md](../specs/2026-09-22-db-migration-design.md)

## Global Constraints

- `priceEur` stays `BigInt` on the `Property` model — MySQL supports it natively, no application code change needed for that field.
- `images` / `amenities` / `highlights` stay JSON-encoded `String` columns — do **not** switch them to Prisma's native `Json` type in this plan.
- `docker-compose.yml` has exactly two services (`app`, `db`) — no reverse-proxy/Caddy service; the user's existing server-level proxy fronts the exposed app port.
- Local development connects directly to the MySQL instance already running under the developer's XAMPP install (inspected via phpMyAdmin) — no local MySQL Docker container is used for the day-to-day dev loop.
- Upload size limit stays `8 * 1024 * 1024` (8MB) — unchanged from today.
- Public property statuses are exactly `AVAILABLE`, `RESERVED`, `SOLD`. `DRAFT` is only visible to a session with role `ADMIN` or `EDITOR`.
- No JWT/session revocation work, no business-model changes (pricing/rental period), no UX/typography changes, no S3/object storage — all explicitly deferred to later sub-projects per the spec's roadmap.
- No new test framework (no Jest/Vitest) — this repo has none today; verification uses standalone scripts run via `tsx` (already a devDependency) and plain Node, matching the existing `prisma/seed.ts` pattern.

---

## File Structure

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | Modify: `datasource` → mysql; add `NewsletterSignup`, `ConsultationRequest` models |
| `src/lib/image-sniff.ts` | Create: pure function that detects real image format from file bytes |
| `scripts/test-image-sniff.ts` | Create: standalone assertion test for `image-sniff.ts` |
| `src/app/api/upload/route.ts` | Modify: use `image-sniff.ts` instead of trusting client MIME/filename |
| `src/lib/rate-limit.ts` | Modify: `clientIp()` trusts the last `X-Forwarded-For` hop, not the first |
| `src/app/api/properties/route.ts` | Modify: `GET` hides non-public statuses from anonymous callers |
| `src/app/api/properties/[id]/route.ts` | Modify: `GET` 404s a `DRAFT` property for anonymous callers |
| `src/app/api/newsletter/route.ts` | Modify: writes to `NewsletterSignup` table when a DB is configured |
| `src/app/api/consultation/route.ts` | Modify: writes to `ConsultationRequest` table when a DB is configured |
| `next.config.ts` | Modify: add `output: "standalone"` for the Docker build |
| `Dockerfile` | Create: multi-stage build for the Next.js standalone app |
| `docker-compose.yml` | Create: `app` + `db` (MySQL) services |
| `.env.example` | Modify: MySQL-shaped `DATABASE_URL`, add compose-only MySQL vars |
| `.env` | Modify (local, untracked): point at XAMPP's MySQL |
| `README.md` | Modify: MySQL + Docker deployment instructions replacing the stale Postgres/SQLite text |
| `scripts/smoke-test.mjs` | Create: end-to-end verification script against a running dev server |

---

### Task 1: MySQL schema + new lead tables

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `.env` (local, untracked — point at XAMPP MySQL)

**Interfaces:**
- Produces: Prisma models `NewsletterSignup { id, email, ip, createdAt }` and `ConsultationRequest { id, name, email, phone, date, time, message, ip, createdAt }` — consumed by Task 6.
- Produces: `prisma.property`, `prisma.inquiry`, etc. now backed by MySQL — consumed by every later task that touches the DB.

- [ ] **Step 1: Confirm XAMPP's MySQL credentials and start it**

Open XAMPP's control panel and start the **MySQL** module. Open phpMyAdmin (usually `http://localhost/phpmyadmin`) and check **Settings → Servers** (or just try logging in) to confirm the user/password. XAMPP's default is user `root` with an **empty** password on `127.0.0.1:3306`. Note the actual values if different.

In phpMyAdmin, create a new database named `terraya` (utf8mb4 / utf8mb4_unicode_ci collation) if it doesn't already exist — Prisma's migration will create the tables inside it, but the database itself must exist first.

- [ ] **Step 2: Point local `.env` at MySQL**

Edit `C:\Users\zkri\Desktop\Projects\TERRAYA\TERRAYA\.env` (this file is gitignored — editing it does not touch git):

```
# MySQL running under XAMPP — inspect with phpMyAdmin at http://localhost/phpmyadmin
# Adjust user/password if your XAMPP MySQL isn't the default root-with-no-password.
DATABASE_URL="mysql://root:@localhost:3306/terraya"

# Auth — required (>=32 chars). Regenerate for production.
JWT_SECRET="cfe4f59baf777f81546f5943fad15fe144ed0917847b46be8cea6e1fe4f41610"

# Admin account created by the seed
ADMIN_EMAIL="admin@terraya.com"
ADMIN_PASSWORD="Terraya2026!"

NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 3: Update the schema's datasource and header comment**

Replace lines 1–11 of `prisma/schema.prisma`:

```prisma
// MySQL. The schema avoids native enums and array columns (stored as JSON
// strings) so it stays portable across MySQL/MariaDB/Postgres.
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

- [ ] **Step 4: Add the two new models**

Append to the end of `prisma/schema.prisma` (after the `AuditLog` model):

```prisma

model NewsletterSignup {
  id        String   @id @default(cuid())
  email     String
  ip        String?
  createdAt DateTime @default(now())

  @@index([createdAt])
}

model ConsultationRequest {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  date      String?
  time      String?
  message   String?
  ip        String?
  createdAt DateTime @default(now())

  @@index([createdAt])
}
```

- [ ] **Step 5: Generate the migration and apply it against XAMPP's MySQL**

Run:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx prisma migrate dev --name mysql_switch
```
Expected: Prisma reports the migration created and applied cleanly, ending with "Your database is now in sync with your schema." If it errors on connection, re-check Step 1/2 (MySQL running, database exists, credentials correct).

- [ ] **Step 6: Re-seed and verify**

Run:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npm run db:seed
```
Expected output: `Seeded 10 properties and admin admin@terraya.com`

Then verify row counts via a throwaway script:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const { PrismaClient } = require('./node_modules/@prisma/client');
(async () => {
  const p = new PrismaClient();
  console.log('users', await p.user.count(), 'props', await p.property.count());
  await p.\$disconnect();
})();
"
```
Expected: `users 1 props 10`

- [ ] **Step 7: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add prisma/schema.prisma prisma/migrations && git commit -m "feat(db): switch Prisma datasource to MySQL, add lead tables

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
(`.env` is gitignored and is not part of this commit.)

---

### Task 2: Image content-sniffing utility

**Files:**
- Create: `src/lib/image-sniff.ts`
- Create: `scripts/test-image-sniff.ts`

**Interfaces:**
- Produces: `sniffImageType(buf: Buffer): "jpg" | "png" | "webp" | "avif" | null` — consumed by Task 3.

- [ ] **Step 1: Write the failing test**

Create `scripts/test-image-sniff.ts`:

```typescript
import assert from "node:assert/strict";
import { sniffImageType } from "../src/lib/image-sniff";

// Only the header bytes matter for sniffing — these aren't full valid images.
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const webp = Buffer.concat([
  Buffer.from("RIFF", "ascii"),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP", "ascii"),
]);
const avif = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x1c]),
  Buffer.from("ftyp", "ascii"),
  Buffer.from("avif", "ascii"),
]);
const svgDisguisedAsJpg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', "utf8");
const tooShort = Buffer.from([0xff, 0xd8]);
const plainText = Buffer.from("just some text, not an image at all", "utf8");

assert.equal(sniffImageType(jpeg), "jpg", "JPEG magic bytes should be detected");
assert.equal(sniffImageType(png), "png", "PNG magic bytes should be detected");
assert.equal(sniffImageType(webp), "webp", "WebP magic bytes should be detected");
assert.equal(sniffImageType(avif), "avif", "AVIF magic bytes should be detected");
assert.equal(sniffImageType(svgDisguisedAsJpg), null, "SVG must be rejected (not in the allowlist)");
assert.equal(sniffImageType(tooShort), null, "Buffers shorter than the smallest signature must be rejected");
assert.equal(sniffImageType(plainText), null, "Arbitrary non-image bytes must be rejected");

console.log("PASS: image-sniff");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx tsx scripts/test-image-sniff.ts`
Expected: FAIL — `Cannot find module '../src/lib/image-sniff'` (the module doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/image-sniff.ts`:

```typescript
export type SniffedImageType = "jpg" | "png" | "webp" | "avif";

/**
 * Detects the real image format from file bytes (magic-byte sniffing), ignoring
 * whatever MIME type or filename the client claims. This is an allowlist: any
 * buffer that doesn't match one of these four raster formats — including SVG,
 * which can carry executable script — returns null.
 */
export function sniffImageType(buf: Buffer): SniffedImageType | null {
  if (buf.length < 12) return null;

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";

  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "png";
  }

  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }

  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
  }

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx tsx scripts/test-image-sniff.ts`
Expected: PASS — prints `PASS: image-sniff`

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/lib/image-sniff.ts scripts/test-image-sniff.ts && git commit -m "feat(upload): add magic-byte image content sniffing

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Apply content-sniffing to the upload route

**Files:**
- Modify: `src/app/api/upload/route.ts`

**Interfaces:**
- Consumes: `sniffImageType(buf: Buffer): "jpg" | "png" | "webp" | "avif" | null` from Task 2.

- [ ] **Step 1: Replace the client-trusting checks with real content sniffing**

Replace lines 1–44 of `src/app/api/upload/route.ts` in full:

```typescript
import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sniffImageType } from "@/lib/image-sniff";
import { ok, fail } from "@/lib/api";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`upload:${session.sub}:${ip}`, 60, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Invalid upload.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file provided.");
  if (file.size > MAX_BYTES) return fail("Image must be 8MB or smaller.");

  const buf = Buffer.from(await file.arrayBuffer());
  const detected = sniffImageType(buf);
  if (!detected) {
    return fail("File is not a supported image (JPEG, PNG, WebP, or AVIF).");
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected}`;
  const dir = path.join(process.cwd(), "public", "uploads");

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
  } catch (err) {
    console.error("[upload]", err);
    return fail("Could not save the file.", 500);
  }

  return ok({ url: `/uploads/${name}` }, { status: 201 });
}
```

Note what changed: the client-supplied `file.type` check and the filename-derived extension are both gone — the stored extension now comes from `sniffImageType`'s verdict on the real bytes.

- [ ] **Step 2: Manual verification against the running dev server**

Start the dev server if it isn't already running:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npm run dev -- --port 4321
```

In a separate terminal, log in and attempt to upload a fake image (plain text renamed to `.jpg`, with a spoofed `image/jpeg` content type):
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const B = 'http://localhost:4321';
(async () => {
  const login = await fetch(B + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@terraya.com', password: 'Terraya2026!' }),
  });
  const cookie = (login.headers.getSetCookie()[0] || '').split(';')[0];

  const fd = new FormData();
  fd.append('file', new Blob(['not actually an image'], { type: 'image/jpeg' }), 'fake.jpg');
  const up = await fetch(B + '/api/upload', { method: 'POST', headers: { cookie }, body: fd });
  console.log('fake upload status:', up.status, await up.text());

  // A real (tiny, valid) PNG must still succeed.
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
  const fd2 = new FormData();
  fd2.append('file', new Blob([png], { type: 'image/png' }), 'real.png');
  const up2 = await fetch(B + '/api/upload', { method: 'POST', headers: { cookie }, body: fd2 });
  console.log('real upload status:', up2.status, await up2.text());
})();
"
```
Expected: the fake upload returns `400` with the "not a supported image" message; the real PNG returns `201` with a `/uploads/....png` URL.

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/app/api/upload/route.ts && git commit -m "fix(upload): validate real file content instead of client-supplied MIME/filename

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Fix rate-limit IP spoofing

**Files:**
- Modify: `src/lib/rate-limit.ts`

**Interfaces:**
- Produces: `clientIp(req: Request): string` — unchanged signature, consumed by every route already using it.

- [ ] **Step 1: Replace `clientIp()`**

Replace lines 19–26 of `src/lib/rate-limit.ts`:

```typescript
export function clientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    // Take the LAST hop, not the first: with exactly one reverse proxy in front
    // of this app, the last entry is the IP the proxy itself observed — the
    // client cannot control it. The first entry is whatever the client sent
    // and is trivially spoofable.
    const hops = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return h.get("x-real-ip") || "unknown";
}
```

- [ ] **Step 2: Manual verification against the running dev server**

With the dev server running on port 4321:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const B = 'http://localhost:4321';
(async () => {
  // Same simulated last hop (9.9.9.9) across all 8 requests, spoofed first hop
  // varies — must now be rate-limited after 5, since the fix keys on the last hop.
  let codes = [];
  for (let i = 0; i < 8; i++) {
    const r = await fetch(B + '/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': \`1.2.3.\${i}, 9.9.9.9\` },
      body: JSON.stringify({ email: 'admin@terraya.com', password: 'wrongpass1' }),
    });
    codes.push(r.status);
  }
  console.log('same real last-hop, spoofed first hop:', codes.join(','));

  // Different last hop each time (genuinely different clients) — must NOT be
  // blocked, since each gets its own rate-limit bucket.
  codes = [];
  for (let i = 0; i < 8; i++) {
    const r = await fetch(B + '/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': \`1.2.3.4, 8.8.8.\${i}\` },
      body: JSON.stringify({ email: 'admin@terraya.com', password: 'wrongpass1' }),
    });
    codes.push(r.status);
  }
  console.log('different real last-hop each time:', codes.join(','));
})();
"
```
Expected: the first line shows `401` five times then `429` three times (blocked). The second line shows `401` eight times (never blocked, since each is a distinct client).

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/lib/rate-limit.ts && git commit -m "fix(rate-limit): key on the last X-Forwarded-For hop, not the spoofable first one

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Fix draft-property leak

**Files:**
- Modify: `src/app/api/properties/route.ts`
- Modify: `src/app/api/properties/[id]/route.ts`

**Interfaces:**
- Consumes: `getSession(): Promise<SessionPayload | null>` from `src/lib/auth.ts` (already imported elsewhere in both files' sibling routes; needs adding to the `GET` handlers here).

- [ ] **Step 1: Restrict `GET /api/properties` to public statuses for anonymous callers**

Replace lines 1–30 of `src/app/api/properties/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertyUpsertSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { ok, fail } from "@/lib/api";

const PUBLIC_STATUSES = new Set(["AVAILABLE", "RESERVED", "SOLD"]);

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`api:public:${ip}`, 60, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const url = new URL(req.url);
  const featured = url.searchParams.get("featured");
  const requestedStatus = url.searchParams.get("status");

  const session = await getSession();
  const isStaff = !!session && (session.role === "ADMIN" || session.role === "EDITOR");

  // Anonymous callers may only ever see public statuses. A status outside that
  // set (e.g. DRAFT) silently falls back to the public default instead of
  // being honored, so an unauthenticated client can never enumerate drafts.
  const status =
    requestedStatus && (isStaff || PUBLIC_STATUSES.has(requestedStatus))
      ? requestedStatus
      : "AVAILABLE";

  const list = await prisma.property.findMany({
    where: {
      status: status as never,
      ...(featured === "true" ? { featured: true } : {}),
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 50,
  });

  return ok(
    list.map((p) => ({ ...p, priceEur: p.priceEur.toString() }))
  );
}
```

(The `POST` handler below it, lines 32–71 in the original file, is unchanged — leave it as-is.)

- [ ] **Step 2: 404 a `DRAFT` property for anonymous callers on `GET /api/properties/[id]`**

Replace lines 1–20 of `src/app/api/properties/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertyUpsertSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { ok, fail } from "@/lib/api";

async function findByIdOrSlug(idOrSlug: string) {
  return prisma.property.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await findByIdOrSlug(id);
  if (!p) return fail("Not found.", 404);

  if (p.status === "DRAFT") {
    const session = await getSession();
    const isStaff = !!session && (session.role === "ADMIN" || session.role === "EDITOR");
    if (!isStaff) return fail("Not found.", 404);
  }

  return ok({ ...p, priceEur: p.priceEur.toString() });
}
```

(The `PUT` and `DELETE` handlers below it, lines 22–83 in the original file, are unchanged — leave them as-is.)

- [ ] **Step 3: Manual verification against the running dev server**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const B = 'http://localhost:4321';
(async () => {
  const login = await fetch(B + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@terraya.com', password: 'Terraya2026!' }),
  });
  const cookie = (login.headers.getSetCookie()[0] || '').split(';')[0];

  // Create a DRAFT property as staff.
  const created = await fetch(B + '/api/properties', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({
      slug: 'smoke-draft-test', title: 'Smoke Draft', description: 'x'.repeat(30),
      type: 'VILLA', status: 'DRAFT', location: 'Test', city: 'Marrakech', country: 'Morocco',
      priceEur: 100000, bedrooms: 1, bathrooms: 1, areaSqm: 100,
      heroImage: '/uploads/x.jpg', images: [], amenities: [], highlights: [],
    }),
  });
  const { data } = await created.json();
  console.log('created draft:', created.status, data.id);

  const anonList = await (await fetch(B + '/api/properties?status=DRAFT')).json();
  console.log('anon list w/ status=DRAFT includes draft?', anonList.data.some(p => p.id === data.id));

  const anonDetail = await fetch(B + '/api/properties/' + data.id);
  console.log('anon detail status (expect 404):', anonDetail.status);

  const staffDetail = await fetch(B + '/api/properties/' + data.id, { headers: { cookie } });
  console.log('staff detail status (expect 200):', staffDetail.status);

  // Clean up.
  const del = await fetch(B + '/api/properties/' + data.id, { method: 'DELETE', headers: { cookie } });
  console.log('cleanup delete:', del.status);
})();
"
```
Expected: `anon list w/ status=DRAFT includes draft? false`, anon detail `404`, staff detail `200`, cleanup delete `200`.

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/app/api/properties/route.ts "src/app/api/properties/[id]/route.ts" && git commit -m "fix(properties): hide DRAFT listings from anonymous API callers

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Move newsletter and consultation leads into the database

**Files:**
- Modify: `src/app/api/newsletter/route.ts`
- Modify: `src/app/api/consultation/route.ts`

**Interfaces:**
- Consumes: `NewsletterSignup`, `ConsultationRequest` Prisma models from Task 1; `hasDatabase(): boolean` and `appendLead(...)` from `src/lib/leads.ts` (unchanged, still the no-DB fallback).

- [ ] **Step 1: Newsletter route writes to the DB when available**

Replace `src/app/api/newsletter/route.ts` in full:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { appendLead, hasDatabase } from "@/lib/leads";
import { ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid body.");
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return fail("Please enter a valid email address.");

  const email = parsed.data.email.toLowerCase();

  if (!hasDatabase()) {
    await appendLead("newsletter", { email, ip });
    return ok({ subscribed: true }, { status: 201 });
  }

  await prisma.newsletterSignup.create({ data: { email, ip } });

  return ok({ subscribed: true }, { status: 201 });
}
```

- [ ] **Step 2: Consultation route writes to the DB when available**

Replace `src/app/api/consultation/route.ts` in full:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultationSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { appendLead, hasDatabase } from "@/lib/leads";
import { ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`consultation:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid body.");
  }

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) return fail("Please review the form and try again.");

  const d = parsed.data;

  if (!hasDatabase()) {
    await appendLead("consultation", {
      name: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone,
      date: d.date,
      time: d.time,
      message: d.message,
      ip,
    });
    return ok({ booked: true }, { status: 201 });
  }

  await prisma.consultationRequest.create({
    data: {
      name: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone,
      date: d.date,
      time: d.time,
      message: d.message,
      ip,
    },
  });

  return ok({ booked: true }, { status: 201 });
}
```

- [ ] **Step 3: Manual verification against the running dev server**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && node -e "
const B = 'http://localhost:4321';
(async () => {
  const r1 = await fetch(B + '/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'plan-smoke@test.local' }),
  });
  console.log('newsletter:', r1.status);

  const r2 = await fetch(B + '/api/consultation', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Plan Smoke', email: 'plan-smoke@test.local' }),
  });
  console.log('consultation:', r2.status);

  const { PrismaClient } = require('./node_modules/@prisma/client');
  const p = new PrismaClient();
  const nl = await p.newsletterSignup.findMany({ where: { email: 'plan-smoke@test.local' } });
  const cr = await p.consultationRequest.findMany({ where: { email: 'plan-smoke@test.local' } });
  console.log('newsletter rows:', nl.length, 'consultation rows:', cr.length);

  // Clean up the test rows.
  await p.newsletterSignup.deleteMany({ where: { email: 'plan-smoke@test.local' } });
  await p.consultationRequest.deleteMany({ where: { email: 'plan-smoke@test.local' } });
  await p.\$disconnect();
})();
"
```
Expected: both POSTs return `201`, `newsletter rows: 1 consultation rows: 1`.

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add src/app/api/newsletter/route.ts src/app/api/consultation/route.ts && git commit -m "feat(leads): persist newsletter and consultation submissions to the database

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Dockerfile + docker-compose deployment artifact

**Files:**
- Modify: `next.config.ts`
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Interfaces:**
- None consumed from earlier tasks (this is a standalone deployment artifact). Produces: an `app` service exposing port 3000 and a `db` service (MySQL 8) — consumed operationally, not by other code.

- [ ] **Step 1: Enable Next.js standalone output**

In `next.config.ts`, add `output: "standalone"` to the `nextConfig` object (alongside the existing `reactStrictMode` and `poweredByHeader` keys):

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // ...rest of the file unchanged (images, headers)
};
```

- [ ] **Step 2: Create `.dockerignore`**

```
node_modules
.next
.git
.data
prisma/dev.db
*.log
```

- [ ] **Step 3: Create `Dockerfile`**

```dockerfile
# ---- deps ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- run ----
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 4: Create `docker-compose.yml`**

```yaml
services:
  db:
    image: mysql:8
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10

  app:
    build: .
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@db:3306/${MYSQL_DATABASE}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      NODE_ENV: production
    ports:
      - "3000:3000"

volumes:
  mysql-data:
```

- [ ] **Step 5: Validate the compose file's syntax**

Run: `cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && docker compose config`
Expected: prints the fully-resolved compose configuration with no errors (this works even without the containers running, and confirms the YAML and variable substitution are valid).

- [ ] **Step 6: Dry-run the full stack (requires Docker Desktop running)**

Create a temporary compose env file (do not commit it):
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && cat > .env.docker-test <<'EOF'
MYSQL_DATABASE=terraya
MYSQL_USER=terraya
MYSQL_PASSWORD=terraya_dev_pw
MYSQL_ROOT_PASSWORD=terraya_root_pw
JWT_SECRET=cfe4f59baf777f81546f5943fad15fe144ed0917847b46be8cea6e1fe4f41610
ADMIN_EMAIL=admin@terraya.com
ADMIN_PASSWORD=Terraya2026!
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
docker compose --env-file .env.docker-test up -d --build
```
Wait for it to report healthy, then:
```bash
docker compose --env-file .env.docker-test exec app npx prisma migrate deploy
docker compose --env-file .env.docker-test exec app npm run db:seed
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```
Expected: `200`. Then tear it down and remove the temp env file:
```bash
docker compose --env-file .env.docker-test down -v
rm .env.docker-test
```

If Docker Desktop is not installed/running in this environment, run Step 5 only and note in your final report to the user that the full dry run (Step 6) still needs to be done once Docker is available.

- [ ] **Step 7: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add next.config.ts Dockerfile docker-compose.yml .dockerignore && git commit -m "feat(deploy): add Dockerfile and docker-compose.yml for MySQL-backed deployment

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Docs, .env.example, and the full smoke-test script

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Create: `scripts/smoke-test.mjs`

**Interfaces:**
- Consumes: every fix from Tasks 3–6, exercised end-to-end against a running dev server.

- [ ] **Step 1: Update `.env.example`**

Replace `.env.example` in full:

```
# MySQL. For local dev, point this at MySQL running under XAMPP (inspect with
# phpMyAdmin). For production, this is set inside docker-compose.yml from the
# MYSQL_* vars below instead.
DATABASE_URL="mysql://root:@localhost:3306/terraya"

# Auth — required (>=32 chars). Regenerate for production.
JWT_SECRET="change-me-to-a-long-random-string-min-32-chars"

# Admin account created by the seed
ADMIN_EMAIL="admin@terraya.com"
ADMIN_PASSWORD="ChangeMeAtFirstLogin!"

NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# --- Docker Compose only (production deployment) ---
# These populate the MySQL container and the app's DATABASE_URL inside
# docker-compose.yml. Not used when running `npm run dev` locally.
MYSQL_DATABASE="terraya"
MYSQL_USER="terraya"
MYSQL_PASSWORD="change-me"
MYSQL_ROOT_PASSWORD="change-me-too"
```

- [ ] **Step 2: Update `README.md`**

In `README.md`, replace the `## Getting started` section's database steps and the `## Deployment` section to describe MySQL + Docker instead of the current Postgres/Vercel instructions. Replace the whole "Getting started" and "Deployment" sections with:

```markdown
## Getting started

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Point DATABASE_URL at a MySQL/MariaDB instance (locally, XAMPP's MySQL works —
# inspect it with phpMyAdmin). Set JWT_SECRET (>=32 chars), ADMIN_EMAIL, ADMIN_PASSWORD.

# 3. Provision database
npm run db:migrate   # applies the Prisma migrations
npm run db:seed      # Creates admin user + 10 sample properties

# 4. Run
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin (sign in with ADMIN_EMAIL / ADMIN_PASSWORD)
```

## Deployment (Docker)

The app ships with a `Dockerfile` and `docker-compose.yml` that run the Next.js
app and a MySQL 8 container together. There is no reverse proxy in the
compose file — front it with whatever proxy/SSL setup you already run on your
server.

1. Copy `.env.example` to `.env` and fill in real values, including the
   `MYSQL_*` variables.
2. `docker compose up -d --build`
3. First deploy only: `docker compose exec app npx prisma migrate deploy`
   then `docker compose exec app npm run db:seed`.
4. Point your server's reverse proxy at the port `docker-compose.yml` exposes.
```

Leave the rest of `README.md` (Stack, Project layout, Security, Notes for further extension) unchanged — those sections aren't affected by this sub-project.

- [ ] **Step 3: Write the end-to-end smoke-test script**

Create `scripts/smoke-test.mjs`:

```javascript
// End-to-end verification for the DB-migration + hardening sub-project.
// Requires a running dev server (npm run dev -- --port 4321) with a seeded
// MySQL database, and the admin credentials from .env available as
// ADMIN_EMAIL / ADMIN_PASSWORD environment variables.
import { PrismaClient } from "../node_modules/@prisma/client/index.js";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:4321";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`PASS: ${label}`);
  } else {
    console.error(`FAIL: ${label}`);
    failures += 1;
  }
}

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running (source .env).");
    process.exit(1);
  }

  // 1. Public routes respond.
  for (const route of ["/", "/properties", "/about", "/contact", "/api/properties"]) {
    const r = await fetch(BASE + route);
    check(`route ${route} returns 200`, r.status === 200);
  }

  // 2. Login works.
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  check("admin login returns 200", login.status === 200);
  const cookie = (login.headers.getSetCookie()[0] || "").split(";")[0];

  // 3. Draft-property leak is fixed.
  const created = await fetch(BASE + "/api/properties", {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({
      slug: "smoke-draft-" + Date.now(),
      title: "Smoke Draft",
      description: "x".repeat(30),
      type: "VILLA",
      status: "DRAFT",
      location: "Test",
      city: "Marrakech",
      country: "Morocco",
      priceEur: 100000,
      bedrooms: 1,
      bathrooms: 1,
      areaSqm: 100,
      heroImage: "/uploads/x.jpg",
      images: [],
      amenities: [],
      highlights: [],
    }),
  });
  const createdBody = await created.json();
  const draftId = createdBody.data?.id;
  check("draft property created", created.status === 201 && !!draftId);

  const anonList = await (await fetch(BASE + "/api/properties?status=DRAFT")).json();
  check(
    "anonymous status=DRAFT does not include the draft",
    !anonList.data.some((p) => p.id === draftId)
  );

  const anonDetail = await fetch(BASE + "/api/properties/" + draftId);
  check("anonymous detail on a draft returns 404", anonDetail.status === 404);

  const staffDetail = await fetch(BASE + "/api/properties/" + draftId, { headers: { cookie } });
  check("staff detail on the same draft returns 200", staffDetail.status === 200);

  await fetch(BASE + "/api/properties/" + draftId, { method: "DELETE", headers: { cookie } });

  // 4. Rate-limit fix: same last-hop is limited, different last-hop is not.
  let codes = [];
  for (let i = 0; i < 8; i++) {
    const r = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `1.2.3.${i}, 9.9.9.9` },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: "wrongpass1" }),
    });
    codes.push(r.status);
  }
  check("same real last-hop gets rate-limited after 5", codes.filter((c) => c === 429).length >= 3);

  codes = [];
  for (let i = 0; i < 8; i++) {
    const r = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `1.2.3.4, 8.8.8.${i}` },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: "wrongpass1" }),
    });
    codes.push(r.status);
  }
  check("different real last-hop each time is never rate-limited", codes.every((c) => c === 401));

  // 5. Upload content-sniffing.
  const fakeForm = new FormData();
  fakeForm.append("file", new Blob(["not an image"], { type: "image/jpeg" }), "fake.jpg");
  const fakeUpload = await fetch(BASE + "/api/upload", { method: "POST", headers: { cookie }, body: fakeForm });
  check("fake image content is rejected", fakeUpload.status === 400);

  const realPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const realForm = new FormData();
  realForm.append("file", new Blob([realPng], { type: "image/png" }), "real.png");
  const realUpload = await fetch(BASE + "/api/upload", { method: "POST", headers: { cookie }, body: realForm });
  check("real PNG content is accepted", realUpload.status === 201);

  // 6. Leads land in the database.
  const testEmail = `smoke-${Date.now()}@test.local`;
  await fetch(BASE + "/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  await fetch(BASE + "/api/consultation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Smoke Test", email: testEmail }),
  });

  const prisma = new PrismaClient();
  const nl = await prisma.newsletterSignup.findMany({ where: { email: testEmail } });
  const cr = await prisma.consultationRequest.findMany({ where: { email: testEmail } });
  check("newsletter signup landed in the database", nl.length === 1);
  check("consultation request landed in the database", cr.length === 1);
  await prisma.newsletterSignup.deleteMany({ where: { email: testEmail } });
  await prisma.consultationRequest.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();

  console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 4: Run the full smoke test**

With the dev server running on port 4321 and MySQL seeded:
```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && set -a && . ./.env && set +a && node scripts/smoke-test.mjs
```
Expected: every line prints `PASS: ...` and the script exits with `ALL PASS` and exit code 0. If anything prints `FAIL:`, stop and fix it before moving on — do not proceed to commit with a failing smoke test.

- [ ] **Step 5: Run the full existing manual regression too**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && npx tsc --noEmit
```
Expected: no output (clean).

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/zkri/Desktop/Projects/TERRAYA/TERRAYA" && git add .env.example README.md scripts/smoke-test.mjs && git commit -m "docs+test: MySQL/Docker deployment docs and end-to-end smoke test

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Final Verification (after all 8 tasks)

- [ ] `npx tsc --noEmit` is clean.
- [ ] `node scripts/smoke-test.mjs` reports `ALL PASS`.
- [ ] `docker compose config` validates without error (full `docker compose up` dry run done if Docker Desktop was available).
- [ ] `git log --oneline` shows 8 commits since the baseline, one per task.
- [ ] Report to the user: which steps were fully verified vs. which need Docker Desktop to finish (if it wasn't available in this environment).
