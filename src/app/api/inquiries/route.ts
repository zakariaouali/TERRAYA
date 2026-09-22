import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { ok, fail } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { appendLead, hasDatabase } from "@/lib/leads";
import { sendEmail } from "@/lib/email";
import { inquiryClientEmail, inquiryOwnerEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`inquiry:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid body."); }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return fail("Please review the form and try again.");

  const data = parsed.data;
  const email = data.email.toLowerCase();

  // No database configured → capture the lead to a local file so it isn't lost.
  if (!hasDatabase()) {
    await appendLead("inquiry", {
      name: data.name,
      email,
      phone: data.phone,
      message: data.message,
      budget: data.budget,
      propertyId: data.propertyId ?? null,
      ip,
    });
    await notify({ ...data, email, propertyTitle: null });
    return ok({ id: "local" }, { status: 201 });
  }

  let propertyId: string | null = null;
  let propertyTitle: string | null = null;
  if (data.propertyId) {
    const found = await prisma.property.findFirst({
      where: { OR: [{ id: data.propertyId }, { slug: data.propertyId }] },
      select: { id: true, title: true },
    });
    propertyId = found?.id ?? null;
    propertyTitle = found?.title ?? null;
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name: data.name,
      email,
      phone: data.phone,
      message: data.message,
      budget: data.budget,
      propertyId,
    },
  });

  await audit({
    action: "INQUIRY_CREATED",
    entity: "Inquiry",
    entityId: inquiry.id,
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  await notify({ ...data, email, propertyTitle });

  return ok({ id: inquiry.id }, { status: 201 });
}

/** Client confirmation + owner notification. Dormant no-op until an email provider is configured. */
async function notify(data: {
  name: string;
  email: string;
  phone?: string | null;
  budget?: string | null;
  message: string;
  propertyTitle: string | null;
}) {
  const client = inquiryClientEmail({ name: data.name, propertyTitle: data.propertyTitle, message: data.message });
  await sendEmail({ to: data.email, subject: client.subject, html: client.html });

  const ownerEmail = process.env.ADMIN_EMAIL;
  if (ownerEmail) {
    const owner = inquiryOwnerEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      budget: data.budget,
      propertyTitle: data.propertyTitle,
      message: data.message,
    });
    await sendEmail({ to: ownerEmail, subject: owner.subject, html: owner.html });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(inquiries);
}
