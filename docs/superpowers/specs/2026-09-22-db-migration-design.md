# TERRAYA — Sub-project 1: Real Database (SQLite → MySQL) + Targeted Hardening

Status: approved for implementation planning
Date: 2026-09-22

## Context

TERRAYA is a Next.js 15 / React 19 / Prisma app for a Marrakech luxury
real-estate agency. It currently runs on a local SQLite file
(`prisma/dev.db`), seeded with 1 admin user and 10 sample properties
across several countries. This is sub-project 1 of a larger roadmap
(see "Roadmap" below); it is scoped to the database/backend swap plus
a small set of security fixes uncovered during a manual audit of the
running app. It intentionally excludes business-model changes,
feature work, and visual/UX changes — those are later sub-projects.

## Roadmap (for context, not all in scope here)

1. **DB migration + targeted hardening** ← this spec
2. Business-model reset: Marrakech-city-only inventory, monthly
   pricing with a 6-month minimum stay, remove nightly/weekly rental
   concepts
3. Contextual WhatsApp messaging site-wide + reservation flow with
   automatic email confirmation
4. Seller "list your property" request pipeline (free submission →
   admin follow-up → professional shoot → publish)
5. Value-proposition / policy content for buyers, renters, and
   sellers (SEO + Terms/Privacy)
6. UX simplification + single site-wide typeface (the navbar/hero
   font) + split-panel listing layout
7. SEO / local-search technical work (structured data, sitemap,
   Marrakech-specific metadata, performance)

## Goals

- Replace the SQLite datastore with MySQL, matching the user's
  self-hosting plan (Hostinger/VPS, same pattern as their other
  project "MAADIN").
- Local development connects directly to the MySQL instance already
  running under the user's existing XAMPP install (inspected via
  phpMyAdmin) — no local DB container is introduced for day-to-day
  dev.
- Provide a `docker-compose.yml` that packages the Next.js app
  together with its own MySQL container, as the deployment artifact
  for the eventual server. This is written and tested, but is not
  part of the local dev loop.
- Fix three issues found during the manual audit of the running app,
  because they are cheap to fix while already touching this code and
  two of them are directly DB-shaped:
  1. Public property API leaking non-public statuses (DRAFT etc.)
  2. Login/API rate limiting bypassable via spoofed
     `X-Forwarded-For`
  3. Upload endpoint trusting client-supplied MIME type / filename
     extension instead of real file content

## Non-goals

- No JWT/session revocation work (deferred).
- No changes to what properties exist, their pricing model, or rental
  periods (sub-project 2).
- No WhatsApp/email flow changes beyond what already exists (sub-project 3).
- No UI/typography changes (sub-project 6).
- No S3/object storage — uploads remain on local disk (a Docker
  volume in production).

## Design

### 1. Database swap

- `prisma/schema.prisma`: `datasource db { provider = "mysql" }`,
  `url = env("DATABASE_URL")` in `mysql://` form.
- `priceEur` stays `BigInt` — natively supported by MySQL, no
  application code changes needed for that field.
- `images` / `amenities` / `highlights` remain JSON-encoded `String`
  columns (not switched to Prisma's native `Json` type). This keeps
  the migration mechanical and low-risk; revisiting them as real JSON
  columns is a candidate for a later cleanup, not this pass.
- Two new tables, matching how `Inquiry` already works, so these
  leads stop being file-only:
  - `NewsletterSignup { id, email, ip, createdAt }`
  - `ConsultationRequest { id, name, email, phone?, date?, time?, message?, ip, createdAt }`
- `src/lib/leads.ts` / the newsletter and consultation API routes
  write to these new tables when `hasDatabase()` is true; the
  `.data/*.jsonl` append remains as the no-database fallback only
  (local demo / DB briefly unreachable), unchanged from today's
  behavior in that fallback case.
- `.env.example` updated to a MySQL-shaped `DATABASE_URL` example.
- `README.md` updated to describe the MySQL setup instead of the
  stale "SQLite for zero-setup" comment in `schema.prisma` and the
  Postgres-flavored instructions currently in the README.

### 2. Local development (XAMPP)

- The developer already runs MySQL via XAMPP and inspects it with
  phpMyAdmin. Local `.env` points `DATABASE_URL` at that instance
  (typically `mysql://root:@localhost:3306/terraya`, adjusted to
  whatever XAMPP's actual credentials are).
- `npx prisma migrate dev` is run against that instance to create the
  schema; `npm run db:seed` re-populates it. No docker-compose
  involvement for this loop.

### 3. Deployment artifact (Docker)

- New `docker-compose.yml` at the project root:
  - `app`: builds the Next.js app (new multi-stage `Dockerfile`:
    install → `prisma generate` → `next build` → run `next start`),
    reads its config from `.env`, exposes one port.
  - `db`: official `mysql:8` image, named volume for data
    persistence, reads root/user/password/db-name from `.env`.
  - No reverse proxy service — the user's existing server-level proxy
    (as used on MAADIN) fronts the exposed app port.
- This compose file is validated with a local `docker compose up`
  dry run (Docker Desktop) as part of this sub-project's verification,
  even though it isn't used for daily development.

### 4. Security fixes

**Draft-property leak** (`src/app/api/properties/route.ts`,
`src/app/api/properties/[id]/route.ts`):
- `GET /api/properties`: the `status` query param is only honored
  when the request carries a valid ADMIN/EDITOR session (via
  `getSession()`); otherwise the query is pinned to public statuses
  (`AVAILABLE`, `RESERVED`, `SOLD` — i.e., anything except `DRAFT`).
- `GET /api/properties/[id]`: a `DRAFT` property is only returned to
  an authenticated ADMIN/EDITOR session; anonymous callers get 404,
  matching how `src/lib/properties.ts`'s `getPropertyBySlug` already
  treats drafts for the marketing pages.

**Rate-limit IP spoofing** (`src/lib/rate-limit.ts`):
- `clientIp()` currently takes the *first* entry of
  `X-Forwarded-For`, which is client-supplied and trivially spoofed.
  Since the deployed topology is exactly one reverse proxy in front of
  the app, the fix takes the *last* entry instead — the hop appended
  by that trusted proxy — falling back to `x-real-ip` then
  `"unknown"` as today.

**Unsafe uploads** (`src/app/api/upload/route.ts`):
- Replace the `file.type.startsWith("image/")` client-supplied-MIME
  check with real content sniffing (magic-byte detection) to confirm
  the file is actually one of the allowed raster formats (JPEG, PNG,
  WebP, AVIF).
- Reject SVG explicitly even if content-sniffed as such, since SVG can
  carry executable script.
- The stored filename's extension is derived from the *detected*
  format, not the client-supplied filename, closing the
  extension-spoofing gap.

## Testing

- Extend the manual audit script (already written ad hoc during the
  initial analysis) into a repeatable Node script under
  `scripts/smoke-test.mjs`:
  - Seed check, all routes return expected status codes.
  - Anonymous `GET /api/properties?status=DRAFT` returns only public
    statuses; authenticated request with a DRAFT property present
    returns it.
  - 8 rapid logins with 8 distinct spoofed `X-Forwarded-For` values
    from one real connection are rate-limited after 5, matching the
    same-IP behavior.
  - Upload of a non-image file renamed to `.jpg`, and an SVG renamed
    to `.png`, are both rejected.
- `npx tsc --noEmit` clean.
- `docker compose up` dry run boots both containers and the app
  responds on its exposed port, against the containerized MySQL (not
  the XAMPP instance).

## Rollout

1. Add MySQL tables/schema change, migrate + reseed against XAMPP's
   MySQL locally.
2. Apply the three security fixes.
3. Write `Dockerfile` + `docker-compose.yml`, verify locally with
   Docker Desktop.
4. Update `README.md` / `.env.example` to match.
5. Run the smoke-test script end to end before calling this done.
