import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/api";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONVERTED", "DECLINED"]).optional(),
  convertedPropertyId: z.string().max(120).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    return fail("Unauthorized.", 401);
  }
  const ip = clientIp(req);
  const rl = rateLimit(`api:${session.sub}:${ip}`, 120, 60_000);
  if (!rl.ok) return fail("Rate limit exceeded.", 429);

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid body."); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) return fail("Nothing to update.");

  const existing = await prisma.listingSubmission.findUnique({ where: { id } });
  if (!existing) return fail("Not found.", 404);

  const updated = await prisma.listingSubmission.update({
    where: { id },
    data: parsed.data,
  });

  return ok({ id: updated.id, status: updated.status });
}
