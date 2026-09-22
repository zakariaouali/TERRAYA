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
