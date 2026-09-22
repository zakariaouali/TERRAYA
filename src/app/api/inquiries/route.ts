import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { ok, fail } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { appendLead, hasDatabase } from "@/lib/leads";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`inquiry:${ip}`, 5, 60_000);
  if (!rl.ok) return fail("Too many requests. Please try again shortly.", 429);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid body."); }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return fail("Please review the form and try again.");

  const data = parsed.data;

  // No database configured → capture the lead to a local file so it isn't lost.
  if (!hasDatabase()) {
    await appendLead("inquiry", {
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      message: data.message,
      budget: data.budget,
      propertyId: data.propertyId ?? null,
      ip,
    });
    return ok({ id: "local" }, { status: 201 });
  }

  let propertyId: string | null = null;
  if (data.propertyId) {
    const found = await prisma.property.findFirst({
      where: { OR: [{ id: data.propertyId }, { slug: data.propertyId }] },
      select: { id: true },
    });
    propertyId = found?.id ?? null;
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
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

  return ok({ id: inquiry.id }, { status: 201 });
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
