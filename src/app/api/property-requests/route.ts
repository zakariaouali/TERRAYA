import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertyRequestSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { ok, fail } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/leads";
import { sendEmail } from "@/lib/email";
import { propertyRequestClientEmail, propertyRequestOwnerEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`property-request:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  if (!hasDatabase()) {
    return fail("Requests are temporarily unavailable. Please contact us directly on WhatsApp instead.", 503);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid body."); }

  const parsed = propertyRequestSchema.safeParse(body);
  if (!parsed.success) return fail("Please review the form and try again.");

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const request = await prisma.propertyRequest.create({
    data: {
      name: data.name,
      email,
      phone: data.phone,
      listingType: data.listingType,
      propertyType: data.propertyType,
      city: data.city,
      bedrooms: data.bedrooms,
      minBudget: data.minBudget,
      maxBudget: data.maxBudget,
      notes: data.notes,
      ip,
    },
  });

  await audit({
    action: "PROPERTY_REQUEST_CREATED",
    entity: "PropertyRequest",
    entityId: request.id,
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  const client = propertyRequestClientEmail({ name: data.name });
  await sendEmail({ to: email, subject: client.subject, html: client.html });

  const ownerEmail = process.env.ADMIN_EMAIL;
  if (ownerEmail) {
    const owner = propertyRequestOwnerEmail({ ...data, email });
    await sendEmail({ to: ownerEmail, subject: owner.subject, html: owner.html });
  }

  return ok({ id: request.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const requests = await prisma.propertyRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(
    requests.map((r) => ({
      ...r,
      minBudget: r.minBudget?.toString() ?? null,
      maxBudget: r.maxBudget?.toString() ?? null,
    }))
  );
}
