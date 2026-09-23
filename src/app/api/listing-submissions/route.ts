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

async function cleanupFiles(paths: string[]) {
  await Promise.all(
    paths.map(async (p) => {
      try {
        await fs.unlink(p);
      } catch (err) {
        console.error("[listing-submissions] cleanup failed", p, err);
      }
    })
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`listing-submission:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  if (!hasDatabase()) {
    return fail("Submissions are temporarily unavailable. Please contact us directly on WhatsApp instead.", 503);
  }

  // Best-effort early rejection of oversized requests before we parse the
  // multipart body. Content-Length isn't always sent, so a missing header
  // just skips this check — the per-file size check below still catches
  // oversized individual files either way.
  const MAX_REQUEST_BYTES = MAX_PHOTOS * MAX_BYTES + 1024 * 1024; // +1MB slack for fields/boundaries
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_BYTES) {
    return fail("Submission is too large.", 400);
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

  // Validate every photo (size + type sniff) BEFORE writing anything to disk,
  // so a failure partway through never leaves earlier photos orphaned.
  const validated: { buf: Buffer; detected: string }[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) return fail("Each photo must be 5MB or smaller.");
    const buf = Buffer.from(await file.arrayBuffer());
    const detected = sniffImageType(buf);
    if (!detected) return fail("One of the files is not a supported image (JPEG, PNG, WebP, or AVIF).");
    validated.push({ buf, detected });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  const urls: string[] = [];
  const writtenPaths: string[] = [];
  try {
    await fs.mkdir(dir, { recursive: true });
    for (const { buf, detected } of validated) {
      const name = `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected}`;
      const fullPath = path.join(dir, name);
      await fs.writeFile(fullPath, buf);
      writtenPaths.push(fullPath);
      urls.push(`/uploads/${name}`);
    }
  } catch (err) {
    console.error("[listing-submissions]", err);
    await cleanupFiles(writtenPaths);
    return fail("Could not save the photos.", 500);
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  let submission;
  try {
    submission = await prisma.listingSubmission.create({
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
  } catch (err) {
    console.error("[listing-submissions]", err);
    await cleanupFiles(writtenPaths);
    return fail("Could not save the submission.", 500);
  }

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
