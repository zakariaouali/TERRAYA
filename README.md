# TERRAYA

A private real estate maison — built as a production-grade Next.js 15 / React 19 / TypeScript / Tailwind / Prisma application.

> *Exceptional Properties. Timeless Value.*

## Stack

- **Next.js 15** (App Router, RSC, Server Actions-ready)
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS** with custom *sand* palette and serif/sans typography
- **Framer Motion** for restrained, editorial animation
- **Prisma** + **PostgreSQL** (User, Property, Inquiry, AuditLog)
- **jose** (JWT, HS256) + **bcrypt-ts** (12-round hashes) for admin auth
- **Zod** for end-to-end input validation
- In-memory rate limiting for login, inquiries, and authenticated API
- Strict **Content Security Policy** and full security header set

## Project layout

```
.
├── prisma/
│   ├── schema.prisma       # PostgreSQL schema
│   └── seed.ts             # Seeds admin + sample portfolio
├── middleware.ts           # JWT-protected /admin routes
├── next.config.ts          # CSP + security headers
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── (marketing)     # /, /properties, /properties/[slug], /about, /investment, /services, /contact
│   │   ├── admin/          # Dashboard, properties, inquiries (JWT-gated)
│   │   ├── login/          # Admin sign-in
│   │   └── api/
│   │       ├── auth/login, logout
│   │       ├── properties (GET, POST)
│   │       ├── properties/[id] (GET, PUT, DELETE)
│   │       └── inquiries (GET, POST)
│   ├── components/
│   │   ├── home/           # Hero, Featured, InvestmentTeaser, Lifestyle, Testimonials, MarketInsights, ContactCTA
│   │   ├── properties/     # Card, Filters, Gallery, InquiryForm
│   │   ├── admin/          # AdminShell
│   │   ├── layout/         # Header, Footer
│   │   ├── shared/         # Container, SectionHeading, FadeIn, PageHero, Wordmark
│   │   └── ui/             # Button, Input/Textarea/Select/Label, Card, Badge
│   ├── data/properties.ts  # Six-property sample portfolio
│   └── lib/                # utils, prisma, auth, rate-limit, validation, audit, api
```

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

## Environment variables

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL/MariaDB connection string |
| `JWT_SECRET` | HS256 signing secret — **must be ≥ 32 chars** |
| `ADMIN_EMAIL` | Seeded admin email |
| `ADMIN_PASSWORD` | Seeded admin password — change after first login |
| `NEXT_PUBLIC_SITE_URL` | Public base URL for metadata + redirects |

## Security

- **CSP** restricting scripts to self, styles to self + Google Fonts, images to https/data; `frame-ancestors 'none'`; `object-src 'none'`; HSTS preload-eligible.
- **Cookies**: `httpOnly`, `secure` (prod), `sameSite=lax`, 8-hour TTL.
- **Auth**: bcrypt (12 rounds) + JWT (jose, HS256). Edge-safe verification in `middleware.ts` gates `/admin/*` and checks `role`.
- **Validation**: every API body parsed through Zod. Backend is authoritative — frontend HTML validation is convenience only.
- **Rate limits**: `5/min` login per IP; `5/min` inquiry per IP; `60/min` public API per IP; `120/min` authenticated API per session+IP.
- **Audit log**: every login (success/fail), inquiry, and property mutation written to `AuditLog` with IP + user-agent.
- **Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` locking down camera/mic/geo, `X-Powered-By` removed.

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

## Notes for further extension

- The marketing site can be statically generated (the property detail pages already export `generateStaticParams`). Wire `getProperty` to Prisma when ready to serve from the database instead of the seed file.
- A property editor UI under `/admin/properties/[id]` is the natural next step — the `PUT/POST` API routes are already in place and validated.
- Multilingual support: wire `next-intl` or `next-translate` against the same component set; copy is already organized as data, not text-in-JSX, in most sections.
- Replace the in-memory `rateLimit` with **Upstash Redis** or **Vercel KV** for horizontal scale.
