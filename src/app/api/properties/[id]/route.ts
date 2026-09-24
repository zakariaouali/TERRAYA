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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const { id } = await params;
  const existing = await findByIdOrSlug(id);
  if (!existing) return fail("Not found.", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid body."); }
  const parsed = propertyUpsertSchema.safeParse(body);
  if (!parsed.success) return fail("Validation failed.");

  const d = parsed.data;
  const updated = await prisma.property.update({
    where: { id: existing.id },
    data: {
      ...d,
      tagline: d.tagline ?? null,
      landSqm: d.landSqm ?? null,
      yieldPercent: d.yieldPercent ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      priceEur: BigInt(d.priceEur),
      images: JSON.stringify(d.images),
      amenities: JSON.stringify(d.amenities),
      features: JSON.stringify(d.features),
      highlights: JSON.stringify(d.highlights),
    },
  });

  await audit({
    userId: session.sub, action: "PROPERTY_UPDATED",
    entity: "Property", entityId: updated.id, ip,
  });

  return ok({ id: updated.id });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return fail("Unauthorized.", 401);
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const { id } = await params;
  const existing = await findByIdOrSlug(id);
  if (!existing) return fail("Not found.", 404);

  await prisma.property.delete({ where: { id: existing.id } });
  await audit({
    userId: session.sub, action: "PROPERTY_DELETED",
    entity: "Property", entityId: existing.id, ip,
  });
  return ok({ id: existing.id });
}
