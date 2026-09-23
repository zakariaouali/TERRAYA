// End-to-end verification for the DB-migration + hardening sub-project.
// Requires a running dev server (npm run dev -- --port 4321) with a seeded
// MySQL database, and the admin credentials from .env available as
// ADMIN_EMAIL / ADMIN_PASSWORD environment variables.
import { PrismaClient } from "../node_modules/@prisma/client/index.js";
import { unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  // 7. Seller listing-submission pipeline.
  const uploadedFilePaths = [];

  const submissionForm = new FormData();
  submissionForm.append("name", "Smoke Seller");
  submissionForm.append("phone", "+212600000000");
  submissionForm.append("email", `seller-smoke-${Date.now()}@test.local`);
  submissionForm.append("propertyType", "VILLA");
  submissionForm.append("listingType", "SALE");
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

  // 7b. Staff GET readback: the row must be queryable immediately after creation.
  const staffListingsGet = await fetch(BASE + "/api/listing-submissions", { headers: { cookie } });
  const staffListingsGetBody = await staffListingsGet.json().catch(() => ({}));
  const foundSubmission = staffListingsGetBody.data?.find((s) => s.id === submissionBody.data?.id);
  check(
    "staff GET on listing-submissions returns the just-created row",
    staffListingsGet.status === 200 && !!foundSubmission
  );
  if (foundSubmission) {
    try {
      const imgs = JSON.parse(foundSubmission.images);
      if (Array.isArray(imgs)) {
        for (const url of imgs) uploadedFilePaths.push(path.join(__dirname, "..", "public", url));
      }
    } catch {
      // ignore parse issues; nothing to clean up for this row then
    }
  }

  const staffListingsPatch = await fetch(BASE + "/api/listing-submissions/" + submissionBody.data?.id, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ status: "DECLINED" }),
  });
  check("staff PATCH on listing-submissions succeeds", staffListingsPatch.status === 200);

  // 7c. Staff PATCH also accepts the CONVERTED + convertedPropertyId body shape
  // (a separate submission, since a row can only sensibly be tested for one
  // terminal-ish PATCH outcome). No real Property row is needed — this only
  // confirms the route accepts and stores that specific body shape.
  const convertSubmissionForm = new FormData();
  convertSubmissionForm.append("name", "Smoke Seller");
  convertSubmissionForm.append("phone", "+212600000000");
  convertSubmissionForm.append("email", `seller-smoke-convert-${Date.now()}@test.local`);
  convertSubmissionForm.append("propertyType", "VILLA");
  convertSubmissionForm.append("listingType", "RENT");
  convertSubmissionForm.append("city", "Gueliz");
  const realPngForConvertSubmission = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  convertSubmissionForm.append("photos", new Blob([realPngForConvertSubmission], { type: "image/png" }), "photo.png");
  const convertSubmissionRes = await fetch(BASE + "/api/listing-submissions", { method: "POST", body: convertSubmissionForm });
  const convertSubmissionBody = await convertSubmissionRes.json().catch(() => ({}));
  check(
    "second listing submission (for CONVERTED test) succeeds",
    convertSubmissionRes.status === 201 && !!convertSubmissionBody.data?.id
  );

  const convertSubmissionGet = await fetch(BASE + "/api/listing-submissions", { headers: { cookie } });
  const convertSubmissionGetBody = await convertSubmissionGet.json().catch(() => ({}));
  const foundConvertSubmission = convertSubmissionGetBody.data?.find((s) => s.id === convertSubmissionBody.data?.id);
  if (foundConvertSubmission) {
    try {
      const imgs = JSON.parse(foundConvertSubmission.images);
      if (Array.isArray(imgs)) {
        for (const url of imgs) uploadedFilePaths.push(path.join(__dirname, "..", "public", url));
      }
    } catch {
      // ignore
    }
  }

  const staffConvertPatch = await fetch(BASE + "/api/listing-submissions/" + convertSubmissionBody.data?.id, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ status: "CONVERTED", convertedPropertyId: "smoke-fake-property-id-000000" }),
  });
  check("staff PATCH with CONVERTED + convertedPropertyId body is accepted", staffConvertPatch.status === 200);

  // 7d. Rate-limit fix on listing-submissions POST: same last-hop is limited,
  // different last-hop is not (same idiom as the login rate-limit check above).
  let listingCodes = [];
  for (let i = 0; i < 8; i++) {
    const rlForm = new FormData();
    rlForm.append("name", "Smoke RL");
    rlForm.append("phone", "+212600000000");
    rlForm.append("email", `seller-smoke-rl-${Date.now()}-${i}@test.local`);
    rlForm.append("propertyType", "VILLA");
    rlForm.append("city", "Gueliz");
    rlForm.append("photos", new Blob(["not an image"], { type: "image/jpeg" }), "fake.jpg");
    const r = await fetch(BASE + "/api/listing-submissions", {
      method: "POST",
      headers: { "x-forwarded-for": `1.2.3.${i}, 9.9.9.9` },
      body: rlForm,
    });
    listingCodes.push(r.status);
  }
  check("listing-submissions: same real last-hop gets rate-limited after 5", listingCodes.filter((c) => c === 429).length >= 3);

  listingCodes = [];
  for (let i = 0; i < 8; i++) {
    const rlForm = new FormData();
    rlForm.append("name", "Smoke RL");
    rlForm.append("phone", "+212600000000");
    rlForm.append("email", `seller-smoke-rl2-${Date.now()}-${i}@test.local`);
    rlForm.append("propertyType", "VILLA");
    rlForm.append("city", "Gueliz");
    rlForm.append("photos", new Blob(["not an image"], { type: "image/jpeg" }), "fake.jpg");
    const r = await fetch(BASE + "/api/listing-submissions", {
      method: "POST",
      headers: { "x-forwarded-for": `1.2.3.4, 8.8.8.${i}` },
      body: rlForm,
    });
    listingCodes.push(r.status);
  }
  check(
    "listing-submissions: different real last-hop each time is never rate-limited",
    listingCodes.every((c) => c === 400)
  );

  const prisma2 = new PrismaClient();
  await prisma2.listingSubmission.deleteMany({ where: { name: { in: ["Smoke Seller", "Smoke RL"] } } });
  await prisma2.$disconnect();

  await Promise.all(
    uploadedFilePaths.map(async (p) => {
      try {
        await unlink(p);
      } catch {
        // best-effort cleanup
      }
    })
  );

  console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
