import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertyUpsertSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { ok, fail } from "@/lib/api";

const PUBLIC_STATUSES = new Set(["AVAILABLE", "RESERVED", "SOLD"]);

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`api:public:${ip}`, 60, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const url = new URL(req.url);
  const featured = url.searchParams.get("featured");
  const requestedStatus = url.searchParams.get("status");

  const session = await getSession();
  const isStaff = !!session && (session.role === "ADMIN" || session.role === "EDITOR");

  // Anonymous callers may only ever see public statuses. A status outside that
  // set (e.g. DRAFT) silently falls back to the public default instead of
  // being honored, so an unauthenticated client can never enumerate drafts.
  const status =
    requestedStatus && (isStaff || PUBLIC_STATUSES.has(requestedStatus))
      ? requestedStatus
      : "AVAILABLE";

  const list = await prisma.property.findMany({
    where: {
      status: status as never,
      ...(featured === "true" ? { featured: true } : {}),
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 50,
  });

  return ok(
    list.map((p) => ({ ...p, priceEur: p.priceEur.toString() }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid body."); }
  const parsed = propertyUpsertSchema.safeParse(body);
  if (!parsed.success) return fail("Validation failed.");

  const d = parsed.data;
  const created = await prisma.property.create({
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
      highlights: JSON.stringify(d.highlights),
    },
  });

  await audit({
    userId: session.sub,
    action: "PROPERTY_CREATED",
    entity: "Property",
    entityId: created.id,
    ip,
  });

  return ok({ id: created.id }, { status: 201 });
}
