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

  // 1b. Long text fields (description, images JSON) must not be silently
  // truncated by the database — MySQL/MariaDB defaults a plain Prisma
  // `String` column to VARCHAR(191) and truncates on overflow without
  // erroring under non-strict SQL mode. Regression check for that exact bug.
  const listApi = await (await fetch(BASE + "/api/properties")).json();
  const sample = listApi.data[0];
  check("sample property description exceeds 191 chars", sample.description.length > 191);
  check("sample property description does not end mid-word/truncated", !/[a-zA-Z]$/.test(sample.description.trim()) || /[.!?]$/.test(sample.description.trim()));
  let imagesArrayIntact = false;
  try {
    imagesArrayIntact = Array.isArray(JSON.parse(sample.images)) && JSON.parse(sample.images).length > 0;
  } catch {
    imagesArrayIntact = false;
  }
  check("sample property images JSON parses intact (not truncated)", imagesArrayIntact);

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
